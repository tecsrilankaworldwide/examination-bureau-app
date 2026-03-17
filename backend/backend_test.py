"""
Backend API Testing for Grade 5 Scholarship Examination Platform
Tests all endpoints with proper authentication and role-based access
"""

import requests
import sys
from datetime import datetime

# Use public endpoint
BASE_URL = "https://ef959ac5-a0bf-4035-8b26-701ab8c26adc.preview.emergentagent.com/api"

class ExamPlatformTester:
    def __init__(self):
        self.base_url = BASE_URL
        self.tokens = {}
        self.users = {}
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []
        
    def log_test(self, name, passed, message=""):
        """Log test result"""
        self.tests_run += 1
        if passed:
            self.tests_passed += 1
            print(f"✅ {name}")
        else:
            print(f"❌ {name}: {message}")
        
        self.test_results.append({
            "test": name,
            "passed": passed,
            "message": message
        })
        
    def test_login(self, email, password, role):
        """Test login for a specific role"""
        try:
            response = requests.post(
                f"{self.base_url}/login",
                json={"email": email, "password": password},
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                self.tokens[role] = data["access_token"]
                self.users[role] = data["user"]
                self.log_test(f"Login as {role}", True)
                return True
            else:
                self.log_test(f"Login as {role}", False, f"Status {response.status_code}: {response.text}")
                return False
        except Exception as e:
            self.log_test(f"Login as {role}", False, str(e))
            return False
    
    def test_get_exams(self, role="student"):
        """Test getting exams list"""
        try:
            headers = {"Authorization": f"Bearer {self.tokens.get(role, '')}"}
            
            # Test without filters
            response = requests.get(f"{self.base_url}/exams", headers=headers, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                exams = data.get("exams", [])
                self.log_test(f"Get exams list ({len(exams)} found)", True)
                return exams
            else:
                self.log_test("Get exams list", False, f"Status {response.status_code}")
                return []
        except Exception as e:
            self.log_test("Get exams list", False, str(e))
            return []
    
    def test_get_published_exams(self):
        """Test getting published exams for student grade"""
        try:
            student_grade = self.users.get("student", {}).get("grade", "grade_5")
            response = requests.get(
                f"{self.base_url}/exams?grade={student_grade}&status=published",
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                exams = data.get("exams", [])
                self.log_test(f"Get published exams for {student_grade} ({len(exams)} found)", True)
                return exams
            else:
                self.log_test("Get published exams", False, f"Status {response.status_code}")
                return []
        except Exception as e:
            self.log_test("Get published exams", False, str(e))
            return []
    
    def test_start_exam(self, exam_id):
        """Test starting an exam as student"""
        try:
            headers = {"Authorization": f"Bearer {self.tokens['student']}"}
            response = requests.post(
                f"{self.base_url}/exams/{exam_id}/start",
                json={},
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                attempt = data.get("attempt")
                exam = data.get("exam")
                
                if attempt and exam:
                    self.log_test("Start exam", True)
                    return attempt, exam
                else:
                    self.log_test("Start exam", False, "Missing attempt or exam data")
                    return None, None
            else:
                self.log_test("Start exam", False, f"Status {response.status_code}: {response.text}")
                return None, None
        except Exception as e:
            self.log_test("Start exam", False, str(e))
            return None, None
    
    def test_save_answer(self, attempt_id, question_id, option_id):
        """Test saving an answer"""
        try:
            headers = {"Authorization": f"Bearer {self.tokens['student']}"}
            response = requests.post(
                f"{self.base_url}/attempts/{attempt_id}/save",
                json={
                    "question_id": question_id,
                    "selected_option": option_id
                },
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                self.log_test("Save answer", True)
                return True
            else:
                self.log_test("Save answer", False, f"Status {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Save answer", False, str(e))
            return False
    
    def test_submit_exam(self, attempt_id):
        """Test submitting exam and getting results"""
        try:
            headers = {"Authorization": f"Bearer {self.tokens['student']}"}
            response = requests.post(
                f"{self.base_url}/attempts/{attempt_id}/submit",
                json={},
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if "score" in data and "skill_percentages" in data:
                    self.log_test(f"Submit exam (Score: {data['score']}/{data.get('total', 60)})", True)
                    return data
                else:
                    self.log_test("Submit exam", False, "Missing score data")
                    return None
            else:
                self.log_test("Submit exam", False, f"Status {response.status_code}: {response.text}")
                return None
        except Exception as e:
            self.log_test("Submit exam", False, str(e))
            return None
    
    def test_get_progress(self, student_id):
        """Test getting student progress report"""
        try:
            headers = {"Authorization": f"Bearer {self.tokens.get('parent', self.tokens.get('teacher', ''))}"}
            response = requests.get(
                f"{self.base_url}/students/{student_id}/progress",
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                self.log_test(f"Get progress report ({data.get('total_exams_taken', 0)} exams)", True)
                return data
            else:
                self.log_test("Get progress report", False, f"Status {response.status_code}")
                return None
        except Exception as e:
            self.log_test("Get progress report", False, str(e))
            return None
    
    def test_create_exam(self):
        """Test creating exam as teacher"""
        try:
            headers = {"Authorization": f"Bearer {self.tokens['teacher']}"}
            exam_data = {
                "title": "Test Exam - Feb 2024",
                "grade": "grade_5",
                "month": "2024-02",
                "paper1_questions": [],
                "duration_minutes": 60,
                "total_marks_paper1": 60,
                "total_marks_paper2": 40
            }
            
            response = requests.post(
                f"{self.base_url}/exams/create",
                json=exam_data,
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                self.log_test("Create exam (teacher)", True)
                return data.get("id")
            else:
                self.log_test("Create exam (teacher)", False, f"Status {response.status_code}")
                return None
        except Exception as e:
            self.log_test("Create exam (teacher)", False, str(e))
            return None
    
    def test_publish_exam(self, exam_id):
        """Test publishing exam"""
        try:
            headers = {"Authorization": f"Bearer {self.tokens['teacher']}"}
            response = requests.put(
                f"{self.base_url}/exams/{exam_id}/publish",
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                self.log_test("Publish exam", True)
                return True
            else:
                self.log_test("Publish exam", False, f"Status {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Publish exam", False, str(e))
            return False
    
    def test_unauthorized_access(self):
        """Test that students cannot create exams"""
        try:
            headers = {"Authorization": f"Bearer {self.tokens['student']}"}
            exam_data = {
                "title": "Unauthorized Exam",
                "grade": "grade_5",
                "month": "2024-03"
            }
            
            response = requests.post(
                f"{self.base_url}/exams/create",
                json=exam_data,
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 403:
                self.log_test("Role-based access control (student cannot create exam)", True)
                return True
            else:
                self.log_test("Role-based access control", False, f"Expected 403, got {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Role-based access control", False, str(e))
            return False
    
    def test_paper2_submission(self, exam_id, student_id):
        """Test Paper 2 submission metadata"""
        try:
            headers = {"Authorization": f"Bearer {self.tokens['student']}"}
            submission_data = {
                "exam_id": exam_id,
                "student_id": student_id,
                "whatsapp_reference": "Test submission via WhatsApp"
            }
            
            response = requests.post(
                f"{self.base_url}/paper2/submit-meta",
                json=submission_data,
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                self.log_test("Paper 2 submission metadata", True)
                return data.get("id")
            else:
                self.log_test("Paper 2 submission metadata", False, f"Status {response.status_code}")
                return None
        except Exception as e:
            self.log_test("Paper 2 submission metadata", False, str(e))
            return None
    
    def test_paper2_marking(self, submission_id):
        """Test Paper 2 marking by teacher"""
        try:
            headers = {"Authorization": f"Bearer {self.tokens['teacher']}"}
            marks_data = {
                "essay_marks": 15,
                "short_answer_marks": [2, 2, 1, 2, 2, 1, 2, 2, 2, 1],
                "comments": "Good effort, needs improvement in essay structure"
            }
            
            response = requests.put(
                f"{self.base_url}/paper2/{submission_id}/mark",
                json=marks_data,
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                self.log_test(f"Paper 2 marking (Total: {data.get('total_marks', 0)}/40)", True)
                return True
            else:
                self.log_test("Paper 2 marking", False, f"Status {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Paper 2 marking", False, str(e))
            return False
    
    def test_create_pdf_exam(self):
        """Test creating PDF exam (admin can do this)"""
        try:
            headers = {"Authorization": f"Bearer {self.tokens['admin']}"}
            exam_data = {
                "title": "Test PDF Exam - March 2025",
                "grade": "grade_5",
                "month": "2025-03",
                "duration_minutes": 60,
                "total_marks_paper1": 60
            }
            
            response = requests.post(
                f"{self.base_url}/exams/create-pdf",
                json=exam_data,
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                self.log_test("Create PDF exam (admin)", True)
                return data.get("exam_id")
            else:
                self.log_test("Create PDF exam (admin)", False, f"Status {response.status_code}")
                return None
        except Exception as e:
            self.log_test("Create PDF exam (admin)", False, str(e))
            return None
    
    def test_api_root(self):
        """Test API root endpoint"""
        try:
            response = requests.get(f"{self.base_url}/", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if "message" in data and "version" in data:
                    self.log_test("API root endpoint", True)
                    return True
            
            self.log_test("API root endpoint", False, f"Status {response.status_code}")
            return False
        except Exception as e:
            self.log_test("API root endpoint", False, str(e))
            return False
    
    def run_all_tests(self):
        """Run complete test suite"""
        print("\n" + "="*70)
        print("🧪 GRADE 5 SCHOLARSHIP EXAMINATION PLATFORM - BACKEND API TESTS")
        print("="*70 + "\n")
        
        # Test 1: API Root
        print("📍 Testing API Root...")
        self.test_api_root()
        print()
        
        # Test 2: Authentication for all roles
        print("🔐 Testing Authentication...")
        credentials = {
            "admin": ("admin@test.com", "admin123"),
            "teacher": ("teacher@test.com", "teacher123"),
            "student": ("student@test.com", "student123"),
            "parent": ("parent@test.com", "parent123")
        }
        
        for role, (email, password) in credentials.items():
            self.test_login(email, password, role)
        print()
        
        # Test 3: Exam listing
        print("📚 Testing Exam Management...")
        all_exams = self.test_get_exams("teacher")
        published_exams = self.test_get_published_exams()
        print()
        
        # Test 4: Exam taking flow (if published exams exist)
        if published_exams:
            print("✍️ Testing Exam Taking Flow...")
            exam_id = published_exams[0]["id"]
            
            attempt, exam = self.test_start_exam(exam_id)
            
            if attempt and exam:
                # Save some answers
                questions = exam.get("questions", [])
                if questions and len(questions) > 0:
                    # Check question structure
                    first_q = questions[0]
                    print(f"   Question structure keys: {list(first_q.keys())}")
                    
                    # Answer first 3 questions
                    for i, question in enumerate(questions[:3]):
                        # Handle different question structures
                        q_id = question.get("id") or question.get("question_number") or str(i)
                        options = question.get("options", [])
                        
                        if options:
                            # Select first option
                            if isinstance(options[0], dict):
                                option_id = options[0].get("option_id", options[0].get("text", "A"))
                            else:
                                option_id = "A"  # Default to A
                            
                            self.test_save_answer(attempt["id"], q_id, option_id)
                    
                    # Submit exam
                    result = self.test_submit_exam(attempt["id"])
                    
                    if result:
                        # Test progress report
                        student_id = self.users["student"]["id"]
                        self.test_get_progress(student_id)
            print()
        else:
            print("⚠️ No published exams found, skipping exam taking tests\n")
        
        # Test 5: Teacher operations
        print("👨‍🏫 Testing Teacher Operations...")
        new_exam_id = self.test_create_exam()
        if new_exam_id:
            self.test_publish_exam(new_exam_id)
        print()
        
        # Test 6: Role-based access control
        print("🔒 Testing Role-Based Access Control...")
        self.test_unauthorized_access()
        print()
        
        # Test 7: Paper 2 workflow
        if published_exams and self.users.get("student"):
            print("📝 Testing Paper 2 Workflow...")
            exam_id = published_exams[0]["id"]
            student_id = self.users["student"]["id"]
            
            submission_id = self.test_paper2_submission(exam_id, student_id)
            if submission_id:
                self.test_paper2_marking(submission_id)
            print()
        
        # Test 8: PDF Exam creation
        print("📄 Testing PDF Exam Creation...")
        self.test_create_pdf_exam()
        print()
        
        # Summary
        print("="*70)
        print(f"📊 TEST SUMMARY")
        print("="*70)
        print(f"Total Tests: {self.tests_run}")
        print(f"Passed: {self.tests_passed} ✅")
        print(f"Failed: {self.tests_run - self.tests_passed} ❌")
        print(f"Success Rate: {(self.tests_passed/self.tests_run*100):.1f}%")
        print("="*70 + "\n")
        
        return self.tests_passed == self.tests_run

def main():
    tester = ExamPlatformTester()
    success = tester.run_all_tests()
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())
