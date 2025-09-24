#!/usr/bin/env python3
"""
Test script for OTP authentication system.
Run this to verify the OTP flow is working correctly.
"""

import requests
import json
import time

BASE_URL = "http://localhost:8000"

def test_otp_registration():
    print("="*60)
    print("🧪 Testing NTU OTP Authentication System")
    print("="*60)

    # Test data
    test_user = {
        "ntu_email": "test.otp@e.ntu.edu.sg",
        "student_id": "U9999999Z",
        "name": "Test OTP User",
        "phone": "+6591234567",
        "password": "TestPassword123",
        "dietary_preferences": "Test preferences"
    }

    # Step 1: Register and request OTP
    print("\n📝 Step 1: Registering user and requesting OTP...")
    response = requests.post(
        f"{BASE_URL}/api/auth/otp/register",
        json=test_user
    )

    if response.status_code == 200:
        data = response.json()
        print(f"✅ OTP requested successfully!")
        print(f"   Email: {data['email']}")
        print(f"   Message: {data['message']}")
        print(f"   Expires in: {data['expires_in_minutes']} minutes")

        # Since we're in testing mode, the OTP is printed to console
        print("\n⚠️  TESTING MODE: Check backend console for OTP code")
        print("   The OTP will be displayed in the backend terminal")

        # Simulate OTP entry
        otp_code = input("\n📧 Enter the 6-digit OTP code from backend console: ")

        # Step 2: Verify OTP
        print(f"\n🔐 Step 2: Verifying OTP...")
        verify_response = requests.post(
            f"{BASE_URL}/api/auth/otp/verify-otp",
            json={
                "email": test_user["ntu_email"],
                "otp_code": otp_code
            }
        )

        if verify_response.status_code == 200:
            token_data = verify_response.json()
            print(f"✅ OTP verified successfully!")
            print(f"   Access token received: {token_data['access_token'][:20]}...")

            # Step 3: Test login with created account
            print(f"\n🔑 Step 3: Testing login with created account...")
            login_response = requests.post(
                f"{BASE_URL}/api/auth/login",
                json={
                    "ntu_email": test_user["ntu_email"],
                    "password": test_user["password"]
                }
            )

            if login_response.status_code == 200:
                print(f"✅ Login successful!")
                print(f"\n🎉 All tests passed! OTP system is working correctly.")
            else:
                print(f"❌ Login failed: {login_response.json()}")
        else:
            print(f"❌ OTP verification failed: {verify_response.json()}")

    elif response.status_code == 400:
        error_data = response.json()
        if "already registered" in error_data.get("detail", ""):
            print(f"ℹ️  User already exists. Cleaning up...")
            # You can add cleanup logic here if needed
        print(f"❌ Registration failed: {error_data}")
    else:
        print(f"❌ Registration failed with status {response.status_code}")
        print(f"   Response: {response.json()}")

    print("\n" + "="*60)

def test_resend_otp():
    print("\n📨 Testing OTP Resend...")

    test_email = "test.otp@e.ntu.edu.sg"

    response = requests.post(
        f"{BASE_URL}/api/auth/otp/resend-otp",
        json={"email": test_email}
    )

    if response.status_code == 200:
        print(f"✅ OTP resent successfully!")
    else:
        print(f"ℹ️  Resend response: {response.json()}")

def test_validation():
    print("\n🔍 Testing Email Validation...")

    # Test invalid emails
    invalid_emails = [
        "test@gmail.com",
        "user@hotmail.com",
        "student@yahoo.com",
        "invalid.email",
        "@ntu.edu.sg",
        "test@"
    ]

    for email in invalid_emails:
        test_user = {
            "ntu_email": email,
            "student_id": "U1234567A",
            "name": "Test User",
            "phone": "+6591234567",
            "password": "TestPassword123"
        }

        response = requests.post(
            f"{BASE_URL}/api/auth/otp/register",
            json=test_user
        )

        if response.status_code == 400:
            print(f"✅ Correctly rejected invalid email: {email}")
        else:
            print(f"❌ Should have rejected email: {email}")

    # Test valid NTU emails
    valid_emails = [
        "student@e.ntu.edu.sg",
        "faculty@ntu.edu.sg"
    ]

    print("\n✅ Valid NTU email formats:")
    for email in valid_emails:
        print(f"   - {email}")

if __name__ == "__main__":
    try:
        # Check if server is running
        health_check = requests.get(f"{BASE_URL}/health")
        if health_check.status_code == 200:
            print("✅ Backend server is running")

            # Run tests
            test_otp_registration()
            # test_validation()
            # test_resend_otp()
        else:
            print("❌ Backend server is not responding")
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to backend server")
        print("   Please ensure the backend is running on http://localhost:8000")
    except KeyboardInterrupt:
        print("\n\nTest interrupted by user")
    except Exception as e:
        print(f"❌ Unexpected error: {e}")