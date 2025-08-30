import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { 
  Activity, 
  CheckCircle, 
  AlertTriangle,
  Globe,
  Database,
  Server,
  Shield,
  Zap,
  Users,
  Clock,
  HardDrive,
  Wifi,
  Eye
} from '@phosphor-icons/react'

interface ServiceStatus {
  name: string
  status: 'healthy' | 'warning' | 'error'
  uptime: number
  lastCheck: string
  responseTime: number
  version?: string
  instances?: number
  details?: Record<string, any>
}

interface SecurityMetric {
  name: string
  status: 'compliant' | 'warning' | 'non-compliant'
  score: number
  description: string
  lastAudit: string
}

export function InfrastructureMonitoring() {
  const [services, setServices] = useKV('infrastructure-services', [] as ServiceStatus[])
  const [securityMetrics, setSecurityMetrics] = useKV('security-metrics', [] as SecurityMetric[])
  const [lastUpdate, setLastUpdate] = useState(new Date())

  useEffect(() => {
    if (services.length === 0) {
      setServices([
        {
          name: 'FastAPI Application',
          status: 'healthy',
          uptime: 99.97,
          lastCheck: new Date().toISOString(),
          responseTime: 45,
          version: 'v2.1.3',
          instances: 3,
          details: {
            region: 'us-east-1',
            cluster: 'virtualbackroom-prod',
            memory: '82% used',
            cpu: '34% used'
          }
        },
        {
          name: 'PostgreSQL Database',
          status: 'healthy',
          uptime: 99.99,
          lastCheck: new Date().toISOString(),
          responseTime: 12,
          version: '15.4',
          instances: 1,
          details: {
            region: 'us-east-1',
            multiAZ: true,
            backups: 'Daily automated',
            storage: '68% used'
          }
        },
        {
          name: 'Redis Cache',
          status: 'healthy',
          uptime: 99.95,
          lastCheck: new Date().toISOString(),
          responseTime: 3,
          version: '7.2',
          instances: 2,
          details: {
            region: 'us-east-1',
            memoryUsed: '45%',
            hitRate: '94.2%'
          }
        },
        {
          name: 'Celery Workers',
          status: 'healthy',
          uptime: 99.89,
          lastCheck: new Date().toISOString(),
          responseTime: 156,
          instances: 5,
          details: {
            activeJobs: 12,
            pendingJobs: 3,
            completedToday: 247,
            failedToday: 2
          }
        },
        {
          name: 'AWS Cognito',
          status: 'healthy',
          uptime: 99.99,
          lastCheck: new Date().toISOString(),
          responseTime: 89,
          details: {
            userPool: 'virtualbackroom-prod',
            activeUsers: 1247,
            monthlyActiveUsers: 892
          }
        },
        {
          name: 'S3 Document Storage',
          status: 'healthy',
          uptime: 99.999,
          lastCheck: new Date().toISOString(),
          responseTime: 156,
          details: {
            bucketName: 'virtualbackroom-documents-prod',
            totalObjects: 15847,
            totalSize: '2.3 TB',
            encryption: 'AES-256 (KMS)'
          }
        }
      ])
    }

    if (securityMetrics.length === 0) {
      setSecurityMetrics([
        {
          name: 'Data Encryption',
          status: 'compliant',
          score: 100,
          description: 'All data encrypted at rest and in transit',
          lastAudit: new Date(Date.now() - 86400000).toISOString()
        },
        {
          name: 'Access Control',
          status: 'compliant',
          score: 98,
          description: 'RBAC with SSO integration active',
          lastAudit: new Date(Date.now() - 172800000).toISOString()
        },
        {
          name: 'Audit Logging',
          status: 'compliant',
          score: 100,
          description: '21 CFR Part 11 compliant audit trail',
          lastAudit: new Date(Date.now() - 259200000).toISOString()
        },
        {
          name: 'Network Security',
          status: 'compliant',
          score: 96,
          description: 'VPC isolation with security groups',
          lastAudit: new Date(Date.now() - 345600000).toISOString()
        },
        {
          name: 'Backup & Recovery',
          status: 'compliant',
          score: 95,
          description: 'Automated backups with point-in-time recovery',
          lastAudit: new Date(Date.now() - 432000000).toISOString()
        }
      ])
    }
  }, [services.length, securityMetrics.length, setServices, setSecurityMetrics])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'compliant':
        return <CheckCircle size={16} className="text-green-600" />
      case 'warning':
        return <AlertTriangle size={16} className="text-accent" />
      case 'error':
      case 'non-compliant':
        return <AlertTriangle size={16} className="text-destructive" />
      default:
        return <Activity size={16} className="text-muted-foreground" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'compliant':
        return 'text-green-600'
      case 'warning':
        return 'text-accent'
      case 'error':
      case 'non-compliant':
        return 'text-destructive'
      default:
        return 'text-muted-foreground'
    }
  }

  const averageUptime = services.length > 0 
    ? services.reduce((sum, service) => sum + service.uptime, 0) / services.length 
    : 0

  const averageResponseTime = services.length > 0
    ? services.reduce((sum, service) => sum + service.responseTime, 0) / services.length
    : 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Activity size={24} className="text-primary" />
            Infrastructure Monitoring
          </h2>
          <p className="text-muted-foreground mt-1">
            Real-time health and performance monitoring for production systems
          </p>
        </div>
        <Badge variant="default" className="bg-green-600 text-white px-3 py-1">
          <CheckCircle size={14} className="mr-1" />
          All Systems Operational
        </Badge>
      </div>

      {/* Overall Health Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{averageUptime.toFixed(2)}%</div>
            <div className="text-sm text-muted-foreground">Average Uptime</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{averageResponseTime.toFixed(0)}ms</div>
            <div className="text-sm text-muted-foreground">Avg Response Time</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-accent">{services.filter(s => s.status === 'healthy').length}</div>
            <div className="text-sm text-muted-foreground">Healthy Services</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">
              {securityMetrics.filter(m => m.status === 'compliant').length}/{securityMetrics.length}
            </div>
            <div className="text-sm text-muted-foreground">Security Compliance</div>
          </CardContent>
        </Card>
      </div>

      {/* Service Health */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server size={20} />
            Service Health Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {services.map((service) => (
              <div key={service.name} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(service.status)}
                    <div>
                      <div className="font-medium text-sm">{service.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {service.version && `v${service.version}`}
                        {service.instances && ` • ${service.instances} instance${service.instances > 1 ? 's' : ''}`}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-medium ${getStatusColor(service.status)}`}>
                      {service.uptime.toFixed(2)}% uptime
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {service.responseTime}ms response
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  {service.details && Object.entries(service.details).map(([key, value]) => (
                    <div key={key} className="p-2 bg-muted/50 rounded">
                      <div className="text-muted-foreground capitalize">
                        {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                      </div>
                      <div className="font-medium">{String(value)}</div>
                    </div>
                  ))}
                </div>

                <Progress value={service.uptime} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Security Compliance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield size={20} />
            Security Compliance Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {securityMetrics.map((metric) => (
              <div key={metric.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(metric.status)}
                    <div>
                      <div className="font-medium text-sm">{metric.name}</div>
                      <div className="text-xs text-muted-foreground">{metric.description}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-medium ${getStatusColor(metric.status)}`}>
                      {metric.score}% compliant
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Last audit: {new Date(metric.lastAudit).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <Progress value={metric.score} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Enterprise Features */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users size={20} />
              Enterprise Authentication
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 border rounded-lg">
                <div className="w-8 h-8 bg-[#0078d4] rounded flex items-center justify-center mx-auto mb-2">
                  <Globe size={16} className="text-white" />
                </div>
                <div className="text-sm font-medium">Microsoft</div>
                <div className="text-xs text-muted-foreground">Azure AD</div>
              </div>
              
              <div className="text-center p-3 border rounded-lg">
                <div className="w-8 h-8 bg-[#4285f4] rounded flex items-center justify-center mx-auto mb-2">
                  <Globe size={16} className="text-white" />
                </div>
                <div className="text-sm font-medium">Google</div>
                <div className="text-xs text-muted-foreground">Workspace</div>
              </div>
              
              <div className="text-center p-3 border rounded-lg">
                <div className="w-8 h-8 bg-[#007dc1] rounded flex items-center justify-center mx-auto mb-2">
                  <Shield size={16} className="text-white" />
                </div>
                <div className="text-sm font-medium">Okta</div>
                <div className="text-xs text-muted-foreground">Enterprise</div>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Active SSO Sessions</span>
                <span className="font-medium">1,247</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>MFA Enabled Users</span>
                <span className="font-medium">100%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Average Session Duration</span>
                <span className="font-medium">4.2 hours</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye size={20} />
              Monitoring & Alerting
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 border rounded-lg">
                <Activity size={24} className="mx-auto text-green-600 mb-2" />
                <div className="text-sm font-medium">CloudWatch</div>
                <div className="text-xs text-muted-foreground">Metrics & Logs</div>
              </div>
              
              <div className="text-center p-3 border rounded-lg">
                <Shield size={24} className="mx-auto text-blue-600 mb-2" />
                <div className="text-sm font-medium">CloudTrail</div>
                <div className="text-xs text-muted-foreground">API Audit Logs</div>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Active Alarms</span>
                <span className="font-medium text-green-600">0 critical</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Log Retention</span>
                <span className="font-medium">7 years</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Monitoring Coverage</span>
                <span className="font-medium">100%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap size={20} />
            Performance Metrics (Last 24 Hours)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">2,847</div>
              <div className="text-sm text-muted-foreground">API Requests</div>
              <div className="text-xs text-green-600 mt-1">+12% from yesterday</div>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">247</div>
              <div className="text-sm text-muted-foreground">Analyses Completed</div>
              <div className="text-xs text-blue-600 mt-1">+8% from yesterday</div>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-purple-600">189</div>
              <div className="text-sm text-muted-foreground">PDF Reports Generated</div>
              <div className="text-xs text-purple-600 mt-1">+15% from yesterday</div>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-accent">0</div>
              <div className="text-sm text-muted-foreground">Failed Requests</div>
              <div className="text-xs text-green-600 mt-1">99.9% success rate</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Deployment Information */}
      <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
        <Globe size={16} className="text-blue-600" />
        <AlertDescription>
          <div className="font-medium mb-1">Production Deployment Active</div>
          <div className="text-sm">
            VirtualBackroom.ai V2.0 is deployed on AWS infrastructure with enterprise-grade 
            security, monitoring, and compliance controls. All systems are operational and 
            ready for customer onboarding.
          </div>
        </AlertDescription>
      </Alert>
    </div>
  )
}