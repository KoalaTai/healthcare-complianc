import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { 
  Shield,
  AlertTriangle,
  TrendUp,
  CheckCircle,
  Plus,
  FileText
} from '@phosphor-icons/react'

interface Risk {
  id: string
  title: string
  description: string
  category: 'technical' | 'compliance' | 'business' | 'security'
  probability: 'low' | 'medium' | 'high'
  impact: 'low' | 'medium' | 'high'
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  mitigationStrategy: string
  owner: string
  status: 'identified' | 'analyzing' | 'mitigating' | 'monitoring' | 'resolved'
  dueDate?: string
}

export function RiskAssessment() {
  const [risks, setRisks] = useKV<Risk[]>('v2-risk-assessment', getDefaultRisks())
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [showAddForm, setShowAddForm] = useState(false)
  const [newRisk, setNewRisk] = useState<Partial<Risk>>({
    category: 'technical',
    probability: 'medium',
    impact: 'medium',
    status: 'identified'
  })

  const categories = ['technical', 'compliance', 'business', 'security']
  
  const filteredRisks = selectedCategory === 'all' 
    ? risks 
    : risks.filter(risk => risk.category === selectedCategory)

  const calculateRiskLevel = (probability: string, impact: string): Risk['riskLevel'] => {
    const riskMatrix: Record<string, Record<string, Risk['riskLevel']>> = {
      low: { low: 'low', medium: 'low', high: 'medium' },
      medium: { low: 'low', medium: 'medium', high: 'high' },
      high: { low: 'medium', medium: 'high', high: 'critical' }
    }
    return riskMatrix[probability][impact]
  }

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-300'
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-300'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      default: return 'bg-green-100 text-green-800 border-green-300'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved': return 'bg-green-100 text-green-800 border-green-300'
      case 'mitigating': return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'monitoring': return 'bg-purple-100 text-purple-800 border-purple-300'
      case 'analyzing': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      default: return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'security': return <Shield size={16} />
      case 'compliance': return <FileText size={16} />
      case 'business': return <TrendUp size={16} />
      default: return <AlertTriangle size={16} />
    }
  }

  const addRisk = () => {
    if (newRisk.title && newRisk.description) {
      const riskLevel = calculateRiskLevel(
        newRisk.probability || 'medium',
        newRisk.impact || 'medium'
      )
      
      const risk: Risk = {
        id: `risk-${Date.now()}`,
        title: newRisk.title,
        description: newRisk.description,
        category: newRisk.category || 'technical',
        probability: newRisk.probability || 'medium',
        impact: newRisk.impact || 'medium',
        riskLevel,
        mitigationStrategy: newRisk.mitigationStrategy || '',
        owner: newRisk.owner || 'Unassigned',
        status: newRisk.status || 'identified'
      }
      
      setRisks(prev => [...prev, risk])
      setNewRisk({
        category: 'technical',
        probability: 'medium',
        impact: 'medium',
        status: 'identified'
      })
      setShowAddForm(false)
    }
  }

  const updateRiskStatus = (id: string, status: Risk['status']) => {
    setRisks(prev => 
      prev.map(risk => risk.id === id ? { ...risk, status } : risk)
    )
  }

  const getCategoryProgress = (category: string) => {
    const categoryRisks = risks.filter(risk => risk.category === category)
    const resolved = categoryRisks.filter(risk => risk.status === 'resolved').length
    return categoryRisks.length > 0 ? Math.round((resolved / categoryRisks.length) * 100) : 0
  }

  const totalProgress = risks.length > 0 
    ? Math.round((risks.filter(r => r.status === 'resolved').length / risks.length) * 100)
    : 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Risk Assessment</h2>
          <p className="text-muted-foreground mt-1">
            Comprehensive risk management for V2.0 development
          </p>
        </div>
        <Button onClick={() => setShowAddForm(!showAddForm)}>
          <Plus size={16} className="mr-2" />
          Add Risk
        </Button>
      </div>

      {/* Risk Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {categories.map((category) => {
          const categoryRisks = risks.filter(risk => risk.category === category)
          const criticalRisks = categoryRisks.filter(risk => risk.riskLevel === 'critical').length
          const progress = getCategoryProgress(category)
          
          return (
            <Card key={category} className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setSelectedCategory(category)}>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(category)}
                      <h4 className="font-semibold text-sm capitalize">{category}</h4>
                    </div>
                    <Badge variant="secondary">{categoryRisks.length}</Badge>
                  </div>
                  {criticalRisks > 0 && (
                    <Badge className={getRiskColor('critical')}>
                      {criticalRisks} Critical
                    </Badge>
                  )}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span>Resolved</span>
                      <span>{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {/* Add Risk Form */}
          {showAddForm && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Add New Risk</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Risk Title</label>
                  <Input 
                    value={newRisk.title || ''}
                    onChange={(e) => setNewRisk(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Brief risk description..."
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Textarea 
                    value={newRisk.description || ''}
                    onChange={(e) => setNewRisk(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Detailed risk description and potential consequences..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Category</label>
                    <select 
                      className="w-full mt-1 p-2 border rounded-md"
                      value={newRisk.category}
                      onChange={(e) => setNewRisk(prev => ({ ...prev, category: e.target.value as any }))}
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat} className="capitalize">{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Owner</label>
                    <Input 
                      value={newRisk.owner || ''}
                      onChange={(e) => setNewRisk(prev => ({ ...prev, owner: e.target.value }))}
                      placeholder="Risk owner..."
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Probability</label>
                    <select 
                      className="w-full mt-1 p-2 border rounded-md"
                      value={newRisk.probability}
                      onChange={(e) => setNewRisk(prev => ({ ...prev, probability: e.target.value as any }))}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Impact</label>
                    <select 
                      className="w-full mt-1 p-2 border rounded-md"
                      value={newRisk.impact}
                      onChange={(e) => setNewRisk(prev => ({ ...prev, impact: e.target.value as any }))}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Mitigation Strategy</label>
                  <Textarea 
                    value={newRisk.mitigationStrategy || ''}
                    onChange={(e) => setNewRisk(prev => ({ ...prev, mitigationStrategy: e.target.value }))}
                    placeholder="How will this risk be mitigated or managed..."
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setShowAddForm(false)}>
                    Cancel
                  </Button>
                  <Button onClick={addRisk}>
                    Add Risk
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Risk List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle size={20} />
                Risk Register ({filteredRisks.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredRisks.map((risk) => (
                  <div key={risk.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getCategoryIcon(risk.category)}
                          <h4 className="font-medium">{risk.title}</h4>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          {risk.description}
                        </p>
                        {risk.mitigationStrategy && (
                          <div className="space-y-1">
                            <div className="text-xs font-medium text-muted-foreground">
                              MITIGATION STRATEGY:
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {risk.mitigationStrategy}
                            </p>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-2 ml-4">
                        <Badge className={getRiskColor(risk.riskLevel)}>
                          {risk.riskLevel}
                        </Badge>
                        <div className="text-xs text-muted-foreground">
                          P: {risk.probability} / I: {risk.impact}
                        </div>
                        <select
                          className={`text-xs px-2 py-1 rounded border ${getStatusColor(risk.status)}`}
                          value={risk.status}
                          onChange={(e) => updateRiskStatus(risk.id, e.target.value as any)}
                        >
                          <option value="identified">Identified</option>
                          <option value="analyzing">Analyzing</option>
                          <option value="mitigating">Mitigating</option>
                          <option value="monitoring">Monitoring</option>
                          <option value="resolved">Resolved</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Category Filter</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button
                  variant={selectedCategory === 'all' ? 'default' : 'outline'}
                  className="w-full justify-start text-left"
                  onClick={() => setSelectedCategory('all')}
                >
                  All Risks ({risks.length})
                </Button>
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? 'default' : 'outline'}
                    className="w-full justify-start text-left capitalize"
                    onClick={() => setSelectedCategory(category)}
                  >
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(category)}
                      {category} ({risks.filter(r => r.category === category).length})
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendUp size={20} />
                Risk Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Total Risks</span>
                  <span className="font-semibold">{risks.length}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-sm">
                  <span>Critical</span>
                  <span className="font-semibold text-red-600">
                    {risks.filter(r => r.riskLevel === 'critical').length}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>High</span>
                  <span className="font-semibold text-orange-600">
                    {risks.filter(r => r.riskLevel === 'high').length}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Medium</span>
                  <span className="font-semibold text-yellow-600">
                    {risks.filter(r => r.riskLevel === 'medium').length}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Low</span>
                  <span className="font-semibold text-green-600">
                    {risks.filter(r => r.riskLevel === 'low').length}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between text-sm">
                  <span>Overall Progress</span>
                  <span className="font-semibold">{totalProgress}%</span>
                </div>
                <Progress value={totalProgress} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function getDefaultRisks(): Risk[] {
  return [
    {
      id: 'risk-1',
      title: 'AI Hallucinations / Inaccurate Analysis',
      description: 'The AI model may generate incorrect or misleading compliance analysis results, leading to false compliance assessments that could impact regulatory submissions.',
      category: 'compliance',
      probability: 'high',
      impact: 'high',
      riskLevel: 'critical',
      mitigationStrategy: 'Implement golden set validation with known test documents, establish confidence scoring for AI outputs, require human review for critical assessments, and maintain audit trails of all AI decisions.',
      owner: 'AI Engineering Team',
      status: 'mitigating'
    },
    {
      id: 'risk-2',
      title: 'Cross-Tenant Data Exposure',
      description: 'Inadequate multi-tenant isolation could lead to one organization accessing another organization\'s sensitive compliance documents or analysis results.',
      category: 'security',
      probability: 'medium',
      impact: 'high',
      riskLevel: 'high',
      mitigationStrategy: 'Implement row-level security in PostgreSQL, enforce tenant isolation at API level, conduct penetration testing, and maintain separate S3 bucket prefixes per organization.',
      owner: 'Security Team',
      status: 'analyzing'
    },
    {
      id: 'risk-3',
      title: 'Flask to FastAPI Migration Complexity',
      description: 'The migration from monolithic Flask architecture to FastAPI microservices may introduce breaking changes and require significant refactoring effort.',
      category: 'technical',
      probability: 'medium',
      impact: 'medium',
      riskLevel: 'medium',
      mitigationStrategy: 'Plan phased migration with backward compatibility, comprehensive testing suite, parallel running during transition, and rollback procedures.',
      owner: 'Backend Development Team',
      status: 'identified'
    },
    {
      id: 'risk-4',
      title: 'OpenAI API Rate Limits and Costs',
      description: 'High usage could hit OpenAI API rate limits or result in unexpectedly high costs, affecting service availability and business viability.',
      category: 'business',
      probability: 'medium',
      impact: 'medium', 
      riskLevel: 'medium',
      mitigationStrategy: 'Implement rate limiting, caching strategies, cost monitoring alerts, and fallback to alternative AI models if needed.',
      owner: 'Product Team',
      status: 'monitoring'
    },
    {
      id: 'risk-5',
      title: 'Regulatory Compliance Validation',
      description: 'The system must comply with multiple regulations (21 CFR Part 11, HIPAA, ISO 13485) which may have conflicting or complex requirements.',
      category: 'compliance',
      probability: 'high',
      impact: 'high',
      riskLevel: 'critical',
      mitigationStrategy: 'Engage regulatory consultants, conduct compliance audits at each development phase, maintain detailed documentation, and implement automated compliance checks.',
      owner: 'Compliance Team',
      status: 'in-progress'
    },
    {
      id: 'risk-6',
      title: 'Async Worker Service Reliability',
      description: 'The new asynchronous worker service for document analysis may fail, get stuck, or lose jobs, impacting user experience.',
      category: 'technical',
      probability: 'medium',
      impact: 'medium',
      riskLevel: 'medium',
      mitigationStrategy: 'Implement job queuing with Redis, dead letter queues, job retry logic, monitoring and alerting, and graceful degradation.',
      owner: 'DevOps Team',
      status: 'identified'
    },
    {
      id: 'risk-7',
      title: 'User Authentication Security',
      description: 'AWS Cognito integration may have security vulnerabilities or misconfigurations that could compromise user accounts.',
      category: 'security',
      probability: 'low',
      impact: 'high',
      riskLevel: 'medium',
      mitigationStrategy: 'Follow AWS security best practices, enable MFA, implement proper RBAC, conduct security reviews, and regular penetration testing.',
      owner: 'Security Team',
      status: 'resolved'
    },
    {
      id: 'risk-8',
      title: 'Scalability and Performance',
      description: 'The new architecture may not scale properly under high load, leading to poor performance or system outages.',
      category: 'technical',
      probability: 'low',
      impact: 'high',
      riskLevel: 'medium',
      mitigationStrategy: 'Implement load testing, auto-scaling with ECS Fargate, performance monitoring, CDN for static assets, and database optimization.',
      owner: 'Infrastructure Team',
      status: 'monitoring'
    }
  ]
}