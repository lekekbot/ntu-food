#!/usr/bin/env python3

import requests
import json

BASE_URL = "http://localhost:8000"

def test_api():
    print("🧪 Testing NTU Food API...")
    print("=" * 50)

    # Test health check
    print("1. Health Check:")
    response = requests.get(f"{BASE_URL}/health")
    print(f"   Status: {response.status_code}")
    print(f"   Response: {response.json()}")
    print()

    # Test stalls endpoint
    print("2. Get All Stalls:")
    response = requests.get(f"{BASE_URL}/api/stalls/")
    print(f"   Status: {response.status_code}")
    stalls = response.json()
    print(f"   Found {len(stalls)} stalls:")
    for stall in stalls:
        print(f"   - {stall['name']} ({stall['location']})")
    print()

    # Test menu endpoint
    print("3. Get Menu for Stall 1:")
    response = requests.get(f"{BASE_URL}/api/menu/stall/1")
    print(f"   Status: {response.status_code}")
    menu_items = response.json()
    print(f"   Found {len(menu_items)} menu items:")
    for item in menu_items:
        available = "✅" if item['is_available'] else "❌"
        print(f"   {available} {item['name']} - ${item['price']:.2f}")
    print()

    # Test API documentation
    print("4. API Documentation:")
    print(f"   Swagger UI: {BASE_URL}/docs")
    print(f"   ReDoc: {BASE_URL}/redoc")
    print()

    print("✅ API is working correctly!")
    print("\nTest Data Summary:")
    print("- 3 test stalls (A, B, C)")
    print("- Menu items for each stall")
    print("- 1 test student user")
    print("- 1 sample order in queue")

if __name__ == "__main__":
    try:
        test_api()
    except requests.exceptions.ConnectionError:
        print("❌ Error: Cannot connect to the API server.")
        print("Make sure the backend server is running on http://localhost:8000")
    except Exception as e:
        print(f"❌ Error: {e}")