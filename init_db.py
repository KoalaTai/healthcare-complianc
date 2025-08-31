#!/usr/bin/env python3
"""
Database initialization script for VirtualBackroom.ai
Creates all database tables and optionally seeds with initial data
"""
import os
import sys
from datetime import datetime

# Add project root to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app
from models import db, User, UserRole
from config import config

def create_tables():
    """Create all database tables"""
    try:
        db.create_all()
        print("✓ Database tables created successfully")
        return True
    except Exception as e:
        print(f"✗ Error creating database tables: {e}")
        return False

def create_admin_user():
    """Create initial admin user"""
    try:
        # Check if admin user already exists
        admin_user = User.query.filter_by(username='admin').first()
        if admin_user:
            print("✓ Admin user already exists")
            return True
        
        # Create admin user
        admin = User(
            username='admin',
            email='admin@virtualbackroom.ai',
            first_name='System',
            last_name='Administrator',
            role=UserRole.ADMIN,
            is_active=True,
            email_verified=True
        )
        admin.set_password('admin123')  # Change this in production!
        
        db.session.add(admin)
        db.session.commit()
        
        print("✓ Admin user created successfully")
        print("  Username: admin")
        print("  Email: admin@virtualbackroom.ai")
        print("  Password: admin123 (CHANGE THIS IN PRODUCTION!)")
        return True
        
    except Exception as e:
        print(f"✗ Error creating admin user: {e}")
        db.session.rollback()
        return False

def create_demo_users():
    """Create demo users for development"""
    demo_users = [
        {
            'username': 'qm_user',
            'email': 'qm@demo.com',
            'first_name': 'Quality',
            'last_name': 'Manager',
            'role': UserRole.QUALITY_MANAGER,
            'organization': 'Demo Medical Devices Inc.'
        },
        {
            'username': 'auditor_user',
            'email': 'auditor@demo.com',
            'first_name': 'Lead',
            'last_name': 'Auditor',
            'role': UserRole.AUDITOR,
            'organization': 'Compliance Consulting LLC'
        },
        {
            'username': 'demo_user',
            'email': 'demo@demo.com',
            'first_name': 'Demo',
            'last_name': 'User',
            'role': UserRole.USER,
            'organization': 'MedTech Startup'
        }
    ]
    
    created_count = 0
    for user_data in demo_users:
        try:
            # Check if user already exists
            existing_user = User.query.filter_by(username=user_data['username']).first()
            if existing_user:
                continue
            
            user = User(
                username=user_data['username'],
                email=user_data['email'],
                first_name=user_data['first_name'],
                last_name=user_data['last_name'],
                role=user_data['role'],
                organization=user_data['organization'],
                is_active=True,
                email_verified=True
            )
            user.set_password('demo123')  # Simple password for demo
            
            db.session.add(user)
            created_count += 1
            
        except Exception as e:
            print(f"✗ Error creating demo user {user_data['username']}: {e}")
            continue
    
    if created_count > 0:
        try:
            db.session.commit()
            print(f"✓ Created {created_count} demo users")
            print("  Password for all demo users: demo123")
        except Exception as e:
            print(f"✗ Error committing demo users: {e}")
            db.session.rollback()
            return False
    else:
        print("✓ Demo users already exist or none needed")
    
    return True

def main():
    """Main initialization function"""
    print("VirtualBackroom.ai Database Initialization")
    print("=" * 50)
    
    # Create Flask app
    app = create_app(config)
    
    with app.app_context():
        # Create tables
        if not create_tables():
            sys.exit(1)
        
        # Create admin user
        if not create_admin_user():
            sys.exit(1)
        
        # Create demo users (only in development)
        if config.security.debug:
            if not create_demo_users():
                print("⚠ Warning: Failed to create some demo users")
        
        print("\n" + "=" * 50)
        print("Database initialization completed successfully!")
        print("\nNext steps:")
        print("1. Change the admin password in production")
        print("2. Configure your AI provider API keys in .env")
        print("3. Start the application: python app.py")
        print("\nFor development:")
        print("- Demo users are available with password: demo123")
        print("- Admin user: admin / admin123")

if __name__ == '__main__':
    main()