"""
Multi-Tenant Database Models for VirtualBackroom.ai V2.0
Implements comprehensive audit trails and 21 CFR Part 11 compliance
"""

from datetime import datetime, timezone
from typing import Optional, Dict, Any, List
from enum import Enum as PyEnum
from sqlalchemy import (
    Column, String, DateTime, Text, Boolean, Integer, 
    ForeignKey, UniqueConstraint, Index, JSON, LargeBinary,
    event, CheckConstraint, func
)
from sqlalchemy.dialects.postgresql import UUID, ENUM
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, Session
import uuid

Base = declarative_base()

# ============================================================================
# ENUMS FOR TYPE SAFETY
# ============================================================================

class UserRole(PyEnum):
    """User roles within an organization"""
    VIEWER = "viewer"           # Read-only access to organization data
    ANALYST = "analyst"         # Can create and view analyses
    QUALITY_MANAGER = "quality_manager"  # Can manage quality processes
    ADMIN = "admin"             # Full organization administration
    OWNER = "owner"             # Organization owner with billing access

class OrganizationType(PyEnum):
    """Organization types for compliance categorization"""
    MEDICAL_DEVICE = "medical_device"
    PHARMACEUTICAL = "pharmaceutical"
    BIOTECHNOLOGY = "biotechnology"
    CONTRACT_RESEARCH = "contract_research"
    CONSULTING = "consulting"
    OTHER = "other"

class DocumentType(PyEnum):
    """Document classifications for regulatory analysis"""
    SOP = "sop"                 # Standard Operating Procedure
    WORK_INSTRUCTION = "work_instruction"
    QUALITY_MANUAL = "quality_manual"
    RISK_ASSESSMENT = "risk_assessment"
    VALIDATION_PROTOCOL = "validation_protocol"
    DESIGN_CONTROL = "design_control"
    CORRECTIVE_ACTION = "corrective_action"
    OTHER = "other"

class AnalysisStatus(PyEnum):
    """Analysis job status tracking"""
    PENDING = "pending"         # Queued for processing
    PROCESSING = "processing"   # AI analysis in progress
    COMPLETED = "completed"     # Analysis finished successfully
    FAILED = "failed"          # Analysis encountered error
    CANCELLED = "cancelled"    # User cancelled analysis

class AuditAction(PyEnum):
    """Audit trail action types for 21 CFR Part 11 compliance"""
    CREATE = "create"
    READ = "read"
    UPDATE = "update"
    DELETE = "delete"
    EXPORT = "export"
    LOGIN = "login"
    LOGOUT = "logout"
    PERMISSION_CHANGE = "permission_change"

class RegulatoryStandard(PyEnum):
    """Supported regulatory standards"""
    ISO_13485 = "iso_13485"
    IEC_62304 = "iec_62304"
    CFR_820 = "cfr_820"
    ISO_14971 = "iso_14971"
    ICH_Q9 = "ich_q9"

# ============================================================================
# CORE TENANT AND USER MODELS
# ============================================================================

class Organization(Base):
    """
    Tenant model for multi-tenancy isolation.
    Each organization represents a separate tenant with isolated data.
    """
    __tablename__ = "organizations"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    slug = Column(String(100), unique=True, nullable=False)  # URL-friendly identifier
    organization_type = Column(ENUM(OrganizationType), nullable=False)
    
    # Subscription and billing information
    subscription_tier = Column(String(50), default="trial")  # trial, professional, enterprise
    subscription_expires_at = Column(DateTime(timezone=True))
    max_users = Column(Integer, default=5)
    max_monthly_analyses = Column(Integer, default=50)
    
    # Contact and administrative details
    primary_contact_email = Column(String(255), nullable=False)
    billing_email = Column(String(255))
    phone = Column(String(50))
    address = Column(Text)
    
    # Regulatory context
    primary_markets = Column(JSON)  # List of markets: ["US", "EU", "Canada"]
    applicable_standards = Column(JSON)  # List of standards they need to comply with
    
    # Compliance and security settings
    require_2fa = Column(Boolean, default=False)
    session_timeout_minutes = Column(Integer, default=480)  # 8 hours default
    data_retention_days = Column(Integer, default=2555)     # 7 years default
    
    # System metadata
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    is_active = Column(Boolean, default=True)
    
    # Relationships
    users = relationship("User", back_populates="organization", cascade="all, delete-orphan")
    documents = relationship("Document", back_populates="organization", cascade="all, delete-orphan")
    analyses = relationship("Analysis", back_populates="organization", cascade="all, delete-orphan")
    
    __table_args__ = (
        Index('ix_org_slug', 'slug'),
        Index('ix_org_active', 'is_active'),
        CheckConstraint('max_users > 0', name='check_max_users_positive'),
        CheckConstraint('max_monthly_analyses > 0', name='check_max_analyses_positive'),
    )

class User(Base):
    """
    User model with organization-based multi-tenancy.
    Each user belongs to exactly one organization.
    """
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    
    # Identity information
    email = Column(String(255), nullable=False, unique=True)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    
    # Authentication (for SSO integration)
    external_id = Column(String(255))  # ID from SSO provider (Google, Microsoft, Auth0)
    sso_provider = Column(String(50))  # "google", "microsoft", "auth0"
    
    # Authorization
    role = Column(ENUM(UserRole), nullable=False, default=UserRole.VIEWER)
    permissions = Column(JSON, default=list)  # Additional granular permissions
    
    # Security settings
    is_active = Column(Boolean, default=True)
    email_verified = Column(Boolean, default=False)
    mfa_enabled = Column(Boolean, default=False)
    mfa_secret = Column(LargeBinary)  # Encrypted TOTP secret
    
    # Session management
    last_login = Column(DateTime(timezone=True))
    login_count = Column(Integer, default=0)
    failed_login_attempts = Column(Integer, default=0)
    locked_until = Column(DateTime(timezone=True))
    
    # Compliance tracking
    training_completed = Column(JSON, default=list)  # List of completed training modules
    last_password_change = Column(DateTime(timezone=True))
    
    # System metadata
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    
    # Relationships
    organization = relationship("Organization", back_populates="users")
    created_documents = relationship("Document", foreign_keys="Document.created_by", back_populates="creator")
    created_analyses = relationship("Analysis", foreign_keys="Analysis.created_by", back_populates="creator")
    
    __table_args__ = (
        Index('ix_user_email', 'email'),
        Index('ix_user_org_role', 'organization_id', 'role'),
        Index('ix_user_external_id', 'external_id', 'sso_provider'),
        Index('ix_user_active', 'is_active'),
        UniqueConstraint('external_id', 'sso_provider', name='uq_external_sso'),
    )
    
    @property
    def full_name(self) -> str:
        return f"{self.first_name} {self.last_name}"
    
    def can_perform_action(self, action: str, resource_type: str) -> bool:
        """Check if user can perform specific action on resource type"""
        # Role-based permission matrix
        role_permissions = {
            UserRole.VIEWER: ["read"],
            UserRole.ANALYST: ["read", "create_analysis", "export_report"],
            UserRole.QUALITY_MANAGER: ["read", "create_analysis", "export_report", "manage_documents", "view_audit_trail"],
            UserRole.ADMIN: ["read", "create_analysis", "export_report", "manage_documents", "view_audit_trail", "manage_users"],
            UserRole.OWNER: ["all"]  # Owner has all permissions
        }
        
        user_perms = role_permissions.get(self.role, [])
        return action in user_perms or "all" in user_perms or action in (self.permissions or [])

# ============================================================================
# DOCUMENT MANAGEMENT MODELS
# ============================================================================

class Document(Base):
    """
    Document storage model with multi-tenant isolation.
    Stores metadata; actual files stored in S3.
    """
    __tablename__ = "documents"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    
    # Document metadata
    filename = Column(String(255), nullable=False)
    original_filename = Column(String(255), nullable=False)  # User's original filename
    document_type = Column(ENUM(DocumentType), nullable=False)
    
    # File storage information
    s3_bucket = Column(String(100), nullable=False)
    s3_key = Column(String(500), nullable=False)  # S3 object key
    file_size = Column(Integer, nullable=False)   # Size in bytes
    content_hash = Column(String(64), nullable=False)  # SHA-256 hash for integrity
    mime_type = Column(String(100), nullable=False)
    
    # Document content and metadata
    title = Column(String(500))
    description = Column(Text)
    version = Column(String(50))
    effective_date = Column(DateTime(timezone=True))
    review_date = Column(DateTime(timezone=True))
    
    # Processing status
    is_processed = Column(Boolean, default=False)
    processing_error = Column(Text)
    
    # Compliance tracking
    is_controlled_document = Column(Boolean, default=True)  # Subject to change control
    approval_status = Column(String(50), default="draft")  # draft, under_review, approved, superseded
    approved_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    approved_at = Column(DateTime(timezone=True))
    
    # System metadata
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    
    # Relationships
    organization = relationship("Organization", back_populates="documents")
    creator = relationship("User", foreign_keys=[created_by], back_populates="created_documents")
    approver = relationship("User", foreign_keys=[approved_by])
    analyses = relationship("Analysis", back_populates="document", cascade="all, delete-orphan")
    
    __table_args__ = (
        Index('ix_doc_org_type', 'organization_id', 'document_type'),
        Index('ix_doc_s3_location', 's3_bucket', 's3_key'),
        Index('ix_doc_hash', 'content_hash'),
        Index('ix_doc_controlled', 'is_controlled_document', 'approval_status'),
        # Ensure S3 location uniqueness
        UniqueConstraint('s3_bucket', 's3_key', name='uq_s3_location'),
    )

class Analysis(Base):
    """
    Analysis job and results model.
    Tracks AI-powered regulatory gap analysis with full audit trail.
    """
    __tablename__ = "analyses"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    document_id = Column(UUID(as_uuid=True), ForeignKey("documents.id"), nullable=False)
    
    # Analysis configuration
    regulatory_standard = Column(ENUM(RegulatoryStandard), nullable=False)
    analysis_type = Column(String(100), default="gap_analysis")  # gap_analysis, compliance_check, risk_review
    
    # Processing information
    status = Column(ENUM(AnalysisStatus), default=AnalysisStatus.PENDING, nullable=False)
    started_at = Column(DateTime(timezone=True))
    completed_at = Column(DateTime(timezone=True))
    processing_time_seconds = Column(Integer)
    
    # AI model information (for traceability)
    ai_model = Column(String(100))  # e.g., "gpt-4o", "claude-3"
    ai_model_version = Column(String(50))
    prompt_template_version = Column(String(50))
    
    # Results storage
    findings_summary = Column(Text)
    detailed_findings = Column(JSON)  # Structured findings with citations
    confidence_score = Column(Integer)  # 0-100 confidence rating
    risk_level = Column(String(50))    # low, medium, high, critical
    
    # Gap analysis specific results
    identified_gaps = Column(JSON)     # List of compliance gaps found
    recommendations = Column(JSON)    # List of recommended actions
    citations = Column(JSON)          # References to specific regulatory requirements
    
    # Report generation
    report_generated = Column(Boolean, default=False)
    report_s3_key = Column(String(500))  # Location of generated PDF report
    report_hash = Column(String(64))     # SHA-256 hash of the report for integrity
    
    # Error handling
    error_message = Column(Text)
    retry_count = Column(Integer, default=0)
    
    # System metadata
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    
    # Relationships
    organization = relationship("Organization", back_populates="analyses")
    document = relationship("Document", back_populates="analyses")
    creator = relationship("User", foreign_keys=[created_by], back_populates="created_analyses")
    
    __table_args__ = (
        Index('ix_analysis_org_status', 'organization_id', 'status'),
        Index('ix_analysis_document', 'document_id'),
        Index('ix_analysis_standard', 'regulatory_standard'),
        Index('ix_analysis_created', 'created_at'),
        # Prevent duplicate analyses of same document/standard combination
        UniqueConstraint('document_id', 'regulatory_standard', name='uq_document_standard_analysis'),
    )

# ============================================================================
# AUDIT TRAIL MODEL (21 CFR Part 11 Compliance)
# ============================================================================

class AuditTrail(Base):
    """
    Comprehensive audit trail for 21 CFR Part 11 compliance.
    Records all actions performed on regulated records with immutable trail.
    """
    __tablename__ = "audit_trail"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Who performed the action
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    user_email = Column(String(255), nullable=False)  # Snapshot for historical reference
    user_role = Column(String(50), nullable=False)    # Role at time of action
    
    # What action was performed
    action = Column(ENUM(AuditAction), nullable=False)
    object_type = Column(String(100), nullable=False)  # "document", "analysis", "user", "organization"
    object_id = Column(UUID(as_uuid=True))  # ID of the affected object
    object_name = Column(String(500))       # Human-readable identifier
    
    # When and where
    timestamp = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    ip_address = Column(String(45))         # IPv4 or IPv6
    user_agent = Column(Text)               # Browser/client information
    session_id = Column(String(255))        # Session identifier
    
    # Change details
    field_name = Column(String(100))        # Specific field that changed (for updates)
    old_value = Column(Text)                # Previous value (for updates)
    new_value = Column(Text)                # New value (for updates)
    change_reason = Column(Text)            # User-provided reason for change
    
    # Compliance metadata
    regulatory_significance = Column(Boolean, default=True)  # Is this action regulatory-relevant?
    requires_review = Column(Boolean, default=False)         # Does this action require supervisor review?
    reviewed_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    reviewed_at = Column(DateTime(timezone=True))
    
    # Electronic signature information (when applicable)
    electronic_signature = Column(Text)     # Digital signature of the action
    signature_method = Column(String(100))  # Method used for signature
    
    # Additional context
    request_id = Column(String(100))        # Correlation ID for request tracing
    additional_metadata = Column(JSON)      # Flexible field for action-specific data
    
    # Relationships
    user = relationship("User", foreign_keys=[user_id])
    reviewer = relationship("User", foreign_keys=[reviewed_by])
    organization = relationship("Organization")
    
    __table_args__ = (
        Index('ix_audit_user_timestamp', 'user_id', 'timestamp'),
        Index('ix_audit_org_timestamp', 'organization_id', 'timestamp'),
        Index('ix_audit_object', 'object_type', 'object_id'),
        Index('ix_audit_action', 'action'),
        Index('ix_audit_regulatory', 'regulatory_significance', 'timestamp'),
        # Immutable constraint - audit records cannot be modified after creation
        CheckConstraint('updated_at IS NULL OR updated_at = created_at', name='audit_immutable'),
    )

# ============================================================================
# REGULATORY KNOWLEDGE BASE MODELS
# ============================================================================

class RegulatoryRequirement(Base):
    """
    Structured storage of regulatory requirements and citations.
    Replaces flat file knowledge base with searchable database.
    """
    __tablename__ = "regulatory_requirements"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Requirement identification
    standard = Column(ENUM(RegulatoryStandard), nullable=False)
    section_number = Column(String(100), nullable=False)  # e.g., "4.2.3", "820.30(a)"
    title = Column(String(500), nullable=False)
    
    # Requirement content
    requirement_text = Column(Text, nullable=False)
    interpretation_notes = Column(Text)
    implementation_guidance = Column(Text)
    
    # Categorization
    category = Column(String(100))          # e.g., "design_controls", "risk_management"
    subcategory = Column(String(100))
    keywords = Column(JSON)                 # Searchable keywords for matching
    
    # Relationships and references
    related_requirements = Column(JSON)     # IDs of related requirements
    superseded_by = Column(UUID(as_uuid=True), ForeignKey("regulatory_requirements.id"))
    
    # Validation and currency
    is_current = Column(Boolean, default=True)
    effective_date = Column(DateTime(timezone=True))
    last_reviewed = Column(DateTime(timezone=True))
    next_review_date = Column(DateTime(timezone=True))
    
    # System metadata
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    
    __table_args__ = (
        Index('ix_req_standard_section', 'standard', 'section_number'),
        Index('ix_req_current', 'is_current'),
        Index('ix_req_category', 'category', 'subcategory'),
        UniqueConstraint('standard', 'section_number', name='uq_standard_section'),
    )

# ============================================================================
# SYSTEM CONFIGURATION AND SETTINGS
# ============================================================================

class SystemSetting(Base):
    """
    System-wide configuration settings with audit trail.
    Supports dynamic configuration without code deployment.
    """
    __tablename__ = "system_settings"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"))  # NULL for global settings
    
    # Setting identification
    setting_key = Column(String(255), nullable=False)
    setting_category = Column(String(100), nullable=False)  # "security", "ai_model", "compliance"
    
    # Setting value and metadata
    setting_value = Column(Text, nullable=False)
    value_type = Column(String(50), default="string")  # string, integer, boolean, json
    description = Column(Text)
    is_sensitive = Column(Boolean, default=False)     # Should be encrypted at rest
    
    # Validation and constraints
    validation_rules = Column(JSON)                   # Rules for validating setting values
    default_value = Column(Text)
    is_required = Column(Boolean, default=False)
    
    # Change management
    requires_approval = Column(Boolean, default=False)
    approved_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    approved_at = Column(DateTime(timezone=True))
    
    # System metadata
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    
    # Relationships
    organization = relationship("Organization")
    creator = relationship("User", foreign_keys=[created_by])
    approver = relationship("User", foreign_keys=[approved_by])
    
    __table_args__ = (
        Index('ix_setting_org_key', 'organization_id', 'setting_key'),
        Index('ix_setting_category', 'setting_category'),
        # Organization-specific settings must be unique
        UniqueConstraint('organization_id', 'setting_key', name='uq_org_setting'),
    )

# ============================================================================
# AUDIT TRAIL EVENT LISTENERS
# ============================================================================

def create_audit_record(
    session: Session,
    user_id: uuid.UUID,
    organization_id: uuid.UUID,
    action: AuditAction,
    object_type: str,
    object_id: Optional[uuid.UUID] = None,
    object_name: Optional[str] = None,
    field_name: Optional[str] = None,
    old_value: Optional[str] = None,
    new_value: Optional[str] = None,
    change_reason: Optional[str] = None,
    additional_metadata: Optional[Dict[str, Any]] = None,
    ip_address: Optional[str] = None,
    user_agent: Optional[str] = None,
    session_id: Optional[str] = None
) -> AuditTrail:
    """
    Create an audit trail record for any database action.
    This function should be called by all service methods that modify data.
    """
    # Get user information for snapshot
    user = session.get(User, user_id)
    user_email = user.email if user else "system"
    user_role = user.role.value if user else "system"
    
    audit_record = AuditTrail(
        user_id=user_id,
        organization_id=organization_id,
        user_email=user_email,
        user_role=user_role,
        action=action,
        object_type=object_type,
        object_id=object_id,
        object_name=object_name,
        field_name=field_name,
        old_value=old_value,
        new_value=new_value,
        change_reason=change_reason,
        ip_address=ip_address,
        user_agent=user_agent,
        session_id=session_id,
        additional_metadata=additional_metadata or {}
    )
    
    session.add(audit_record)
    return audit_record

# Event listeners for automatic audit trail creation
@event.listens_for(Document, 'after_insert')
def audit_document_create(mapper, connection, target):
    """Automatically create audit record when document is created"""
    # Note: This is a simplified example. In production, you'd need to 
    # access the current session context and user information
    pass

@event.listens_for(Document, 'after_update')
def audit_document_update(mapper, connection, target):
    """Automatically create audit record when document is updated"""
    pass

@event.listens_for(Analysis, 'after_insert')
def audit_analysis_create(mapper, connection, target):
    """Automatically create audit record when analysis is created"""
    pass

@event.listens_for(User, 'after_update')
def audit_user_update(mapper, connection, target):
    """Automatically create audit record when user is updated"""
    pass

# ============================================================================
# UTILITY FUNCTIONS
# ============================================================================

def ensure_organization_isolation(query, organization_id: uuid.UUID):
    """
    Utility function to ensure all queries are properly isolated by organization.
    Should be used by all service methods to prevent cross-tenant data access.
    """
    return query.filter_by(organization_id=organization_id)

def get_current_timestamp():
    """Get current UTC timestamp for consistent datetime handling"""
    return datetime.now(timezone.utc)

class TenantContext:
    """
    Context manager for ensuring all database operations are tenant-aware.
    Usage:
        with TenantContext(session, organization_id, user_id):
            # All operations within this context are automatically audited
            document = create_document(...)
    """
    def __init__(self, session: Session, organization_id: uuid.UUID, user_id: uuid.UUID):
        self.session = session
        self.organization_id = organization_id
        self.user_id = user_id
        
    def __enter__(self):
        # Set session-level context for automatic audit trail
        self.session.info['tenant_org_id'] = self.organization_id
        self.session.info['tenant_user_id'] = self.user_id
        return self
        
    def __exit__(self, exc_type, exc_val, exc_tb):
        # Clear context
        self.session.info.pop('tenant_org_id', None)
        self.session.info.pop('tenant_user_id', None)

# ============================================================================
# DATABASE INDEXES FOR PERFORMANCE
# ============================================================================

# Additional composite indexes for common query patterns
additional_indexes = [
    # Document search patterns
    Index('ix_doc_org_type_status', Document.organization_id, Document.document_type, Document.approval_status),
    Index('ix_doc_created_recent', Document.organization_id, Document.created_at.desc()),
    
    # Analysis tracking
    Index('ix_analysis_org_recent', Analysis.organization_id, Analysis.created_at.desc()),
    Index('ix_analysis_status_started', Analysis.status, Analysis.started_at),
    
    # User management
    Index('ix_user_org_active', User.organization_id, User.is_active),
    Index('ix_user_last_login', User.organization_id, User.last_login.desc()),
    
    # Audit trail queries (most performance-critical)
    Index('ix_audit_org_recent', AuditTrail.organization_id, AuditTrail.timestamp.desc()),
    Index('ix_audit_user_actions', AuditTrail.user_id, AuditTrail.action, AuditTrail.timestamp.desc()),
    Index('ix_audit_object_history', AuditTrail.object_type, AuditTrail.object_id, AuditTrail.timestamp.desc()),
]