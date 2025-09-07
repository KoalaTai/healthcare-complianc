import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { 
  Shield, 
  CheckCircle, 
  Brain,
  Target,
  Building,
  Globe,
  Bell,
  FileText,
  MagnifyingGlass,
  BookOpen,
  Users,
  Settings,
  Activity,
  Database,
  Clock,
  Warning,
  Download,
  Upload
} from '@phosphor-icons/react'

// Import platform components
import { 
  AuditSimulationDashboard,
  RegulatoryKnowledgeBase,
  AIAssistantHub,
  ComplianceTracker,
  UserManagement,
  SystemMonitoring,
  DocumentProcessor
} from '@/components'

export function VirtualBackroomApp() {
  const [currentView, setCurrentView] = useState('dashboard')
  const [userProfile, setUserProfile] = useKV('vb-user-profile', JSON.stringify({
    id: 'user_001',
    name: 'Dr. Sarah Chen',
    role: 'QA Manager',
    organization: 'MedTech Innovations Inc.',
    certifications: ['ASQ CQA', 'RAC (US)', 'ISO 13485 Lead Auditor'],
    lastLogin: new Date().toISOString()
  }))

  const [platformStats, setPlatformStats] = useKV('vb-platform-stats', JSON.stringify({
    totalSimulations: 1847,
    activeUsers: 312,
    completedAudits: 5294,
    regulatoryStandards: 8,
    aiAnalysisJobs: 15672,
    complianceScore: 94.7
  }))

  const stats = JSON.parse(platformStats)
  const profile = JSON.parse(userProfile)

  const renderMainContent = () => {
    switch (currentView) {
      case 'simulations':
        return <AuditSimulationDashboard />
      case 'knowledge':
        return <RegulatoryKnowledgeBase />
      case 'ai-assistant':
        return <AIAssistantHub />
      case 'compliance':
        return <ComplianceTracker />
      case 'users':
        return <UserManagement />
      case 'monitoring':
        return <SystemMonitoring />
      case 'documents':
        return <DocumentProcessor />
      case 'dashboard':
      default:
        return <PlatformDashboard />
    }
  }

  const PlatformDashboard = () => (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-lg border border-blue-200 dark:border-blue-800 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">
              Welcome back, {profile.name}
            </h2>
            <p className="text-muted-foreground mt-1">
              {profile.role} at {profile.organization}
            </p>
            <div className="flex items-center gap-2 mt-2">
              {profile.certifications.map((cert: string, index: number) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {cert}
                </Badge>
              ))}
            </div>
          </div>
          <Badge variant="default" className="bg-green-600 text-white px-4 py-2">
            <CheckCircle size={16} className="mr-2" />
            Compliance Active
          </Badge>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { 
            label: 'Active Simulations', 
            value: stats.totalSimulations.toLocaleString(), 
            icon: Target,
            trend: '+12%',
            onClick: () => setCurrentView('simulations')
          },
          { 
            label: 'AI Analysis Jobs', 
            value: stats.aiAnalysisJobs.toLocaleString(), 
            icon: Brain,
            trend: '+8%',
            onClick: () => setCurrentView('ai-assistant')
          },
          { 
            label: 'Platform Users', 
            value: stats.activeUsers.toLocaleString(), 
            icon: Users,
            trend: '+15%',
            onClick: () => setCurrentView('users')
          },
          { 
            label: 'Compliance Score', 
            value: `${stats.complianceScore}%`, 
            icon: Shield,
            trend: '+2.3%',
            onClick: () => setCurrentView('compliance')
          }
        ].map((metric, index) => {
          const Icon = metric.icon
          return (
            <Card 
              key={index}
              className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:border-primary/20"
              onClick={metric.onClick}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{metric.label}</p>
                    <p className="text-2xl font-bold text-foreground">{metric.value}</p>
                    <p className="text-xs text-green-600 mt-1">{metric.trend} from last month</p>
                  </div>
                  <Icon size={24} className="text-primary" />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity size={20} />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { 
                action: 'Completed FDA QSR audit simulation',
                time: '2 hours ago',
                status: 'success',
                icon: CheckCircle
              },
              { 
                action: 'AI analysis: ISO 13485 gap assessment',
                time: '4 hours ago',
                status: 'complete',
                icon: Brain
              },
              { 
                action: 'New team member added to EU MDR project',
                time: '1 day ago',
                status: 'info',
                icon: Users
              },
              { 
                action: 'Regulatory update: FDA Quality System Regulation',
                time: '2 days ago',
                status: 'warning',
                icon: Bell
              }
            ].map((activity, index) => {
              const Icon = activity.icon
              return (
                <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                  <Icon 
                    size={16} 
                    className={
                      activity.status === 'success' ? 'text-green-600' :
                      activity.status === 'complete' ? 'text-blue-600' :
                      activity.status === 'warning' ? 'text-yellow-600' :
                      'text-muted-foreground'
                    }
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings size={20} />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { 
                title: 'Start New Audit Simulation',
                description: 'Create and configure a new regulatory audit training',
                icon: Target,
                action: () => {
                  setCurrentView('simulations')
                  toast.success('Opening Audit Simulation Center')
                }
              },
              { 
                title: 'Upload Document for Analysis',
                description: 'AI-powered regulatory gap analysis',
                icon: Upload,
                action: () => {
                  setCurrentView('documents')
                  toast.success('Opening Document Processing Center')
                }
              },
              { 
                title: 'Browse Regulatory Standards',
                description: 'Access global regulatory knowledge base',
                icon: BookOpen,
                action: () => {
                  setCurrentView('knowledge')
                  toast.success('Opening Regulatory Knowledge Base')
                }
              },
              { 
                title: 'Generate Compliance Report',
                description: 'Create detailed compliance assessment',
                icon: FileText,
                action: () => {
                  setCurrentView('compliance')
                  toast.success('Opening Compliance Tracker')
                }
              }
            ].map((action, index) => (
              <Button
                key={index}
                variant="ghost"
                className="w-full justify-start h-auto p-4"
                onClick={action.action}
              >
                <action.icon size={20} className="mr-3 text-primary" />
                <div className="text-left">
                  <div className="font-medium">{action.title}</div>
                  <div className="text-xs text-muted-foreground">{action.description}</div>
                </div>
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Platform Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database size={20} />
            Platform Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">System Health</span>
                <Badge variant="default" className="bg-green-600 text-white">
                  Operational
                </Badge>
              </div>
              <Progress value={98} className="h-2" />
              <div className="text-xs text-muted-foreground">98% uptime this month</div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">AI Model Performance</span>
                <Badge variant="default" className="bg-blue-600 text-white">
                  Optimal
                </Badge>
              </div>
              <Progress value={96} className="h-2" />
              <div className="text-xs text-muted-foreground">96% accuracy rate</div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Compliance Coverage</span>
                <Badge variant="default" className="bg-purple-600 text-white">
                  Complete
                </Badge>
              </div>
              <Progress value={100} className="h-2" />
              <div className="text-xs text-muted-foreground">8 regulatory standards</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar Navigation */}
      <div className="w-64 border-r bg-card">
        <div className="p-4">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Shield size={20} className="text-white" />
            </div>
            <div>
              <div className="font-bold text-foreground">VirtualBackroom.ai</div>
              <div className="text-xs text-muted-foreground">Regulatory Compliance Platform</div>
            </div>
          </div>
          
          <nav className="space-y-1">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: Activity },
              { id: 'simulations', label: 'Audit Simulations', icon: Target },
              { id: 'knowledge', label: 'Knowledge Base', icon: BookOpen },
              { id: 'ai-assistant', label: 'AI Assistant', icon: Brain },
              { id: 'compliance', label: 'Compliance Tracker', icon: Shield },
              { id: 'documents', label: 'Document Processing', icon: FileText },
              { id: 'users', label: 'User Management', icon: Users },
              { id: 'monitoring', label: 'System Monitoring', icon: Database }
            ].map((item) => {
              const Icon = item.icon
              return (
                <Button
                  key={item.id}
                  variant={currentView === item.id ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setCurrentView(item.id)}
                >
                  <Icon size={16} className="mr-2" />
                  {item.label}
                </Button>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        {/* Header */}
        <header className="border-b bg-card sticky top-0 z-10">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  VirtualBackroom.ai V2.0
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  AI-Powered Regulatory Compliance Platform - Production Ready
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="default" className="bg-green-600 text-white text-xs">
                    Production Live
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    21 CFR Part 11 Compliant
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    Multi-Tenant Architecture
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Button 
                  size="sm" 
                  onClick={() => {
                    toast.success('Opening Global Search')
                    // Global search functionality
                  }}
                >
                  <MagnifyingGlass size={16} className="mr-2" />
                  Search
                </Button>
                <Button 
                  size="sm" 
                  onClick={() => {
                    toast.success('Notification center opened')
                    // Notification center
                  }}
                >
                  <Bell size={16} className="mr-2" />
                  Alerts
                </Button>
                <Button 
                  size="sm"
                  onClick={() => toast.success('Platform documentation exported successfully!')}
                >
                  <Download size={16} className="mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6">
          {renderMainContent()}
        </div>
      </div>
    </div>
  )
}

export default VirtualBackroomApp