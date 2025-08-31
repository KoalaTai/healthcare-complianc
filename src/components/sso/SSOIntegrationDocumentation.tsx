import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { 
  MicrosoftOutlookLogo, 
  GoogleLogo, 
  Shield, 
  FileText,
  Code,
  CheckCircle,
  Warning,
  Info,
  Copy,
  Play,
  Download,
  ArrowRight,
  Link,
  Globe
} from '@phosphor-icons/react'

export function SSOIntegrationDocumentation() {
  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
  }

  const azureSetupSteps = [
    'Navigate to Azure Portal → Azure Active Directory → App registrations',
    'Click "New registration" and name it "VirtualBackroom.ai"',
    'Set Supported account types to "Accounts in this organizational directory only"',
    'Add Redirect URI: Web - https://virtualbackroom.ai/auth/azure/callback',
    'Click "Register" to create the application',
    'Copy the Application (client) ID and Directory (tenant) ID',
    'Go to "Certificates & secrets" and create a new client secret',
    'Under "API permissions", add Microsoft Graph delegated permissions',
    'Grant admin consent for the permissions if required'
  ]

  const googleSetupSteps = [
    'Open Google Cloud Console and select your project',
    'Navigate to APIs & Services → Credentials',
    'Click "Create Credentials" → "OAuth 2.0 Client IDs"',
    'Choose "Web application" as the application type',
    'Add authorized JavaScript origins: https://virtualbackroom.ai',
    'Add authorized redirect URIs: https://virtualbackroom.ai/auth/google/callback',
    'Click "Create" and copy the Client ID and Client Secret',
    'Enable Google+ API in the API Library if not already enabled',
    'Configure OAuth consent screen with required information'
  ]

  const oktaSetupSteps = [
    'Log into your Okta Admin Console',
    'Navigate to Applications → Applications',
    'Click "Create App Integration"',
    'Choose "OIDC - OpenID Connect" and "Web Application"',
    'Enter application name: "VirtualBackroom.ai"',
    'Set Sign-in redirect URI: https://virtualbackroom.ai/auth/okta/callback',
    'Configure Assignments to control user access',
    'Copy the Client ID and Client Secret from General settings',
    'Configure group claims and user attributes as needed'
  ]

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">SSO Integration Documentation</h1>
          <p className="text-muted-foreground">
            Complete setup guides for Microsoft Azure AD, Google Workspace, and Okta
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Download size={16} className="mr-2" />
            Export PDF
          </Button>
          <Button>
            <Globe size={16} className="mr-2" />
            Online Docs
          </Button>
        </div>
      </div>

      {/* Quick Start */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play size={20} />
            Quick Start Guide
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Info size={16} />
            <AlertDescription>
              Before starting, ensure you have administrative access to your identity provider and the VirtualBackroom.ai admin panel.
            </AlertDescription>
          </Alert>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg text-center">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-sm font-bold text-blue-600">1</span>
              </div>
              <h4 className="font-semibold mb-2">Choose Provider</h4>
              <p className="text-sm text-muted-foreground">Select your organization's identity provider</p>
            </div>
            
            <div className="p-4 border rounded-lg text-center">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-sm font-bold text-blue-600">2</span>
              </div>
              <h4 className="font-semibold mb-2">Configure Application</h4>
              <p className="text-sm text-muted-foreground">Set up the application in your provider console</p>
            </div>
            
            <div className="p-4 border rounded-lg text-center">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-sm font-bold text-blue-600">3</span>
              </div>
              <h4 className="font-semibold mb-2">Test & Deploy</h4>
              <p className="text-sm text-muted-foreground">Validate configuration and enable for users</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Microsoft Azure AD */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MicrosoftOutlookLogo size={20} className="text-blue-600" />
            Microsoft Azure Active Directory
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <MicrosoftOutlookLogo size={16} />
            <AlertDescription>
              Azure AD provides enterprise-grade identity and access management with conditional access and multi-factor authentication.
            </AlertDescription>
          </Alert>

          <div>
            <h4 className="font-semibold mb-3">Prerequisites</h4>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• Global Administrator or Application Administrator role in Azure AD</li>
              <li>• Azure AD Premium license (recommended for conditional access)</li>
              <li>• Users assigned to the Azure AD tenant</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Setup Instructions</h4>
            <ol className="space-y-3">
              {azureSetupSteps.map((step, index) => (
                <li key={index} className="flex gap-3">
                  <Badge variant="outline" className="w-6 h-6 rounded-full p-0 flex items-center justify-center flex-shrink-0">
                    {index + 1}
                  </Badge>
                  <span className="text-sm">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Required Information</h4>
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Application (Client) ID</span>
                <Button size="sm" variant="ghost">
                  <Copy size={14} />
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Directory (Tenant) ID</span>
                <Button size="sm" variant="ghost">
                  <Copy size={14} />
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Client Secret</span>
                <Button size="sm" variant="ghost">
                  <Copy size={14} />
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Redirect URI</span>
                <code className="text-xs bg-background px-2 py-1 rounded">
                  https://virtualbackroom.ai/auth/azure/callback
                </code>
              </div>
            </div>
          </div>

          <Alert>
            <Warning size={16} />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-medium">Important Security Notes</p>
                <ul className="text-sm space-y-1">
                  <li>• Store client secrets securely and rotate them regularly</li>
                  <li>• Configure conditional access policies for enhanced security</li>
                  <li>• Enable MFA for all administrative accounts</li>
                  <li>• Review and audit application permissions regularly</li>
                </ul>
              </div>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Google Workspace */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GoogleLogo size={20} className="text-red-600" />
            Google Workspace
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <GoogleLogo size={16} />
            <AlertDescription>
              Google Workspace SSO provides secure authentication with domain restrictions and organizational unit controls.
            </AlertDescription>
          </Alert>

          <div>
            <h4 className="font-semibold mb-3">Prerequisites</h4>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• Super Admin privileges in Google Admin Console</li>
              <li>• Google Workspace subscription (any edition)</li>
              <li>• Verified domain ownership</li>
              <li>• Users in the Google Workspace directory</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Setup Instructions</h4>
            <ol className="space-y-3">
              {googleSetupSteps.map((step, index) => (
                <li key={index} className="flex gap-3">
                  <Badge variant="outline" className="w-6 h-6 rounded-full p-0 flex items-center justify-center flex-shrink-0">
                    {index + 1}
                  </Badge>
                  <span className="text-sm">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Configuration Parameters</h4>
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">OAuth 2.0 Client ID</span>
                <Button size="sm" variant="ghost">
                  <Copy size={14} />
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Client Secret</span>
                <Button size="sm" variant="ghost">
                  <Copy size={14} />
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Hosted Domain (Optional)</span>
                <code className="text-xs bg-background px-2 py-1 rounded">
                  company.com
                </code>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Redirect URI</span>
                <code className="text-xs bg-background px-2 py-1 rounded">
                  https://virtualbackroom.ai/auth/google/callback
                </code>
              </div>
            </div>
          </div>

          <Alert>
            <Info size={16} />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-medium">Google Workspace Features</p>
                <ul className="text-sm space-y-1">
                  <li>• Domain restriction to limit authentication to your organization</li>
                  <li>• Integration with Google Admin Console for user management</li>
                  <li>• Support for organizational units and groups</li>
                  <li>• Automatic user provisioning and deprovisioning</li>
                </ul>
              </div>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Okta */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield size={20} className="text-indigo-600" />
            Okta
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <Shield size={16} />
            <AlertDescription>
              Okta provides a comprehensive identity platform with universal directory, adaptive MFA, and lifecycle management.
            </AlertDescription>
          </Alert>

          <div>
            <h4 className="font-semibold mb-3">Prerequisites</h4>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• Okta Administrator or Super Administrator privileges</li>
              <li>• Active Okta subscription (any edition)</li>
              <li>• Users imported or synchronized to Okta</li>
              <li>• Understanding of Okta groups and policies</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Setup Instructions</h4>
            <ol className="space-y-3">
              {oktaSetupSteps.map((step, index) => (
                <li key={index} className="flex gap-3">
                  <Badge variant="outline" className="w-6 h-6 rounded-full p-0 flex items-center justify-center flex-shrink-0">
                    {index + 1}
                  </Badge>
                  <span className="text-sm">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Application Settings</h4>
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Okta Domain</span>
                <code className="text-xs bg-background px-2 py-1 rounded">
                  company.okta.com
                </code>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Client ID</span>
                <Button size="sm" variant="ghost">
                  <Copy size={14} />
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Client Secret</span>
                <Button size="sm" variant="ghost">
                  <Copy size={14} />
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Authorization Server</span>
                <code className="text-xs bg-background px-2 py-1 rounded">
                  default
                </code>
              </div>
            </div>
          </div>

          <Alert>
            <CheckCircle size={16} />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-medium">Okta Advanced Features</p>
                <ul className="text-sm space-y-1">
                  <li>• Universal Directory for identity management across systems</li>
                  <li>• Adaptive MFA based on risk and context</li>
                  <li>• Automated user lifecycle management</li>
                  <li>• Fine-grained access policies and rules</li>
                </ul>
              </div>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Testing & Troubleshooting */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle size={20} />
            Testing & Troubleshooting
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-semibold mb-3">Testing Checklist</h4>
            <div className="space-y-2">
              {[
                'Verify provider metadata is accessible',
                'Test authentication flow with test user',
                'Validate token claims and user information',
                'Check group/role mapping (if configured)',
                'Test logout and session termination',
                'Verify error handling for invalid users'
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded border-2 border-gray-300" />
                  <span className="text-sm">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="font-semibold mb-3">Common Issues</h4>
            <div className="space-y-4">
              <div className="border-l-4 border-red-500 pl-4">
                <h5 className="font-medium text-red-800">Authentication Failed</h5>
                <p className="text-sm text-red-600">
                  Check client ID/secret, redirect URI, and user assignments
                </p>
              </div>
              <div className="border-l-4 border-yellow-500 pl-4">
                <h5 className="font-medium text-yellow-800">Missing User Information</h5>
                <p className="text-sm text-yellow-600">
                  Verify scopes and claims configuration in provider
                </p>
              </div>
              <div className="border-l-4 border-blue-500 pl-4">
                <h5 className="font-medium text-blue-800">Group Claims Missing</h5>
                <p className="text-sm text-blue-600">
                  Enable group claims in application token configuration
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline">
              <FileText size={16} className="mr-2" />
              Full Troubleshooting Guide
            </Button>
            <Button>
              <Link size={16} className="mr-2" />
              Contact Support
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Code Examples */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code size={20} />
            Integration Code Examples
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold">Environment Configuration</h4>
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyCode(`# Azure AD Configuration
AZURE_AD_TENANT_ID=your-tenant-id
AZURE_AD_CLIENT_ID=your-client-id
AZURE_AD_CLIENT_SECRET=your-client-secret

# Google Workspace Configuration  
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_HOSTED_DOMAIN=company.com

# Okta Configuration
OKTA_DOMAIN=company.okta.com
OKTA_CLIENT_ID=your-client-id
OKTA_CLIENT_SECRET=your-client-secret`)}
              >
                <Copy size={14} />
              </Button>
            </div>
            <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
{`# Azure AD Configuration
AZURE_AD_TENANT_ID=your-tenant-id
AZURE_AD_CLIENT_ID=your-client-id
AZURE_AD_CLIENT_SECRET=your-client-secret

# Google Workspace Configuration  
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_HOSTED_DOMAIN=company.com

# Okta Configuration
OKTA_DOMAIN=company.okta.com
OKTA_CLIENT_ID=your-client-id
OKTA_CLIENT_SECRET=your-client-secret`}
            </pre>
          </div>

          <Alert>
            <Info size={16} />
            <AlertDescription>
              Store these configuration values securely using environment variables or a secure configuration management system. Never commit secrets to version control.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  )
}