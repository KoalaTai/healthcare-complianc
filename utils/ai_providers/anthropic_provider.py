"""
Anthropic Claude Provider Implementation
Provides integration with Anthropic's Claude models
"""
import os
import logging
from typing import List, Dict, Any, Tuple, Optional

try:
    from anthropic import Anthropic
    ANTHROPIC_AVAILABLE = True
except ImportError:
    ANTHROPIC_AVAILABLE = False

from .base import BaseAIClient

logger = logging.getLogger(__name__)


class AnthropicClient(BaseAIClient):
    """Anthropic Claude API client implementation"""
    
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("AI_PROVIDERS_ANTHROPIC_API_KEY")
        self.client = None
        
        if self.api_key and ANTHROPIC_AVAILABLE:
            try:
                self.client = Anthropic(api_key=self.api_key)
                logger.info("Anthropic client initialized successfully")
            except Exception as e:
                logger.error(f"Failed to initialize Anthropic client: {e}")
                self.client = None
        elif not ANTHROPIC_AVAILABLE:
            logger.warning("Anthropic library not available")
    
    def is_available(self) -> bool:
        """Check if Anthropic client is properly configured and available"""
        return (
            ANTHROPIC_AVAILABLE and 
            self.api_key is not None and 
            self.client is not None
        )
    
    def generate_chat_completion(
        self, 
        messages: List[Dict[str, str]], 
        max_tokens: Optional[int] = None,
        temperature: float = 0.7,
        model: str = "claude-3-sonnet-20240229",
        **kwargs
    ) -> Tuple[bool, str, Dict[str, Any]]:
        """
        Generate chat completion using Anthropic Claude API
        
        Args:
            messages: List of message dictionaries
            max_tokens: Maximum tokens to generate
            temperature: Sampling temperature
            model: Claude model to use
            **kwargs: Additional parameters
            
        Returns:
            Tuple of (success, content, metadata)
        """
        if not self.is_available():
            return False, "Anthropic client not available", {}
        
        try:
            # Convert messages to Claude format
            system_message = ""
            claude_messages = []
            
            for message in messages:
                role = message.get('role', 'user')
                content = message.get('content', '')
                
                if role == 'system':
                    system_message = content
                elif role in ['user', 'assistant']:
                    claude_messages.append({
                        "role": role,
                        "content": content
                    })
            
            # Prepare request parameters
            request_params = {
                "model": model,
                "messages": claude_messages,
                "max_tokens": max_tokens or 2048,
                "temperature": temperature,
            }
            
            # Add system message if present
            if system_message:
                request_params["system"] = system_message
            
            # Add any additional parameters
            request_params.update(kwargs)
            
            # Make API call
            response = self.client.messages.create(**request_params)
            
            # Extract response content
            if response.content and len(response.content) > 0:
                # Claude returns content as a list of content blocks
                content = ""
                for content_block in response.content:
                    if hasattr(content_block, 'text'):
                        content += content_block.text
                
                # Extract metadata
                metadata = {
                    "model": response.model,
                    "stop_reason": response.stop_reason,
                    "input_tokens": response.usage.input_tokens if response.usage else 0,
                    "output_tokens": response.usage.output_tokens if response.usage else 0,
                    "response_id": response.id,
                }
                
                return True, content, metadata
            else:
                return False, "No response generated", {"model": model}
                
        except Exception as e:
            logger.error(f"Anthropic API error: {e}")
            error_msg = str(e)
            
            # Handle specific Anthropic errors
            if "rate_limit" in error_msg.lower():
                error_msg = "Rate limit exceeded. Please try again later."
            elif "insufficient_quota" in error_msg.lower():
                error_msg = "API quota exceeded. Please check your Anthropic billing."
            elif "invalid_api_key" in error_msg.lower():
                error_msg = "Invalid API key. Please check your Anthropic configuration."
            elif "overloaded" in error_msg.lower():
                error_msg = "Service temporarily overloaded. Please try again."
            
            return False, f"Anthropic API error: {error_msg}", {
                "model": model, 
                "error": str(e)
            }
    
    def generate_embedding(
        self, 
        text: str, 
        **kwargs
    ) -> Tuple[bool, List[float], Dict[str, Any]]:
        """
        Generate embeddings using Anthropic API
        Note: Claude doesn't provide embedding APIs, so this returns an error
        """
        if not self.is_available():
            return False, [], {"error": "Anthropic client not available"}
        
        # Claude doesn't provide embedding functionality
        logger.warning("Anthropic Claude does not support embeddings")
        return False, [], {
            "error": "Embeddings not supported by Anthropic provider",
            "model": "claude"
        }
    
    def get_supported_features(self) -> List[str]:
        """Get supported features for Claude"""
        return ['chat_completion']  # No embedding support
    
    def get_available_models(self) -> List[str]:
        """Get available Claude models"""
        return [
            "claude-3-opus-20240229",
            "claude-3-sonnet-20240229", 
            "claude-3-haiku-20240307",
            "claude-2.1",
            "claude-2.0",
            "claude-instant-1.2"
        ]