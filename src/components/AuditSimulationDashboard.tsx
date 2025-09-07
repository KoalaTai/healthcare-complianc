import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { 
  Target,
  Play,
  Pause,
  CheckCircle,
  Clock,
  Users,
  FileText,
  AlertTriangle,
  Lightbulb,
  MessageCircle,
  Timer,
  Award,
  TrendUp,
  Eye,
  Plus
} from '@phosphor-icons/react'

export function AuditSimulationDashboard() {
  const [simulations, setSimulations] = useKV('vb-simulations', JSON.stringify([
    {
      id: 'sim_001',
      title: 'FDA QSR Section 820.30 - Design Controls',
      standard: 'FDA_QSR',
      difficulty: 'Advanced',
      status: 'completed',
      progress: 100,
      participants: 8,
      findings: 12,
      duration: '4h 30m',
      score: 94,
      createdDate: '2024-01-15',
      lastActivity: '2024-01-18'
    },
    {
      id: 'sim_002', 
      title: 'ISO 13485 Management Responsibility',
      standard: 'ISO_13485',
      difficulty: 'Intermediate',
      status: 'in_progress',
      progress: 67,
      participants: 5,
      findings: 8,
      duration: '2h 15m',
      score: null,
      createdDate: '2024-01-20',
      lastActivity: '2024-01-20'
    },
    {
      id: 'sim_003',
      title: 'EU MDR Clinical Evaluation Requirements', 
      standard: 'EU_MDR',
      difficulty: 'Expert',
      status: 'pending',
      progress: 0,
      participants: 3,
      findings: 0,
      duration: '0m',
      score: null,
      createdDate: '2024-01-21',
      lastActivity: '2024-01-21'
    }
  ]))

  const [selectedView, setSelectedView] = useState('dashboard')
  const [selectedSimulation, setSelectedSimulation] = useState(null)
  const simulationData = JSON.parse(simulations)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200'
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800 border-green-200'
      case 'Intermediate': return 'bg-blue-100 text-blue-800 border-blue-200' 
      case 'Advanced': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'Expert': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const SimulationCard = ({ sim }: { sim: any }) => (
    <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer" 
          onClick={() => setSelectedSimulation(sim)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg text-foreground">{sim.title}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{sim.standard}</p>
          </div>
          <Badge className={`text-xs ${getStatusColor(sim.status)}`}>
            {sim.status.replace('_', ' ')}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between text-sm">
          <span>Progress</span>
          <span className="font-semibold">{sim.progress}%</span>
        </div>
        <Progress value={sim.progress} className="h-2" />
        
        <div className="flex items-center justify-between">
          <Badge className={`text-xs ${getDifficultyColor(sim.difficulty)}`}>
            {sim.difficulty}
          </Badge>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Users size={12} />
            {sim.participants}
            <Clock size={12} />
            {sim.duration}
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-dashed">
          <div className="flex items-center gap-2">
            <FileText size={14} className="text-muted-foreground" />
            <span className="text-xs text-muted-foreground">{sim.findings} findings</span>
          </div>
          {sim.score && (
            <div className="flex items-center gap-1">
              <Award size={14} className="text-yellow-600" />
              <span className="text-xs font-semibold">{sim.score}%</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )

  const CreateSimulationDialog = () => {
    const [newSim, setNewSim] = useState({
      title: '',
      standard: '',
      difficulty: '',
      description: ''
    })

    const handleCreate = () => {
      if (!newSim.title || !newSim.standard || !newSim.difficulty) {
        toast.error('Please fill in all required fields')
        return
      }

      const simulation = {
        id: `sim_${Date.now()}`,
        title: newSim.title,
        standard: newSim.standard,
        difficulty: newSim.difficulty,
        status: 'pending',
        progress: 0,
        participants: 1,
        findings: 0,
        duration: '0m',
        score: null,
        createdDate: new Date().toISOString().split('T')[0],
        lastActivity: new Date().toISOString().split('T')[0]
      }

      const updated = [...simulationData, simulation]
      setSimulations(JSON.stringify(updated))
      toast.success('Audit simulation created successfully!')
      setNewSim({ title: '', standard: '', difficulty: '', description: '' })
    }

    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button>
            <Plus size={16} className="mr-2" />
            Create New Simulation
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create Audit Simulation</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Title *</label>
              <Input 
                placeholder="e.g., FDA QSR Design Controls Audit"
                value={newSim.title}
                onChange={(e) => setNewSim({...newSim, title: e.target.value})}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Regulatory Standard *</label>
              <Select value={newSim.standard} onValueChange={(value) => setNewSim({...newSim, standard: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select standard" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FDA_QSR">FDA QSR (US)</SelectItem>
                  <SelectItem value="ISO_13485">ISO 13485</SelectItem>
                  <SelectItem value="EU_MDR">EU MDR</SelectItem>
                  <SelectItem value="PMDA">PMDA (Japan)</SelectItem>
                  <SelectItem value="TGA">TGA (Australia)</SelectItem>
                  <SelectItem value="Health_Canada">Health Canada</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Difficulty Level *</label>
              <Select value={newSim.difficulty} onValueChange={(value) => setNewSim({...newSim, difficulty: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Beginner">Beginner</SelectItem>
                  <SelectItem value="Intermediate">Intermediate</SelectItem>
                  <SelectItem value="Advanced">Advanced</SelectItem>
                  <SelectItem value="Expert">Expert</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea 
                placeholder="Describe the audit scenario and objectives..."
                value={newSim.description}
                onChange={(e) => setNewSim({...newSim, description: e.target.value})}
              />
            </div>
            <Button onClick={handleCreate} className="w-full">
              Create Simulation
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  const SimulationDetail = ({ simulation }: { simulation: any }) => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Button variant="ghost" onClick={() => setSelectedSimulation(null)}>
            ← Back to Dashboard
          </Button>
          <h2 className="text-2xl font-bold mt-2">{simulation.title}</h2>
          <p className="text-muted-foreground">{simulation.standard}</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className={`${getStatusColor(simulation.status)}`}>
            {simulation.status.replace('_', ' ')}
          </Badge>
          <Badge className={`${getDifficultyColor(simulation.difficulty)}`}>
            {simulation.difficulty}
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="findings">Findings ({simulation.findings})</TabsTrigger>
          <TabsTrigger value="team">Team ({simulation.participants})</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="debrief">Debrief</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Progress</p>
                    <p className="text-2xl font-bold">{simulation.progress}%</p>
                  </div>
                  <TrendUp size={24} className="text-primary" />
                </div>
                <Progress value={simulation.progress} className="mt-3" />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Duration</p>
                    <p className="text-2xl font-bold">{simulation.duration}</p>
                  </div>
                  <Timer size={24} className="text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Score</p>
                    <p className="text-2xl font-bold">{simulation.score || 'N/A'}%</p>
                  </div>
                  <Award size={24} className="text-primary" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target size={20} />
                  Simulation Objectives
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  'Assess design control procedures',
                  'Evaluate risk management processes', 
                  'Review verification and validation',
                  'Check design transfer documentation'
                ].map((objective, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-green-600" />
                    <span className="text-sm">{objective}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle size={20} />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { action: 'Finding added: Missing design review', time: '2h ago', user: 'Sarah Chen' },
                  { action: 'Document request: DHF Section 4.2', time: '4h ago', user: 'Mike Johnson' },
                  { action: 'Team member joined simulation', time: '1d ago', user: 'Lisa Wong' },
                  { action: 'Simulation timer started', time: '2d ago', user: 'Sarah Chen' }
                ].map((activity, index) => (
                  <div key={index} className="text-sm">
                    <p className="font-medium">{activity.action}</p>
                    <p className="text-muted-foreground text-xs">{activity.user} • {activity.time}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="findings" className="space-y-4">
          {[
            {
              id: 'finding_001',
              title: 'Incomplete Design Review Documentation',
              severity: 'Major',
              category: 'Design Controls',
              description: 'Design review records do not demonstrate all required participants were present.',
              evidence: 'DHR Section 3.2 - Missing signatures from software team',
              status: 'Open'
            },
            {
              id: 'finding_002', 
              title: 'Risk Analysis Missing Post-Market Data',
              severity: 'Minor',
              category: 'Risk Management',
              description: 'Risk management file lacks integration of post-market surveillance data.',
              evidence: 'Risk Management Plan v2.1 - Section 5.3',
              status: 'In Review'
            }
          ].map((finding, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold">{finding.title}</h4>
                      <Badge className={`text-xs ${
                        finding.severity === 'Critical' ? 'bg-red-100 text-red-800' :
                        finding.severity === 'Major' ? 'bg-orange-100 text-orange-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {finding.severity}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{finding.description}</p>
                    <div className="text-xs text-muted-foreground">
                      <strong>Evidence:</strong> {finding.evidence}
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {finding.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="team" className="space-y-4">
          {[
            { name: 'Dr. Sarah Chen', role: 'Lead Auditor', status: 'Active', avatar: '👩‍⚕️' },
            { name: 'Mike Johnson', role: 'QA Engineer', status: 'Active', avatar: '👨‍💼' },
            { name: 'Lisa Wong', role: 'Regulatory Specialist', status: 'Active', avatar: '👩‍💻' }
          ].map((member, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{member.avatar}</div>
                  <div className="flex-1">
                    <h4 className="font-semibold">{member.name}</h4>
                    <p className="text-sm text-muted-foreground">{member.role}</p>
                  </div>
                  <Badge className={`text-xs ${
                    member.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {member.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <div className="text-center py-8 text-muted-foreground">
            <FileText size={48} className="mx-auto mb-4 opacity-50" />
            <p>No documents uploaded yet</p>
            <Button variant="outline" className="mt-4">
              <Plus size={16} className="mr-2" />
              Upload Document
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="debrief" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Post-Audit Debrief</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Strengths</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Strong documentation practices in manufacturing controls</li>
                  <li>• Effective CAPA system implementation</li>
                  <li>• Well-defined change control procedures</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Areas for Improvement</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Design review documentation completeness</li>
                  <li>• Integration of post-market data into risk files</li>
                  <li>• Training records maintenance</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Recommended Actions</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Implement design review checklist</li>
                  <li>• Schedule quarterly risk file reviews</li>
                  <li>• Update training SOP procedures</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )

  if (selectedSimulation) {
    return <SimulationDetail simulation={selectedSimulation} />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Audit Simulation Center</h2>
          <p className="text-muted-foreground">Immersive regulatory compliance training</p>
        </div>
        <CreateSimulationDialog />
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Simulations', value: simulationData.length.toString(), icon: Target },
          { label: 'Completed', value: simulationData.filter((s: any) => s.status === 'completed').length.toString(), icon: CheckCircle },
          { label: 'In Progress', value: simulationData.filter((s: any) => s.status === 'in_progress').length.toString(), icon: Play },
          { label: 'Average Score', value: '91%', icon: Award }
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

      {/* Simulations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {simulationData.map((sim: any, index: number) => (
          <SimulationCard key={index} sim={sim} />
        ))}
      </div>
    </div>
  )
}