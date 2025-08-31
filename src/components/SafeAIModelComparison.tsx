import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  CheckCircle, 
  Brain, 
  Target, 
  Building, 
  Globe, 
  ChartBar,
  Warning,
  Clock
} from '@phosphor-icons/react'

export function SafeAIModelComparison() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">AI Model Comparison Engine</h2>
          <p className="text-muted-foreground">
            Compare performance across multiple AI models for regulatory analysis
          </p>
        </div>
        <Badge variant="default" className="bg-green-600">
          Production Ready
        </Badge>
      </div>

      {/* Model Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { name: 'GPT-4o', accuracy: 94.2, status: 'active', cost: 85 },
          { name: 'Claude-3 Sonnet', accuracy: 91.7, status: 'active', cost: 65 },
          { name: 'PharmaGPT-4', accuracy: 97.1, status: 'active', cost: 120 },
          { name: 'RegulatoryAI Pro', accuracy: 95.8, status: 'active', cost: 95 }
        ].map((model) => (
          <Card key={model.name}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center justify-between">
                {model.name}
                <CheckCircle size={16} className="text-green-600" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span>Accuracy</span>
                    <span>{model.accuracy}%</span>
                  </div>
                  <Progress value={model.accuracy} className="h-2" />
                </div>
                <div className="flex justify-between text-xs">
                  <span>Cost per Analysis</span>
                  <span>${model.cost}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ChartBar size={20} />
            Latest Comparison Results
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { model: 'GPT-4o', findings: 12, critical: 3, confidence: 94 },
              { model: 'Claude-3 Sonnet', findings: 15, critical: 2, confidence: 91 },
              { model: 'PharmaGPT-4', findings: 8, critical: 1, confidence: 98 }
            ].map((result) => (
              <div key={result.model} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div>
                  <div className="font-medium">{result.model}</div>
                  <div className="text-sm text-muted-foreground">
                    {result.findings} findings • {result.critical} critical
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">{result.confidence}%</div>
                  <div className="text-sm text-muted-foreground">confidence</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button>
          <Brain size={16} className="mr-2" />
          Run New Comparison
        </Button>
        <Button variant="outline">
          View Detailed Results
        </Button>
      </div>
    </div>
  )
}

export { SafeAIModelComparison as AIModelComparison }