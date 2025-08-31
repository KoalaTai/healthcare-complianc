import { useState, useEffect, useCallback } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import {
  Upload,
  FileText,
  Brain,
  Clock,
  CheckCircle,
  X,
  Play,
  Pause,
  Download,
  ArrowRight,
  ListChecks,
  Gauge,
  Target,
  Warning,
  Plus,
  Trash,
  Eye,
  Settings
} from '@phosphor-icons/react'

interface BatchDocument {
  id: string
  name: string
  size: number
  type: string
  regulation: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'pending' | 'uploading' | 'queued' | 'processing' | 'completed' | 'failed'
  assignedModel?: string
  startTime?: Date
  endTime?: Date
  progress: number
  estimatedTime?: number
  actualTime?: number
  retries: number
  errorMessage?: string
  results?: {
    gapsFound: number
    criticalIssues: number
    recommendations: number
    confidenceScore: number
  }
}

interface ProcessingBatch {
  id: string
  name: string
  created: Date
  status: 'draft' | 'processing' | 'completed' | 'paused' | 'failed'
  documents: BatchDocument[]
  totalDocuments: number
  completedDocuments: number
  failedDocuments: number
  estimatedCompletion: Date
  parallelProcessing: boolean
  maxConcurrent: number
  aiModelStrategy: 'fastest' | 'most-accurate' | 'cost-optimized' | 'load-balanced'
}

interface AIModelConfig {
  id: string
  name: string
  provider: string
  speed: number
  accuracy: number
  cost: number
  availability: number
  specialties: string[]
}

export function BatchDocumentProcessing() {
  const [activeTab, setActiveTab] = useState('upload')
  const [batches, setBatches] = useKV('processing-batches', JSON.stringify([]))
  const [currentBatch, setCurrentBatch] = useState<ProcessingBatch | null>(null)
  const [uploadedFiles, setUploadedFiles] = useState<BatchDocument[]>([])
  const [batchName, setBatchName] = useState('')
  const [selectedRegulation, setSelectedRegulation] = useState('')
  const [processingStrategy, setProcessingStrategy] = useState<'fastest' | 'most-accurate' | 'cost-optimized' | 'load-balanced'>('load-balanced')
  const [maxConcurrent, setMaxConcurrent] = useState(5)
  const [parallelProcessing, setParallelProcessing] = useState(true)
  const [autoRetry, setAutoRetry] = useState(true)
  const [priorityProcessing, setPriorityProcessing] = useState(true)

  const aiModels: AIModelConfig[] = [
    {
      id: 'gpt-4-turbo',
      name: 'GPT-4 Turbo',
      provider: 'OpenAI',
      speed: 85,
      accuracy: 95,
      cost: 0.03,
      availability: 98,
      specialties: ['regulatory-analysis', 'document-processing', 'compliance-checking']
    },
    {
      id: 'claude-3-opus',
      name: 'Claude 3 Opus',
      provider: 'Anthropic',
      speed: 75,
      accuracy: 98,
      cost: 0.075,
      availability: 97,
      specialties: ['complex-reasoning', 'regulatory-analysis', 'detailed-analysis']
    },
    {
      id: 'gemini-pro',
      name: 'Gemini Pro',
      provider: 'Google',
      speed: 90,
      accuracy: 92,
      cost: 0.025,
      availability: 96,
      specialties: ['fast-processing', 'multimodal', 'document-analysis']
    },
    {
      id: 'grok-1.5',
      name: 'Grok-1.5',
      provider: 'xAI',
      speed: 70,
      accuracy: 88,
      cost: 0.05,
      availability: 94,
      specialties: ['real-time-analysis', 'regulatory-compliance']
    }
  ]

  const regulations = [
    'FDA 21 CFR 820 (QSR)',
    'EU MDR 2017/745',
    'ISO 13485:2016',
    'ISO 14971:2019',
    'IEC 62304:2006',
    'ICH Q7 (cGMP)',
    'ICH Q9 (Quality Risk Management)',
    'ICH Q10 (Quality Systems)',
    'PMDA Guidelines',
    'TGA Regulatory Guidelines',
    'Health Canada MDSAP',
    'ANVISA Brazilian Regulations',
    'NMPA Chinese Regulations'
  ]

  const parsedBatches: ProcessingBatch[] = JSON.parse(batches)

  // Simulate file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    const newDocuments: BatchDocument[] = Array.from(files).map((file, index) => ({
      id: `doc-${Date.now()}-${index}`,
      name: file.name,
      size: file.size,
      type: file.type,
      regulation: selectedRegulation,
      priority: 'medium',
      status: 'pending',
      progress: 0,
      retries: 0
    }))

    setUploadedFiles(prev => [...prev, ...newDocuments])
    toast.success(`Added ${files.length} documents to batch`)
  }

  const removeDocument = (docId: string) => {
    setUploadedFiles(prev => prev.filter(doc => doc.id !== docId))
    toast.success('Document removed from batch')
  }

  const updateDocumentPriority = (docId: string, priority: 'low' | 'medium' | 'high' | 'urgent') => {
    setUploadedFiles(prev => 
      prev.map(doc => doc.id === docId ? { ...doc, priority } : doc)
    )
  }

  const createBatch = () => {
    if (!batchName.trim() || uploadedFiles.length === 0) {
      toast.error('Please provide batch name and add at least one document')
      return
    }

    const newBatch: ProcessingBatch = {
      id: `batch-${Date.now()}`,
      name: batchName,
      created: new Date(),
      status: 'draft',
      documents: uploadedFiles,
      totalDocuments: uploadedFiles.length,
      completedDocuments: 0,
      failedDocuments: 0,
      estimatedCompletion: new Date(Date.now() + uploadedFiles.length * 30000), // 30s per doc estimate
      parallelProcessing,
      maxConcurrent,
      aiModelStrategy: processingStrategy
    }

    const updatedBatches = [...parsedBatches, newBatch]
    setBatches(JSON.stringify(updatedBatches))
    setCurrentBatch(newBatch)
    
    // Reset form
    setUploadedFiles([])
    setBatchName('')
    setActiveTab('monitoring')
    
    toast.success(`Batch "${newBatch.name}" created successfully`)
  }

  const startBatchProcessing = (batchId: string) => {
    const updatedBatches = parsedBatches.map(batch => {
      if (batch.id === batchId) {
        return {
          ...batch,
          status: 'processing' as const,
          documents: batch.documents.map(doc => ({ ...doc, status: 'queued' as const }))
        }
      }
      return batch
    })
    setBatches(JSON.stringify(updatedBatches))
    
    // Simulate processing
    simulateProcessing(batchId)
    toast.success('Batch processing started')
  }

  const pauseBatchProcessing = (batchId: string) => {
    const updatedBatches = parsedBatches.map(batch => {
      if (batch.id === batchId) {
        return { ...batch, status: 'paused' as const }
      }
      return batch
    })
    setBatches(JSON.stringify(updatedBatches))
    toast.info('Batch processing paused')
  }

  const simulateProcessing = useCallback((batchId: string) => {
    const interval = setInterval(() => {
      setBatches(prevBatches => {
        const batches = JSON.parse(prevBatches)
        const batch = batches.find((b: ProcessingBatch) => b.id === batchId)
        
        if (!batch || batch.status !== 'processing') {
          clearInterval(interval)
          return prevBatches
        }

        const updatedDocuments = batch.documents.map((doc: BatchDocument) => {
          if (doc.status === 'queued' && batch.documents.filter((d: BatchDocument) => d.status === 'processing').length < batch.maxConcurrent) {
            return {
              ...doc,
              status: 'processing',
              assignedModel: aiModels[Math.floor(Math.random() * aiModels.length)].id,
              startTime: new Date(),
              progress: 0
            }
          } else if (doc.status === 'processing') {
            const newProgress = Math.min(100, doc.progress + Math.random() * 15)
            if (newProgress >= 100) {
              return {
                ...doc,
                status: Math.random() > 0.95 ? 'failed' : 'completed',
                progress: 100,
                endTime: new Date(),
                actualTime: Math.random() * 60000 + 15000, // 15-75 seconds
                results: {
                  gapsFound: Math.floor(Math.random() * 15) + 1,
                  criticalIssues: Math.floor(Math.random() * 5),
                  recommendations: Math.floor(Math.random() * 10) + 3,
                  confidenceScore: Math.random() * 20 + 80
                },
                errorMessage: Math.random() > 0.95 ? 'Processing timeout' : undefined
              }
            }
            return { ...doc, progress: newProgress }
          }
          return doc
        })

        const completedCount = updatedDocuments.filter((doc: BatchDocument) => doc.status === 'completed').length
        const failedCount = updatedDocuments.filter((doc: BatchDocument) => doc.status === 'failed').length
        const allDone = completedCount + failedCount === batch.totalDocuments

        const updatedBatch = {
          ...batch,
          documents: updatedDocuments,
          completedDocuments: completedCount,
          failedDocuments: failedCount,
          status: allDone ? 'completed' : 'processing'
        }

        if (allDone) {
          clearInterval(interval)
          toast.success(`Batch "${batch.name}" processing completed`)
        }

        const updatedBatches = batches.map((b: ProcessingBatch) => 
          b.id === batchId ? updatedBatch : b
        )

        return JSON.stringify(updatedBatches)
      })
    }, 2000)
  }, [aiModels])

  const getBatchSummary = (batch: ProcessingBatch) => {
    const totalTime = batch.documents.reduce((sum, doc) => sum + (doc.actualTime || 0), 0)
    const avgTime = totalTime / batch.completedDocuments || 0
    const totalGaps = batch.documents.reduce((sum, doc) => sum + (doc.results?.gapsFound || 0), 0)
    const totalCritical = batch.documents.reduce((sum, doc) => sum + (doc.results?.criticalIssues || 0), 0)
    
    return { avgTime, totalGaps, totalCritical }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200'
      case 'processing': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'failed': return 'bg-red-100 text-red-800 border-red-200'
      case 'paused': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'queued': return 'bg-orange-100 text-orange-800 border-orange-200'
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

  const recommendedModel = (document: BatchDocument) => {
    const availableModels = aiModels.filter(model => model.availability > 90)
    
    switch (processingStrategy) {
      case 'fastest':
        return availableModels.sort((a, b) => b.speed - a.speed)[0]
      case 'most-accurate':
        return availableModels.sort((a, b) => b.accuracy - a.accuracy)[0]
      case 'cost-optimized':
        return availableModels.sort((a, b) => a.cost - b.cost)[0]
      case 'load-balanced':
      default:
        return availableModels.sort((a, b) => (b.speed + b.accuracy - a.cost) - (a.speed + a.accuracy - b.cost))[0]
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Batch Document Processing</h1>
          <p className="text-muted-foreground mt-2">
            Upload and analyze multiple regulatory documents with parallel AI processing
          </p>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => toast.success('Processing templates exported')}>
            <Download size={16} className="mr-2" />
            Export Templates
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Batches</p>
                <p className="text-2xl font-bold">
                  {parsedBatches.filter(b => b.status === 'processing').length}
                </p>
              </div>
              <Brain size={24} className="text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Documents Queued</p>
                <p className="text-2xl font-bold">
                  {parsedBatches.reduce((sum, batch) => 
                    sum + batch.documents.filter(doc => 
                      doc.status === 'queued' || doc.status === 'processing'
                    ).length, 0
                  )}
                </p>
              </div>
              <Clock size={24} className="text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed Today</p>
                <p className="text-2xl font-bold">
                  {parsedBatches.reduce((sum, batch) => sum + batch.completedDocuments, 0)}
                </p>
              </div>
              <CheckCircle size={24} className="text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-bold">
                  {parsedBatches.length > 0 
                    ? Math.round((parsedBatches.reduce((sum, batch) => sum + batch.completedDocuments, 0) / 
                        parsedBatches.reduce((sum, batch) => sum + batch.totalDocuments, 0)) * 100)
                    : 0}%
                </p>
              </div>
              <Target size={24} className="text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="upload">Document Upload</TabsTrigger>
          <TabsTrigger value="monitoring">Batch Monitoring</TabsTrigger>
          <TabsTrigger value="results">Results & Analytics</TabsTrigger>
          <TabsTrigger value="settings">Processing Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Upload Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload size={20} />
                  Upload Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="batch-name">Batch Name</Label>
                  <Input
                    id="batch-name"
                    value={batchName}
                    onChange={(e) => setBatchName(e.target.value)}
                    placeholder="e.g., Q4 2024 FDA Compliance Review"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="regulation">Primary Regulation</Label>
                  <Select value={selectedRegulation} onValueChange={setSelectedRegulation}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select regulation standard" />
                    </SelectTrigger>
                    <SelectContent>
                      {regulations.map((reg) => (
                        <SelectItem key={reg} value={reg}>
                          {reg}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="strategy">Processing Strategy</Label>
                  <Select value={processingStrategy} onValueChange={(value: any) => setProcessingStrategy(value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fastest">Fastest Processing</SelectItem>
                      <SelectItem value="most-accurate">Most Accurate</SelectItem>
                      <SelectItem value="cost-optimized">Cost Optimized</SelectItem>
                      <SelectItem value="load-balanced">Load Balanced (Recommended)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="file-upload">Upload Documents</Label>
                  <Input
                    id="file-upload"
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={handleFileUpload}
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Supports PDF, DOC, DOCX, TXT files. Max 100 files per batch.
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="parallel-processing"
                    checked={parallelProcessing}
                    onCheckedChange={setParallelProcessing}
                  />
                  <Label htmlFor="parallel-processing">Enable Parallel Processing</Label>
                </div>

                <div>
                  <Label htmlFor="max-concurrent">Max Concurrent Jobs</Label>
                  <Input
                    id="max-concurrent"
                    type="number"
                    min="1"
                    max="20"
                    value={maxConcurrent}
                    onChange={(e) => setMaxConcurrent(parseInt(e.target.value))}
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>

            {/* AI Model Recommendation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain size={20} />
                  AI Model Selection
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="font-medium text-blue-800 mb-2">
                    Recommended Strategy: {processingStrategy}
                  </div>
                  <div className="text-sm text-blue-700">
                    {processingStrategy === 'fastest' && 'Optimized for speed with minimal latency'}
                    {processingStrategy === 'most-accurate' && 'Maximizes analysis accuracy and detail'}
                    {processingStrategy === 'cost-optimized' && 'Minimizes processing costs while maintaining quality'}
                    {processingStrategy === 'load-balanced' && 'Balances speed, accuracy, and cost effectively'}
                  </div>
                </div>

                <div className="space-y-3">
                  {aiModels.map((model) => (
                    <div key={model.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium">{model.name}</div>
                        <Badge variant="outline">{model.provider}</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>Speed: {model.speed}%</div>
                        <div>Accuracy: {model.accuracy}%</div>
                        <div>Cost: ${model.cost}/1K tokens</div>
                        <div>Uptime: {model.availability}%</div>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {model.specialties.map((specialty) => (
                          <Badge key={specialty} variant="secondary" className="text-xs">
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Uploaded Documents */}
          {uploadedFiles.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText size={20} />
                    Uploaded Documents ({uploadedFiles.length})
                  </div>
                  <Button onClick={createBatch} disabled={!batchName.trim()}>
                    <Plus size={16} className="mr-2" />
                    Create Batch
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {uploadedFiles.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">{doc.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {(doc.size / 1024 / 1024).toFixed(2)} MB • {doc.regulation || 'No regulation selected'}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Recommended: {recommendedModel(doc)?.name}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Select 
                          value={doc.priority} 
                          onValueChange={(value: any) => updateDocumentPriority(doc.id, value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="urgent">Urgent</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => removeDocument(doc.id)}
                        >
                          <Trash size={16} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-6">
          {parsedBatches.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <FileText size={48} className="text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-muted-foreground mb-2">No Batches Found</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first document processing batch to get started
                </p>
                <Button onClick={() => setActiveTab('upload')}>
                  <Plus size={16} className="mr-2" />
                  Create Batch
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {parsedBatches.map((batch) => (
                <Card key={batch.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CardTitle>{batch.name}</CardTitle>
                        <Badge className={getStatusColor(batch.status)}>
                          {batch.status}
                        </Badge>
                        <Badge variant="outline">
                          {batch.completedDocuments}/{batch.totalDocuments} completed
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        {batch.status === 'draft' && (
                          <Button size="sm" onClick={() => startBatchProcessing(batch.id)}>
                            <Play size={16} className="mr-2" />
                            Start
                          </Button>
                        )}
                        {batch.status === 'processing' && (
                          <Button size="sm" variant="outline" onClick={() => pauseBatchProcessing(batch.id)}>
                            <Pause size={16} className="mr-2" />
                            Pause
                          </Button>
                        )}
                        <Button size="sm" variant="outline">
                          <Settings size={16} className="mr-2" />
                          Configure
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-4">
                      <div>
                        <div className="text-sm text-muted-foreground">Progress</div>
                        <div className="font-medium">
                          {Math.round((batch.completedDocuments / batch.totalDocuments) * 100)}%
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Strategy</div>
                        <div className="font-medium">{batch.aiModelStrategy}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Max Concurrent</div>
                        <div className="font-medium">{batch.maxConcurrent}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Created</div>
                        <div className="font-medium">{batch.created.toLocaleDateString()}</div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Overall Progress</span>
                        <span>{batch.completedDocuments}/{batch.totalDocuments}</span>
                      </div>
                      <Progress value={(batch.completedDocuments / batch.totalDocuments) * 100} />
                    </div>

                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {batch.documents.map((doc) => (
                        <div key={doc.id} className="flex items-center justify-between p-2 border rounded text-sm">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium truncate">{doc.name}</span>
                              <Badge className={getPriorityColor(doc.priority)} size="sm">
                                {doc.priority}
                              </Badge>
                              <Badge className={getStatusColor(doc.status)} size="sm">
                                {doc.status}
                              </Badge>
                            </div>
                            {doc.assignedModel && (
                              <div className="text-xs text-muted-foreground mt-1">
                                Model: {aiModels.find(m => m.id === doc.assignedModel)?.name}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-3 ml-4">
                            {doc.status === 'processing' && (
                              <div className="flex items-center gap-2">
                                <Progress value={doc.progress} className="w-20 h-2" />
                                <span className="text-xs">{Math.round(doc.progress)}%</span>
                              </div>
                            )}
                            {doc.status === 'completed' && doc.results && (
                              <div className="flex items-center gap-2 text-xs">
                                <span>Gaps: {doc.results.gapsFound}</span>
                                <span>Critical: {doc.results.criticalIssues}</span>
                              </div>
                            )}
                            {doc.status === 'failed' && (
                              <Button size="sm" variant="outline" onClick={() => toast.info('Retry functionality')}>
                                Retry
                              </Button>
                            )}
                            <Button size="sm" variant="outline">
                              <Eye size={14} />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {batch.status === 'completed' && (
                      <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                        <div className="text-sm font-medium text-green-800 mb-1">
                          Batch Completed Successfully
                        </div>
                        <div className="text-xs text-green-700">
                          {getBatchSummary(batch).totalGaps} gaps found, {getBatchSummary(batch).totalCritical} critical issues identified
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="results" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Processing Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-primary">
                        {parsedBatches.reduce((sum, batch) => sum + batch.totalDocuments, 0)}
                      </div>
                      <div className="text-sm text-muted-foreground">Total Documents</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">
                        {parsedBatches.reduce((sum, batch) => sum + batch.completedDocuments, 0)}
                      </div>
                      <div className="text-sm text-muted-foreground">Completed</div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Success Rate</span>
                      <span>
                        {parsedBatches.length > 0 
                          ? Math.round((parsedBatches.reduce((sum, batch) => sum + batch.completedDocuments, 0) / 
                              parsedBatches.reduce((sum, batch) => sum + batch.totalDocuments, 0)) * 100)
                          : 0}%
                      </span>
                    </div>
                    <Progress 
                      value={parsedBatches.length > 0 
                        ? (parsedBatches.reduce((sum, batch) => sum + batch.completedDocuments, 0) / 
                           parsedBatches.reduce((sum, batch) => sum + batch.totalDocuments, 0)) * 100
                        : 0
                      } 
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 text-center">
                    <div>
                      <div className="text-lg font-bold text-orange-600">23.7s</div>
                      <div className="text-sm text-muted-foreground">Avg Process Time</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-blue-600">4.2</div>
                      <div className="text-sm text-muted-foreground">Avg Parallel Jobs</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Model Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {aiModels.map((model) => (
                    <div key={model.id} className="p-3 border rounded">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium">{model.name}</div>
                        <Badge variant="outline">{model.availability}% uptime</Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div>
                          <div className="text-muted-foreground">Speed</div>
                          <Progress value={model.speed} className="h-1 mt-1" />
                        </div>
                        <div>
                          <div className="text-muted-foreground">Accuracy</div>
                          <Progress value={model.accuracy} className="h-1 mt-1" />
                        </div>
                        <div>
                          <div className="text-muted-foreground">Cost Efficiency</div>
                          <Progress value={100 - (model.cost * 100)} className="h-1 mt-1" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Results */}
          <Card>
            <CardHeader>
              <CardTitle>Completed Batch Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {parsedBatches.filter(batch => batch.status === 'completed').map((batch) => {
                  const summary = getBatchSummary(batch)
                  return (
                    <div key={batch.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold">{batch.name}</h4>
                        <Button size="sm" variant="outline">
                          <Download size={16} className="mr-2" />
                          Export Results
                        </Button>
                      </div>
                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div>
                          <div className="text-muted-foreground">Documents Processed</div>
                          <div className="font-medium">{batch.completedDocuments}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Total Gaps Found</div>
                          <div className="font-medium">{summary.totalGaps}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Critical Issues</div>
                          <div className="font-medium text-red-600">{summary.totalCritical}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Avg Processing Time</div>
                          <div className="font-medium">{(summary.avgTime / 1000).toFixed(1)}s</div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Processing Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Auto-retry Failed Jobs</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically retry failed processing jobs
                    </p>
                  </div>
                  <Switch checked={autoRetry} onCheckedChange={setAutoRetry} />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Priority-based Processing</Label>
                    <p className="text-sm text-muted-foreground">
                      Process high-priority documents first
                    </p>
                  </div>
                  <Switch checked={priorityProcessing} onCheckedChange={setPriorityProcessing} />
                </div>

                <div>
                  <Label>Default Max Concurrent Jobs</Label>
                  <Input
                    type="number"
                    min="1"
                    max="20"
                    value={maxConcurrent}
                    onChange={(e) => setMaxConcurrent(parseInt(e.target.value))}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>Default Processing Strategy</Label>
                  <Select value={processingStrategy} onValueChange={(value: any) => setProcessingStrategy(value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fastest">Fastest Processing</SelectItem>
                      <SelectItem value="most-accurate">Most Accurate</SelectItem>
                      <SelectItem value="cost-optimized">Cost Optimized</SelectItem>
                      <SelectItem value="load-balanced">Load Balanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Batch Completion Notifications</Label>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Critical Issue Alerts</Label>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Processing Failure Notifications</Label>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Daily Summary Reports</Label>
                  <Switch />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>AI Model Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <Settings className="h-4 w-4" />
                  <AlertDescription>
                    AI model settings are managed by the Distributed Processing Engine. 
                    Advanced configurations can be adjusted in the AI Models section.
                  </AlertDescription>
                </Alert>

                <Button onClick={() => toast.info('Model configuration updated')}>
                  Update Model Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}