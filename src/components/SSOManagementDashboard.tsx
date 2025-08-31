import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'
import { 
  CheckCircle, 
  AlertTriangle, 
  MoreVertical, 
  Shield, 
  Play,
  Pause,
  Trash,
  Edit,
  Eye,
  Plus,
  Building,
  Globe,
  Clock,
  Users,
  Activity
} from '@phosphor-icons/react'
import { SSOProviderWizard } from './SSOProviderWizard'

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
  status: 'draft' | 'testing' | 'active' | 'error' | 'disabled'
  lastTested?: string
  errorMessage?: string
  createdAt?: string
  usageStats?: {
    totalLogins: number
    lastLogin: string
    activeUsers: number
  }
}

export function SSOManagementDashboard() {
  const [configurations, setConfigurations] = useKV<SSOConfiguration[]>('sso-configurations', [
    // Sample data for demonstration
    {
      provider: 'azure',
      displayName: 'Corporate Microsoft Azure AD',
      clientId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      clientSecret: '***hidden***',
      tenantId: 'company-tenant-id',
      redirectUri: `${window.location.origin}/auth/callback/azure`,
      scopes: ['openid', 'profile', 'email', 'User.Read'],
      status: 'active',
      lastTested: new Date(Date.now() - 86400000).toISOString(),
      createdAt: new Date(Date.now() - 604800000).toISOString(),
      usageStats: {
        totalLogins: 1247,
        lastLogin: new Date(Date.now() - 3600000).toISOString(),
        activeUsers: 89
      }
    },
    {
      provider: 'google',
      displayName: 'Google Workspace',
      clientId: '123456789-abcdefghijk.apps.googleusercontent.com',
      clientSecret: '***hidden***',
      redirectUri: `${window.location.origin}/auth/callback/google`,
      scopes: ['openid', 'profile', 'email'],
      status: 'active',
      lastTested: new Date(Date.now() - 172800000).toISOString(),
      createdAt: new Date(Date.now() - 1209600000).toISOString(),
      usageStats: {
        totalLogins: 542,
        lastLogin: new Date(Date.now() - 7200000).toISOString(),
        activeUsers: 34
      }
    },
    {
      provider: 'okta',
      displayName: 'Okta Enterprise',
      clientId: '0oa1b2c3d4e5f6g7h8i9',
      clientSecret: '***hidden***',
      domain: 'company.okta.com',
      redirectUri: `${window.location.origin}/auth/callback/okta`,
      scopes: ['openid', 'profile', 'email'],
      status: 'error',
      lastTested: new Date(Date.now() - 432000000).toISOString(),
      errorMessage: 'Invalid client credentials',
      createdAt: new Date(Date.now() - 2592000000).toISOString(),
      usageStats: {
        totalLogins: 0,
        lastLogin: '',
        activeUsers: 0
      }
    }
  ])
  
  const [showWizard, setShowWizard] = useState(false)
  const [selectedConfig, setSelectedConfig] = useState<SSOConfiguration | null>(null)

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'azure': return <Building size={20} className="text-blue-600" />
      case 'google': return <Globe size={20} className="text-red-500" />
      case 'okta': return <Shield size={20} className="text-blue-500" />
      default: return <Shield size={20} />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'default'
      case 'testing': return 'secondary'
      case 'draft': return 'outline'
      case 'error': return 'destructive'
      case 'disabled': return 'secondary'
      default: return 'outline'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Active'
      case 'testing': return 'Testing'
      case 'draft': return 'Draft'
      case 'error': return 'Error'
      case 'disabled': return 'Disabled'
      default: return status
    }
  }

  const handleStatusChange = (config: SSOConfiguration, newStatus: string) => {
    setConfigurations(prev => prev.map(c => 
      c.clientId === config.clientId 
        ? { ...c, status: newStatus as SSOConfiguration['status'] }
        : c
    ))
  }

  const handleDelete = (config: SSOConfiguration) => {
    if (confirm(`Are you sure you want to delete ${config.displayName}?`)) {
      setConfigurations(prev => prev.filter(c => c.clientId !== config.clientId))
    }
  }

  const testConnection = async (config: SSOConfiguration) => {
    // Simulate connection test
    setConfigurations(prev => prev.map(c => 
      c.clientId === config.clientId 
        ? { ...c, status: 'testing', lastTested: new Date().toISOString() }
        : c
    ))

    setTimeout(() => {
      const success = Math.random() > 0.3
      setConfigurations(prev => prev.map(c => 
        c.clientId === config.clientId 
          ? { 
              ...c, 
              status: success ? 'active' : 'error',
              errorMessage: success ? undefined : 'Connection test failed'
            }
          : c
      ))
    }, 2000)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatTime = (dateString: string) => {
    if (!dateString) return 'Never'
    const now = new Date()
    const date = new Date(dateString)
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${Math.round(diffInHours)} hours ago`
    if (diffInHours < 168) return `${Math.round(diffInHours / 24)} days ago`
    return formatDate(dateString)
  }

  if (showWizard) {
    return (
      <div>
        <div className="mb-6">
          <Button variant="outline" onClick={() => setShowWizard(false)}>
            ← Back to Dashboard
          </Button>
        </div>
        <SSOProviderWizard />
      </div>
    )
  }

  const activeProviders = configurations.filter(c => c.status === 'active').length
  const totalLogins = configurations.reduce((sum, c) => sum + (c.usageStats?.totalLogins || 0), 0)
  const activeUsers = configurations.reduce((sum, c) => sum + (c.usageStats?.activeUsers || 0), 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">SSO Management</h1>
          <p className="text-muted-foreground mt-1">
            Configure and manage single sign-on providers for your organization
          </p>
        </div>
        <Button onClick={() => setShowWizard(true)}>
          <Plus size={16} className="mr-2" />
          Add SSO Provider
        </Button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Providers</p>
                <p className="text-2xl font-bold">{activeProviders}</p>
              </div>
              <Shield size={24} className="text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Logins</p>
                <p className="text-2xl font-bold">{totalLogins.toLocaleString()}</p>
              </div>
              <Activity size={24} className="text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Users</p>
                <p className="text-2xl font-bold">{activeUsers}</p>
              </div>
              <Users size={24} className="text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Providers</p>
                <p className="text-2xl font-bold">{configurations.length}</p>
              </div>
              <Building size={24} className="text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Providers List */}
      <Card>
        <CardHeader>
          <CardTitle>SSO Providers</CardTitle>
        </CardHeader>
        <CardContent>
          {configurations.length === 0 ? (
            <div className="text-center py-8">
              <Shield size={48} className="mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No SSO Providers Configured</h3>
              <p className="text-muted-foreground mb-4">
                Get started by adding your first SSO provider
              </p>
              <Button onClick={() => setShowWizard(true)}>
                <Plus size={16} className="mr-2" />
                Add SSO Provider
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {configurations.map((config) => (
                <Card key={config.clientId} className="border">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {getProviderIcon(config.provider)}
                        <div>
                          <h3 className="font-semibold text-lg">{config.displayName}</h3>
                          <p className="text-sm text-muted-foreground">
                            {config.provider === 'azure' && `Tenant: ${config.tenantId}`}
                            {config.provider === 'google' && 'Google Workspace'}
                            {config.provider === 'okta' && `Domain: ${config.domain}`}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <Badge variant={getStatusColor(config.status)}>
                            {config.status === 'active' && <CheckCircle size={12} className="mr-1" />}
                            {config.status === 'error' && <AlertTriangle size={12} className="mr-1" />}
                            {config.status === 'testing' && <Clock size={12} className="mr-1" />}
                            {getStatusText(config.status)}
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">
                            Last tested: {formatTime(config.lastTested || '')}
                          </p>
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              <MoreVertical size={16} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => testConnection(config)}>
                              <Eye size={16} className="mr-2" />
                              Test Connection
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setSelectedConfig(config)}>
                              <Edit size={16} className="mr-2" />
                              Edit Configuration
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {config.status === 'active' ? (
                              <DropdownMenuItem 
                                onClick={() => handleStatusChange(config, 'disabled')}
                              >
                                <Pause size={16} className="mr-2" />
                                Disable
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem 
                                onClick={() => handleStatusChange(config, 'active')}
                              >
                                <Play size={16} className="mr-2" />
                                Enable
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleDelete(config)}
                              className="text-destructive"
                            >
                              <Trash size={16} className="mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    {/* Usage Stats */}
                    <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t">
                      <div>
                        <p className="text-xs text-muted-foreground">Total Logins</p>
                        <p className="font-semibold">{(config.usageStats?.totalLogins || 0).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Active Users</p>
                        <p className="font-semibold">{config.usageStats?.activeUsers || 0}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Last Login</p>
                        <p className="font-semibold">{formatTime(config.usageStats?.lastLogin || '')}</p>
                      </div>
                    </div>

                    {/* Error Message */}
                    {config.status === 'error' && config.errorMessage && (
                      <Alert className="mt-4 border-destructive">
                        <AlertTriangle size={16} />
                        <AlertDescription>
                          <strong>Configuration Error:</strong> {config.errorMessage}
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}