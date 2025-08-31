import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  MicrosoftOutlookLogo, 
  GoogleLogo, 
  Shield, 
  CheckCircle, 
  Warning,
  Copy,
  Eye,
  EyeSlash,
  Key,
  Globe,
  Users,
  Lock
} from '@phosphor-icons/react'

interface SSOProvider {
  id: string
  name: string
  icon: any
  color: string
  status: 'configured' | 'testing' | 'active' | 'inactive'
  description: string
}

const ssoProviders: SSOProvider[] = [
  {
    id: 'azure',
    name: 'Microsoft Azure AD',
    icon: MicrosoftOutlookLogo,
    color: 'text-blue-600',
    status: 'active',
    description: 'Enterprise identity and access management with Azure Active Directory'
  },
  {
    id: 'google',
    name: 'Google Workspace',
    icon: GoogleLogo,
    color: 'text-red-600',
    status: 'configured',
    description: 'Google Workspace identity federation for organizations'
  },
  {
    id: 'okta',
    name: 'Okta',
    icon: Shield,
    color: 'text-indigo-600',
    status: 'inactive',
    description: 'Okta enterprise identity platform integration'
  }
]

export function SSOProviderConfig() {
  const [selectedProvider, setSelectedProvider] = useState('azure')
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({})
  const [configurations, setConfigurations] = useState<Record<string, any>>({
    azure: {
      tenantId: 'contoso.onmicrosoft.com',
      clientId: '12345678-1234-1234-1234-123456789abc',
      clientSecret: '••••••••••••••••••••••••',
      redirectUri: 'https://virtualbackroom.ai/auth/azure/callback',
      scopes: ['openid', 'profile', 'email', 'offline_access'],
      enableMFA: true,
      enableConditionalAccess: true
    },
    google: {
      clientId: '123456789012-abcdefghijklmnopqrstuvwxyz123456.apps.googleusercontent.com',
      clientSecret: '••••••••••••••••••••••••',
      redirectUri: 'https://virtualbackroom.ai/auth/google/callback',
      hostedDomain: 'company.com',
      scopes: ['openid', 'profile', 'email'],
      enableHd: true
    },
    okta: {
      domain: 'company.okta.com',
      clientId: 'abcd1234efgh5678ijkl',
      clientSecret: '••••••••••••••••••••••••',
      redirectUri: 'https://virtualbackroom.ai/auth/okta/callback',
      scopes: ['openid', 'profile', 'email'],
      authorizationServerId: 'default'
    }
  })

  const toggleSecretVisibility = (provider: string, field: string) => {
    setShowSecrets(prev => ({
      ...prev,
      [`${provider}_${field}`]: !prev[`${provider}_${field}`]
    }))
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200'
      case 'configured': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'testing': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'inactive': return 'bg-gray-100 text-gray-800 border-gray-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const renderAzureConfig = () => (
    <div className="space-y-6">
      <Alert>
        <MicrosoftOutlookLogo size={16} />
        <AlertDescription>
          Configure Microsoft Azure AD integration for enterprise authentication with conditional access and MFA support.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="azure-tenant">Tenant ID / Domain</Label>
            <Input
              id="azure-tenant"
              value={configurations.azure.tenantId}
              placeholder="contoso.onmicrosoft.com"
              onChange={(e) => setConfigurations(prev => ({
                ...prev,
                azure: { ...prev.azure, tenantId: e.target.value }
              }))}
            />
          </div>

          <div>
            <Label htmlFor="azure-client-id">Application (Client) ID</Label>
            <div className="flex gap-2">
              <Input
                id="azure-client-id"
                value={configurations.azure.clientId}
                placeholder="12345678-1234-1234-1234-123456789abc"
                onChange={(e) => setConfigurations(prev => ({
                  ...prev,
                  azure: { ...prev.azure, clientId: e.target.value }
                }))}
              />
              <Button size="sm" variant="outline" onClick={() => copyToClipboard(configurations.azure.clientId)}>
                <Copy size={16} />
              </Button>
            </div>
          </div>

          <div>
            <Label htmlFor="azure-client-secret">Client Secret</Label>
            <div className="flex gap-2">
              <Input
                id="azure-client-secret"
                type={showSecrets.azure_clientSecret ? "text" : "password"}
                value={configurations.azure.clientSecret}
                placeholder="Enter client secret"
                onChange={(e) => setConfigurations(prev => ({
                  ...prev,
                  azure: { ...prev.azure, clientSecret: e.target.value }
                }))}
              />
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => toggleSecretVisibility('azure', 'clientSecret')}
              >
                {showSecrets.azure_clientSecret ? <EyeSlash size={16} /> : <Eye size={16} />}
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="azure-redirect">Redirect URI</Label>
            <Input
              id="azure-redirect"
              value={configurations.azure.redirectUri}
              readOnly
              className="bg-muted"
            />
          </div>

          <div>
            <Label>Scopes</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {configurations.azure.scopes.map((scope: string) => (
                <Badge key={scope} variant="secondary">{scope}</Badge>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="azure-mfa">Enable Multi-Factor Authentication</Label>
              <Switch
                id="azure-mfa"
                checked={configurations.azure.enableMFA}
                onCheckedChange={(checked) => setConfigurations(prev => ({
                  ...prev,
                  azure: { ...prev.azure, enableMFA: checked }
                }))}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="azure-ca">Enable Conditional Access</Label>
              <Switch
                id="azure-ca"
                checked={configurations.azure.enableConditionalAccess}
                onCheckedChange={(checked) => setConfigurations(prev => ({
                  ...prev,
                  azure: { ...prev.azure, enableConditionalAccess: checked }
                }))}
              />
            </div>
          </div>
        </div>
      </div>

      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Key size={16} />
            Azure AD App Registration Instructions
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <p>1. Go to <strong>Azure Portal → Azure Active Directory → App registrations</strong></p>
          <p>2. Click <strong>New registration</strong> and name it "VirtualBackroom.ai"</p>
          <p>3. Set redirect URI to: <code className="bg-white px-2 py-1 rounded">https://virtualbackroom.ai/auth/azure/callback</code></p>
          <p>4. Copy the <strong>Application (client) ID</strong> and <strong>Directory (tenant) ID</strong></p>
          <p>5. Go to <strong>Certificates & secrets</strong> and create a new client secret</p>
          <p>6. Configure API permissions: <strong>Microsoft Graph → User.Read, profile, openid, email</strong></p>
        </CardContent>
      </Card>
    </div>
  )

  const renderGoogleConfig = () => (
    <div className="space-y-6">
      <Alert>
        <GoogleLogo size={16} />
        <AlertDescription>
          Configure Google Workspace SSO integration with domain restriction and organizational unit controls.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="google-client-id">OAuth 2.0 Client ID</Label>
            <Input
              id="google-client-id"
              value={configurations.google.clientId}
              placeholder="123456789012-abcdefghijklmnopqrstuvwxyz123456.apps.googleusercontent.com"
              onChange={(e) => setConfigurations(prev => ({
                ...prev,
                google: { ...prev.google, clientId: e.target.value }
              }))}
            />
          </div>

          <div>
            <Label htmlFor="google-client-secret">Client Secret</Label>
            <div className="flex gap-2">
              <Input
                id="google-client-secret"
                type={showSecrets.google_clientSecret ? "text" : "password"}
                value={configurations.google.clientSecret}
                placeholder="Enter client secret"
                onChange={(e) => setConfigurations(prev => ({
                  ...prev,
                  google: { ...prev.google, clientSecret: e.target.value }
                }))}
              />
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => toggleSecretVisibility('google', 'clientSecret')}
              >
                {showSecrets.google_clientSecret ? <EyeSlash size={16} /> : <Eye size={16} />}
              </Button>
            </div>
          </div>

          <div>
            <Label htmlFor="google-hosted-domain">Hosted Domain (Optional)</Label>
            <Input
              id="google-hosted-domain"
              value={configurations.google.hostedDomain}
              placeholder="company.com"
              onChange={(e) => setConfigurations(prev => ({
                ...prev,
                google: { ...prev.google, hostedDomain: e.target.value }
              }))}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Restrict authentication to specific Google Workspace domain
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="google-redirect">Authorized Redirect URI</Label>
            <Input
              id="google-redirect"
              value={configurations.google.redirectUri}
              readOnly
              className="bg-muted"
            />
          </div>

          <div>
            <Label>OAuth Scopes</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {configurations.google.scopes.map((scope: string) => (
                <Badge key={scope} variant="secondary">{scope}</Badge>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="google-hd">Enable Domain Restriction</Label>
            <Switch
              id="google-hd"
              checked={configurations.google.enableHd}
              onCheckedChange={(checked) => setConfigurations(prev => ({
                ...prev,
                google: { ...prev.google, enableHd: checked }
              }))}
            />
          </div>
        </div>
      </div>

      <Card className="bg-red-50 border-red-200">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <GoogleLogo size={16} />
            Google Cloud Console Setup
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <p>1. Go to <strong>Google Cloud Console → APIs & Services → Credentials</strong></p>
          <p>2. Click <strong>Create Credentials → OAuth 2.0 Client IDs</strong></p>
          <p>3. Choose <strong>Web application</strong> as application type</p>
          <p>4. Add authorized redirect URI: <code className="bg-white px-2 py-1 rounded">https://virtualbackroom.ai/auth/google/callback</code></p>
          <p>5. Copy the <strong>Client ID</strong> and <strong>Client Secret</strong></p>
          <p>6. Enable Google+ API in the API Library if not already enabled</p>
        </CardContent>
      </Card>
    </div>
  )

  const renderOktaConfig = () => (
    <div className="space-y-6">
      <Alert>
        <Shield size={16} />
        <AlertDescription>
          Configure Okta enterprise identity platform integration with SAML or OIDC protocols.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="okta-domain">Okta Domain</Label>
            <Input
              id="okta-domain"
              value={configurations.okta.domain}
              placeholder="company.okta.com"
              onChange={(e) => setConfigurations(prev => ({
                ...prev,
                okta: { ...prev.okta, domain: e.target.value }
              }))}
            />
          </div>

          <div>
            <Label htmlFor="okta-client-id">Client ID</Label>
            <Input
              id="okta-client-id"
              value={configurations.okta.clientId}
              placeholder="abcd1234efgh5678ijkl"
              onChange={(e) => setConfigurations(prev => ({
                ...prev,
                okta: { ...prev.okta, clientId: e.target.value }
              }))}
            />
          </div>

          <div>
            <Label htmlFor="okta-client-secret">Client Secret</Label>
            <div className="flex gap-2">
              <Input
                id="okta-client-secret"
                type={showSecrets.okta_clientSecret ? "text" : "password"}
                value={configurations.okta.clientSecret}
                placeholder="Enter client secret"
                onChange={(e) => setConfigurations(prev => ({
                  ...prev,
                  okta: { ...prev.okta, clientSecret: e.target.value }
                }))}
              />
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => toggleSecretVisibility('okta', 'clientSecret')}
              >
                {showSecrets.okta_clientSecret ? <EyeSlash size={16} /> : <Eye size={16} />}
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="okta-redirect">Redirect URI</Label>
            <Input
              id="okta-redirect"
              value={configurations.okta.redirectUri}
              readOnly
              className="bg-muted"
            />
          </div>

          <div>
            <Label htmlFor="okta-auth-server">Authorization Server ID</Label>
            <Select
              value={configurations.okta.authorizationServerId}
              onValueChange={(value) => setConfigurations(prev => ({
                ...prev,
                okta: { ...prev.okta, authorizationServerId: value }
              }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default Authorization Server</SelectItem>
                <SelectItem value="custom">Custom Authorization Server</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>OAuth Scopes</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {configurations.okta.scopes.map((scope: string) => (
                <Badge key={scope} variant="secondary">{scope}</Badge>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Card className="bg-indigo-50 border-indigo-200">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Shield size={16} />
            Okta Application Setup
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <p>1. Log into <strong>Okta Admin Console → Applications</strong></p>
          <p>2. Click <strong>Create App Integration</strong></p>
          <p>3. Choose <strong>OIDC - OpenID Connect</strong> and <strong>Web Application</strong></p>
          <p>4. Set Sign-in redirect URI: <code className="bg-white px-2 py-1 rounded">https://virtualbackroom.ai/auth/okta/callback</code></p>
          <p>5. Configure <strong>Assignments</strong> to control which users/groups can access the app</p>
          <p>6. Copy the <strong>Client ID</strong> and <strong>Client Secret</strong> from the app settings</p>
        </CardContent>
      </Card>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Provider Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {ssoProviders.map((provider) => {
          const Icon = provider.icon
          return (
            <Card 
              key={provider.id}
              className={`cursor-pointer transition-all ${
                selectedProvider === provider.id 
                  ? 'ring-2 ring-primary border-primary' 
                  : 'hover:shadow-md'
              }`}
              onClick={() => setSelectedProvider(provider.id)}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <Icon size={24} className={provider.color} />
                  <Badge className={getStatusColor(provider.status)}>
                    {provider.status}
                  </Badge>
                </div>
                <h3 className="font-semibold mb-2">{provider.name}</h3>
                <p className="text-sm text-muted-foreground">{provider.description}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Configuration Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock size={20} />
            {ssoProviders.find(p => p.id === selectedProvider)?.name} Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedProvider === 'azure' && renderAzureConfig()}
          {selectedProvider === 'google' && renderGoogleConfig()}
          {selectedProvider === 'okta' && renderOktaConfig()}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-between">
        <div className="flex gap-3">
          <Button variant="outline">
            Test Connection
          </Button>
          <Button variant="outline">
            Import Certificate
          </Button>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            Save Configuration
          </Button>
          <Button>
            Deploy Changes
          </Button>
        </div>
      </div>
    </div>
  )
}