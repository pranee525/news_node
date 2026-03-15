#!/usr/bin/env python3
"""
Comprehensive Backend API Tests for Headlinez News App
Tests all endpoints: authentication, news, preferences, saved articles, stats, AI features
"""

import requests
import json
import sys
import time
from datetime import datetime
from typing import Dict, List, Optional

class HeadlinezAPITester:
    def __init__(self, base_url="http://localhost:8001"):
        self.base_url = base_url
        self.token = None
        self.user_id = None
        self.device_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []
        self.session = requests.Session()
        self.session.timeout = 10

    def log(self, message: str):
        """Log message with timestamp"""
        timestamp = datetime.now().strftime("%H:%M:%S")
        print(f"[{timestamp}] {message}")

    def run_test(self, name: str, method: str, endpoint: str, expected_status: int, 
                 data: Optional[Dict] = None, headers: Optional[Dict] = None) -> tuple:
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'
        
        if headers:
            test_headers.update(headers)

        self.tests_run += 1
        self.log(f"🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = self.session.get(url, headers=test_headers)
            elif method == 'POST':
                response = self.session.post(url, json=data, headers=test_headers)
            elif method == 'PUT':
                response = self.session.put(url, json=data, headers=test_headers)
            elif method == 'DELETE':
                response = self.session.delete(url, headers=test_headers)

            success = response.status_code == expected_status
            response_data = {}
            
            try:
                response_data = response.json()
            except:
                response_data = {"raw_response": response.text}
            
            if success:
                self.tests_passed += 1
                self.log(f"✅ {name} - Status: {response.status_code}")
                return True, response_data
            else:
                self.log(f"❌ {name} - Expected {expected_status}, got {response.status_code}")
                self.log(f"   Response: {response_data}")
                self.failed_tests.append({
                    "test": name,
                    "expected": expected_status,
                    "actual": response.status_code,
                    "response": response_data
                })
                return False, response_data

        except Exception as e:
            self.log(f"❌ {name} - Error: {str(e)}")
            self.failed_tests.append({
                "test": name,
                "error": str(e),
                "expected": expected_status,
                "actual": "Exception"
            })
            return False, {}

    def test_health_check(self) -> bool:
        """Test health check endpoint"""
        success, response = self.run_test("Health Check", "GET", "api/health", 200)
        if success:
            required_fields = ['status', 'timestamp', 'mongodb']
            for field in required_fields:
                if field not in response:
                    self.log(f"❌ Health check missing field: {field}")
                    return False
            if response.get('mongodb') != 'connected':
                self.log(f"❌ MongoDB not connected: {response.get('mongodb')}")
                return False
        return success

    def test_device_auth(self) -> bool:
        """Test device-based authentication"""
        # Test without deviceId
        success, response = self.run_test(
            "Device Auth (Auto DeviceID)", 
            "POST", 
            "api/auth/device", 
            200,
            data={}
        )
        
        if success and 'token' in response:
            self.token = response['token']
            self.device_id = response.get('user', {}).get('deviceId')
            self.user_id = response.get('user', {}).get('id')
            self.log(f"   Device ID: {self.device_id}")
            
            # Test with existing deviceId
            success2, response2 = self.run_test(
                "Device Auth (Existing DeviceID)", 
                "POST", 
                "api/auth/device", 
                200,
                data={"deviceId": self.device_id}
            )
            return success and success2
            
        return success

    def test_email_registration(self) -> bool:
        """Test email registration"""
        test_email = f"test_{int(time.time())}@headlinez.com"
        test_password = "TestPass123!"
        
        success, response = self.run_test(
            "Email Registration", 
            "POST", 
            "api/auth/register", 
            201,
            data={
                "email": test_email,
                "password": test_password,
                "deviceId": self.device_id
            }
        )
        
        if success:
            # Test duplicate registration
            self.run_test(
                "Duplicate Email Registration", 
                "POST", 
                "api/auth/register", 
                400,
                data={
                    "email": test_email,
                    "password": test_password
                }
            )
        
        return success

    def test_email_login(self) -> bool:
        """Test email login"""
        # First register a user
        test_email = f"login_test_{int(time.time())}@headlinez.com"
        test_password = "LoginPass123!"
        
        reg_success, _ = self.run_test(
            "Setup - Register for Login Test", 
            "POST", 
            "api/auth/register", 
            201,
            data={
                "email": test_email,
                "password": test_password
            }
        )
        
        if not reg_success:
            return False
        
        # Test login
        success, response = self.run_test(
            "Email Login", 
            "POST", 
            "api/auth/login", 
            200,
            data={
                "email": test_email,
                "password": test_password
            }
        )
        
        if success and 'token' in response:
            # Test invalid login
            self.run_test(
                "Invalid Email Login", 
                "POST", 
                "api/auth/login", 
                401,
                data={
                    "email": test_email,
                    "password": "wrongpassword"
                }
            )
            
        return success

    def test_news_endpoints(self) -> bool:
        """Test news-related endpoints"""
        all_passed = True
        
        # Test basic news fetch
        success, response = self.run_test("Get Latest News", "GET", "api/news/latest", 200)
        if success:
            if 'articles' not in response or not isinstance(response['articles'], list):
                self.log("❌ Latest news response missing articles array")
                all_passed = False
            else:
                self.log(f"   Found {len(response['articles'])} articles")
                
        all_passed &= success
        
        # Test with filters
        success = self.run_test("Get News with Country Filter", "GET", "api/news/latest?country=us", 200)[0]
        all_passed &= success
        
        success = self.run_test("Get News with Category Filter", "GET", "api/news/latest?category=technology", 200)[0]
        all_passed &= success
        
        success = self.run_test("Get News with Size Limit", "GET", "api/news/latest?size=5", 200)[0]
        all_passed &= success
        
        # Test rate limit info
        success = self.run_test("Get Rate Limit Info", "GET", "api/news/rate-limit", 200)[0]
        all_passed &= success
        
        return all_passed

    def test_preferences_endpoints(self) -> bool:
        """Test user preferences endpoints (requires auth)"""
        if not self.token:
            self.log("❌ No token available for preferences tests")
            return False
            
        all_passed = True
        
        # Test get preferences
        success, response = self.run_test("Get User Preferences", "GET", "api/preferences", 200)
        all_passed &= success
        
        if success:
            prefs = response.get('preferences', {})
            if 'selectedCountries' not in prefs or 'selectedTopics' not in prefs:
                self.log("❌ Preferences response missing required fields")
                all_passed = False
        
        # Test update countries
        success = self.run_test(
            "Update Countries Preference", 
            "PUT", 
            "api/preferences/countries", 
            200,
            data={"countries": ["us", "uk", "ca"]}
        )[0]
        all_passed &= success
        
        # Test update topics  
        success = self.run_test(
            "Update Topics Preference", 
            "PUT", 
            "api/preferences/topics", 
            200,
            data={"topics": ["technology", "science", "health"]}
        )[0]
        all_passed &= success
        
        # Test update theme
        success = self.run_test(
            "Update Theme Preference", 
            "PUT", 
            "api/preferences/theme", 
            200,
            data={"theme": "dark"}
        )[0]
        all_passed &= success
        
        # Test bulk update
        success = self.run_test(
            "Bulk Update Preferences", 
            "PUT", 
            "api/preferences", 
            200,
            data={
                "selectedCountries": ["us", "de"],
                "selectedTopics": ["business", "sports"],
                "theme": "light"
            }
        )[0]
        all_passed &= success
        
        # Test invalid data
        success = self.run_test(
            "Invalid Countries Data", 
            "PUT", 
            "api/preferences/countries", 
            400,
            data={"countries": "invalid"}
        )[0]
        all_passed &= success
        
        return all_passed

    def test_saved_articles_endpoints(self) -> bool:
        """Test saved articles endpoints (requires auth)"""
        if not self.token:
            self.log("❌ No token available for saved articles tests")
            return False
            
        all_passed = True
        
        # Test get saved articles (empty initially)
        success = self.run_test("Get Saved Articles", "GET", "api/saved", 200)[0]
        all_passed &= success
        
        # Test save article
        test_article = {
            "id": "test-article-123",
            "title": "Test Article Title",
            "description": "Test article description",
            "url": "https://example.com/test-article",
            "imageUrl": "https://example.com/test-image.jpg",
            "sourceName": "Test Source",
            "publishedAt": "2024-03-15T10:00:00Z",
            "category": ["technology"],
            "country": ["us"],
            "language": "en"
        }
        
        success = self.run_test(
            "Save Article", 
            "POST", 
            "api/saved", 
            201,
            data={"article": test_article}
        )[0]
        all_passed &= success
        
        # Test duplicate save
        success = self.run_test(
            "Save Duplicate Article", 
            "POST", 
            "api/saved", 
            400,
            data={"article": test_article}
        )[0]
        all_passed &= success
        
        # Test check if saved
        success = self.run_test("Check Article Saved", "GET", f"api/saved/check/{test_article['id']}", 200)[0]
        all_passed &= success
        
        # Test get saved articles (should have one)
        success, response = self.run_test("Get Saved Articles (Non-empty)", "GET", "api/saved", 200)
        if success and len(response.get('savedArticles', [])) == 0:
            self.log("❌ Expected saved articles but got empty list")
            all_passed = False
        all_passed &= success
        
        # Test remove saved article
        success = self.run_test(
            "Remove Saved Article", 
            "DELETE", 
            f"api/saved/{test_article['id']}", 
            200
        )[0]
        all_passed &= success
        
        # Test remove non-existent article
        success = self.run_test(
            "Remove Non-existent Article", 
            "DELETE", 
            "api/saved/non-existent-id", 
            404
        )[0]
        all_passed &= success
        
        return all_passed

    def test_user_stats_endpoints(self) -> bool:
        """Test user stats endpoints (requires auth)"""
        if not self.token:
            self.log("❌ No token available for user stats tests")
            return False
            
        all_passed = True
        
        # Test get user stats
        success, response = self.run_test("Get User Stats", "GET", "api/stats", 200)
        all_passed &= success
        
        if success:
            stats = response.get('stats', {})
            required_fields = ['articlesRead', 'currentStreak', 'savedArticlesCount']
            for field in required_fields:
                if field not in stats:
                    self.log(f"❌ Stats response missing field: {field}")
                    all_passed = False
        
        # Test record article read
        success = self.run_test(
            "Record Article Read", 
            "POST", 
            "api/stats/read", 
            200,
            data={"articleId": "test-article-123", "timeSpent": 120}
        )[0]
        all_passed &= success
        
        # Test stats reset
        success = self.run_test("Reset User Stats", "POST", "api/stats/reset", 200)[0]
        all_passed &= success
        
        return all_passed

    def test_ai_endpoints(self) -> bool:
        """Test AI hashtags endpoint"""
        all_passed = True
        
        # Test hashtag generation
        test_titles = [
            "Breaking: Major Tech Company Announces AI Breakthrough",
            "Climate Change Summit Reaches Historic Agreement",
            "Stock Market Soars on Positive Economic Data",
            "Space Mission Successfully Lands on Mars"
        ]
        
        success, response = self.run_test(
            "Generate AI Hashtags", 
            "POST", 
            "api/ai/hashtags", 
            200,
            data={"titles": test_titles}
        )
        
        if success:
            hashtags = response.get('hashtags', [])
            if not isinstance(hashtags, list) or len(hashtags) == 0:
                self.log("❌ Expected hashtags array but got invalid response")
                all_passed = False
            else:
                self.log(f"   Generated hashtags: {hashtags}")
        
        all_passed &= success
        
        # Test with empty titles
        success = self.run_test(
            "Generate Hashtags (Empty Titles)", 
            "POST", 
            "api/ai/hashtags", 
            200,
            data={"titles": []}
        )[0]
        all_passed &= success
        
        # Test invalid data
        success = self.run_test(
            "Generate Hashtags (Invalid Data)", 
            "POST", 
            "api/ai/hashtags", 
            400,
            data={"titles": "invalid"}
        )[0]
        all_passed &= success
        
        return all_passed

    def test_unauthorized_access(self) -> bool:
        """Test that protected endpoints return 401 without token"""
        # Temporarily remove token
        temp_token = self.token
        self.token = None
        
        all_passed = True
        
        protected_endpoints = [
            ("GET", "api/preferences", "Get Preferences (No Auth)"),
            ("PUT", "api/preferences", "Update Preferences (No Auth)"),
            ("GET", "api/saved", "Get Saved Articles (No Auth)"),
            ("POST", "api/saved", "Save Article (No Auth)"),
            ("GET", "api/stats", "Get Stats (No Auth)"),
            ("POST", "api/stats/read", "Record Read (No Auth)")
        ]
        
        for method, endpoint, name in protected_endpoints:
            data = {"test": "data"} if method in ["POST", "PUT"] else None
            success = self.run_test(name, method, endpoint, 401, data=data)[0]
            all_passed &= success
        
        # Restore token
        self.token = temp_token
        return all_passed

    def run_all_tests(self):
        """Run all API tests"""
        self.log("🚀 Starting Headlinez API Tests")
        self.log(f"Backend URL: {self.base_url}")
        
        start_time = time.time()
        
        # Core functionality tests
        test_results = {
            "health_check": self.test_health_check(),
            "device_auth": self.test_device_auth(),
            "email_registration": self.test_email_registration(),
            "email_login": self.test_email_login(),
            "news_endpoints": self.test_news_endpoints(),
            "preferences_endpoints": self.test_preferences_endpoints(),
            "saved_articles": self.test_saved_articles_endpoints(),
            "user_stats": self.test_user_stats_endpoints(),
            "ai_endpoints": self.test_ai_endpoints(),
            "unauthorized_access": self.test_unauthorized_access()
        }
        
        end_time = time.time()
        duration = end_time - start_time
        
        # Print summary
        self.log("\n" + "="*50)
        self.log("📊 TEST SUMMARY")
        self.log("="*50)
        self.log(f"Total tests run: {self.tests_run}")
        self.log(f"Tests passed: {self.tests_passed}")
        self.log(f"Tests failed: {len(self.failed_tests)}")
        self.log(f"Success rate: {(self.tests_passed/self.tests_run*100):.1f}%")
        self.log(f"Duration: {duration:.2f}s")
        
        # Print test category results
        self.log("\n📋 Category Results:")
        for category, passed in test_results.items():
            status = "✅" if passed else "❌"
            self.log(f"{status} {category.replace('_', ' ').title()}")
        
        # Print failed tests details
        if self.failed_tests:
            self.log("\n❌ FAILED TESTS:")
            for i, failure in enumerate(self.failed_tests, 1):
                self.log(f"{i}. {failure['test']}")
                if 'error' in failure:
                    self.log(f"   Error: {failure['error']}")
                else:
                    self.log(f"   Expected: {failure['expected']}, Got: {failure['actual']}")
                    if failure.get('response'):
                        self.log(f"   Response: {json.dumps(failure['response'], indent=2)}")
        
        return len(self.failed_tests) == 0

def main():
    """Main test execution"""
    print("Headlinez Backend API Testing Suite")
    print("=" * 50)
    
    tester = HeadlinezAPITester()
    success = tester.run_all_tests()
    
    # Return exit code
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())