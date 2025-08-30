import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Pill, 
  FlaskConical, 
  Shield, 
  PlayCircle, 
  Clock, 
  CheckCircle,
  AlertTriangle,
  Zap,
  Target,
  TrendUp,
  Download,
  Activity,
  Microscope,
  FileText,
  BarChart
} from '@phosphor-icons/react'
import { toast } from 'sonner'

interface PharmaceuticalModel {
  id: string
  name: string
  provider: string
  specialty: string[]
  accuracy: number
  speed: number
  cost: number
  compliance: number
  lastValidated: string
  supportedRegulations: string[]
  status: 'active' | 'beta' | 'development'
  strengths: string[]
  limitations: string[]
  validationScore: number
}

interface AnalysisResult {
  id: string
  modelName: string
  documentType: string
  regulation: string
  findings: {
    category: string
    severity: 'critical' | 'major' | 'minor'
    description: string
    reference: string
    confidence: number
  }[]
  overallScore: number
  processingTime: number
  cost: number
  timestamp: string
}

export function PharmaceuticalAI() {
  const [activeTab, setActiveTab] = useState('models')
  const [selectedModel, setSelectedModel] = useState<string>('')
  const [selectedRegulation, setSelectedRegulation] = useState('21-cfr-211')
  const [documentType, setDocumentType] = useState('batch-record')
  const [analysisText, setAnalysisText] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  
  const [pharmaModels, setPharmaModels] = useKV('pharma-ai-models', [] as PharmaceuticalModel[])
  const [analysisHistory, setAnalysisHistory] = useKV('pharma-analysis-history', [] as AnalysisResult[])

  // Initialize pharmaceutical AI models
  useEffect(() => {
    if (pharmaModels.length === 0) {
      setPharmaModels([
        {
          id: 'pharmagpt-4',
          name: 'PharmaGPT-4',
          provider: 'BioPharma AI',
          specialty: ['cGMP Manufacturing', 'Batch Records', 'Validation', 'Quality Control'],
          accuracy: 97.1,
          speed: 7.2,
          cost: 120,
          compliance: 98.5,
          lastValidated: '2024-01-15',
          supportedRegulations: ['21-cfr-211', '21-cfr-210', 'ich-q7', 'eu-gmp', 'pic-s-gmp'],
          status: 'active',
          strengths: ['Deep cGMP Knowledge', 'Batch Record Analysis', 'Manufacturing Validation'],
          limitations: ['High Cost', 'Limited to Manufacturing'],
          validationScore: 95.2
        },
        {
          id: 'regulatory-ai-pro',
          name: 'RegulatoryAI Pro',
          provider: 'MedTech Solutions',
          specialty: ['FDA Submissions', 'Clinical Trials', 'Regulatory Strategy', 'CMC Sections'],
          accuracy: 95.8,
          speed: 9.1,
          cost: 95,
          compliance: 97.2,
          lastValidated: '2024-01-15',
          supportedRegulations: ['21-cfr-314', '21-cfr-320', 'ich-q8', 'ich-q9', 'ich-q10'],
          status: 'active',
          strengths: ['FDA Expertise', 'Submission Quality', 'CMC Analysis'],
          limitations: ['Complex Setup', 'Learning Curve'],
          validationScore: 93.7
        },
        {
          id: 'pharmaclaude',
          name: 'PharmaClaude',
          provider: 'Anthropic (Specialized)',
          specialty: ['Drug Safety', 'Pharmacovigilance', 'CAPA', 'Risk Assessment'],
          accuracy: 93.4,
          speed: 11.8,
          cost: 75,
          compliance: 95.7,
          lastValidated: '2024-01-15',
          supportedRegulations: ['21-cfr-211', 'ich-q9', 'ich-q10', 'who-gmp'],
          status: 'beta',
          strengths: ['Safety Focus', 'CAPA Analysis', 'Risk Management'],
          limitations: ['Beta Stage', 'Limited Manufacturing'],
          validationScore: 91.4
        },
        {
          id: 'biocompliance-ai',
          name: 'BioCompliance AI',
          provider: 'Regulatory Sciences Inc',
          specialty: ['Biologics', 'Cell Therapy', 'Gene Therapy', 'Biosimilars'],
          accuracy: 92.7,
          speed: 10.5,
          cost: 85,
          compliance: 94.8,
          lastValidated: '2024-01-15',
          supportedRegulations: ['21-cfr-600', '21-cfr-314', 'ich-q11', 'ich-q12'],
          status: 'active',
          strengths: ['Biologics Expertise', 'Advanced Therapies', 'Quality by Design'],
          limitations: ['Newer Platform', 'Limited Training Data'],
          validationScore: 89.6
        },
        {
          id: 'api-master-ai',
          name: 'API Master AI',
          provider: 'Chemical Insights',
          specialty: ['API Manufacturing', 'Chemical Processes', 'Impurity Analysis', 'Process Validation'],
          accuracy: 94.3,
          speed: 8.7,
          cost: 110,
          compliance: 96.1,
          lastValidated: '2024-01-15',
          supportedRegulations: ['ich-q7', 'ich-q11', '21-cfr-211', 'eu-gmp'],
          status: 'development',
          strengths: ['API Focus', 'Chemical Analysis', 'Process Understanding'],
          limitations: ['Development Stage', 'Limited Scope'],
          validationScore: 87.3
        }
      ])
    }
  }, [pharmaModels.length, setPharmaModels])

  const documentTypes = [
    { value: 'batch-record', label: 'Batch Manufacturing Records' },
    { value: 'sop', label: 'Standard Operating Procedures' },
    { value: 'validation-protocol', label: 'Validation Protocols' },
    { value: 'analytical-method', label: 'Analytical Methods' },
    { value: 'stability-protocol', label: 'Stability Testing Protocols' },
    { value: 'quality-manual', label: 'Quality Manuals' },
    { value: 'deviation-report', label: 'Deviation Reports' },
    { value: 'change-control', label: 'Change Control Records' },
    { value: 'supplier-qualification', label: 'Supplier Qualification' },
    { value: 'cleaning-validation', label: 'Cleaning Validation' }
  ]

  const regulations = [
    { value: '21-cfr-211', label: '21 CFR 211 - Current Good Manufacturing Practice' },
    { value: '21-cfr-210', label: '21 CFR 210 - Drug Manufacturing Standards' },
    { value: 'ich-q7', label: 'ICH Q7 - Good Manufacturing Practice for APIs' },
    { value: 'ich-q8', label: 'ICH Q8 - Pharmaceutical Development' },
    { value: 'ich-q9', label: 'ICH Q9 - Quality Risk Management' },
    { value: 'ich-q10', label: 'ICH Q10 - Quality System' },
    { value: '21-cfr-314', label: '21 CFR 314 - New Drug Applications' },
    { value: '21-cfr-600', label: '21 CFR 600 - Biological Products' },
    { value: 'eu-gmp', label: 'EU GMP Guidelines' },
    { value: 'pic-s-gmp', label: 'PIC/S GMP Guidelines' }
  ]

  const runPharmaceuticalAnalysis = async () => {
    if (!selectedModel || !analysisText.trim()) {
      toast.error('Please select a model and provide text to analyze')
      return
    }

    setIsAnalyzing(true)
    
    try {
      // Simulate pharmaceutical analysis
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      const model = pharmaModels.find(m => m.id === selectedModel)
      if (!model) throw new Error('Model not found')

      // Generate realistic pharmaceutical findings
      const findings = [
        {
          category: 'Manufacturing Controls',
          severity: 'critical' as const,
          description: 'Critical process parameter monitoring not adequately documented',
          reference: '21 CFR 211.100(a)',
          confidence: 94
        },
        {
          category: 'Documentation',
          severity: 'major' as const,
          description: 'Batch record missing required operator signatures',
          reference: '21 CFR 211.188(b)',
          confidence: 92
        },
        {
          category: 'Equipment Qualification',
          severity: 'minor' as const,
          description: 'Calibration due dates not clearly indicated on equipment',
          reference: '21 CFR 211.68(a)',
          confidence: 87
        },
        {
          category: 'Quality Control',
          severity: 'major' as const,
          description: 'In-process testing frequency does not align with validation protocol',
          reference: '21 CFR 211.110(a)',
          confidence: 91
        }
      ]

      const result: AnalysisResult = {
        id: `analysis-${Date.now()}`,
        modelName: model.name,
        documentType,
        regulation: selectedRegulation,
        findings,
        overallScore: Math.floor(75 + Math.random() * 20),
        processingTime: Math.floor(15 + Math.random() * 45),
        cost: Math.floor(model.cost * 0.8 + Math.random() * model.cost * 0.4),
        timestamp: new Date().toISOString()
      }

      setAnalysisHistory(prev => [result, ...prev.slice(0, 9)])
      toast.success(`Pharmaceutical analysis completed with ${findings.length} findings`)
      
    } catch (error) {
      toast.error('Analysis failed. Please try again.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const getModelsBySpecialty = (specialty: string) => {
    return pharmaModels.filter(model => 
      model.specialty.some(s => s.toLowerCase().includes(specialty.toLowerCase()))
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Pill size={24} className="text-primary" />
            Pharmaceutical AI Models
          </h2>
          <p className="text-muted-foreground mt-1">
            Specialized AI models for pharmaceutical manufacturing and regulatory compliance
          </p>
        </div>
        <Badge variant="outline" className="px-3 py-1">
          {pharmaModels.filter(m => m.status === 'active').length} Production Models
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="models">Model Library</TabsTrigger>
          <TabsTrigger value="analysis">Run Analysis</TabsTrigger>
          <TabsTrigger value="results">Analysis Results</TabsTrigger>
          <TabsTrigger value="specialties">Specialties</TabsTrigger>
          <TabsTrigger value="validation">Model Validation</TabsTrigger>
        </TabsList>

        <TabsContent value="models" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {pharmaModels.map((model) => (
              <Card key={model.id} className={model.status === 'development' ? 'opacity-75' : ''}>
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
                  <div className="flex flex-wrap gap-1 mt-2">
                    {model.specialty.slice(0, 2).map((spec, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {spec}
                      </Badge>
                    ))}
                    {model.specialty.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{model.specialty.length - 2} more
                      </Badge>
                    )}
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
                      <div className="text-sm text-muted-foreground">Validation Score</div>
                      <div className="flex items-center gap-2">
                        <Progress value={model.validationScore} className="flex-1 h-2" />
                        <span className="text-sm font-medium">{model.validationScore}%</span>
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
                      <div className="text-sm text-muted-foreground">Cost</div>
                      <div className="flex items-center gap-2">
                        <Progress value={100 - model.cost} className="flex-1 h-2" />
                        <span className="text-sm font-medium">${model.cost}/analysis</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-muted-foreground mb-2">Supported Regulations</div>
                    <div className="flex flex-wrap gap-1">
                      {model.supportedRegulations.slice(0, 3).map((reg, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {reg.toUpperCase()}
                        </Badge>
                      ))}
                      {model.supportedRegulations.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{model.supportedRegulations.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground">
                    Last validated: {new Date(model.lastValidated).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FlaskConical size={20} />
                Pharmaceutical Document Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground">AI Model</label>
                    <Select value={selectedModel} onValueChange={setSelectedModel}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select pharmaceutical AI model" />
                      </SelectTrigger>
                      <SelectContent>
                        {pharmaModels.filter(m => m.status === 'active' || m.status === 'beta').map((model) => (
                          <SelectItem key={model.id} value={model.id}>
                            {model.name} - {model.provider}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground">Document Type</label>
                    <Select value={documentType} onValueChange={setDocumentType}>
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {documentTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground">Regulatory Standard</label>
                    <Select value={selectedRegulation} onValueChange={setSelectedRegulation}>
                      <SelectTrigger className="mt-2">
                        <SelectValue />
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
                    <label className="text-sm font-medium text-foreground">Document Content</label>
                    <Textarea
                      placeholder="Paste pharmaceutical document content for compliance analysis..."
                      value={analysisText}
                      onChange={(e) => setAnalysisText(e.target.value)}
                      className="mt-2 h-40 resize-none"
                    />
                  </div>

                  <Alert>
                    <Shield size={16} />
                    <AlertDescription className="text-xs">
                      All analysis is performed locally. Document content is processed securely 
                      and not stored or transmitted to external servers.
                    </AlertDescription>
                  </Alert>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="text-sm text-muted-foreground">
                  {selectedModel ? `Using ${pharmaModels.find(m => m.id === selectedModel)?.name}` : 'Select a model to begin'}
                </div>
                <Button 
                  onClick={runPharmaceuticalAnalysis} 
                  disabled={isAnalyzing || !selectedModel || !analysisText.trim()}
                  className="flex items-center gap-2"
                >
                  {isAnalyzing ? (
                    <>
                      <Clock size={16} className="animate-spin" />
                      Analyzing Document...
                    </>
                  ) : (
                    <>
                      <Microscope size={16} />
                      Run Pharmaceutical Analysis
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="space-y-6">
          {analysisHistory.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <FileText size={48} className="mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No Analysis Results</h3>
                <p className="text-muted-foreground text-sm">
                  Run your first pharmaceutical analysis to see detailed compliance findings here.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {analysisHistory.map((result) => (
                <Card key={result.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">
                        {result.regulation.toUpperCase()} Analysis - {documentTypes.find(t => t.value === result.documentType)?.label}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={result.overallScore >= 90 ? 'default' : 
                                 result.overallScore >= 75 ? 'secondary' : 'destructive'}
                          className="text-xs"
                        >
                          {result.overallScore}% Compliance
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {new Date(result.timestamp).toLocaleDateString()}
                        </Badge>
                        <Button size="sm" variant="outline">
                          <Download size={14} className="mr-1" />
                          Export Report
                        </Button>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Analyzed by {result.modelName} • {result.findings.length} findings identified
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Processing Time:</span>
                        <span className="ml-2 font-medium">{result.processingTime}s</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Analysis Cost:</span>
                        <span className="ml-2 font-medium">${(result.cost/100).toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Critical Findings:</span>
                        <span className="ml-2 font-medium text-destructive">
                          {result.findings.filter(f => f.severity === 'critical').length}
                        </span>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <h4 className="font-medium">Key Findings:</h4>
                      {result.findings.map((finding, idx) => (
                        <div key={idx} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Badge 
                                variant={finding.severity === 'critical' ? 'destructive' : 
                                        finding.severity === 'major' ? 'secondary' : 'outline'}
                                className="text-xs"
                              >
                                {finding.severity.toUpperCase()}
                              </Badge>
                              <span className="font-medium text-sm">{finding.category}</span>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {finding.confidence}% confidence
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-1">{finding.description}</p>
                          <p className="text-xs text-muted-foreground">Reference: {finding.reference}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="specialties" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FlaskConical size={20} />
                  Manufacturing & cGMP
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {getModelsBySpecialty('Manufacturing').map((model) => (
                  <div key={model.id} className="flex items-center justify-between p-2 border rounded">
                    <div>
                      <div className="font-medium text-sm">{model.name}</div>
                      <div className="text-xs text-muted-foreground">{model.provider}</div>
                    </div>
                    <Badge variant={model.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                      {model.accuracy}% accuracy
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield size={20} />
                  Regulatory Submissions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {getModelsBySpecialty('FDA').map((model) => (
                  <div key={model.id} className="flex items-center justify-between p-2 border rounded">
                    <div>
                      <div className="font-medium text-sm">{model.name}</div>
                      <div className="text-xs text-muted-foreground">{model.provider}</div>
                    </div>
                    <Badge variant={model.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                      {model.compliance}% compliance
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Microscope size={20} />
                  Biologics & Advanced Therapies
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {getModelsBySpecialty('Biologics').map((model) => (
                  <div key={model.id} className="flex items-center justify-between p-2 border rounded">
                    <div>
                      <div className="font-medium text-sm">{model.name}</div>
                      <div className="text-xs text-muted-foreground">{model.provider}</div>
                    </div>
                    <Badge variant={model.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                      {model.validationScore}% validated
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity size={20} />
                  Quality & Risk Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {getModelsBySpecialty('Quality').concat(getModelsBySpecialty('Risk')).map((model) => (
                  <div key={model.id} className="flex items-center justify-between p-2 border rounded">
                    <div>
                      <div className="font-medium text-sm">{model.name}</div>
                      <div className="text-xs text-muted-foreground">{model.provider}</div>
                    </div>
                    <Badge variant={model.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                      {model.speed} speed score
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="validation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle size={20} />
                Model Validation Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pharmaModels.map((model) => (
                  <div key={model.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="font-medium">{model.name}</div>
                        <div className="text-sm text-muted-foreground">{model.provider}</div>
                      </div>
                      <Badge 
                        variant={model.validationScore >= 95 ? 'default' : 
                                model.validationScore >= 85 ? 'secondary' : 'outline'}
                        className="text-xs"
                      >
                        {model.validationScore}% Validated
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 mb-3">
                      <div>
                        <div className="text-xs text-muted-foreground">Accuracy</div>
                        <Progress value={model.accuracy} className="h-2 mt-1" />
                        <div className="text-xs mt-1">{model.accuracy}%</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Compliance</div>
                        <Progress value={model.compliance} className="h-2 mt-1" />
                        <div className="text-xs mt-1">{model.compliance}%</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Validation</div>
                        <Progress value={model.validationScore} className="h-2 mt-1" />
                        <div className="text-xs mt-1">{model.validationScore}%</div>
                      </div>
                    </div>

                    <div className="text-xs text-muted-foreground">
                      Last validation: {new Date(model.lastValidated).toLocaleDateString()} • 
                      Supported regulations: {model.supportedRegulations.length}
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