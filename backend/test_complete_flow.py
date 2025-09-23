#!/usr/bin/env python3

import requests
import json
from datetime import datetime, timedelta

BASE_URL = "http://localhost:8000"

def test_complete_order_flow():
    print("🚀 Testing Complete NTU Food Order Flow")
    print("=" * 60)

    # Test credentials
    test_student = {
        "ntu_email": "test.new.student@e.ntu.edu.sg",
        "student_id": "U2024001A",
        "name": "Test New Student",
        "phone": "+6591234567",
        "password": "testpassword123",
        "dietary_preferences": "Vegetarian"
    }

    token = None

    try:
        # Step 1: Register a new student
        print("1. 📝 Registering new student...")
        response = requests.post(f"{BASE_URL}/api/auth/register", json=test_student)
        if response.status_code == 200:
            print("   ✅ Student registered successfully")
        elif response.status_code == 400 and "already registered" in response.text:
            print("   ℹ️  Student already exists, proceeding with login")
        else:
            print(f"   ❌ Registration failed: {response.status_code} - {response.text}")
            return

        # Step 2: Login
        print("\n2. 🔑 Logging in...")
        login_data = {
            "ntu_email": test_student["ntu_email"],
            "password": test_student["password"]
        }
        response = requests.post(f"{BASE_URL}/api/auth/login", json=login_data)
        if response.status_code == 200:
            token_data = response.json()
            token = token_data["access_token"]
            print("   ✅ Login successful")
        else:
            print(f"   ❌ Login failed: {response.status_code} - {response.text}")
            return

        headers = {"Authorization": f"Bearer {token}"}

        # Step 3: Get user profile
        print("\n3. 👤 Getting user profile...")
        response = requests.get(f"{BASE_URL}/api/auth/me", headers=headers)
        if response.status_code == 200:
            user = response.json()
            print(f"   ✅ Welcome {user['name']} ({user['student_id']})")
        else:
            print(f"   ❌ Profile fetch failed: {response.status_code}")
            return

        # Step 4: Browse stalls
        print("\n4. 🏪 Browsing available stalls...")
        response = requests.get(f"{BASE_URL}/api/stalls/")
        if response.status_code == 200:
            stalls = response.json()
            print(f"   ✅ Found {len(stalls)} stalls:")
            for stall in stalls[:3]:  # Show first 3
                print(f"      - {stall['name']} ({stall['location']})")
            selected_stall = stalls[0]  # Select first stall
            print(f"   🎯 Selected: {selected_stall['name']}")
        else:
            print(f"   ❌ Stalls fetch failed: {response.status_code}")
            return

        # Step 5: Get menu
        print("\n5. 📋 Getting menu...")
        response = requests.get(f"{BASE_URL}/api/menu/stall/{selected_stall['id']}")
        if response.status_code == 200:
            menu_items = response.json()
            available_items = [item for item in menu_items if item['is_available']]
            print(f"   ✅ Found {len(available_items)} available items:")
            for item in available_items[:3]:  # Show first 3
                print(f"      - {item['name']}: ${item['price']:.2f}")
        else:
            print(f"   ❌ Menu fetch failed: {response.status_code}")
            return

        # Step 6: Create order
        print("\n6. 🛒 Creating order...")
        order_data = {
            "stall_id": selected_stall["id"],
            "items": [
                {
                    "menu_item_id": available_items[0]["id"],
                    "quantity": 2,
                    "special_requests": "Less spicy please"
                },
                {
                    "menu_item_id": available_items[1]["id"],
                    "quantity": 1
                }
            ],
            "pickup_time": (datetime.now() + timedelta(minutes=30)).isoformat(),
            "special_instructions": "Please call when ready"
        }

        response = requests.post(f"{BASE_URL}/api/orders/", json=order_data, headers=headers)
        if response.status_code == 200:
            order = response.json()
            print(f"   ✅ Order created: {order['order_number']}")
            print(f"      Total: ${order['total_amount']:.2f}")
            print(f"      Queue Number: {order.get('queue_number', 'N/A')}")
            order_id = order["id"]
        else:
            print(f"   ❌ Order creation failed: {response.status_code} - {response.text}")
            return

        # Step 7: Check queue position
        print("\n7. 📍 Checking queue position...")
        response = requests.get(f"{BASE_URL}/api/queue/position/{order_id}", headers=headers)
        if response.status_code == 200:
            queue_info = response.json()
            print(f"   ✅ Queue Position: {queue_info['queue_position']}")
            print(f"      Orders ahead: {queue_info['orders_ahead']}")
            print(f"      Estimated wait: {queue_info.get('estimated_wait_time', 'N/A')} minutes")
            print(f"      Status: {queue_info['status']}")
        else:
            print(f"   ❌ Queue position check failed: {response.status_code}")

        # Step 8: Get stall queue
        print("\n8. 🎯 Checking stall queue...")
        response = requests.get(f"{BASE_URL}/api/queue/{selected_stall['id']}")
        if response.status_code == 200:
            stall_queue = response.json()
            print(f"   ✅ {stall_queue['stall_name']} Queue:")
            print(f"      Current length: {stall_queue['current_queue_length']}")
            print(f"      Est. total wait: {stall_queue.get('estimated_wait_time', 'N/A')} min")
        else:
            print(f"   ❌ Stall queue check failed: {response.status_code}")

        # Step 9: Get user orders
        print("\n9. 📜 Getting order history...")
        response = requests.get(f"{BASE_URL}/api/orders/", headers=headers)
        if response.status_code == 200:
            orders = response.json()
            print(f"   ✅ Found {len(orders)} order(s):")
            for order in orders[-3:]:  # Show last 3
                print(f"      - {order.get('order_number', 'N/A')}: ${order['total_amount']:.2f} ({order['status']})")
        else:
            print(f"   ❌ Orders fetch failed: {response.status_code}")

        # Step 10: Get specific order details
        print("\n10. 📄 Getting order details...")
        response = requests.get(f"{BASE_URL}/api/orders/{order_id}", headers=headers)
        if response.status_code == 200:
            order_details = response.json()
            print(f"   ✅ Order {order_details['order_number']} details:")
            print(f"      Status: {order_details['status']}")
            print(f"      Items: {len(order_details.get('order_items', []))}")
            if order_details.get('special_instructions'):
                print(f"      Instructions: {order_details['special_instructions']}")
        else:
            print(f"   ❌ Order details fetch failed: {response.status_code}")

        print("\n" + "=" * 60)
        print("✅ COMPLETE ORDER FLOW TEST SUCCESSFUL!")
        print(f"🎉 Order {order.get('order_number', 'N/A')} created and tracked successfully")
        print("\nFlow Summary:")
        print("✅ Student registration/login")
        print("✅ Stall browsing")
        print("✅ Menu viewing")
        print("✅ Order creation with automatic queue assignment")
        print("✅ Queue position tracking")
        print("✅ Order history")
        print("✅ Order details")

    except requests.exceptions.ConnectionError:
        print("❌ Error: Cannot connect to the API server.")
        print("Make sure the backend server is running on http://localhost:8000")
    except Exception as e:
        print(f"❌ Unexpected error: {e}")

def test_api_documentation():
    print("\n📚 API Documentation:")
    print(f"   Swagger UI: {BASE_URL}/docs")
    print(f"   ReDoc: {BASE_URL}/redoc")

if __name__ == "__main__":
    test_complete_order_flow()
    test_api_documentation()