import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  FileText, 
  Shield,
  CheckCircle,
  Clock,
  AlertTriangle,
  Download,
  Eye,
  Lock,
  Calendar,
  Users,
  Plus
} from '@phosphor-icons/react'

interface ComplianceDocument {
  id: string
  name: string
  category: string
  status: 'complete' | 'in-review' | 'draft' | 'approved'
  lastUpdated: string
  owner: string
  version: string
  reviewers: number
}

export function CompliancePage() {
  const [selectedCategory, setSelectedCategory] = useState('all')

  const documents: ComplianceDocument[] = [
    {
      id: 'cybersecurity-plan',
      name: 'Cybersecurity Plan v2.0',
      category: 'Security',
      status: 'approved',
      lastUpdated: '2024-03-15',
      owner: 'Security Team',
      version: '2.0.1',
      reviewers: 3
    },
    {
      id: 'cfr-part-11',
      name: '21 CFR Part 11 Compliance Strategy',
      category: 'Regulatory',
      status: 'approved',
      lastUpdated: '2024-03-14',
      owner: 'Compliance Team',
      version: '1.2.0',
      reviewers: 5
    },
    {
      id: 'ai-validation',
      name: 'AI Model Validation Protocol',
      category: 'Validation',
      status: 'complete',
      lastUpdated: '2024-03-13',
      owner: 'AI Team',
      version: '1.0.0',
      reviewers: 4
    },
    {
      id: 'risk-management',
      name: 'Risk Management Plan v2.0',
      category: 'Risk',
      status: 'approved',
      lastUpdated: '2024-03-12',
      owner: 'Quality Team',
      version: '2.1.0',
      reviewers: 6
    },
    {
      id: 'disaster-recovery',
      name: 'Disaster Recovery Plan',
      category: 'Operations',
      status: 'approved',
      lastUpdated: '2024-03-11',
      owner: 'DevOps Team',
      version: '1.0.0',
      reviewers: 3
    },
    {
      id: 'privacy-policy',
      name: 'Privacy Policy',
      category: 'Legal',
      status: 'in-review',
      lastUpdated: '2024-03-10',
      owner: 'Legal Team',
      version: '1.1.0',
      reviewers: 2
    }
  ]

  const categories = [
    { id: 'all', name: 'All Documents', count: documents.length },
    { id: 'security', name: 'Security', count: documents.filter(d => d.category === 'Security').length },
    { id: 'regulatory', name: 'Regulatory', count: documents.filter(d => d.category === 'Regulatory').length },
    { id: 'validation', name: 'Validation', count: documents.filter(d => d.category === 'Validation').length },
    { id: 'legal', name: 'Legal', count: documents.filter(d => d.category === 'Legal').length }
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle size={16} className="text-green-600" />
      case 'complete': return <CheckCircle size={16} className="text-green-600" />
      case 'in-review': return <Clock size={16} className="text-amber-600" />
      case 'draft': return <AlertTriangle size={16} className="text-gray-500" />
      default: return <Clock size={16} className="text-gray-500" />
    }
  }

  const filteredDocuments = documents.filter(doc => {
    if (selectedCategory === 'all') return true
    return doc.category.toLowerCase() === selectedCategory
  })

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <FileText size={32} />
            Compliance Documentation
          </h1>
          <p className="text-muted-foreground mt-2">
            Quality Management System (QMS) documentation and validation protocols
          </p>
        </div>
        <Button>
          <Plus size={16} className="mr-2" />
          Create Document
        </Button>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">13</div>
            <div className="text-xs text-muted-foreground">Approved Documents</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-amber-600">2</div>
            <div className="text-xs text-muted-foreground">In Review</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">98.7%</div>
            <div className="text-xs text-muted-foreground">Completion Rate</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">15</div>
            <div className="text-xs text-muted-foreground">Days to Review</div>
          </CardContent>
        </Card>
      </div>

      {/* Category Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className="text-xs"
              >
                {category.name}
                <Badge variant="secondary" className="ml-2 text-xs">
                  {category.count}
                </Badge>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredDocuments.map((doc) => (
          <Card key={doc.id} className="hover:shadow-md transition-all duration-200">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText size={20} />
                    {doc.name}
                  </CardTitle>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="text-xs">
                      {doc.category}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      v{doc.version}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(doc.status)}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-xs text-muted-foreground">Owner</div>
                  <div className="font-medium">{doc.owner}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Last Updated</div>
                  <div className="font-medium">
                    {new Date(doc.lastUpdated).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Users size={14} className="text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  {doc.reviewers} reviewers assigned
                </span>
              </div>

              <Separator />

              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Eye size={14} className="mr-2" />
                  View
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Download size={14} className="mr-2" />
                  Download
                </Button>
                <Button size="sm">
                  <Lock size={14} className="mr-2" />
                  Review
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Compliance Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield size={20} />
            Compliance Status Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { standard: '21 CFR Part 11', status: 'Compliant', icon: CheckCircle, color: 'text-green-600' },
              { standard: 'ISO 13485:2016', status: 'Compliant', icon: CheckCircle, color: 'text-green-600' },
              { standard: 'GDPR', status: 'Compliant', icon: CheckCircle, color: 'text-green-600' },
              { standard: 'SOC 2 Type II', status: 'In Progress', icon: Clock, color: 'text-amber-600' }
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium text-sm">{item.standard}</div>
                  <div className="text-xs text-muted-foreground">{item.status}</div>
                </div>
                <item.icon size={20} className={item.color} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}