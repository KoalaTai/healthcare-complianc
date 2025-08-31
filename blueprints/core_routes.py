"""
Core routes blueprint for VirtualBackroom.ai
Handles main application pages and dashboard functionality
"""
from flask import Blueprint, render_template, redirect, url_for, flash, request, jsonify
from flask_login import login_required, current_user
from datetime import datetime
import logging

from models import db, AuditSimulation, User, Document, Notification
from utils.ai_router import get_ai_router

logger = logging.getLogger(__name__)

core_bp = Blueprint('core', __name__)


@core_bp.route('/')
def index():
    """Main landing page"""
    if current_user.is_authenticated:
        return redirect(url_for('core.dashboard'))
    return render_template('index.html')


@core_bp.route('/dashboard')
@login_required
def dashboard():
    """User dashboard with overview of activities"""
    try:
        # Get user's recent simulations
        recent_simulations = AuditSimulation.query.filter_by(
            creator_id=current_user.id
        ).order_by(AuditSimulation.created_date.desc()).limit(5).all()
        
        # Get user's documents
        recent_documents = Document.query.filter_by(
            user_id=current_user.id
        ).order_by(Document.upload_date.desc()).limit(5).all()
        
        # Get unread notifications
        notifications = Notification.query.filter_by(
            user_id=current_user.id,
            status='unread'
        ).order_by(Notification.created_date.desc()).limit(10).all()
        
        # Get AI router health status
        ai_router = get_ai_router()
        ai_status = ai_router.get_health_status()
        
        # Calculate dashboard statistics
        total_simulations = AuditSimulation.query.filter_by(creator_id=current_user.id).count()
        completed_simulations = AuditSimulation.query.filter_by(
            creator_id=current_user.id,
            status='completed'
        ).count()
        
        dashboard_stats = {
            'total_simulations': total_simulations,
            'completed_simulations': completed_simulations,
            'total_documents': Document.query.filter_by(user_id=current_user.id).count(),
            'unread_notifications': len(notifications)
        }
        
        return render_template('dashboard.html',
                             recent_simulations=recent_simulations,
                             recent_documents=recent_documents,
                             notifications=notifications,
                             dashboard_stats=dashboard_stats,
                             ai_status=ai_status)
    
    except Exception as e:
        logger.error(f"Dashboard error: {e}")
        flash('Error loading dashboard data', 'error')
        return render_template('dashboard.html',
                             recent_simulations=[],
                             recent_documents=[],
                             notifications=[],
                             dashboard_stats={},
                             ai_status={})


@core_bp.route('/profile')
@login_required
def profile():
    """User profile page"""
    return render_template('profile.html')


@core_bp.route('/about')
def about():
    """About page"""
    return render_template('about.html')


@core_bp.route('/features')
def features():
    """Features overview page"""
    return render_template('features.html')


@core_bp.route('/documentation')
@login_required
def documentation():
    """Documentation and help center"""
    return render_template('documentation.html')


@core_bp.route('/api/notifications')
@login_required
def api_notifications():
    """API endpoint to get user notifications"""
    try:
        notifications = Notification.query.filter_by(
            user_id=current_user.id
        ).order_by(Notification.created_date.desc()).limit(20).all()
        
        notifications_data = [{
            'id': n.id,
            'title': n.title,
            'message': n.message,
            'type': n.notification_type,
            'link': n.link,
            'status': n.status.value,
            'created_date': n.created_date.isoformat()
        } for n in notifications]
        
        return jsonify({
            'success': True,
            'notifications': notifications_data
        })
    
    except Exception as e:
        logger.error(f"Notifications API error: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@core_bp.route('/api/notifications/<int:notification_id>/mark_read', methods=['POST'])
@login_required
def mark_notification_read(notification_id):
    """Mark a notification as read"""
    try:
        notification = Notification.query.filter_by(
            id=notification_id,
            user_id=current_user.id
        ).first()
        
        if not notification:
            return jsonify({'success': False, 'error': 'Notification not found'}), 404
        
        notification.status = 'read'
        notification.read_date = datetime.now()
        db.session.commit()
        
        return jsonify({'success': True})
    
    except Exception as e:
        logger.error(f"Mark notification read error: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500


@core_bp.route('/system-status')
def system_status():
    """System status page for monitoring"""
    try:
        ai_router = get_ai_router()
        
        system_info = {
            'ai_router_health': ai_router.get_health_status(),
            'ai_providers': ai_router.get_provider_status(),
            'recent_fallbacks': ai_router.get_fallback_events(10),
            'database_connected': True,  # If we got here, DB is working
            'timestamp': datetime.now().isoformat()
        }
        
        return render_template('system_status.html', system_info=system_info)
    
    except Exception as e:
        logger.error(f"System status error: {e}")
        return render_template('system_status.html', 
                             system_info={'error': str(e)})


@core_bp.route('/api/system-health')
def api_system_health():
    """API endpoint for system health check"""
    try:
        ai_router = get_ai_router()
        health_status = ai_router.get_health_status()
        
        # Add database check
        try:
            db.session.execute(db.text('SELECT 1'))
            db_status = 'healthy'
        except Exception as e:
            db_status = 'unhealthy'
            logger.error(f"Database health check failed: {e}")
        
        overall_status = 'healthy'
        if health_status['status'] != 'healthy' or db_status != 'healthy':
            overall_status = 'degraded'
        
        return jsonify({
            'status': overall_status,
            'timestamp': datetime.now().isoformat(),
            'components': {
                'database': db_status,
                'ai_router': health_status['status']
            },
            'ai_providers': {
                'total': health_status['total_providers'],
                'available': health_status['available_providers']
            }
        })
    
    except Exception as e:
        logger.error(f"Health check error: {e}")
        return jsonify({
            'status': 'unhealthy',
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500


# Error handlers for this blueprint
@core_bp.errorhandler(404)
def core_not_found(error):
    """Handle 404 errors in core blueprint"""
    if request.is_json:
        return jsonify({'error': 'Page not found'}), 404
    return render_template('errors/404.html'), 404