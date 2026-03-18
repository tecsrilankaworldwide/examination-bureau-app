"""
Examination Evaluation Bureau - Grade 5 Scholarship Exam Platform
Backend API - FastAPI + MongoDB
Version 2.0 - Complete Exam System with Anonymous Marking
"""

from fastapi import FastAPI, HTTPException, Depends, status, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta, timezone
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
import jwt
from passlib.context import CryptContext
import uuid
from enum import Enum
import logging
import random
import string
import base64
from cachetools import TTLCache
import shutil

# Load environment variables
load_dotenv()

# MongoDB setup with connection pooling for high concurrency (1000+ users)
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(
    MONGO_URL,
    maxPoolSize=100,
    minPoolSize=10,
    maxIdleTimeMS=45000,
    waitQueueTimeoutMS=5000,
    serverSelectionTimeoutMS=5000,
    connectTimeoutMS=10000,
    socketTimeoutMS=45000
)
db = client[os.environ.get('DB_NAME_EXAM', 'exam_bureau_db')]

# Caching
exam_cache = TTLCache(maxsize=1000, ttl=300)
user_cache = TTLCache(maxsize=5000, ttl=60)

# Security
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = os.environ.get('SECRET_KEY', 'exam-bureau-secret-2024')
ALGORITHM = "HS256"
security = HTTPBearer()

# Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Upload directory for paper photos
UPLOAD_DIR = os.path.join(os.path.dirname(__file__), 'uploads', 'papers')
os.makedirs(UPLOAD_DIR, exist_ok=True)

# FastAPI app
app = FastAPI(
    title="Examination Evaluation Bureau API",
    version="2.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json"
)

# CORS
CORS_ORIGINS = os.environ.get("CORS_ORIGINS", "*").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    max_age=3600,
)

# Serve uploaded files
app.mount("/uploads", StaticFiles(directory=os.path.join(os.path.dirname(__file__), 'uploads')), name="uploads")

# ============================================================================
# ENUMS & CONSTANTS
# ============================================================================

class UserRole(str, Enum):
    STUDENT = "student"
    PARENT = "parent"
    TEACHER = "teacher"
    MARKER = "marker"  # Paper markers
    ADMIN = "admin"

class Grade(str, Enum):
    GRADE_2 = "grade_2"
    GRADE_3 = "grade_3"
    GRADE_4 = "grade_4"
    GRADE_5 = "grade_5"

class ExamStatus(str, Enum):
    DRAFT = "draft"
    PUBLISHED = "published"
    ACTIVE = "active"
    CLOSED = "closed"

class AttemptStatus(str, Enum):
    MCQ_IN_PROGRESS = "mcq_in_progress"
    MCQ_COMPLETED = "mcq_completed"
    WRITTEN_IN_PROGRESS = "written_in_progress"
    WRITTEN_COMPLETED = "written_completed"
    WAITING_PARENT_UPLOAD = "waiting_parent_upload"
    PARENT_UPLOAD_DONE = "parent_upload_done"
    PENDING_MARKING = "pending_marking"
    MARKING_IN_PROGRESS = "marking_in_progress"
    COMPLETED = "completed"

class Language(str, Enum):
    ENGLISH = "en"
    SINHALA = "si"
    TAMIL = "ta"

# Grade-specific written paper config
GRADE_WRITTEN_CONFIG = {
    "grade_2": {"essays": 1, "short_questions": 5, "duration_minutes": 30},
    "grade_3": {"essays": 1, "short_questions": 8, "duration_minutes": 35},
    "grade_4": {"essays": 1, "short_questions": 10, "duration_minutes": 40},
    "grade_5": {"essays": 1, "short_questions": 15, "duration_minutes": 45},
}

# MCQ config
MCQ_CONFIG = {
    "questions": 60,
    "duration_minutes": 60,
    "marks_per_question": 1
}

# Parent upload window
PARENT_UPLOAD_WINDOW_MINUTES = 5
PARENT_UPLOAD_DELAY_MINUTES = 0  # Opens immediately after student finishes

# ============================================================================
# MODELS
# ============================================================================

class UserCreate(BaseModel):
    email: str
    password: str
    full_name: str
    role: UserRole
    grade: Optional[str] = None
    student_id: Optional[str] = None  # For parent accounts

class UserLogin(BaseModel):
    email: str
    password: str

class StudentRegistration(BaseModel):
    student_email: str
    student_password: str
    student_name: str
    parent_email: str
    parent_password: str
    parent_name: str
    grade: str
    language: str = "si"

class ExamCreate(BaseModel):
    title: str
    grade: str
    month: str
    mcq_questions: List[Dict] = []
    paper1_questions: List[Dict] = []  # Alias for mcq_questions from frontend
    written_essay_prompt: str = ""
    written_short_questions: List[str] = []
    mcq_duration_minutes: int = 60
    written_duration_minutes: int = 45

class MCQAnswer(BaseModel):
    question_id: str
    selected_option: str

class WrittenSubmission(BaseModel):
    attempt_id: str
    completed: bool = True

class ParentPhotoUpload(BaseModel):
    attempt_id: str
    photo_urls: List[str]

class BatchCreate(BaseModel):
    name: str
    grade: str
    description: str = ""
    language: str = "si"

class BatchStudentAdd(BaseModel):
    student_ids: List[str]

class TeachingSessionCreate(BaseModel):
    exam_id: str
    language: str
    title: str = ""
    description: str = ""
    price_lkr: float = 500.0
    available_after_days: int = 7

# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: timedelta = None) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(days=7))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def generate_secret_code() -> str:
    """Generate unique secret code for anonymous marking"""
    prefix = "EXM"
    year = datetime.now().year
    random_part = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
    return f"{prefix}-{year}-{random_part}"

def generate_student_id() -> str:
    """Generate unique student ID"""
    return f"STU-{datetime.now().year}-{uuid.uuid4().hex[:8].upper()}"

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        user_doc = await db.users.find_one({"id": user_id}, {"_id": 0, "hashed_password": 0})
        if not user_doc:
            raise HTTPException(status_code=401, detail="User not found")
        
        return user_doc
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.DecodeError:
        raise HTTPException(status_code=401, detail="Invalid token format")
    except Exception as e:
        logger.error(f"Auth error: {e}")
        raise HTTPException(status_code=401, detail="Invalid authentication")

# ============================================================================
# AUTH ENDPOINTS
# ============================================================================

@app.post("/api/register")
async def register_user(user_data: UserCreate):
    """Register new user (Admin creates accounts)"""
    existing = await db.users.find_one({"email": user_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_id = str(uuid.uuid4())
    student_id = generate_student_id() if user_data.role == UserRole.STUDENT else None
    
    new_user = {
        "id": user_id,
        "student_id": student_id,
        "email": user_data.email,
        "full_name": user_data.full_name,
        "role": user_data.role.value,
        "grade": user_data.grade,
        "hashed_password": get_password_hash(user_data.password),
        "linked_student_id": user_data.student_id if user_data.role == UserRole.PARENT else None,
        "created_at": datetime.now(timezone.utc),
        "is_active": True
    }
    
    await db.users.insert_one(new_user)
    new_user.pop("hashed_password")
    new_user.pop("_id", None)
    return new_user

@app.post("/api/register-student-parent")
async def register_student_with_parent(data: StudentRegistration):
    """Register student and parent together"""
    # Check if emails exist
    existing_student = await db.users.find_one({"email": data.student_email})
    existing_parent = await db.users.find_one({"email": data.parent_email})
    
    if existing_student:
        raise HTTPException(status_code=400, detail="Student email already registered")
    if existing_parent:
        raise HTTPException(status_code=400, detail="Parent email already registered")
    
    student_id = generate_student_id()
    student_user_id = str(uuid.uuid4())
    parent_user_id = str(uuid.uuid4())
    
    # Create student
    student = {
        "id": student_user_id,
        "student_id": student_id,
        "email": data.student_email,
        "full_name": data.student_name,
        "role": "student",
        "grade": data.grade,
        "preferred_language": data.language,
        "hashed_password": get_password_hash(data.student_password),
        "parent_user_id": parent_user_id,
        "created_at": datetime.now(timezone.utc),
        "is_active": True
    }
    
    # Create parent (linked to student)
    parent = {
        "id": parent_user_id,
        "email": data.parent_email,
        "full_name": data.parent_name,
        "role": "parent",
        "linked_student_id": student_id,
        "linked_student_user_id": student_user_id,
        "hashed_password": get_password_hash(data.parent_password),
        "created_at": datetime.now(timezone.utc),
        "is_active": True
    }
    
    await db.users.insert_one(student)
    await db.users.insert_one(parent)
    
    return {
        "message": "Registration successful",
        "student_id": student_id,
        "student_email": data.student_email,
        "parent_email": data.parent_email
    }

@app.post("/api/login")
async def login(login_data: UserLogin):
    """Login user"""
    user_doc = await db.users.find_one({"email": login_data.email})
    
    if not user_doc or not verify_password(login_data.password, user_doc["hashed_password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not user_doc.get("is_active", True):
        raise HTTPException(status_code=403, detail="Account inactive")
    
    # PARENT LOGIN CHECK: Only allow if student has completed written section
    if user_doc.get("role") == "parent":
        linked_student_id = user_doc.get("linked_student_user_id")
        if linked_student_id:
            # Check if student has any active exam attempt waiting for parent upload
            active_attempt = await db.attempts.find_one({
                "student_id": linked_student_id,
                "status": "waiting_parent_upload"
            })
            
            # Check if student is still taking exam
            in_progress = await db.attempts.find_one({
                "student_id": linked_student_id,
                "status": {"$in": ["mcq_in_progress", "written_in_progress"]}
            })
            
            if in_progress:
                raise HTTPException(
                    status_code=403, 
                    detail="Student is still taking the exam. Please wait until the student completes both MCQ and Written sections."
                )
            
            # Add upload status to response
            if active_attempt:
                now = datetime.now(timezone.utc)
                window_end = active_attempt.get("parent_upload_window_end")
                if isinstance(window_end, str):
                    window_end = datetime.fromisoformat(window_end.replace('Z', '+00:00'))
                elif window_end and window_end.tzinfo is None:
                    window_end = window_end.replace(tzinfo=timezone.utc)
                
                if window_end and now > window_end:
                    # Window expired
                    user_doc["upload_window_status"] = "expired"
                else:
                    remaining = (window_end - now).total_seconds() if window_end else 0
                    user_doc["upload_window_status"] = "open"
                    user_doc["upload_remaining_seconds"] = max(0, remaining)
                    user_doc["attempt_id"] = active_attempt.get("id")
    
    access_token = create_access_token({"sub": user_doc["id"]})
    
    user_doc.pop("_id", None)
    user_doc.pop("hashed_password", None)
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user_doc
    }

# ============================================================================
# EXAM MANAGEMENT (ADMIN)
# ============================================================================

@app.post("/api/exams/create")
async def create_exam(exam_data: ExamCreate, current_user: dict = Depends(get_current_user)):
    """Create new exam (Admin only)"""
    if current_user["role"] not in ["admin", "teacher"]:
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    grade_config = GRADE_WRITTEN_CONFIG.get(exam_data.grade, GRADE_WRITTEN_CONFIG["grade_5"])
    
    # Accept questions from either field name
    questions = exam_data.mcq_questions if exam_data.mcq_questions else exam_data.paper1_questions
    
    exam = {
        "id": str(uuid.uuid4()),
        "title": exam_data.title,
        "grade": exam_data.grade,
        "month": exam_data.month,
        "mcq_questions": questions,
        "mcq_total_questions": MCQ_CONFIG["questions"],
        "mcq_duration_minutes": exam_data.mcq_duration_minutes or MCQ_CONFIG["duration_minutes"],
        "written_essay_prompt": exam_data.written_essay_prompt,
        "written_short_questions": exam_data.written_short_questions,
        "written_duration_minutes": exam_data.written_duration_minutes or grade_config["duration_minutes"],
        "status": "draft",
        "created_by": current_user["id"],
        "created_at": datetime.now(timezone.utc),
        "is_active": True
    }
    
    await db.exams.insert_one(exam)
    exam.pop("_id", None)
    return exam

@app.get("/api/exams")
async def list_exams(grade: Optional[str] = None, status: Optional[str] = None):
    """List exams"""
    query = {"is_active": True}
    if grade:
        query["grade"] = grade
    if status:
        query["status"] = status
    
    exams = await db.exams.find(query, {"_id": 0}).sort("created_at", -1).to_list(100)
    return {"exams": exams}

@app.get("/api/exams/{exam_id}")
async def get_exam(exam_id: str):
    """Get exam details"""
    exam = await db.exams.find_one({"id": exam_id}, {"_id": 0})
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")
    return exam

@app.put("/api/exams/{exam_id}/publish")
async def publish_exam(exam_id: str, current_user: dict = Depends(get_current_user)):
    """Publish exam"""
    if current_user["role"] not in ["admin", "teacher"]:
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    result = await db.exams.update_one(
        {"id": exam_id},
        {"$set": {"status": "published", "published_at": datetime.now(timezone.utc)}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Exam not found")
    
    return {"message": "Exam published successfully"}

# ============================================================================
# STUDENT EXAM FLOW
# ============================================================================

@app.post("/api/exams/{exam_id}/start")
async def start_exam(exam_id: str, current_user: dict = Depends(get_current_user)):
    """Student starts exam - begins MCQ section"""
    if current_user["role"] != "student":
        raise HTTPException(status_code=403, detail="Only students can take exams")
    
    exam = await db.exams.find_one({"id": exam_id, "status": "published"}, {"_id": 0})
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found or not published")
    
    # Check existing attempt
    existing = await db.attempts.find_one({
        "exam_id": exam_id,
        "student_id": current_user["id"],
        "status": {"$nin": ["completed", "expired"]}
    })
    
    if existing:
        existing.pop("_id", None)
        return {
            "attempt": existing,
            "exam": exam,
            "resume": True
        }
    
    # Create new attempt with secret code
    secret_code = generate_secret_code()
    attempt = {
        "id": str(uuid.uuid4()),
        "exam_id": exam_id,
        "student_id": current_user["id"],
        "student_user_id": current_user.get("student_id", current_user["id"]),
        "secret_code": secret_code,  # Only computer knows mapping
        "grade": current_user.get("grade"),
        "status": AttemptStatus.MCQ_IN_PROGRESS.value,
        "mcq_started_at": datetime.now(timezone.utc),
        "mcq_answers": {},
        "mcq_score": 0,
        "written_started_at": None,
        "written_completed_at": None,
        "parent_upload_window_start": None,
        "parent_upload_window_end": None,
        "paper_photos": [],
        "marking_assigned_to": None,
        "written_score": 0,
        "total_score": 0,
        "created_at": datetime.now(timezone.utc)
    }
    
    await db.attempts.insert_one(attempt)
    attempt.pop("_id", None)
    
    return {
        "attempt": attempt,
        "exam": {
            "id": exam["id"],
            "title": exam["title"],
            "mcq_questions": exam["mcq_questions"],
            "mcq_duration_minutes": exam["mcq_duration_minutes"]
        },
        "resume": False
    }

@app.post("/api/attempts/{attempt_id}/save-mcq")
async def save_mcq_answer(attempt_id: str, answer: MCQAnswer, current_user: dict = Depends(get_current_user)):
    """Save MCQ answer (auto-save during exam)"""
    attempt = await db.attempts.find_one({"id": attempt_id, "student_id": current_user["id"]})
    
    if not attempt:
        raise HTTPException(status_code=404, detail="Attempt not found")
    
    if attempt["status"] != AttemptStatus.MCQ_IN_PROGRESS.value:
        raise HTTPException(status_code=400, detail="MCQ section not active")
    
    # Check time limit
    mcq_started = attempt["mcq_started_at"]
    if isinstance(mcq_started, str):
        mcq_started = datetime.fromisoformat(mcq_started.replace('Z', '+00:00'))
    
    exam = await db.exams.find_one({"id": attempt["exam_id"]})
    time_limit = exam.get("mcq_duration_minutes", 60)
    
    if datetime.now(timezone.utc) > mcq_started + timedelta(minutes=time_limit):
        # Auto-submit if time expired
        await submit_mcq_internal(attempt_id, current_user["id"])
        raise HTTPException(status_code=400, detail="Time expired - MCQ auto-submitted")
    
    await db.attempts.update_one(
        {"id": attempt_id},
        {"$set": {f"mcq_answers.{answer.question_id}": answer.selected_option}}
    )
    
    return {"message": "Answer saved"}

@app.post("/api/attempts/{attempt_id}/submit-mcq")
async def submit_mcq(attempt_id: str, current_user: dict = Depends(get_current_user)):
    """Submit MCQ section and start written section"""
    return await submit_mcq_internal(attempt_id, current_user["id"])

async def submit_mcq_internal(attempt_id: str, student_id: str):
    """Internal MCQ submission logic"""
    attempt = await db.attempts.find_one({"id": attempt_id, "student_id": student_id})
    
    if not attempt:
        raise HTTPException(status_code=404, detail="Attempt not found")
    
    exam = await db.exams.find_one({"id": attempt["exam_id"]}, {"_id": 0})
    
    # Auto-grade MCQ
    score = 0
    for question in exam.get("mcq_questions", []):
        q_id = question.get("id") or str(question.get("question_number", ""))
        student_answer = attempt["mcq_answers"].get(q_id)
        correct = question.get("correct_option_id") or question.get("correct_answer")
        if student_answer == correct:
            score += 1
    
    # Update attempt - move to written section
    now = datetime.now(timezone.utc)
    await db.attempts.update_one(
        {"id": attempt_id},
        {
            "$set": {
                "status": AttemptStatus.WRITTEN_IN_PROGRESS.value,
                "mcq_completed_at": now,
                "mcq_score": score,
                "written_started_at": now
            }
        }
    )
    
    return {
        "message": "MCQ submitted successfully",
        "mcq_score": score,
        "total_mcq": len(exam.get("mcq_questions", [])),
        "next_section": "written",
        "written_duration_minutes": exam.get("written_duration_minutes", 45)
    }

@app.post("/api/attempts/{attempt_id}/submit-written")
async def submit_written(attempt_id: str, current_user: dict = Depends(get_current_user)):
    """Student completes written section - opens parent upload window"""
    if current_user["role"] != "student":
        raise HTTPException(status_code=403, detail="Only students can submit")
    
    attempt = await db.attempts.find_one({"id": attempt_id, "student_id": current_user["id"]})
    
    if not attempt:
        raise HTTPException(status_code=404, detail="Attempt not found")
    
    if attempt["status"] != AttemptStatus.WRITTEN_IN_PROGRESS.value:
        raise HTTPException(status_code=400, detail="Written section not active")
    
    now = datetime.now(timezone.utc)
    upload_window_start = now + timedelta(minutes=PARENT_UPLOAD_DELAY_MINUTES)
    upload_window_end = upload_window_start + timedelta(minutes=PARENT_UPLOAD_WINDOW_MINUTES)
    
    await db.attempts.update_one(
        {"id": attempt_id},
        {
            "$set": {
                "status": AttemptStatus.WAITING_PARENT_UPLOAD.value,
                "written_completed_at": now,
                "parent_upload_window_start": upload_window_start,
                "parent_upload_window_end": upload_window_end
            }
        }
    )
    
    return {
        "message": "Written paper submitted successfully",
        "parent_upload_window": {
            "opens_at": upload_window_start.isoformat(),
            "closes_at": upload_window_end.isoformat(),
            "duration_minutes": PARENT_UPLOAD_WINDOW_MINUTES
        }
    }

# ============================================================================
# PARENT UPLOAD FLOW
# ============================================================================

@app.get("/api/parent/upload-status/{student_id}")
async def get_parent_upload_status(student_id: str, current_user: dict = Depends(get_current_user)):
    """Parent checks if upload window is open"""
    if current_user["role"] != "parent":
        raise HTTPException(status_code=403, detail="Only parents can access")
    
    # Find student's latest attempt
    attempt = await db.attempts.find_one(
        {
            "$or": [
                {"student_user_id": student_id},
                {"student_id": current_user.get("linked_student_user_id")}
            ],
            "status": AttemptStatus.WAITING_PARENT_UPLOAD.value
        },
        {"_id": 0, "secret_code": 0}  # Don't expose secret code
    )
    
    if not attempt:
        return {"upload_available": False, "message": "No pending upload"}
    
    now = datetime.now(timezone.utc)
    window_start = attempt.get("parent_upload_window_start")
    window_end = attempt.get("parent_upload_window_end")
    
    if isinstance(window_start, str):
        window_start = datetime.fromisoformat(window_start.replace('Z', '+00:00'))
    if isinstance(window_end, str):
        window_end = datetime.fromisoformat(window_end.replace('Z', '+00:00'))
    
    if now < window_start:
        return {
            "upload_available": False,
            "message": "Upload window not yet open",
            "opens_in_seconds": (window_start - now).total_seconds()
        }
    
    if now > window_end:
        # Window expired - close it
        await db.attempts.update_one(
            {"id": attempt["id"]},
            {"$set": {"status": AttemptStatus.PENDING_MARKING.value}}
        )
        return {"upload_available": False, "message": "Upload window expired"}
    
    remaining_seconds = (window_end - now).total_seconds()
    
    return {
        "upload_available": True,
        "attempt_id": attempt["id"],
        "remaining_seconds": remaining_seconds,
        "max_photos": 15
    }

@app.post("/api/parent/upload-photos")
async def upload_paper_photos(
    attempt_id: str = Form(...),
    photos: List[UploadFile] = File(...),
    current_user: dict = Depends(get_current_user)
):
    """Parent uploads photos of written paper"""
    if current_user["role"] != "parent":
        raise HTTPException(status_code=403, detail="Only parents can upload")
    
    attempt = await db.attempts.find_one({"id": attempt_id})
    
    if not attempt:
        raise HTTPException(status_code=404, detail="Attempt not found")
    
    if attempt["status"] != AttemptStatus.WAITING_PARENT_UPLOAD.value:
        raise HTTPException(status_code=400, detail="Upload window not active")
    
    # Verify upload window
    now = datetime.now(timezone.utc)
    window_end = attempt.get("parent_upload_window_end")
    if isinstance(window_end, str):
        window_end = datetime.fromisoformat(window_end.replace('Z', '+00:00'))
    
    if now > window_end:
        await db.attempts.update_one(
            {"id": attempt_id},
            {"$set": {"status": AttemptStatus.PENDING_MARKING.value}}
        )
        raise HTTPException(status_code=400, detail="Upload window expired")
    
    # Save photos
    photo_paths = []
    secret_code = attempt["secret_code"]
    
    for i, photo in enumerate(photos):
        if not photo.content_type.startswith("image/"):
            continue
        
        ext = photo.filename.split(".")[-1] if "." in photo.filename else "jpg"
        filename = f"{secret_code}_page_{i+1}.{ext}"
        filepath = os.path.join(UPLOAD_DIR, filename)
        
        with open(filepath, "wb") as f:
            content = await photo.read()
            f.write(content)
        
        photo_paths.append(f"/uploads/papers/{filename}")
    
    # Update attempt
    await db.attempts.update_one(
        {"id": attempt_id},
        {
            "$set": {
                "status": AttemptStatus.PENDING_MARKING.value,
                "paper_photos": photo_paths,
                "photos_uploaded_at": now
            }
        }
    )
    
    return {
        "message": "Photos uploaded successfully",
        "photos_count": len(photo_paths)
    }

# ============================================================================
# MARKER/EXAMINER FLOW (Anonymous Marking)
# ============================================================================

@app.get("/api/marker/pending-papers")
async def get_pending_papers(current_user: dict = Depends(get_current_user)):
    """Marker gets papers to mark (anonymous - no student info)"""
    if current_user["role"] not in ["marker", "teacher", "admin"]:
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    # Get papers pending marking (show only secret code, not student info)
    papers = await db.attempts.find(
        {"status": AttemptStatus.PENDING_MARKING.value},
        {
            "_id": 0,
            "id": 1,
            "secret_code": 1,
            "grade": 1,
            "paper_photos": 1,
            "exam_id": 1,
            "created_at": 1
        }
    ).sort("created_at", 1).to_list(50)
    
    return {"papers": papers}

@app.post("/api/marker/claim-paper/{attempt_id}")
async def claim_paper(attempt_id: str, current_user: dict = Depends(get_current_user)):
    """Marker claims a paper for marking"""
    if current_user["role"] not in ["marker", "teacher", "admin"]:
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    result = await db.attempts.update_one(
        {"id": attempt_id, "status": AttemptStatus.PENDING_MARKING.value},
        {
            "$set": {
                "status": AttemptStatus.MARKING_IN_PROGRESS.value,
                "marking_assigned_to": current_user["id"],
                "marking_started_at": datetime.now(timezone.utc)
            }
        }
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=400, detail="Paper not available")
    
    return {"message": "Paper claimed successfully"}

@app.post("/api/marker/submit-marks/{attempt_id}")
async def submit_marks(
    attempt_id: str,
    marks: Dict[str, Any],
    current_user: dict = Depends(get_current_user)
):
    """Marker submits marks for written paper"""
    if current_user["role"] not in ["marker", "teacher", "admin"]:
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    attempt = await db.attempts.find_one({"id": attempt_id})
    
    if not attempt:
        raise HTTPException(status_code=404, detail="Attempt not found")
    
    if attempt["marking_assigned_to"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="Paper not assigned to you")
    
    written_score = marks.get("essay_marks", 0) + sum(marks.get("short_answer_marks", []))
    total_score = attempt.get("mcq_score", 0) + written_score
    
    await db.attempts.update_one(
        {"id": attempt_id},
        {
            "$set": {
                "status": AttemptStatus.COMPLETED.value,
                "written_score": written_score,
                "essay_marks": marks.get("essay_marks", 0),
                "short_answer_marks": marks.get("short_answer_marks", []),
                "marker_comments": marks.get("comments", ""),
                "total_score": total_score,
                "marking_completed_at": datetime.now(timezone.utc)
            }
        }
    )
    
    # Record marker payment
    await db.marker_payments.insert_one({
        "id": str(uuid.uuid4()),
        "marker_id": current_user["id"],
        "attempt_id": attempt_id,
        "paper_type": "written",
        "amount": 50,  # Amount per paper - configurable
        "status": "pending",
        "created_at": datetime.now(timezone.utc)
    })
    
    return {
        "message": "Marks submitted successfully",
        "written_score": written_score,
        "total_score": total_score
    }

@app.get("/api/marker/my-payments")
async def get_marker_payments(current_user: dict = Depends(get_current_user)):
    """Marker views their payment history"""
    if current_user["role"] not in ["marker", "teacher"]:
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    payments = await db.marker_payments.find(
        {"marker_id": current_user["id"]},
        {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    
    total_pending = sum(p["amount"] for p in payments if p["status"] == "pending")
    total_paid = sum(p["amount"] for p in payments if p["status"] == "paid")
    
    return {
        "payments": payments,
        "total_pending": total_pending,
        "total_paid": total_paid,
        "papers_marked": len(payments)
    }

# ============================================================================
# RESULTS & PROGRESS (No student identity revealed to markers)
# ============================================================================

@app.get("/api/students/{student_id}/progress")
async def get_student_progress(student_id: str, current_user: dict = Depends(get_current_user)):
    """Get student progress - only student/parent/admin can see"""
    # Authorization check
    if current_user["role"] == "student" and current_user["id"] != student_id:
        raise HTTPException(status_code=403, detail="Access denied")
    if current_user["role"] == "parent" and current_user.get("linked_student_user_id") != student_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    attempts = await db.attempts.find(
        {"student_id": student_id, "status": AttemptStatus.COMPLETED.value},
        {"_id": 0, "secret_code": 0}  # Hide secret code
    ).sort("created_at", -1).to_list(50)
    
    # Get exam details for each attempt
    results = []
    for attempt in attempts:
        exam = await db.exams.find_one({"id": attempt["exam_id"]}, {"_id": 0, "mcq_questions": 0})
        results.append({
            "exam": exam,
            "mcq_score": attempt.get("mcq_score", 0),
            "written_score": attempt.get("written_score", 0),
            "total_score": attempt.get("total_score", 0),
            "completed_at": attempt.get("marking_completed_at")
        })
    
    return {
        "student_id": student_id,
        "results": results,
        "total_exams": len(results)
    }

# ============================================================================
# ADMIN ENDPOINTS
# ============================================================================

@app.get("/api/admin/statistics")
async def get_admin_statistics(current_user: dict = Depends(get_current_user)):
    """Admin dashboard statistics"""
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    
    total_students = await db.users.count_documents({"role": "student"})
    total_parents = await db.users.count_documents({"role": "parent"})
    total_markers = await db.users.count_documents({"role": {"$in": ["marker", "teacher"]}})
    total_exams = await db.exams.count_documents({"is_active": True})
    total_attempts = await db.attempts.count_documents({})
    pending_marking = await db.attempts.count_documents({"status": AttemptStatus.PENDING_MARKING.value})
    completed = await db.attempts.count_documents({"status": AttemptStatus.COMPLETED.value})
    total_batches = await db.batches.count_documents({"is_active": True})
    total_teaching_sessions = await db.teaching_sessions.count_documents({"is_active": True})
    pending_teaching_payments = await db.teaching_purchases.count_documents({"status": "pending_verification"})
    
    return {
        "total_students": total_students,
        "total_parents": total_parents,
        "total_markers": total_markers,
        "total_exams": total_exams,
        "total_attempts": total_attempts,
        "pending_marking": pending_marking,
        "completed_exams": completed,
        "total_batches": total_batches,
        "total_teaching_sessions": total_teaching_sessions,
        "pending_teaching_payments": pending_teaching_payments
    }

@app.get("/api/admin/users")
async def list_users(role: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    """List all users (Admin only)"""
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    
    query = {}
    if role:
        query["role"] = role
    
    users = await db.users.find(query, {"_id": 0, "hashed_password": 0}).to_list(1000)
    return {"users": users}

# ============================================================================
# BATCH / CLASS MANAGEMENT
# ============================================================================

@app.post("/api/batches/create")
async def create_batch(batch_data: BatchCreate, current_user: dict = Depends(get_current_user)):
    """Create a student batch/class"""
    if current_user["role"] not in ["admin", "teacher"]:
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    batch = {
        "id": str(uuid.uuid4()),
        "name": batch_data.name,
        "grade": batch_data.grade,
        "description": batch_data.description,
        "language": batch_data.language,
        "student_ids": [],
        "created_by": current_user["id"],
        "created_at": datetime.now(timezone.utc),
        "is_active": True
    }
    
    await db.batches.insert_one(batch)
    batch.pop("_id", None)
    return batch

@app.get("/api/batches")
async def list_batches(grade: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    """List all batches"""
    if current_user["role"] not in ["admin", "teacher"]:
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    query = {"is_active": True}
    if grade:
        query["grade"] = grade
    
    batches = await db.batches.find(query, {"_id": 0}).sort("created_at", -1).to_list(100)
    
    # Add student count for each batch
    for batch in batches:
        batch["student_count"] = len(batch.get("student_ids", []))
    
    return {"batches": batches}

@app.post("/api/batches/{batch_id}/students")
async def add_students_to_batch(batch_id: str, data: BatchStudentAdd, current_user: dict = Depends(get_current_user)):
    """Add students to a batch"""
    if current_user["role"] not in ["admin", "teacher"]:
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    result = await db.batches.update_one(
        {"id": batch_id},
        {"$addToSet": {"student_ids": {"$each": data.student_ids}}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Batch not found")
    
    return {"message": f"Added {len(data.student_ids)} students to batch"}

@app.delete("/api/batches/{batch_id}/students/{student_id}")
async def remove_student_from_batch(batch_id: str, student_id: str, current_user: dict = Depends(get_current_user)):
    """Remove a student from a batch"""
    if current_user["role"] not in ["admin", "teacher"]:
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    await db.batches.update_one(
        {"id": batch_id},
        {"$pull": {"student_ids": student_id}}
    )
    
    return {"message": "Student removed from batch"}

@app.get("/api/batches/{batch_id}")
async def get_batch_details(batch_id: str, current_user: dict = Depends(get_current_user)):
    """Get batch details with student list"""
    if current_user["role"] not in ["admin", "teacher"]:
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    batch = await db.batches.find_one({"id": batch_id}, {"_id": 0})
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")
    
    # Get student details
    students = []
    for sid in batch.get("student_ids", []):
        student = await db.users.find_one({"id": sid}, {"_id": 0, "hashed_password": 0})
        if student:
            students.append(student)
    
    batch["students"] = students
    batch["student_count"] = len(students)
    return batch

@app.delete("/api/batches/{batch_id}")
async def delete_batch(batch_id: str, current_user: dict = Depends(get_current_user)):
    """Delete a batch"""
    if current_user["role"] not in ["admin"]:
        raise HTTPException(status_code=403, detail="Admin only")
    
    await db.batches.update_one({"id": batch_id}, {"$set": {"is_active": False}})
    return {"message": "Batch deleted"}

# ============================================================================
# MCQ TEACHING / EXPLANATION FEATURE (Paid)
# ============================================================================

@app.post("/api/teaching/sessions/create")
async def create_teaching_session(data: TeachingSessionCreate, current_user: dict = Depends(get_current_user)):
    """Create a teaching session for MCQ explanations"""
    if current_user["role"] not in ["admin", "teacher"]:
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    exam = await db.exams.find_one({"id": data.exam_id}, {"_id": 0})
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")
    
    session = {
        "id": str(uuid.uuid4()),
        "exam_id": data.exam_id,
        "exam_title": exam.get("title", ""),
        "language": data.language,
        "title": data.title or f"MCQ Explanations - {exam.get('title', '')} ({data.language.upper()})",
        "description": data.description,
        "price_lkr": data.price_lkr,
        "available_after_days": data.available_after_days,
        "audio_url": None,
        "total_duration_minutes": 120,
        "total_questions": 60,
        "status": "pending_upload",
        "created_by": current_user["id"],
        "created_at": datetime.now(timezone.utc),
        "is_active": True
    }
    
    await db.teaching_sessions.insert_one(session)
    session.pop("_id", None)
    return session

@app.post("/api/teaching/sessions/{session_id}/upload-audio")
async def upload_teaching_audio(
    session_id: str,
    audio: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    """Upload MP3 audio for teaching session"""
    if current_user["role"] not in ["admin", "teacher"]:
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    session = await db.teaching_sessions.find_one({"id": session_id})
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Save audio file
    audio_dir = os.path.join(os.path.dirname(__file__), 'uploads', 'teaching')
    os.makedirs(audio_dir, exist_ok=True)
    
    ext = audio.filename.split(".")[-1] if "." in audio.filename else "mp3"
    filename = f"teaching_{session_id}.{ext}"
    filepath = os.path.join(audio_dir, filename)
    
    with open(filepath, "wb") as f:
        content = await audio.read()
        f.write(content)
    
    audio_url = f"/uploads/teaching/{filename}"
    
    await db.teaching_sessions.update_one(
        {"id": session_id},
        {"$set": {"audio_url": audio_url, "status": "active"}}
    )
    
    return {"message": "Audio uploaded", "audio_url": audio_url}

@app.get("/api/teaching/sessions")
async def list_teaching_sessions(exam_id: Optional[str] = None, language: Optional[str] = None):
    """List teaching sessions"""
    query = {"is_active": True}
    if exam_id:
        query["exam_id"] = exam_id
    if language:
        query["language"] = language
    
    sessions = await db.teaching_sessions.find(query, {"_id": 0}).sort("created_at", -1).to_list(50)
    return {"sessions": sessions}

@app.post("/api/teaching/purchase")
async def purchase_teaching_session(
    data: Dict[str, str],
    current_user: dict = Depends(get_current_user)
):
    """Student/Parent purchases access to teaching session"""
    session_id = data.get("session_id")
    
    session = await db.teaching_sessions.find_one({"id": session_id, "is_active": True}, {"_id": 0})
    if not session:
        raise HTTPException(status_code=404, detail="Teaching session not found")
    
    # Check if already purchased
    existing = await db.teaching_purchases.find_one({
        "user_id": current_user["id"],
        "session_id": session_id
    })
    if existing:
        raise HTTPException(status_code=400, detail="Already purchased")
    
    purchase = {
        "id": str(uuid.uuid4()),
        "user_id": current_user["id"],
        "session_id": session_id,
        "exam_id": session.get("exam_id"),
        "amount_lkr": session.get("price_lkr", 500),
        "payment_method": data.get("payment_method", "bank_transfer"),
        "payment_reference": data.get("payment_reference", ""),
        "bank_name": data.get("bank_name", ""),
        "status": "pending_verification",
        "created_at": datetime.now(timezone.utc)
    }
    
    await db.teaching_purchases.insert_one(purchase)
    purchase.pop("_id", None)
    return purchase

@app.get("/api/teaching/my-sessions")
async def get_my_teaching_sessions(current_user: dict = Depends(get_current_user)):
    """Get teaching sessions purchased by current user"""
    purchases = await db.teaching_purchases.find(
        {"user_id": current_user["id"], "status": "verified"},
        {"_id": 0}
    ).to_list(50)
    
    session_ids = [p["session_id"] for p in purchases]
    sessions = await db.teaching_sessions.find(
        {"id": {"$in": session_ids}, "is_active": True},
        {"_id": 0}
    ).to_list(50)
    
    return {"sessions": sessions, "purchases": purchases}

@app.put("/api/teaching/purchases/{purchase_id}/verify")
async def verify_teaching_purchase(purchase_id: str, current_user: dict = Depends(get_current_user)):
    """Admin verifies a teaching session purchase"""
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    
    result = await db.teaching_purchases.update_one(
        {"id": purchase_id},
        {"$set": {"status": "verified", "verified_at": datetime.now(timezone.utc), "verified_by": current_user["id"]}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Purchase not found")
    
    return {"message": "Purchase verified"}

@app.get("/api/teaching/purchases/pending")
async def get_pending_teaching_purchases(current_user: dict = Depends(get_current_user)):
    """Admin gets pending teaching purchases for verification"""
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    
    purchases = await db.teaching_purchases.find(
        {"status": "pending_verification"},
        {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    
    # Add user details
    for purchase in purchases:
        user = await db.users.find_one({"id": purchase["user_id"]}, {"_id": 0, "hashed_password": 0})
        purchase["user"] = user
    
    return {"purchases": purchases}

# ============================================================================
# API ROOT
# ============================================================================

@app.get("/api/")
async def root():
    return {
        "message": "Examination Evaluation Bureau API",
        "version": "2.0.0",
        "status": "operational",
        "features": [
            "MCQ Auto-Grading",
            "Written Paper Upload",
            "Anonymous Marking System",
            "Parent Photo Upload (5 min window)",
            "Marker Payment Tracking"
        ]
    }

# ============================================================================
# STARTUP
# ============================================================================

@app.on_event("startup")
async def startup_event():
    """Create indexes and seed sample data"""
    try:
        await db.users.create_index("email", unique=True)
        await db.users.create_index("student_id")
        await db.exams.create_index([("grade", 1), ("month", 1)])
        await db.attempts.create_index([("student_id", 1), ("exam_id", 1)])
        await db.attempts.create_index("secret_code", unique=True)
        await db.attempts.create_index("status")
        await db.marker_payments.create_index("marker_id")
        await db.batches.create_index([("grade", 1), ("is_active", 1)])
        await db.teaching_sessions.create_index([("exam_id", 1), ("language", 1)])
        await db.teaching_purchases.create_index([("user_id", 1), ("session_id", 1)])
        logger.info("Database indexes created")
        
        # Seed sample admin
        existing_admin = await db.users.find_one({"email": "admin@exam.lk"})
        if not existing_admin:
            await db.users.insert_one({
                "id": str(uuid.uuid4()),
                "email": "admin@exam.lk",
                "full_name": "System Admin",
                "role": "admin",
                "hashed_password": get_password_hash("admin123"),
                "created_at": datetime.now(timezone.utc),
                "is_active": True
            })
            logger.info("Created admin user: admin@exam.lk")
        
        # Seed sample marker
        existing_marker = await db.users.find_one({"email": "marker@exam.lk"})
        if not existing_marker:
            await db.users.insert_one({
                "id": str(uuid.uuid4()),
                "email": "marker@exam.lk",
                "full_name": "Paper Marker",
                "role": "marker",
                "hashed_password": get_password_hash("marker123"),
                "created_at": datetime.now(timezone.utc),
                "is_active": True
            })
            logger.info("Created marker user: marker@exam.lk")
        
        # Seed sample exam with MCQ questions
        existing_exam = await db.exams.find_one({"title": "January 2026 - Grade 5 Practice Exam"})
        if not existing_exam:
            sample_mcq_questions = []
            for i in range(1, 61):  # 60 questions
                sample_mcq_questions.append({
                    "id": f"q{i}",
                    "question_number": i,
                    "question_text": f"Sample question {i}: What is {i} + {i}?",
                    "text": f"Sample question {i}: What is {i} + {i}?",
                    "options": [
                        {"option_id": "A", "text": str(i * 2)},
                        {"option_id": "B", "text": str(i * 2 + 1)},
                        {"option_id": "C", "text": str(i * 2 - 1)},
                        {"option_id": "D", "text": str(i * 3)}
                    ],
                    "correct_option_id": "A",
                    "skill_area": "mathematical_reasoning"
                })
            
            await db.exams.insert_one({
                "id": str(uuid.uuid4()),
                "title": "January 2026 - Grade 5 Practice Exam",
                "grade": "grade_5",
                "month": "January 2026",
                "mcq_questions": sample_mcq_questions,
                "mcq_total_questions": 60,
                "mcq_duration_minutes": 60,
                "written_essay_prompt": "Write about your favorite school activity in 3-4 paragraphs.",
                "written_short_questions": [
                    "What is the capital of Sri Lanka?",
                    "Name three rivers in Sri Lanka.",
                    "What is 25 + 37?",
                    "What is the largest planet in the solar system?",
                    "Who is the current president of Sri Lanka?"
                ],
                "written_duration_minutes": 45,
                "status": "published",
                "created_at": datetime.now(timezone.utc),
                "is_active": True
            })
            logger.info("Created sample exam: January 2026 - Grade 5 Practice Exam")
            
    except Exception as e:
        logger.error(f"Startup error: {e}")

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get('PORT', 8001))
    uvicorn.run(app, host="0.0.0.0", port=port)
