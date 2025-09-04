# VirtualBackroom.ai V2.0 - Production Deployment Instructions

## Overview
This document provides comprehensive instructions for deploying VirtualBackroom.ai V2.0 in a production environment with enterprise SSO, AI processing capabilities, and regulatory compliance features.

## System Requirements

### Infrastructure
- **Cloud Provider**: AWS (recommended) or Azure
- **Container Orchestration**: ECS Fargate or Kubernetes
- **Database**: PostgreSQL 14+ with Multi-tenant Row Level Security
- **Cache/Queue**: Redis 6+ for Celery task queue
- **Storage**: S3-compatible object storage for documents
- **Monitoring**: CloudWatch, Prometheus, or similar

### Network & Security
- **SSL/TLS**: Valid certificates for all domains
- **Load Balancer**: Application Load Balancer with WAF
- **DNS**: Route53 or equivalent with health checks
- **Secrets**: AWS Secrets Manager or HashiCorp Vault
- **IAM**: Least-privilege access policies

## Pre-Deployment Checklist

### 1. SSO Provider Configuration
- [ ] Azure AD application registration completed
- [ ] Google Workspace OAuth credentials configured
- [ ] Okta enterprise application set up
- [ ] All callback URLs whitelisted
- [ ] Client secrets stored in secure vault

### 2. Infrastructure Setup
- [ ] VPC and subnets configured
- [ ] Security groups with proper ingress/egress rules
- [ ] RDS PostgreSQL instance deployed with encryption
- [ ] Redis cluster configured for high availability
- [ ] S3 buckets created with proper policies
- [ ] IAM roles and policies configured

### 3. Application Configuration
- [ ] Environment variables defined in secrets manager
- [ ] Database migrations tested in staging
- [ ] SSL certificates installed and validated
- [ ] Monitoring and alerting configured
- [ ] Backup and disaster recovery tested

## Environment Variables

### Required Production Variables
```bash
# Application
NODE_ENV=production
PORT=3000
JWT_SECRET=<secure-256-bit-secret>
ENCRYPTION_KEY=<aes-256-encryption-key>

# Database
DATABASE_URL=postgresql://user:pass@rds-endpoint:5432/virtualbackroom
REDIS_URL=redis://elasticache-cluster:6379

# AWS Services  
AWS_REGION=us-east-1
AWS_S3_BUCKET=virtualbackroom-documents-prod
AWS_SECRETS_MANAGER_SECRET=virtualbackroom/production

# SSO Providers
AZURE_CLIENT_ID=<from-secrets-manager>
AZURE_CLIENT_SECRET=<from-secrets-manager>
AZURE_TENANT_ID=<from-secrets-manager>
GOOGLE_CLIENT_ID=<from-secrets-manager>
GOOGLE_CLIENT_SECRET=<from-secrets-manager>
OKTA_CLIENT_ID=<from-secrets-manager>
OKTA_CLIENT_SECRET=<from-secrets-manager>
OKTA_DOMAIN=<your-okta-domain>

# AI/ML Services
OPENAI_API_KEY=<from-secrets-manager>
ANTHROPIC_API_KEY=<from-secrets-manager>
GOOGLE_AI_API_KEY=<from-secrets-manager>
GROK_API_KEY=<from-secrets-manager>

# Monitoring
SENTRY_DSN=<your-sentry-dsn>
NEW_RELIC_LICENSE_KEY=<your-newrelic-key>
```

## Deployment Steps

### 1. Infrastructure Deployment (Terraform)

```bash
# Clone infrastructure repository
git clone https://github.com/virtualbackroom/infrastructure
cd infrastructure

# Initialize Terraform
terraform init -backend-config="bucket=virtualbackroom-terraform-state"

# Plan deployment
terraform plan -var-file="environments/production.tfvars"

# Deploy infrastructure
terraform apply -var-file="environments/production.tfvars"
```

### 2. Database Setup

```bash
# Run database migrations
npx prisma migrate deploy

# Seed initial data
npx prisma db seed --environment=production

# Verify database connection
npx prisma db pull --schema=./schema.prisma
```

### 3. Application Deployment

#### Option A: ECS Fargate Deployment
```bash
# Build and push container
docker build -t virtualbackroom-api:latest .
docker tag virtualbackroom-api:latest $ECR_REGISTRY/virtualbackroom-api:latest
docker push $ECR_REGISTRY/virtualbackroom-api:latest

# Update ECS service
aws ecs update-service \
  --cluster virtualbackroom-prod \
  --service virtualbackroom-api \
  --force-new-deployment

# Wait for deployment
aws ecs wait services-stable \
  --cluster virtualbackroom-prod \
  --services virtualbackroom-api
```

#### Option B: Kubernetes Deployment
```bash
# Apply Kubernetes manifests
kubectl apply -f k8s/production/

# Verify deployment
kubectl get pods -n virtualbackroom-prod
kubectl get services -n virtualbackroom-prod

# Check application logs
kubectl logs -f deployment/virtualbackroom-api -n virtualbackroom-prod
```

### 4. SSL Certificate Configuration

```bash
# Using AWS Certificate Manager
aws acm request-certificate \
  --domain-name virtualbackroom.ai \
  --subject-alternative-names "*.virtualbackroom.ai" \
  --validation-method DNS

# Associate certificate with load balancer
aws elbv2 modify-listener \
  --listener-arn $LISTENER_ARN \
  --certificates CertificateArn=$CERTIFICATE_ARN
```

### 5. DNS Configuration

```bash
# Create Route53 hosted zone
aws route53 create-hosted-zone --name virtualbackroom.ai

# Create health check
aws route53 create-health-check \
  --type HTTPS \
  --resource-path /api/health \
  --fully-qualified-domain-name virtualbackroom.ai
```

## Post-Deployment Verification

### 1. Health Checks
```bash
# Application health
curl https://virtualbackroom.ai/api/health

# Database connectivity  
curl https://virtualbackroom.ai/api/health/database

# SSO endpoints
curl https://virtualbackroom.ai/api/health/sso
curl https://virtualbackroom.ai/api/auth/azure
curl https://virtualbackroom.ai/api/auth/google
curl https://virtualbackroom.ai/api/auth/okta

# AI services
curl https://virtualbackroom.ai/api/health/ai-models
```

### 2. Security Validation
```bash
# SSL certificate check
openssl s_client -connect virtualbackroom.ai:443 -servername virtualbackroom.ai

# Security headers
curl -I https://virtualbackroom.ai

# OWASP ZAP security scan (recommended)
docker run -v $(pwd):/zap/wrk/:rw -t owasp/zap2docker-stable \
  zap-baseline.py -t https://virtualbackroom.ai
```

### 3. Performance Testing
```bash
# Load testing with k6
k6 run --vus 10 --duration 30s performance-tests/load-test.js

# Database performance
pgbench -h $DB_HOST -U $DB_USER -d virtualbackroom -c 10 -j 2 -T 60
```

## Monitoring & Alerting Setup

### CloudWatch Metrics
- Application response times
- Error rates and 5xx responses  
- Database connection pool usage
- Redis memory utilization
- SSO login success/failure rates

### Alerts Configuration
```json
{
  "alerts": [
    {
      "name": "High Error Rate",
      "metric": "ErrorRate",
      "threshold": "5%",
      "duration": "5 minutes"
    },
    {
      "name": "Database Connection Issues", 
      "metric": "DatabaseConnections",
      "threshold": "80%",
      "duration": "2 minutes"
    },
    {
      "name": "SSO Login Failures",
      "metric": "SSOFailureRate", 
      "threshold": "10%",
      "duration": "3 minutes"
    }
  ]
}
```

## Backup & Disaster Recovery

### Automated Backups
- Database: Daily snapshots with 30-day retention
- File Storage: S3 cross-region replication enabled
- Configuration: Infrastructure as Code in version control

### Recovery Procedures
1. **Database Recovery**: Restore from RDS snapshot
2. **Application Recovery**: Redeploy from container registry
3. **File Recovery**: Restore from S3 backup region
4. **DNS Failover**: Route53 health check failover

## Security Hardening

### Network Security
- VPC with private subnets for application tier
- NAT Gateway for outbound internet access
- Security groups with minimal required ports
- WAF rules for common attack patterns

### Application Security
- JWT tokens with short expiration (24 hours)
- Rate limiting on authentication endpoints  
- Input validation and sanitization
- SQL injection prevention with parameterized queries
- CORS policies restricted to known origins

### Data Security
- Encryption at rest for all data stores
- Encryption in transit with TLS 1.2+
- Field-level encryption for sensitive data
- Regular security vulnerability scans

## Compliance & Audit

### 21 CFR Part 11 Compliance
- Electronic signatures implemented
- Audit trail for all data changes
- User access controls and authentication
- Data integrity validation

### Documentation Required
- System validation documents (IQ/OQ/PQ)
- Security risk assessment
- Standard operating procedures
- Change control procedures
- Incident response plan

## Maintenance & Updates

### Regular Maintenance Tasks
- [ ] Security patches applied monthly
- [ ] SSL certificate renewal (automated)
- [ ] Database maintenance windows scheduled
- [ ] Log rotation and cleanup
- [ ] Backup verification tests

### Update Procedures
1. Test updates in staging environment
2. Schedule maintenance window
3. Create system backup
4. Deploy updates with blue-green deployment
5. Validate system functionality
6. Monitor for issues post-deployment

## Troubleshooting

### Common Issues

#### Database Connection Errors
```bash
# Check database connectivity
pg_isready -h $DB_HOST -p 5432

# Monitor active connections
SELECT count(*) FROM pg_stat_activity;

# Check for long-running queries
SELECT pid, now() - pg_stat_activity.query_start AS duration, query 
FROM pg_stat_activity 
WHERE (now() - pg_stat_activity.query_start) > interval '5 minutes';
```

#### SSO Authentication Issues
```bash
# Check SSO provider status
curl -I https://login.microsoftonline.com/common/oauth2/v2.0/authorize
curl -I https://accounts.google.com/o/oauth2/v2/auth

# Validate JWT tokens
echo $JWT_TOKEN | base64 -d | jq .

# Check application logs for auth errors
kubectl logs -f deployment/virtualbackroom-api -n virtualbackroom-prod | grep "auth"
```

#### Performance Issues
```bash
# Monitor CPU and memory usage
kubectl top pods -n virtualbackroom-prod

# Check database performance
SELECT schemaname,tablename,attname,avg_width,n_distinct 
FROM pg_stats 
WHERE tablename = 'users' OR tablename = 'documents';

# Redis memory usage
redis-cli INFO memory
```

## Support & Escalation

### Level 1 Support
- Application restarts
- Basic health checks
- Log analysis

### Level 2 Support  
- Database optimization
- Infrastructure scaling
- Security incident response

### Level 3 Support
- Core application bugs
- Architecture changes
- Compliance violations

### Emergency Contacts
- **DevOps Team**: devops@virtualbackroom.ai
- **Security Team**: security@virtualbackroom.ai  
- **Compliance Team**: compliance@virtualbackroom.ai

## Conclusion

This production deployment guide ensures VirtualBackroom.ai V2.0 is deployed securely, reliably, and in compliance with regulatory requirements. Regular monitoring, maintenance, and updates are critical for ongoing success.

For additional support or questions, contact the technical team at support@virtualbackroom.ai.