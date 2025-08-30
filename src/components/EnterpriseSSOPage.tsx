import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Shield, 
  Users,
  Key,
  Settings,
  CheckCircle,
  AlertTriangle,
  Plus,
  Edit,
  Trash2,
  Copy,
  Eye,
  EyeSlash,
  Building,
  Lock,
  Globe,
  Clock
} from '@phosphor-icons/react'

interface SSOProvider {
  id: string
  name: string
  type: 'microsoft' | 'google' | 'okta' | 'auth0'
  status: 'active' | 'configured' | 'pending' | 'disabled'
  users: number
  lastSync: string
  domain: string
  mfaEnabled: boolean
  autoProvisioning: boolean
}

interface SSOConfiguration {
  clientId: string
  tenantId?: string
  domain: string
  redirectUri: string
  scopes: string[]
}

export function EnterpriseSSOPage() {
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null)
  const [showSecrets, setShowSecrets] = useState(false)

  const ssoProviders: SSOProvider[] = [
    {
      id: 'microsoft-azure',
      name: 'Microsoft Azure AD / Entra ID',
      type: 'microsoft',
      status: 'active',
      users: 1247,
      lastSync: '2024-03-15T14:30:00Z',
      domain: 'contoso.onmicrosoft.com',
      mfaEnabled: true,
      autoProvisioning: true
    },
    {
      id: 'google-workspace',
      name: 'Google Workspace',
      type: 'google',
      status: 'configured',
      users: 89,
      lastSync: '2024-03-15T12:15:00Z',
      domain: 'example.com',
      mfaEnabled: true,
      autoProvisioning: false
    },
    {
      id: 'okta-enterprise',
      name: 'Okta Enterprise',
      type: 'okta',
      status: 'pending',
      users: 0,
      lastSync: 'Never',
      domain: 'dev-12345.okta.com',
      mfaEnabled: false,
      autoProvisioning: false
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-600 text-white'
      case 'configured': return 'bg-blue-600 text-white'
      case 'pending': return 'bg-amber-600 text-white'
      case 'disabled': return 'bg-gray-500 text-white'
      default: return 'bg-gray-500 text-white'
    }
  }

  const getProviderIcon = (type: string) => {
    switch (type) {
      case 'microsoft': return '🔷'
      case 'google': return '🔴'
      case 'okta': return '🔵'
      case 'auth0': return '🟠'
      default: return '🔐'
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Shield size={32} />
            Enterprise SSO Configuration
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage identity providers and user authentication for your organization
          </p>
        </div>
        <Button>
          <Plus size={16} className="mr-2" />
          Add SSO Provider
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">3</div>
            <div className="text-xs text-muted-foreground">Active Providers</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">1,336</div>
            <div className="text-xs text-muted-foreground">Total Users</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">99.8%</div>
            <div className="text-xs text-muted-foreground">Uptime</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">2</div>
            <div className="text-xs text-muted-foreground">MFA Enabled</div>
          </CardContent>
        </Card>
      </div>

      {/* SSO Providers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {ssoProviders.map((provider) => (
          <Card key={provider.id} className="hover:shadow-md transition-all duration-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getProviderIcon(provider.type)}</span>
                  <div>
                    <CardTitle className="text-lg">{provider.name}</CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">{provider.domain}</p>
                  </div>
                </div>
                <Badge className={getStatusColor(provider.status)}>
                  {provider.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-xs text-muted-foreground">Active Users</div>
                  <div className="font-medium">{provider.users.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Last Sync</div>
                  <div className="font-medium">
                    {provider.lastSync === 'Never' ? 'Never' : 
                     new Date(provider.lastSync).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Multi-Factor Auth</span>
                  <div className="flex items-center gap-2">
                    {provider.mfaEnabled ? (
                      <CheckCircle size={16} className="text-green-600" />
                    ) : (
                      <AlertTriangle size={16} className="text-amber-600" />
                    )}
                    <span className="text-xs">{provider.mfaEnabled ? 'Enabled' : 'Disabled'}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Auto Provisioning</span>
                  <div className="flex items-center gap-2">
                    {provider.autoProvisioning ? (
                      <CheckCircle size={16} className="text-green-600" />
                    ) : (
                      <AlertTriangle size={16} className="text-amber-600" />
                    )}
                    <span className="text-xs">{provider.autoProvisioning ? 'Enabled' : 'Disabled'}</span>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => setSelectedProvider(provider.id)}
                >
                  <Settings size={14} className="mr-2" />
                  Configure
                </Button>
                <Button variant="outline" size="sm">
                  <Eye size={14} className="mr-2" />
                  Test
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Configuration Panel */}
      {selectedProvider && (
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings size={20} />
              SSO Configuration - {ssoProviders.find(p => p.id === selectedProvider)?.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert>
              <Shield size={16} />
              <AlertDescription>
                Changes to SSO configuration will affect all users in your organization. 
                Test thoroughly before applying changes.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Basic Configuration */}
              <div className="space-y-4">
                <h3 className="font-medium text-foreground">Basic Configuration</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="client-id">Client ID</Label>
                  <div className="relative">
                    <Input
                      id="client-id"
                      type={showSecrets ? 'text' : 'password'}
                      value="12345678-1234-1234-1234-123456789012"
                      readOnly
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1"
                      onClick={() => setShowSecrets(!showSecrets)}
                    >
                      {showSecrets ? <EyeSlash size={14} /> : <Eye size={14} />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tenant-id">Tenant ID</Label>
                  <Input
                    id="tenant-id"
                    value="abcdef12-3456-7890-abcd-ef1234567890"
                    readOnly
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="redirect-uri">Redirect URI</Label>
                  <Input
                    id="redirect-uri"
                    value="https://virtualbackroom.ai/auth/callback"
                    readOnly
                  />
                </div>
              </div>

              {/* Security Settings */}
              <div className="space-y-4">
                <h3 className="font-medium text-foreground">Security Settings</h3>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Require Multi-Factor Authentication</Label>
                    <p className="text-xs text-muted-foreground">Force MFA for all users</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Auto-Provision Users</Label>
                    <p className="text-xs text-muted-foreground">Automatically create accounts for new users</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Session Timeout</Label>
                    <p className="text-xs text-muted-foreground">Require re-authentication after inactivity</p>
                  </div>
                  <div className="text-sm text-foreground">8 hours</div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Device Trust</Label>
                    <p className="text-xs text-muted-foreground">Remember trusted devices</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button>
                <CheckCircle size={16} className="mr-2" />
                Save Configuration
              </Button>
              <Button variant="outline">
                <Copy size={16} className="mr-2" />
                Test Connection
              </Button>
              <Button variant="destructive">
                <Trash2 size={16} className="mr-2" />
                Remove Provider
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* User Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users size={20} />
            User Management & Permissions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Organization Administrators</h4>
                <p className="text-xs text-muted-foreground">Users with full administrative access</p>
              </div>
              <Badge variant="secondary">3 users</Badge>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Quality Managers</h4>
                <p className="text-xs text-muted-foreground">Users with compliance analysis access</p>
              </div>
              <Badge variant="secondary">24 users</Badge>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Standard Users</h4>
                <p className="text-xs text-muted-foreground">Read-only access to reports and standards</p>
              </div>
              <Badge variant="secondary">1,309 users</Badge>
            </div>

            <Separator />

            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Users size={14} className="mr-2" />
                Manage Roles
              </Button>
              <Button variant="outline" size="sm">
                <Building size={14} className="mr-2" />
                Org Settings
              </Button>
              <Button variant="outline" size="sm">
                <Lock size={14} className="mr-2" />
                Security Audit
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Compliance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock size={20} />
              Security Compliance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { item: 'SAML 2.0 Protocol', status: 'compliant' },
              { item: 'OAuth 2.0 / OpenID Connect', status: 'compliant' },
              { item: 'SOC 2 Type II Compliance', status: 'compliant' },
              { item: 'GDPR Data Protection', status: 'compliant' },
              { item: 'HIPAA Security Standards', status: 'compliant' },
              { item: 'ISO 27001 Certification', status: 'in-progress' }
            ].map((compliance, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm">{compliance.item}</span>
                {compliance.status === 'compliant' ? (
                  <CheckCircle size={16} className="text-green-600" />
                ) : (
                  <Clock size={16} className="text-amber-600" />
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe size={20} />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { action: 'Microsoft Azure AD sync completed', time: '2 minutes ago', user: 'System' },
              { action: 'New user provisioned: john.doe@contoso.com', time: '15 minutes ago', user: 'Azure AD' },
              { action: 'MFA policy updated', time: '1 hour ago', user: 'admin@contoso.com' },
              { action: 'Google Workspace test connection successful', time: '3 hours ago', user: 'System' },
              { action: 'Security audit completed', time: '1 day ago', user: 'Security Team' }
            ].map((activity, index) => (
              <div key={index} className="flex items-start gap-3 p-3 rounded-lg border">
                <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{activity.action}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground">{activity.time}</span>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-xs text-muted-foreground">{activity.user}</span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Integration Guide */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key size={20} />
            Integration Guide
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <span className="text-2xl">🔷</span>
              <div className="text-center">
                <div className="font-medium">Microsoft Setup</div>
                <div className="text-xs text-muted-foreground">Configure Azure AD / Entra ID</div>
              </div>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <span className="text-2xl">🔴</span>
              <div className="text-center">
                <div className="font-medium">Google Workspace</div>
                <div className="text-xs text-muted-foreground">Set up Google SSO integration</div>
              </div>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <span className="text-2xl">🔵</span>
              <div className="text-center">
                <div className="font-medium">Okta Enterprise</div>
                <div className="text-xs text-muted-foreground">Configure Okta identity provider</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}