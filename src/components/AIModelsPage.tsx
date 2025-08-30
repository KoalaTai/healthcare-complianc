import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { 
  BarChart3, 
  TrendingUp,
  Zap,
  Star,
  Clock,
  CheckCircle,
  AlertTriangle,
  Activity,
  Brain,
  Cpu,
  Target,
  Plus
} from '@phosphor-icons/react'

interface AIModel {
  id: string
  name: string
  provider: string
  version: string
  status: 'active' | 'testing' | 'deprecated'
  accuracy: number
  speed: number
  cost: number
  specialization: string[]
  lastBenchmark: string
  usage: number
}

export function AIModelsPage() {
  const [selectedModel, setSelectedModel] = useState<string | null>(null)
  const [benchmarkFilter, setBenchmarkFilter] = useState('all')

  const aiModels: AIModel[] = [
    {
      id: 'gpt-5-turbo',
      name: 'GPT-5 Turbo',
      provider: 'OpenAI',
      version: '5.0.1',
      status: 'active',
      accuracy: 97.8,
      speed: 95,
      cost: 70,
      specialization: ['General Analysis', 'Technical Writing', 'Regulatory Review'],
      lastBenchmark: '2024-03-15',
      usage: 45
    },
    {
      id: 'claude-4-opus',
      name: 'Claude 4 Opus',
      provider: 'Anthropic',
      version: '4.0.2',
      status: 'active',
      accuracy: 98.2,
      speed: 88,
      cost: 85,
      specialization: ['Legal Analysis', 'Risk Assessment', 'Compliance Review'],
      lastBenchmark: '2024-03-14',
      usage: 32
    },
    {
      id: 'gemini-2-5-pro',
      name: 'Gemini 2.5 Pro',
      provider: 'Google',
      version: '2.5.0',
      status: 'active',
      accuracy: 96.5,
      speed: 92,
      cost: 60,
      specialization: ['Data Analysis', 'Pattern Recognition', 'Multimodal Processing'],
      lastBenchmark: '2024-03-13',
      usage: 23
    },
    {
      id: 'grok-3',
      name: 'Grok 3',
      provider: 'xAI',
      version: '3.0.0',
      status: 'testing',
      accuracy: 95.1,
      speed: 97,
      cost: 45,
      specialization: ['Real-time Analysis', 'Technical Documentation', 'Code Review'],
      lastBenchmark: '2024-03-12',
      usage: 0
    },
    {
      id: 'pharma-gpt-specialized',
      name: 'Pharma-GPT Specialized',
      provider: 'Custom',
      version: '1.2.0',
      status: 'active',
      accuracy: 99.1,
      speed: 75,
      cost: 120,
      specialization: ['cGMP Analysis', 'FDA Submissions', 'Drug Development'],
      lastBenchmark: '2024-03-10',
      usage: 15
    },
    {
      id: 'regulatory-claude',
      name: 'Regulatory Claude',
      provider: 'Custom',
      version: '1.1.0',
      status: 'active',
      accuracy: 98.7,
      speed: 82,
      cost: 110,
      specialization: ['Regulatory Compliance', 'Quality Systems', 'Audit Preparation'],
      lastBenchmark: '2024-03-09',
      usage: 18
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-600 text-white'
      case 'testing': return 'bg-amber-600 text-white'
      case 'deprecated': return 'bg-gray-500 text-white'
      default: return 'bg-gray-500 text-white'
    }
  }

  const getPerformanceColor = (value: number) => {
    if (value >= 95) return 'text-green-600'
    if (value >= 90) return 'text-blue-600'
    if (value >= 80) return 'text-amber-600'
    return 'text-red-600'
  }

  const filteredModels = aiModels.filter(model => {
    if (benchmarkFilter === 'all') return true
    if (benchmarkFilter === 'high-accuracy') return model.accuracy >= 97
    if (benchmarkFilter === 'fast') return model.speed >= 90
    if (benchmarkFilter === 'cost-effective') return model.cost <= 70
    if (benchmarkFilter === 'specialized') return model.provider === 'Custom'
    return true
  })

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Brain size={32} />
            AI Model Comparison & Performance
          </h1>
          <p className="text-muted-foreground mt-2">
            Compare and manage AI models for regulatory compliance analysis
          </p>
        </div>
        <Button>
          <Plus size={16} className="mr-2" />
          Add Custom Model
        </Button>
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">12</div>
            <div className="text-xs text-muted-foreground">Total Models</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">98.2%</div>
            <div className="text-xs text-muted-foreground">Avg Accuracy</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">89.3%</div>
            <div className="text-xs text-muted-foreground">Avg Speed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">2.3s</div>
            <div className="text-xs text-muted-foreground">Avg Response</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">$0.12</div>
            <div className="text-xs text-muted-foreground">Avg Cost/Analysis</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'all', label: 'All Models', count: aiModels.length },
              { id: 'high-accuracy', label: 'High Accuracy (>97%)', count: aiModels.filter(m => m.accuracy >= 97).length },
              { id: 'fast', label: 'Fast Response (>90%)', count: aiModels.filter(m => m.speed >= 90).length },
              { id: 'cost-effective', label: 'Cost Effective (<$70)', count: aiModels.filter(m => m.cost <= 70).length },
              { id: 'specialized', label: 'Custom Specialized', count: aiModels.filter(m => m.provider === 'Custom').length }
            ].map((filter) => (
              <Button
                key={filter.id}
                variant={benchmarkFilter === filter.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setBenchmarkFilter(filter.id)}
                className="text-xs"
              >
                {filter.label}
                <Badge variant="secondary" className="ml-2 text-xs">
                  {filter.count}
                </Badge>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Models Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredModels.map((model) => (
          <Card key={model.id} className="hover:shadow-md transition-all duration-200">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Cpu size={20} />
                    {model.name}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">
                    {model.provider} • v{model.version}
                  </p>
                </div>
                <Badge className={getStatusColor(model.status)}>
                  {model.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Performance Metrics */}
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className={`text-lg font-bold ${getPerformanceColor(model.accuracy)}`}>
                    {model.accuracy}%
                  </div>
                  <div className="text-xs text-muted-foreground">Accuracy</div>
                </div>
                <div>
                  <div className={`text-lg font-bold ${getPerformanceColor(model.speed)}`}>
                    {model.speed}%
                  </div>
                  <div className="text-xs text-muted-foreground">Speed</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-foreground">
                    ${(model.cost / 100).toFixed(2)}
                  </div>
                  <div className="text-xs text-muted-foreground">Cost/Analysis</div>
                </div>
              </div>

              <Separator />

              {/* Specializations */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-foreground">Specializations:</p>
                <div className="flex flex-wrap gap-1">
                  {model.specialization.map((spec, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {spec}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Usage and Benchmark */}
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Usage: {model.usage}% of analyses</span>
                <span>Benchmark: {new Date(model.lastBenchmark).toLocaleDateString()}</span>
              </div>

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => setSelectedModel(model.id)}
                >
                  <Activity size={14} className="mr-2" />
                  Details
                </Button>
                <Button variant="outline" size="sm">
                  <Target size={14} className="mr-2" />
                  Test
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Model Comparison Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 size={20} />
            Performance Comparison
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredModels.map((model) => (
              <div key={model.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{model.name}</span>
                  <div className="flex items-center gap-4 text-xs">
                    <span className={getPerformanceColor(model.accuracy)}>
                      {model.accuracy}% accuracy
                    </span>
                    <span className={getPerformanceColor(model.speed)}>
                      {model.speed}% speed
                    </span>
                    <span>${(model.cost / 100).toFixed(2)}/analysis</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-muted rounded-full h-2 relative overflow-hidden">
                    <div 
                      className="bg-green-500 h-full transition-all duration-300"
                      style={{ width: `${model.accuracy}%` }}
                    />
                  </div>
                  <div className="bg-muted rounded-full h-2 relative overflow-hidden">
                    <div 
                      className="bg-blue-500 h-full transition-all duration-300"
                      style={{ width: `${model.speed}%` }}
                    />
                  </div>
                  <div className="bg-muted rounded-full h-2 relative overflow-hidden">
                    <div 
                      className="bg-amber-500 h-full transition-all duration-300"
                      style={{ width: `${100 - model.cost}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Model Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star size={20} />
            Recommended Models by Use Case
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Zap size={18} className="text-amber-600" />
                <h4 className="font-medium">Fastest Analysis</h4>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                For quick regulatory scans and preliminary reviews
              </p>
              <Badge variant="default" className="text-xs">
                Grok 3 • 97% speed
              </Badge>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Target size={18} className="text-green-600" />
                <h4 className="font-medium">Highest Accuracy</h4>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                For critical compliance analysis and final reviews
              </p>
              <Badge variant="default" className="text-xs">
                Pharma-GPT • 99.1% accuracy
              </Badge>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp size={18} className="text-blue-600" />
                <h4 className="font-medium">Best Value</h4>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Optimal balance of performance and cost
              </p>
              <Badge variant="default" className="text-xs">
                Gemini 2.5 Pro • $0.60/analysis
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}