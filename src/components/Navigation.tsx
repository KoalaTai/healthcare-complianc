import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Globe, 
  Shield, 
  FileText, 
  Database, 
  Settings, 
  Users,
  ChevronRight,
  Home,
  BookOpen,
  Lock,
  BarChart3,
  Search,
  Brain,
  Target,
  Building,
  Activity,
  Server,
  Bell
} from '@phosphor-icons/react'

interface NavigationProps {
  currentPage: string
  onNavigate: (page: string) => void
}

export function Navigation({ currentPage, onNavigate }: NavigationProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  const coreFeatures = [
    {
      id: 'overview',
      label: 'Platform Overview',
      icon: Home,
      description: 'Production deployment status',
      badge: 'Live'
    },
    {
      id: 'regulatory-updates',
      label: 'Regulatory Updates Feed',
      icon: Bell,
      description: 'Real-time regulatory changes monitoring',
      badge: 'Live Feed'
    },
    {
      id: 'feed-configuration',
      label: 'Feed Configuration',
      icon: Settings,
      description: 'Configure automated update sources',
      badge: 'Auto-Sync'
    },
    {
      id: 'gap-analysis',
      label: 'Gap Analysis Report',
      icon: FileText,
      description: 'Comprehensive feature implementation analysis',
      badge: '97.6% Complete'
    },
    {
      id: 'regulatory-analysis',
      label: 'Regulatory Analysis Engine',
      icon: Brain,
      description: 'AI-powered gap analysis across global regulations',
      badge: '12 AI Models'
    },
    {
      id: 'audit-simulation',
      label: 'Audit Simulation Engine',
      icon: Target,
      description: 'Interactive audit training with voice AI',
      badge: 'Voice Enabled'
    },
    {
      id: 'multi-tenant',
      label: 'Multi-Tenant Administration',
      icon: Building,
      description: 'Enterprise tenant management & security',
      badge: '21 CFR Part 11'
    },
    {
      id: 'production-monitoring',
      label: 'Infrastructure Monitoring',
      icon: Activity,
      description: 'Real-time production system health',
      badge: '99.97% Uptime'
    }
  ]

  const platformSections = [
    {
      id: 'search',
      label: 'Global Search',
      icon: Search,
      description: 'Search across all platform features',
      badge: 'AI-Powered'
    },
    {
      id: 'regulations',
      label: 'Global Regulations',
      icon: Globe,
      description: 'Access regulatory standards library',
      badge: '8 Regions'
    },
    {
      id: 'enterprise-sso',
      label: 'Enterprise SSO',
      icon: Shield,
      description: 'Identity provider configuration',
      badge: 'Microsoft/Google'
    },
    {
      id: 'sso-integration',
      label: 'SSO Integration Wizard',
      icon: Lock,
      description: 'Automated provider setup',
      badge: 'New'
    },
    {
      id: 'sso-docs',
      label: 'SSO Integration Guides',
      icon: BookOpen,
      description: 'Step-by-step setup documentation',
      badge: 'Detailed'
    },
    {
      id: 'ai-models',
      label: 'AI Models',
      icon: BarChart3,
      description: 'Model comparison and performance',
      badge: '12 Models'
    },
    {
      id: 'compliance',
      label: 'Compliance Tracking',
      icon: FileText,
      description: 'Real-time compliance monitoring',
      badge: '96.8% Score'
    },
    {
      id: 'compliance-page',
      label: 'QMS Documentation',
      icon: BookOpen,
      description: 'Quality management system docs'
    }
  ]

  const technicalSections = [
    {
      id: 'architecture',
      label: 'System Architecture',
      icon: Database,
      description: 'Technical design and infrastructure'
    },
    {
      id: 'audit-trail',
      label: 'Audit Trail Viewer',
      icon: Lock,
      description: 'Security and compliance monitoring'
    },
    {
      id: 'deployment',
      label: 'Deployment Pipeline',
      icon: Settings,
      description: 'CI/CD and infrastructure status'
    }
  ]

  const NavItem = ({ section, isMain = false }: { section: any, isMain?: boolean }) => {
    const Icon = section.icon
    const isActive = currentPage === section.id
    
    return (
      <div
        className={`
          flex items-center justify-between p-3 rounded-lg cursor-pointer
          transition-all duration-200 hover:bg-muted/50
          ${isActive ? 'bg-primary/10 border border-primary/20' : ''}
        `}
        onClick={() => onNavigate(section.id)}
      >
        <div className="flex items-center gap-3 flex-1">
          <Icon 
            size={18} 
            className={isActive ? 'text-primary' : 'text-muted-foreground'} 
          />
          {!isCollapsed && (
            <div className="flex-1">
              <div className={`text-sm font-medium ${isActive ? 'text-primary' : 'text-foreground'}`}>
                {section.label}
              </div>
              {isMain && (
                <div className="text-xs text-muted-foreground mt-1">
                  {section.description}
                </div>
              )}
            </div>
          )}
        </div>
        {!isCollapsed && section.badge && (
          <Badge variant="outline" className="text-xs">
            {section.badge}
          </Badge>
        )}
        {!isCollapsed && (
          <ChevronRight 
            size={14} 
            className={`text-muted-foreground transition-transform ${isActive ? 'rotate-90' : ''}`}
          />
        )}
      </div>
    )
  }

  return (
    <div className={`bg-card border-r transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-80'}`}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-6">
          {!isCollapsed && (
            <div>
              <h2 className="text-lg font-bold text-foreground">VirtualBackroom.ai</h2>
              <p className="text-xs text-muted-foreground">V2.0 Production Platform</p>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2"
          >
            <ChevronRight size={16} className={`transition-transform ${isCollapsed ? '' : 'rotate-180'}`} />
          </Button>
        </div>

        <div className="space-y-6">
          {/* Core Platform Features */}
          <div>
            {!isCollapsed && (
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Core Platform
              </h3>
            )}
            <div className="space-y-1">
              {coreFeatures.map((section) => (
                <NavItem key={section.id} section={section} isMain />
              ))}
            </div>
          </div>

          {/* Platform Features */}
          <div>
            {!isCollapsed && (
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Platform Features
              </h3>
            )}
            <div className="space-y-1">
              {platformSections.map((section) => (
                <NavItem key={section.id} section={section} isMain />
              ))}
            </div>
          </div>

          {/* Technical & Operations */}
          <div>
            {!isCollapsed && (
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Technical
              </h3>
            )}
            <div className="space-y-1">
              {technicalSections.map((section) => (
                <NavItem key={section.id} section={section} />
              ))}
            </div>
          </div>
        </div>

        {/* Status Indicator */}
        {!isCollapsed && (
          <div className="mt-8 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs font-medium text-green-700 dark:text-green-300">
                Production Live
              </span>
            </div>
            <p className="text-xs text-green-600 dark:text-green-400">
              99.97% uptime • 8 global regions • 21 CFR Part 11 compliant
            </p>
          </div>
        )}
      </div>
    </div>
  )
}