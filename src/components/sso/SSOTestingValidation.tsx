import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { 
  CheckCircle, 
  Warning, 
  XCircle, 
  Play,
  Info,
  Bug,
  Globe,
  Lock,
  Users,
  Key,
  ArrowRight,
  Copy,
  Download
} from '@phosphor-icons/react'

interface TestResult {
  id: string
  name: string
  description: string
  status: 'passed' | 'failed' | 'warning' | 'running' | 'pending'
  message: string
  details?: string
  duration?: number
}

interface DiagnosticInfo {
  category: string
  items: Array<{
    name: string
    value: string
    status: 'ok' | 'warning' | 'error'
    description?: string
  }>
}

export function SSOTestingValidation() {
  const [selectedProvider, setSelectedProvider] = useState('azure')
  const [testResults, setTestResults] = useState<TestResult[]>([
    {
      id: 'metadata',
      name: 'Provider Metadata Validation',
      description: 'Verify OIDC/SAML metadata and endpoints',
      status: 'passed',
      message: 'All required endpoints accessible',
      duration: 1.2
    },
    {
      id: 'auth_flow',
      name: 'Authentication Flow',
      description: 'Test complete login and callback flow',
      status: 'passed',
      message: 'Authorization code flow successful',
      duration: 3.5
    },
    {
      id: 'token_validation',
      name: 'Token Validation',
      description: 'Verify JWT token signature and claims',
      status: 'warning',
      message: 'Token expires in 1 hour (consider longer duration)',
      duration: 0.8
    },
    {
      id: 'user_info',
      name: 'User Profile Retrieval',
      description: 'Fetch user information from provider',
      status: 'passed',
      message: 'Successfully retrieved user profile data',
      duration: 1.1
    },
    {
      id: 'group_sync',
      name: 'Group Synchronization',
      description: 'Test user group and role mapping',
      status: 'failed',
      message: 'Groups claim not found in token',
      details: 'Configure group claims in Azure AD app registration',
      duration: 0.5
    }
  ])

  const [diagnosticInfo] = useState<DiagnosticInfo[]>([
    {
      category: 'Network Connectivity',
      items: [
        { name: 'DNS Resolution', value: 'login.microsoftonline.com → 20.190.154.136', status: 'ok' },
        { name: 'HTTPS Connection', value: 'TLS 1.3, Valid Certificate', status: 'ok' },
        { name: 'Response Time', value: '124ms average', status: 'ok' },
        { name: 'Firewall Status', value: 'All required ports open', status: 'ok' }
      ]
    },
    {
      category: 'Configuration',
      items: [
        { name: 'Client ID Format', value: 'Valid GUID format', status: 'ok' },
        { name: 'Redirect URI', value: 'Matches registered callback', status: 'ok' },
        { name: 'Scopes', value: 'openid, profile, email, offline_access', status: 'ok' },
        { name: 'Group Claims', value: 'Not configured', status: 'warning', description: 'Enable group claims for role mapping' }
      ]
    },
    {
      category: 'Security',
      items: [
        { name: 'PKCE Support', value: 'Enabled and working', status: 'ok' },
        { name: 'State Parameter', value: 'Present and validated', status: 'ok' },
        { name: 'Nonce Validation', value: 'Verified successfully', status: 'ok' },
        { name: 'Token Binding', value: 'Not implemented', status: 'warning', description: 'Consider implementing for enhanced security' }
      ]
    }
  ])

  const [isRunningTests, setIsRunningTests] = useState(false)
  const [troubleshootingMode, setTroubleshootingMode] = useState(false)

  const runAllTests = async () => {
    setIsRunningTests(true)
    
    // Mark all tests as running
    setTestResults(current => 
      current.map(test => ({ ...test, status: 'running' as const }))
    )

    // Simulate running tests with delays
    for (let i = 0; i < testResults.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setTestResults(current => 
        current.map((test, index) => {
          if (index === i) {
            // Simulate random success/failure
            const success = Math.random() > 0.2 // 80% success rate
            return {
              ...test,
              status: success ? 'passed' : 'failed',
              message: success ? test.message : 'Test failed - see details',
              duration: Math.random() * 3 + 0.5
            }
          }
          return test
        })
      )
    }

    setIsRunningTests(false)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed':
        return <CheckCircle size={16} className="text-green-600" />
      case 'failed':
        return <XCircle size={16} className="text-red-600" />
      case 'warning':
        return <Warning size={16} className="text-yellow-600" />
      case 'running':
        return <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-blue-600" />
      case 'pending':
        return <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
      default:
        return <Info size={16} className="text-blue-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed':
        return 'bg-green-50 border-green-200 text-green-800'
      case 'failed':
        return 'bg-red-50 border-red-200 text-red-800'
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800'
      case 'running':
        return 'bg-blue-50 border-blue-200 text-blue-800'
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800'
    }
  }

  const getDiagnosticStatusColor = (status: string) => {
    switch (status) {
      case 'ok':
        return 'text-green-600'
      case 'warning':
        return 'text-yellow-600'
      case 'error':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const generateTestReport = () => {
    const report = {
      timestamp: new Date().toISOString(),
      provider: selectedProvider,
      results: testResults,
      diagnostics: diagnosticInfo,
      summary: {
        total: testResults.length,
        passed: testResults.filter(t => t.status === 'passed').length,
        failed: testResults.filter(t => t.status === 'failed').length,
        warnings: testResults.filter(t => t.status === 'warning').length
      }
    }
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `sso-test-report-${selectedProvider}-${new Date().getTime()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const renderTestResults = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">SSO Integration Tests</h3>
          <p className="text-sm text-muted-foreground">
            Comprehensive testing of authentication flow and configuration
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={generateTestReport}
          >
            <Download size={16} className="mr-2" />
            Export Report
          </Button>
          <Button
            onClick={runAllTests}
            disabled={isRunningTests}
          >
            <Play size={16} className="mr-2" />
            {isRunningTests ? 'Running Tests...' : 'Run All Tests'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Passed</p>
                <p className="text-2xl font-bold text-green-600">
                  {testResults.filter(t => t.status === 'passed').length}
                </p>
              </div>
              <CheckCircle size={24} className="text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Failed</p>
                <p className="text-2xl font-bold text-red-600">
                  {testResults.filter(t => t.status === 'failed').length}
                </p>
              </div>
              <XCircle size={24} className="text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Warnings</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {testResults.filter(t => t.status === 'warning').length}
                </p>
              </div>
              <Warning size={24} className="text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-bold">
                  {Math.round((testResults.filter(t => t.status === 'passed').length / testResults.length) * 100)}%
                </p>
              </div>
              <div className="text-2xl">📊</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Test Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {testResults.map((test) => (
              <div
                key={test.id}
                className={`p-4 rounded-lg border ${getStatusColor(test.status)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    {getStatusIcon(test.status)}
                    <div className="flex-1">
                      <h4 className="font-medium">{test.name}</h4>
                      <p className="text-sm opacity-80 mt-1">{test.description}</p>
                      <p className="text-sm font-medium mt-2">{test.message}</p>
                      {test.details && (
                        <p className="text-sm opacity-70 mt-1">{test.details}</p>
                      )}
                      {test.duration && (
                        <p className="text-xs opacity-60 mt-2">
                          Completed in {test.duration}s
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderDiagnostics = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">System Diagnostics</h3>
          <p className="text-sm text-muted-foreground">
            Detailed diagnostic information and configuration validation
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => setTroubleshootingMode(!troubleshootingMode)}
        >
          <Bug size={16} className="mr-2" />
          {troubleshootingMode ? 'Exit Troubleshooting' : 'Troubleshooting Mode'}
        </Button>
      </div>

      {troubleshootingMode && (
        <Alert>
          <Bug size={16} />
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-medium">Troubleshooting Mode Enabled</p>
              <p className="text-sm">Additional debug information and verbose logging is now active. This mode should only be used for diagnostic purposes.</p>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-6">
        {diagnosticInfo.map((category, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="text-lg">{category.category}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {category.items.map((item, itemIndex) => (
                  <div key={itemIndex} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{item.name}</span>
                        <div className={`w-2 h-2 rounded-full ${
                          item.status === 'ok' ? 'bg-green-500' :
                          item.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                        }`} />
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {item.value}
                      </p>
                      {item.description && (
                        <p className={`text-xs mt-1 ${getDiagnosticStatusColor(item.status)}`}>
                          {item.description}
                        </p>
                      )}
                    </div>
                    {troubleshootingMode && (
                      <Button size="sm" variant="ghost" className="opacity-60">
                        <Copy size={14} />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {troubleshootingMode && (
        <Card>
          <CardHeader>
            <CardTitle>Debug Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label>Raw Configuration</Label>
                <Textarea
                  readOnly
                  value={JSON.stringify({
                    provider: selectedProvider,
                    clientId: '12345678-1234-1234-1234-123456789abc',
                    tenantId: 'contoso.onmicrosoft.com',
                    redirectUri: 'https://virtualbackroom.ai/auth/azure/callback',
                    scopes: ['openid', 'profile', 'email', 'offline_access']
                  }, null, 2)}
                  className="font-mono text-xs h-32"
                />
              </div>
              
              <div>
                <Label>Network Trace</Label>
                <Textarea
                  readOnly
                  value={`[2024-01-15 10:30:15] DNS lookup for login.microsoftonline.com... OK (124ms)
[2024-01-15 10:30:15] TCP connection to 20.190.154.136:443... OK (45ms)
[2024-01-15 10:30:15] TLS handshake... OK (TLS 1.3, cipher: TLS_AES_256_GCM_SHA384)
[2024-01-15 10:30:16] HTTP GET /.well-known/openid-configuration... 200 OK (234ms)
[2024-01-15 10:30:16] Metadata validation... OK`}
                  className="font-mono text-xs h-32"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )

  const renderTroubleshooting = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Common Issues & Solutions</h3>
        <p className="text-sm text-muted-foreground">
          Troubleshooting guide for common SSO integration problems
        </p>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <XCircle size={16} className="text-red-600" />
              Authentication Failed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium">Possible Causes:</p>
                <ul className="text-sm text-muted-foreground list-disc list-inside mt-1 space-y-1">
                  <li>Incorrect client ID or client secret</li>
                  <li>Redirect URI mismatch</li>
                  <li>User not assigned to the application</li>
                  <li>Conditional access policy blocking login</li>
                </ul>
              </div>
              <div>
                <p className="text-sm font-medium">Solutions:</p>
                <ul className="text-sm text-muted-foreground list-disc list-inside mt-1 space-y-1">
                  <li>Verify credentials in provider console</li>
                  <li>Check redirect URI matches exactly</li>
                  <li>Assign user/group to application</li>
                  <li>Review conditional access logs</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Warning size={16} className="text-yellow-600" />
              Missing User Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium">Possible Causes:</p>
                <ul className="text-sm text-muted-foreground list-disc list-inside mt-1 space-y-1">
                  <li>Insufficient scopes requested</li>
                  <li>User profile information not populated</li>
                  <li>Claims not configured in token</li>
                </ul>
              </div>
              <div>
                <p className="text-sm font-medium">Solutions:</p>
                <ul className="text-sm text-muted-foreground list-disc list-inside mt-1 space-y-1">
                  <li>Add required scopes (profile, email)</li>
                  <li>Configure optional claims in app registration</li>
                  <li>Verify user profile is complete</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Info size={16} className="text-blue-600" />
              Group Mapping Issues
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium">Possible Causes:</p>
                <ul className="text-sm text-muted-foreground list-disc list-inside mt-1 space-y-1">
                  <li>Group claims not enabled</li>
                  <li>User not member of any groups</li>
                  <li>Group ID vs. name mismatch</li>
                </ul>
              </div>
              <div>
                <p className="text-sm font-medium">Solutions:</p>
                <ul className="text-sm text-muted-foreground list-disc list-inside mt-1 space-y-1">
                  <li>Enable group claims in token configuration</li>
                  <li>Add user to required security groups</li>
                  <li>Configure group name format preference</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Contact Support</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            If you're still experiencing issues, contact our support team with the diagnostic information.
          </p>
          <div className="flex gap-3">
            <Button variant="outline">
              <Copy size={16} className="mr-2" />
              Copy Debug Info
            </Button>
            <Button>
              <ArrowRight size={16} className="mr-2" />
              Contact Support
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">SSO Testing & Validation</h1>
          <p className="text-muted-foreground">
            Test and validate your SSO integration with comprehensive diagnostic tools
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">Microsoft Azure AD</Badge>
          <Button variant="outline" size="sm">
            Switch Provider
          </Button>
        </div>
      </div>

      <Tabs defaultValue="tests" className="space-y-6">
        <TabsList>
          <TabsTrigger value="tests">Test Results</TabsTrigger>
          <TabsTrigger value="diagnostics">Diagnostics</TabsTrigger>
          <TabsTrigger value="troubleshooting">Troubleshooting</TabsTrigger>
        </TabsList>

        <TabsContent value="tests">
          {renderTestResults()}
        </TabsContent>

        <TabsContent value="diagnostics">
          {renderDiagnostics()}
        </TabsContent>

        <TabsContent value="troubleshooting">
          {renderTroubleshooting()}
        </TabsContent>
      </Tabs>
    </div>
  )
}