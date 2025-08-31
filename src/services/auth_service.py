"""
Authentication Service
Handles user authentication, registration, and OAuth flows
"""
import logging
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
from itsdangerous import URLSafeTimedSerializer, SignatureExpired, BadSignature

from models import db, User, UserRole
from utils.firebase_auth import verify_firebase_token

logger = logging.getLogger(__name__)


class AuthService:
    """Service for handling authentication operations"""
    
    def __init__(self):
        # For password reset tokens
        self.token_serializer = URLSafeTimedSerializer('your-secret-key-for-tokens')
        self.token_max_age = 3600  # 1 hour
    
    def register_user(self, user_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Register a new user
        
        Args:
            user_data: Dictionary containing user registration data
            
        Returns:
            Dictionary with success status and user/error information
        """
        try:
            # Extract data
            username = user_data.get('username', '').strip()
            email = user_data.get('email', '').strip().lower()
            password = user_data.get('password', '')
            first_name = user_data.get('first_name', '').strip()
            last_name = user_data.get('last_name', '').strip()
            organization = user_data.get('organization', '').strip()
            
            # Validate required fields
            if not all([username, email, password]):
                return {
                    'success': False,
                    'message': 'Username, email, and password are required'
                }
            
            # Check if user already exists
            existing_user = User.query.filter(
                (User.username == username) | (User.email == email)
            ).first()
            
            if existing_user:
                if existing_user.username == username:
                    return {'success': False, 'message': 'Username already exists'}
                else:
                    return {'success': False, 'message': 'Email already registered'}
            
            # Create new user
            user = User(
                username=username,
                email=email,
                first_name=first_name or None,
                last_name=last_name or None,
                organization=organization or None,
                role=UserRole.USER,
                is_oauth_user=False
            )
            
            # Set password
            user.set_password(password)
            
            # Save to database
            db.session.add(user)
            db.session.commit()
            
            logger.info(f"User registered successfully: {username} ({email})")
            
            return {
                'success': True,
                'user': user,
                'message': 'User registered successfully'
            }
            
        except Exception as e:
            db.session.rollback()
            logger.error(f"User registration error: {e}")
            return {
                'success': False,
                'message': 'Registration failed due to server error'
            }
    
    def login_with_credentials(self, username_or_email: str, password: str) -> Dict[str, Any]:
        """
        Authenticate user with username/email and password
        
        Args:
            username_or_email: Username or email address
            password: User's password
            
        Returns:
            Dictionary with success status and user information
        """
        try:
            # Find user by username or email
            user = User.query.filter(
                (User.username == username_or_email) | 
                (User.email == username_or_email.lower())
            ).first()
            
            if not user:
                return {
                    'success': False,
                    'message': 'Invalid username/email or password'
                }
            
            # Check if account is active
            if not user.is_active:
                return {
                    'success': False,
                    'message': 'Account is disabled. Please contact support.'
                }
            
            # Verify password
            if not user.check_password(password):
                return {
                    'success': False,
                    'message': 'Invalid username/email or password'
                }
            
            logger.info(f"User logged in successfully: {user.username}")
            
            return {
                'success': True,
                'user': user,
                'message': 'Login successful'
            }
            
        except Exception as e:
            logger.error(f"Login error: {e}")
            return {
                'success': False,
                'message': 'Login failed due to server error'
            }
    
    def login_with_firebase(self, id_token: str) -> Dict[str, Any]:
        """
        Authenticate user with Firebase ID token
        
        Args:
            id_token: Firebase ID token from client
            
        Returns:
            Dictionary with success status and user information
        """
        try:
            # Verify Firebase token
            token_data = verify_firebase_token(id_token)
            
            if not token_data:
                return {
                    'success': False,
                    'message': 'Invalid Firebase token'
                }
            
            # Extract user information from token
            firebase_uid = token_data.get('uid')
            email = token_data.get('email', '').lower()
            name = token_data.get('name', '')
            
            if not firebase_uid or not email:
                return {
                    'success': False,
                    'message': 'Invalid token data'
                }
            
            # Find existing user or create new one
            user = User.query.filter_by(firebase_uid=firebase_uid).first()
            
            if not user:
                # Check if user exists with this email (non-OAuth)
                existing_user = User.query.filter_by(email=email).first()
                if existing_user and not existing_user.is_oauth_user:
                    return {
                        'success': False,
                        'message': 'Email already registered with password login. Please use password login.'
                    }
                
                # Create new OAuth user
                # Generate unique username from email
                base_username = email.split('@')[0]
                username = base_username
                counter = 1
                while User.query.filter_by(username=username).first():
                    username = f"{base_username}_{counter}"
                    counter += 1
                
                # Split name into first and last
                name_parts = name.split(' ', 1) if name else ['', '']
                first_name = name_parts[0] if len(name_parts) > 0 else ''
                last_name = name_parts[1] if len(name_parts) > 1 else ''
                
                user = User(
                    username=username,
                    email=email,
                    first_name=first_name or None,
                    last_name=last_name or None,
                    firebase_uid=firebase_uid,
                    is_oauth_user=True,
                    oauth_provider='google',
                    role=UserRole.USER,
                    email_verified=True  # Firebase handles email verification
                )
                
                db.session.add(user)
                db.session.commit()
                
                logger.info(f"New OAuth user created: {username} ({email})")
            
            # Check if account is active
            if not user.is_active:
                return {
                    'success': False,
                    'message': 'Account is disabled. Please contact support.'
                }
            
            logger.info(f"OAuth user logged in successfully: {user.username}")
            
            return {
                'success': True,
                'user': user,
                'message': 'OAuth login successful'
            }
            
        except Exception as e:
            logger.error(f"Firebase login error: {e}")
            return {
                'success': False,
                'message': 'OAuth login failed due to server error'
            }
    
    def generate_password_reset_token(self, email: str) -> Dict[str, Any]:
        """
        Generate a password reset token for the given email
        
        Args:
            email: User's email address
            
        Returns:
            Dictionary with success status and token information
        """
        try:
            email = email.lower().strip()
            
            # Find user by email
            user = User.query.filter_by(email=email).first()
            
            if not user:
                # Return success even if user doesn't exist (security best practice)
                return {
                    'success': True,
                    'message': 'If this email is registered, you will receive reset instructions'
                }
            
            if user.is_oauth_user:
                return {
                    'success': False,
                    'message': 'This account uses OAuth login. Please use your OAuth provider to reset password.'
                }
            
            # Generate token
            token = self.token_serializer.dumps(email, salt='password-reset')
            
            logger.info(f"Password reset token generated for: {email}")
            
            return {
                'success': True,
                'token': token,
                'user': user,
                'message': 'Reset token generated successfully'
            }
            
        except Exception as e:
            logger.error(f"Password reset token generation error: {e}")
            return {
                'success': False,
                'message': 'Failed to generate reset token'
            }
    
    def verify_password_reset_token(self, token: str) -> Dict[str, Any]:
        """
        Verify a password reset token
        
        Args:
            token: Password reset token
            
        Returns:
            Dictionary with success status and email information
        """
        try:
            # Verify and extract email from token
            email = self.token_serializer.loads(
                token, 
                salt='password-reset',
                max_age=self.token_max_age
            )
            
            # Find user
            user = User.query.filter_by(email=email.lower()).first()
            
            if not user:
                return {
                    'success': False,
                    'message': 'Invalid token'
                }
            
            return {
                'success': True,
                'email': email,
                'user': user
            }
            
        except SignatureExpired:
            return {
                'success': False,
                'message': 'Reset token has expired. Please request a new one.'
            }
        except BadSignature:
            return {
                'success': False,
                'message': 'Invalid reset token'
            }
        except Exception as e:
            logger.error(f"Token verification error: {e}")
            return {
                'success': False,
                'message': 'Token verification failed'
            }
    
    def reset_password(self, token: str, new_password: str) -> Dict[str, Any]:
        """
        Reset user password using a valid token
        
        Args:
            token: Password reset token
            new_password: New password
            
        Returns:
            Dictionary with success status
        """
        try:
            # Verify token first
            token_result = self.verify_password_reset_token(token)
            
            if not token_result['success']:
                return token_result
            
            user = token_result['user']
            
            # Set new password
            user.set_password(new_password)
            db.session.commit()
            
            logger.info(f"Password reset successful for user: {user.username}")
            
            return {
                'success': True,
                'message': 'Password reset successful'
            }
            
        except Exception as e:
            db.session.rollback()
            logger.error(f"Password reset error: {e}")
            return {
                'success': False,
                'message': 'Password reset failed due to server error'
            }
    
    def change_password(self, user: User, current_password: str, new_password: str) -> Dict[str, Any]:
        """
        Change user password after verifying current password
        
        Args:
            user: User object
            current_password: Current password
            new_password: New password
            
        Returns:
            Dictionary with success status
        """
        try:
            if user.is_oauth_user:
                return {
                    'success': False,
                    'message': 'OAuth users cannot change password through this method'
                }
            
            # Verify current password
            if not user.check_password(current_password):
                return {
                    'success': False,
                    'message': 'Current password is incorrect'
                }
            
            # Set new password
            user.set_password(new_password)
            db.session.commit()
            
            logger.info(f"Password changed successfully for user: {user.username}")
            
            return {
                'success': True,
                'message': 'Password changed successfully'
            }
            
        except Exception as e:
            db.session.rollback()
            logger.error(f"Password change error: {e}")
            return {
                'success': False,
                'message': 'Password change failed due to server error'
            }