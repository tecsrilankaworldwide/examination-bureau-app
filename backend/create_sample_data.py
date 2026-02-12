"""
Create comprehensive sample data for Examination Evaluation Bureau Platform
Grades 2-5 with users, exams, and sample attempts
"""

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext
from datetime import datetime, timezone, timedelta
import uuid
import os
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
MONGO_URL = os.environ['MONGO_URL']
DB_NAME = os.environ.get('DB_NAME', 'examination_bureau')

client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# 10 Skills tracked
SKILLS = [
    "Mathematical Reasoning",
    "Language Proficiency",
    "General Knowledge",
    "Comprehension Skills",
    "Problem Solving",
    "Logical Thinking",
    "Spatial Reasoning",
    "Memory & Recall",
    "Analytical Skills",
    "Critical Thinking"
]


async def clear_database():
    """Clear existing data"""
    print("Clearing existing data...")
    await db.users.delete_many({})
    await db.exams.delete_many({})
    await db.attempts.delete_many({})
    await db.paper2_submissions.delete_many({})
    print("Database cleared.")


async def create_users():
    """Create sample users for all roles and grades"""
    print("Creating users...")
    
    users = []
    
    # Admin
    users.append({
        "id": str(uuid.uuid4()),
        "email": "admin@exambureau.com",
        "password": pwd_context.hash("admin123"),
        "name": "Admin User",
        "role": "admin",
        "created_at": datetime.now(timezone.utc)
    })
    
    # Teacher
    users.append({
        "id": str(uuid.uuid4()),
        "email": "teacher@exambureau.com",
        "password": pwd_context.hash("teacher123"),
        "name": "Teacher Perera",
        "role": "teacher",
        "created_at": datetime.now(timezone.utc)
    })
    
    # Students and Parents for each grade
    student_ids = {}
    for grade in [2, 3, 4, 5]:
        student_id = str(uuid.uuid4())
        student_ids[grade] = student_id
        
        # Student
        users.append({
            "id": student_id,
            "email": f"student{grade}@test.com",
            "password": pwd_context.hash(f"student{grade}23"),
            "name": f"Student Grade {grade}",
            "role": "student",
            "grade": grade,
            "created_at": datetime.now(timezone.utc)
        })
        
        # Parent
        users.append({
            "id": str(uuid.uuid4()),
            "email": f"parent{grade}@test.com",
            "password": pwd_context.hash(f"parent{grade}23"),
            "name": f"Parent of Grade {grade} Student",
            "role": "parent",
            "student_id": student_id,
            "created_at": datetime.now(timezone.utc)
        })
    
    await db.users.insert_many(users)
    print(f"Created {len(users)} users")
    
    return student_ids


def generate_mcq_questions(grade: int, count: int):
    """Generate MCQ questions based on grade"""
    questions = []
    
    question_templates = {
        2: [
            # Mathematical Reasoning
            {"text": "What is 5 + 3?", "options": ["6", "7", "8", "9", "10"], "correct": "8", "skill": "Mathematical Reasoning"},
            {"text": "What is 10 - 4?", "options": ["4", "5", "6", "7", "8"], "correct": "6", "skill": "Mathematical Reasoning"},
            {"text": "How many sides does a triangle have?", "options": ["2", "3", "4", "5", "6"], "correct": "3", "skill": "Mathematical Reasoning"},
            {"text": "What is 2 × 3?", "options": ["4", "5", "6", "7", "8"], "correct": "6", "skill": "Mathematical Reasoning"},
            
            # Language Proficiency
            {"text": "What is the plural of 'cat'?", "options": ["cat", "cats", "cates", "caties", "catses"], "correct": "cats", "skill": "Language Proficiency"},
            {"text": "Which word rhymes with 'cat'?", "options": ["dog", "bat", "car", "sun", "tree"], "correct": "bat", "skill": "Language Proficiency"},
            {"text": "What is the opposite of 'big'?", "options": ["small", "large", "huge", "tall", "wide"], "correct": "small", "skill": "Language Proficiency"},
            {"text": "Complete: I ___ happy.", "options": ["is", "am", "are", "be", "was"], "correct": "am", "skill": "Language Proficiency"},
            
            # General Knowledge
            {"text": "What color is the sky?", "options": ["red", "blue", "green", "yellow", "black"], "correct": "blue", "skill": "General Knowledge"},
            {"text": "How many days in a week?", "options": ["5", "6", "7", "8", "9"], "correct": "7", "skill": "General Knowledge"},
            
            # Comprehension Skills
            {"text": "If it's raining, you need an ___.", "options": ["umbrella", "ice cream", "ball", "book", "pencil"], "correct": "umbrella", "skill": "Comprehension Skills"},
            {"text": "A place where books are kept is called a ___.", "options": ["kitchen", "library", "garden", "playground", "shop"], "correct": "library", "skill": "Comprehension Skills"},
            
            # Problem Solving
            {"text": "You have 3 apples and get 2 more. How many do you have?", "options": ["3", "4", "5", "6", "7"], "correct": "5", "skill": "Problem Solving"},
            {"text": "If you have 10 candies and eat 3, how many are left?", "options": ["5", "6", "7", "8", "9"], "correct": "7", "skill": "Problem Solving"},
        ],
        3: [
            # Mathematical Reasoning
            {"text": "What is 12 + 8?", "options": ["18", "19", "20", "21", "22"], "correct": "20", "skill": "Mathematical Reasoning"},
            {"text": "What is 15 - 7?", "options": ["6", "7", "8", "9", "10"], "correct": "8", "skill": "Mathematical Reasoning"},
            {"text": "What is 4 × 5?", "options": ["15", "18", "20", "22", "25"], "correct": "20", "skill": "Mathematical Reasoning"},
            {"text": "What is 16 ÷ 4?", "options": ["2", "3", "4", "5", "6"], "correct": "4", "skill": "Mathematical Reasoning"},
            
            # Language Proficiency
            {"text": "What is the past tense of 'run'?", "options": ["run", "runs", "ran", "running", "runned"], "correct": "ran", "skill": "Language Proficiency"},
            {"text": "Choose the correct spelling:", "options": ["becaus", "because", "becouse", "becuse", "beacause"], "correct": "because", "skill": "Language Proficiency"},
            {"text": "What is a synonym for 'happy'?", "options": ["sad", "angry", "joyful", "tired", "hungry"], "correct": "joyful", "skill": "Language Proficiency"},
            {"text": "Which is a noun?", "options": ["run", "quickly", "beautiful", "table", "slowly"], "correct": "table", "skill": "Language Proficiency"},
            
            # General Knowledge
            {"text": "What is the capital of Sri Lanka?", "options": ["Colombo", "Kandy", "Galle", "Jaffna", "Anuradhapura"], "correct": "Colombo", "skill": "General Knowledge"},
            {"text": "How many months in a year?", "options": ["10", "11", "12", "13", "14"], "correct": "12", "skill": "General Knowledge"},
            
            # Comprehension Skills
            {"text": "A person who teaches is called a ___.", "options": ["doctor", "teacher", "farmer", "driver", "cook"], "correct": "teacher", "skill": "Comprehension Skills"},
            {"text": "We use our ears to ___.", "options": ["see", "smell", "hear", "taste", "touch"], "correct": "hear", "skill": "Comprehension Skills"},
            
            # Logical Thinking
            {"text": "If all cats are animals, and Tom is a cat, then Tom is a ___.", "options": ["plant", "animal", "machine", "vegetable", "mineral"], "correct": "animal", "skill": "Logical Thinking"},
            {"text": "What comes next? 2, 4, 6, 8, ___", "options": ["9", "10", "11", "12", "14"], "correct": "10", "skill": "Logical Thinking"},
        ],
        4: [
            # More complex questions for Grade 4
            {"text": "What is 145 + 278?", "options": ["413", "423", "433", "443", "453"], "correct": "423", "skill": "Mathematical Reasoning"},
            {"text": "What is 12 × 8?", "options": ["84", "88", "92", "96", "100"], "correct": "96", "skill": "Mathematical Reasoning"},
            {"text": "What is 144 ÷ 12?", "options": ["10", "11", "12", "13", "14"], "correct": "12", "skill": "Mathematical Reasoning"},
            {"text": "What is 25% of 100?", "options": ["20", "25", "30", "35", "40"], "correct": "25", "skill": "Mathematical Reasoning"},
            
            # Language Proficiency
            {"text": "Identify the adjective: 'The beautiful flower bloomed.'", "options": ["The", "beautiful", "flower", "bloomed", "none"], "correct": "beautiful", "skill": "Language Proficiency"},
            {"text": "What is the plural of 'child'?", "options": ["childs", "childes", "children", "childrens", "child"], "correct": "children", "skill": "Language Proficiency"},
            {"text": "Choose the correctly punctuated sentence:", "options": ["Whats your name", "What's your name?", "Whats your name?", "What's your name", "whats your name"], "correct": "What's your name?", "skill": "Language Proficiency"},
            {"text": "What is an antonym for 'ancient'?", "options": ["old", "modern", "historic", "past", "aged"], "correct": "modern", "skill": "Language Proficiency"},
            
            # General Knowledge
            {"text": "Who is known as the 'Father of the Nation' in Sri Lanka?", "options": ["D.S. Senanayake", "S.W.R.D. Bandaranaike", "J.R. Jayewardene", "Mahinda Rajapaksa", "Sirimavo Bandaranaike"], "correct": "D.S. Senanayake", "skill": "General Knowledge"},
            {"text": "What is the largest planet in our solar system?", "options": ["Earth", "Mars", "Jupiter", "Saturn", "Venus"], "correct": "Jupiter", "skill": "General Knowledge"},
            
            # Comprehension Skills
            {"text": "Read: 'The sun rises in the east.' Where does the sun rise?", "options": ["West", "East", "North", "South", "Center"], "correct": "East", "skill": "Comprehension Skills"},
            {"text": "What does 'photosynthesis' mean?", "options": ["Plant eating", "Plant breathing", "Plant making food", "Plant growing", "Plant dying"], "correct": "Plant making food", "skill": "Comprehension Skills"},
            
            # Problem Solving
            {"text": "A book costs Rs. 150 and you have Rs. 500. How much change?", "options": ["Rs. 300", "Rs. 325", "Rs. 350", "Rs. 375", "Rs. 400"], "correct": "Rs. 350", "skill": "Problem Solving"},
            {"text": "If a car travels 60 km in 1 hour, how far in 3 hours?", "options": ["120 km", "150 km", "180 km", "200 km", "240 km"], "correct": "180 km", "skill": "Problem Solving"},
            
            # Critical Thinking
            {"text": "Which doesn't belong? Apple, Banana, Carrot, Orange", "options": ["Apple", "Banana", "Carrot", "Orange", "All belong"], "correct": "Carrot", "skill": "Critical Thinking"},
            {"text": "If A > B and B > C, then:", "options": ["A < C", "A = C", "A > C", "Cannot determine", "None"], "correct": "A > C", "skill": "Critical Thinking"},
        ],
        5: [
            # Most complex questions for Grade 5
            {"text": "What is 1234 + 5678?", "options": ["6812", "6892", "6902", "6912", "6922"], "correct": "6912", "skill": "Mathematical Reasoning"},
            {"text": "What is 15 × 24?", "options": ["340", "350", "360", "370", "380"], "correct": "360", "skill": "Mathematical Reasoning"},
            {"text": "What is the area of a rectangle 12m × 8m?", "options": ["86 sq m", "90 sq m", "94 sq m", "96 sq m", "100 sq m"], "correct": "96 sq m", "skill": "Mathematical Reasoning"},
            {"text": "If 3x = 15, what is x?", "options": ["3", "4", "5", "6", "7"], "correct": "5", "skill": "Mathematical Reasoning"},
            
            # Language Proficiency
            {"text": "Identify the verb: 'She quickly ran to school.'", "options": ["She", "quickly", "ran", "to", "school"], "correct": "ran", "skill": "Language Proficiency"},
            {"text": "What is a metaphor in: 'Time is money'?", "options": ["Time", "is", "money", "Comparing time to money", "None"], "correct": "Comparing time to money", "skill": "Language Proficiency"},
            {"text": "Choose the correct form: 'He ___ been studying for hours.'", "options": ["has", "have", "had", "having", "is"], "correct": "has", "skill": "Language Proficiency"},
            {"text": "What is alliteration?", "options": ["Rhyming words", "Repeated consonant sounds", "Similar meanings", "Opposite meanings", "Comparisons"], "correct": "Repeated consonant sounds", "skill": "Language Proficiency"},
            
            # General Knowledge
            {"text": "In which year did Sri Lanka gain independence?", "options": ["1945", "1947", "1948", "1950", "1952"], "correct": "1948", "skill": "General Knowledge"},
            {"text": "What is the SI unit of force?", "options": ["Joule", "Watt", "Newton", "Pascal", "Kelvin"], "correct": "Newton", "skill": "General Knowledge"},
            
            # Comprehension Skills
            {"text": "What is the main idea of a paragraph?", "options": ["First sentence", "Last sentence", "Central message", "Longest sentence", "Title"], "correct": "Central message", "skill": "Comprehension Skills"},
            {"text": "An inference is:", "options": ["A fact", "A guess", "A conclusion from evidence", "An opinion", "A question"], "correct": "A conclusion from evidence", "skill": "Comprehension Skills"},
            
            # Problem Solving  
            {"text": "A train leaves at 9:30 AM and arrives at 2:45 PM. Travel time?", "options": ["4 hrs 15 min", "5 hrs", "5 hrs 15 min", "5 hrs 30 min", "6 hrs"], "correct": "5 hrs 15 min", "skill": "Problem Solving"},
            {"text": "If 5 workers complete a job in 12 days, how many days for 3 workers?", "options": ["15 days", "18 days", "20 days", "22 days", "24 days"], "correct": "20 days", "skill": "Problem Solving"},
            
            # Analytical Skills
            {"text": "Data: 10, 12, 14, 16, 18. What's the average?", "options": ["12", "13", "14", "15", "16"], "correct": "14", "skill": "Analytical Skills"},
            {"text": "Pattern: 1, 4, 9, 16, ___. What's next?", "options": ["20", "21", "24", "25", "30"], "correct": "25", "skill": "Analytical Skills"},
        ]
    }
    
    # Get templates for grade
    templates = question_templates.get(grade, question_templates[2])
    
    # Repeat and shuffle to reach desired count
    import random
    while len(questions) < count:
        for template in templates:
            if len(questions) >= count:
                break
            q_id = str(uuid.uuid4())
            questions.append({
                "id": q_id,
                **template
            })
    
    random.shuffle(questions)
    return questions[:count]


async def create_exams():
    """Create sample exams for all grades"""
    print("Creating exams...")
    
    exams = []
    
    for grade in [2, 3, 4, 5]:
        # Determine question count
        question_count = 40 if grade <= 3 else 60
        
        exam_id = str(uuid.uuid4())
        exams.append({
            "id": exam_id,
            "title": f"Grade {grade} - February 2026 Scholarship Exam",
            "description": f"Monthly scholarship examination for Grade {grade} students",
            "grade": grade,
            "paper": 1,  # MCQ Paper
            "duration_minutes": 60,
            "total_marks": question_count,
            "questions": generate_mcq_questions(grade, question_count),
            "created_at": datetime.now(timezone.utc),
            "published": True
        })
    
    await db.exams.insert_many(exams)
    print(f"Created {len(exams)} exams")
    
    return exams


async def create_sample_attempts(student_ids, exams):
    """Create some sample completed attempts for demonstration"""
    print("Creating sample attempts...")
    
    attempts = []
    
    for grade, student_id in student_ids.items():
        # Find exam for this grade
        grade_exam = next((e for e in exams if e["grade"] == grade), None)
        if not grade_exam:
            continue
        
        # Create a completed attempt
        answers = {}
        for question in grade_exam["questions"][:10]:  # Answer first 10 questions correctly
            answers[question["id"]] = question["correct"]
        
        # Calculate score for these 10 correct answers
        skill_breakdown = {}
        for question in grade_exam["questions"][:10]:
            skill = question["skill"]
            if skill not in skill_breakdown:
                skill_breakdown[skill] = {"correct": 0, "total": 0, "percentage": 0}
            skill_breakdown[skill]["correct"] += 1
            skill_breakdown[skill]["total"] += 1
        
        for skill in skill_breakdown:
            total = skill_breakdown[skill]["total"]
            correct = skill_breakdown[skill]["correct"]
            skill_breakdown[skill]["percentage"] = round((correct / total * 100), 1) if total > 0 else 0
        
        attempts.append({
            "id": str(uuid.uuid4()),
            "exam_id": grade_exam["id"],
            "student_id": student_id,
            "started_at": datetime.now(timezone.utc) - timedelta(hours=2),
            "submitted_at": datetime.now(timezone.utc) - timedelta(hours=1),
            "answers": answers,
            "flagged_questions": [],
            "time_remaining": 1200,  # 20 minutes remaining
            "status": "submitted",
            "score": 10,
            "total_questions": len(grade_exam["questions"]),
            "percentage": round((10 / len(grade_exam["questions"]) * 100), 1),
            "skill_breakdown": skill_breakdown
        })
    
    if attempts:
        await db.attempts.insert_many(attempts)
        print(f"Created {len(attempts)} sample attempts")


async def main():
    """Main function to create all sample data"""
    print("\n=== Creating Sample Data for Examination Bureau ===\n")
    
    try:
        await clear_database()
        student_ids = await create_users()
        exams = await create_exams()
        await create_sample_attempts(student_ids, exams)
        
        print("\n✅ Sample data created successfully!")
        print("\n📝 Test Credentials:")
        print("  Admin:   admin@exambureau.com / admin123")
        print("  Teacher: teacher@exambureau.com / teacher123")
        print("\n  Students:")
        for grade in [2, 3, 4, 5]:
            print(f"    Grade {grade}: student{grade}@test.com / student{grade}23")
        print("\n  Parents:")
        for grade in [2, 3, 4, 5]:
            print(f"    Grade {grade}: parent{grade}@test.com / parent{grade}23")
        
        print("\n🎯 Data Summary:")
        print(f"  - Users: {await db.users.count_documents({})}")
        print(f"  - Exams: {await db.exams.count_documents({})}")
        print(f"  - Attempts: {await db.attempts.count_documents({})}")
        
    except Exception as e:
        print(f"\n❌ Error creating sample data: {e}")
        import traceback
        traceback.print_exc()
    finally:
        client.close()


if __name__ == "__main__":
    asyncio.run(main())
