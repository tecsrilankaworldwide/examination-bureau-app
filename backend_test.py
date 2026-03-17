#!/usr/bin/env python3
"""
Grade 5 Scholarship Examination Platform - Backend API Testing
Tests all user roles, grade-specific exams, and core functionality
"""

import requests
import json
import sys
from datetime import datetime

class ExamPlatformTester:
    def __init__(self, base_url="http://localhost:8001"):
        self.base_url = base_url
        self.tokens = {}  # Store tokens for different user types
        self.tests_run = 0
        self.tests_passed = 0
        
        # Test credentials from review request
        self.test_users = {
            "student": {"email": "student@test.com", "password": "student123"},
            "teacher": {"email": "teacher@test.com", "password": "teacher123"},
            "parent": {"email": "parent@test.com", "password": "parent123"},
            "admin": {"email": "admin@test.com", "password": "admin123"}
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
        print("\n🔍 Testing API Health Check...")
        try:
            response = requests.get(f"{self.base_url}/api/")
            success = response.status_code == 200
            
            if success:
                data = response.json()
                details = f"Status: {response.status_code}, Message: {data.get('message', '')}"
            else:
                details = f"Status: {response.status_code}"
                
            self.log_test("API Health Check", success, details)
            return success
        except Exception as e:
            self.log_test("API Health Check", False, f"Error: {str(e)}")
            return False

    def test_login(self, user_type):
        """Test login for specific user type"""
        print(f"\n🔑 Testing {user_type.capitalize()} Login...")
        
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
                    details = f"Status: {response.status_code}, Role: {user_info.get('role')}, Name: {user_info.get('full_name')}"
                else:
                    success = False
                    details = "No access token received"
            else:
                details = f"Status: {response.status_code}, Error: {response.text}"
                
            self.log_test(f"{user_type.capitalize()} Login", success, details)
            return success
        except Exception as e:
            self.log_test(f"{user_type.capitalize()} Login", False, f"Error: {str(e)}")
            return False

    def test_get_exams_by_grade(self, grade):
        """Test getting exams for specific grade"""
        print(f"\n📚 Testing Get Exams for {grade.upper()}...")
        
        try:
            response = requests.get(f"{self.base_url}/api/exams?grade={grade}&status=published")
            success = response.status_code == 200
            
            if success:
                data = response.json()
                exams = data.get("exams", [])
                grade_exams = [exam for exam in exams if exam.get("grade") == grade]
                details = f"Status: {response.status_code}, Found {len(grade_exams)} exams for {grade}"
            else:
                details = f"Status: {response.status_code}, Error: {response.text}"
                
            self.log_test(f"Get {grade.upper()} Exams", success, details)
            return success, exams if success else []
        except Exception as e:
            self.log_test(f"Get {grade.upper()} Exams", False, f"Error: {str(e)}")
            return False, []

    def test_start_exam(self, exam_id, user_type="student"):
        """Test starting an exam as student"""
        print(f"\n🎯 Testing Start Exam ({exam_id[:8]}...)...")
        
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
                details = f"Status: {response.status_code}, Attempt ID: {attempt.get('id', '')[:8]}..., Questions: {len(exam_data.get('questions', []))}"
                return success, attempt.get("id")
            else:
                details = f"Status: {response.status_code}, Error: {response.text}"
                
            self.log_test("Start Exam", success, details)
            return success, None
        except Exception as e:
            self.log_test("Start Exam", False, f"Error: {str(e)}")
            return False, None

    def test_student_progress(self, student_id, user_type="student"):
        """Test getting student progress"""
        print(f"\n📊 Testing Student Progress ({student_id[:8]}...)...")
        
        if user_type not in self.tokens:
            self.log_test("Student Progress", False, f"No token for {user_type}")
            return False
            
        try:
            headers = {
                "Authorization": f"Bearer {self.tokens[user_type]}",
                "Content-Type": "application/json"
            }
            
            response = requests.get(f"{self.base_url}/api/students/{student_id}/progress", headers=headers)
            success = response.status_code == 200
            
            if success:
                data = response.json()
                monthly_progress = data.get("monthly_progress", [])
                total_exams = data.get("total_exams_taken", 0)
                details = f"Status: {response.status_code}, Monthly records: {len(monthly_progress)}, Total exams: {total_exams}"
            else:
                details = f"Status: {response.status_code}, Error: {response.text}"
                
            self.log_test("Student Progress", success, details)
            return success
        except Exception as e:
            self.log_test("Student Progress", False, f"Error: {str(e)}")
            return False

    def run_comprehensive_test(self):
        """Run all backend API tests"""
        print("=" * 60)
        print("🧪 GRADE 5 SCHOLARSHIP PLATFORM - API TESTING")
        print("=" * 60)
        
        # Test 1: API Health Check
        health_ok = self.test_health_check()
        if not health_ok:
            print("\n❌ API is not responding. Aborting tests.")
            return False
            
        # Test 2: Login Tests for All User Roles
        login_results = {}
        for user_type in ["student", "teacher", "parent", "admin"]:
            login_results[user_type] = self.test_login(user_type)
        
        # Test 3: Exam Listing for All Grades
        grades = ["grade_2", "grade_3", "grade_4", "grade_5"]
        exam_results = {}
        for grade in grades:
            success, exams = self.test_get_exams_by_grade(grade)
            exam_results[grade] = (success, exams)
        
        # Test 4: Student-specific tests (if student login successful)
        if login_results.get("student"):
            # Try to start an exam if any Grade 5 exams exist
            grade_5_success, grade_5_exams = exam_results.get("grade_5", (False, []))
            if grade_5_success and grade_5_exams:
                exam_id = grade_5_exams[0].get("id")
                if exam_id:
                    start_success, attempt_id = self.test_start_exam(exam_id, "student")
            
            # Test student progress
            self.test_student_progress("student_g5_001", "student")
        
        # Test 5: Parent Progress Tracking (if parent login successful)
        if login_results.get("parent"):
            self.test_student_progress("student_g5_001", "parent")
        
        # Final Results
        print("\n" + "=" * 60)
        print("🏁 TEST SUMMARY")
        print("=" * 60)
        print(f"Total Tests: {self.tests_run}")
        print(f"Passed: {self.tests_passed}")
        print(f"Failed: {self.tests_run - self.tests_passed}")
        print(f"Success Rate: {(self.tests_passed/self.tests_run*100):.1f}%" if self.tests_run > 0 else "0%")
        
        # Critical Issues Report
        critical_issues = []
        if not health_ok:
            critical_issues.append("API Health Check Failed")
        if not any(login_results.values()):
            critical_issues.append("All Login Tests Failed")
        if not any(success for success, _ in exam_results.values()):
            critical_issues.append("All Grade Exam Queries Failed")
            
        if critical_issues:
            print(f"\n🚨 CRITICAL ISSUES:")
            for issue in critical_issues:
                print(f"   • {issue}")
        else:
            print(f"\n✅ No critical issues found!")
        
        return self.tests_passed == self.tests_run

def main():
    """Run the test suite"""
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