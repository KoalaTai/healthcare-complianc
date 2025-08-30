/**
 * Enhanced Database Schema with Enterprise SSO and Audit Trail Support
 * 
 * This schema supports multi-tenant architecture with enterprise authentication
 * and comprehensive audit trails for 21 CFR Part 11 compliance.
 */

-- Enable UUID extension for PostgreSQL
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable Row Level Security
ALTER DATABASE virtualbackroom_v2 SET row_security = on;

-- Organizations table (multi-tenant root)
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    domain VARCHAR(255) NOT NULL UNIQUE,
    sso_provider VARCHAR(50) CHECK (sso_provider IN ('microsoft', 'google', 'okta', 'none')),
    sso_enabled BOOLEAN DEFAULT FALSE,
    sso_config JSONB, -- Store SAML/OIDC configuration
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    
    -- Audit fields
    created_by UUID,
    updated_by UUID
);

-- Users table with enterprise authentication support
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Identity information
    email VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    picture_url TEXT,
    
    -- SSO integration
    sso_provider VARCHAR(50),
    sso_subject_id VARCHAR(255), -- Subject ID from SSO provider
    external_id VARCHAR(255), -- External ID from SSO provider
    
    -- Security
    roles JSONB DEFAULT '[]', -- Array of role strings
    mfa_enabled BOOLEAN DEFAULT FALSE,
    last_login TIMESTAMP WITH TIME ZONE,
    session_timeout INTEGER DEFAULT 28800, -- 8 hours
    
    -- Status
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    email_verified BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    
    -- Audit fields
    created_by UUID,
    updated_by UUID,
    
    -- Constraints
    UNIQUE(organization_id, email),
    UNIQUE(sso_provider, sso_subject_id)
);

-- Documents table with enhanced security
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    uploaded_by UUID NOT NULL REFERENCES users(id),
    
    -- Document metadata
    filename VARCHAR(500) NOT NULL,
    original_filename VARCHAR(500) NOT NULL,
    content_type VARCHAR(100) NOT NULL,
    file_size BIGINT NOT NULL,
    
    -- Storage information
    s3_bucket VARCHAR(255) NOT NULL,
    s3_key VARCHAR(1000) NOT NULL,
    s3_version_id VARCHAR(255),
    
    -- Document classification
    document_type VARCHAR(100),
    classification VARCHAR(50) DEFAULT 'internal', -- internal, confidential, restricted
    retention_policy VARCHAR(100),
    
    -- Security
    encrypted BOOLEAN DEFAULT TRUE,
    checksum_sha256 VARCHAR(64),
    
    -- Status
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'archived', 'deleted')),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    
    -- Audit fields
    created_by UUID NOT NULL,
    updated_by UUID
);

-- Analysis reports with enhanced tracking
CREATE TABLE analysis_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    analyzed_by UUID NOT NULL REFERENCES users(id),
    
    -- Analysis configuration
    regulation_standard VARCHAR(100) NOT NULL,
    regulation_version VARCHAR(20),
    ai_model_used VARCHAR(100) NOT NULL,
    ai_model_version VARCHAR(50),
    
    -- Results
    analysis_results JSONB NOT NULL,
    findings_count INTEGER DEFAULT 0,
    critical_findings_count INTEGER DEFAULT 0,
    confidence_score DECIMAL(5,2),
    
    -- Processing information
    processing_time_seconds INTEGER,
    tokens_used INTEGER,
    cost_usd DECIMAL(10,4),
    
    -- Report generation
    pdf_generated BOOLEAN DEFAULT FALSE,
    pdf_s3_key VARCHAR(1000),
    report_hash VARCHAR(64), -- For integrity verification
    
    -- Status tracking
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
    error_message TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Audit fields
    created_by UUID NOT NULL,
    updated_by UUID
);

-- Comprehensive audit trail for 21 CFR Part 11 compliance
CREATE TABLE audit_trail (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Event information
    event_type VARCHAR(100) NOT NULL, -- CREATE, READ, UPDATE, DELETE, LOGIN, LOGOUT
    table_name VARCHAR(100), -- Table affected (if applicable)
    record_id UUID, -- Record affected (if applicable)
    
    -- User context
    user_id UUID REFERENCES users(id),
    user_email VARCHAR(255),
    user_ip_address INET,
    user_agent TEXT,
    session_id VARCHAR(255),
    
    -- Change details
    old_values JSONB,
    new_values JSONB,
    change_reason TEXT,
    
    -- System context
    request_id VARCHAR(100), -- For tracing requests across services
    api_endpoint VARCHAR(500),
    http_method VARCHAR(10),
    response_status INTEGER,
    
    -- Compliance fields
    event_timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    event_significance VARCHAR(50) DEFAULT 'routine', -- routine, significant, critical
    regulatory_impact BOOLEAN DEFAULT FALSE,
    
    -- Immutability protection
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    -- Index for performance
    INDEX idx_audit_trail_org_time (organization_id, event_timestamp),
    INDEX idx_audit_trail_user_time (user_id, event_timestamp),
    INDEX idx_audit_trail_table_record (table_name, record_id)
);

-- Model performance tracking
CREATE TABLE model_performance_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Model information
    model_name VARCHAR(100) NOT NULL,
    model_provider VARCHAR(50) NOT NULL,
    model_version VARCHAR(50),
    
    -- Performance metrics
    accuracy_percentage DECIMAL(5,2),
    average_latency_seconds DECIMAL(8,3),
    cost_per_request_usd DECIMAL(10,6),
    throughput_requests_per_hour INTEGER,
    error_rate_percentage DECIMAL(5,2),
    user_satisfaction_score DECIMAL(3,2), -- 1.0 to 5.0
    
    -- Context
    regulation_standard VARCHAR(100),
    document_count INTEGER DEFAULT 1,
    measurement_period_start TIMESTAMP WITH TIME ZONE,
    measurement_period_end TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    recorded_by UUID REFERENCES users(id)
);

-- Regulatory standards library
CREATE TABLE regulatory_standards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Standard identification
    standard_code VARCHAR(50) NOT NULL UNIQUE, -- e.g., "21_CFR_820", "ISO_13485"
    title VARCHAR(500) NOT NULL,
    issuing_authority VARCHAR(255) NOT NULL,
    version VARCHAR(50),
    effective_date DATE,
    
    -- Content
    description TEXT,
    scope TEXT,
    key_requirements JSONB, -- Structured requirements data
    
    -- AI training data
    training_examples JSONB, -- Examples for AI model training
    gap_analysis_prompts JSONB, -- Specific prompts for this standard
    
    -- Metadata
    category VARCHAR(100), -- medical_device, pharmaceutical, software
    region VARCHAR(100), -- US, EU, global
    complexity_level INTEGER CHECK (complexity_level BETWEEN 1 AND 5),
    
    -- Status
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'draft', 'deprecated')),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Version control
    version_number INTEGER DEFAULT 1,
    supersedes_id UUID REFERENCES regulatory_standards(id)
);

-- User sessions for security tracking
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Session data
    session_token VARCHAR(500) NOT NULL UNIQUE,
    ip_address INET,
    user_agent TEXT,
    
    -- SSO context
    sso_session_id VARCHAR(255),
    sso_provider VARCHAR(50),
    
    -- Security
    mfa_verified BOOLEAN DEFAULT FALSE,
    risk_score INTEGER DEFAULT 0, -- 0-100, higher = riskier
    
    -- Lifecycle
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE,
    terminated_at TIMESTAMP WITH TIME ZONE,
    termination_reason VARCHAR(100) -- logout, timeout, security, admin
);

-- Row Level Security Policies

-- Organizations: Users can only access their own organization
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
CREATE POLICY org_isolation ON organizations 
    FOR ALL TO authenticated_users 
    USING (id = current_setting('app.current_organization_id')::UUID);

-- Users: Users can only see users in their organization
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY user_org_isolation ON users 
    FOR ALL TO authenticated_users 
    USING (organization_id = current_setting('app.current_organization_id')::UUID);

-- Documents: Strict organization isolation
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY document_org_isolation ON documents 
    FOR ALL TO authenticated_users 
    USING (organization_id = current_setting('app.current_organization_id')::UUID);

-- Analysis Reports: Organization isolation
ALTER TABLE analysis_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY analysis_org_isolation ON analysis_reports 
    FOR ALL TO authenticated_users 
    USING (organization_id = current_setting('app.current_organization_id')::UUID);

-- Audit Trail: Organization isolation (read-only for users)
ALTER TABLE audit_trail ENABLE ROW LEVEL SECURITY;
CREATE POLICY audit_org_isolation ON audit_trail 
    FOR SELECT TO authenticated_users 
    USING (organization_id = current_setting('app.current_organization_id')::UUID);

-- Performance Metrics: Organization isolation
ALTER TABLE model_performance_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY metrics_org_isolation ON model_performance_metrics 
    FOR ALL TO authenticated_users 
    USING (organization_id = current_setting('app.current_organization_id')::UUID OR organization_id IS NULL);

-- User Sessions: Users can only see their own sessions
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY session_user_isolation ON user_sessions 
    FOR ALL TO authenticated_users 
    USING (user_id = current_setting('app.current_user_id')::UUID);

-- Database roles for application security
CREATE ROLE authenticated_users;
CREATE ROLE application_service;
CREATE ROLE read_only_reporting;

-- Grant appropriate permissions
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO application_service;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO read_only_reporting;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO application_service;

-- Indexes for performance
CREATE INDEX idx_documents_org_created ON documents(organization_id, created_at DESC);
CREATE INDEX idx_analysis_reports_org_created ON analysis_reports(organization_id, created_at DESC);
CREATE INDEX idx_analysis_reports_status ON analysis_reports(status) WHERE status IN ('pending', 'processing');
CREATE INDEX idx_users_org_email ON users(organization_id, email);
CREATE INDEX idx_audit_trail_org_time ON audit_trail(organization_id, event_timestamp DESC);
CREATE INDEX idx_sessions_user_active ON user_sessions(user_id, last_activity) WHERE terminated_at IS NULL;

-- Triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_analysis_reports_updated_at BEFORE UPDATE ON analysis_reports FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_regulatory_standards_updated_at BEFORE UPDATE ON regulatory_standards FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample regulatory standards
INSERT INTO regulatory_standards (standard_code, title, issuing_authority, version, effective_date, description, category, region, complexity_level) VALUES
('21_CFR_820', 'Quality System Regulation', 'FDA', '2022', '1996-10-07', 'US FDA medical device quality management requirements', 'medical_device', 'US', 4),
('ISO_13485', 'Medical devices - Quality management systems', 'ISO', '2016', '2016-03-01', 'International standard for medical device quality management', 'medical_device', 'global', 4),
('ISO_14971', 'Medical devices - Application of risk management', 'ISO', '2019', '2019-12-01', 'Risk management for medical devices', 'medical_device', 'global', 5),
('IEC_62304', 'Medical device software - Software life cycle processes', 'IEC', '2006+A1:2015', '2015-06-01', 'Software development lifecycle for medical device software', 'medical_device', 'global', 5),
('GDPR', 'General Data Protection Regulation', 'EU', '2018', '2018-05-25', 'European data protection and privacy regulation', 'data_protection', 'EU', 3),
('HIPAA', 'Health Insurance Portability and Accountability Act', 'HHS', '2013', '2013-01-25', 'US healthcare privacy and security requirements', 'data_protection', 'US', 3),
('SOX', 'Sarbanes-Oxley Act', 'SEC', '2002', '2002-07-30', 'Financial reporting and corporate governance', 'financial', 'US', 4),
('ISO_27001', 'Information security management systems', 'ISO', '2022', '2022-10-01', 'Information security management standard', 'cybersecurity', 'global', 4);

-- Initial seed data for development
INSERT INTO organizations (id, name, domain, sso_provider, sso_enabled, settings) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'Contoso Medical Devices', 'contoso.com', 'microsoft', true, '{"requireMfa": true, "sessionTimeout": 28800, "allowedDomains": ["contoso.com", "contoso-lab.com"]}'),
('550e8400-e29b-41d4-a716-446655440001', 'Acme MedTech Solutions', 'acmemedtech.com', 'google', true, '{"requireMfa": true, "sessionTimeout": 14400, "allowedDomains": ["acmemedtech.com"]}'),
('550e8400-e29b-41d4-a716-446655440002', 'GlobalMed Enterprise', 'globalmed.enterprise', 'okta', true, '{"requireMfa": true, "sessionTimeout": 43200, "allowedDomains": ["globalmed.enterprise", "globalmed-labs.com"]}');

INSERT INTO users (id, organization_id, email, name, sso_provider, sso_subject_id, roles, mfa_enabled, status, email_verified) VALUES
('660e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', 'john.doe@contoso.com', 'John Doe', 'microsoft', 'azure-ad-subject-123', '["quality_manager", "document_reviewer"]', true, 'active', true),
('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'sarah.chen@acmemedtech.com', 'Sarah Chen', 'google', 'google-subject-456', '["regulatory_specialist", "admin"]', true, 'active', true),
('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 'mike.rodriguez@globalmed.enterprise', 'Mike Rodriguez', 'okta', 'okta-subject-789', '["compliance_officer", "system_admin"]', true, 'active', true);

-- Function to set application context for RLS
CREATE OR REPLACE FUNCTION set_app_context(user_id UUID, organization_id UUID)
RETURNS void AS $$
BEGIN
    PERFORM set_config('app.current_user_id', user_id::text, true);
    PERFORM set_config('app.current_organization_id', organization_id::text, true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Views for common queries

-- Active user sessions view
CREATE VIEW active_user_sessions AS
SELECT 
    s.id,
    s.user_id,
    u.email,
    u.name,
    s.organization_id,
    o.name as organization_name,
    s.created_at as login_time,
    s.last_activity,
    s.expires_at,
    s.ip_address,
    s.sso_provider,
    s.mfa_verified
FROM user_sessions s
JOIN users u ON s.user_id = u.id
JOIN organizations o ON s.organization_id = o.id
WHERE s.terminated_at IS NULL 
    AND s.expires_at > CURRENT_TIMESTAMP;

-- Document analysis summary view
CREATE VIEW document_analysis_summary AS
SELECT 
    d.id as document_id,
    d.filename,
    d.uploaded_by,
    u.name as uploaded_by_name,
    d.created_at as upload_date,
    COUNT(ar.id) as analysis_count,
    MAX(ar.created_at) as last_analysis_date,
    AVG(ar.confidence_score) as avg_confidence,
    SUM(ar.findings_count) as total_findings,
    SUM(ar.critical_findings_count) as total_critical_findings
FROM documents d
JOIN users u ON d.uploaded_by = u.id
LEFT JOIN analysis_reports ar ON d.id = ar.document_id AND ar.status = 'completed'
WHERE d.status = 'active'
GROUP BY d.id, d.filename, d.uploaded_by, u.name, d.created_at;

-- Organization compliance dashboard view
CREATE VIEW organization_compliance_dashboard AS
SELECT 
    o.id as organization_id,
    o.name as organization_name,
    COUNT(DISTINCT u.id) as total_users,
    COUNT(DISTINCT d.id) as total_documents,
    COUNT(DISTINCT ar.id) as total_analyses,
    COUNT(DISTINCT ar.id) FILTER (WHERE ar.created_at >= CURRENT_DATE - INTERVAL '30 days') as analyses_last_30_days,
    AVG(ar.confidence_score) as avg_confidence_score,
    SUM(ar.critical_findings_count) as total_critical_findings,
    MAX(ar.created_at) as last_analysis_date
FROM organizations o
LEFT JOIN users u ON o.id = u.organization_id AND u.status = 'active'
LEFT JOIN documents d ON o.id = d.organization_id AND d.status = 'active'
LEFT JOIN analysis_reports ar ON o.id = ar.organization_id AND ar.status = 'completed'
GROUP BY o.id, o.name;

COMMENT ON TABLE organizations IS 'Multi-tenant organization records with SSO configuration';
COMMENT ON TABLE users IS 'User accounts with enterprise SSO integration and RBAC';
COMMENT ON TABLE documents IS 'Encrypted document storage with full audit trail';
COMMENT ON TABLE analysis_reports IS 'AI analysis results with compliance tracking';
COMMENT ON TABLE audit_trail IS '21 CFR Part 11 compliant audit trail for all system events';
COMMENT ON TABLE model_performance_metrics IS 'AI model performance tracking for continuous improvement';
COMMENT ON TABLE regulatory_standards IS 'Library of regulatory standards for gap analysis';
COMMENT ON TABLE user_sessions IS 'Secure session management with SSO integration';