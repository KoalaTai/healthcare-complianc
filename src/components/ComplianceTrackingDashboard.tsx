import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Shield,
  CheckCircle,
  AlertTriangle,
  Clock,
  FileText,
  Database,
  Key,
  Users,
  Activity,
  TrendUp,
  Download,
  Calendar,
  Globe,
  Server,
  Lock
} from '@phosphor-icons/react'

interface ComplianceStandard {
  id: string
  name: string
  category: 'regulatory' | 'security' | 'privacy' | 'quality'
  status: 'compliant' | 'partial' | 'non-compliant' | 'pending'
  lastAudit: string
  nextReview: string
  controls: number
  implemented: number
  evidence: string[]
  riskLevel: 'low' | 'medium' | 'high'
}

interface AuditTrail {
  id: string
  timestamp: string
  userId: string
  userName: string
  action: string
  resource: string
  details: string
  ipAddress: string
  userAgent: string
  result: 'success' | 'failure' | 'warning'
}

export function ComplianceTrackingDashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d')

  const complianceStandards: ComplianceStandard[] = [
    {
      id: 'cfr-part-11',
      name: '21 CFR Part 11',
      category: 'regulatory',
      status: 'compliant',
      lastAudit: '2024-02-15',
      nextReview: '2024-08-15',
      controls: 12,
      implemented: 12,
      evidence: ['Audit trail system', 'Electronic signatures', 'Access controls', 'System validation'],
      riskLevel: 'low'
    },
    {
      id: 'iso-13485',
      name: 'ISO 13485:2016',
      category: 'quality',
      status: 'compliant',
      lastAudit: '2024-01-30',
      nextReview: '2025-01-30',
      controls: 28,
      implemented: 28,
      evidence: ['QMS documentation', 'Risk management', 'Design controls', 'CAPA system'],
      riskLevel: 'low'
    },
    {
      id: 'hipaa',
      name: 'HIPAA Security Rule',
      category: 'privacy',
      status: 'compliant',
      lastAudit: '2024-03-01',
      nextReview: '2024-09-01',
      controls: 18,
      implemented: 18,
      evidence: ['Data encryption', 'Access controls', 'Audit logs', 'Risk assessment'],
      riskLevel: 'low'
    },
    {
      id: 'gdpr',
      name: 'GDPR',
      category: 'privacy',
      status: 'compliant',
      lastAudit: '2024-02-20',
      nextReview: '2024-08-20',
      controls: 15,
      implemented: 15,
      evidence: ['Privacy policy', 'Data processing records', 'Consent management', 'Data subject rights'],
      riskLevel: 'low'
    },
    {
      id: 'soc2',
      name: 'SOC 2 Type II',
      category: 'security',
      status: 'compliant',
      lastAudit: '2024-03-10',
      nextReview: '2025-03-10',
      controls: 64,
      implemented: 64,
      evidence: ['Security policies', 'Access reviews', 'Incident response', 'Change management'],
      riskLevel: 'low'
    },
    {
      id: 'iso-27001',
      name: 'ISO 27001:2022',
      category: 'security',
      status: 'partial',
      lastAudit: '2024-01-15',
      nextReview: '2024-07-15',
      controls: 93,
      implemented: 87,
      evidence: ['ISMS documentation', 'Risk register', 'Security controls', 'Management review'],
      riskLevel: 'medium'
    }
  ]

  const recentAuditTrail: AuditTrail[] = [
    {
      id: '1',
      timestamp: '2024-03-15T14:32:00Z',
      userId: 'user-123',
      userName: 'Sarah Chen',
      action: 'Document Analysis Initiated',
      resource: 'SOP-QC-001.pdf',
      details: 'FDA 21 CFR 820 gap analysis started',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      result: 'success'
    },
    {
      id: '2',
      timestamp: '2024-03-15T14:30:00Z',
      userId: 'user-456',
      userName: 'Mike Rodriguez',
      action: 'User Role Modified',
      resource: 'user-789',
      details: 'Changed role from Analyst to Quality Manager',
      ipAddress: '10.0.0.50',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      result: 'success'
    },
    {
      id: '3',
      timestamp: '2024-03-15T14:25:00Z',
      userId: 'user-789',
      userName: 'Emma Thompson',
      action: 'Report Downloaded',
      resource: 'analysis-report-456',
      details: 'PDF compliance report downloaded',
      ipAddress: '172.16.0.25',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      result: 'success'
    },
    {
      id: '4',
      timestamp: '2024-03-15T14:20:00Z',
      userId: 'user-999',
      userName: 'System Admin',
      action: 'Login Attempt Failed',
      resource: 'authentication',
      details: 'Invalid credentials - account locked after 3 attempts',
      ipAddress: '203.0.113.45',
      userAgent: 'Mozilla/5.0 (X11; Linux x86_64)',
      result: 'failure'
    }
  ]

  const complianceMetrics = [
    { 
      label: 'Overall Compliance Score',
      value: '96.8%',
      change: '+2.1%',
      trend: 'up',
      icon: Shield,
      color: 'text-green-600'
    },
    { 
      label: 'Active Audit Trails',
      value: '1,247',
      change: '+156',
      trend: 'up',
      icon: FileText,
      color: 'text-blue-600'
    },
    { 
      label: 'Security Controls',
      value: '224/230',
      change: '+6',
      trend: 'up',
      icon: Lock,
      color: 'text-purple-600'
    },
    { 
      label: 'Risk Events (30d)',
      value: '2',
      change: '-8',
      trend: 'down',
      icon: AlertTriangle,
      color: 'text-orange-600'
    }
  ]

  const ComplianceOverview = () => (
    <div className="space-y-6">
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {complianceMetrics.map((metric) => {
          const Icon = metric.icon
          return (
            <Card key={metric.label}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">{metric.label}</p>
                    <p className="text-2xl font-bold text-foreground">{metric.value}</p>
                    <p className={`text-xs ${
                      metric.trend === 'up' ? 'text-green-600' : 
                      metric.trend === 'down' ? 'text-red-600' : 
                      'text-muted-foreground'
                    }`}>
                      {metric.change} vs last month
                    </p>
                  </div>
                  <Icon size={24} className={metric.color} />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Compliance Standards Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield size={20} />
            Compliance Standards Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {complianceStandards.map((standard) => (
              <Card key={standard.id} className={`border ${
                standard.status === 'compliant' ? 'border-green-200 bg-green-50/50' :
                standard.status === 'partial' ? 'border-yellow-200 bg-yellow-50/50' :
                standard.status === 'non-compliant' ? 'border-red-200 bg-red-50/50' :
                'border-gray-200'
              }`}>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm">{standard.name}</h4>
                    <Badge variant={
                      standard.status === 'compliant' ? 'default' :
                      standard.status === 'partial' ? 'secondary' :
                      'destructive'
                    } className="text-xs">
                      {standard.status === 'compliant' ? 'Compliant' :
                       standard.status === 'partial' ? 'Partial' :
                       standard.status === 'non-compliant' ? 'Non-Compliant' :
                       'Pending'}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span>Controls Implemented</span>
                      <span className="font-medium">{standard.implemented}/{standard.controls}</span>
                    </div>
                    <Progress value={(standard.implemented / standard.controls) * 100} className="h-1.5" />
                  </div>

                  <div className="space-y-1 text-xs text-muted-foreground">
                    <div>Last Audit: {new Date(standard.lastAudit).toLocaleDateString()}</div>
                    <div>Next Review: {new Date(standard.nextReview).toLocaleDateString()}</div>
                    <div className="flex items-center gap-1">
                      Risk Level: 
                      <Badge variant="outline" className={`text-xs ${
                        standard.riskLevel === 'low' ? 'text-green-600' :
                        standard.riskLevel === 'medium' ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {standard.riskLevel}
                      </Badge>
                    </div>
                  </div>

                  <div className="pt-2">
                    <Button variant="ghost" size="sm" className="w-full text-xs">
                      <FileText size={12} className="mr-1" />
                      View Evidence
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const AuditTrailTab = () => (
    <div className="space-y-6">
      {/* Audit Trail Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Time Range:</label>
                <select 
                  value={selectedTimeRange}
                  onChange={(e) => setSelectedTimeRange(e.target.value)}
                  className="text-sm border rounded px-2 py-1"
                >
                  <option value="24h">Last 24 Hours</option>
                  <option value="7d">Last 7 Days</option>
                  <option value="30d">Last 30 Days</option>
                  <option value="90d">Last 90 Days</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Event Type:</label>
                <select className="text-sm border rounded px-2 py-1">
                  <option value="all">All Events</option>
                  <option value="auth">Authentication</option>
                  <option value="data">Data Access</option>
                  <option value="admin">Administrative</option>
                  <option value="system">System Events</option>
                </select>
              </div>
            </div>
            <Button variant="outline" size="sm">
              <Download size={14} className="mr-2" />
              Export Audit Log
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Audit Trail Events */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity size={20} />
            Recent Audit Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentAuditTrail.map((event) => (
              <Card key={event.id} className="border-l-4 border-l-blue-500">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{event.action}</span>
                        <Badge variant={
                          event.result === 'success' ? 'default' :
                          event.result === 'warning' ? 'secondary' :
                          'destructive'
                        } className="text-xs">
                          {event.result}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground space-y-1">
                        <div>User: {event.userName} ({event.userId})</div>
                        <div>Resource: {event.resource}</div>
                        <div>Details: {event.details}</div>
                        <div>IP: {event.ipAddress}</div>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground text-right">
                      <div>{new Date(event.timestamp).toLocaleDateString()}</div>
                      <div>{new Date(event.timestamp).toLocaleTimeString()}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const SecurityMonitoringTab = () => (
    <div className="space-y-6">
      {/* Security Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <Lock size={32} className="mx-auto mb-3 text-green-600" />
            <div className="text-2xl font-bold text-green-600">99.9%</div>
            <div className="text-sm text-muted-foreground">Security Score</div>
            <div className="text-xs text-green-600 mt-1">+0.2% this month</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <Shield size={32} className="mx-auto mb-3 text-blue-600" />
            <div className="text-2xl font-bold text-blue-600">0</div>
            <div className="text-sm text-muted-foreground">Critical Vulnerabilities</div>
            <div className="text-xs text-green-600 mt-1">No change</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <Users size={32} className="mx-auto mb-3 text-purple-600" />
            <div className="text-2xl font-bold text-purple-600">98.5%</div>
            <div className="text-sm text-muted-foreground">MFA Adoption</div>
            <div className="text-xs text-green-600 mt-1">+2.1% this month</div>
          </CardContent>
        </Card>
      </div>

      {/* Security Controls Matrix */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database size={20} />
            Security Controls Implementation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { control: 'Access Control & Authentication', implemented: 12, total: 12, critical: true },
              { control: 'Data Encryption & Protection', implemented: 8, total: 8, critical: true },
              { control: 'Audit Logging & Monitoring', implemented: 6, total: 6, critical: true },
              { control: 'Incident Response & Recovery', implemented: 4, total: 5, critical: false },
              { control: 'Vulnerability Management', implemented: 7, total: 8, critical: false },
              { control: 'Security Training & Awareness', implemented: 3, total: 4, critical: false }
            ].map((control, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{control.control}</span>
                    {control.critical && (
                      <Badge variant="destructive" className="text-xs">Critical</Badge>
                    )}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {control.implemented}/{control.total}
                  </span>
                </div>
                <Progress 
                  value={(control.implemented / control.total) * 100} 
                  className={`h-2 ${control.critical ? 'bg-red-100' : ''}`}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Threat Detection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle size={20} />
            Threat Detection & Response
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h5 className="font-medium text-sm">Recent Threats Blocked</h5>
              <div className="space-y-2">
                {[
                  { threat: 'Brute Force Attack', count: 23, blocked: 23, severity: 'high' },
                  { threat: 'Suspicious IP Access', count: 8, blocked: 8, severity: 'medium' },
                  { threat: 'Malformed Requests', count: 156, blocked: 156, severity: 'low' }
                ].map((threat, index) => (
                  <div key={index} className="flex items-center justify-between p-2 border rounded">
                    <div>
                      <div className="text-sm font-medium">{threat.threat}</div>
                      <div className="text-xs text-muted-foreground">
                        {threat.blocked}/{threat.count} blocked
                      </div>
                    </div>
                    <Badge variant={
                      threat.severity === 'high' ? 'destructive' :
                      threat.severity === 'medium' ? 'secondary' :
                      'outline'
                    } className="text-xs">
                      {threat.severity}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <h5 className="font-medium text-sm">Security Alerts (24h)</h5>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span>All security systems operational</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 rounded-full bg-yellow-500" />
                  <span>1 certificate expires in 30 days</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <span>Security policy update available</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const ComplianceReportsTab = () => (
    <div className="space-y-6">
      {/* Report Generation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText size={20} />
            Compliance Reports
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { 
                name: 'SOC 2 Type II Report',
                type: 'Security Audit',
                lastGenerated: '2024-03-10',
                nextDue: '2025-03-10',
                status: 'current'
              },
              { 
                name: '21 CFR Part 11 Compliance Report',
                type: 'Regulatory Audit',
                lastGenerated: '2024-02-15',
                nextDue: '2024-08-15',
                status: 'current'
              },
              { 
                name: 'GDPR Data Processing Report',
                type: 'Privacy Audit',
                lastGenerated: '2024-02-20',
                nextDue: '2024-08-20',
                status: 'current'
              },
              { 
                name: 'ISO 27001 ISMS Report',
                type: 'Security Management',
                lastGenerated: '2024-01-15',
                nextDue: '2024-07-15',
                status: 'due-soon'
              },
              { 
                name: 'HIPAA Security Assessment',
                type: 'Privacy & Security',
                lastGenerated: '2024-03-01',
                nextDue: '2024-09-01',
                status: 'current'
              },
              { 
                name: 'ISO 13485 QMS Report',
                type: 'Quality Management',
                lastGenerated: '2024-01-30',
                nextDue: '2025-01-30',
                status: 'current'
              }
            ].map((report, index) => (
              <Card key={index} className={
                report.status === 'due-soon' ? 'border-yellow-200 bg-yellow-50/50' : ''
              }>
                <CardContent className="p-4 space-y-3">
                  <div>
                    <h4 className="font-medium text-sm">{report.name}</h4>
                    <p className="text-xs text-muted-foreground">{report.type}</p>
                  </div>
                  
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span>Last Generated:</span>
                      <span>{new Date(report.lastGenerated).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Next Due:</span>
                      <span className={report.status === 'due-soon' ? 'text-yellow-600 font-medium' : ''}>
                        {new Date(report.nextDue).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1 text-xs">
                      <Download size={12} className="mr-1" />
                      Download
                    </Button>
                    <Button variant="ghost" size="sm" className="flex-1 text-xs">
                      <Calendar size={12} className="mr-1" />
                      Schedule
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Compliance Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendUp size={20} />
            Compliance Trends & Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Trend Chart Placeholder */}
            <div className="h-64 bg-muted/50 rounded-lg flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <TrendUp size={48} className="mx-auto mb-2" />
                <p className="text-sm">Compliance Score Trends</p>
                <p className="text-xs">Historical compliance metrics visualization</p>
              </div>
            </div>

            {/* Key Insights */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h5 className="font-medium text-sm">Key Insights</h5>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle size={14} className="text-green-600" />
                    <span>Compliance score improved 2.1% this quarter</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle size={14} className="text-green-600" />
                    <span>Zero critical security incidents in 90 days</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <AlertTriangle size={14} className="text-yellow-600" />
                    <span>ISO 27001 review due in 4 months</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle size={14} className="text-green-600" />
                    <span>MFA adoption increased to 98.5%</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h5 className="font-medium text-sm">Recommended Actions</h5>
                <div className="space-y-2">
                  <div className="p-3 border rounded-lg">
                    <div className="text-sm font-medium">Update ISO 27001 Documentation</div>
                    <div className="text-xs text-muted-foreground">
                      Review and update ISMS documentation before July audit
                    </div>
                    <Button variant="outline" size="sm" className="mt-2">
                      <Calendar size={12} className="mr-1" />
                      Schedule Review
                    </Button>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="text-sm font-medium">Complete MFA Rollout</div>
                    <div className="text-xs text-muted-foreground">
                      Target 100% MFA adoption for remaining 1.5% of users
                    </div>
                    <Button variant="outline" size="sm" className="mt-2">
                      <Users size={12} className="mr-1" />
                      View Users
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Shield size={32} />
            Compliance Tracking & Monitoring
          </h1>
          <p className="text-muted-foreground mt-2">
            Real-time compliance monitoring, audit trails, and regulatory reporting
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download size={16} className="mr-2" />
            Export All Reports
          </Button>
          <Button variant="outline">
            <Calendar size={16} className="mr-2" />
            Schedule Audit
          </Button>
          <Button>
            <FileText size={16} className="mr-2" />
            Generate Report
          </Button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Compliance Overview</TabsTrigger>
          <TabsTrigger value="audit-trail">Audit Trail</TabsTrigger>
          <TabsTrigger value="security">Security Monitoring</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <ComplianceOverview />
        </TabsContent>

        <TabsContent value="audit-trail" className="mt-6">
          <AuditTrailTab />
        </TabsContent>

        <TabsContent value="security" className="mt-6">
          <SecurityMonitoringTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}