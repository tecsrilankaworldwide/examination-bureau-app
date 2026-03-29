#!/usr/bin/env python3
"""
Backend API Testing for Grade 5 Scholarship Examination Platform
Tests all critical API endpoints and authentication flows
"""

import requests
import sys
import json
from datetime import datetime

class ExamBureauAPITester:
    def __init__(self, base_url="https://exam-bureau-3.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.admin_token = None
        self.marker_token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name}")
        else:
            print(f"❌ {name} - {details}")
            self.failed_tests.append({"test": name, "error": details})

    def test_api_health(self):
        """Test API health check endpoint"""
        try:
            response = requests.get(f"{self.base_url}/", timeout=10)
            success = response.status_code == 200
            if success:
                data = response.json()
                expected_fields = ["message", "version", "status", "features"]
                has_fields = all(field in data for field in expected_fields)
                success = has_fields and data.get("status") == "operational"
                details = f"Status: {response.status_code}, Data: {data}" if success else f"Missing fields or wrong status: {data}"
            else:
                details = f"Status: {response.status_code}, Response: {response.text[:200]}"
            
            self.log_test("API Health Check", success, details)
            return success
        except Exception as e:
            self.log_test("API Health Check", False, f"Exception: {str(e)}")
            return False

    def test_admin_login(self):
        """Test admin login with provided credentials"""
        try:
            login_data = {
                "email": "admin@exam.lk",
                "password": "admin123"
            }
            response = requests.post(f"{self.base_url}/login", json=login_data, timeout=10)
            success = response.status_code == 200
            
            if success:
                data = response.json()
                required_fields = ["access_token", "token_type", "user"]
                has_fields = all(field in data for field in required_fields)
                
                if has_fields:
                    self.admin_token = data["access_token"]
                    user_data = data["user"]
                    is_admin = user_data.get("role") == "admin"
                    success = is_admin
                    details = f"Admin user: {user_data.get('full_name')}, Role: {user_data.get('role')}"
                else:
                    success = False
                    details = f"Missing required fields in response: {data}"
            else:
                details = f"Status: {response.status_code}, Response: {response.text[:200]}"
            
            self.log_test("Admin Login", success, details)
            return success
        except Exception as e:
            self.log_test("Admin Login", False, f"Exception: {str(e)}")
            return False

    def test_marker_login(self):
        """Test marker login with provided credentials"""
        try:
            login_data = {
                "email": "marker@exam.lk",
                "password": "marker123"
            }
            response = requests.post(f"{self.base_url}/login", json=login_data, timeout=10)
            success = response.status_code == 200
            
            if success:
                data = response.json()
                required_fields = ["access_token", "token_type", "user"]
                has_fields = all(field in data for field in required_fields)
                
                if has_fields:
                    self.marker_token = data["access_token"]
                    user_data = data["user"]
                    is_marker = user_data.get("role") == "marker"
                    success = is_marker
                    details = f"Marker user: {user_data.get('full_name')}, Role: {user_data.get('role')}"
                else:
                    success = False
                    details = f"Missing required fields in response: {data}"
            else:
                details = f"Status: {response.status_code}, Response: {response.text[:200]}"
            
            self.log_test("Marker Login", success, details)
            return success
        except Exception as e:
            self.log_test("Marker Login", False, f"Exception: {str(e)}")
            return False

    def test_admin_statistics(self):
        """Test admin dashboard statistics endpoint"""
        if not self.admin_token:
            self.log_test("Admin Statistics", False, "No admin token available")
            return False
        
        try:
            headers = {"Authorization": f"Bearer {self.admin_token}"}
            response = requests.get(f"{self.base_url}/admin/statistics", headers=headers, timeout=10)
            success = response.status_code == 200
            
            if success:
                data = response.json()
                expected_fields = [
                    "total_students", "total_parents", "total_markers", "total_exams",
                    "total_attempts", "pending_marking", "completed_exams", "total_batches"
                ]
                has_fields = all(field in data for field in expected_fields)
                success = has_fields
                details = f"Stats: {data}" if success else f"Missing fields in response: {data}"
            else:
                details = f"Status: {response.status_code}, Response: {response.text[:200]}"
            
            self.log_test("Admin Statistics", success, details)
            return success
        except Exception as e:
            self.log_test("Admin Statistics", False, f"Exception: {str(e)}")
            return False

    def test_exams_list(self):
        """Test exams list endpoint"""
        try:
            response = requests.get(f"{self.base_url}/exams", timeout=10)
            success = response.status_code == 200
            
            if success:
                data = response.json()
                has_exams_field = "exams" in data
                if has_exams_field:
                    exams = data["exams"]
                    exam_count = len(exams)
                    # Check if sample exam exists
                    sample_exam_exists = any(
                        "January 2026 - Grade 5 Practice Exam" in exam.get("title", "")
                        for exam in exams
                    )
                    success = exam_count > 0 and sample_exam_exists
                    details = f"Found {exam_count} exams, Sample exam exists: {sample_exam_exists}"
                else:
                    success = False
                    details = f"Missing 'exams' field in response: {data}"
            else:
                details = f"Status: {response.status_code}, Response: {response.text[:200]}"
            
            self.log_test("Exams List", success, details)
            return success
        except Exception as e:
            self.log_test("Exams List", False, f"Exception: {str(e)}")
            return False

    def test_invalid_login(self):
        """Test login with invalid credentials"""
        try:
            login_data = {
                "email": "invalid@test.com",
                "password": "wrongpassword"
            }
            response = requests.post(f"{self.base_url}/login", json=login_data, timeout=10)
            success = response.status_code == 401
            details = f"Status: {response.status_code} (expected 401)"
            
            self.log_test("Invalid Login Rejection", success, details)
            return success
        except Exception as e:
            self.log_test("Invalid Login Rejection", False, f"Exception: {str(e)}")
            return False

    def test_unauthorized_access(self):
        """Test accessing protected endpoint without token"""
        try:
            response = requests.get(f"{self.base_url}/admin/statistics", timeout=10)
            success = response.status_code == 403  # Should be forbidden without auth
            details = f"Status: {response.status_code} (expected 403)"
            
            self.log_test("Unauthorized Access Protection", success, details)
            return success
        except Exception as e:
            self.log_test("Unauthorized Access Protection", False, f"Exception: {str(e)}")
            return False

    def test_users_list_admin(self):
        """Test admin users list endpoint"""
        if not self.admin_token:
            self.log_test("Admin Users List", False, "No admin token available")
            return False
        
        try:
            headers = {"Authorization": f"Bearer {self.admin_token}"}
            response = requests.get(f"{self.base_url}/admin/users", headers=headers, timeout=10)
            success = response.status_code == 200
            
            if success:
                data = response.json()
                has_users_field = "users" in data
                if has_users_field:
                    users = data["users"]
                    user_count = len(users)
                    # Check if admin and marker users exist
                    admin_exists = any(user.get("email") == "admin@exam.lk" for user in users)
                    marker_exists = any(user.get("email") == "marker@exam.lk" for user in users)
                    success = user_count >= 2 and admin_exists and marker_exists
                    details = f"Found {user_count} users, Admin exists: {admin_exists}, Marker exists: {marker_exists}"
                else:
                    success = False
                    details = f"Missing 'users' field in response: {data}"
            else:
                details = f"Status: {response.status_code}, Response: {response.text[:200]}"
            
            self.log_test("Admin Users List", success, details)
            return success
        except Exception as e:
            self.log_test("Admin Users List", False, f"Exception: {str(e)}")
            return False

    def run_all_tests(self):
        """Run all backend API tests"""
        print("🚀 Starting Grade 5 Scholarship Examination Platform Backend Tests")
        print(f"📡 Testing API at: {self.base_url}")
        print("=" * 70)
        
        # Core API tests
        self.test_api_health()
        
        # Authentication tests
        self.test_admin_login()
        self.test_marker_login()
        self.test_invalid_login()
        self.test_unauthorized_access()
        
        # Admin functionality tests
        self.test_admin_statistics()
        self.test_users_list_admin()
        
        # Public endpoint tests
        self.test_exams_list()
        
        # Print summary
        print("=" * 70)
        print(f"📊 Test Results: {self.tests_passed}/{self.tests_run} passed")
        
        if self.failed_tests:
            print("\n❌ Failed Tests:")
            for failed in self.failed_tests:
                print(f"  - {failed['test']}: {failed['error']}")
        
        success_rate = (self.tests_passed / self.tests_run) * 100 if self.tests_run > 0 else 0
        print(f"✨ Success Rate: {success_rate:.1f}%")
        
        return self.tests_passed == self.tests_run

def main():
    """Main test execution"""
    tester = ExamBureauAPITester()
    success = tester.run_all_tests()
    
    # Return appropriate exit code
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())