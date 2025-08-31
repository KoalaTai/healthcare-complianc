"""
AI Router - Central orchestration system for all AI providers
Manages fallback chains, provider selection, and error handling
"""
import os
import logging
import time
from datetime import datetime, timedelta
from typing import List, Dict, Any, Tuple, Optional, Union
from collections import defaultdict, deque

from .ai_providers.base import BaseAIClient
from .ai_providers.gemini_provider import GeminiClient
from .ai_providers.openai_provider import OpenAIClient
from .ai_providers.anthropic_provider import AnthropicClient
from .ai_providers.perplexity_provider import PerplexityClient
from .ai_providers.local_provider import LocalFallbackClient

logger = logging.getLogger(__name__)


class AIRouter:
    """
    Central AI router that manages multiple providers with fallback logic
    Provides high availability through provider redundancy and intelligent routing
    """
    
    def __init__(self, config=None):
        """
        Initialize the AI router with configured providers
        
        Args:
            config: Configuration object with AI provider settings
        """
        self.config = config
        self.providers: Dict[str, BaseAIClient] = {}
        self.provider_stats: Dict[str, Dict[str, int]] = defaultdict(lambda: {
            'total_requests': 0,
            'successful_requests': 0,
            'failed_requests': 0,
            'average_response_time_ms': 0
        })
        self.fallback_events: deque = deque(maxlen=100)  # Store last 100 fallback events
        
        # Get fallback chain from config or environment
        if config and hasattr(config, 'ai_providers'):
            self.default_provider = config.ai_providers.default_provider
            self.fallback_chain = config.ai_providers.fallback_chain
        else:
            self.default_provider = os.getenv("AI_PROVIDERS_DEFAULT_PROVIDER", "gemini")
            chain_str = os.getenv("AI_PROVIDERS_FALLBACK_CHAIN", "gemini,openai,anthropic,perplexity,local")
            self.fallback_chain = [s.strip() for s in chain_str.split(",")]
        
        # Initialize providers
        self._initialize_providers()
        
        logger.info(f"AI Router initialized with {len(self.providers)} providers")
        logger.info(f"Default provider: {self.default_provider}")
        logger.info(f"Fallback chain: {self.fallback_chain}")
    
    def _initialize_providers(self):
        """Initialize all AI provider clients"""
        provider_classes = {
            'gemini': GeminiClient,
            'openai': OpenAIClient,
            'anthropic': AnthropicClient,
            'perplexity': PerplexityClient,
            'local': LocalFallbackClient
        }
        
        for provider_name, provider_class in provider_classes.items():
            try:
                if provider_name == 'local':
                    # Local fallback doesn't need API keys
                    client = provider_class()
                else:
                    # Other providers need API keys from config
                    client = provider_class()
                
                if client.is_available():
                    self.providers[provider_name] = client
                    logger.info(f"Provider '{provider_name}' initialized and available")
                else:
                    logger.warning(f"Provider '{provider_name}' initialized but not available (missing config)")
                    
            except Exception as e:
                logger.error(f"Failed to initialize provider '{provider_name}': {e}")
    
    def generate_chat_completion(
        self,
        messages: List[Dict[str, str]],
        provider: Optional[str] = None,
        max_tokens: Optional[int] = None,
        temperature: float = 0.7,
        use_fallback: bool = True,
        **kwargs
    ) -> Tuple[bool, str, Dict[str, Any]]:
        """
        Generate chat completion with automatic fallback
        
        Args:
            messages: List of message dictionaries
            provider: Specific provider to use (optional)
            max_tokens: Maximum tokens to generate
            temperature: Sampling temperature
            use_fallback: Whether to use fallback chain on failure
            **kwargs: Additional provider-specific parameters
            
        Returns:
            Tuple of (success, content, metadata)
        """
        start_time = time.time()
        
        # Determine provider order
        if provider and provider in self.providers:
            provider_order = [provider]
            if use_fallback:
                # Add remaining providers from fallback chain
                remaining_providers = [p for p in self.fallback_chain if p != provider and p in self.providers]
                provider_order.extend(remaining_providers)
        else:
            # Use default fallback chain
            provider_order = [p for p in self.fallback_chain if p in self.providers]
        
        if not provider_order:
            return False, "No AI providers available", {"error": "no_providers"}
        
        # Try providers in order
        last_error = "Unknown error"
        for current_provider in provider_order:
            try:
                client = self.providers[current_provider]
                
                # Record attempt
                self.provider_stats[current_provider]['total_requests'] += 1
                
                # Make the API call
                provider_start_time = time.time()
                success, content, metadata = client.generate_chat_completion(
                    messages=messages,
                    max_tokens=max_tokens,
                    temperature=temperature,
                    **kwargs
                )
                provider_response_time = int((time.time() - provider_start_time) * 1000)
                
                # Update metadata with router info
                metadata.update({
                    'router_provider_used': current_provider,
                    'router_response_time_ms': provider_response_time,
                    'router_fallback_used': current_provider != provider_order[0],
                    'router_total_time_ms': int((time.time() - start_time) * 1000)
                })
                
                if success:
                    # Success - update stats and return
                    self.provider_stats[current_provider]['successful_requests'] += 1
                    self._update_average_response_time(current_provider, provider_response_time)
                    
                    logger.debug(f"Chat completion successful with provider '{current_provider}'")
                    return True, content, metadata
                else:
                    # Failed - log and try next provider
                    self.provider_stats[current_provider]['failed_requests'] += 1
                    last_error = content or f"Provider {current_provider} failed"
                    
                    if current_provider != provider_order[-1]:  # Not the last provider
                        self._log_fallback_event(current_provider, provider_order[provider_order.index(current_provider) + 1], last_error)
                        logger.warning(f"Provider '{current_provider}' failed: {last_error}. Trying next provider.")
                    
            except Exception as e:
                # Exception during API call
                self.provider_stats[current_provider]['failed_requests'] += 1
                last_error = str(e)
                
                if current_provider != provider_order[-1]:
                    next_provider = provider_order[provider_order.index(current_provider) + 1]
                    self._log_fallback_event(current_provider, next_provider, last_error)
                    logger.error(f"Exception with provider '{current_provider}': {e}. Trying next provider.")
        
        # All providers failed
        total_time = int((time.time() - start_time) * 1000)
        logger.error(f"All providers failed. Last error: {last_error}")
        
        return False, f"All AI providers failed. Last error: {last_error}", {
            'error': 'all_providers_failed',
            'last_error': last_error,
            'providers_tried': provider_order,
            'router_total_time_ms': total_time
        }
    
    def generate_embedding(
        self,
        text: str,
        provider: Optional[str] = None,
        use_fallback: bool = True,
        **kwargs
    ) -> Tuple[bool, List[float], Dict[str, Any]]:
        """
        Generate embeddings with automatic fallback
        
        Args:
            text: Text to embed
            provider: Specific provider to use
            use_fallback: Whether to use fallback chain
            **kwargs: Additional parameters
            
        Returns:
            Tuple of (success, embedding, metadata)
        """
        # For embeddings, prioritize providers known to support them well
        embedding_priority = ['openai', 'local']  # Only OpenAI and local support embeddings currently
        
        if provider and provider in self.providers:
            provider_order = [provider]
            if use_fallback:
                remaining = [p for p in embedding_priority if p != provider and p in self.providers]
                provider_order.extend(remaining)
        else:
            provider_order = [p for p in embedding_priority if p in self.providers]
        
        if not provider_order:
            return False, [], {"error": "no_embedding_providers"}
        
        # Try providers in order
        for current_provider in provider_order:
            try:
                client = self.providers[current_provider]
                self.provider_stats[current_provider]['total_requests'] += 1
                
                success, embedding, metadata = client.generate_embedding(text=text, **kwargs)
                metadata['router_provider_used'] = current_provider
                
                if success:
                    self.provider_stats[current_provider]['successful_requests'] += 1
                    return True, embedding, metadata
                else:
                    self.provider_stats[current_provider]['failed_requests'] += 1
                    if current_provider != provider_order[-1]:
                        logger.warning(f"Embedding provider '{current_provider}' failed. Trying next.")
                        
            except Exception as e:
                self.provider_stats[current_provider]['failed_requests'] += 1
                logger.error(f"Exception with embedding provider '{current_provider}': {e}")
        
        return False, [], {"error": "all_embedding_providers_failed", "providers_tried": provider_order}
    
    def get_provider_status(self) -> Dict[str, Dict[str, Any]]:
        """Get status of all providers"""
        status = {}
        
        for provider_name, client in self.providers.items():
            stats = self.provider_stats[provider_name]
            
            status[provider_name] = {
                'available': client.is_available(),
                'supported_features': client.get_supported_features(),
                'stats': dict(stats),
                'success_rate': (
                    stats['successful_requests'] / max(stats['total_requests'], 1) * 100
                )
            }
        
        return status
    
    def get_fallback_events(self, limit: int = 20) -> List[Dict[str, Any]]:
        """Get recent fallback events"""
        return list(self.fallback_events)[-limit:]
    
    def get_health_status(self) -> Dict[str, Any]:
        """Get overall health status of the AI router"""
        total_providers = len(self.providers)
        available_providers = sum(1 for client in self.providers.values() if client.is_available())
        
        # Calculate overall statistics
        total_requests = sum(stats['total_requests'] for stats in self.provider_stats.values())
        total_successful = sum(stats['successful_requests'] for stats in self.provider_stats.values())
        
        overall_success_rate = (total_successful / max(total_requests, 1)) * 100
        
        health_status = "healthy"
        if available_providers == 0:
            health_status = "critical"
        elif available_providers <= total_providers / 2:
            health_status = "degraded"
        elif overall_success_rate < 90:
            health_status = "degraded"
        
        return {
            'status': health_status,
            'total_providers': total_providers,
            'available_providers': available_providers,
            'default_provider': self.default_provider,
            'fallback_chain': self.fallback_chain,
            'overall_success_rate': overall_success_rate,
            'total_requests': total_requests,
            'recent_fallbacks': len(self.fallback_events)
        }
    
    def _log_fallback_event(self, failed_provider: str, next_provider: str, error: str):
        """Log a fallback event for monitoring"""
        event = {
            'timestamp': datetime.now().isoformat(),
            'failed_provider': failed_provider,
            'next_provider': next_provider,
            'error': error
        }
        self.fallback_events.append(event)
        logger.info(f"Fallback: {failed_provider} -> {next_provider} ({error[:100]})")
    
    def _update_average_response_time(self, provider: str, response_time_ms: int):
        """Update average response time for a provider"""
        stats = self.provider_stats[provider]
        current_avg = stats['average_response_time_ms']
        total_successful = stats['successful_requests']
        
        if total_successful == 1:
            stats['average_response_time_ms'] = response_time_ms
        else:
            # Calculate rolling average
            stats['average_response_time_ms'] = int(
                (current_avg * (total_successful - 1) + response_time_ms) / total_successful
            )


# Global AI router instance
_ai_router_instance = None


def get_ai_router(config=None) -> AIRouter:
    """
    Get the global AI router instance (singleton pattern)
    
    Args:
        config: Configuration object (only used for first initialization)
        
    Returns:
        AIRouter instance
    """
    global _ai_router_instance
    
    if _ai_router_instance is None:
        _ai_router_instance = AIRouter(config)
    
    return _ai_router_instance