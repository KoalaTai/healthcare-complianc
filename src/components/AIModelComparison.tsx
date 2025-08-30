import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Brain, 
  BarChart, 
  PlayCircle, 
  Clock, 
  CheckCircle,
  AlertTriangle,
  Zap,
  Target,
  TrendUp,
  Download,
  Activity
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { ModelPerformanceDashboard } from './ModelPerformanceDashboard'

interface ModelPerformance {
  modelName: string
  provider: string
  accuracy: number
  speed: number
  cost: number
  compliance: number
  lastTested: string
  strengths: string[]
  weaknesses: string[]
  status: 'active' | 'testing' | 'deprecated'
}

interface ComparisonResult {
  id: string
  documentType: string
  regulation: string
  models: {
    modelName: string
    findings: number
    criticalFindings: number
    confidence: number
    processingTime: number
    cost: number
    qualityScore: number
  }[]
  timestamp: string
  goldStandardAccuracy?: number
}

export function AIModelComparison() {
  const [activeComparison, setActiveComparison] = useState('overview')
  const [selectedModels, setSelectedModels] = useState<string[]>(['gpt-4o', 'claude-3-sonnet'])
  const [testDocument, setTestDocument] = useState('')
  const [selectedRegulation, setSelectedRegulation] = useState('21-cfr-820')
  const [isRunning, setIsRunning] = useState(false)
  
  const [modelData, setModelData] = useKV('ai-model-performance', [] as ModelPerformance[])
  const [comparisonHistory, setComparisonHistory] = useKV('model-comparison-history', [] as ComparisonResult[])

  // Initialize model data if empty
  useEffect(() => {
    if (modelData.length === 0) {
      setModelData([
        {
          modelName: 'GPT-4o',
          provider: 'OpenAI',
          accuracy: 94.2,
          speed: 8.5,
          cost: 85,
          compliance: 96.8,
          lastTested: '2024-01-15',
          strengths: ['Regulatory Knowledge', 'Citation Accuracy', 'Complex Analysis'],
          weaknesses: ['Processing Speed', 'Cost per Analysis'],
          status: 'active'
        },
        {
          modelName: 'Claude-3 Sonnet',
          provider: 'Anthropic',
          accuracy: 91.7,
          speed: 12.3,
          cost: 65,
          compliance: 93.1,
          lastTested: '2024-01-15',
          strengths: ['Processing Speed', 'Cost Efficiency', 'Risk Analysis'],
          weaknesses: ['Citation Formatting', 'Specialized Standards'],
          status: 'active'
        },
        {
          modelName: 'PharmaGPT-4',
          provider: 'BioPharma AI',
          accuracy: 97.1,
          speed: 7.2,
          cost: 120,
          compliance: 98.5,
          lastTested: '2024-01-15',
          strengths: ['21 CFR 211 Expertise', 'GMP Validation', 'Drug Manufacturing'],
          weaknesses: ['High Cost', 'Limited to Pharma'],
          status: 'active'
        },
        {
          modelName: 'RegulatoryAI Pro',
          provider: 'MedTech Solutions',
          accuracy: 95.8,
          speed: 9.1,
          cost: 95,
          compliance: 97.2,
          lastTested: '2024-01-15',
          strengths: ['FDA Submissions', 'ICH Guidelines', 'Clinical Trials'],
          weaknesses: ['Slower Updates', 'Complex Setup'],
          status: 'active'
        },
        {
          modelName: 'PharmaClaude',
          provider: 'Anthropic (Specialized)',
          accuracy: 93.4,
          speed: 11.8,
          cost: 75,
          compliance: 95.7,
          lastTested: '2024-01-15',
          strengths: ['Drug Safety', 'Pharmacovigilance', 'CAPA Analysis'],
          weaknesses: ['Limited Manufacturing', 'Beta Stage'],
          status: 'testing'
        },
        {
          modelName: 'GPT-4o Mini',
          provider: 'OpenAI',
          accuracy: 87.3,
          speed: 15.8,
          cost: 25,
          compliance: 89.5,
          lastTested: '2024-01-15',
          strengths: ['Very Fast', 'Low Cost', 'Good for Initial Screening'],
          weaknesses: ['Lower Accuracy', 'Less Detailed Analysis'],
          status: 'testing'
        },
        {
          modelName: 'BioCompliance AI',
          provider: 'Regulatory Sciences Inc',
          accuracy: 92.7,
          speed: 10.5,
          cost: 85,
          compliance: 94.8,
          lastTested: '2024-01-15',
          strengths: ['Biological Products', 'FDA Biologics', 'Quality by Design'],
          weaknesses: ['New Platform', 'Limited Training Data'],
          status: 'testing'
        },
        {
          modelName: 'Gemini Pro',
          provider: 'Google',
          accuracy: 89.1,
          speed: 11.2,
          cost: 45,
          compliance: 91.3,
          lastTested: '2024-01-15',
          strengths: ['Balanced Performance', 'Document Understanding'],
          weaknesses: ['Regulatory Depth', 'Citation Quality'],
          status: 'testing'
        }
      ])
    }
  }, [modelData.length, setModelData])

  const runComparison = async () => {
    if (selectedModels.length < 2) {
      toast.error('Select at least 2 models to compare')
      return
    }

    if (!testDocument.trim()) {
      toast.error('Please provide a test document')
      return
    }

    setIsRunning(true)
    
    // Simulate AI analysis comparison
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
    
    try {
      // Simulate analysis for each selected model
      const results = []
      
      for (const modelName of selectedModels) {
        await delay(1000) // Simulate processing time
        
        const model = modelData.find(m => m.modelName === modelName)
        if (!model) continue

        // Generate realistic but varied results
        const baseFindings = Math.floor(Math.random() * 15) + 10
        const criticalRatio = 0.2 + Math.random() * 0.3
        
        results.push({
          modelName,
          findings: baseFindings,
          criticalFindings: Math.floor(baseFindings * criticalRatio),
          confidence: Math.floor(85 + Math.random() * 12),
          processingTime: Math.floor(5 + Math.random() * 20),
          cost: Math.floor(model.cost * 0.8 + Math.random() * model.cost * 0.4),
          qualityScore: Math.floor(model.accuracy - 5 + Math.random() * 10)
        })
      }

      const newComparison: ComparisonResult = {
        id: `comp-${Date.now()}`,
        documentType: 'Quality Manual',
        regulation: selectedRegulation,
        models: results,
        timestamp: new Date().toISOString(),
        goldStandardAccuracy: Math.floor(85 + Math.random() * 10)
      }

      setComparisonHistory(prev => [newComparison, ...prev.slice(0, 9)])
      toast.success('Model comparison completed successfully')
      
    } catch (error) {
      toast.error('Comparison failed. Please try again.')
    } finally {
      setIsRunning(false)
    }
  }

  const availableModels = modelData.filter(m => m.status === 'active' || m.status === 'testing')
  const regulations = [
    // Pharmaceutical Regulations (New Focus)
    { value: '21-cfr-211', label: '21 CFR 211 - Current Good Manufacturing Practice (cGMP)' },
    { value: '21-cfr-210', label: '21 CFR 210 - Drug Manufacturing Standards' },
    { value: 'ich-q7', label: 'ICH Q7 - Good Manufacturing Practice for APIs' },
    { value: 'ich-q8', label: 'ICH Q8 - Pharmaceutical Development' },
    { value: 'ich-q9', label: 'ICH Q9 - Quality Risk Management' },
    { value: 'ich-q10', label: 'ICH Q10 - Quality System' },
    { value: 'ich-q11', label: 'ICH Q11 - Development & Manufacture of APIs' },
    { value: 'ich-q12', label: 'ICH Q12 - Lifecycle Management' },
    { value: '21-cfr-314', label: '21 CFR 314 - New Drug Applications (NDA)' },
    { value: '21-cfr-320', label: '21 CFR 320 - Bioavailability/Bioequivalence' },
    { value: '21-cfr-600', label: '21 CFR 600 - Biological Products' },
    { value: 'usp-general', label: 'USP General Chapters' },
    { value: 'eu-gmp', label: 'EU GMP Guidelines' },
    { value: 'pic-s-gmp', label: 'PIC/S GMP Guidelines' },
    // Medical Device Regulations
    { value: '21-cfr-820', label: '21 CFR 820 - Medical Device QSR' },
    { value: 'iso-13485', label: 'ISO 13485 - Medical Device QMS' },
    { value: 'eu-mdr', label: 'EU MDR - Medical Device Regulation' },
    // General Quality Systems
    { value: 'iso-9001', label: 'ISO 9001 - Quality Management' },
    { value: 'fda-guidance', label: 'FDA Guidance Documents' },
    { value: 'who-gmp', label: 'WHO Good Manufacturing Practices' }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Brain size={24} className="text-primary" />
            AI Model Comparison Center
          </h2>
          <p className="text-muted-foreground mt-1">
            Evaluate and compare AI model performance for regulatory compliance analysis
          </p>
        </div>
        <Badge variant="outline" className="px-3 py-1">
          {availableModels.length} Models Available
        </Badge>
      </div>

      <Tabs value={activeComparison} onValueChange={setActiveComparison}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Model Overview</TabsTrigger>
          <TabsTrigger value="comparison">Run Comparison</TabsTrigger>
          <TabsTrigger value="results">Results History</TabsTrigger>
          <TabsTrigger value="performance">Live Performance</TabsTrigger>
          <TabsTrigger value="benchmarks">Benchmarks</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {modelData.map((model) => (
              <Card key={model.modelName} className={model.status === 'deprecated' ? 'opacity-60' : ''}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{model.modelName}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={model.status === 'active' ? 'default' : 
                                model.status === 'testing' ? 'secondary' : 'outline'}
                        className="text-xs"
                      >
                        {model.status}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {model.provider}
                      </Badge>
                    </div>
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
                    <div>
                      <div className="text-sm text-muted-foreground">Cost Index</div>
                      <div className="flex items-center gap-2">
                        <Progress value={100 - model.cost} className="flex-1 h-2" />
                        <span className="text-sm font-medium">${model.cost}/analysis</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Compliance</div>
                      <div className="flex items-center gap-2">
                        <Progress value={model.compliance} className="flex-1 h-2" />
                        <span className="text-sm font-medium">{model.compliance}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <div className="text-muted-foreground mb-1">Strengths</div>
                      <div className="space-y-1">
                        {model.strengths.map((strength, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs mr-1">
                            {strength}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground mb-1">Areas for Improvement</div>
                      <div className="space-y-1">
                        {model.weaknesses.map((weakness, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs mr-1">
                            {weakness}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground">
                    Last tested: {new Date(model.lastTested).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target size={20} />
                Configure Model Comparison
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground">Select Models to Compare</label>
                    <div className="mt-2 space-y-2">
                      {availableModels.map((model) => (
                        <div key={model.modelName} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id={model.modelName}
                            checked={selectedModels.includes(model.modelName)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedModels(prev => [...prev, model.modelName])
                              } else {
                                setSelectedModels(prev => prev.filter(m => m !== model.modelName))
                              }
                            }}
                            className="rounded border-input"
                          />
                          <label htmlFor={model.modelName} className="text-sm">
                            {model.modelName} ({model.provider})
                          </label>
                          <Badge variant="outline" className="text-xs">
                            {model.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground">Regulatory Standard</label>
                    <Select value={selectedRegulation} onValueChange={setSelectedRegulation}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select regulation" />
                      </SelectTrigger>
                      <SelectContent>
                        {regulations.map((reg) => (
                          <SelectItem key={reg.value} value={reg.value}>
                            {reg.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground">Test Document Content</label>
                    <Textarea
                      placeholder="Paste a sample document or SOP for analysis comparison..."
                      value={testDocument}
                      onChange={(e) => setTestDocument(e.target.value)}
                      className="mt-2 h-32 resize-none"
                    />
                  </div>

                  <Alert>
                    <AlertTriangle size={16} />
                    <AlertDescription className="text-xs">
                      Test documents are not stored and are used only for comparison purposes. 
                      Ensure no confidential information is included.
                    </AlertDescription>
                  </Alert>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="text-sm text-muted-foreground">
                  {selectedModels.length} models selected for comparison
                </div>
                <Button 
                  onClick={runComparison} 
                  disabled={isRunning || selectedModels.length < 2 || !testDocument.trim()}
                  className="flex items-center gap-2"
                >
                  {isRunning ? (
                    <>
                      <Clock size={16} className="animate-spin" />
                      Running Analysis...
                    </>
                  ) : (
                    <>
                      <PlayCircle size={16} />
                      Run Comparison
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="space-y-6">
          {comparisonHistory.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <BarChart size={48} className="mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No Comparison Results</h3>
                <p className="text-muted-foreground text-sm">
                  Run your first model comparison to see detailed performance analysis here.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {comparisonHistory.map((result) => (
                <Card key={result.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">
                        {result.regulation.toUpperCase()} - {result.documentType}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {new Date(result.timestamp).toLocaleDateString()}
                        </Badge>
                        <Button size="sm" variant="outline">
                          <Download size={14} className="mr-1" />
                          Export
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                      {result.models.map((model) => (
                        <div key={model.modelName} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-medium">{model.modelName}</h4>
                            <Badge 
                              variant={model.qualityScore >= 90 ? 'default' : 
                                     model.qualityScore >= 80 ? 'secondary' : 'outline'}
                              className="text-xs"
                            >
                              {model.qualityScore}% Quality
                            </Badge>
                          </div>
                          
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Total Findings:</span>
                              <span className="font-medium">{model.findings}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Critical:</span>
                              <span className="font-medium text-destructive">{model.criticalFindings}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Confidence:</span>
                              <span className="font-medium">{model.confidence}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Time:</span>
                              <span className="font-medium">{model.processingTime}s</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Cost:</span>
                              <span className="font-medium">${(model.cost/100).toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {result.goldStandardAccuracy && (
                      <div className="mt-4 p-3 bg-muted rounded-lg">
                        <div className="text-sm">
                          <span className="text-muted-foreground">Gold Standard Accuracy:</span>
                          <span className="font-medium ml-2">{result.goldStandardAccuracy}%</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="performance">
          <ModelPerformanceDashboard />
        </TabsContent>

        <TabsContent value="benchmarks" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendUp size={20} />
                  Performance Benchmarks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Accuracy Benchmark (Target: 90%+)</span>
                      <span className="font-medium">Industry Standard</span>
                    </div>
                    <div className="space-y-2">
                      {modelData.filter(m => m.status === 'active').map((model) => (
                        <div key={model.modelName} className="flex items-center gap-2">
                          <span className="text-xs w-24 truncate">{model.modelName}</span>
                          <Progress value={model.accuracy} className="flex-1 h-2" />
                          <span className="text-xs font-medium w-12 text-right">
                            {model.accuracy}%
                          </span>
                          {model.accuracy >= 90 && <CheckCircle size={14} className="text-green-600" />}
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Compliance Score (Target: 95%+)</span>
                      <span className="font-medium">Regulatory Adherence</span>
                    </div>
                    <div className="space-y-2">
                      {modelData.filter(m => m.status === 'active').map((model) => (
                        <div key={model.modelName} className="flex items-center gap-2">
                          <span className="text-xs w-24 truncate">{model.modelName}</span>
                          <Progress value={model.compliance} className="flex-1 h-2" />
                          <span className="text-xs font-medium w-12 text-right">
                            {model.compliance}%
                          </span>
                          {model.compliance >= 95 && <CheckCircle size={14} className="text-green-600" />}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap size={20} />
                  Model Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle size={16} className="text-green-600" />
                    <span className="font-medium text-green-800 dark:text-green-200">
                      Production Recommended
                    </span>
                  </div>
                  <div className="text-sm text-green-700 dark:text-green-300">
                    <strong>GPT-4o</strong> - Highest accuracy and compliance scores. 
                    Best for critical regulatory analysis despite higher cost.
                  </div>
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-2 mb-2">
                    <Target size={16} className="text-blue-600" />
                    <span className="font-medium text-blue-800 dark:text-blue-200">
                      Cost-Optimized
                    </span>
                  </div>
                  <div className="text-sm text-blue-700 dark:text-blue-300">
                    <strong>Claude-3 Sonnet</strong> - Excellent balance of performance 
                    and cost. Suitable for high-volume analysis workflows.
                  </div>
                </div>

                <div className="p-4 bg-accent/10 rounded-lg border border-accent/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock size={16} className="text-accent" />
                    <span className="font-medium text-accent-foreground">
                      Speed Optimized
                    </span>
                  </div>
                  <div className="text-sm text-accent-foreground/80">
                    <strong>GPT-4o Mini</strong> - Fastest processing for initial 
                    screening and preliminary analysis workflows.
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