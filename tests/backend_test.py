import requests
import sys
from datetime import datetime

class ExamBureauAPITester:
    def __init__(self, base_url="https://assessment-hub-36.preview.emergentagent.com"):
        self.base_url = base_url
        self.tokens = {}
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_result(self, test_name, passed, message=""):
        """Log test result"""
        self.tests_run += 1
        if passed:
            self.tests_passed += 1
            status = "✅ PASSED"
        else:
            status = "❌ FAILED"
        
        result = f"{status} - {test_name}"
        if message:
            result += f": {message}"
        
        print(result)
        self.test_results.append({
            "test": test_name,
            "passed": passed,
            "message": message
        })
        return passed

    def test_health_check(self):
        """Test health check endpoint"""
        print("\n🔍 Testing Health Check...")
        try:
            response = requests.get(f"{self.base_url}/api/health", timeout=10)
            if response.status_code == 200:
                data = response.json()
                if data.get("status") == "healthy" and data.get("database") == "connected":
                    return self.log_result("Health Check", True, "API and Database are healthy")
                else:
                    return self.log_result("Health Check", False, f"Unhealthy status: {data}")
            else:
                return self.log_result("Health Check", False, f"Status code: {response.status_code}")
        except Exception as e:
            return self.log_result("Health Check", False, f"Error: {str(e)}")

    def test_login(self, email, password, role_name):
        """Test login and store token"""
        print(f"\n🔍 Testing {role_name} Login...")
        try:
            response = requests.post(
                f"{self.base_url}/api/login",
                json={"email": email, "password": password},
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if "access_token" in data and "user" in data:
                    self.tokens[role_name] = data["access_token"]
                    user = data["user"]
                    return self.log_result(
                        f"{role_name} Login",
                        True,
                        f"User: {user.get('name')}, Role: {user.get('role')}"
                    )
                else:
                    return self.log_result(f"{role_name} Login", False, "Missing token or user in response")
            else:
                return self.log_result(
                    f"{role_name} Login",
                    False,
                    f"Status: {response.status_code}, Response: {response.text[:200]}"
                )
        except Exception as e:
            return self.log_result(f"{role_name} Login", False, f"Error: {str(e)}")

    def test_get_me(self, role_name):
        """Test get current user endpoint"""
        print(f"\n🔍 Testing Get Current User ({role_name})...")
        try:
            if role_name not in self.tokens:
                return self.log_result(f"Get Me ({role_name})", False, "No token available")
            
            headers = {"Authorization": f"Bearer {self.tokens[role_name]}"}
            response = requests.get(f"{self.base_url}/api/me", headers=headers, timeout=10)
            
            if response.status_code == 200:
                user = response.json()
                return self.log_result(
                    f"Get Me ({role_name})",
                    True,
                    f"User: {user.get('name')}, Email: {user.get('email')}"
                )
            else:
                return self.log_result(
                    f"Get Me ({role_name})",
                    False,
                    f"Status: {response.status_code}"
                )
        except Exception as e:
            return self.log_result(f"Get Me ({role_name})", False, f"Error: {str(e)}")

    def test_list_exams(self):
        """Test list exams endpoint (Student)"""
        print("\n🔍 Testing List Exams (Student)...")
        try:
            if "Student" not in self.tokens:
                return self.log_result("List Exams", False, "No student token available")
            
            headers = {"Authorization": f"Bearer {self.tokens['Student']}"}
            response = requests.get(f"{self.base_url}/api/exams", headers=headers, timeout=10)
            
            if response.status_code == 200:
                exams = response.json()
                return self.log_result(
                    "List Exams",
                    True,
                    f"Found {len(exams)} exams"
                )
            else:
                return self.log_result("List Exams", False, f"Status: {response.status_code}")
        except Exception as e:
            return self.log_result("List Exams", False, f"Error: {str(e)}")

    def test_start_exam(self):
        """Test start exam endpoint"""
        print("\n🔍 Testing Start Exam...")
        try:
            if "Student" not in self.tokens:
                return self.log_result("Start Exam", False, "No student token available")
            
            # First get available exams
            headers = {"Authorization": f"Bearer {self.tokens['Student']}"}
            exams_response = requests.get(f"{self.base_url}/api/exams", headers=headers, timeout=10)
            
            if exams_response.status_code != 200:
                return self.log_result("Start Exam", False, "Failed to get exams list")
            
            exams = exams_response.json()
            if not exams:
                return self.log_result("Start Exam", False, "No exams available")
            
            exam_id = exams[0]["id"]
            
            # Try to start the exam
            response = requests.post(
                f"{self.base_url}/api/exams/{exam_id}/start",
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if "attempt" in data and "exam" in data:
                    self.current_exam_id = exam_id
                    self.current_attempt = data["attempt"]
                    return self.log_result(
                        "Start Exam",
                        True,
                        f"Exam started/resumed: {data['exam'].get('title')}"
                    )
                else:
                    return self.log_result("Start Exam", False, "Missing attempt or exam in response")
            elif response.status_code == 400:
                # Exam already completed
                return self.log_result(
                    "Start Exam",
                    True,
                    "Exam already completed (expected for test data)"
                )
            else:
                return self.log_result("Start Exam", False, f"Status: {response.status_code}")
        except Exception as e:
            return self.log_result("Start Exam", False, f"Error: {str(e)}")

    def test_student_progress(self):
        """Test student progress endpoint"""
        print("\n🔍 Testing Student Progress...")
        try:
            if "Student" not in self.tokens:
                return self.log_result("Student Progress", False, "No student token available")
            
            # Get current user to get student_id
            headers = {"Authorization": f"Bearer {self.tokens['Student']}"}
            me_response = requests.get(f"{self.base_url}/api/me", headers=headers, timeout=10)
            
            if me_response.status_code != 200:
                return self.log_result("Student Progress", False, "Failed to get current user")
            
            user = me_response.json()
            student_id = user.get("id")
            
            # Get progress
            response = requests.get(
                f"{self.base_url}/api/students/{student_id}/progress",
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                progress = response.json()
                return self.log_result(
                    "Student Progress",
                    True,
                    f"Total exams: {progress.get('total_exams')}, Avg score: {progress.get('average_score')}%"
                )
            else:
                return self.log_result("Student Progress", False, f"Status: {response.status_code}")
        except Exception as e:
            return self.log_result("Student Progress", False, f"Error: {str(e)}")

    def test_admin_users_list(self):
        """Test admin users list endpoint"""
        print("\n🔍 Testing Admin Users List...")
        try:
            if "Admin" not in self.tokens:
                return self.log_result("Admin Users List", False, "No admin token available")
            
            headers = {"Authorization": f"Bearer {self.tokens['Admin']}"}
            response = requests.get(f"{self.base_url}/api/admin/users", headers=headers, timeout=10)
            
            if response.status_code == 200:
                users = response.json()
                return self.log_result(
                    "Admin Users List",
                    True,
                    f"Found {len(users)} users"
                )
            else:
                return self.log_result("Admin Users List", False, f"Status: {response.status_code}")
        except Exception as e:
            return self.log_result("Admin Users List", False, f"Error: {str(e)}")

    def test_teacher_submissions(self):
        """Test teacher paper2 submissions endpoint"""
        print("\n🔍 Testing Teacher Submissions List...")
        try:
            if "Teacher" not in self.tokens:
                return self.log_result("Teacher Submissions", False, "No teacher token available")
            
            headers = {"Authorization": f"Bearer {self.tokens['Teacher']}"}
            response = requests.get(
                f"{self.base_url}/api/teacher/paper2/submissions",
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                submissions = response.json()
                return self.log_result(
                    "Teacher Submissions",
                    True,
                    f"Found {len(submissions)} submissions"
                )
            else:
                return self.log_result("Teacher Submissions", False, f"Status: {response.status_code}")
        except Exception as e:
            return self.log_result("Teacher Submissions", False, f"Error: {str(e)}")

    def test_parent_progress(self):
        """Test parent viewing student progress"""
        print("\n🔍 Testing Parent Progress View...")
        try:
            if "Parent" not in self.tokens:
                return self.log_result("Parent Progress", False, "No parent token available")
            
            # Get current parent user to get student_id
            headers = {"Authorization": f"Bearer {self.tokens['Parent']}"}
            me_response = requests.get(f"{self.base_url}/api/me", headers=headers, timeout=10)
            
            if me_response.status_code != 200:
                return self.log_result("Parent Progress", False, "Failed to get current user")
            
            user = me_response.json()
            student_id = user.get("student_id")
            
            if not student_id:
                return self.log_result("Parent Progress", False, "No student_id linked to parent")
            
            # Get student progress
            response = requests.get(
                f"{self.base_url}/api/students/{student_id}/progress",
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                progress = response.json()
                return self.log_result(
                    "Parent Progress",
                    True,
                    f"Student exams: {progress.get('total_exams')}, Avg: {progress.get('average_score')}%"
                )
            else:
                return self.log_result("Parent Progress", False, f"Status: {response.status_code}")
        except Exception as e:
            return self.log_result("Parent Progress", False, f"Error: {str(e)}")

    def print_summary(self):
        """Print test summary"""
        print("\n" + "="*60)
        print("📊 TEST SUMMARY")
        print("="*60)
        print(f"Total Tests: {self.tests_run}")
        print(f"Passed: {self.tests_passed}")
        print(f"Failed: {self.tests_run - self.tests_passed}")
        print(f"Success Rate: {(self.tests_passed/self.tests_run*100):.1f}%")
        print("="*60)
        
        if self.tests_passed < self.tests_run:
            print("\n❌ FAILED TESTS:")
            for result in self.test_results:
                if not result["passed"]:
                    print(f"  - {result['test']}: {result['message']}")
        
        return 0 if self.tests_passed == self.tests_run else 1


def main():
    print("="*60)
    print("🇱🇰 EXAMINATION EVALUATION BUREAU - API TESTING")
    print("="*60)
    
    tester = ExamBureauAPITester()
    
    # Test credentials
    credentials = {
        "Admin": ("admin@exambureau.com", "admin123"),
        "Teacher": ("teacher@exambureau.com", "teacher123"),
        "Student": ("student4@test.com", "student423"),
        "Parent": ("parent4@test.com", "parent423")
    }
    
    # Run tests
    print("\n🚀 Starting API Tests...\n")
    
    # 1. Health Check
    tester.test_health_check()
    
    # 2. Authentication Tests
    print("\n" + "="*60)
    print("AUTHENTICATION TESTS")
    print("="*60)
    for role, (email, password) in credentials.items():
        tester.test_login(email, password, role)
    
    # 3. Get Me Tests
    print("\n" + "="*60)
    print("USER INFO TESTS")
    print("="*60)
    for role in credentials.keys():
        tester.test_get_me(role)
    
    # 4. Student Flow Tests
    print("\n" + "="*60)
    print("STUDENT FLOW TESTS")
    print("="*60)
    tester.test_list_exams()
    tester.test_start_exam()
    tester.test_student_progress()
    
    # 5. Admin Tests
    print("\n" + "="*60)
    print("ADMIN TESTS")
    print("="*60)
    tester.test_admin_users_list()
    
    # 6. Teacher Tests
    print("\n" + "="*60)
    print("TEACHER TESTS")
    print("="*60)
    tester.test_teacher_submissions()
    
    # 7. Parent Tests
    print("\n" + "="*60)
    print("PARENT TESTS")
    print("="*60)
    tester.test_parent_progress()
    
    # Print summary
    exit_code = tester.print_summary()
    
    return exit_code


if __name__ == "__main__":
    sys.exit(main())
