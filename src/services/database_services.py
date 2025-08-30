"""
Multi-tenant service layer for VirtualBackroom.ai V2.0
Implements secure data operations with automatic audit trails and tenant isolation.
"""

from typing import List, Optional, Dict, Any, Tuple
from datetime import datetime, timezone
import uuid
import hashlib
import logging
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete, func, and_, or_
from sqlalchemy.orm import selectinload

from ..database.models import (
    Organization, User, Document, Analysis, AuditTrail, 
    RegulatoryRequirement, SystemSetting,
    UserRole, DocumentType, AnalysisStatus, AuditAction,
    RegulatoryStandard, OrganizationType
)
from ..database.config import AuditableSession, TenantQueryBuilder

logger = logging.getLogger(__name__)

# ============================================================================
# ORGANIZATION SERVICE (TENANT MANAGEMENT)
# ============================================================================

class OrganizationService:
    """Service for managing organizations (tenants) with security and compliance controls"""
    
    def __init__(self, session: AsyncSession):
        self.session = session
    
    async def create_organization(
        self,
        name: str,
        slug: str,
        organization_type: OrganizationType,
        primary_contact_email: str,
        created_by_user_id: Optional[uuid.UUID] = None,
        **kwargs
    ) -> Organization:
        """
        Create a new organization with initial security configuration.
        This is typically called during organization onboarding.
        """
        # Validate slug uniqueness
        existing_org = await self.session.execute(
            select(Organization).where(Organization.slug == slug)
        )
        if existing_org.scalar_one_or_none():
            raise ValueError(f"Organization slug '{slug}' already exists")
        
        # Create organization with secure defaults
        organization = Organization(
            name=name,
            slug=slug,
            organization_type=organization_type,
            primary_contact_email=primary_contact_email,
            created_by=created_by_user_id,
            # Security defaults
            require_2fa=False,  # Can be enabled later
            session_timeout_minutes=480,  # 8 hours
            data_retention_days=2555,     # 7 years for GxP compliance
            # Subscription defaults
            subscription_tier="trial",
            max_users=5,
            max_monthly_analyses=50,
            **kwargs
        )
        
        self.session.add(organization)
        await self.session.flush()
        
        # Create system audit record (for platform-level tracking)
        if created_by_user_id:
            audit_record = AuditTrail(
                user_id=created_by_user_id,
                organization_id=organization.id,
                user_email=primary_contact_email,
                user_role="system",
                action=AuditAction.CREATE,
                object_type="organization",
                object_id=organization.id,
                object_name=organization.name,
                regulatory_significance=True,
                additional_metadata={
                    "organization_type": organization_type.value,
                    "initial_setup": True
                }
            )
            self.session.add(audit_record)
        
        await self.session.commit()
        logger.info(f"Created organization: {name} ({organization.id})")
        
        return organization
    
    async def get_organization_by_slug(self, slug: str) -> Optional[Organization]:
        """Retrieve organization by slug with user relationships"""
        result = await self.session.execute(
            select(Organization)
            .options(selectinload(Organization.users))
            .where(Organization.slug == slug, Organization.is_active == True)
        )
        return result.scalar_one_or_none()
    
    async def update_organization_settings(
        self,
        organization_id: uuid.UUID,
        updates: Dict[str, Any],
        updated_by: uuid.UUID,
        change_reason: Optional[str] = None
    ) -> Organization:
        """Update organization settings with audit trail"""
        
        # Get current organization
        org = await self.session.get(Organization, organization_id)
        if not org:
            raise ValueError(f"Organization {organization_id} not found")
        
        # Create auditable session for tracking changes
        auditable_session = AuditableSession(
            self.session, updated_by, organization_id
        )
        
        # Apply updates with field-level audit trail
        for field, new_value in updates.items():
            if hasattr(org, field):
                old_value = getattr(org, field)
                setattr(org, field, new_value)
                
                # Create audit record for each field change
                await auditable_session.audit_update(
                    org, field, str(old_value), str(new_value), change_reason
                )
        
        org.updated_at = datetime.now(timezone.utc)
        await self.session.commit()
        
        return org

# ============================================================================
# USER SERVICE (IDENTITY AND ACCESS MANAGEMENT)
# ============================================================================

class UserService:
    """Service for managing users with multi-tenant isolation and security controls"""
    
    def __init__(self, session: AsyncSession, organization_id: uuid.UUID):
        self.session = session
        self.organization_id = organization_id
        self.query_builder = TenantQueryBuilder(session, organization_id)
    
    async def create_user(
        self,
        email: str,
        first_name: str,
        last_name: str,
        role: UserRole,
        created_by: uuid.UUID,
        external_id: Optional[str] = None,
        sso_provider: Optional[str] = None,
        **kwargs
    ) -> User:
        """
        Create a new user within the organization with proper audit trail.
        """
        # Validate email uniqueness
        existing_user = await self.session.execute(
            select(User).where(User.email == email)
        )
        if existing_user.scalar_one_or_none():
            raise ValueError(f"User with email '{email}' already exists")
        
        # Create user
        user = User(
            organization_id=self.organization_id,
            email=email,
            first_name=first_name,
            last_name=last_name,
            role=role,
            external_id=external_id,
            sso_provider=sso_provider,
            created_by=created_by,
            email_verified=False,  # Must be verified through SSO flow
            **kwargs
        )
        
        self.session.add(user)
        await self.session.flush()
        
        # Create audit record
        auditable_session = AuditableSession(self.session, created_by, self.organization_id)
        await auditable_session.audit_create(
            user, f"{first_name} {last_name}",
            additional_metadata={
                "role": role.value,
                "sso_provider": sso_provider,
                "user_invitation": True
            }
        )
        
        await self.session.commit()
        logger.info(f"Created user: {email} in organization {self.organization_id}")
        
        return user
    
    async def authenticate_user_login(
        self, 
        user_id: uuid.UUID,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
        session_id: Optional[str] = None
    ) -> User:
        """
        Record user authentication and update login statistics.
        Called after successful SSO authentication.
        """
        user = await self.query_builder.get_tenant_object(User, user_id)
        if not user:
            raise ValueError(f"User {user_id} not found in organization {self.organization_id}")
        
        if not user.is_active:
            raise ValueError(f"User {user_id} is not active")
        
        # Check if account is locked
        if user.locked_until and user.locked_until > datetime.now(timezone.utc):
            raise ValueError(f"User account is locked until {user.locked_until}")
        
        # Update login statistics
        user.last_login = datetime.now(timezone.utc)
        user.login_count = (user.login_count or 0) + 1
        user.failed_login_attempts = 0  # Reset on successful login
        user.locked_until = None
        
        # Create login audit record
        audit_record = AuditTrail(
            user_id=user.id,
            organization_id=self.organization_id,
            user_email=user.email,
            user_role=user.role.value,
            action=AuditAction.LOGIN,
            object_type="user",
            object_id=user.id,
            object_name=user.full_name,
            ip_address=ip_address,
            user_agent=user_agent,
            session_id=session_id,
            regulatory_significance=True,
            additional_metadata={
                "login_count": user.login_count,
                "sso_provider": user.sso_provider
            }
        )
        
        self.session.add(audit_record)
        await self.session.commit()
        
        logger.info(f"User {user.email} authenticated successfully")
        return user
    
    async def get_organization_users(self, include_inactive: bool = False) -> List[User]:
        """Get all users in the organization with tenant isolation"""
        query = select(User).where(User.organization_id == self.organization_id)
        
        if not include_inactive:
            query = query.where(User.is_active == True)
        
        result = await self.session.execute(query.order_by(User.created_at))
        return result.scalars().all()
    
    async def update_user_role(
        self,
        user_id: uuid.UUID,
        new_role: UserRole,
        updated_by: uuid.UUID,
        change_reason: str
    ) -> User:
        """Update user role with security validation and audit trail"""
        
        # Validate the user exists in this organization
        user = await self.query_builder.get_tenant_object(User, user_id)
        if not user:
            raise ValueError(f"User {user_id} not found")
        
        # Security validation: Only admins/owners can change roles
        updater = await self.query_builder.get_tenant_object(User, updated_by)
        if not updater or updater.role not in [UserRole.ADMIN, UserRole.OWNER]:
            raise PermissionError("Only administrators can modify user roles")
        
        # Record the change
        old_role = user.role
        user.role = new_role
        user.updated_at = datetime.now(timezone.utc)
        
        # Create detailed audit record for permission change
        audit_record = AuditTrail(
            user_id=updated_by,
            organization_id=self.organization_id,
            user_email=updater.email,
            user_role=updater.role.value,
            action=AuditAction.PERMISSION_CHANGE,
            object_type="user",
            object_id=user.id,
            object_name=user.full_name,
            field_name="role",
            old_value=old_role.value,
            new_value=new_role.value,
            change_reason=change_reason,
            regulatory_significance=True,
            requires_review=True,  # Role changes should be reviewed
            additional_metadata={
                "target_user_email": user.email,
                "changed_by": updater.full_name,
                "elevation": new_role.value in ["admin", "owner"]
            }
        )
        
        self.session.add(audit_record)
        await self.session.commit()
        
        logger.info(f"Updated user {user.email} role from {old_role.value} to {new_role.value}")
        return user

# ============================================================================
# DOCUMENT SERVICE (DOCUMENT LIFECYCLE MANAGEMENT)
# ============================================================================

class DocumentService:
    """Service for managing documents with version control and compliance tracking"""
    
    def __init__(self, session: AsyncSession, organization_id: uuid.UUID, user_id: uuid.UUID):
        self.session = session
        self.organization_id = organization_id
        self.user_id = user_id
        self.query_builder = TenantQueryBuilder(session, organization_id)
        self.auditable_session = AuditableSession(session, user_id, organization_id)
    
    async def upload_document(
        self,
        filename: str,
        document_type: DocumentType,
        s3_bucket: str,
        s3_key: str,
        file_size: int,
        content_hash: str,
        mime_type: str,
        title: Optional[str] = None,
        description: Optional[str] = None,
        version: Optional[str] = None
    ) -> Document:
        """
        Create a new document record after file upload to S3.
        Implements proper audit trail for document creation.
        """
        # Validate content hash for integrity
        if len(content_hash) != 64:  # SHA-256 should be 64 characters
            raise ValueError("Invalid content hash format")
        
        # Check for duplicate documents by hash
        existing_doc = await self.session.execute(
            select(Document).where(
                Document.organization_id == self.organization_id,
                Document.content_hash == content_hash
            )
        )
        if existing_doc.scalar_one_or_none():
            raise ValueError("Document with identical content already exists")
        
        # Create document record
        document = Document(
            organization_id=self.organization_id,
            filename=filename,
            original_filename=filename,
            document_type=document_type,
            s3_bucket=s3_bucket,
            s3_key=s3_key,
            file_size=file_size,
            content_hash=content_hash,
            mime_type=mime_type,
            title=title or filename,
            description=description,
            version=version or "1.0",
            created_by=self.user_id,
            is_controlled_document=True,  # All documents are controlled by default
            approval_status="draft"
        )
        
        self.session.add(document)
        await self.session.flush()
        
        # Create audit trail for document upload
        await self.auditable_session.audit_create(
            document, 
            filename,
            additional_metadata={
                "file_size": file_size,
                "document_type": document_type.value,
                "s3_location": f"s3://{s3_bucket}/{s3_key}",
                "content_hash": content_hash
            }
        )
        
        await self.session.commit()
        logger.info(f"Document uploaded: {filename} ({document.id})")
        
        return document
    
    async def get_organization_documents(
        self, 
        document_type: Optional[DocumentType] = None,
        approval_status: Optional[str] = None,
        limit: int = 100,
        offset: int = 0
    ) -> List[Document]:
        """Get documents for the organization with filtering and pagination"""
        
        query = select(Document).where(Document.organization_id == self.organization_id)
        
        if document_type:
            query = query.where(Document.document_type == document_type)
        
        if approval_status:
            query = query.where(Document.approval_status == approval_status)
        
        query = query.order_by(Document.created_at.desc()).limit(limit).offset(offset)
        
        result = await self.session.execute(query)
        return result.scalars().all()
    
    async def approve_document(
        self,
        document_id: uuid.UUID,
        approved_by: uuid.UUID,
        approval_reason: str
    ) -> Document:
        """
        Approve a document with proper authorization and audit trail.
        Only Quality Managers, Admins, and Owners can approve documents.
        """
        # Validate document exists and belongs to organization
        document = await self.query_builder.get_tenant_object(Document, document_id)
        if not document:
            raise ValueError(f"Document {document_id} not found")
        
        # Validate approver has permission
        approver = await self.query_builder.get_tenant_object(User, approved_by)
        if not approver or not approver.can_perform_action("approve_document", "document"):
            raise PermissionError("User does not have permission to approve documents")
        
        # Update document status
        old_status = document.approval_status
        document.approval_status = "approved"
        document.approved_by = approved_by
        document.approved_at = datetime.now(timezone.utc)
        document.updated_at = datetime.now(timezone.utc)
        
        # Create detailed audit record for approval
        audit_record = AuditTrail(
            user_id=approved_by,
            organization_id=self.organization_id,
            user_email=approver.email,
            user_role=approver.role.value,
            action=AuditAction.UPDATE,
            object_type="document",
            object_id=document.id,
            object_name=document.filename,
            field_name="approval_status",
            old_value=old_status,
            new_value="approved",
            change_reason=approval_reason,
            regulatory_significance=True,
            requires_review=False,  # Approval action doesn't need additional review
            electronic_signature=f"approved_by:{approver.full_name}",
            signature_method="electronic_approval",
            additional_metadata={
                "document_type": document.document_type.value,
                "document_version": document.version,
                "approver_role": approver.role.value
            }
        )
        
        self.session.add(audit_record)
        await self.session.commit()
        
        logger.info(f"Document {document.filename} approved by {approver.full_name}")
        return document

# ============================================================================
# ANALYSIS SERVICE (AI-POWERED REGULATORY ANALYSIS)
# ============================================================================

class AnalysisService:
    """Service for managing regulatory analyses with comprehensive tracking"""
    
    def __init__(self, session: AsyncSession, organization_id: uuid.UUID, user_id: uuid.UUID):
        self.session = session
        self.organization_id = organization_id
        self.user_id = user_id
        self.query_builder = TenantQueryBuilder(session, organization_id)
        self.auditable_session = AuditableSession(session, user_id, organization_id)
    
    async def create_analysis_job(
        self,
        document_id: uuid.UUID,
        regulatory_standard: RegulatoryStandard,
        analysis_type: str = "gap_analysis"
    ) -> Analysis:
        """
        Create a new analysis job and queue it for processing.
        This method creates the database record; actual AI processing is handled by Celery worker.
        """
        # Validate document exists and belongs to organization
        document = await self.query_builder.get_tenant_object(Document, document_id)
        if not document:
            raise ValueError(f"Document {document_id} not found")
        
        # Check for existing analysis
        existing_analysis = await self.session.execute(
            select(Analysis).where(
                Analysis.document_id == document_id,
                Analysis.regulatory_standard == regulatory_standard,
                Analysis.organization_id == self.organization_id
            )
        )
        if existing_analysis.scalar_one_or_none():
            raise ValueError(f"Analysis already exists for document {document_id} against {regulatory_standard.value}")
        
        # Create analysis job
        analysis = Analysis(
            organization_id=self.organization_id,
            document_id=document_id,
            regulatory_standard=regulatory_standard,
            analysis_type=analysis_type,
            status=AnalysisStatus.PENDING,
            created_by=self.user_id
        )
        
        self.session.add(analysis)
        await self.session.flush()
        
        # Create audit record for analysis creation
        await self.auditable_session.audit_create(
            analysis,
            f"{document.filename} vs {regulatory_standard.value}",
            additional_metadata={
                "document_filename": document.filename,
                "regulatory_standard": regulatory_standard.value,
                "analysis_type": analysis_type,
                "document_type": document.document_type.value
            }
        )
        
        await self.session.commit()
        
        # TODO: Queue analysis job with Celery worker
        # from .tasks.analysis_tasks import run_gap_analysis
        # run_gap_analysis.delay(str(analysis.id))
        
        logger.info(f"Analysis job created: {analysis.id}")
        return analysis
    
    async def update_analysis_status(
        self,
        analysis_id: uuid.UUID,
        status: AnalysisStatus,
        findings: Optional[Dict[str, Any]] = None,
        error_message: Optional[str] = None
    ) -> Analysis:
        """
        Update analysis status and results (typically called by Celery worker).
        """
        analysis = await self.query_builder.get_tenant_object(Analysis, analysis_id)
        if not analysis:
            raise ValueError(f"Analysis {analysis_id} not found")
        
        old_status = analysis.status
        analysis.status = status
        analysis.updated_at = datetime.now(timezone.utc)
        
        if status == AnalysisStatus.PROCESSING and not analysis.started_at:
            analysis.started_at = datetime.now(timezone.utc)
        elif status in [AnalysisStatus.COMPLETED, AnalysisStatus.FAILED]:
            analysis.completed_at = datetime.now(timezone.utc)
            if analysis.started_at:
                processing_time = analysis.completed_at - analysis.started_at
                analysis.processing_time_seconds = int(processing_time.total_seconds())
        
        if findings:
            analysis.findings_summary = findings.get('summary')
            analysis.detailed_findings = findings.get('detailed_findings')
            analysis.confidence_score = findings.get('confidence_score')
            analysis.risk_level = findings.get('risk_level')
            analysis.identified_gaps = findings.get('gaps', [])
            analysis.recommendations = findings.get('recommendations', [])
            analysis.citations = findings.get('citations', [])
        
        if error_message:
            analysis.error_message = error_message
            analysis.retry_count = (analysis.retry_count or 0) + 1
        
        # Create audit record for status change
        await self.auditable_session.audit_update(
            analysis,
            "status",
            old_status.value,
            status.value,
            additional_metadata={
                "processing_time_seconds": analysis.processing_time_seconds,
                "confidence_score": analysis.confidence_score,
                "error_occurred": bool(error_message)
            }
        )
        
        await self.session.commit()
        return analysis
    
    async def export_analysis_report(
        self,
        analysis_id: uuid.UUID,
        export_format: str = "pdf",
        report_s3_key: Optional[str] = None,
        report_hash: Optional[str] = None
    ) -> Analysis:
        """
        Mark analysis as exported and create audit trail for compliance.
        Critical for 21 CFR Part 11 electronic records requirements.
        """
        analysis = await self.query_builder.get_tenant_object(Analysis, analysis_id)
        if not analysis:
            raise ValueError(f"Analysis {analysis_id} not found")
        
        if analysis.status != AnalysisStatus.COMPLETED:
            raise ValueError("Cannot export incomplete analysis")
        
        # Update export tracking
        analysis.report_generated = True
        analysis.report_s3_key = report_s3_key
        analysis.report_hash = report_hash
        analysis.updated_at = datetime.now(timezone.utc)
        
        # Create critical audit record for export (regulatory requirement)
        await self.auditable_session.audit_export(
            analysis,
            export_format,
            additional_metadata={
                "report_location": f"s3://{report_s3_key}" if report_s3_key else None,
                "report_hash": report_hash,
                "regulatory_standard": analysis.regulatory_standard.value,
                "document_filename": analysis.document.filename if analysis.document else None,
                "export_timestamp": datetime.now(timezone.utc).isoformat()
            }
        )
        
        await self.session.commit()
        
        logger.info(f"Analysis report exported: {analysis_id}")
        return analysis

# ============================================================================
# AUDIT SERVICE (COMPLIANCE REPORTING AND FORENSICS)
# ============================================================================

class AuditService:
    """Service for querying audit trails and generating compliance reports"""
    
    def __init__(self, session: AsyncSession, organization_id: uuid.UUID, user_id: uuid.UUID):
        self.session = session
        self.organization_id = organization_id
        self.user_id = user_id
        self.query_builder = TenantQueryBuilder(session, organization_id)
    
    async def get_user_activity_report(
        self,
        target_user_id: Optional[uuid.UUID] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        actions: Optional[List[AuditAction]] = None
    ) -> List[AuditTrail]:
        """
        Generate comprehensive user activity report for compliance audits.
        """
        # Verify requesting user has permission to view audit trails
        requesting_user = await self.query_builder.get_tenant_object(User, self.user_id)
        if not requesting_user or not requesting_user.can_perform_action("view_audit_trail", "audit"):
            raise PermissionError("User does not have permission to view audit trails")
        
        query = select(AuditTrail).where(AuditTrail.organization_id == self.organization_id)
        
        if target_user_id:
            query = query.where(AuditTrail.user_id == target_user_id)
        
        if start_date:
            query = query.where(AuditTrail.timestamp >= start_date)
        
        if end_date:
            query = query.where(AuditTrail.timestamp <= end_date)
        
        if actions:
            query = query.where(AuditTrail.action.in_(actions))
        
        # Order by most recent first
        query = query.order_by(AuditTrail.timestamp.desc()).limit(1000)  # Limit for performance
        
        result = await self.session.execute(query)
        audit_records = result.scalars().all()
        
        # Create audit record for accessing audit trail (meta-audit)
        await self.auditable_session.audit_create(
            type('AuditQuery', (), {'id': uuid.uuid4(), '__class__': type('AuditQuery', (), {})})(),
            "audit_trail_query",
            additional_metadata={
                "target_user_id": str(target_user_id) if target_user_id else None,
                "date_range": {
                    "start": start_date.isoformat() if start_date else None,
                    "end": end_date.isoformat() if end_date else None
                },
                "actions_queried": [action.value for action in actions] if actions else None,
                "records_returned": len(audit_records)
            }
        )
        
        return audit_records
    
    async def get_document_change_history(self, document_id: uuid.UUID) -> List[AuditTrail]:
        """Get complete change history for a specific document"""
        
        # Validate document access
        document = await self.query_builder.get_tenant_object(Document, document_id)
        if not document:
            raise ValueError(f"Document {document_id} not found")
        
        # Get all audit records for this document
        result = await self.session.execute(
            select(AuditTrail)
            .where(
                AuditTrail.organization_id == self.organization_id,
                AuditTrail.object_type == "document",
                AuditTrail.object_id == document_id
            )
            .order_by(AuditTrail.timestamp.asc())
        )
        
        return result.scalars().all()
    
    async def generate_compliance_summary(
        self, 
        start_date: datetime,
        end_date: datetime
    ) -> Dict[str, Any]:
        """
        Generate compliance summary report for regulatory audits.
        Provides statistics and key metrics for the specified time period.
        """
        # Verify user has permission
        requesting_user = await self.query_builder.get_tenant_object(User, self.user_id)
        if not requesting_user or requesting_user.role not in [UserRole.QUALITY_MANAGER, UserRole.ADMIN, UserRole.OWNER]:
            raise PermissionError("Only Quality Managers and above can generate compliance reports")
        
        # Get audit statistics
        audit_stats = await self.session.execute(
            select(
                AuditTrail.action,
                func.count(AuditTrail.id).label('count')
            )
            .where(
                AuditTrail.organization_id == self.organization_id,
                AuditTrail.timestamp.between(start_date, end_date),
                AuditTrail.regulatory_significance == True
            )
            .group_by(AuditTrail.action)
        )
        
        # Get document statistics
        doc_stats = await self.session.execute(
            select(
                Document.document_type,
                Document.approval_status,
                func.count(Document.id).label('count')
            )
            .where(
                Document.organization_id == self.organization_id,
                Document.created_at.between(start_date, end_date)
            )
            .group_by(Document.document_type, Document.approval_status)
        )
        
        # Get analysis statistics  
        analysis_stats = await self.session.execute(
            select(
                Analysis.regulatory_standard,
                Analysis.status,
                func.count(Analysis.id).label('count')
            )
            .where(
                Analysis.organization_id == self.organization_id,
                Analysis.created_at.between(start_date, end_date)
            )
            .group_by(Analysis.regulatory_standard, Analysis.status)
        )
        
        # Compile summary
        summary = {
            "organization_id": str(self.organization_id),
            "report_period": {
                "start": start_date.isoformat(),
                "end": end_date.isoformat()
            },
            "audit_activity": {row.action.value: row.count for row in audit_stats},
            "document_activity": {f"{row.document_type.value}_{row.approval_status}": row.count for row in doc_stats},
            "analysis_activity": {f"{row.regulatory_standard.value}_{row.status.value}": row.count for row in analysis_stats},
            "generated_by": requesting_user.full_name,
            "generated_at": datetime.now(timezone.utc).isoformat()
        }
        
        # Audit the generation of this compliance report
        await self.auditable_session.audit_create(
            type('ComplianceReport', (), {'id': uuid.uuid4(), '__class__': type('ComplianceReport', (), {})})(),
            f"compliance_report_{start_date.strftime('%Y%m%d')}_{end_date.strftime('%Y%m%d')}",
            additional_metadata=summary
        )
        
        await self.session.commit()
        return summary

# ============================================================================
# REGULATORY KNOWLEDGE SERVICE
# ============================================================================

class RegulatoryKnowledgeService:
    """Service for managing regulatory requirements and knowledge base"""
    
    def __init__(self, session: AsyncSession):
        self.session = session
    
    async def search_requirements(
        self,
        standard: Optional[RegulatoryStandard] = None,
        keywords: Optional[List[str]] = None,
        category: Optional[str] = None,
        limit: int = 50
    ) -> List[RegulatoryRequirement]:
        """Search regulatory requirements with filtering"""
        
        query = select(RegulatoryRequirement).where(RegulatoryRequirement.is_current == True)
        
        if standard:
            query = query.where(RegulatoryRequirement.standard == standard)
        
        if category:
            query = query.where(RegulatoryRequirement.category == category)
        
        if keywords:
            # Simple keyword search in text fields
            keyword_conditions = []
            for keyword in keywords:
                keyword_conditions.append(
                    or_(
                        RegulatoryRequirement.title.ilike(f"%{keyword}%"),
                        RegulatoryRequirement.requirement_text.ilike(f"%{keyword}%"),
                        RegulatoryRequirement.keywords.contains([keyword])
                    )
                )
            query = query.where(and_(*keyword_conditions))
        
        query = query.order_by(RegulatoryRequirement.standard, RegulatoryRequirement.section_number).limit(limit)
        
        result = await self.session.execute(query)
        return result.scalars().all()
    
    async def get_requirement_by_section(
        self, 
        standard: RegulatoryStandard,
        section_number: str
    ) -> Optional[RegulatoryRequirement]:
        """Get specific requirement by standard and section number"""
        
        result = await self.session.execute(
            select(RegulatoryRequirement).where(
                RegulatoryRequirement.standard == standard,
                RegulatoryRequirement.section_number == section_number,
                RegulatoryRequirement.is_current == True
            )
        )
        
        return result.scalar_one_or_none()

# ============================================================================
# UTILITY FUNCTIONS
# ============================================================================

def calculate_file_hash(file_content: bytes) -> str:
    """Calculate SHA-256 hash of file content for integrity verification"""
    return hashlib.sha256(file_content).hexdigest()

async def validate_tenant_access(
    session: AsyncSession,
    user_id: uuid.UUID,
    organization_id: uuid.UUID
) -> bool:
    """
    Validate that a user belongs to the specified organization.
    Critical security function for preventing cross-tenant access.
    """
    result = await session.execute(
        select(User).where(
            User.id == user_id,
            User.organization_id == organization_id,
            User.is_active == True
        )
    )
    
    return result.scalar_one_or_none() is not None

async def get_organization_usage_stats(
    session: AsyncSession,
    organization_id: uuid.UUID
) -> Dict[str, Any]:
    """Get current usage statistics for subscription management"""
    
    # Count active users
    user_count = await session.execute(
        select(func.count(User.id)).where(
            User.organization_id == organization_id,
            User.is_active == True
        )
    )
    
    # Count analyses this month
    from datetime import date
    month_start = date.today().replace(day=1)
    analysis_count = await session.execute(
        select(func.count(Analysis.id)).where(
            Analysis.organization_id == organization_id,
            func.date(Analysis.created_at) >= month_start
        )
    )
    
    # Calculate storage usage (sum of document file sizes)
    storage_usage = await session.execute(
        select(func.coalesce(func.sum(Document.file_size), 0)).where(
            Document.organization_id == organization_id
        )
    )
    
    return {
        "active_users": user_count.scalar(),
        "monthly_analyses": analysis_count.scalar(),
        "storage_bytes": storage_usage.scalar()
    }