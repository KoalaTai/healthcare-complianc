import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { toast } from 'sonner'
import {
  Play,
  X,
  ChevronRight,
  ChevronLeft,
  CheckCircle,
  BookOpen,
  Shield,
  Brain,
  Target,
  Building,
  Globe,
  FileText,
  GitBranch,
  Search,
  Bell,
  Download,
  Users,
  Zap,
  Award,
  Lightbulb
} from '@phosphor-icons/react'

interface TutorialStep {
  id: string
  title: string
  description: string
  icon: React.ElementType
  target?: string
  action?: string
  page?: string
  duration: number
}

interface TutorialWalkthroughProps {
  onNavigate: (page: string) => void
  currentPage: string
}

const tutorialSteps: TutorialStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to VirtualBackroom.ai V2.0',
    description: 'Your AI-powered regulatory compliance platform is now live and ready to help you navigate complex pharmaceutical regulations with confidence.',
    icon: Award,
    duration: 3
  },
  {
    id: 'overview',
    title: 'Platform Overview',
    description: 'This dashboard shows your complete regulatory compliance ecosystem. From here, you can access AI analysis, audit simulations, and enterprise management tools.',
    icon: BookOpen,
    page: 'overview',
    duration: 4
  },
  {
    id: 'ai-analysis',
    title: 'AI Regulatory Analysis',
    description: 'Our AI engine has processed over 15,672 regulatory analysis jobs. Click on AI Analysis Jobs to explore automated compliance checking and regulatory interpretation.',
    icon: Brain,
    page: 'regulatory-analysis',
    action: 'Click AI Analysis Jobs card',
    duration: 5
  },
  {
    id: 'audit-simulation',
    title: 'Interactive Audit Training',
    description: 'Practice for real audits with our simulation engine. Over 2,847 audit scenarios have been completed by users to build confidence and expertise.',
    icon: Target,
    page: 'audit-simulation',
    action: 'Click Audit Simulations card',
    duration: 4
  },
  {
    id: 'enterprise-tenants',
    title: 'Multi-Tenant Management',
    description: 'Manage multiple organizations and departments with complete data isolation. 247 enterprise tenants are already using the platform securely.',
    icon: Building,
    page: 'multi-tenant',
    action: 'Click Enterprise Tenants card',
    duration: 4
  },
  {
    id: 'global-regulations',
    title: 'Global Regulatory Standards',
    description: 'Access comprehensive regulatory frameworks from 8 major jurisdictions including FDA, EMA, ICH, and more with real-time updates.',
    icon: Globe,
    page: 'regulations',
    action: 'Click Global Regulations card',
    duration: 4
  },
  {
    id: 'sso-integration',
    title: 'Enterprise SSO Integration',
    description: 'Seamlessly integrate with Microsoft Azure AD, Google Workspace, Okta, and PingIdentity for secure single sign-on access.',
    icon: Shield,
    page: 'enterprise-sso',
    action: 'Navigate to Enterprise SSO',
    duration: 4
  },
  {
    id: 'ai-models',
    title: 'Specialized AI Models',
    description: 'Access 8 pharmaceutical-specific AI models including cGMP manufacturing analysis, FDA submission support, and biologics compliance.',
    icon: Zap,
    page: 'ai-models',
    action: 'Explore AI Models',
    duration: 4
  },
  {
    id: 'compliance-tracking',
    title: 'Real-Time Compliance Tracking',
    description: 'Monitor your compliance status across all regulations with automated alerts, gap analysis, and remediation recommendations.',
    icon: CheckCircle,
    page: 'compliance',
    action: 'View Compliance Dashboard',
    duration: 4
  },
  {
    id: 'search-capabilities',
    title: 'Global Search & Intelligence',
    description: 'Use our advanced search to find regulations, documents, analysis results, and insights across the entire platform instantly.',
    icon: Search,
    page: 'search',
    action: 'Try Global Search',
    duration: 3
  },
  {
    id: 'regulatory-updates',
    title: 'Live Regulatory Updates',
    description: 'Stay current with real-time regulatory changes, FDA announcements, and compliance updates delivered directly to your dashboard.',
    icon: Bell,
    page: 'regulatory-updates',
    action: 'Check Updates Feed',
    duration: 3
  },
  {
    id: 'completion',
    title: 'Tutorial Complete!',
    description: 'You\'re now ready to leverage VirtualBackroom.ai\'s full power for regulatory compliance. Explore any section to begin your compliance journey.',
    icon: Lightbulb,
    duration: 3
  }
]

export function InteractiveTutorial({ onNavigate, currentPage }: TutorialWalkthroughProps) {
  const [tutorialCompleted, setTutorialCompleted] = useKV('tutorial-completed', false)
  const [tutorialProgress, setTutorialProgress] = useKV('tutorial-progress', 0)
  const [showTutorial, setShowTutorial] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  // Auto-start tutorial for new users
  useEffect(() => {
    if (!tutorialCompleted && currentPage === 'overview') {
      const timer = setTimeout(() => {
        setShowTutorial(true)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [tutorialCompleted, currentPage])

  const startTutorial = () => {
    setCurrentStep(0)
    setIsPlaying(true)
    setShowTutorial(true)
    toast.success('Interactive tutorial started! Let\'s explore the platform together.')
  }

  const nextStep = () => {
    if (currentStep < tutorialSteps.length - 1) {
      const newStep = currentStep + 1
      setCurrentStep(newStep)
      setTutorialProgress(((newStep + 1) / tutorialSteps.length) * 100)
      
      const step = tutorialSteps[newStep]
      if (step.page && step.page !== currentPage) {
        onNavigate(step.page)
      }

      if (step.action) {
        toast.info(`Next: ${step.action}`)
      }
    }
  }

  const previousStep = () => {
    if (currentStep > 0) {
      const newStep = currentStep - 1
      setCurrentStep(newStep)
      setTutorialProgress(((newStep + 1) / tutorialSteps.length) * 100)
      
      const step = tutorialSteps[newStep]
      if (step.page && step.page !== currentPage) {
        onNavigate(step.page)
      }
    }
  }

  const completeTutorial = () => {
    setTutorialCompleted(true)
    setTutorialProgress(100)
    setIsPlaying(false)
    setShowTutorial(false)
    toast.success('🎉 Tutorial completed! You\'re ready to use VirtualBackroom.ai effectively.')
  }

  const skipTutorial = () => {
    setTutorialCompleted(true)
    setIsPlaying(false)
    setShowTutorial(false)
    toast.info('Tutorial skipped. You can restart it anytime from the help menu.')
  }

  const currentTutorialStep = tutorialSteps[currentStep]
  const Icon = currentTutorialStep?.icon || BookOpen

  return (
    <>
      {/* Tutorial Launch Button */}
      {!showTutorial && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button
            size="lg"
            className="shadow-lg hover:shadow-xl transition-all duration-300"
            onClick={startTutorial}
          >
            <Play size={20} className="mr-2" />
            {tutorialCompleted ? 'Restart Tutorial' : 'Start Tutorial'}
          </Button>
        </div>
      )}

      {/* Tutorial Progress Indicator */}
      {tutorialCompleted && tutorialProgress > 0 && !showTutorial && (
        <div className="fixed top-4 right-4 z-40">
          <Card className="w-64 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Tutorial Progress</span>
                <Badge variant="default" className="text-xs">
                  {Math.round(tutorialProgress)}%
                </Badge>
              </div>
              <Progress value={tutorialProgress} className="h-2" />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tutorial Dialog */}
      <Dialog open={showTutorial} onOpenChange={setShowTutorial}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-3">
                <Icon size={24} className="text-primary" />
                {currentTutorialStep?.title}
              </DialogTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={skipTutorial}
                className="text-muted-foreground hover:text-foreground"
              >
                <X size={16} />
              </Button>
            </div>
            <DialogDescription className="text-base leading-relaxed pt-2">
              {currentTutorialStep?.description}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Step {currentStep + 1} of {tutorialSteps.length}
                </span>
                <Badge variant="outline">
                  {Math.round(((currentStep + 1) / tutorialSteps.length) * 100)}%
                </Badge>
              </div>
              <Progress value={((currentStep + 1) / tutorialSteps.length) * 100} className="h-2" />
            </div>

            {/* Step Content */}
            <div className="bg-muted/30 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Icon size={20} className="text-primary" />
                </div>
                <div className="flex-1">
                  {currentTutorialStep?.action && (
                    <div className="mb-2">
                      <Badge variant="secondary" className="text-xs">
                        Recommended Action
                      </Badge>
                      <p className="text-sm font-medium text-primary mt-1">
                        {currentTutorialStep.action}
                      </p>
                    </div>
                  )}
                  
                  {currentTutorialStep?.page && (
                    <div className="text-xs text-muted-foreground">
                      Current page: {currentTutorialStep.page}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Step Navigation */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={previousStep}
                  disabled={currentStep === 0}
                >
                  <ChevronLeft size={16} className="mr-1" />
                  Previous
                </Button>
                
                {currentStep === tutorialSteps.length - 1 ? (
                  <Button
                    size="sm"
                    onClick={completeTutorial}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle size={16} className="mr-1" />
                    Complete Tutorial
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={nextStep}
                  >
                    Next Step
                    <ChevronRight size={16} className="ml-1" />
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={skipTutorial}
                  className="text-muted-foreground"
                >
                  Skip Tutorial
                </Button>
              </div>
            </div>

            {/* Quick Navigation */}
            <Separator />
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">Quick Jump</div>
              <div className="flex flex-wrap gap-2">
                {tutorialSteps.slice(0, 8).map((step, index) => (
                  <Button
                    key={step.id}
                    variant={index === currentStep ? "default" : "outline"}
                    size="sm"
                    className="text-xs h-8"
                    onClick={() => {
                      setCurrentStep(index)
                      if (step.page && step.page !== currentPage) {
                        onNavigate(step.page)
                      }
                    }}
                  >
                    {index + 1}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Welcome Card for New Users */}
      {!tutorialCompleted && currentPage === 'overview' && !showTutorial && (
        <Card className="mb-6 border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Lightbulb size={24} className="text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Welcome to VirtualBackroom.ai!</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    New to the platform? Take our interactive tutorial to discover all features and capabilities.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" onClick={() => setTutorialCompleted(true)}>
                  Maybe Later
                </Button>
                <Button size="sm" onClick={startTutorial}>
                  <Play size={16} className="mr-2" />
                  Start Tutorial
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  )
}

export default InteractiveTutorial