import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Database,
  Shield,
  Globe,
  Cpu,
  Activity,
  Lock,
  ExternalLink,
  ChevronRight,
  ArrowRight,
  Settings
} from '@phosphor-icons/react'

export function ArchitecturePage() {
  const architectureComponents = [
    {
      category: 'Frontend',
      components: [
        { name: 'React Application', status: 'active', connection: 'API Gateway' },
        { name: 'Authentication UI', status: 'active', connection: 'AWS Cognito' },
        { name: 'Document Upload', status: 'active', connection: 'S3 Pre-signed URLs' }
      ]
    },
    {
      category: 'API Layer',
      components: [
        { name: 'AWS API Gateway', status: 'active', connection: 'ECS Fargate' },
        { name: 'FastAPI Backend', status: 'active', connection: 'Database & Celery' },
        { name: 'Authentication Middleware', status: 'active', connection: 'AWS Cognito' }
      ]
    },
    {
      category: 'Processing',
      components: [
        { name: 'Celery Workers', status: 'active', connection: 'Redis & AI Models' },
        { name: 'AI Router Service', status: 'active', connection: 'Multiple AI Providers' },
        { name: 'Regulatory Knowledge Service', status: 'active', connection: 'Standards Database' }
      ]
    },
    {
      category: 'Data Layer',
      components: [
        { name: 'PostgreSQL RDS', status: 'active', connection: 'Multi-tenant Schema' },
        { name: 'S3 Document Storage', status: 'active', connection: 'KMS Encryption' },
        { name: 'Redis Cache', status: 'active', connection: 'Session & Job Queue' }
      ]
    },
    {
      category: 'Security',
      components: [
        { name: 'AWS WAF', status: 'active', connection: 'DDoS Protection' },
        { name: 'KMS Encryption', status: 'active', connection: 'Data at Rest' },
        { name: 'VPC Security Groups', status: 'active', connection: 'Network Isolation' }
      ]
    }
  ]

  const integrations = [
    {
      name: 'Microsoft Azure AD / Entra ID',
      type: 'SSO Provider',
      status: 'integrated',
      users: '1,247 users',
      protocol: 'SAML 2.0 / OIDC'
    },
    {
      name: 'Google Workspace',
      type: 'SSO Provider', 
      status: 'integrated',
      users: '89 users',
      protocol: 'OAuth 2.0 / OIDC'
    },
    {
      name: 'Okta Enterprise',
      type: 'SSO Provider',
      status: 'configured',
      users: '0 users',
      protocol: 'SAML 2.0'
    },
    {
      name: 'OpenAI GPT Models',
      type: 'AI Provider',
      status: 'active',
      users: 'GPT-5 Turbo',
      protocol: 'REST API'
    },
    {
      name: 'Anthropic Claude',
      type: 'AI Provider',
      status: 'active',
      users: 'Claude 4 Opus',
      protocol: 'REST API'
    },
    {
      name: 'Google Gemini',
      type: 'AI Provider',
      status: 'active',
      users: 'Gemini 2.5 Pro',
      protocol: 'REST API'
    }
  ]

  const systemLinks = [
    {
      title: 'Infrastructure Monitoring',
      description: 'Real-time system health and performance metrics',
      icon: Activity,
      action: 'View Monitoring Dashboard',
      color: 'text-blue-600'
    },
    {
      title: 'Security Compliance',
      description: 'Audit trails, security policies, and compliance status',
      icon: Lock,
      action: 'Access Security Center',
      color: 'text-green-600'
    },
    {
      title: 'Global Regulations',
      description: 'Regulatory standards library and compliance mapping',
      icon: Globe,
      action: 'Browse Regulations',
      color: 'text-purple-600'
    },
    {
      title: 'AI Model Management',
      description: 'Model performance, benchmarks, and configuration',
      icon: Cpu,
      action: 'Manage AI Models',
      color: 'text-amber-600'
    },
    {
      title: 'Database Management',
      description: 'Multi-tenant schema, audit trails, and data integrity',
      icon: Database,
      action: 'Database Console',
      color: 'text-red-600'
    },
    {
      title: 'System Configuration',
      description: 'Environment settings, feature flags, and deployment',
      icon: Settings,
      action: 'System Settings',
      color: 'text-gray-600'
    }
  ]

  return (
    <div className="space-y-6">
      {/* System Architecture Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database size={20} />
            System Architecture Components
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {architectureComponents.map((category, index) => (
              <div key={index} className="space-y-3">
                <h3 className="font-medium text-foreground border-l-4 border-primary pl-3">
                  {category.category}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 ml-7">
                  {category.components.map((component, compIndex) => (
                    <div key={compIndex} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium text-sm">{component.name}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <ArrowRight size={12} />
                          {component.connection}
                        </div>
                      </div>
                      <Badge variant="default" className="text-xs bg-green-600 text-white">
                        {component.status}
                      </Badge>
                    </div>
                  ))}
                </div>
                {index < architectureComponents.length - 1 && <Separator />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* External Integrations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield size={20} />
            External System Integrations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {integrations.map((integration, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium">{integration.name}</h4>
                  <Badge 
                    variant={integration.status === 'active' || integration.status === 'integrated' ? 'default' : 'secondary'}
                    className={integration.status === 'active' || integration.status === 'integrated' ? 'bg-green-600 text-white' : ''}
                  >
                    {integration.status}
                  </Badge>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type:</span>
                    <span>{integration.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Details:</span>
                    <span>{integration.users}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Protocol:</span>
                    <span>{integration.protocol}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* System Access Links */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ExternalLink size={20} />
            System Management & Access
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {systemLinks.map((link, index) => {
              const Icon = link.icon
              return (
                <Button
                  key={index}
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-start gap-3 hover:shadow-md transition-all"
                  onClick={() => {
                    // In a real application, these would navigate to the actual pages
                    if (link.title === 'Global Regulations') {
                      // This would be handled by the parent component
                      console.log('Navigate to regulations page')
                    } else if (link.title === 'AI Model Management') {
                      console.log('Navigate to AI models page')
                    } else if (link.title === 'Security Compliance') {
                      console.log('Navigate to audit trail page')
                    } else if (link.title === 'Infrastructure Monitoring') {
                      console.log('Navigate to infrastructure page')
                    } else {
                      console.log(`Navigating to ${link.title}`)
                    }
                  }}
                >
                  <div className="flex items-center gap-3 w-full">
                    <Icon size={24} className={link.color} />
                    <div className="flex-1 text-left">
                      <div className="font-medium">{link.title}</div>
                    </div>
                    <ChevronRight size={16} className="text-muted-foreground" />
                  </div>
                  <p className="text-xs text-muted-foreground text-left w-full">
                    {link.description}
                  </p>
                  <div className="text-xs text-primary font-medium w-full text-left">
                    {link.action}
                  </div>
                </Button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Data Flow Diagram */}
      <Card>
        <CardHeader>
          <CardTitle>Data Flow Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted p-6 rounded-lg">
            <div className="flex flex-col space-y-4 text-sm">
              <div className="flex items-center gap-3">
                <Badge>1</Badge>
                <span>User Authentication via SSO (Azure AD/Google/Okta)</span>
                <ArrowRight size={16} />
                <span>AWS Cognito Token Validation</span>
              </div>
              <div className="flex items-center gap-3">
                <Badge>2</Badge>
                <span>Document Upload to S3</span>
                <ArrowRight size={16} />
                <span>Pre-signed URL Generation</span>
              </div>
              <div className="flex items-center gap-3">
                <Badge>3</Badge>
                <span>Analysis Job Creation</span>
                <ArrowRight size={16} />
                <span>Celery Worker Queue</span>
              </div>
              <div className="flex items-center gap-3">
                <Badge>4</Badge>
                <span>AI Model Processing</span>
                <ArrowRight size={16} />
                <span>Regulatory Knowledge Service</span>
              </div>
              <div className="flex items-center gap-3">
                <Badge>5</Badge>
                <span>Results Storage</span>
                <ArrowRight size={16} />
                <span>Multi-tenant Database with Audit Trail</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}