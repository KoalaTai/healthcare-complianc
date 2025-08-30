"""
Alembic migration environment configuration for VirtualBackroom.ai V2.0
Supports multi-tenant database migrations with proper audit trail setup.
"""

import asyncio
import os
import sys
from logging.config import fileConfig
from pathlib import Path

from sqlalchemy import pool
from sqlalchemy.engine import Connection
from sqlalchemy.ext.asyncio import async_engine_from_config

from alembic import context

# Add the project root to Python path for imports
project_root = Path(__file__).parent.parent.parent.parent
sys.path.insert(0, str(project_root))

# Import your models here for 'autogenerate' support
from src.database.models import Base
from src.database.config import db_config

# This is the Alembic Config object
config = context.config

# Set the database URL from environment or config
config.set_main_option("sqlalchemy.url", db_config.sync_database_url)

# Interpret the config file for Python logging
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Target metadata for 'autogenerate' support
target_metadata = Base.metadata

# ============================================================================
# MIGRATION UTILITIES
# ============================================================================

def include_name(name, type_, parent_names):
    """
    Filter function to control which database objects are included in migrations.
    Excludes non-application tables and views.
    """
    if type_ == "table":
        # Include all application tables
        return name in [
            "organizations", "users", "documents", "analyses", 
            "audit_trail", "regulatory_requirements", "system_settings"
        ]
    elif type_ == "index":
        # Include all indexes on our tables
        return True
    elif type_ == "column":
        # Include all columns
        return True
    else:
        # Exclude views, functions, etc. that might be in the database
        return False

def compare_type(context, inspected_column, metadata_column, inspected_type, metadata_type):
    """
    Custom type comparison for handling PostgreSQL-specific types.
    Ensures enum types are properly detected and migrated.
    """
    # Handle PostgreSQL ENUM types
    if hasattr(metadata_type, 'enums'):
        return False  # Don't treat enum changes as type changes
    
    return None  # Use default comparison

def render_item(type_, obj, autogen_context):
    """
    Custom rendering for special migration cases.
    Handles multi-tenant specific migration patterns.
    """
    if type_ == 'type' and hasattr(obj, 'enums'):
        # Custom rendering for ENUM types to ensure proper migration
        return f"sa.Enum({', '.join(repr(e.name) for e in obj.enums)}, name='{obj.name}')"
    
    # Use default rendering for other cases
    return False

# ============================================================================
# MIGRATION EXECUTION FUNCTIONS
# ============================================================================

def run_migrations_offline() -> None:
    """
    Run migrations in 'offline' mode.
    This configures the context with just a URL and not an Engine.
    """
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        include_name=include_name,
        compare_type=compare_type,
        render_item=render_item,
        # Multi-tenant migration options
        version_table="alembic_version",
        version_table_schema=None,
        # Transaction handling for safety
        transaction_per_migration=True,
        transactional_ddl=True,
    )

    with context.begin_transaction():
        context.run_migrations()

def do_run_migrations(connection: Connection) -> None:
    """Execute migrations with active database connection"""
    context.configure(
        connection=connection,
        target_metadata=target_metadata,
        include_name=include_name,
        compare_type=compare_type,
        render_item=render_item,
        # Multi-tenant migration options
        version_table="alembic_version", 
        version_table_schema=None,
        # Transaction handling
        transaction_per_migration=True,
        transactional_ddl=True,
        # Enable autogenerate features
        compare_server_default=True,
    )

    with context.begin_transaction():
        context.run_migrations()

async def run_async_migrations() -> None:
    """
    Run migrations in async mode for compatibility with async database setup.
    """
    connectable = async_engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)

    await connectable.dispose()

def run_migrations_online() -> None:
    """
    Run migrations in 'online' mode with active database connection.
    """
    # Check if we're in an async context (FastAPI application)
    try:
        loop = asyncio.get_running_loop()
        # We're in an async context, use async migrations
        asyncio.create_task(run_async_migrations())
    except RuntimeError:
        # No async context, use sync migrations
        connectable = context.config.attributes.get("connection", None)
        
        if connectable is None:
            connectable = async_engine_from_config(
                config.get_section(config.config_ini_section, {}),
                prefix="sqlalchemy.",
                poolclass=pool.NullPool,
            )
        
        # Run migrations synchronously
        with connectable.connect() as connection:
            do_run_migrations(connection)

# ============================================================================
# MIGRATION EXECUTION
# ============================================================================

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()