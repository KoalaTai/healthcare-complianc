import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Bell, 
  Globe, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  Filter,
  Search,
  Download,
  RefreshCw,
  Bookmark,
  BookmarkSimple,
  Star,
  ExternalLink,
  Calendar,
  Tag,
  TrendUp,
  Eye,
  Settings
} from '@phosphor-icons/react'
import { toast } from 'sonner'

interface RegulatoryUpdate {
  id: string
  title: string
  agency: string
  region: string
  category: string
  priority: 'critical' | 'high' | 'medium' | 'low'
  status: 'new' | 'updated' | 'effective' | 'proposed'
  publishDate: string
  effectiveDate?: string
  summary: string
  content: string
  url: string
  tags: string[]
  isBookmarked: boolean
  isRead: boolean
  isArchived?: boolean
  isFlagged?: boolean
  impact: string
  relatedStandards: string[]
}

export function RegulatoryUpdatesFeed() {
  const [updates, setUpdates] = useKV('regulatory-updates', [] as RegulatoryUpdate[])
  const [filteredUpdates, setFilteredUpdates] = useState<RegulatoryUpdate[]>([])
  const [selectedUpdate, setSelectedUpdate] = useState<RegulatoryUpdate | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterAgency, setFilterAgency] = useState('all')
  const [filterPriority, setFilterPriority] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [isLoading, setIsLoading] = useState(false)
  const [lastSync, setLastSync] = useKV('updates-last-sync', '')
  const [activeTab, setActiveTab] = useState('all')
  const [expandedUpdate, setExpandedUpdate] = useState<string | null>(null)
  const [quickFilterTags, setQuickFilterTags] = useState<string[]>([])
  const [sortBy, setSortBy] = useState('publishDate')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // Mock regulatory updates data - in production this would come from real API feeds
  const mockUpdates: RegulatoryUpdate[] = [
    {
      id: '1',
      title: 'FDA Draft Guidance: Software as Medical Device (SaMD) - Clinical Evaluation',
      agency: 'FDA',
      region: 'United States',
      category: 'Medical Devices',
      priority: 'critical',
      status: 'new',
      publishDate: '2024-01-15',
      effectiveDate: '2024-03-15',
      summary: 'New draft guidance on clinical evaluation requirements for Software as Medical Device, including risk classification and clinical evidence requirements.',
      content: 'The FDA has released comprehensive draft guidance addressing the clinical evaluation of Software as Medical Device (SaMD). This guidance provides clarity on risk classification, clinical evidence requirements, and regulatory pathways for software-based medical devices.',
      url: 'https://fda.gov/guidance/samd-clinical-evaluation-2024',
      tags: ['SaMD', 'Clinical Evaluation', 'Risk Classification', 'Software'],
      isBookmarked: false,
      isRead: false,
      isArchived: false,
      isFlagged: false,
      impact: 'High - Affects all SaMD manufacturers and clinical evaluation protocols',
      relatedStandards: ['ISO 14155', 'ISO 13485', 'IEC 62304']
    },
    {
      id: '2',
      title: 'EU MDR: Updated Notified Body Assessment Guidelines',
      agency: 'European Commission',
      region: 'European Union',
      category: 'Medical Devices',
      priority: 'high',
      status: 'effective',
      publishDate: '2024-01-10',
      effectiveDate: '2024-01-10',
      summary: 'Updated guidelines for Notified Body assessments under EU MDR, including new timelines and documentation requirements.',
      content: 'The European Commission has published updated guidelines for Notified Body assessments, introducing streamlined processes and clearer documentation requirements for medical device manufacturers.',
      url: 'https://ec.europa.eu/health/md/nb-guidelines-2024',
      tags: ['EU MDR', 'Notified Body', 'Assessment', 'Compliance'],
      isBookmarked: true,
      isRead: false,
      isArchived: false,
      isFlagged: false,
      impact: 'Medium - Affects EU market authorization timelines and processes',
      relatedStandards: ['EU MDR', 'ISO 13485', 'EN ISO 14971']
    },
    {
      id: '3',
      title: 'ICH Q12: Technical and Regulatory Considerations for Pharmaceutical Product Lifecycle Management',
      agency: 'ICH',
      region: 'Global',
      category: 'Pharmaceuticals',
      priority: 'high',
      status: 'updated',
      publishDate: '2024-01-08',
      effectiveDate: '2024-06-01',
      summary: 'Updated ICH Q12 guideline with new approaches to post-approval change management and lifecycle management strategies.',
      content: 'ICH has updated the Q12 guideline to include enhanced lifecycle management approaches, risk-based change management, and new regulatory tools for post-approval changes.',
      url: 'https://ich.org/page/quality-guidelines',
      tags: ['ICH Q12', 'Lifecycle Management', 'Post-approval Changes', 'Quality'],
      isBookmarked: false,
      isRead: true,
      isArchived: false,
      isFlagged: true,
      impact: 'High - Affects pharmaceutical manufacturing and change control processes',
      relatedStandards: ['ICH Q8', 'ICH Q9', 'ICH Q10', 'ICH Q11']
    },
    {
      id: '4',
      title: 'PMDA: New Digital Health Guidelines for AI/ML Medical Devices',
      agency: 'PMDA',
      region: 'Japan',
      category: 'Digital Health',
      priority: 'critical',
      status: 'proposed',
      publishDate: '2024-01-12',
      effectiveDate: '2024-04-01',
      summary: 'PMDA releases first comprehensive guidelines for AI/ML-based medical devices, including validation requirements and approval pathways.',
      content: 'The Pharmaceuticals and Medical Devices Agency (PMDA) of Japan has introduced groundbreaking guidelines specifically addressing AI and machine learning medical devices, establishing clear validation frameworks and regulatory pathways.',
      url: 'https://pmda.go.jp/english/review-services/reviews/ai-ml-guidelines-2024',
      tags: ['PMDA', 'AI/ML', 'Digital Health', 'Validation', 'Japan'],
      isBookmarked: true,
      isRead: false,
      isArchived: false,
      isFlagged: true,
      impact: 'Critical - First comprehensive AI/ML device guidelines in Asia-Pacific region',
      relatedStandards: ['ISO/IEC 23053', 'ISO/IEC 23094', 'IEC 62304']
    },
    {
      id: '5',
      title: 'Health Canada: Updated Good Manufacturing Practices for Active Pharmaceutical Ingredients',
      agency: 'Health Canada',
      region: 'Canada',
      category: 'Pharmaceuticals',
      priority: 'medium',
      status: 'effective',
      publishDate: '2024-01-05',
      effectiveDate: '2024-01-05',
      summary: 'Health Canada updates GMP guidelines for APIs with enhanced contamination control and supply chain requirements.',
      content: 'Health Canada has released updated Good Manufacturing Practice guidelines for Active Pharmaceutical Ingredients, focusing on enhanced contamination control measures and supply chain verification requirements.',
      url: 'https://hc-sc.gc.ca/dhp-mps/prodpharma/applic-demande/guide-ld/gmp/api-ipa-2024-eng.php',
      tags: ['Health Canada', 'GMP', 'API', 'Manufacturing', 'Supply Chain'],
      isBookmarked: false,
      isRead: true,
      isArchived: false,
      isFlagged: false,
      impact: 'Medium - Affects API manufacturers and pharmaceutical supply chains',
      relatedStandards: ['ICH Q7', 'ISO 9001', 'PIC/S GMP']
    },
    {
      id: '6',
      title: 'TGA: New Requirements for Clinical Trial Conduct and Monitoring',
      agency: 'TGA',
      region: 'Australia',
      category: 'Clinical Trials',
      priority: 'high',
      status: 'new',
      publishDate: '2024-01-14',
      effectiveDate: '2024-05-01',
      summary: 'TGA introduces enhanced requirements for clinical trial conduct, monitoring, and data integrity in Australian clinical research.',
      content: 'The Therapeutic Goods Administration (TGA) has announced new requirements for clinical trial conduct and monitoring, emphasizing data integrity, patient safety, and regulatory compliance in clinical research activities.',
      url: 'https://tga.gov.au/clinical-trials/conduct-monitoring-requirements-2024',
      tags: ['TGA', 'Clinical Trials', 'Monitoring', 'Data Integrity', 'Australia'],
      isBookmarked: false,
      isRead: false,
      isArchived: false,
      isFlagged: false,
      impact: 'High - Affects all clinical trials conducted in Australia',
      relatedStandards: ['ICH GCP', 'ISO 14155', 'OECD GLP']
    }
  ]

  useEffect(() => {
    if (updates.length === 0) {
      setUpdates(mockUpdates)
    }
  }, [updates.length, setUpdates])

  useEffect(() => {
    let filtered = updates

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(update => 
        update.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        update.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        update.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
        update.agency.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Apply agency filter
    if (filterAgency !== 'all') {
      filtered = filtered.filter(update => update.agency === filterAgency)
    }

    // Apply priority filter
    if (filterPriority !== 'all') {
      filtered = filtered.filter(update => update.priority === filterPriority)
    }

    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(update => update.status === filterStatus)
    }

    // Apply tab filter
    if (activeTab === 'bookmarked') {
      filtered = filtered.filter(update => update.isBookmarked)
    } else if (activeTab === 'unread') {
      filtered = filtered.filter(update => !update.isRead)
    } else if (activeTab === 'critical') {
      filtered = filtered.filter(update => update.priority === 'critical')
    }

    setFilteredUpdates(filtered)
  }, [updates, searchQuery, filterAgency, filterPriority, filterStatus, activeTab])

  const syncUpdates = async () => {
    setIsLoading(true)
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // In production, this would fetch from actual regulatory APIs
      // For now, we'll simulate finding new updates
      const newUpdate: RegulatoryUpdate = {
        id: Date.now().toString(),
        title: `New Regulatory Update - ${new Date().toLocaleDateString()}`,
        agency: 'FDA',
        region: 'United States',
        category: 'Medical Devices',
        priority: 'medium',
        status: 'new',
        publishDate: new Date().toISOString().split('T')[0],
        summary: 'Automatically detected new regulatory update from real-time monitoring system.',
        content: 'This update was automatically detected and processed by the real-time regulatory monitoring system.',
        url: '#',
        tags: ['Auto-detected', 'Real-time'],
        isBookmarked: false,
        isRead: false,
        isArchived: false,
        isFlagged: false,
        impact: 'TBD - Requires review for impact assessment',
        relatedStandards: []
      }

      setUpdates(prev => [newUpdate, ...prev])
      setLastSync(new Date().toISOString())
      toast.success('Regulatory updates synchronized successfully')
    } catch (error) {
      toast.error('Failed to sync regulatory updates')
    } finally {
      setIsLoading(false)
    }
  }

  const toggleBookmark = (updateId: string) => {
    setUpdates(prev => prev.map(update => 
      update.id === updateId 
        ? { ...update, isBookmarked: !update.isBookmarked }
        : update
    ))
  }

  const markAsRead = (updateId: string) => {
    setUpdates(prev => prev.map(update => 
      update.id === updateId 
        ? { ...update, isRead: true }
        : update
    ))
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200'
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'low': return 'bg-gray-100 text-gray-800 border-gray-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-green-100 text-green-800 border-green-200'
      case 'updated': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'effective': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'proposed': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Regulatory Updates Feed</h1>
          <p className="text-muted-foreground mt-2">
            Real-time monitoring of regulatory changes across global agencies
          </p>
          {lastSync && (
            <p className="text-sm text-muted-foreground mt-1">
              Last synchronized: {new Date(lastSync).toLocaleString()}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={syncUpdates} disabled={isLoading}>
            <RefreshCw size={16} className={`mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Sync Updates
          </Button>
          <Button variant="outline">
            <Settings size={16} className="mr-2" />
            Configure Feeds
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Updates</p>
                <p className="text-2xl font-bold">{updates.length}</p>
              </div>
              <Globe size={24} className="text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Unread</p>
                <p className="text-2xl font-bold text-blue-600">
                  {updates.filter(u => !u.isRead).length}
                </p>
              </div>
              <Bell size={24} className="text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Critical Priority</p>
                <p className="text-2xl font-bold text-red-600">
                  {updates.filter(u => u.priority === 'critical').length}
                </p>
              </div>
              <AlertTriangle size={24} className="text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Bookmarked</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {updates.filter(u => u.isBookmarked).length}
                </p>
              </div>
              <BookmarkSimple size={24} className="text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-3 text-muted-foreground" />
                <Input
                  placeholder="Search updates, agencies, or tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-3">
              <Select value={filterAgency} onValueChange={setFilterAgency}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Agency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Agencies</SelectItem>
                  <SelectItem value="FDA">FDA</SelectItem>
                  <SelectItem value="European Commission">EU Commission</SelectItem>
                  <SelectItem value="ICH">ICH</SelectItem>
                  <SelectItem value="PMDA">PMDA</SelectItem>
                  <SelectItem value="Health Canada">Health Canada</SelectItem>
                  <SelectItem value="TGA">TGA</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="updated">Updated</SelectItem>
                  <SelectItem value="effective">Effective</SelectItem>
                  <SelectItem value="proposed">Proposed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Updates</TabsTrigger>
          <TabsTrigger value="unread">Unread ({updates.filter(u => !u.isRead).length})</TabsTrigger>
          <TabsTrigger value="bookmarked">Bookmarked</TabsTrigger>
          <TabsTrigger value="critical">Critical</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          <div className="space-y-4">
            {filteredUpdates.map((update) => (
              <Card key={update.id} className={`${!update.isRead ? 'ring-1 ring-blue-200' : ''}`}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <Badge className={getPriorityColor(update.priority)} variant="outline">
                          {update.priority}
                        </Badge>
                        <Badge className={getStatusColor(update.status)} variant="outline">
                          {update.status}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {update.agency}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {update.region}
                        </Badge>
                        {!update.isRead && (
                          <Badge className="bg-blue-100 text-blue-800 border-blue-200" variant="outline">
                            New
                          </Badge>
                        )}
                      </div>
                      
                      <h3 className="text-lg font-semibold text-foreground mb-2 hover:text-primary cursor-pointer">
                        {update.title}
                      </h3>
                      
                      <p className="text-muted-foreground mb-3">
                        {update.summary}
                      </p>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                        <span className="flex items-center gap-1">
                          <Calendar size={14} />
                          Published: {new Date(update.publishDate).toLocaleDateString()}
                        </span>
                        {update.effectiveDate && (
                          <span className="flex items-center gap-1">
                            <Clock size={14} />
                            Effective: {new Date(update.effectiveDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-1 mb-3">
                        {update.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                        <p className="text-sm font-medium text-blue-800 mb-1">Impact Assessment:</p>
                        <p className="text-xs text-blue-700">{update.impact}</p>
                      </div>

                      {update.relatedStandards.length > 0 && (
                        <div className="mt-3">
                          <p className="text-sm font-medium text-muted-foreground mb-2">Related Standards:</p>
                          <div className="flex flex-wrap gap-1">
                            {update.relatedStandards.map((standard, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {standard}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleBookmark(update.id)}
                      >
                        {update.isBookmarked ? (
                          <Bookmark size={16} className="text-yellow-600" />
                        ) : (
                          <BookmarkSimple size={16} />
                        )}
                      </Button>
                      
                      {!update.isRead && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => markAsRead(update.id)}
                        >
                          <Eye size={16} />
                        </Button>
                      )}
                      
                      <Button size="sm" variant="outline">
                        <ExternalLink size={16} />
                      </Button>
                      
                      <Button size="sm" variant="outline">
                        <Download size={16} />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {filteredUpdates.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <Globe size={48} className="mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                    No updates found
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Try adjusting your filters or search terms, or sync for new updates.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}