# Production SSO Deployment Guide
## VirtualBackroom.ai V2.0 Enterprise Authentication

This guide provides comprehensive instructions for deploying enterprise SSO with Azure AD, Google Workspace, and Okta in production environments.

## Prerequisites

- AWS Account with appropriate permissions
- Access to Azure AD, Google Workspace, or Okta admin console
- Terraform installed for infrastructure deployment
- kubectl configured for Kubernetes deployment

## 1. Azure AD Configuration

### Step 1: Register Application in Azure Portal

1. Navigate to [Azure Portal → App Registrations](https://portal.azure.com/#blade/Microsoft_AAD_IAM/ActiveDirectoryMenuBlade/RegisteredApps)
2. Click **"New registration"**
3. Configure:
   - **Name**: VirtualBackroom.ai Production
   - **Supported account types**: Accounts in this organizational directory only
   - **Redirect URI**: `https://virtualbackroom.ai/api/auth/azure/callback`

### Step 2: Configure Authentication

1. Go to **Authentication** → **Platform configurations**
2. Add Web platform:
   - Redirect URIs: 
     - `https://virtualbackroom.ai/api/auth/azure/callback`
     - `https://staging.virtualbackroom.ai/api/auth/azure/callback`
3. Configure **Implicit grant and hybrid flows**:
   - ✅ Access tokens
   - ✅ ID tokens

### Step 3: Create Client Secret

1. Go to **Certificates & secrets**
2. Click **"New client secret"**
3. Description: `VirtualBackroom Production Secret`
4. Expires: **24 months** (recommended)
5. **Save the secret value immediately** - it won't be shown again

### Step 4: Configure API Permissions

1. Go to **API permissions**
2. Add permissions:
   - **Microsoft Graph**:
     - `User.Read` (delegated)
     - `email` (delegated)
     - `openid` (delegated)
     - `profile` (delegated)
3. Click **"Grant admin consent"** for your organization

### Step 5: Collect Configuration Values

Note these values for deployment:
- **Application (client) ID**: `12345678-1234-1234-1234-123456789012`
- **Directory (tenant) ID**: `87654321-4321-4321-4321-210987654321`
- **Client secret**: `your-secret-value`

## 2. Google Workspace Configuration

### Step 1: Create OAuth 2.0 Credentials

1. Navigate to [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials)
2. Click **"Create Credentials"** → **OAuth client ID**
3. Configure:
   - **Application type**: Web application
   - **Name**: VirtualBackroom.ai Production
   - **Authorized redirect URIs**:
     - `https://virtualbackroom.ai/api/auth/google/callback`
     - `https://staging.virtualbackroom.ai/api/auth/google/callback`

### Step 2: Enable Required APIs

1. Go to [API Library](https://console.cloud.google.com/apis/library)
2. Enable:
   - Google+ API
   - Admin SDK API
   - Directory API

### Step 3: Configure Domain-wide Delegation (Optional)

For organization-wide access:
1. Go to [Google Admin Console](https://admin.google.com)
2. **Security** → **API controls** → **Domain-wide delegation**
3. Add your Client ID with required scopes

### Step 4: Collect Configuration Values

Note these values:
- **Client ID**: `123456789012-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com`
- **Client secret**: `your-google-client-secret`

## 3. Okta Configuration

### Step 1: Create Web Application

1. Navigate to [Okta Admin Console → Applications](https://dev-123456-admin.okta.com/admin/apps/active)
2. Click **"Create App Integration"**
3. Configure:
   - **Sign-in method**: OIDC - OpenID Connect
   - **Application type**: Web Application
   - **App integration name**: VirtualBackroom.ai Production

### Step 2: Configure Application Settings

1. **Sign-in redirect URIs**:
   - `https://virtualbackroom.ai/api/auth/okta/callback`
   - `https://staging.virtualbackroom.ai/api/auth/okta/callback`
2. **Assignments**: Assign to appropriate groups/users
3. **Grant type**: Authorization Code

### Step 3: Collect Configuration Values

Note these values:
- **Client ID**: `0oabcdefghijklmnop1q2`
- **Client secret**: `your-okta-client-secret`
- **Okta domain**: `dev-123456.okta.com`

## 4. Infrastructure Deployment

### Terraform Configuration

Create `terraform/sso.tf`:

```hcl
# VirtualBackroom.ai Production SSO Infrastructure
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
```

### Deploy Infrastructure

```bash
cd terraform/
terraform init
terraform plan -var-file="production.tfvars"
terraform apply
```

### Create `production.tfvars`

```hcl
# Azure AD Configuration
azure_client_id     = "12345678-1234-1234-1234-123456789012"
azure_client_secret = "your-azure-secret"
azure_tenant_id     = "87654321-4321-4321-4321-210987654321"

# Google Workspace Configuration  
google_client_id     = "123456789012-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com"
google_client_secret = "your-google-secret"

# Okta Configuration
okta_client_id      = "0oabcdefghijklmnop1q2"
okta_client_secret  = "your-okta-secret"
okta_domain         = "dev-123456.okta.com"

# Security
jwt_secret = "your-secure-jwt-secret-256-bits"
```

## 5. Backend Implementation

### Install Dependencies

```bash
npm install passport passport-azure-ad-oauth2 passport-google-oauth20 passport-oauth2
npm install @types/passport @types/passport-oauth2 --save-dev
```

### SSO Implementation

Create `src/auth/sso-providers.ts`:

```typescript
import { OAuth2Strategy } from 'passport-oauth2'
import { Strategy as AzureADStrategy } from 'passport-azure-ad-oauth2'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import { getSecret } from './aws-secrets'

interface SSOUser {
  id: string
  email: string
  name: string
  provider: string
  organizationId?: string
  roles?: string[]
}

class ProductionSSOManager {
  private secrets: any = {}

  async initialize() {
    this.secrets = await getSecret('virtualbackroom/sso/production')
  }

  async initializeAzureAD() {
    return new AzureADStrategy(
      {
        clientID: this.secrets.azure_client_id,
        clientSecret: this.secrets.azure_client_secret,
        tenant: this.secrets.azure_tenant_id,
        callbackURL: process.env.AZURE_CALLBACK_URL || 'https://virtualbackroom.ai/api/auth/azure/callback'
      },
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
          console.error('Azure AD auth error:', error)
          return done(error, null)
        }
      }
    )
  }

  async initializeGoogleWorkspace() {
    return new GoogleStrategy(
      {
        clientID: this.secrets.google_client_id,
        clientSecret: this.secrets.google_client_secret,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || 'https://virtualbackroom.ai/api/auth/google/callback',
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
          console.error('Google Workspace auth error:', error)
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

  private async createOrUpdateUser(user: SSOUser): Promise<void> {
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
```

### AWS Secrets Helper

Create `src/auth/aws-secrets.ts`:

```typescript
import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager"

const client = new SecretsManagerClient({
  region: process.env.AWS_REGION || "us-east-1"
})

export async function getSecret(secretName: string): Promise<any> {
  try {
    const command = new GetSecretValueCommand({
      SecretId: secretName
    })
    
    const response = await client.send(command)
    
    if (response.SecretString) {
      return JSON.parse(response.SecretString)
    }
    
    throw new Error('Secret not found')
  } catch (error) {
    console.error('Error retrieving secret:', error)
    throw error
  }
}
```

## 6. Application Routes

Create `src/routes/auth.ts`:

```typescript
import express from 'express'
import passport from 'passport'
import jwt from 'jsonwebtoken'
import { ssoManager } from '../auth/sso-providers'

const router = express.Router()

// Initialize SSO strategies
async function initializeSSO() {
  await ssoManager.initialize()
  
  passport.use('azure-ad', await ssoManager.initializeAzureAD())
  passport.use('google', await ssoManager.initializeGoogleWorkspace())
}

initializeSSO()

// Azure AD Routes
router.get('/azure', passport.authenticate('azure-ad'))
router.get('/azure/callback', 
  passport.authenticate('azure-ad', { session: false }),
  (req, res) => {
    const token = jwt.sign(
      { user: req.user }, 
      process.env.JWT_SECRET!, 
      { expiresIn: '24h' }
    )
    res.redirect(`https://virtualbackroom.ai/auth/success?token=${token}`)
  }
)

// Google Workspace Routes
router.get('/google', passport.authenticate('google'))
router.get('/google/callback',
  passport.authenticate('google', { session: false }),
  (req, res) => {
    const token = jwt.sign(
      { user: req.user },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    )
    res.redirect(`https://virtualbackroom.ai/auth/success?token=${token}`)
  }
)

// Health check
router.get('/health/sso', (req, res) => {
  res.json({ 
    status: 'healthy', 
    providers: ['azure-ad', 'google-workspace', 'okta'],
    timestamp: new Date().toISOString()
  })
})

export default router
```

## 7. Deployment Script

Create `scripts/deploy-sso-production.sh`:

```bash
#!/bin/bash
# VirtualBackroom.ai Production SSO Deployment Script

set -e

echo "🚀 Starting Production SSO Deployment..."

# 1. Verify prerequisites
echo "📋 Verifying prerequisites..."
command -v aws >/dev/null 2>&1 || { echo "AWS CLI required but not installed.  Aborting." >&2; exit 1; }
command -v kubectl >/dev/null 2>&1 || { echo "kubectl required but not installed.  Aborting." >&2; exit 1; }

# 2. Deploy infrastructure
echo "🏗️ Deploying infrastructure changes..."
cd terraform/
terraform plan -var-file="production.tfvars"
terraform apply -var-file="production.tfvars" -auto-approve

# 3. Build and push container
echo "🐳 Building and pushing container..."
docker build -t virtualbackroom-api:latest .
docker tag virtualbackroom-api:latest $ECR_REGISTRY/virtualbackroom-api:latest
docker push $ECR_REGISTRY/virtualbackroom-api:latest

# 4. Deploy to ECS
echo "🚀 Deploying to ECS..."
aws ecs update-service \
  --cluster virtualbackroom-prod \
  --service virtualbackroom-api \
  --force-new-deployment

# 5. Wait for deployment
echo "⏳ Waiting for deployment to complete..."
aws ecs wait services-stable \
  --cluster virtualbackroom-prod \
  --services virtualbackroom-api

# 6. Verify SSO endpoints
echo "🔍 Verifying SSO configuration..."
curl -f https://virtualbackroom.ai/api/health/sso || { echo "SSO health check failed" >&2; exit 1; }
curl -f https://virtualbackroom.ai/api/auth/azure || { echo "Azure AD endpoint failed" >&2; exit 1; }
curl -f https://virtualbackroom.ai/api/auth/google || { echo "Google Workspace endpoint failed" >&2; exit 1; }

echo "✅ Production SSO Deployment Complete!"
echo "🔗 SSO Login URLs:"
echo "   Azure AD: https://virtualbackroom.ai/auth/azure"
echo "   Google: https://virtualbackroom.ai/auth/google"
echo "   Okta: https://virtualbackroom.ai/auth/okta"
```

## 8. Testing & Validation

### Manual Testing Checklist

1. **Azure AD Flow**:
   - [ ] Navigate to https://virtualbackroom.ai/auth/azure
   - [ ] Complete Azure AD login
   - [ ] Verify successful redirect with JWT token
   - [ ] Check user creation in database

2. **Google Workspace Flow**:
   - [ ] Navigate to https://virtualbackroom.ai/auth/google  
   - [ ] Complete Google login
   - [ ] Verify successful redirect with JWT token
   - [ ] Check user creation in database

3. **Okta Flow**:
   - [ ] Navigate to https://virtualbackroom.ai/auth/okta
   - [ ] Complete Okta login
   - [ ] Verify successful redirect with JWT token
   - [ ] Check user creation in database

### Automated Testing

Create `tests/sso-integration.test.ts`:

```typescript
import { test, expect } from '@playwright/test'

test.describe('SSO Integration Tests', () => {
  test('Azure AD login flow', async ({ page }) => {
    await page.goto('https://virtualbackroom.ai/auth/azure')
    
    // Fill in Azure AD credentials
    await page.fill('[name="loginfmt"]', 'test@company.com')
    await page.click('[type="submit"]')
    
    await page.fill('[name="passwd"]', 'password')
    await page.click('[type="submit"]')
    
    // Verify successful redirect
    await expect(page).toHaveURL(/auth\/success/)
  })

  test('Google Workspace login flow', async ({ page }) => {
    await page.goto('https://virtualbackroom.ai/auth/google')
    
    // Google OAuth flow
    await page.fill('[type="email"]', 'test@company.com')
    await page.click('#identifierNext')
    
    await page.fill('[type="password"]', 'password')
    await page.click('#passwordNext')
    
    // Verify successful redirect
    await expect(page).toHaveURL(/auth\/success/)
  })
})
```

## 9. Monitoring & Alerting

### CloudWatch Metrics

Monitor these key metrics:

- SSO login success rate
- SSO login failure rate  
- Response time for SSO endpoints
- Token validation success rate

### Alerts Setup

```bash
# Create CloudWatch alerts
aws cloudwatch put-metric-alarm \
  --alarm-name "VirtualBackroom-SSO-Login-Failures" \
  --alarm-description "High SSO login failure rate" \
  --metric-name "SSOLoginFailures" \
  --namespace "VirtualBackroom/SSO" \
  --statistic "Sum" \
  --period 300 \
  --evaluation-periods 2 \
  --threshold 10 \
  --comparison-operator "GreaterThanThreshold"
```

## 10. Troubleshooting

### Common Issues

1. **"Invalid redirect URI"**:
   - Verify redirect URIs match exactly in SSO provider configuration
   - Check for trailing slashes or protocol mismatches

2. **"Client secret expired"**:
   - Rotate secrets in AWS Secrets Manager
   - Update application configuration in SSO providers

3. **"User not found in organization"**:
   - Verify domain mapping in database
   - Check organization assignment logic

### Debug Mode

Enable debug logging:

```bash
export DEBUG="passport:*,oauth:*"
export LOG_LEVEL="debug"
```

### Health Check Endpoints

- `/api/health/sso` - Overall SSO system health
- `/api/health/azure` - Azure AD specific health  
- `/api/health/google` - Google Workspace specific health
- `/api/health/okta` - Okta specific health

## Security Considerations

1. **Secret Management**: Use AWS Secrets Manager for all credentials
2. **HTTPS Only**: All SSO endpoints must use HTTPS
3. **Token Security**: Use secure JWT secrets with proper expiration
4. **Audit Logging**: Log all authentication attempts
5. **Rate Limiting**: Implement rate limiting on auth endpoints

## Support & Maintenance

- Monitor SSO provider status pages for outages
- Keep OAuth application credentials current
- Regular security audits of SSO configuration
- Update dependencies regularly for security patches

This completes the production SSO deployment guide for VirtualBackroom.ai V2.0.