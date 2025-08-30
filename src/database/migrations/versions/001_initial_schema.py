"""
Initial database schema for VirtualBackroom.ai V2.0
Multi-tenant architecture with comprehensive audit trails

Revision ID: 001_initial_schema
Revises: 
Create Date: 2024-12-19 14:30:00.000000
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
from datetime import datetime, timezone

# revision identifiers
revision = '001_initial_schema'
down_revision = None
branch_labels = None
depends_on = None

def upgrade() -> None:
    """Create initial multi-tenant schema with audit trail capabilities"""
    
    # ========================================================================
    # CREATE ENUM TYPES
    # ========================================================================
    
    # User roles enum
    user_role_enum = postgresql.ENUM(
        'viewer', 'analyst', 'quality_manager', 'admin', 'owner',
        name='userrole',
        create_type=True
    )
    
    # Organization types enum
    org_type_enum = postgresql.ENUM(
        'medical_device', 'pharmaceutical', 'biotechnology', 
        'contract_research', 'consulting', 'other',
        name='organizationtype',
        create_type=True
    )
    
    # Document types enum
    doc_type_enum = postgresql.ENUM(
        'sop', 'work_instruction', 'quality_manual', 'risk_assessment',
        'validation_protocol', 'design_control', 'corrective_action', 'other',
        name='documenttype',
        create_type=True
    )
    
    # Analysis status enum
    analysis_status_enum = postgresql.ENUM(
        'pending', 'processing', 'completed', 'failed', 'cancelled',
        name='analysisstatus',
        create_type=True
    )
    
    # Audit action enum
    audit_action_enum = postgresql.ENUM(
        'create', 'read', 'update', 'delete', 'export', 
        'login', 'logout', 'permission_change',
        name='auditaction',
        create_type=True
    )
    
    # Regulatory standards enum
    regulatory_standard_enum = postgresql.ENUM(
        'iso_13485', 'iec_62304', 'cfr_820', 'iso_14971', 'ich_q9',
        name='regulatorystandard', 
        create_type=True
    )
    
    # ========================================================================
    # CREATE ORGANIZATIONS TABLE (TENANT ROOT)
    # ========================================================================
    
    op.create_table('organizations',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('slug', sa.String(100), nullable=False, unique=True),
        sa.Column('organization_type', org_type_enum, nullable=False),
        
        # Subscription and billing
        sa.Column('subscription_tier', sa.String(50), default='trial'),
        sa.Column('subscription_expires_at', sa.DateTime(timezone=True)),
        sa.Column('max_users', sa.Integer(), default=5),
        sa.Column('max_monthly_analyses', sa.Integer(), default=50),
        
        # Contact information
        sa.Column('primary_contact_email', sa.String(255), nullable=False),
        sa.Column('billing_email', sa.String(255)),
        sa.Column('phone', sa.String(50)),
        sa.Column('address', sa.Text()),
        
        # Regulatory context
        sa.Column('primary_markets', sa.JSON()),
        sa.Column('applicable_standards', sa.JSON()),
        
        # Security settings
        sa.Column('require_2fa', sa.Boolean(), default=False),
        sa.Column('session_timeout_minutes', sa.Integer(), default=480),
        sa.Column('data_retention_days', sa.Integer(), default=2555),
        
        # System metadata
        sa.Column('created_at', sa.DateTime(timezone=True), default=datetime.now(timezone.utc)),
        sa.Column('updated_at', sa.DateTime(timezone=True), default=datetime.now(timezone.utc)),
        sa.Column('created_by', postgresql.UUID(as_uuid=True)),
        sa.Column('is_active', sa.Boolean(), default=True),
        
        # Constraints
        sa.CheckConstraint('max_users > 0', name='check_max_users_positive'),
        sa.CheckConstraint('max_monthly_analyses > 0', name='check_max_analyses_positive'),
    )
    
    # Indexes for organizations
    op.create_index('ix_org_slug', 'organizations', ['slug'])
    op.create_index('ix_org_active', 'organizations', ['is_active'])
    
    # ========================================================================
    # CREATE USERS TABLE
    # ========================================================================
    
    op.create_table('users',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('organization_id', postgresql.UUID(as_uuid=True), nullable=False),
        
        # Identity
        sa.Column('email', sa.String(255), nullable=False, unique=True),
        sa.Column('first_name', sa.String(100), nullable=False),
        sa.Column('last_name', sa.String(100), nullable=False),
        
        # SSO Authentication
        sa.Column('external_id', sa.String(255)),
        sa.Column('sso_provider', sa.String(50)),
        
        # Authorization
        sa.Column('role', user_role_enum, nullable=False, default='viewer'),
        sa.Column('permissions', sa.JSON(), default=[]),
        
        # Security
        sa.Column('is_active', sa.Boolean(), default=True),
        sa.Column('email_verified', sa.Boolean(), default=False),
        sa.Column('mfa_enabled', sa.Boolean(), default=False),
        sa.Column('mfa_secret', sa.LargeBinary()),
        
        # Session management
        sa.Column('last_login', sa.DateTime(timezone=True)),
        sa.Column('login_count', sa.Integer(), default=0),
        sa.Column('failed_login_attempts', sa.Integer(), default=0),
        sa.Column('locked_until', sa.DateTime(timezone=True)),
        
        # Compliance
        sa.Column('training_completed', sa.JSON(), default=[]),
        sa.Column('last_password_change', sa.DateTime(timezone=True)),
        
        # System metadata
        sa.Column('created_at', sa.DateTime(timezone=True), default=datetime.now(timezone.utc)),
        sa.Column('updated_at', sa.DateTime(timezone=True), default=datetime.now(timezone.utc)),
        sa.Column('created_by', postgresql.UUID(as_uuid=True)),
        
        # Foreign keys
        sa.ForeignKeyConstraint(['organization_id'], ['organizations.id'], name='fk_user_organization'),
        sa.ForeignKeyConstraint(['created_by'], ['users.id'], name='fk_user_creator'),
        
        # Unique constraints
        sa.UniqueConstraint('external_id', 'sso_provider', name='uq_external_sso'),
    )
    
    # Indexes for users
    op.create_index('ix_user_email', 'users', ['email'])
    op.create_index('ix_user_org_role', 'users', ['organization_id', 'role'])
    op.create_index('ix_user_external_id', 'users', ['external_id', 'sso_provider'])
    op.create_index('ix_user_active', 'users', ['is_active'])
    
    # ========================================================================
    # CREATE DOCUMENTS TABLE
    # ========================================================================
    
    op.create_table('documents',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('organization_id', postgresql.UUID(as_uuid=True), nullable=False),
        
        # Document metadata
        sa.Column('filename', sa.String(255), nullable=False),
        sa.Column('original_filename', sa.String(255), nullable=False),
        sa.Column('document_type', doc_type_enum, nullable=False),
        
        # File storage
        sa.Column('s3_bucket', sa.String(100), nullable=False),
        sa.Column('s3_key', sa.String(500), nullable=False),
        sa.Column('file_size', sa.Integer(), nullable=False),
        sa.Column('content_hash', sa.String(64), nullable=False),
        sa.Column('mime_type', sa.String(100), nullable=False),
        
        # Document details
        sa.Column('title', sa.String(500)),
        sa.Column('description', sa.Text()),
        sa.Column('version', sa.String(50)),
        sa.Column('effective_date', sa.DateTime(timezone=True)),
        sa.Column('review_date', sa.DateTime(timezone=True)),
        
        # Processing
        sa.Column('is_processed', sa.Boolean(), default=False),
        sa.Column('processing_error', sa.Text()),
        
        # Compliance
        sa.Column('is_controlled_document', sa.Boolean(), default=True),
        sa.Column('approval_status', sa.String(50), default='draft'),
        sa.Column('approved_by', postgresql.UUID(as_uuid=True)),
        sa.Column('approved_at', sa.DateTime(timezone=True)),
        
        # System metadata
        sa.Column('created_at', sa.DateTime(timezone=True), default=datetime.now(timezone.utc)),
        sa.Column('updated_at', sa.DateTime(timezone=True), default=datetime.now(timezone.utc)),
        sa.Column('created_by', postgresql.UUID(as_uuid=True), nullable=False),
        
        # Foreign keys
        sa.ForeignKeyConstraint(['organization_id'], ['organizations.id'], name='fk_doc_organization'),
        sa.ForeignKeyConstraint(['created_by'], ['users.id'], name='fk_doc_creator'),
        sa.ForeignKeyConstraint(['approved_by'], ['users.id'], name='fk_doc_approver'),
        
        # Unique constraints
        sa.UniqueConstraint('s3_bucket', 's3_key', name='uq_s3_location'),
    )
    
    # Indexes for documents
    op.create_index('ix_doc_org_type', 'documents', ['organization_id', 'document_type'])
    op.create_index('ix_doc_s3_location', 'documents', ['s3_bucket', 's3_key'])
    op.create_index('ix_doc_hash', 'documents', ['content_hash'])
    op.create_index('ix_doc_controlled', 'documents', ['is_controlled_document', 'approval_status'])
    
    # ========================================================================
    # CREATE ANALYSES TABLE  
    # ========================================================================
    
    op.create_table('analyses',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('organization_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('document_id', postgresql.UUID(as_uuid=True), nullable=False),
        
        # Analysis configuration
        sa.Column('regulatory_standard', regulatory_standard_enum, nullable=False),
        sa.Column('analysis_type', sa.String(100), default='gap_analysis'),
        
        # Processing information
        sa.Column('status', analysis_status_enum, default='pending', nullable=False),
        sa.Column('started_at', sa.DateTime(timezone=True)),
        sa.Column('completed_at', sa.DateTime(timezone=True)),
        sa.Column('processing_time_seconds', sa.Integer()),
        
        # AI model traceability
        sa.Column('ai_model', sa.String(100)),
        sa.Column('ai_model_version', sa.String(50)),
        sa.Column('prompt_template_version', sa.String(50)),
        
        # Results
        sa.Column('findings_summary', sa.Text()),
        sa.Column('detailed_findings', sa.JSON()),
        sa.Column('confidence_score', sa.Integer()),
        sa.Column('risk_level', sa.String(50)),
        sa.Column('identified_gaps', sa.JSON()),
        sa.Column('recommendations', sa.JSON()),
        sa.Column('citations', sa.JSON()),
        
        # Report generation
        sa.Column('report_generated', sa.Boolean(), default=False),
        sa.Column('report_s3_key', sa.String(500)),
        sa.Column('report_hash', sa.String(64)),
        
        # Error handling
        sa.Column('error_message', sa.Text()),
        sa.Column('retry_count', sa.Integer(), default=0),
        
        # System metadata
        sa.Column('created_at', sa.DateTime(timezone=True), default=datetime.now(timezone.utc)),
        sa.Column('updated_at', sa.DateTime(timezone=True), default=datetime.now(timezone.utc)),
        sa.Column('created_by', postgresql.UUID(as_uuid=True), nullable=False),
        
        # Foreign keys
        sa.ForeignKeyConstraint(['organization_id'], ['organizations.id'], name='fk_analysis_organization'),
        sa.ForeignKeyConstraint(['document_id'], ['documents.id'], name='fk_analysis_document'),
        sa.ForeignKeyConstraint(['created_by'], ['users.id'], name='fk_analysis_creator'),
        
        # Unique constraints
        sa.UniqueConstraint('document_id', 'regulatory_standard', name='uq_document_standard_analysis'),
    )
    
    # Indexes for analyses
    op.create_index('ix_analysis_org_status', 'analyses', ['organization_id', 'status'])
    op.create_index('ix_analysis_document', 'analyses', ['document_id'])
    op.create_index('ix_analysis_standard', 'analyses', ['regulatory_standard'])
    op.create_index('ix_analysis_created', 'analyses', ['created_at'])
    
    # ========================================================================
    # CREATE AUDIT TRAIL TABLE (21 CFR Part 11 Compliance)
    # ========================================================================
    
    op.create_table('audit_trail',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        
        # Who performed the action
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('organization_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_email', sa.String(255), nullable=False),
        sa.Column('user_role', sa.String(50), nullable=False),
        
        # What action was performed
        sa.Column('action', audit_action_enum, nullable=False),
        sa.Column('object_type', sa.String(100), nullable=False),
        sa.Column('object_id', postgresql.UUID(as_uuid=True)),
        sa.Column('object_name', sa.String(500)),
        
        # When and where
        sa.Column('timestamp', sa.DateTime(timezone=True), nullable=False, default=datetime.now(timezone.utc)),
        sa.Column('ip_address', sa.String(45)),
        sa.Column('user_agent', sa.Text()),
        sa.Column('session_id', sa.String(255)),
        
        # Change details
        sa.Column('field_name', sa.String(100)),
        sa.Column('old_value', sa.Text()),
        sa.Column('new_value', sa.Text()),
        sa.Column('change_reason', sa.Text()),
        
        # Compliance metadata
        sa.Column('regulatory_significance', sa.Boolean(), default=True),
        sa.Column('requires_review', sa.Boolean(), default=False),
        sa.Column('reviewed_by', postgresql.UUID(as_uuid=True)),
        sa.Column('reviewed_at', sa.DateTime(timezone=True)),
        
        # Electronic signatures
        sa.Column('electronic_signature', sa.Text()),
        sa.Column('signature_method', sa.String(100)),
        
        # Additional context
        sa.Column('request_id', sa.String(100)),
        sa.Column('additional_metadata', sa.JSON()),
        
        # Foreign keys
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], name='fk_audit_user'),
        sa.ForeignKeyConstraint(['organization_id'], ['organizations.id'], name='fk_audit_organization'),
        sa.ForeignKeyConstraint(['reviewed_by'], ['users.id'], name='fk_audit_reviewer'),
    )
    
    # Critical indexes for audit trail performance
    op.create_index('ix_audit_user_timestamp', 'audit_trail', ['user_id', 'timestamp'])
    op.create_index('ix_audit_org_timestamp', 'audit_trail', ['organization_id', 'timestamp'])
    op.create_index('ix_audit_object', 'audit_trail', ['object_type', 'object_id'])
    op.create_index('ix_audit_action', 'audit_trail', ['action'])
    op.create_index('ix_audit_regulatory', 'audit_trail', ['regulatory_significance', 'timestamp'])
    
    # ========================================================================
    # CREATE REGULATORY REQUIREMENTS TABLE
    # ========================================================================
    
    op.create_table('regulatory_requirements',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        
        # Requirement identification
        sa.Column('standard', regulatory_standard_enum, nullable=False),
        sa.Column('section_number', sa.String(100), nullable=False),
        sa.Column('title', sa.String(500), nullable=False),
        
        # Content
        sa.Column('requirement_text', sa.Text(), nullable=False),
        sa.Column('interpretation_notes', sa.Text()),
        sa.Column('implementation_guidance', sa.Text()),
        
        # Categorization
        sa.Column('category', sa.String(100)),
        sa.Column('subcategory', sa.String(100)),
        sa.Column('keywords', sa.JSON()),
        
        # Relationships
        sa.Column('related_requirements', sa.JSON()),
        sa.Column('superseded_by', postgresql.UUID(as_uuid=True)),
        
        # Currency tracking
        sa.Column('is_current', sa.Boolean(), default=True),
        sa.Column('effective_date', sa.DateTime(timezone=True)),
        sa.Column('last_reviewed', sa.DateTime(timezone=True)),
        sa.Column('next_review_date', sa.DateTime(timezone=True)),
        
        # System metadata
        sa.Column('created_at', sa.DateTime(timezone=True), default=datetime.now(timezone.utc)),
        sa.Column('updated_at', sa.DateTime(timezone=True), default=datetime.now(timezone.utc)),
        
        # Foreign keys
        sa.ForeignKeyConstraint(['superseded_by'], ['regulatory_requirements.id'], name='fk_req_superseded'),
        
        # Unique constraints
        sa.UniqueConstraint('standard', 'section_number', name='uq_standard_section'),
    )
    
    # Indexes for regulatory requirements
    op.create_index('ix_req_standard_section', 'regulatory_requirements', ['standard', 'section_number'])
    op.create_index('ix_req_current', 'regulatory_requirements', ['is_current'])
    op.create_index('ix_req_category', 'regulatory_requirements', ['category', 'subcategory'])
    
    # ========================================================================
    # CREATE SYSTEM SETTINGS TABLE
    # ========================================================================
    
    op.create_table('system_settings',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('organization_id', postgresql.UUID(as_uuid=True)),  # NULL for global settings
        
        # Setting identification
        sa.Column('setting_key', sa.String(255), nullable=False),
        sa.Column('setting_category', sa.String(100), nullable=False),
        
        # Setting value
        sa.Column('setting_value', sa.Text(), nullable=False),
        sa.Column('value_type', sa.String(50), default='string'),
        sa.Column('description', sa.Text()),
        sa.Column('is_sensitive', sa.Boolean(), default=False),
        
        # Validation
        sa.Column('validation_rules', sa.JSON()),
        sa.Column('default_value', sa.Text()),
        sa.Column('is_required', sa.Boolean(), default=False),
        
        # Change management
        sa.Column('requires_approval', sa.Boolean(), default=False),
        sa.Column('approved_by', postgresql.UUID(as_uuid=True)),
        sa.Column('approved_at', sa.DateTime(timezone=True)),
        
        # System metadata
        sa.Column('created_at', sa.DateTime(timezone=True), default=datetime.now(timezone.utc)),
        sa.Column('updated_at', sa.DateTime(timezone=True), default=datetime.now(timezone.utc)),
        sa.Column('created_by', postgresql.UUID(as_uuid=True)),
        
        # Foreign keys
        sa.ForeignKeyConstraint(['organization_id'], ['organizations.id'], name='fk_setting_organization'),
        sa.ForeignKeyConstraint(['created_by'], ['users.id'], name='fk_setting_creator'),
        sa.ForeignKeyConstraint(['approved_by'], ['users.id'], name='fk_setting_approver'),
        
        # Unique constraints
        sa.UniqueConstraint('organization_id', 'setting_key', name='uq_org_setting'),
    )
    
    # Indexes for system settings
    op.create_index('ix_setting_org_key', 'system_settings', ['organization_id', 'setting_key'])
    op.create_index('ix_setting_category', 'system_settings', ['setting_category'])
    
    # ========================================================================
    # ENABLE ROW LEVEL SECURITY (RLS) FOR MULTI-TENANT ISOLATION
    # ========================================================================
    
    # Create application role for RLS policies
    op.execute("""
        DO $$
        BEGIN
            IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'application_role') THEN
                CREATE ROLE application_role;
            END IF;
        END
        $$;
    """)
    
    # Enable RLS on all tenant-isolated tables
    rls_tables = ['organizations', 'users', 'documents', 'analyses', 'audit_trail', 'system_settings']
    
    for table in rls_tables:
        op.execute(f"ALTER TABLE {table} ENABLE ROW LEVEL SECURITY;")
    
    # Create RLS policies for tenant isolation
    op.execute("""
        -- Organizations: Users can only access their own organization
        CREATE POLICY org_tenant_isolation ON organizations
            FOR ALL
            TO application_role
            USING (id = current_setting('app.current_organization_id', true)::uuid);
            
        -- Users: Can only access users in same organization  
        CREATE POLICY user_tenant_isolation ON users
            FOR ALL
            TO application_role
            USING (organization_id = current_setting('app.current_organization_id', true)::uuid);
            
        -- Documents: Isolated by organization
        CREATE POLICY doc_tenant_isolation ON documents
            FOR ALL
            TO application_role
            USING (organization_id = current_setting('app.current_organization_id', true)::uuid);
            
        -- Analyses: Isolated by organization
        CREATE POLICY analysis_tenant_isolation ON analyses
            FOR ALL
            TO application_role
            USING (organization_id = current_setting('app.current_organization_id', true)::uuid);
            
        -- Audit Trail: Isolated by organization with compliance officer exception
        CREATE POLICY audit_tenant_isolation ON audit_trail
            FOR ALL
            TO application_role
            USING (
                organization_id = current_setting('app.current_organization_id', true)::uuid
                OR current_setting('app.current_user_role', true) = 'compliance_officer'
            );
            
        -- System Settings: Org-specific settings isolated, global settings visible to all
        CREATE POLICY settings_tenant_isolation ON system_settings
            FOR ALL
            TO application_role
            USING (
                organization_id IS NULL 
                OR organization_id = current_setting('app.current_organization_id', true)::uuid
            );
    """)
    
    # ========================================================================
    # CREATE PERFORMANCE OPTIMIZATION INDEXES
    # ========================================================================
    
    # Composite indexes for common query patterns
    op.create_index('ix_doc_org_type_status', 'documents', ['organization_id', 'document_type', 'approval_status'])
    op.create_index('ix_doc_created_recent', 'documents', ['organization_id', sa.text('created_at DESC')])
    op.create_index('ix_analysis_org_recent', 'analyses', ['organization_id', sa.text('created_at DESC')])
    op.create_index('ix_analysis_status_started', 'analyses', ['status', 'started_at'])
    op.create_index('ix_user_org_active', 'users', ['organization_id', 'is_active'])
    op.create_index('ix_user_last_login', 'users', ['organization_id', sa.text('last_login DESC')])
    op.create_index('ix_audit_org_recent', 'audit_trail', ['organization_id', sa.text('timestamp DESC')])
    op.create_index('ix_audit_user_actions', 'audit_trail', ['user_id', 'action', sa.text('timestamp DESC')])
    op.create_index('ix_audit_object_history', 'audit_trail', ['object_type', 'object_id', sa.text('timestamp DESC')])
    
    # ========================================================================
    # INSERT INITIAL REGULATORY REQUIREMENTS DATA
    # ========================================================================
    
    # Insert some key regulatory requirements for initial system setup
    op.execute("""
        INSERT INTO regulatory_requirements (id, standard, section_number, title, requirement_text, category, keywords, is_current, created_at, updated_at) VALUES
        (gen_random_uuid(), 'iso_13485', '4.2.3', 'Control of Documents', 'Documents required by the quality management system shall be controlled.', 'document_control', '["document control", "version control", "approval"]', true, NOW(), NOW()),
        (gen_random_uuid(), 'iso_13485', '7.3.2', 'Design and Development Planning', 'The organization shall plan and control the design and development of the medical device.', 'design_controls', '["design planning", "development control", "medical device"]', true, NOW(), NOW()),
        (gen_random_uuid(), 'cfr_820', '820.30', 'Design Controls', 'Each manufacturer of any Class II or Class III device shall establish and maintain procedures to control the design of the device.', 'design_controls', '["design controls", "FDA", "Class II", "Class III"]', true, NOW(), NOW()),
        (gen_random_uuid(), 'iec_62304', '4.1', 'Quality Management System', 'The manufacturer shall establish, document, implement and maintain a quality management system.', 'quality_management', '["QMS", "quality system", "documentation"]', true, NOW(), NOW()),
        (gen_random_uuid(), 'iso_14971', '3.2', 'Risk Management Process', 'Top management shall establish a risk management policy for the medical device.', 'risk_management', '["risk management", "top management", "policy"]', true, NOW(), NOW());
    """)

def downgrade() -> None:
    """Drop all tables and types in reverse order"""
    
    # Drop tables in reverse dependency order
    op.drop_table('system_settings')
    op.drop_table('regulatory_requirements')
    op.drop_table('audit_trail')
    op.drop_table('analyses')
    op.drop_table('documents')
    op.drop_table('users')
    op.drop_table('organizations')
    
    # Drop enum types
    op.execute("DROP TYPE IF EXISTS regulatorystandard CASCADE;")
    op.execute("DROP TYPE IF EXISTS auditaction CASCADE;")
    op.execute("DROP TYPE IF EXISTS analysisstatus CASCADE;")
    op.execute("DROP TYPE IF EXISTS documenttype CASCADE;")
    op.execute("DROP TYPE IF EXISTS organizationtype CASCADE;")
    op.execute("DROP TYPE IF EXISTS userrole CASCADE;")
    
    # Drop application role
    op.execute("DROP ROLE IF EXISTS application_role;")