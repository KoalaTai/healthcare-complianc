import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { 
  Plus,
  FileText,
  Users,
  CheckCircle,
  Clock,
  AlertCircle
} from '@phosphor-icons/react'

interface Requirement {
  id: string
  epic: string
  title: string
  description: string
  acceptanceCriteria: string[]
  priority: 'high' | 'medium' | 'low'
  status: 'not-started' | 'in-progress' | 'completed'
  assignee?: string
}

export function RequirementsManager() {
  const [requirements, setRequirements] = useKV<Requirement[]>('v2-requirements', getDefaultRequirements())
  const [selectedEpic, setSelectedEpic] = useState<string>('all')
  const [showAddForm, setShowAddForm] = useState(false)
  const [newRequirement, setNewRequirement] = useState<Partial<Requirement>>({
    epic: 'Epic 1: Production-Grade Identity & Access Management',
    priority: 'medium',
    status: 'not-started'
  })

  const epics = [
    'Epic 1: Production-Grade Identity & Access Management',
    'Epic 2: Multi-Regulation Engine & Reporting', 
    'Epic 3: Data Persistence & History'
  ]

  const filteredRequirements = selectedEpic === 'all' 
    ? requirements 
    : requirements.filter(req => req.epic === selectedEpic)

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle size={16} className="text-green-600" />
      case 'in-progress': return <Clock size={16} className="text-accent" />
      default: return <AlertCircle size={16} className="text-muted-foreground" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-300'
      case 'in-progress': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      default: return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-300'
      case 'medium': return 'bg-blue-100 text-blue-800 border-blue-300'
      default: return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const addRequirement = () => {
    if (newRequirement.title && newRequirement.description) {
      const requirement: Requirement = {
        id: `req-${Date.now()}`,
        epic: newRequirement.epic || epics[0],
        title: newRequirement.title,
        description: newRequirement.description,
        acceptanceCriteria: newRequirement.acceptanceCriteria || [],
        priority: newRequirement.priority || 'medium',
        status: newRequirement.status || 'not-started'
      }
      
      setRequirements(prev => [...prev, requirement])
      setNewRequirement({
        epic: 'Epic 1: Production-Grade Identity & Access Management',
        priority: 'medium',
        status: 'not-started'
      })
      setShowAddForm(false)
    }
  }

  const updateRequirementStatus = (id: string, status: Requirement['status']) => {
    setRequirements(prev => 
      prev.map(req => req.id === id ? { ...req, status } : req)
    )
  }

  const getEpicProgress = (epic: string) => {
    const epicRequirements = requirements.filter(req => req.epic === epic)
    const completed = epicRequirements.filter(req => req.status === 'completed').length
    return epicRequirements.length > 0 ? Math.round((completed / epicRequirements.length) * 100) : 0
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Requirements Management</h2>
          <p className="text-muted-foreground mt-1">
            V2.0 user stories, epics, and acceptance criteria
          </p>
        </div>
        <Button onClick={() => setShowAddForm(!showAddForm)}>
          <Plus size={16} className="mr-2" />
          Add Requirement
        </Button>
      </div>

      {/* Epic Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {epics.map((epic, index) => {
          const progress = getEpicProgress(epic)
          const epicRequirements = requirements.filter(req => req.epic === epic)
          
          return (
            <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setSelectedEpic(epic)}>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-sm">Epic {index + 1}</h4>
                    <Badge variant="secondary">{epicRequirements.length} stories</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {epic.replace(`Epic ${index + 1}: `, '')}
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span>Progress</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {/* Add Requirement Form */}
          {showAddForm && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Add New Requirement</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Epic</label>
                  <select 
                    className="w-full mt-1 p-2 border rounded-md"
                    value={newRequirement.epic}
                    onChange={(e) => setNewRequirement(prev => ({ ...prev, epic: e.target.value }))}
                  >
                    {epics.map(epic => (
                      <option key={epic} value={epic}>{epic}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Title</label>
                  <Input 
                    value={newRequirement.title || ''}
                    onChange={(e) => setNewRequirement(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="As a user, I want to..."
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Textarea 
                    value={newRequirement.description || ''}
                    onChange={(e) => setNewRequirement(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Detailed description of the requirement..."
                  />
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="text-sm font-medium">Priority</label>
                    <select 
                      className="w-full mt-1 p-2 border rounded-md"
                      value={newRequirement.priority}
                      onChange={(e) => setNewRequirement(prev => ({ ...prev, priority: e.target.value as any }))}
                    >
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="text-sm font-medium">Status</label>
                    <select 
                      className="w-full mt-1 p-2 border rounded-md"
                      value={newRequirement.status}
                      onChange={(e) => setNewRequirement(prev => ({ ...prev, status: e.target.value as any }))}
                    >
                      <option value="not-started">Not Started</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setShowAddForm(false)}>
                    Cancel
                  </Button>
                  <Button onClick={addRequirement}>
                    Add Requirement
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Requirements List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText size={20} />
                Requirements ({filteredRequirements.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredRequirements.map((requirement) => (
                  <div key={requirement.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getStatusIcon(requirement.status)}
                          <h4 className="font-medium">{requirement.title}</h4>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          {requirement.description}
                        </p>
                        {requirement.acceptanceCriteria.length > 0 && (
                          <div className="space-y-1">
                            <div className="text-xs font-medium text-muted-foreground">
                              ACCEPTANCE CRITERIA:
                            </div>
                            <ul className="text-xs text-muted-foreground space-y-1">
                              {requirement.acceptanceCriteria.map((criteria, index) => (
                                <li key={index} className="flex items-start gap-2">
                                  <span>•</span>
                                  <span>{criteria}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-2 ml-4">
                        <Badge className={getPriorityColor(requirement.priority)}>
                          {requirement.priority}
                        </Badge>
                        <select
                          className={`text-xs px-2 py-1 rounded border ${getStatusColor(requirement.status)}`}
                          value={requirement.status}
                          onChange={(e) => updateRequirementStatus(requirement.id, e.target.value as any)}
                        >
                          <option value="not-started">Not Started</option>
                          <option value="in-progress">In Progress</option>
                          <option value="completed">Completed</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Epic Filter</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button
                  variant={selectedEpic === 'all' ? 'default' : 'outline'}
                  className="w-full justify-start text-left"
                  onClick={() => setSelectedEpic('all')}
                >
                  All Requirements ({requirements.length})
                </Button>
                {epics.map((epic) => (
                  <Button
                    key={epic}
                    variant={selectedEpic === epic ? 'default' : 'outline'}
                    className="w-full justify-start text-left"
                    onClick={() => setSelectedEpic(epic)}
                  >
                    <div className="truncate">
                      {epic.replace(/^Epic \d+: /, '')}
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users size={20} />
                Team Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Total Requirements</span>
                  <span className="font-semibold">{requirements.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Completed</span>
                  <span className="font-semibold text-green-600">
                    {requirements.filter(r => r.status === 'completed').length}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>In Progress</span>
                  <span className="font-semibold text-yellow-600">
                    {requirements.filter(r => r.status === 'in-progress').length}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Not Started</span>
                  <span className="font-semibold text-gray-600">
                    {requirements.filter(r => r.status === 'not-started').length}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function getDefaultRequirements(): Requirement[] {
  return [
    {
      id: 'req-1',
      epic: 'Epic 1: Production-Grade Identity & Access Management',
      title: 'User Registration and Authentication',
      description: 'As a user, I can securely sign up, log in, and manage my account via enterprise SSO (Microsoft Azure AD, Google Workspace) or fallback local authentication.',
      acceptanceCriteria: [
        'Enterprise SSO integration with Azure AD and Google Workspace',
        'SAML 2.0 and OIDC protocol support',
        'Single Sign-On experience for enterprise users',
        'Fallback local authentication for non-enterprise users',
        'Multi-factor authentication inherited from enterprise IdP'
      ],
      priority: 'high',
      status: 'completed'
    },
    {
      id: 'req-2', 
      epic: 'Epic 1: Production-Grade Identity & Access Management',
      title: 'Organization Team Management',
      description: 'As an Organization Admin, I can invite and remove team members from my organization\'s private workspace.',
      acceptanceCriteria: [
        'Admin can send email invitations to new team members',
        'Invitees can accept/decline invitations',
        'Admin can remove team members from organization',
        'Role-based permissions (admin, member, viewer)',
        'Audit trail of team changes'
      ],
      priority: 'high',
      status: 'in-progress'
    },
    {
      id: 'req-3',
      epic: 'Epic 2: Multi-Regulation Engine & Reporting',
      title: 'Regulation Selection and Document Upload',
      description: 'As a QM, I want to select from a library of regulations (21 CFR 820, ISO 13485) and upload my document for analysis.',
      acceptanceCriteria: [
        'Regulation library with 21 CFR 820 and ISO 13485',
        'Document upload supports PDF, Word, and text files',
        'File size limits and security scanning',
        'Progress indicator during upload',
        'Validation of document format and content'
      ],
      priority: 'high', 
      status: 'not-started'
    },
    {
      id: 'req-4',
      epic: 'Epic 2: Multi-Regulation Engine & Reporting',
      title: 'Gap Analysis Report Generation',
      description: 'As a QM, I want to export the final gap analysis report as a timestamped, uneditable PDF that includes my user ID, filename, and analysis date to support audit trail requirements.',
      acceptanceCriteria: [
        'PDF report generation with professional formatting',
        'Timestamp and user ID embedded in report',
        'Digital signature for report integrity',
        'Audit trail metadata included',
        'Export options for different formats'
      ],
      priority: 'medium',
      status: 'not-started'
    },
    {
      id: 'req-5',
      epic: 'Epic 3: Data Persistence & History',
      title: 'Document and Analysis Storage',
      description: 'As a user, I want my uploaded documents and their corresponding analysis reports to be saved securely and associated with my user profile.',
      acceptanceCriteria: [
        'Documents stored with encryption at rest',
        'Analysis results linked to user profile',
        'Multi-tenant data isolation enforced',
        'Backup and recovery procedures',
        'Data retention policy compliance'
      ],
      priority: 'high',
      status: 'not-started'
    },
    {
      id: 'req-6',
      epic: 'Epic 3: Data Persistence & History', 
      title: 'Historical Analysis Dashboard',
      description: 'As a user, I want to view a dashboard of my historical analyses to track compliance over time.',
      acceptanceCriteria: [
        'Chronological list of past analyses',
        'Search and filter functionality',
        'Trend analysis and compliance scoring',
        'Export historical data',
        'Comparative analysis between reports'
      ],
      priority: 'medium',
      status: 'not-started'
    }
  ]
}