import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  BookOpen, 
  Plus, 
  Search, 
  Globe, 
  Shield, 
  CheckCircle,
  Clock,
  AlertTriangle,
  FileText,
  Tag,
  Filter,
  Download,
  Edit,
  Trash2
} from '@phosphor-icons/react'
import { toast } from 'sonner'

interface RegulatoryStandard {
  id: string
  title: string
  code: string
  authority: string
  category: string
  region: string
  version: string
  effectiveDate: string
  lastUpdated: string
  description: string
  keyRequirements: string[]
  applicableIndustries: string[]
  relatedStandards: string[]
  status: 'active' | 'draft' | 'withdrawn' | 'superseded'
  complexity: 'low' | 'medium' | 'high'
  aiAnalysisCapability: number // percentage of standard that AI can effectively analyze
  sections: {
    number: string
    title: string
    requirements: number
    aiCoverage: number
  }[]
}

interface StandardsLibrary {
  totalStandards: number
  coverage: {
    medical: number
    pharmaceutical: number
    automotive: number
    aerospace: number
    software: number
    general: number
  }
  recentUpdates: number
  aiReadiness: number
}

export function RegulatoryStandardsExpansion() {
  const [activeTab, setActiveTab] = useState('library')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedRegion, setSelectedRegion] = useState('all')
  const [isAddingStandard, setIsAddingStandard] = useState(false)
  
  const [standards, setStandards] = useKV('regulatory-standards', [] as RegulatoryStandard[])
  const [libraryStats, setLibraryStats] = useKV('library-stats', {
    totalStandards: 62,
    coverage: { medical: 15, pharmaceutical: 20, automotive: 8, aerospace: 6, software: 7, general: 6 },
    recentUpdates: 3,
    aiReadiness: 93.2
  } as StandardsLibrary)

  // Initialize with comprehensive standards library
  useEffect(() => {
    if (standards.length === 0) {
      setStandards([
        // Pharmaceutical Regulations
        {
          id: 'cfr-211',
          title: '21 CFR Part 211 - Current Good Manufacturing Practice',
          code: '21 CFR 211',
          authority: 'FDA',
          category: 'pharmaceutical',
          region: 'US',
          version: '2024.1',
          effectiveDate: '1979-09-29',
          lastUpdated: '2024-01-15',
          description: 'Current good manufacturing practice (cGMP) for finished pharmaceuticals',
          keyRequirements: [
            'Personnel (211.25)',
            'Buildings and Facilities (211.42-211.58)',
            'Equipment (211.63-211.72)',
            'Control of Components (211.80-211.94)',
            'Production and Process Controls (211.100-211.115)',
            'Packaging and Labeling (211.122-211.130)',
            'Laboratory Controls (211.160-211.176)',
            'Records and Reports (211.180-211.198)'
          ],
          applicableIndustries: ['Pharmaceutical Manufacturing', 'Drug Production', 'API Manufacturing'],
          relatedStandards: ['21 CFR 210', 'ICH Q7', 'ICH Q10', 'EU GMP'],
          status: 'active',
          complexity: 'high',
          aiAnalysisCapability: 96.8,
          sections: [
            { number: '211.25', title: 'Personnel', requirements: 8, aiCoverage: 98 },
            { number: '211.100', title: 'Production Controls', requirements: 25, aiCoverage: 95 },
            { number: '211.160', title: 'Laboratory Controls', requirements: 18, aiCoverage: 97 },
            { number: '211.180', title: 'Records and Reports', requirements: 12, aiCoverage: 99 }
          ]
        },
        {
          id: 'cfr-210',
          title: '21 CFR Part 210 - Drug Manufacturing Standards',
          code: '21 CFR 210',
          authority: 'FDA',
          category: 'pharmaceutical',
          region: 'US',
          version: '2024.1',
          effectiveDate: '1979-09-29',
          lastUpdated: '2024-01-15',
          description: 'General provisions for drug manufacturing standards and definitions',
          keyRequirements: [
            'Scope and Definitions (210.1-210.3)',
            'Written Procedures (210.1)',
            'Compliance Requirements (210.1)'
          ],
          applicableIndustries: ['Pharmaceutical Manufacturing', 'Drug Production'],
          relatedStandards: ['21 CFR 211', 'ICH Q7'],
          status: 'active',
          complexity: 'medium',
          aiAnalysisCapability: 94.5,
          sections: [
            { number: '210.1', title: 'General Provisions', requirements: 5, aiCoverage: 96 },
            { number: '210.3', title: 'Definitions', requirements: 15, aiCoverage: 93 }
          ]
        },
        {
          id: 'ich-q7',
          title: 'ICH Q7 - Good Manufacturing Practice for APIs',
          code: 'ICH Q7',
          authority: 'ICH',
          category: 'pharmaceutical',
          region: 'Global',
          version: 'R1',
          effectiveDate: '2000-11-10',
          lastUpdated: '2023-12-05',
          description: 'Guide for good manufacturing practice for active pharmaceutical ingredients',
          keyRequirements: [
            'Quality Management (2)',
            'Personnel (3)',
            'Buildings and Facilities (4)',
            'Process Equipment (5)',
            'Documentation System (6)',
            'Materials Management (7)',
            'Production and In-Process Controls (8)',
            'Packaging and Identification (9)',
            'Storage and Distribution (10)',
            'Laboratory Controls (11)',
            'Validation (12)',
            'Change Control (13)',
            'Rejection and Reuse (14)',
            'Complaints and Recalls (15)',
            'Contract Manufacturers (16)',
            'Agents, Brokers, Traders (17)',
            'Specific Guidance for APIs (18)',
            'APIs for Clinical Trials (19)'
          ],
          applicableIndustries: ['API Manufacturing', 'Contract Manufacturing', 'Pharmaceutical Development'],
          relatedStandards: ['21 CFR 211', 'EU GMP', 'PIC/S GMP', 'ICH Q10'],
          status: 'active',
          complexity: 'high',
          aiAnalysisCapability: 95.2,
          sections: [
            { number: '2', title: 'Quality Management', requirements: 12, aiCoverage: 97 },
            { number: '8', title: 'Production Controls', requirements: 28, aiCoverage: 94 },
            { number: '11', title: 'Laboratory Controls', requirements: 15, aiCoverage: 96 },
            { number: '12', title: 'Validation', requirements: 20, aiCoverage: 93 }
          ]
        },
        {
          id: 'ich-q8',
          title: 'ICH Q8 - Pharmaceutical Development',
          code: 'ICH Q8',
          authority: 'ICH',
          category: 'pharmaceutical',
          region: 'Global',
          version: 'R2',
          effectiveDate: '2009-08-01',
          lastUpdated: '2023-11-28',
          description: 'Guideline on pharmaceutical development and Quality by Design (QbD)',
          keyRequirements: [
            'Pharmaceutical Development (2)',
            'Components of Pharmaceutical Development (3)',
            'Quality by Design (QbD) (4)',
            'Design Space (5)',
            'Control Strategy (6)'
          ],
          applicableIndustries: ['Drug Development', 'Pharmaceutical Manufacturing', 'Regulatory Affairs'],
          relatedStandards: ['ICH Q9', 'ICH Q10', 'ICH Q11', 'ICH Q12'],
          status: 'active',
          complexity: 'high',
          aiAnalysisCapability: 91.7,
          sections: [
            { number: '3', title: 'Components of Development', requirements: 18, aiCoverage: 89 },
            { number: '4', title: 'Quality by Design', requirements: 22, aiCoverage: 94 },
            { number: '6', title: 'Control Strategy', requirements: 16, aiCoverage: 91 }
          ]
        },
        {
          id: 'ich-q9',
          title: 'ICH Q9 - Quality Risk Management',
          code: 'ICH Q9',
          authority: 'ICH',
          category: 'pharmaceutical',
          region: 'Global',
          version: 'R1',
          effectiveDate: '2005-11-09',
          lastUpdated: '2023-10-12',
          description: 'Guideline on quality risk management principles and tools',
          keyRequirements: [
            'Risk Management Principles (3)',
            'Risk Management Process (4)',
            'Risk Management Methodology (5)',
            'Risk Management Tools (6)',
            'Integration of Quality Risk Management (7)'
          ],
          applicableIndustries: ['Pharmaceutical Manufacturing', 'Drug Development', 'Quality Management'],
          relatedStandards: ['ICH Q8', 'ICH Q10', 'ISO 14971', '21 CFR 211'],
          status: 'active',
          complexity: 'medium',
          aiAnalysisCapability: 93.4,
          sections: [
            { number: '4', title: 'Risk Management Process', requirements: 14, aiCoverage: 95 },
            { number: '5', title: 'Risk Methodology', requirements: 10, aiCoverage: 92 },
            { number: '6', title: 'Risk Management Tools', requirements: 8, aiCoverage: 90 }
          ]
        },
        {
          id: 'ich-q10',
          title: 'ICH Q10 - Pharmaceutical Quality System',
          code: 'ICH Q10',
          authority: 'ICH',
          category: 'pharmaceutical',
          region: 'Global',
          version: 'R1',
          effectiveDate: '2008-06-04',
          lastUpdated: '2023-09-22',
          description: 'Model for an effective pharmaceutical quality system based on ICH Q8 and Q9',
          keyRequirements: [
            'Quality System Elements (3)',
            'Management Responsibility (4)',
            'Quality Management Processes (5)',
            'Continual Improvement (6)'
          ],
          applicableIndustries: ['Pharmaceutical Manufacturing', 'Drug Development', 'Quality Assurance'],
          relatedStandards: ['ICH Q8', 'ICH Q9', 'ICH Q11', 'ICH Q12'],
          status: 'active',
          complexity: 'high',
          aiAnalysisCapability: 92.1,
          sections: [
            { number: '3', title: 'Quality System Elements', requirements: 16, aiCoverage: 94 },
            { number: '5', title: 'Quality Management Processes', requirements: 20, aiCoverage: 90 },
            { number: '6', title: 'Continual Improvement', requirements: 12, aiCoverage: 93 }
          ]
        },
        // Medical Device Regulations
        {
          id: 'cfr-820',
          title: '21 CFR Part 820 - Quality System Regulation',
          code: '21 CFR 820',
          authority: 'FDA',
          category: 'medical',
          region: 'US',
          version: '2024.1',
          effectiveDate: '1996-06-01',
          lastUpdated: '2024-01-15',
          description: 'Current good manufacturing practice (cGMP) requirements for medical devices',
          keyRequirements: [
            'Design Controls (820.30)',
            'Document Controls (820.40)', 
            'Management Responsibility (820.20)',
            'Corrective and Preventive Actions (820.100)',
            'Risk Management Integration'
          ],
          applicableIndustries: ['Medical Device Manufacturing', 'IVD', 'Software as Medical Device'],
          relatedStandards: ['ISO 13485', 'IEC 62304', 'ISO 14971'],
          status: 'active',
          complexity: 'high',
          aiAnalysisCapability: 94.2,
          sections: [
            { number: '820.20', title: 'Management Responsibility', requirements: 12, aiCoverage: 96 },
            { number: '820.30', title: 'Design Controls', requirements: 23, aiCoverage: 91 },
            { number: '820.40', title: 'Document Controls', requirements: 8, aiCoverage: 98 },
            { number: '820.100', title: 'CAPA', requirements: 15, aiCoverage: 89 }
          ]
        },
        {
          id: 'iso-13485',
          title: 'ISO 13485:2016 - Medical Devices Quality Management',
          code: 'ISO 13485',
          authority: 'ISO',
          category: 'medical',
          region: 'Global',
          version: '2016',
          effectiveDate: '2016-03-01',
          lastUpdated: '2023-12-10',
          description: 'Quality management systems for medical devices regulatory purposes',
          keyRequirements: [
            'Quality Management System (Clause 4)',
            'Management Responsibility (Clause 5)',
            'Resource Management (Clause 6)',
            'Product Realization (Clause 7)',
            'Measurement and Improvement (Clause 8)'
          ],
          applicableIndustries: ['Medical Device Manufacturing', 'IVD', 'Pharmaceutical'],
          relatedStandards: ['21 CFR 820', 'ISO 9001', 'IEC 62304'],
          status: 'active',
          complexity: 'high',
          aiAnalysisCapability: 92.8,
          sections: [
            { number: '4', title: 'Quality Management System', requirements: 18, aiCoverage: 94 },
            { number: '5', title: 'Management Responsibility', requirements: 14, aiCoverage: 96 },
            { number: '7', title: 'Product Realization', requirements: 35, aiCoverage: 88 },
            { number: '8', title: 'Measurement and Improvement', requirements: 22, aiCoverage: 95 }
          ]
        },
        // Additional key standards
        {
          id: 'iso-9001',
          title: 'ISO 9001:2015 - Quality Management Systems',
          code: 'ISO 9001',
          authority: 'ISO',
          category: 'general',
          region: 'Global',
          version: '2015',
          effectiveDate: '2015-09-15',
          lastUpdated: '2023-10-05',
          description: 'Requirements for quality management systems across all industries',
          keyRequirements: [
            'Context of Organization (Clause 4)',
            'Leadership (Clause 5)',
            'Planning (Clause 6)',
            'Support (Clause 7)',
            'Operation (Clause 8)',
            'Performance Evaluation (Clause 9)',
            'Improvement (Clause 10)'
          ],
          applicableIndustries: ['Manufacturing', 'Services', 'Software', 'Healthcare', 'Automotive'],
          relatedStandards: ['ISO 13485', 'AS9100', 'ISO/TS 16949'],
          status: 'active',
          complexity: 'medium',
          aiAnalysisCapability: 96.3,
          sections: [
            { number: '4', title: 'Context of Organization', requirements: 8, aiCoverage: 98 },
            { number: '8', title: 'Operation', requirements: 28, aiCoverage: 94 },
            { number: '9', title: 'Performance Evaluation', requirements: 12, aiCoverage: 97 },
            { number: '10', title: 'Improvement', requirements: 6, aiCoverage: 95 }
          ]
        }
      ])
      
      // Update library stats to include pharmaceutical category
      setLibraryStats(prev => ({
        ...prev,
        totalStandards: 62,
        coverage: { 
          medical: 15, 
          pharmaceutical: 20, 
          automotive: 8, 
          aerospace: 6, 
          software: 7,
          general: 6 
        }
      }))
    }
  }, [standards.length, setStandards, setLibraryStats])

  const filteredStandards = standards.filter(standard => {
    const matchesSearch = standard.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         standard.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         standard.authority.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || standard.category === selectedCategory
    const matchesRegion = selectedRegion === 'all' || standard.region === selectedRegion
    
    return matchesSearch && matchesCategory && matchesRegion
  })

  const categories = ['all', 'medical', 'pharmaceutical', 'automotive', 'aerospace', 'software', 'general']
  const regions = ['all', 'Global', 'US', 'EU', 'Asia-Pacific']

  const addNewStandard = async () => {
    // Simulate adding a new standard
    const newStandard: RegulatoryStandard = {
      id: `std-${Date.now()}`,
      title: 'Custom Standard Template',
      code: 'CUST-001',
      authority: 'Internal',
      category: 'general',
      region: 'Global',
      version: '1.0',
      effectiveDate: new Date().toISOString().split('T')[0],
      lastUpdated: new Date().toISOString().split('T')[0],
      description: 'Custom regulatory standard template',
      keyRequirements: ['Requirement 1', 'Requirement 2'],
      applicableIndustries: ['General'],
      relatedStandards: [],
      status: 'draft',
      complexity: 'medium',
      aiAnalysisCapability: 0,
      sections: []
    }
    
    setStandards(prev => [newStandard, ...prev])
    setLibraryStats(prev => ({
      ...prev,
      totalStandards: prev.totalStandards + 1
    }))
    
    toast.success('New standard template created')
    setIsAddingStandard(false)
  }

  const enhanceAICapability = async (standardId: string) => {
    // Simulate AI capability enhancement
    setStandards(prev => prev.map(std => 
      std.id === standardId 
        ? { ...std, aiAnalysisCapability: Math.min(100, std.aiAnalysisCapability + 5) }
        : std
    ))
    
    toast.success('AI analysis capability enhanced')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <BookOpen size={24} className="text-primary" />
            Regulatory Standards Library
          </h2>
          <p className="text-muted-foreground mt-1">
            Manage and expand regulatory standards for comprehensive compliance analysis
          </p>
        </div>
        <Dialog open={isAddingStandard} onOpenChange={setIsAddingStandard}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus size={16} />
              Add Standard
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Regulatory Standard</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Alert>
                <AlertTriangle size={16} />
                <AlertDescription className="text-xs">
                  Adding custom standards requires validation by regulatory experts. 
                  AI analysis capabilities will need to be trained and validated.
                </AlertDescription>
              </Alert>
              <div className="grid grid-cols-2 gap-4">
                <Input placeholder="Standard Code (e.g., ISO 9001)" />
                <Input placeholder="Version (e.g., 2015)" />
              </div>
              <Input placeholder="Full Title" />
              <Textarea placeholder="Description and scope..." className="h-24" />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsAddingStandard(false)}>
                  Cancel
                </Button>
                <Button onClick={addNewStandard}>
                  Create Template
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="library">Standards Library</TabsTrigger>
          <TabsTrigger value="coverage">Coverage Analysis</TabsTrigger>
          <TabsTrigger value="enhancement">AI Enhancement</TabsTrigger>
          <TabsTrigger value="relationships">Relationships</TabsTrigger>
        </TabsList>

        <TabsContent value="library" className="space-y-6">
          {/* Library Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-muted-foreground">Total Standards</div>
                    <div className="text-2xl font-bold">{libraryStats.totalStandards}</div>
                  </div>
                  <BookOpen size={20} className="text-primary" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-muted-foreground">AI Readiness</div>
                    <div className="text-2xl font-bold">{libraryStats.aiReadiness}%</div>
                  </div>
                  <Shield size={20} className="text-green-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-muted-foreground">Recent Updates</div>
                    <div className="text-2xl font-bold">{libraryStats.recentUpdates}</div>
                  </div>
                  <Clock size={20} className="text-accent" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-muted-foreground">Coverage Areas</div>
                    <div className="text-2xl font-bold">6</div>
                  </div>
                  <Globe size={20} className="text-blue-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filter */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search standards by title, code, or authority..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>
                        {cat === 'all' ? 'All Categories' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {regions.map(region => (
                      <SelectItem key={region} value={region}>
                        {region === 'all' ? 'All Regions' : region}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Standards List */}
          <div className="space-y-4">
            {filteredStandards.map((standard) => (
              <Card key={standard.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle className="text-lg">{standard.title}</CardTitle>
                        <Badge 
                          variant={standard.status === 'active' ? 'default' : 
                                  standard.status === 'draft' ? 'secondary' : 'outline'}
                          className="text-xs"
                        >
                          {standard.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{standard.authority}</span>
                        <span>•</span>
                        <span>{standard.region}</span>
                        <span>•</span>
                        <span>Version {standard.version}</span>
                        <span>•</span>
                        <Badge variant="outline" className="text-xs">
                          {standard.complexity} complexity
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <div className="text-sm font-medium">AI Coverage</div>
                        <div className="text-xs text-muted-foreground">
                          {standard.aiAnalysisCapability}%
                        </div>
                      </div>
                      <Button size="sm" variant="outline">
                        <Edit size={14} />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-foreground">{standard.description}</p>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium mb-2">Key Requirements</h4>
                      <div className="space-y-1">
                        {standard.keyRequirements.slice(0, 3).map((req, idx) => (
                          <div key={idx} className="text-xs flex items-center gap-2">
                            <CheckCircle size={12} className="text-green-600" />
                            {req}
                          </div>
                        ))}
                        {standard.keyRequirements.length > 3 && (
                          <div className="text-xs text-muted-foreground">
                            +{standard.keyRequirements.length - 3} more requirements
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium mb-2">Applicable Industries</h4>
                      <div className="flex flex-wrap gap-1">
                        {standard.applicableIndustries.slice(0, 3).map((industry, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {industry}
                          </Badge>
                        ))}
                        {standard.applicableIndustries.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{standard.applicableIndustries.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="text-xs text-muted-foreground">
                      Last updated: {new Date(standard.lastUpdated).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" className="text-xs">
                        <FileText size={12} className="mr-1" />
                        View Details
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="text-xs"
                        onClick={() => enhanceAICapability(standard.id)}
                      >
                        <Shield size={12} className="mr-1" />
                        Enhance AI
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="coverage" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Industry Coverage Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {Object.entries(libraryStats.coverage).map(([industry, count]) => (
                <div key={industry} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium capitalize">{industry}</span>
                    <span className="text-sm text-muted-foreground">{count} standards</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${(count / 20) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="enhancement" className="space-y-6">
          <Alert>
            <Shield size={16} />
            <AlertDescription>
              AI model enhancement tracks the system's ability to accurately analyze each regulatory standard. 
              Higher capabilities mean more reliable automated compliance checking.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            {standards.map((standard) => (
              <Card key={standard.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-medium">{standard.code}</h3>
                      <p className="text-sm text-muted-foreground">{standard.title}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-foreground">
                        {standard.aiAnalysisCapability}%
                      </div>
                      <div className="text-xs text-muted-foreground">AI Capability</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">Overall AI Coverage:</span>
                      <div className="flex-1">
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all ${
                              standard.aiAnalysisCapability >= 90 ? 'bg-green-600' :
                              standard.aiAnalysisCapability >= 80 ? 'bg-accent' :
                              'bg-orange-500'
                            }`}
                            style={{ width: `${standard.aiAnalysisCapability}%` }}
                          />
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => enhanceAICapability(standard.id)}
                        className="text-xs"
                      >
                        Enhance
                      </Button>
                    </div>

                    {standard.sections.length > 0 && (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 mt-4">
                        {standard.sections.map((section) => (
                          <div key={section.number} className="p-2 border rounded text-xs">
                            <div className="flex justify-between items-center">
                              <span className="font-medium">{section.number}</span>
                              <span className="text-muted-foreground">{section.aiCoverage}%</span>
                            </div>
                            <div className="text-muted-foreground truncate">
                              {section.title}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="relationships" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Standard Relationships & Dependencies</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {standards.filter(s => s.relatedStandards.length > 0).map((standard) => (
                  <div key={standard.id} className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {standard.code}
                      </Badge>
                      <span className="text-sm font-medium">{standard.title}</span>
                    </div>
                    
                    <div className="ml-6 space-y-2">
                      <div className="text-xs text-muted-foreground">Related Standards:</div>
                      <div className="flex flex-wrap gap-2">
                        {standard.relatedStandards.map((related, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {related}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <Separator />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}