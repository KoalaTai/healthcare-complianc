import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { 
  Building2,
  Shield,
  Key,
  Users,
  Settings,
  CheckCircle,
  AlertTriangle,
  Clock,
  Globe,
  Lock,
  Smartphone,
  Server,
  Database,
  Network,
  Eye,
  UserCheck,
  Activity,
  BookOpen,
  ExternalLink,
  Copy,
  Download,
  FileText,
  Code,
  Terminal
} from '@phosphor-icons/react'

interface IntegrationGuide {
  id: string
  title: string
  provider: string
  complexity: 'basic' | 'intermediate' | 'advanced'
  estimatedTime: string
  prerequisites: string[]
  steps: {
    phase: string
    tasks: Array<{
      title: string
      description: string
      code?: string
      links?: Array<{ text: string; url: string }>
    }>
  }[]
}

export function SSOIntegrationDocumentation() {
  const [activeTab, setActiveTab] = useState('guides')
  const [selectedGuide, setSelectedGuide] = useState<string | null>(null)

  const integrationGuides: IntegrationGuide[] = [
    {
      id: 'azure-ad-saml',
      title: 'Microsoft Azure AD SAML Integration',
      provider: 'Microsoft Azure AD',
      complexity: 'intermediate',
      estimatedTime: '45 minutes',
      prerequisites: [
        'Azure AD Premium P1 or P2 license',
        'Global Administrator or Application Administrator role',
        'VirtualBackroom.ai Admin Portal access',
        'SSL certificate for production domain'
      ],
      steps: [
        {
          phase: 'Azure AD Configuration',
          tasks: [
            {
              title: 'Create Enterprise Application',
              description: 'Register VirtualBackroom.ai as an enterprise application in Azure AD',
              code: `# Azure CLI Method (Alternative)
az ad app create \\
  --display-name "VirtualBackroom.ai" \\
  --web-redirect-uris "https://app.virtualbackroom.ai/auth/azure/callback" \\
  --enable-id-token-issuance true`,
              links: [
                { text: 'Azure Portal App Registrations', url: 'https://portal.azure.com/#view/Microsoft_AAD_IAM/ActiveDirectoryMenuBlade/~/RegisteredApps' }
              ]
            },
            {
              title: 'Configure SAML SSO',
              description: 'Set up SAML 2.0 single sign-on configuration',
              code: `# SAML Configuration Values
Identifier (Entity ID): https://app.virtualbackroom.ai
Reply URL (ACS URL): https://app.virtualbackroom.ai/auth/saml/azure
Sign on URL: https://app.virtualbackroom.ai/auth/azure
Logout URL: https://app.virtualbackroom.ai/auth/logout`,
              links: [
                { text: 'SAML SSO Configuration Guide', url: 'https://docs.microsoft.com/en-us/azure/active-directory/saas-apps/tutorial-list' }
              ]
            }
          ]
        },
        {
          phase: 'Claims & Attributes',
          tasks: [
            {
              title: 'Configure User Claims',
              description: 'Set up user attribute claims for profile mapping',
              code: `# Required Claims Configuration
user.mail -> http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress
user.givenname -> http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname
user.surname -> http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname
user.department -> http://schemas.microsoft.com/ws/2008/06/identity/claims/department
user.jobtitle -> http://schemas.microsoft.com/identity/claims/jobtitle`
            },
            {
              title: 'Group Claims (Optional)',
              description: 'Configure group membership claims for role-based access',
              code: `# Group Claims Configuration
Source attribute: user.assignedroles
Name: http://schemas.microsoft.com/ws/2008/06/identity/claims/role
Namespace: VirtualBackroom
Restrict claim: Groups assigned to the application`
            }
          ]
        },
        {
          phase: 'VirtualBackroom.ai Configuration',
          tasks: [
            {
              title: 'SSO Provider Setup',
              description: 'Configure Azure AD as identity provider in VirtualBackroom.ai',
              code: `# Environment Variables
AZURE_TENANT_ID=your-tenant-id
AZURE_CLIENT_ID=your-application-id
AZURE_CLIENT_SECRET=your-client-secret
SAML_SSO_URL=https://login.microsoftonline.com/your-tenant-id/saml2
SAML_CERT_FINGERPRINT=your-certificate-fingerprint`
            },
            {
              title: 'Test & Validate',
              description: 'Perform end-to-end testing of the SSO integration',
              code: `# Test Checklist
☐ User can login via Azure AD
☐ User profile attributes are mapped correctly
☐ Group membership determines role assignment
☐ MFA is enforced based on conditional access policies
☐ User can logout successfully
☐ Session timeout works as configured`
            }
          ]
        }
      ]
    },
    {
      id: 'google-workspace-oauth',
      title: 'Google Workspace OAuth 2.0 Integration',
      provider: 'Google Workspace',
      complexity: 'basic',
      estimatedTime: '30 minutes',
      prerequisites: [
        'Google Workspace Admin privileges',
        'Google Cloud Console access',
        'VirtualBackroom.ai Admin Portal access'
      ],
      steps: [
        {
          phase: 'Google Cloud Setup',
          tasks: [
            {
              title: 'Create OAuth 2.0 Client',
              description: 'Set up OAuth credentials in Google Cloud Console',
              code: `# OAuth 2.0 Configuration
Application type: Web application
Name: VirtualBackroom.ai
Authorized redirect URIs:
  - https://app.virtualbackroom.ai/auth/google/callback
  - https://staging.virtualbackroom.ai/auth/google/callback
Authorized domains:
  - virtualbackroom.ai`,
              links: [
                { text: 'Google Cloud Console Credentials', url: 'https://console.cloud.google.com/apis/credentials' }
              ]
            },
            {
              title: 'Configure OAuth Consent Screen',
              description: 'Set up the OAuth consent screen for your users',
              code: `# Consent Screen Configuration
Application name: VirtualBackroom.ai
User support email: support@virtualbackroom.ai
Application logo: [Upload VirtualBackroom.ai logo]
Authorized domains: virtualbackroom.ai
Scopes:
  - openid
  - email
  - profile
  - https://www.googleapis.com/auth/admin.directory.user.readonly`
            }
          ]
        },
        {
          phase: 'Directory API Setup',
          tasks: [
            {
              title: 'Enable Admin SDK API',
              description: 'Enable APIs for user directory access',
              code: `# APIs to Enable
1. Admin SDK API
2. Google+ API (for profile information)
3. People API (for enhanced profile data)

# Enable via gcloud CLI
gcloud services enable admin.googleapis.com
gcloud services enable plus.googleapis.com
gcloud services enable people.googleapis.com`,
              links: [
                { text: 'Google Cloud API Library', url: 'https://console.cloud.google.com/apis/library' }
              ]
            },
            {
              title: 'Create Service Account',
              description: 'Set up service account for domain-wide delegation',
              code: `# Service Account Configuration
Name: virtualbackroom-directory-sync
Role: Service Account User
Domain-wide delegation: Enabled
Scopes:
  - https://www.googleapis.com/auth/admin.directory.user.readonly
  - https://www.googleapis.com/auth/admin.directory.group.readonly`
            }
          ]
        }
      ]
    },
    {
      id: 'okta-scim',
      title: 'Okta SCIM 2.0 Integration',
      provider: 'Okta',
      complexity: 'advanced',
      estimatedTime: '60 minutes',
      prerequisites: [
        'Okta Professional or Enterprise license',
        'Okta Super Administrator role',
        'VirtualBackroom.ai API access',
        'SCIM 2.0 endpoint configuration'
      ],
      steps: [
        {
          phase: 'Okta Application Setup',
          tasks: [
            {
              title: 'Create SAML Application',
              description: 'Set up VirtualBackroom.ai as a SAML 2.0 application',
              code: `# SAML Configuration
Single sign on URL: https://app.virtualbackroom.ai/auth/saml/okta
Audience URI: https://app.virtualbackroom.ai
Default RelayState: (leave blank)
Name ID format: EmailAddress
Application username: Email

# Attribute Statements
firstName: user.firstName
lastName: user.lastName
email: user.email
department: user.department
title: user.title`
            },
            {
              title: 'Configure SCIM Provisioning',
              description: 'Set up automated user lifecycle management',
              code: `# SCIM Endpoint Configuration
SCIM connector base URL: https://api.virtualbackroom.ai/scim/v2
Unique identifier field: email
Authentication: HTTP Header
Authorization: Bearer {SCIM_API_TOKEN}

# Supported Actions
☐ Import New Users and Profile Updates
☐ Push New Users
☐ Push Profile Updates  
☐ Push User Deactivation`
            }
          ]
        },
        {
          phase: 'VirtualBackroom.ai SCIM API',
          tasks: [
            {
              title: 'Implement SCIM Endpoints',
              description: 'Required API endpoints for SCIM 2.0 compliance',
              code: `# Required SCIM Endpoints
GET /scim/v2/Users - List users
GET /scim/v2/Users/{id} - Get user
POST /scim/v2/Users - Create user
PUT /scim/v2/Users/{id} - Update user
PATCH /scim/v2/Users/{id} - Partial update user
DELETE /scim/v2/Users/{id} - Deactivate user

GET /scim/v2/Groups - List groups
GET /scim/v2/Groups/{id} - Get group
POST /scim/v2/Groups - Create group`,
              links: [
                { text: 'SCIM 2.0 RFC Specification', url: 'https://tools.ietf.org/html/rfc7644' }
              ]
            }
          ]
        }
      ]
    }
  ]

  const GuideOverview = () => (
    <div className="space-y-6">
      {/* Integration Guides Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {integrationGuides.map((guide) => (
          <Card 
            key={guide.id} 
            className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
              selectedGuide === guide.id ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => setSelectedGuide(guide.id)}
          >
            <CardContent className="p-6 space-y-4">
              <div className="text-center space-y-2">
                <h4 className="font-semibold">{guide.title}</h4>
                <p className="text-sm text-muted-foreground">{guide.provider}</p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span>Complexity:</span>
                  <Badge variant={
                    guide.complexity === 'basic' ? 'default' :
                    guide.complexity === 'intermediate' ? 'secondary' :
                    'destructive'
                  }>
                    {guide.complexity}
                  </Badge>
                </div>
                <div className="flex justify-between text-xs">
                  <span>Est. Time:</span>
                  <span className="font-medium">{guide.estimatedTime}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>Steps:</span>
                  <span className="font-medium">{guide.steps.reduce((acc, phase) => acc + phase.tasks.length, 0)}</span>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <h6 className="text-xs font-medium">Prerequisites</h6>
                <div className="space-y-1">
                  {guide.prerequisites.slice(0, 2).map((prereq, index) => (
                    <div key={index} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <CheckCircle size={10} className="text-green-600" />
                      {prereq}
                    </div>
                  ))}
                  {guide.prerequisites.length > 2 && (
                    <div className="text-xs text-muted-foreground">
                      +{guide.prerequisites.length - 2} more...
                    </div>
                  )}
                </div>
              </div>

              <Button variant="outline" className="w-full text-xs">
                <BookOpen size={12} className="mr-2" />
                View Integration Guide
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Start */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings size={20} />
            Quick Start Checklist
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h5 className="font-medium text-sm">Before You Begin</h5>
              <div className="space-y-2">
                {[
                  'Verify admin access to your identity provider',
                  'Confirm VirtualBackroom.ai admin portal access',
                  'Review your organization\'s security policies',
                  'Plan user role assignments and groups',
                  'Schedule maintenance window for testing'
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <CheckCircle size={14} className="text-green-600" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <h5 className="font-medium text-sm">Post-Configuration</h5>
              <div className="space-y-2">
                {[
                  'Test SSO flow with pilot user group',
                  'Verify user provisioning and role assignment',
                  'Validate MFA enforcement',
                  'Test logout and session management',
                  'Train users on new authentication flow'
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <Clock size={14} className="text-blue-600" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const DetailedGuideView = () => {
    const guide = integrationGuides.find(g => g.id === selectedGuide)
    if (!guide) return null

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => setSelectedGuide(null)}>
            ← Back to Integration Guides
          </Button>
          <div>
            <h2 className="text-2xl font-bold">{guide.title}</h2>
            <p className="text-muted-foreground text-sm">
              Detailed implementation guide for {guide.provider} SSO integration
            </p>
          </div>
        </div>

        {/* Guide Info */}
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-sm text-muted-foreground">Complexity</div>
                <Badge variant={
                  guide.complexity === 'basic' ? 'default' :
                  guide.complexity === 'intermediate' ? 'secondary' :
                  'destructive'
                }>
                  {guide.complexity}
                </Badge>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Estimated Time</div>
                <div className="font-medium">{guide.estimatedTime}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Total Steps</div>
                <div className="font-medium">{guide.steps.reduce((acc, phase) => acc + phase.tasks.length, 0)}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Prerequisites</div>
                <div className="font-medium">{guide.prerequisites.length}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Prerequisites */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle size={20} />
              Prerequisites
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {guide.prerequisites.map((prereq, index) => (
                <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                  <CheckCircle size={16} className="text-green-600" />
                  <span className="text-sm">{prereq}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Implementation Steps */}
        <div className="space-y-6">
          {guide.steps.map((phase, phaseIndex) => (
            <Card key={phaseIndex}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                    {phaseIndex + 1}
                  </div>
                  {phase.phase}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {phase.tasks.map((task, taskIndex) => (
                  <div key={taskIndex} className="space-y-4">
                    <div>
                      <h5 className="font-medium text-sm mb-2">{task.title}</h5>
                      <p className="text-sm text-muted-foreground">{task.description}</p>
                    </div>

                    {task.code && (
                      <Card className="bg-gray-950 text-gray-100">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Terminal size={14} />
                              <span className="text-xs font-medium">Configuration</span>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-gray-400 hover:text-gray-200"
                              onClick={() => navigator.clipboard.writeText(task.code!)}
                            >
                              <Copy size={12} />
                            </Button>
                          </div>
                          <pre className="text-xs font-mono overflow-x-auto">
                            <code>{task.code}</code>
                          </pre>
                        </CardContent>
                      </Card>
                    )}

                    {task.links && (
                      <div className="space-y-2">
                        <h6 className="text-xs font-medium">Helpful Links</h6>
                        <div className="flex flex-wrap gap-2">
                          {task.links.map((link, linkIndex) => (
                            <Button key={linkIndex} variant="ghost" size="sm" className="text-xs">
                              <ExternalLink size={10} className="mr-1" />
                              {link.text}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}

                    {taskIndex < phase.tasks.length - 1 && <Separator />}
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Completion Checklist */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle size={20} />
              Integration Completion Checklist
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <h5 className="font-medium text-sm">Configuration Validation</h5>
                {[
                  'Identity provider application created',
                  'Redirect URIs configured correctly',
                  'Required permissions/scopes granted',
                  'Certificates and secrets configured',
                  'User attribute mapping defined'
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <div className="w-4 h-4 border rounded border-green-600 bg-green-50 flex items-center justify-center">
                      <CheckCircle size={10} className="text-green-600" />
                    </div>
                    {item}
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <h5 className="font-medium text-sm">Functional Testing</h5>
                {[
                  'SSO authentication flow tested',
                  'User provisioning verified',
                  'Role assignment working',
                  'MFA enforcement validated',
                  'Logout process confirmed'
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <div className="w-4 h-4 border rounded border-green-600 bg-green-50 flex items-center justify-center">
                      <CheckCircle size={10} className="text-green-600" />
                    </div>
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const APIReferenceTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code size={20} />
            VirtualBackroom.ai SSO API Reference
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* SAML Endpoints */}
          <div>
            <h4 className="font-medium mb-3">SAML 2.0 Endpoints</h4>
            <div className="space-y-3">
              {[
                {
                  method: 'POST',
                  endpoint: '/auth/saml/{provider}',
                  description: 'SAML SSO initiation endpoint',
                  params: 'provider: azure | google | okta | ping'
                },
                {
                  method: 'POST',
                  endpoint: '/auth/saml/{provider}/callback',
                  description: 'SAML assertion consumer service (ACS)',
                  params: 'SAMLResponse, RelayState'
                },
                {
                  method: 'GET',
                  endpoint: '/auth/saml/{provider}/metadata',
                  description: 'Service provider metadata',
                  params: 'None'
                }
              ].map((endpoint, index) => (
                <Card key={index} className="bg-muted/50">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs font-mono">
                            {endpoint.method}
                          </Badge>
                          <code className="text-sm">{endpoint.endpoint}</code>
                        </div>
                        <p className="text-xs text-muted-foreground">{endpoint.description}</p>
                        {endpoint.params && (
                          <p className="text-xs text-muted-foreground">
                            <span className="font-medium">Parameters:</span> {endpoint.params}
                          </p>
                        )}
                      </div>
                      <Button variant="ghost" size="sm">
                        <Copy size={12} />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <Separator />

          {/* SCIM Endpoints */}
          <div>
            <h4 className="font-medium mb-3">SCIM 2.0 Endpoints</h4>
            <div className="space-y-3">
              {[
                {
                  method: 'GET',
                  endpoint: '/scim/v2/Users',
                  description: 'List all users in organization',
                  params: 'startIndex, count, filter'
                },
                {
                  method: 'POST',
                  endpoint: '/scim/v2/Users',
                  description: 'Create new user',
                  params: 'User schema JSON payload'
                },
                {
                  method: 'GET',
                  endpoint: '/scim/v2/Users/{id}',
                  description: 'Get specific user details',
                  params: 'id: User ID'
                },
                {
                  method: 'PUT',
                  endpoint: '/scim/v2/Users/{id}',
                  description: 'Update user (full replacement)',
                  params: 'id: User ID, User schema JSON'
                },
                {
                  method: 'PATCH',
                  endpoint: '/scim/v2/Users/{id}',
                  description: 'Partial user update',
                  params: 'id: User ID, Patch operations JSON'
                },
                {
                  method: 'DELETE',
                  endpoint: '/scim/v2/Users/{id}',
                  description: 'Deactivate user',
                  params: 'id: User ID'
                }
              ].map((endpoint, index) => (
                <Card key={index} className="bg-muted/50">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant={
                            endpoint.method === 'GET' ? 'default' :
                            endpoint.method === 'POST' ? 'secondary' :
                            endpoint.method === 'PUT' ? 'outline' :
                            endpoint.method === 'PATCH' ? 'outline' :
                            'destructive'
                          } className="text-xs font-mono">
                            {endpoint.method}
                          </Badge>
                          <code className="text-sm">{endpoint.endpoint}</code>
                        </div>
                        <p className="text-xs text-muted-foreground">{endpoint.description}</p>
                        <p className="text-xs text-muted-foreground">
                          <span className="font-medium">Parameters:</span> {endpoint.params}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Copy size={12} />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const SecurityBestPracticesTab = () => (
    <div className="space-y-6">
      {/* Security Checklist */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield size={20} />
            Enterprise SSO Security Best Practices
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium">Authentication Security</h4>
              <div className="space-y-3">
                {[
                  { practice: 'Enforce Multi-Factor Authentication', status: 'implemented', critical: true },
                  { practice: 'Use certificate-based authentication for SAML', status: 'implemented', critical: true },
                  { practice: 'Implement session timeout policies', status: 'implemented', critical: false },
                  { practice: 'Enable conditional access based on risk', status: 'implemented', critical: false },
                  { practice: 'Regular rotation of client secrets', status: 'scheduled', critical: true }
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      {item.critical && <AlertTriangle size={14} className="text-red-600" />}
                      <span className="text-sm">{item.practice}</span>
                    </div>
                    <Badge variant={
                      item.status === 'implemented' ? 'default' :
                      item.status === 'scheduled' ? 'secondary' :
                      'destructive'
                    } className="text-xs">
                      {item.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Data Protection</h4>
              <div className="space-y-3">
                {[
                  { practice: 'Encrypt all data in transit (TLS 1.2+)', status: 'implemented', critical: true },
                  { practice: 'Encrypt sensitive data at rest', status: 'implemented', critical: true },
                  { practice: 'Implement proper audit logging', status: 'implemented', critical: true },
                  { practice: 'Regular security assessments', status: 'scheduled', critical: false },
                  { practice: 'Zero-trust network architecture', status: 'implemented', critical: false }
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      {item.critical && <AlertTriangle size={14} className="text-red-600" />}
                      <span className="text-sm">{item.practice}</span>
                    </div>
                    <Badge variant={
                      item.status === 'implemented' ? 'default' :
                      item.status === 'scheduled' ? 'secondary' :
                      'destructive'
                    } className="text-xs">
                      {item.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Compliance Mapping */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText size={20} />
            Regulatory Compliance Mapping
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                standard: '21 CFR Part 11',
                requirements: ['Electronic signatures', 'Audit trails', 'System access controls'],
                implementation: 'SAML authentication + audit logging + role-based access'
              },
              {
                standard: 'HIPAA Security Rule',
                requirements: ['Access control', 'Audit controls', 'Integrity controls'],
                implementation: 'SSO with MFA + comprehensive audit trail + data encryption'
              },
              {
                standard: 'ISO 27001',
                requirements: ['Access management', 'Incident management', 'Risk assessment'],
                implementation: 'Identity federation + security monitoring + risk-based policies'
              },
              {
                standard: 'SOC 2',
                requirements: ['Logical access controls', 'System monitoring', 'Change management'],
                implementation: 'SSO integration + real-time monitoring + controlled deployments'
              }
            ].map((compliance, index) => (
              <Card key={index}>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h5 className="font-medium text-sm">{compliance.standard}</h5>
                    <Badge variant="default" className="text-xs bg-green-600 text-white">
                      Compliant
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="font-medium">Requirements:</span>
                      <div className="mt-1 space-y-1">
                        {compliance.requirements.map((req, i) => (
                          <div key={i} className="flex items-center gap-2 text-muted-foreground">
                            <div className="w-1 h-1 rounded-full bg-blue-500" />
                            {req}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium">Implementation:</span>
                      <div className="mt-1 text-muted-foreground">{compliance.implementation}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  if (selectedGuide) {
    return <DetailedGuideView />
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <BookOpen size={32} />
            SSO Integration Documentation
          </h1>
          <p className="text-muted-foreground mt-2">
            Comprehensive guides for enterprise SSO integration with Microsoft, Google, and Okta
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download size={16} className="mr-2" />
            Download PDF Guide
          </Button>
          <Button variant="outline">
            <Code size={16} className="mr-2" />
            API Reference
          </Button>
          <Button>
            <Settings size={16} className="mr-2" />
            Configuration Wizard
          </Button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="guides">Integration Guides</TabsTrigger>
          <TabsTrigger value="api">API Reference</TabsTrigger>
          <TabsTrigger value="security">Security Best Practices</TabsTrigger>
        </TabsList>

        <TabsContent value="guides" className="mt-6">
          <GuideOverview />
        </TabsContent>

        <TabsContent value="api" className="mt-6">
          <APIReferenceTab />
        </TabsContent>

        <TabsContent value="security" className="mt-6">
          <SecurityBestPracticesTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}