import { 
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'
import { Home, ChevronRight } from '@phosphor-icons/react'

interface BreadcrumbNavigationProps {
  currentPage: string
}

const pageMapping: Record<string, { title: string; category?: string }> = {
  'overview': { title: 'Overview' },
  'search': { title: 'Global Search', category: 'Platform' },
  'regulations': { title: 'Global Regulations', category: 'Compliance' },
  'enterprise-sso': { title: 'Enterprise SSO', category: 'Security' },
  'ai-models': { title: 'AI Models', category: 'Performance' },
  'compliance': { title: 'Compliance Documentation', category: 'QMS' },
  'architecture': { title: 'System Architecture', category: 'Technical' },
  'audit-trail': { title: 'Audit Trail', category: 'Security' },
  'deployment': { title: 'Deployment Status', category: 'Operations' }
}

export function BreadcrumbNavigation({ currentPage }: BreadcrumbNavigationProps) {
  const pageInfo = pageMapping[currentPage] || { title: 'Unknown Page' }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="#" className="flex items-center gap-1">
            <Home size={14} />
            VirtualBackroom.ai
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator>
          <ChevronRight size={12} />
        </BreadcrumbSeparator>
        {pageInfo.category && (
          <>
            <BreadcrumbItem>
              <BreadcrumbLink href="#">{pageInfo.category}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <ChevronRight size={12} />
            </BreadcrumbSeparator>
          </>
        )}
        <BreadcrumbItem>
          <BreadcrumbPage>{pageInfo.title}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  )
}