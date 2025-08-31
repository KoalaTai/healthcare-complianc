"""
Google Gemini AI Provider Implementation
Provides integration with Google's Gemini API for chat completions and embeddings
"""
import os
import logging
from typing import List, Dict, Any, Tuple, Optional

try:
    import google.generativeai as genai
    from google.generativeai.types import HarmCategory, HarmBlockThreshold
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False

from .base import BaseAIClient

logger = logging.getLogger(__name__)


class GeminiClient(BaseAIClient):
    """Google Gemini AI client implementation"""
    
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("AI_PROVIDERS_GEMINI_API_KEY")
        self.model = None
        
        if self.api_key and GEMINI_AVAILABLE:
            try:
                genai.configure(api_key=self.api_key)
                self.model = genai.GenerativeModel('gemini-pro')
                logger.info("Gemini client initialized successfully")
            except Exception as e:
                logger.error(f"Failed to initialize Gemini client: {e}")
                self.model = None
        elif not GEMINI_AVAILABLE:
            logger.warning("Google GenerativeAI library not available")
    
    def is_available(self) -> bool:
        """Check if Gemini client is properly configured and available"""
        return (
            GEMINI_AVAILABLE and 
            self.api_key is not None and 
            self.model is not None
        )
    
    def generate_chat_completion(
        self, 
        messages: List[Dict[str, str]], 
        max_tokens: Optional[int] = None,
        temperature: float = 0.7,
        **kwargs
    ) -> Tuple[bool, str, Dict[str, Any]]:
        """
        Generate chat completion using Gemini API
        
        Args:
            messages: List of message dictionaries
            max_tokens: Maximum tokens to generate
            temperature: Sampling temperature
            **kwargs: Additional parameters
            
        Returns:
            Tuple of (success, content, metadata)
        """
        if not self.is_available():
            return False, "Gemini client not available", {}
        
        try:
            # Convert messages to Gemini format
            # Gemini expects a single prompt, so we'll combine messages
            formatted_prompt = self._format_messages_for_gemini(messages)
            
            # Configure generation settings
            generation_config = genai.types.GenerationConfig(
                temperature=temperature,
                max_output_tokens=max_tokens or 2048,
            )
            
            # Configure safety settings to be less restrictive for regulatory content
            safety_settings = {
                HarmCategory.HARM_CATEGORY_HARASSMENT: HarmBlockThreshold.BLOCK_NONE,
                HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlockThreshold.BLOCK_NONE,
                HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: HarmBlockThreshold.BLOCK_NONE,
                HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_NONE,
            }
            
            # Generate response
            response = self.model.generate_content(
                formatted_prompt,
                generation_config=generation_config,
                safety_settings=safety_settings
            )
            
            # Check if response was blocked
            if not response.candidates:
                return False, "Response was blocked by safety filters", {
                    "model": "gemini-pro",
                    "error": "safety_filter"
                }
            
            candidate = response.candidates[0]
            if hasattr(candidate, 'content') and candidate.content.parts:
                content = candidate.content.parts[0].text
                
                # Extract metadata
                metadata = {
                    "model": "gemini-pro",
                    "finish_reason": getattr(candidate, 'finish_reason', None),
                    "safety_ratings": getattr(candidate, 'safety_ratings', []),
                    "prompt_tokens": getattr(response, 'usage_metadata', {}).get('prompt_token_count', 0),
                    "completion_tokens": getattr(response, 'usage_metadata', {}).get('candidates_token_count', 0),
                }
                
                return True, content, metadata
            else:
                return False, "No content generated", {"model": "gemini-pro"}
                
        except Exception as e:
            logger.error(f"Gemini API error: {e}")
            return False, f"Gemini API error: {str(e)}", {"model": "gemini-pro", "error": str(e)}
    
    def generate_embedding(
        self, 
        text: str, 
        **kwargs
    ) -> Tuple[bool, List[float], Dict[str, Any]]:
        """
        Generate embeddings using Gemini API
        Note: Gemini doesn't have a dedicated embedding model yet,
        so this is a placeholder implementation
        """
        if not self.is_available():
            return False, [], {"error": "Gemini client not available"}
        
        # Gemini doesn't currently support embeddings directly
        # This would need to be implemented when Google releases embedding models
        logger.warning("Gemini embeddings not yet implemented")
        return False, [], {
            "error": "Embeddings not supported by Gemini provider",
            "model": "gemini-pro"
        }
    
    def _format_messages_for_gemini(self, messages: List[Dict[str, str]]) -> str:
        """
        Convert OpenAI-style messages to Gemini prompt format
        
        Args:
            messages: List of message dictionaries with 'role' and 'content'
            
        Returns:
            Formatted prompt string
        """
        formatted_parts = []
        
        for message in messages:
            role = message.get('role', 'user')
            content = message.get('content', '')
            
            if role == 'system':
                formatted_parts.append(f"System Instructions: {content}")
            elif role == 'user':
                formatted_parts.append(f"User: {content}")
            elif role == 'assistant':
                formatted_parts.append(f"Assistant: {content}")
        
        return "\n\n".join(formatted_parts)
    
    def get_supported_features(self) -> List[str]:
        """Get supported features for Gemini"""
        return ['chat_completion']  # Embedding support to be added later