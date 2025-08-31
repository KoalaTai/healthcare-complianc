"""
Help assistant routes for API v2
Provides AI-powered help and support functionality
"""
from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
import logging
from datetime import datetime

from models import db, HelpConversation, HelpMessage
from utils.ai_router import get_ai_router

logger = logging.getLogger(__name__)

help_bp = Blueprint('help', __name__)


@help_bp.route('/assistant', methods=['POST'])
def help_assistant():
    """
    AI-powered help assistant endpoint
    Can be used by both authenticated and anonymous users
    """
    try:
        data = request.get_json()
        if not data:
            return jsonify({
                'success': False,
                'error': 'JSON data required'
            }), 400
        
        query = data.get('query', '').strip()
        context = data.get('context', 'general')
        page_url = data.get('page_url', '')
        
        if not query:
            return jsonify({
                'success': False,
                'error': 'Query is required'
            }), 400
        
        # Get or create conversation for authenticated users
        conversation = None
        if current_user.is_authenticated:
            conversation = _get_or_create_conversation(
                user_id=current_user.id,
                context=context,
                page_url=page_url
            )
        
        # Build system prompt based on context
        system_prompt = _build_help_system_prompt(context, page_url)
        
        # Get conversation history for authenticated users
        messages = [{"role": "system", "content": system_prompt}]
        
        if conversation:
            # Add recent conversation history
            recent_messages = HelpMessage.query.filter_by(
                conversation_id=conversation.id
            ).order_by(HelpMessage.created_date.desc()).limit(10).all()
            
            # Add messages in chronological order
            for msg in reversed(recent_messages):
                messages.append({
                    "role": msg.role,
                    "content": msg.content
                })
        
        # Add current query
        messages.append({"role": "user", "content": query})
        
        # Get AI response
        ai_router = get_ai_router()
        success, response, metadata = ai_router.generate_chat_completion(
            messages=messages,
            temperature=0.3,  # Lower temperature for more consistent help responses
            max_tokens=1000
        )
        
        if not success:
            return jsonify({
                'success': False,
                'error': 'AI service temporarily unavailable',
                'details': response
            }), 503
        
        # Save conversation for authenticated users
        if conversation:
            # Save user message
            user_message = HelpMessage(
                conversation_id=conversation.id,
                role='user',
                content=query
            )
            db.session.add(user_message)
            
            # Save assistant response
            assistant_message = HelpMessage(
                conversation_id=conversation.id,
                role='assistant',
                content=response,
                ai_provider=metadata.get('router_provider_used'),
                processing_time_ms=metadata.get('router_response_time_ms')
            )
            db.session.add(assistant_message)
            
            # Update conversation timestamp
            conversation.updated_date = datetime.now()
            db.session.commit()
        
        return jsonify({
            'success': True,
            'response': response,
            'context': context,
            'conversation_id': conversation.id if conversation else None,
            'metadata': {
                'provider': metadata.get('router_provider_used'),
                'response_time_ms': metadata.get('router_response_time_ms')
            }
        })
        
    except Exception as e:
        logger.error(f"Help assistant error: {e}")
        if conversation:
            db.session.rollback()
        return jsonify({
            'success': False,
            'error': 'Help service temporarily unavailable'
        }), 500


@help_bp.route('/conversations')
@login_required
def get_conversations():
    """Get user's help conversations"""
    try:
        conversations = HelpConversation.query.filter_by(
            user_id=current_user.id,
            is_active=True
        ).order_by(HelpConversation.updated_date.desc()).limit(20).all()
        
        conversations_data = []
        for conv in conversations:
            # Get last message for preview
            last_message = HelpMessage.query.filter_by(
                conversation_id=conv.id
            ).order_by(HelpMessage.created_date.desc()).first()
            
            conversations_data.append({
                'id': conv.id,
                'title': conv.title or 'Help Conversation',
                'context': conv.context,
                'page_url': conv.page_url,
                'created_date': conv.created_date.isoformat(),
                'updated_date': conv.updated_date.isoformat(),
                'last_message_preview': last_message.content[:100] + '...' if last_message and len(last_message.content) > 100 else last_message.content if last_message else None,
                'message_count': HelpMessage.query.filter_by(conversation_id=conv.id).count()
            })
        
        return jsonify({
            'success': True,
            'conversations': conversations_data
        })
        
    except Exception as e:
        logger.error(f"Get conversations error: {e}")
        return jsonify({
            'success': False,
            'error': 'Failed to retrieve conversations'
        }), 500


@help_bp.route('/conversations/<int:conversation_id>/messages')
@login_required
def get_conversation_messages(conversation_id):
    """Get messages for a specific conversation"""
    try:
        # Verify conversation belongs to user
        conversation = HelpConversation.query.filter_by(
            id=conversation_id,
            user_id=current_user.id
        ).first()
        
        if not conversation:
            return jsonify({
                'success': False,
                'error': 'Conversation not found'
            }), 404
        
        # Get messages
        messages = HelpMessage.query.filter_by(
            conversation_id=conversation_id
        ).order_by(HelpMessage.created_date.asc()).all()
        
        messages_data = [{
            'id': msg.id,
            'role': msg.role,
            'content': msg.content,
            'created_date': msg.created_date.isoformat(),
            'ai_provider': msg.ai_provider,
            'processing_time_ms': msg.processing_time_ms
        } for msg in messages]
        
        return jsonify({
            'success': True,
            'conversation': {
                'id': conversation.id,
                'title': conversation.title,
                'context': conversation.context,
                'page_url': conversation.page_url
            },
            'messages': messages_data
        })
        
    except Exception as e:
        logger.error(f"Get conversation messages error: {e}")
        return jsonify({
            'success': False,
            'error': 'Failed to retrieve conversation messages'
        }), 500


def _get_or_create_conversation(user_id: int, context: str, page_url: str) -> HelpConversation:
    """Get existing conversation or create new one"""
    # Look for recent conversation with same context
    recent_conversation = HelpConversation.query.filter_by(
        user_id=user_id,
        context=context,
        is_active=True
    ).order_by(HelpConversation.updated_date.desc()).first()
    
    # If recent conversation exists (within last hour), use it
    if recent_conversation:
        time_since_update = datetime.now() - recent_conversation.updated_date
        if time_since_update.total_seconds() < 3600:  # 1 hour
            return recent_conversation
    
    # Create new conversation
    conversation = HelpConversation(
        user_id=user_id,
        context=context,
        page_url=page_url
    )
    db.session.add(conversation)
    db.session.flush()  # Get ID without committing
    
    return conversation


def _build_help_system_prompt(context: str, page_url: str) -> str:
    """Build contextual system prompt for help assistant"""
    base_prompt = """You are a helpful AI assistant for VirtualBackroom.ai, a regulatory compliance platform for medical device companies. 

You specialize in:
- Medical device regulations (FDA QSR, EU MDR, ISO 13485, etc.)
- Audit preparation and simulation
- Document analysis and gap assessment
- Regulatory compliance best practices
- Platform features and navigation

Provide clear, accurate, and actionable guidance. When discussing regulations, always emphasize that your guidance is informational and should be verified with official sources and qualified professionals."""
    
    context_additions = {
        'dashboard': "\n\nThe user is on the dashboard page, which shows an overview of their simulations, documents, and notifications.",
        'simulation_detail': "\n\nThe user is viewing an audit simulation. They can manage findings, request documents, assign roles, and track progress.",
        'document_analysis': "\n\nThe user is in the document analysis section where they can upload documents for AI-powered gap analysis.",
        'regulatory_browser': "\n\nThe user is browsing the regulatory knowledge base, which contains standards like FDA QSR, ISO 13485, EU MDR, etc.",
        'profile': "\n\nThe user is on their profile page where they can manage account settings and preferences."
    }
    
    if context in context_additions:
        base_prompt += context_additions[context]
    
    if page_url:
        base_prompt += f"\n\nCurrent page context: {page_url}"
    
    return base_prompt