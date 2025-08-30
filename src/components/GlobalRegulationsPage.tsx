import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { RegulatorySearchEngine } from './RegulatorySearchEngine'
import { EnhancedEnterpriseSSOPage } from './EnhancedEnterpriseSSOPage'
import { 
  Globe, 
  FileText, 
  Search,
  Download,
  BookOpen,
  Scale,
  Building,
  Users,
  ChevronRight,
  ExternalLink,
  Shield,
  CheckCircle,
  Plus,
  Database,
  Zap
} from '@phosphor-icons/react'

interface Regulation {
  id: string
  name: string
  region: string
  description: string
  lastUpdated: string
  sections: number
  applicability: string[]
  status: 'active' | 'updated' | 'new'
}

export function GlobalRegulationsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRegion, setSelectedRegion] = useState('all')
  const [currentView, setCurrentView] = useState<'overview' | 'search' | 'browse'>('overview')

  const regulations: Regulation[] = [
    {
      id: 'fda-qsr',
      name: '21 CFR Part 820 (Quality System Regulation)',
      region: 'United States',
      description: 'FDA quality system regulation for medical device manufacturers',
      lastUpdated: '2024-01-15',
      sections: 23,
      applicability: ['Medical Devices', 'Manufacturing', 'Design Controls'],
      status: 'active'
    },
    {
      id: 'eu-mdr',
      name: 'EU MDR 2017/745',
      region: 'European Union',
      description: 'Medical Device Regulation for CE marking and market access',
      lastUpdated: '2024-02-20',
      sections: 127,
      applicability: ['Medical Devices', 'Clinical Trials', 'Post-Market Surveillance'],
      status: 'updated'
    },
    {
      id: 'iso-13485',
      name: 'ISO 13485:2016',
      region: 'International',
      description: 'Quality management systems for medical devices',
      lastUpdated: '2024-01-10',
      sections: 45,
      applicability: ['Quality Management', 'Medical Devices', 'Risk Management'],
      status: 'active'
    },
    {
      id: 'pmda-japan',
      name: 'PMD Act (Japan)',
      region: 'Japan',
      description: 'Pharmaceuticals and Medical Devices Act',
      lastUpdated: '2024-03-01',
      sections: 67,
      applicability: ['Medical Devices', 'Pharmaceuticals', 'Clinical Data'],
      status: 'new'
    },
    {
      id: 'tga-australia',
      name: 'TGA Therapeutic Goods Act',
      region: 'Australia',
      description: 'Regulatory framework for therapeutic goods',
      lastUpdated: '2024-01-25',
      sections: 34,
      applicability: ['Therapeutic Goods', 'Manufacturing', 'Registration'],
      status: 'active'
    },
    {
      id: 'health-canada',
      name: 'Health Canada Medical Device Regulations',
      region: 'Canada',
      description: 'MDSAP-aligned medical device regulations',
      lastUpdated: '2024-02-10',
      sections: 56,
      applicability: ['Medical Devices', 'MDSAP', 'Quality Systems'],
      status: 'active'
    },
    {
      id: 'anvisa-brazil',
      name: 'ANVISA RDC 16/2013',
      region: 'Brazil',
      description: 'Good Manufacturing Practices for medical devices',
      lastUpdated: '2024-01-30',
      sections: 28,
      applicability: ['Manufacturing', 'Quality Control', 'Registration'],
      status: 'active'
    },
    {
      id: 'nmpa-china',
      name: 'NMPA Medical Device Regulations',
      region: 'China',
      description: 'National Medical Products Administration device regulations',
      lastUpdated: '2024-02-15',
      sections: 89,
      applicability: ['Medical Devices', 'Clinical Trials', 'Registration'],
      status: 'updated'
    }
  ]

  const regions = [
    { id: 'all', name: 'All Regions', count: regulations.length },
    { id: 'us', name: 'United States', count: regulations.filter(r => r.region === 'United States').length },
    { id: 'eu', name: 'European Union', count: regulations.filter(r => r.region === 'European Union').length },
    { id: 'asia', name: 'Asia Pacific', count: regulations.filter(r => ['Japan', 'Australia', 'China'].includes(r.region)).length },
    { id: 'americas', name: 'Americas', count: regulations.filter(r => ['Canada', 'Brazil'].includes(r.region)).length },
    { id: 'international', name: 'International', count: regulations.filter(r => r.region === 'International').length }
  ]

  const filteredRegulations = regulations.filter(reg => {
    const matchesSearch = reg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         reg.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         reg.applicability.some(app => app.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesRegion = selectedRegion === 'all' || 
                         (selectedRegion === 'us' && reg.region === 'United States') ||
                         (selectedRegion === 'eu' && reg.region === 'European Union') ||
                         (selectedRegion === 'asia' && ['Japan', 'Australia', 'China'].includes(reg.region)) ||
                         (selectedRegion === 'americas' && ['Canada', 'Brazil'].includes(reg.region)) ||
                         (selectedRegion === 'international' && reg.region === 'International')
    
    return matchesSearch && matchesRegion
  })

  if (currentView === 'search') {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => setCurrentView('overview')}>
            ← Back to Overview
          </Button>
          <div>
            <h2 className="text-2xl font-bold">Advanced Regulatory Search</h2>
            <p className="text-muted-foreground text-sm">
              Deep search across all regulatory content with AI-powered relevance
            </p>
          </div>
        </div>
        <RegulatorySearchEngine />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Globe size={32} />
            Global Regulatory Standards
          </h1>
          <p className="text-muted-foreground mt-2">
            Access comprehensive regulatory frameworks from major global markets
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setCurrentView('search')}>
            <Search size={16} className="mr-2" />
            Advanced Search
          </Button>
          <Button>
            <Plus size={16} className="mr-2" />
            Request New Standard
          </Button>
        </div>
      </div>

      {/* Enhanced Search Preview */}
      <Card className="border-2 border-dashed border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3">
              <Search size={24} className="text-primary" />
              <Zap size={24} className="text-accent" />
              <Database size={24} className="text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">
                AI-Powered Regulatory Search Engine
              </h3>
              <p className="text-sm text-muted-foreground mb-4 max-w-2xl mx-auto">
                Search across 1,200+ regulatory requirements, 469 standard sections, and thousands of compliance clauses with intelligent relevance ranking and cross-reference detection.
              </p>
              <Button onClick={() => setCurrentView('search')} size="lg">
                <Search size={16} className="mr-2" />
                Launch Advanced Search
                <ChevronRight size={16} className="ml-2" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Quick search regulations, descriptions, or applicability areas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              {regions.map((region) => (
                <Button
                  key={region.id}
                  variant={selectedRegion === region.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedRegion(region.id)}
                  className="text-xs"
                >
                  {region.name}
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {region.count}
                  </Badge>
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Regulations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredRegulations.map((regulation) => (
          <Card key={regulation.id} className="hover:shadow-md transition-all duration-200">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText size={20} />
                    {regulation.name}
                  </CardTitle>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="text-xs">
                      {regulation.region}
                    </Badge>
                    <Badge 
                      variant={regulation.status === 'new' ? 'default' : 
                              regulation.status === 'updated' ? 'secondary' : 'outline'}
                      className="text-xs"
                    >
                      {regulation.status === 'new' ? 'New' :
                       regulation.status === 'updated' ? 'Updated' : 'Active'}
                    </Badge>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <ExternalLink size={16} />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {regulation.description}
              </p>
              
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Sections: {regulation.sections}</span>
                <span>Updated: {new Date(regulation.lastUpdated).toLocaleDateString()}</span>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-medium text-foreground">Applicability:</p>
                <div className="flex flex-wrap gap-1">
                  {regulation.applicability.map((area, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {area}
                    </Badge>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <BookOpen size={14} className="mr-2" />
                  Browse Standard
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Download size={14} className="mr-2" />
                  Download PDF
                </Button>
                <Button size="sm">
                  <Shield size={14} className="mr-2" />
                  Run Analysis
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Access Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield size={20} />
            Quick Access Tools
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col items-center gap-2"
              onClick={() => setCurrentView('search')}
            >
              <Search size={24} />
              <div className="text-center">
                <div className="font-medium">Advanced Search</div>
                <div className="text-xs text-muted-foreground">AI-powered regulatory search</div>
              </div>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <Scale size={24} />
              <div className="text-center">
                <div className="font-medium">Regulation Comparison</div>
                <div className="text-xs text-muted-foreground">Compare requirements across regions</div>
              </div>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <Building size={24} />
              <div className="text-center">
                <div className="font-medium">Compliance Mapping</div>
                <div className="text-xs text-muted-foreground">Map your QMS to standards</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">8</div>
            <div className="text-xs text-muted-foreground">Global Regions</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">469</div>
            <div className="text-xs text-muted-foreground">Total Sections</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">1,247</div>
            <div className="text-xs text-muted-foreground">Requirement Clauses</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">99.7%</div>
            <div className="text-xs text-muted-foreground">AI Accuracy</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}