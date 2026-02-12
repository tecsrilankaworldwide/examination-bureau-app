from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, UploadFile, File, Form
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import FileResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone, timedelta
from passlib.context import CryptContext
from jose import JWTError, jwt
import os
import logging
from pathlib import Path
import uuid
import shutil

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Configuration
MONGO_URL = os.environ['MONGO_URL']
DB_NAME = os.environ.get('DB_NAME', 'examination_bureau')
JWT_SECRET = os.environ.get('JWT_SECRET', 'your-secret-key-change-in-production')
JWT_ALGORITHM = os.environ.get('JWT_ALGORITHM', 'HS256')
FILE_UPLOAD_DIR = Path(os.environ.get('FILE_UPLOAD_DIR', 'uploads/paper2'))
FILE_UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

# MongoDB connection
client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Security
security = HTTPBearer()

# Create FastAPI app
app = FastAPI(title="Examination Evaluation Bureau API")
api_router = APIRouter(prefix="/api")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============ Helper Functions ============

def serialize_doc(doc: Dict[str, Any]) -> Dict[str, Any]:
    """Convert MongoDB document to JSON-serializable dict"""
    if doc is None:
        return None
    
    if '_id' in doc:
        doc['_id'] = str(doc['_id'])
    
    for key, value in doc.items():
        if isinstance(value, datetime):
            doc[key] = value.isoformat()
        elif isinstance(value, list):
            doc[key] = [serialize_doc(item) if isinstance(item, dict) else item for item in value]
        elif isinstance(value, dict):
            doc[key] = serialize_doc(value)
    
    return doc


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(hours=24)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return encoded_jwt


async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> Dict[str, Any]:
    """Verify JWT token and return current user"""
    token = credentials.credentials
    
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")
    
    user = await db.users.find_one({"id": user_id})
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    
    return serialize_doc(user)


# ============ Models ============

class UserRole:
    STUDENT = "student"
    PARENT = "parent"
    TEACHER = "teacher"
    ADMIN = "admin"


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    name: str
    role: str
    grade: Optional[int] = None
    student_id: Optional[str] = None  # For parent linking


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Dict[str, Any]


class ExamAttempt(BaseModel):
    exam_id: str
    student_id: str
    started_at: datetime
    submitted_at: Optional[datetime] = None
    answers: Dict[str, str] = {}  # question_id -> selected_option
    flagged_questions: List[str] = []
    time_remaining: Optional[int] = None  # seconds
    score: Optional[int] = None
    skill_breakdown: Optional[Dict[str, Any]] = None
    status: str = "in_progress"  # in_progress, submitted


class SaveAnswerRequest(BaseModel):
    question_id: str
    selected_option: str
    time_remaining: int
    flagged: Optional[bool] = False


class SubmitExamRequest(BaseModel):
    time_remaining: int


class Paper2Submission(BaseModel):
    exam_id: str
    student_id: str
    files: List[str] = []
    submitted_at: datetime
    status: str = "submitted"  # submitted, under_review, scored
    score: Optional[int] = None
    feedback: Optional[str] = None
    skill_scores: Optional[Dict[str, int]] = None


# ============ Authentication Routes ============

@api_router.post("/register", response_model=TokenResponse)
async def register(request: RegisterRequest):
    """Register a new user"""
    # Check if user exists
    existing_user = await db.users.find_one({"email": request.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user
    user_id = str(uuid.uuid4())
    user_data = {
        "id": user_id,
        "email": request.email,
        "password": hash_password(request.password),
        "name": request.name,
        "role": request.role,
        "created_at": datetime.now(timezone.utc),
    }
    
    if request.role == UserRole.STUDENT and request.grade:
        user_data["grade"] = request.grade
    
    if request.role == UserRole.PARENT and request.student_id:
        user_data["student_id"] = request.student_id
    
    await db.users.insert_one(user_data)
    
    # Create token
    access_token = create_access_token({"sub": user_id})
    
    user_response = serialize_doc(user_data)
    user_response.pop('password', None)
    
    return TokenResponse(access_token=access_token, user=user_response)


@api_router.post("/login", response_model=TokenResponse)
async def login(request: LoginRequest):
    """Login user"""
    user = await db.users.find_one({"email": request.email})
    
    if not user or not verify_password(request.password, user["password"]):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    
    access_token = create_access_token({"sub": user["id"]})
    
    user_response = serialize_doc(user)
    user_response.pop('password', None)
    
    return TokenResponse(access_token=access_token, user=user_response)


@api_router.get("/me")
async def get_me(current_user: Dict[str, Any] = Depends(get_current_user)):
    """Get current user info"""
    current_user.pop('password', None)
    return current_user


# ============ Exam Routes ============

@api_router.get("/exams")
async def list_exams(
    grade: Optional[int] = None,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """List available exams"""
    query = {}
    
    if current_user["role"] == UserRole.STUDENT:
        query["grade"] = current_user.get("grade")
    elif grade:
        query["grade"] = grade
    
    exams = await db.exams.find(query).to_list(100)
    
    return [serialize_doc(exam) for exam in exams]


@api_router.post("/exams/{exam_id}/start")
async def start_exam(
    exam_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Start or resume an exam attempt"""
    if current_user["role"] != UserRole.STUDENT:
        raise HTTPException(status_code=403, detail="Only students can take exams")
    
    # Check if exam exists
    exam = await db.exams.find_one({"id": exam_id})
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")
    
    # Check for existing attempt
    existing_attempt = await db.attempts.find_one({
        "exam_id": exam_id,
        "student_id": current_user["id"],
        "status": "in_progress"
    })
    
    if existing_attempt:
        return {
            "message": "Resuming exam",
            "attempt": serialize_doc(existing_attempt),
            "exam": serialize_doc(exam)
        }
    
    # Check for completed attempt
    completed_attempt = await db.attempts.find_one({
        "exam_id": exam_id,
        "student_id": current_user["id"],
        "status": "submitted"
    })
    
    if completed_attempt:
        raise HTTPException(status_code=400, detail="Exam already completed")
    
    # Create new attempt
    attempt_data = {
        "id": str(uuid.uuid4()),
        "exam_id": exam_id,
        "student_id": current_user["id"],
        "started_at": datetime.now(timezone.utc),
        "answers": {},
        "flagged_questions": [],
        "time_remaining": exam["duration_minutes"] * 60,  # Convert to seconds
        "status": "in_progress"
    }
    
    await db.attempts.insert_one(attempt_data)
    
    return {
        "message": "Exam started",
        "attempt": serialize_doc(attempt_data),
        "exam": serialize_doc(exam)
    }


@api_router.post("/exams/{exam_id}/save-answer")
async def save_answer(
    exam_id: str,
    request: SaveAnswerRequest,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Save answer for a question"""
    if current_user["role"] != UserRole.STUDENT:
        raise HTTPException(status_code=403, detail="Only students can answer questions")
    
    # Find attempt
    attempt = await db.attempts.find_one({
        "exam_id": exam_id,
        "student_id": current_user["id"],
        "status": "in_progress"
    })
    
    if not attempt:
        raise HTTPException(status_code=404, detail="Exam attempt not found")
    
    # Update answer
    update_data = {
        f"answers.{request.question_id}": request.selected_option,
        "time_remaining": request.time_remaining,
        "updated_at": datetime.now(timezone.utc)
    }
    
    # Handle flagging
    if request.flagged:
        if request.question_id not in attempt.get("flagged_questions", []):
            await db.attempts.update_one(
                {"id": attempt["id"]},
                {"$addToSet": {"flagged_questions": request.question_id}}
            )
    else:
        await db.attempts.update_one(
            {"id": attempt["id"]},
            {"$pull": {"flagged_questions": request.question_id}}
        )
    
    await db.attempts.update_one(
        {"id": attempt["id"]},
        {"$set": update_data}
    )
    
    return {"message": "Answer saved", "success": True}


@api_router.post("/exams/{exam_id}/submit")
async def submit_exam(
    exam_id: str,
    request: SubmitExamRequest,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Submit exam and calculate score"""
    if current_user["role"] != UserRole.STUDENT:
        raise HTTPException(status_code=403, detail="Only students can submit exams")
    
    # Find attempt
    attempt = await db.attempts.find_one({
        "exam_id": exam_id,
        "student_id": current_user["id"],
        "status": "in_progress"
    })
    
    if not attempt:
        raise HTTPException(status_code=404, detail="Exam attempt not found")
    
    # Get exam with questions
    exam = await db.exams.find_one({"id": exam_id})
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")
    
    # Calculate score
    correct_count = 0
    skill_scores = {}
    skill_counts = {}
    
    for question in exam["questions"]:
        q_id = question["id"]
        correct_answer = question["correct_answer"]
        student_answer = attempt.get("answers", {}).get(q_id)
        skill = question["skill"]
        
        # Initialize skill tracking
        if skill not in skill_scores:
            skill_scores[skill] = 0
            skill_counts[skill] = 0
        
        skill_counts[skill] += 1
        
        if student_answer == correct_answer:
            correct_count += 1
            skill_scores[skill] += 1
    
    # Calculate percentages
    total_questions = len(exam["questions"])
    overall_percentage = (correct_count / total_questions * 100) if total_questions > 0 else 0
    
    skill_breakdown = {}
    for skill, correct in skill_scores.items():
        total = skill_counts[skill]
        percentage = (correct / total * 100) if total > 0 else 0
        skill_breakdown[skill] = {
            "correct": correct,
            "total": total,
            "percentage": round(percentage, 1)
        }
    
    # Update attempt
    await db.attempts.update_one(
        {"id": attempt["id"]},
        {
            "$set": {
                "submitted_at": datetime.now(timezone.utc),
                "status": "submitted",
                "score": correct_count,
                "total_questions": total_questions,
                "percentage": round(overall_percentage, 1),
                "skill_breakdown": skill_breakdown,
                "time_remaining": request.time_remaining
            }
        }
    )
    
    return {
        "message": "Exam submitted successfully",
        "score": correct_count,
        "total": total_questions,
        "percentage": round(overall_percentage, 1),
        "skill_breakdown": skill_breakdown
    }


# ============ Student Progress Routes ============

@api_router.get("/students/{student_id}/progress")
async def get_student_progress(
    student_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Get student progress and blood report data"""
    # Authorization check
    if current_user["role"] == UserRole.STUDENT and current_user["id"] != student_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    if current_user["role"] == UserRole.PARENT:
        if current_user.get("student_id") != student_id:
            raise HTTPException(status_code=403, detail="Access denied")
    
    # Get all submitted attempts
    attempts = await db.attempts.find({
        "student_id": student_id,
        "status": "submitted"
    }).sort("submitted_at", 1).to_list(100)
    
    if not attempts:
        return {
            "student_id": student_id,
            "total_exams": 0,
            "average_score": 0,
            "skill_trends": {},
            "attempts": []
        }
    
    # Calculate aggregated stats
    total_score = sum(a.get("score", 0) for a in attempts)
    total_questions = sum(a.get("total_questions", 0) for a in attempts)
    average_percentage = (total_score / total_questions * 100) if total_questions > 0 else 0
    
    # Aggregate skill data across all attempts
    skill_aggregates = {}
    for attempt in attempts:
        skill_breakdown = attempt.get("skill_breakdown", {})
        for skill, data in skill_breakdown.items():
            if skill not in skill_aggregates:
                skill_aggregates[skill] = {"correct": 0, "total": 0, "percentages": []}
            skill_aggregates[skill]["correct"] += data["correct"]
            skill_aggregates[skill]["total"] += data["total"]
            skill_aggregates[skill]["percentages"].append(data["percentage"])
    
    # Calculate average for each skill
    skill_summary = {}
    for skill, data in skill_aggregates.items():
        avg_percentage = sum(data["percentages"]) / len(data["percentages"]) if data["percentages"] else 0
        skill_summary[skill] = {
            "average_percentage": round(avg_percentage, 1),
            "correct": data["correct"],
            "total": data["total"]
        }
    
    return {
        "student_id": student_id,
        "total_exams": len(attempts),
        "average_score": round(average_percentage, 1),
        "skill_summary": skill_summary,
        "attempts": [serialize_doc(a) for a in attempts]
    }


# ============ Paper 2 Routes ============

@api_router.post("/exams/{exam_id}/paper2/submit-file")
async def submit_paper2_file(
    exam_id: str,
    files: List[UploadFile] = File(...),
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Upload Paper 2 answer sheets (photos)"""
    if current_user["role"] not in [UserRole.STUDENT, UserRole.PARENT]:
        raise HTTPException(status_code=403, detail="Only students and parents can submit Paper 2")
    
    student_id = current_user["id"] if current_user["role"] == UserRole.STUDENT else current_user.get("student_id")
    
    if not student_id:
        raise HTTPException(status_code=400, detail="Student ID not found")
    
    # Create upload directory
    upload_dir = FILE_UPLOAD_DIR / student_id / exam_id
    upload_dir.mkdir(parents=True, exist_ok=True)
    
    # Save files
    saved_files = []
    for file in files:
        # Validate file type
        if not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail=f"File {file.filename} is not an image")
        
        # Generate unique filename
        file_ext = Path(file.filename).suffix
        unique_filename = f"{uuid.uuid4()}{file_ext}"
        file_path = upload_dir / unique_filename
        
        # Save file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        saved_files.append(str(file_path))
    
    # Check for existing submission
    existing = await db.paper2_submissions.find_one({
        "exam_id": exam_id,
        "student_id": student_id
    })
    
    if existing:
        # Update existing submission
        await db.paper2_submissions.update_one(
            {"id": existing["id"]},
            {
                "$set": {
                    "files": saved_files,
                    "submitted_at": datetime.now(timezone.utc),
                    "status": "submitted"
                }
            }
        )
        submission_id = existing["id"]
    else:
        # Create new submission
        submission_data = {
            "id": str(uuid.uuid4()),
            "exam_id": exam_id,
            "student_id": student_id,
            "files": saved_files,
            "submitted_at": datetime.now(timezone.utc),
            "status": "submitted"
        }
        await db.paper2_submissions.insert_one(submission_data)
        submission_id = submission_data["id"]
    
    return {
        "message": "Files uploaded successfully",
        "submission_id": submission_id,
        "files_count": len(saved_files)
    }


@api_router.get("/exams/{exam_id}/paper2/submission")
async def get_paper2_submission(
    exam_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Get Paper 2 submission status"""
    student_id = current_user["id"] if current_user["role"] == UserRole.STUDENT else current_user.get("student_id")
    
    if not student_id:
        raise HTTPException(status_code=400, detail="Student ID not found")
    
    submission = await db.paper2_submissions.find_one({
        "exam_id": exam_id,
        "student_id": student_id
    })
    
    if not submission:
        return {"status": "not_submitted", "submission": None}
    
    return {"status": "submitted", "submission": serialize_doc(submission)}


@api_router.get("/uploads/{student_id}/{exam_id}/{filename}")
async def serve_uploaded_file(
    student_id: str,
    exam_id: str,
    filename: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Serve uploaded Paper 2 files"""
    file_path = FILE_UPLOAD_DIR / student_id / exam_id / filename
    
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    
    return FileResponse(file_path)


# ============ Teacher Routes ============

@api_router.get("/teacher/paper2/submissions")
async def list_paper2_submissions(
    grade: Optional[int] = None,
    status: Optional[str] = None,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """List Paper 2 submissions for teacher review"""
    if current_user["role"] != UserRole.TEACHER:
        raise HTTPException(status_code=403, detail="Only teachers can access this")
    
    query = {}
    if status:
        query["status"] = status
    
    submissions = await db.paper2_submissions.find(query).to_list(100)
    
    # Enrich with student and exam data
    enriched = []
    for sub in submissions:
        student = await db.users.find_one({"id": sub["student_id"]})
        exam = await db.exams.find_one({"id": sub["exam_id"]})
        
        if grade and student and student.get("grade") != grade:
            continue
        
        enriched.append({
            **serialize_doc(sub),
            "student_name": student["name"] if student else "Unknown",
            "student_grade": student.get("grade") if student else None,
            "exam_title": exam["title"] if exam else "Unknown"
        })
    
    return enriched


@api_router.get("/teacher/paper2/submissions/{submission_id}")
async def get_submission_detail(
    submission_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Get detailed Paper 2 submission for marking"""
    if current_user["role"] != UserRole.TEACHER:
        raise HTTPException(status_code=403, detail="Only teachers can access this")
    
    submission = await db.paper2_submissions.find_one({"id": submission_id})
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")
    
    student = await db.users.find_one({"id": submission["student_id"]})
    exam = await db.exams.find_one({"id": submission["exam_id"]})
    
    return {
        **serialize_doc(submission),
        "student_name": student["name"] if student else "Unknown",
        "student_grade": student.get("grade") if student else None,
        "exam_title": exam["title"] if exam else "Unknown"
    }


@api_router.put("/teacher/paper2/submissions/{submission_id}/score")
async def score_paper2_submission(
    submission_id: str,
    skill_scores: Dict[str, int],
    feedback: str = "",
    status: str = "draft",
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Score a Paper 2 submission"""
    if current_user["role"] != UserRole.TEACHER:
        raise HTTPException(status_code=403, detail="Only teachers can score submissions")
    
    submission = await db.paper2_submissions.find_one({"id": submission_id})
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")
    
    # Calculate total score
    total_score = sum(skill_scores.values())
    
    update_data = {
        "skill_scores": skill_scores,
        "score": total_score,
        "feedback": feedback,
        "status": status if status in ["draft", "scored"] else "draft",
        "scored_by": current_user["id"],
        "scored_at": datetime.now(timezone.utc)
    }
    
    # Update submission
    await db.paper2_submissions.update_one(
        {"id": submission_id},
        {"$set": update_data}
    )
    
    return {"message": "Submission scored successfully", "total_score": total_score}


# ============ Admin Routes ============

@api_router.get("/admin/users")
async def list_users(
    role: Optional[str] = None,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """List all users (admin only)"""
    if current_user["role"] != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    query = {}
    if role:
        query["role"] = role
    
    users = await db.users.find(query).to_list(100)
    
    for user in users:
        user.pop('password', None)
    
    return [serialize_doc(user) for user in users]


# ============ Health Check ============

@api_router.get("/health")
async def health_check():
    """Health check endpoint"""
    try:
        await db.command('ping')
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        return {"status": "unhealthy", "database": "disconnected", "error": str(e)}


# Mount router
app.include_router(api_router)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
