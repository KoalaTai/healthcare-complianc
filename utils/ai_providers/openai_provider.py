"""
OpenAI Provider Implementation
Provides integration with OpenAI's GPT models and embeddings
"""
import os
import logging
from typing import List, Dict, Any, Tuple, Optional

try:
    from openai import OpenAI
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False

from .base import BaseAIClient

logger = logging.getLogger(__name__)


class OpenAIClient(BaseAIClient):
    """OpenAI API client implementation"""
    
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("AI_PROVIDERS_OPENAI_API_KEY")
        self.client = None
        
        if self.api_key and OPENAI_AVAILABLE:
            try:
                self.client = OpenAI(api_key=self.api_key)
                logger.info("OpenAI client initialized successfully")
            except Exception as e:
                logger.error(f"Failed to initialize OpenAI client: {e}")
                self.client = None
        elif not OPENAI_AVAILABLE:
            logger.warning("OpenAI library not available")
    
    def is_available(self) -> bool:
        """Check if OpenAI client is properly configured and available"""
        return (
            OPENAI_AVAILABLE and 
            self.api_key is not None and 
            self.client is not None
        )
    
    def generate_chat_completion(
        self, 
        messages: List[Dict[str, str]], 
        max_tokens: Optional[int] = None,
        temperature: float = 0.7,
        model: str = "gpt-4",
        **kwargs
    ) -> Tuple[bool, str, Dict[str, Any]]:
        """
        Generate chat completion using OpenAI API
        
        Args:
            messages: List of message dictionaries
            max_tokens: Maximum tokens to generate
            temperature: Sampling temperature
            model: OpenAI model to use
            **kwargs: Additional parameters
            
        Returns:
            Tuple of (success, content, metadata)
        """
        if not self.is_available():
            return False, "OpenAI client not available", {}
        
        try:
            # Prepare request parameters
            request_params = {
                "model": model,
                "messages": messages,
                "temperature": temperature,
            }
            
            if max_tokens:
                request_params["max_tokens"] = max_tokens
            
            # Add any additional parameters
            request_params.update(kwargs)
            
            # Make API call
            response = self.client.chat.completions.create(**request_params)
            
            # Extract response content
            if response.choices and response.choices[0].message:
                content = response.choices[0].message.content or ""
                
                # Extract metadata
                metadata = {
                    "model": response.model,
                    "finish_reason": response.choices[0].finish_reason,
                    "prompt_tokens": response.usage.prompt_tokens if response.usage else 0,
                    "completion_tokens": response.usage.completion_tokens if response.usage else 0,
                    "total_tokens": response.usage.total_tokens if response.usage else 0,
                    "response_id": response.id,
                }
                
                return True, content, metadata
            else:
                return False, "No response generated", {"model": model}
                
        except Exception as e:
            logger.error(f"OpenAI API error: {e}")
            error_msg = str(e)
            
            # Handle specific OpenAI errors
            if "rate limit" in error_msg.lower():
                error_msg = "Rate limit exceeded. Please try again later."
            elif "insufficient quota" in error_msg.lower():
                error_msg = "API quota exceeded. Please check your OpenAI billing."
            elif "invalid api key" in error_msg.lower():
                error_msg = "Invalid API key. Please check your OpenAI configuration."
            
            return False, f"OpenAI API error: {error_msg}", {
                "model": model, 
                "error": str(e)
            }
    
    def generate_embedding(
        self, 
        text: str,
        model: str = "text-embedding-3-small",
        **kwargs
    ) -> Tuple[bool, List[float], Dict[str, Any]]:
        """
        Generate embeddings using OpenAI API
        
        Args:
            text: Input text to embed
            model: Embedding model to use
            **kwargs: Additional parameters
            
        Returns:
            Tuple of (success, embedding_vector, metadata)
        """
        if not self.is_available():
            return False, [], {"error": "OpenAI client not available"}
        
        try:
            # Make embedding API call
            response = self.client.embeddings.create(
                model=model,
                input=text,
                **kwargs
            )
            
            # Extract embedding vector
            if response.data and len(response.data) > 0:
                embedding = response.data[0].embedding
                
                metadata = {
                    "model": response.model,
                    "dimensions": len(embedding),
                    "prompt_tokens": response.usage.prompt_tokens if response.usage else 0,
                    "total_tokens": response.usage.total_tokens if response.usage else 0,
                }
                
                return True, embedding, metadata
            else:
                return False, [], {"model": model, "error": "No embedding generated"}
                
        except Exception as e:
            logger.error(f"OpenAI Embedding API error: {e}")
            error_msg = str(e)
            
            if "rate limit" in error_msg.lower():
                error_msg = "Rate limit exceeded. Please try again later."
            elif "insufficient quota" in error_msg.lower():
                error_msg = "API quota exceeded. Please check your OpenAI billing."
            
            return False, [], {
                "model": model, 
                "error": error_msg
            }
    
    def get_supported_features(self) -> List[str]:
        """Get supported features for OpenAI"""
        return ['chat_completion', 'embedding']
    
    def get_available_models(self) -> Dict[str, List[str]]:
        """Get available models for different tasks"""
        return {
            "chat": [
                "gpt-4",
                "gpt-4-turbo-preview", 
                "gpt-3.5-turbo",
                "gpt-3.5-turbo-16k"
            ],
            "embedding": [
                "text-embedding-3-small",
                "text-embedding-3-large", 
                "text-embedding-ada-002"
            ]
        }