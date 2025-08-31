import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import {
  Activity,
  ArrowsClockwise,
  Brain,
  CheckCircle,
  Clock,
  CloudArrowUp,
  Gauge,
  Lightning,
  ListChecks,
  MagnifyingGlass,
  Network,
  Plus,
  Scales,
  Shield,
  Timer,
  Warning,
  X
} from '@phosphor-icons/react'

interface AIEndpoint {
  id: string
  name: string
  provider: string
  model: string
  status: 'active' | 'maintenance' | 'overloaded' | 'error'
  region: string
  latency: number
  throughput: number
  cost: number
  reliability: number
  load: number
  maxLoad: number
  queue: number
  capabilities: string[]
}

interface ProcessingJob {
  id: string
  documentId: string
  documentName: string
  regulation: string
  status: 'queued' | 'processing' | 'completed' | 'failed'
  assignedEndpoint?: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  startTime?: Date
  endTime?: Date
  retries: number
  maxRetries: number
  estimatedDuration: number
  actualDuration?: number
}

interface LoadBalancingRule {
  id: string
  name: string
  type: 'round-robin' | 'least-connections' | 'weighted-round-robin' | 'performance-based' | 'cost-optimized'
  enabled: boolean
  weight?: number
  criteria?: string
  conditions: string[]
}

export function DistributedProcessingEngine() {
  const [activeTab, setActiveTab] = useState('overview')
  const [endpoints, setEndpoints] = useKV('ai-endpoints', JSON.stringify([
    {
      id: 'openai-gpt4-us',
      name: 'OpenAI GPT-4 Turbo (US)',
      provider: 'OpenAI',
      model: 'gpt-4-1106-preview',
      status: 'active',
      region: 'us-east-1',
      latency: 120,
      throughput: 85,
      cost: 0.03,
      reliability: 99.8,
      load: 67,
      maxLoad: 100,
      queue: 12,
      capabilities: ['text-analysis', 'regulatory-compliance', 'document-processing']
    },
    {
      id: 'openai-gpt4-eu',
      name: 'OpenAI GPT-4 Turbo (EU)',
      provider: 'OpenAI',
      model: 'gpt-4-1106-preview',
      status: 'active',
      region: 'eu-west-1',
      latency: 95,
      throughput: 92,
      cost: 0.032,
      reliability: 99.7,
      load: 45,
      maxLoad: 100,
      queue: 8,
      capabilities: ['text-analysis', 'regulatory-compliance', 'document-processing']
    },
    {
      id: 'anthropic-claude-us',
      name: 'Anthropic Claude 3 Opus (US)',
      provider: 'Anthropic',
      model: 'claude-3-opus-20240229',
      status: 'active',
      region: 'us-west-2',
      latency: 150,
      throughput: 78,
      cost: 0.075,
      reliability: 99.9,
      load: 34,
      maxLoad: 100,
      queue: 3,
      capabilities: ['text-analysis', 'regulatory-compliance', 'complex-reasoning']
    },
    {
      id: 'google-gemini-us',
      name: 'Google Gemini Pro (US)',
      provider: 'Google',
      model: 'gemini-pro',
      status: 'active',
      region: 'us-central1',
      latency: 110,
      throughput: 88,
      cost: 0.025,
      reliability: 99.6,
      load: 56,
      maxLoad: 100,
      queue: 7,
      capabilities: ['text-analysis', 'multimodal', 'regulatory-compliance']
    },
    {
      id: 'azure-gpt4-eu',
      name: 'Azure OpenAI GPT-4 (EU)',
      provider: 'Microsoft Azure',
      model: 'gpt-4',
      status: 'active',
      region: 'westeurope',
      latency: 85,
      throughput: 81,
      cost: 0.028,
      reliability: 99.5,
      load: 72,
      maxLoad: 100,
      queue: 15,
      capabilities: ['text-analysis', 'regulatory-compliance', 'enterprise-grade']
    },
    {
      id: 'grok-x-ai',
      name: 'Grok-1.5 (xAI)',
      provider: 'xAI',
      model: 'grok-1.5',
      status: 'maintenance',
      region: 'us-west-1',
      latency: 200,
      throughput: 65,
      cost: 0.05,
      reliability: 98.9,
      load: 0,
      maxLoad: 100,
      queue: 0,
      capabilities: ['text-analysis', 'real-time-data', 'regulatory-compliance']
    }
  ]))

  const [processingJobs, setProcessingJobs] = useKV('processing-jobs', JSON.stringify([
    {
      id: 'job-001',
      documentId: 'doc-regulatory-001',
      documentName: 'FDA QSR Compliance Checklist.pdf',
      regulation: 'FDA 21 CFR 820',
      status: 'processing',
      assignedEndpoint: 'openai-gpt4-us',
      priority: 'high',
      startTime: new Date(Date.now() - 300000),
      retries: 0,
      maxRetries: 3,
      estimatedDuration: 120000,
    },
    {
      id: 'job-002',
      documentId: 'doc-regulatory-002',
      documentName: 'EU MDR Technical File Requirements.pdf',
      regulation: 'EU MDR 2017/745',
      status: 'queued',
      priority: 'medium',
      retries: 0,
      maxRetries: 3,
      estimatedDuration: 180000,
    },
    {
      id: 'job-003',
      documentId: 'doc-regulatory-003',
      documentName: 'ISO 13485 Internal Audit Protocol.pdf',
      regulation: 'ISO 13485:2016',
      status: 'completed',
      assignedEndpoint: 'anthropic-claude-us',
      priority: 'medium',
      startTime: new Date(Date.now() - 600000),
      endTime: new Date(Date.now() - 420000),
      actualDuration: 180000,
      retries: 0,
      maxRetries: 3,
      estimatedDuration: 150000,
    }
  ]))

  const [loadBalancingRules, setLoadBalancingRules] = useKV('load-balancing-rules', JSON.stringify([
    {
      id: 'rule-001',
      name: 'Performance-Based Routing',
      type: 'performance-based',
      enabled: true,
      criteria: 'latency + throughput + reliability',
      conditions: ['latency < 200ms', 'throughput > 70%', 'reliability > 99%']
    },
    {
      id: 'rule-002',
      name: 'Cost-Optimized Distribution',
      type: 'cost-optimized',
      enabled: true,
      criteria: 'minimize cost per token',
      conditions: ['cost < $0.05', 'availability > 95%']
    },
    {
      id: 'rule-003',
      name: 'Regional Load Balancing',
      type: 'weighted-round-robin',
      enabled: true,
      weight: 0.7,
      criteria: 'distribute by region',
      conditions: ['prefer same region', 'fallback to nearest']
    }
  ]))

  const [isLoadBalancingActive, setIsLoadBalancingActive] = useKV('load-balancing-active', true)
  const [autoScaling, setAutoScaling] = useKV('auto-scaling-enabled', true)
  const [maxConcurrentJobs, setMaxConcurrentJobs] = useKV('max-concurrent-jobs', 25)

  const parsedEndpoints: AIEndpoint[] = JSON.parse(endpoints)
  const parsedJobs: ProcessingJob[] = JSON.parse(processingJobs)
  const parsedRules: LoadBalancingRule[] = JSON.parse(loadBalancingRules)

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      const updatedEndpoints = parsedEndpoints.map(endpoint => ({
        ...endpoint,
        latency: endpoint.latency + (Math.random() - 0.5) * 20,
        throughput: Math.max(0, Math.min(100, endpoint.throughput + (Math.random() - 0.5) * 10)),
        load: endpoint.status === 'active' ? Math.max(0, Math.min(100, endpoint.load + (Math.random() - 0.5) * 15)) : 0,
        queue: endpoint.status === 'active' ? Math.max(0, endpoint.queue + Math.floor((Math.random() - 0.5) * 3)) : 0
      }))
      setEndpoints(JSON.stringify(updatedEndpoints))
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200'
      case 'maintenance': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'overloaded': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'error': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500 text-white'
      case 'high': return 'bg-orange-500 text-white'
      case 'medium': return 'bg-blue-500 text-white'
      case 'low': return 'bg-gray-500 text-white'
      default: return 'bg-gray-400 text-white'
    }
  }

  const handleEndpointToggle = (endpointId: string) => {
    const updated = parsedEndpoints.map(endpoint => {
      if (endpoint.id === endpointId) {
        return {
          ...endpoint,
          status: endpoint.status === 'active' ? 'maintenance' : 'active'
        }
      }
      return endpoint
    })
    setEndpoints(JSON.stringify(updated))
    toast.success(`Endpoint ${endpointId} status updated`)
  }

  const handleJobRetry = (jobId: string) => {
    const updated = parsedJobs.map(job => {
      if (job.id === jobId) {
        return {
          ...job,
          status: 'queued' as const,
          retries: job.retries + 1,
          assignedEndpoint: undefined
        }
      }
      return job
    })
    setProcessingJobs(JSON.stringify(updated))
    toast.success('Job queued for retry')
  }

  const handleRuleToggle = (ruleId: string) => {
    const updated = parsedRules.map(rule => {
      if (rule.id === ruleId) {
        return { ...rule, enabled: !rule.enabled }
      }
      return rule
    })
    setLoadBalancingRules(JSON.stringify(updated))
    toast.success('Load balancing rule updated')
  }

  const activeEndpoints = parsedEndpoints.filter(e => e.status === 'active')
  const totalThroughput = activeEndpoints.reduce((sum, e) => sum + e.throughput, 0)
  const avgLatency = activeEndpoints.reduce((sum, e) => sum + e.latency, 0) / activeEndpoints.length
  const totalQueue = parsedEndpoints.reduce((sum, e) => sum + e.queue, 0)
  const processingJobsCount = parsedJobs.filter(j => j.status === 'processing').length
  const queuedJobsCount = parsedJobs.filter(j => j.status === 'queued').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Distributed AI Processing Engine</h1>
          <p className="text-muted-foreground mt-2">
            Enterprise-scale AI model load balancing and distributed processing
          </p>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => toast.success('Processing metrics exported')}>
            <CloudArrowUp size={16} className="mr-2" />
            Export Metrics
          </Button>
        </div>
      </div>

      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Endpoints</p>
                <p className="text-2xl font-bold">{activeEndpoints.length}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  of {parsedEndpoints.length} total
                </p>
              </div>
              <Network size={24} className="text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Throughput</p>
                <p className="text-2xl font-bold">{Math.round(totalThroughput)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  requests/min across all endpoints
                </p>
              </div>
              <Gauge size={24} className="text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Latency</p>
                <p className="text-2xl font-bold">{Math.round(avgLatency)}ms</p>
                <p className="text-xs text-muted-foreground mt-1">
                  across active endpoints
                </p>
              </div>
              <Timer size={24} className="text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Queue Depth</p>
                <p className="text-2xl font-bold">{totalQueue}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {processingJobsCount} processing, {queuedJobsCount} queued
                </p>
              </div>
              <ListChecks size={24} className="text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Load Balancing Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Scales size={20} />
              Load Balancing Configuration
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="load-balancing"
                  checked={isLoadBalancingActive}
                  onCheckedChange={setIsLoadBalancingActive}
                />
                <Label htmlFor="load-balancing" className="text-sm">
                  Auto Load Balancing
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="auto-scaling"
                  checked={autoScaling}
                  onCheckedChange={setAutoScaling}
                />
                <Label htmlFor="auto-scaling" className="text-sm">
                  Auto Scaling
                </Label>
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="max-concurrent">Max Concurrent Jobs</Label>
                <Input
                  id="max-concurrent"
                  type="number"
                  value={maxConcurrentJobs}
                  onChange={(e) => setMaxConcurrentJobs(parseInt(e.target.value))}
                  min="1"
                  max="100"
                  className="mt-1"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Load Balancing Rules</Label>
                {parsedRules.map((rule) => (
                  <div key={rule.id} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <div className="font-medium">{rule.name}</div>
                      <div className="text-sm text-muted-foreground">{rule.type}</div>
                    </div>
                    <Switch
                      checked={rule.enabled}
                      onCheckedChange={() => handleRuleToggle(rule.id)}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label>System Status</Label>
                <div className="space-y-2 mt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Load Balancing</span>
                    <Badge variant={isLoadBalancingActive ? "default" : "secondary"}>
                      {isLoadBalancingActive ? "Active" : "Disabled"}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Auto Scaling</span>
                    <Badge variant={autoScaling ? "default" : "secondary"}>
                      {autoScaling ? "Enabled" : "Disabled"}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Health Monitoring</span>
                    <Badge variant="default">Active</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Failover Protection</span>
                    <Badge variant="default">Ready</Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="overview">System Overview</TabsTrigger>
          <TabsTrigger value="endpoints">AI Endpoints</TabsTrigger>
          <TabsTrigger value="jobs">Processing Jobs</TabsTrigger>
          <TabsTrigger value="analytics">Performance Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Real-time System Status */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity size={20} />
                  Real-time Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Overall System Load</span>
                      <span>{Math.round(activeEndpoints.reduce((sum, e) => sum + e.load, 0) / activeEndpoints.length)}%</span>
                    </div>
                    <Progress value={activeEndpoints.reduce((sum, e) => sum + e.load, 0) / activeEndpoints.length} />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Queue Utilization</span>
                      <span>{Math.min(100, (totalQueue / maxConcurrentJobs) * 100).toFixed(1)}%</span>
                    </div>
                    <Progress value={Math.min(100, (totalQueue / maxConcurrentJobs) * 100)} />
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{activeEndpoints.length}</div>
                      <div className="text-sm text-muted-foreground">Healthy Endpoints</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{Math.round(avgLatency)}ms</div>
                      <div className="text-sm text-muted-foreground">Avg Response Time</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield size={20} />
                  System Health
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { name: 'Load Balancer', status: 'healthy', uptime: '99.9%' },
                    { name: 'Queue Manager', status: 'healthy', uptime: '99.8%' },
                    { name: 'Health Monitor', status: 'healthy', uptime: '100%' },
                    { name: 'Failover System', status: 'standby', uptime: '100%' }
                  ].map((component) => (
                    <div key={component.name} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          component.status === 'healthy' ? 'bg-green-500' :
                          component.status === 'standby' ? 'bg-blue-500' : 'bg-red-500'
                        }`} />
                        <span className="text-sm">{component.name}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">{component.uptime}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Active Alerts */}
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>System Operational:</strong> All load balancing rules are active. 
              {activeEndpoints.length} endpoints healthy with average latency of {Math.round(avgLatency)}ms.
            </AlertDescription>
          </Alert>
        </TabsContent>

        <TabsContent value="endpoints" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">AI Model Endpoints</h3>
            <Button size="sm">
              <Plus size={16} className="mr-2" />
              Add Endpoint
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {parsedEndpoints.map((endpoint) => (
              <Card key={endpoint.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h4 className="font-semibold">{endpoint.name}</h4>
                        <Badge className={getStatusColor(endpoint.status)}>
                          {endpoint.status}
                        </Badge>
                        <Badge variant="outline">{endpoint.region}</Badge>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-4">
                        <div>
                          <div className="text-sm text-muted-foreground">Latency</div>
                          <div className="font-medium">{Math.round(endpoint.latency)}ms</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Throughput</div>
                          <div className="font-medium">{endpoint.throughput}/min</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Cost</div>
                          <div className="font-medium">${endpoint.cost}/1K tokens</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Reliability</div>
                          <div className="font-medium">{endpoint.reliability}%</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Current Load</div>
                          <div className="font-medium">{endpoint.load}%</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Queue</div>
                          <div className="font-medium">{endpoint.queue} jobs</div>
                        </div>
                      </div>

                      <div className="mb-3">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Load ({endpoint.load}%)</span>
                        </div>
                        <Progress value={endpoint.load} className="h-2" />
                      </div>

                      <div className="flex flex-wrap gap-1 mb-3">
                        {endpoint.capabilities.map((cap) => (
                          <Badge key={cap} variant="secondary" className="text-xs">
                            {cap}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 ml-4">
                      <Button
                        size="sm"
                        variant={endpoint.status === 'active' ? 'destructive' : 'default'}
                        onClick={() => handleEndpointToggle(endpoint.id)}
                      >
                        {endpoint.status === 'active' ? 'Disable' : 'Enable'}
                      </Button>
                      <Button size="sm" variant="outline">
                        Configure
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="jobs" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Processing Jobs Queue</h3>
            <div className="flex gap-2">
              <Button size="sm" variant="outline">
                <MagnifyingGlass size={16} className="mr-2" />
                Filter
              </Button>
              <Button size="sm">
                <Plus size={16} className="mr-2" />
                Add Job
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            {parsedJobs.map((job) => (
              <Card key={job.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-medium">{job.documentName}</h4>
                        <Badge className={getPriorityColor(job.priority)}>
                          {job.priority}
                        </Badge>
                        <Badge variant="outline">{job.regulation}</Badge>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                        <div>
                          <div className="text-muted-foreground">Status</div>
                          <div className="flex items-center gap-1">
                            {job.status === 'processing' && <Clock size={14} className="text-blue-500" />}
                            {job.status === 'completed' && <CheckCircle size={14} className="text-green-500" />}
                            {job.status === 'failed' && <X size={14} className="text-red-500" />}
                            {job.status === 'queued' && <Timer size={14} className="text-orange-500" />}
                            {job.status}
                          </div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Assigned To</div>
                          <div>{job.assignedEndpoint || 'Pending'}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Duration</div>
                          <div>
                            {job.actualDuration 
                              ? `${Math.round(job.actualDuration / 1000)}s`
                              : `Est. ${Math.round(job.estimatedDuration / 1000)}s`
                            }
                          </div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Retries</div>
                          <div>{job.retries}/{job.maxRetries}</div>
                        </div>
                      </div>

                      {job.status === 'processing' && job.startTime && (
                        <div className="mb-2">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Progress</span>
                            <span>{Math.min(100, ((Date.now() - job.startTime.getTime()) / job.estimatedDuration) * 100).toFixed(0)}%</span>
                          </div>
                          <Progress value={Math.min(100, ((Date.now() - job.startTime.getTime()) / job.estimatedDuration) * 100)} className="h-1" />
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 ml-4">
                      {job.status === 'failed' && (
                        <Button size="sm" onClick={() => handleJobRetry(job.id)}>
                          <ArrowsClockwise size={16} className="mr-1" />
                          Retry
                        </Button>
                      )}
                      <Button size="sm" variant="outline">
                        Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Overall Efficiency</span>
                      <span>92.3%</span>
                    </div>
                    <Progress value={92.3} />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Cost Optimization</span>
                      <span>87.1%</span>
                    </div>
                    <Progress value={87.1} />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Load Distribution</span>
                      <span>94.8%</span>
                    </div>
                    <Progress value={94.8} />
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-green-600">24.7s</div>
                      <div className="text-sm text-muted-foreground">Avg Job Time</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-600">99.2%</div>
                      <div className="text-sm text-muted-foreground">Success Rate</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cost Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">$247.83</div>
                    <div className="text-sm text-muted-foreground">Total Monthly Cost</div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    {[
                      { provider: 'OpenAI (US)', cost: 89.45, percentage: 36.1 },
                      { provider: 'OpenAI (EU)', cost: 67.32, percentage: 27.2 },
                      { provider: 'Anthropic', cost: 45.67, percentage: 18.4 },
                      { provider: 'Google', cost: 32.18, percentage: 13.0 },
                      { provider: 'Azure', cost: 13.21, percentage: 5.3 }
                    ].map((item) => (
                      <div key={item.provider}>
                        <div className="flex justify-between text-sm mb-1">
                          <span>{item.provider}</span>
                          <span>${item.cost}</span>
                        </div>
                        <Progress value={item.percentage} className="h-1" />
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Load Balancing Efficiency</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">8.3ms</div>
                  <div className="text-sm text-muted-foreground">Routing Overhead</div>
                  <div className="text-xs text-green-600 mt-1">-15% from baseline</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">847</div>
                  <div className="text-sm text-muted-foreground">Jobs Processed Today</div>
                  <div className="text-xs text-blue-600 mt-1">+23% from yesterday</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">12.4</div>
                  <div className="text-sm text-muted-foreground">Avg Queue Time (s)</div>
                  <div className="text-xs text-purple-600 mt-1">-31% from last week</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}