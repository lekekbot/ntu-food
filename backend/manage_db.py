#!/usr/bin/env python3

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database.init_db import init_database, reset_database

def main():
    if len(sys.argv) < 2:
        print("Usage: python manage_db.py [init|reset]")
        print("  init  - Initialize database with test data")
        print("  reset - Reset database (clear all data)")
        return

    command = sys.argv[1]

    if command == "init":
        print("Initializing database with test data...")
        init_database()
    elif command == "reset":
        print("Resetting database...")
        reset_database()
    else:
        print(f"Unknown command: {command}")
        print("Available commands: init, reset")

if __name__ == "__main__":
    main()