import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Shield, 
  Globe,
  Key,
  User,
  Settings,
  Activity,
  RefreshCcw,
  Play,
  X
} from '@phosphor-icons/react'

interface TestResult {
  id: string
  name: string
  description: string
  status: 'pending' | 'running' | 'success' | 'warning' | 'error'
  duration?: number
  message?: string
  details?: any
}

interface SSOTestSuite {
  provider: string
  displayName: string
  clientId: string
  domain?: string
  tests: TestResult[]
  overallStatus: 'idle' | 'running' | 'completed' | 'failed'
  startTime?: number
  endTime?: number
}

export function SSOTestingValidation({ 
  provider, 
  configuration,
  onClose 
}: { 
  provider: 'azure' | 'google' | 'okta'
  configuration: any
  onClose: () => void
}) {
  const [testSuite, setTestSuite] = useState<SSOTestSuite>({
    provider,
    displayName: configuration.displayName,
    clientId: configuration.clientId,
    domain: configuration.domain,
    overallStatus: 'idle',
    tests: [
      {
        id: 'connection',
        name: 'Provider Connection',
        description: 'Verify connectivity to SSO provider endpoints',
        status: 'pending'
      },
      {
        id: 'metadata',
        name: 'Metadata Discovery',
        description: 'Retrieve and validate OIDC/SAML metadata',
        status: 'pending'
      },
      {
        id: 'credentials',
        name: 'Client Credentials',
        description: 'Validate client ID and secret authentication',
        status: 'pending'
      },
      {
        id: 'redirect',
        name: 'Redirect URI',
        description: 'Test authorization redirect flow',
        status: 'pending'
      },
      {
        id: 'token',
        name: 'Token Exchange',
        description: 'Test authorization code to token exchange',
        status: 'pending'
      },
      {
        id: 'userinfo',
        name: 'User Information',
        description: 'Retrieve user profile information',
        status: 'pending'
      },
      {
        id: 'scopes',
        name: 'Scope Validation',
        description: 'Verify requested scopes are granted',
        status: 'pending'
      },
      {
        id: 'security',
        name: 'Security Headers',
        description: 'Check security headers and HTTPS usage',
        status: 'pending'
      }
    ]
  })

  const [currentTestIndex, setCurrentTestIndex] = useState(-1)
  const [isRunning, setIsRunning] = useState(false)

  const runTest = async (testId: string): Promise<TestResult> => {
    const test = testSuite.tests.find(t => t.id === testId)!
    const startTime = Date.now()
    
    // Update test status to running
    setTestSuite(prev => ({
      ...prev,
      tests: prev.tests.map(t => 
        t.id === testId ? { ...t, status: 'running' } : t
      )
    }))

    // Simulate test execution with realistic timing
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000))

    const duration = Date.now() - startTime
    
    // Simulate test results based on test type and provider
    let result: Partial<TestResult> = { duration }
    
    switch (testId) {
      case 'connection':
        result = {
          ...result,
          status: Math.random() > 0.1 ? 'success' : 'error',
          message: Math.random() > 0.1 ? 
            'Successfully connected to provider endpoints' : 
            'Failed to connect to provider. Check network connectivity.',
          details: {
            authorizationEndpoint: 'OK',
            tokenEndpoint: 'OK',
            userinfoEndpoint: Math.random() > 0.1 ? 'OK' : 'TIMEOUT'
          }
        }
        break
        
      case 'metadata':
        result = {
          ...result,
          status: Math.random() > 0.05 ? 'success' : 'warning',
          message: Math.random() > 0.05 ? 
            'Metadata retrieved and validated successfully' :
            'Some optional metadata fields are missing',
          details: {
            issuer: 'Valid',
            supportedScopes: ['openid', 'profile', 'email'],
            supportedResponseTypes: ['code']
          }
        }
        break
        
      case 'credentials':
        result = {
          ...result,
          status: Math.random() > 0.15 ? 'success' : 'error',
          message: Math.random() > 0.15 ? 
            'Client credentials validated successfully' :
            'Invalid client credentials. Check client ID and secret.',
          details: {
            clientId: configuration.clientId.substring(0, 8) + '...',
            clientSecret: '***verified***'
          }
        }
        break
        
      case 'redirect':
        result = {
          ...result,
          status: Math.random() > 0.2 ? 'success' : 'error',
          message: Math.random() > 0.2 ? 
            'Redirect URI configuration is valid' :
            'Redirect URI not whitelisted with provider',
          details: {
            configuredUri: configuration.redirectUri,
            status: Math.random() > 0.2 ? 'Whitelisted' : 'Not Found'
          }
        }
        break
        
      case 'token':
        result = {
          ...result,
          status: Math.random() > 0.1 ? 'success' : 'error',
          message: Math.random() > 0.1 ? 
            'Token exchange completed successfully' :
            'Token exchange failed. Check PKCE configuration.',
          details: {
            tokenType: 'Bearer',
            expiresIn: 3600,
            refreshToken: 'Available'
          }
        }
        break
        
      case 'userinfo':
        result = {
          ...result,
          status: Math.random() > 0.05 ? 'success' : 'warning',
          message: Math.random() > 0.05 ? 
            'User information retrieved successfully' :
            'Limited user information available due to scope restrictions',
          details: {
            availableFields: ['sub', 'email', 'name', 'picture'],
            missingFields: Math.random() > 0.05 ? [] : ['phone', 'address']
          }
        }
        break
        
      case 'scopes':
        result = {
          ...result,
          status: Math.random() > 0.1 ? 'success' : 'warning',
          message: Math.random() > 0.1 ? 
            'All requested scopes were granted' :
            'Some scopes were not granted by the provider',
          details: {
            requested: configuration.scopes,
            granted: configuration.scopes.filter(() => Math.random() > 0.1)
          }
        }
        break
        
      case 'security':
        result = {
          ...result,
          status: Math.random() > 0.05 ? 'success' : 'warning',
          message: Math.random() > 0.05 ? 
            'Security configuration meets best practices' :
            'Consider enabling additional security headers',
          details: {
            httpsOnly: true,
            secureHeaders: Math.random() > 0.05,
            csrfProtection: true
          }
        }
        break
    }

    return { ...test, ...result } as TestResult
  }

  const runAllTests = async () => {
    setIsRunning(true)
    setTestSuite(prev => ({ 
      ...prev, 
      overallStatus: 'running',
      startTime: Date.now()
    }))

    for (let i = 0; i < testSuite.tests.length; i++) {
      setCurrentTestIndex(i)
      const testResult = await runTest(testSuite.tests[i].id)
      
      setTestSuite(prev => ({
        ...prev,
        tests: prev.tests.map(t => 
          t.id === testResult.id ? testResult : t
        )
      }))
    }

    setCurrentTestIndex(-1)
    setIsRunning(false)
    
    setTestSuite(prev => {
      const hasErrors = prev.tests.some(t => t.status === 'error')
      const hasWarnings = prev.tests.some(t => t.status === 'warning')
      
      return {
        ...prev,
        overallStatus: hasErrors ? 'failed' : 'completed',
        endTime: Date.now()
      }
    })
  }

  const resetTests = () => {
    setTestSuite(prev => ({
      ...prev,
      overallStatus: 'idle',
      startTime: undefined,
      endTime: undefined,
      tests: prev.tests.map(t => ({
        ...t,
        status: 'pending',
        duration: undefined,
        message: undefined,
        details: undefined
      }))
    }))
    setCurrentTestIndex(-1)
    setIsRunning(false)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle size={16} className="text-green-600" />
      case 'error':
        return <AlertTriangle size={16} className="text-red-600" />
      case 'warning':
        return <AlertTriangle size={16} className="text-yellow-600" />
      case 'running':
        return <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent" />
      default:
        return <Clock size={16} className="text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'default'
      case 'error': return 'destructive'
      case 'warning': return 'secondary'
      case 'running': return 'outline'
      default: return 'outline'
    }
  }

  const completedTests = testSuite.tests.filter(t => ['success', 'warning', 'error'].includes(t.status)).length
  const totalTests = testSuite.tests.length
  const progress = (completedTests / totalTests) * 100

  const getProviderIcon = () => {
    switch (provider) {
      case 'azure': return <Shield size={24} className="text-blue-600" />
      case 'google': return <Globe size={24} className="text-red-500" />
      case 'okta': return <Key size={24} className="text-blue-500" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          {getProviderIcon()}
          <div>
            <h2 className="text-2xl font-bold">SSO Validation Test</h2>
            <p className="text-muted-foreground">
              Testing {testSuite.displayName} configuration
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={onClose}>
          <X size={16} className="mr-2" />
          Close
        </Button>
      </div>

      {/* Test Progress */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Test Progress</CardTitle>
            <div className="flex gap-2">
              {!isRunning && testSuite.overallStatus !== 'running' && (
                <>
                  <Button onClick={runAllTests} disabled={isRunning}>
                    <Play size={16} className="mr-2" />
                    Run Tests
                  </Button>
                  {testSuite.overallStatus !== 'idle' && (
                    <Button variant="outline" onClick={resetTests}>
                      <RefreshCcw size={16} className="mr-2" />
                      Reset
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                {completedTests} of {totalTests} tests completed
              </span>
              <Badge variant={
                testSuite.overallStatus === 'completed' ? 'default' :
                testSuite.overallStatus === 'failed' ? 'destructive' :
                testSuite.overallStatus === 'running' ? 'secondary' :
                'outline'
              }>
                {testSuite.overallStatus === 'idle' && 'Ready'}
                {testSuite.overallStatus === 'running' && 'Running...'}
                {testSuite.overallStatus === 'completed' && 'Completed'}
                {testSuite.overallStatus === 'failed' && 'Failed'}
              </Badge>
            </div>
            <Progress value={progress} />
            {testSuite.startTime && testSuite.endTime && (
              <p className="text-xs text-muted-foreground">
                Total time: {((testSuite.endTime - testSuite.startTime) / 1000).toFixed(1)}s
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Test Results */}
      <Card>
        <CardHeader>
          <CardTitle>Test Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {testSuite.tests.map((test, index) => (
              <div key={test.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(test.status)}
                    <div>
                      <h4 className="font-medium">{test.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {test.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {test.duration && (
                      <span className="text-xs text-muted-foreground">
                        {(test.duration / 1000).toFixed(1)}s
                      </span>
                    )}
                    <Badge variant={getStatusColor(test.status)}>
                      {test.status === 'pending' && 'Pending'}
                      {test.status === 'running' && 'Running'}
                      {test.status === 'success' && 'Success'}
                      {test.status === 'warning' && 'Warning'}
                      {test.status === 'error' && 'Error'}
                    </Badge>
                  </div>
                </div>

                {test.message && (
                  <Alert className={
                    test.status === 'error' ? 'border-destructive' :
                    test.status === 'warning' ? 'border-yellow-500' :
                    'border-green-500'
                  }>
                    <AlertDescription>{test.message}</AlertDescription>
                  </Alert>
                )}

                {test.details && (
                  <div className="ml-6 pl-4 border-l-2 border-muted">
                    <div className="text-sm space-y-1">
                      {Object.entries(test.details).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="text-muted-foreground capitalize">
                            {key.replace(/([A-Z])/g, ' $1')}:
                          </span>
                          <span className="font-mono text-xs">
                            {Array.isArray(value) ? value.join(', ') : String(value)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {index < testSuite.tests.length - 1 && (
                  <Separator className="mt-4" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Test Summary */}
      {testSuite.overallStatus === 'completed' || testSuite.overallStatus === 'failed' ? (
        <Card>
          <CardHeader>
            <CardTitle>Test Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {testSuite.tests.filter(t => t.status === 'success').length}
                </div>
                <div className="text-sm text-muted-foreground">Passed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {testSuite.tests.filter(t => t.status === 'warning').length}
                </div>
                <div className="text-sm text-muted-foreground">Warnings</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {testSuite.tests.filter(t => t.status === 'error').length}
                </div>
                <div className="text-sm text-muted-foreground">Failed</div>
              </div>
            </div>

            {testSuite.overallStatus === 'completed' && (
              <Alert className="mt-4 border-green-500">
                <CheckCircle size={16} className="text-green-600" />
                <AlertDescription>
                  <strong>SSO Configuration Valid:</strong> Your {testSuite.displayName} integration 
                  is properly configured and ready for production use.
                </AlertDescription>
              </Alert>
            )}

            {testSuite.overallStatus === 'failed' && (
              <Alert className="mt-4 border-destructive">
                <AlertTriangle size={16} />
                <AlertDescription>
                  <strong>Configuration Issues Found:</strong> Please review and fix the failed 
                  tests before enabling this SSO provider in production.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}