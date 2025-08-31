"""
API v2 Blueprint - Main API routes
Consolidated API endpoints for VirtualBackroom.ai
"""
from flask import Blueprint, jsonify, request
from flask_login import login_required, current_user
import logging

from .monitoring_routes import monitoring_bp
from .help_routes import help_bp

logger = logging.getLogger(__name__)

# Create main API blueprint
api_v2_bp = Blueprint('api_v2', __name__)

# Register sub-blueprints
api_v2_bp.register_blueprint(monitoring_bp, url_prefix='/monitoring')
api_v2_bp.register_blueprint(help_bp, url_prefix='/help')


@api_v2_bp.route('/version')
def version():
    """Get API version information"""
    return jsonify({
        'version': '2.0',
        'name': 'VirtualBackroom.ai API',
        'status': 'active',
        'features': [
            'AI-powered document analysis',
            'Multi-provider AI routing',
            'Audit simulations',
            'Regulatory knowledge base',
            'Citation suggestions'
        ]
    })


@api_v2_bp.route('/user/profile')
@login_required
def user_profile():
    """Get current user profile"""
    try:
        return jsonify({
            'success': True,
            'user': {
                'id': current_user.id,
                'username': current_user.username,
                'email': current_user.email,
                'full_name': current_user.full_name,
                'first_name': current_user.first_name,
                'last_name': current_user.last_name,
                'organization': current_user.organization,
                'job_title': current_user.job_title,
                'role': current_user.role.value,
                'is_oauth_user': current_user.is_oauth_user,
                'date_registered': current_user.date_registered.isoformat(),
                'last_login': current_user.last_login.isoformat() if current_user.last_login else None
            }
        })
    except Exception as e:
        logger.error(f"User profile API error: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500


# Error handlers for API blueprint
@api_v2_bp.errorhandler(404)
def api_not_found(error):
    """Handle 404 errors in API"""
    return jsonify({
        'success': False,
        'error': 'API endpoint not found',
        'message': 'The requested API endpoint does not exist'
    }), 404


@api_v2_bp.errorhandler(500)
def api_internal_error(error):
    """Handle 500 errors in API"""
    logger.error(f"API internal error: {error}")
    return jsonify({
        'success': False,
        'error': 'Internal server error',
        'message': 'An internal error occurred while processing your request'
    }), 500