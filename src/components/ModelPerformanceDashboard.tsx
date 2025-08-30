import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Activity, 
  TrendUp, 
  TrendDown, 
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
  Zap,
  Target,
  BarChart3,
  LineChart,
  RefreshCw
} from '@phosphor-icons/react'
import { toast } from 'sonner'

interface ModelMetrics {
  modelName: string
  timestamp: string
  accuracy: number
  latency: number
  cost: number
  throughput: number
  errorRate: number
  userSatisfaction: number
}

interface PerformanceAlert {
  id: string
  modelName: string
  alertType: 'performance' | 'cost' | 'availability' | 'accuracy'
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  timestamp: string
  resolved: boolean
}

interface BenchmarkResult {
  regulation: string
  modelComparison: {
    modelName: string
    score: number
    rank: number
    improvement: number
  }[]
  lastRun: string
  goldStandardAccuracy: number
}

export function ModelPerformanceDashboard() {
  const [refreshInterval, setRefreshInterval] = useState(30) // seconds
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [lastRefresh, setLastRefresh] = useState(new Date())
  
  const [liveMetrics, setLiveMetrics] = useKV('live-model-metrics', [] as ModelMetrics[])
  const [performanceAlerts, setPerformanceAlerts] = useKV('performance-alerts', [] as PerformanceAlert[])
  const [benchmarkResults, setBenchmarkResults] = useKV('benchmark-results', [] as BenchmarkResult[])

  // Simulate live metrics updates
  useEffect(() => {
    const generateMetrics = () => {
      const models = ['GPT-4o', 'Claude-3 Sonnet', 'GPT-4o Mini', 'Gemini Pro']
      const newMetrics: ModelMetrics[] = models.map(model => ({
        modelName: model,
        timestamp: new Date().toISOString(),
        accuracy: 85 + Math.random() * 12, // 85-97%
        latency: 2 + Math.random() * 8, // 2-10 seconds
        cost: 20 + Math.random() * 80, // $0.20-$1.00
        throughput: 50 + Math.random() * 100, // 50-150 analyses/hour
        errorRate: Math.random() * 5, // 0-5%
        userSatisfaction: 3.5 + Math.random() * 1.5 // 3.5-5.0
      }))
      
      setLiveMetrics(newMetrics)
      setLastRefresh(new Date())
    }

    // Initialize data
    if (liveMetrics.length === 0) {
      generateMetrics()
    }

    // Set up auto-refresh
    if (autoRefresh) {
      const interval = setInterval(generateMetrics, refreshInterval * 1000)
      return () => clearInterval(interval)
    }
  }, [autoRefresh, refreshInterval, liveMetrics.length, setLiveMetrics])

  // Initialize alerts and benchmarks
  useEffect(() => {
    if (performanceAlerts.length === 0) {
      setPerformanceAlerts([
        {
          id: 'alert-001',
          modelName: 'GPT-4o Mini',
          alertType: 'accuracy',
          severity: 'medium',
          message: 'Accuracy dropped below 88% threshold for ISO 13485 analysis',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          resolved: false
        },
        {
          id: 'alert-002',
          modelName: 'Claude-3 Sonnet',
          alertType: 'cost',
          severity: 'low',
          message: 'Cost efficiency improved by 15% this week',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          resolved: true
        }
      ])
    }

    if (benchmarkResults.length === 0) {
      setBenchmarkResults([
        {
          regulation: '21 CFR 820',
          modelComparison: [
            { modelName: 'GPT-4o', score: 94.2, rank: 1, improvement: +2.1 },
            { modelName: 'Claude-3 Sonnet', score: 91.7, rank: 2, improvement: +1.3 },
            { modelName: 'Gemini Pro', score: 89.1, rank: 3, improvement: -0.8 },
            { modelName: 'GPT-4o Mini', score: 87.3, rank: 4, improvement: +0.5 }
          ],
          lastRun: new Date(Date.now() - 86400000).toISOString(),
          goldStandardAccuracy: 96.5
        },
        {
          regulation: 'ISO 13485',
          modelComparison: [
            { modelName: 'GPT-4o', score: 92.8, rank: 1, improvement: +1.8 },
            { modelName: 'Claude-3 Sonnet', score: 90.4, rank: 2, improvement: +2.1 },
            { modelName: 'Gemini Pro', score: 88.7, rank: 3, improvement: +1.2 },
            { modelName: 'GPT-4o Mini', score: 85.9, rank: 4, improvement: -1.1 }
          ],
          lastRun: new Date(Date.now() - 172800000).toISOString(),
          goldStandardAccuracy: 95.2
        }
      ])
    }
  }, [performanceAlerts.length, benchmarkResults.length, setPerformanceAlerts, setBenchmarkResults])

  const refreshData = () => {
    // Trigger manual refresh
    setLastRefresh(new Date())
    toast.success('Performance data refreshed')
  }

  const resolveAlert = (alertId: string) => {
    setPerformanceAlerts(prev => 
      prev.map(alert => 
        alert.id === alertId ? { ...alert, resolved: true } : alert
      )
    )
    toast.success('Alert resolved')
  }

  const activeAlerts = performanceAlerts.filter(alert => !alert.resolved)
  const criticalAlerts = activeAlerts.filter(alert => alert.severity === 'critical' || alert.severity === 'high')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Activity size={24} className="text-primary" />
            Model Performance Dashboard
          </h2>
          <p className="text-muted-foreground mt-1">
            Real-time monitoring and benchmarking of AI model performance
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={refreshData}
            className="flex items-center gap-2"
          >
            <RefreshCw size={14} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Alert Banner */}
      {criticalAlerts.length > 0 && (
        <Alert className="border-destructive bg-destructive/5">
          <AlertCircle size={16} className="text-destructive" />
          <AlertDescription>
            <strong>{criticalAlerts.length} critical alert{criticalAlerts.length > 1 ? 's' : ''}</strong> requiring immediate attention.
            Review the Alerts tab for details.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="realtime" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="realtime">Real-time Metrics</TabsTrigger>
          <TabsTrigger value="benchmarks">Benchmarks</TabsTrigger>
          <TabsTrigger value="alerts">Alerts ({activeAlerts.length})</TabsTrigger>
          <TabsTrigger value="optimization">Optimization</TabsTrigger>
        </TabsList>

        <TabsContent value="realtime" className="space-y-6">
          {/* Live Performance Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4">
            {liveMetrics.map((metric) => (
              <Card key={metric.modelName}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">{metric.modelName}</CardTitle>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-xs text-muted-foreground">Live</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <div className="text-muted-foreground">Accuracy</div>
                      <div className="font-medium text-green-600">{metric.accuracy.toFixed(1)}%</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Latency</div>
                      <div className="font-medium">{metric.latency.toFixed(1)}s</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Cost</div>
                      <div className="font-medium">${(metric.cost/100).toFixed(2)}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Satisfaction</div>
                      <div className="font-medium text-blue-600">{metric.userSatisfaction.toFixed(1)}/5</div>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>Throughput</span>
                      <span>{metric.throughput.toFixed(0)}/hr</span>
                    </div>
                    <Progress value={(metric.throughput / 150) * 100} className="h-1" />
                  </div>
                  
                  {metric.errorRate > 2 && (
                    <div className="flex items-center gap-1 text-xs text-destructive">
                      <AlertTriangle size={12} />
                      Error rate: {metric.errorRate.toFixed(1)}%
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Performance Trends */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendUp size={18} className="text-green-600" />
                  Accuracy Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {liveMetrics.map((metric) => (
                    <div key={metric.modelName} className="flex items-center justify-between">
                      <span className="text-sm">{metric.modelName}</span>
                      <div className="flex items-center gap-2">
                        <Progress value={metric.accuracy} className="w-20 h-2" />
                        <span className="text-sm font-medium w-12 text-right">
                          {metric.accuracy.toFixed(1)}%
                        </span>
                        {metric.accuracy >= 90 ? (
                          <TrendUp size={14} className="text-green-600" />
                        ) : (
                          <TrendDown size={14} className="text-destructive" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Zap size={18} className="text-accent" />
                  Performance Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {liveMetrics.map((metric) => {
                    const performanceScore = (
                      (metric.accuracy * 0.4) + 
                      ((10 - metric.latency) * 5 * 0.3) + 
                      ((100 - metric.cost) * 0.2) + 
                      (metric.userSatisfaction * 20 * 0.1)
                    )
                    
                    return (
                      <div key={metric.modelName} className="flex items-center justify-between">
                        <span className="text-sm">{metric.modelName}</span>
                        <div className="flex items-center gap-2">
                          <Progress value={performanceScore} className="w-20 h-2" />
                          <span className="text-sm font-medium w-12 text-right">
                            {performanceScore.toFixed(0)}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <DollarSign size={18} className="text-blue-600" />
                  Cost Efficiency
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {liveMetrics.map((metric) => {
                    const costEfficiency = (metric.accuracy / metric.cost) * 100
                    
                    return (
                      <div key={metric.modelName} className="flex items-center justify-between">
                        <span className="text-sm">{metric.modelName}</span>
                        <div className="flex items-center gap-2">
                          <Progress value={Math.min(100, costEfficiency * 2)} className="w-20 h-2" />
                          <span className="text-sm font-medium w-12 text-right">
                            {costEfficiency.toFixed(1)}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="benchmarks" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {benchmarkResults.map((benchmark) => (
              <Card key={benchmark.regulation}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{benchmark.regulation}</CardTitle>
                    <Badge variant="outline" className="text-xs">
                      {new Date(benchmark.lastRun).toLocaleDateString()}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Gold Standard: {benchmark.goldStandardAccuracy}%
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {benchmark.modelComparison.map((model) => (
                    <div key={model.modelName} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs w-6 h-6 p-0 flex items-center justify-center">
                            {model.rank}
                          </Badge>
                          <span className="text-sm font-medium">{model.modelName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold">{model.score.toFixed(1)}%</span>
                          {model.improvement > 0 ? (
                            <div className="flex items-center gap-1 text-green-600">
                              <TrendUp size={12} />
                              <span className="text-xs">+{model.improvement.toFixed(1)}%</span>
                            </div>
                          ) : model.improvement < 0 ? (
                            <div className="flex items-center gap-1 text-destructive">
                              <TrendDown size={12} />
                              <span className="text-xs">{model.improvement.toFixed(1)}%</span>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">--</span>
                          )}
                        </div>
                      </div>
                      <Progress value={model.score} className="h-2" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          {activeAlerts.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <CheckCircle size={48} className="mx-auto text-green-600 mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">All Systems Operational</h3>
                <p className="text-muted-foreground text-sm">
                  No active performance alerts. All AI models are operating within expected parameters.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {performanceAlerts
                .sort((a, b) => {
                  const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
                  return (severityOrder[b.severity] || 0) - (severityOrder[a.severity] || 0)
                })
                .map((alert) => (
                  <Card key={alert.id} className={alert.resolved ? 'opacity-60' : ''}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge 
                              variant={
                                alert.severity === 'critical' ? 'destructive' :
                                alert.severity === 'high' ? 'destructive' :
                                alert.severity === 'medium' ? 'secondary' : 'outline'
                              }
                              className="text-xs"
                            >
                              {alert.severity.toUpperCase()}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {alert.alertType}
                            </Badge>
                            <span className="text-sm font-medium">{alert.modelName}</span>
                          </div>
                          <p className="text-sm text-foreground mb-2">{alert.message}</p>
                          <div className="text-xs text-muted-foreground">
                            {new Date(alert.timestamp).toLocaleString()}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {alert.resolved ? (
                            <Badge variant="outline" className="text-xs">
                              Resolved
                            </Badge>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => resolveAlert(alert.id)}
                              className="text-xs"
                            >
                              Resolve
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="optimization" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target size={20} />
                  Optimization Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 border border-green-200 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle size={16} className="text-green-600" />
                    <span className="font-medium text-green-800 dark:text-green-200">
                      Cost Optimization Opportunity
                    </span>
                  </div>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Switch 60% of routine analyses to Claude-3 Sonnet to reduce costs by $2,400/month 
                    while maintaining 91%+ accuracy.
                  </p>
                </div>

                <div className="p-4 border border-blue-200 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap size={16} className="text-blue-600" />
                    <span className="font-medium text-blue-800 dark:text-blue-200">
                      Performance Enhancement
                    </span>
                  </div>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    GPT-4o Mini shows improvement in ISO 13485 analysis. Consider promoting 
                    from testing to production for specific use cases.
                  </p>
                </div>

                <div className="p-4 border border-accent/20 bg-accent/5 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 size={16} className="text-accent" />
                    <span className="font-medium text-accent-foreground">
                      Capacity Planning
                    </span>
                  </div>
                  <p className="text-sm text-accent-foreground/80">
                    Current throughput supports 500 analyses/hour. Plan for 2x capacity 
                    increase to handle projected Q2 demand.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart size={20} />
                  Key Performance Indicators
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 border rounded-lg">
                    <div className="text-2xl font-bold text-green-600">99.2%</div>
                    <div className="text-xs text-muted-foreground">System Uptime</div>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">4.7</div>
                    <div className="text-xs text-muted-foreground">Avg User Rating</div>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <div className="text-2xl font-bold text-accent">91.8%</div>
                    <div className="text-xs text-muted-foreground">Avg Accuracy</div>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <div className="text-2xl font-bold text-primary">$0.68</div>
                    <div className="text-xs text-muted-foreground">Avg Cost/Analysis</div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h4 className="text-sm font-medium">SLA Compliance</h4>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>Response Time &lt; 30s</span>
                      <span className="text-green-600">98.5% ✓</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>Accuracy &gt; 85%</span>
                      <span className="text-green-600">96.2% ✓</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>Uptime &gt; 99%</span>
                      <span className="text-green-600">99.2% ✓</span>
                    </div>
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