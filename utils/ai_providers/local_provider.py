"""
Local Fallback Provider Implementation
Provides fallback responses when all external providers fail
"""
import logging
from typing import List, Dict, Any, Tuple, Optional

from .base import BaseAIClient

logger = logging.getLogger(__name__)


class LocalFallbackClient(BaseAIClient):
    """
    Local fallback client that provides generic responses when all external providers fail.
    This ensures the application never fails silently.
    """
    
    def __init__(self):
        logger.info("Local fallback client initialized")
    
    def is_available(self) -> bool:
        """Local fallback is always available"""
        return True
    
    def generate_chat_completion(
        self, 
        messages: List[Dict[str, str]], 
        max_tokens: Optional[int] = None,
        temperature: float = 0.7,
        **kwargs
    ) -> Tuple[bool, str, Dict[str, Any]]:
        """
        Generate a generic fallback response
        
        Args:
            messages: List of message dictionaries (analyzed for context)
            max_tokens: Ignored for fallback
            temperature: Ignored for fallback
            **kwargs: Ignored for fallback
            
        Returns:
            Tuple of (success, generic_response, metadata)
        """
        try:
            # Analyze the conversation to provide a more contextual response
            context = self._analyze_conversation_context(messages)
            response = self._generate_contextual_response(context)
            
            metadata = {
                "model": "local-fallback",
                "provider": "local",
                "context_detected": context,
                "prompt_tokens": sum(len(msg.get('content', '').split()) for msg in messages),
                "completion_tokens": len(response.split()),
            }
            
            return True, response, metadata
            
        except Exception as e:
            logger.error(f"Local fallback error: {e}")
            # Even the fallback should not fail
            return True, self._get_ultimate_fallback_response(), {
                "model": "local-fallback",
                "provider": "local",
                "error": str(e)
            }
    
    def generate_embedding(
        self, 
        text: str, 
        **kwargs
    ) -> Tuple[bool, List[float], Dict[str, Any]]:
        """
        Generate a dummy embedding vector
        Note: This is not useful for actual semantic operations
        """
        # Generate a dummy embedding of standard size (1536 dimensions like OpenAI)
        dummy_embedding = [0.0] * 1536
        
        metadata = {
            "model": "local-fallback-embedding",
            "provider": "local", 
            "dimensions": 1536,
            "warning": "This is a dummy embedding and should not be used for production"
        }
        
        return True, dummy_embedding, metadata
    
    def _analyze_conversation_context(self, messages: List[Dict[str, str]]) -> str:
        """
        Analyze the conversation to determine context
        
        Args:
            messages: List of message dictionaries
            
        Returns:
            Context string for response generation
        """
        # Combine all message content for analysis
        full_text = " ".join([msg.get('content', '') for msg in messages]).lower()
        
        # Define context keywords
        contexts = {
            'regulatory': ['regulation', 'compliance', 'fda', 'iso', 'audit', 'standard', 'requirement'],
            'simulation': ['simulation', 'audit', 'exercise', 'training', 'practice'],
            'technical': ['error', 'bug', 'issue', 'problem', 'api', 'system'],
            'help': ['help', 'how', 'what', 'why', 'guide', 'tutorial'],
            'analysis': ['analyze', 'analysis', 'document', 'review', 'gap', 'assessment'],
        }
        
        # Find the most relevant context
        context_scores = {}
        for context, keywords in contexts.items():
            score = sum(1 for keyword in keywords if keyword in full_text)
            if score > 0:
                context_scores[context] = score
        
        if context_scores:
            return max(context_scores.items(), key=lambda x: x[1])[0]
        else:
            return 'general'
    
    def _generate_contextual_response(self, context: str) -> str:
        """
        Generate a contextual fallback response based on detected context
        
        Args:
            context: Detected conversation context
            
        Returns:
            Appropriate fallback response
        """
        responses = {
            'regulatory': (
                "I'm currently unable to access my advanced regulatory knowledge base. "
                "For accurate regulatory compliance guidance, please consult official "
                "documentation or try again later when my AI services are restored. "
                "For immediate assistance with FDA, ISO, or other regulatory standards, "
                "please refer to the regulatory browser feature."
            ),
            'simulation': (
                "I'm temporarily unable to provide simulation guidance. "
                "You can continue with your audit simulation using the standard controls. "
                "My advanced AI assistance will be restored shortly. In the meantime, "
                "refer to the simulation help documentation for basic guidance."
            ),
            'technical': (
                "I'm experiencing technical difficulties accessing my AI capabilities. "
                "Please try your request again in a few moments. If the issue persists, "
                "check the system status or contact support for assistance."
            ),
            'help': (
                "I'm currently unable to provide detailed help due to AI service issues. "
                "Please refer to the built-in documentation, help guides, or try again "
                "later when my full capabilities are restored."
            ),
            'analysis': (
                "Document analysis capabilities are temporarily unavailable. "
                "Please save your document and try the analysis again later. "
                "The AI analysis engine will be restored as soon as possible."
            ),
            'general': (
                "I'm currently experiencing connectivity issues with my AI knowledge base. "
                "Please try your request again in a few moments. I apologize for the "
                "inconvenience and appreciate your patience."
            )
        }
        
        return responses.get(context, responses['general'])
    
    def _get_ultimate_fallback_response(self) -> str:
        """
        Ultimate fallback response that should never fail
        
        Returns:
            Basic fallback message
        """
        return (
            "AI services are temporarily unavailable. Please try again later. "
            "We apologize for the inconvenience."
        )
    
    def get_supported_features(self) -> List[str]:
        """Get supported features for local fallback"""
        return ['chat_completion', 'embedding']  # Basic support for both
    
    def get_provider_name(self) -> str:
        """Get provider name"""
        return "local_fallback"