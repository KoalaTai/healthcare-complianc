"""
Database models for VirtualBackroom.ai
Comprehensive schema supporting multi-tenant architecture, audit simulations,
AI interactions, and regulatory compliance tracking
"""
from datetime import datetime, timezone
from typing import Optional, List
from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship
from sqlalchemy import (
    Integer, String, Text, Boolean, DateTime, ForeignKey, 
    UniqueConstraint, Index, JSON, Float, Enum as SQLEnum
)
from enum import Enum
import enum


class Base(DeclarativeBase):
    pass


db = SQLAlchemy(model_class=Base)


# Enums for type safety
class UserRole(str, enum.Enum):
    USER = "user"
    ADMIN = "admin"
    QUALITY_MANAGER = "quality_manager"
    AUDITOR = "auditor"


class SimulationStatus(str, enum.Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class AuditRoleType(str, enum.Enum):
    CREATOR = "creator"
    AUDITOR = "auditor"
    AUDITEE = "auditee"
    OBSERVER = "observer"


class FindingSeverity(str, enum.Enum):
    MINOR = "minor"
    MAJOR = "major"
    CRITICAL = "critical"


class DocumentRequestStatus(str, enum.Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    FULFILLED = "fulfilled"
    REJECTED = "rejected"


class NotificationStatus(str, enum.Enum):
    UNREAD = "unread"
    READ = "read"
    ARCHIVED = "archived"


# Core User and Authentication Models
class User(UserMixin, db.Model):
    """User model with support for both credential and OAuth authentication"""
    __tablename__ = 'users'
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    username: Mapped[str] = mapped_column(String(80), unique=True, nullable=False, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    password_hash: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    role: Mapped[UserRole] = mapped_column(SQLEnum(UserRole), default=UserRole.USER, nullable=False)
    
    # OAuth and Firebase integration
    is_oauth_user: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    oauth_provider: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    firebase_uid: Mapped[Optional[str]] = mapped_column(String(255), unique=True, nullable=True, index=True)
    
    # Timestamps
    date_registered: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    last_login: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    
    # Profile information
    first_name: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    last_name: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    organization: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    job_title: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    
    # Account status
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    email_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    
    # Relationships
    simulations_created: Mapped[List["AuditSimulation"]] = relationship(
        "AuditSimulation", back_populates="creator", foreign_keys="AuditSimulation.creator_id"
    )
    audit_roles: Mapped[List["AuditRole"]] = relationship("AuditRole", back_populates="user")
    findings_created: Mapped[List["AuditFinding"]] = relationship("AuditFinding", back_populates="created_by")
    notifications: Mapped[List["Notification"]] = relationship("Notification", back_populates="user")
    help_conversations: Mapped[List["HelpConversation"]] = relationship("HelpConversation", back_populates="user")
    documents: Mapped[List["Document"]] = relationship("Document", back_populates="user")
    
    def set_password(self, password: str) -> None:
        """Hash and set the user's password"""
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password: str) -> bool:
        """Check if the provided password matches the stored hash"""
        if not self.password_hash:
            return False
        return check_password_hash(self.password_hash, password)
    
    def has_role(self, role_name: str) -> bool:
        """Check if user has the specified role"""
        return self.role.value == role_name
    
    @property
    def full_name(self) -> str:
        """Get user's full name"""
        if self.first_name and self.last_name:
            return f"{self.first_name} {self.last_name}"
        return self.username
    
    def __repr__(self):
        return f'<User {self.username}>'


# Audit Simulation Models
class AuditSimulation(db.Model):
    """Core model for audit simulation sessions"""
    __tablename__ = 'audit_simulations'
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    # Simulation configuration
    regulatory_standard: Mapped[str] = mapped_column(String(100), nullable=False)  # e.g., 'FDA_QSR', 'ISO_13485'
    difficulty: Mapped[str] = mapped_column(String(20), default='medium', nullable=False)  # easy, medium, hard
    status: Mapped[SimulationStatus] = mapped_column(SQLEnum(SimulationStatus), default=SimulationStatus.PENDING, nullable=False)
    
    # Ownership and access
    creator_id: Mapped[int] = mapped_column(Integer, ForeignKey('users.id'), nullable=False)
    is_public: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    
    # Timestamps
    created_date: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    start_date: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    completion_date: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    
    # Simulation settings
    enable_voice: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    time_limit_minutes: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    
    # Relationships
    creator: Mapped["User"] = relationship("User", back_populates="simulations_created", foreign_keys=[creator_id])
    audit_roles: Mapped[List["AuditRole"]] = relationship("AuditRole", back_populates="simulation", cascade="all, delete-orphan")
    findings: Mapped[List["AuditFinding"]] = relationship("AuditFinding", back_populates="simulation", cascade="all, delete-orphan")
    document_requests: Mapped[List["SimulationDocumentRequest"]] = relationship("SimulationDocumentRequest", back_populates="simulation", cascade="all, delete-orphan")
    timers: Mapped[List["AuditTimer"]] = relationship("AuditTimer", back_populates="simulation", cascade="all, delete-orphan")
    debrief: Mapped[Optional["AuditDebrief"]] = relationship("AuditDebrief", back_populates="simulation", uselist=False, cascade="all, delete-orphan")
    
    # Indexes
    __table_args__ = (
        Index('idx_simulation_creator_status', 'creator_id', 'status'),
        Index('idx_simulation_standard', 'regulatory_standard'),
    )
    
    def __repr__(self):
        return f'<AuditSimulation {self.title}>'


class AuditRole(db.Model):
    """User roles within specific audit simulations"""
    __tablename__ = 'audit_roles'
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    simulation_id: Mapped[int] = mapped_column(Integer, ForeignKey('audit_simulations.id'), nullable=False)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey('users.id'), nullable=False)
    role_type: Mapped[AuditRoleType] = mapped_column(SQLEnum(AuditRoleType), nullable=False)
    
    # Role-specific settings
    permissions: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    assigned_date: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    
    # Relationships
    simulation: Mapped["AuditSimulation"] = relationship("AuditSimulation", back_populates="audit_roles")
    user: Mapped["User"] = relationship("User", back_populates="audit_roles")
    
    # Constraints
    __table_args__ = (
        UniqueConstraint('simulation_id', 'user_id', name='unique_simulation_user_role'),
        Index('idx_audit_role_simulation', 'simulation_id'),
    )
    
    def __repr__(self):
        return f'<AuditRole {self.role_type} for Simulation {self.simulation_id}>'


class AuditFinding(db.Model):
    """Findings discovered during audit simulations"""
    __tablename__ = 'audit_findings'
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    simulation_id: Mapped[int] = mapped_column(Integer, ForeignKey('audit_simulations.id'), nullable=False)
    created_by_id: Mapped[int] = mapped_column(Integer, ForeignKey('users.id'), nullable=False)
    
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    finding_type: Mapped[str] = mapped_column(String(100), nullable=False)  # e.g., 'documentation', 'process', 'training'
    severity: Mapped[FindingSeverity] = mapped_column(SQLEnum(FindingSeverity), nullable=False)
    
    # Evidence and documentation
    evidence_path: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)  # File path for evidence
    regulatory_reference: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)  # Citation
    
    # Status tracking
    is_closed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_date: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    
    # Relationships
    simulation: Mapped["AuditSimulation"] = relationship("AuditSimulation", back_populates="findings")
    created_by: Mapped["User"] = relationship("User", back_populates="findings_created")
    
    # Indexes
    __table_args__ = (
        Index('idx_finding_simulation', 'simulation_id'),
        Index('idx_finding_severity', 'severity'),
    )
    
    def __repr__(self):
        return f'<AuditFinding {self.title}>'


class SimulationDocumentRequest(db.Model):
    """Document requests during audit simulations"""
    __tablename__ = 'simulation_document_requests'
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    simulation_id: Mapped[int] = mapped_column(Integer, ForeignKey('audit_simulations.id'), nullable=False)
    
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    document_type: Mapped[str] = mapped_column(String(100), nullable=False)  # e.g., 'SOP', 'procedure', 'record'
    
    # Request management
    requested_by_id: Mapped[int] = mapped_column(Integer, ForeignKey('users.id'), nullable=False)
    assigned_to_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey('users.id'), nullable=True)
    status: Mapped[DocumentRequestStatus] = mapped_column(SQLEnum(DocumentRequestStatus), default=DocumentRequestStatus.PENDING, nullable=False)
    
    # Timing
    requested_date: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    due_date: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    fulfilled_date: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    
    # Response
    response_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    document_path: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    
    # Relationships
    simulation: Mapped["AuditSimulation"] = relationship("AuditSimulation", back_populates="document_requests")
    requested_by: Mapped["User"] = relationship("User", foreign_keys=[requested_by_id])
    assigned_to: Mapped[Optional["User"]] = relationship("User", foreign_keys=[assigned_to_id])
    
    def __repr__(self):
        return f'<DocumentRequest {self.title}>'


class AuditTimer(db.Model):
    """Time tracking for audit simulation activities"""
    __tablename__ = 'audit_timers'
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    simulation_id: Mapped[int] = mapped_column(Integer, ForeignKey('audit_simulations.id'), nullable=False)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey('users.id'), nullable=False)
    
    activity_type: Mapped[str] = mapped_column(String(100), nullable=False)  # e.g., 'document_review', 'interview', 'analysis'
    description: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    
    start_time: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    end_time: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    duration_seconds: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    
    # Relationships
    simulation: Mapped["AuditSimulation"] = relationship("AuditSimulation", back_populates="timers")
    user: Mapped["User"] = relationship("User")
    
    def __repr__(self):
        return f'<AuditTimer {self.activity_type}>'


class AuditDebrief(db.Model):
    """Post-simulation debriefing and analysis"""
    __tablename__ = 'audit_debriefs'
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    simulation_id: Mapped[int] = mapped_column(Integer, ForeignKey('audit_simulations.id'), unique=True, nullable=False)
    
    summary: Mapped[str] = mapped_column(Text, nullable=False)
    strengths: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    areas_for_improvement: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    follow_up_actions: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    # Scoring and metrics
    overall_score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    completion_time_minutes: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    
    created_date: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    
    # Relationships
    simulation: Mapped["AuditSimulation"] = relationship("AuditSimulation", back_populates="debrief")
    
    def __repr__(self):
        return f'<AuditDebrief for Simulation {self.simulation_id}>'


# Document Management Models
class Document(db.Model):
    """User-uploaded documents for analysis and simulations"""
    __tablename__ = 'documents'
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    # File information
    file_path: Mapped[str] = mapped_column(String(500), nullable=False)
    file_name: Mapped[str] = mapped_column(String(255), nullable=False)
    file_hash: Mapped[str] = mapped_column(String(64), nullable=False, index=True)  # SHA-256 hash for deduplication
    file_size: Mapped[int] = mapped_column(Integer, nullable=False)
    file_type: Mapped[str] = mapped_column(String(100), nullable=False)  # MIME type
    
    # Ownership
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey('users.id'), nullable=False)
    simulation_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey('audit_simulations.id'), nullable=True)
    
    # Metadata
    upload_date: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    is_processed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    processing_status: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    
    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="documents")
    simulation: Mapped[Optional["AuditSimulation"]] = relationship("AuditSimulation")
    
    def __repr__(self):
        return f'<Document {self.file_name}>'


# Notification System Models
class Notification(db.Model):
    """User notifications and alerts"""
    __tablename__ = 'notifications'
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey('users.id'), nullable=False)
    
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    notification_type: Mapped[str] = mapped_column(String(50), nullable=False)  # e.g., 'simulation', 'system', 'reminder'
    
    # Navigation
    link: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)  # URL for action
    
    # Status
    status: Mapped[NotificationStatus] = mapped_column(SQLEnum(NotificationStatus), default=NotificationStatus.UNREAD, nullable=False)
    created_date: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    read_date: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    
    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="notifications")
    
    # Indexes
    __table_args__ = (
        Index('idx_notification_user_status', 'user_id', 'status'),
    )
    
    def __repr__(self):
        return f'<Notification {self.title}>'


# AI Assistant Models
class HelpConversation(db.Model):
    """Conversation threads with the AI help assistant"""
    __tablename__ = 'help_conversations'
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey('users.id'), nullable=False)
    
    title: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    context: Mapped[str] = mapped_column(String(100), nullable=False)  # e.g., 'dashboard', 'simulation_detail'
    page_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    
    created_date: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_date: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    
    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="help_conversations")
    messages: Mapped[List["HelpMessage"]] = relationship("HelpMessage", back_populates="conversation", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f'<HelpConversation {self.id}>'


class HelpMessage(db.Model):
    """Individual messages within help conversations"""
    __tablename__ = 'help_messages'
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    conversation_id: Mapped[int] = mapped_column(Integer, ForeignKey('help_conversations.id'), nullable=False)
    
    role: Mapped[str] = mapped_column(String(20), nullable=False)  # 'user' or 'assistant'
    content: Mapped[str] = mapped_column(Text, nullable=False)
    
    created_date: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    
    # AI-specific metadata
    ai_provider: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    processing_time_ms: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    
    # Relationships
    conversation: Mapped["HelpConversation"] = relationship("HelpConversation", back_populates="messages")
    
    # Indexes
    __table_args__ = (
        Index('idx_message_conversation', 'conversation_id'),
    )
    
    def __repr__(self):
        return f'<HelpMessage {self.role}>'


# Voice Interaction Models (for future voice dialogue feature)
class VoiceConversation(db.Model):
    """Voice conversation sessions during simulations"""
    __tablename__ = 'voice_conversations'
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    simulation_id: Mapped[int] = mapped_column(Integer, ForeignKey('audit_simulations.id'), nullable=False)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey('users.id'), nullable=False)
    
    title: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    status: Mapped[str] = mapped_column(String(20), default='active', nullable=False)  # active, completed, paused
    
    start_time: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    end_time: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    
    # Relationships
    simulation: Mapped["AuditSimulation"] = relationship("AuditSimulation")
    user: Mapped["User"] = relationship("User")
    messages: Mapped[List["VoiceMessage"]] = relationship("VoiceMessage", back_populates="conversation", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f'<VoiceConversation {self.id}>'


class VoiceMessage(db.Model):
    """Individual voice messages within conversations"""
    __tablename__ = 'voice_messages'
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    conversation_id: Mapped[int] = mapped_column(Integer, ForeignKey('voice_conversations.id'), nullable=False)
    
    role: Mapped[str] = mapped_column(String(20), nullable=False)  # 'user' or 'assistant'
    content: Mapped[str] = mapped_column(Text, nullable=False)  # Transcribed text
    audio_path: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)  # Path to audio file
    
    created_date: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    
    # Speech processing metadata
    transcription_confidence: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    audio_duration_seconds: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    
    # Relationships
    conversation: Mapped["VoiceConversation"] = relationship("VoiceConversation", back_populates="messages")
    
    def __repr__(self):
        return f'<VoiceMessage {self.role}>'


# Analysis and AI Processing Models
class AIAnalysisJob(db.Model):
    """Track AI analysis jobs for document processing"""
    __tablename__ = 'ai_analysis_jobs'
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey('users.id'), nullable=False)
    document_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey('documents.id'), nullable=True)
    
    job_type: Mapped[str] = mapped_column(String(50), nullable=False)  # 'gap_analysis', 'citation_check', 'compliance_review'
    regulatory_standard: Mapped[str] = mapped_column(String(100), nullable=False)
    
    # Job status
    status: Mapped[str] = mapped_column(String(20), default='pending', nullable=False)  # pending, processing, completed, failed
    progress_percentage: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    
    # Results
    result_data: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    error_message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    # Timing
    created_date: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    started_date: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    completed_date: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    
    # AI provider used
    ai_provider: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    processing_time_seconds: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    
    # Relationships
    user: Mapped["User"] = relationship("User")
    document: Mapped[Optional["Document"]] = relationship("Document")
    
    # Indexes
    __table_args__ = (
        Index('idx_analysis_job_user_status', 'user_id', 'status'),
        Index('idx_analysis_job_created', 'created_date'),
    )
    
    def __repr__(self):
        return f'<AIAnalysisJob {self.job_type}>'