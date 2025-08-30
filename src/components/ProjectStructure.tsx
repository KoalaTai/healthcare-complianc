import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Folder,
  FileText,
  Code,
  Database,
  TestTube,
  Download,
  Plus,
  ChevronRight,
  ChevronDown
} from '@phosphor-icons/react'

interface FileNode {
  name: string
  type: 'folder' | 'file'
  children?: FileNode[]
  description?: string
  status?: 'generated' | 'template' | 'pending'
}

export function ProjectStructure() {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['root', 'src', 'docs', 'validation']))
  const [projectStructure] = useKV('project-structure', createDefaultStructure())

  const toggleFolder = (path: string) => {
    const newExpanded = new Set(expandedFolders)
    if (newExpanded.has(path)) {
      newExpanded.delete(path)
    } else {
      newExpanded.add(path)
    }
    setExpandedFolders(newExpanded)
  }

  const renderFileTree = (nodes: FileNode[], parentPath = '') => {
    return nodes.map((node) => {
      const currentPath = parentPath ? `${parentPath}/${node.name}` : node.name
      const isExpanded = expandedFolders.has(currentPath)
      const hasChildren = node.children && node.children.length > 0

      return (
        <div key={currentPath} className="space-y-1">
          <div
            className={`flex items-center gap-2 p-2 rounded-md hover:bg-muted/50 cursor-pointer ${
              node.type === 'folder' ? '' : 'ml-4'
            }`}
            onClick={() => node.type === 'folder' && toggleFolder(currentPath)}
          >
            {node.type === 'folder' && hasChildren && (
              isExpanded ? 
                <ChevronDown size={16} className="text-muted-foreground" /> : 
                <ChevronRight size={16} className="text-muted-foreground" />
            )}
            {node.type === 'folder' ? (
              <Folder size={16} className="text-primary" />
            ) : (
              <FileText size={16} className="text-muted-foreground" />
            )}
            <span className="text-sm font-medium">{node.name}</span>
            {node.status && (
              <Badge 
                variant={node.status === 'generated' ? 'default' : 
                        node.status === 'template' ? 'secondary' : 'outline'}
                className="text-xs ml-auto"
              >
                {node.status}
              </Badge>
            )}
          </div>
          {node.description && (
            <p className="text-xs text-muted-foreground ml-10 mb-2">
              {node.description}
            </p>
          )}
          {node.type === 'folder' && isExpanded && hasChildren && (
            <div className="ml-4 border-l border-border pl-2">
              {renderFileTree(node.children!, currentPath)}
            </div>
          )}
        </div>
      )
    })
  }

  const generateDocumentation = () => {
    // Simulate documentation generation
    console.log('Generating QMS documentation...')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Project Structure</h2>
          <p className="text-muted-foreground mt-1">
            QMS-compliant directory structure and documentation templates
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={generateDocumentation}>
            <Plus size={16} className="mr-2" />
            Generate Docs
          </Button>
          <Button>
            <Download size={16} className="mr-2" />
            Export Structure
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code size={20} />
                Repository Structure
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 font-mono text-sm">
                {renderFileTree(projectStructure)}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText size={20} />
                QMS Documents
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { name: 'Software Development Plan', status: 'generated' },
                { name: 'Risk Management Plan', status: 'generated' },
                { name: 'Software Requirements Spec', status: 'template' },
                { name: 'Validation Master Plan', status: 'template' },
                { name: 'Cybersecurity Plan', status: 'pending' }
              ].map((doc, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-md">
                  <span className="text-sm font-medium">{doc.name}</span>
                  <Badge 
                    variant={doc.status === 'generated' ? 'default' : 
                            doc.status === 'template' ? 'secondary' : 'outline'}
                  >
                    {doc.status}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database size={20} />
                Architecture Files
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                'ARCHITECTURE_v2.md',
                'database_schemas.py',
                'api_endpoints.py',
                'migration_plan.md'
              ].map((file, index) => (
                <div key={index} className="flex items-center gap-2 p-2 rounded-md border">
                  <FileText size={16} className="text-muted-foreground" />
                  <span className="text-sm font-mono">{file}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function createDefaultStructure(): FileNode[] {
  return [
    {
      name: 'virtualbackroom-v2',
      type: 'folder',
      children: [
        {
          name: 'src',
          type: 'folder',
          children: [
            {
              name: 'core',
              type: 'folder',
              children: [
                { name: 'analyzer_service.py', type: 'file', status: 'template', description: 'Asynchronous analysis task logic' }
              ]
            },
            {
              name: 'models',
              type: 'folder',
              children: [
                { name: 'database_schemas.py', type: 'file', status: 'template', description: 'SQLAlchemy 2.0 models for users, organizations, documents' }
              ]
            },
            {
              name: 'api',
              type: 'folder',
              children: [
                {
                  name: 'endpoints',
                  type: 'folder',
                  children: [
                    { name: 'analysis.py', type: 'file', status: 'template', description: 'FastAPI endpoints for analysis submission and retrieval' }
                  ]
                }
              ]
            }
          ]
        },
        {
          name: 'docs',
          type: 'folder',
          children: [
            { name: 'Software_Development_Plan_v2.md', type: 'file', status: 'generated' },
            { name: 'Risk_Management_Plan_v2.md', type: 'file', status: 'generated' },
            { name: 'Software_Requirements_Specification_v2.md', type: 'file', status: 'template' },
            { name: 'Validation_Master_Plan_v2.md', type: 'file', status: 'template' },
            { name: 'Cybersecurity_Plan_v2.md', type: 'file', status: 'pending' },
            { name: 'ARCHITECTURE_v2.md', type: 'file', status: 'template' }
          ]
        },
        {
          name: 'validation',
          type: 'folder',
          children: [
            { name: 'test_cases.md', type: 'file', status: 'pending' },
            { name: 'ai_validation_strategy.md', type: 'file', status: 'pending' }
          ]
        },
        {
          name: 'tests',
          type: 'folder',
          children: [
            { name: 'unit', type: 'folder' },
            { name: 'integration', type: 'folder' },
            { name: 'compliance', type: 'folder' }
          ]
        },
        {
          name: 'iac',
          type: 'folder',
          description: 'Infrastructure as Code for AWS deployment',
          children: [
            { name: 'terraform', type: 'folder' },
            { name: 'cloudformation', type: 'folder' }
          ]
        }
      ]
    }
  ]
}