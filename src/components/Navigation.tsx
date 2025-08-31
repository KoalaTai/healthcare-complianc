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
  Search
} from '@phosphor-icons/react'

interface NavigationProps {
  currentPage: string
  onNavigate: (page: string) => void
}

export function Navigation({ currentPage, onNavigate }: NavigationProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  const mainSections = [
    {
      id: 'overview',
      label: 'Overview',
      icon: Home,
      description: 'Project dashboard and status'
    },
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
      label: 'Architecture',
      icon: Database,
      description: 'System design and infrastructure'
    },
    {
      id: 'audit-trail',
      label: 'Audit Trail',
      icon: Lock,
      description: 'Security and compliance monitoring'
    },
    {
      id: 'deployment',
      label: 'Deployment',
      icon: Settings,
      description: 'Infrastructure and CI/CD status'
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
          {/* Main Navigation */}
          <div>
            {!isCollapsed && (
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Main Sections
              </h3>
            )}
            <div className="space-y-1">
              {mainSections.map((section) => (
                <NavItem key={section.id} section={section} isMain />
              ))}
            </div>
          </div>

          {/* Technical Sections */}
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
              All systems operational
            </p>
          </div>
        )}
      </div>
    </div>
  )
}