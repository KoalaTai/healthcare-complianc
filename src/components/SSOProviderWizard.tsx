import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'
import { 
  CheckCircle, 
  AlertTriangle, 
  Copy, 
  Shield, 
  ArrowRight, 
  ArrowLeft,
  Settings,
  Eye,
  EyeSlash,
  Key,
  Globe,
  Building,
  Gear
} from '@phosphor-icons/react'

interface SSOConfiguration {
  provider: 'azure' | 'google' | 'okta'
  displayName: string
  clientId: string
  clientSecret: string
  tenantId?: string
  domain?: string
  issuerUrl?: string
  redirectUri: string
  scopes: string[]
  status: 'draft' | 'testing' | 'active' | 'error'
  lastTested?: string
  errorMessage?: string
}

interface WizardStep {
  id: string
  title: string
  description: string
  completed: boolean
}

const providerTemplates = {
  azure: {
    displayName: 'Microsoft Azure AD',
    scopes: ['openid', 'profile', 'email', 'User.Read'],
    endpoints: {
      authorization: 'https://login.microsoftonline.com/{tenant-id}/oauth2/v2.0/authorize',
      token: 'https://login.microsoftonline.com/{tenant-id}/oauth2/v2.0/token',
      userinfo: 'https://graph.microsoft.com/v1.0/me'
    }
  },
  google: {
    displayName: 'Google Workspace',
    scopes: ['openid', 'profile', 'email'],
    endpoints: {
      authorization: 'https://accounts.google.com/o/oauth2/v2/auth',
      token: 'https://oauth2.googleapis.com/token',
      userinfo: 'https://www.googleapis.com/oauth2/v2/userinfo'
    }
  },
  okta: {
    displayName: 'Okta',
    scopes: ['openid', 'profile', 'email'],
    endpoints: {
      authorization: 'https://{domain}/oauth2/default/v1/authorize',
      token: 'https://{domain}/oauth2/default/v1/token',
      userinfo: 'https://{domain}/oauth2/default/v1/userinfo'
    }
  }
}

export function SSOProviderWizard() {
  const [configurations, setConfigurations] = useKV<SSOConfiguration[]>('sso-configurations', [])
  const [currentConfig, setCurrentConfig] = useState<Partial<SSOConfiguration>>({})
  const [currentStep, setCurrentStep] = useState(0)
  const [selectedProvider, setSelectedProvider] = useState<'azure' | 'google' | 'okta'>('azure')
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({})
  const [testResults, setTestResults] = useState<any>(null)

  const steps: WizardStep[] = [
    {
      id: 'provider',
      title: 'Select Provider',
      description: 'Choose your SSO identity provider',
      completed: !!selectedProvider
    },
    {
      id: 'configure',
      title: 'Configuration',
      description: 'Enter provider-specific settings',
      completed: !!(currentConfig.clientId && currentConfig.clientSecret)
    },
    {
      id: 'test',
      title: 'Test Connection',
      description: 'Verify configuration works',
      completed: testResults?.success === true
    },
    {
      id: 'deploy',
      title: 'Deploy',
      description: 'Activate the configuration',
      completed: currentConfig.status === 'active'
    }
  ]

  const progress = ((currentStep + 1) / steps.length) * 100

  const handleProviderSelect = (provider: 'azure' | 'google' | 'okta') => {
    setSelectedProvider(provider)
    const template = providerTemplates[provider]
    setCurrentConfig({
      provider,
      displayName: template.displayName,
      scopes: template.scopes,
      redirectUri: `${window.location.origin}/auth/callback/${provider}`,
      status: 'draft'
    })
    setCurrentStep(1)
  }

  const handleConfigUpdate = (field: keyof SSOConfiguration, value: any) => {
    setCurrentConfig(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const testConnection = async () => {
    // Simulate API test
    setTestResults({ testing: true })
    
    setTimeout(() => {
      const success = Math.random() > 0.3 // 70% success rate for demo
      setTestResults({
        success,
        message: success ? 
          'Connection successful! User authentication flow verified.' :
          'Connection failed. Please check your configuration.',
        details: success ? {
          userInfoEndpoint: 'OK',
          tokenValidation: 'OK',
          scopeAccess: 'OK'
        } : {
          userInfoEndpoint: 'Failed',
          tokenValidation: 'Failed',
          scopeAccess: 'Not tested'
        }
      })
    }, 2000)
  }

  const saveConfiguration = () => {
    const newConfig: SSOConfiguration = {
      ...currentConfig as SSOConfiguration,
      status: 'active',
      lastTested: new Date().toISOString()
    }

    setConfigurations(prev => {
      const existing = prev.findIndex(config => config.provider === newConfig.provider)
      if (existing >= 0) {
        const updated = [...prev]
        updated[existing] = newConfig
        return updated
      }
      return [...prev, newConfig]
    })

    setCurrentStep(3)
  }

  const renderProviderSelection = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Choose Your SSO Provider</h2>
        <p className="text-muted-foreground">
          Select the identity provider your organization uses
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Object.entries(providerTemplates).map(([key, template]) => {
          const provider = key as 'azure' | 'google' | 'okta'
          const isSelected = selectedProvider === provider
          
          return (
            <Card 
              key={key} 
              className={`cursor-pointer transition-all hover:shadow-lg ${
                isSelected ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => handleProviderSelect(provider)}
            >
              <CardContent className="p-6 text-center">
                <div className="mb-4">
                  {provider === 'azure' && <Building size={48} className="mx-auto text-blue-600" />}
                  {provider === 'google' && <Globe size={48} className="mx-auto text-red-500" />}
                  {provider === 'okta' && <Shield size={48} className="mx-auto text-blue-500" />}
                </div>
                <h3 className="font-semibold mb-2">{template.displayName}</h3>
                <p className="text-sm text-muted-foreground">
                  {provider === 'azure' && 'Microsoft Azure Active Directory'}
                  {provider === 'google' && 'Google Workspace & Gmail'}
                  {provider === 'okta' && 'Okta Identity Platform'}
                </p>
                <div className="mt-4">
                  <Badge variant={isSelected ? 'default' : 'outline'}>
                    {isSelected ? 'Selected' : 'Select'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )

  const renderConfiguration = () => {
    const template = providerTemplates[selectedProvider]
    
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">Configure {template.displayName}</h2>
          <p className="text-muted-foreground">
            Enter your {template.displayName} application credentials
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gear size={20} />
                Provider Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  value={currentConfig.displayName || ''}
                  onChange={(e) => handleConfigUpdate('displayName', e.target.value)}
                  placeholder="e.g., Company SSO"
                />
              </div>

              <div>
                <Label htmlFor="clientId">Client ID / Application ID</Label>
                <div className="flex gap-2">
                  <Input
                    id="clientId"
                    value={currentConfig.clientId || ''}
                    onChange={(e) => handleConfigUpdate('clientId', e.target.value)}
                    placeholder="Enter your client ID"
                  />
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => copyToClipboard(currentConfig.clientId || '')}
                  >
                    <Copy size={16} />
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="clientSecret">Client Secret</Label>
                <div className="flex gap-2">
                  <Input
                    id="clientSecret"
                    type={showSecrets.clientSecret ? 'text' : 'password'}
                    value={currentConfig.clientSecret || ''}
                    onChange={(e) => handleConfigUpdate('clientSecret', e.target.value)}
                    placeholder="Enter your client secret"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowSecrets(prev => ({
                      ...prev,
                      clientSecret: !prev.clientSecret
                    }))}
                  >
                    {showSecrets.clientSecret ? <EyeSlash size={16} /> : <Eye size={16} />}
                  </Button>
                </div>
              </div>

              {selectedProvider === 'azure' && (
                <div>
                  <Label htmlFor="tenantId">Tenant ID</Label>
                  <Input
                    id="tenantId"
                    value={currentConfig.tenantId || ''}
                    onChange={(e) => handleConfigUpdate('tenantId', e.target.value)}
                    placeholder="Your Azure AD tenant ID"
                  />
                </div>
              )}

              {selectedProvider === 'okta' && (
                <div>
                  <Label htmlFor="domain">Okta Domain</Label>
                  <Input
                    id="domain"
                    value={currentConfig.domain || ''}
                    onChange={(e) => handleConfigUpdate('domain', e.target.value)}
                    placeholder="your-domain.okta.com"
                  />
                </div>
              )}

              <div>
                <Label htmlFor="redirectUri">Redirect URI</Label>
                <div className="flex gap-2">
                  <Input
                    id="redirectUri"
                    value={currentConfig.redirectUri || ''}
                    onChange={(e) => handleConfigUpdate('redirectUri', e.target.value)}
                    readOnly
                  />
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => copyToClipboard(currentConfig.redirectUri || '')}
                  >
                    <Copy size={16} />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Add this URL to your provider's allowed redirect URIs
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key size={20} />
                Configuration Guide
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-sm">
                {selectedProvider === 'azure' && (
                  <div>
                    <h4 className="font-semibold mb-2">Azure AD Setup:</h4>
                    <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                      <li>Go to Azure Portal → Azure Active Directory</li>
                      <li>Navigate to App registrations → New registration</li>
                      <li>Set redirect URI to the value above</li>
                      <li>Copy Application (client) ID and Directory (tenant) ID</li>
                      <li>Create a client secret in Certificates & secrets</li>
                      <li>Grant admin consent for required permissions</li>
                    </ol>
                  </div>
                )}

                {selectedProvider === 'google' && (
                  <div>
                    <h4 className="font-semibold mb-2">Google Cloud Setup:</h4>
                    <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                      <li>Go to Google Cloud Console → APIs & Services</li>
                      <li>Create credentials → OAuth 2.0 Client ID</li>
                      <li>Set authorized redirect URI to the value above</li>
                      <li>Enable Google+ API and Admin SDK</li>
                      <li>Copy client ID and client secret</li>
                    </ol>
                  </div>
                )}

                {selectedProvider === 'okta' && (
                  <div>
                    <h4 className="font-semibold mb-2">Okta Setup:</h4>
                    <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                      <li>Go to Okta Admin Console → Applications</li>
                      <li>Create App Integration → OIDC - Web Application</li>
                      <li>Set sign-in redirect URI to the value above</li>
                      <li>Copy client ID and client secret</li>
                      <li>Assign users/groups to the application</li>
                    </ol>
                  </div>
                )}

                <Alert>
                  <AlertTriangle size={16} />
                  <AlertDescription>
                    Keep your client secret secure and never share it publicly.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={() => setCurrentStep(0)}>
            <ArrowLeft size={16} className="mr-2" />
            Back
          </Button>
          <Button 
            onClick={() => setCurrentStep(2)}
            disabled={!currentConfig.clientId || !currentConfig.clientSecret}
          >
            Next: Test Connection
            <ArrowRight size={16} className="ml-2" />
          </Button>
        </div>
      </div>
    )
  }

  const renderTesting = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Test Your Configuration</h2>
        <p className="text-muted-foreground">
          Verify that your SSO configuration works correctly
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Connection Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!testResults && (
            <div className="text-center py-8">
              <Shield size={48} className="mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">
                Ready to test your SSO configuration
              </p>
              <Button onClick={testConnection}>
                Test Connection
              </Button>
            </div>
          )}

          {testResults?.testing && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Testing connection...</p>
            </div>
          )}

          {testResults && !testResults.testing && (
            <div className="space-y-4">
              <Alert className={testResults.success ? '' : 'border-destructive'}>
                {testResults.success ? (
                  <CheckCircle size={16} className="text-green-600" />
                ) : (
                  <AlertTriangle size={16} className="text-destructive" />
                )}
                <AlertDescription>
                  {testResults.message}
                </AlertDescription>
              </Alert>

              {testResults.details && (
                <div className="space-y-2">
                  <h4 className="font-semibold">Test Details:</h4>
                  {Object.entries(testResults.details).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center py-2 border-b">
                      <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                      <Badge variant={value === 'OK' ? 'default' : 'destructive'}>
                        {value as string}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <Button variant="outline" onClick={testConnection}>
                  Test Again
                </Button>
                {testResults.success && (
                  <Button onClick={() => setCurrentStep(3)}>
                    Continue to Deploy
                    <ArrowRight size={16} className="ml-2" />
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setCurrentStep(1)}>
          <ArrowLeft size={16} className="mr-2" />
          Back to Configuration
        </Button>
      </div>
    </div>
  )

  const renderDeploy = () => (
    <div className="space-y-6">
      <div className="text-center">
        <CheckCircle size={64} className="mx-auto text-green-600 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Configuration Complete!</h2>
        <p className="text-muted-foreground">
          Your SSO provider has been successfully configured and is ready for use
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Deployment Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Provider</Label>
              <p className="font-medium">{currentConfig.displayName}</p>
            </div>
            <div>
              <Label>Status</Label>
              <Badge variant="default" className="bg-green-600 text-white">
                Active
              </Badge>
            </div>
            <div>
              <Label>Client ID</Label>
              <p className="font-mono text-sm">{currentConfig.clientId}</p>
            </div>
            <div>
              <Label>Last Tested</Label>
              <p className="text-sm">{new Date().toLocaleDateString()}</p>
            </div>
          </div>

          <Alert>
            <CheckCircle size={16} />
            <AlertDescription>
              Users can now sign in using {currentConfig.displayName}. 
              The SSO integration is live and ready for production use.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <Button onClick={saveConfiguration}>
          Save Configuration
        </Button>
      </div>
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Progress Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">SSO Integration Wizard</h1>
            <Badge variant="outline">{Math.round(progress)}% Complete</Badge>
          </div>
          
          <Progress value={progress} className="mb-4" />
          
          <div className="flex justify-between text-sm">
            {steps.map((step, index) => (
              <div 
                key={step.id}
                className={`flex items-center gap-2 ${
                  index <= currentStep ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                {step.completed ? (
                  <CheckCircle size={16} className="text-green-600" />
                ) : index === currentStep ? (
                  <div className="w-4 h-4 rounded-full bg-primary" />
                ) : (
                  <div className="w-4 h-4 rounded-full border-2 border-muted" />
                )}
                <span className="hidden md:inline">{step.title}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      <div>
        {currentStep === 0 && renderProviderSelection()}
        {currentStep === 1 && renderConfiguration()}
        {currentStep === 2 && renderTesting()}
        {currentStep === 3 && renderDeploy()}
      </div>
    </div>
  )
}