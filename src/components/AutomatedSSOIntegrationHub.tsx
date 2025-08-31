import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Shield, 
  Settings, 
  TestTube, 
  Users,
  CheckCircle,
  AlertTriangle,
  Building,
  Globe,
  Key,
  BookOpen,
  ArrowRight
} from '@phosphor-icons/react'
import { SSOProviderWizard } from './SSOProviderWizard'
import { SSOManagementDashboard } from './SSOManagementDashboard'
import { SSOTestingValidation } from './SSOTestingValidation'

interface QuickStartStep {
  id: string
  title: string
  description: string
  icon: any
  completed: boolean
}

export function AutomatedSSOIntegrationHub() {
  const [activeTab, setActiveTab] = useState('overview')
  const [showWizard, setShowWizard] = useState(false)
  const [showTesting, setShowTesting] = useState<any>(null)

  const quickStartSteps: QuickStartStep[] = [
    {
      id: 'choose-provider',
      title: 'Choose Your Provider',
      description: 'Select Microsoft Azure AD, Google Workspace, or Okta',
      icon: Building,
      completed: false
    },
    {
      id: 'configure-app',
      title: 'Configure Application',
      description: 'Set up your SSO application in provider console',
      icon: Settings,
      completed: false
    },
    {
      id: 'enter-credentials',
      title: 'Enter Credentials',
      description: 'Provide client ID, secret, and other details',
      icon: Key,
      completed: false
    },
    {
      id: 'test-connection',
      title: 'Test Connection',
      description: 'Validate your configuration works correctly',
      icon: TestTube,
      completed: false
    },
    {
      id: 'deploy',
      title: 'Deploy & Activate',
      description: 'Enable SSO for your users',
      icon: CheckCircle,
      completed: false
    }
  ]

  const providerFeatures = [
    {
      provider: 'Microsoft Azure AD',
      icon: <Building size={32} className="text-blue-600" />,
      features: [
        'Multi-Factor Authentication (MFA)',
        'Conditional Access Policies',
        'Directory Synchronization',
        'Group-based Access Control',
        'Enterprise Applications',
        'B2B Guest Access'
      ],
      bestFor: 'Organizations using Microsoft 365 and Windows environments'
    },
    {
      provider: 'Google Workspace',
      icon: <Globe size={32} className="text-red-500" />,
      features: [
        'Google Identity & Access Management',
        'Chrome Device Management',
        'Cloud Identity Premium',
        'Security Center Integration',
        'Admin Console Management',
        'Mobile Device Management'
      ],
      bestFor: 'Organizations using Google Workspace and Chrome ecosystem'
    },
    {
      provider: 'Okta',
      icon: <Shield size={32} className="text-blue-500" />,
      features: [
        'Universal Directory',
        'Adaptive Multi-Factor Authentication',
        'Lifecycle Management',
        'API Access Management',
        'Advanced Server Access',
        'Identity Governance'
      ],
      bestFor: 'Enterprise organizations requiring advanced identity governance'
    }
  ]

  if (showWizard) {
    return (
      <div>
        <div className="mb-6">
          <Button variant="outline" onClick={() => setShowWizard(false)}>
            ← Back to Integration Hub
          </Button>
        </div>
        <SSOProviderWizard />
      </div>
    )
  }

  if (showTesting) {
    return (
      <SSOTestingValidation 
        provider={showTesting.provider}
        configuration={showTesting.configuration}
        onClose={() => setShowTesting(null)}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="p-3 bg-primary/10 rounded-full">
            <Shield size={32} className="text-primary" />
          </div>
        </div>
        <h1 className="text-3xl font-bold">Automated SSO Integration</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Seamlessly integrate enterprise Single Sign-On providers with our automated setup wizard. 
          Configure Microsoft Azure AD, Google Workspace, or Okta in minutes, not hours.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <Shield size={24} className="mx-auto mb-2 text-green-600" />
            <div className="text-2xl font-bold">3</div>
            <div className="text-sm text-muted-foreground">Supported Providers</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <Settings size={24} className="mx-auto mb-2 text-blue-600" />
            <div className="text-2xl font-bold">5 Min</div>
            <div className="text-sm text-muted-foreground">Average Setup Time</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <TestTube size={24} className="mx-auto mb-2 text-purple-600" />
            <div className="text-2xl font-bold">8</div>
            <div className="text-sm text-muted-foreground">Validation Tests</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <Users size={24} className="mx-auto mb-2 text-orange-600" />
            <div className="text-2xl font-bold">99.9%</div>
            <div className="text-sm text-muted-foreground">Success Rate</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="setup">Quick Setup</TabsTrigger>
          <TabsTrigger value="providers">Providers</TabsTrigger>
          <TabsTrigger value="management">Management</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Getting Started */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowRight size={20} />
                Getting Started
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold">Quick Setup Process</h3>
                  {quickStartSteps.map((step, index) => {
                    const Icon = step.icon
                    return (
                      <div key={step.id} className="flex items-center gap-3">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-sm font-medium">{index + 1}</span>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium">{step.title}</h4>
                          <p className="text-sm text-muted-foreground">{step.description}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-semibold">Key Benefits</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <CheckCircle size={16} className="text-green-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium">Automated Configuration</h4>
                        <p className="text-sm text-muted-foreground">
                          Our wizard guides you through each step with clear instructions
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle size={16} className="text-green-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium">Real-time Validation</h4>
                        <p className="text-sm text-muted-foreground">
                          Test your configuration before going live
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle size={16} className="text-green-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium">Enterprise Security</h4>
                        <p className="text-sm text-muted-foreground">
                          SAML 2.0, OpenID Connect, and industry best practices
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle size={16} className="text-green-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium">24/7 Support</h4>
                        <p className="text-sm text-muted-foreground">
                          Expert assistance for complex configurations
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t">
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button onClick={() => setShowWizard(true)} size="lg">
                    <Settings size={20} className="mr-2" />
                    Start Setup Wizard
                  </Button>
                  <Button variant="outline" onClick={() => setActiveTab('providers')} size="lg">
                    <BookOpen size={20} className="mr-2" />
                    View Providers
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="setup" className="space-y-6">
          {/* Setup Instructions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Setup Instructions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <AlertTriangle size={16} />
                <AlertDescription>
                  <strong>Before You Begin:</strong> Ensure you have administrator access to your 
                  identity provider (Azure AD, Google Workspace, or Okta) to create and configure applications.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {quickStartSteps.map((step, index) => {
                  const Icon = step.icon
                  return (
                    <Card key={step.id} className="relative">
                      <CardContent className="p-6 text-center">
                        <div className="absolute -top-3 -left-3 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </div>
                        <Icon size={32} className="mx-auto mb-3 text-muted-foreground" />
                        <h3 className="font-semibold mb-2">{step.title}</h3>
                        <p className="text-sm text-muted-foreground">{step.description}</p>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>

              <div className="text-center">
                <Button onClick={() => setShowWizard(true)} size="lg">
                  Launch Setup Wizard
                  <ArrowRight size={16} className="ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="providers" className="space-y-6">
          {/* Provider Comparison */}
          <Card>
            <CardHeader>
              <CardTitle>Supported Identity Providers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {providerFeatures.map((provider) => (
                  <Card key={provider.provider} className="border">
                    <CardContent className="p-6">
                      <div className="text-center mb-4">
                        {provider.icon}
                        <h3 className="font-semibold mt-2">{provider.provider}</h3>
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        {provider.features.map((feature) => (
                          <div key={feature} className="flex items-center gap-2">
                            <CheckCircle size={12} className="text-green-600 flex-shrink-0" />
                            <span className="text-sm">{feature}</span>
                          </div>
                        ))}
                      </div>
                      
                      <div className="pt-4 border-t">
                        <p className="text-xs text-muted-foreground mb-3">
                          <strong>Best for:</strong> {provider.bestFor}
                        </p>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full"
                          onClick={() => setShowWizard(true)}
                        >
                          Configure {provider.provider.split(' ')[0]}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="management">
          <SSOManagementDashboard />
        </TabsContent>
      </Tabs>
    </div>
  )
}