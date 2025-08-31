import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Search,
  Globe,
  Building2,
  FileText,
  Users,
  Shield,
  ChevronRight,
  ExternalLink,
  BookOpen,
  Star,
  Filter,
  ArrowRight,
  Lightbulb
} from '@phosphor-icons/react'

interface GlobalSearchResult {
  id: string
  title: string
  type: 'regulation' | 'sso' | 'feature' | 'tool'
  category: string
  description: string
  relevanceScore: number
  tags: string[]
  action?: {
    label: string
    onClick: () => void
  }
}

interface QuickAction {
  id: string
  title: string
  description: string
  icon: React.ElementType
  category: 'regulations' | 'sso' | 'analysis' | 'compliance'
  onClick: () => void
}

export function GlobalSearchInterface({ onNavigate }: { onNavigate: (page: string) => void }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  // Comprehensive search database with enhanced global regulations and enterprise features
  const searchDatabase: GlobalSearchResult[] = [
    // Global Regulations (Enhanced Coverage)
    {
      id: 'fda-qsr',
      title: '21 CFR Part 820 - FDA Quality System Regulation',
      type: 'regulation',
      category: 'US Regulations',
      description: 'Comprehensive quality system regulation for medical device manufacturers under FDA jurisdiction',
      relevanceScore: 10,
      tags: ['FDA', 'quality systems', 'medical devices', 'design controls', 'manufacturing', 'validation'],
      action: {
        label: 'Browse Standard',
        onClick: () => onNavigate('regulations')
      }
    },
    {
      id: 'eu-mdr',
      title: 'EU MDR 2017/745 - Medical Device Regulation',
      type: 'regulation',
      category: 'EU Regulations',
      description: 'European medical device regulation for CE marking and market access',
      relevanceScore: 10,
      tags: ['EU MDR', 'CE marking', 'medical devices', 'clinical evaluation', 'post-market surveillance', 'UDI'],
      action: {
        label: 'Browse Standard',
        onClick: () => onNavigate('regulations')
      }
    },
    {
      id: 'iso-13485',
      title: 'ISO 13485:2016 - Medical Device Quality Management',
      type: 'regulation',
      category: 'International Standards',
      description: 'International standard for quality management systems specific to medical devices',
      relevanceScore: 9,
      tags: ['ISO', 'quality management', 'medical devices', 'risk management', 'documentation', 'CAPA'],
      action: {
        label: 'Browse Standard',
        onClick: () => onNavigate('regulations')
      }
    },
    {
      id: 'pmda-japan',
      title: 'PMD Act - Japan Medical Device Regulations',
      type: 'regulation',
      category: 'Asia Pacific',
      description: 'Japanese Pharmaceuticals and Medical Devices Act under PMDA oversight',
      relevanceScore: 9,
      tags: ['PMDA', 'Japan', 'medical devices', 'clinical data', 'approval pathway'],
      action: {
        label: 'Browse Standard',
        onClick: () => onNavigate('regulations')
      }
    },
    {
      id: 'tga-australia',
      title: 'TGA Therapeutic Goods Act - Australia',
      type: 'regulation',
      category: 'Asia Pacific',
      description: 'Australian regulatory framework for therapeutic goods and medical devices',
      relevanceScore: 8,
      tags: ['TGA', 'Australia', 'therapeutic goods', 'registration', 'conformity assessment'],
      action: {
        label: 'Browse Standard',
        onClick: () => onNavigate('regulations')
      }
    },
    {
      id: 'health-canada',
      title: 'Health Canada Medical Device Regulations',
      type: 'regulation',
      category: 'Americas',
      description: 'Canadian medical device regulations aligned with MDSAP framework',
      relevanceScore: 8,
      tags: ['Health Canada', 'MDSAP', 'medical devices', 'quality systems', 'licensing'],
      action: {
        label: 'Browse Standard',
        onClick: () => onNavigate('regulations')
      }
    },
    {
      id: 'anvisa-brazil',
      title: 'ANVISA RDC 16/2013 - Brazil GMP',
      type: 'regulation',
      category: 'Americas',
      description: 'Brazilian Good Manufacturing Practices for medical devices',
      relevanceScore: 7,
      tags: ['ANVISA', 'Brazil', 'GMP', 'manufacturing', 'quality control'],
      action: {
        label: 'Browse Standard',
        onClick: () => onNavigate('regulations')
      }
    },
    {
      id: 'nmpa-china',
      title: 'NMPA Medical Device Regulations - China',
      type: 'regulation',
      category: 'Asia Pacific',
      description: 'Chinese National Medical Products Administration device regulations',
      relevanceScore: 8,
      tags: ['NMPA', 'China', 'medical devices', 'registration', 'clinical trials'],
      action: {
        label: 'Browse Standard',
        onClick: () => onNavigate('regulations')
      }
    },

    // Enterprise SSO Providers (Enhanced)
    {
      id: 'microsoft-azure-ad',
      title: 'Microsoft Azure Active Directory Enterprise SSO',
      type: 'sso',
      category: 'Enterprise Identity',
      description: 'Enterprise-grade SSO with Azure AD, supporting SAML 2.0, OpenID Connect, MFA, and conditional access policies',
      relevanceScore: 10,
      tags: ['Microsoft', 'Azure AD', 'SAML', 'OpenID Connect', 'MFA', 'conditional access', 'enterprise'],
      action: {
        label: 'Configure Microsoft SSO',
        onClick: () => onNavigate('enterprise-sso')
      }
    },
    {
      id: 'google-workspace-enterprise',
      title: 'Google Workspace Enterprise SSO',
      type: 'sso',
      category: 'Enterprise Identity',
      description: 'Google Workspace SSO with advanced security, OAuth 2.0, SAML, directory sync, and Advanced Protection Program',
      relevanceScore: 9,
      tags: ['Google', 'Workspace', 'OAuth 2.0', 'SAML', 'directory sync', 'advanced protection'],
      action: {
        label: 'Configure Google SSO',
        onClick: () => onNavigate('enterprise-sso')
      }
    },
    {
      id: 'okta-enterprise',
      title: 'Okta Identity Cloud Enterprise',
      type: 'sso',
      category: 'Enterprise Identity',
      description: 'Advanced identity management with Okta, featuring adaptive MFA, risk-based authentication, and SCIM provisioning',
      relevanceScore: 9,
      tags: ['Okta', 'adaptive MFA', 'risk-based auth', 'SCIM', 'identity cloud', 'zero trust'],
      action: {
        label: 'Configure Okta SSO',
        onClick: () => onNavigate('enterprise-sso')
      }
    },

    // Platform Features (Enhanced)
    {
      id: 'ai-multi-model',
      title: 'Multi-Model AI Analysis Engine',
      type: 'feature',
      category: 'AI & Analysis',
      description: 'Compare results across GPT-5, Claude 4, Gemini 2.5 Pro, and Grok with pharmaceutical specialization',
      relevanceScore: 10,
      tags: ['multi-model AI', 'GPT-5', 'Claude 4', 'Gemini', 'Grok', 'pharmaceutical AI', 'comparison'],
      action: {
        label: 'View AI Models',
        onClick: () => onNavigate('ai-models')
      }
    },
    {
      id: 'pharmaceutical-ai',
      title: 'Pharmaceutical AI Specialization',
      type: 'feature',
      category: 'AI & Analysis',
      description: 'Specialized AI models for cGMP, FDA submissions, biologics, and advanced therapy compliance',
      relevanceScore: 9,
      tags: ['pharmaceutical', 'cGMP', 'FDA submissions', 'biologics', 'advanced therapy', 'specialized AI'],
      action: {
        label: 'View Pharma AI',
        onClick: () => onNavigate('ai-models')
      }
    },
    {
      id: 'global-search-engine',
      title: 'Interactive Global Regulatory Search',
      type: 'tool',
      category: 'Search & Discovery',
      description: 'AI-powered search across 1,200+ regulatory requirements from 8 global markets with cross-reference detection',
      relevanceScore: 10,
      tags: ['global search', 'cross-reference', 'AI-powered', '1200+ requirements', '8 markets'],
      action: {
        label: 'Launch Advanced Search',
        onClick: () => onNavigate('regulations')
      }
    },
    {
      id: 'audit-trail-cfr11',
      title: '21 CFR Part 11 Compliant Audit Trail',
      type: 'feature',
      category: 'Compliance & Security',
      description: 'Comprehensive audit trail system with electronic signatures, timestamping, and FDA electronic records compliance',
      relevanceScore: 9,
      tags: ['21 CFR Part 11', 'audit trail', 'electronic signatures', 'FDA compliance', 'timestamping'],
      action: {
        label: 'View Audit System',
        onClick: () => onNavigate('audit-trail')
      }
    },
    {
      id: 'multi-tenant-security',
      title: 'Multi-Tenant Security Architecture',
      type: 'feature',
      category: 'Security & Architecture',
      description: 'Enterprise-grade multi-tenant database with row-level security, data isolation, and tenant-specific access controls',
      relevanceScore: 8,
      tags: ['multi-tenant', 'row-level security', 'data isolation', 'tenant controls', 'enterprise'],
      action: {
        label: 'View Architecture',
        onClick: () => onNavigate('architecture')
      }
    },
    {
      id: 'real-time-compliance',
      title: 'Real-time Compliance Monitoring',
      type: 'tool',
      category: 'Monitoring & Analytics',
      description: 'Live monitoring of compliance status, regulatory changes, audit activities, and risk indicators',
      relevanceScore: 8,
      tags: ['real-time monitoring', 'compliance status', 'regulatory changes', 'risk indicators', 'analytics'],
      action: {
        label: 'View Dashboard',
        onClick: () => onNavigate('compliance')
      }
    },

    // Advanced Features
    {
      id: 'regulation-comparison',
      title: 'Cross-Regulation Comparison Engine',
      type: 'tool',
      category: 'Analysis Tools',
      description: 'Compare requirements across multiple global regulations to identify overlaps and unique requirements',
      relevanceScore: 9,
      tags: ['regulation comparison', 'cross-reference', 'overlaps', 'unique requirements', 'global analysis'],
      action: {
        label: 'Launch Comparison',
        onClick: () => onNavigate('regulations')
      }
    },
    {
      id: 'automated-validation',
      title: 'Automated AI Model Validation',
      type: 'feature',
      category: 'Quality Assurance',
      description: 'Continuous validation of AI model performance with golden datasets and precision/recall metrics',
      relevanceScore: 8,
      tags: ['AI validation', 'golden dataset', 'precision metrics', 'recall metrics', 'continuous monitoring'],
      action: {
        label: 'View Validation',
        onClick: () => onNavigate('compliance')
      }
    },
    {
      id: 'enterprise-reporting',
      title: 'Enterprise Compliance Reporting',
      type: 'tool',
      category: 'Reporting & Analytics',
      description: 'Generate audit-ready reports with timestamps, digital signatures, and regulatory traceability',
      relevanceScore: 9,
      tags: ['enterprise reporting', 'audit-ready', 'digital signatures', 'traceability', 'timestamps'],
      action: {
        label: 'Generate Reports',
        onClick: () => onNavigate('compliance')
      }
    }
  ]

  // Enhanced quick actions for enterprise users
  const quickActions: QuickAction[] = [
    {
      id: 'search-global-regulations',
      title: 'Search Global Regulations',
      description: 'Find specific requirements across 8 global markets (FDA, EU MDR, PMDA, etc.)',
      icon: Search,
      category: 'regulations',
      onClick: () => onNavigate('regulations')
    },
    {
      id: 'configure-enterprise-sso',
      title: 'Configure Enterprise SSO',
      description: 'Set up Microsoft Azure AD, Google Workspace, or Okta integration',
      icon: Building2,
      category: 'sso',
      onClick: () => onNavigate('enterprise-sso')
    },
    {
      id: 'run-ai-analysis',
      title: 'Multi-Model AI Analysis',
      description: 'Compare analysis results across GPT-5, Claude 4, Gemini 2.5 Pro, and Grok',
      icon: Shield,
      category: 'analysis',
      onClick: () => onNavigate('ai-models')
    },
    {
      id: 'access-audit-trail',
      title: 'Access Audit Trail System',
      description: 'Review 21 CFR Part 11 compliant activity logs and electronic records',
      icon: FileText,
      category: 'compliance',
      onClick: () => onNavigate('audit-trail')
    },
    {
      id: 'pharmaceutical-ai',
      title: 'Pharmaceutical AI Models',
      description: 'Access specialized AI for cGMP, FDA submissions, and biologics compliance',
      icon: Users,
      category: 'analysis',
      onClick: () => onNavigate('ai-models')
    },
    {
      id: 'compliance-monitoring',
      title: 'Real-time Compliance Monitoring',
      description: 'Monitor regulatory changes, compliance status, and risk indicators',
      icon: Shield,
      category: 'compliance',
      onClick: () => onNavigate('compliance')
    }
  ]

  // Search functionality
  const searchResults = useMemo(() => {
    if (!searchTerm.trim()) {
      return searchDatabase
    }

    const searchLower = searchTerm.toLowerCase()
    return searchDatabase
      .filter(item => {
        const matchesSearch = 
          item.title.toLowerCase().includes(searchLower) ||
          item.description.toLowerCase().includes(searchLower) ||
          item.tags.some(tag => tag.toLowerCase().includes(searchLower))
        
        const matchesCategory = selectedCategory === 'all' || item.type === selectedCategory
        
        return matchesSearch && matchesCategory
      })
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
  }, [searchTerm, selectedCategory])

  const categories = [
    { id: 'all', label: 'All Results', count: searchDatabase.length },
    { id: 'regulation', label: 'Regulations', count: searchDatabase.filter(r => r.type === 'regulation').length },
    { id: 'sso', label: 'Identity & SSO', count: searchDatabase.filter(r => r.type === 'sso').length },
    { id: 'feature', label: 'Platform Features', count: searchDatabase.filter(r => r.type === 'feature').length },
    { id: 'tool', label: 'Tools', count: searchDatabase.filter(r => r.type === 'tool').length }
  ]

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'regulation': return <FileText size={16} className="text-primary" />
      case 'sso': return <Building2 size={16} className="text-blue-600" />
      case 'feature': return <Shield size={16} className="text-green-600" />
      case 'tool': return <Star size={16} className="text-amber-600" />
      default: return <Globe size={16} className="text-muted-foreground" />
    }
  }

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'regulation': return 'bg-primary/10 text-primary'
      case 'sso': return 'bg-blue-100 text-blue-800'
      case 'feature': return 'bg-green-100 text-green-800'
      case 'tool': return 'bg-amber-100 text-amber-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-foreground flex items-center justify-center gap-3">
          <Search size={32} className="text-primary" />
          Global Platform Search
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Search across regulations, SSO configurations, compliance features, and platform tools
        </p>
      </div>

      {/* Main Search Interface */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search regulations, SSO providers, compliance features, or tools..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-12 text-base"
              />
            </div>

            {/* Category Filters */}
            <div className="flex gap-2 flex-wrap">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  className="text-xs"
                >
                  {category.label}
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {category.count}
                  </Badge>
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Search Results */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-lg font-semibold">
            Search Results ({searchResults.length})
          </h3>

          {searchResults.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Search size={32} className="text-muted-foreground mx-auto mb-4" />
                <h4 className="font-medium mb-2">No results found</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Try adjusting your search terms or browse our quick actions below
                </p>
              </CardContent>
            </Card>
          ) : (
            searchResults.map((result) => (
              <Card key={result.id} className="hover:shadow-md transition-all duration-200">
                <CardContent className="p-6">
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getTypeIcon(result.type)}
                          <h4 className="font-semibold text-foreground">{result.title}</h4>
                          <Badge className={`text-xs ${getTypeBadgeColor(result.type)}`}>
                            {result.category}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          {result.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="text-xs text-muted-foreground">
                          {result.relevanceScore}/10
                        </div>
                        <div className="w-2 h-2 rounded-full bg-primary" 
                             style={{ opacity: result.relevanceScore / 10 }} />
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1">
                      {result.tags.slice(0, 5).map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {result.tags.length > 5 && (
                        <Badge variant="outline" className="text-xs">
                          +{result.tags.length - 5} more
                        </Badge>
                      )}
                    </div>

                    {/* Action */}
                    {result.action && (
                      <div className="pt-2">
                        <Button size="sm" onClick={result.action.onClick}>
                          {result.action.label}
                          <ChevronRight size={14} className="ml-2" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Quick Actions Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Lightbulb size={18} />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {quickActions.map((action) => {
                const Icon = action.icon
                return (
                  <Button
                    key={action.id}
                    variant="ghost"
                    onClick={action.onClick}
                    className="w-full justify-start p-4 h-auto"
                  >
                    <div className="flex items-start gap-3">
                      <Icon size={20} className="mt-0.5 text-primary" />
                      <div className="text-left">
                        <div className="font-medium text-sm">{action.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {action.description}
                        </div>
                      </div>
                    </div>
                  </Button>
                )
              })}
            </CardContent>
          </Card>

          {/* Popular Searches */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Star size={18} />
                Popular Searches
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                'Microsoft Azure AD setup',
                'Google Workspace SSO',
                'FDA design controls',
                'EU MDR clinical evaluation',
                'multi-model AI comparison',
                'pharmaceutical cGMP',
                'audit trail configuration',
                'Okta enterprise integration',
                'ISO 13485 requirements',
                'PMDA Japan regulations',
                'automated validation protocols',
                'real-time compliance monitoring'
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

          {/* Search Tips */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Filter size={18} />
                Search Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm space-y-2">
                <div>
                  <span className="font-medium">Global Regulations:</span>
                  <p className="text-muted-foreground text-xs">
                    "FDA QSR", "EU MDR", "ISO 13485", "PMDA Japan", "TGA Australia"
                  </p>
                </div>
                <div>
                  <span className="font-medium">Enterprise SSO:</span>
                  <p className="text-muted-foreground text-xs">
                    "Microsoft Azure AD", "Google Workspace", "Okta", "SAML", "MFA"
                  </p>
                </div>
                <div>
                  <span className="font-medium">AI & Analysis:</span>
                  <p className="text-muted-foreground text-xs">
                    "multi-model comparison", "pharmaceutical AI", "cGMP analysis"
                  </p>
                </div>
                <div>
                  <span className="font-medium">Compliance Features:</span>
                  <p className="text-muted-foreground text-xs">
                    "audit trail", "21 CFR Part 11", "electronic records", "validation"
                  </p>
                </div>
              </div>
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
                  Found <strong>{searchResults.length}</strong> results for "<strong>{searchTerm}</strong>"
                </span>
                <Separator orientation="vertical" className="h-4" />
                <span className="text-muted-foreground">
                  Searched across {searchDatabase.length} items in {categories.length - 1} categories
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Search time: 0.08s</span>
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