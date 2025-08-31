import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { 
  Building2,
  Shield,
  Key,
  Users,
  Settings,
  CheckCircle,
  AlertTriangle,
  Clock,
  Globe,
  Lock,
  Smartphone,
  Server,
  Database,
  Network,
  Eye,
  UserCheck,
  Activity,
  BookOpen,
  ExternalLink
} from '@phosphor-icons/react'

interface SSOProvider {
  id: string
  name: string
  logo: string
  status: 'configured' | 'pending' | 'error'
  users: number
  lastSync: string
  features: string[]
  securityLevel: 'standard' | 'enhanced' | 'enterprise'
  mfaSupport: boolean
  provisioningSupport: boolean
}

interface SSOConfiguration {
  providerId: string
  clientId: string
  tenantId?: string
  domain: string
  autoProvisioning: boolean
  defaultRole: string
  attributeMapping: Record<string, string>
  securitySettings: {
    mfaRequired: boolean
    sessionTimeout: number
    allowedDomains: string[]
    conditionalAccess: boolean
  }
}

export function EnhancedEnterpriseSSOPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null)
  const [currentView, setCurrentView] = useState<'main' | 'setup-guide' | 'troubleshooting'>('main')

  const ssoProviders: SSOProvider[] = [
    {
      id: 'azure-ad',
      name: 'Microsoft Azure AD',
      logo: '🔷',
      status: 'configured',
      users: 847,
      lastSync: '2024-03-15T10:30:00Z',
      features: ['SAML 2.0', 'OpenID Connect', 'SCIM Provisioning', 'Conditional Access'],
      securityLevel: 'enterprise',
      mfaSupport: true,
      provisioningSupport: true
    },
    {
      id: 'google-workspace',
      name: 'Google Workspace',
      logo: '🔴',
      status: 'configured',
      users: 234,
      lastSync: '2024-03-15T09:45:00Z',
      features: ['SAML 2.0', 'OAuth 2.0', 'Directory Sync', 'Advanced Protection'],
      securityLevel: 'enhanced',
      mfaSupport: true,
      provisioningSupport: true
    },
    {
      id: 'okta',
      name: 'Okta',
      logo: '⚡',
      status: 'configured',
      users: 156,
      lastSync: '2024-03-15T11:15:00Z',
      features: ['SAML 2.0', 'OpenID Connect', 'SCIM 2.0', 'Adaptive MFA'],
      securityLevel: 'enterprise',
      mfaSupport: true,
      provisioningSupport: true
    },
    {
      id: 'ping-identity',
      name: 'PingIdentity',
      logo: '🟡',
      status: 'pending',
      users: 0,
      lastSync: 'N/A',
      features: ['SAML 2.0', 'OpenID Connect', 'Risk-based Authentication'],
      securityLevel: 'enterprise',
      mfaSupport: true,
      provisioningSupport: false
    }
  ]

  const mockConfiguration: SSOConfiguration = {
    providerId: 'azure-ad',
    clientId: 'a4b7c8d9-e1f2-4567-8901-234567890abc',
    tenantId: '12345678-90ab-cdef-1234-567890abcdef',
    domain: 'virtualbackroom.onmicrosoft.com',
    autoProvisioning: true,
    defaultRole: 'analyst',
    attributeMapping: {
      'email': 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress',
      'firstName': 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname',
      'lastName': 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname',
      'department': 'http://schemas.microsoft.com/ws/2008/06/identity/claims/department'
    },
    securitySettings: {
      mfaRequired: true,
      sessionTimeout: 480, // 8 hours
      allowedDomains: ['virtualbackroom.com', 'partner-org.com'],
      conditionalAccess: true
    }
  }

  const securityMetrics = [
    { label: 'Total SSO Users', value: '1,237', change: '+12%', icon: Users },
    { label: 'Active Sessions', value: '89', change: '-3%', icon: Activity },
    { label: 'MFA Adoption', value: '98.5%', change: '+2.1%', icon: Shield },
    { label: 'Failed Logins (24h)', value: '3', change: '-67%', icon: AlertTriangle }
  ]

  const recentActivity = [
    { user: 'sarah.chen@medtech.com', action: 'Login via Azure AD', time: '2 minutes ago', status: 'success' },
    { user: 'mike.rodriguez@pharma.com', action: 'MFA Challenge Completed', time: '5 minutes ago', status: 'success' },
    { user: 'admin@virtualbackroom.com', action: 'Updated SSO Configuration', time: '1 hour ago', status: 'info' },
    { user: 'jane.smith@biotech.com', action: 'Login Failed - Invalid Credentials', time: '2 hours ago', status: 'warning' }
  ]

  const OverviewTab = () => (
    <div className="space-y-6">
      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {securityMetrics.map((metric) => {
          const Icon = metric.icon
          return (
            <Card key={metric.label}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">{metric.label}</p>
                    <p className="text-xl font-bold text-foreground">{metric.value}</p>
                    <p className={`text-xs ${metric.change.startsWith('+') ? 'text-green-600' : metric.change.startsWith('-') ? 'text-red-600' : 'text-muted-foreground'}`}>
                      {metric.change} vs last month
                    </p>
                  </div>
                  <Icon size={20} className="text-primary" />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Provider Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 size={20} />
            Identity Provider Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {ssoProviders.map((provider) => (
            <div key={provider.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-4">
                <div className="text-2xl">{provider.logo}</div>
                <div>
                  <h4 className="font-medium">{provider.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {provider.users > 0 ? `${provider.users} active users` : 'Not configured'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge 
                  variant={provider.status === 'configured' ? 'default' : 
                          provider.status === 'pending' ? 'secondary' : 'destructive'}
                  className="text-xs"
                >
                  {provider.status === 'configured' ? 'Active' : 
                   provider.status === 'pending' ? 'Pending' : 'Error'}
                </Badge>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setSelectedProvider(provider.id)}
                  >
                    Configure
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      setSelectedProvider(provider.id)
                      setCurrentView('setup-guide')
                    }}
                  >
                    <BookOpen size={14} className="mr-1" />
                    Setup Guide
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye size={20} />
            Recent Authentication Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    activity.status === 'success' ? 'bg-green-500' :
                    activity.status === 'warning' ? 'bg-yellow-500' :
                    activity.status === 'info' ? 'bg-blue-500' : 'bg-red-500'
                  }`} />
                  <div>
                    <p className="text-sm font-medium">{activity.user}</p>
                    <p className="text-xs text-muted-foreground">{activity.action}</p>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  {activity.time}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const ConfigurationTab = () => (
    <div className="space-y-6">
      {/* Provider Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Identity Provider Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ssoProviders.map((provider) => (
              <Card 
                key={provider.id} 
                className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                  selectedProvider === provider.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setSelectedProvider(provider.id)}
              >
                <CardContent className="p-6 text-center space-y-3">
                  <div className="text-3xl">{provider.logo}</div>
                  <h4 className="font-medium">{provider.name}</h4>
                  <div className="space-y-1">
                    <Badge className={`text-xs ${getComplexityColor(provider.securityLevel)}`}>
                      {provider.securityLevel}
                    </Badge>
                    <div className="flex justify-center gap-1">
                      {provider.mfaSupport && <Badge variant="outline" className="text-xs">MFA</Badge>}
                      {provider.provisioningSupport && <Badge variant="outline" className="text-xs">Auto-Provision</Badge>}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {provider.features.length} features supported
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {selectedProvider && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings size={20} />
                  Configuration for {ssoProviders.find(p => p.id === selectedProvider)?.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Client ID</label>
                      <Input value={mockConfiguration.clientId} readOnly />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Tenant ID</label>
                      <Input value={mockConfiguration.tenantId} readOnly />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Domain</label>
                      <Input value={mockConfiguration.domain} readOnly />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Default Role</label>
                      <Input value={mockConfiguration.defaultRole} readOnly />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Session Timeout (minutes)</label>
                      <Input value={mockConfiguration.securitySettings.sessionTimeout} readOnly />
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <CheckCircle size={16} className="text-green-600" />
                        <span className="text-sm">Auto Provisioning</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle size={16} className="text-green-600" />
                        <span className="text-sm">MFA Required</span>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h5 className="font-medium mb-3">Attribute Mapping</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(mockConfiguration.attributeMapping).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <span className="text-sm font-medium">{key}</span>
                        <span className="text-xs text-muted-foreground font-mono">
                          {value.length > 30 ? value.substring(0, 30) + '...' : value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button>
                    <Settings size={16} className="mr-2" />
                    Update Configuration
                  </Button>
                  <Button variant="outline">
                    <Activity size={16} className="mr-2" />
                    Test Connection
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  )

  const SecurityTab = () => (
    <div className="space-y-6">
      {/* Security Policies */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield size={20} />
            Security Policies & Compliance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Authentication Policies */}
            <div className="space-y-4">
              <h4 className="font-medium flex items-center gap-2">
                <Key size={16} />
                Authentication Policies
              </h4>
              <div className="space-y-3">
                {[
                  { policy: 'Multi-Factor Authentication', status: 'enforced', coverage: '100%' },
                  { policy: 'Password Complexity', status: 'enforced', coverage: '100%' },
                  { policy: 'Session Management', status: 'active', coverage: '100%' },
                  { policy: 'Conditional Access', status: 'active', coverage: '87%' },
                  { policy: 'Risk-Based Authentication', status: 'active', coverage: '92%' }
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="text-sm font-medium">{item.policy}</p>
                      <p className="text-xs text-muted-foreground">Coverage: {item.coverage}</p>
                    </div>
                    <Badge variant={item.status === 'enforced' ? 'default' : 'secondary'} className="text-xs">
                      {item.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Compliance Standards */}
            <div className="space-y-4">
              <h4 className="font-medium flex items-center gap-2">
                <CheckCircle size={16} />
                Compliance Standards
              </h4>
              <div className="space-y-3">
                {[
                  { standard: 'SOC 2 Type II', status: 'certified', expiry: '2024-12-31' },
                  { standard: 'ISO 27001', status: 'certified', expiry: '2025-06-15' },
                  { standard: 'HIPAA Compliance', status: 'verified', expiry: 'Ongoing' },
                  { standard: 'GDPR Compliance', status: 'verified', expiry: 'Ongoing' },
                  { standard: '21 CFR Part 11', status: 'validated', expiry: 'Ongoing' }
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="text-sm font-medium">{item.standard}</p>
                      <p className="text-xs text-muted-foreground">Expires: {item.expiry}</p>
                    </div>
                    <Badge variant="default" className="text-xs bg-green-600 text-white">
                      {item.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Monitoring */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye size={20} />
            Real-time Security Monitoring
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <h5 className="font-medium text-sm">Authentication Events (24h)</h5>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Successful Logins</span>
                  <span className="font-medium text-green-600">1,847</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Failed Attempts</span>
                  <span className="font-medium text-red-600">3</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>MFA Challenges</span>
                  <span className="font-medium text-blue-600">234</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h5 className="font-medium text-sm">Session Analytics</h5>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Average Session Length</span>
                  <span className="font-medium">3.2 hours</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Concurrent Peak</span>
                  <span className="font-medium">156 users</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Geographic Distribution</span>
                  <span className="font-medium">12 countries</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h5 className="font-medium text-sm">Security Alerts</h5>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span>All systems normal</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 rounded-full bg-yellow-500" />
                  <span>1 security review pending</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <span>Policy update available</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const UsersTab = () => (
    <div className="space-y-6">
      {/* User Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users size={20} />
            User Management & Provisioning
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* User Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Users', value: '1,237', icon: Users },
              { label: 'Active Today', value: '89', icon: UserCheck },
              { label: 'Pending Invites', value: '12', icon: Clock },
              { label: 'Deactivated', value: '8', icon: AlertTriangle }
            ].map((stat) => {
              const Icon = stat.icon
              return (
                <div key={stat.label} className="text-center p-4 border rounded-lg">
                  <Icon size={20} className="mx-auto mb-2 text-primary" />
                  <div className="text-xl font-bold">{stat.value}</div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </div>
              )
            })}
          </div>

          <Separator />

          {/* User Roles Distribution */}
          <div>
            <h5 className="font-medium mb-3">User Roles Distribution</h5>
            <div className="space-y-3">
              {[
                { role: 'Quality Analyst', count: 542, percentage: 44 },
                { role: 'Regulatory Affairs', count: 378, percentage: 31 },
                { role: 'Quality Manager', count: 234, percentage: 19 },
                { role: 'Admin', count: 83, percentage: 6 }
              ].map((role) => (
                <div key={role.role} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{role.role}</span>
                    <span className="text-muted-foreground">{role.count} users ({role.percentage}%)</span>
                  </div>
                  <Progress value={role.percentage} className="h-2" />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Provisioning Rules */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings size={20} />
            Auto-Provisioning Rules
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { 
                rule: 'Quality Department → Quality Analyst Role',
                condition: 'department == "Quality Assurance"',
                action: 'Assign "Quality Analyst" role + QA workspace access',
                status: 'active'
              },
              { 
                rule: 'Regulatory Team → Regulatory Affairs Role',
                condition: 'department == "Regulatory Affairs"',
                action: 'Assign "Regulatory Affairs" role + Global regulations access',
                status: 'active'
              },
              { 
                rule: 'Management → Quality Manager Role',
                condition: 'title contains "Manager" OR "Director"',
                action: 'Assign "Quality Manager" role + Full dashboard access',
                status: 'active'
              }
            ].map((rule, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <h6 className="font-medium text-sm">{rule.rule}</h6>
                      <p className="text-xs text-muted-foreground">
                        <span className="font-medium">If:</span> {rule.condition}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        <span className="font-medium">Then:</span> {rule.action}
                      </p>
                    </div>
                    <Badge variant={rule.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                      {rule.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const SetupGuideView = () => {
    const provider = ssoProviders.find(p => p.id === selectedProvider)
    if (!provider) return null

    const getSetupSteps = (providerId: string) => {
      switch (providerId) {
        case 'azure-ad':
          return [
            {
              step: 1,
              title: 'Register VirtualBackroom.ai in Azure AD',
              description: 'Go to Azure AD App registrations and create a new application',
              details: [
                'Sign in to the Azure portal as a Global Administrator',
                'Navigate to Azure Active Directory > App registrations',
                'Click "New registration" and name it "VirtualBackroom.ai"',
                'Set redirect URI to: https://app.virtualbackroom.ai/auth/callback'
              ]
            },
            {
              step: 2,
              title: 'Configure Authentication',
              description: 'Set up SAML 2.0 or OpenID Connect authentication',
              details: [
                'In the app registration, go to Authentication',
                'Enable "ID tokens" and "Access tokens"',
                'Add web redirect URIs for your domain',
                'Configure logout URL: https://app.virtualbackroom.ai/auth/logout'
              ]
            },
            {
              step: 3,
              title: 'Configure API Permissions',
              description: 'Grant necessary permissions for user profile access',
              details: [
                'Go to API permissions',
                'Add Microsoft Graph permissions: User.Read, Directory.Read.All',
                'Grant admin consent for your organization',
                'Note the Application (client) ID and Directory (tenant) ID'
              ]
            },
            {
              step: 4,
              title: 'Enable Enterprise Features',
              description: 'Configure conditional access and MFA requirements',
              details: [
                'Set up conditional access policies',
                'Configure MFA requirements for VirtualBackroom.ai',
                'Enable security defaults if not using custom policies',
                'Test authentication with a pilot user group'
              ]
            }
          ]
        case 'google-workspace':
          return [
            {
              step: 1,
              title: 'Create OAuth 2.0 Application',
              description: 'Set up OAuth application in Google Cloud Console',
              details: [
                'Go to Google Cloud Console > APIs & Services > Credentials',
                'Click "Create Credentials" > "OAuth 2.0 Client ID"',
                'Choose "Web application" as application type',
                'Add authorized redirect URI: https://app.virtualbackroom.ai/auth/google/callback'
              ]
            },
            {
              step: 2,
              title: 'Configure SAML SSO (Optional)',
              description: 'Set up SAML for enhanced enterprise features',
              details: [
                'In Google Admin Console, go to Apps > Web and mobile apps',
                'Click "Add app" > "Add custom SAML app"',
                'Download IdP metadata or note SSO URL and certificate',
                'Configure service provider details with VirtualBackroom.ai URLs'
              ]
            },
            {
              step: 3,
              title: 'Enable Directory API',
              description: 'Allow user provisioning and directory sync',
              details: [
                'Enable Google Admin SDK API in Cloud Console',
                'Create a service account with domain-wide delegation',
                'Grant necessary scopes: directory.user.read, directory.group.read',
                'Download service account key file (JSON)'
              ]
            },
            {
              step: 4,
              title: 'Configure Security Policies',
              description: 'Set up 2FA and advanced protection',
              details: [
                'Enable 2-Step Verification for all users',
                'Consider enrolling key users in Advanced Protection Program',
                'Configure app passwords if needed',
                'Set up context-aware access policies'
              ]
            }
          ]
        case 'okta':
          return [
            {
              step: 1,
              title: 'Create Okta Application',
              description: 'Set up VirtualBackroom.ai as a new application in Okta',
              details: [
                'Log in to Okta Admin Console',
                'Go to Applications > Applications',
                'Click "Create App Integration"',
                'Choose "SAML 2.0" or "OpenID Connect" based on your preference'
              ]
            },
            {
              step: 2,
              title: 'Configure SAML Settings',
              description: 'Set up SAML configuration for secure authentication',
              details: [
                'Single sign on URL: https://app.virtualbackroom.ai/auth/saml/callback',
                'Audience URI: https://app.virtualbackroom.ai',
                'Name ID format: EmailAddress',
                'Configure attribute statements for user profile mapping'
              ]
            },
            {
              step: 3,
              title: 'Set Up User Provisioning',
              description: 'Enable SCIM for automated user lifecycle management',
              details: [
                'Go to Provisioning tab in your application',
                'Enable "To App" provisioning',
                'Configure SCIM 2.0 endpoint: https://api.virtualbackroom.ai/scim/v2',
                'Set up attribute mappings for user profiles'
              ]
            },
            {
              step: 4,
              title: 'Configure Security Policies',
              description: 'Set up adaptive MFA and risk-based policies',
              details: [
                'Configure MFA policy for VirtualBackroom.ai access',
                'Set up adaptive authentication based on risk factors',
                'Configure network zone restrictions if needed',
                'Test with pilot user group before full rollout'
              ]
            }
          ]
        default:
          return []
      }
    }

    const steps = getSetupSteps(selectedProvider!)

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => setCurrentView('main')}>
            ← Back to SSO Overview
          </Button>
          <div>
            <h2 className="text-2xl font-bold">{provider.name} Setup Guide</h2>
            <p className="text-muted-foreground text-sm">
              Step-by-step configuration instructions for enterprise SSO integration
            </p>
          </div>
        </div>

        {/* Setup Progress */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Setup Progress</h3>
              <Badge variant="secondary">
                {steps.filter((_, i) => i < 2).length}/{steps.length} Complete
              </Badge>
            </div>
            <div className="flex gap-2">
              {steps.map((step, index) => (
                <div
                  key={step.step}
                  className={`flex-1 h-2 rounded-full ${
                    index < 2 ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Setup Steps */}
        <div className="space-y-6">
          {steps.map((step, index) => (
            <Card key={step.step} className={index < 2 ? 'border-primary/50' : ''}>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    index < 2 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                  }`}>
                    {step.step}
                  </div>
                  {step.title}
                  {index < 2 && <CheckCircle size={20} className="text-green-600" />}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">{step.description}</p>
                <div className="space-y-2">
                  {step.details.map((detail, detailIndex) => (
                    <div key={detailIndex} className="flex items-start gap-3 text-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                      <span>{detail}</span>
                    </div>
                  ))}
                </div>
                {index >= 2 && (
                  <Button variant="outline" size="sm">
                    <ExternalLink size={14} className="mr-2" />
                    Open {provider.name} Console
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Configuration Test */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield size={20} />
              Test Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Once configuration is complete, test the SSO integration to ensure everything works correctly.
            </p>
            <div className="flex gap-3">
              <Button>
                <Shield size={16} className="mr-2" />
                Test SSO Connection
              </Button>
              <Button variant="outline">
                <Users size={16} className="mr-2" />
                Test User Provisioning
              </Button>
              <Button variant="outline">
                <Lock size={16} className="mr-2" />
                Test MFA Flow
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const getComplexityColor = (level: string) => {
    switch (level) {
      case 'standard': return 'bg-blue-100 text-blue-800'
      case 'enhanced': return 'bg-yellow-100 text-yellow-800'
      case 'enterprise': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (currentView === 'setup-guide') {
    return <SetupGuideView />
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Building2 size={32} />
            Enterprise SSO & Identity Management
          </h1>
          <p className="text-muted-foreground mt-2">
            Secure, scalable identity management with enterprise-grade SSO integration
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Globe size={16} className="mr-2" />
            SSO Health Check
          </Button>
          <Button variant="outline">
            <BookOpen size={16} className="mr-2" />
            Setup Guides
          </Button>
          <Button>
            <UserCheck size={16} className="mr-2" />
            Invite Users
          </Button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview & Monitoring</TabsTrigger>
          <TabsTrigger value="configuration">Provider Configuration</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <OverviewTab />
        </TabsContent>

        <TabsContent value="configuration" className="mt-6">
          <ConfigurationTab />
        </TabsContent>

        <TabsContent value="users" className="mt-6">
          <UsersTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}