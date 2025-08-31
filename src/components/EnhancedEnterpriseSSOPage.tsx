import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Shield, 
  Users, 
  Settings, 
  CheckCircle, 
  AlertCircle,
  Clock,
  ArrowLeft,
  ExternalLink,
  Copy,
  Download
} from '@phosphor-icons/react'

interface SSOProvider {
  id: string
  name: string
  logo: string
  status: 'active' | 'inactive' | 'pending'
  users: number
  lastSync: string
  features: string[]
  securityLevel: 'standard' | 'enhanced' | 'enterprise'
  mfaSupport: boolean
  provisioningSupport: boolean
}

export const EnhancedEnterpriseSSOPage: React.FC = () => {
  const [selectedProvider, setSelectedProvider] = useState('azure-ad')
  const [currentView, setCurrentView] = useState('main')

  const ssoProviders: SSOProvider[] = [
    {
      id: 'azure-ad',
      name: 'Microsoft Azure AD',
      logo: '🔷',
      status: 'active',
      users: 1247,
      lastSync: '2 minutes ago',
      features: ['SAML 2.0', 'OAuth 2.0', 'SCIM', 'Conditional Access'],
      securityLevel: 'enterprise',
      mfaSupport: true,
      provisioningSupport: true
    },
    {
      id: 'google-workspace',
      name: 'Google Workspace',
      logo: '🔴',
      status: 'active',
      users: 892,
      lastSync: '5 minutes ago',
      features: ['SAML 2.0', 'OpenID Connect', 'Directory API'],
      securityLevel: 'enterprise',
      mfaSupport: true,
      provisioningSupport: true
    },
    {
      id: 'okta',
      name: 'Okta',
      logo: '🟢',
      status: 'pending',
      users: 0,
      lastSync: 'N/A',
      features: ['SAML 2.0', 'OAuth 2.0', 'SCIM', 'Adaptive Authentication'],
      securityLevel: 'enterprise',
      mfaSupport: true,
      provisioningSupport: true
    },
    {
      id: 'ping-identity',
      name: 'PingIdentity',
      logo: '🟡',
      status: 'pending',
      users: 0,
      lastSync: 'N/A',
      features: ['SAML 2.0', 'OpenID Connect', 'Risk-based Authentication'],
      securityLevel: 'enterprise',
      mfaSupport: true,
      provisioningSupport: false
    }
  ]

  const TroubleshootingView = () => {
    const provider = ssoProviders.find(p => p.id === selectedProvider)
    if (!provider) return null

    const commonIssues = {
      'azure-ad': [
        {
          issue: 'Missing API permissions or admin consent',
          symptoms: ['Login redirects to error page', 'Token validation fails', 'Access denied errors'],
          causes: [
            'Incorrect redirect URI configuration',
            'Missing API permissions or admin consent',
            'Conditional access policy blocking access',
            'Token expiration or incorrect validation'
          ],
          solutions: [
            'Verify redirect URI exactly matches: https://app.virtualbackroom.ai/auth/azure/callback',
            'Check API permissions include User.Read and Directory.Read.All with admin consent',
            'Review conditional access policies for conflicts',
            'Validate JWT token configuration and signing certificates'
          ]
        }
      ],
      'google-workspace': [
        {
          issue: 'SAML authentication failures',
          symptoms: ['Invalid SAML response errors', 'Certificate validation errors', 'Redirect loops'],
          causes: [
            'Incorrect ACS URL configuration',
            'Certificate mismatch or expiration',
            'Clock synchronization issues',
            'Invalid attribute mapping'
          ],
          solutions: [
            'Verify ACS URL: https://app.virtualbackroom.ai/auth/saml/google',
            'Download fresh certificate from Google Admin Console',
            'Check server time synchronization (NTP)',
            'Validate attribute mapping matches Google Directory schema'
          ]
        }
      ],
      'okta': [
        {
          issue: 'SCIM provisioning errors',
          symptoms: ['Users not created automatically', 'Profile updates not syncing', 'Deactivation not working'],
          causes: [
            'SCIM connector configuration issues',
            'API token expired or incorrect',
            'Attribute mapping conflicts',
            'Network connectivity problems'
          ],
          solutions: [
            'Verify SCIM Base URL: https://app.virtualbackroom.ai/scim/v2',
            'Regenerate and update API token in Okta',
            'Review attribute mappings in Okta provisioning settings',
            'Test network connectivity to VirtualBackroom.ai SCIM endpoint'
          ]
        }
      ],
      'ping-identity': [
        {
          issue: 'SAML configuration errors',
          symptoms: ['Invalid issuer errors', 'Signature validation failures', 'Attribute assertion errors'],
          causes: [
            'Certificate configuration issues',
            'Attribute mapping errors'
          ],
          solutions: [
            'Ensure Entity ID matches exactly: https://app.virtualbackroom.ai',
            'Verify SAML certificate is current and properly formatted',
            'Review attribute mapping configuration in both PingOne and VirtualBackroom.ai'
          ]
        }
      ]
    }

    const issues = commonIssues[selectedProvider as keyof typeof commonIssues] || []

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => setCurrentView('main')}>
            <ArrowLeft size={16} className="mr-2" />
            Back to Overview
          </Button>
          <h2 className="text-xl font-semibold">Troubleshooting - {provider.name}</h2>
        </div>

        <div className="space-y-6">
          {issues.map((issue, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <AlertCircle size={20} />
                  {issue.issue}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-2">SYMPTOMS</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    {issue.symptoms.map((symptom, i) => (
                      <li key={i}>{symptom}</li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-2">POSSIBLE CAUSES</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    {issue.causes.map((cause, i) => (
                      <li key={i}>{cause}</li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-2">SOLUTIONS</h4>
                  <ol className="list-decimal list-inside space-y-1 text-sm">
                    {issue.solutions.map((solution, i) => (
                      <li key={i} className="text-green-700">{solution}</li>
                    ))}
                  </ol>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {currentView === 'troubleshooting' && <TroubleshootingView />}
      
      {currentView === 'main' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Enterprise SSO Configuration</h1>
              <p className="text-muted-foreground">
                Manage single sign-on integrations for enterprise identity providers
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Button onClick={() => setCurrentView('troubleshooting')}>
                <AlertCircle size={16} className="mr-2" />
                Troubleshooting
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {ssoProviders.map((provider) => (
              <Card 
                key={provider.id} 
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedProvider === provider.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setSelectedProvider(provider.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-2xl">{provider.logo}</div>
                    <Badge 
                      variant={provider.status === 'active' ? 'default' : 
                              provider.status === 'pending' ? 'secondary' : 'destructive'}
                    >
                      {provider.status}
                    </Badge>
                  </div>
                  
                  <h3 className="font-semibold text-sm mb-2">{provider.name}</h3>
                  
                  <div className="space-y-2 text-xs text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Users:</span>
                      <span className="font-medium">{provider.users.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Last Sync:</span>
                      <span className="font-medium">{provider.lastSync}</span>
                    </div>
                  </div>
                  
                  <div className="mt-3 flex flex-wrap gap-1">
                    <Badge variant="outline" className="text-xs px-1 py-0">
                      {provider.securityLevel}
                    </Badge>
                    {provider.mfaSupport && (
                      <Badge variant="outline" className="text-xs px-1 py-0">MFA</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Provider Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {ssoProviders
                  .filter(p => p.id === selectedProvider)
                  .map(provider => (
                    <div key={provider.id} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium mb-2">Features</h4>
                          <div className="space-y-1">
                            {provider.features.map((feature, index) => (
                              <div key={index} className="flex items-center gap-2">
                                <CheckCircle size={16} className="text-green-600" />
                                <span className="text-sm">{feature}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-medium mb-2">Configuration</h4>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span>Security Level:</span>
                              <Badge variant="outline">{provider.securityLevel}</Badge>
                            </div>
                            <div className="flex justify-between">
                              <span>MFA Support:</span>
                              <span>{provider.mfaSupport ? '✓' : '✗'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Auto-Provisioning:</span>
                              <span>{provider.provisioningSupport ? '✓' : '✗'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
}