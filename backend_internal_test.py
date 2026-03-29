#!/usr/bin/env python3
"""
Grade 5 Scholarship Examination Platform - Internal Backend API Testing
Tests all backend functionality using internal localhost:8001
"""

import requests
import json
import sys
from datetime import datetime

class InternalExamTester:
    def __init__(self, base_url="http://localhost:8001"):
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

    def test_sample_exam_60_mcq(self):
        """Test sample exam has 60 MCQ questions"""
        print(f"\n🔢 Testing Sample Exam Has 60 MCQ Questions...")
        
        try:
            # Get Grade 5 exams first
            response = requests.get(f"{self.base_url}/api/exams?grade=grade_5&status=published")
            if response.status_code != 200:
                self.log_test("Sample Exam 60 MCQ", False, f"Could not fetch exams: {response.status_code}")
                return False, None
            
            exams_data = response.json()
            exams = exams_data.get("exams", [])
            
            if not exams:
                self.log_test("Sample Exam 60 MCQ", False, "No Grade 5 exams found")
                return False, None
            
            # Test the first exam
            exam = exams[0]
            exam_id = exam.get("id")
            
            # Get detailed exam info
            exam_response = requests.get(f"{self.base_url}/api/exams/{exam_id}")
            if exam_response.status_code != 200:
                self.log_test("Sample Exam 60 MCQ", False, f"Could not fetch exam details: {exam_response.status_code}")
                return False, None
            
            exam_data = exam_response.json()
            mcq_questions = exam_data.get("mcq_questions", [])
            has_60_questions = len(mcq_questions) == 60
            
            details = f"MCQ Questions Found: {len(mcq_questions)}/60, Title: {exam_data.get('title', 'N/A')}"
            self.log_test("Sample Exam Has 60 MCQ", has_60_questions, details)
            
            return has_60_questions, exam_id if has_60_questions else None
        except Exception as e:
            self.log_test("Sample Exam 60 MCQ", False, f"Error: {str(e)}")
            return False, None

    def run_internal_backend_test(self):
        """Run backend tests on internal localhost"""
        print("=" * 70)
        print("🧪 INTERNAL BACKEND API TESTING (localhost:8001)")
        print("=" * 70)
        
        # Test 1: Backend API health check
        health_ok = self.test_health_check()
        
        # Test 2: Student-Parent registration
        registration_ok = self.test_student_parent_registration()
        
        # Test 3: User logins
        admin_login_ok = self.test_login("admin")
        marker_login_ok = self.test_login("marker")
        
        # Test 4: Sample exam MCQ count
        mcq_60_ok, exam_id = self.test_sample_exam_60_mcq()
        
        # Final Results
        print("\n" + "=" * 70)
        print("🏁 INTERNAL BACKEND TEST SUMMARY")
        print("=" * 70)
        print(f"Total Tests: {self.tests_run}")
        print(f"Passed: {self.tests_passed}")
        print(f"Failed: {self.tests_run - self.tests_passed}")
        print(f"Success Rate: {(self.tests_passed/self.tests_run*100):.1f}%" if self.tests_run > 0 else "0%")
        
        # Critical Issues Report
        critical_issues = []
        if not health_ok:
            critical_issues.append("Backend API Health Check Failed")
        if not admin_login_ok:
            critical_issues.append("Admin Login Failed")
        if not mcq_60_ok:
            critical_issues.append("Sample Exam Missing 60 MCQ Questions")
            
        if critical_issues:
            print(f"\n🚨 CRITICAL INTERNAL ISSUES:")
            for issue in critical_issues:
                print(f"   • {issue}")
        else:
            print(f"\n✅ INTERNAL BACKEND WORKS PERFECTLY!")
        
        return len(critical_issues) == 0

def main():
    """Run the internal backend test"""
    tester = InternalExamTester()
    
    try:
        success = tester.run_internal_backend_test()
        return 0 if success else 1
    except KeyboardInterrupt:
        print("\n\n⚠️  Tests interrupted by user")
        return 1
    except Exception as e:
        print(f"\n💥 Unexpected error: {e}")
        return 1

if __name__ == "__main__":
    sys.exit(main())