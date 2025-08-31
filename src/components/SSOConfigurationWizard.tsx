import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { 
  ChevronLeft,
  ChevronRight,
  Shield,
  Key,
  Users,
  Settings,
  CheckCircle,
  AlertTriangle,
  Copy,
  Download,
  Upload,
  Eye,
  EyeSlash
} from '@phosphor-icons/react'

interface WizardStep {
  id: string
  title: string
  description: string
  component: React.ComponentType<any>
  isValid?: boolean
}

interface SSOConfiguration {
  provider: string
  basicConfig: {
    clientId: string
    clientSecret: string
    tenantId: string
    domain: string
  }
  samlConfig: {
    entityId: string
    acsUrl: string
    ssoUrl: string
    certificate: string
  }
  userMapping: {
    emailAttribute: string
    firstNameAttribute: string
    lastNameAttribute: string
    departmentAttribute: string
    roleAttribute: string
  }
  securitySettings: {
    mfaRequired: boolean
    sessionTimeout: number
    autoProvisioning: boolean
    conditionalAccess: boolean
    allowedDomains: string[]
  }
  testing: {
    connectionTested: boolean
    userProvisioningTested: boolean
    mfaTested: boolean
  }
}

export function SSOConfigurationWizard({ provider, onComplete }: { 
  provider: string
  onComplete: (config: SSOConfiguration) => void 
}) {
  const [currentStep, setCurrentStep] = useState(0)
  const [showSecrets, setShowSecrets] = useState(false)
  const [config, setConfig] = useState<SSOConfiguration>({
    provider,
    basicConfig: {
      clientId: '',
      clientSecret: '',
      tenantId: '',
      domain: ''
    },
    samlConfig: {
      entityId: 'https://app.virtualbackroom.ai',
      acsUrl: `https://app.virtualbackroom.ai/auth/saml/${provider}`,
      ssoUrl: '',
      certificate: ''
    },
    userMapping: {
      emailAttribute: 'email',
      firstNameAttribute: 'firstName',
      lastNameAttribute: 'lastName',
      departmentAttribute: 'department',
      roleAttribute: 'role'
    },
    securitySettings: {
      mfaRequired: true,
      sessionTimeout: 480,
      autoProvisioning: true,
      conditionalAccess: true,
      allowedDomains: []
    },
    testing: {
      connectionTested: false,
      userProvisioningTested: false,
      mfaTested: false
    }
  })

  const BasicConfigStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Basic Identity Provider Configuration</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Enter the basic connection details for your {provider} identity provider.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="clientId">Application/Client ID</Label>
            <Input
              id="clientId"
              value={config.basicConfig.clientId}
              onChange={(e) => setConfig(prev => ({
                ...prev,
                basicConfig: { ...prev.basicConfig, clientId: e.target.value }
              }))}
              placeholder="Enter your application client ID"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Found in your {provider} application registration
            </p>
          </div>

          <div>
            <Label htmlFor="tenantId">Tenant/Directory ID</Label>
            <Input
              id="tenantId"
              value={config.basicConfig.tenantId}
              onChange={(e) => setConfig(prev => ({
                ...prev,
                basicConfig: { ...prev.basicConfig, tenantId: e.target.value }
              }))}
              placeholder="Enter your tenant/directory ID"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="clientSecret">Client Secret</Label>
            <div className="relative">
              <Input
                id="clientSecret"
                type={showSecrets ? "text" : "password"}
                value={config.basicConfig.clientSecret}
                onChange={(e) => setConfig(prev => ({
                  ...prev,
                  basicConfig: { ...prev.basicConfig, clientSecret: e.target.value }
                }))}
                placeholder="Enter your client secret"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 -translate-y-1/2"
                onClick={() => setShowSecrets(!showSecrets)}
              >
                {showSecrets ? <EyeSlash size={14} /> : <Eye size={14} />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Keep this secret secure and rotate regularly
            </p>
          </div>

          <div>
            <Label htmlFor="domain">Organization Domain</Label>
            <Input
              id="domain"
              value={config.basicConfig.domain}
              onChange={(e) => setConfig(prev => ({
                ...prev,
                basicConfig: { ...prev.basicConfig, domain: e.target.value }
              }))}
              placeholder="company.com"
            />
          </div>
        </div>
      </div>

      {/* Configuration Preview */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-sm">Configuration Preview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>Redirect URI:</div>
            <div className="font-mono">https://app.virtualbackroom.ai/auth/{provider}/callback</div>
            <div>Logout URI:</div>
            <div className="font-mono">https://app.virtualbackroom.ai/auth/logout</div>
            <div>Entity ID:</div>
            <div className="font-mono">{config.samlConfig.entityId}</div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const AttributeMappingStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">User Attribute Mapping</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Map user attributes from your identity provider to VirtualBackroom.ai user fields.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="emailAttr">Email Attribute</Label>
            <Input
              id="emailAttr"
              value={config.userMapping.emailAttribute}
              onChange={(e) => setConfig(prev => ({
                ...prev,
                userMapping: { ...prev.userMapping, emailAttribute: e.target.value }
              }))}
              placeholder="email"
            />
          </div>

          <div>
            <Label htmlFor="firstNameAttr">First Name Attribute</Label>
            <Input
              id="firstNameAttr"
              value={config.userMapping.firstNameAttribute}
              onChange={(e) => setConfig(prev => ({
                ...prev,
                userMapping: { ...prev.userMapping, firstNameAttribute: e.target.value }
              }))}
              placeholder="firstName or given_name"
            />
          </div>

          <div>
            <Label htmlFor="lastNameAttr">Last Name Attribute</Label>
            <Input
              id="lastNameAttr"
              value={config.userMapping.lastNameAttribute}
              onChange={(e) => setConfig(prev => ({
                ...prev,
                userMapping: { ...prev.userMapping, lastNameAttribute: e.target.value }
              }))}
              placeholder="lastName or family_name"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="deptAttr">Department Attribute</Label>
            <Input
              id="deptAttr"
              value={config.userMapping.departmentAttribute}
              onChange={(e) => setConfig(prev => ({
                ...prev,
                userMapping: { ...prev.userMapping, departmentAttribute: e.target.value }
              }))}
              placeholder="department"
            />
          </div>

          <div>
            <Label htmlFor="roleAttr">Role Attribute (Optional)</Label>
            <Input
              id="roleAttr"
              value={config.userMapping.roleAttribute}
              onChange={(e) => setConfig(prev => ({
                ...prev,
                userMapping: { ...prev.userMapping, roleAttribute: e.target.value }
              }))}
              placeholder="role or jobTitle"
            />
          </div>
        </div>
      </div>

      {/* Standard Mappings Reference */}
      <Card className="bg-blue-50 dark:bg-blue-950/20">
        <CardHeader>
          <CardTitle className="text-sm">Standard Attribute Names by Provider</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <h6 className="font-medium mb-2">Microsoft Azure AD</h6>
              <div className="space-y-1 text-muted-foreground">
                <div>Email: email</div>
                <div>First: given_name</div>
                <div>Last: family_name</div>
                <div>Dept: department</div>
              </div>
            </div>
            <div>
              <h6 className="font-medium mb-2">Google Workspace</h6>
              <div className="space-y-1 text-muted-foreground">
                <div>Email: email</div>
                <div>First: given_name</div>
                <div>Last: family_name</div>
                <div>Dept: department</div>
              </div>
            </div>
            <div>
              <h6 className="font-medium mb-2">Okta</h6>
              <div className="space-y-1 text-muted-foreground">
                <div>Email: user.email</div>
                <div>First: user.firstName</div>
                <div>Last: user.lastName</div>
                <div>Dept: user.department</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const SecuritySettingsStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Security & Access Control Settings</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Configure security policies and access controls for your SSO integration.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Authentication Requirements</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="mfaRequired">Require Multi-Factor Authentication</Label>
                <p className="text-xs text-muted-foreground">Enforce MFA for all users</p>
              </div>
              <Switch
                id="mfaRequired"
                checked={config.securitySettings.mfaRequired}
                onCheckedChange={(checked) => setConfig(prev => ({
                  ...prev,
                  securitySettings: { ...prev.securitySettings, mfaRequired: checked }
                }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="autoProvisioning">Auto-Provision Users</Label>
                <p className="text-xs text-muted-foreground">Automatically create user accounts</p>
              </div>
              <Switch
                id="autoProvisioning"
                checked={config.securitySettings.autoProvisioning}
                onCheckedChange={(checked) => setConfig(prev => ({
                  ...prev,
                  securitySettings: { ...prev.securitySettings, autoProvisioning: checked }
                }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="conditionalAccess">Enable Conditional Access</Label>
                <p className="text-xs text-muted-foreground">Apply risk-based access policies</p>
              </div>
              <Switch
                id="conditionalAccess"
                checked={config.securitySettings.conditionalAccess}
                onCheckedChange={(checked) => setConfig(prev => ({
                  ...prev,
                  securitySettings: { ...prev.securitySettings, conditionalAccess: checked }
                }))}
              />
            </div>

            <div>
              <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
              <Input
                id="sessionTimeout"
                type="number"
                value={config.securitySettings.sessionTimeout}
                onChange={(e) => setConfig(prev => ({
                  ...prev,
                  securitySettings: { ...prev.securitySettings, sessionTimeout: parseInt(e.target.value) || 480 }
                }))}
                min="60"
                max="1440"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Recommended: 480 minutes (8 hours) for compliance environments
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Domain & Access Control</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="allowedDomains">Allowed Email Domains</Label>
              <Textarea
                id="allowedDomains"
                value={config.securitySettings.allowedDomains.join('\n')}
                onChange={(e) => setConfig(prev => ({
                  ...prev,
                  securitySettings: { 
                    ...prev.securitySettings, 
                    allowedDomains: e.target.value.split('\n').filter(d => d.trim()) 
                  }
                }))}
                placeholder="company.com&#10;subsidiary.com&#10;partner.org"
                rows={4}
              />
              <p className="text-xs text-muted-foreground mt-1">
                One domain per line. Leave empty to allow all domains.
              </p>
            </div>

            <Card className="bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800">
              <CardContent className="p-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle size={16} className="text-yellow-600 mt-0.5" />
                  <div>
                    <h6 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                      Security Recommendation
                    </h6>
                    <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                      For regulatory compliance, enable MFA, conditional access, and restrict to your organization's verified domains.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const TestingStep = () => {
    const [testResults, setTestResults] = useState<{[key: string]: any}>({})
    const [isTestingConnection, setIsTestingConnection] = useState(false)
    const [isTestingProvisioning, setIsTestingProvisioning] = useState(false)
    const [isTestingMFA, setIsTestingMFA] = useState(false)

    const runConnectionTest = async () => {
      setIsTestingConnection(true)
      // Simulate API call to test SSO connection
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const result = {
        success: true,
        responseTime: '234ms',
        certificateValid: true,
        tokenExchange: 'Success',
        userAttributes: ['email', 'firstName', 'lastName', 'department']
      }
      
      setTestResults(prev => ({ ...prev, connection: result }))
      setConfig(prev => ({
        ...prev,
        testing: { ...prev.testing, connectionTested: true }
      }))
      setIsTestingConnection(false)
    }

    const runProvisioningTest = async () => {
      setIsTestingProvisioning(true)
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const result = {
        success: true,
        testUser: 'john.doe@company.com',
        attributeMapping: 'Successful',
        accountCreated: true,
        groupAssignment: 'Applied'
      }
      
      setTestResults(prev => ({ ...prev, provisioning: result }))
      setConfig(prev => ({
        ...prev,
        testing: { ...prev.testing, userProvisioningTested: true }
      }))
      setIsTestingProvisioning(false)
    }

    const runMFATest = async () => {
      setIsTestingMFA(true)
      await new Promise(resolve => setTimeout(resolve, 1800))
      
      const result = {
        success: true,
        mfaMethod: 'Microsoft Authenticator',
        enforcementPolicy: 'Applied',
        fallbackOptions: ['SMS', 'Email']
      }
      
      setTestResults(prev => ({ ...prev, mfa: result }))
      setConfig(prev => ({
        ...prev,
        testing: { ...prev.testing, mfaTested: true }
      }))
      setIsTestingMFA(false)
    }

    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">Configuration Testing & Validation</h3>
          <p className="text-sm text-muted-foreground mb-6">
            Test your SSO configuration to ensure everything works correctly before going live.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className={config.testing.connectionTested ? 'border-green-500' : ''}>
            <CardContent className="p-6 text-center">
              <Shield size={32} className={`mx-auto mb-3 ${config.testing.connectionTested ? 'text-green-600' : 'text-muted-foreground'}`} />
              <h4 className="font-medium mb-2">SSO Connection Test</h4>
              <p className="text-xs text-muted-foreground mb-4">
                Validate authentication flow and token exchange
              </p>
              <Button 
                variant={config.testing.connectionTested ? 'default' : 'outline'}
                size="sm"
                onClick={runConnectionTest}
                disabled={isTestingConnection}
              >
                {isTestingConnection ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2" />
                    Testing...
                  </>
                ) : config.testing.connectionTested ? (
                  <>
                    <CheckCircle size={14} className="mr-2" />
                    Tested
                  </>
                ) : (
                  'Run Test'
                )}
              </Button>
              
              {testResults.connection && (
                <div className="mt-4 p-3 bg-green-50 dark:bg-green-950/20 rounded text-left">
                  <div className="text-xs space-y-1">
                    <div>✓ Response Time: {testResults.connection.responseTime}</div>
                    <div>✓ Certificate: Valid</div>
                    <div>✓ Token Exchange: Success</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className={config.testing.userProvisioningTested ? 'border-green-500' : ''}>
            <CardContent className="p-6 text-center">
              <Users size={32} className={`mx-auto mb-3 ${config.testing.userProvisioningTested ? 'text-green-600' : 'text-muted-foreground'}`} />
              <h4 className="font-medium mb-2">User Provisioning Test</h4>
              <p className="text-xs text-muted-foreground mb-4">
                Test automatic user creation and attribute mapping
              </p>
              <Button 
                variant={config.testing.userProvisioningTested ? 'default' : 'outline'}
                size="sm"
                onClick={runProvisioningTest}
                disabled={isTestingProvisioning}
              >
                {isTestingProvisioning ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2" />
                    Testing...
                  </>
                ) : config.testing.userProvisioningTested ? (
                  <>
                    <CheckCircle size={14} className="mr-2" />
                    Tested
                  </>
                ) : (
                  'Run Test'
                )}
              </Button>

              {testResults.provisioning && (
                <div className="mt-4 p-3 bg-green-50 dark:bg-green-950/20 rounded text-left">
                  <div className="text-xs space-y-1">
                    <div>✓ Test User: Created</div>
                    <div>✓ Attributes: Mapped</div>
                    <div>✓ Groups: Assigned</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className={config.testing.mfaTested ? 'border-green-500' : ''}>
            <CardContent className="p-6 text-center">
              <Key size={32} className={`mx-auto mb-3 ${config.testing.mfaTested ? 'text-green-600' : 'text-muted-foreground'}`} />
              <h4 className="font-medium mb-2">MFA Flow Test</h4>
              <p className="text-xs text-muted-foreground mb-4">
                Validate multi-factor authentication enforcement
              </p>
              <Button 
                variant={config.testing.mfaTested ? 'default' : 'outline'}
                size="sm"
                onClick={runMFATest}
                disabled={isTestingMFA}
              >
                {isTestingMFA ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2" />
                    Testing...
                  </>
                ) : config.testing.mfaTested ? (
                  <>
                    <CheckCircle size={14} className="mr-2" />
                    Tested
                  </>
                ) : (
                  'Run Test'
                )}
              </Button>

              {testResults.mfa && (
                <div className="mt-4 p-3 bg-green-50 dark:bg-green-950/20 rounded text-left">
                  <div className="text-xs space-y-1">
                    <div>✓ MFA: Enforced</div>
                    <div>✓ Method: Authenticator</div>
                    <div>✓ Fallback: Available</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

      {/* Configuration Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Configuration Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div className="space-y-2">
              <h6 className="font-medium">Identity Provider</h6>
              <div className="text-muted-foreground">Provider: {provider}</div>
              <div className="text-muted-foreground">Domain: {config.basicConfig.domain || 'Not configured'}</div>
              <div className="text-muted-foreground">Auto-provisioning: {config.securitySettings.autoProvisioning ? 'Enabled' : 'Disabled'}</div>
            </div>
            <div className="space-y-2">
              <h6 className="font-medium">Security Settings</h6>
              <div className="text-muted-foreground">MFA Required: {config.securitySettings.mfaRequired ? 'Yes' : 'No'}</div>
              <div className="text-muted-foreground">Session Timeout: {config.securitySettings.sessionTimeout} minutes</div>
              <div className="text-muted-foreground">Conditional Access: {config.securitySettings.conditionalAccess ? 'Enabled' : 'Disabled'}</div>
            </div>
          </div>

          {/* Export Configuration */}
          <Separator />
          <div className="flex gap-3">
            <Button variant="outline" size="sm">
              <Download size={14} className="mr-2" />
              Export Configuration
            </Button>
            <Button variant="outline" size="sm">
              <Copy size={14} className="mr-2" />
              Copy Config JSON
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const steps: WizardStep[] = [
    {
      id: 'basic',
      title: 'Basic Configuration',
      description: 'Enter your identity provider connection details',
      component: BasicConfigStep,
      isValid: !!(config.basicConfig.clientId && config.basicConfig.clientSecret && config.basicConfig.domain)
    },
    {
      id: 'mapping',
      title: 'User Attribute Mapping',
      description: 'Map user attributes from your IdP to VirtualBackroom.ai',
      component: AttributeMappingStep,
      isValid: !!(config.userMapping.emailAttribute && config.userMapping.firstNameAttribute)
    },
    {
      id: 'security',
      title: 'Security Settings',
      description: 'Configure security policies and access controls',
      component: SecuritySettingsStep,
      isValid: true
    },
    {
      id: 'testing',
      title: 'Testing & Validation',
      description: 'Test your configuration and validate functionality',
      component: TestingStep,
      isValid: config.testing.connectionTested && config.testing.userProvisioningTested
    }
  ]

  const CurrentStepComponent = steps[currentStep].component

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      onComplete(config)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const progressPercentage = ((currentStep + 1) / steps.length) * 100

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">SSO Configuration Wizard</h2>
        <p className="text-muted-foreground">
          Configure {provider} SSO integration for VirtualBackroom.ai
        </p>
      </div>

      {/* Progress */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium">Step {currentStep + 1} of {steps.length}</span>
            <span className="text-sm text-muted-foreground">{Math.round(progressPercentage)}% Complete</span>
          </div>
          <Progress value={progressPercentage} className="mb-4" />
          <div className="flex justify-between text-xs text-muted-foreground">
            {steps.map((step, index) => (
              <div 
                key={step.id}
                className={`text-center ${index <= currentStep ? 'text-primary' : ''}`}
              >
                <div className={`w-8 h-8 rounded-full border-2 mx-auto mb-1 flex items-center justify-center ${
                  index < currentStep ? 'bg-primary text-primary-foreground border-primary' :
                  index === currentStep ? 'border-primary text-primary' :
                  'border-muted text-muted-foreground'
                }`}>
                  {index < currentStep ? <CheckCircle size={16} /> : index + 1}
                </div>
                <div className="max-w-20">{step.title}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Current Step */}
      <Card>
        <CardHeader>
          <CardTitle>{steps[currentStep].title}</CardTitle>
          <p className="text-sm text-muted-foreground">{steps[currentStep].description}</p>
        </CardHeader>
        <CardContent>
          <CurrentStepComponent />
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={handlePrevious}
          disabled={currentStep === 0}
        >
          <ChevronLeft size={16} className="mr-2" />
          Previous
        </Button>
        <Button 
          onClick={handleNext}
          disabled={!steps[currentStep].isValid}
        >
          {currentStep === steps.length - 1 ? 'Complete Setup' : 'Next'}
          <ChevronRight size={16} className="ml-2" />
        </Button>
      </div>
    </div>
  )
}