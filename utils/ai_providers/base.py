"""
Abstract base class for AI providers
Defines the contract that all AI provider implementations must follow
"""
from abc import ABC, abstractmethod
from typing import List, Tuple, Dict, Any, Optional


class BaseAIClient(ABC):
    """
    Abstract base class defining the contract for all AI providers.
    This ensures consistent interfaces across different AI services.
    """
    
    @abstractmethod
    def is_available(self) -> bool:
        """
        Check if the AI provider is available and properly configured.
        
        Returns:
            bool: True if provider is ready to use, False otherwise
        """
        pass
    
    @abstractmethod
    def generate_chat_completion(
        self, 
        messages: List[Dict[str, str]], 
        max_tokens: Optional[int] = None,
        temperature: float = 0.7,
        **kwargs
    ) -> Tuple[bool, str, Dict[str, Any]]:
        """
        Generate a chat completion response.
        
        Args:
            messages: List of message dictionaries with 'role' and 'content'
            max_tokens: Maximum tokens to generate (optional)
            temperature: Sampling temperature (0.0 to 2.0)
            **kwargs: Additional provider-specific parameters
            
        Returns:
            Tuple containing:
            - success (bool): Whether the request was successful
            - content (str): Generated response or error message
            - metadata (dict): Additional information (tokens used, model, etc.)
        """
        pass
    
    @abstractmethod
    def generate_embedding(
        self, 
        text: str, 
        **kwargs
    ) -> Tuple[bool, List[float], Dict[str, Any]]:
        """
        Generate vector embeddings for the given text.
        
        Args:
            text: Input text to generate embeddings for
            **kwargs: Additional provider-specific parameters
            
        Returns:
            Tuple containing:
            - success (bool): Whether the request was successful
            - embedding (List[float]): Vector embedding or empty list on failure
            - metadata (dict): Additional information (model, dimensions, etc.)
        """
        pass
    
    def get_provider_name(self) -> str:
        """Get the name of this AI provider"""
        return self.__class__.__name__.replace('Client', '').lower()
    
    def get_supported_features(self) -> List[str]:
        """Get list of supported features for this provider"""
        return ['chat_completion', 'embedding']