"""
Main Flask application factory for VirtualBackroom.ai
Implements application factory pattern for modularity and testability
"""
import os
import logging
from flask import Flask, request, jsonify, render_template
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from flask_migrate import Migrate
from flask_wtf.csrf import CSRFProtect
from werkzeug.exceptions import HTTPException

from config import config
from models import db, User

# Initialize extensions
login_manager = LoginManager()
migrate = Migrate()
csrf = CSRFProtect()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


def create_app(config_override=None) -> Flask:
    """
    Application factory function
    Creates and configures the Flask application instance
    
    Args:
        config_override: Optional configuration override for testing
        
    Returns:
        Configured Flask application
    """
    app = Flask(__name__)
    
    # Load configuration
    app_config = config_override or config
    app.config.update(app_config.flask_config)
    
    # Initialize extensions with app
    db.init_app(app)
    login_manager.init_app(app)
    migrate.init_app(app, db)
    csrf.init_app(app)
    
    # Configure Flask-Login
    login_manager.login_view = 'auth.login'
    login_manager.login_message = 'Please log in to access this page.'
    login_manager.login_message_category = 'info'
    
    @login_manager.user_loader
    def load_user(user_id):
        """Load user for Flask-Login"""
        try:
            return db.session.get(User, int(user_id))
        except (ValueError, TypeError):
            return None
    
    # Configure security headers
    @app.after_request
    def add_security_headers(response):
        """Add security headers to all responses"""
        # Content Security Policy
        csp = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://www.gstatic.com; "
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net; "
            "font-src 'self' https://fonts.gstatic.com; "
            "img-src 'self' data: https:; "
            "connect-src 'self' https://api.openai.com https://api.anthropic.com https://generativelanguage.googleapis.com; "
            "frame-ancestors 'none';"
        )
        response.headers['Content-Security-Policy'] = csp
        
        # Other security headers
        response.headers['X-Content-Type-Options'] = 'nosniff'
        response.headers['X-Frame-Options'] = 'DENY'
        response.headers['X-XSS-Protection'] = '1; mode=block'
        response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
        
        return response
    
    # Register error handlers
    register_error_handlers(app)
    
    # Register blueprints
    register_blueprints(app)
    
    # Add template context processors
    register_template_context(app)
    
    # Create database tables
    with app.app_context():
        try:
            db.create_all()
            logger.info("Database tables created successfully")
        except Exception as e:
            logger.error(f"Failed to create database tables: {e}")
    
    logger.info("Flask application created successfully")
    return app


def register_blueprints(app: Flask):
    """Register all application blueprints"""
    try:
        # Import and register blueprints
        from blueprints.auth_routes import auth_bp
        from blueprints.core_routes import core_bp
        from blueprints.api_v2 import api_v2_bp
        
        # Register with URL prefixes
        app.register_blueprint(auth_bp, url_prefix='/auth')
        app.register_blueprint(core_bp)
        app.register_blueprint(api_v2_bp, url_prefix='/api/v2')
        
        logger.info("Blueprints registered successfully")
        
    except ImportError as e:
        logger.error(f"Failed to import blueprints: {e}")
        # Create minimal blueprints for development
        from flask import Blueprint
        
        # Create a minimal core blueprint
        minimal_core_bp = Blueprint('core', __name__)
        minimal_auth_bp = Blueprint('auth', __name__)
        
        @minimal_core_bp.route('/')
        def index():
            return render_template('index.html')
            
        @minimal_auth_bp.route('/login')
        def login():
            return "Login page - please run init_db.py first"
        
        app.register_blueprint(minimal_core_bp)
        app.register_blueprint(minimal_auth_bp, url_prefix='/auth')
        logger.info("Minimal blueprints registered for development")


def register_error_handlers(app: Flask):
    """Register custom error handlers"""
    
    @app.errorhandler(404)
    def not_found(error):
        """Handle 404 errors"""
        if request.is_json:
            return jsonify({'error': 'Resource not found'}), 404
        return render_template('errors/404.html'), 404
    
    @app.errorhandler(500)
    def internal_error(error):
        """Handle 500 errors"""
        db.session.rollback()
        logger.error(f"Internal server error: {error}")
        
        if request.is_json:
            return jsonify({'error': 'Internal server error'}), 500
        return render_template('errors/500.html'), 500
    
    @app.errorhandler(403)
    def forbidden(error):
        """Handle 403 errors"""
        if request.is_json:
            return jsonify({'error': 'Access forbidden'}), 403
        return render_template('errors/403.html'), 403
    
    @app.errorhandler(HTTPException)
    def handle_http_exception(error):
        """Handle all other HTTP exceptions"""
        if request.is_json:
            return jsonify({'error': error.description}), error.code
        return render_template('errors/generic.html', error=error), error.code


def register_template_context(app: Flask):
    """Register template context processors"""
    
    @app.context_processor
    def inject_config():
        """Inject configuration into templates"""
        return {
            'app_name': 'VirtualBackroom.ai',
            'app_version': '2.0',
            'debug': app.config.get('DEBUG', False)
        }
    
    @app.context_processor
    def inject_user_context():
        """Inject user context into templates"""
        from flask_login import current_user
        return {
            'current_user': current_user
        }


# Create the application instance
app = create_app()


if __name__ == '__main__':
    """Run the application in development mode"""
    host = config.app_host
    port = config.app_port
    debug = config.security.debug
    
    logger.info(f"Starting VirtualBackroom.ai server on {host}:{port}")
    logger.info(f"Debug mode: {debug}")
    
    app.run(host=host, port=port, debug=debug)