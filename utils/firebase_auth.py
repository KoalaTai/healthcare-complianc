"""
Firebase Authentication Utilities
Handles Firebase token verification and user management
"""
import os
import logging
from typing import Dict, Any, Optional

try:
    import firebase_admin
    from firebase_admin import auth, credentials
    FIREBASE_AVAILABLE = True
except ImportError:
    FIREBASE_AVAILABLE = False

logger = logging.getLogger(__name__)

# Global Firebase app instance
_firebase_app = None


def initialize_firebase() -> bool:
    """
    Initialize Firebase Admin SDK
    
    Returns:
        bool: True if initialization successful, False otherwise
    """
    global _firebase_app
    
    if not FIREBASE_AVAILABLE:
        logger.warning("Firebase Admin SDK not available")
        return False
    
    if _firebase_app is not None:
        return True  # Already initialized
    
    try:
        # Check if we have a service account key file
        service_account_path = os.getenv('FIREBASE_SERVICE_ACCOUNT_PATH')
        
        if service_account_path and os.path.exists(service_account_path):
            # Initialize with service account key file
            cred = credentials.Certificate(service_account_path)
            _firebase_app = firebase_admin.initialize_app(cred)
            logger.info("Firebase initialized with service account key")
        else:
            # Initialize with default credentials (for production)
            # This will use Application Default Credentials (ADC)
            try:
                _firebase_app = firebase_admin.initialize_app()
                logger.info("Firebase initialized with default credentials")
            except Exception as e:
                logger.warning(f"Failed to initialize Firebase with default credentials: {e}")
                return False
        
        return True
        
    except Exception as e:
        logger.error(f"Firebase initialization error: {e}")
        return False


def verify_firebase_token(id_token: str) -> Optional[Dict[str, Any]]:
    """
    Verify Firebase ID token and extract user information
    
    Args:
        id_token: Firebase ID token from client
        
    Returns:
        Dict with user information or None if verification fails
    """
    if not FIREBASE_AVAILABLE:
        logger.warning("Firebase not available for token verification")
        return None
    
    try:
        # Initialize Firebase if not already done
        if not initialize_firebase():
            logger.error("Firebase not initialized")
            return None
        
        # Verify the ID token
        decoded_token = auth.verify_id_token(id_token)
        
        # Extract user information
        user_info = {
            'uid': decoded_token.get('uid'),
            'email': decoded_token.get('email'),
            'email_verified': decoded_token.get('email_verified', False),
            'name': decoded_token.get('name', ''),
            'picture': decoded_token.get('picture'),
            'provider': decoded_token.get('firebase', {}).get('sign_in_provider', 'unknown')
        }
        
        logger.info(f"Firebase token verified for user: {user_info.get('email', 'unknown')}")
        return user_info
        
    except firebase_admin.auth.InvalidIdTokenError:
        logger.warning("Invalid Firebase ID token")
        return None
    except firebase_admin.auth.ExpiredIdTokenError:
        logger.warning("Expired Firebase ID token")
        return None
    except Exception as e:
        logger.error(f"Firebase token verification error: {e}")
        return None


def get_firebase_user(uid: str) -> Optional[Dict[str, Any]]:
    """
    Get Firebase user information by UID
    
    Args:
        uid: Firebase user UID
        
    Returns:
        Dict with user information or None if not found
    """
    if not FIREBASE_AVAILABLE:
        return None
    
    try:
        if not initialize_firebase():
            return None
        
        user_record = auth.get_user(uid)
        
        return {
            'uid': user_record.uid,
            'email': user_record.email,
            'email_verified': user_record.email_verified,
            'display_name': user_record.display_name,
            'photo_url': user_record.photo_url,
            'disabled': user_record.disabled,
            'creation_timestamp': user_record.user_metadata.creation_timestamp,
            'last_sign_in_timestamp': user_record.user_metadata.last_sign_in_timestamp
        }
        
    except firebase_admin.auth.UserNotFoundError:
        logger.warning(f"Firebase user not found: {uid}")
        return None
    except Exception as e:
        logger.error(f"Error getting Firebase user: {e}")
        return None


def create_custom_token(uid: str, additional_claims: Optional[Dict[str, Any]] = None) -> Optional[str]:
    """
    Create a custom Firebase token for a user
    
    Args:
        uid: User UID
        additional_claims: Additional claims to include in token
        
    Returns:
        Custom token string or None if creation fails
    """
    if not FIREBASE_AVAILABLE:
        return None
    
    try:
        if not initialize_firebase():
            return None
        
        custom_token = auth.create_custom_token(uid, additional_claims)
        return custom_token.decode('utf-8')
        
    except Exception as e:
        logger.error(f"Error creating custom token: {e}")
        return None


def revoke_refresh_tokens(uid: str) -> bool:
    """
    Revoke all refresh tokens for a user
    
    Args:
        uid: User UID
        
    Returns:
        bool: True if successful, False otherwise
    """
    if not FIREBASE_AVAILABLE:
        return False
    
    try:
        if not initialize_firebase():
            return False
        
        auth.revoke_refresh_tokens(uid)
        logger.info(f"Refresh tokens revoked for user: {uid}")
        return True
        
    except Exception as e:
        logger.error(f"Error revoking refresh tokens: {e}")
        return False


class MockFirebaseAuth:
    """
    Mock Firebase authentication for development when Firebase is not available
    """
    
    @staticmethod
    def verify_mock_token(token: str) -> Optional[Dict[str, Any]]:
        """
        Mock token verification for development
        
        Args:
            token: Mock token (in development, this could be any string)
            
        Returns:
            Mock user data
        """
        if token == 'mock-firebase-token':
            return {
                'uid': 'mock-uid-123',
                'email': 'developer@example.com',
                'email_verified': True,
                'name': 'Development User',
                'picture': None,
                'provider': 'mock'
            }
        return None


# Public interface functions that handle fallbacks
def verify_token(id_token: str) -> Optional[Dict[str, Any]]:
    """
    Public interface for token verification with fallback to mock in development
    
    Args:
        id_token: ID token to verify
        
    Returns:
        User information dict or None
    """
    # Try Firebase verification first
    result = verify_firebase_token(id_token)
    
    if result is None and os.getenv('FLASK_ENV') == 'development':
        # Fallback to mock in development
        logger.info("Using mock Firebase authentication for development")
        result = MockFirebaseAuth.verify_mock_token(id_token)
    
    return result


def is_firebase_configured() -> bool:
    """
    Check if Firebase is properly configured
    
    Returns:
        bool: True if Firebase is available and configured
    """
    if not FIREBASE_AVAILABLE:
        return False
    
    return initialize_firebase()