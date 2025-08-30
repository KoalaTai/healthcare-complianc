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
import { ProjectStructure } from '@/components/ProjectStructure'
import { ArchitectureDiagram } from '@/components/ArchitectureDiagram'
import { RequirementsManager } from '@/components/RequirementsManager'
import { RiskAssessment } from '@/components/RiskAssessment'

function App() {
  const [activeTab, setActiveTab] = useState('overview')
  const [projectData, setProjectData] = useKV('virtualbackroom-project', {
    name: 'VirtualBackroom.ai V2.0',
    phase: 'Planning',
    progress: 15,
    lastUpdated: new Date().toISOString()
  })

  const phases = [
    { 
      name: 'Project Scaffolding & Compliance Framework', 
      status: 'in-progress',
      progress: 60,
      tasks: ['Repository Structure', 'QMS Documentation', 'Compliance Templates']
    },
    { 
      name: 'Feature Definition & Requirements', 
      status: 'pending',
      progress: 0,
      tasks: ['User Stories', 'Epic Planning', 'Acceptance Criteria']
    },
    { 
      name: 'Technical Architecture & Design', 
      status: 'pending',
      progress: 0,
      tasks: ['System Architecture', 'Database Design', 'API Specifications']
    },
    { 
      name: 'Validation & Testing Strategy', 
      status: 'pending',
      progress: 0,
      tasks: ['Test Plans', 'AI Validation', 'Compliance Testing']
    }
  ]

  const quickStats = [
    { label: 'Requirements', value: '24', status: 'complete', icon: FileText },
    { label: 'Risks Identified', value: '8', status: 'warning', icon: AlertTriangle },
    { label: 'Architecture Components', value: '12', status: 'complete', icon: GitBranch },
    { label: 'Compliance Docs', value: '5', status: 'in-progress', icon: Shield }
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
                Phase I: Planning
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
                      'Software Development Plan',
                      'Risk Management Plan',
                      'Software Requirements Specification',
                      'Validation Master Plan',
                      'Cybersecurity Plan'
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
                      { standard: 'ISO 13485', status: 'In Progress' },
                      { standard: 'IEC 62304', status: 'Planned' },
                      { standard: '21 CFR Part 11', status: 'In Progress' },
                      { standard: 'HIPAA', status: 'Planned' }
                    ].map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm">{item.standard}</span>
                        <Badge 
                          variant={item.status === 'In Progress' ? 'default' : 'secondary'}
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