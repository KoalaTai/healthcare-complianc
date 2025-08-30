import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  GitBranch,
  Database,
  Cloud,
  Shield,
  Monitor,
  Workflow,
  Download
} from '@phosphor-icons/react'

interface ArchitectureComponent {
  id: string
  name: string
  type: 'frontend' | 'api' | 'service' | 'database' | 'infrastructure'
  description: string
  technology: string
  status: 'current' | 'migrating' | 'new'
  connections: string[]
}

export function ArchitectureDiagram() {
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null)

  const components: ArchitectureComponent[] = [
    {
      id: 'react-frontend',
      name: 'React Frontend',
      type: 'frontend',
      description: 'Modern React application with TypeScript for improved state management and user experience',
      technology: 'React + TypeScript + Tailwind',
      status: 'new',
      connections: ['api-gateway']
    },
    {
      id: 'api-gateway',
      name: 'AWS API Gateway',
      type: 'api',
      description: 'Managed API gateway for routing, rate limiting, and request/response transformation',
      technology: 'AWS API Gateway',
      status: 'new',
      connections: ['cognito-auth', 'fastapi-backend']
    },
    {
      id: 'cognito-auth',
      name: 'AWS Cognito',
      type: 'service',
      description: 'Production-grade identity provider replacing hardcoded authentication',
      technology: 'AWS Cognito',
      status: 'new',
      connections: ['api-gateway']
    },
    {
      id: 'fastapi-backend',
      name: 'FastAPI Backend',
      type: 'service',
      description: 'High-performance API backend with automatic validation using Pydantic models',
      technology: 'FastAPI + Pydantic',
      status: 'migrating',
      connections: ['analysis-worker', 'rds-postgres']
    },
    {
      id: 'analysis-worker',
      name: 'Analysis Worker Service',
      type: 'service',
      description: 'Asynchronous worker service for time-consuming OpenAI API calls using Celery/Redis',
      technology: 'Celery + Redis',
      status: 'new',
      connections: ['openai-api', 's3-storage']
    },
    {
      id: 'rds-postgres',
      name: 'PostgreSQL RDS',
      type: 'database',
      description: 'Managed relational database for user metadata, organizations, and analysis reports',
      technology: 'AWS RDS PostgreSQL',
      status: 'new',
      connections: []
    },
    {
      id: 's3-storage',
      name: 'S3 Document Storage',
      type: 'database',
      description: 'Encrypted document storage with strict multi-tenant isolation',
      technology: 'AWS S3',
      status: 'new',
      connections: []
    },
    {
      id: 'openai-api',
      name: 'OpenAI API',
      type: 'service',
      description: 'External AI service for document analysis with improved prompt engineering',
      technology: 'OpenAI GPT-4',
      status: 'current',
      connections: []
    }
  ]

  const getComponentColor = (type: string, status: string) => {
    const baseColors = {
      frontend: 'bg-blue-100 border-blue-300',
      api: 'bg-green-100 border-green-300',
      service: 'bg-purple-100 border-purple-300',
      database: 'bg-orange-100 border-orange-300',
      infrastructure: 'bg-gray-100 border-gray-300'
    }
    
    if (status === 'migrating') return baseColors[type as keyof typeof baseColors] + ' animate-pulse'
    if (status === 'new') return baseColors[type as keyof typeof baseColors] + ' border-2'
    return baseColors[type as keyof typeof baseColors]
  }

  const getStatusIcon = (type: string) => {
    switch (type) {
      case 'frontend': return <Monitor size={20} />
      case 'api': return <GitBranch size={20} />
      case 'service': return <Workflow size={20} />
      case 'database': return <Database size={20} />
      case 'infrastructure': return <Cloud size={20} />
      default: return <Shield size={20} />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">System Architecture</h2>
          <p className="text-muted-foreground mt-1">
            V2.0 microservices architecture with multi-tenant isolation
          </p>
        </div>
        <Button>
          <Download size={16} className="mr-2" />
          Export Diagram
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Architecture Overview</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Simplified visual representation */}
              <div className="space-y-8">
                {/* Frontend Layer */}
                <div className="text-center">
                  <h4 className="font-semibold text-sm text-muted-foreground mb-4">PRESENTATION LAYER</h4>
                  <div 
                    className={`inline-block p-4 rounded-lg border-2 cursor-pointer ${getComponentColor('frontend', 'new')}`}
                    onClick={() => setSelectedComponent('react-frontend')}
                  >
                    <Monitor size={24} className="mx-auto mb-2" />
                    <div className="font-medium">React Frontend</div>
                    <div className="text-xs text-muted-foreground">Modern UI/UX</div>
                  </div>
                </div>

                <Separator />

                {/* API Layer */}
                <div className="text-center">
                  <h4 className="font-semibold text-sm text-muted-foreground mb-4">API GATEWAY LAYER</h4>
                  <div className="flex justify-center gap-8">
                    <div 
                      className={`p-4 rounded-lg border cursor-pointer ${getComponentColor('api', 'new')}`}
                      onClick={() => setSelectedComponent('api-gateway')}
                    >
                      <GitBranch size={24} className="mx-auto mb-2" />
                      <div className="font-medium">API Gateway</div>
                      <div className="text-xs text-muted-foreground">AWS Managed</div>
                    </div>
                    <div 
                      className={`p-4 rounded-lg border cursor-pointer ${getComponentColor('service', 'new')}`}
                      onClick={() => setSelectedComponent('cognito-auth')}
                    >
                      <Shield size={24} className="mx-auto mb-2" />
                      <div className="font-medium">Cognito Auth</div>
                      <div className="text-xs text-muted-foreground">Identity Provider</div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Service Layer */}
                <div className="text-center">
                  <h4 className="font-semibold text-sm text-muted-foreground mb-4">APPLICATION LAYER</h4>
                  <div className="flex justify-center gap-8">
                    <div 
                      className={`p-4 rounded-lg border cursor-pointer ${getComponentColor('service', 'migrating')}`}
                      onClick={() => setSelectedComponent('fastapi-backend')}
                    >
                      <Workflow size={24} className="mx-auto mb-2" />
                      <div className="font-medium">FastAPI Backend</div>
                      <div className="text-xs text-muted-foreground">Migration Target</div>
                    </div>
                    <div 
                      className={`p-4 rounded-lg border cursor-pointer ${getComponentColor('service', 'new')}`}
                      onClick={() => setSelectedComponent('analysis-worker')}
                    >
                      <Workflow size={24} className="mx-auto mb-2" />
                      <div className="font-medium">Analysis Worker</div>
                      <div className="text-xs text-muted-foreground">Async Processing</div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Data Layer */}
                <div className="text-center">
                  <h4 className="font-semibold text-sm text-muted-foreground mb-4">DATA LAYER</h4>
                  <div className="flex justify-center gap-8">
                    <div 
                      className={`p-4 rounded-lg border cursor-pointer ${getComponentColor('database', 'new')}`}
                      onClick={() => setSelectedComponent('rds-postgres')}
                    >
                      <Database size={24} className="mx-auto mb-2" />
                      <div className="font-medium">PostgreSQL</div>
                      <div className="text-xs text-muted-foreground">Metadata Store</div>
                    </div>
                    <div 
                      className={`p-4 rounded-lg border cursor-pointer ${getComponentColor('database', 'new')}`}
                      onClick={() => setSelectedComponent('s3-storage')}
                    >
                      <Cloud size={24} className="mx-auto mb-2" />
                      <div className="font-medium">S3 Storage</div>
                      <div className="text-xs text-muted-foreground">Document Store</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Component Details</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedComponent ? (
                <div className="space-y-4">
                  {components
                    .filter(c => c.id === selectedComponent)
                    .map(component => (
                      <div key={component.id} className="space-y-3">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(component.type)}
                          <h4 className="font-semibold">{component.name}</h4>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {component.description}
                        </p>
                        <div className="space-y-2">
                          <div className="text-xs font-medium">Technology:</div>
                          <Badge variant="outline">{component.technology}</Badge>
                        </div>
                        <div className="space-y-2">
                          <div className="text-xs font-medium">Migration Status:</div>
                          <Badge variant={
                            component.status === 'new' ? 'default' :
                            component.status === 'migrating' ? 'destructive' : 'secondary'
                          }>
                            {component.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Click on a component in the diagram to view details
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Migration Strategy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>Phase 1: Infrastructure Setup</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span>Phase 2: Backend Migration</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span>Phase 3: Frontend Modernization</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span>Phase 4: Async Workers</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}