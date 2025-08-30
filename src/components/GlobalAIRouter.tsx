import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Globe,
  Brain, 
  Router,
  PlayCircle, 
  Clock, 
  CheckCircle,
  AlertTriangle,
  Zap,
  Target,
  TrendUp,
  Activity,
  Gear,
  Lightning,
  Shield,
  ChartBar
} from '@phosphor-icons/react'
import { toast } from 'sonner'

interface GlobalAIModel {
  id: string
  name: string
  provider: string
  version: string
  apiEndpoint: string
  supportedRegulations: string[]
  supportedLanguages: string[]
  accuracy: number
  speed: number
  costPer1000Tokens: number
  maxTokens: number
  specialization: string[]
  status: 'active' | 'beta' | 'maintenance'
  regionAvailability: string[]
  complianceCertifications: string[]
}

interface GlobalRegulation {
  id: string
  name: string
  region: string
  authority: string
  lastUpdated: string
  sections: number
  complexity: 'basic' | 'intermediate' | 'advanced'
  language: string
  aiCompatibility: number
}

interface AnalysisRequest {
  documentText: string
  selectedRegulations: string[]
  selectedModels: string[]
  analysisType: 'compliance' | 'gap-analysis' | 'risk-assessment'
  priority: 'standard' | 'high' | 'critical'
}

export function GlobalAIRouter() {
  const [activeTab, setActiveTab] = useState('models')
  const [selectedModels, setSelectedModels] = useState<string[]>(['gpt-5', 'claude-4'])
  const [selectedRegulations, setSelectedRegulations] = useState<string[]>(['fda-usa', 'eu-mdr'])
  const [analysisRequest, setAnalysisRequest] = useState<AnalysisRequest>({
    documentText: '',
    selectedRegulations: [],
    selectedModels: [],
    analysisType: 'compliance',
    priority: 'standard'
  })
  const [isProcessing, setIsProcessing] = useState(false)
  
  const [globalModels, setGlobalModels] = useKV('global-ai-models', [] as GlobalAIModel[])
  const [globalRegulations, setGlobalRegulations] = useKV('global-regulations', [] as GlobalRegulation[])

  // Initialize global AI models
  useEffect(() => {
    if (globalModels.length === 0) {
      setGlobalModels([
        {
          id: 'gpt-5',
          name: 'GPT-5',
          provider: 'OpenAI',
          version: '5.0.1',
          apiEndpoint: 'https://api.openai.com/v1/chat/completions',
          supportedRegulations: ['FDA', 'EU-MDR', 'ISO-13485', 'TGA', 'PMDA', 'Health-Canada', 'NMPA'],
          supportedLanguages: ['en', 'es', 'fr', 'de', 'ja', 'zh', 'pt'],
          accuracy: 96.8,
          speed: 9.2,
          costPer1000Tokens: 15,
          maxTokens: 128000,
          specialization: ['Regulatory Analysis', 'Risk Assessment', 'Technical Writing'],
          status: 'active',
          regionAvailability: ['US', 'EU', 'Canada', 'Australia', 'Japan'],
          complianceCertifications: ['SOC2', 'GDPR', 'HIPAA']
        },
        {
          id: 'claude-4',
          name: 'Claude 4',
          provider: 'Anthropic',
          version: '4.0.3',
          apiEndpoint: 'https://api.anthropic.com/v1/messages',
          supportedRegulations: ['FDA', 'EU-MDR', 'ISO-13485', 'ICH-Guidelines', 'WHO-GMP'],
          supportedLanguages: ['en', 'es', 'fr', 'de', 'ja'],
          accuracy: 94.5,
          speed: 11.7,
          costPer1000Tokens: 12,
          maxTokens: 200000,
          specialization: ['Safety Analysis', 'Clinical Research', 'Quality Systems'],
          status: 'active',
          regionAvailability: ['US', 'EU', 'Canada', 'Australia'],
          complianceCertifications: ['SOC2', 'GDPR']
        },
        {
          id: 'gemini-2-5-pro',
          name: 'Gemini 2.5 Pro',
          provider: 'Google',
          version: '2.5.7',
          apiEndpoint: 'https://generativelanguage.googleapis.com/v1beta/models',
          supportedRegulations: ['FDA', 'EU-MDR', 'PMDA', 'TGA', 'ANVISA'],
          supportedLanguages: ['en', 'es', 'fr', 'de', 'pt', 'ja', 'zh'],
          accuracy: 93.1,
          speed: 13.4,
          costPer1000Tokens: 8,
          maxTokens: 1000000,
          specialization: ['Document Processing', 'Multi-language Analysis', 'Data Integration'],
          status: 'active',
          regionAvailability: ['Global'],
          complianceCertifications: ['SOC2', 'ISO27001']
        },
        {
          id: 'grok-2',
          name: 'Grok 2',
          provider: 'xAI',
          version: '2.1.0',
          apiEndpoint: 'https://api.x.ai/v1/chat/completions',
          supportedRegulations: ['FDA', 'EU-MDR', 'Health-Canada', 'TGA'],
          supportedLanguages: ['en', 'es', 'fr'],
          accuracy: 89.7,
          speed: 15.8,
          costPer1000Tokens: 6,
          maxTokens: 25000,
          specialization: ['Real-time Analysis', 'Emerging Regulations', 'Innovation Assessment'],
          status: 'beta',
          regionAvailability: ['US', 'Canada'],
          complianceCertifications: ['SOC2']
        }
      ])
    }
  }, [globalModels.length, setGlobalModels])

  // Initialize global regulations
  useEffect(() => {
    if (globalRegulations.length === 0) {
      setGlobalRegulations([
        {
          id: 'fda-usa',
          name: '21 CFR Parts 820, 211, 600 (FDA Quality System Regulation)',
          region: 'United States',
          authority: 'FDA',
          lastUpdated: '2024-01-15',
          sections: 127,
          complexity: 'advanced',
          language: 'en',
          aiCompatibility: 95
        },
        {
          id: 'eu-mdr',
          name: 'EU MDR 2017/745 (Medical Device Regulation)',
          region: 'European Union',
          authority: 'European Commission',
          lastUpdated: '2024-01-10',
          sections: 123,
          complexity: 'advanced',
          language: 'en',
          aiCompatibility: 92
        },
        {
          id: 'iso-13485',
          name: 'ISO 13485:2016 (Medical Device Quality Management)',
          region: 'International',
          authority: 'ISO',
          lastUpdated: '2023-12-20',
          sections: 45,
          complexity: 'intermediate',
          language: 'en',
          aiCompatibility: 98
        },
        {
          id: 'pmda-japan',
          name: 'PMDA Guidelines (Pharmaceutical and Medical Device Act)',
          region: 'Japan',
          authority: 'PMDA',
          lastUpdated: '2024-01-08',
          sections: 89,
          complexity: 'advanced',
          language: 'ja',
          aiCompatibility: 87
        },
        {
          id: 'tga-australia',
          name: 'TGA Therapeutic Goods Regulations',
          region: 'Australia',
          authority: 'TGA',
          lastUpdated: '2023-12-15',
          sections: 78,
          complexity: 'intermediate',
          language: 'en',
          aiCompatibility: 91
        },
        {
          id: 'health-canada',
          name: 'Health Canada Medical Device Regulations (MDSAP)',
          region: 'Canada',
          authority: 'Health Canada',
          lastUpdated: '2024-01-12',
          sections: 82,
          complexity: 'intermediate',
          language: 'en',
          aiCompatibility: 93
        },
        {
          id: 'anvisa-brazil',
          name: 'ANVISA Resolution RDC 16/2013',
          region: 'Brazil',
          authority: 'ANVISA',
          lastUpdated: '2023-11-30',
          sections: 67,
          complexity: 'intermediate',
          language: 'pt',
          aiCompatibility: 85
        },
        {
          id: 'nmpa-china',
          name: 'NMPA Medical Device Regulations',
          region: 'China',
          authority: 'NMPA',
          lastUpdated: '2024-01-05',
          sections: 95,
          complexity: 'advanced',
          language: 'zh',
          aiCompatibility: 78
        }
      ])
    }
  }, [globalRegulations.length, setGlobalRegulations])

  const runGlobalAnalysis = async () => {
    if (selectedModels.length === 0 || selectedRegulations.length === 0 || !analysisRequest.documentText.trim()) {
      toast.error('Please select models, regulations, and provide document text')
      return
    }

    setIsProcessing(true)
    
    try {
      // Simulate global AI router processing
      await new Promise(resolve => setTimeout(resolve, 4000))
      
      toast.success(`Analysis completed using ${selectedModels.length} AI models across ${selectedRegulations.length} regulatory frameworks`)
      
    } catch (error) {
      toast.error('Global analysis failed. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const getRegionStats = () => {
    const regions = globalRegulations.reduce((acc, reg) => {
      acc[reg.region] = (acc[reg.region] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    return Object.entries(regions).map(([region, count]) => ({
      region,
      count,
      percentage: Math.round((count / globalRegulations.length) * 100)
    }))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Globe size={24} className="text-primary" />
            Global AI Router & Regulatory Knowledge Service
          </h2>
          <p className="text-muted-foreground mt-1">
            Multi-model AI analysis across global regulatory frameworks
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="px-3 py-1">
            {globalModels.filter(m => m.status === 'active').length} Active Models
          </Badge>
          <Badge variant="outline" className="px-3 py-1">
            {globalRegulations.length} Regulatory Frameworks
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="models">AI Models</TabsTrigger>
          <TabsTrigger value="regulations">Regulations</TabsTrigger>
          <TabsTrigger value="router">AI Router</TabsTrigger>
          <TabsTrigger value="analysis">Run Analysis</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="models" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {globalModels.map((model) => (
              <Card key={model.id} className={model.status === 'maintenance' ? 'opacity-60' : ''}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{model.name}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={model.status === 'active' ? 'default' : 
                                model.status === 'beta' ? 'secondary' : 'outline'}
                        className="text-xs"
                      >
                        {model.status}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {model.provider}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Version {model.version} • Max tokens: {model.maxTokens.toLocaleString()}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Accuracy</div>
                      <div className="flex items-center gap-2">
                        <Progress value={model.accuracy} className="flex-1 h-2" />
                        <span className="text-sm font-medium">{model.accuracy}%</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Speed Score</div>
                      <div className="flex items-center gap-2">
                        <Progress value={(model.speed / 20) * 100} className="flex-1 h-2" />
                        <span className="text-sm font-medium">{model.speed}/20</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-muted-foreground mb-2">Supported Regulations</div>
                    <div className="flex flex-wrap gap-1">
                      {model.supportedRegulations.slice(0, 4).map((reg, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {reg}
                        </Badge>
                      ))}
                      {model.supportedRegulations.length > 4 && (
                        <Badge variant="outline" className="text-xs">
                          +{model.supportedRegulations.length - 4} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-muted-foreground mb-2">Regional Availability</div>
                    <div className="flex flex-wrap gap-1">
                      {model.regionAvailability.map((region, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {region}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground">
                    Cost: ${model.costPer1000Tokens}/1K tokens • Languages: {model.supportedLanguages.length}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="regulations" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {getRegionStats().map((stat) => (
              <Card key={stat.region}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium">{stat.region}</div>
                      <div className="text-2xl font-bold">{stat.count}</div>
                    </div>
                    <div className="text-sm text-muted-foreground">{stat.percentage}%</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {globalRegulations.map((regulation) => (
              <Card key={regulation.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{regulation.name}</CardTitle>
                    <Badge 
                      variant={regulation.complexity === 'advanced' ? 'destructive' : 
                              regulation.complexity === 'intermediate' ? 'secondary' : 'outline'}
                      className="text-xs"
                    >
                      {regulation.complexity}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {regulation.authority} • {regulation.region}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Sections:</span>
                      <span className="ml-2 font-medium">{regulation.sections}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Language:</span>
                      <span className="ml-2 font-medium">{regulation.language.toUpperCase()}</span>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-muted-foreground">AI Compatibility</div>
                    <div className="flex items-center gap-2">
                      <Progress value={regulation.aiCompatibility} className="flex-1 h-2" />
                      <span className="text-sm font-medium">{regulation.aiCompatibility}%</span>
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground">
                    Last updated: {new Date(regulation.lastUpdated).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="router" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Router size={20} />
                AI Router Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <Lightning size={16} />
                <AlertDescription>
                  The AI Router intelligently distributes analysis requests across multiple models based on 
                  regulation complexity, document language, and performance requirements.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <Brain size={24} className="mx-auto text-blue-600 mb-2" />
                    <div className="text-sm font-medium">Load Balancing</div>
                    <div className="text-xs text-muted-foreground">
                      Distribute requests across available models
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4 text-center">
                    <Target size={24} className="mx-auto text-green-600 mb-2" />
                    <div className="text-sm font-medium">Optimization</div>
                    <div className="text-xs text-muted-foreground">
                      Select best model for specific regulations
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4 text-center">
                    <Shield size={24} className="mx-auto text-purple-600 mb-2" />
                    <div className="text-sm font-medium">Fallback</div>
                    <div className="text-xs text-muted-foreground">
                      Automatic failover to backup models
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Router Rules</h4>
                <div className="space-y-3">
                  {[
                    { condition: 'FDA Regulations', model: 'GPT-5', reason: 'Best FDA knowledge base' },
                    { condition: 'EU MDR Analysis', model: 'Claude 4', reason: 'Superior EU regulatory training' },
                    { condition: 'Asian Regulations (PMDA/NMPA)', model: 'Gemini 2.5 Pro', reason: 'Multi-language support' },
                    { condition: 'Real-time/Emergency', model: 'Grok 2', reason: 'Fastest response time' },
                    { condition: 'Complex Multi-regulation', model: 'GPT-5 + Claude 4', reason: 'Ensemble analysis' }
                  ].map((rule, idx) => (
                    <div key={idx} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm">{rule.condition}</span>
                        <Badge variant="secondary" className="text-xs">{rule.model}</Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">{rule.reason}</div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PlayCircle size={20} />
                Global Multi-Model Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label>Select AI Models ({selectedModels.length} selected)</Label>
                    <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
                      {globalModels.filter(m => m.status === 'active' || m.status === 'beta').map((model) => (
                        <div key={model.id} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={model.id}
                            checked={selectedModels.includes(model.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedModels(prev => [...prev, model.id])
                              } else {
                                setSelectedModels(prev => prev.filter(id => id !== model.id))
                              }
                            }}
                            className="rounded border-gray-300"
                          />
                          <Label htmlFor={model.id} className="text-sm cursor-pointer">
                            {model.name} ({model.provider})
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label>Select Regulatory Frameworks ({selectedRegulations.length} selected)</Label>
                    <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
                      {globalRegulations.map((regulation) => (
                        <div key={regulation.id} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={regulation.id}
                            checked={selectedRegulations.includes(regulation.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedRegulations(prev => [...prev, regulation.id])
                              } else {
                                setSelectedRegulations(prev => prev.filter(id => id !== regulation.id))
                              }
                            }}
                            className="rounded border-gray-300"
                          />
                          <Label htmlFor={regulation.id} className="text-sm cursor-pointer">
                            {regulation.region} - {regulation.authority}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="analysis-type">Analysis Type</Label>
                    <Select 
                      value={analysisRequest.analysisType} 
                      onValueChange={(value: 'compliance' | 'gap-analysis' | 'risk-assessment') => 
                        setAnalysisRequest(prev => ({ ...prev, analysisType: value }))
                      }
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="compliance">Compliance Analysis</SelectItem>
                        <SelectItem value="gap-analysis">Gap Analysis</SelectItem>
                        <SelectItem value="risk-assessment">Risk Assessment</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="priority">Processing Priority</Label>
                    <Select 
                      value={analysisRequest.priority} 
                      onValueChange={(value: 'standard' | 'high' | 'critical') => 
                        setAnalysisRequest(prev => ({ ...prev, priority: value }))
                      }
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard">Standard (30min)</SelectItem>
                        <SelectItem value="high">High Priority (10min)</SelectItem>
                        <SelectItem value="critical">Critical (5min)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="document-text">Document Content</Label>
                    <Textarea
                      id="document-text"
                      placeholder="Paste your regulatory document content here for global multi-model analysis..."
                      value={analysisRequest.documentText}
                      onChange={(e) => setAnalysisRequest(prev => ({ ...prev, documentText: e.target.value }))}
                      className="mt-2 h-32 resize-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="text-sm text-muted-foreground">
                  {selectedModels.length > 0 && selectedRegulations.length > 0 ? 
                    `Ready to analyze using ${selectedModels.length} AI models across ${selectedRegulations.length} regulatory frameworks` : 
                    'Select models and regulations to begin'
                  }
                </div>
                <Button 
                  onClick={runGlobalAnalysis} 
                  disabled={isProcessing || selectedModels.length === 0 || selectedRegulations.length === 0 || !analysisRequest.documentText.trim()}
                  className="flex items-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <Clock size={16} className="animate-spin" />
                      Processing Global Analysis...
                    </>
                  ) : (
                    <>
                      <Globe size={16} />
                      Run Global Analysis
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ChartBar size={20} />
                Global Performance Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{globalModels.length}</div>
                  <div className="text-sm text-muted-foreground">AI Models Available</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{globalRegulations.length}</div>
                  <div className="text-sm text-muted-foreground">Regulatory Frameworks</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {Math.round(globalModels.reduce((sum, m) => sum + m.accuracy, 0) / globalModels.length)}%
                  </div>
                  <div className="text-sm text-muted-foreground">Average Accuracy</div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Model Performance Summary</h4>
                {globalModels.map((model) => (
                  <div key={model.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium">{model.name}</div>
                      <Badge variant={model.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                        {model.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <div className="text-xs text-muted-foreground">Accuracy</div>
                        <Progress value={model.accuracy} className="h-2 mt-1" />
                        <div className="text-xs mt-1">{model.accuracy}%</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Speed</div>
                        <Progress value={(model.speed / 20) * 100} className="h-2 mt-1" />
                        <div className="text-xs mt-1">{model.speed}/20</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Regulations</div>
                        <div className="text-sm font-medium mt-1">{model.supportedRegulations.length}</div>
                      </div>
                    </div>
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