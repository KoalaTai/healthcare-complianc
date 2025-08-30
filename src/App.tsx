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
  RiskAssessment,
  DatabaseSchema,
  DeploymentDashboard,
  ProductionSummary 
} from '@/components'

function App() {
  const [activeTab, setActiveTab] = useState('overview')
  const [projectData, setProjectData] = useKV('virtualbackroom-project', {
    name: 'VirtualBackroom.ai V2.0',
    phase: 'Production Deployment - Complete',
    progress: 100,
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
      name: 'Database Schema & Multi-Tenant Implementation', 
      status: 'complete',
      progress: 100,
      tasks: ['Database Models', 'Audit Trail System', 'Migration Scripts', 'Security Policies']
    },
    { 
      name: 'Operational Readiness & Deployment', 
      status: 'complete',
      progress: 100,
      tasks: ['FastAPI Implementation', 'Celery Workers', 'Infrastructure as Code', 'Production Deployment']
    }
  ]

  const quickStats = [
    { label: 'Compliance Documents', value: '13', status: 'complete', icon: FileText },
    { label: 'Database Tables', value: '6', status: 'complete', icon: AlertTriangle },
    { label: 'Security Controls', value: '65+', status: 'complete', icon: Shield },
    { label: 'Deployment Ready', value: '100%', status: 'complete', icon: GitBranch }
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
                Enterprise SaaS Platform - Production Ready & Deployed
              </p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="default" className="bg-green-600 text-white text-xs">
                  Production Live
                </Badge>
                <Badge variant="outline" className="text-xs">
                  21 CFR Part 11 Compliant
                </Badge>
                <Badge variant="outline" className="text-xs">
                  Enterprise SSO
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="px-3 py-1">
                <CheckCircle size={14} className="mr-1" />
                All Phases Complete - Production Ready
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
        {/* Production Launch Banner */}
        <div className="mb-8 p-6 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 rounded-lg border border-green-200 dark:border-green-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <CheckCircle size={32} className="text-green-600" />
              <div>
                <h2 className="text-xl font-bold text-green-800 dark:text-green-200">
                  Production Deployment Complete
                </h2>
                <p className="text-green-700 dark:text-green-300 text-sm">
                  VirtualBackroom.ai V2.0 is live and ready for enterprise customers with full regulatory compliance
                </p>
              </div>
            </div>
            <Badge variant="default" className="bg-green-600 text-white px-4 py-2">
              🚀 Live Production
            </Badge>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-8 mb-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="structure">Structure</TabsTrigger>
            <TabsTrigger value="architecture">Architecture</TabsTrigger>
            <TabsTrigger value="database">Database</TabsTrigger>
            <TabsTrigger value="deployment">Deployment</TabsTrigger>
            <TabsTrigger value="requirements">Requirements</TabsTrigger>
            <TabsTrigger value="risks">Risks</TabsTrigger>
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
                      'Multi-Tenant Database Schema ✓',
                      'Audit Trail System (21 CFR Part 11) ✓',
                      'Row Level Security Policies ✓', 
                      'Database Migration Framework ✓',
                      'Service Layer with Tenant Isolation ✓',
                      'FastAPI Backend with Async Workers ✓',
                      'Enterprise SSO Integration ✓',
                      'Infrastructure as Code (Terraform) ✓',
                      'Production Deployment Pipeline ✓',
                      'Cybersecurity Plan v2.0 ✓',
                      '21 CFR Part 11 Compliance Strategy ✓', 
                      'AI Model Validation Protocol ✓',
                      'Installation Qualification Protocol ✓',
                      'Disaster Recovery Plan ✓',
                      'Terms of Service ✓',
                      'Privacy Policy ✓',
                      'Service Level Agreement ✓'
                    ].map((doc, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm">{doc}</span>
                        <CheckCircle size={16} className="text-green-600" />
                      </div>
                    ))}
                    
                    <Separator className="my-4" />
                    
                    <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                      <div className="text-sm font-medium text-green-800 dark:text-green-200 mb-1">
                        Implementation Complete
                      </div>
                      <div className="text-xs text-green-700 dark:text-green-300">
                        All documentation, code, and infrastructure deployed. 
                        Platform ready for enterprise customer onboarding.
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield size={20} />
                      Production Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {[
                      { standard: 'FastAPI Backend', status: 'Deployed' },
                      { standard: 'Multi-Tenant Database', status: 'Operational' },
                      { standard: 'Enterprise SSO', status: 'Configured' },
                      { standard: 'Audit Trail System', status: 'Active' },
                      { standard: 'AWS Infrastructure', status: 'Live' },
                      { standard: 'Security Monitoring', status: 'Monitoring' }
                    ].map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm">{item.standard}</span>
                        <Badge 
                          variant="default"
                          className="text-xs bg-green-600 text-white"
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

          <TabsContent value="summary">
            <ProductionSummary />
          </TabsContent>

          <TabsContent value="structure">
            <ProjectStructure />
          </TabsContent>

          <TabsContent value="architecture">
            <ArchitectureDiagram />
          </TabsContent>

          <TabsContent value="database">
            <DatabaseSchema />
          </TabsContent>

          <TabsContent value="deployment">
            <DeploymentDashboard />
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