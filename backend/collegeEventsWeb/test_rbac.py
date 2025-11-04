import requests
import json
import random

BASE_URL = "http://localhost:8000/api"

def print_test_header(test_name):
    print("\n" + "="*60)
    print(f"  {test_name}")
    print("="*60)

def test_student_registration():
    print_test_header("TEST 1: Register Student (Should be Active Immediately)")
    
    # Use random email to avoid conflicts
    email = f"student{random.randint(1000, 9999)}@test.com"
    
    response = requests.post(f"{BASE_URL}/register/", json={
        "name": "Test Student",
        "email": email,
        "password": "password123",
        "role": "student"
    })
    
    print(f"Status Code: {response.status_code}")
    print(f"Testing with: {email}")
    
    try:
        data = response.json()
        print(f"Response: {json.dumps(data, indent=2)}")
        
        if response.status_code == 201 and data.get("user", {}).get("status") == "active":
            print("✅ PASSED: Student registered with active status")
            return True
        else:
            print("❌ FAILED: Student should be active immediately")
            return False
    except Exception as e:
        print(f"❌ ERROR: {e}")
        return False

def test_organizer_registration():
    print_test_header("TEST 2: Register Organizer (Should be Pending)")
    
    # Use random email to avoid conflicts
    email = f"organizer{random.randint(1000, 9999)}@test.com"
    
    response = requests.post(f"{BASE_URL}/register/", json={
        "name": "Test Organizer",
        "email": email,
        "password": "password123",
        "role": "organizer"
    })
    
    print(f"Status Code: {response.status_code}")
    print(f"Testing with: {email}")
    
    try:
        data = response.json()
        print(f"Response: {json.dumps(data, indent=2)}")
        
        if response.status_code == 201 and data.get("user", {}).get("status") == "pending":
            print("✅ PASSED: Organizer registered with pending status")
            return True, email
        else:
            print("❌ FAILED: Organizer should be pending")
            return False, None
    except Exception as e:
        print(f"❌ ERROR: {e}")
        return False, None

def test_pending_organizer_login(email):
    print_test_header("TEST 3: Login as Pending Organizer (Should Fail)")
    
    response = requests.post(f"{BASE_URL}/login/", json={
        "email": email,
        "password": "password123"
    })
    
    print(f"Status Code: {response.status_code}")
    
    try:
        data = response.json()
        print(f"Response: {json.dumps(data, indent=2)}")
        
        if response.status_code == 400:
            print("✅ PASSED: Pending organizer cannot login")
            return True
        else:
            print("❌ FAILED: Pending organizer should not be able to login")
            return False
    except Exception as e:
        print(f"❌ ERROR: {e}")
        return False

def test_student_login(email):
    print_test_header("TEST 4: Login as Student (Should Succeed)")
    
    response = requests.post(f"{BASE_URL}/login/", json={
        "email": email,
        "password": "password123"
    })
    
    print(f"Status Code: {response.status_code}")
    
    try:
        data = response.json()
        print(f"Response: {json.dumps(data, indent=2)}")
        
        if response.status_code == 200 and "access" in data:
            print("✅ PASSED: Student logged in successfully")
            return data.get("access"), True
        else:
            print("❌ FAILED: Student should login successfully")
            return None, False
    except Exception as e:
        print(f"❌ ERROR: {e}")
        return None, False

def test_view_events():
    print_test_header("TEST 5: View Events (Public Access)")
    
    response = requests.get(f"{BASE_URL}/events/")
    
    print(f"Status Code: {response.status_code}")
    
    try:
        data = response.json()
        if isinstance(data, list):
            print(f"Response: Found {len(data)} events")
        else:
            print(f"Response: {json.dumps(data, indent=2)[:200]}...")
        
        if response.status_code == 200:
            print("✅ PASSED: Events are publicly accessible")
            return True
        else:
            print("❌ FAILED: Events should be publicly accessible")
            return False
    except Exception as e:
        print(f"Note: {e}")
        if response.status_code == 200:
            print("✅ PASSED: Events endpoint accessible")
            return True
        return False

if __name__ == "__main__":
    print("\n" + "🚀"*30)
    print("  STARTING RBAC FEATURE TESTS")
    print("🚀"*30)
    
    print("\nTesting URLs:")
    print(f"  Base URL: {BASE_URL}")
    print(f"  Register: {BASE_URL}/register/")
    print(f"  Login: {BASE_URL}/login/")
    print(f"  Events: {BASE_URL}/events/")
    
    results = []
    
    # Test 1: Student Registration
    student_registered = test_student_registration()
    results.append(("Student Registration", student_registered))
    
    # Test 2: Organizer Registration
    organizer_registered, organizer_email = test_organizer_registration()
    results.append(("Organizer Registration", organizer_registered))
    
    # Test 3: Pending Organizer Login (only if organizer was registered)
    if organizer_email:
        pending_login_blocked = test_pending_organizer_login(organizer_email)
        results.append(("Pending Organizer Login Block", pending_login_blocked))
    
    # Test 4: Student Login (use existing student)
    token, success = test_student_login("teststudent@college.com")
    results.append(("Student Login (Existing User)", success))
    
    # Test 5: View Events
    results.append(("View Events", test_view_events()))
    
    # Print summary
    print("\n" + "="*60)
    print("  TEST SUMMARY")
    print("="*60)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASSED" if result else "❌ FAILED"
        print(f"{status}: {test_name}")
    
    print("\n" + "-"*60)
    print(f"TOTAL: {passed}/{total} tests passed")
    print("-"*60)
    
    if passed == total:
        print("\n🎉 ALL RBAC TESTS PASSED! 🎉")
        print("\n RBAC implementation is working correctly:")
        print("  ✅ Students get active status immediately")
        print("  ✅ Organizers get pending status")
        print("  ✅ Pending users cannot login")
        print("  ✅ Authentication system working")
        print("  ✅ Public API access working")
    else:
        print(f"\n⚠️  {total - passed} test(s) failed")
        print("\nNote: Some 'failures' may be due to:")
        print("  - Duplicate email addresses (already registered)")
        print("  - JWT authentication configuration")
