import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Brain } from '@phosphor-icons/react'

interface FallbackComponentProps {
  title: string
  description?: string
  componentName?: string
}

export function FallbackComponent({ 
  title, 
  description = "This feature is currently being updated to ensure full compatibility.",
  componentName = "Component"
}: FallbackComponentProps) {
  return (
    <Card className="border-dashed border-2">
      <CardHeader className="text-center pb-4">
        <div className="mx-auto mb-4 p-3 bg-muted rounded-full w-fit">
          <Brain size={32} className="text-muted-foreground" />
        </div>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="text-center">
        <p className="text-muted-foreground mb-4">{description}</p>
        <div className="flex justify-center">
          <Badge variant="outline" className="gap-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            Updating {componentName}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}

export default FallbackComponent