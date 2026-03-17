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
    def __init__(self, base_url="https://app-install-hub-1.preview.emergentagent.com"):
        self.base_url = base_url
        self.tokens = {}  # Store tokens for different user types
        self.tests_run = 0
        self.tests_passed = 0
        
        # Test credentials from review request
        self.test_users = {
            "student": {"email": "student1@test.lk", "password": "student123"},
            "parent": {"email": "parent1@test.lk", "password": "parent123"},
            "marker": {"email": "marker@exam.lk", "password": "marker123"},
            "admin": {"email": "admin@exam.lk", "password": "admin123"}
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

    def test_parent_upload_status(self, student_id, user_type="parent"):
        """Test parent upload status check"""
        print(f"\n📤 Testing Parent Upload Status ({student_id})...")
        
        if user_type not in self.tokens:
            self.log_test("Parent Upload Status", False, f"No token for {user_type}")
            return False
            
        try:
            headers = {
                "Authorization": f"Bearer {self.tokens[user_type]}",
                "Content-Type": "application/json"
            }
            
            response = requests.get(f"{self.base_url}/api/parent/upload-status/{student_id}", headers=headers)
            success = response.status_code == 200
            
            if success:
                data = response.json()
                upload_available = data.get("upload_available", False)
                message = data.get("message", "")
                details = f"Status: {response.status_code}, Upload Available: {upload_available}, Message: {message}"
            else:
                details = f"Status: {response.status_code}, Error: {response.text}"
                
            self.log_test("Parent Upload Status", success, details)
            return success
        except Exception as e:
            self.log_test("Parent Upload Status", False, f"Error: {str(e)}")
            return False

    def test_marker_pending_papers(self, user_type="marker"):
        """Test marker pending papers endpoint"""
        print(f"\n✏️ Testing Marker Pending Papers...")
        
        if user_type not in self.tokens:
            self.log_test("Marker Pending Papers", False, f"No token for {user_type}")
            return False
            
        try:
            headers = {
                "Authorization": f"Bearer {self.tokens[user_type]}",
                "Content-Type": "application/json"
            }
            
            response = requests.get(f"{self.base_url}/api/marker/pending-papers", headers=headers)
            success = response.status_code == 200
            
            if success:
                data = response.json()
                papers = data.get("papers", [])
                details = f"Status: {response.status_code}, Pending Papers: {len(papers)}"
            else:
                details = f"Status: {response.status_code}, Error: {response.text}"
                
            self.log_test("Marker Pending Papers", success, details)
            return success
        except Exception as e:
            self.log_test("Marker Pending Papers", False, f"Error: {str(e)}")
            return False

    def test_admin_statistics(self, user_type="admin"):
        """Test admin statistics endpoint"""
        print(f"\n📊 Testing Admin Statistics...")
        
        if user_type not in self.tokens:
            self.log_test("Admin Statistics", False, f"No token for {user_type}")
            return False
            
        try:
            headers = {
                "Authorization": f"Bearer {self.tokens[user_type]}",
                "Content-Type": "application/json"
            }
            
            response = requests.get(f"{self.base_url}/api/admin/statistics", headers=headers)
            success = response.status_code == 200
            
            if success:
                data = response.json()
                total_students = data.get("total_students", 0)
                total_exams = data.get("total_exams", 0)
                details = f"Status: {response.status_code}, Students: {total_students}, Exams: {total_exams}"
            else:
                details = f"Status: {response.status_code}, Error: {response.text}"
                
            self.log_test("Admin Statistics", success, details)
            return success
        except Exception as e:
            self.log_test("Admin Statistics", False, f"Error: {str(e)}")
            return False

    def test_student_parent_registration(self):
        """Test student-parent registration"""
        print(f"\n👨‍👩‍👧 Testing Student-Parent Registration...")
        
        # Use unique email with timestamp to avoid conflicts
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        test_data = {
            "student_name": f"Test Student {timestamp}",
            "student_email": f"test_student_{timestamp}@test.lk",
            "student_password": "student123",
            "parent_name": f"Test Parent {timestamp}",
            "parent_email": f"test_parent_{timestamp}@test.lk", 
            "parent_password": "parent123",
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
                details = f"Status: {response.status_code}, Student ID: {student_id}"
            else:
                details = f"Status: {response.status_code}, Error: {response.text}"
                
            self.log_test("Student-Parent Registration", success, details)
            return success
        except Exception as e:
            self.log_test("Student-Parent Registration", False, f"Error: {str(e)}")
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
        for user_type in ["student", "parent", "marker", "admin"]:
            login_results[user_type] = self.test_login(user_type)
        
        # Test 3: Exam Listing for All Grades
        grades = ["grade_2", "grade_3", "grade_4", "grade_5"]
        exam_results = {}
        for grade in grades:
            success, exams = self.test_get_exams_by_grade(grade)
            exam_results[grade] = (success, exams)
        
        # Test 4: Student-Parent Registration
        self.test_student_parent_registration()
        
        # Test 5: Student-specific tests (if student login successful)
        if login_results.get("student"):
            # Try to start an exam if any Grade 5 exams exist
            grade_5_success, grade_5_exams = exam_results.get("grade_5", (False, []))
            if grade_5_success and grade_5_exams:
                exam_id = grade_5_exams[0].get("id")
                if exam_id:
                    start_success, attempt_id = self.test_start_exam(exam_id, "student")
            
            # Test student progress
            self.test_student_progress("dummy_student_id", "student")
        
        # Test 6: Parent tests (if parent login successful)
        if login_results.get("parent"):
            # Test parent upload status
            self.test_parent_upload_status("dummy_student_id", "parent")
            # Test student progress from parent view
            self.test_student_progress("dummy_student_id", "parent")
        
        # Test 7: Marker tests (if marker login successful)
        if login_results.get("marker"):
            self.test_marker_pending_papers("marker")
        
        # Test 8: Admin tests (if admin login successful)
        if login_results.get("admin"):
            self.test_admin_statistics("admin")
        
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