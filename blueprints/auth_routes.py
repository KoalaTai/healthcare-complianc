"""
Authentication routes blueprint
Handles user registration, login, logout, and OAuth flows
"""
from flask import Blueprint, render_template, redirect, url_for, flash, request, jsonify, current_app
from flask_login import login_user, logout_user, current_user, login_required
from werkzeug.security import generate_password_hash
from werkzeug.urls import url_parse
import logging
from datetime import datetime

from models import db, User
from src.services.auth_service import AuthService

logger = logging.getLogger(__name__)

auth_bp = Blueprint('auth', __name__)
auth_service = AuthService()


@auth_bp.route('/register', methods=['GET', 'POST'])
def register():
    """User registration"""
    if current_user.is_authenticated:
        return redirect(url_for('core.dashboard'))
    
    if request.method == 'POST':
        try:
            # Get form data
            username = request.form.get('username', '').strip()
            email = request.form.get('email', '').strip().lower()
            password = request.form.get('password', '')
            confirm_password = request.form.get('confirm_password', '')
            first_name = request.form.get('first_name', '').strip()
            last_name = request.form.get('last_name', '').strip()
            organization = request.form.get('organization', '').strip()
            
            # Basic validation
            if not all([username, email, password, confirm_password]):
                flash('All required fields must be filled', 'error')
                return render_template('auth/register.html')
            
            if password != confirm_password:
                flash('Passwords do not match', 'error')
                return render_template('auth/register.html')
            
            if len(password) < 8:
                flash('Password must be at least 8 characters long', 'error')
                return render_template('auth/register.html')
            
            # Check if user already exists
            if User.query.filter_by(username=username).first():
                flash('Username already exists', 'error')
                return render_template('auth/register.html')
            
            if User.query.filter_by(email=email).first():
                flash('Email already registered', 'error')
                return render_template('auth/register.html')
            
            # Create new user using auth service
            result = auth_service.register_user({
                'username': username,
                'email': email,
                'password': password,
                'first_name': first_name,
                'last_name': last_name,
                'organization': organization
            })
            
            if result['success']:
                flash('Registration successful! Please log in.', 'success')
                return redirect(url_for('auth.login'))
            else:
                flash(result.get('message', 'Registration failed'), 'error')
                return render_template('auth/register.html')
        
        except Exception as e:
            logger.error(f"Registration error: {e}")
            flash('Registration failed due to server error', 'error')
            return render_template('auth/register.html')
    
    return render_template('auth/register.html')


@auth_bp.route('/login', methods=['GET', 'POST'])
def login():
    """User login"""
    if current_user.is_authenticated:
        return redirect(url_for('core.dashboard'))
    
    if request.method == 'POST':
        try:
            username_or_email = request.form.get('username_or_email', '').strip()
            password = request.form.get('password', '')
            remember = bool(request.form.get('remember'))
            
            if not username_or_email or not password:
                flash('Username/email and password are required', 'error')
                return render_template('auth/login.html')
            
            # Attempt login using auth service
            result = auth_service.login_with_credentials(username_or_email, password)
            
            if result['success']:
                user = result['user']
                login_user(user, remember=remember)
                
                # Update last login
                user.last_login = datetime.now()
                db.session.commit()
                
                # Handle next parameter for redirects
                next_page = request.args.get('next')
                if next_page and url_parse(next_page).netloc == '':
                    return redirect(next_page)
                
                flash(f'Welcome back, {user.username}!', 'success')
                return redirect(url_for('core.dashboard'))
            else:
                flash(result.get('message', 'Login failed'), 'error')
                return render_template('auth/login.html')
        
        except Exception as e:
            logger.error(f"Login error: {e}")
            flash('Login failed due to server error', 'error')
            return render_template('auth/login.html')
    
    return render_template('auth/login.html')


@auth_bp.route('/logout')
@login_required
def logout():
    """User logout"""
    username = current_user.username
    logout_user()
    flash(f'Goodbye, {username}!', 'info')
    return redirect(url_for('core.index'))


@auth_bp.route('/forgot-password', methods=['GET', 'POST'])
def forgot_password():
    """Forgot password form"""
    if current_user.is_authenticated:
        return redirect(url_for('core.dashboard'))
    
    if request.method == 'POST':
        try:
            email = request.form.get('email', '').strip().lower()
            
            if not email:
                flash('Email address is required', 'error')
                return render_template('auth/forgot_password.html')
            
            # Generate password reset token
            result = auth_service.generate_password_reset_token(email)
            
            if result['success']:
                flash('Password reset instructions have been sent to your email', 'success')
                # In a real application, you would send an email here
                logger.info(f"Password reset token generated for {email}: {result.get('token', 'N/A')}")
                return redirect(url_for('auth.login'))
            else:
                flash(result.get('message', 'Password reset failed'), 'error')
                return render_template('auth/forgot_password.html')
        
        except Exception as e:
            logger.error(f"Forgot password error: {e}")
            flash('Password reset failed due to server error', 'error')
            return render_template('auth/forgot_password.html')
    
    return render_template('auth/forgot_password.html')


@auth_bp.route('/reset-password/<token>', methods=['GET', 'POST'])
def reset_password(token):
    """Reset password with token"""
    if current_user.is_authenticated:
        return redirect(url_for('core.dashboard'))
    
    if request.method == 'POST':
        try:
            password = request.form.get('password', '')
            confirm_password = request.form.get('confirm_password', '')
            
            if not password or not confirm_password:
                flash('Both password fields are required', 'error')
                return render_template('auth/reset_password.html', token=token)
            
            if password != confirm_password:
                flash('Passwords do not match', 'error')
                return render_template('auth/reset_password.html', token=token)
            
            if len(password) < 8:
                flash('Password must be at least 8 characters long', 'error')
                return render_template('auth/reset_password.html', token=token)
            
            # Reset password using auth service
            result = auth_service.reset_password(token, password)
            
            if result['success']:
                flash('Password reset successful! Please log in with your new password.', 'success')
                return redirect(url_for('auth.login'))
            else:
                flash(result.get('message', 'Password reset failed'), 'error')
                return render_template('auth/reset_password.html', token=token)
        
        except Exception as e:
            logger.error(f"Reset password error: {e}")
            flash('Password reset failed due to server error', 'error')
            return render_template('auth/reset_password.html', token=token)
    
    # Validate token before showing form
    try:
        result = auth_service.verify_password_reset_token(token)
        if not result['success']:
            flash('Invalid or expired reset token', 'error')
            return redirect(url_for('auth.forgot_password'))
    except Exception as e:
        logger.error(f"Token verification error: {e}")
        flash('Invalid reset token', 'error')
        return redirect(url_for('auth.forgot_password'))
    
    return render_template('auth/reset_password.html', token=token)


@auth_bp.route('/google-login', methods=['POST'])
def google_login():
    """Handle Google OAuth login"""
    try:
        data = request.get_json()
        if not data or 'id_token' not in data:
            return jsonify({'success': False, 'message': 'ID token required'}), 400
        
        id_token = data['id_token']
        
        # Authenticate with Firebase using auth service
        result = auth_service.login_with_firebase(id_token)
        
        if result['success']:
            user = result['user']
            login_user(user, remember=True)
            
            # Update last login
            user.last_login = datetime.now()
            db.session.commit()
            
            return jsonify({
                'success': True,
                'message': 'Login successful',
                'redirect_url': url_for('core.dashboard')
            })
        else:
            return jsonify({
                'success': False,
                'message': result.get('message', 'OAuth login failed')
            }), 401
    
    except Exception as e:
        logger.error(f"Google login error: {e}")
        return jsonify({
            'success': False,
            'message': 'OAuth login failed due to server error'
        }), 500


@auth_bp.route('/firebase-config.js')
def firebase_config():
    """Serve Firebase configuration as JavaScript"""
    try:
        firebase_config = {
            'apiKey': current_app.config.get('FIREBASE_API_KEY', ''),
            'authDomain': current_app.config.get('FIREBASE_AUTH_DOMAIN', ''),
            'projectId': current_app.config.get('FIREBASE_PROJECT_ID', ''),
            'storageBucket': current_app.config.get('FIREBASE_STORAGE_BUCKET', ''),
            'messagingSenderId': current_app.config.get('FIREBASE_MESSAGING_SENDER_ID', ''),
            'appId': current_app.config.get('FIREBASE_APP_ID', '')
        }
        
        config_js = f'''
        // Firebase configuration for VirtualBackroom.ai
        window.firebaseConfig = {firebase_config};
        '''
        
        response = current_app.response_class(
            config_js,
            mimetype='application/javascript'
        )
        response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
        return response
    
    except Exception as e:
        logger.error(f"Firebase config error: {e}")
        return jsonify({'error': 'Configuration unavailable'}), 500


@auth_bp.route('/profile/update', methods=['POST'])
@login_required
def update_profile():
    """Update user profile"""
    try:
        # Get form data
        first_name = request.form.get('first_name', '').strip()
        last_name = request.form.get('last_name', '').strip()
        organization = request.form.get('organization', '').strip()
        job_title = request.form.get('job_title', '').strip()
        
        # Update user
        current_user.first_name = first_name
        current_user.last_name = last_name
        current_user.organization = organization
        current_user.job_title = job_title
        
        db.session.commit()
        flash('Profile updated successfully', 'success')
        
    except Exception as e:
        logger.error(f"Profile update error: {e}")
        flash('Profile update failed', 'error')
    
    return redirect(url_for('core.profile'))