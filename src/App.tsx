import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { 
  FileText, 
  Folder, 
  GitBranch, 
  Shield, 
  CheckCircle, 
  Clock,
  AlertTriangle,
  Download,
  Plus
} from '@phosphor-icons/react'
import { 
  ProjectStructure,
  ArchitectureDiagram,
  RequirementsManager,
  RiskAssessment 
} from '@/components'

function App() {
  const [activeTab, setActiveTab] = useState('overview')
  const [projectData, setProjectData] = useKV('virtualbackroom-project', {
    name: 'VirtualBackroom.ai V2.0',
    phase: 'Security & Compliance Implementation - Complete',
    progress: 85,
    lastUpdated: new Date().toISOString()
  })

  const phases = [
    { 
      name: 'Project Scaffolding & Compliance Framework', 
      status: 'complete',
      progress: 100,
      tasks: ['Repository Structure', 'QMS Documentation', 'Compliance Templates']
    },
    { 
      name: 'Security & Compliance Implementation', 
      status: 'complete',
      progress: 100,
      tasks: ['Cybersecurity Plan', '21 CFR Part 11 Strategy', 'Legal Documentation']
    },
    { 
      name: 'Validation Protocols & Testing', 
      status: 'complete',
      progress: 100,
      tasks: ['AI Model Validation', 'IQ Protocol', 'Disaster Recovery Plan']
    },
    { 
      name: 'Operational Readiness & Deployment', 
      status: 'in-progress',
      progress: 25,
      tasks: ['User Training', 'SOPs', 'Go-Live Preparation']
    }
  ]

  const quickStats = [
    { label: 'Compliance Documents', value: '8', status: 'complete', icon: FileText },
    { label: 'Validation Protocols', value: '2', status: 'complete', icon: AlertTriangle },
    { label: 'Legal Documents', value: '3', status: 'complete', icon: GitBranch },
    { label: 'Security Controls', value: '45+', status: 'complete', icon: Shield }
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                VirtualBackroom.ai V2.0
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Regulatory Compliance SaaS Architecture Planning
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="px-3 py-1">
                <Clock size={14} className="mr-1" />
                Phase III: Validation Complete
              </Badge>
              <Button size="sm">
                <Download size={16} className="mr-2" />
                Export Project
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5 mb-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="structure">Project Structure</TabsTrigger>
            <TabsTrigger value="architecture">Architecture</TabsTrigger>
            <TabsTrigger value="requirements">Requirements</TabsTrigger>
            <TabsTrigger value="risks">Risk Assessment</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="space-y-8">
              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {quickStats.map((stat) => {
                  const Icon = stat.icon
                  return (
                    <Card key={stat.label}>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground">{stat.label}</p>
                            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                          </div>
                          <Icon 
                            size={24} 
                            className={`${
                              stat.status === 'complete' ? 'text-green-600' :
                              stat.status === 'warning' ? 'text-accent' :
                              'text-primary'
                            }`}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>

              {/* Project Phases */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GitBranch size={20} />
                    Project Phases
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {phases.map((phase, index) => (
                    <div key={index} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-foreground">{phase.name}</h4>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">
                            {phase.progress}%
                          </span>
                          {phase.status === 'in-progress' ? (
                            <Clock size={16} className="text-accent" />
                          ) : phase.status === 'complete' ? (
                            <CheckCircle size={16} className="text-green-600" />
                          ) : (
                            <div className="w-4 h-4 rounded-full border-2 border-muted" />
                          )}
                        </div>
                      </div>
                      <Progress value={phase.progress} className="h-2" />
                      <div className="flex flex-wrap gap-2">
                        {phase.tasks.map((task, taskIndex) => (
                          <Badge key={taskIndex} variant="outline" className="text-xs">
                            {task}
                          </Badge>
                        ))}
                      </div>
                      {index < phases.length - 1 && <Separator className="mt-4" />}
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Key Deliverables */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText size={20} />
                      QMS Documentation
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {[
                      'Cybersecurity Plan v2.0',
                      '21 CFR Part 11 Compliance Strategy', 
                      'AI Model Validation Protocol',
                      'Installation Qualification Protocol',
                      'Disaster Recovery Plan',
                      'Terms of Service',
                      'Privacy Policy',
                      'Service Level Agreement'
                    ].map((doc, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm">{doc}</span>
                        <CheckCircle size={16} className="text-green-600" />
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield size={20} />
                      Compliance Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {[
                      { standard: 'ISO 13485', status: 'Addressed' },
                      { standard: 'IEC 62304', status: 'Addressed' },
                      { standard: '21 CFR Part 11', status: 'Completed' },
                      { standard: 'HIPAA', status: 'Completed' }
                    ].map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm">{item.standard}</span>
                        <Badge 
                          variant={item.status === 'Completed' || item.status === 'Addressed' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {item.status}
                        </Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="structure">
            <ProjectStructure />
          </TabsContent>

          <TabsContent value="architecture">
            <ArchitectureDiagram />
          </TabsContent>

          <TabsContent value="requirements">
            <RequirementsManager />
          </TabsContent>

          <TabsContent value="risks">
            <RiskAssessment />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default App