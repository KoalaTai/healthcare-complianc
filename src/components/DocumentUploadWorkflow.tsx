import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import {
  Upload,
  FileText,
  Brain,
  CheckCircle,
  Clock,
  AlertTriangle,
  Eye,
  Download,
  Trash2,
  Play,
  Pause,
  BarChart3,
  Shield,
  Globe,
  Target,
  BookOpen,
  Zap,
  Search,
  Filter,
  ArrowRight,
  Stack,
  FolderOpen,
  ListChecks,
  X
} from '@phosphor-icons/react'

interface AnalysisResult {
  id: string
  fileName: string
  fileType: string
  uploadDate: string
  status: 'pending' | 'analyzing' | 'complete' | 'error'
  progress: number
  analysisType: string
  regulatoryFramework: string
  complianceScore: number
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  keyFindings: string[]
  recommendations: string[]
  gapAnalysis: {
    missing: string[]
    nonCompliant: string[]
    needsReview: string[]
  }
  aiModel: string
  processingTime: string
}

interface BatchUploadItem {
  id: string
  file: File
  analysisType: string
  regulatoryFramework: string
  customInstructions?: string
  status: 'pending' | 'processing' | 'complete' | 'error'
  progress: number
}

export function DocumentUploadWorkflow() {
  const [uploadedDocuments, setUploadedDocuments] = useKV<AnalysisResult[]>('document-analyses', [])
  const [activeTab, setActiveTab] = useState('upload')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [analysisType, setAnalysisType] = useState('')
  const [regulatoryFramework, setRegulatoryFramework] = useState('')
  const [customInstructions, setCustomInstructions] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterFramework, setFilterFramework] = useState('all')
  const [batchMode, setBatchMode] = useState(false)
  const [batchItems, setBatchItems] = useState<BatchUploadItem[]>([])
  const [isBatchProcessing, setIsBatchProcessing] = useState(false)
  const [batchProgress, setBatchProgress] = useState(0)

  // Batch processing functions
  const addToBatch = () => {
    if (!analysisType || !regulatoryFramework) {
      toast.error('Please select analysis type and regulatory framework')
      return
    }

    const filesToAdd = batchMode && selectedFiles.length > 0 ? selectedFiles : (selectedFile ? [selectedFile] : [])
    
    if (filesToAdd.length === 0) {
      toast.error('Please select files to add to batch')
      return
    }

    const newBatchItems: BatchUploadItem[] = filesToAdd.map(file => ({
      id: `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      file,
      analysisType,
      regulatoryFramework,
      customInstructions,
      status: 'pending',
      progress: 0
    }))

    setBatchItems(current => [...current, ...newBatchItems])
    
    // Clear form
    setSelectedFile(null)
    setSelectedFiles([])
    setAnalysisType('')
    setRegulatoryFramework('')
    setCustomInstructions('')
    
    toast.success(`Added ${filesToAdd.length} document${filesToAdd.length > 1 ? 's' : ''} to batch`)
  }

  const removeBatchItem = (id: string) => {
    setBatchItems(current => current.filter(item => item.id !== id))
    toast.info('Document removed from batch')
  }

  const clearBatch = () => {
    setBatchItems([])
    toast.info('Batch cleared')
  }

  const processBatch = async () => {
    if (batchItems.length === 0) {
      toast.error('No documents in batch to process')
      return
    }

    setIsBatchProcessing(true)
    setBatchProgress(0)
    toast.info(`Starting batch analysis of ${batchItems.length} documents`)

    // Process each item sequentially to avoid overwhelming the system
    for (let i = 0; i < batchItems.length; i++) {
      const item = batchItems[i]
      
      // Update item status to processing
      setBatchItems(current => 
        current.map(batchItem => 
          batchItem.id === item.id ? { ...batchItem, status: 'processing' } : batchItem
        )
      )

      // Create analysis entry
      const newAnalysis: AnalysisResult = {
        id: `doc_${Date.now()}_${i}`,
        fileName: item.file.name,
        fileType: item.file.type || 'application/pdf',
        uploadDate: new Date().toISOString(),
        status: 'analyzing',
        progress: 0,
        analysisType: item.analysisType,
        regulatoryFramework: item.regulatoryFramework,
        complianceScore: 0,
        riskLevel: 'medium',
        keyFindings: [],
        recommendations: [],
        gapAnalysis: { missing: [], nonCompliant: [], needsReview: [] },
        aiModel: 'GPT-4 Regulatory Analysis Engine',
        processingTime: '0 minutes'
      }

      setUploadedDocuments((current) => [newAnalysis, ...current])

      // Simulate analysis with progress
      let progress = 0
      const analysisDuration = 3000 + Math.random() * 2000 // 3-5 seconds per document
      const progressInterval = setInterval(() => {
        progress += Math.random() * 15 + 5
        if (progress >= 100) {
          progress = 100
          clearInterval(progressInterval)
          
          // Complete analysis
          const completedAnalysis = {
            ...newAnalysis,
            status: 'complete' as const,
            progress: 100,
            complianceScore: Math.floor(Math.random() * 40) + 60,
            riskLevel: Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low' as const,
            keyFindings: [
              `Document structure aligns with ${item.regulatoryFramework} requirements`,
              'Critical validation procedures identified and documented',
              'Data integrity controls properly specified',
              'Change control processes adequately defined',
              'Training requirements clearly outlined'
            ],
            recommendations: [
              'Consider enhanced electronic signature workflows',
              'Implement additional audit trail documentation',
              'Strengthen data backup and recovery procedures',
              'Add regular compliance review checkpoints',
              'Enhance risk assessment documentation'
            ],
            gapAnalysis: {
              missing: ['Detailed validation protocols', 'Change control SOP'],
              nonCompliant: ['Insufficient audit trail depth'],
              needsReview: ['Data retention policies', 'Training documentation']
            },
            processingTime: `${Math.floor(Math.random() * 3) + 2} minutes`
          }

          setUploadedDocuments((current) => 
            current.map(doc => doc.id === newAnalysis.id ? completedAnalysis : doc)
          )

          // Update batch item
          setBatchItems(current => 
            current.map(batchItem => 
              batchItem.id === item.id ? { ...batchItem, status: 'complete', progress: 100 } : batchItem
            )
          )
        } else {
          setUploadedDocuments((current) => 
            current.map(doc => doc.id === newAnalysis.id ? {...doc, progress} : doc)
          )
          setBatchItems(current => 
            current.map(batchItem => 
              batchItem.id === item.id ? { ...batchItem, progress } : batchItem
            )
          )
        }
      }, analysisDuration / 20)

      // Update overall batch progress
      setBatchProgress(((i + 1) / batchItems.length) * 100)

      // Wait for current analysis to complete before starting next
      await new Promise(resolve => setTimeout(resolve, analysisDuration))
    }

    setIsBatchProcessing(false)
    toast.success(`Batch analysis completed! Processed ${batchItems.length} documents`)
    setActiveTab('results')
    
    // Clear completed batch after a delay
    setTimeout(() => {
      setBatchItems([])
    }, 2000)
  }

  // Simulate AI analysis workflow
  const runAIAnalysis = async () => {
    if (!selectedFile || !analysisType || !regulatoryFramework) {
      toast.error('Please complete all required fields')
      return
    }

    setIsAnalyzing(true)
    const newAnalysis: AnalysisResult = {
      id: `doc_${Date.now()}`,
      fileName: selectedFile.name,
      fileType: selectedFile.type || 'application/pdf',
      uploadDate: new Date().toISOString(),
      status: 'analyzing',
      progress: 0,
      analysisType,
      regulatoryFramework,
      complianceScore: 0,
      riskLevel: 'medium',
      keyFindings: [],
      recommendations: [],
      gapAnalysis: { missing: [], nonCompliant: [], needsReview: [] },
      aiModel: 'GPT-4 Regulatory Analysis Engine',
      processingTime: '0 minutes'
    }

    // Add to documents list
    setUploadedDocuments((current) => [newAnalysis, ...current])

    // Simulate analysis progress
    let progress = 0
    const progressInterval = setInterval(() => {
      progress += Math.random() * 15 + 5
      if (progress >= 100) {
        progress = 100
        clearInterval(progressInterval)
        
        // Complete analysis with results
        const completedAnalysis = {
          ...newAnalysis,
          status: 'complete' as const,
          progress: 100,
          complianceScore: Math.floor(Math.random() * 40) + 60, // 60-100
          riskLevel: Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low' as const,
          keyFindings: [
            `Document structure aligns with ${regulatoryFramework} requirements`,
            'Critical validation procedures identified and documented',
            'Data integrity controls properly specified',
            'Change control processes adequately defined',
            'Training requirements clearly outlined'
          ],
          recommendations: [
            'Consider enhanced electronic signature workflows',
            'Implement additional audit trail documentation',
            'Strengthen data backup and recovery procedures',
            'Add regular compliance review checkpoints',
            'Enhance risk assessment documentation'
          ],
          gapAnalysis: {
            missing: ['Detailed validation protocols', 'Change control SOP'],
            nonCompliant: ['Insufficient audit trail depth'],
            needsReview: ['Data retention policies', 'Training documentation']
          },
          processingTime: `${Math.floor(Math.random() * 5) + 2} minutes`
        }

        setUploadedDocuments((current) => 
          current.map(doc => doc.id === newAnalysis.id ? completedAnalysis : doc)
        )
        setIsAnalyzing(false)
        toast.success('AI analysis completed successfully!')
        setActiveTab('results')
      } else {
        setUploadedDocuments((current) => 
          current.map(doc => doc.id === newAnalysis.id ? {...doc, progress} : doc)
        )
      }
    }, 800)

    toast.info('AI analysis started. This may take a few minutes.')
  }

  const filteredDocuments = uploadedDocuments.filter(doc => {
    const matchesSearch = doc.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.analysisType.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFramework = filterFramework === 'all' || doc.regulatoryFramework === filterFramework
    return matchesSearch && matchesFramework
  })

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critical': return 'text-red-600 bg-red-50'
      case 'high': return 'text-orange-600 bg-orange-50'
      case 'medium': return 'text-yellow-600 bg-yellow-50'
      case 'low': return 'text-green-600 bg-green-50'
      default: return 'text-muted-foreground bg-muted'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'complete': return <CheckCircle className="text-green-600" />
      case 'analyzing': return <Clock className="text-blue-600 animate-spin" />
      case 'error': return <AlertTriangle className="text-red-600" />
      default: return <Clock className="text-muted-foreground" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Document Upload & AI Analysis</h2>
          <p className="text-muted-foreground mt-2">
            Upload regulatory documents for comprehensive AI-powered compliance analysis - now with batch processing
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="px-3 py-1">
            <Brain size={14} className="mr-1" />
            AI-Powered Analysis
          </Badge>
          <Badge variant="outline" className="px-3 py-1">
            <Stack size={14} className="mr-1" />
            Batch Processing
          </Badge>
          <Badge variant="outline" className="px-3 py-1">
            <Shield size={14} className="mr-1" />
            21 CFR Part 11 Compliant
          </Badge>
          {(batchItems.length > 0 || isBatchProcessing) && (
            <Badge variant="secondary" className="px-3 py-1 animate-pulse">
              <ListChecks size={14} className="mr-1" />
              {isBatchProcessing ? 'Processing...' : `${batchItems.length} Queued`}
            </Badge>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload size={16} />
            Upload Document
          </TabsTrigger>
          <TabsTrigger value="batch" className="flex items-center gap-2">
            <Stack size={16} />
            Batch Processing
          </TabsTrigger>
          <TabsTrigger value="results" className="flex items-center gap-2">
            <BarChart3 size={16} />
            Analysis Results
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <Clock size={16} />
            Document History
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <Target size={16} />
            Compliance Insights
          </TabsTrigger>
        </TabsList>

        {/* Upload Tab */}
        <TabsContent value="upload" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Upload size={20} />
                  Document Upload & Configuration
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant={batchMode ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setBatchMode(!batchMode)
                      setSelectedFile(null)
                      setSelectedFiles([])
                      toast.info(batchMode ? 'Single document mode enabled' : 'Batch mode enabled')
                    }}
                  >
                    <Stack size={16} className="mr-2" />
                    {batchMode ? 'Batch Mode' : 'Enable Batch'}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* File Upload */}
              <div className="space-y-2">
                <Label htmlFor="file-upload">
                  Regulatory Document{batchMode ? 's' : ''}
                  {batchMode && <span className="text-xs text-muted-foreground ml-2">(Select multiple files)</span>}
                </Label>
                <div className="border-2 border-dashed border-muted rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                  <input
                    id="file-upload"
                    type="file"
                    accept=".pdf,.doc,.docx,.txt"
                    multiple={batchMode}
                    onChange={(e) => {
                      const files = Array.from(e.target.files || [])
                      if (files.length > 0) {
                        if (batchMode) {
                          setSelectedFiles(files)
                          setSelectedFile(null)
                          toast.success(`Selected ${files.length} files for batch processing`)
                        } else {
                          setSelectedFile(files[0])
                          setSelectedFiles([])
                          toast.success(`Selected: ${files[0].name}`)
                        }
                      }
                    }}
                    className="hidden"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    {batchMode ? (
                      <Stack size={48} className="mx-auto mb-4 text-muted-foreground" />
                    ) : (
                      <FileText size={48} className="mx-auto mb-4 text-muted-foreground" />
                    )}
                    {(batchMode && selectedFiles.length > 0) ? (
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {selectedFiles.length} files selected for batch processing
                        </p>
                        <div className="text-xs text-muted-foreground space-y-1 mt-2 max-h-24 overflow-y-auto">
                          {selectedFiles.map((file, idx) => (
                            <div key={idx} className="flex items-center justify-between">
                              <span>{file.name}</span>
                              <span>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : selectedFile ? (
                      <div>
                        <p className="text-sm font-medium text-foreground">{selectedFile.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          Click to upload document{batchMode ? 's' : ''}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Supports PDF, Word, and Text files up to 50MB each
                          {batchMode && ' • Select multiple files for batch processing'}
                        </p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              {/* Analysis Configuration */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="analysis-type">Analysis Type</Label>
                  <Select value={analysisType} onValueChange={setAnalysisType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select analysis type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="compliance-review">Compliance Review</SelectItem>
                      <SelectItem value="gap-analysis">Gap Analysis</SelectItem>
                      <SelectItem value="risk-assessment">Risk Assessment</SelectItem>
                      <SelectItem value="validation-review">Validation Review</SelectItem>
                      <SelectItem value="sop-analysis">SOP Analysis</SelectItem>
                      <SelectItem value="audit-readiness">Audit Readiness</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="regulatory-framework">Regulatory Framework</Label>
                  <Select value={regulatoryFramework} onValueChange={setRegulatoryFramework}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select framework" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="21-cfr-part-11">21 CFR Part 11</SelectItem>
                      <SelectItem value="ich-q7">ICH Q7 (Good Manufacturing Practice)</SelectItem>
                      <SelectItem value="ich-q9">ICH Q9 (Quality Risk Management)</SelectItem>
                      <SelectItem value="ich-q10">ICH Q10 (Pharmaceutical Quality System)</SelectItem>
                      <SelectItem value="fda-guidance">FDA Guidance Documents</SelectItem>
                      <SelectItem value="eu-gmp">EU GMP Guidelines</SelectItem>
                      <SelectItem value="usp">USP Standards</SelectItem>
                      <SelectItem value="iso-13485">ISO 13485 (Medical Devices)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Custom Instructions */}
              <div className="space-y-2">
                <Label htmlFor="custom-instructions">
                  Custom Analysis Instructions (Optional)
                </Label>
                <Textarea
                  id="custom-instructions"
                  placeholder="Provide specific areas of focus, known concerns, or particular requirements to examine..."
                  value={customInstructions}
                  onChange={(e) => setCustomInstructions(e.target.value)}
                  rows={3}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-4 pt-4">
                {batchMode ? (
                  <>
                    <Button
                      onClick={addToBatch}
                      disabled={(!selectedFiles.length && !selectedFile) || !analysisType || !regulatoryFramework}
                      size="lg"
                      className="flex items-center gap-2"
                    >
                      <Stack size={16} />
                      Add to Batch
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setActiveTab('batch')}
                      disabled={batchItems.length === 0}
                    >
                      <FolderOpen size={16} className="mr-2" />
                      View Batch ({batchItems.length})
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={runAIAnalysis}
                    disabled={isAnalyzing || !selectedFile || !analysisType || !regulatoryFramework}
                    size="lg"
                    className="flex items-center gap-2"
                  >
                    {isAnalyzing ? (
                      <>
                        <Clock size={16} className="animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Zap size={16} />
                        Start AI Analysis
                      </>
                    )}
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedFile(null)
                    setSelectedFiles([])
                    setAnalysisType('')
                    setRegulatoryFramework('')
                    setCustomInstructions('')
                    toast.info('Form cleared')
                  }}
                >
                  Clear Form
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Batch Processing Tab */}
        <TabsContent value="batch" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Stack size={20} />
                  Batch Processing Queue
                  {batchItems.length > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {batchItems.length} document{batchItems.length !== 1 ? 's' : ''}
                    </Badge>
                  )}
                </CardTitle>
                <div className="flex items-center gap-2">
                  {batchItems.length > 0 && (
                    <>
                      <Button
                        onClick={processBatch}
                        disabled={isBatchProcessing || batchItems.some(item => item.status === 'processing')}
                        className="flex items-center gap-2"
                      >
                        {isBatchProcessing ? (
                          <>
                            <Clock size={16} className="animate-spin" />
                            Processing Batch...
                          </>
                        ) : (
                          <>
                            <Play size={16} />
                            Process Batch
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={clearBatch}
                        disabled={isBatchProcessing}
                      >
                        <Trash2 size={16} className="mr-2" />
                        Clear Batch
                      </Button>
                    </>
                  )}
                </div>
              </div>
              {isBatchProcessing && (
                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span>Overall Progress</span>
                    <span>{Math.round(batchProgress)}%</span>
                  </div>
                  <Progress value={batchProgress} className="h-2" />
                </div>
              )}
            </CardHeader>
            <CardContent>
              {batchItems.length > 0 ? (
                <div className="space-y-4">
                  {batchItems.map((item, index) => (
                    <div key={item.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="p-2 bg-primary/10 rounded">
                            <FileText size={16} className="text-primary" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-foreground">{item.file.name}</h4>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>{item.analysisType.replace('-', ' ')}</span>
                              <span>•</span>
                              <span>{item.regulatoryFramework}</span>
                              <span>•</span>
                              <span>{(item.file.size / 1024 / 1024).toFixed(2)} MB</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            {item.status === 'pending' && <Clock className="text-muted-foreground" size={16} />}
                            {item.status === 'processing' && <Clock className="text-blue-600 animate-spin" size={16} />}
                            {item.status === 'complete' && <CheckCircle className="text-green-600" size={16} />}
                            {item.status === 'error' && <AlertTriangle className="text-red-600" size={16} />}
                            <Badge 
                              variant={
                                item.status === 'complete' ? 'default' :
                                item.status === 'processing' ? 'secondary' :
                                item.status === 'error' ? 'destructive' : 'outline'
                              }
                            >
                              {item.status === 'processing' ? `${Math.round(item.progress)}%` : item.status}
                            </Badge>
                          </div>
                          {!isBatchProcessing && item.status === 'pending' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeBatchItem(item.id)}
                            >
                              <X size={16} />
                            </Button>
                          )}
                        </div>
                      </div>
                      {item.status === 'processing' && (
                        <div className="mt-3">
                          <Progress value={item.progress} className="h-2" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Stack size={48} className="mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No Documents in Batch</h3>
                  <p className="text-muted-foreground mb-4">
                    Use the upload tab in batch mode to add multiple documents for simultaneous processing
                  </p>
                  <Button onClick={() => {
                    setActiveTab('upload')
                    setBatchMode(true)
                  }}>
                    <Upload size={16} className="mr-2" />
                    Add Documents to Batch
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Results Tab */}
        <TabsContent value="results" className="space-y-6">
          {filteredDocuments.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredDocuments.map((doc) => (
                <Card key={doc.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 flex-1">
                        <h3 className="font-medium text-sm truncate" title={doc.fileName}>
                          {doc.fileName}
                        </h3>
                        <Badge variant="outline" className="text-xs">
                          {doc.analysisType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </Badge>
                      </div>
                      <div className="ml-2">{getStatusIcon(doc.status)}</div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {doc.status === 'analyzing' && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Processing...</span>
                          <span>{Math.round(doc.progress)}%</span>
                        </div>
                        <Progress value={doc.progress} className="h-2" />
                      </div>
                    )}

                    {doc.status === 'complete' && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Compliance Score</span>
                          <Badge 
                            variant="secondary" 
                            className={doc.complianceScore >= 80 ? 'bg-green-100 text-green-800' : 
                                     doc.complianceScore >= 60 ? 'bg-yellow-100 text-yellow-800' : 
                                     'bg-red-100 text-red-800'}
                          >
                            {doc.complianceScore}%
                          </Badge>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Risk Level</span>
                          <Badge className={getRiskColor(doc.riskLevel)}>
                            {doc.riskLevel.toUpperCase()}
                          </Badge>
                        </div>

                        <div className="space-y-2">
                          <h4 className="text-sm font-medium">Key Findings</h4>
                          <div className="space-y-1">
                            {doc.keyFindings.slice(0, 2).map((finding, idx) => (
                              <p key={idx} className="text-xs text-muted-foreground">
                                • {finding}
                              </p>
                            ))}
                            {doc.keyFindings.length > 2 && (
                              <p className="text-xs text-muted-foreground">
                                +{doc.keyFindings.length - 2} more findings...
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-2">
                          <Button size="sm" variant="outline" className="flex-1">
                            <Eye size={14} className="mr-1" />
                            View Full Report
                          </Button>
                          <Button size="sm" variant="outline">
                            <Download size={14} />
                          </Button>
                        </div>
                      </div>
                    )}

                    <div className="pt-2 border-t text-xs text-muted-foreground">
                      <div className="flex items-center justify-between">
                        <span>{doc.regulatoryFramework}</span>
                        <span>{new Date(doc.uploadDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {filteredDocuments.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText size={48} className="mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium text-foreground mb-2">No Analysis Results</h3>
                <p className="text-muted-foreground mb-4">
                  Upload and analyze documents to see results here
                </p>
                <Button onClick={() => setActiveTab('upload')}>
                  <Upload size={16} className="mr-2" />
                  Upload Your First Document
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock size={20} />
                Document Analysis History
              </CardTitle>
              <div className="flex items-center gap-4 pt-2">
                <div className="flex items-center gap-2 flex-1">
                  <Search size={16} className="text-muted-foreground" />
                  <Input
                    placeholder="Search documents..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="max-w-sm"
                  />
                </div>
                <Select value={filterFramework} onValueChange={setFilterFramework}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Frameworks</SelectItem>
                    <SelectItem value="21-cfr-part-11">21 CFR Part 11</SelectItem>
                    <SelectItem value="ich-q7">ICH Q7</SelectItem>
                    <SelectItem value="fda-guidance">FDA Guidance</SelectItem>
                    <SelectItem value="eu-gmp">EU GMP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {filteredDocuments.length > 0 ? (
                <div className="space-y-4">
                  {filteredDocuments.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="p-2 bg-primary/10 rounded">
                          <FileText size={16} className="text-primary" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-foreground">{doc.fileName}</h4>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{doc.analysisType.replace('-', ' ')}</span>
                            <span>•</span>
                            <span>{doc.regulatoryFramework}</span>
                            <span>•</span>
                            <span>{new Date(doc.uploadDate).toLocaleDateString()}</span>
                            {doc.status === 'complete' && doc.processingTime && (
                              <>
                                <span>•</span>
                                <span>{doc.processingTime}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {getStatusIcon(doc.status)}
                        {doc.status === 'complete' && (
                          <Badge className={getRiskColor(doc.riskLevel)}>
                            {doc.complianceScore}% - {doc.riskLevel}
                          </Badge>
                        )}
                        <Button size="sm" variant="ghost">
                          <ArrowRight size={16} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No documents match your search criteria</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart3 size={18} />
                  Compliance Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Average Compliance Score</span>
                      <Badge variant="secondary">
                        {uploadedDocuments.length > 0 
                          ? Math.round(uploadedDocuments.reduce((sum, doc) => sum + doc.complianceScore, 0) / uploadedDocuments.length)
                          : 0}%
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Documents Analyzed</span>
                      <Badge variant="outline">{uploadedDocuments.filter(d => d.status === 'complete').length}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">High Risk Documents</span>
                      <Badge className="bg-orange-100 text-orange-800">
                        {uploadedDocuments.filter(d => d.riskLevel === 'high' || d.riskLevel === 'critical').length}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Stack size={18} />
                  Batch Processing
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Queue Status</span>
                    <Badge variant={batchItems.length > 0 ? "secondary" : "outline"}>
                      {batchItems.length} items
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Processing</span>
                    <Badge variant={isBatchProcessing ? "default" : "outline"}>
                      {isBatchProcessing ? 'Active' : 'Idle'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Completed Batches</span>
                    <Badge variant="outline">
                      {Math.floor(uploadedDocuments.filter(d => d.status === 'complete').length / 3)}
                    </Badge>
                  </div>
                  {isBatchProcessing && (
                    <div className="pt-2">
                      <Progress value={batchProgress} className="h-2" />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Globe size={18} />
                  Framework Coverage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {['21-cfr-part-11', 'ich-q7', 'fda-guidance', 'eu-gmp'].map(framework => {
                    const count = uploadedDocuments.filter(d => d.regulatoryFramework === framework).length
                    return (
                      <div key={framework} className="flex items-center justify-between">
                        <span className="text-sm">{framework.toUpperCase()}</span>
                        <Badge variant={count > 0 ? "default" : "outline"}>{count}</Badge>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target size={18} />
                  Common Gaps
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <AlertTriangle size={14} className="text-orange-500" />
                    <span>Validation protocols</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertTriangle size={14} className="text-orange-500" />
                    <span>Audit trail depth</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertTriangle size={14} className="text-yellow-500" />
                    <span>Change control SOPs</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertTriangle size={14} className="text-yellow-500" />
                    <span>Training documentation</span>
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