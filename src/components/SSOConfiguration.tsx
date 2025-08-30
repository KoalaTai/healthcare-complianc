import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { 
  Shield, 
  Lock, 
  Users, 
  Globe, 
  CheckCircle,
  Settings,
  Key,
  Clock,
  AlertTriangle,
  Save,
  TestTube
} from '@phosphor-icons/react'
import { toast } from 'sonner'

interface SSOConfig {
  provider: 'microsoft' | 'google' | 'okta' | 'none'
  enabled: boolean
  clientId: string
  tenantId?: string // For Microsoft
  domain?: string // For Google Workspace
  issuer?: string // For Okta
  requireMfa: boolean
  sessionTimeout: number
  allowedDomains: string[]
}

export function SSOConfiguration() {
  const [ssoConfig, setSSOConfig] = useKV('sso-configuration', {
    provider: 'microsoft' as const,
    enabled: true,
    clientId: 'virtualbackroom-prod-client',
    tenantId: 'contoso.onmicrosoft.com',
    requireMfa: true,
    sessionTimeout: 28800, // 8 hours
    allowedDomains: ['contoso.com', 'contoso-lab.com']
  } as SSOConfig)

  const [testResult, setTestResult] = useState<{
    success: boolean
    message: string
    details?: any
  } | null>(null)

  const handleSaveConfig = () => {
    setSSOConfig((prev: SSOConfig) => ({ ...prev }))
    toast.success('SSO configuration saved successfully')
  }

  const handleTestConnection = async () => {
    setTestResult(null)
    
    // Simulate SSO connection test
    setTimeout(() => {
      const mockResults = {
        microsoft: {
          success: true,
          message: 'Successfully connected to Azure AD',
          details: {
            tenant: 'contoso.onmicrosoft.com',
            discoveryEndpoint: 'https://login.microsoftonline.com/common/v2.0/.well-known/openid_configuration',
            userCount: 1247,
            groupCount: 23
          }
        },
        google: {
          success: true,
          message: 'Successfully connected to Google Workspace',
          details: {
            domain: 'acmemedtech.com',
            userCount: 89,
            orgUnitCount: 5
          }
        },
        okta: {
          success: true,
          message: 'Successfully connected to Okta',
          details: {
            domain: 'dev-12345.okta.com',
            userCount: 2156,
            applicationCount: 12
          }
        }
      }

      setTestResult(mockResults[ssoConfig.provider] || {
        success: false,
        message: 'Provider not configured'
      })
    }, 2000)

    toast.info('Testing SSO connection...')
  }

  const updateConfig = (updates: Partial<SSOConfig>) => {
    setSSOConfig((prev: SSOConfig) => ({ ...prev, ...updates }))
  }

  const addDomain = () => {
    const domain = prompt('Enter allowed domain:')
    if (domain && !ssoConfig.allowedDomains.includes(domain)) {
      updateConfig({
        allowedDomains: [...ssoConfig.allowedDomains, domain]
      })
    }
  }

  const removeDomain = (domain: string) => {
    updateConfig({
      allowedDomains: ssoConfig.allowedDomains.filter(d => d !== domain)
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Shield size={24} className="text-primary" />
            Enterprise SSO Configuration
          </h2>
          <p className="text-muted-foreground mt-1">
            Configure single sign-on for your organization
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleTestConnection}>
            <TestTube size={16} className="mr-2" />
            Test Connection
          </Button>
          <Button onClick={handleSaveConfig}>
            <Save size={16} className="mr-2" />
            Save Configuration
          </Button>
        </div>
      </div>

      <Tabs defaultValue="provider" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="provider">Provider</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="domains">Domains</TabsTrigger>
          <TabsTrigger value="testing">Testing</TabsTrigger>
        </TabsList>

        <TabsContent value="provider" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe size={20} />
                Identity Provider Selection
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="sso-provider">SSO Provider</Label>
                <Select 
                  value={ssoConfig.provider} 
                  onValueChange={(value: 'microsoft' | 'google' | 'okta' | 'none') => 
                    updateConfig({ provider: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="microsoft">Microsoft Azure AD / Entra ID</SelectItem>
                    <SelectItem value="google">Google Workspace</SelectItem>
                    <SelectItem value="okta">Okta</SelectItem>
                    <SelectItem value="none">Standard Authentication</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Switch 
                  id="sso-enabled"
                  checked={ssoConfig.enabled}
                  onCheckedChange={(enabled) => updateConfig({ enabled })}
                />
                <Label htmlFor="sso-enabled">Enable SSO</Label>
              </div>

              <Separator />

              {/* Provider-specific configuration */}
              {ssoConfig.provider === 'microsoft' && (
                <div className="space-y-4">
                  <h4 className="font-medium flex items-center gap-2">
                    <div className="w-5 h-5 bg-[#0078d4] rounded flex items-center justify-center">
                      <Globe size={12} className="text-white" />
                    </div>
                    Microsoft Azure AD Configuration
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="client-id">Application (Client) ID</Label>
                      <Input 
                        id="client-id"
                        value={ssoConfig.clientId}
                        onChange={(e) => updateConfig({ clientId: e.target.value })}
                        placeholder="12345678-1234-1234-1234-123456789abc"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tenant-id">Directory (Tenant) ID</Label>
                      <Input 
                        id="tenant-id"
                        value={ssoConfig.tenantId || ''}
                        onChange={(e) => updateConfig({ tenantId: e.target.value })}
                        placeholder="contoso.onmicrosoft.com"
                      />
                    </div>
                  </div>
                  
                  <Alert>
                    <AlertTriangle size={16} />
                    <AlertDescription>
                      Ensure your Azure AD application is configured with the correct redirect URIs and API permissions for OpenID Connect.
                    </AlertDescription>
                  </Alert>
                </div>
              )}

              {ssoConfig.provider === 'google' && (
                <div className="space-y-4">
                  <h4 className="font-medium flex items-center gap-2">
                    <div className="w-5 h-5 bg-[#4285f4] rounded flex items-center justify-center">
                      <Globe size={12} className="text-white" />
                    </div>
                    Google Workspace Configuration
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="google-client-id">Client ID</Label>
                      <Input 
                        id="google-client-id"
                        value={ssoConfig.clientId}
                        onChange={(e) => updateConfig({ clientId: e.target.value })}
                        placeholder="123456789-abc123.apps.googleusercontent.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="workspace-domain">Workspace Domain</Label>
                      <Input 
                        id="workspace-domain"
                        value={ssoConfig.domain || ''}
                        onChange={(e) => updateConfig({ domain: e.target.value })}
                        placeholder="acmemedtech.com"
                      />
                    </div>
                  </div>
                  
                  <Alert>
                    <AlertTriangle size={16} />
                    <AlertDescription>
                      Configure OAuth 2.0 consent screen and ensure your domain is verified in Google Admin Console.
                    </AlertDescription>
                  </Alert>
                </div>
              )}

              {ssoConfig.provider === 'okta' && (
                <div className="space-y-4">
                  <h4 className="font-medium flex items-center gap-2">
                    <div className="w-5 h-5 bg-[#007dc1] rounded flex items-center justify-center">
                      <Shield size={12} className="text-white" />
                    </div>
                    Okta Configuration
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="okta-client-id">Client ID</Label>
                      <Input 
                        id="okta-client-id"
                        value={ssoConfig.clientId}
                        onChange={(e) => updateConfig({ clientId: e.target.value })}
                        placeholder="0oa1234567890abcdef"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="okta-issuer">Issuer URI</Label>
                      <Input 
                        id="okta-issuer"
                        value={ssoConfig.issuer || ''}
                        onChange={(e) => updateConfig({ issuer: e.target.value })}
                        placeholder="https://dev-12345.okta.com/oauth2/default"
                      />
                    </div>
                  </div>
                  
                  <Alert>
                    <AlertTriangle size={16} />
                    <AlertDescription>
                      Ensure your Okta application is configured for OpenID Connect with appropriate grant types and scopes.
                    </AlertDescription>
                  </Alert>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock size={20} />
                Security Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="require-mfa">Require Multi-Factor Authentication</Label>
                  <p className="text-sm text-muted-foreground">
                    All users must complete MFA during login
                  </p>
                </div>
                <Switch 
                  id="require-mfa"
                  checked={ssoConfig.requireMfa}
                  onCheckedChange={(requireMfa) => updateConfig({ requireMfa })}
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="session-timeout">Session Timeout (seconds)</Label>
                <Select 
                  value={ssoConfig.sessionTimeout.toString()} 
                  onValueChange={(value) => updateConfig({ sessionTimeout: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1800">30 minutes</SelectItem>
                    <SelectItem value="3600">1 hour</SelectItem>
                    <SelectItem value="14400">4 hours</SelectItem>
                    <SelectItem value="28800">8 hours</SelectItem>
                    <SelectItem value="43200">12 hours</SelectItem>
                    <SelectItem value="86400">24 hours</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Users will be automatically logged out after this period of inactivity
                </p>
              </div>

              <Separator />

              <div className="space-y-3">
                <Label>Security Features Status</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    { name: 'JWT Token Validation', status: 'active', description: 'Secure token-based authentication' },
                    { name: 'Role-Based Access Control', status: 'active', description: 'Granular permission management' },
                    { name: 'Session Monitoring', status: 'active', description: 'Real-time session tracking' },
                    { name: 'Audit Logging', status: 'active', description: '21 CFR Part 11 compliant logs' }
                  ].map((feature) => (
                    <div key={feature.name} className="flex items-center gap-2 p-3 border rounded-lg">
                      <CheckCircle size={16} className="text-green-600" />
                      <div>
                        <div className="text-sm font-medium">{feature.name}</div>
                        <div className="text-xs text-muted-foreground">{feature.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="domains" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe size={20} />
                Allowed Domains
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Only users from these domains can authenticate via SSO
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={addDomain}
                  className="flex items-center gap-2"
                >
                  <Globe size={14} />
                  Add Domain
                </Button>
              </div>

              <div className="space-y-2">
                {ssoConfig.allowedDomains.map((domain, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <Globe size={16} className="text-muted-foreground" />
                      <span className="font-mono text-sm">{domain}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeDomain(domain)}
                      className="text-destructive hover:text-destructive"
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>

              {ssoConfig.allowedDomains.length === 0 && (
                <Alert>
                  <AlertTriangle size={16} />
                  <AlertDescription>
                    No allowed domains configured. Add at least one domain to enable SSO.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="testing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TestTube size={20} />
                SSO Connection Testing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <Key size={24} className="mx-auto text-blue-600 mb-2" />
                    <div className="text-sm font-medium">OIDC Discovery</div>
                    <div className="text-xs text-muted-foreground">
                      Validate OpenID Connect configuration
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4 text-center">
                    <Users size={24} className="mx-auto text-green-600 mb-2" />
                    <div className="text-sm font-medium">User Directory</div>
                    <div className="text-xs text-muted-foreground">
                      Test user lookup and attributes
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4 text-center">
                    <Shield size={24} className="mx-auto text-purple-600 mb-2" />
                    <div className="text-sm font-medium">Token Validation</div>
                    <div className="text-xs text-muted-foreground">
                      Verify JWT signature and claims
                    </div>
                  </CardContent>
                </Card>
              </div>

              {testResult && (
                <Alert className={testResult.success ? 'border-green-200 bg-green-50 dark:bg-green-950/20' : 'border-destructive bg-destructive/5'}>
                  {testResult.success ? (
                    <CheckCircle size={16} className="text-green-600" />
                  ) : (
                    <AlertTriangle size={16} className="text-destructive" />
                  )}
                  <AlertDescription>
                    <div className="font-medium mb-2">{testResult.message}</div>
                    {testResult.details && (
                      <div className="text-sm space-y-1">
                        {Object.entries(testResult.details).map(([key, value]) => (
                          <div key={key} className="flex justify-between">
                            <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').toLowerCase()}:</span>
                            <span className="font-mono">{String(value)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              )}

              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Clock size={16} />
                  Test Checklist
                </h4>
                <div className="space-y-2 text-sm">
                  {[
                    'OIDC discovery endpoint accessible',
                    'Application registration valid',
                    'User directory synchronization',
                    'Group/role mapping functional',
                    'MFA policy enforcement',
                    'Session timeout configuration',
                    'Logout flow completion'
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      {testResult?.success ? (
                        <CheckCircle size={14} className="text-green-600" />
                      ) : (
                        <div className="w-3.5 h-3.5 border border-muted-foreground rounded-full" />
                      )}
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}