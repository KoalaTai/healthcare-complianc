import React, { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { 
  Database,
  Shield,
  Users,
  Building,
  FileText,
  Clock,
  Eye,
  AlertTriangle,
  CheckCircle,
  Lock,
  Key,
  Activity,
  Settings,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  Globe,
  Server,
  HardDrives,
  Chart
} from '@phosphor-icons/react'

interface Organization {
  id: string
  name: string
  domain: string
  plan: 'starter' | 'professional' | 'enterprise'
  status: 'active' | 'suspended' | 'trial'
  userCount: number
  documentsCount: number
  analysisCount: number
  storageUsed: number // MB
  storageLimit: number // MB
  createdAt: string
  lastActivity: string
}

interface AuditLogEntry {
  id: string
  organizationId: string
  userId: string
  userName: string
  action: string
  resource: string
  details: string
  ipAddress: string
  userAgent: string
  timestamp: string
  riskLevel: 'low' | 'medium' | 'high'
}

interface TenantMetrics {
  totalOrganizations: number
  activeUsers: number
  totalDocuments: number
  totalAnalyses: number
  storageUsed: number
  systemUptime: number
  apiCalls24h: number
  avgResponseTime: number
}

interface SecurityEvent {
  id: string
  type: 'login_failure' | 'suspicious_activity' | 'data_access' | 'privilege_escalation'
  severity: 'low' | 'medium' | 'high' | 'critical'
  organizationId: string
  userId?: string
  description: string
  timestamp: string
  resolved: boolean
}

export function MultiTenantDashboard() {
  const [organizations, setOrganizations] = useKV('organizations', [] as Organization[])
  const [auditLogs, setAuditLogs] = useKV('audit-logs', [] as AuditLogEntry[])
  const [securityEvents, setSecurityEvents] = useKV('security-events', [] as SecurityEvent[])
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  
  const [metrics] = useKV('tenant-metrics', {
    totalOrganizations: 247,
    activeUsers: 1834,
    totalDocuments: 15672,
    totalAnalyses: 8934,
    storageUsed: 2847.5,
    systemUptime: 99.97,
    apiCalls24h: 45632,
    avgResponseTime: 182
  } as TenantMetrics)

  // Initialize sample data
  useEffect(() => {
    if (organizations.length === 0) {
      const sampleOrgs: Organization[] = [
        {
          id: 'org-1',
          name: 'MedDevice Global Inc.',
          domain: 'meddevice.com',
          plan: 'enterprise',
          status: 'active',
          userCount: 45,
          documentsCount: 892,
          analysisCount: 234,
          storageUsed: 1247.8,
          storageLimit: 5000,
          createdAt: '2024-01-15T10:30:00Z',
          lastActivity: new Date().toISOString()
        },
        {
          id: 'org-2',
          name: 'RegTech Solutions',
          domain: 'regtech.io',
          plan: 'professional',
          status: 'active',
          userCount: 23,
          documentsCount: 456,
          analysisCount: 156,
          storageUsed: 623.4,
          storageLimit: 2000,
          createdAt: '2024-02-01T14:20:00Z',
          lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'org-3',
          name: 'Healthcare Innovators',
          domain: 'healthinnovate.net',
          plan: 'starter',
          status: 'trial',
          userCount: 8,
          documentsCount: 87,
          analysisCount: 23,
          storageUsed: 89.2,
          storageLimit: 500,
          createdAt: '2024-02-10T09:15:00Z',
          lastActivity: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'org-4',
          name: 'Quality Assurance Corp',
          domain: 'qacorp.com',
          plan: 'enterprise',
          status: 'active',
          userCount: 67,
          documentsCount: 1234,
          analysisCount: 456,
          storageUsed: 2156.7,
          storageLimit: 10000,
          createdAt: '2024-01-05T16:45:00Z',
          lastActivity: new Date(Date.now() - 30 * 60 * 1000).toISOString()
        }
      ]
      setOrganizations(sampleOrgs)
    }

    if (auditLogs.length === 0) {
      const sampleLogs: AuditLogEntry[] = [
        {
          id: 'log-1',
          organizationId: 'org-1',
          userId: 'user-1',
          userName: 'John Smith',
          action: 'document_upload',
          resource: 'ISO_13485_QMS_Manual.pdf',
          details: 'Uploaded quality manual for regulatory analysis',
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          timestamp: new Date().toISOString(),
          riskLevel: 'low'
        },
        {
          id: 'log-2',
          organizationId: 'org-2',
          userId: 'user-2',
          userName: 'Sarah Johnson',
          action: 'user_role_change',
          resource: 'user-3',
          details: 'Changed user role from Member to Admin',
          ipAddress: '10.0.0.50',
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          riskLevel: 'high'
        }
      ]
      setAuditLogs(sampleLogs)
    }

    if (securityEvents.length === 0) {
      const sampleEvents: SecurityEvent[] = [
        {
          id: 'sec-1',
          type: 'login_failure',
          severity: 'medium',
          organizationId: 'org-3',
          userId: 'user-5',
          description: 'Multiple failed login attempts detected',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          resolved: false
        },
        {
          id: 'sec-2',
          type: 'suspicious_activity',
          severity: 'high',
          organizationId: 'org-1',
          description: 'Unusual data access pattern detected - accessing multiple organizations',
          timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
          resolved: true
        }
      ]
      setSecurityEvents(sampleEvents)
    }
  }, [organizations, auditLogs, securityEvents, setOrganizations, setAuditLogs, setSecurityEvents])

  const filteredOrganizations = organizations.filter(org => {
    const matchesSearch = org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         org.domain.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === 'all' || org.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'enterprise': return 'text-purple-600 bg-purple-50 border-purple-200'
      case 'professional': return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'starter': return 'text-green-600 bg-green-50 border-green-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-50 border-green-200'
      case 'trial': return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'suspended': return 'text-red-600 bg-red-50 border-red-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-red-600'
      case 'medium': return 'text-orange-600'
      case 'low': return 'text-green-600'
      default: return 'text-gray-600'
    }
  }

  const OrganizationCard = ({ org }: { org: Organization }) => (
    <Card 
      className={`cursor-pointer transition-all hover:shadow-md ${
        selectedOrg?.id === org.id ? 'ring-2 ring-primary' : ''
      }`}
      onClick={() => setSelectedOrg(org)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <AvatarFallback className="bg-primary text-primary-foreground">
                {org.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h4 className="font-semibold text-sm">{org.name}</h4>
              <p className="text-xs text-muted-foreground">{org.domain}</p>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <Badge variant="outline" className={`text-xs ${getPlanColor(org.plan)}`}>
              {org.plan}
            </Badge>
            <Badge variant="outline" className={`text-xs ${getStatusColor(org.status)}`}>
              {org.status}
            </Badge>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span>Storage Usage</span>
            <span>{Math.round(org.storageUsed)}MB / {org.storageLimit}MB</span>
          </div>
          <Progress 
            value={(org.storageUsed / org.storageLimit) * 100} 
            className="h-1"
          />
        </div>

        <div className="flex justify-between items-center mt-3 text-xs">
          <div className="flex gap-3">
            <span className="flex items-center gap-1">
              <Users size={10} />
              {org.userCount}
            </span>
            <span className="flex items-center gap-1">
              <FileText size={10} />
              {org.documentsCount}
            </span>
            <span className="flex items-center gap-1">
              <Activity size={10} />
              {org.analysisCount}
            </span>
          </div>
          <span className="text-muted-foreground">
            {new Date(org.lastActivity).toLocaleDateString()}
          </span>
        </div>
      </CardContent>
    </Card>
  )

  const AuditLogEntry = ({ log }: { log: AuditLogEntry }) => (
    <div className="flex items-center justify-between p-3 border-b last:border-b-0 hover:bg-muted/50">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium text-sm">{log.userName}</span>
          <Badge variant="outline" className={`text-xs ${getRiskLevelColor(log.riskLevel)} border-current`}>
            {log.riskLevel}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mb-1">
          <span className="font-medium">{log.action.replace('_', ' ')}</span> • {log.resource}
        </p>
        <p className="text-xs text-muted-foreground">{log.details}</p>
      </div>
      <div className="text-right text-xs text-muted-foreground ml-4">
        <div>{new Date(log.timestamp).toLocaleDateString()}</div>
        <div>{new Date(log.timestamp).toLocaleTimeString()}</div>
      </div>
    </div>
  )

  const SecurityEventCard = ({ event }: { event: SecurityEvent }) => (
    <Card className={`border-l-4 ${
      event.severity === 'critical' ? 'border-l-red-500' :
      event.severity === 'high' ? 'border-l-orange-500' :
      event.severity === 'medium' ? 'border-l-yellow-500' :
      'border-l-green-500'
    }`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className={
              event.severity === 'critical' ? 'text-red-500' :
              event.severity === 'high' ? 'text-orange-500' :
              event.severity === 'medium' ? 'text-yellow-500' :
              'text-green-500'
            } />
            <Badge variant="outline" className={`text-xs ${
              event.severity === 'critical' ? 'text-red-600 border-red-200' :
              event.severity === 'high' ? 'text-orange-600 border-orange-200' :
              event.severity === 'medium' ? 'text-yellow-600 border-yellow-200' :
              'text-green-600 border-green-200'
            }`}>
              {event.severity}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            {event.resolved ? (
              <CheckCircle size={16} className="text-green-500" />
            ) : (
              <Clock size={16} className="text-orange-500" />
            )}
            <span className="text-xs text-muted-foreground">
              {event.resolved ? 'Resolved' : 'Pending'}
            </span>
          </div>
        </div>
        <h4 className="font-medium text-sm mb-1 capitalize">
          {event.type.replace('_', ' ')}
        </h4>
        <p className="text-sm text-muted-foreground mb-2">{event.description}</p>
        <div className="text-xs text-muted-foreground">
          {new Date(event.timestamp).toLocaleString()}
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b pb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Multi-Tenant Administration</h1>
            <p className="text-muted-foreground mt-2">
              Enterprise-grade tenant isolation, security monitoring, and compliance management
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <Shield size={14} className="mr-1" />
              21 CFR Part 11 Compliant
            </Badge>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              <Database size={14} className="mr-1" />
              {metrics.systemUptime}% Uptime
            </Badge>
          </div>
        </div>
      </div>

      {/* System Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        {[
          { label: 'Organizations', value: metrics.totalOrganizations, icon: Building },
          { label: 'Active Users', value: metrics.activeUsers, icon: Users },
          { label: 'Documents', value: metrics.totalDocuments.toLocaleString(), icon: FileText },
          { label: 'Analyses', value: metrics.totalAnalyses.toLocaleString(), icon: Activity },
          { label: 'Storage', value: `${metrics.storageUsed}GB`, icon: HardDrives },
          { label: 'Uptime', value: `${metrics.systemUptime}%`, icon: Server },
          { label: 'API Calls', value: `${(metrics.apiCalls24h / 1000).toFixed(1)}k`, icon: Globe },
          { label: 'Response', value: `${metrics.avgResponseTime}ms`, icon: Chart }
        ].map((metric, index) => {
          const Icon = metric.icon
          return (
            <Card key={index}>
              <CardContent className="p-4 text-center">
                <Icon size={20} className="mx-auto mb-2 text-primary" />
                <div className="font-bold text-lg">{metric.value}</div>
                <div className="text-xs text-muted-foreground">{metric.label}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Tabs defaultValue="organizations" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="organizations">Organizations</TabsTrigger>
          <TabsTrigger value="audit-logs">Audit Trail</TabsTrigger>
          <TabsTrigger value="security">Security Events</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        <TabsContent value="organizations" className="space-y-4">
          {/* Filters */}
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search organizations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="trial">Trial</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm">
              <Filter size={16} className="mr-2" />
              More Filters
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Organization List */}
            <div className="lg:col-span-2 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredOrganizations.map(org => (
                  <OrganizationCard key={org.id} org={org} />
                ))}
              </div>
            </div>

            {/* Organization Details */}
            <div className="space-y-4">
              {!selectedOrg ? (
                <Card>
                  <CardContent className="flex items-center justify-center h-64">
                    <div className="text-center text-muted-foreground">
                      <Building size={32} className="mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Select an organization to view details</p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building size={20} />
                      Organization Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold">{selectedOrg.name}</h4>
                      <p className="text-sm text-muted-foreground">{selectedOrg.domain}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Plan</div>
                        <Badge variant="outline" className={getPlanColor(selectedOrg.plan)}>
                          {selectedOrg.plan}
                        </Badge>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Status</div>
                        <Badge variant="outline" className={getStatusColor(selectedOrg.status)}>
                          {selectedOrg.status}
                        </Badge>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Users</div>
                        <div className="font-medium">{selectedOrg.userCount}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Documents</div>
                        <div className="font-medium">{selectedOrg.documentsCount}</div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Storage Usage</span>
                        <span>{Math.round(selectedOrg.storageUsed)}MB / {selectedOrg.storageLimit}MB</span>
                      </div>
                      <Progress value={(selectedOrg.storageUsed / selectedOrg.storageLimit) * 100} />
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Created</span>
                        <span>{new Date(selectedOrg.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Last Activity</span>
                        <span>{new Date(selectedOrg.lastActivity).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button size="sm" className="flex-1">
                        <Eye size={14} className="mr-2" />
                        View Details
                      </Button>
                      <Button size="sm" variant="outline">
                        <Settings size={14} />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="audit-logs" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Audit Trail</h3>
              <p className="text-sm text-muted-foreground">
                Complete activity log for 21 CFR Part 11 compliance
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Filter size={14} className="mr-2" />
                Filter
              </Button>
              <Button variant="outline" size="sm">
                <Download size={14} className="mr-2" />
                Export
              </Button>
            </div>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="max-h-[500px] overflow-y-auto">
                {auditLogs.map(log => (
                  <AuditLogEntry key={log.id} log={log} />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Security Events</h3>
              <p className="text-sm text-muted-foreground">
                Real-time security monitoring and threat detection
              </p>
            </div>
            <Badge variant="outline" className="text-red-600 border-red-200">
              <AlertTriangle size={14} className="mr-1" />
              {securityEvents.filter(e => !e.resolved).length} Unresolved
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {securityEvents.map(event => (
              <SecurityEventCard key={event.id} event={event} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-600">
                  <CheckCircle size={20} />
                  21 CFR Part 11
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Electronic Records</span>
                    <CheckCircle size={16} className="text-green-500" />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Electronic Signatures</span>
                    <CheckCircle size={16} className="text-green-500" />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Audit Trail</span>
                    <CheckCircle size={16} className="text-green-500" />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Data Integrity</span>
                    <CheckCircle size={16} className="text-green-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-600">
                  <Shield size={20} />
                  SOC 2 Type II
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Security Controls</span>
                    <CheckCircle size={16} className="text-green-500" />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Availability</span>
                    <CheckCircle size={16} className="text-green-500" />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Confidentiality</span>
                    <CheckCircle size={16} className="text-green-500" />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Processing Integrity</span>
                    <CheckCircle size={16} className="text-green-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-600">
                  <Globe size={20} />
                  GDPR Compliance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Data Encryption</span>
                    <CheckCircle size={16} className="text-green-500" />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Right to Deletion</span>
                    <CheckCircle size={16} className="text-green-500" />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Data Portability</span>
                    <CheckCircle size={16} className="text-green-500" />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Consent Management</span>
                    <CheckCircle size={16} className="text-green-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}