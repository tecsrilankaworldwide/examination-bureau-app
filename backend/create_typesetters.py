"""
Create Typesetter Users - For PDF Exam System
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext
import os
from dotenv import load_dotenv
from datetime import datetime, timezone
import uuid

load_dotenv()

MONGO_URL = os.environ.get('MONGO_URL')
DB_NAME = os.environ.get('DB_NAME_EXAM', 'exam_bureau_prod')

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def create_typesetters():
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    print("🎓 Creating Typesetter Users...")
    print("=" * 50)
    
    typesetters = [
        {
            "id": str(uuid.uuid4()),
            "email": "sinhala.typesetter@exambureau.com",
            "full_name": "Sinhala Typesetter",
            "role": "typesetter",
            "assigned_language": "si",
            "assigned_grades": ["grade_2", "grade_3", "grade_4", "grade_5"],
            "hashed_password": pwd_context.hash("typesetter123"),
            "created_at": datetime.now(timezone.utc).isoformat(),
            "is_active": True
        },
        {
            "id": str(uuid.uuid4()),
            "email": "tamil.typesetter@exambureau.com",
            "full_name": "Tamil Typesetter",
            "role": "typesetter",
            "assigned_language": "ta",
            "assigned_grades": ["grade_2", "grade_3", "grade_4", "grade_5"],
            "hashed_password": pwd_context.hash("typesetter123"),
            "created_at": datetime.now(timezone.utc).isoformat(),
            "is_active": True
        },
        {
            "id": str(uuid.uuid4()),
            "email": "english.typesetter@exambureau.com",
            "full_name": "English Typesetter",
            "role": "typesetter",
            "assigned_language": "en",
            "assigned_grades": ["grade_2", "grade_3", "grade_4", "grade_5"],
            "hashed_password": pwd_context.hash("typesetter123"),
            "created_at": datetime.now(timezone.utc).isoformat(),
            "is_active": True
        }
    ]
    
    for typesetter in typesetters:
        # Check if already exists
        existing = await db.users.find_one({"email": typesetter["email"]})
        if existing:
            print(f"⚠️  {typesetter['full_name']} already exists: {typesetter['email']}")
        else:
            await db.users.insert_one(typesetter)
            print(f"✅ Created: {typesetter['full_name']} ({typesetter['email']})")
            print(f"   Language: {typesetter['assigned_language']}, Grades: {', '.join(typesetter['assigned_grades'])}")
    
    print("\n" + "=" * 50)
    print("🎉 Typesetter accounts created!")
    print("\n📝 LOGIN CREDENTIALS:")
    print("-" * 50)
    print("Sinhala Typesetter:")
    print("  Email: sinhala.typesetter@exambureau.com")
    print("  Password: typesetter123")
    print("\nTamil Typesetter:")
    print("  Email: tamil.typesetter@exambureau.com")
    print("  Password: typesetter123")
    print("\nEnglish Typesetter:")
    print("  Email: english.typesetter@exambureau.com")
    print("  Password: typesetter123")
    print("=" * 50)
    
    client.close()

if __name__ == "__main__":
    asyncio.run(create_typesetters())
