import requests
import sys
import json
from datetime import datetime
import uuid
import os

class RentWalaAPITester:
    def __init__(self, base_url="https://rentspot-83.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.session_token = None
        self.user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED")
        else:
            print(f"❌ {name} - FAILED: {details}")
        
        self.test_results.append({
            "test": name,
            "success": success,
            "details": details
        })

    def run_test(self, name, method, endpoint, expected_status, data=None, files=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        headers = {}
        
        if self.session_token:
            headers['Authorization'] = f'Bearer {self.session_token}'
        
        if not files:
            headers['Content-Type'] = 'application/json'

        try:
            if method == 'GET':
                response = requests.get(url, headers=headers)
            elif method == 'POST':
                if files:
                    response = requests.post(url, data=data, files=files, headers={'Authorization': headers.get('Authorization', '')})
                else:
                    response = requests.post(url, json=data, headers=headers)
            elif method == 'PUT':
                if files:
                    response = requests.put(url, data=data, files=files, headers={'Authorization': headers.get('Authorization', '')})
                else:
                    response = requests.put(url, json=data, headers=headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers)

            success = response.status_code == expected_status
            details = f"Status: {response.status_code}"
            
            if not success:
                try:
                    error_data = response.json()
                    details += f", Response: {error_data}"
                except:
                    details += f", Response: {response.text[:200]}"
            
            self.log_test(name, success, details)
            
            if success:
                try:
                    return True, response.json()
                except:
                    return True, {}
            else:
                return False, {}

        except Exception as e:
            self.log_test(name, False, f"Exception: {str(e)}")
            return False, {}

    def test_user_registration(self):
        """Test user registration"""
        test_email = f"test_{uuid.uuid4().hex[:8]}@example.com"
        test_data = {
            "email": test_email,
            "password": "TestPass123!",
            "name": "Test User"
        }
        
        success, response = self.run_test(
            "User Registration",
            "POST",
            "auth/register",
            200,
            data=test_data
        )
        
        if success and 'session_token' in response:
            self.session_token = response['session_token']
            self.user_id = response['user']['user_id']
            return True
        return False

    def test_user_login(self):
        """Test user login with existing credentials"""
        # First register a user
        test_email = f"login_test_{uuid.uuid4().hex[:8]}@example.com"
        register_data = {
            "email": test_email,
            "password": "TestPass123!",
            "name": "Login Test User"
        }
        
        # Register user
        success, _ = self.run_test(
            "Pre-Login Registration",
            "POST",
            "auth/register",
            200,
            data=register_data
        )
        
        if not success:
            return False
        
        # Now test login
        login_data = {
            "email": test_email,
            "password": "TestPass123!"
        }
        
        success, response = self.run_test(
            "User Login",
            "POST",
            "auth/login",
            200,
            data=login_data
        )
        
        if success and 'session_token' in response:
            self.session_token = response['session_token']
            self.user_id = response['user']['user_id']
            return True
        return False

    def test_auth_me(self):
        """Test getting current user info"""
        success, response = self.run_test(
            "Get Current User (/auth/me)",
            "GET",
            "auth/me",
            200
        )
        return success

    def test_create_ad(self):
        """Test creating an ad"""
        # Create a simple test image file
        test_image_content = b"fake_image_data"
        
        ad_data = {
            "category": "cars",
            "subcategory": "sedan",
            "title": "Test Car Rental",
            "description": "A test car for rental",
            "price_per_day": 1500.0,
            "location": json.dumps({"lat": 28.6139, "lng": 77.2090, "city": "Delhi"}),
            "contact_number": "+919876543210"
        }
        
        files = {
            'images': ('test_image.jpg', test_image_content, 'image/jpeg')
        }
        
        success, response = self.run_test(
            "Create Ad",
            "POST",
            "ads",
            200,
            data=ad_data,
            files=files
        )
        
        if success and 'ad_id' in response:
            self.test_ad_id = response['ad_id']
            return True
        return False

    def test_get_ads(self):
        """Test getting all ads"""
        success, response = self.run_test(
            "Get All Ads",
            "GET",
            "ads",
            200
        )
        return success

    def test_get_ads_by_category(self):
        """Test getting ads by category"""
        success, response = self.run_test(
            "Get Ads by Category",
            "GET",
            "ads?category=cars",
            200
        )
        return success

    def test_get_user_ads(self):
        """Test getting user's own ads"""
        success, response = self.run_test(
            "Get User Ads",
            "GET",
            "user/ads",
            200
        )
        return success

    def test_save_ad(self):
        """Test saving an ad"""
        if hasattr(self, 'test_ad_id'):
            success, response = self.run_test(
                "Save Ad",
                "POST",
                f"ads/{self.test_ad_id}/save",
                200
            )
            return success
        return False

    def test_get_saved_ads(self):
        """Test getting saved ads"""
        success, response = self.run_test(
            "Get Saved Ads",
            "GET",
            "user/saved-ads",
            200
        )
        return success

    def test_conversations(self):
        """Test getting conversations"""
        success, response = self.run_test(
            "Get Conversations",
            "GET",
            "conversations",
            200
        )
        return success

    def test_admin_endpoints(self):
        """Test admin endpoints"""
        # Test admin get ads
        success1, _ = self.run_test(
            "Admin Get Ads",
            "GET",
            "admin/ads",
            200
        )
        
        # Test admin get users
        success2, _ = self.run_test(
            "Admin Get Users",
            "GET",
            "admin/users",
            200
        )
        
        return success1 and success2

    def test_profile_update(self):
        """Test profile update"""
        profile_data = {
            "name": "Updated Test User",
            "phone": "+919876543210"
        }
        
        success, response = self.run_test(
            "Update Profile",
            "PUT",
            "user/profile",
            200,
            data=profile_data,
            files={}  # Send as form data
        )
        return success

    def test_logout(self):
        """Test user logout"""
        success, response = self.run_test(
            "User Logout",
            "POST",
            "auth/logout",
            200
        )
        return success

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting RENT WALA API Tests...")
        print(f"Testing against: {self.base_url}")
        print("=" * 50)
        
        # Authentication Tests
        print("\n📝 Testing Authentication...")
        self.test_user_registration()
        self.test_user_login()
        self.test_auth_me()
        
        # Ad Management Tests
        print("\n🏠 Testing Ad Management...")
        self.test_create_ad()
        self.test_get_ads()
        self.test_get_ads_by_category()
        self.test_get_user_ads()
        
        # Save/Unsave Tests
        print("\n💾 Testing Save/Unsave Functionality...")
        self.test_save_ad()
        self.test_get_saved_ads()
        
        # Chat/Messages Tests
        print("\n💬 Testing Chat/Messages...")
        self.test_conversations()
        
        # Profile Tests
        print("\n👤 Testing Profile Management...")
        self.test_profile_update()
        
        # Admin Tests
        print("\n🔧 Testing Admin Functionality...")
        self.test_admin_endpoints()
        
        # Logout Test
        print("\n🚪 Testing Logout...")
        self.test_logout()
        
        # Print Summary
        print("\n" + "=" * 50)
        print(f"📊 Test Summary: {self.tests_passed}/{self.tests_run} tests passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed!")
            return True
        else:
            print("⚠️  Some tests failed. Check details above.")
            return False

def main():
    tester = RentWalaAPITester()
    success = tester.run_all_tests()
    
    # Save detailed results
    results = {
        "timestamp": datetime.now().isoformat(),
        "total_tests": tester.tests_run,
        "passed_tests": tester.tests_passed,
        "success_rate": (tester.tests_passed / tester.tests_run * 100) if tester.tests_run > 0 else 0,
        "test_details": tester.test_results
    }
    
    with open('/app/backend_test_results.json', 'w') as f:
        json.dump(results, f, indent=2)
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())