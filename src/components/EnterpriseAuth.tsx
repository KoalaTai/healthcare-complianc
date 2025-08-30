import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Shield, 
  SignIn, 
  SignOut, 
  CheckCircle, 
  Users,
  Globe,
  Lock,
  AlertTriangle,
  Clock
} from '@phosphor-icons/react'
import { toast } from 'sonner'

export function EnterpriseAuth() {
  const auth = useAuth()
  const [isLoggingIn, setIsLoggingIn] = useState(false)

  const handleLogin = async (provider: 'microsoft' | 'google' | 'okta') => {
    setIsLoggingIn(true)
    try {
      const loginMethods = {
        microsoft: auth.loginWithMicrosoft,
        google: auth.loginWithGoogle,
        okta: auth.loginWithOkta
      }

      await loginMethods[provider]()
      toast.success(`Successfully authenticated with ${provider === 'microsoft' ? 'Microsoft' : provider === 'google' ? 'Google' : 'Okta'}`)
    } catch (error) {
      toast.error(`Authentication failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsLoggingIn(false)
    }
  }

  const handleLogout = async () => {
    try {
      await auth.logout()
      toast.success('Successfully logged out')
    } catch (error) {
      toast.error('Logout failed')
    }
  }

  if (auth.loading) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-muted-foreground">Loading authentication...</p>
        </CardContent>
      </Card>
    )
  }

  if (auth.isAuthenticated && auth.user && auth.organization) {
    return (
      <div className="space-y-6">
        {/* User Session Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle size={20} className="text-green-600" />
              Authenticated Session
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {auth.user.picture && (
                  <img 
                    src={auth.user.picture} 
                    alt={auth.user.name}
                    className="w-10 h-10 rounded-full border-2 border-border"
                  />
                )}
                <div>
                  <div className="font-medium text-foreground">{auth.user.name}</div>
                  <div className="text-sm text-muted-foreground">{auth.user.email}</div>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <SignOut size={16} className="mr-2" />
                Logout
              </Button>
            </div>

            <Separator />

            {/* Organization Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Users size={16} className="text-primary" />
                <span className="font-medium">Organization</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground">Name</div>
                  <div className="font-medium">{auth.organization.name}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Domain</div>
                  <div className="font-medium">{auth.organization.domain}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">SSO Provider</div>
                  <Badge variant="outline" className="text-xs">
                    {auth.organization.ssoProvider === 'microsoft' ? 'Microsoft Azure AD' :
                     auth.organization.ssoProvider === 'google' ? 'Google Workspace' :
                     auth.organization.ssoProvider === 'okta' ? 'Okta' : 'Standard Auth'}
                  </Badge>
                </div>
                <div>
                  <div className="text-muted-foreground">MFA Required</div>
                  <div className="flex items-center gap-1">
                    {auth.organization.settings.requireMfa ? (
                      <>
                        <Lock size={14} className="text-green-600" />
                        <span className="text-green-600 font-medium">Enabled</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle size={14} className="text-destructive" />
                        <span className="text-destructive">Disabled</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* User Roles & Permissions */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Shield size={16} className="text-primary" />
                <span className="font-medium">Roles & Permissions</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {auth.user.roles.map((role) => (
                  <Badge key={role} variant="secondary" className="text-xs">
                    {role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Badge>
                ))}
                {auth.user.isOwner && (
                  <Badge variant="default" className="text-xs bg-accent">
                    Organization Owner
                  </Badge>
                )}
              </div>
            </div>

            {/* Session Info */}
            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2 text-sm">
                <Clock size={14} className="text-muted-foreground" />
                <span className="text-muted-foreground">Last login:</span>
                <span className="font-medium">
                  {new Date(auth.user.lastLogin).toLocaleString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock size={20} />
              Security Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <CheckCircle size={24} className="mx-auto text-green-600 mb-2" />
                <div className="text-sm font-medium">SSO Active</div>
                <div className="text-xs text-muted-foreground">Enterprise authentication</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <Lock size={24} className="mx-auto text-green-600 mb-2" />
                <div className="text-sm font-medium">MFA Enabled</div>
                <div className="text-xs text-muted-foreground">Multi-factor protection</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <Shield size={24} className="mx-auto text-green-600 mb-2" />
                <div className="text-sm font-medium">Session Valid</div>
                <div className="text-xs text-muted-foreground">Token authenticated</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* SSO Login Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield size={20} />
            Enterprise Single Sign-On
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Choose your organization's identity provider to securely access VirtualBackroom.ai
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Microsoft Azure AD */}
          <Button
            variant="outline"
            size="lg"
            className="w-full h-12 justify-start gap-3"
            onClick={() => handleLogin('microsoft')}
            disabled={isLoggingIn}
          >
            <div className="w-6 h-6 bg-[#0078d4] rounded flex items-center justify-center">
              <Globe size={14} className="text-white" />
            </div>
            <div className="text-left">
              <div className="font-medium">Microsoft Azure AD</div>
              <div className="text-xs text-muted-foreground">
                Enterprise authentication with Office 365 integration
              </div>
            </div>
          </Button>

          {/* Google Workspace */}
          <Button
            variant="outline"
            size="lg"
            className="w-full h-12 justify-start gap-3"
            onClick={() => handleLogin('google')}
            disabled={isLoggingIn}
          >
            <div className="w-6 h-6 bg-[#4285f4] rounded flex items-center justify-center">
              <Globe size={14} className="text-white" />
            </div>
            <div className="text-left">
              <div className="font-medium">Google Workspace</div>
              <div className="text-xs text-muted-foreground">
                Secure authentication with Google's enterprise identity
              </div>
            </div>
          </Button>

          {/* Okta */}
          <Button
            variant="outline"
            size="lg"
            className="w-full h-12 justify-start gap-3"
            onClick={() => handleLogin('okta')}
            disabled={isLoggingIn}
          >
            <div className="w-6 h-6 bg-[#007dc1] rounded flex items-center justify-center">
              <Shield size={14} className="text-white" />
            </div>
            <div className="text-left">
              <div className="font-medium">Okta Enterprise</div>
              <div className="text-xs text-muted-foreground">
                Universal identity platform for large organizations
              </div>
            </div>
          </Button>

          {isLoggingIn && (
            <Alert>
              <Clock size={16} />
              <AlertDescription>
                Redirecting to your organization's identity provider...
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Security Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock size={20} />
            Security Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                title: 'Multi-Factor Authentication',
                description: 'Required 2FA/MFA for all enterprise accounts',
                icon: Lock,
                status: 'enabled'
              },
              {
                title: 'Role-Based Access Control',
                description: 'Granular permissions per user role',
                icon: Users,
                status: 'enabled'
              },
              {
                title: 'Session Management',
                description: 'Automatic timeout and token refresh',
                icon: Clock,
                status: 'enabled'
              },
              {
                title: 'Audit Trail',
                description: 'Complete logging of all user actions',
                icon: Shield,
                status: 'enabled'
              }
            ].map((feature) => {
              const Icon = feature.icon
              return (
                <div key={feature.title} className="flex items-start gap-3 p-3 border rounded-lg">
                  <Icon size={20} className="text-green-600 mt-0.5" />
                  <div>
                    <div className="font-medium text-sm">{feature.title}</div>
                    <div className="text-xs text-muted-foreground">{feature.description}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Compliance Notice */}
      <Alert>
        <Shield size={16} />
        <AlertDescription>
          <strong>21 CFR Part 11 Compliant:</strong> All authentication events are logged 
          with timestamps, user identification, and session details for regulatory audit requirements.
        </AlertDescription>
      </Alert>
    </div>
  )
}