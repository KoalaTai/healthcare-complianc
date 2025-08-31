"""
Monitoring routes for API v2
Provides health checks, status monitoring, and AI provider information
"""
from flask import Blueprint, jsonify
import logging
from datetime import datetime

from utils.ai_router import get_ai_router

logger = logging.getLogger(__name__)

monitoring_bp = Blueprint('monitoring', __name__)


@monitoring_bp.route('/health')
def health():
    """Simple health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'service': 'VirtualBackroom.ai API v2'
    })


@monitoring_bp.route('/providers/status')
def providers_status():
    """Get status of all AI providers"""
    try:
        ai_router = get_ai_router()
        provider_status = ai_router.get_provider_status()
        
        return jsonify({
            'success': True,
            'providers': provider_status,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Provider status error: {e}")
        return jsonify({
            'success': False,
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500


@monitoring_bp.route('/fallbacks')
def fallback_events():
    """Get recent fallback events"""
    try:
        ai_router = get_ai_router()
        events = ai_router.get_fallback_events(limit=50)
        
        return jsonify({
            'success': True,
            'fallback_events': events,
            'count': len(events),
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Fallback events error: {e}")
        return jsonify({
            'success': False,
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500


@monitoring_bp.route('/stats')
def provider_stats():
    """Get usage statistics for all providers"""
    try:
        ai_router = get_ai_router()
        health_status = ai_router.get_health_status()
        provider_status = ai_router.get_provider_status()
        
        # Compile comprehensive stats
        stats = {
            'overall': {
                'health': health_status['status'],
                'total_providers': health_status['total_providers'],
                'available_providers': health_status['available_providers'],
                'overall_success_rate': health_status['overall_success_rate'],
                'total_requests': health_status['total_requests']
            },
            'providers': {}
        }
        
        # Add detailed provider stats
        for provider_name, status in provider_status.items():
            stats['providers'][provider_name] = {
                'available': status['available'],
                'features': status['supported_features'],
                'success_rate': status['success_rate'],
                'total_requests': status['stats']['total_requests'],
                'successful_requests': status['stats']['successful_requests'],
                'failed_requests': status['stats']['failed_requests'],
                'average_response_time': status['stats']['average_response_time_ms']
            }
        
        return jsonify({
            'success': True,
            'stats': stats,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Provider stats error: {e}")
        return jsonify({
            'success': False,
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500


@monitoring_bp.route('/system/info')
def system_info():
    """Get comprehensive system information"""
    try:
        ai_router = get_ai_router()
        health_status = ai_router.get_health_status()
        
        system_data = {
            'service': {
                'name': 'VirtualBackroom.ai',
                'version': '2.0',
                'api_version': 'v2'
            },
            'ai_router': {
                'status': health_status['status'],
                'default_provider': health_status['default_provider'],
                'fallback_chain': health_status['fallback_chain'],
                'available_providers': health_status['available_providers'],
                'total_providers': health_status['total_providers']
            },
            'timestamp': datetime.now().isoformat()
        }
        
        return jsonify({
            'success': True,
            'system': system_data
        })
        
    except Exception as e:
        logger.error(f"System info error: {e}")
        return jsonify({
            'success': False,
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500