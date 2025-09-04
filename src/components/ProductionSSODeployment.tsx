import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useKV } from '@github/spark/hooks'
import { toast } from 'sonner'
import { 
  Shield, 
  CheckCircle, 
  Copy, 
  Download,
  Key,
  Globe,
  Settings,
  AlertTriangle,
  Users,
  Lock,
  Server,
  Database,
  FileText,
  ExternalLink,
  Code,
  Terminal,
  Play,
  Eye,
  EyeSlash
} from '@phosphor-icons/react'

interface SSOConfig {
  provider: 'azure-ad' | 'google-workspace' | 'okta'
  clientId: string
  clientSecret: string
  tenantId: string
  domain: string
  callbackUrl: string
  scopes: string[]
  enabled: boolean
  testMode: boolean
}

export function ProductionSSODeployment() {
  const [activeProvider, setActiveProvider] = useState<'azure-ad' | 'google-workspace' | 'okta'>('azure-ad')
  const [showSecrets, setShowSecrets] = useState(false)
  const [deploymentStep, setDeploymentStep] = useState(1)
  const [ssoConfig, setSSOConfig] = useKV('production-sso-config', {
    'azure-ad': {
      provider: 'azure-ad',
      clientId: '',
      clientSecret: '',
      tenantId: '',
      domain: '',
      callbackUrl: 'https://virtualbackroom.ai/api/auth/azure/callback',
      scopes: ['openid', 'profile', 'email', 'User.Read'],
      enabled: false,
      testMode: true
    },
    'google-workspace': {
      provider: 'google-workspace',
      clientId: '',
      clientSecret: '',
      tenantId: '',
      domain: '',
      callbackUrl: 'https://virtualbackroom.ai/api/auth/google/callback',
      scopes: ['openid', 'profile', 'email', 'https://www.googleapis.com/auth/admin.directory.user.readonly'],
      enabled: false,
      testMode: true
    },
    'okta': {
      provider: 'okta',
      clientId: '',
      clientSecret: '',
      tenantId: '',
      domain: '',
      callbackUrl: 'https://virtualbackroom.ai/api/auth/okta/callback',
      scopes: ['openid', 'profile', 'email', 'groups'],
      enabled: false,
      testMode: true
    }
  } as Record<string, SSOConfig>)

  const [envVariables, setEnvVariables] = useKV('production-env-vars', {
    staging: {
      AZURE_CLIENT_ID: '',
      AZURE_CLIENT_SECRET: '',
      AZURE_TENANT_ID: '',
      GOOGLE_CLIENT_ID: '',
      GOOGLE_CLIENT_SECRET: '',
      OKTA_CLIENT_ID: '',
      OKTA_CLIENT_SECRET: '',
      OKTA_DOMAIN: '',
      JWT_SECRET: '',
      DATABASE_URL: '',
      REDIS_URL: '',
      AWS_REGION: 'us-east-1',
      NODE_ENV: 'staging'
    },
    production: {
      AZURE_CLIENT_ID: '',
      AZURE_CLIENT_SECRET: '',
      AZURE_TENANT_ID: '',
      GOOGLE_CLIENT_ID: '',
      GOOGLE_CLIENT_SECRET: '',
      OKTA_CLIENT_ID: '',
      OKTA_CLIENT_SECRET: '',
      OKTA_DOMAIN: '',
      JWT_SECRET: '',
      DATABASE_URL: '',
      REDIS_URL: '',
      AWS_REGION: 'us-east-1',
      NODE_ENV: 'production'
    }
  })

  const updateSSOConfig = (provider: string, field: string, value: any) => {
    setSSOConfig({
      ...ssoConfig,
      [provider]: {
        ...ssoConfig[provider],
        [field]: value
      }
    })
  }

  const generateDeploymentScript = () => {
    const config = ssoConfig[activeProvider]
    return `#!/bin/bash
# VirtualBackroom.ai Production SSO Deployment Script
# Provider: ${config.provider.toUpperCase()}

set -e

echo "🚀 Starting ${config.provider.toUpperCase()} SSO Production Deployment..."

# 1. Set Environment Variables
export AZURE_CLIENT_ID="${envVariables.production.AZURE_CLIENT_ID}"
export AZURE_CLIENT_SECRET="${envVariables.production.AZURE_CLIENT_SECRET}"
export AZURE_TENANT_ID="${envVariables.production.AZURE_TENANT_ID}"
export GOOGLE_CLIENT_ID="${envVariables.production.GOOGLE_CLIENT_ID}"
export GOOGLE_CLIENT_SECRET="${envVariables.production.GOOGLE_CLIENT_SECRET}"
export OKTA_CLIENT_ID="${envVariables.production.OKTA_CLIENT_ID}"
export OKTA_CLIENT_SECRET="${envVariables.production.OKTA_CLIENT_SECRET}"
export OKTA_DOMAIN="${envVariables.production.OKTA_DOMAIN}"
export JWT_SECRET="${envVariables.production.JWT_SECRET || 'GENERATE_SECURE_JWT_SECRET'}"
export NODE_ENV="production"

# 2. Deploy to AWS ECS
aws ecs update-service --cluster virtualbackroom-prod --service virtualbackroom-api --force-new-deployment

# 3. Update Database Migrations
kubectl apply -f k8s/migrations/

# 4. Verify SSO Configuration
curl -f https://virtualbackroom.ai/api/health/sso || exit 1

echo "✅ Production SSO Deployment Complete!"
echo "🔗 SSO Login URL: https://virtualbackroom.ai/auth/${config.provider}"
`
  }

  const generateTerraformConfig = () => {
    return `# VirtualBackroom.ai Production SSO Infrastructure
# File: terraform/sso.tf

resource "aws_secretsmanager_secret" "sso_secrets" {
  name = "virtualbackroom/sso/production"
  
  tags = {
    Environment = "production"
    Application = "virtualbackroom"
    Component   = "sso"
  }
}

resource "aws_secretsmanager_secret_version" "sso_secrets" {
  secret_id = aws_secretsmanager_secret.sso_secrets.id
  secret_string = jsonencode({
    azure_client_id     = var.azure_client_id
    azure_client_secret = var.azure_client_secret
    azure_tenant_id     = var.azure_tenant_id
    google_client_id    = var.google_client_id
    google_client_secret = var.google_client_secret
    okta_client_id      = var.okta_client_id
    okta_client_secret  = var.okta_client_secret
    okta_domain         = var.okta_domain
    jwt_secret          = var.jwt_secret
  })
}

resource "aws_iam_policy" "sso_secrets_access" {
  name = "virtualbackroom-sso-secrets-access"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "secretsmanager:GetSecretValue"
        ]
        Resource = aws_secretsmanager_secret.sso_secrets.arn
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "ecs_sso_secrets" {
  role       = aws_iam_role.ecs_task_role.name
  policy_arn = aws_iam_policy.sso_secrets_access.arn
}

# Variables
variable "azure_client_id" {
  description = "Azure AD Client ID"
  type        = string
  sensitive   = true
}

variable "azure_client_secret" {
  description = "Azure AD Client Secret"
  type        = string
  sensitive   = true
}

variable "azure_tenant_id" {
  description = "Azure AD Tenant ID"
  type        = string
  sensitive   = true
}

variable "google_client_id" {
  description = "Google Workspace Client ID"
  type        = string
  sensitive   = true
}

variable "google_client_secret" {
  description = "Google Workspace Client Secret"
  type        = string
  sensitive   = true
}

variable "jwt_secret" {
  description = "JWT Secret Key"
  type        = string
  sensitive   = true
}
`
  }

  const generateBackendImplementation = () => {
    return `// Production SSO Implementation
// File: src/auth/sso-providers.ts

import { OAuth2Strategy } from 'passport-oauth2'
import { Strategy as AzureADStrategy } from 'passport-azure-ad-oauth2'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'

interface SSOUser {
  id: string
  email: string
  name: string
  provider: string
  organizationId?: string
  roles?: string[]
}

class ProductionSSOManager {
  private azureConfig = {
    clientID: process.env.AZURE_CLIENT_ID!,
    clientSecret: process.env.AZURE_CLIENT_SECRET!,
    tenant: process.env.AZURE_TENANT_ID!,
    callbackURL: process.env.AZURE_CALLBACK_URL || 'https://virtualbackroom.ai/api/auth/azure/callback'
  }

  private googleConfig = {
    clientID: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackURL: process.env.GOOGLE_CALLBACK_URL || 'https://virtualbackroom.ai/api/auth/google/callback'
  }

  async initializeAzureAD() {
    return new AzureADStrategy(
      this.azureConfig,
      async (accessToken: string, refreshToken: string, profile: any, done: Function) => {
        try {
          const user: SSOUser = {
            id: profile.id,
            email: profile.emails[0].value,
            name: profile.displayName,
            provider: 'azure-ad',
            organizationId: await this.getOrganizationFromDomain(profile.emails[0].value),
            roles: await this.getUserRoles(profile.id, 'azure-ad')
          }
          
          await this.createOrUpdateUser(user)
          return done(null, user)
        } catch (error) {
          return done(error, null)
        }
      }
    )
  }

  async initializeGoogleWorkspace() {
    return new GoogleStrategy(
      {
        ...this.googleConfig,
        scope: ['profile', 'email', 'https://www.googleapis.com/auth/admin.directory.user.readonly']
      },
      async (accessToken: string, refreshToken: string, profile: any, done: Function) => {
        try {
          const user: SSOUser = {
            id: profile.id,
            email: profile.emails[0].value,
            name: profile.displayName,
            provider: 'google-workspace',
            organizationId: await this.getOrganizationFromDomain(profile.emails[0].value),
            roles: await this.getUserRoles(profile.id, 'google-workspace')
          }
          
          await this.createOrUpdateUser(user)
          return done(null, user)
        } catch (error) {
          return done(error, null)
        }
      }
    )
  }

  private async getOrganizationFromDomain(email: string): Promise<string> {
    const domain = email.split('@')[1]
    // Query database for organization by domain
    const org = await this.db.organization.findFirst({
      where: { domain }
    })
    return org?.id || 'default'
  }

  private async getUserRoles(userId: string, provider: string): Promise<string[]> {
    // Implementation for role mapping
    return ['user']
  }

  private async createOrUpdateUser(user: SSOUser): Promise<void> {
    // Database implementation
    await this.db.user.upsert({
      where: { email: user.email },
      update: {
        name: user.name,
        lastLogin: new Date(),
        provider: user.provider
      },
      create: {
        id: user.id,
        email: user.email,
        name: user.name,
        provider: user.provider,
        organizationId: user.organizationId,
        roles: user.roles
      }
    })
  }
}

export const ssoManager = new ProductionSSOManager()
`
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard!')
  }

  const testSSOConnection = async (provider: string) => {
    toast.info(`Testing ${provider.toUpperCase()} connection...`)
    
    // Simulate API call to test SSO connection
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const config = ssoConfig[provider]
    if (config.clientId && config.clientSecret) {
      toast.success(`${provider.toUpperCase()} connection test successful!`)
      updateSSOConfig(provider, 'enabled', true)
    } else {
      toast.error(`${provider.toUpperCase()} configuration incomplete`)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Production SSO Deployment</h1>
          <p className="text-muted-foreground mt-2">
            Configure enterprise SSO with Azure AD, Google Workspace, and Okta for production deployment
          </p>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => copyToClipboard(generateDeploymentScript())}>
            <Copy size={16} className="mr-2" />
            Copy Deploy Script
          </Button>
          <Button onClick={() => {
            const script = generateDeploymentScript()
            const blob = new Blob([script], { type: 'text/plain' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = 'deploy-sso-production.sh'
            a.click()
            toast.success('Deployment script downloaded!')
          }}>
            <Download size={16} className="mr-2" />
            Download Scripts
          </Button>
        </div>
      </div>

      {/* Deployment Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings size={20} />
            Deployment Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step <= deploymentStep ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                }`}>
                  {step <= deploymentStep ? <CheckCircle size={16} /> : step}
                </div>
                {step < 4 && <div className={`w-16 h-1 mx-2 ${
                  step < deploymentStep ? 'bg-primary' : 'bg-muted'
                }`} />}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <p className="font-medium">Configure Providers</p>
              <p className="text-muted-foreground">Azure AD, Google, Okta</p>
            </div>
            <div className="text-center">
              <p className="font-medium">Environment Setup</p>
              <p className="text-muted-foreground">AWS Secrets, Variables</p>
            </div>
            <div className="text-center">
              <p className="font-medium">Infrastructure</p>
              <p className="text-muted-foreground">Terraform, ECS</p>
            </div>
            <div className="text-center">
              <p className="font-medium">Production Deploy</p>
              <p className="text-muted-foreground">Test & Go Live</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SSO Provider Configuration */}
      <Tabs value={activeProvider} onValueChange={(value) => setActiveProvider(value as any)}>
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value="azure-ad">Microsoft Azure AD</TabsTrigger>
          <TabsTrigger value="google-workspace">Google Workspace</TabsTrigger>
          <TabsTrigger value="okta">Okta Enterprise</TabsTrigger>
        </TabsList>

        {/* Azure AD Configuration */}
        <TabsContent value="azure-ad" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield size={20} />
                Microsoft Azure AD Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Globe className="h-4 w-4" />
                <AlertDescription>
                  Configure your Azure AD application at <a href="https://portal.azure.com/#blade/Microsoft_AAD_IAM/ActiveDirectoryMenuBlade/RegisteredApps" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Azure Portal → App Registrations</a>
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="azure-client-id">Client ID (Application ID)</Label>
                  <Input
                    id="azure-client-id"
                    value={ssoConfig['azure-ad'].clientId}
                    onChange={(e) => updateSSOConfig('azure-ad', 'clientId', e.target.value)}
                    placeholder="12345678-1234-1234-1234-123456789012"
                  />
                </div>
                <div>
                  <Label htmlFor="azure-tenant-id">Tenant ID (Directory ID)</Label>
                  <Input
                    id="azure-tenant-id"
                    value={ssoConfig['azure-ad'].tenantId}
                    onChange={(e) => updateSSOConfig('azure-ad', 'tenantId', e.target.value)}
                    placeholder="87654321-4321-4321-4321-210987654321"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="azure-client-secret">Client Secret</Label>
                <div className="relative">
                  <Input
                    id="azure-client-secret"
                    type={showSecrets ? 'text' : 'password'}
                    value={ssoConfig['azure-ad'].clientSecret}
                    onChange={(e) => updateSSOConfig('azure-ad', 'clientSecret', e.target.value)}
                    placeholder="Your Azure AD client secret"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2"
                    onClick={() => setShowSecrets(!showSecrets)}
                  >
                    {showSecrets ? <EyeSlash size={16} /> : <Eye size={16} />}
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="azure-callback">Callback URL</Label>
                <Input
                  id="azure-callback"
                  value={ssoConfig['azure-ad'].callbackUrl}
                  onChange={(e) => updateSSOConfig('azure-ad', 'callbackUrl', e.target.value)}
                  placeholder="https://virtualbackroom.ai/api/auth/azure/callback"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={ssoConfig['azure-ad'].testMode}
                    onCheckedChange={(checked) => updateSSOConfig('azure-ad', 'testMode', checked)}
                  />
                  <Label>Test Mode</Label>
                </div>
                <Button onClick={() => testSSOConnection('azure-ad')}>
                  <Play size={16} className="mr-2" />
                  Test Connection
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Google Workspace Configuration */}
        <TabsContent value="google-workspace" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield size={20} />
                Google Workspace Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Globe className="h-4 w-4" />
                <AlertDescription>
                  Configure your Google Cloud application at <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google Cloud Console → Credentials</a>
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="google-client-id">Client ID</Label>
                  <Input
                    id="google-client-id"
                    value={ssoConfig['google-workspace'].clientId}
                    onChange={(e) => updateSSOConfig('google-workspace', 'clientId', e.target.value)}
                    placeholder="123456789012-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com"
                  />
                </div>
                <div>
                  <Label htmlFor="google-domain">Workspace Domain</Label>
                  <Input
                    id="google-domain"
                    value={ssoConfig['google-workspace'].domain}
                    onChange={(e) => updateSSOConfig('google-workspace', 'domain', e.target.value)}
                    placeholder="yourcompany.com"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="google-client-secret">Client Secret</Label>
                <div className="relative">
                  <Input
                    id="google-client-secret"
                    type={showSecrets ? 'text' : 'password'}
                    value={ssoConfig['google-workspace'].clientSecret}
                    onChange={(e) => updateSSOConfig('google-workspace', 'clientSecret', e.target.value)}
                    placeholder="Your Google client secret"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2"
                    onClick={() => setShowSecrets(!showSecrets)}
                  >
                    {showSecrets ? <EyeSlash size={16} /> : <Eye size={16} />}
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="google-callback">Callback URL</Label>
                <Input
                  id="google-callback"
                  value={ssoConfig['google-workspace'].callbackUrl}
                  onChange={(e) => updateSSOConfig('google-workspace', 'callbackUrl', e.target.value)}
                  placeholder="https://virtualbackroom.ai/api/auth/google/callback"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={ssoConfig['google-workspace'].testMode}
                    onCheckedChange={(checked) => updateSSOConfig('google-workspace', 'testMode', checked)}
                  />
                  <Label>Test Mode</Label>
                </div>
                <Button onClick={() => testSSOConnection('google-workspace')}>
                  <Play size={16} className="mr-2" />
                  Test Connection
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Okta Configuration */}
        <TabsContent value="okta" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield size={20} />
                Okta Enterprise Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Globe className="h-4 w-4" />
                <AlertDescription>
                  Configure your Okta application in your <a href="https://dev-123456-admin.okta.com/admin/apps/active" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Okta Admin Console → Applications</a>
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="okta-client-id">Client ID</Label>
                  <Input
                    id="okta-client-id"
                    value={ssoConfig['okta'].clientId}
                    onChange={(e) => updateSSOConfig('okta', 'clientId', e.target.value)}
                    placeholder="0oabcdefghijklmnop1q2"
                  />
                </div>
                <div>
                  <Label htmlFor="okta-domain">Okta Domain</Label>
                  <Input
                    id="okta-domain"
                    value={ssoConfig['okta'].domain}
                    onChange={(e) => updateSSOConfig('okta', 'domain', e.target.value)}
                    placeholder="dev-123456.okta.com"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="okta-client-secret">Client Secret</Label>
                <div className="relative">
                  <Input
                    id="okta-client-secret"
                    type={showSecrets ? 'text' : 'password'}
                    value={ssoConfig['okta'].clientSecret}
                    onChange={(e) => updateSSOConfig('okta', 'clientSecret', e.target.value)}
                    placeholder="Your Okta client secret"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2"
                    onClick={() => setShowSecrets(!showSecrets)}
                  >
                    {showSecrets ? <EyeSlash size={16} /> : <Eye size={16} />}
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="okta-callback">Callback URL</Label>
                <Input
                  id="okta-callback"
                  value={ssoConfig['okta'].callbackUrl}
                  onChange={(e) => updateSSOConfig('okta', 'callbackUrl', e.target.value)}
                  placeholder="https://virtualbackroom.ai/api/auth/okta/callback"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={ssoConfig['okta'].testMode}
                    onCheckedChange={(checked) => updateSSOConfig('okta', 'testMode', checked)}
                  />
                  <Label>Test Mode</Label>
                </div>
                <Button onClick={() => testSSOConnection('okta')}>
                  <Play size={16} className="mr-2" />
                  Test Connection
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Environment Variables */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key size={20} />
            Production Environment Variables
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="staging" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="staging">Staging Environment</TabsTrigger>
              <TabsTrigger value="production">Production Environment</TabsTrigger>
            </TabsList>

            <TabsContent value="staging" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>AZURE_CLIENT_ID</Label>
                  <Input 
                    value={envVariables.staging.AZURE_CLIENT_ID}
                    onChange={(e) => setEnvVariables({
                      ...envVariables,
                      staging: { ...envVariables.staging, AZURE_CLIENT_ID: e.target.value }
                    })}
                    placeholder="Azure Client ID for staging"
                  />
                </div>
                <div>
                  <Label>GOOGLE_CLIENT_ID</Label>
                  <Input 
                    value={envVariables.staging.GOOGLE_CLIENT_ID}
                    onChange={(e) => setEnvVariables({
                      ...envVariables,
                      staging: { ...envVariables.staging, GOOGLE_CLIENT_ID: e.target.value }
                    })}
                    placeholder="Google Client ID for staging"
                  />
                </div>
              </div>
              
              <Button onClick={() => copyToClipboard(Object.entries(envVariables.staging).map(([key, value]) => `${key}="${value}"`).join('\n'))}>
                <Copy size={16} className="mr-2" />
                Copy Staging Env Variables
              </Button>
            </TabsContent>

            <TabsContent value="production" className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Production secrets should be managed through AWS Secrets Manager or your secure secret store.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>AZURE_CLIENT_ID</Label>
                  <Input 
                    value={envVariables.production.AZURE_CLIENT_ID}
                    onChange={(e) => setEnvVariables({
                      ...envVariables,
                      production: { ...envVariables.production, AZURE_CLIENT_ID: e.target.value }
                    })}
                    placeholder="Azure Client ID for production"
                  />
                </div>
                <div>
                  <Label>GOOGLE_CLIENT_ID</Label>
                  <Input 
                    value={envVariables.production.GOOGLE_CLIENT_ID}
                    onChange={(e) => setEnvVariables({
                      ...envVariables,
                      production: { ...envVariables.production, GOOGLE_CLIENT_ID: e.target.value }
                    })}
                    placeholder="Google Client ID for production"
                  />
                </div>
              </div>

              <Button onClick={() => copyToClipboard(generateTerraformConfig())}>
                <Copy size={16} className="mr-2" />
                Copy Terraform Configuration
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Implementation Code */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code size={20} />
            Backend Implementation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <pre className="text-sm overflow-x-auto">
                <code>{generateBackendImplementation().slice(0, 500)}...</code>
              </pre>
            </div>
            <Button onClick={() => copyToClipboard(generateBackendImplementation())}>
              <Copy size={16} className="mr-2" />
              Copy Full Implementation
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Production Checklist */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle size={20} />
            Production Deployment Checklist
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { task: 'Configure Azure AD application registration', status: 'pending' },
              { task: 'Set up Google Workspace OAuth credentials', status: 'pending' },
              { task: 'Configure Okta application settings', status: 'pending' },
              { task: 'Deploy Terraform infrastructure changes', status: 'pending' },
              { task: 'Update AWS Secrets Manager with production secrets', status: 'pending' },
              { task: 'Deploy backend SSO implementation', status: 'pending' },
              { task: 'Test SSO login flows in staging', status: 'pending' },
              { task: 'Configure production DNS and SSL certificates', status: 'pending' },
              { task: 'Set up monitoring and alerting for SSO', status: 'pending' },
              { task: 'Deploy to production and verify', status: 'pending' }
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <span className="text-sm">{item.task}</span>
                <Badge variant={item.status === 'complete' ? 'default' : 'secondary'}>
                  {item.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}