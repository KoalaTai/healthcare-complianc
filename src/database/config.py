"""
Database configuration and session management for VirtualBackroom.ai V2.0
Implements secure, multi-tenant database connections with proper isolation.
"""

import os
from typing import AsyncGenerator, Optional
from contextlib import asynccontextmanager
from sqlalchemy import create_engine, event
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import QueuePool
from .models import Base, AuditTrail, AuditAction, create_audit_record
import uuid
import logging

logger = logging.getLogger(__name__)

class DatabaseConfig:
    """Database configuration with security and performance optimizations"""
    
    def __init__(self):
        # Primary database URL (async for FastAPI)
        self.database_url = os.getenv("DATABASE_URL", "postgresql+asyncpg://user:password@localhost/virtualbackroom_v2")
        
        # Sync URL for migrations and administrative tasks
        self.sync_database_url = self.database_url.replace("+asyncpg", "")
        
        # Connection pool settings for high-availability
        self.pool_size = int(os.getenv("DB_POOL_SIZE", "20"))
        self.max_overflow = int(os.getenv("DB_MAX_OVERFLOW", "30"))
        self.pool_timeout = int(os.getenv("DB_POOL_TIMEOUT", "30"))
        self.pool_recycle = int(os.getenv("DB_POOL_RECYCLE", "3600"))  # 1 hour
        
        # Security settings
        self.ssl_require = os.getenv("DB_SSL_REQUIRE", "true").lower() == "true"
        self.connection_timeout = int(os.getenv("DB_CONNECTION_TIMEOUT", "10"))

# Global database configuration
db_config = DatabaseConfig()

# Async engine for FastAPI application
async_engine = create_async_engine(
    db_config.database_url,
    poolclass=QueuePool,
    pool_size=db_config.pool_size,
    max_overflow=db_config.max_overflow,
    pool_timeout=db_config.pool_timeout,
    pool_recycle=db_config.pool_recycle,
    echo=os.getenv("DB_ECHO", "false").lower() == "true",  # SQL logging for development
    future=True,
    # Security and performance settings
    connect_args={
        "server_settings": {
            "application_name": "virtualbackroom_v2",
            "jit": "off",  # Disable JIT for consistent performance
        },
        "command_timeout": db_config.connection_timeout,
    } if not db_config.ssl_require else {
        "server_settings": {
            "application_name": "virtualbackroom_v2",
            "jit": "off",
        },
        "ssl": "require",
        "command_timeout": db_config.connection_timeout,
    }
)

# Sync engine for migrations and background tasks
sync_engine = create_engine(
    db_config.sync_database_url,
    poolclass=QueuePool,
    pool_size=db_config.pool_size // 2,  # Fewer connections for sync operations
    max_overflow=db_config.max_overflow // 2,
    pool_timeout=db_config.pool_timeout,
    pool_recycle=db_config.pool_recycle,
    echo=os.getenv("DB_ECHO", "false").lower() == "true",
    future=True
)

# Session factories
AsyncSessionLocal = async_sessionmaker(
    bind=async_engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=True,
    autocommit=False
)

SyncSessionLocal = sessionmaker(
    bind=sync_engine,
    autoflush=True,
    autocommit=False
)

# ============================================================================
# SESSION MANAGEMENT AND DEPENDENCY INJECTION
# ============================================================================

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    FastAPI dependency for database sessions.
    Ensures proper session lifecycle and error handling.
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()

def get_sync_db() -> Session:
    """
    Synchronous database session for background tasks and migrations.
    """
    session = SyncSessionLocal()
    try:
        return session
    except Exception:
        session.rollback()
        session.close()
        raise

@asynccontextmanager
async def get_tenant_db_session(organization_id: uuid.UUID, user_id: Optional[uuid.UUID] = None):
    """
    Tenant-aware database session with automatic audit trail context.
    
    Usage:
        async with get_tenant_db_session(org_id, user_id) as session:
            # All operations are automatically tenant-isolated
            documents = await session.execute(
                select(Document).where(Document.organization_id == org_id)
            )
    """
    async with AsyncSessionLocal() as session:
        try:
            # Set tenant context for Row Level Security and audit trails
            session.info['tenant_org_id'] = organization_id
            session.info['tenant_user_id'] = user_id
            
            # Execute SET statements for PostgreSQL Row Level Security
            if organization_id:
                await session.execute(
                    f"SET app.current_organization_id = '{organization_id}'"
                )
            if user_id:
                await session.execute(
                    f"SET app.current_user_id = '{user_id}'"
                )
            
            yield session
            await session.commit()
            
        except Exception as e:
            await session.rollback()
            logger.error(f"Database session error for org {organization_id}: {e}")
            raise
        finally:
            await session.close()

# ============================================================================
# AUDIT TRAIL INTEGRATION
# ============================================================================

class AuditableSession:
    """
    Session wrapper that automatically creates audit trails for database operations.
    Integrates with the multi-tenant context to ensure compliance.
    """
    
    def __init__(self, session: AsyncSession, user_id: uuid.UUID, organization_id: uuid.UUID, 
                 ip_address: Optional[str] = None, user_agent: Optional[str] = None, session_id: Optional[str] = None):
        self.session = session
        self.user_id = user_id
        self.organization_id = organization_id
        self.ip_address = ip_address
        self.user_agent = user_agent
        self.session_id = session_id
    
    async def audit_create(self, obj, object_name: Optional[str] = None, additional_metadata: Optional[dict] = None):
        """Record creation of a new object"""
        await self._create_audit_record(
            action=AuditAction.CREATE,
            object_type=obj.__class__.__name__.lower(),
            object_id=getattr(obj, 'id', None),
            object_name=object_name or getattr(obj, 'name', None) or getattr(obj, 'filename', None),
            additional_metadata=additional_metadata
        )
    
    async def audit_update(self, obj, field_name: str, old_value: str, new_value: str, 
                          change_reason: Optional[str] = None, additional_metadata: Optional[dict] = None):
        """Record update of an existing object"""
        await self._create_audit_record(
            action=AuditAction.UPDATE,
            object_type=obj.__class__.__name__.lower(),
            object_id=getattr(obj, 'id', None),
            object_name=getattr(obj, 'name', None) or getattr(obj, 'filename', None),
            field_name=field_name,
            old_value=old_value,
            new_value=new_value,
            change_reason=change_reason,
            additional_metadata=additional_metadata
        )
    
    async def audit_delete(self, obj, object_name: Optional[str] = None, change_reason: Optional[str] = None,
                          additional_metadata: Optional[dict] = None):
        """Record deletion of an object"""
        await self._create_audit_record(
            action=AuditAction.DELETE,
            object_type=obj.__class__.__name__.lower(),
            object_id=getattr(obj, 'id', None),
            object_name=object_name or getattr(obj, 'name', None) or getattr(obj, 'filename', None),
            change_reason=change_reason,
            additional_metadata=additional_metadata
        )
    
    async def audit_export(self, obj, export_format: str, additional_metadata: Optional[dict] = None):
        """Record export of regulated data (21 CFR Part 11 requirement)"""
        metadata = {"export_format": export_format}
        if additional_metadata:
            metadata.update(additional_metadata)
            
        await self._create_audit_record(
            action=AuditAction.EXPORT,
            object_type=obj.__class__.__name__.lower(),
            object_id=getattr(obj, 'id', None),
            object_name=getattr(obj, 'name', None) or getattr(obj, 'filename', None),
            additional_metadata=metadata
        )
    
    async def _create_audit_record(self, action: AuditAction, object_type: str, **kwargs):
        """Internal method to create audit records"""
        audit_record = AuditTrail(
            user_id=self.user_id,
            organization_id=self.organization_id,
            action=action,
            object_type=object_type,
            ip_address=self.ip_address,
            user_agent=self.user_agent,
            session_id=self.session_id,
            **kwargs
        )
        
        self.session.add(audit_record)
        await self.session.flush()  # Ensure audit record is persisted

# ============================================================================
# ROW LEVEL SECURITY POLICIES (PostgreSQL)
# ============================================================================

# SQL statements for enabling Row Level Security
# These should be executed after table creation in migrations

RLS_POLICIES = {
    "organizations": """
        -- Enable RLS on organizations table
        ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
        
        -- Policy: Users can only access their own organization
        CREATE POLICY org_tenant_isolation ON organizations
            FOR ALL
            TO application_role
            USING (id = current_setting('app.current_organization_id')::uuid);
    """,
    
    "users": """
        -- Enable RLS on users table  
        ALTER TABLE users ENABLE ROW LEVEL SECURITY;
        
        -- Policy: Users can only access users in their organization
        CREATE POLICY user_tenant_isolation ON users
            FOR ALL  
            TO application_role
            USING (organization_id = current_setting('app.current_organization_id')::uuid);
    """,
    
    "documents": """
        -- Enable RLS on documents table
        ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
        
        -- Policy: Documents are isolated by organization
        CREATE POLICY doc_tenant_isolation ON documents
            FOR ALL
            TO application_role
            USING (organization_id = current_setting('app.current_organization_id')::uuid);
    """,
    
    "analyses": """
        -- Enable RLS on analyses table
        ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;
        
        -- Policy: Analyses are isolated by organization
        CREATE POLICY analysis_tenant_isolation ON analyses
            FOR ALL
            TO application_role
            USING (organization_id = current_setting('app.current_organization_id')::uuid);
    """,
    
    "audit_trail": """
        -- Enable RLS on audit_trail table
        ALTER TABLE audit_trail ENABLE ROW LEVEL SECURITY;
        
        -- Policy: Audit records are isolated by organization
        -- Special permission for compliance officers to view cross-tenant audits (if needed)
        CREATE POLICY audit_tenant_isolation ON audit_trail
            FOR ALL
            TO application_role
            USING (
                organization_id = current_setting('app.current_organization_id')::uuid
                OR current_setting('app.current_user_role') = 'compliance_officer'
            );
    """,
    
    "system_settings": """
        -- Enable RLS on system_settings table
        ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
        
        -- Policy: Organization settings are isolated, global settings visible to all
        CREATE POLICY settings_tenant_isolation ON system_settings
            FOR ALL
            TO application_role
            USING (
                organization_id IS NULL 
                OR organization_id = current_setting('app.current_organization_id')::uuid
            );
    """
}

# ============================================================================
# DATABASE HEALTH AND MONITORING
# ============================================================================

async def check_database_health() -> dict:
    """
    Health check function for monitoring database connectivity and performance.
    Returns metrics for monitoring dashboards.
    """
    try:
        async with AsyncSessionLocal() as session:
            # Test basic connectivity
            result = await session.execute("SELECT 1 as health_check")
            health_status = result.scalar() == 1
            
            # Get connection pool statistics
            pool = async_engine.pool
            pool_stats = {
                "pool_size": pool.size(),
                "checked_in": pool.checkedin(),
                "checked_out": pool.checkedout(),
                "overflow": pool.overflow(),
                "invalid": pool.invalid()
            }
            
            # Get basic table statistics
            table_stats = {}
            for table_name in ["organizations", "users", "documents", "analyses", "audit_trail"]:
                count_result = await session.execute(f"SELECT COUNT(*) FROM {table_name}")
                table_stats[table_name] = count_result.scalar()
            
            return {
                "status": "healthy" if health_status else "unhealthy",
                "pool_stats": pool_stats,
                "table_stats": table_stats,
                "timestamp": datetime.now(timezone.utc).isoformat()
            }
            
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        return {
            "status": "unhealthy",
            "error": str(e),
            "timestamp": datetime.now(timezone.utc).isoformat()
        }

async def initialize_database():
    """
    Initialize database with tables and security policies.
    Should be called during application startup.
    """
    try:
        # Create all tables
        async with async_engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
            
        # Apply Row Level Security policies
        async with AsyncSessionLocal() as session:
            for table_name, policy_sql in RLS_POLICIES.items():
                try:
                    await session.execute(policy_sql)
                    logger.info(f"Applied RLS policy for table: {table_name}")
                except Exception as e:
                    # Policies might already exist, log but don't fail
                    logger.warning(f"Could not apply RLS policy for {table_name}: {e}")
            
            await session.commit()
            
        logger.info("Database initialization completed successfully")
        
    except Exception as e:
        logger.error(f"Database initialization failed: {e}")
        raise

# ============================================================================
# TENANT DATA ISOLATION UTILITIES
# ============================================================================

class TenantQueryBuilder:
    """
    Utility class for building tenant-isolated queries.
    Ensures all queries automatically include organization_id filtering.
    """
    
    def __init__(self, session: AsyncSession, organization_id: uuid.UUID):
        self.session = session
        self.organization_id = organization_id
    
    def filter_by_tenant(self, query):
        """Apply tenant isolation filter to any query"""
        model_class = query.column_descriptions[0]['type']
        if hasattr(model_class, 'organization_id'):
            return query.filter(model_class.organization_id == self.organization_id)
        return query
    
    async def get_tenant_object(self, model_class, object_id: uuid.UUID):
        """Safely retrieve an object ensuring it belongs to the current tenant"""
        result = await self.session.get(model_class, object_id)
        if result and hasattr(result, 'organization_id'):
            if result.organization_id != self.organization_id:
                raise PermissionError(f"Access denied: {model_class.__name__} {object_id} belongs to different organization")
        return result

# ============================================================================
# AUDIT TRAIL QUERY HELPERS
# ============================================================================

class AuditTrailQueries:
    """
    Specialized queries for audit trail analysis and reporting.
    Supports compliance reporting and forensic investigation.
    """
    
    def __init__(self, session: AsyncSession, organization_id: uuid.UUID):
        self.session = session
        self.organization_id = organization_id
    
    async def get_user_activity(self, user_id: uuid.UUID, days: int = 30) -> List[AuditTrail]:
        """Get all activity for a specific user in the last N days"""
        from sqlalchemy import select
        from datetime import timedelta
        
        cutoff_date = datetime.now(timezone.utc) - timedelta(days=days)
        
        result = await self.session.execute(
            select(AuditTrail)
            .where(
                AuditTrail.organization_id == self.organization_id,
                AuditTrail.user_id == user_id,
                AuditTrail.timestamp >= cutoff_date
            )
            .order_by(AuditTrail.timestamp.desc())
        )
        return result.scalars().all()
    
    async def get_object_history(self, object_type: str, object_id: uuid.UUID) -> List[AuditTrail]:
        """Get complete audit history for a specific object"""
        from sqlalchemy import select
        
        result = await self.session.execute(
            select(AuditTrail)
            .where(
                AuditTrail.organization_id == self.organization_id,
                AuditTrail.object_type == object_type,
                AuditTrail.object_id == object_id
            )
            .order_by(AuditTrail.timestamp.asc())
        )
        return result.scalars().all()
    
    async def get_regulatory_events(self, days: int = 90) -> List[AuditTrail]:
        """Get all regulatory-significant events for compliance reporting"""
        from sqlalchemy import select
        from datetime import timedelta
        
        cutoff_date = datetime.now(timezone.utc) - timedelta(days=days)
        
        result = await self.session.execute(
            select(AuditTrail)
            .where(
                AuditTrail.organization_id == self.organization_id,
                AuditTrail.regulatory_significance == True,
                AuditTrail.timestamp >= cutoff_date
            )
            .order_by(AuditTrail.timestamp.desc())
        )
        return result.scalars().all()

# ============================================================================
# DATABASE MIDDLEWARE FOR AUTOMATIC AUDITING
# ============================================================================

class DatabaseAuditMiddleware:
    """
    Middleware to automatically create audit trails for model changes.
    Integrates with SQLAlchemy events to ensure comprehensive tracking.
    """
    
    @staticmethod
    def setup_audit_listeners():
        """Set up SQLAlchemy event listeners for automatic audit trail creation"""
        
        @event.listens_for(Session, 'before_flush')
        def before_flush(session, flush_context, instances):
            """Capture changes before they're committed to database"""
            # Store change information in session for after_flush processing
            session.info.setdefault('audit_changes', [])
            
            for obj in session.new:
                if hasattr(obj, 'organization_id') and obj.__class__.__name__ != 'AuditTrail':
                    session.info['audit_changes'].append({
                        'action': 'CREATE',
                        'object': obj,
                        'object_type': obj.__class__.__name__.lower(),
                        'object_id': getattr(obj, 'id', None),
                        'object_name': getattr(obj, 'name', None) or getattr(obj, 'filename', None)
                    })
            
            for obj in session.dirty:
                if hasattr(obj, 'organization_id') and obj.__class__.__name__ != 'AuditTrail':
                    # Capture field-level changes
                    for attr in session.get_attribute_history(obj, 'name'):  # Example field
                        if attr.has_changes():
                            session.info['audit_changes'].append({
                                'action': 'UPDATE',
                                'object': obj,
                                'object_type': obj.__class__.__name__.lower(),
                                'object_id': getattr(obj, 'id', None),
                                'field_name': 'name',
                                'old_value': str(attr.deleted[0]) if attr.deleted else None,
                                'new_value': str(attr.added[0]) if attr.added else None
                            })
            
            for obj in session.deleted:
                if hasattr(obj, 'organization_id') and obj.__class__.__name__ != 'AuditTrail':
                    session.info['audit_changes'].append({
                        'action': 'DELETE',
                        'object': obj,
                        'object_type': obj.__class__.__name__.lower(),
                        'object_id': getattr(obj, 'id', None),
                        'object_name': getattr(obj, 'name', None) or getattr(obj, 'filename', None)
                    })
        
        @event.listens_for(Session, 'after_flush')
        def after_flush(session, flush_context):
            """Create audit records after successful flush"""
            changes = session.info.get('audit_changes', [])
            user_id = session.info.get('tenant_user_id')
            org_id = session.info.get('tenant_org_id')
            
            if user_id and org_id:
                for change in changes:
                    # Create audit record using sync method within transaction
                    audit_record = AuditTrail(
                        user_id=user_id,
                        organization_id=org_id,
                        action=getattr(AuditAction, change['action']),
                        object_type=change['object_type'],
                        object_id=change.get('object_id'),
                        object_name=change.get('object_name'),
                        field_name=change.get('field_name'),
                        old_value=change.get('old_value'),
                        new_value=change.get('new_value'),
                        ip_address=session.info.get('client_ip'),
                        user_agent=session.info.get('client_user_agent'),
                        session_id=session.info.get('client_session_id')
                    )
                    session.add(audit_record)
            
            # Clear changes after processing
            session.info.pop('audit_changes', None)

# Initialize audit listeners
DatabaseAuditMiddleware.setup_audit_listeners()

# ============================================================================
# MIGRATION SUPPORT
# ============================================================================

def get_alembic_config():
    """Get Alembic configuration for database migrations"""
    from alembic.config import Config
    from alembic import command
    
    # This will be used by the migration scripts
    alembic_cfg = Config("alembic.ini")
    alembic_cfg.set_main_option("sqlalchemy.url", db_config.sync_database_url)
    return alembic_cfg

async def run_migrations():
    """Run database migrations programmatically"""
    from alembic.config import Config
    from alembic import command
    
    try:
        alembic_cfg = get_alembic_config()
        command.upgrade(alembic_cfg, "head")
        logger.info("Database migrations completed successfully")
    except Exception as e:
        logger.error(f"Migration failed: {e}")
        raise