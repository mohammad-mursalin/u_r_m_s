"""
Comprehensive API endpoint testing script for University Routine Management System.
Run with: python tests.py
"""

import requests
import json
import sys
import time

BASE_URL = "http://localhost:8000/api/v1"
session = requests.Session()

def get_csrf_token():
    """Get CSRF token from backend."""
    try:
        r = session.get(f"{BASE_URL}/semesters/")
        token = session.cookies.get('csrftoken')
        return token
    except:
        return None


def test_endpoint(method, endpoint, expected_status, data=None, session_obj=None, check_func=lambda x: True):
    """Test a single endpoint and return (success, response)."""
    url = f"{BASE_URL}{endpoint}"
    try:
        headers = {}
        if session_obj:
            csrf = session_obj.cookies.get('csrftoken')
            if csrf:
                headers['X-CSRFToken'] = csrf
        
        if method == "GET":
            response = session_obj.get(url, headers=headers, timeout=5) if session_obj else requests.get(url, timeout=5)
        elif method == "POST":
            response = session_obj.post(url, json=data, headers=headers, timeout=5) if session_obj else requests.post(url, json=data, timeout=5)
        elif method == "PUT":
            response = session_obj.put(url, json=data, headers=headers, timeout=5) if session_obj else requests.put(url, json=data, timeout=5)
        elif method == "DELETE":
            response = session_obj.delete(url, headers=headers, timeout=5) if session_obj else requests.delete(url, timeout=5)
        
        return response.status_code == expected_status and check_func(response), response
    except Exception as e:
        return False, str(e)


def main():
    passed = 0
    failed = 0
    
    print("="*60)
    print("API ENDPOINT TESTING - University Routine Management System")
    print("="*60)
    
    # Test 1: Check if backend is running
    print("\n--- Testing Backend Status ---")
    try:
        r = requests.get(f"{BASE_URL}/routine/active/", timeout=5)
        print(f"[PASS] Backend is accessible")
        passed += 1
    except Exception as e:
        print(f"[FAIL] Backend is accessible: {e}")
        failed += 1
        return
    
    # Test 2: Authentication endpoints
    print("\n--- Testing Authentication Endpoints ---")
    
    # Login with empty credentials
    success, _ = test_endpoint("POST", "/auth/login/", 400, {"username": "", "password": ""})
    if success: passed += 1; print(f"[PASS] POST /auth/login/ with empty creds returns 400")
    else: failed += 1; print(f"[FAIL] POST /auth/login/ with empty creds")
    
    # Login with invalid credentials
    success, _ = test_endpoint("POST", "/auth/login/", 401, {"username": "invalid", "password": "invalid"})
    if success: passed += 1; print(f"[PASS] POST /auth/login/ with invalid creds returns 401")
    else: failed += 1; print(f"[FAIL] POST /auth/login/ with invalid creds")
    
    # Login with admin credentials
    login_success = False
    s = requests.Session()
    s.get(f"{BASE_URL}/semesters/")  # Get CSRF
    success, response = test_endpoint("POST", "/auth/login/", 200, {"username": "admin", "password": "admin123"}, s)
    if success and response.status_code == 200:
        login_success = True
        passed += 1
        print(f"[PASS] POST /auth/login/ with admin/admin123 returns 200")
    else:
        failed += 1
        print(f"[FAIL] POST /auth/login/ with admin/admin123: status={response.status_code if hasattr(response, 'status_code') else response}")
    
    if login_success:
        # Test /auth/me/ with session
        success, _ = test_endpoint("GET", "/auth/me/", 200, session_obj=s)
        if success: passed += 1; print(f"[PASS] GET /auth/me/ with session returns 200")
        else: failed += 1; print(f"[FAIL] GET /auth/me/ with session")
        
        # Test /auth/logout/
        success, _ = test_endpoint("POST", "/auth/logout/", 200, session_obj=s)
        if success: passed += 1; print(f"[PASS] POST /auth/logout/ returns 200")
        else: failed += 1; print(f"[FAIL] POST /auth/logout/")
    
    # Test /auth/me/ without session (should return 401/403, or 404 if login_required redirects)
    success, response = test_endpoint("GET", "/auth/me/", 401)
    if response.status_code in [401, 302, 403, 404]:
        passed += 1; print(f"[PASS] GET /auth/me/ without session returns 401/403/404")
    else: failed += 1; print(f"[FAIL] GET /auth/me/ without session: status={response.status_code}")
    
    # Test 3: Master Data endpoints (public GET)
    print("\n--- Testing Master Data Endpoints (Public GET) ---")
    
    for endpoint in ["/teachers/", "/courses/", "/rooms/", "/batches/", "/timeslots/"]:
        success, response = test_endpoint("GET", endpoint, 200)
        if success: passed += 1; print(f"[PASS] GET {endpoint} returns 200")
        else: failed += 1; print(f"[FAIL] GET {endpoint}")
    
    # Test 4: Master Data POST/PUT/DELETE (requires auth)
    print("\n--- Testing Master Data Endpoints (Admin Required) ---")
    
    for endpoint in ["/teachers/", "/courses/", "/rooms/", "/batches/", "/timeslots/"]:
        success, response = test_endpoint("POST", endpoint, 401, {"name": "test"})
        if response.status_code in [401, 403]:
            passed += 1; print(f"[PASS] POST {endpoint} without auth returns 401/403")
        else:
            failed += 1; print(f"[FAIL] POST {endpoint} without auth: status={response.status_code}")
    
    # Test 5: Semesters endpoints
    print("\n--- Testing Semester Endpoints ---")
    
    success, response = test_endpoint("GET", "/semesters/", 200)
    if success: passed += 1; print(f"[PASS] GET /semesters/ returns 200")
    else: failed += 1; print(f"[FAIL] GET /semesters/: status={response.status_code if hasattr(response, 'status_code') else response}")
    
    success, response = test_endpoint("POST", "/semesters/", 401, {"name": "Test Semester"})
    if response.status_code in [401, 403]:
        passed += 1; print(f"[PASS] POST /semesters/ without auth returns 401/403")
    else:
        failed += 1; print(f"[FAIL] POST /semesters/ without auth: status={response.status_code}")
    
    # Test 6: Routine endpoints (public)
    print("\n--- Testing Routine Endpoints (Public) ---")
    
    for endpoint in ["/routine/active/", "/routine/batch/15B/", "/routine/teacher/MAH/"]:
        success, _ = test_endpoint("GET", endpoint, 200)
        if success: passed += 1; print(f"[PASS] GET {endpoint} returns 200")
        else: failed += 1; print(f"[FAIL] GET {endpoint}")
    
    # Test 7: Routine Slots (admin required)
    print("\n--- Testing Routine Slot Endpoints (Admin Required) ---")
    
    success, response = test_endpoint("GET", "/semesters/1/slots/", 401)
    if response.status_code in [401, 403]:
        passed += 1; print(f"[PASS] GET /semesters/1/slots/ without auth returns 401/403")
    else:
        failed += 1; print(f"[FAIL] GET /semesters/1/slots/: status={response.status_code}")
    
    success, response = test_endpoint("POST", "/semesters/1/slots/", 401, {"batch_id": 1})
    if response.status_code in [401, 403]:
        passed += 1; print(f"[PASS] POST /semesters/1/slots/ without auth returns 401/403")
    else:
        failed += 1; print(f"[FAIL] POST /semesters/1/slots/: status={response.status_code}")
    
    # Test 8: PDF Export
    print("\n--- Testing PDF Export Endpoint ---")
    
    success, _ = test_endpoint("GET", "/export/routine/pdf/", 503)
    if success: passed += 1; print(f"[PASS] GET /export/routine/pdf/ returns 503 (WeasyPrint not installed)")
    else: failed += 1; print(f"[FAIL] GET /export/routine/pdf/")
    
    # Test 9: Error responses
    print("\n--- Testing Error Responses ---")
    
    success, response = test_endpoint("GET", "/semesters/99999/", 404)
    if response.status_code == 404:
        passed += 1; print(f"[PASS] GET /semesters/99999/ returns 404")
    else:
        failed += 1; print(f"[FAIL] GET /semesters/99999/: status={response.status_code}")
    
    success, response = test_endpoint("DELETE", "/teachers/99999/", 401)
    if response.status_code in [401, 403]:
        passed += 1; print(f"[PASS] DELETE /teachers/99999/ returns 401/403")
    else:
        failed += 1; print(f"[FAIL] DELETE /teachers/99999/: status={response.status_code}")
    
    print(f"\n{'='*60}")
    print(f"SUMMARY: {passed} passed, {failed} failed")
    print(f"{'='*60}")


if __name__ == "__main__":
    main()