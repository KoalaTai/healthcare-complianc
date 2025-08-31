import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  MicrosoftOutlookLogo, 
  GoogleLogo, 
  Shield, 
  CheckCircle, 
  ArrowRight,
  Play,
  Gear,
  Users,
  Lock,
  Globe,
  FileText,
  Download,
  Plus
} from '@phosphor-icons/react'
import { SSOProviderConfig } from './SSOProviderConfig'
import { SSOConfigurationWizard } from './SSOConfigurationWizard'
import { SSOManagementDashboard } from './SSOManagementDashboard'
import { SSOTestingValidation } from './SSOTestingValidation'

interface IntegrationStep {
  id: string
  title: string
  description: string
  status: 'completed' | 'current' | 'pending'
  component: string
}

export function AutomatedSSOIntegrationHub() {
  const [currentView, setCurrentView] = useState('overview')
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null)

  const integrationSteps: IntegrationStep[] = [
    {
      id: 'planning',
      title: 'Planning & Requirements',
      description: 'Define SSO requirements and select providers',
      status: 'completed',
      component: 'planning'
    },
    {
      id: 'configuration',
      title: 'Provider Configuration',
      description: 'Set up applications in identity provider consoles',
      status: 'completed',
      component: 'configuration'
    },
    {
      id: 'integration',
      title: 'Platform Integration',
      description: 'Configure SSO in VirtualBackroom.ai',
      status: 'current',
      component: 'integration'
    },
    {
      id: 'testing',
      title: 'Testing & Validation',
      description: 'Validate configuration and test authentication flows',
      status: 'pending',
      component: 'testing'
    },
    {
      id: 'deployment',
      title: 'Production Deployment',
      description: 'Deploy SSO for end users',
      status: 'pending',
      component: 'deployment'
    }
  ]

  const ssoProviders = [
    {
      id: 'azure',
      name: 'Microsoft Azure AD',
      icon: MicrosoftOutlookLogo,
      description: 'Enterprise identity with conditional access and MFA',
      status: 'configured',
      users: 1250,
      features: ['Conditional Access', 'MFA', 'Seamless SSO', 'Group Sync']
    },
    {
      id: 'google',
      name: 'Google Workspace',
      icon: GoogleLogo,
      description: 'Google identity with domain restrictions',
      status: 'active',
      users: 890,
      features: ['Domain Restriction', 'Admin SDK', 'Drive Integration', 'Calendar Sync']
    },
    {
      id: 'okta',
      name: 'Okta',
      icon: Shield,
      description: 'Universal identity platform with advanced policies',
      status: 'testing',
      users: 0,
      features: ['Universal Directory', 'Adaptive MFA', 'Lifecycle Management', 'API Access']
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200'
      case 'configured': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'testing': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'inactive': return 'bg-gray-100 text-gray-800 border-gray-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const renderOverview = () => (
    <div className="space-y-8">
      {/* Integration Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gear size={20} />
            SSO Integration Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-muted-foreground">Overall Progress</span>
              <span className="text-sm font-medium">60% Complete</span>
            </div>
            <Progress value={60} className="mb-6" />
            
            <div className="space-y-4">
              {integrationSteps.map((step, index) => (
                <div key={step.id} className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                    step.status === 'completed' ? 'bg-green-100 border-green-500' :
                    step.status === 'current' ? 'bg-blue-100 border-blue-500' :
                    'bg-gray-100 border-gray-300'
                  }`}>
                    {step.status === 'completed' ? (
                      <CheckCircle size={16} className="text-green-600" />
                    ) : (
                      <span className="text-sm font-medium">{index + 1}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{step.title}</h4>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                  <Button
                    size="sm"
                    variant={step.status === 'current' ? 'default' : 'outline'}
                    onClick={() => setCurrentView(step.component)}
                  >
                    {step.status === 'completed' ? 'Review' : 
                     step.status === 'current' ? 'Continue' : 'Start'}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Provider Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock size={20} />
            SSO Provider Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {ssoProviders.map((provider) => {
              const Icon = provider.icon
              return (
                <div key={provider.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <Icon size={24} className="text-primary" />
                    <Badge className={getStatusColor(provider.status)}>
                      {provider.status}
                    </Badge>
                  </div>
                  <h4 className="font-semibold mb-2">{provider.name}</h4>
                  <p className="text-sm text-muted-foreground mb-3">{provider.description}</p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Active Users</span>
                      <span className="font-medium">{provider.users.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-4">
                    {provider.features.slice(0, 2).map((feature) => (
                      <Badge key={feature} variant="outline" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                    {provider.features.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{provider.features.length - 2}
                      </Badge>
                    )}
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setSelectedProvider(provider.id)
                      setCurrentView('configuration')
                    }}
                  >
                    Configure
                  </Button>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowRight size={20} />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button
              variant="outline"
              className="h-20 flex-col gap-2"
              onClick={() => setCurrentView('wizard')}
            >
              <Play size={20} />
              <span className="text-sm">Start Setup Wizard</span>
            </Button>

            <Button
              variant="outline"
              className="h-20 flex-col gap-2"
              onClick={() => setCurrentView('testing')}
            >
              <CheckCircle size={20} />
              <span className="text-sm">Run Tests</span>
            </Button>

            <Button
              variant="outline"
              className="h-20 flex-col gap-2"
              onClick={() => setCurrentView('management')}
            >
              <Users size={20} />
              <span className="text-sm">Manage Users</span>
            </Button>

            <Button
              variant="outline"
              className="h-20 flex-col gap-2"
              onClick={() => setCurrentView('docs')}
            >
              <FileText size={20} />
              <span className="text-sm">View Documentation</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe size={20} />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { action: 'Azure AD configuration updated', time: '2 hours ago', status: 'success' },
              { action: 'Google Workspace test completed', time: '5 hours ago', status: 'success' },
              { action: 'Okta integration started', time: '1 day ago', status: 'pending' },
              { action: 'SSO enabled for 47 new users', time: '2 days ago', status: 'success' }
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    activity.status === 'success' ? 'bg-green-500' :
                    activity.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
                  }`} />
                  <span className="text-sm">{activity.action}</span>
                </div>
                <span className="text-xs text-muted-foreground">{activity.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderCurrentView = () => {
    switch (currentView) {
      case 'configuration':
        return <SSOProviderConfig />
      case 'wizard':
        return <SSOConfigurationWizard />
      case 'management':
        return <SSOManagementDashboard />
      case 'testing':
        return <SSOTestingValidation />
      case 'docs':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText size={20} />
                SSO Documentation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Alert>
                <FileText size={16} />
                <AlertDescription>
                  Comprehensive SSO integration documentation, setup guides, and troubleshooting resources will be available here.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        )
      default:
        return renderOverview()
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {currentView === 'overview' ? 'Enterprise SSO Integration Hub' : 
             currentView === 'configuration' ? 'SSO Provider Configuration' :
             currentView === 'wizard' ? 'SSO Setup Wizard' :
             currentView === 'management' ? 'SSO Management Dashboard' :
             currentView === 'testing' ? 'SSO Testing & Validation' :
             'SSO Documentation'}
          </h1>
          <p className="text-muted-foreground">
            {currentView === 'overview' ? 'Centralized hub for managing enterprise SSO integrations' :
             currentView === 'configuration' ? 'Configure and manage SSO providers' :
             currentView === 'wizard' ? 'Step-by-step SSO setup wizard' :
             currentView === 'management' ? 'Monitor and manage SSO providers and users' :
             currentView === 'testing' ? 'Test and validate SSO configurations' :
             'Integration guides and documentation'}
          </p>
        </div>
        <div className="flex gap-3">
          {currentView !== 'overview' && (
            <Button
              variant="outline"
              onClick={() => setCurrentView('overview')}
            >
              ← Back to Hub
            </Button>
          )}
          <Button>
            <Plus size={16} className="mr-2" />
            Add Provider
          </Button>
        </div>
      </div>

      {renderCurrentView()}
    </div>
  )
}