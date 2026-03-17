"""
Examination Evaluation Bureau - Grade 5 Scholarship Exam Platform
Backend API - FastAPI + MongoDB
"""

from fastapi import FastAPI, HTTPException, Depends, status, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, Field
from typing import List, Optional, Dict
from datetime import datetime, timedelta, timezone
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
import jwt
from passlib.context import CryptContext
import uuid
from enum import Enum
import logging
from functools import lru_cache
import asyncio
from cachetools import TTLCache

# Load environment variables
load_dotenv()

# MongoDB setup with connection pooling for high concurrency (1000+ users)
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(
    MONGO_URL,
    maxPoolSize=100,        # Maximum connections in pool
    minPoolSize=10,         # Minimum connections to maintain
    maxIdleTimeMS=45000,    # Close idle connections after 45s
    waitQueueTimeoutMS=5000,# Wait 5s for connection from pool
    serverSelectionTimeoutMS=5000,
    connectTimeoutMS=10000,
    socketTimeoutMS=45000
)
db = client[os.environ.get('DB_NAME_EXAM', 'exam_bureau_db')]

# In-memory caching for high-traffic optimization (1K concurrent users)
# TTLCache: maxsize=1000 items, ttl=300 seconds (5 min)
exam_cache = TTLCache(maxsize=1000, ttl=300)
user_cache = TTLCache(maxsize=5000, ttl=60)  # Short TTL for user data

async def get_cached_exams(grade: str, status: str = None):
    """Get exams with caching for high traffic"""
    cache_key = f"exams_{grade}_{status}"
    if cache_key in exam_cache:
        return exam_cache[cache_key]
    
    query = {"grade": grade, "is_active": True}
    if status == "published":
        query["is_active"] = True
    exams = await db.exams.find(query).to_list(100)
    exam_cache[cache_key] = exams
    return exams

def invalidate_exam_cache():
    """Clear exam cache when exams are modified"""
    exam_cache.clear()

# Security
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = os.environ.get('SECRET_KEY', 'exam-bureau-secret-2024')
ALGORITHM = "HS256"
security = HTTPBearer()

# Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# FastAPI app
app = FastAPI(
    title="Examination Evaluation Bureau API",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json"
)

# CORS - Optimized for production with environment configuration
CORS_ORIGINS = os.environ.get("CORS_ORIGINS", "*").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    max_age=3600,  # Cache preflight requests for 1 hour
)

# ============================================================================
# MODELS & ENUMS
# ============================================================================

class UserRole(str, Enum):
    STUDENT = "student"
    PARENT = "parent"
    TEACHER = "teacher"
    TYPESETTER = "typesetter"  # New role for paper makers
    ADMIN = "admin"

class Grade(str, Enum):
    GRADE_2 = "grade_2"
    GRADE_3 = "grade_3"
    GRADE_4 = "grade_4"
    GRADE_5 = "grade_5"

class SkillArea(str, Enum):
    MATHEMATICAL_REASONING = "mathematical_reasoning"
    LANGUAGE_PROFICIENCY = "language_proficiency"
    GENERAL_KNOWLEDGE = "general_knowledge"
    COMPREHENSION_SKILLS = "comprehension_skills"
    PROBLEM_SOLVING = "problem_solving"
    LOGICAL_THINKING = "logical_thinking"
    SPATIAL_REASONING = "spatial_reasoning"
    MEMORY_RECALL = "memory_recall"
    ANALYTICAL_SKILLS = "analytical_skills"
    CRITICAL_THINKING = "critical_thinking"

# List of skill areas for iteration
SKILL_AREAS = [skill.value for skill in SkillArea]

class ExamStatus(str, Enum):
    DRAFT = "draft"
    PUBLISHED = "published"
    CLOSED = "closed"

class Language(str, Enum):
    ENGLISH = "en"
    SINHALA = "si"
    TAMIL = "ta"

class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: str
    full_name: str
    role: UserRole
    hashed_password: Optional[str] = None  # Optional for response models
    grade: Optional[Grade] = None  # For students
    parent_id: Optional[str] = None  # Link student to parent
    assigned_language: Optional[Language] = None  # For typesetters
    assigned_grades: Optional[List[Grade]] = None  # For typesetters
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    is_active: bool = True

class UserCreate(BaseModel):
    email: str
    password: str
    full_name: str
    role: UserRole
    grade: Optional[Grade] = None

class UserLogin(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: dict

class MCQOption(BaseModel):
    option_id: str
    text: str
    is_correct: bool

class MCQQuestion(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    question_number: int
    question_text: str
    options: List[MCQOption]  # 5 options
    correct_option_id: str
    skill_area: SkillArea
    marks: int = 1

class Exam(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    grade: Grade
    month: str  # e.g., "2024-01" for January 2024
    paper1_questions: List[MCQQuestion] = []  # 60 questions (old format - kept for backward compatibility)
    paper2_essay_prompt: str = ""  # 1 essay question
    paper2_short_questions: List[str] = []  # 10 short answer prompts
    
    # NEW: PDF-based exam support
    exam_format: str = "mcq"  # "mcq" or "pdf"
    pdf_path_en: Optional[str] = None  # English PDF file path
    pdf_path_si: Optional[str] = None  # Sinhala PDF file path
    pdf_path_ta: Optional[str] = None  # Tamil PDF file path
    
    duration_minutes: int = 60  # Paper 1 duration
    total_marks_paper1: int = 60
    total_marks_paper2: int = 40  # Essay 20 + Short answers 20
    status: ExamStatus = ExamStatus.DRAFT
    created_by: str  # Teacher ID
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    published_at: Optional[datetime] = None
    is_active: bool = True

class ExamAttempt(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    exam_id: str
    student_id: str
    started_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    submitted_at: Optional[datetime] = None
    answers: Dict[str, str] = {}  # question_id -> selected_option_id
    time_taken_seconds: int = 0
    score_paper1: int = 0
    skill_scores: Dict[str, int] = {}  # skill -> score
    is_completed: bool = False

class Paper2Submission(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    exam_id: str
    student_id: str
    submitted_via: str = "whatsapp"  # How submitted
    whatsapp_reference: Optional[str] = None  # Message ID or note
    teacher_id: Optional[str] = None  # Who marked it
    essay_marks: int = 0  # Out of 20
    short_answer_marks: List[int] = []  # 10 marks, each out of 2
    total_marks: int = 0
    teacher_comments: Optional[str] = None
    marked_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# NEW: PDF Exam Models
class ExamCreatePDF(BaseModel):
    title: str
    grade: Grade
    month: str
    duration_minutes: int = 60
    total_marks_paper1: int = 60

class PDFUploadResponse(BaseModel):
    message: str
    exam_id: str
    language: Language
    pdf_path: str

# ============================================================================
# AUTH HELPERS
# ============================================================================

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(days=7)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

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
        
        # Convert datetime string to datetime object if needed
        if isinstance(user_doc.get('created_at'), str):
            user_doc['created_at'] = datetime.fromisoformat(user_doc['created_at'].replace('Z', '+00:00'))
        
        return User(**user_doc)
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

@app.post("/api/register", response_model=dict)
async def register_user(user_data: UserCreate):
    """Register new user"""
    # Check if email exists
    existing = await db.users.find_one({"email": user_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user
    hashed_password = get_password_hash(user_data.password)
    
    new_user = {
        "id": str(uuid.uuid4()),
        "email": user_data.email,
        "full_name": user_data.full_name,
        "role": user_data.role.value,
        "grade": user_data.grade.value if user_data.grade else None,
        "hashed_password": hashed_password,
        "created_at": datetime.now(timezone.utc),
        "is_active": True
    }
    
    await db.users.insert_one(new_user)
    
    new_user.pop("hashed_password")
    return new_user

@app.post("/api/login", response_model=Token)
async def login(login_data: UserLogin):
    """Login user"""
    user_doc = await db.users.find_one({"email": login_data.email})
    
    if not user_doc or not verify_password(login_data.password, user_doc["hashed_password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not user_doc.get("is_active", True):
        raise HTTPException(status_code=403, detail="Account inactive")
    
    # Create token
    access_token = create_access_token({"sub": user_doc["id"]})
    
    user_doc.pop("_id", None)
    user_doc.pop("hashed_password", None)
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user_doc
    }

# ============================================================================
# EXAM MANAGEMENT (TEACHER/ADMIN)
# ============================================================================

@app.post("/api/exams/create")
async def create_exam(exam_data: dict, current_user: User = Depends(get_current_user)):
    """Create new exam (teacher/admin only)"""
    if current_user.role not in [UserRole.TEACHER, UserRole.ADMIN]:
        raise HTTPException(status_code=403, detail="Only teachers/admins can create exams")
    
    exam = {
        "id": str(uuid.uuid4()),
        "title": exam_data["title"],
        "grade": exam_data["grade"],
        "month": exam_data["month"],
        "paper1_questions": exam_data.get("paper1_questions", []),
        "paper2_essay_prompt": exam_data.get("paper2_essay_prompt", ""),
        "paper2_short_questions": exam_data.get("paper2_short_questions", []),
        "duration_minutes": exam_data.get("duration_minutes", 60),
        "total_marks_paper1": exam_data.get("total_marks_paper1", 60),
        "total_marks_paper2": exam_data.get("total_marks_paper2", 40),
        "status": "draft",
        "created_by": current_user.id,
        "created_at": datetime.now(timezone.utc)
    }
    
    await db.exams.insert_one(exam)
    exam.pop("_id")
    return exam

@app.get("/api/exams")
async def list_exams(grade: Optional[str] = None, status: Optional[str] = None):
    """List exams (filter by grade/status)"""
    query = {}
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
async def publish_exam(exam_id: str, current_user: User = Depends(get_current_user)):
    """Publish exam (make available to students)"""
    if current_user.role not in [UserRole.TEACHER, UserRole.ADMIN]:
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    result = await db.exams.update_one(
        {"id": exam_id},
        {
            "$set": {
                "status": "published",
                "published_at": datetime.now(timezone.utc)
            }
        }
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Exam not found")
    
    return {"message": "Exam published successfully"}

# ============================================================================
# PAPER 1 - MCQ EXAM TAKING
# ============================================================================

@app.post("/api/exams/{exam_id}/start")
async def start_exam(exam_id: str, current_user: User = Depends(get_current_user)):
    """Start Paper 1 MCQ exam"""
    if current_user.role != UserRole.STUDENT:
        raise HTTPException(status_code=403, detail="Only students can take exams")
    
    # Get exam
    exam = await db.exams.find_one({"id": exam_id, "status": "published"}, {"_id": 0})
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found or not published")
    
    # Check if student already has active attempt
    existing_attempt = await db.attempts.find_one({
        "exam_id": exam_id,
        "student_id": current_user.id,
        "is_completed": False
    })
    
    if existing_attempt:
        existing_attempt.pop("_id", None)
        # Return exam data for resume as well
        return {
            "attempt": existing_attempt,
            "exam": {
                "id": exam["id"],
                "title": exam["title"],
                "duration_minutes": exam["duration_minutes"],
                "questions": exam["paper1_questions"]
            },
            "resume": True
        }
    
    # Create new attempt
    attempt = {
        "id": str(uuid.uuid4()),
        "exam_id": exam_id,
        "student_id": current_user.id,
        "started_at": datetime.now(timezone.utc),
        "answers": {},
        "time_taken_seconds": 0,
        "is_completed": False
    }
    
    await db.attempts.insert_one(attempt)
    attempt.pop("_id")
    
    # Return exam questions (shuffled if needed)
    return {
        "attempt": attempt,
        "exam": {
            "id": exam["id"],
            "title": exam["title"],
            "duration_minutes": exam["duration_minutes"],
            "questions": exam["paper1_questions"]
        },
        "resume": False
    }

@app.post("/api/attempts/{attempt_id}/save")
async def save_answer(
    attempt_id: str,
    answer_data: dict,
    current_user: User = Depends(get_current_user)
):
    """Save answer for a question (auto-save during exam)"""
    attempt = await db.attempts.find_one({"id": attempt_id, "student_id": current_user.id})
    
    if not attempt:
        raise HTTPException(status_code=404, detail="Attempt not found")
    
    if attempt.get("is_completed"):
        raise HTTPException(status_code=400, detail="Exam already submitted")
    
    # Update answer
    question_id = answer_data["question_id"]
    selected_option = answer_data["selected_option"]
    
    await db.attempts.update_one(
        {"id": attempt_id},
        {"$set": {f"answers.{question_id}": selected_option}}
    )
    
    return {"message": "Answer saved"}

@app.post("/api/attempts/{attempt_id}/submit")
async def submit_exam(
    attempt_id: str,
    current_user: User = Depends(get_current_user)
):
    """Submit Paper 1 and auto-grade"""
    attempt = await db.attempts.find_one({"id": attempt_id, "student_id": current_user.id})
    
    if not attempt:
        raise HTTPException(status_code=404, detail="Attempt not found")
    
    if attempt.get("is_completed"):
        raise HTTPException(status_code=400, detail="Already submitted")
    
    # Get exam with answers
    exam = await db.exams.find_one({"id": attempt["exam_id"]}, {"_id": 0})
    
    # Auto-grade
    score = 0
    skill_scores = {skill.value: 0 for skill in SkillArea}
    skill_totals = {skill.value: 0 for skill in SkillArea}
    
    for question in exam["paper1_questions"]:
        # Handle both old and new question formats
        q_id = question.get("id") or str(question.get("question_number", ""))
        student_answer = attempt["answers"].get(q_id)
        
        # Handle both correct_option_id (new) and correct_answer (old) formats
        correct_answer = question.get("correct_option_id") or question.get("correct_answer")
        skill = question["skill_area"]
        marks = question.get("marks", 1)
        
        skill_totals[skill] += marks
        
        if student_answer == correct_answer:
            score += marks
            skill_scores[skill] += marks
    
    # Calculate skill percentages
    skill_percentages = {}
    for skill, earned in skill_scores.items():
        total = skill_totals[skill]
        percentage = (earned / total * 100) if total > 0 else 0
        skill_percentages[skill] = round(percentage, 1)
    
    # Calculate time taken
    started_at = attempt["started_at"]
    if isinstance(started_at, str):
        started_at = datetime.fromisoformat(started_at.replace('Z', '+00:00'))
    elif started_at.tzinfo is None:
        started_at = started_at.replace(tzinfo=timezone.utc)
    
    time_taken = (datetime.now(timezone.utc) - started_at).total_seconds()
    
    # Update attempt
    await db.attempts.update_one(
        {"id": attempt_id},
        {
            "$set": {
                "submitted_at": datetime.now(timezone.utc),
                "time_taken_seconds": int(time_taken),
                "score_paper1": score,
                "skill_scores": skill_scores,
                "skill_percentages": skill_percentages,
                "is_completed": True
            }
        }
    )
    
    return {
        "score": score,
        "total": exam["total_marks_paper1"],
        "percentage": round(score / exam["total_marks_paper1"] * 100, 1),
        "skill_scores": skill_scores,
        "skill_percentages": skill_percentages,
        "time_taken_seconds": int(time_taken)
    }

# ============================================================================
# PAPER 2 - MANUAL MARKING
# ============================================================================

@app.post("/api/paper2/submit-meta")
async def submit_paper2_meta(
    submission_data: dict,
    current_user: User = Depends(get_current_user)
):
    """Student/Parent records that Paper 2 was submitted via WhatsApp"""
    if current_user.role not in [UserRole.STUDENT, UserRole.PARENT]:
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    submission = {
        "id": str(uuid.uuid4()),
        "exam_id": submission_data["exam_id"],
        "student_id": submission_data.get("student_id", current_user.id),
        "submitted_via": "whatsapp",
        "whatsapp_reference": submission_data.get("whatsapp_reference", ""),
        "short_answer_marks": [0] * 10,  # Initialize with zeros
        "essay_marks": 0,
        "total_marks": 0,
        "created_at": datetime.now(timezone.utc)
    }
    
    await db.paper2_submissions.insert_one(submission)
    submission.pop("_id")
    return submission

@app.put("/api/paper2/{submission_id}/mark")
async def mark_paper2(
    submission_id: str,
    marks_data: dict,
    current_user: User = Depends(get_current_user)
):
    """Teacher marks Paper 2"""
    if current_user.role not in [UserRole.TEACHER, UserRole.ADMIN]:
        raise HTTPException(status_code=403, detail="Only teachers can mark exams")
    
    essay_marks = marks_data.get("essay_marks", 0)
    short_answer_marks = marks_data.get("short_answer_marks", [0] * 10)
    total = essay_marks + sum(short_answer_marks)
    
    await db.paper2_submissions.update_one(
        {"id": submission_id},
        {
            "$set": {
                "teacher_id": current_user.id,
                "essay_marks": essay_marks,
                "short_answer_marks": short_answer_marks,
                "total_marks": total,
                "teacher_comments": marks_data.get("comments", ""),
                "marked_at": datetime.now(timezone.utc)
            }
        }
    )
    
    return {"message": "Paper 2 marked successfully", "total_marks": total}

# ============================================================================
# RESULTS & PROGRESS
# ============================================================================

@app.get("/api/students/{student_id}/progress")
async def get_student_progress(student_id: str, current_user: User = Depends(get_current_user)):
    """Get student progress across all monthly exams (blood report style)"""
    
    # Get all attempts for student
    attempts = await db.attempts.find(
        {"student_id": student_id, "is_completed": True},
        {"_id": 0}
    ).sort("submitted_at", 1).to_list(100)
    
    # Get Paper 2 submissions
    paper2_subs = await db.paper2_submissions.find(
        {"student_id": student_id, "marked_at": {"$exists": True}},
        {"_id": 0}
    ).to_list(100)
    
    # Build monthly progress
    monthly_progress = []
    skill_trends = {skill.value: [] for skill in SkillArea}
    
    # Batch fetch all exams to avoid N+1 query
    exam_ids = [attempt["exam_id"] for attempt in attempts]
    exams_list = await db.exams.find(
        {"id": {"$in": exam_ids}}, 
        {"_id": 0, "id": 1, "month": 1, "title": 1}
    ).to_list(100)
    exams_map = {exam["id"]: exam for exam in exams_list}
    
    for attempt in attempts:
        exam = exams_map.get(attempt["exam_id"])
        if not exam:
            continue  # Skip if exam not found
        
        # Find corresponding Paper 2
        paper2 = next((p for p in paper2_subs if p["exam_id"] == attempt["exam_id"]), None)
        paper2_score = paper2["total_marks"] if paper2 else 0
        
        month_data = {
            "month": exam["month"],
            "exam_title": exam["title"],
            "paper1_score": attempt["score_paper1"],
            "paper2_score": paper2_score,
            "total_score": attempt["score_paper1"] + paper2_score,
            "total_possible": 100,  # 60 + 40
            "skill_percentages": attempt.get("skill_percentages", {}),
            "submitted_at": attempt["submitted_at"]
        }
        
        monthly_progress.append(month_data)
        
        # Add to trends
        for skill, percentage in attempt.get("skill_percentages", {}).items():
            skill_trends[skill].append({
                "month": exam["month"],
                "percentage": percentage
            })
    
    # Calculate strengths & weaknesses (latest month)
    if attempts:
        latest_skills = attempts[-1].get("skill_percentages", {})
        sorted_skills = sorted(latest_skills.items(), key=lambda x: x[1], reverse=True)
        
        strengths = sorted_skills[:3]  # Top 3
        weaknesses = sorted_skills[-3:]  # Bottom 3
    else:
        strengths = []
        weaknesses = []
    
    return {
        "student_id": student_id,
        "monthly_progress": monthly_progress,
        "skill_trends": skill_trends,
        "strengths": strengths,
        "weaknesses": weaknesses,
        "total_exams_taken": len(attempts)
    }

# ============================================================================
# PDF EXAM ENDPOINTS (NEW)
# ============================================================================

@app.post("/api/exams/create-pdf")
async def create_pdf_exam(
    exam_data: ExamCreatePDF,
    current_user: User = Depends(get_current_user)
):
    """Create a new PDF-based exam (Typesetter only)"""
    if current_user.role not in [UserRole.TYPESETTER, UserRole.ADMIN]:
        raise HTTPException(status_code=403, detail="Only typesetters and admins can create PDF exams")
    
    exam_id = str(uuid.uuid4())
    exam_doc = {
        "id": exam_id,
        "title": exam_data.title,
        "grade": exam_data.grade.value,
        "month": exam_data.month,
        "exam_format": "pdf",
        "pdf_path_en": None,
        "pdf_path_si": None,
        "pdf_path_ta": None,
        "duration_minutes": exam_data.duration_minutes,
        "total_marks_paper1": exam_data.total_marks_paper1,
        "total_marks_paper2": 0,
        "status": "draft",
        "created_by": current_user.id,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "is_active": True
    }
    
    await db.exams.insert_one(exam_doc)
    invalidate_exam_cache()
    
    return {
        "message": "PDF exam created successfully",
        "exam_id": exam_id,
        "title": exam_data.title
    }

@app.post("/api/exams/{exam_id}/upload-pdf/{language}")
async def upload_exam_pdf(
    exam_id: str,
    language: Language,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    """Upload PDF for a specific language version of an exam"""
    if current_user.role not in [UserRole.TYPESETTER, UserRole.ADMIN]:
        raise HTTPException(status_code=403, detail="Only typesetters and admins can upload PDFs")
    
    # Check if exam exists
    exam = await db.exams.find_one({"id": exam_id})
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")
    
    # Validate file type
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")
    
    # Create upload directory if doesn't exist
    upload_dir = os.environ.get('UPLOAD_DIR', os.path.join(os.path.dirname(__file__), 'uploads', 'exam_pdfs'))
    os.makedirs(upload_dir, exist_ok=True)
    
    # Generate unique filename
    file_extension = file.filename.split('.')[-1]
    unique_filename = f"{exam_id}_{language.value}_{uuid.uuid4().hex[:8]}.{file_extension}"
    file_path = os.path.join(upload_dir, unique_filename)
    
    # Save file
    try:
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")
    
    # Update exam document with PDF path
    pdf_field = f"pdf_path_{language.value}"
    await db.exams.update_one(
        {"id": exam_id},
        {"$set": {pdf_field: file_path}}
    )
    invalidate_exam_cache()
    
    return PDFUploadResponse(
        message=f"PDF uploaded successfully for {language.value}",
        exam_id=exam_id,
        language=language,
        pdf_path=file_path
    )

@app.get("/api/exams/{exam_id}/pdf/{language}")
async def get_exam_pdf(
    exam_id: str,
    language: Language,
    current_user: User = Depends(get_current_user)
):
    """Get PDF file path for a specific language"""
    exam = await db.exams.find_one({"id": exam_id}, {"_id": 0})
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")
    
    pdf_field = f"pdf_path_{language.value}"
    pdf_path = exam.get(pdf_field)
    
    if not pdf_path or not os.path.exists(pdf_path):
        raise HTTPException(status_code=404, detail=f"PDF not available for {language.value}")
    
    from fastapi.responses import FileResponse
    return FileResponse(pdf_path, media_type="application/pdf", filename=f"exam_{exam_id}_{language.value}.pdf")

@app.get("/api/")
async def root():
    """API root"""
    return {
        "message": "Examination Evaluation Bureau API",
        "version": "1.0.0",
        "status": "operational"
    }

# ============================================================================
# STARTUP
# ============================================================================

@app.on_event("startup")
async def startup_event():
    """Create indexes and seed sample data"""
    try:
        await db.users.create_index("email", unique=True)
        await db.exams.create_index([("grade", 1), ("month", 1)])
        await db.attempts.create_index([("student_id", 1), ("exam_id", 1)])
        await db.paper2_submissions.create_index([("student_id", 1), ("exam_id", 1)])
        logger.info("✓ Database indexes created")
        
        # Seed sample users for all grades
        sample_users = [
            # Grade 5 users
            {"id": "student_g5_001", "email": "student@test.com", "full_name": "Grade 5 Student", "hashed_password": get_password_hash("student123"), "role": "student", "grade": "grade_5", "created_at": datetime.now(timezone.utc), "is_active": True},
            # Grade 4 users
            {"id": "student_g4_001", "email": "student4@test.com", "full_name": "Grade 4 Student", "hashed_password": get_password_hash("student123"), "role": "student", "grade": "grade_4", "created_at": datetime.now(timezone.utc), "is_active": True},
            # Grade 3 users
            {"id": "student_g3_001", "email": "student3@test.com", "full_name": "Grade 3 Student", "hashed_password": get_password_hash("student123"), "role": "student", "grade": "grade_3", "created_at": datetime.now(timezone.utc), "is_active": True},
            # Grade 2 users
            {"id": "student_g2_001", "email": "student2@test.com", "full_name": "Grade 2 Student", "hashed_password": get_password_hash("student123"), "role": "student", "grade": "grade_2", "created_at": datetime.now(timezone.utc), "is_active": True},
            # Staff users
            {"id": "teacher_001", "email": "teacher@test.com", "full_name": "Sample Teacher", "hashed_password": get_password_hash("teacher123"), "role": "teacher", "grade": "grade_5", "created_at": datetime.now(timezone.utc), "is_active": True},
            {"id": "parent_001", "email": "parent@test.com", "full_name": "Sample Parent", "hashed_password": get_password_hash("parent123"), "role": "parent", "grade": "grade_5", "created_at": datetime.now(timezone.utc), "is_active": True, "linked_student_id": "student_g5_001"},
            {"id": "admin_001", "email": "admin@test.com", "full_name": "Sample Admin", "hashed_password": get_password_hash("admin123"), "role": "admin", "grade": "grade_5", "created_at": datetime.now(timezone.utc), "is_active": True}
        ]
        
        for user in sample_users:
            existing = await db.users.find_one({"email": user["email"]})
            if not existing:
                await db.users.insert_one(user)
                logger.info(f"✓ Created sample user: {user['email']}")
            else:
                logger.info(f"Sample user already exists: {user['email']}")
                
        # Seed sample exams for ALL grades
        grades_config = [
            {"grade": "grade_2", "title_prefix": "Grade 2 Model Exam", "questions": 40, "duration": 45},
            {"grade": "grade_3", "title_prefix": "Grade 3 Model Exam", "questions": 50, "duration": 50},
            {"grade": "grade_4", "title_prefix": "Grade 4 Model Exam", "questions": 55, "duration": 55},
            {"grade": "grade_5", "title_prefix": "Grade 5 Scholarship Practice Exam", "questions": 60, "duration": 60}
        ]
        
        skill_areas = ["mathematical_reasoning", "language_proficiency", "general_knowledge", "comprehension_skills", "problem_solving"]
        
        for config in grades_config:
            existing_exam = await db.exams.find_one({"grade": config["grade"]})
            if not existing_exam:
                # Create February 2025 exam
                sample_exam = {
                    "id": str(uuid.uuid4()),
                    "title": f"February 2025 - {config['title_prefix']}",
                    "grade": config["grade"],
                    "month": "2025-02",
                    "paper_number": 1,
                    "duration_minutes": config["duration"],
                    "total_questions": config["questions"],
                    "status": "published",
                    "paper1_questions": [
                        {
                            "question_number": i+1, 
                            "question_text": f"Sample question {i+1} for {config['grade'].replace('_', ' ')}", 
                            "question_text_si": f"ප්‍රශ්නය {i+1} - {config['grade'].replace('_', ' ')}", 
                            "question_text_ta": f"கேள்வி {i+1} - {config['grade'].replace('_', ' ')}", 
                            "options": ["Option A", "Option B", "Option C", "Option D"],
                            "options_si": ["විකල්පය A", "විකල්පය B", "විකල්පය C", "විකල්පය D"],
                            "options_ta": ["விருப்பம் A", "விருப்பம் B", "விருப்பம் C", "விருப்பம் D"],
                            "correct_answer": ["A", "B", "C", "D"][i % 4], 
                            "skill_area": skill_areas[i % 5]
                        }
                        for i in range(config["questions"])
                    ],
                    "is_active": True,
                    "created_by": "admin_001",
                    "created_at": datetime.now(timezone.utc)
                }
                await db.exams.insert_one(sample_exam)
                logger.info(f"✓ Created sample exam for {config['grade']}")
                
                # Create January 2025 exam as well
                sample_exam_jan = {
                    "id": str(uuid.uuid4()),
                    "title": f"January 2025 - {config['title_prefix']}",
                    "grade": config["grade"],
                    "month": "2025-01",
                    "paper_number": 1,
                    "duration_minutes": config["duration"],
                    "total_questions": config["questions"],
                    "status": "published",
                    "paper1_questions": [
                        {
                            "question_number": i+1, 
                            "question_text": f"January Q{i+1} for {config['grade'].replace('_', ' ')}", 
                            "question_text_si": f"ජනවාරි ප්‍රශ්නය {i+1}", 
                            "question_text_ta": f"ஜனவரி கேள்வி {i+1}", 
                            "options": ["Option A", "Option B", "Option C", "Option D"],
                            "options_si": ["විකල්පය A", "විකල්පය B", "විකල්පය C", "විකල්පය D"],
                            "options_ta": ["விருப்பம் A", "விருப்பம் B", "விருப்பம் C", "விருப்பம் D"],
                            "correct_answer": ["A", "B", "C", "D"][(i+1) % 4], 
                            "skill_area": skill_areas[i % 5]
                        }
                        for i in range(config["questions"])
                    ],
                    "is_active": True,
                    "created_by": "admin_001",
                    "created_at": datetime.now(timezone.utc)
                }
                await db.exams.insert_one(sample_exam_jan)
                logger.info(f"✓ Created January exam for {config['grade']}")
                
    except Exception as e:
        logger.error(f"Error in startup: {e}")

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get('PORT', 8001))
    uvicorn.run(app, host="0.0.0.0", port=port)


# ============================================================================
# EMAIL NOTIFICATIONS & EXPORTS
# ============================================================================

from email_service import EmailService
from export_service import ExportService
from fastapi.responses import StreamingResponse
import io

@app.post("/api/notifications/send-test-email")
async def send_test_email(current_user: User = Depends(get_current_user)):
    """Send a test email to verify email configuration (Admin only)"""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    test_email = os.getenv("SMTP_EMAIL", "exams@tecsrilanka.com.lk")
    success = EmailService.send_exam_published_notification(
        parent_email=test_email,
        student_name="Test Student",
        exam_title="Test Exam",
        exam_date=datetime.now().strftime("%Y-%m-%d"),
        grade="Grade 5",
        language="si"
    )
    
    return {
        "success": success,
        "message": "Test email sent successfully" if success else "Failed to send test email",
        "sent_to": test_email
    }

@app.post("/api/notifications/exam-published/{exam_id}")
async def notify_exam_published(
    exam_id: str,
    current_user: User = Depends(get_current_user)
):
    """Send notifications when exam is published (Teacher/Admin only)"""
    if current_user.role not in [UserRole.TEACHER, UserRole.ADMIN]:
        raise HTTPException(status_code=403, detail="Teacher/Admin access required")
    
    # Get exam details
    exam = await db.exams.find_one({"exam_id": exam_id})
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")
    
    # Get all students in this grade
    students = await db.users.find({
        "role": UserRole.STUDENT,
        "grade": exam["grade"]
    }).to_list(1000)
    
    sent_count = 0
    failed_count = 0
    
    for student in students:
        parent_email = student.get("parent_email")
        if parent_email:
            success = EmailService.send_exam_published_notification(
                parent_email=parent_email,
                student_name=student.get("full_name", "Student"),
                exam_title=exam["title"],
                exam_date=exam.get("created_at", datetime.now()).strftime("%Y-%m-%d"),
                grade=exam["grade"],
                language=student.get("preferred_language", "si")
            )
            if success:
                sent_count += 1
            else:
                failed_count += 1
    
    return {
        "success": True,
        "sent": sent_count,
        "failed": failed_count,
        "total_students": len(students)
    }

@app.get("/api/reports/export-results/{exam_id}")
async def export_exam_results(
    exam_id: str,
    format: str = "excel",
    current_user: User = Depends(get_current_user)
):
    """Export exam results to Excel or PDF (Teacher/Admin only)"""
    if current_user.role not in [UserRole.TEACHER, UserRole.ADMIN]:
        raise HTTPException(status_code=403, detail="Teacher/Admin access required")
    
    # Get exam details
    exam = await db.exams.find_one({"exam_id": exam_id})
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")
    
    # Get all attempts for this exam
    attempts = await db.attempts.find({
        "exam_id": exam_id,
        "status": "completed"
    }).to_list(1000)
    
    # Prepare results data
    results = []
    for attempt in attempts:
        student = await db.users.find_one({"email": attempt["student_email"]})
        results.append({
            "student_name": student.get("full_name", "") if student else "",
            "email": attempt["student_email"],
            "score": attempt.get("score", 0),
            "percentage": round((attempt.get("score", 0) / exam["total_questions"]) * 100, 1),
            "status": "Passed" if (attempt.get("score", 0) / exam["total_questions"]) >= 0.5 else "Needs Improvement"
        })
    
    if format == "excel":
        # Export to Excel
        excel_data = ExportService.export_exam_results_to_excel(
            exam_title=exam["title"],
            grade=exam["grade"],
            results=results,
            skill_areas=SKILL_AREAS
        )
        
        return StreamingResponse(
            io.BytesIO(excel_data),
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": f"attachment; filename=exam_results_{exam_id}.xlsx"}
        )
    else:
        raise HTTPException(status_code=400, detail="Only Excel format supported currently")

@app.get("/api/reports/student-monthly/{student_email}/{month}")
async def export_student_monthly_report(
    student_email: str,
    month: str,  # Format: YYYY-MM
    current_user: User = Depends(get_current_user)
):
    """Export monthly student report as PDF (Parent/Teacher/Admin)"""
    # Check permissions
    if current_user.role == UserRole.STUDENT and current_user.email != student_email:
        raise HTTPException(status_code=403, detail="Access denied")
    if current_user.role == UserRole.PARENT:
        student = await db.users.find_one({"email": student_email})
        if not student or student.get("parent_email") != current_user.email:
            raise HTTPException(status_code=403, detail="Access denied")
    
    # Get student info
    student = await db.users.find_one({"email": student_email})
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    # Get attempts for the month
    from datetime import datetime
    start_date = datetime.strptime(f"{month}-01", "%Y-%m-%d")
    if start_date.month == 12:
        end_date = datetime(start_date.year + 1, 1, 1)
    else:
        end_date = datetime(start_date.year, start_date.month + 1, 1)
    
    attempts = await db.attempts.find({
        "student_email": student_email,
        "status": "completed",
        "submitted_at": {
            "$gte": start_date,
            "$lt": end_date
        }
    }).to_list(100)
    
    # Calculate statistics
    exams_data = []
    total_score = 0
    for attempt in attempts:
        exam = await db.exams.find_one({"exam_id": attempt["exam_id"]})
        if exam:
            percentage = round((attempt.get("score", 0) / exam["total_questions"]) * 100, 1)
            total_score += percentage
            exams_data.append({
                "title": exam["title"],
                "date": attempt["submitted_at"].strftime("%Y-%m-%d"),
                "score": attempt.get("score", 0),
                "total": exam["total_questions"],
                "percentage": percentage
            })
    
    avg_score = round(total_score / len(exams_data), 1) if exams_data else 0
    
    # Get skill breakdown
    skill_breakdown = {}
    for skill in SKILL_AREAS:
        skill_scores = [a.get("skill_scores", {}).get(skill, 0) for a in attempts if "skill_scores" in a]
        skill_breakdown[skill] = round(sum(skill_scores) / len(skill_scores), 1) if skill_scores else 0
    
    overall_stats = {
        "exams_taken": len(exams_data),
        "average_score": avg_score,
        "highest_score": max([e["percentage"] for e in exams_data]) if exams_data else 0,
        "lowest_score": min([e["percentage"] for e in exams_data]) if exams_data else 0
    }
    
    # Generate PDF
    pdf_data = ExportService.export_student_report_to_pdf(
        student_name=student.get("full_name", "Student"),
        grade=student.get("grade", ""),
        month=month,
        exams_data=exams_data,
        skill_breakdown=skill_breakdown,
        overall_stats=overall_stats
    )
    
    return StreamingResponse(
        io.BytesIO(pdf_data),
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=report_{student_email}_{month}.pdf"}
    )

@app.post("/api/settings/branding")
async def update_branding(
    branding: Dict,
    current_user: User = Depends(get_current_user)
):
    """Update platform branding (Admin only)"""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    # Update or create branding document
    await db.branding.update_one(
        {"_id": "main"},
        {"$set": {
            "institution_name": branding.get("institution_name", "Education Reforms Bureau"),
            "portal_name": branding.get("portal_name", "Grade 5 Scholarship Exam Portal"),
            "tagline": branding.get("tagline", "Building Future Scholars"),
            "primary_color": branding.get("primary_color", "#F97316"),
            "secondary_color": branding.get("secondary_color", "#3B82F6"),
            "updated_at": datetime.now(timezone.utc)
        }},
        upsert=True
    )
    
    return {"success": True, "message": "Branding updated successfully"}

@app.get("/api/settings/branding")
async def get_branding():
    """Get platform branding (Public)"""
    branding = await db.branding.find_one({"_id": "main"})
    if not branding:
        return {
            "institution_name": "Education Reforms Bureau",
            "portal_name": "Grade 5 Scholarship Exam Portal",
            "tagline": "Building Future Scholars",
            "primary_color": "#F97316",
            "secondary_color": "#3B82F6"
        }
    return branding

