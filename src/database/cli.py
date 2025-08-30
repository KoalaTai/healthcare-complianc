"""
Database initialization and management utilities for VirtualBackroom.ai V2.0
Provides CLI commands for database setup, migrations, and maintenance.
"""

import asyncio
import os
import sys
from pathlib import Path
from typing import Optional
import uuid
from datetime import datetime, timezone

import typer
from rich.console import Console
from rich.table import Table
from rich.panel import Panel
from rich.progress import Progress, SpinnerColumn, TextColumn
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

# Add project root to path for imports
project_root = Path(__file__).parent.parent.parent
sys.path.insert(0, str(project_root))

from src.database.config import AsyncSessionLocal, initialize_database, check_database_health
from src.database.models import (
    Organization, User, RegulatoryRequirement,
    OrganizationType, UserRole, RegulatoryStandard
)
from src.services.database_services import OrganizationService, UserService

app = typer.Typer(help="VirtualBackroom.ai V2.0 Database Management")
console = Console()

@app.command()
def init_db(
    create_sample_data: bool = typer.Option(False, "--sample-data", help="Create sample organizations and users"),
    force: bool = typer.Option(False, "--force", help="Force initialization even if tables exist")
):
    """
    Initialize the database with tables, indexes, and security policies.
    """
    console.print("[bold blue]Initializing VirtualBackroom.ai V2.0 Database...[/bold blue]")
    
    async def _init():
        try:
            with Progress(
                SpinnerColumn(),
                TextColumn("[progress.description]{task.description}"),
                console=console
            ) as progress:
                
                # Initialize database schema
                task = progress.add_task("Creating tables and indexes...", total=None)
                await initialize_database()
                progress.update(task, description="✓ Tables and indexes created")
                
                # Check database health
                task = progress.add_task("Verifying database health...", total=None)
                health = await check_database_health()
                if health["status"] != "healthy":
                    raise Exception(f"Database health check failed: {health}")
                progress.update(task, description="✓ Database health verified")
                
                # Create sample data if requested
                if create_sample_data:
                    task = progress.add_task("Creating sample data...", total=None)
                    await _create_sample_data()
                    progress.update(task, description="✓ Sample data created")
                
            console.print("[bold green]✓ Database initialization completed successfully![/bold green]")
            
        except Exception as e:
            console.print(f"[bold red]✗ Database initialization failed: {e}[/bold red]")
            raise typer.Exit(1)
    
    asyncio.run(_init())

@app.command()
def health_check():
    """Check database connectivity and performance metrics."""
    
    async def _health_check():
        try:
            health = await check_database_health()
            
            # Create health status table
            table = Table(title="Database Health Status")
            table.add_column("Metric", style="cyan")
            table.add_column("Value", style="green" if health["status"] == "healthy" else "red")
            
            table.add_row("Status", health["status"].upper())
            
            if "pool_stats" in health:
                for key, value in health["pool_stats"].items():
                    table.add_row(f"Pool {key.replace('_', ' ').title()}", str(value))
            
            if "table_stats" in health:
                table.add_row("", "")  # Separator
                for table_name, count in health["table_stats"].items():
                    table.add_row(f"{table_name} records", str(count))
            
            console.print(table)
            
            if health["status"] == "healthy":
                console.print("[bold green]✓ Database is healthy[/bold green]")
            else:
                console.print("[bold red]✗ Database health issues detected[/bold red]")
                raise typer.Exit(1)
                
        except Exception as e:
            console.print(f"[bold red]✗ Health check failed: {e}[/bold red]")
            raise typer.Exit(1)
    
    asyncio.run(_health_check())

@app.command()
def create_organization(
    name: str = typer.Argument(..., help="Organization name"),
    slug: str = typer.Argument(..., help="URL-friendly organization slug"),
    org_type: str = typer.Option("other", help="Organization type"),
    contact_email: str = typer.Option(..., help="Primary contact email"),
    admin_email: str = typer.Option(..., help="Admin user email"),
    admin_first_name: str = typer.Option(..., help="Admin first name"),
    admin_last_name: str = typer.Option(..., help="Admin last name")
):
    """
    Create a new organization with an initial admin user.
    """
    console.print(f"[bold blue]Creating organization: {name}[/bold blue]")
    
    async def _create_org():
        try:
            async with AsyncSessionLocal() as session:
                org_service = OrganizationService(session)
                
                # Create organization
                org_type_enum = OrganizationType(org_type)
                organization = await org_service.create_organization(
                    name=name,
                    slug=slug,
                    organization_type=org_type_enum,
                    primary_contact_email=contact_email
                )
                
                # Create admin user
                user_service = UserService(session, organization.id)
                admin_user = await user_service.create_user(
                    email=admin_email,
                    first_name=admin_first_name,
                    last_name=admin_last_name,
                    role=UserRole.OWNER,
                    created_by=organization.created_by or organization.id,  # Bootstrap case
                    sso_provider="manual"  # Will be updated when SSO is configured
                )
                
                console.print(f"[bold green]✓ Organization created: {organization.id}[/bold green]")
                console.print(f"[bold green]✓ Admin user created: {admin_user.id}[/bold green]")
                
                # Display summary
                panel = Panel.fit(
                    f"""[bold]Organization Details[/bold]
                    
Name: {organization.name}
Slug: {organization.slug}
Type: {organization.organization_type.value}
Contact: {organization.primary_contact_email}

[bold]Admin User[/bold]
Name: {admin_user.full_name}
Email: {admin_user.email}
Role: {admin_user.role.value}""",
                    title="✓ Setup Complete"
                )
                console.print(panel)
                
        except Exception as e:
            console.print(f"[bold red]✗ Organization creation failed: {e}[/bold red]")
            raise typer.Exit(1)
    
    asyncio.run(_create_org())

@app.command()
def audit_report(
    organization_slug: str = typer.Argument(..., help="Organization slug"),
    days: int = typer.Option(30, help="Number of days to include in report"),
    output_file: Optional[str] = typer.Option(None, help="Output file for report")
):
    """
    Generate an audit trail report for compliance purposes.
    """
    console.print(f"[bold blue]Generating audit report for {organization_slug} (last {days} days)[/bold blue]")
    
    async def _generate_report():
        try:
            async with AsyncSessionLocal() as session:
                # Find organization
                from sqlalchemy import select
                result = await session.execute(
                    select(Organization).where(Organization.slug == organization_slug)
                )
                organization = result.scalar_one_or_none()
                if not organization:
                    raise ValueError(f"Organization '{organization_slug}' not found")
                
                # Generate report
                from datetime import timedelta
                end_date = datetime.now(timezone.utc)
                start_date = end_date - timedelta(days=days)
                
                from src.services.database_services import AuditService
                # Use organization owner for report generation
                org_owner = await session.execute(
                    select(User).where(
                        User.organization_id == organization.id,
                        User.role == UserRole.OWNER
                    ).limit(1)
                )
                owner = org_owner.scalar_one_or_none()
                if not owner:
                    raise ValueError("No organization owner found for audit report generation")
                
                audit_service = AuditService(session, organization.id, owner.id)
                activity_report = await audit_service.get_user_activity_report(
                    start_date=start_date,
                    end_date=end_date
                )
                
                # Display summary
                table = Table(title=f"Audit Summary for {organization.name}")
                table.add_column("Metric", style="cyan")
                table.add_column("Count", style="green")
                
                # Count actions by type
                action_counts = {}
                for record in activity_report:
                    action = record.action.value
                    action_counts[action] = action_counts.get(action, 0) + 1
                
                table.add_row("Total Actions", str(len(activity_report)))
                for action, count in sorted(action_counts.items()):
                    table.add_row(f"  {action.replace('_', ' ').title()}", str(count))
                
                console.print(table)
                
                # Save to file if requested
                if output_file:
                    import json
                    report_data = {
                        "organization": {
                            "name": organization.name,
                            "slug": organization.slug,
                            "id": str(organization.id)
                        },
                        "report_period": {
                            "start": start_date.isoformat(),
                            "end": end_date.isoformat(),
                            "days": days
                        },
                        "summary": action_counts,
                        "total_records": len(activity_report),
                        "generated_at": datetime.now(timezone.utc).isoformat()
                    }
                    
                    with open(output_file, 'w') as f:
                        json.dump(report_data, f, indent=2)
                    
                    console.print(f"[green]✓ Report saved to {output_file}[/green]")
                
        except Exception as e:
            console.print(f"[bold red]✗ Audit report generation failed: {e}[/bold red]")
            raise typer.Exit(1)
    
    asyncio.run(_generate_report())

@app.command()
def verify_tenant_isolation():
    """
    Verify that Row Level Security policies are properly enforcing tenant isolation.
    Critical security test for multi-tenant compliance.
    """
    console.print("[bold blue]Verifying tenant isolation and RLS policies...[/bold blue]")
    
    async def _verify_isolation():
        try:
            async with AsyncSessionLocal() as session:
                # Test RLS policies
                tests = []
                
                # Test 1: Check if RLS is enabled on critical tables
                critical_tables = ['organizations', 'users', 'documents', 'analyses', 'audit_trail']
                for table in critical_tables:
                    result = await session.execute(
                        text(f"""
                            SELECT schemaname, tablename, rowsecurity 
                            FROM pg_tables 
                            WHERE tablename = '{table}' AND schemaname = 'public'
                        """)
                    )
                    row = result.fetchone()
                    tests.append({
                        "test": f"RLS enabled on {table}",
                        "status": "PASS" if row and row.rowsecurity else "FAIL",
                        "details": f"Row security: {row.rowsecurity if row else 'Table not found'}"
                    })
                
                # Test 2: Check if policies exist
                result = await session.execute(
                    text("""
                        SELECT schemaname, tablename, policyname, cmd, qual
                        FROM pg_policies 
                        WHERE schemaname = 'public'
                        ORDER BY tablename, policyname
                    """)
                )
                policies = result.fetchall()
                
                expected_policies = [
                    'org_tenant_isolation',
                    'user_tenant_isolation', 
                    'doc_tenant_isolation',
                    'analysis_tenant_isolation',
                    'audit_tenant_isolation'
                ]
                
                found_policies = [p.policyname for p in policies]
                for expected in expected_policies:
                    tests.append({
                        "test": f"Policy {expected} exists",
                        "status": "PASS" if expected in found_policies else "FAIL",
                        "details": "Policy found" if expected in found_policies else "Policy missing"
                    })
                
                # Display results
                table = Table(title="Tenant Isolation Security Tests")
                table.add_column("Test", style="cyan")
                table.add_column("Status", style="bold")
                table.add_column("Details", style="dim")
                
                all_passed = True
                for test in tests:
                    status_style = "green" if test["status"] == "PASS" else "red"
                    table.add_row(
                        test["test"],
                        f"[{status_style}]{test['status']}[/{status_style}]",
                        test["details"]
                    )
                    if test["status"] == "FAIL":
                        all_passed = False
                
                console.print(table)
                
                if all_passed:
                    console.print("[bold green]✓ All tenant isolation tests passed[/bold green]")
                else:
                    console.print("[bold red]✗ Some tenant isolation tests failed[/bold red]")
                    raise typer.Exit(1)
                
        except Exception as e:
            console.print(f"[bold red]✗ Tenant isolation verification failed: {e}[/bold red]")
            raise typer.Exit(1)
    
    asyncio.run(_verify_isolation())

async def _create_sample_data():
    """Create sample organizations and users for development/testing"""
    
    async with AsyncSessionLocal() as session:
        org_service = OrganizationService(session)
        
        # Sample organizations
        sample_orgs = [
            {
                "name": "MedTech Innovations Inc",
                "slug": "medtech-innovations",
                "organization_type": OrganizationType.MEDICAL_DEVICE,
                "primary_contact_email": "admin@medtech-innovations.com"
            },
            {
                "name": "BioPharma Research Labs",
                "slug": "biopharma-labs", 
                "organization_type": OrganizationType.PHARMACEUTICAL,
                "primary_contact_email": "admin@biopharma-labs.com"
            }
        ]
        
        for org_data in sample_orgs:
            try:
                # Create organization
                organization = await org_service.create_organization(**org_data)
                
                # Create sample users
                user_service = UserService(session, organization.id)
                
                sample_users = [
                    {
                        "email": f"admin@{org_data['slug']}.com",
                        "first_name": "Admin",
                        "last_name": "User",
                        "role": UserRole.OWNER,
                        "sso_provider": "google"
                    },
                    {
                        "email": f"qm@{org_data['slug']}.com",
                        "first_name": "Quality",
                        "last_name": "Manager",
                        "role": UserRole.QUALITY_MANAGER,
                        "sso_provider": "microsoft"
                    },
                    {
                        "email": f"analyst@{org_data['slug']}.com",
                        "first_name": "Regulatory",
                        "last_name": "Analyst",
                        "role": UserRole.ANALYST,
                        "sso_provider": "google"
                    }
                ]
                
                for user_data in sample_users:
                    # Use admin as creator for bootstrap
                    await user_service.create_user(
                        created_by=organization.id,  # Bootstrap case
                        external_id=f"sample_{uuid.uuid4().hex[:8]}",
                        **user_data
                    )
                
                console.print(f"✓ Created sample organization: {organization.name}")
                
            except Exception as e:
                console.print(f"✗ Failed to create {org_data['name']}: {e}")

@app.command()
def list_organizations():
    """List all organizations in the database."""
    
    async def _list_orgs():
        try:
            async with AsyncSessionLocal() as session:
                from sqlalchemy import select
                result = await session.execute(
                    select(Organization)
                    .where(Organization.is_active == True)
                    .order_by(Organization.created_at)
                )
                organizations = result.scalars().all()
                
                if not organizations:
                    console.print("[yellow]No organizations found[/yellow]")
                    return
                
                table = Table(title="Organizations")
                table.add_column("Name", style="cyan")
                table.add_column("Slug", style="green")
                table.add_column("Type", style="blue")
                table.add_column("Users", style="magenta")
                table.add_column("Created", style="dim")
                
                for org in organizations:
                    # Count users
                    user_count_result = await session.execute(
                        select(func.count(User.id)).where(
                            User.organization_id == org.id,
                            User.is_active == True
                        )
                    )
                    user_count = user_count_result.scalar()
                    
                    table.add_row(
                        org.name,
                        org.slug,
                        org.organization_type.value,
                        str(user_count),
                        org.created_at.strftime("%Y-%m-%d")
                    )
                
                console.print(table)
                
        except Exception as e:
            console.print(f"[bold red]✗ Failed to list organizations: {e}[/bold red]")
            raise typer.Exit(1)
    
    asyncio.run(_list_orgs())

@app.command()
def backup_audit_trail(
    organization_slug: str = typer.Argument(..., help="Organization slug"),
    output_dir: str = typer.Option("./audit_backups", help="Output directory for backup files"),
    days: int = typer.Option(90, help="Number of days of audit data to backup")
):
    """
    Backup audit trail data for compliance archival.
    Creates tamper-evident backups with checksums.
    """
    console.print(f"[bold blue]Backing up audit trail for {organization_slug}[/bold blue]")
    
    async def _backup_audit():
        try:
            import json
            import hashlib
            from datetime import timedelta
            
            # Create output directory
            backup_dir = Path(output_dir)
            backup_dir.mkdir(exist_ok=True)
            
            async with AsyncSessionLocal() as session:
                # Find organization
                from sqlalchemy import select
                result = await session.execute(
                    select(Organization).where(Organization.slug == organization_slug)
                )
                organization = result.scalar_one_or_none()
                if not organization:
                    raise ValueError(f"Organization '{organization_slug}' not found")
                
                # Get audit trail data
                end_date = datetime.now(timezone.utc)
                start_date = end_date - timedelta(days=days)
                
                audit_result = await session.execute(
                    select(AuditTrail)
                    .where(
                        AuditTrail.organization_id == organization.id,
                        AuditTrail.timestamp.between(start_date, end_date)
                    )
                    .order_by(AuditTrail.timestamp.asc())
                )
                audit_records = audit_result.scalars().all()
                
                # Prepare backup data
                backup_data = {
                    "organization": {
                        "id": str(organization.id),
                        "name": organization.name,
                        "slug": organization.slug
                    },
                    "backup_metadata": {
                        "created_at": datetime.now(timezone.utc).isoformat(),
                        "period_start": start_date.isoformat(),
                        "period_end": end_date.isoformat(),
                        "record_count": len(audit_records)
                    },
                    "audit_records": []
                }
                
                # Serialize audit records
                for record in audit_records:
                    backup_data["audit_records"].append({
                        "id": str(record.id),
                        "user_id": str(record.user_id),
                        "user_email": record.user_email,
                        "user_role": record.user_role,
                        "action": record.action.value,
                        "object_type": record.object_type,
                        "object_id": str(record.object_id) if record.object_id else None,
                        "object_name": record.object_name,
                        "timestamp": record.timestamp.isoformat(),
                        "ip_address": record.ip_address,
                        "field_name": record.field_name,
                        "old_value": record.old_value,
                        "new_value": record.new_value,
                        "change_reason": record.change_reason,
                        "regulatory_significance": record.regulatory_significance,
                        "additional_metadata": record.additional_metadata
                    })
                
                # Write backup file
                timestamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
                backup_filename = f"audit_backup_{organization_slug}_{timestamp}.json"
                backup_path = backup_dir / backup_filename
                
                backup_json = json.dumps(backup_data, indent=2, sort_keys=True)
                
                with open(backup_path, 'w') as f:
                    f.write(backup_json)
                
                # Create checksum file
                checksum = hashlib.sha256(backup_json.encode()).hexdigest()
                checksum_path = backup_dir / f"{backup_filename}.sha256"
                
                with open(checksum_path, 'w') as f:
                    f.write(f"{checksum}  {backup_filename}\n")
                
                console.print(f"[bold green]✓ Audit backup created: {backup_path}[/bold green]")
                console.print(f"[green]Records: {len(audit_records)}[/green]")
                console.print(f"[green]Checksum: {checksum_path}[/green]")
                
        except Exception as e:
            console.print(f"[bold red]✗ Audit backup failed: {e}[/bold red]")
            raise typer.Exit(1)
    
    asyncio.run(_backup_audit())

if __name__ == "__main__":
    app()