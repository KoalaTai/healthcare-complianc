import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { 
  BookOpen,
  Search,
  Globe,
  FileText,
  ExternalLink,
  Download,
  Star,
  Tag,
  Calendar,
  ChevronRight,
  Filter,
  Eye,
  Bookmark,
  Share
} from '@phosphor-icons/react'

export function RegulatoryKnowledgeBase() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStandard, setSelectedStandard] = useState(null)
  const [selectedSection, setSelectedSection] = useState(null)
  const [bookmarks, setBookmarks] = useKV('vb-bookmarks', JSON.stringify([]))

  const [standards] = useKV('vb-regulatory-standards', JSON.stringify([
    {
      id: 'FDA_QSR',
      name: 'FDA Quality System Regulation',
      region: 'United States',
      description: 'US FDA regulations for medical device quality systems',
      lastUpdated: '2024-01-15',
      sections: 47,
      totalContent: '156 pages',
      category: 'Quality Systems',
      status: 'Current',
      sections_detail: [
        { id: '820.1', title: 'Scope', content: 'This part contains the quality system regulation...' },
        { id: '820.3', title: 'Definitions', content: 'For purposes of this part...' },
        { id: '820.20', title: 'Management responsibility', content: 'Each manufacturer shall establish...' },
        { id: '820.25', title: 'Personnel', content: 'Each manufacturer shall have sufficient personnel...' },
        { id: '820.30', title: 'Design controls', content: 'Each manufacturer of any class III or class II device...' }
      ]
    },
    {
      id: 'ISO_13485',
      name: 'ISO 13485:2016',
      region: 'International',
      description: 'Medical devices - Quality management systems',
      lastUpdated: '2024-01-10',
      sections: 22,
      totalContent: '89 pages',
      category: 'Quality Systems', 
      status: 'Current',
      sections_detail: [
        { id: '4.1', title: 'General requirements', content: 'The organization shall establish...' },
        { id: '4.2', title: 'Documentation requirements', content: 'The quality management system documentation...' },
        { id: '5.1', title: 'Management commitment', content: 'Top management shall provide evidence...' },
        { id: '7.3', title: 'Design and development', content: 'The organization shall plan and control...' }
      ]
    },
    {
      id: 'EU_MDR',
      name: 'EU Medical Device Regulation',
      region: 'European Union',
      description: 'Regulation (EU) 2017/745 on medical devices',
      lastUpdated: '2024-01-08',
      sections: 123,
      totalContent: '372 pages',
      category: 'Medical Device Regulation',
      status: 'Current',
      sections_detail: [
        { id: 'Article_1', title: 'Subject matter and scope', content: 'This Regulation lays down rules concerning...' },
        { id: 'Article_2', title: 'Definitions', content: 'For the purposes of this Regulation...' },
        { id: 'Article_10', title: 'Classification rules', content: 'Devices are divided into classes...' }
      ]
    },
    {
      id: 'PMDA_Japan',
      name: 'PMDA Pharmaceutical and Medical Device Act',
      region: 'Japan',
      description: 'Japanese regulations for pharmaceutical and medical devices',
      lastUpdated: '2024-01-12',
      sections: 78,
      totalContent: '234 pages',
      category: 'Medical Device Regulation',
      status: 'Current',
      sections_detail: [
        { id: 'Art_1', title: 'Purpose', content: 'This Act aims to ensure quality, efficacy and safety...' },
        { id: 'Art_14', title: 'Marketing authorization', content: 'No person shall manufacture...' }
      ]
    },
    {
      id: 'TGA_Australia',
      name: 'TGA Therapeutic Goods Act',
      region: 'Australia',
      description: 'Australian regulations for therapeutic goods',
      lastUpdated: '2024-01-09',
      sections: 56,
      totalContent: '187 pages',
      category: 'Medical Device Regulation',
      status: 'Current',
      sections_detail: [
        { id: 'Sec_3', title: 'Definitions', content: 'In this Act, unless the contrary intention appears...' },
        { id: 'Sec_26A', title: 'Conformity assessment', content: 'Medical devices must undergo conformity assessment...' }
      ]
    },
    {
      id: 'Health_Canada',
      name: 'Health Canada Medical Device Regulations',
      region: 'Canada',
      description: 'Canadian regulations for medical devices',
      lastUpdated: '2024-01-11',
      sections: 93,
      totalContent: '298 pages',
      category: 'Medical Device Regulation',
      status: 'Current',
      sections_detail: [
        { id: 'Sec_1', title: 'Definitions', content: 'In these Regulations...' },
        { id: 'Sec_32', title: 'Quality system', content: 'A manufacturer of a Class II, III or IV device...' }
      ]
    }
  ]))

  const standardsData = JSON.parse(standards)
  const bookmarksData = JSON.parse(bookmarks)

  const filteredStandards = standardsData.filter((std: any) =>
    std.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    std.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    std.region.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const toggleBookmark = (standardId: string, sectionId?: string) => {
    const bookmarkId = sectionId ? `${standardId}_${sectionId}` : standardId
    const existingIndex = bookmarksData.findIndex((b: string) => b === bookmarkId)
    
    let updated
    if (existingIndex >= 0) {
      updated = bookmarksData.filter((b: string) => b !== bookmarkId)
      toast.success('Removed from bookmarks')
    } else {
      updated = [...bookmarksData, bookmarkId]
      toast.success('Added to bookmarks')
    }
    
    setBookmarks(JSON.stringify(updated))
  }

  const isBookmarked = (standardId: string, sectionId?: string) => {
    const bookmarkId = sectionId ? `${standardId}_${sectionId}` : standardId
    return bookmarksData.includes(bookmarkId)
  }

  const StandardCard = ({ standard }: { standard: any }) => (
    <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer"
          onClick={() => setSelectedStandard(standard)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg text-foreground flex items-center gap-2">
              {standard.name}
              <Button
                variant="ghost"
                size="sm"
                className="p-1 h-auto"
                onClick={(e) => {
                  e.stopPropagation()
                  toggleBookmark(standard.id)
                }}
              >
                <Bookmark 
                  size={14} 
                  className={isBookmarked(standard.id) ? 'fill-current text-yellow-500' : 'text-muted-foreground'} 
                />
              </Button>
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{standard.description}</p>
          </div>
          <Badge variant="outline" className="text-xs">
            {standard.region}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <FileText size={14} />
            <span>{standard.sections} sections</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar size={14} />
            <span>{standard.lastUpdated}</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between pt-2 border-t border-dashed">
          <Badge className={`text-xs ${
            standard.category === 'Quality Systems' ? 'bg-blue-100 text-blue-800 border-blue-200' :
            'bg-green-100 text-green-800 border-green-200'
          }`}>
            {standard.category}
          </Badge>
          <ChevronRight size={16} className="text-muted-foreground" />
        </div>
      </CardContent>
    </Card>
  )

  const StandardDetail = ({ standard }: { standard: any }) => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Button variant="ghost" onClick={() => setSelectedStandard(null)}>
            ← Back to Knowledge Base
          </Button>
          <h2 className="text-2xl font-bold mt-2">{standard.name}</h2>
          <p className="text-muted-foreground">{standard.description}</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Share size={16} className="mr-2" />
            Share
          </Button>
          <Button variant="outline" size="sm">
            <Download size={16} className="mr-2" />
            Export
          </Button>
          <Button
            variant={isBookmarked(standard.id) ? "default" : "outline"}
            size="sm"
            onClick={() => toggleBookmark(standard.id)}
          >
            <Bookmark size={16} className="mr-2" />
            {isBookmarked(standard.id) ? 'Bookmarked' : 'Bookmark'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{standard.sections}</p>
              <p className="text-sm text-muted-foreground">Sections</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{standard.totalContent}</p>
              <p className="text-sm text-muted-foreground">Content</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{standard.region}</p>
              <p className="text-sm text-muted-foreground">Region</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{standard.lastUpdated}</p>
              <p className="text-sm text-muted-foreground">Last Updated</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Table of Contents</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {standard.sections_detail.map((section: any, index: number) => (
            <div 
              key={index}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/30 transition-colors cursor-pointer"
              onClick={() => setSelectedSection({ standard, section })}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <FileText size={14} className="text-primary" />
                </div>
                <div>
                  <p className="font-medium">{section.id} - {section.title}</p>
                  <p className="text-sm text-muted-foreground">Click to view content</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-1 h-auto"
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleBookmark(standard.id, section.id)
                  }}
                >
                  <Bookmark 
                    size={14} 
                    className={isBookmarked(standard.id, section.id) ? 'fill-current text-yellow-500' : 'text-muted-foreground'} 
                  />
                </Button>
                <ChevronRight size={16} className="text-muted-foreground" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )

  const SectionDetail = ({ standard, section }: { standard: any, section: any }) => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Button variant="ghost" onClick={() => setSelectedSection(null)}>
            ← Back to {standard.name}
          </Button>
          <h2 className="text-2xl font-bold mt-2">{section.id} - {section.title}</h2>
          <p className="text-muted-foreground">{standard.name}</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant={isBookmarked(standard.id, section.id) ? "default" : "outline"}
            size="sm"
            onClick={() => toggleBookmark(standard.id, section.id)}
          >
            <Bookmark size={16} className="mr-2" />
            {isBookmarked(standard.id, section.id) ? 'Bookmarked' : 'Bookmark'}
          </Button>
          <Button variant="outline" size="sm">
            <ExternalLink size={16} className="mr-2" />
            Official Source
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="prose max-w-none">
            <h3 className="text-lg font-semibold mb-4">{section.title}</h3>
            <div className="text-foreground leading-relaxed">
              {section.content}
            </div>
            
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Key Requirements</h4>
              <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <li>• Organizations must establish and maintain documented procedures</li>
                <li>• Regular management reviews are required</li>
                <li>• Records must be maintained for regulatory compliance</li>
                <li>• Training and competency requirements must be met</li>
              </ul>
            </div>

            <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">Common Audit Findings</h4>
              <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                <li>• Incomplete documentation of procedures</li>
                <li>• Missing management review records</li>
                <li>• Inadequate training documentation</li>
                <li>• Lack of corrective action follow-up</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  if (selectedSection) {
    return <SectionDetail standard={selectedSection.standard} section={selectedSection.section} />
  }

  if (selectedStandard) {
    return <StandardDetail standard={selectedStandard} />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Regulatory Knowledge Base</h2>
          <p className="text-muted-foreground">Comprehensive global regulatory standards library</p>
        </div>
        <div className="flex items-center gap-3">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Bookmark size={16} className="mr-2" />
                My Bookmarks ({bookmarksData.length})
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>My Bookmarks</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                {bookmarksData.length > 0 ? bookmarksData.map((bookmark: string, index: number) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <p className="font-medium">{bookmark}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleBookmark(...bookmark.split('_'))}
                    >
                      Remove
                    </Button>
                  </div>
                )) : (
                  <p className="text-center text-muted-foreground py-4">No bookmarks yet</p>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-3 text-muted-foreground" />
          <Input
            placeholder="Search standards, regions, or content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" size="sm">
          <Filter size={16} className="mr-2" />
          Filters
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Standards', value: standardsData.length.toString(), icon: BookOpen },
          { label: 'Regions Covered', value: '6', icon: Globe },
          { label: 'Total Sections', value: '419', icon: FileText },
          { label: 'Bookmarks', value: bookmarksData.length.toString(), icon: Bookmark }
        ].map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <Icon size={24} className="text-primary" />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Standards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredStandards.map((standard: any, index: number) => (
          <StandardCard key={index} standard={standard} />
        ))}
      </div>

      {filteredStandards.length === 0 && searchTerm && (
        <div className="text-center py-12">
          <Search size={48} className="mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium mb-2">No results found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search terms or browse all standards above.
          </p>
        </div>
      )}
    </div>
  )
}