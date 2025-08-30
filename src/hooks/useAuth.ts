import { useState, useEffect } from 'react'
import { authService, AuthState } from '@/services/auth_service'

/**
 * Custom hook for managing authentication state
 * Provides reactive authentication state and auth methods
 */
export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>(authService.getAuthState())

  useEffect(() => {
    const unsubscribe = authService.subscribe(setAuthState)
    return unsubscribe
  }, [])

  return {
    ...authState,
    loginWithMicrosoft: authService.loginWithMicrosoft.bind(authService),
    loginWithGoogle: authService.loginWithGoogle.bind(authService),
    loginWithOkta: authService.loginWithOkta.bind(authService),
    logout: authService.logout.bind(authService),
    hasRole: authService.hasRole.bind(authService),
    canAccessOrganization: authService.canAccessOrganization.bind(authService),
    validateToken: authService.validateToken.bind(authService)
  }
}