"""
Perplexity AI Provider Implementation
Provides integration with Perplexity's AI models for search and citations
"""
import os
import logging
from typing import List, Dict, Any, Tuple, Optional

try:
    import requests
    REQUESTS_AVAILABLE = True
except ImportError:
    REQUESTS_AVAILABLE = False

from .base import BaseAIClient

logger = logging.getLogger(__name__)


class PerplexityClient(BaseAIClient):
    """
    Perplexity AI client implementation
    Uses Perplexity's API for specialized search and citation tasks
    """
    
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("AI_PROVIDERS_PERPLEXITY_API_KEY")
        self.base_url = "https://api.perplexity.ai"
        
        if not REQUESTS_AVAILABLE:
            logger.warning("Requests library not available for Perplexity client")
        elif self.api_key:
            logger.info("Perplexity client initialized successfully")
        else:
            logger.warning("Perplexity API key not found")
    
    def is_available(self) -> bool:
        """Check if Perplexity client is properly configured and available"""
        return (
            REQUESTS_AVAILABLE and 
            self.api_key is not None
        )
    
    def generate_chat_completion(
        self, 
        messages: List[Dict[str, str]], 
        max_tokens: Optional[int] = None,
        temperature: float = 0.7,
        model: str = "pplx-7b-online",
        **kwargs
    ) -> Tuple[bool, str, Dict[str, Any]]:
        """
        Generate chat completion using Perplexity API
        
        Args:
            messages: List of message dictionaries
            max_tokens: Maximum tokens to generate
            temperature: Sampling temperature
            model: Perplexity model to use
            **kwargs: Additional parameters
            
        Returns:
            Tuple of (success, content, metadata)
        """
        if not self.is_available():
            return False, "Perplexity client not available", {}
        
        try:
            # Prepare headers
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json",
                "User-Agent": "VirtualBackroom-AI/1.0"
            }
            
            # Prepare request payload
            payload = {
                "model": model,
                "messages": messages,
                "temperature": temperature,
            }
            
            if max_tokens:
                payload["max_tokens"] = max_tokens
            
            # Add any additional parameters
            payload.update(kwargs)
            
            # Make API request
            response = requests.post(
                f"{self.base_url}/chat/completions",
                json=payload,
                headers=headers,
                timeout=60
            )
            
            # Check response status
            if response.status_code != 200:
                error_msg = f"API request failed with status {response.status_code}"
                try:
                    error_data = response.json()
                    if 'error' in error_data:
                        error_msg = error_data['error'].get('message', error_msg)
                except:
                    pass
                
                return False, f"Perplexity API error: {error_msg}", {
                    "model": model,
                    "status_code": response.status_code
                }
            
            # Parse response
            data = response.json()
            
            if 'choices' in data and len(data['choices']) > 0:
                choice = data['choices'][0]
                content = choice.get('message', {}).get('content', '')
                
                # Extract metadata
                metadata = {
                    "model": data.get('model', model),
                    "finish_reason": choice.get('finish_reason'),
                    "usage": data.get('usage', {}),
                    "citations": data.get('citations', []),  # Perplexity provides citations
                }
                
                return True, content, metadata
            else:
                return False, "No response generated", {"model": model}
                
        except requests.exceptions.Timeout:
            return False, "Request timeout - Perplexity API is taking too long to respond", {
                "model": model, 
                "error": "timeout"
            }
        except requests.exceptions.RequestException as e:
            logger.error(f"Perplexity API request error: {e}")
            return False, f"Network error: {str(e)}", {
                "model": model, 
                "error": str(e)
            }
        except Exception as e:
            logger.error(f"Perplexity API error: {e}")
            return False, f"Perplexity API error: {str(e)}", {
                "model": model, 
                "error": str(e)
            }
    
    def generate_embedding(
        self, 
        text: str, 
        **kwargs
    ) -> Tuple[bool, List[float], Dict[str, Any]]:
        """
        Generate embeddings using Perplexity API
        Note: Perplexity may not support embeddings - this is a placeholder
        """
        if not self.is_available():
            return False, [], {"error": "Perplexity client not available"}
        
        # Perplexity primarily focuses on search/chat, not embeddings
        logger.warning("Perplexity embeddings may not be supported")
        return False, [], {
            "error": "Embeddings may not be supported by Perplexity provider",
            "model": "perplexity"
        }
    
    def search_with_citations(
        self, 
        query: str,
        model: str = "pplx-7b-online",
        **kwargs
    ) -> Tuple[bool, str, Dict[str, Any]]:
        """
        Specialized method for search queries with citations
        This leverages Perplexity's strength in providing sourced information
        
        Args:
            query: Search query
            model: Perplexity model to use
            **kwargs: Additional parameters
            
        Returns:
            Tuple of (success, response_with_citations, metadata)
        """
        messages = [
            {
                "role": "user", 
                "content": f"Please provide detailed information about: {query}. Include citations and sources."
            }
        ]
        
        return self.generate_chat_completion(
            messages=messages,
            model=model,
            **kwargs
        )
    
    def get_supported_features(self) -> List[str]:
        """Get supported features for Perplexity"""
        return ['chat_completion', 'search_with_citations']
    
    def get_available_models(self) -> List[str]:
        """Get available Perplexity models"""
        return [
            "pplx-7b-online",
            "pplx-70b-online",
            "pplx-7b-chat",
            "pplx-70b-chat",
            "codellama-34b-instruct",
            "llama-2-70b-chat",
            "mistral-7b-instruct"
        ]