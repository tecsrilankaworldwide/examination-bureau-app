#!/usr/bin/env python3
"""
Grade 5 Scholarship Examination Platform - Backend API Testing
Tests all user roles, exam flow, parent blocking, and core functionality
"""

import requests
import json
import sys
from datetime import datetime

class ExamPlatformTester:
    def __init__(self, base_url="https://app-install-hub-1.preview.emergentagent.com"):
        self.base_url = base_url
        self.tokens = {}  # Store tokens for different user types
        self.user_data = {}  # Store user info
        self.tests_run = 0
        self.tests_passed = 0
        
        # Test credentials from review request
        self.test_users = {
            "admin": {"email": "admin@exam.lk", "password": "admin123"},
            "marker": {"email": "marker@exam.lk", "password": "marker123"},
            "test_student": {"email": "flow_student@test.lk", "password": "pass123"},
            "test_parent": {"email": "flow_parent@test.lk", "password": "pass123"}
        }

    def log_test(self, name, success, details=""):
        """Log test results"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name}")
        else:
            print(f"❌ {name}")
        if details:
            print(f"   └─ {details}")

    def test_health_check(self):
        """Test API health check - GET /api/"""
        print("\n🔍 Testing Backend API Health Check...")
        try:
            response = requests.get(f"{self.base_url}/api/")
            success = response.status_code == 200
            
            if success:
                data = response.json()
                features = data.get('features', [])
                details = f"Status: {response.status_code}, Version: {data.get('version', '')}, Features: {len(features)}"
            else:
                details = f"Status: {response.status_code}, Error: {response.text}"
                
            self.log_test("Backend API Health Check", success, details)
            return success
        except Exception as e:
            self.log_test("Backend API Health Check", False, f"Error: {str(e)}")
            return False

    def test_student_parent_registration(self):
        """Test Student-Parent registration - POST /api/register-student-parent"""
        print(f"\n👨‍👩‍👧 Testing Student-Parent Registration...")
        
        # Use unique email with timestamp to avoid conflicts
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        test_data = {
            "student_name": f"Flow Student {timestamp}",
            "student_email": f"flow_student_{timestamp}@test.lk",
            "student_password": "pass123",
            "parent_name": f"Flow Parent {timestamp}",
            "parent_email": f"flow_parent_{timestamp}@test.lk", 
            "parent_password": "pass123",
            "grade": "grade_5",
            "language": "si"
        }
        
        try:
            response = requests.post(
                f"{self.base_url}/api/register-student-parent",
                json=test_data,
                headers={"Content-Type": "application/json"}
            )
            success = response.status_code == 200
            
            if success:
                data = response.json()
                student_id = data.get("student_id", "")
                # Store the registered users for later tests
                self.test_users["new_student"] = {
                    "email": test_data["student_email"],
                    "password": test_data["student_password"]
                }
                self.test_users["new_parent"] = {
                    "email": test_data["parent_email"], 
                    "password": test_data["parent_password"]
                }
                details = f"Status: {response.status_code}, Student ID: {student_id}"
            else:
                details = f"Status: {response.status_code}, Error: {response.text}"
                
            self.log_test("Student-Parent Registration", success, details)
            return success
        except Exception as e:
            self.log_test("Student-Parent Registration", False, f"Error: {str(e)}")
            return False

    def test_login(self, user_type):
        """Test login - POST /api/login"""
        print(f"\n🔑 Testing {user_type.replace('_', ' ').title()} Login...")
        
        if user_type not in self.test_users:
            self.log_test(f"{user_type} login", False, "Invalid user type")
            return False
            
        try:
            credentials = self.test_users[user_type]
            response = requests.post(
                f"{self.base_url}/api/login",
                json=credentials,
                headers={"Content-Type": "application/json"}
            )
            
            success = response.status_code == 200
            
            if success:
                data = response.json()
                token = data.get("access_token")
                user_info = data.get("user", {})
                
                if token:
                    self.tokens[user_type] = token
                    self.user_data[user_type] = user_info
                    details = f"Status: {response.status_code}, Role: {user_info.get('role')}, Name: {user_info.get('full_name')}"
                else:
                    success = False
                    details = "No access token received"
            else:
                details = f"Status: {response.status_code}, Error: {response.text}"
                
            self.log_test(f"{user_type.replace('_', ' ').title()} Login", success, details)
            return success
        except Exception as e:
            self.log_test(f"{user_type.replace('_', ' ').title()} Login", False, f"Error: {str(e)}")
            return False

    def test_parent_blocked_during_exam(self):
        """Test parent BLOCKED from login while student taking exam"""
        print(f"\n🚫 Testing Parent Blocked During Student Exam...")
        
        # First, student should start an exam to create blocking scenario
        if "test_student" not in self.tokens:
            self.log_test("Parent Blocked Test - Student Not Logged In", False, "Student must be logged in first")
            return False
            
        try:
            # Try parent login while student is potentially taking exam
            parent_credentials = self.test_users.get("test_parent", {})
            response = requests.post(
                f"{self.base_url}/api/login",
                json=parent_credentials,
                headers={"Content-Type": "application/json"}
            )
            
            # Parent should be blocked (403) if student is taking exam
            if response.status_code == 403:
                success = True
                details = f"Status: {response.status_code}, Parent correctly blocked during active exam"
            elif response.status_code == 200:
                # Check if response indicates blocking
                data = response.json()
                user_info = data.get("user", {})
                detail_text = response.text.lower()
                if "still taking" in detail_text or "exam" in detail_text:
                    success = True
                    details = f"Status: {response.status_code}, Parent login blocked due to active exam"
                else:
                    success = False
                    details = f"Status: {response.status_code}, Parent should be blocked but wasn't"
            else:
                success = response.status_code == 403  # Expecting 403 for blocked
                details = f"Status: {response.status_code}, Error: {response.text}"
                
            self.log_test("Parent Blocked During Exam", success, details)
            return success
        except Exception as e:
            self.log_test("Parent Blocked During Exam", False, f"Error: {str(e)}")
            return False

    def test_start_exam(self, exam_id, user_type="test_student"):
        """Test student can start exam - POST /api/exams/{id}/start"""
        print(f"\n🎯 Testing Student Start Exam...")
        
        if user_type not in self.tokens:
            self.log_test("Start Exam", False, f"No token for {user_type}")
            return False, None
            
        try:
            headers = {
                "Authorization": f"Bearer {self.tokens[user_type]}",
                "Content-Type": "application/json"
            }
            
            response = requests.post(f"{self.base_url}/api/exams/{exam_id}/start", headers=headers)
            success = response.status_code == 200
            
            if success:
                data = response.json()
                attempt = data.get("attempt", {})
                exam_data = data.get("exam", {})
                mcq_questions = exam_data.get('mcq_questions', [])
                attempt_id = attempt.get('id', '')
                details = f"Status: {response.status_code}, Attempt ID: {attempt_id[:8]}..., MCQ Questions: {len(mcq_questions)}"
                return success, attempt_id
            else:
                details = f"Status: {response.status_code}, Error: {response.text}"
                
            self.log_test("Start Exam", success, details)
            return success, None
        except Exception as e:
            self.log_test("Start Exam", False, f"Error: {str(e)}")
            return False, None

    def test_mcq_submission(self, attempt_id, user_type="test_student"):
        """Test student MCQ submission - POST /api/attempts/{id}/submit-mcq"""
        print(f"\n📝 Testing Student MCQ Submission...")
        
        if user_type not in self.tokens:
            self.log_test("MCQ Submission", False, f"No token for {user_type}")
            return False
            
        try:
            headers = {
                "Authorization": f"Bearer {self.tokens[user_type]}",
                "Content-Type": "application/json"
            }
            
            response = requests.post(f"{self.base_url}/api/attempts/{attempt_id}/submit-mcq", headers=headers)
            success = response.status_code == 200
            
            if success:
                data = response.json()
                mcq_score = data.get("mcq_score", 0)
                total_mcq = data.get("total_mcq", 0)
                details = f"Status: {response.status_code}, MCQ Score: {mcq_score}/{total_mcq}, Next: {data.get('next_section', 'N/A')}"
            else:
                details = f"Status: {response.status_code}, Error: {response.text}"
                
            self.log_test("MCQ Submission", success, details)
            return success
        except Exception as e:
            self.log_test("MCQ Submission", False, f"Error: {str(e)}")
            return False

    def test_written_submission(self, attempt_id, user_type="test_student"):
        """Test student Written submission - POST /api/attempts/{id}/submit-written"""
        print(f"\n✏️ Testing Student Written Paper Submission...")
        
        if user_type not in self.tokens:
            self.log_test("Written Submission", False, f"No token for {user_type}")
            return False
            
        try:
            headers = {
                "Authorization": f"Bearer {self.tokens[user_type]}",
                "Content-Type": "application/json"
            }
            
            response = requests.post(f"{self.base_url}/api/attempts/{attempt_id}/submit-written", headers=headers)
            success = response.status_code == 200
            
            if success:
                data = response.json()
                window_info = data.get("parent_upload_window", {})
                window_duration = window_info.get('duration_minutes', 0)
                details = f"Status: {response.status_code}, Parent upload window: {window_duration} minutes"
            else:
                details = f"Status: {response.status_code}, Error: {response.text}"
                
            self.log_test("Written Submission", success, details)
            return success
        except Exception as e:
            self.log_test("Written Submission", False, f"Error: {str(e)}")
            return False

    def test_parent_login_after_exam(self):
        """Test parent CAN login AFTER student finishes exam"""
        print(f"\n✅ Testing Parent Can Login After Student Completes Exam...")
        
        try:
            parent_credentials = self.test_users.get("test_parent", {})
            response = requests.post(
                f"{self.base_url}/api/login",
                json=parent_credentials,
                headers={"Content-Type": "application/json"}
            )
            
            success = response.status_code == 200
            
            if success:
                data = response.json()
                user_info = data.get("user", {})
                upload_status = user_info.get("upload_window_status", "unknown")
                self.tokens["test_parent"] = data.get("access_token")
                details = f"Status: {response.status_code}, Upload Status: {upload_status}"
            else:
                details = f"Status: {response.status_code}, Error: {response.text}"
                
            self.log_test("Parent Can Login After Exam", success, details)
            return success
        except Exception as e:
            self.log_test("Parent Can Login After Exam", False, f"Error: {str(e)}")
            return False

    def test_parent_upload_status(self, student_id="test_student_id"):
        """Test parent upload status shows window - GET /api/parent/upload-status/{id}"""
        print(f"\n📤 Testing Parent Upload Status Window...")
        
        if "test_parent" not in self.tokens:
            self.log_test("Parent Upload Status", False, "Parent not logged in")
            return False
            
        try:
            headers = {
                "Authorization": f"Bearer {self.tokens['test_parent']}",
                "Content-Type": "application/json"
            }
            
            response = requests.get(f"{self.base_url}/api/parent/upload-status/{student_id}", headers=headers)
            success = response.status_code == 200
            
            if success:
                data = response.json()
                upload_available = data.get("upload_available", False)
                remaining_seconds = data.get("remaining_seconds", 0)
                message = data.get("message", "")
                details = f"Status: {response.status_code}, Upload Available: {upload_available}, Remaining: {remaining_seconds}s"
            else:
                details = f"Status: {response.status_code}, Error: {response.text}"
                
            self.log_test("Parent Upload Status", success, details)
            return success
        except Exception as e:
            self.log_test("Parent Upload Status", False, f"Error: {str(e)}")
            return False

    def test_sample_exam_60_mcq(self):
        """Test sample exam has 60 MCQ questions"""
        print(f"\n🔢 Testing Sample Exam Has 60 MCQ Questions...")
        
        try:
            # Get Grade 5 exams first
            response = requests.get(f"{self.base_url}/api/exams?grade=grade_5&status=published")
            if response.status_code != 200:
                self.log_test("Sample Exam 60 MCQ", False, f"Could not fetch exams: {response.status_code}")
                return False
            
            exams_data = response.json()
            exams = exams_data.get("exams", [])
            
            if not exams:
                self.log_test("Sample Exam 60 MCQ", False, "No Grade 5 exams found")
                return False
            
            # Test the first exam
            exam = exams[0]
            exam_id = exam.get("id")
            
            # Get detailed exam info
            exam_response = requests.get(f"{self.base_url}/api/exams/{exam_id}")
            if exam_response.status_code != 200:
                self.log_test("Sample Exam 60 MCQ", False, f"Could not fetch exam details: {exam_response.status_code}")
                return False
            
            exam_data = exam_response.json()
            mcq_questions = exam_data.get("mcq_questions", [])
            has_60_questions = len(mcq_questions) == 60
            
            details = f"MCQ Questions Found: {len(mcq_questions)}/60, Title: {exam_data.get('title', 'N/A')}"
            self.log_test("Sample Exam Has 60 MCQ", has_60_questions, details)
            
            return has_60_questions, exam_id if has_60_questions else None
        except Exception as e:
            self.log_test("Sample Exam 60 MCQ", False, f"Error: {str(e)}")
            return False, None

    def run_comprehensive_test(self):
        """Run all backend API tests based on review request"""
        print("=" * 70)
        print("🧪 GRADE 5 SCHOLARSHIP PLATFORM - COMPREHENSIVE API TESTING")
        print("=" * 70)
        
        # Test 1: Backend API health check - GET /api/
        health_ok = self.test_health_check()
        if not health_ok:
            print("\n❌ API is not responding. Aborting remaining tests.")
            return False
        
        # Test 2: Student-Parent registration - POST /api/register-student-parent
        registration_ok = self.test_student_parent_registration()
        
        # Test 3: Student login - POST /api/login
        student_login_ok = self.test_login("test_student")
        
        # Test 4: Sample exam has 60 MCQ questions
        mcq_60_ok, exam_id = self.test_sample_exam_60_mcq()
        
        # Test 5: Student can start exam - POST /api/exams/{id}/start
        attempt_id = None
        if student_login_ok and exam_id:
            start_ok, attempt_id = self.test_start_exam(exam_id)
        
        # Test 6: Parent BLOCKED from login while student taking exam
        if student_login_ok:
            self.test_parent_blocked_during_exam()
        
        # Test 7: Student MCQ submission - POST /api/attempts/{id}/submit-mcq
        if attempt_id:
            mcq_submit_ok = self.test_mcq_submission(attempt_id)
        
        # Test 8: Student Written submission - POST /api/attempts/{id}/submit-written  
        if attempt_id:
            written_submit_ok = self.test_written_submission(attempt_id)
        
        # Test 9: Parent can login AFTER student finishes exam
        parent_login_ok = self.test_parent_login_after_exam()
        
        # Test 10: Parent upload status shows window - GET /api/parent/upload-status/{id}
        if parent_login_ok:
            self.test_parent_upload_status()
        
        # Test 11: Admin and Marker login
        admin_login_ok = self.test_login("admin")
        marker_login_ok = self.test_login("marker")
        
        # Final Results
        print("\n" + "=" * 70)
        print("🏁 COMPREHENSIVE TEST SUMMARY")
        print("=" * 70)
        print(f"Total Tests: {self.tests_run}")
        print(f"Passed: {self.tests_passed}")
        print(f"Failed: {self.tests_run - self.tests_passed}")
        print(f"Success Rate: {(self.tests_passed/self.tests_run*100):.1f}%" if self.tests_run > 0 else "0%")
        
        # Critical Issues Report
        critical_issues = []
        if not health_ok:
            critical_issues.append("Backend API Health Check Failed")
        if not student_login_ok:
            critical_issues.append("Student Login Failed")
        if not mcq_60_ok:
            critical_issues.append("Sample Exam Missing 60 MCQ Questions")
        if not registration_ok:
            critical_issues.append("Student-Parent Registration Failed")
            
        if critical_issues:
            print(f"\n🚨 CRITICAL ISSUES FOUND:")
            for issue in critical_issues:
                print(f"   • {issue}")
        else:
            print(f"\n✅ NO CRITICAL BACKEND ISSUES FOUND!")
        
        return len(critical_issues) == 0

def main():
    """Run the backend test suite"""
    tester = ExamPlatformTester()
    
    try:
        success = tester.run_comprehensive_test()
        return 0 if success else 1
    except KeyboardInterrupt:
        print("\n\n⚠️  Tests interrupted by user")
        return 1
    except Exception as e:
        print(f"\n💥 Unexpected error: {e}")
        return 1

if __name__ == "__main__":
    sys.exit(main())