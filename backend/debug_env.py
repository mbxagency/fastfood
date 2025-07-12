#!/usr/bin/env python3
"""
Debug script to check environment variables
"""
import os
from src.config import settings

def debug_environment():
    print("🔍 Environment Variables Debug")
    print("=" * 50)
    
    # Check raw environment variable
    raw_db_url = os.getenv("DATABASE_URL")
    print(f"Raw DATABASE_URL from os.getenv(): {raw_db_url}")
    
    # Check settings
    print(f"Settings DATABASE_URL: {settings.DATABASE_URL}")
    
    # Check if DATABASE_URL starts with the key name
    if raw_db_url and raw_db_url.startswith("DATABASE_URL="):
        print("❌ ERROR: DATABASE_URL contains the key name!")
        print("This means the environment variable is not set correctly.")
        print("Expected: postgresql://user:pass@host:port/db")
        print(f"Got: {raw_db_url}")
    else:
        print("✅ DATABASE_URL format looks correct")
    
    # Check other important variables
    print("\n📋 Other Environment Variables:")
    print(f"SECRET_KEY: {'✅ Set' if settings.SECRET_KEY else '❌ Not set'}")
    print(f"ENVIRONMENT: {settings.ENVIRONMENT}")
    print(f"DEBUG: {settings.DEBUG}")
    print(f"ADMIN_USERNAME: {settings.ADMIN_USERNAME}")
    print(f"ADMIN_PASSWORD: {'✅ Set' if settings.ADMIN_PASSWORD else '❌ Not set'}")

if __name__ == "__main__":
    debug_environment() 