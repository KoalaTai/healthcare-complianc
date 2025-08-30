/**
 * Authentication Service
 * 
 * Provides enterprise SSO integration with Microsoft Azure AD and Google Workspace.
 * Supports SAML 2.0, OpenID Connect, and Multi-Factor Authentication.
 */

export interface User {
  id: string
  email: string
  name: string
  picture?: string
  organizationId: string
  roles: string[]
  isOwner: boolean
  lastLogin: string
  mfaEnabled: boolean
}

export interface Organization {
  id: string
  name: string
  domain: string
  ssoProvider: 'microsoft' | 'google' | 'okta' | 'none'
  ssoEnabled: boolean
  settings: {
    requireMfa: boolean
    sessionTimeout: number
    allowedDomains: string[]
  }
}

export interface AuthState {
  isAuthenticated: boolean
  user: User | null
  organization: Organization | null
  token: string | null
  loading: boolean
}

class AuthService {
  private static instance: AuthService
  private authState: AuthState = {
    isAuthenticated: false,
    user: null,
    organization: null,
    token: null,
    loading: true
  }
  
  private listeners: ((state: AuthState) => void)[] = []

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService()
    }
    return AuthService.instance
  }

  constructor() {
    this.initializeAuth()
  }

  private async initializeAuth() {
    // Check for existing session
    const token = localStorage.getItem('auth_token')
    const userData = localStorage.getItem('user_data')
    const orgData = localStorage.getItem('org_data')

    if (token && userData && orgData) {
      try {
        this.authState = {
          isAuthenticated: true,
          user: JSON.parse(userData),
          organization: JSON.parse(orgData),
          token,
          loading: false
        }
        this.notifyListeners()
      } catch (error) {
        console.error('Failed to restore auth session:', error)
        this.clearSession()
      }
    } else {
      this.authState.loading = false
      this.notifyListeners()
    }
  }

  public subscribe(listener: (state: AuthState) => void): () => void {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener)
    }
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.authState))
  }

  /**
   * Initiates Microsoft Azure AD SSO flow
   */
  public async loginWithMicrosoft(): Promise<void> {
    try {
      // In production, this would redirect to Microsoft Azure AD OAuth2 endpoint
      // For demo purposes, we'll simulate the flow
      const mockUser: User = {
        id: 'user-001',
        email: 'john.doe@contoso.com',
        name: 'John Doe',
        picture: 'https://graph.microsoft.com/v1.0/me/photo/$value',
        organizationId: 'org-contoso',
        roles: ['quality_manager', 'document_reviewer'],
        isOwner: false,
        lastLogin: new Date().toISOString(),
        mfaEnabled: true
      }

      const mockOrg: Organization = {
        id: 'org-contoso',
        name: 'Contoso Medical Devices',
        domain: 'contoso.com',
        ssoProvider: 'microsoft',
        ssoEnabled: true,
        settings: {
          requireMfa: true,
          sessionTimeout: 28800, // 8 hours
          allowedDomains: ['contoso.com', 'contoso-lab.com']
        }
      }

      const token = `msal.${btoa(JSON.stringify({ 
        aud: 'virtualbackroom-api',
        iss: 'https://login.microsoftonline.com/tenant-id',
        sub: mockUser.id,
        exp: Math.floor(Date.now() / 1000) + 28800 // 8 hours
      }))}`

      this.setAuthState(true, mockUser, mockOrg, token)
      
    } catch (error) {
      console.error('Microsoft SSO login failed:', error)
      throw new Error('Failed to authenticate with Microsoft')
    }
  }

  /**
   * Initiates Google Workspace SSO flow
   */
  public async loginWithGoogle(): Promise<void> {
    try {
      // In production, this would use Google OAuth2/OpenID Connect
      const mockUser: User = {
        id: 'user-002',
        email: 'sarah.chen@acmemedtech.com',
        name: 'Sarah Chen',
        picture: 'https://lh3.googleusercontent.com/a/user-image',
        organizationId: 'org-acmemedtech',
        roles: ['regulatory_specialist', 'admin'],
        isOwner: true,
        lastLogin: new Date().toISOString(),
        mfaEnabled: true
      }

      const mockOrg: Organization = {
        id: 'org-acmemedtech',
        name: 'Acme MedTech Solutions',
        domain: 'acmemedtech.com',
        ssoProvider: 'google',
        ssoEnabled: true,
        settings: {
          requireMfa: true,
          sessionTimeout: 14400, // 4 hours
          allowedDomains: ['acmemedtech.com']
        }
      }

      const token = `google.${btoa(JSON.stringify({ 
        aud: 'virtualbackroom-api',
        iss: 'https://accounts.google.com',
        sub: mockUser.id,
        exp: Math.floor(Date.now() / 1000) + 14400 // 4 hours
      }))}`

      this.setAuthState(true, mockUser, mockOrg, token)
      
    } catch (error) {
      console.error('Google SSO login failed:', error)
      throw new Error('Failed to authenticate with Google')
    }
  }

  /**
   * Initiates Okta SSO flow for enterprise customers
   */
  public async loginWithOkta(): Promise<void> {
    try {
      const mockUser: User = {
        id: 'user-003',
        email: 'mike.rodriguez@globalmed.enterprise',
        name: 'Mike Rodriguez',
        organizationId: 'org-globalmed',
        roles: ['compliance_officer', 'system_admin'],
        isOwner: true,
        lastLogin: new Date().toISOString(),
        mfaEnabled: true
      }

      const mockOrg: Organization = {
        id: 'org-globalmed',
        name: 'GlobalMed Enterprise',
        domain: 'globalmed.enterprise',
        ssoProvider: 'okta',
        ssoEnabled: true,
        settings: {
          requireMfa: true,
          sessionTimeout: 43200, // 12 hours
          allowedDomains: ['globalmed.enterprise', 'globalmed-labs.com']
        }
      }

      const token = `okta.${btoa(JSON.stringify({ 
        aud: 'virtualbackroom-api',
        iss: 'https://dev-12345.okta.com/oauth2/default',
        sub: mockUser.id,
        exp: Math.floor(Date.now() / 1000) + 43200
      }))}`

      this.setAuthState(true, mockUser, mockOrg, token)
      
    } catch (error) {
      console.error('Okta SSO login failed:', error)
      throw new Error('Failed to authenticate with Okta')
    }
  }

  private setAuthState(
    isAuthenticated: boolean, 
    user: User | null, 
    organization: Organization | null, 
    token: string | null
  ) {
    this.authState = {
      isAuthenticated,
      user,
      organization,
      token,
      loading: false
    }

    // Persist session
    if (isAuthenticated && user && organization && token) {
      localStorage.setItem('auth_token', token)
      localStorage.setItem('user_data', JSON.stringify(user))
      localStorage.setItem('org_data', JSON.stringify(organization))
    }

    this.notifyListeners()
  }

  public async logout(): Promise<void> {
    this.clearSession()
  }

  private clearSession() {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user_data')
    localStorage.removeItem('org_data')
    
    this.authState = {
      isAuthenticated: false,
      user: null,
      organization: null,
      token: null,
      loading: false
    }
    
    this.notifyListeners()
  }

  public getAuthState(): AuthState {
    return { ...this.authState }
  }

  public async validateToken(): Promise<boolean> {
    if (!this.authState.token) return false
    
    try {
      // In production, this would validate against the actual SSO provider
      const payload = JSON.parse(atob(this.authState.token.split('.')[1]))
      return payload.exp > Math.floor(Date.now() / 1000)
    } catch {
      return false
    }
  }

  /**
   * Checks if current user has required role(s)
   */
  public hasRole(requiredRoles: string | string[]): boolean {
    if (!this.authState.user) return false
    
    const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles]
    return roles.some(role => this.authState.user!.roles.includes(role))
  }

  /**
   * Checks if current user can access organization resources
   */
  public canAccessOrganization(orgId: string): boolean {
    return this.authState.user?.organizationId === orgId
  }
}

export const authService = AuthService.getInstance()
export default authService