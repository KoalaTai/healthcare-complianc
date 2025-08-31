import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Switch } from '@/components/ui/switch'
import { Progress } from '@/components/ui/progress'
import { 
  MicrosoftOutlookLogo, 
  GoogleLogo, 
  Shield, 
  CheckCircle, 
  Warning,
  XCircle,
  Play,
  Pause,
  Users,
  Lock,
  Globe,
  Clock,
  ArrowRight,
  Eye,
  Gear
} from '@phosphor-icons/react'
import { useKV } from '@github/spark/hooks'

interface SSOProvider {
  id: string
  name: string
  icon: any
  status: 'active' | 'configured' | 'testing' | 'inactive' | 'error'
  users: number
  lastSync: string
  config: Record<string, any>
}

export function SSOManagementDashboard() {
  const [ssoProviders, setSSOProviders] = useKV('sso-providers', [
    {
      id: 'azure',
      name: 'Microsoft Azure AD',
      icon: MicrosoftOutlookLogo,
      status: 'active',
      users: 847,
      lastSync: '2024-01-15T10:30:00Z',
      config: {
        tenantId: 'contoso.onmicrosoft.com',
        clientId: '12345678-1234-1234-1234-123456789abc',
        enableMFA: true,
        enableConditionalAccess: true
      }
    },
    {
      id: 'google',
      name: 'Google Workspace',
      icon: GoogleLogo,
      status: 'configured',
      users: 234,
      lastSync: '2024-01-15T09:15:00Z',
      config: {
        clientId: '123456789012-abcdefghijklmnopqrstuvwxyz123456.apps.googleusercontent.com',
        hostedDomain: 'company.com',
        enableHd: true
      }
    },
    {
      id: 'okta',
      name: 'Okta',
      icon: Shield,
      status: 'inactive',
      users: 0,
      lastSync: null,
      config: {
        domain: 'company.okta.com',
        clientId: 'abcd1234efgh5678ijkl'
      }
    }
  ])

  const [selectedProvider, setSelectedProvider] = useState<string | null>(null)
  const [testResults, setTestResults] = useState<Record<string, any>>({})

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200'
      case 'configured': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'testing': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'error': return 'bg-red-100 text-red-800 border-red-200'
      case 'inactive': return 'bg-gray-100 text-gray-800 border-gray-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle size={16} className="text-green-600" />
      case 'configured': return <Gear size={16} className="text-blue-600" />
      case 'testing': return <Play size={16} className="text-yellow-600" />
      case 'error': return <XCircle size={16} className="text-red-600" />
      case 'inactive': return <Pause size={16} className="text-gray-600" />
      default: return <Clock size={16} className="text-gray-600" />
    }
  }

  const toggleProvider = (providerId: string) => {
    setSSOProviders(currentProviders => 
      currentProviders.map(provider => 
        provider.id === providerId 
          ? { 
              ...provider, 
              status: provider.status === 'active' ? 'configured' : 'active',
              lastSync: provider.status === 'inactive' ? new Date().toISOString() : provider.lastSync
            }
          : provider
      )
    )
  }

  const testProvider = async (providerId: string) => {
    const provider = ssoProviders.find(p => p.id === providerId)
    if (!provider) return

    setSSOProviders(currentProviders => 
      currentProviders.map(p => 
        p.id === providerId ? { ...p, status: 'testing' } : p
      )
    )

    // Simulate test execution
    setTimeout(() => {
      const success = Math.random() > 0.1 // 90% success rate
      setTestResults(prev => ({
        ...prev,
        [providerId]: {
          success,
          timestamp: new Date().toISOString(),
          details: success ? 'All tests passed' : 'Authentication flow failed'
        }
      }))

      setSSOProviders(currentProviders => 
        currentProviders.map(p => 
          p.id === providerId ? { 
            ...p, 
            status: success ? 'active' : 'error',
            lastSync: new Date().toISOString()
          } : p
        )
      )
    }, 3000)
  }

  const formatLastSync = (timestamp: string | null) => {
    if (!timestamp) return 'Never'
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    return `${days}d ago`
  }

  const renderProviderOverview = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {ssoProviders.map((provider) => {
        const Icon = provider.icon
        return (
          <Card key={provider.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Icon size={24} className="text-primary" />
                  <div>
                    <h3 className="font-semibold">{provider.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      {getStatusIcon(provider.status)}
                      <Badge className={getStatusColor(provider.status)}>
                        {provider.status}
                      </Badge>
                    </div>
                  </div>
                </div>
                <Switch
                  checked={provider.status === 'active'}
                  onCheckedChange={() => toggleProvider(provider.id)}
                  disabled={provider.status === 'testing'}
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Active Users</Label>
                  <p className="text-lg font-semibold">{provider.users.toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Last Sync</Label>
                  <p className="text-sm">{formatLastSync(provider.lastSync)}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => testProvider(provider.id)}
                  disabled={provider.status === 'testing'}
                  className="flex-1"
                >
                  {provider.status === 'testing' ? (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 border-2 border-gray-300 border-t-gray-900 mr-2" />
                      Testing...
                    </>
                  ) : (
                    <>
                      <Play size={14} className="mr-2" />
                      Test
                    </>
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedProvider(provider.id)}
                >
                  <Gear size={14} className="mr-2" />
                  Configure
                </Button>
              </div>

              {testResults[provider.id] && (
                <Alert className={testResults[provider.id].success ? "border-green-200" : "border-red-200"}>
                  {testResults[provider.id].success ? (
                    <CheckCircle size={16} className="text-green-600" />
                  ) : (
                    <XCircle size={16} className="text-red-600" />
                  )}
                  <AlertDescription className="text-sm">
                    <div className="font-medium">
                      {testResults[provider.id].success ? 'Test Passed' : 'Test Failed'}
                    </div>
                    <div className="text-muted-foreground">
                      {testResults[provider.id].details}
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )

  const renderUserManagement = () => {
    const activeProviders = ssoProviders.filter(p => p.status === 'active')
    const totalUsers = activeProviders.reduce((sum, p) => sum + p.users, 0)

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                  <p className="text-2xl font-bold">{totalUsers.toLocaleString()}</p>
                </div>
                <Users size={24} className="text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Providers</p>
                  <p className="text-2xl font-bold">{activeProviders.length}</p>
                </div>
                <Shield size={24} className="text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">MFA Enabled</p>
                  <p className="text-2xl font-bold">
                    {ssoProviders.filter(p => p.config.enableMFA).length}
                  </p>
                </div>
                <Lock size={24} className="text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Sync Health</p>
                  <p className="text-2xl font-bold">98.5%</p>
                </div>
                <CheckCircle size={24} className="text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>User Distribution by Provider</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {ssoProviders.map((provider) => {
                const Icon = provider.icon
                const percentage = totalUsers > 0 ? (provider.users / totalUsers) * 100 : 0
                
                return (
                  <div key={provider.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon size={16} />
                        <span className="text-sm font-medium">{provider.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {provider.users} users
                        </Badge>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {percentage.toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderProviderDetails = () => {
    const provider = ssoProviders.find(p => p.id === selectedProvider)
    if (!provider) return null

    const Icon = provider.icon

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon size={24} />
            <div>
              <h2 className="text-xl font-semibold">{provider.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                {getStatusIcon(provider.status)}
                <Badge className={getStatusColor(provider.status)}>
                  {provider.status}
                </Badge>
              </div>
            </div>
          </div>
          <Button variant="outline" onClick={() => setSelectedProvider(null)}>
            Back to Overview
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(provider.config).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <Label className="text-sm capitalize">{key.replace(/([A-Z])/g, ' $1')}</Label>
                  {typeof value === 'boolean' ? (
                    <Switch checked={value} disabled />
                  ) : (
                    <span className="text-sm font-mono bg-muted px-2 py-1 rounded">
                      {key.toLowerCase().includes('secret') ? '••••••••' : value}
                    </span>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Active Users</Label>
                <span className="font-semibold">{provider.users.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm">Last Sync</Label>
                <span className="text-sm">{formatLastSync(provider.lastSync)}</span>
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm">Login Success Rate</Label>
                <span className="text-sm font-semibold text-green-600">99.2%</span>
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm">Average Response Time</Label>
                <span className="text-sm">1.2s</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {testResults[provider.id] && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Latest Test Results</CardTitle>
            </CardHeader>
            <CardContent>
              <Alert className={testResults[provider.id].success ? "border-green-200" : "border-red-200"}>
                {testResults[provider.id].success ? (
                  <CheckCircle size={16} className="text-green-600" />
                ) : (
                  <XCircle size={16} className="text-red-600" />
                )}
                <AlertDescription>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">
                        {testResults[provider.id].success ? 'All Tests Passed' : 'Test Failed'}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {testResults[provider.id].details} • {formatLastSync(testResults[provider.id].timestamp)}
                      </div>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => testProvider(provider.id)}>
                      <Play size={14} className="mr-2" />
                      Retest
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">SSO Management Dashboard</h1>
          <p className="text-muted-foreground">
            Manage enterprise single sign-on providers and user authentication
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Globe size={16} className="mr-2" />
            Global Settings
          </Button>
          <Button>
            <ArrowRight size={16} className="mr-2" />
            Add Provider
          </Button>
        </div>
      </div>

      {selectedProvider ? (
        renderProviderDetails()
      ) : (
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Provider Overview</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="logs">Activity Logs</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {renderProviderOverview()}
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            {renderUserManagement()}
          </TabsContent>

          <TabsContent value="logs" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Activity Logs</CardTitle>
              </CardHeader>
              <CardContent>
                <Alert>
                  <Eye size={16} />
                  <AlertDescription>
                    Activity logs and audit trails will be displayed here. This includes authentication events, configuration changes, and security incidents.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}