import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Search,
  Filter,
  FileText,
  Globe,
  BookOpen,
  ChevronRight,
  ExternalLink,
  Clock,
  Target,
  AlertCircle,
  CheckCircle,
  Lightbulb,
  Star,
  ArrowRight
} from '@phosphor-icons/react'

interface RegulationSection {
  id: string
  title: string
  content: string
  subsections: string[]
  requirements: string[]
  applicability: string[]
  crossReferences: string[]
}

interface Regulation {
  id: string
  name: string
  shortName: string
  region: string
  country: string
  description: string
  lastUpdated: string
  sections: RegulationSection[]
  totalSections: number
  applicability: string[]
  status: 'active' | 'updated' | 'new' | 'superseded'
  complexity: 'low' | 'medium' | 'high'
  implementationDifficulty: number
  industry: string[]
  tags: string[]
}

interface SearchResult {
  regulation: Regulation
  section?: RegulationSection
  relevanceScore: number
  matchType: 'title' | 'content' | 'requirement' | 'tag'
  matchText: string
}

export function RegulatorySearchEngine() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRegion, setSelectedRegion] = useState('all')
  const [selectedIndustry, setSelectedIndustry] = useState('all')
  const [selectedComplexity, setSelectedComplexity] = useState('all')
  const [searchMode, setSearchMode] = useState<'basic' | 'advanced'>('basic')
  const [showFilters, setShowFilters] = useState(false)

  // Mock data representing a comprehensive regulatory database
  const regulations: Regulation[] = [
    {
      id: 'fda-qsr',
      name: '21 CFR Part 820 - Quality System Regulation',
      shortName: 'FDA QSR',
      region: 'North America',
      country: 'United States',
      description: 'Comprehensive quality system regulation for medical device manufacturers under FDA jurisdiction',
      lastUpdated: '2024-01-15',
      totalSections: 23,
      applicability: ['Medical Devices', 'Manufacturing', 'Design Controls', 'Risk Management'],
      status: 'active',
      complexity: 'high',
      implementationDifficulty: 8,
      industry: ['Medical Devices', 'IVD', 'Software as Medical Device'],
      tags: ['quality', 'manufacturing', 'FDA', 'design controls', 'validation'],
      sections: [
        {
          id: '820.30',
          title: 'Design Controls',
          content: 'Each manufacturer of any class II or class III device shall establish and maintain procedures to control the design of the device...',
          subsections: ['Design Planning', 'Design Input', 'Design Output', 'Design Review', 'Design Verification', 'Design Validation'],
          requirements: ['Design and development planning', 'Design inputs documented', 'Design outputs documented and verified'],
          applicability: ['Class II Devices', 'Class III Devices', 'Software Medical Devices'],
          crossReferences: ['ISO 13485:7.3', 'IEC 62304:5.0']
        },
        {
          id: '820.70',
          title: 'Production and Process Controls',
          content: 'Each manufacturer shall develop, conduct, control, and monitor production processes to ensure that a device conforms to its specifications...',
          subsections: ['Process Validation', 'Installation Controls', 'Inspection Controls'],
          requirements: ['Process validation protocols', 'Installation procedures', 'Inspection procedures'],
          applicability: ['All Medical Devices', 'Manufacturing Sites'],
          crossReferences: ['ISO 13485:7.5', 'ISO 9001:8.5']
        }
      ]
    },
    {
      id: 'eu-mdr',
      name: 'EU MDR 2017/745 - Medical Device Regulation',
      shortName: 'EU MDR',
      region: 'Europe',
      country: 'European Union',
      description: 'Comprehensive medical device regulation for CE marking and European market access',
      lastUpdated: '2024-02-20',
      totalSections: 127,
      applicability: ['Medical Devices', 'Clinical Trials', 'Post-Market Surveillance', 'Notified Bodies'],
      status: 'updated',
      complexity: 'high',
      implementationDifficulty: 9,
      industry: ['Medical Devices', 'IVD', 'Software as Medical Device', 'Implantable Devices'],
      tags: ['CE marking', 'clinical trials', 'post-market surveillance', 'UDI', 'EUDAMED'],
      sections: [
        {
          id: 'Article-10',
          title: 'Classification Rules',
          content: 'Devices are classified into classes I, IIa, IIb and III, taking into account the intended purpose of the devices and their inherent risks...',
          subsections: ['Class I Rules', 'Class IIa Rules', 'Class IIb Rules', 'Class III Rules'],
          requirements: ['Risk-based classification', 'Clinical evidence requirements', 'Conformity assessment procedures'],
          applicability: ['All Medical Devices', 'Manufacturers', 'Authorized Representatives'],
          crossReferences: ['Annex VIII Classification Rules', 'Article 52 Clinical Evaluation']
        }
      ]
    },
    {
      id: 'iso-13485',
      name: 'ISO 13485:2016 - Medical Devices Quality Management',
      shortName: 'ISO 13485',
      region: 'International',
      country: 'International',
      description: 'International standard for quality management systems specific to medical devices',
      lastUpdated: '2024-01-10',
      totalSections: 45,
      applicability: ['Quality Management', 'Medical Devices', 'Risk Management', 'Regulatory Affairs'],
      status: 'active',
      complexity: 'medium',
      implementationDifficulty: 7,
      industry: ['Medical Devices', 'IVD', 'Software as Medical Device'],
      tags: ['quality management', 'ISO', 'process controls', 'documentation', 'CAPA'],
      sections: [
        {
          id: '7.3',
          title: 'Design and Development',
          content: 'The organization shall establish, implement and maintain design and development processes appropriate to ensure the effective design and development of products...',
          subsections: ['Design Planning', 'Design Inputs', 'Design Outputs', 'Design Review'],
          requirements: ['Design controls implementation', 'Risk management integration', 'Validation and verification'],
          applicability: ['Design Organizations', 'Software Developers', 'Device Manufacturers'],
          crossReferences: ['ISO 14971:4.2', '21 CFR 820.30']
        }
      ]
    },
    {
      id: 'pmda-japan',
      name: 'PMD Act - Pharmaceuticals and Medical Devices Act',
      shortName: 'PMD Act',
      region: 'Asia Pacific',
      country: 'Japan',
      description: 'Japanese regulatory framework for pharmaceuticals and medical devices under PMDA oversight',
      lastUpdated: '2024-03-01',
      totalSections: 67,
      applicability: ['Medical Devices', 'Pharmaceuticals', 'Clinical Data', 'Manufacturing'],
      status: 'new',
      complexity: 'high',
      implementationDifficulty: 8,
      industry: ['Medical Devices', 'Pharmaceuticals', 'Biotechnology'],
      tags: ['PMDA', 'Japanese market', 'clinical data', 'manufacturing', 'approval'],
      sections: []
    },
    {
      id: 'ich-q9',
      name: 'ICH Q9 - Quality Risk Management',
      shortName: 'ICH Q9',
      region: 'International',
      country: 'International',
      description: 'International guideline on quality risk management for pharmaceutical quality systems',
      lastUpdated: '2024-01-05',
      totalSections: 12,
      applicability: ['Risk Management', 'Pharmaceutical Quality', 'Manufacturing', 'Clinical Trials'],
      status: 'active',
      complexity: 'medium',
      implementationDifficulty: 6,
      industry: ['Pharmaceuticals', 'Biotechnology', 'Medical Devices'],
      tags: ['risk management', 'ICH', 'pharmaceutical quality', 'FMEA', 'risk assessment'],
      sections: []
    },
    {
      id: 'gcp-ich-e6',
      name: 'ICH E6(R2) - Good Clinical Practice',
      shortName: 'ICH GCP',
      region: 'International',
      country: 'International',
      description: 'International standard for designing, conducting, and reporting clinical trials',
      lastUpdated: '2024-02-12',
      totalSections: 34,
      applicability: ['Clinical Trials', 'Data Integrity', 'Investigator Responsibilities', 'Sponsor Obligations'],
      status: 'active',
      complexity: 'high',
      implementationDifficulty: 9,
      industry: ['Pharmaceuticals', 'Biotechnology', 'CRO'],
      tags: ['clinical trials', 'GCP', 'data integrity', 'ICH', 'ethics'],
      sections: []
    }
  ]

  // Advanced search algorithm
  const searchResults = useMemo((): SearchResult[] => {
    if (!searchTerm.trim()) {
      return regulations.map(reg => ({
        regulation: reg,
        relevanceScore: 1,
        matchType: 'title' as const,
        matchText: reg.name
      }))
    }

    const results: SearchResult[] = []
    const searchLower = searchTerm.toLowerCase()

    regulations.forEach(regulation => {
      // Search in regulation title and description
      if (regulation.name.toLowerCase().includes(searchLower)) {
        results.push({
          regulation,
          relevanceScore: 10,
          matchType: 'title',
          matchText: regulation.name
        })
      }

      if (regulation.description.toLowerCase().includes(searchLower)) {
        results.push({
          regulation,
          relevanceScore: 8,
          matchType: 'content',
          matchText: regulation.description
        })
      }

      // Search in tags and applicability
      regulation.tags.forEach(tag => {
        if (tag.toLowerCase().includes(searchLower)) {
          results.push({
            regulation,
            relevanceScore: 7,
            matchType: 'tag',
            matchText: tag
          })
        }
      })

      regulation.applicability.forEach(area => {
        if (area.toLowerCase().includes(searchLower)) {
          results.push({
            regulation,
            relevanceScore: 6,
            matchType: 'tag',
            matchText: area
          })
        }
      })

      // Search within sections
      regulation.sections.forEach(section => {
        if (section.title.toLowerCase().includes(searchLower)) {
          results.push({
            regulation,
            section,
            relevanceScore: 9,
            matchType: 'title',
            matchText: section.title
          })
        }

        if (section.content.toLowerCase().includes(searchLower)) {
          results.push({
            regulation,
            section,
            relevanceScore: 5,
            matchType: 'content',
            matchText: section.content.substring(0, 200) + '...'
          })
        }

        section.requirements.forEach(req => {
          if (req.toLowerCase().includes(searchLower)) {
            results.push({
              regulation,
              section,
              relevanceScore: 8,
              matchType: 'requirement',
              matchText: req
            })
          }
        })
      })
    })

    // Remove duplicates and sort by relevance
    const uniqueResults = results.filter((result, index, self) => 
      index === self.findIndex(r => 
        r.regulation.id === result.regulation.id && 
        r.section?.id === result.section?.id
      )
    )

    return uniqueResults.sort((a, b) => b.relevanceScore - a.relevanceScore)
  }, [searchTerm])

  // Apply additional filters
  const filteredResults = useMemo(() => {
    return searchResults.filter(result => {
      const reg = result.regulation
      
      const matchesRegion = selectedRegion === 'all' || 
                           reg.region.toLowerCase().includes(selectedRegion.toLowerCase())
      
      const matchesIndustry = selectedIndustry === 'all' || 
                             reg.industry.some(ind => ind.toLowerCase().includes(selectedIndustry.toLowerCase()))
      
      const matchesComplexity = selectedComplexity === 'all' || reg.complexity === selectedComplexity
      
      return matchesRegion && matchesIndustry && matchesComplexity
    })
  }, [searchResults, selectedRegion, selectedIndustry, selectedComplexity])

  const regions = ['all', 'North America', 'Europe', 'Asia Pacific', 'International']
  const industries = ['all', 'Medical Devices', 'Pharmaceuticals', 'Biotechnology', 'IVD', 'Software as Medical Device']
  const complexities = ['all', 'low', 'medium', 'high']

  const getMatchTypeIcon = (matchType: SearchResult['matchType']) => {
    switch (matchType) {
      case 'title': return <FileText size={14} className="text-primary" />
      case 'content': return <BookOpen size={14} className="text-blue-600" />
      case 'requirement': return <CheckCircle size={14} className="text-green-600" />
      case 'tag': return <Star size={14} className="text-amber-600" />
    }
  }

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'low': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'high': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-foreground flex items-center justify-center gap-3">
          <Search size={32} className="text-primary" />
          Regulatory Knowledge Search
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Instantly search across 1,200+ regulatory requirements from 8 global markets with AI-powered relevance ranking
        </p>
      </div>

      {/* Search Interface */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Main Search Bar */}
            <div className="relative">
              <Search size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search regulations, requirements, or compliance areas (e.g., 'design controls', 'clinical data', 'risk management')..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-12 h-12 text-base"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2"
              >
                <Filter size={16} />
              </Button>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
                <div>
                  <label className="text-sm font-medium mb-2 block">Region</label>
                  <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                    <SelectTrigger>
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

                <div>
                  <label className="text-sm font-medium mb-2 block">Industry</label>
                  <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {industries.map(industry => (
                        <SelectItem key={industry} value={industry}>
                          {industry === 'all' ? 'All Industries' : industry}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Complexity</label>
                  <Select value={selectedComplexity} onValueChange={setSelectedComplexity}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {complexities.map(complexity => (
                        <SelectItem key={complexity} value={complexity}>
                          {complexity === 'all' ? 'All Levels' : complexity.charAt(0).toUpperCase() + complexity.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSelectedRegion('all')
                      setSelectedIndustry('all')
                      setSelectedComplexity('all')
                      setSearchTerm('')
                    }}
                    className="w-full"
                  >
                    Clear Filters
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Search Results */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Results List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              Search Results ({filteredResults.length})
            </h3>
            <div className="flex items-center gap-2">
              <Tabs value={searchMode} onValueChange={(v) => setSearchMode(v as 'basic' | 'advanced')}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="basic">Basic</TabsTrigger>
                  <TabsTrigger value="advanced">Advanced</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>

          {filteredResults.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <AlertCircle size={32} className="text-muted-foreground mx-auto mb-4" />
                <h4 className="font-medium mb-2">No results found</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Try adjusting your search terms or filters
                </p>
                <Button variant="outline" onClick={() => setSearchTerm('')}>
                  View All Regulations
                </Button>
              </CardContent>
            </Card>
          ) : (
            filteredResults.map((result, index) => (
              <Card key={`${result.regulation.id}-${result.section?.id || 'main'}-${index}`} className="hover:shadow-md transition-all duration-200">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Regulation Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getMatchTypeIcon(result.matchType)}
                          <h4 className="font-semibold text-foreground">
                            {result.regulation.shortName}
                          </h4>
                          <Badge variant="outline" className="text-xs">
                            {result.regulation.country}
                          </Badge>
                          <Badge 
                            className={`text-xs ${getComplexityColor(result.regulation.complexity)}`}
                          >
                            {result.regulation.complexity} complexity
                          </Badge>
                        </div>
                        <h5 className="text-sm text-muted-foreground mb-2">
                          {result.regulation.name}
                        </h5>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="text-xs text-muted-foreground">
                          {result.relevanceScore}/10
                        </div>
                        <div className="w-2 h-2 rounded-full bg-primary opacity-70" 
                             style={{ opacity: result.relevanceScore / 10 }} />
                      </div>
                    </div>

                    {/* Section Details (if applicable) */}
                    {result.section && (
                      <div className="pl-4 border-l-2 border-primary/20">
                        <h6 className="font-medium text-sm text-foreground mb-1">
                          Section {result.section.id}: {result.section.title}
                        </h6>
                        <p className="text-xs text-muted-foreground mb-2">
                          {result.section.content.substring(0, 150)}...
                        </p>
                        {result.section.requirements.length > 0 && (
                          <div className="space-y-1">
                            <p className="text-xs font-medium">Key Requirements:</p>
                            <div className="flex flex-wrap gap-1">
                              {result.section.requirements.slice(0, 3).map((req, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                  {req.length > 30 ? req.substring(0, 30) + '...' : req}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Match Information */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-4">
                        <span>Match: {result.matchType}</span>
                        <span>Updated: {new Date(result.regulation.lastUpdated).toLocaleDateString()}</span>
                        <span>{result.regulation.totalSections} sections</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm">
                        <BookOpen size={14} className="mr-2" />
                        View Full Text
                      </Button>
                      {result.section && (
                        <Button variant="outline" size="sm">
                          <Target size={14} className="mr-2" />
                          Go to Section
                        </Button>
                      )}
                      <Button size="sm">
                        <ChevronRight size={14} className="mr-2" />
                        Analyze Document
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Search Insights Sidebar */}
        <div className="space-y-6">
          {/* Search Tips */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Lightbulb size={18} />
                Search Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm space-y-2">
                <div>
                  <span className="font-medium">Specific terms:</span>
                  <p className="text-muted-foreground text-xs">
                    "design controls", "clinical evaluation", "risk management"
                  </p>
                </div>
                <div>
                  <span className="font-medium">Process areas:</span>
                  <p className="text-muted-foreground text-xs">
                    "manufacturing", "post-market surveillance", "validation"
                  </p>
                </div>
                <div>
                  <span className="font-medium">Standards:</span>
                  <p className="text-muted-foreground text-xs">
                    "ISO 13485", "FDA QSR", "EU MDR", "ICH guidelines"
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Filter size={18} />
                Quick Filters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                { label: 'FDA Regulations', query: 'FDA', count: 3 },
                { label: 'EU Requirements', query: 'EU MDR', count: 2 },
                { label: 'ISO Standards', query: 'ISO', count: 4 },
                { label: 'Design Controls', query: 'design controls', count: 8 },
                { label: 'Clinical Trials', query: 'clinical', count: 12 },
                { label: 'Risk Management', query: 'risk management', count: 15 },
                { label: 'Manufacturing', query: 'manufacturing', count: 18 },
                { label: 'Post-Market', query: 'post-market', count: 6 }
              ].map((filter) => (
                <Button
                  key={filter.label}
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchTerm(filter.query)}
                  className="w-full justify-between text-xs"
                >
                  <span>{filter.label}</span>
                  <Badge variant="secondary" className="text-xs">
                    {filter.count}
                  </Badge>
                </Button>
              ))}
            </CardContent>
          </Card>

          {/* Popular Searches */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Clock size={18} />
                Popular Searches
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                'validation protocols',
                'design verification',
                'clinical evidence',
                'software lifecycle',
                'biocompatibility testing',
                'labeling requirements'
              ].map((search) => (
                <Button
                  key={search}
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchTerm(search)}
                  className="w-full justify-start text-xs text-muted-foreground hover:text-foreground"
                >
                  <ArrowRight size={12} className="mr-2" />
                  {search}
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Search Statistics */}
      {searchTerm && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-4">
                <span>
                  Found <strong>{filteredResults.length}</strong> results for "<strong>{searchTerm}</strong>"
                </span>
                <Separator orientation="vertical" className="h-4" />
                <span className="text-muted-foreground">
                  Searched across {regulations.length} regulations in {new Set(regulations.map(r => r.region)).size} regions
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Search time: 0.12s</span>
                <Badge variant="outline" className="text-xs">
                  AI-Enhanced
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}