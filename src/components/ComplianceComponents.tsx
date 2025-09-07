import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { 
  Shield,
  CheckCircle,
  AlertTriangle,
  Clock,
  TrendUp,
  FileText,
  Calendar,
  Award,
  Target,
  Eye,
  Download,
  RefreshCw,
  Bell,
  Activity
} from '@phosphor-icons/react'

export function ComplianceTracker() {
  const [complianceData, setComplianceData] = useKV('vb-compliance-data', JSON.stringify({
    overallScore: 94.7,
    lastUpdated: '2024-01-20',
    standards: [
      {
        id: 'FDA_QSR',
        name: 'FDA QSR 820',
        score: 96,
        status: 'compliant',
        lastAudit: '2024-01-15',
        nextReview: '2024-04-15',
        findings: 2,
        sections: {
          total: 13,
          compliant: 11,
          partial: 2,
          nonCompliant: 0
        }
      },
      {
        id: 'ISO_13485',
        name: 'ISO 13485:2016',
        score: 93,
        status: 'compliant',
        lastAudit: '2024-01-10',
        nextReview: '2024-07-10',
        findings: 3,
        sections: {
          total: 22,
          compliant: 19,
          partial: 3,
          nonCompliant: 0
        }
      },
      {
        id: 'EU_MDR',
        name: 'EU MDR 2017/745',
        score: 89,
        status: 'attention_needed',
        lastAudit: '2024-01-08',
        nextReview: '2024-03-08',
        findings: 5,
        sections: {
          total: 35,
          compliant: 28,
          partial: 6,
          nonCompliant: 1
        }
      }
    ],
    recentFindings: [
      {
        id: 'finding_001',
        standard: 'EU MDR',
        section: 'Article 61 - Clinical Evaluation',
        severity: 'Major',
        title: 'Incomplete Clinical Data Summary',
        description: 'Clinical evaluation report lacks sufficient post-market clinical follow-up data',
        dateIdentified: '2024-01-18',
        dueDate: '2024-02-18',
        status: 'open',
        assignee: 'Clinical Team'
      },
      {
        id: 'finding_002',
        standard: 'FDA QSR',
        section: '820.25 - Personnel',
        severity: 'Minor',
        title: 'Training Record Gaps',
        description: 'Some personnel training records missing for Q4 2023',
        dateIdentified: '2024-01-16',
        dueDate: '2024-02-01',
        status: 'in_progress',
        assignee: 'HR Department'
      }
    ],
    trends: {
      monthlyScores: [91, 92, 93, 94, 94.7],
      complianceByArea: {
        'Quality Management': 95,
        'Design Controls': 93,
        'Risk Management': 96,
        'Clinical Affairs': 89,
        'Manufacturing': 97,
        'Post-Market': 91
      }
    }
  }))

  const compliance = JSON.parse(complianceData)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'attention_needed':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'non_compliant':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'Major':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'Minor':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const refreshCompliance = () => {
    toast.success('Compliance data refreshed')
    // In a real app, this would trigger a re-calculation
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Compliance Tracker</h2>
          <p className="text-muted-foreground">Real-time regulatory compliance monitoring and management</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={refreshCompliance}>
            <RefreshCw size={16} className="mr-2" />
            Refresh
          </Button>
          <Button size="sm">
            <Download size={16} className="mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Compliance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Overall Score</p>
                <p className="text-3xl font-bold text-green-600">{compliance.overallScore}%</p>
              </div>
              <div className="w-16 h-16 relative">
                <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="3"
                  />
                  <path
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="3"
                    strokeDasharray={`${compliance.overallScore}, 100`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Shield size={20} className="text-green-600" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Standards Tracked</p>
                <p className="text-2xl font-bold">{compliance.standards.length}</p>
              </div>
              <FileText size={24} className="text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Open Findings</p>
                <p className="text-2xl font-bold text-orange-600">
                  {compliance.recentFindings.filter((f: any) => f.status === 'open').length}
                </p>
              </div>
              <AlertTriangle size={24} className="text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Last Updated</p>
                <p className="text-sm font-bold">{compliance.lastUpdated}</p>
              </div>
              <Clock size={24} className="text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="standards">Standards</TabsTrigger>
          <TabsTrigger value="findings">Findings</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Compliance by Area */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target size={20} />
                  Compliance by Area
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(compliance.trends.complianceByArea).map(([area, score]: [string, any]) => (
                  <div key={area} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{area}</span>
                      <span className="font-semibold">{score}%</span>
                    </div>
                    <Progress value={score} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity size={20} />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { action: 'FDA QSR audit completed', time: '2 days ago', type: 'success' },
                  { action: 'New finding identified in EU MDR', time: '3 days ago', type: 'warning' },
                  { action: 'Training record updated', time: '5 days ago', type: 'info' },
                  { action: 'ISO 13485 review scheduled', time: '1 week ago', type: 'info' }
                ].map((activity, index) => (
                  <div key={index} className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
                    <div className={`w-2 h-2 rounded-full ${
                      activity.type === 'success' ? 'bg-green-500' :
                      activity.type === 'warning' ? 'bg-yellow-500' :
                      'bg-blue-500'
                    }`} />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.action}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="standards" className="space-y-4">
          {compliance.standards.map((standard: any) => (
            <Card key={standard.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">{standard.name}</h3>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span>Last Audit: {standard.lastAudit}</span>
                      <span>Next Review: {standard.nextReview}</span>
                      <span>{standard.findings} findings</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">{standard.score}%</p>
                      <Badge className={`text-xs ${getStatusColor(standard.status)}`}>
                        {standard.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span>Compliance Progress</span>
                    <span className="font-semibold">{standard.score}%</span>
                  </div>
                  <Progress value={standard.score} className="h-3" />
                  
                  <div className="grid grid-cols-3 gap-4 text-center text-sm">
                    <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">{standard.sections.compliant}</p>
                      <p className="text-green-700 dark:text-green-300">Compliant</p>
                    </div>
                    <div className="p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
                      <p className="text-2xl font-bold text-yellow-600">{standard.sections.partial}</p>
                      <p className="text-yellow-700 dark:text-yellow-300">Partial</p>
                    </div>
                    <div className="p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
                      <p className="text-2xl font-bold text-red-600">{standard.sections.nonCompliant}</p>
                      <p className="text-red-700 dark:text-red-300">Non-Compliant</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="findings" className="space-y-4">
          {compliance.recentFindings.map((finding: any) => (
            <Card key={finding.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold">{finding.title}</h4>
                      <Badge className={`text-xs ${getSeverityColor(finding.severity)}`}>
                        {finding.severity}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{finding.description}</p>
                    <div className="text-xs text-muted-foreground">
                      <span className="font-medium">{finding.standard}</span> • {finding.section}
                    </div>
                  </div>
                  <Badge className={`text-xs ${
                    finding.status === 'open' ? 'bg-red-100 text-red-800' :
                    finding.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {finding.status.replace('_', ' ')}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-dashed">
                  <span>Assigned to: {finding.assignee}</span>
                  <span>Due: {finding.dueDate}</span>
                  <span>Identified: {finding.dateIdentified}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendUp size={20} />
                Compliance Trend (Last 5 Months)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {compliance.trends.monthlyScores.map((score: number, index: number) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Month {index + 1}</span>
                      <span className="font-semibold">{score}%</span>
                    </div>
                    <Progress value={score} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export function UserManagement() {
  const [users, setUsers] = useKV('vb-users', JSON.stringify([
    {
      id: 'user_001',
      name: 'Dr. Sarah Chen',
      email: 'sarah.chen@medtech.com',
      role: 'QA Manager',
      department: 'Quality Assurance',
      status: 'active',
      lastLogin: '2024-01-20',
      permissions: ['audit_simulations', 'compliance_tracking', 'user_management'],
      certifications: ['ASQ CQA', 'RAC (US)']
    },
    {
      id: 'user_002',
      name: 'Mike Johnson',
      email: 'mike.johnson@medtech.com',
      role: 'QA Engineer',
      department: 'Quality Assurance',
      status: 'active',
      lastLogin: '2024-01-19',
      permissions: ['audit_simulations', 'compliance_tracking'],
      certifications: ['ASQ CQE']
    },
    {
      id: 'user_003',
      name: 'Lisa Wong',
      email: 'lisa.wong@medtech.com',
      role: 'Regulatory Specialist',
      department: 'Regulatory Affairs',
      status: 'active',
      lastLogin: '2024-01-18',
      permissions: ['regulatory_knowledge', 'ai_assistant'],
      certifications: ['RAC (US)', 'RAC (EU)']
    }
  ]))

  const userData = JSON.parse(users)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">User Management</h2>
          <p className="text-muted-foreground">Manage platform users, roles, and permissions</p>
        </div>
        <Button>
          <Shield size={16} className="mr-2" />
          Add User
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Users', value: userData.length.toString(), icon: Shield },
          { label: 'Active Users', value: userData.filter((u: any) => u.status === 'active').length.toString(), icon: CheckCircle },
          { label: 'Departments', value: '3', icon: Building },
          { label: 'Roles', value: '5', icon: Award }
        ].map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <Icon size={24} className="text-primary" />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="space-y-4">
        {userData.map((user: any) => (
          <Card key={user.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                    {user.name.split(' ').map((n: string) => n[0]).join('')}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">{user.name}</h3>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm">
                      <span><strong>Role:</strong> {user.role}</span>
                      <span><strong>Department:</strong> {user.department}</span>
                      <span><strong>Last Login:</strong> {user.lastLogin}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      {user.certifications.map((cert: string, index: number) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {cert}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={`text-xs ${
                    user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {user.status}
                  </Badge>
                  <Button variant="outline" size="sm">
                    <Eye size={16} className="mr-2" />
                    View Details
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export function SystemMonitoring() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">System Monitoring</h2>
          <p className="text-muted-foreground">Real-time platform health and performance metrics</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'System Uptime', value: '99.9%', status: 'healthy', icon: CheckCircle },
          { label: 'Active Sessions', value: '247', status: 'healthy', icon: Activity },
          { label: 'Response Time', value: '145ms', status: 'healthy', icon: Clock },
          { label: 'Storage Used', value: '67%', status: 'warning', icon: FileText }
        ].map((metric, index) => {
          const Icon = metric.icon
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{metric.label}</p>
                    <p className="text-2xl font-bold">{metric.value}</p>
                  </div>
                  <Icon 
                    size={24} 
                    className={metric.status === 'healthy' ? 'text-green-600' : 'text-yellow-600'} 
                  />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="text-center py-12 text-muted-foreground">
        <Activity size={48} className="mx-auto mb-4 opacity-50" />
        <h3 className="text-lg font-medium mb-2">System Operating Normally</h3>
        <p>All platform services are running optimally</p>
      </div>
    </div>
  )
}

export function DocumentProcessor() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Document Processor</h2>
          <p className="text-muted-foreground">AI-powered document analysis and compliance checking</p>
        </div>
        <Button>
          <FileText size={16} className="mr-2" />
          Upload Document
        </Button>
      </div>

      <div className="text-center py-12 text-muted-foreground">
        <FileText size={48} className="mx-auto mb-4 opacity-50" />
        <h3 className="text-lg font-medium mb-2">No documents uploaded yet</h3>
        <p>Upload a document to begin AI-powered regulatory analysis</p>
        <Button className="mt-4">
          <FileText size={16} className="mr-2" />
          Get Started
        </Button>
      </div>
    </div>
  )
}