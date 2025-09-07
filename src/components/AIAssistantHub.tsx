import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'
import { 
  Brain,
  MessageCircle,
  Sparkle,
  Send,
  Clock,
  CheckCircle,
  Lightbulb,
  FileText,
  Search,
  Star,
  Zap,
  Target,
  TrendUp,
  User,
  Robot,
  History,
  Plus,
  RefreshCw
} from '@phosphor-icons/react'

export function AIAssistantHub() {
  const [activeConversation, setActiveConversation] = useState(null)
  const [currentQuery, setCurrentQuery] = useState('')
  const [selectedModel, setSelectedModel] = useState('gpt-4')
  const [isProcessing, setIsProcessing] = useState(false)
  
  const [conversations, setConversations] = useKV('vb-ai-conversations', JSON.stringify([
    {
      id: 'conv_001',
      title: 'FDA QSR Design Controls Guidance',
      model: 'gpt-4',
      created: '2024-01-20',
      lastActivity: '2024-01-20',
      status: 'completed',
      messages: [
        {
          role: 'user',
          content: 'What are the key requirements for design controls under FDA QSR 820.30?',
          timestamp: '2024-01-20T10:00:00Z'
        },
        {
          role: 'assistant', 
          content: 'Under FDA QSR 820.30, design controls are required for Class III and most Class II medical devices. The key requirements include:\n\n1. **Design and Development Planning** - Establish procedures that define responsibility and authority\n2. **Design Input** - Document user needs and intended use\n3. **Design Output** - Ensure outputs meet input requirements\n4. **Design Review** - Conduct systematic examinations\n5. **Design Verification** - Confirm design outputs meet inputs\n6. **Design Validation** - Ensure device meets user needs\n7. **Design Transfer** - Establish procedures for production\n8. **Design Changes** - Document and control modifications\n\nEach element must be documented with appropriate records maintained throughout the design process.',
          timestamp: '2024-01-20T10:01:15Z',
          citations: ['FDA QSR 820.30', 'FDA Design Control Guidance']
        }
      ]
    },
    {
      id: 'conv_002',
      title: 'ISO 13485 Risk Management Integration',
      model: 'claude-3',
      created: '2024-01-19', 
      lastActivity: '2024-01-19',
      status: 'completed',
      messages: [
        {
          role: 'user',
          content: 'How should risk management be integrated with ISO 13485 quality management?',
          timestamp: '2024-01-19T14:30:00Z'
        },
        {
          role: 'assistant',
          content: 'Risk management integration with ISO 13485 requires a systematic approach:\n\n**Key Integration Points:**\n- Risk management activities must be planned as part of QMS (4.1)\n- Management review must include risk management data (5.6)\n- Design controls must incorporate risk analysis (7.3)\n- Production processes must consider risk controls (7.5)\n\n**Documentation Requirements:**\n- Risk management file maintained throughout product lifecycle\n- Risk management plan defining scope and responsibilities\n- Regular risk management reviews and updates\n\nThe integration ensures risk-based decision making is embedded throughout your quality management system, not treated as a separate activity.',
          timestamp: '2024-01-19T14:31:45Z',
          citations: ['ISO 13485:2016', 'ISO 14971:2019']
        }
      ]
    }
  ]))

  const [analysisJobs, setAnalysisJobs] = useKV('vb-analysis-jobs', JSON.stringify([
    {
      id: 'job_001',
      title: 'Document Gap Analysis - QMS Procedures',
      type: 'gap_analysis',
      model: 'gpt-4',
      status: 'completed',
      progress: 100,
      created: '2024-01-20',
      findings: 8,
      score: 87
    },
    {
      id: 'job_002', 
      title: 'Regulatory Compliance Check - EU MDR',
      type: 'compliance_check',
      model: 'claude-3',
      status: 'in_progress', 
      progress: 65,
      created: '2024-01-20',
      findings: 3,
      score: null
    },
    {
      id: 'job_003',
      title: 'Citation Validation - Technical File Review',
      type: 'citation_validation',
      model: 'gemini-pro',
      status: 'pending',
      progress: 0,
      created: '2024-01-20',
      findings: 0,
      score: null
    }
  ]))

  const conversationData = JSON.parse(conversations)
  const analysisData = JSON.parse(analysisJobs)

  const handleSendMessage = async () => {
    if (!currentQuery.trim()) return

    setIsProcessing(true)
    
    // Simulate AI processing
    setTimeout(() => {
      const newMessage = {
        role: 'user' as const,
        content: currentQuery,
        timestamp: new Date().toISOString()
      }

      const aiResponse = {
        role: 'assistant' as const,
        content: `Based on current regulatory standards and best practices, here's my analysis of your query about "${currentQuery}":\n\nThis is a simulated AI response that would normally be generated by the selected AI model (${selectedModel}). The system would provide detailed, accurate regulatory guidance with appropriate citations and cross-references.\n\nWould you like me to elaborate on any specific aspect of this guidance?`,
        timestamp: new Date().toISOString(),
        citations: ['Relevant Standard 1', 'Relevant Standard 2']
      }

      if (activeConversation) {
        // Update existing conversation
        const updated = conversationData.map((conv: any) => 
          conv.id === activeConversation.id
            ? { ...conv, messages: [...conv.messages, newMessage, aiResponse] }
            : conv
        )
        setConversations(JSON.stringify(updated))
        setActiveConversation({ ...activeConversation, messages: [...activeConversation.messages, newMessage, aiResponse] })
      } else {
        // Create new conversation
        const newConv = {
          id: `conv_${Date.now()}`,
          title: currentQuery.substring(0, 50) + (currentQuery.length > 50 ? '...' : ''),
          model: selectedModel,
          created: new Date().toISOString().split('T')[0],
          lastActivity: new Date().toISOString().split('T')[0],
          status: 'active',
          messages: [newMessage, aiResponse]
        }
        setConversations(JSON.stringify([...conversationData, newConv]))
        setActiveConversation(newConv)
      }

      setCurrentQuery('')
      setIsProcessing(false)
      toast.success('AI response generated')
    }, 2000)
  }

  const startNewConversation = () => {
    setActiveConversation(null)
    setCurrentQuery('')
  }

  const ConversationView = ({ conversation }: { conversation: any }) => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Button variant="ghost" onClick={() => setActiveConversation(null)}>
            ← Back to Hub
          </Button>
          <h2 className="text-xl font-bold mt-2">{conversation.title}</h2>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline" className="text-xs">
              {conversation.model}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {conversation.created}
            </Badge>
          </div>
        </div>
        <Button onClick={startNewConversation}>
          <Plus size={16} className="mr-2" />
          New Conversation
        </Button>
      </div>

      <Card className="max-h-96 overflow-y-auto">
        <CardContent className="p-4 space-y-4">
          {conversation.messages.map((message: any, index: number) => (
            <div key={index} className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex gap-3 max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  message.role === 'user' ? 'bg-blue-500' : 'bg-purple-500'
                }`}>
                  {message.role === 'user' ? (
                    <User size={16} className="text-white" />
                  ) : (
                    <Robot size={16} className="text-white" />
                  )}
                </div>
                <div className={`p-3 rounded-lg ${
                  message.role === 'user' 
                    ? 'bg-blue-50 dark:bg-blue-950/20 text-blue-900 dark:text-blue-100' 
                    : 'bg-gray-50 dark:bg-gray-950/20'
                }`}>
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  {message.citations && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      <strong>Sources:</strong> {message.citations.join(', ')}
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground mt-1">
                    {new Date(message.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Input Section */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpt-4">GPT-4</SelectItem>
                  <SelectItem value="gpt-3.5">GPT-3.5</SelectItem>
                  <SelectItem value="claude-3">Claude 3</SelectItem>
                  <SelectItem value="gemini-pro">Gemini Pro</SelectItem>
                </SelectContent>
              </Select>
              <Badge variant="outline" className="text-xs">AI Model</Badge>
            </div>
            <div className="flex gap-2">
              <Textarea
                placeholder="Ask about regulatory requirements, compliance strategies, or specific standards..."
                value={currentQuery}
                onChange={(e) => setCurrentQuery(e.target.value)}
                className="flex-1"
                rows={3}
              />
              <Button 
                onClick={handleSendMessage} 
                disabled={!currentQuery.trim() || isProcessing}
                className="self-end"
              >
                {isProcessing ? (
                  <RefreshCw size={16} className="animate-spin" />
                ) : (
                  <Send size={16} />
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  if (activeConversation) {
    return <ConversationView conversation={activeConversation} />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">AI Assistant Hub</h2>
          <p className="text-muted-foreground">Advanced AI-powered regulatory guidance and analysis</p>
        </div>
        <Button onClick={startNewConversation}>
          <Plus size={16} className="mr-2" />
          New Conversation
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Conversations', value: conversationData.length.toString(), icon: MessageCircle },
          { label: 'Analysis Jobs', value: analysisData.length.toString(), icon: Brain },
          { label: 'AI Models Available', value: '4', icon: Zap },
          { label: 'Accuracy Rate', value: '96%', icon: Target }
        ].map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <Icon size={24} className="text-primary" />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Tabs defaultValue="conversations">
        <TabsList>
          <TabsTrigger value="conversations">Conversations</TabsTrigger>
          <TabsTrigger value="analysis">Analysis Jobs</TabsTrigger>
          <TabsTrigger value="models">AI Models</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="conversations" className="space-y-4">
          {conversationData.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {conversationData.map((conv: any) => (
                <Card key={conv.id} className="hover:shadow-lg transition-all cursor-pointer"
                      onClick={() => setActiveConversation(conv)}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold text-foreground">{conv.title}</h3>
                      <Badge variant="outline" className="text-xs">
                        {conv.model}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {conv.messages.length} messages • Last activity: {conv.lastActivity}
                    </p>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Created {conv.created}</span>
                      <Badge className={`text-xs ${
                        conv.status === 'completed' ? 'bg-green-100 text-green-800' :
                        conv.status === 'active' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {conv.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <MessageCircle size={48} className="mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium mb-2">No conversations yet</h3>
              <p className="text-muted-foreground mb-4">
                Start a new conversation to get AI-powered regulatory guidance
              </p>
              <Button onClick={startNewConversation}>
                <Plus size={16} className="mr-2" />
                Start Your First Conversation
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4">
          {analysisData.map((job: any) => (
            <Card key={job.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{job.title}</h3>
                    <p className="text-sm text-muted-foreground">{job.type.replace('_', ' ')} • {job.model}</p>
                  </div>
                  <Badge className={`text-xs ${
                    job.status === 'completed' ? 'bg-green-100 text-green-800' :
                    job.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {job.status.replace('_', ' ')}
                  </Badge>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span className="font-semibold">{job.progress}%</span>
                  </div>
                  <Progress value={job.progress} className="h-2" />
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4">
                      <span>Findings: {job.findings}</span>
                      {job.score && <span>Score: {job.score}%</span>}
                    </div>
                    <span className="text-muted-foreground">Created {job.created}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="models" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { 
                name: 'GPT-4',
                provider: 'OpenAI',
                status: 'Active',
                accuracy: '96%',
                speed: 'Fast',
                specialties: ['Regulatory Analysis', 'Citation Validation'],
                description: 'Advanced language model optimized for regulatory compliance tasks'
              },
              {
                name: 'Claude 3',
                provider: 'Anthropic', 
                status: 'Active',
                accuracy: '94%',
                speed: 'Medium',
                specialties: ['Risk Assessment', 'Gap Analysis'],
                description: 'Constitutional AI model with strong analytical capabilities'
              },
              {
                name: 'Gemini Pro',
                provider: 'Google',
                status: 'Active', 
                accuracy: '92%',
                speed: 'Very Fast',
                specialties: ['Document Processing', 'Multi-modal Analysis'],
                description: 'Multimodal AI with excellent document understanding'
              },
              {
                name: 'GPT-3.5',
                provider: 'OpenAI',
                status: 'Backup',
                accuracy: '89%',
                speed: 'Very Fast', 
                specialties: ['Quick Queries', 'General Guidance'],
                description: 'Reliable fallback model for routine regulatory questions'
              }
            ].map((model, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-lg">{model.name}</h3>
                    <Badge className={`text-xs ${
                      model.status === 'Active' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {model.status}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-3">{model.description}</p>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Provider:</span>
                      <span className="font-medium">{model.provider}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Accuracy:</span>
                      <span className="font-medium">{model.accuracy}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Speed:</span>
                      <span className="font-medium">{model.speed}</span>
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <p className="text-xs text-muted-foreground mb-2">Specialties:</p>
                    <div className="flex flex-wrap gap-1">
                      {model.specialties.map((specialty, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                title: 'Gap Analysis Request',
                description: 'Analyze documents against specific regulatory standards',
                prompt: 'Please perform a comprehensive gap analysis of [document/process] against [regulatory standard]. Focus on compliance requirements and identify any missing elements.'
              },
              {
                title: 'Risk Assessment Guidance',
                description: 'Get guidance on risk management approaches',
                prompt: 'What are the key risk management considerations for [device type] under [regulatory framework]? Include risk analysis, evaluation, and control measures.'
              },
              {
                title: 'Citation Validation',
                description: 'Verify and validate regulatory citations',
                prompt: 'Please validate the following regulatory citations and provide current, accurate references: [list citations]. Check for any updates or changes.'
              },
              {
                title: 'Audit Preparation',
                description: 'Prepare for regulatory audits and inspections',
                prompt: 'Help me prepare for a [regulatory body] audit focusing on [specific area]. What documents should be ready and what common findings should I be aware of?'
              }
            ].map((template, index) => (
              <Card key={index} className="hover:shadow-lg transition-all cursor-pointer">
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-2">{template.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{template.description}</p>
                  <div className="bg-muted/50 p-3 rounded text-sm mb-3">
                    {template.prompt}
                  </div>
                  <Button
                    size="sm"
                    onClick={() => {
                      setCurrentQuery(template.prompt)
                      startNewConversation()
                      toast.success('Template loaded - customize and send!')
                    }}
                  >
                    Use Template
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}