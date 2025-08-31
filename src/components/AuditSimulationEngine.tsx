import React, { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { 
  Play, 
  Pause, 
  Clock, 
  Users, 
  AlertTriangle, 
  CheckCircle, 
  FileText,
  Plus,
  Microphone,
  MicrophoneSlash,
  Timer,
  Eye,
  MessageCircle,
  Star,
  Target,
  TrendingUp,
  BookOpen,
  Settings,
  Volume2,
  VolumeX
} from '@phosphor-icons/react'

interface AuditSimulation {
  id: string
  title: string
  standard: string
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  status: 'draft' | 'active' | 'paused' | 'completed'
  participants: Participant[]
  findings: Finding[]
  duration: number // minutes
  startTime?: string
  completionScore?: number
  voiceEnabled: boolean
}

interface Participant {
  id: string
  name: string
  role: 'auditor' | 'auditee' | 'observer'
  isActive: boolean
  avatar?: string
}

interface Finding {
  id: string
  title: string
  description: string
  severity: 'minor' | 'major' | 'critical'
  evidence: string
  createdBy: string
  timestamp: string
  status: 'open' | 'verified' | 'disputed'
}

interface VoiceSession {
  id: string
  simulationId: string
  isRecording: boolean
  isPlaying: boolean
  messages: VoiceMessage[]
}

interface VoiceMessage {
  id: string
  speaker: 'user' | 'ai'
  content: string
  audioUrl?: string
  timestamp: string
}

const SIMULATION_TEMPLATES = [
  {
    id: 'iso-basic',
    title: 'ISO 13485 Basic QMS Audit',
    standard: 'ISO 13485:2016',
    difficulty: 'Beginner' as const,
    description: 'Fundamental quality management system audit focusing on document control and management responsibility',
    duration: 90,
    scenarios: 12
  },
  {
    id: 'fda-capa',
    title: 'FDA CAPA System Inspection',
    standard: 'FDA QSR 820.100',
    difficulty: 'Advanced' as const,
    description: 'Complex corrective and preventive action system inspection simulation',
    duration: 180,
    scenarios: 24
  },
  {
    id: 'eu-mdr-clinical',
    title: 'EU MDR Clinical Data Review',
    standard: 'EU MDR 2017/745',
    difficulty: 'Advanced' as const,
    description: 'Clinical evaluation and post-market surveillance audit under EU MDR',
    duration: 240,
    scenarios: 18
  },
  {
    id: 'design-controls',
    title: 'Design Control Review',
    standard: 'FDA QSR 820.30',
    difficulty: 'Intermediate' as const,
    description: 'Comprehensive design control process audit simulation',
    duration: 120,
    scenarios: 16
  }
]

export function AuditSimulationEngine() {
  const [simulations, setSimulations] = useKV('audit-simulations', [] as AuditSimulation[])
  const [activeSimulation, setActiveSimulation] = useState<AuditSimulation | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState('')
  const [voiceSession, setVoiceSession] = useKV('voice-session', null as VoiceSession | null)
  const [currentTimer, setCurrentTimer] = useState(0)
  const [isTimerActive, setIsTimerActive] = useState(false)

  // Timer management
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isTimerActive && activeSimulation) {
      interval = setInterval(() => {
        setCurrentTimer(prev => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isTimerActive, activeSimulation])

  const createSimulation = async (templateId: string) => {
    const template = SIMULATION_TEMPLATES.find(t => t.id === templateId)
    if (!template) return

    const user = await spark.user()
    
    const newSimulation: AuditSimulation = {
      id: `sim-${Date.now()}`,
      title: template.title,
      standard: template.standard,
      difficulty: template.difficulty,
      status: 'draft',
      participants: [
        {
          id: user.id,
          name: user.login,
          role: 'auditor',
          isActive: true,
          avatar: user.avatarUrl
        }
      ],
      findings: [],
      duration: template.duration,
      voiceEnabled: true
    }

    setSimulations(current => [newSimulation, ...current])
    setActiveSimulation(newSimulation)
  }

  const startSimulation = () => {
    if (!activeSimulation) return
    
    const updatedSimulation = {
      ...activeSimulation,
      status: 'active' as const,
      startTime: new Date().toISOString()
    }
    
    setActiveSimulation(updatedSimulation)
    setSimulations(current => 
      current.map(sim => sim.id === updatedSimulation.id ? updatedSimulation : sim)
    )
    setIsTimerActive(true)
    setCurrentTimer(0)
  }

  const pauseSimulation = () => {
    if (!activeSimulation) return
    
    const updatedSimulation = {
      ...activeSimulation,
      status: 'paused' as const
    }
    
    setActiveSimulation(updatedSimulation)
    setSimulations(current => 
      current.map(sim => sim.id === updatedSimulation.id ? updatedSimulation : sim)
    )
    setIsTimerActive(false)
  }

  const addFinding = (findingData: Partial<Finding>) => {
    if (!activeSimulation) return

    const newFinding: Finding = {
      id: `finding-${Date.now()}`,
      title: findingData.title || '',
      description: findingData.description || '',
      severity: findingData.severity || 'minor',
      evidence: findingData.evidence || '',
      createdBy: 'current-user',
      timestamp: new Date().toISOString(),
      status: 'open'
    }

    const updatedSimulation = {
      ...activeSimulation,
      findings: [...activeSimulation.findings, newFinding]
    }

    setActiveSimulation(updatedSimulation)
    setSimulations(current => 
      current.map(sim => sim.id === updatedSimulation.id ? updatedSimulation : sim)
    )
  }

  const startVoiceSession = async () => {
    if (!activeSimulation) return

    const newVoiceSession: VoiceSession = {
      id: `voice-${Date.now()}`,
      simulationId: activeSimulation.id,
      isRecording: false,
      isPlaying: false,
      messages: []
    }

    setVoiceSession(newVoiceSession)

    // Initialize AI auditor with context
    const prompt = spark.llmPrompt`You are an experienced regulatory auditor conducting a ${activeSimulation.standard} audit simulation. 
    
    Simulation Context:
    - Standard: ${activeSimulation.standard}
    - Title: ${activeSimulation.title}
    - Difficulty: ${activeSimulation.difficulty}
    
    Your role is to ask relevant audit questions, request documentation, and provide realistic audit scenarios. 
    Keep responses conversational and professional, as if conducting a real audit.
    
    Start the voice session with a brief introduction and first question.`

    try {
      const aiResponse = await spark.llm(prompt)
      
      const aiMessage: VoiceMessage = {
        id: `msg-${Date.now()}`,
        speaker: 'ai',
        content: aiResponse,
        timestamp: new Date().toISOString()
      }

      setVoiceSession(current => current ? {
        ...current,
        messages: [aiMessage]
      } : null)
    } catch (error) {
      console.error('Failed to initialize voice session:', error)
    }
  }

  const sendVoiceMessage = async (userMessage: string) => {
    if (!voiceSession || !activeSimulation) return

    const userMsg: VoiceMessage = {
      id: `msg-${Date.now()}`,
      speaker: 'user',
      content: userMessage,
      timestamp: new Date().toISOString()
    }

    const updatedSession = {
      ...voiceSession,
      messages: [...voiceSession.messages, userMsg]
    }
    setVoiceSession(updatedSession)

    // Generate AI response based on conversation history
    const conversationHistory = updatedSession.messages
      .map(msg => `${msg.speaker}: ${msg.content}`)
      .join('\n')

    const prompt = spark.llmPrompt`Continue this audit simulation conversation:

    Context: ${activeSimulation.standard} audit simulation
    Previous conversation:
    ${conversationHistory}

    As the auditor, respond appropriately to the auditee's last message. Ask follow-up questions, 
    request specific documentation, or move to the next audit area as appropriate.`

    try {
      const aiResponse = await spark.llm(prompt)
      
      const aiMsg: VoiceMessage = {
        id: `msg-${Date.now()}`,
        speaker: 'ai',
        content: aiResponse,
        timestamp: new Date().toISOString()
      }

      setVoiceSession(current => current ? {
        ...current,
        messages: [...current.messages, aiMsg]
      } : null)
    } catch (error) {
      console.error('Failed to get AI response:', error)
    }
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const SimulationCard = ({ simulation }: { simulation: AuditSimulation }) => (
    <Card 
      className={`cursor-pointer transition-all hover:shadow-md ${
        activeSimulation?.id === simulation.id ? 'ring-2 ring-primary' : ''
      }`}
      onClick={() => setActiveSimulation(simulation)}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <Badge variant={
            simulation.status === 'active' ? 'default' :
            simulation.status === 'completed' ? 'secondary' :
            'outline'
          }>
            {simulation.status}
          </Badge>
          <Badge variant="outline" className={`text-xs ${
            simulation.difficulty === 'Advanced' ? 'text-red-600 border-red-200' :
            simulation.difficulty === 'Intermediate' ? 'text-orange-600 border-orange-200' :
            'text-green-600 border-green-200'
          }`}>
            {simulation.difficulty}
          </Badge>
        </div>
        
        <h4 className="font-semibold text-sm mb-2">{simulation.title}</h4>
        <p className="text-xs text-muted-foreground mb-3">{simulation.standard}</p>
        
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Users size={12} />
              {simulation.participants.length}
            </span>
            <span className="flex items-center gap-1">
              <AlertTriangle size={12} />
              {simulation.findings.length}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={12} />
              {simulation.duration}m
            </span>
          </div>
          {simulation.voiceEnabled && (
            <div className="flex items-center gap-1 text-blue-600">
              <Microphone size={12} />
              <span>Voice</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )

  const FindingCard = ({ finding }: { finding: Finding }) => (
    <Card className="mb-3">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant={
                finding.severity === 'critical' ? 'destructive' :
                finding.severity === 'major' ? 'secondary' :
                'outline'
              } className="text-xs">
                {finding.severity}
              </Badge>
              <Badge variant="outline" className={`text-xs ${
                finding.status === 'verified' ? 'text-green-600' :
                finding.status === 'disputed' ? 'text-red-600' :
                'text-yellow-600'
              }`}>
                {finding.status}
              </Badge>
            </div>
            <h5 className="font-medium text-sm">{finding.title}</h5>
            <p className="text-xs text-muted-foreground mt-1">{finding.description}</p>
            {finding.evidence && (
              <div className="mt-2 p-2 bg-muted/50 rounded text-xs">
                <strong>Evidence:</strong> {finding.evidence}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Created by {finding.createdBy}</span>
          <span>{new Date(finding.timestamp).toLocaleTimeString()}</span>
        </div>
      </CardContent>
    </Card>
  )

  const VoiceInterface = () => {
    const [userInput, setUserInput] = useState('')
    
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold flex items-center gap-2">
            <Microphone size={16} />
            AI Auditor Voice Session
          </h4>
          {!voiceSession ? (
            <Button onClick={startVoiceSession} size="sm">
              <Play size={14} className="mr-2" />
              Start Voice Session
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs text-muted-foreground">Active Session</span>
            </div>
          )}
        </div>

        {voiceSession && (
          <div className="space-y-4">
            {/* Conversation History */}
            <div className="max-h-[300px] overflow-y-auto space-y-3">
              {voiceSession.messages.map(message => (
                <div key={message.id} className={`flex ${message.speaker === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-lg text-sm ${
                    message.speaker === 'user' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted'
                  }`}>
                    <div className="flex items-center gap-2 mb-1">
                      {message.speaker === 'ai' && <Volume2 size={14} />}
                      <span className="text-xs font-medium">
                        {message.speaker === 'user' ? 'You' : 'AI Auditor'}
                      </span>
                    </div>
                    <p>{message.content}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="flex gap-2">
              <Input
                placeholder="Type your response to the auditor..."
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && userInput.trim()) {
                    sendVoiceMessage(userInput.trim())
                    setUserInput('')
                  }
                }}
              />
              <Button 
                onClick={() => {
                  if (userInput.trim()) {
                    sendVoiceMessage(userInput.trim())
                    setUserInput('')
                  }
                }}
                disabled={!userInput.trim()}
              >
                <MessageCircle size={16} />
              </Button>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b pb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Audit Simulation Engine</h1>
            <p className="text-muted-foreground mt-2">
              Interactive audit training with AI-powered scenarios and voice dialogue
            </p>
          </div>
          <div className="flex items-center gap-4">
            {activeSimulation && (
              <div className="text-right">
                <div className="text-2xl font-mono font-bold">
                  {formatTime(currentTimer)}
                </div>
                <div className="text-xs text-muted-foreground">Session Time</div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Simulation List */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Create New Simulation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose template..." />
                </SelectTrigger>
                <SelectContent>
                  {SIMULATION_TEMPLATES.map(template => (
                    <SelectItem key={template.id} value={template.id}>
                      <div className="space-y-1">
                        <div className="font-medium text-sm">{template.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {template.standard} • {template.duration}min
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                onClick={() => selectedTemplate && createSimulation(selectedTemplate)}
                disabled={!selectedTemplate}
                className="w-full"
                size="sm"
              >
                <Plus size={14} className="mr-2" />
                Create Simulation
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Active Simulations</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-[400px] overflow-y-auto p-4 space-y-3">
                {simulations.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground">
                    <Target size={32} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No simulations yet</p>
                  </div>
                ) : (
                  simulations.map(sim => <SimulationCard key={sim.id} simulation={sim} />)
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Simulation Interface */}
        <div className="lg:col-span-3">
          {!activeSimulation ? (
            <Card className="h-full">
              <CardContent className="flex items-center justify-center h-96">
                <div className="text-center text-muted-foreground">
                  <BookOpen size={48} className="mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">Select a Simulation</h3>
                  <p className="text-sm">Choose an existing simulation or create a new one to get started</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Simulation Header */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${
                          activeSimulation.status === 'active' ? 'bg-green-500 animate-pulse' :
                          activeSimulation.status === 'paused' ? 'bg-yellow-500' :
                          activeSimulation.status === 'completed' ? 'bg-blue-500' :
                          'bg-gray-400'
                        }`} />
                        {activeSimulation.title}
                      </CardTitle>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span>{activeSimulation.standard}</span>
                        <Badge variant="outline" className="text-xs">
                          {activeSimulation.difficulty}
                        </Badge>
                        <span>{activeSimulation.duration} minutes</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {activeSimulation.status === 'draft' && (
                        <Button onClick={startSimulation} size="sm">
                          <Play size={14} className="mr-2" />
                          Start Simulation
                        </Button>
                      )}
                      {activeSimulation.status === 'active' && (
                        <Button onClick={pauseSimulation} variant="outline" size="sm">
                          <Pause size={14} className="mr-2" />
                          Pause
                        </Button>
                      )}
                      {activeSimulation.status === 'paused' && (
                        <Button onClick={startSimulation} size="sm">
                          <Play size={14} className="mr-2" />
                          Resume
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {/* Simulation Tabs */}
              <Tabs defaultValue="overview" className="space-y-4">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="findings">
                    Findings ({activeSimulation.findings.length})
                  </TabsTrigger>
                  <TabsTrigger value="participants">
                    Team ({activeSimulation.participants.length})
                  </TabsTrigger>
                  <TabsTrigger value="voice" disabled={!activeSimulation.voiceEnabled}>
                    Voice AI
                  </TabsTrigger>
                  <TabsTrigger value="reports">Reports</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {activeSimulation.findings.length}
                        </div>
                        <div className="text-sm text-muted-foreground">Total Findings</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {activeSimulation.participants.filter(p => p.isActive).length}
                        </div>
                        <div className="text-sm text-muted-foreground">Active Participants</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {Math.floor(currentTimer / 60)}
                        </div>
                        <div className="text-sm text-muted-foreground">Minutes Elapsed</div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="findings" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Audit Findings</h3>
                    <Button 
                      onClick={() => addFinding({
                        title: 'New Finding',
                        description: 'Sample finding description',
                        severity: 'minor',
                        evidence: 'Evidence placeholder'
                      })}
                      size="sm"
                    >
                      <Plus size={14} className="mr-2" />
                      Add Finding
                    </Button>
                  </div>
                  
                  {activeSimulation.findings.length === 0 ? (
                    <Card>
                      <CardContent className="flex items-center justify-center py-12">
                        <div className="text-center text-muted-foreground">
                          <AlertTriangle size={32} className="mx-auto mb-2 opacity-50" />
                          <p className="text-sm">No findings recorded yet</p>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-3">
                      {activeSimulation.findings.map(finding => 
                        <FindingCard key={finding.id} finding={finding} />
                      )}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="participants" className="space-y-4">
                  <div className="space-y-3">
                    {activeSimulation.participants.map(participant => (
                      <Card key={participant.id}>
                        <CardContent className="flex items-center gap-3 p-4">
                          <Avatar>
                            <AvatarFallback>{participant.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="font-medium">{participant.name}</div>
                            <div className="text-sm text-muted-foreground capitalize">{participant.role}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${participant.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
                            <span className="text-xs text-muted-foreground">
                              {participant.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="voice" className="space-y-4">
                  <Card>
                    <CardContent className="p-6">
                      <VoiceInterface />
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="reports" className="space-y-4">
                  <Card>
                    <CardContent className="p-6">
                      <div className="text-center">
                        <FileText size={32} className="mx-auto mb-4 opacity-50" />
                        <h3 className="font-semibold mb-2">Simulation Report</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Generate a comprehensive audit simulation report
                        </p>
                        <Button>
                          <FileText size={16} className="mr-2" />
                          Generate Report
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}