import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  CheckCircle,
  AlertTriangle,
  Activity,
  Target,
  TrendUp,
  Clock,
  Shield,
  FileText,
  BarChart,
  Zap,
  Globe,
  Microscope,
  Brain
} from '@phosphor-icons/react'

interface ValidationResult {
  modelId: string
  modelName: string
  regulation: string
  testDataset: string
  precision: number
  recall: number
  f1Score: number
  accuracy: number
  processingTime: number
  costPerAnalysis: number
  validationDate: string
  goldStandardComparison: number
  humanExpertAgreement: number
  status: 'passed' | 'warning' | 'failed'
}

interface ComplianceMetric {
  framework: string
  requirement: string
  status: 'compliant' | 'partial' | 'non-compliant'
  evidenceCount: number
  lastValidated: string
  nextReview: string
  riskLevel: 'low' | 'medium' | 'high'
}

export function ValidationAndPerformance() {
  const [activeTab, setActiveTab] = useState('validation')
  const [validationResults, setValidationResults] = useKV('ai-validation-results', [] as ValidationResult[])
  const [complianceMetrics, setComplianceMetrics] = useKV('compliance-metrics', [] as ComplianceMetric[])

  // Initialize validation data
  useEffect(() => {
    if (validationResults.length === 0) {
      setValidationResults([
        {
          modelId: 'gpt-5',
          modelName: 'GPT-5',
          regulation: 'FDA 21 CFR 820',
          testDataset: 'Golden QMS Dataset v2.1',
          precision: 94.2,
          recall: 91.8,
          f1Score: 93.0,
          accuracy: 95.1,
          processingTime: 45.2,
          costPerAnalysis: 0.85,
          validationDate: '2024-01-15',
          goldStandardComparison: 96.3,
          humanExpertAgreement: 92.7,
          status: 'passed'
        },
        {
          modelId: 'claude-4',
          modelName: 'Claude 4',
          regulation: 'EU MDR 2017/745',
          testDataset: 'EU Medical Device Test Set',
          precision: 91.5,
          recall: 93.2,
          f1Score: 92.3,
          accuracy: 93.8,
          processingTime: 38.1,
          costPerAnalysis: 0.72,
          validationDate: '2024-01-15',
          goldStandardComparison: 94.1,
          humanExpertAgreement: 90.4,
          status: 'passed'
        },
        {
          modelId: 'pharmagpt-4',
          modelName: 'PharmaGPT-4',
          regulation: 'ICH Q7 GMP',
          testDataset: 'Pharmaceutical Manufacturing Dataset',
          precision: 97.8,
          recall: 96.1,
          f1Score: 96.9,
          accuracy: 97.3,
          processingTime: 52.7,
          costPerAnalysis: 1.25,
          validationDate: '2024-01-15',
          goldStandardComparison: 98.2,
          humanExpertAgreement: 95.8,
          status: 'passed'
        },
        {
          modelId: 'gemini-2-5-pro',
          modelName: 'Gemini 2.5 Pro',
          regulation: 'PMDA Japan Guidelines',
          testDataset: 'Japanese Regulatory Dataset',
          precision: 89.3,
          recall: 87.6,
          f1Score: 88.4,
          accuracy: 90.1,
          processingTime: 31.5,
          costPerAnalysis: 0.58,
          validationDate: '2024-01-15',
          goldStandardComparison: 91.7,
          humanExpertAgreement: 86.2,
          status: 'warning'
        },
        {
          modelId: 'grok-2',
          modelName: 'Grok 2',
          regulation: 'FDA 21 CFR 211',
          testDataset: 'cGMP Manufacturing Records',
          precision: 85.7,
          recall: 82.3,
          f1Score: 83.9,
          accuracy: 87.2,
          processingTime: 18.9,
          costPerAnalysis: 0.42,
          validationDate: '2024-01-15',
          goldStandardComparison: 88.5,
          humanExpertAgreement: 81.6,
          status: 'warning'
        }
      ])
    }
  }, [validationResults.length, setValidationResults])

  // Initialize compliance metrics
  useEffect(() => {
    if (complianceMetrics.length === 0) {
      setComplianceMetrics([
        {
          framework: '21 CFR Part 11',
          requirement: 'Audit Trail Integrity',
          status: 'compliant',
          evidenceCount: 25,
          lastValidated: '2024-01-15',
          nextReview: '2024-04-15',
          riskLevel: 'low'
        },
        {
          framework: '21 CFR Part 11',
          requirement: 'Electronic Signatures',
          status: 'compliant',
          evidenceCount: 18,
          lastValidated: '2024-01-15',
          nextReview: '2024-04-15',
          riskLevel: 'low'
        },
        {
          framework: 'ISO 13485',
          requirement: 'Risk Management Process',
          status: 'compliant',
          evidenceCount: 32,
          lastValidated: '2024-01-12',
          nextReview: '2024-07-12',
          riskLevel: 'medium'
        },
        {
          framework: 'GDPR',
          requirement: 'Data Processing Records',
          status: 'compliant',
          evidenceCount: 15,
          lastValidated: '2024-01-10',
          nextReview: '2024-04-10',
          riskLevel: 'high'
        },
        {
          framework: 'FDA QSR',
          requirement: 'Software Validation',
          status: 'partial',
          evidenceCount: 12,
          lastValidated: '2024-01-08',
          nextReview: '2024-02-08',
          riskLevel: 'medium'
        }
      ])
    }
  }, [complianceMetrics.length, setComplianceMetrics])

  const getValidationSummary = () => {
    const passed = validationResults.filter(r => r.status === 'passed').length
    const warning = validationResults.filter(r => r.status === 'warning').length
    const failed = validationResults.filter(r => r.status === 'failed').length
    
    return { passed, warning, failed, total: validationResults.length }
  }

  const getComplianceSummary = () => {
    const compliant = complianceMetrics.filter(m => m.status === 'compliant').length
    const partial = complianceMetrics.filter(m => m.status === 'partial').length
    const nonCompliant = complianceMetrics.filter(m => m.status === 'non-compliant').length
    
    return { compliant, partial, nonCompliant, total: complianceMetrics.length }
  }

  const validationSummary = getValidationSummary()
  const complianceSummary = getComplianceSummary()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Target size={24} className="text-primary" />
            AI Validation & Performance Dashboard
          </h2>
          <p className="text-muted-foreground mt-1">
            Comprehensive validation results and compliance metrics for all AI models
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="px-3 py-1">
            Last Updated: {new Date().toLocaleDateString()}
          </Badge>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Validation Status</p>
                <p className="text-2xl font-bold text-foreground">
                  {Math.round((validationSummary.passed / validationSummary.total) * 100)}%
                </p>
              </div>
              <CheckCircle size={24} className="text-green-600" />
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              {validationSummary.passed} of {validationSummary.total} models passed
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Compliance Score</p>
                <p className="text-2xl font-bold text-foreground">
                  {Math.round((complianceSummary.compliant / complianceSummary.total) * 100)}%
                </p>
              </div>
              <Shield size={24} className="text-blue-600" />
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              {complianceSummary.compliant} of {complianceSummary.total} requirements met
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Accuracy</p>
                <p className="text-2xl font-bold text-foreground">
                  {Math.round(validationResults.reduce((sum, r) => sum + r.accuracy, 0) / validationResults.length)}%
                </p>
              </div>
              <Target size={24} className="text-purple-600" />
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              Across {validationResults.length} validated models
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Expert Agreement</p>
                <p className="text-2xl font-bold text-foreground">
                  {Math.round(validationResults.reduce((sum, r) => sum + r.humanExpertAgreement, 0) / validationResults.length)}%
                </p>
              </div>
              <Brain size={24} className="text-orange-600" />
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              Human expert validation consensus
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="validation">AI Model Validation</TabsTrigger>
          <TabsTrigger value="performance">Performance Metrics</TabsTrigger>
          <TabsTrigger value="compliance">Compliance Status</TabsTrigger>
          <TabsTrigger value="reports">Validation Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="validation" className="space-y-6">
          <div className="space-y-4">
            {validationResults.map((result) => (
              <Card key={`${result.modelId}-${result.regulation}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      {result.modelName} - {result.regulation}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={result.status === 'passed' ? 'default' : 
                                result.status === 'warning' ? 'secondary' : 'destructive'}
                        className="text-xs"
                      >
                        {result.status.toUpperCase()}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {result.testDataset}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Validated: {new Date(result.validationDate).toLocaleDateString()}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Precision</div>
                      <div className="flex items-center gap-2">
                        <Progress value={result.precision} className="flex-1 h-2" />
                        <span className="text-sm font-medium">{result.precision}%</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Recall</div>
                      <div className="flex items-center gap-2">
                        <Progress value={result.recall} className="flex-1 h-2" />
                        <span className="text-sm font-medium">{result.recall}%</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">F1 Score</div>
                      <div className="flex items-center gap-2">
                        <Progress value={result.f1Score} className="flex-1 h-2" />
                        <span className="text-sm font-medium">{result.f1Score}%</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Accuracy</div>
                      <div className="flex items-center gap-2">
                        <Progress value={result.accuracy} className="flex-1 h-2" />
                        <span className="text-sm font-medium">{result.accuracy}%</span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Processing Time:</span>
                      <span className="ml-2 font-medium">{result.processingTime}s</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Cost/Analysis:</span>
                      <span className="ml-2 font-medium">${result.costPerAnalysis}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Gold Standard:</span>
                      <span className="ml-2 font-medium">{result.goldStandardComparison}%</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Expert Agreement:</span>
                      <span className="ml-2 font-medium">{result.humanExpertAgreement}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart size={20} />
                  Model Accuracy Comparison
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {validationResults
                  .sort((a, b) => b.accuracy - a.accuracy)
                  .map((result) => (
                    <div key={result.modelId} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{result.modelName}</span>
                        <span>{result.accuracy}%</span>
                      </div>
                      <Progress value={result.accuracy} className="h-2" />
                    </div>
                  ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock size={20} />
                  Processing Speed Comparison
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {validationResults
                  .sort((a, b) => a.processingTime - b.processingTime)
                  .map((result) => (
                    <div key={result.modelId} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{result.modelName}</span>
                        <span>{result.processingTime}s</span>
                      </div>
                      <Progress value={100 - (result.processingTime / 60) * 100} className="h-2" />
                    </div>
                  ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap size={20} />
                  Cost Efficiency
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {validationResults
                  .sort((a, b) => a.costPerAnalysis - b.costPerAnalysis)
                  .map((result) => (
                    <div key={result.modelId} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{result.modelName}</span>
                        <span>${result.costPerAnalysis}</span>
                      </div>
                      <Progress value={100 - (result.costPerAnalysis / 2) * 100} className="h-2" />
                    </div>
                  ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain size={20} />
                  Expert Agreement Rates
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {validationResults
                  .sort((a, b) => b.humanExpertAgreement - a.humanExpertAgreement)
                  .map((result) => (
                    <div key={result.modelId} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{result.modelName}</span>
                        <span>{result.humanExpertAgreement}%</span>
                      </div>
                      <Progress value={result.humanExpertAgreement} className="h-2" />
                    </div>
                  ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-6">
          <div className="space-y-4">
            {complianceMetrics.map((metric, idx) => (
              <Card key={idx}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-medium">{metric.framework} - {metric.requirement}</h4>
                      <div className="text-sm text-muted-foreground">
                        Last validated: {new Date(metric.lastValidated).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={metric.status === 'compliant' ? 'default' : 
                                metric.status === 'partial' ? 'secondary' : 'destructive'}
                        className="text-xs"
                      >
                        {metric.status.toUpperCase()}
                      </Badge>
                      <Badge 
                        variant={metric.riskLevel === 'low' ? 'outline' : 
                                metric.riskLevel === 'medium' ? 'secondary' : 'destructive'}
                        className="text-xs"
                      >
                        {metric.riskLevel.toUpperCase()} RISK
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Evidence Documents:</span>
                      <span className="ml-2 font-medium">{metric.evidenceCount}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Next Review:</span>
                      <span className="ml-2 font-medium">{new Date(metric.nextReview).toLocaleDateString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText size={20} />
                Validation Reports
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <CheckCircle size={16} />
                <AlertDescription>
                  All validation reports are generated automatically and comply with FDA Software Validation guidance 
                  and ISO 13485 requirements. Reports include detailed test results, traceability matrices, and risk assessments.
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                {[
                  { name: 'AI Model Validation Summary Report', date: '2024-01-15', status: 'approved' },
                  { name: 'Installation Qualification (IQ) Report', date: '2024-01-14', status: 'approved' },
                  { name: 'Operational Qualification (OQ) Report', date: '2024-01-13', status: 'approved' },
                  { name: 'Performance Qualification (PQ) Report', date: '2024-01-12', status: 'approved' },
                  { name: 'Traceability Matrix', date: '2024-01-15', status: 'approved' },
                  { name: 'Risk Assessment Report', date: '2024-01-10', status: 'approved' }
                ].map((report, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium text-sm">{report.name}</div>
                      <div className="text-xs text-muted-foreground">
                        Generated: {report.date}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {report.status.toUpperCase()}
                      </Badge>
                      <Button size="sm" variant="outline">
                        <FileText size={14} className="mr-1" />
                        View Report
                      </Button>
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