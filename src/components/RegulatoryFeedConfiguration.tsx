import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Settings, 
  Bell, 
  Globe, 
  Rss,
  Clock,
  Mail,
  Smartphone,
  Shield,
  Key,
  Database,
  Zap,
  AlertTriangle,
  CheckCircle,
  Plus,
  Trash2,
  Edit3,
  Download,
  Upload
} from '@phosphor-icons/react'
import { toast } from 'sonner'

interface FeedSource {
  id: string
  name: string
  url: string
  agency: string
  region: string
  categories: string[]
  isActive: boolean
  lastSync: string
  updateFrequency: number // hours
  priority: 'high' | 'medium' | 'low'
}

interface NotificationSettings {
  email: boolean
  sms: boolean
  inApp: boolean
  criticalOnly: boolean
  dailyDigest: boolean
  weeklyReport: boolean
  agencies: string[]
  categories: string[]
  keywords: string[]
}

export function RegulatoryFeedConfiguration() {
  const [activeTab, setActiveTab] = useState('sources')
  
  // Mock data for feed sources
  const [feedSources, setFeedSources] = useState<FeedSource[]>([
    {
      id: '1',
      name: 'FDA Drug Approvals and Safety Updates',
      url: 'https://www.fda.gov/drugs/development-approval-process-drugs/rss-feed',
      agency: 'FDA',
      region: 'United States',
      categories: ['Drug Approvals', 'Safety Alerts', 'Guidance Documents'],
      isActive: true,
      lastSync: '2024-01-15T10:30:00Z',
      updateFrequency: 4,
      priority: 'high'
    },
    {
      id: '2',
      name: 'EMA News and Press Releases',
      url: 'https://www.ema.europa.eu/en/news/rss.xml',
      agency: 'EMA',
      region: 'European Union',
      categories: ['Drug Approvals', 'Safety Information', 'Guidelines'],
      isActive: true,
      lastSync: '2024-01-15T09:45:00Z',
      updateFrequency: 6,
      priority: 'high'
    },
    {
      id: '3',
      name: 'ICH Quality Guidelines Updates',
      url: 'https://ich.org/page/quality-guidelines/rss',
      agency: 'ICH',
      region: 'Global',
      categories: ['Quality Guidelines', 'Harmonization'],
      isActive: true,
      lastSync: '2024-01-14T16:20:00Z',
      updateFrequency: 24,
      priority: 'medium'
    },
    {
      id: '4',
      name: 'PMDA English Updates',
      url: 'https://pmda.go.jp/english/rss-feed.xml',
      agency: 'PMDA',
      region: 'Japan',
      categories: ['Approvals', 'Guidance', 'Notifications'],
      isActive: false,
      lastSync: '2024-01-10T08:15:00Z',
      updateFrequency: 12,
      priority: 'medium'
    }
  ])

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    email: true,
    sms: false,
    inApp: true,
    criticalOnly: false,
    dailyDigest: true,
    weeklyReport: true,
    agencies: ['FDA', 'EMA', 'ICH'],
    categories: ['Drug Approvals', 'Safety Alerts', 'Guidance Documents'],
    keywords: ['SaMD', 'AI/ML', 'Digital Health', 'Breakthrough Therapy']
  })

  const [newKeyword, setNewKeyword] = useState('')

  const toggleFeedSource = (id: string) => {
    setFeedSources(prev => prev.map(source => 
      source.id === id ? { ...source, isActive: !source.isActive } : source
    ))
    toast.success('Feed source updated')
  }

  const addKeyword = () => {
    if (newKeyword.trim() && !notificationSettings.keywords.includes(newKeyword.trim())) {
      setNotificationSettings(prev => ({
        ...prev,
        keywords: [...prev.keywords, newKeyword.trim()]
      }))
      setNewKeyword('')
      toast.success('Keyword added')
    }
  }

  const removeKeyword = (keyword: string) => {
    setNotificationSettings(prev => ({
      ...prev,
      keywords: prev.keywords.filter(k => k !== keyword)
    }))
    toast.success('Keyword removed')
  }

  const syncAllFeeds = async () => {
    toast.promise(
      new Promise(resolve => setTimeout(resolve, 3000)),
      {
        loading: 'Synchronizing all feed sources...',
        success: 'All feeds synchronized successfully',
        error: 'Failed to sync feeds'
      }
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Feed Configuration</h1>
          <p className="text-muted-foreground mt-2">
            Configure real-time regulatory update sources and notification preferences
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={syncAllFeeds}>
            <Rss size={16} className="mr-2" />
            Sync All Feeds
          </Button>
          <Button variant="outline">
            <Download size={16} className="mr-2" />
            Export Config
          </Button>
        </div>
      </div>

      {/* Configuration Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="sources">Feed Sources</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="filters">Content Filters</TabsTrigger>
          <TabsTrigger value="advanced">Advanced Settings</TabsTrigger>
        </TabsList>

        {/* Feed Sources Configuration */}
        <TabsContent value="sources" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Rss size={20} />
                  Regulatory Feed Sources
                </CardTitle>
                <Button size="sm">
                  <Plus size={16} className="mr-2" />
                  Add Source
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {feedSources.map((source) => (
                  <div key={source.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Switch
                            checked={source.isActive}
                            onCheckedChange={() => toggleFeedSource(source.id)}
                          />
                          <h4 className="font-semibold text-foreground">{source.name}</h4>
                          <Badge 
                            className={source.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}
                            variant="outline"
                          >
                            {source.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                        
                        <div className="text-sm text-muted-foreground mb-3">
                          <p className="font-mono text-xs bg-muted px-2 py-1 rounded mb-2">
                            {source.url}
                          </p>
                          <div className="flex items-center gap-4">
                            <span>Agency: {source.agency}</span>
                            <span>Region: {source.region}</span>
                            <span>Updates every {source.updateFrequency}h</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 mb-3">
                          <Badge className={
                            source.priority === 'high' ? 'bg-red-100 text-red-800' :
                            source.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800'
                          } variant="outline">
                            {source.priority} priority
                          </Badge>
                          {source.categories.map((category, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {category}
                            </Badge>
                          ))}
                        </div>

                        <p className="text-xs text-muted-foreground">
                          Last synced: {new Date(source.lastSync).toLocaleString()}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Edit3 size={14} />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Configuration */}
        <TabsContent value="notifications" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell size={20} />
                  Notification Channels
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Mail size={16} className="text-muted-foreground" />
                    <Label>Email notifications</Label>
                  </div>
                  <Switch
                    checked={notificationSettings.email}
                    onCheckedChange={(checked) => 
                      setNotificationSettings(prev => ({ ...prev, email: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Smartphone size={16} className="text-muted-foreground" />
                    <Label>SMS notifications</Label>
                  </div>
                  <Switch
                    checked={notificationSettings.sms}
                    onCheckedChange={(checked) => 
                      setNotificationSettings(prev => ({ ...prev, sms: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Bell size={16} className="text-muted-foreground" />
                    <Label>In-app notifications</Label>
                  </div>
                  <Switch
                    checked={notificationSettings.inApp}
                    onCheckedChange={(checked) => 
                      setNotificationSettings(prev => ({ ...prev, inApp: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <AlertTriangle size={16} className="text-muted-foreground" />
                    <Label>Critical updates only</Label>
                  </div>
                  <Switch
                    checked={notificationSettings.criticalOnly}
                    onCheckedChange={(checked) => 
                      setNotificationSettings(prev => ({ ...prev, criticalOnly: checked }))
                    }
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock size={20} />
                  Digest Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Daily digest email</Label>
                  <Switch
                    checked={notificationSettings.dailyDigest}
                    onCheckedChange={(checked) => 
                      setNotificationSettings(prev => ({ ...prev, dailyDigest: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Weekly summary report</Label>
                  <Switch
                    checked={notificationSettings.weeklyReport}
                    onCheckedChange={(checked) => 
                      setNotificationSettings(prev => ({ ...prev, weeklyReport: checked }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Digest delivery time</Label>
                  <Select defaultValue="09:00">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="07:00">7:00 AM</SelectItem>
                      <SelectItem value="08:00">8:00 AM</SelectItem>
                      <SelectItem value="09:00">9:00 AM</SelectItem>
                      <SelectItem value="10:00">10:00 AM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Time zone</Label>
                  <Select defaultValue="EST">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EST">Eastern Time (EST)</SelectItem>
                      <SelectItem value="PST">Pacific Time (PST)</SelectItem>
                      <SelectItem value="GMT">Greenwich Mean Time (GMT)</SelectItem>
                      <SelectItem value="CET">Central European Time (CET)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Content Filters */}
        <TabsContent value="filters" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key size={20} />
                Keyword Monitoring
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Add keyword or phrase to monitor"
                    value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addKeyword()}
                  />
                  <Button onClick={addKeyword}>
                    <Plus size={16} className="mr-2" />
                    Add
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {notificationSettings.keywords.map((keyword, index) => (
                    <Badge key={index} variant="secondary" className="gap-2">
                      {keyword}
                      <button
                        onClick={() => removeKeyword(keyword)}
                        className="hover:text-red-600 ml-1"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Agency Preferences</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {['FDA', 'EMA', 'ICH', 'PMDA', 'Health Canada', 'TGA', 'ANVISA', 'NMPA'].map((agency) => (
                    <div key={agency} className="flex items-center justify-between">
                      <Label>{agency}</Label>
                      <Switch
                        checked={notificationSettings.agencies.includes(agency)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setNotificationSettings(prev => ({
                              ...prev,
                              agencies: [...prev.agencies, agency]
                            }))
                          } else {
                            setNotificationSettings(prev => ({
                              ...prev,
                              agencies: prev.agencies.filter(a => a !== agency)
                            }))
                          }
                        }}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Content Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    'Drug Approvals',
                    'Safety Alerts', 
                    'Guidance Documents',
                    'Clinical Trials',
                    'Medical Devices',
                    'Digital Health',
                    'Manufacturing',
                    'Quality Guidelines'
                  ].map((category) => (
                    <div key={category} className="flex items-center justify-between">
                      <Label>{category}</Label>
                      <Switch
                        checked={notificationSettings.categories.includes(category)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setNotificationSettings(prev => ({
                              ...prev,
                              categories: [...prev.categories, category]
                            }))
                          } else {
                            setNotificationSettings(prev => ({
                              ...prev,
                              categories: prev.categories.filter(c => c !== category)
                            }))
                          }
                        }}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Advanced Settings */}
        <TabsContent value="advanced" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap size={20} />
                  Performance Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Sync frequency (minutes)</Label>
                  <Select defaultValue="30">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">Every 5 minutes</SelectItem>
                      <SelectItem value="15">Every 15 minutes</SelectItem>
                      <SelectItem value="30">Every 30 minutes</SelectItem>
                      <SelectItem value="60">Every hour</SelectItem>
                      <SelectItem value="240">Every 4 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Batch processing size</Label>
                  <Select defaultValue="50">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10 items</SelectItem>
                      <SelectItem value="25">25 items</SelectItem>
                      <SelectItem value="50">50 items</SelectItem>
                      <SelectItem value="100">100 items</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <Label>Enable parallel processing</Label>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Smart content deduplication</Label>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database size={20} />
                  Data Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Data retention period</Label>
                  <Select defaultValue="365">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 days</SelectItem>
                      <SelectItem value="90">90 days</SelectItem>
                      <SelectItem value="180">6 months</SelectItem>
                      <SelectItem value="365">1 year</SelectItem>
                      <SelectItem value="unlimited">Unlimited</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <Label>Auto-archive read items</Label>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Compress archived data</Label>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Enable full-text search indexing</Label>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield size={20} />
                Security & Compliance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable audit logging</Label>
                  <p className="text-xs text-muted-foreground">
                    Log all feed access and configuration changes
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Encrypt stored content</Label>
                  <p className="text-xs text-muted-foreground">
                    Encrypt all regulatory content at rest
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Verify content authenticity</Label>
                  <p className="text-xs text-muted-foreground">
                    Validate content signatures from agencies
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="space-y-2">
                <Label>Access control level</Label>
                <Select defaultValue="role-based">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open access</SelectItem>
                    <SelectItem value="role-based">Role-based access</SelectItem>
                    <SelectItem value="restricted">Restricted access</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Configuration */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-foreground mb-1">Configuration Status</h4>
              <p className="text-sm text-muted-foreground">
                All changes are automatically saved and applied to the real-time monitoring system
              </p>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle size={16} className="text-green-600" />
              <span className="text-sm text-green-600">Configuration synced</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}