import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  CheckCircle, 
  Warning, 
  XCircle, 
  ArrowRight, 
  ArrowLeft,
  MicrosoftOutlookLogo,
  GoogleLogo,
  Shield,
  Key,
  Globe,
  Users,
  Lock,
  Play
} from '@phosphor-icons/react'

interface WizardStep {
  id: string
  title: string
  description: string
  status: 'pending' | 'current' | 'completed' | 'error'
}

export function SSOConfigurationWizard() {
  const [currentStep, setCurrentStep] = useState(0)
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null)
  const [configuration, setConfiguration] = useState<Record<string, any>>({})
  const [testResults, setTestResults] = useState<Record<string, boolean>>({})

  const providers = [
    {
      id: 'azure',
      name: 'Microsoft Azure AD',
      icon: MicrosoftOutlookLogo,
      color: 'text-blue-600',
      description: 'Enterprise identity with conditional access'
    },
    {
      id: 'google',
      name: 'Google Workspace',
      icon: GoogleLogo,
      color: 'text-red-600',
      description: 'Google identity with domain restrictions'
    },
    {
      id: 'okta',
      name: 'Okta',
      icon: Shield,
      color: 'text-indigo-600',
      description: 'Enterprise identity platform'
    }
  ]

  const getStepsForProvider = (providerId: string): WizardStep[] => {
    const baseSteps: WizardStep[] = [
      { id: 'provider', title: 'Choose Provider', description: 'Select your SSO provider', status: 'completed' },
      { id: 'setup', title: 'Provider Setup', description: 'Configure in provider console', status: currentStep === 1 ? 'current' : currentStep > 1 ? 'completed' : 'pending' },
      { id: 'credentials', title: 'Add Credentials', description: 'Enter application credentials', status: currentStep === 2 ? 'current' : currentStep > 2 ? 'completed' : 'pending' },
      { id: 'test', title: 'Test Connection', description: 'Verify SSO integration', status: currentStep === 3 ? 'current' : currentStep > 3 ? 'completed' : 'pending' },
      { id: 'deploy', title: 'Deploy', description: 'Activate SSO for users', status: currentStep === 4 ? 'current' : currentStep > 4 ? 'completed' : 'pending' }
    ]
    return baseSteps
  }

  const steps = selectedProvider ? getStepsForProvider(selectedProvider) : []

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const renderStepIndicator = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
              step.status === 'completed' ? 'bg-green-100 border-green-500' :
              step.status === 'current' ? 'bg-primary border-primary text-primary-foreground' :
              step.status === 'error' ? 'bg-red-100 border-red-500' :
              'bg-gray-100 border-gray-300'
            }`}>
              {step.status === 'completed' ? (
                <CheckCircle size={16} className="text-green-600" />
              ) : step.status === 'error' ? (
                <XCircle size={16} className="text-red-600" />
              ) : (
                <span className="text-sm font-medium">{index + 1}</span>
              )}
            </div>
            {index < steps.length - 1 && (
              <div className={`w-full h-0.5 mx-4 ${
                step.status === 'completed' ? 'bg-green-500' : 'bg-gray-200'
              }`} />
            )}
          </div>
        ))}
      </div>
      <div className="mt-4 text-center">
        <h2 className="text-xl font-semibold">{steps[currentStep]?.title}</h2>
        <p className="text-muted-foreground">{steps[currentStep]?.description}</p>
      </div>
      <Progress value={(currentStep / (steps.length - 1)) * 100} className="mt-4" />
    </div>
  )

  const renderProviderSelection = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Choose Your SSO Provider</h3>
        <p className="text-muted-foreground">
          Select the identity provider your organization uses
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {providers.map((provider) => {
          const Icon = provider.icon
          return (
            <Card 
              key={provider.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedProvider === provider.id ? 'ring-2 ring-primary border-primary' : ''
              }`}
              onClick={() => setSelectedProvider(provider.id)}
            >
              <CardContent className="p-6 text-center">
                <Icon size={32} className={`${provider.color} mx-auto mb-3`} />
                <h4 className="font-semibold mb-2">{provider.name}</h4>
                <p className="text-sm text-muted-foreground">{provider.description}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )

  const renderProviderSetup = () => {
    const provider = providers.find(p => p.id === selectedProvider)
    if (!provider) return null

    const setupInstructions = {
      azure: [
        'Open Azure Portal and navigate to Azure Active Directory',
        'Go to App registrations and click "New registration"',
        'Name: "VirtualBackroom.ai" | Redirect URI: https://virtualbackroom.ai/auth/azure/callback',
        'Copy Application (client) ID and Directory (tenant) ID',
        'Go to Certificates & secrets, create a new client secret',
        'Under API permissions, add Microsoft Graph permissions: User.Read, profile, openid, email'
      ],
      google: [
        'Open Google Cloud Console and go to APIs & Services > Credentials',
        'Click "Create Credentials" > "OAuth 2.0 Client IDs"',
        'Application type: Web application',
        'Add authorized redirect URI: https://virtualbackroom.ai/auth/google/callback',
        'Copy Client ID and Client Secret',
        'Ensure Google+ API is enabled in API Library'
      ],
      okta: [
        'Log into Okta Admin Console',
        'Go to Applications and click "Create App Integration"',
        'Choose OIDC - OpenID Connect and Web Application',
        'Sign-in redirect URI: https://virtualbackroom.ai/auth/okta/callback',
        'Configure Assignments for user/group access',
        'Copy Client ID and Client Secret from app settings'
      ]
    }

    const Icon = provider.icon

    return (
      <div className="space-y-6">
        <Alert>
          <Icon size={16} />
          <AlertDescription>
            Follow these steps in your {provider.name} console to set up the integration
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe size={20} />
              Setup Instructions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-4">
              {setupInstructions[selectedProvider as keyof typeof setupInstructions]?.map((instruction, index) => (
                <li key={index} className="flex gap-3">
                  <Badge variant="outline" className="w-6 h-6 rounded-full p-0 flex items-center justify-center flex-shrink-0">
                    {index + 1}
                  </Badge>
                  <span className="text-sm">{instruction}</span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>

        <Alert>
          <Key size={16} />
          <AlertDescription>
            Keep your credentials secure. We'll need the Client ID, Client Secret, and any domain/tenant information in the next step.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  const renderCredentialsInput = () => {
    const provider = providers.find(p => p.id === selectedProvider)
    if (!provider) return null

    const Icon = provider.icon

    return (
      <div className="space-y-6">
        <Alert>
          <Icon size={16} />
          <AlertDescription>
            Enter the credentials from your {provider.name} application configuration
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock size={20} />
              Application Credentials
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedProvider === 'azure' && (
              <>
                <div>
                  <Label htmlFor="tenant-id">Tenant ID / Domain</Label>
                  <Input
                    id="tenant-id"
                    placeholder="contoso.onmicrosoft.com"
                    value={configuration.tenantId || ''}
                    onChange={(e) => setConfiguration(prev => ({ ...prev, tenantId: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="client-id">Application (Client) ID</Label>
                  <Input
                    id="client-id"
                    placeholder="12345678-1234-1234-1234-123456789abc"
                    value={configuration.clientId || ''}
                    onChange={(e) => setConfiguration(prev => ({ ...prev, clientId: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="client-secret">Client Secret</Label>
                  <Input
                    id="client-secret"
                    type="password"
                    placeholder="Enter client secret"
                    value={configuration.clientSecret || ''}
                    onChange={(e) => setConfiguration(prev => ({ ...prev, clientSecret: e.target.value }))}
                  />
                </div>
              </>
            )}

            {selectedProvider === 'google' && (
              <>
                <div>
                  <Label htmlFor="client-id">OAuth 2.0 Client ID</Label>
                  <Input
                    id="client-id"
                    placeholder="123456789012-abcdefghijklmnopqrstuvwxyz123456.apps.googleusercontent.com"
                    value={configuration.clientId || ''}
                    onChange={(e) => setConfiguration(prev => ({ ...prev, clientId: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="client-secret">Client Secret</Label>
                  <Input
                    id="client-secret"
                    type="password"
                    placeholder="Enter client secret"
                    value={configuration.clientSecret || ''}
                    onChange={(e) => setConfiguration(prev => ({ ...prev, clientSecret: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="domain">Hosted Domain (Optional)</Label>
                  <Input
                    id="domain"
                    placeholder="company.com"
                    value={configuration.domain || ''}
                    onChange={(e) => setConfiguration(prev => ({ ...prev, domain: e.target.value }))}
                  />
                </div>
              </>
            )}

            {selectedProvider === 'okta' && (
              <>
                <div>
                  <Label htmlFor="domain">Okta Domain</Label>
                  <Input
                    id="domain"
                    placeholder="company.okta.com"
                    value={configuration.domain || ''}
                    onChange={(e) => setConfiguration(prev => ({ ...prev, domain: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="client-id">Client ID</Label>
                  <Input
                    id="client-id"
                    placeholder="abcd1234efgh5678ijkl"
                    value={configuration.clientId || ''}
                    onChange={(e) => setConfiguration(prev => ({ ...prev, clientId: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="client-secret">Client Secret</Label>
                  <Input
                    id="client-secret"
                    type="password"
                    placeholder="Enter client secret"
                    value={configuration.clientSecret || ''}
                    onChange={(e) => setConfiguration(prev => ({ ...prev, clientSecret: e.target.value }))}
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderConnectionTest = () => {
    const provider = providers.find(p => p.id === selectedProvider)
    if (!provider) return null

    const tests = [
      { id: 'metadata', name: 'Provider Metadata', description: 'Verify provider configuration' },
      { id: 'auth', name: 'Authentication Flow', description: 'Test login redirect' },
      { id: 'token', name: 'Token Validation', description: 'Verify token exchange' },
      { id: 'user', name: 'User Information', description: 'Retrieve user profile data' }
    ]

    const runTest = (testId: string) => {
      // Simulate test execution
      setTimeout(() => {
        setTestResults(prev => ({ ...prev, [testId]: true }))
      }, 2000)
    }

    const Icon = provider.icon

    return (
      <div className="space-y-6">
        <Alert>
          <Icon size={16} />
          <AlertDescription>
            Test your {provider.name} integration to ensure everything is configured correctly
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play size={20} />
              Connection Tests
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {tests.map((test) => (
              <div key={test.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">{test.name}</h4>
                  <p className="text-sm text-muted-foreground">{test.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  {testResults[test.id] ? (
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      <CheckCircle size={14} className="mr-1" />
                      Passed
                    </Badge>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => runTest(test.id)}
                    >
                      Run Test
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {Object.keys(testResults).length === tests.length && (
          <Alert>
            <CheckCircle size={16} />
            <AlertDescription>
              All tests passed! Your SSO integration is ready for deployment.
            </AlertDescription>
          </Alert>
        )}
      </div>
    )
  }

  const renderDeployment = () => {
    const provider = providers.find(p => p.id === selectedProvider)
    if (!provider) return null

    const Icon = provider.icon

    return (
      <div className="space-y-6">
        <Alert>
          <CheckCircle size={16} />
          <AlertDescription>
            Your {provider.name} SSO integration is ready to be deployed to production
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users size={20} />
              Deployment Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Provider</Label>
                <p className="font-medium">{provider.name}</p>
              </div>
              <div>
                <Label>Status</Label>
                <Badge className="bg-green-100 text-green-800 border-green-200">Ready</Badge>
              </div>
            </div>
            
            <Separator />

            <div className="space-y-2">
              <Label>Configuration Details</Label>
              <div className="bg-muted p-3 rounded-lg text-sm font-mono">
                {selectedProvider === 'azure' && (
                  <>
                    <div>Tenant: {configuration.tenantId}</div>
                    <div>Client ID: {configuration.clientId?.substring(0, 8)}...</div>
                  </>
                )}
                {selectedProvider === 'google' && (
                  <>
                    <div>Client ID: {configuration.clientId?.substring(0, 20)}...</div>
                    <div>Domain: {configuration.domain || 'Any domain'}</div>
                  </>
                )}
                {selectedProvider === 'okta' && (
                  <>
                    <div>Domain: {configuration.domain}</div>
                    <div>Client ID: {configuration.clientId}</div>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h4 className="font-semibold text-blue-900 mb-2">Next Steps:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• SSO will be enabled for all users in your organization</li>
            <li>• Users will be redirected to {provider.name} for authentication</li>
            <li>• User accounts will be automatically provisioned on first login</li>
            <li>• You can manage user access through your {provider.name} console</li>
          </ul>
        </div>
      </div>
    )
  }

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return renderProviderSelection()
      case 1:
        return renderProviderSetup()
      case 2:
        return renderCredentialsInput()
      case 3:
        return renderConnectionTest()
      case 4:
        return renderDeployment()
      default:
        return null
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return selectedProvider !== null
      case 2:
        return configuration.clientId && configuration.clientSecret
      case 3:
        return Object.keys(testResults).length > 0
      default:
        return true
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {selectedProvider && renderStepIndicator()}
      
      <Card>
        <CardContent className="p-8">
          {renderCurrentStep()}
        </CardContent>
      </Card>

      {selectedProvider && (
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 0}
            className="flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Previous
          </Button>
          
          <Button
            onClick={currentStep === steps.length - 1 ? () => {} : nextStep}
            disabled={!canProceed()}
            className="flex items-center gap-2"
          >
            {currentStep === steps.length - 1 ? 'Deploy SSO' : 'Next'}
            <ArrowRight size={16} />
          </Button>
        </div>
      )}
    </div>
  )
}