"""
VirtualBackroom.ai V2.0 Database Package
Multi-tenant database with comprehensive audit trails and regulatory compliance.
"""

from .models import (
    Base,
    Organization, User, Document, Analysis, AuditTrail,
    RegulatoryRequirement, SystemSetting,
    UserRole, OrganizationType, DocumentType, 
    AnalysisStatus, AuditAction, RegulatoryStandard,
    create_audit_record, TenantContext
)

from .config import (
    AsyncSessionLocal, SyncSessionLocal,
    get_db, get_sync_db, get_tenant_db_session,
    AuditableSession, TenantQueryBuilder,
    initialize_database, check_database_health
)

__all__ = [
    # Models
    'Base', 'Organization', 'User', 'Document', 'Analysis', 
    'AuditTrail', 'RegulatoryRequirement', 'SystemSetting',
    
    # Enums
    'UserRole', 'OrganizationType', 'DocumentType',
    'AnalysisStatus', 'AuditAction', 'RegulatoryStandard',
    
    # Session management
    'AsyncSessionLocal', 'SyncSessionLocal', 'get_db', 'get_sync_db',
    'get_tenant_db_session', 'AuditableSession', 'TenantQueryBuilder',
    
    # Utilities
    'create_audit_record', 'TenantContext',
    'initialize_database', 'check_database_health'
]