import React, { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Server,
  Cloud,
  Database,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  Globe,
  Shield,
  Zap,
  HardDrives,
  Wifi,
  Eye,
  Settings,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowUp,
  ArrowDown
} from '@phosphor-icons/react'

interface InfrastructureMetrics {
  apiGateway: {
    status: 'healthy' | 'warning' | 'critical'
    requestsPerMinute: number
    avgLatency: number
    errorRate: number
    uptime: number
  }
  ecs: {
    status: 'healthy' | 'warning' | 'critical'
    runningTasks: number
    cpuUtilization: number
    memoryUtilization: number
    desiredCapacity: number
  }
  rds: {
    status: 'healthy' | 'warning' | 'critical'
    connectionCount: number
    cpuUtilization: number
    freeStorage: number
    readLatency: number
    writeLatency: number
  }
  s3: {
    status: 'healthy' | 'warning' | 'critical'
    totalObjects: number
    totalSize: number
    requestsPerMinute: number
    errorRate: number
  }
  cognito: {
    status: 'healthy' | 'warning' | 'critical'
    activeUsers: number
    newSignUps: number
    authSuccessRate: number
    mfaEnabled: number
  }
  celery: {
    status: 'healthy' | 'warning' | 'critical'
    activeWorkers: number
    queueLength: number
    tasksPerMinute: number
    avgProcessingTime: number
  }
}

interface DeploymentStatus {
  environment: 'production' | 'staging' | 'development'
  version: string
  deployedAt: string
  deployedBy: string
  gitCommit: string
  status: 'deployed' | 'deploying' | 'failed' | 'rolling_back'
  health: 'healthy' | 'warning' | 'critical'
}

interface Alert {
  id: string
  service: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  timestamp: string
  status: 'open' | 'acknowledged' | 'resolved'
  runbook?: string
}

export function ProductionMonitoringDashboard() {
  const [metrics, setMetrics] = useKV('infrastructure-metrics', {
    apiGateway: {
      status: 'healthy',
      requestsPerMinute: 245,
      avgLatency: 182,
      errorRate: 0.02,
      uptime: 99.97
    },
    ecs: {
      status: 'healthy',
      runningTasks: 8,
      cpuUtilization: 45.2,
      memoryUtilization: 62.8,
      desiredCapacity: 8
    },
    rds: {
      status: 'healthy',
      connectionCount: 23,
      cpuUtilization: 28.4,
      freeStorage: 847.2,
      readLatency: 1.2,
      writeLatency: 2.8
    },
    s3: {
      status: 'healthy',
      totalObjects: 156432,
      totalSize: 2.4,
      requestsPerMinute: 87,
      errorRate: 0.001
    },
    cognito: {
      status: 'healthy',
      activeUsers: 1847,
      newSignUps: 23,
      authSuccessRate: 99.8,
      mfaEnabled: 89.2
    },
    celery: {
      status: 'warning',
      activeWorkers: 4,
      queueLength: 12,
      tasksPerMinute: 34,
      avgProcessingTime: 45.6
    }
  } as InfrastructureMetrics)

  const [deployments, setDeployments] = useKV('deployments', [
    {
      environment: 'production',
      version: 'v2.0.1',
      deployedAt: '2024-02-15T14:30:00Z',
      deployedBy: 'deploy-bot',
      gitCommit: 'a7b3c9d',
      status: 'deployed',
      health: 'healthy'
    },
    {
      environment: 'staging',
      version: 'v2.0.2-rc1',
      deployedAt: '2024-02-15T16:45:00Z',
      deployedBy: 'john.doe',
      gitCommit: 'f2e8a1b',
      status: 'deployed',
      health: 'healthy'
    }
  ] as DeploymentStatus[])

  const [alerts, setAlerts] = useKV('system-alerts', [
    {
      id: 'alert-1',
      service: 'celery-workers',
      severity: 'medium',
      message: 'Queue length above threshold (12 tasks pending)',
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      status: 'open'
    },
    {
      id: 'alert-2',
      service: 'rds-primary',
      severity: 'low',
      message: 'Read latency slightly elevated (1.2ms avg)',
      timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      status: 'acknowledged'
    }
  ] as Alert[])

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(currentMetrics => ({
        ...currentMetrics,
        apiGateway: {
          ...currentMetrics.apiGateway,
          requestsPerMinute: Math.max(200, currentMetrics.apiGateway.requestsPerMinute + (Math.random() - 0.5) * 20),
          avgLatency: Math.max(150, currentMetrics.apiGateway.avgLatency + (Math.random() - 0.5) * 10)
        },
        ecs: {
          ...currentMetrics.ecs,
          cpuUtilization: Math.max(20, Math.min(80, currentMetrics.ecs.cpuUtilization + (Math.random() - 0.5) * 5))
        },
        celery: {
          ...currentMetrics.celery,
          queueLength: Math.max(0, currentMetrics.celery.queueLength + Math.floor((Math.random() - 0.7) * 3))
        }
      }))
    }, 5000)

    return () => clearInterval(interval)
  }, [setMetrics])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-50 border-green-200'
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'critical': return 'text-red-600 bg-red-50 border-red-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200'
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const ServiceCard = ({ title, status, icon: Icon, metrics: serviceMetrics }: any) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Icon size={16} />
          {title}
        </CardTitle>
        <Badge variant="outline" className={`text-xs ${getStatusColor(status)}`}>
          {status}
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {Object.entries(serviceMetrics).map(([key, value]) => (
            <div key={key} className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </span>
              <span className="font-medium">
                {typeof value === 'number' ? (
                  key.includes('Rate') || key.includes('Utilization') ? 
                    `${value.toFixed(1)}%` :
                  key.includes('Latency') ? 
                    `${value}ms` :
                  key.includes('Size') ? 
                    `${value}TB` :
                  key.includes('Storage') ? 
                    `${value}GB` :
                    value.toLocaleString()
                ) : value}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )

  const AlertCard = ({ alert }: { alert: Alert }) => (
    <Card className={`border-l-4 ${
      alert.severity === 'critical' ? 'border-l-red-500' :
      alert.severity === 'high' ? 'border-l-orange-500' :
      alert.severity === 'medium' ? 'border-l-yellow-500' :
      'border-l-blue-500'
    }`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className={
              alert.severity === 'critical' ? 'text-red-500' :
              alert.severity === 'high' ? 'text-orange-500' :
              alert.severity === 'medium' ? 'text-yellow-500' :
              'text-blue-500'
            } />
            <Badge variant="outline" className={`text-xs ${getSeverityColor(alert.severity)}`}>
              {alert.severity}
            </Badge>
          </div>
          <Badge variant="outline" className={`text-xs ${
            alert.status === 'resolved' ? 'text-green-600 border-green-200' :
            alert.status === 'acknowledged' ? 'text-blue-600 border-blue-200' :
            'text-red-600 border-red-200'
          }`}>
            {alert.status}
          </Badge>
        </div>
        <h4 className="font-medium text-sm mb-1">{alert.service}</h4>
        <p className="text-sm text-muted-foreground mb-2">{alert.message}</p>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{new Date(alert.timestamp).toLocaleString()}</span>
          {alert.runbook && (
            <Button size="sm" variant="ghost" className="h-6 px-2 text-xs">
              View Runbook
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )

  const DeploymentCard = ({ deployment }: { deployment: DeploymentStatus }) => (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${
              deployment.status === 'deployed' ? 'bg-green-500' :
              deployment.status === 'deploying' ? 'bg-blue-500 animate-pulse' :
              deployment.status === 'failed' ? 'bg-red-500' :
              'bg-yellow-500'
            }`} />
            <Badge variant="outline" className={`text-xs capitalize ${
              deployment.environment === 'production' ? 'text-red-600 border-red-200' :
              deployment.environment === 'staging' ? 'text-blue-600 border-blue-200' :
              'text-green-600 border-green-200'
            }`}>
              {deployment.environment}
            </Badge>
          </div>
          <Badge variant="outline" className={`text-xs ${getStatusColor(deployment.health)}`}>
            {deployment.health}
          </Badge>
        </div>
        
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Version</span>
            <span className="font-mono">{deployment.version}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Commit</span>
            <span className="font-mono">{deployment.gitCommit}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Deployed by</span>
            <span>{deployment.deployedBy}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Deployed</span>
            <span>{new Date(deployment.deployedAt).toLocaleDateString()}</span>
          </div>
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
            <h1 className="text-3xl font-bold">Production Infrastructure</h1>
            <p className="text-muted-foreground mt-2">
              Real-time monitoring and operational status for VirtualBackroom.ai V2.0
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <CheckCircle size={14} className="mr-1" />
              All Systems Operational
            </Badge>
            <Button variant="outline" size="sm">
              <RefreshCw size={14} className="mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* System Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Globe size={20} className="mx-auto mb-2 text-green-600" />
            <div className="font-bold text-lg text-green-600">99.97%</div>
            <div className="text-xs text-muted-foreground">Uptime</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Activity size={20} className="mx-auto mb-2 text-blue-600" />
            <div className="font-bold text-lg">{metrics.apiGateway.requestsPerMinute}</div>
            <div className="text-xs text-muted-foreground">Requests/min</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Clock size={20} className="mx-auto mb-2 text-purple-600" />
            <div className="font-bold text-lg">{metrics.apiGateway.avgLatency}ms</div>
            <div className="text-xs text-muted-foreground">Avg Latency</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Users size={20} className="mx-auto mb-2 text-orange-600" />
            <div className="font-bold text-lg">{metrics.cognito.activeUsers}</div>
            <div className="text-xs text-muted-foreground">Active Users</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Server size={20} className="mx-auto mb-2 text-indigo-600" />
            <div className="font-bold text-lg">{metrics.ecs.runningTasks}</div>
            <div className="text-xs text-muted-foreground">ECS Tasks</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <HardDrives size={20} className="mx-auto mb-2 text-teal-600" />
            <div className="font-bold text-lg">{metrics.s3.totalSize}TB</div>
            <div className="text-xs text-muted-foreground">Storage</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="infrastructure" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="infrastructure">Infrastructure</TabsTrigger>
          <TabsTrigger value="deployments">Deployments</TabsTrigger>
          <TabsTrigger value="alerts">
            Alerts ({alerts.filter(a => a.status === 'open').length})
          </TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="infrastructure" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ServiceCard
              title="API Gateway"
              status={metrics.apiGateway.status}
              icon={Globe}
              metrics={{
                'Requests/min': metrics.apiGateway.requestsPerMinute,
                'Avg Latency': `${metrics.apiGateway.avgLatency}ms`,
                'Error Rate': `${(metrics.apiGateway.errorRate * 100).toFixed(2)}%`,
                'Uptime': `${metrics.apiGateway.uptime}%`
              }}
            />

            <ServiceCard
              title="ECS Fargate"
              status={metrics.ecs.status}
              icon={Server}
              metrics={{
                'Running Tasks': metrics.ecs.runningTasks,
                'Desired Capacity': metrics.ecs.desiredCapacity,
                'CPU Utilization': `${metrics.ecs.cpuUtilization}%`,
                'Memory Utilization': `${metrics.ecs.memoryUtilization}%`
              }}
            />

            <ServiceCard
              title="RDS PostgreSQL"
              status={metrics.rds.status}
              icon={Database}
              metrics={{
                'Connections': metrics.rds.connectionCount,
                'CPU Utilization': `${metrics.rds.cpuUtilization}%`,
                'Free Storage': `${metrics.rds.freeStorage}GB`,
                'Read Latency': `${metrics.rds.readLatency}ms`,
                'Write Latency': `${metrics.rds.writeLatency}ms`
              }}
            />

            <ServiceCard
              title="S3 Storage"
              status={metrics.s3.status}
              icon={HardDrives}
              metrics={{
                'Total Objects': metrics.s3.totalObjects.toLocaleString(),
                'Total Size': `${metrics.s3.totalSize}TB`,
                'Requests/min': metrics.s3.requestsPerMinute,
                'Error Rate': `${(metrics.s3.errorRate * 100).toFixed(3)}%`
              }}
            />

            <ServiceCard
              title="Cognito Auth"
              status={metrics.cognito.status}
              icon={Shield}
              metrics={{
                'Active Users': metrics.cognito.activeUsers.toLocaleString(),
                'New Sign-ups': metrics.cognito.newSignUps,
                'Auth Success Rate': `${metrics.cognito.authSuccessRate}%`,
                'MFA Enabled': `${metrics.cognito.mfaEnabled}%`
              }}
            />

            <ServiceCard
              title="Celery Workers"
              status={metrics.celery.status}
              icon={Zap}
              metrics={{
                'Active Workers': metrics.celery.activeWorkers,
                'Queue Length': metrics.celery.queueLength,
                'Tasks/min': metrics.celery.tasksPerMinute,
                'Avg Processing': `${metrics.celery.avgProcessingTime}s`
              }}
            />
          </div>
        </TabsContent>

        <TabsContent value="deployments" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Environment Status</h3>
              <p className="text-sm text-muted-foreground">
                Current deployment status across all environments
              </p>
            </div>
            <Button size="sm">
              <ArrowUp size={14} className="mr-2" />
              Deploy to Production
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {deployments.map((deployment, index) => (
              <DeploymentCard key={index} deployment={deployment} />
            ))}
          </div>

          {/* Recent Deployments */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Deployments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  {
                    version: 'v2.0.1',
                    environment: 'production',
                    timestamp: '2024-02-15T14:30:00Z',
                    status: 'success',
                    duration: '3m 24s'
                  },
                  {
                    version: 'v2.0.0',
                    environment: 'production',
                    timestamp: '2024-02-10T09:15:00Z',
                    status: 'success',
                    duration: '2m 56s'
                  },
                  {
                    version: 'v1.9.8',
                    environment: 'production',
                    timestamp: '2024-02-05T16:42:00Z',
                    status: 'success',
                    duration: '4m 12s'
                  }
                ].map((deployment, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        deployment.status === 'success' ? 'bg-green-500' : 'bg-red-500'
                      }`} />
                      <div>
                        <div className="font-medium text-sm">
                          {deployment.version} → {deployment.environment}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(deployment.timestamp).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {deployment.duration}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">System Alerts</h3>
              <p className="text-sm text-muted-foreground">
                Active monitoring alerts and incidents
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Settings size={14} className="mr-2" />
                Alert Rules
              </Button>
              <Button variant="outline" size="sm">
                <Eye size={14} className="mr-2" />
                View All
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {alerts.map(alert => (
              <AlertCard key={alert.id} alert={alert} />
            ))}
          </div>

          {alerts.length === 0 && (
            <Card>
              <CardContent className="flex items-center justify-center h-32">
                <div className="text-center text-muted-foreground">
                  <CheckCircle size={32} className="mx-auto mb-2 opacity-50 text-green-500" />
                  <p className="text-sm">No active alerts</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Response Time Chart Placeholder */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp size={16} />
                  API Response Times
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-32 flex items-center justify-center bg-muted/20 rounded border-2 border-dashed">
                  <div className="text-center text-muted-foreground">
                    <Activity size={24} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Response time chart would display here</p>
                    <p className="text-xs">Current avg: {metrics.apiGateway.avgLatency}ms</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Throughput Chart Placeholder */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe size={16} />
                  Request Throughput
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-32 flex items-center justify-center bg-muted/20 rounded border-2 border-dashed">
                  <div className="text-center text-muted-foreground">
                    <Globe size={24} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Throughput chart would display here</p>
                    <p className="text-xs">Current: {metrics.apiGateway.requestsPerMinute} req/min</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Resource Utilization */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server size={16} />
                  Resource Utilization
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>CPU</span>
                    <span>{metrics.ecs.cpuUtilization}%</span>
                  </div>
                  <Progress value={metrics.ecs.cpuUtilization} />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Memory</span>
                    <span>{metrics.ecs.memoryUtilization}%</span>
                  </div>
                  <Progress value={metrics.ecs.memoryUtilization} />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Database CPU</span>
                    <span>{metrics.rds.cpuUtilization}%</span>
                  </div>
                  <Progress value={metrics.rds.cpuUtilization} />
                </div>
              </CardContent>
            </Card>

            {/* Error Rates */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle size={16} />
                  Error Rates
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">API Gateway</span>
                  <Badge variant="outline" className="text-green-600 border-green-200">
                    {(metrics.apiGateway.errorRate * 100).toFixed(2)}%
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">S3 Storage</span>
                  <Badge variant="outline" className="text-green-600 border-green-200">
                    {(metrics.s3.errorRate * 100).toFixed(3)}%
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Authentication</span>
                  <Badge variant="outline" className="text-green-600 border-green-200">
                    {(100 - metrics.cognito.authSuccessRate).toFixed(1)}%
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}