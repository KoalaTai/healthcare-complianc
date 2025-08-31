import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { 
  Play, 
  CheckCircle, 
  Users, 
  Clock, 
  BookOpen,
  Lightbulb,
  Target,
  Star
} from '@phosphor-icons/react'

export function TutorialIntroduction() {
  const [hasStarted, setHasStarted] = useState(false)

  const handleStartTutorial = () => {
    setHasStarted(true)
    toast.success('🚀 Welcome! Your interactive tutorial will begin shortly.')
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Welcome Header */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="p-4 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full">
            <Lightbulb size={48} className="text-primary" />
          </div>
        </div>
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Welcome to VirtualBackroom.ai V2.0
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Your AI-powered regulatory compliance platform is ready. Let's explore its powerful features together.
          </p>
        </div>
      </div>

      {/* Tutorial Benefits */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="text-center">
          <CardContent className="p-6">
            <div className="flex justify-center mb-3">
              <div className="p-3 bg-blue-100 rounded-full">
                <BookOpen size={24} className="text-blue-600" />
              </div>
            </div>
            <h3 className="font-semibold mb-2">Guided Learning</h3>
            <p className="text-sm text-muted-foreground">
              Step-by-step walkthrough of all platform features and capabilities
            </p>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="p-6">
            <div className="flex justify-center mb-3">
              <div className="p-3 bg-green-100 rounded-full">
                <Target size={24} className="text-green-600" />
              </div>
            </div>
            <h3 className="font-semibold mb-2">Interactive Experience</h3>
            <p className="text-sm text-muted-foreground">
              Hands-on practice with real features and realistic scenarios
            </p>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="p-6">
            <div className="flex justify-center mb-3">
              <div className="p-3 bg-purple-100 rounded-full">
                <Star size={24} className="text-purple-600" />
              </div>
            </div>
            <h3 className="font-semibold mb-2">Expert Knowledge</h3>
            <p className="text-sm text-muted-foreground">
              Learn best practices for regulatory compliance and audit preparation
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tutorial Stats */}
      <Card className="bg-gradient-to-r from-primary/5 to-accent/5">
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">12</div>
              <div className="text-sm text-muted-foreground">Tutorial Steps</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">15</div>
              <div className="text-sm text-muted-foreground">Minutes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">6</div>
              <div className="text-sm text-muted-foreground">Key Features</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">97%</div>
              <div className="text-sm text-muted-foreground">User Success</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tutorial Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen size={20} />
            What You'll Learn
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              'Navigate the VirtualBackroom.ai dashboard',
              'Use AI-powered regulatory analysis',
              'Practice with audit simulation tools',
              'Manage multi-tenant organizations',
              'Access global regulatory standards',
              'Configure enterprise SSO integration',
              'Track compliance across all regulations',
              'Search and find insights instantly',
              'Monitor real-time regulatory updates',
              'Generate comprehensive reports'
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <CheckCircle size={16} className="text-green-600 flex-shrink-0" />
                <span className="text-sm">{item}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Call to Action */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
        <CardContent className="p-8 text-center space-y-6">
          <div>
            <h2 className="text-2xl font-semibold mb-2">Ready to Get Started?</h2>
            <p className="text-muted-foreground">
              Your interactive tutorial will guide you through every feature with real-world examples and best practices.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="px-8"
              onClick={handleStartTutorial}
              disabled={hasStarted}
            >
              {hasStarted ? (
                <>
                  <CheckCircle size={20} className="mr-2" />
                  Tutorial Starting...
                </>
              ) : (
                <>
                  <Play size={20} className="mr-2" />
                  Start Interactive Tutorial
                </>
              )}
            </Button>
            
            <Button variant="outline" size="lg" className="px-8">
              <Users size={20} className="mr-2" />
              View Learning Center
            </Button>
          </div>
          
          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock size={14} />
              ~15 minutes
            </div>
            <div className="flex items-center gap-1">
              <Target size={14} />
              Interactive
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle size={14} />
              Self-paced
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default TutorialIntroduction