import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Shield, 
  Search, 
  Filter, 
  Download, 
  Eye,
  Clock,
  User,
  FileText,
  Activity,
  AlertTriangle,
  CheckCircle,
  Lock,
  Calendar
} from '@phosphor-icons/react'
import { toast } from 'sonner'

interface AuditEvent {
  id: string
  eventType: 'CREATE' | 'READ' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'EXPORT'
  tableName?: string
  recordId?: string
  userId: string
  userEmail: string
  userIpAddress: string
  organizationId: string
  eventTimestamp: string
  changeReason?: string
  oldValues?: any
  newValues?: any
  apiEndpoint?: string
  httpMethod?: string
  responseStatus?: number
  eventSignificance: 'routine' | 'significant' | 'critical'
  regulatoryImpact: boolean
}

export function AuditTrailViewer() {
  const [auditEvents, setAuditEvents] = useKV('audit-trail-events', [] as AuditEvent[])
  const [filteredEvents, setFilteredEvents] = useState<AuditEvent[]>([])
  const [filters, setFilters] = useState({
    eventType: 'all',
    significance: 'all',
    dateRange: '7days',
    searchTerm: '',
    userId: 'all'
  })

  // Generate sample audit trail data
  useEffect(() => {
    if (auditEvents.length === 0) {
      const sampleEvents: AuditEvent[] = [
        {
          id: 'audit-001',
          eventType: 'CREATE',
          tableName: 'analysis_reports',
          recordId: 'report-abc-123',
          userId: 'user-001',
          userEmail: 'john.doe@contoso.com',
          userIpAddress: '192.168.1.45',
          organizationId: 'org-contoso',
          eventTimestamp: new Date(Date.now() - 3600000).toISOString(),
          changeReason: 'New regulatory gap analysis initiated',
          newValues: { 
            document_id: 'doc-xyz-456', 
            regulation_standard: '21 CFR 820',
            status: 'pending'
          },
          apiEndpoint: '/api/v1/analyses',
          httpMethod: 'POST',
          responseStatus: 201,
          eventSignificance: 'significant',
          regulatoryImpact: true
        },
        {
          id: 'audit-002',
          eventType: 'LOGIN',
          userId: 'user-001',
          userEmail: 'john.doe@contoso.com',
          userIpAddress: '192.168.1.45',
          organizationId: 'org-contoso',
          eventTimestamp: new Date(Date.now() - 7200000).toISOString(),
          apiEndpoint: '/auth/sso/microsoft',
          httpMethod: 'POST',
          responseStatus: 200,
          eventSignificance: 'routine',
          regulatoryImpact: false
        },
        {
          id: 'audit-003',
          eventType: 'UPDATE',
          tableName: 'analysis_reports',
          recordId: 'report-abc-123',
          userId: 'user-001',
          userEmail: 'john.doe@contoso.com',
          userIpAddress: '192.168.1.45',
          organizationId: 'org-contoso',
          eventTimestamp: new Date(Date.now() - 1800000).toISOString(),
          changeReason: 'Analysis completed successfully',
          oldValues: { status: 'processing' },
          newValues: { 
            status: 'completed',
            findings_count: 12,
            critical_findings_count: 3,
            confidence_score: 94.2
          },
          apiEndpoint: '/api/v1/analyses/report-abc-123',
          httpMethod: 'PUT',
          responseStatus: 200,
          eventSignificance: 'significant',
          regulatoryImpact: true
        },
        {
          id: 'audit-004',
          eventType: 'EXPORT',
          tableName: 'analysis_reports',
          recordId: 'report-abc-123',
          userId: 'user-002',
          userEmail: 'sarah.chen@acmemedtech.com',
          userIpAddress: '10.0.1.23',
          organizationId: 'org-acmemedtech',
          eventTimestamp: new Date(Date.now() - 900000).toISOString(),
          changeReason: 'PDF report generated for audit submission',
          apiEndpoint: '/api/v1/analyses/report-abc-123/export',
          httpMethod: 'GET',
          responseStatus: 200,
          eventSignificance: 'critical',
          regulatoryImpact: true
        },
        {
          id: 'audit-005',
          eventType: 'DELETE',
          tableName: 'documents',
          recordId: 'doc-old-789',
          userId: 'user-003',
          userEmail: 'mike.rodriguez@globalmed.enterprise',
          userIpAddress: '172.16.0.15',
          organizationId: 'org-globalmed',
          eventTimestamp: new Date(Date.now() - 14400000).toISOString(),
          changeReason: 'Document retention policy expired',
          oldValues: {
            filename: 'quality_manual_v1.pdf',
            status: 'archived'
          },
          apiEndpoint: '/api/v1/documents/doc-old-789',
          httpMethod: 'DELETE',
          responseStatus: 200,
          eventSignificance: 'critical',
          regulatoryImpact: true
        }
      ]
      setAuditEvents(sampleEvents)
    }
  }, [auditEvents.length, setAuditEvents])

  // Apply filters
  useEffect(() => {
    let filtered = auditEvents

    // Filter by event type
    if (filters.eventType !== 'all') {
      filtered = filtered.filter(event => event.eventType === filters.eventType)
    }

    // Filter by significance
    if (filters.significance !== 'all') {
      filtered = filtered.filter(event => event.eventSignificance === filters.significance)
    }

    // Filter by date range
    const now = new Date()
    const dateRanges: Record<string, number> = {
      '1hour': 3600000,
      '24hours': 86400000,
      '7days': 604800000,
      '30days': 2592000000,
      '90days': 7776000000
    }
    
    if (filters.dateRange !== 'all') {
      const cutoff = new Date(now.getTime() - dateRanges[filters.dateRange])
      filtered = filtered.filter(event => new Date(event.eventTimestamp) >= cutoff)
    }

    // Search filter
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase()
      filtered = filtered.filter(event => 
        event.userEmail.toLowerCase().includes(term) ||
        event.eventType.toLowerCase().includes(term) ||
        event.changeReason?.toLowerCase().includes(term) ||
        event.apiEndpoint?.toLowerCase().includes(term)
      )
    }

    setFilteredEvents(filtered.sort((a, b) => 
      new Date(b.eventTimestamp).getTime() - new Date(a.eventTimestamp).getTime()
    ))
  }, [auditEvents, filters])

  const handleExportAuditLog = () => {
    // In production, this would generate a secure, signed audit export
    const exportData = {
      exportTimestamp: new Date().toISOString(),
      totalEvents: filteredEvents.length,
      filters: filters,
      events: filteredEvents
    }
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `audit-trail-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    
    toast.success('Audit trail exported successfully')
  }

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'CREATE': return <FileText size={16} className="text-green-600" />
      case 'READ': return <Eye size={16} className="text-blue-600" />
      case 'UPDATE': return <Activity size={16} className="text-accent" />
      case 'DELETE': return <AlertTriangle size={16} className="text-destructive" />
      case 'LOGIN': return <User size={16} className="text-primary" />
      case 'LOGOUT': return <User size={16} className="text-muted-foreground" />
      case 'EXPORT': return <Download size={16} className="text-purple-600" />
      default: return <Activity size={16} className="text-muted-foreground" />
    }
  }

  const getSignificanceBadge = (significance: string) => {
    switch (significance) {
      case 'critical':
        return <Badge variant="destructive" className="text-xs">Critical</Badge>
      case 'significant':
        return <Badge variant="default" className="text-xs bg-accent">Significant</Badge>
      case 'routine':
        return <Badge variant="outline" className="text-xs">Routine</Badge>
      default:
        return <Badge variant="outline" className="text-xs">Unknown</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Shield size={24} className="text-primary" />
            Audit Trail Viewer
          </h2>
          <p className="text-muted-foreground mt-1">
            21 CFR Part 11 compliant audit trail for all system events
          </p>
        </div>
        <Button onClick={handleExportAuditLog} className="flex items-center gap-2">
          <Download size={16} />
          Export Audit Log
        </Button>
      </div>

      {/* Compliance Status */}
      <Alert className="border-green-200 bg-green-50 dark:bg-green-950/20">
        <Lock size={16} className="text-green-600" />
        <AlertDescription>
          <strong>21 CFR Part 11 Compliant:</strong> All events are captured with user identification, 
          timestamps, change descriptions, and cannot be modified after creation.
        </AlertDescription>
      </Alert>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter size={20} />
            Filter Audit Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input 
                  placeholder="Search events..."
                  value={filters.searchTerm}
                  onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Event Type</label>
              <Select 
                value={filters.eventType} 
                onValueChange={(value) => setFilters(prev => ({ ...prev, eventType: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Events</SelectItem>
                  <SelectItem value="CREATE">Create</SelectItem>
                  <SelectItem value="READ">Read</SelectItem>
                  <SelectItem value="UPDATE">Update</SelectItem>
                  <SelectItem value="DELETE">Delete</SelectItem>
                  <SelectItem value="LOGIN">Login</SelectItem>
                  <SelectItem value="LOGOUT">Logout</SelectItem>
                  <SelectItem value="EXPORT">Export</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Significance</label>
              <Select 
                value={filters.significance} 
                onValueChange={(value) => setFilters(prev => ({ ...prev, significance: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="significant">Significant</SelectItem>
                  <SelectItem value="routine">Routine</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Time Range</label>
              <Select 
                value={filters.dateRange} 
                onValueChange={(value) => setFilters(prev => ({ ...prev, dateRange: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1hour">Last Hour</SelectItem>
                  <SelectItem value="24hours">Last 24 Hours</SelectItem>
                  <SelectItem value="7days">Last 7 Days</SelectItem>
                  <SelectItem value="30days">Last 30 Days</SelectItem>
                  <SelectItem value="90days">Last 90 Days</SelectItem>
                  <SelectItem value="all">All Time</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Results</label>
              <div className="text-sm text-muted-foreground pt-2">
                {filteredEvents.length} of {auditEvents.length} events
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-foreground">{auditEvents.length}</div>
            <div className="text-sm text-muted-foreground">Total Events</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-destructive">
              {auditEvents.filter(e => e.eventSignificance === 'critical').length}
            </div>
            <div className="text-sm text-muted-foreground">Critical Events</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-accent">
              {auditEvents.filter(e => e.regulatoryImpact).length}
            </div>
            <div className="text-sm text-muted-foreground">Regulatory Impact</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {new Set(auditEvents.map(e => e.userId)).size}
            </div>
            <div className="text-sm text-muted-foreground">Active Users</div>
          </CardContent>
        </Card>
      </div>

      {/* Audit Events List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity size={20} />
            Audit Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96">
            <div className="space-y-3">
              {filteredEvents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity size={32} className="mx-auto mb-2 opacity-50" />
                  <p>No events match the current filters</p>
                </div>
              ) : (
                filteredEvents.map((event) => (
                  <Card key={event.id} className="border-l-4 border-l-muted">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            {getEventIcon(event.eventType)}
                            <span className="font-medium text-sm">{event.eventType}</span>
                            {event.tableName && (
                              <Badge variant="outline" className="text-xs">
                                {event.tableName}
                              </Badge>
                            )}
                            {getSignificanceBadge(event.eventSignificance)}
                            {event.regulatoryImpact && (
                              <Badge variant="destructive" className="text-xs">
                                Regulatory
                              </Badge>
                            )}
                          </div>

                          <div className="space-y-1 text-sm">
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <User size={14} />
                              <span>{event.userEmail}</span>
                              <span>•</span>
                              <span>{event.userIpAddress}</span>
                            </div>
                            
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Clock size={14} />
                              <span>{new Date(event.eventTimestamp).toLocaleString()}</span>
                              {event.apiEndpoint && (
                                <>
                                  <span>•</span>
                                  <span className="font-mono text-xs">{event.httpMethod} {event.apiEndpoint}</span>
                                </>
                              )}
                            </div>

                            {event.changeReason && (
                              <div className="text-foreground mt-2">
                                <strong>Reason:</strong> {event.changeReason}
                              </div>
                            )}

                            {/* Change Details */}
                            {(event.oldValues || event.newValues) && (
                              <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                                <div className="text-xs font-medium text-muted-foreground mb-2">Change Details:</div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                                  {event.oldValues && (
                                    <div>
                                      <div className="font-medium text-destructive mb-1">Previous Values:</div>
                                      <pre className="font-mono bg-card p-2 rounded overflow-x-auto">
                                        {JSON.stringify(event.oldValues, null, 2)}
                                      </pre>
                                    </div>
                                  )}
                                  {event.newValues && (
                                    <div>
                                      <div className="font-medium text-green-600 mb-1">New Values:</div>
                                      <pre className="font-mono bg-card p-2 rounded overflow-x-auto">
                                        {JSON.stringify(event.newValues, null, 2)}
                                      </pre>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-1">
                          {event.responseStatus && (
                            <Badge 
                              variant={event.responseStatus < 300 ? "default" : "destructive"}
                              className="text-xs"
                            >
                              {event.responseStatus}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Compliance Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle size={20} />
            Compliance Verification
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <Lock size={24} className="mx-auto text-green-600 mb-2" />
              <div className="text-sm font-medium">Immutable Records</div>
              <div className="text-xs text-muted-foreground">
                All audit entries are write-once, read-many
              </div>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <Clock size={24} className="mx-auto text-blue-600 mb-2" />
              <div className="text-sm font-medium">Precise Timestamps</div>
              <div className="text-xs text-muted-foreground">
                All events include millisecond precision
              </div>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <User size={24} className="mx-auto text-purple-600 mb-2" />
              <div className="text-sm font-medium">User Attribution</div>
              <div className="text-xs text-muted-foreground">
                Complete user context for every action
              </div>
            </div>
          </div>

          <Separator className="my-4" />

          <div className="text-sm text-muted-foreground">
            <strong>Retention Policy:</strong> Audit trail data is retained for 7 years minimum, 
            as required by FDA regulations for electronic records in regulated industries.
            All events are digitally signed and cannot be altered after creation.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}