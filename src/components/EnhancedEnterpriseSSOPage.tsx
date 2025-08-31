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
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      setSelectedProvider(provider.id)
                      setCurrentView('troubleshooting')
                    }}
                  >
                    <AlertTriangle size={14} className="mr-1" />
                    Troubleshoot
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
              title: 'Prerequisites & Access Requirements',
              description: 'Ensure you have the necessary permissions and access to Azure AD',
              details: [
                'Verify you have Global Administrator or Application Administrator role in Azure AD',
                'Confirm your organization has Azure AD Premium P1 or P2 (required for conditional access)',
                'Ensure you have access to the VirtualBackroom.ai admin portal',
                'Document your current Azure AD tenant ID for reference'
              ],
              configItems: [
                { label: 'Required Role', value: 'Global Administrator or Application Administrator' },
                { label: 'Azure AD License', value: 'Premium P1/P2 (for Conditional Access)' },
                { label: 'VirtualBackroom Access', value: 'Admin Portal Access Required' }
              ]
            },
            {
              step: 2,
              title: 'Register VirtualBackroom.ai in Azure AD',
              description: 'Create and configure the application registration in Azure AD',
              details: [
                'Sign in to the Azure portal (portal.azure.com) as a Global Administrator',
                'Navigate to Azure Active Directory > App registrations',
                'Click "New registration" and provide the following details:',
                '  • Name: "VirtualBackroom.ai"',
                '  • Supported account types: "Accounts in this organizational directory only"',
                '  • Redirect URI: Web - https://app.virtualbackroom.ai/auth/azure/callback',
                'Click "Register" to create the application',
                'Copy the Application (client) ID and Directory (tenant) ID for later use'
              ],
              configItems: [
                { label: 'Application Name', value: 'VirtualBackroom.ai' },
                { label: 'Redirect URI', value: 'https://app.virtualbackroom.ai/auth/azure/callback' },
                { label: 'Logout URI', value: 'https://app.virtualbackroom.ai/auth/logout' }
              ]
            },
            {
              step: 3,
              title: 'Configure Authentication & Tokens',
              description: 'Set up token configuration and authentication flows',
              details: [
                'In your app registration, go to Authentication',
                'Under "Implicit grant and hybrid flows":',
                '  • Check "ID tokens (used for implicit and hybrid flows)"',
                '  • Check "Access tokens (used for implicit flows)"',
                'Add additional redirect URIs if you have staging environments',
                'Set Front-channel logout URL: https://app.virtualbackroom.ai/auth/logout',
                'Under "Advanced settings", set "Allow public client flows" to "No"'
              ],
              configItems: [
                { label: 'ID Tokens', value: 'Enabled' },
                { label: 'Access Tokens', value: 'Enabled' },
                { label: 'Public Client Flows', value: 'Disabled' },
                { label: 'Logout URL', value: 'https://app.virtualbackroom.ai/auth/logout' }
              ]
            },
            {
              step: 4,
              title: 'Configure API Permissions',
              description: 'Grant necessary Microsoft Graph permissions for user profile access',
              details: [
                'Go to API permissions in your app registration',
                'Click "Add a permission" > "Microsoft Graph" > "Delegated permissions"',
                'Add the following permissions:',
                '  • User.Read (Read user profile)',
                '  • Directory.Read.All (Read directory data)',
                '  • Group.Read.All (Read all groups)',
                '  • User.ReadBasic.All (Read all users\' basic profiles)',
                'Click "Grant admin consent for [Your Organization]"',
                'Verify all permissions show "Granted for [Your Organization]"'
              ],
              configItems: [
                { label: 'User.Read', value: 'Delegated - Required' },
                { label: 'Directory.Read.All', value: 'Delegated - Required' },
                { label: 'Group.Read.All', value: 'Delegated - Optional' },
                { label: 'Admin Consent', value: 'Required' }
              ]
            },
            {
              step: 5,
              title: 'Create Client Secret',
              description: 'Generate a secure client secret for backend authentication',
              details: [
                'Go to Certificates & secrets in your app registration',
                'Click "New client secret"',
                'Add description: "VirtualBackroom.ai Production Secret"',
                'Set expiration: "24 months" (recommended for production)',
                'Click "Add" and immediately copy the secret value',
                '⚠️ Important: Store this secret securely - it cannot be retrieved again',
                'Document the secret ID and expiration date for renewal tracking'
              ],
              configItems: [
                { label: 'Secret Description', value: 'VirtualBackroom.ai Production Secret' },
                { label: 'Expiration', value: '24 months' },
                { label: 'Security Note', value: 'Store in secure key vault' }
              ]
            },
            {
              step: 6,
              title: 'Configure Enterprise Features & Conditional Access',
              description: 'Set up advanced security policies and conditional access',
              details: [
                'Navigate to Azure AD > Security > Conditional Access',
                'Create a new policy: "VirtualBackroom.ai Access Policy"',
                'Assignments:',
                '  • Users: Include your VirtualBackroom.ai user group',
                '  • Cloud apps: Select "VirtualBackroom.ai" application',
                'Access controls:',
                '  • Grant: Require multi-factor authentication',
                '  • Grant: Require device to be marked as compliant (optional)',
                '  • Session: Sign-in frequency every 8 hours',
                'Enable the policy and test with a pilot user'
              ],
              configItems: [
                { label: 'Policy Name', value: 'VirtualBackroom.ai Access Policy' },
                { label: 'MFA Required', value: 'Yes' },
                { label: 'Session Frequency', value: '8 hours' },
                { label: 'Device Compliance', value: 'Optional' }
              ]
            },
            {
              step: 7,
              title: 'Configure VirtualBackroom.ai Settings',
              description: 'Complete the configuration in VirtualBackroom.ai admin portal',
              details: [
                'Log in to VirtualBackroom.ai Admin Portal',
                'Navigate to Settings > Enterprise SSO',
                'Select "Microsoft Azure AD" as identity provider',
                'Enter configuration values:',
                '  • Tenant ID: [Your Directory tenant ID]',
                '  • Client ID: [Your Application client ID]',
                '  • Client Secret: [The secret you created]',
                'Configure attribute mapping for user profiles',
                'Set default role assignment for new users',
                'Enable auto-provisioning if desired',
                'Save configuration and run connection test'
              ],
              configItems: [
                { label: 'Identity Provider', value: 'Microsoft Azure AD' },
                { label: 'Auto-Provisioning', value: 'Recommended: Enabled' },
                { label: 'Default Role', value: 'Quality Analyst' },
                { label: 'Connection Test', value: 'Must Pass Before Activation' }
              ]
            }
          ]
        case 'google-workspace':
          return [
            {
              step: 1,
              title: 'Prerequisites & Google Workspace Setup',
              description: 'Ensure proper access and Google Workspace configuration',
              details: [
                'Verify you have Super Admin privileges in Google Workspace',
                'Confirm your Google Workspace edition supports SSO (Business Standard or higher)',
                'Access Google Cloud Console with the same account',
                'Ensure your domain is verified in Google Workspace',
                'Document your Google Workspace domain for reference'
              ],
              configItems: [
                { label: 'Required Role', value: 'Super Admin' },
                { label: 'Workspace Edition', value: 'Business Standard or higher' },
                { label: 'Domain Verification', value: 'Required' },
                { label: 'Cloud Console Access', value: 'Same account recommended' }
              ]
            },
            {
              step: 2,
              title: 'Create OAuth 2.0 Application in Google Cloud',
              description: 'Set up OAuth application for secure authentication',
              details: [
                'Go to Google Cloud Console (console.cloud.google.com)',
                'Select or create a project for VirtualBackroom.ai integration',
                'Navigate to APIs & Services > Credentials',
                'Click "Create Credentials" > "OAuth 2.0 Client ID"',
                'Configure OAuth consent screen if prompted:',
                '  • Application name: "VirtualBackroom.ai"',
                '  • User support email: your admin email',
                '  • Authorized domains: virtualbackroom.ai',
                'Choose "Web application" as application type',
                'Add authorized redirect URIs:',
                '  • https://app.virtualbackroom.ai/auth/google/callback',
                '  • https://staging.virtualbackroom.ai/auth/google/callback (if applicable)',
                'Click "Create" and save the Client ID and Client Secret'
              ],
              configItems: [
                { label: 'Application Type', value: 'Web Application' },
                { label: 'Redirect URI', value: 'https://app.virtualbackroom.ai/auth/google/callback' },
                { label: 'Authorized Domains', value: 'virtualbackroom.ai' }
              ]
            },
            {
              step: 3,
              title: 'Configure SAML SSO in Google Admin Console',
              description: 'Set up SAML for enhanced enterprise SSO features',
              details: [
                'Go to Google Admin Console (admin.google.com)',
                'Navigate to Apps > Web and mobile apps',
                'Click "Add app" > "Add custom SAML app"',
                'App details:',
                '  • App name: "VirtualBackroom.ai"',
                '  • Description: "AI-Powered Regulatory Compliance Platform"',
                '  • Upload app icon (optional)',
                'Download the IdP metadata or note:',
                '  • SSO URL: Copy this for VirtualBackroom.ai configuration',
                '  • Entity ID: Copy this value',
                '  • Certificate: Download or copy the signing certificate',
                'Configure service provider details:',
                '  • ACS URL: https://app.virtualbackroom.ai/auth/saml/google',
                '  • Entity ID: https://app.virtualbackroom.ai',
                '  • Name ID format: EMAIL',
                '  • Name ID: Basic Information > Primary email',
                'Add attribute mappings:',
                '  • first_name: Basic Information > First name',
                '  • last_name: Basic Information > Last name',
                '  • department: Directory > Department'
              ],
              configItems: [
                { label: 'ACS URL', value: 'https://app.virtualbackroom.ai/auth/saml/google' },
                { label: 'Entity ID', value: 'https://app.virtualbackroom.ai' },
                { label: 'Name ID Format', value: 'EMAIL' },
                { label: 'Attribute Mapping', value: 'first_name, last_name, department' }
              ]
            },
            {
              step: 4,
              title: 'Enable Directory API for User Provisioning',
              description: 'Set up automated user provisioning and directory sync',
              details: [
                'In Google Cloud Console, go to APIs & Services > Library',
                'Search for and enable "Admin SDK API"',
                'Go to APIs & Services > Credentials',
                'Click "Create Credentials" > "Service account"',
                'Service account details:',
                '  • Name: "virtualbackroom-directory-sync"',
                '  • Description: "Service account for user provisioning"',
                'Grant service account roles:',
                '  • Service Account User',
                '  • Service Account Token Creator',
                'Create and download a JSON key file for the service account',
                'Enable domain-wide delegation for the service account',
                'In Google Admin Console > Security > API controls',
                'Add the service account client ID with scopes:',
                '  • https://www.googleapis.com/auth/admin.directory.user.readonly',
                '  • https://www.googleapis.com/auth/admin.directory.group.readonly'
              ],
              configItems: [
                { label: 'Service Account', value: 'virtualbackroom-directory-sync' },
                { label: 'Domain-wide Delegation', value: 'Enabled' },
                { label: 'Required Scopes', value: 'directory.user.readonly, directory.group.readonly' }
              ]
            },
            {
              step: 5,
              title: 'Configure Security & 2FA Requirements',
              description: 'Set up advanced protection and security policies',
              details: [
                'In Google Admin Console, go to Security > 2-step verification',
                'Ensure 2-step verification is enforced for all users',
                'Consider enabling Advanced Protection Program for key users:',
                '  • Navigate to Security > Advanced Protection Program',
                '  • Enroll administrative and high-privilege users',
                'Configure context-aware access (if available):',
                '  • Go to Security > Context-aware access',
                '  • Create access level for VirtualBackroom.ai',
                '  • Set conditions: Corporate network, managed devices, etc.',
                'Set up app-specific passwords if needed for legacy integrations'
              ],
              configItems: [
                { label: '2FA Enforcement', value: 'All Users' },
                { label: 'Advanced Protection', value: 'Recommended for Admins' },
                { label: 'Context-aware Access', value: 'Corporate Network + Managed Devices' }
              ]
            },
            {
              step: 6,
              title: 'Complete VirtualBackroom.ai Configuration',
              description: 'Configure the SSO settings in VirtualBackroom.ai admin portal',
              details: [
                'Log in to VirtualBackroom.ai Admin Portal',
                'Navigate to Settings > Enterprise SSO',
                'Select "Google Workspace" as identity provider',
                'Enter OAuth configuration:',
                '  • Client ID: [From Google Cloud Console]',
                '  • Client Secret: [From Google Cloud Console]',
                '  • Domain: [Your Google Workspace domain]',
                'Enter SAML configuration (if using SAML):',
                '  • SSO URL: [From Google Admin Console]',
                '  • Certificate: [Upload downloaded certificate]',
                '  • Entity ID: [From Google Admin Console]',
                'Configure user attribute mapping',
                'Set default role for new users: "Quality Analyst"',
                'Enable auto-provisioning',
                'Test configuration with your admin account'
              ],
              configItems: [
                { label: 'OAuth Client ID', value: 'From Google Cloud Console' },
                { label: 'SAML SSO URL', value: 'From Google Admin Console' },
                { label: 'Default Role', value: 'Quality Analyst' },
                { label: 'Auto-Provisioning', value: 'Enabled' }
              ]
            }
          ]
        case 'okta':
          return [
            {
              step: 1,
              title: 'Prerequisites & Okta Access',
              description: 'Verify Okta access and plan the integration approach',
              details: [
                'Ensure you have Okta Super Administrator privileges',
                'Verify your Okta edition supports SAML and SCIM (Professional or Enterprise)',
                'Plan integration method: SAML 2.0 (recommended) or OpenID Connect',
                'Document your Okta domain URL (e.g., yourcompany.okta.com)',
                'Prepare VirtualBackroom.ai admin credentials for configuration'
              ],
              configItems: [
                { label: 'Required Role', value: 'Super Administrator' },
                { label: 'Okta Edition', value: 'Professional or Enterprise' },
                { label: 'Integration Method', value: 'SAML 2.0 (Recommended)' },
                { label: 'Okta Domain', value: 'yourcompany.okta.com' }
              ]
            },
            {
              step: 2,
              title: 'Create VirtualBackroom.ai Application in Okta',
              description: 'Set up the application integration in Okta Admin Console',
              details: [
                'Log in to Okta Admin Console (yourcompany-admin.okta.com)',
                'Navigate to Applications > Applications',
                'Click "Create App Integration"',
                'Choose "SAML 2.0" (recommended for enterprise features)',
                'General Settings:',
                '  • App name: "VirtualBackroom.ai"',
                '  • App logo: Upload VirtualBackroom.ai logo (optional)',
                '  • App visibility: Check both "Do not display..." options for security',
                'Click "Next" to proceed to SAML settings'
              ],
              configItems: [
                { label: 'Application Name', value: 'VirtualBackroom.ai' },
                { label: 'Integration Type', value: 'SAML 2.0' },
                { label: 'App Visibility', value: 'Hidden from dashboard' }
              ]
            },
            {
              step: 3,
              title: 'Configure SAML Settings',
              description: 'Set up the SAML configuration for secure authentication',
              details: [
                'Configure SAML Settings:',
                '  • Single sign on URL: https://app.virtualbackroom.ai/auth/saml/okta',
                '  • Audience URI (SP Entity ID): https://app.virtualbackroom.ai',
                '  • Default RelayState: (leave blank)',
                '  • Name ID format: EmailAddress',
                '  • Application username: Email',
                'Attribute Statements (optional but recommended):',
                '  • firstName: user.firstName',
                '  • lastName: user.lastName',
                '  • email: user.email',
                '  • department: user.department',
                '  • title: user.title',
                'Group Attribute Statements (if using groups):',
                '  • groups: (regex: .*) - Include all groups',
                'Click "Next" and choose "I\'m an Okta customer adding an internal app"',
                'Click "Finish" to create the application'
              ],
              configItems: [
                { label: 'SSO URL', value: 'https://app.virtualbackroom.ai/auth/saml/okta' },
                { label: 'Audience URI', value: 'https://app.virtualbackroom.ai' },
                { label: 'Name ID Format', value: 'EmailAddress' },
                { label: 'Attribute Mapping', value: 'firstName, lastName, email, department' }
              ]
            },
            {
              step: 4,
              title: 'Set Up SCIM Provisioning',
              description: 'Enable automated user lifecycle management',
              details: [
                'In your VirtualBackroom.ai application, go to Provisioning tab',
                'Click "Configure API Integration"',
                'Check "Enable API integration"',
                'Configure SCIM 2.0 settings:',
                '  • SCIM connector base URL: https://api.virtualbackroom.ai/scim/v2',
                '  • Unique identifier field for users: email',
                '  • Supported provisioning actions: Import users, Push new users, Push profile updates, Push user deactivation',
                'Authentication:',
                '  • Method: HTTP Header',
                '  • Authorization: Bearer [VirtualBackroom.ai SCIM token]',
                'Test API connection to ensure connectivity',
                'Enable provisioning "To App" and configure:',
                '  • Create users: Enable',
                '  • Update user attributes: Enable',
                '  • Deactivate users: Enable'
              ],
              configItems: [
                { label: 'SCIM Base URL', value: 'https://api.virtualbackroom.ai/scim/v2' },
                { label: 'Authentication', value: 'Bearer Token' },
                { label: 'Provisioning Actions', value: 'Create, Update, Deactivate' },
                { label: 'Unique Identifier', value: 'email' }
              ]
            },
            {
              step: 5,
              title: 'Configure Security Policies & Adaptive MFA',
              description: 'Set up risk-based authentication and security policies',
              details: [
                'Navigate to Security > Authenticators',
                'Ensure required MFA methods are available:',
                '  • Okta Verify Push (recommended)',
                '  • SMS Authentication (fallback)',
                '  • Voice Call Authentication (fallback)',
                'Go to Security > Authentication Policies',
                'Create policy for VirtualBackroom.ai:',
                '  • Policy name: "VirtualBackroom.ai Access"',
                '  • Allowed authenticators: Okta Verify Push + SMS',
                '  • Additional verification: Require for high-risk scenarios',
                'Configure adaptive authentication:',
                '  • New device: Require additional verification',
                '  • New location: Require additional verification',
                '  • Velocity: Limit rapid login attempts',
                'Assign policy to VirtualBackroom.ai application'
              ],
              configItems: [
                { label: 'Primary MFA', value: 'Okta Verify Push' },
                { label: 'Fallback MFA', value: 'SMS + Voice' },
                { label: 'Adaptive Auth', value: 'New Device + Location' },
                { label: 'Risk Policies', value: 'High Risk = Additional Verification' }
              ]
            },
            {
              step: 6,
              title: 'Assign Users and Groups',
              description: 'Configure user access and role assignments',
              details: [
                'In your VirtualBackroom.ai application, go to Assignments tab',
                'Click "Assign" and choose assignment method:',
                '  • Assign to People: Individual user assignments',
                '  • Assign to Groups: Group-based assignments (recommended)',
                'For group assignments:',
                '  • Create or select relevant groups (e.g., "Quality Team", "Regulatory Affairs")',
                '  • Assign appropriate application roles during assignment',
                'Configure default role mapping:',
                '  • Quality Team → Quality Analyst role',
                '  • Regulatory Affairs → Regulatory Affairs role',
                '  • Management → Quality Manager role',
                'Test assignment by checking user access'
              ],
              configItems: [
                { label: 'Assignment Method', value: 'Group-based (Recommended)' },
                { label: 'Quality Team Role', value: 'Quality Analyst' },
                { label: 'Regulatory Role', value: 'Regulatory Affairs' },
                { label: 'Management Role', value: 'Quality Manager' }
              ]
            },
            {
              step: 7,
              title: 'Complete VirtualBackroom.ai Configuration',
              description: 'Finalize the SSO setup in VirtualBackroom.ai admin portal',
              details: [
                'Log in to VirtualBackroom.ai Admin Portal',
                'Navigate to Settings > Enterprise SSO',
                'Select "Okta" as identity provider',
                'Configure SAML settings:',
                '  • Identity Provider URL: [From Okta metadata]',
                '  • Identity Provider Certificate: [Upload from Okta]',
                '  • Service Provider Entity ID: https://app.virtualbackroom.ai',
                'Configure user attribute mapping:',
                '  • Email: email',
                '  • First Name: firstName',
                '  • Last Name: lastName',
                '  • Department: department',
                'Set default role for new users: "Quality Analyst"',
                'Enable auto-provisioning and deprovisioning',
                'Save configuration and run comprehensive connection test',
                'Perform end-to-end test with a pilot user'
              ],
              configItems: [
                { label: 'Identity Provider', value: 'Okta' },
                { label: 'Service Provider Entity ID', value: 'https://app.virtualbackroom.ai' },
                { label: 'Auto-Provisioning', value: 'Enabled' },
                { label: 'Default Role', value: 'Quality Analyst' }
              ]
            }
          ]
        case 'ping-identity':
          return [
            {
              step: 1,
              title: 'Prerequisites & PingIdentity Access',
              description: 'Verify access and prepare for PingIdentity integration',
              details: [
                'Ensure you have PingIdentity Administrator privileges',
                'Verify your PingIdentity subscription includes SAML/SCIM capabilities',
                'Access PingOne Admin Console or PingFederate Management Console',
                'Document your PingIdentity environment details',
                'Prepare VirtualBackroom.ai admin credentials'
              ],
              configItems: [
                { label: 'Required Role', value: 'PingIdentity Administrator' },
                { label: 'Required Features', value: 'SAML 2.0, SCIM 2.0' },
                { label: 'Admin Console', value: 'PingOne or PingFederate' }
              ]
            },
            {
              step: 2,
              title: 'Create Application in PingOne',
              description: 'Set up VirtualBackroom.ai as a new SAML application',
              details: [
                'Log in to PingOne Admin Console',
                'Navigate to Connections > Applications',
                'Click "+" to add a new application',
                'Choose "SAML Application" type',
                'Application details:',
                '  • Application name: "VirtualBackroom.ai"',
                '  • Description: "AI-Powered Regulatory Compliance Platform"',
                '  • Category: Business Productivity',
                'Configure SAML:',
                '  • ACS URLs: https://app.virtualbackroom.ai/auth/saml/ping',
                '  • Entity ID: https://app.virtualbackroom.ai',
                '  • SLO Endpoint: https://app.virtualbackroom.ai/auth/logout',
                'Save application and note the SSO URL and certificate'
              ],
              configItems: [
                { label: 'Application Type', value: 'SAML Application' },
                { label: 'ACS URL', value: 'https://app.virtualbackroom.ai/auth/saml/ping' },
                { label: 'Entity ID', value: 'https://app.virtualbackroom.ai' },
                { label: 'SLO Endpoint', value: 'https://app.virtualbackroom.ai/auth/logout' }
              ]
            },
            {
              step: 3,
              title: 'Configure Attribute Mapping',
              description: 'Set up user attribute mapping for profile data',
              details: [
                'In the application configuration, go to Attribute Mapping',
                'Configure the following mappings:',
                '  • email: saml_subject',
                '  • firstName: given_name',
                '  • lastName: family_name',
                '  • department: department',
                '  • title: title',
                'Set Name ID format to "Email Address"',
                'Configure group membership attributes if using role-based access',
                'Save attribute mapping configuration'
              ],
              configItems: [
                { label: 'Name ID Format', value: 'Email Address' },
                { label: 'Email Mapping', value: 'saml_subject' },
                { label: 'Name Mapping', value: 'given_name, family_name' },
                { label: 'Department Mapping', value: 'department' }
              ]
            },
            {
              step: 4,
              title: 'Configure Risk-Based Authentication',
              description: 'Set up adaptive authentication and MFA policies',
              details: [
                'Navigate to Authentication > Authentication Policies',
                'Create new policy: "VirtualBackroom.ai Access Policy"',
                'Configure conditions:',
                '  • New device: Require step-up authentication',
                '  • Geolocation anomaly: Require additional verification',
                '  • Impossible travel: Block access',
                'Set MFA requirements:',
                '  • Primary: Mobile authenticator app',
                '  • Fallback: SMS or email',
                'Configure session management:',
                '  • Session timeout: 8 hours',
                '  • Idle timeout: 2 hours',
                'Apply policy to VirtualBackroom.ai application'
              ],
              configItems: [
                { label: 'Policy Name', value: 'VirtualBackroom.ai Access Policy' },
                { label: 'Primary MFA', value: 'Mobile Authenticator App' },
                { label: 'Session Timeout', value: '8 hours' },
                { label: 'Risk-Based Auth', value: 'Enabled' }
              ]
            },
            {
              step: 5,
              title: 'Complete VirtualBackroom.ai Configuration',
              description: 'Finalize SSO setup in VirtualBackroom.ai admin portal',
              details: [
                'Log in to VirtualBackroom.ai Admin Portal',
                'Navigate to Settings > Enterprise SSO',
                'Select "PingIdentity" as identity provider',
                'Enter SAML configuration:',
                '  • Identity Provider URL: [From PingOne application]',
                '  • Identity Provider Certificate: [Upload from PingOne]',
                '  • Service Provider Entity ID: https://app.virtualbackroom.ai',
                'Configure user attribute mapping to match PingOne setup',
                'Set default role for new users: "Quality Analyst"',
                'Enable auto-provisioning based on group membership',
                'Save configuration and run connection test',
                'Perform end-to-end authentication test'
              ],
              configItems: [
                { label: 'Identity Provider', value: 'PingIdentity' },
                { label: 'Service Provider Entity ID', value: 'https://app.virtualbackroom.ai' },
                { label: 'Auto-Provisioning', value: 'Enabled' },
                { label: 'Default Role', value: 'Quality Analyst' }
              ]
            }
          ]
        }
        default:
          return []
      }
    }

    const TroubleshootingView = () => {
      const provider = ssoProviders.find(p => p.id === selectedProvider)
      if (!provider) return null

      const commonIssues = {
        'azure-ad': [
          {
              'Missing API permissions or admin consent',
            symptoms: ['Login redirects to error page', 'Token validation fails', 'Access denied errors'],
            causes: [
              'Incorrect redirect URI configuration',
              'Missing API permissions or admin consent',
              'Conditional access policy blocking access',
              'Token expiration or incorrect validation'
            ],
            solutions: [
              'Verify redirect URI exactly matches: https://app.virtualbackroom.ai/auth/azure/callback',
              'Check API permissions include User.Read and Directory.Read.All with admin consent',
              'Review conditional access policies for conflicts',
              'Validate JWT token configuration and signing certificates'
            ]
          },
          {
            issue: 'User provisioning failures',
            symptoms: ['New users not appearing in VirtualBackroom.ai', 'Role assignments not working', 'Profile data missing'],
            causes: [
              'Incorrect attribute mapping',
              'Missing group membership claims',
              'Auto-provisioning disabled',
              'Insufficient API permissions'
            ],
            solutions: [
              'Verify attribute mapping matches Azure AD user properties',
              'Configure group claims in token configuration',
              'Enable auto-provisioning in VirtualBackroom.ai settings',
              'Ensure Directory.Read.All permission is granted and consented'
            ]
          },
          {
            issue: 'MFA bypass or enforcement issues',
            symptoms: ['MFA not prompted', 'Users bypassing MFA', 'Conditional access not working'],
            causes: [
              'Conditional access policy not applied to VirtualBackroom.ai',
              'User exempted from MFA requirements',
              'Browser session caching issues'
            ],
            solutions: [
              'Verify conditional access policy includes VirtualBackroom.ai application',
              'Check user MFA status in Azure AD user properties',
              'Clear browser cache and test in incognito mode'
            ]
          }
        ],
        'google-workspace': [
          {
            issue: 'SAML authentication failures',
            symptoms: ['Invalid SAML response errors', 'Certificate validation errors', 'Redirect loops'],
            causes: [
              'Incorrect ACS URL configuration',
              'Certificate mismatch or expiration',
              'Clock synchronization issues',
              'Invalid attribute mapping'
            ],
            solutions: [
              'Verify ACS URL: https://app.virtualbackroom.ai/auth/saml/google',
              'Download fresh certificate from Google Admin Console',
              'Check server time synchronization (NTP)',
              'Validate attribute mapping matches Google Directory schema'
            ]
          },
          {
            issue: 'Directory API integration problems',
            symptoms: ['User data not syncing', 'Group membership not updating', 'API quota exceeded'],
            causes: [
              'Service account missing domain-wide delegation',
              'Insufficient API scopes',
              'API quotas exceeded',
              'Service account key expired'
            ],
            solutions: [
              'Verify domain-wide delegation is enabled for service account',
              'Check API scopes include directory.user.readonly and directory.group.readonly',
              'Monitor API usage in Google Cloud Console',
              'Rotate service account keys if older than 90 days'
            ]
          }
        ],
        'okta': [
          {
            issue: 'SCIM provisioning errors',
            symptoms: ['Users not created automatically', 'Profile updates not syncing', 'Deactivation not working'],
            causes: [
              'Incorrect SCIM endpoint URL',
              'Invalid authentication token',
              'Attribute mapping conflicts',
              'API rate limiting'
            ],
            solutions: [
              'Verify SCIM endpoint: https://api.virtualbackroom.ai/scim/v2',
              'Regenerate SCIM bearer token in VirtualBackroom.ai',
              'Review attribute mapping for conflicts or missing fields',
              'Implement exponential backoff for API calls'
            ]
          },
          {
            issue: 'Adaptive authentication not working',
            symptoms: ['MFA not triggered for risky logins', 'Location-based policies ignored', 'Risk assessment failures'],
            causes: [
              'Authentication policy not assigned to application',
              'Risk evaluation settings misconfigured',
              'Network zones incorrectly defined'
            ],
            solutions: [
              'Verify authentication policy is assigned to VirtualBackroom.ai app',
              'Review risk evaluation settings in Okta security configuration',
              'Check network zone definitions and IP ranges'
            ]
          }
        ],
        'ping-identity': [
          {
            issue: 'SAML configuration errors',
            symptoms: ['Invalid issuer errors', 'Signature validation failures', 'Attribute assertion errors'],
            causes: [
      }
              'Certificate configuration issues',
              'Attribute mapping errors'
            ],
            solutions: [
              'Ensure Entity ID matches exactly: https://app.virtualbackroom.ai',
              'Verify SAML certificate is current and properly formatted',
              'Review attribute mapping configuration in both PingOne and VirtualBackroom.ai'
            ]
          }
        ]
      }

      const issues = commonIssues[selectedProvider as keyof typeof commonIssues] || []

      return (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => setCurrentView('main')}>
              ← Back to SSO Overview
            </Button>
            <div>
              <h2 className="text-2xl font-bold">{provider.name} Troubleshooting Guide</h2>
              <p className="text-muted-foreground text-sm">
                Common issues and solutions for {provider.name} SSO integration
              </p>
            </div>
          </div>

          {/* Diagnostic Tools */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity size={20} />
                Diagnostic Tools
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button variant="outline" className="flex flex-col items-center gap-2 h-auto py-4">
                  <Shield size={20} />
                  <span className="text-sm">Test SSO Connection</span>
                  <span className="text-xs text-muted-foreground">Validate authentication flow</span>
                </Button>
                <Button variant="outline" className="flex flex-col items-center gap-2 h-auto py-4">
                  <Network size={20} />
                  <span className="text-sm">Check Network Connectivity</span>
                  <span className="text-xs text-muted-foreground">Verify firewall and DNS</span>
                </Button>
                <Button variant="outline" className="flex flex-col items-center gap-2 h-auto py-4">
                  <Database size={20} />
                  <span className="text-sm">Validate Token Claims</span>
                  <span className="text-xs text-muted-foreground">Debug JWT/SAML attributes</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Common Issues */}
          <div className="space-y-4">
            {issues.map((issue, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle size={20} className="text-yellow-600" />
                    {issue.issue}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Symptoms */}
                  <div>
                    <h5 className="font-medium text-sm mb-2 flex items-center gap-2">
                      <Eye size={14} />
                      Symptoms
                    </h5>
                    <div className="space-y-1">
                      {issue.symptoms.map((symptom, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <div className="w-1 h-1 rounded-full bg-red-500" />
                          {symptom}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Possible Causes */}
                  <div>
                    <h5 className="font-medium text-sm mb-2 flex items-center gap-2">
                      <AlertTriangle size={14} />
                      Possible Causes
                    </h5>
                    <div className="space-y-1">
                      {issue.causes.map((cause, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <div className="w-1 h-1 rounded-full bg-yellow-500" />
                          {cause}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Solutions */}
                  <div>
                    <h5 className="font-medium text-sm mb-2 flex items-center gap-2">
                      <CheckCircle size={14} />
                      Solutions
                    </h5>
                    <div className="space-y-1">
                      {issue.solutions.map((solution, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm">
                          <div className="w-1 h-1 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                          <span>{solution}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Support Resources */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen size={20} />
                Additional Support Resources
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h5 className="font-medium text-sm">Documentation</h5>
                  <div className="space-y-2">
                    <Button variant="ghost" size="sm" className="justify-start">
                      <ExternalLink size={14} className="mr-2" />
                      {provider.name} Developer Documentation
                    </Button>
                    <Button variant="ghost" size="sm" className="justify-start">
                      <BookOpen size={14} className="mr-2" />
                      VirtualBackroom.ai SSO Integration Guide
                    </Button>
                    <Button variant="ghost" size="sm" className="justify-start">
                      <Shield size={14} className="mr-2" />
                      Security Best Practices Guide
                    </Button>
                  </div>
                </div>
                <div className="space-y-3">
                  <h5 className="font-medium text-sm">Support Channels</h5>
                  <div className="space-y-2">
                    <Button variant="ghost" size="sm" className="justify-start">
                      <Users size={14} className="mr-2" />
                      Contact VirtualBackroom.ai Support
                    </Button>
                    <Button variant="ghost" size="sm" className="justify-start">
                      <ExternalLink size={14} className="mr-2" />
                      {provider.name} Community Forums
                    </Button>
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
              <CardContent className="space-y-6">
                <p className="text-muted-foreground">{step.description}</p>
                
                {/* Detailed Instructions */}
                <div className="space-y-2">
                  {step.details.map((detail, detailIndex) => (
                    <div key={detailIndex} className="flex items-start gap-3 text-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                      <span className={detail.startsWith('  •') ? 'ml-4 text-muted-foreground' : ''}>{detail}</span>
                    </div>
                  ))}
                </div>

                {/* Configuration Reference Table */}
                {(step as any).configItems && (
                  <div className="mt-6">
                    <h5 className="font-medium mb-3 text-sm">Configuration Reference</h5>
                    <div className="border rounded-lg">
                      <div className="bg-muted/50 px-4 py-2 border-b">
                        <div className="grid grid-cols-2 gap-4 text-xs font-medium text-muted-foreground">
                          <span>Parameter</span>
                          <span>Value</span>
                        </div>
                      </div>
                      <div className="divide-y">
                        {(step as any).configItems.map((item: any, itemIndex: number) => (
                          <div key={itemIndex} className="px-4 py-3">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <span className="font-medium">{item.label}</span>
                              <span className="font-mono text-muted-foreground text-xs">{item.value}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 mt-4">
                  {index >= 2 && (
                    <Button variant="outline" size="sm">
                      <ExternalLink size={14} className="mr-2" />
                      Open {provider.name} Console
                    </Button>
                  )}
                  {step.step === steps.length && (
                    <Button size="sm">
                      <Shield size={14} className="mr-2" />
                      Test Configuration
                    </Button>
                  )}
                </div>
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
}                    <Button variant="ghost" size="sm" className="justify-start">
                      <Activity size={14} className="mr-2" />
                      Enterprise Support Portal
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )
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
              <CardContent className="space-y-6">
                <p className="text-muted-foreground">{step.description}</p>
                
                {/* Detailed Instructions */}
                <div className="space-y-2">
                  {step.details.map((detail, detailIndex) => (
                    <div key={detailIndex} className="flex items-start gap-3 text-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                      <span className={detail.startsWith('  •') ? 'ml-4 text-muted-foreground' : ''}>{detail}</span>
                    </div>
                  ))}
                </div>

                {/* Configuration Reference Table */}
                {(step as any).configItems && (
                  <div className="mt-6">
                    <h5 className="font-medium mb-3 text-sm">Configuration Reference</h5>
                    <div className="border rounded-lg">
                      <div className="bg-muted/50 px-4 py-2 border-b">
                        <div className="grid grid-cols-2 gap-4 text-xs font-medium text-muted-foreground">
                          <span>Parameter</span>
                          <span>Value</span>
                        </div>
                      </div>
                      <div className="divide-y">
                        {(step as any).configItems.map((item: any, itemIndex: number) => (
                          <div key={itemIndex} className="px-4 py-3">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <span className="font-medium">{item.label}</span>
                              <span className="font-mono text-muted-foreground text-xs">{item.value}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 mt-4">
                  {index >= 2 && (
                    <Button variant="outline" size="sm">
                      <ExternalLink size={14} className="mr-2" />
                      Open {provider.name} Console
                    </Button>
                  )}
                  {step.step === steps.length && (
                    <Button size="sm">
                      <Shield size={14} className="mr-2" />
                      Test Configuration
                    </Button>
                  )}
                </div>
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

  if (currentView === 'troubleshooting') {
    return <TroubleshootingView />
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
          <Button variant="outline">
            <AlertTriangle size={16} className="mr-2" />
            Troubleshooting
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