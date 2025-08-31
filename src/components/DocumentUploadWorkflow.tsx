import { useState, useCallback, useRef } from 'react'
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
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
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
  X,
  Lightning,
  Cpu,
  Timer,
  Gauge,
  FlowArrow,
  Stop,
  Activity
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
  status: 'pending' | 'processing' | 'complete' | 'error' | 'cancelled'
  progress: number
  startTime?: number
  processingTime?: number
  retryCount?: number
  errorMessage?: string
}

interface ParallelProcessingConfig {
  maxConcurrent: number
  enableParallel: boolean
  retryAttempts: number
  timeoutDuration: number
  priorityMode: 'fifo' | 'size' | 'type'
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
  const [isPaused, setIsPaused] = useState(false)
  
  // Parallel processing configuration
  const [processingConfig, setProcessingConfig] = useState<ParallelProcessingConfig>({
    maxConcurrent: 3,
    enableParallel: true,
    retryAttempts: 2,
    timeoutDuration: 30000,
    priorityMode: 'fifo'
  })
  
  // Processing state management
  const [activeJobs, setActiveJobs] = useState<Set<string>>(new Set())
  const [completedJobs, setCompletedJobs] = useState(0)
  const [failedJobs, setFailedJobs] = useState(0)
  const processingQueue = useRef<string[]>([])
  const abortControllers = useRef<Map<string, AbortController>>(new Map())
  const performanceMetrics = useRef({
    startTime: 0,
    totalProcessed: 0,
    avgProcessingTime: 0,
    throughput: 0
  })

  // Priority sorting for batch items
  const sortBatchByPriority = useCallback((items: BatchUploadItem[]) => {
    const pendingItems = items.filter(item => item.status === 'pending')
    
    switch (processingConfig.priorityMode) {
      case 'size':
        return pendingItems.sort((a, b) => a.file.size - b.file.size) // Smallest first
      case 'type':
        return pendingItems.sort((a, b) => a.analysisType.localeCompare(b.analysisType))
      case 'fifo':
      default:
        return pendingItems // Keep original order
    }
  }, [processingConfig.priorityMode])

  // Parallel document analysis with proper resource management
  const processDocumentParallel = useCallback(async (item: BatchUploadItem): Promise<void> => {
    const abortController = new AbortController()
    abortControllers.current.set(item.id, abortController)
    
    try {
      // Update item to processing status
      setBatchItems(current => 
        current.map(batchItem => 
          batchItem.id === item.id 
            ? { ...batchItem, status: 'processing', startTime: Date.now() } 
            : batchItem
        )
      )

      // Create analysis entry
      const newAnalysis: AnalysisResult = {
        id: `doc_${Date.now()}_${item.id}`,
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
        aiModel: 'GPT-4 Regulatory Analysis Engine (Parallel)',
        processingTime: '0 minutes'
      }

      setUploadedDocuments((current) => [newAnalysis, ...current])

      // Simulate analysis with controlled progress and timeout
      const analysisDuration = Math.min(3000 + Math.random() * 4000, processingConfig.timeoutDuration)
      let progress = 0
      
      const progressPromise = new Promise<void>((resolve, reject) => {
        const progressInterval = setInterval(() => {
          if (abortController.signal.aborted) {
            clearInterval(progressInterval)
            reject(new Error('Analysis cancelled'))
            return
          }

          if (isPaused) {
            return // Pause progress but don't clear interval
          }

          progress += Math.random() * 12 + 8
          if (progress >= 100) {
            progress = 100
            clearInterval(progressInterval)
            resolve()
          } else {
            // Update progress for both analysis and batch item
            setUploadedDocuments((current) => 
              current.map(doc => doc.id === newAnalysis.id ? {...doc, progress} : doc)
            )
            setBatchItems(current => 
              current.map(batchItem => 
                batchItem.id === item.id ? { ...batchItem, progress } : batchItem
              )
            )
          }
        }, analysisDuration / 15)

        // Timeout handling
        setTimeout(() => {
          if (progress < 100) {
            clearInterval(progressInterval)
            reject(new Error('Processing timeout'))
          }
        }, processingConfig.timeoutDuration)
      })

      await progressPromise

      // Complete analysis with realistic results
      const processingTimeMinutes = item.startTime ? Math.ceil((Date.now() - item.startTime) / 60000) : 2
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
        processingTime: `${processingTimeMinutes} minute${processingTimeMinutes !== 1 ? 's' : ''}`
      }

      setUploadedDocuments((current) => 
        current.map(doc => doc.id === newAnalysis.id ? completedAnalysis : doc)
      )

      // Update batch item to complete
      setBatchItems(current => 
        current.map(batchItem => 
          batchItem.id === item.id 
            ? { 
                ...batchItem, 
                status: 'complete', 
                progress: 100,
                processingTime: Date.now() - (batchItem.startTime || Date.now())
              } 
            : batchItem
        )
      )

    } catch (error) {
      // Handle errors and retries
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      const currentRetryCount = (item.retryCount || 0) + 1
      
      if (currentRetryCount <= processingConfig.retryAttempts && !abortController.signal.aborted) {
        // Retry the analysis
        setBatchItems(current => 
          current.map(batchItem => 
            batchItem.id === item.id 
              ? { 
                  ...batchItem, 
                  status: 'pending', 
                  progress: 0,
                  retryCount: currentRetryCount,
                  errorMessage: `Retry ${currentRetryCount}/${processingConfig.retryAttempts}: ${errorMessage}`
                } 
              : batchItem
          )
        )
        
        // Re-add to processing queue after a delay
        setTimeout(() => {
          processingQueue.current.push(item.id)
        }, 2000 * currentRetryCount) // Exponential backoff
      } else {
        // Mark as failed
        setBatchItems(current => 
          current.map(batchItem => 
            batchItem.id === item.id 
              ? { 
                  ...batchItem, 
                  status: 'error', 
                  errorMessage: `Failed after ${currentRetryCount} attempts: ${errorMessage}`
                } 
              : batchItem
          )
        )
        
        setUploadedDocuments((current) => 
          current.map(doc => 
            doc.id === newAnalysis.id 
              ? {...doc, status: 'error' as const}
              : doc
          )
        )
      }
    } finally {
      // Clean up abort controller
      abortControllers.current.delete(item.id)
      setActiveJobs(current => {
        const newActiveJobs = new Set(current)
        newActiveJobs.delete(item.id)
        return newActiveJobs
      })
    }
  }, [processingConfig, isPaused])

  // Main parallel batch processing controller
  const processBatchParallel = useCallback(async () => {
    if (batchItems.length === 0) {
      toast.error('No documents in batch to process')
      return
    }

    setIsBatchProcessing(true)
    setBatchProgress(0)
    setCompletedJobs(0)
    setFailedJobs(0)
    setIsPaused(false)
    
    // Initialize performance metrics
    performanceMetrics.current = {
      startTime: Date.now(),
      totalProcessed: 0,
      avgProcessingTime: 0,
      throughput: 0
    }

    const totalItems = batchItems.filter(item => item.status === 'pending').length
    toast.info(`Starting ${processingConfig.enableParallel ? 'parallel' : 'sequential'} analysis of ${totalItems} documents`)

    // Sort items by priority
    const sortedItems = sortBatchByPriority(batchItems)
    processingQueue.current = sortedItems.map(item => item.id)

    // Process items based on configuration
    if (processingConfig.enableParallel) {
      await processParallelBatch(sortedItems)
    } else {
      await processSequentialBatch(sortedItems)
    }

    // Calculate final metrics
    const totalTime = Date.now() - performanceMetrics.current.startTime
    const throughput = (performanceMetrics.current.totalProcessed / totalTime) * 60000 // per minute

    setIsBatchProcessing(false)
    toast.success(
      `Batch analysis completed! Processed ${completedJobs} documents in ${Math.ceil(totalTime / 1000)}s (${throughput.toFixed(1)} docs/min)`
    )
    setActiveTab('results')
    
    // Clear completed batch after a delay
    setTimeout(() => {
      setBatchItems(current => current.filter(item => item.status !== 'complete'))
    }, 5000)
  }, [batchItems, processingConfig, sortBatchByPriority, completedJobs])

  // Parallel processing implementation
  const processParallelBatch = async (items: BatchUploadItem[]) => {
    const processingPromises: Promise<void>[] = []
    let itemIndex = 0

    const processNextBatch = async () => {
      while (itemIndex < items.length && activeJobs.size < processingConfig.maxConcurrent) {
        if (isPaused) {
          await new Promise(resolve => setTimeout(resolve, 1000))
          continue
        }

        const item = items[itemIndex]
        if (item.status === 'pending') {
          setActiveJobs(current => new Set([...current, item.id]))
          const processingPromise = processDocumentParallel(item)
            .then(() => {
              setCompletedJobs(prev => prev + 1)
              performanceMetrics.current.totalProcessed++
            })
            .catch(() => {
              setFailedJobs(prev => prev + 1)
            })
          
          processingPromises.push(processingPromise)
        }
        itemIndex++
      }

      // Update overall progress
      const completed = completedJobs + failedJobs
      const progress = items.length > 0 ? (completed / items.length) * 100 : 0
      setBatchProgress(progress)

      // Continue processing if there are more items
      if (itemIndex < items.length) {
        await Promise.race(processingPromises)
        await processNextBatch()
      }
    }

    await processNextBatch()
    await Promise.allSettled(processingPromises)
  }

  // Sequential processing implementation (fallback)
  const processSequentialBatch = async (items: BatchUploadItem[]) => {
    for (let i = 0; i < items.length; i++) {
      if (isPaused) {
        await new Promise(resolve => {
          const checkPaused = () => {
            if (!isPaused) {
              resolve(undefined)
            } else {
              setTimeout(checkPaused, 1000)
            }
          }
          checkPaused()
        })
      }

      const item = items[i]
      if (item.status === 'pending') {
        try {
          await processDocumentParallel(item)
          setCompletedJobs(prev => prev + 1)
        } catch {
          setFailedJobs(prev => prev + 1)
        }
      }

      setBatchProgress(((i + 1) / items.length) * 100)
    }
  }

  // Pause/Resume functionality
  const togglePauseProcessing = useCallback(() => {
    setIsPaused(!isPaused)
    toast.info(isPaused ? 'Processing resumed' : 'Processing paused')
  }, [isPaused])

  // Cancel all processing
  const cancelBatchProcessing = useCallback(() => {
    // Abort all active controllers
    abortControllers.current.forEach(controller => controller.abort())
    abortControllers.current.clear()
    
    // Reset batch items to pending (except completed ones)
    setBatchItems(current => 
      current.map(item => 
        item.status === 'processing' 
          ? { ...item, status: 'cancelled' as const, progress: 0 }
          : item
      )
    )
    
    setIsBatchProcessing(false)
    setActiveJobs(new Set())
    setIsPaused(false)
    toast.info('Batch processing cancelled')
  }, [])

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
      progress: 0,
      retryCount: 0
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

  const processBatch = processBatchParallel

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
            <Lightning size={14} className="mr-1" />
            Parallel Processing
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
          {/* Parallel Processing Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightning size={20} />
                Parallel Processing Configuration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Enable Parallel Processing */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Cpu size={16} />
                    Parallel Processing
                  </Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={processingConfig.enableParallel}
                      onCheckedChange={(checked) =>
                        setProcessingConfig(prev => ({ ...prev, enableParallel: checked }))
                      }
                    />
                    <span className="text-sm text-muted-foreground">
                      {processingConfig.enableParallel ? 'Enabled' : 'Sequential'}
                    </span>
                  </div>
                </div>

                {/* Max Concurrent Jobs */}
                <div className="space-y-3">
                  <Label className="flex items-center gap-2">
                    <Gauge size={16} />
                    Max Concurrent Jobs: {processingConfig.maxConcurrent}
                  </Label>
                  <Slider
                    value={[processingConfig.maxConcurrent]}
                    onValueChange={([value]) =>
                      setProcessingConfig(prev => ({ ...prev, maxConcurrent: value }))
                    }
                    min={1}
                    max={8}
                    step={1}
                    className="w-full"
                    disabled={!processingConfig.enableParallel}
                  />
                  <div className="text-xs text-muted-foreground">
                    Higher values = faster processing but more resource usage
                  </div>
                </div>

                {/* Retry Attempts */}
                <div className="space-y-3">
                  <Label className="flex items-center gap-2">
                    <Timer size={16} />
                    Retry Attempts: {processingConfig.retryAttempts}
                  </Label>
                  <Slider
                    value={[processingConfig.retryAttempts]}
                    onValueChange={([value]) =>
                      setProcessingConfig(prev => ({ ...prev, retryAttempts: value }))
                    }
                    min={0}
                    max={5}
                    step={1}
                    className="w-full"
                  />
                </div>

                {/* Priority Mode */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <FlowArrow size={16} />
                    Priority Mode
                  </Label>
                  <Select 
                    value={processingConfig.priorityMode} 
                    onValueChange={(value: 'fifo' | 'size' | 'type') =>
                      setProcessingConfig(prev => ({ ...prev, priorityMode: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fifo">First In, First Out</SelectItem>
                      <SelectItem value="size">Smallest Files First</SelectItem>
                      <SelectItem value="type">Group by Analysis Type</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Real-time Performance Metrics */}
              {(isBatchProcessing || activeJobs.size > 0) && (
                <div className="mt-6 p-4 bg-muted/30 rounded-lg">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Activity size={16} className="text-blue-600" />
                      <div>
                        <div className="font-medium">Active Jobs</div>
                        <div className="text-muted-foreground">{activeJobs.size}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle size={16} className="text-green-600" />
                      <div>
                        <div className="font-medium">Completed</div>
                        <div className="text-muted-foreground">{completedJobs}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <AlertTriangle size={16} className="text-red-600" />
                      <div>
                        <div className="font-medium">Failed</div>
                        <div className="text-muted-foreground">{failedJobs}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Gauge size={16} className="text-purple-600" />
                      <div>
                        <div className="font-medium">Throughput</div>
                        <div className="text-muted-foreground">
                          {performanceMetrics.current.throughput.toFixed(1)}/min
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

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
                            {processingConfig.enableParallel ? 'Process Parallel' : 'Process Sequential'}
                          </>
                        )}
                      </Button>
                      
                      {isBatchProcessing && (
                        <>
                          <Button
                            variant="outline"
                            onClick={togglePauseProcessing}
                            className="flex items-center gap-2"
                          >
                            {isPaused ? (
                              <>
                                <Play size={16} />
                                Resume
                              </>
                            ) : (
                              <>
                                <Pause size={16} />
                                Pause
                              </>
                            )}
                          </Button>
                          
                          <Button
                            variant="destructive"
                            onClick={cancelBatchProcessing}
                            className="flex items-center gap-2"
                          >
                            <Stop size={16} />
                            Cancel All
                          </Button>
                        </>
                      )}
                      
                      {!isBatchProcessing && (
                        <Button
                          variant="outline"
                          onClick={clearBatch}
                          disabled={isBatchProcessing}
                        >
                          <Trash2 size={16} className="mr-2" />
                          Clear Batch
                        </Button>
                      )}
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
                            {item.status === 'cancelled' && <X className="text-orange-600" size={16} />}
                            <Badge 
                              variant={
                                item.status === 'complete' ? 'default' :
                                item.status === 'processing' ? 'secondary' :
                                item.status === 'error' ? 'destructive' : 
                                item.status === 'cancelled' ? 'outline' :
                                'outline'
                              }
                              className={item.status === 'cancelled' ? 'bg-orange-100 text-orange-800' : ''}
                            >
                              {item.status === 'processing' ? `${Math.round(item.progress)}%` : item.status}
                            </Badge>
                            
                            {/* Retry count indicator */}
                            {(item.retryCount || 0) > 0 && (
                              <Badge variant="outline" className="text-xs">
                                Retry {item.retryCount}
                              </Badge>
                            )}
                            
                            {/* Processing time for completed items */}
                            {item.status === 'complete' && item.processingTime && (
                              <span className="text-xs text-muted-foreground">
                                {Math.ceil(item.processingTime / 1000)}s
                              </span>
                            )}
                          </div>
                          {!isBatchProcessing && (item.status === 'pending' || item.status === 'error' || item.status === 'cancelled') && (
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
                      {(item.status === 'error' || item.status === 'cancelled') && item.errorMessage && (
                        <div className="mt-3 p-3 bg-destructive/10 rounded-lg">
                          <p className="text-sm text-destructive font-medium">
                            {item.status === 'cancelled' ? 'Processing Cancelled' : 'Processing Error'}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {item.errorMessage}
                          </p>
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
                  <Lightning size={18} />
                  Parallel Processing
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
                    <span className="text-sm">Processing Mode</span>
                    <Badge variant={processingConfig.enableParallel ? "default" : "outline"}>
                      {processingConfig.enableParallel ? `Parallel (${processingConfig.maxConcurrent})` : 'Sequential'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Active Jobs</span>
                    <Badge variant={activeJobs.size > 0 ? "secondary" : "outline"}>
                      {activeJobs.size}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Success Rate</span>
                    <Badge variant="outline">
                      {completedJobs + failedJobs > 0 
                        ? Math.round((completedJobs / (completedJobs + failedJobs)) * 100)
                        : 0}%
                    </Badge>
                  </div>
                  {isBatchProcessing && (
                    <div className="pt-2">
                      <Progress value={batchProgress} className="h-2" />
                      <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                        <span>Overall Progress</span>
                        <span>{Math.round(batchProgress)}%</span>
                      </div>
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