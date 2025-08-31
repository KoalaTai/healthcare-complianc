import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { 
  BookOpen, 
  Play, 
  CheckCircle, 
  Clock, 
  Users, 
  Target, 
  Lightbulb,
  Star,
  ArrowRight,
  Trophy,
  Zap
} from '@phosphor-icons/react'

interface TutorialDashboardProps {
  onStartTutorial: () => void
  onStartSpecificTutorial: (tutorialId: string) => void
}

interface Tutorial {
  id: string
  title: string
  description: string
  duration: number
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  icon: React.ElementType
  category: 'Getting Started' | 'Compliance' | 'AI Features' | 'Enterprise'
  steps: number
  completed: boolean
}

const availableTutorials: Tutorial[] = [
  {
    id: 'platform-overview',
    title: 'Platform Overview',
    description: 'Complete walkthrough of VirtualBackroom.ai features and navigation',
    duration: 12,
    difficulty: 'Beginner',
    icon: BookOpen,
    category: 'Getting Started',
    steps: 12,
    completed: false
  },
  {
    id: 'regulatory-analysis',
    title: 'AI Regulatory Analysis',
    description: 'Learn to use AI-powered compliance checking and document analysis',
    duration: 8,
    difficulty: 'Intermediate',
    icon: Zap,
    category: 'AI Features',
    steps: 8,
    completed: false
  },
  {
    id: 'audit-preparation',
    title: 'Audit Simulation & Training',
    description: 'Master audit preparation with interactive scenarios and simulations',
    duration: 10,
    difficulty: 'Intermediate',
    icon: Target,
    category: 'Compliance',
    steps: 10,
    completed: false
  },
  {
    id: 'enterprise-setup',
    title: 'Enterprise SSO Integration',
    description: 'Configure single sign-on and multi-tenant organizational settings',
    duration: 15,
    difficulty: 'Advanced',
    icon: Users,
    category: 'Enterprise',
    steps: 15,
    completed: false
  },
  {
    id: 'compliance-tracking',
    title: 'Compliance Dashboard Mastery',
    description: 'Navigate compliance tracking, gap analysis, and regulatory updates',
    duration: 7,
    difficulty: 'Beginner',
    icon: CheckCircle,
    category: 'Compliance',
    steps: 7,
    completed: false
  },
  {
    id: 'global-search',
    title: 'Advanced Search & Intelligence',
    description: 'Leverage global search across regulations, documents, and AI insights',
    duration: 5,
    difficulty: 'Beginner',
    icon: Lightbulb,
    category: 'Getting Started',
    steps: 5,
    completed: false
  }
]

export function TutorialDashboard({ onStartTutorial, onStartSpecificTutorial }: TutorialDashboardProps) {
  const [completedTutorials, setCompletedTutorials] = useKV('completed-tutorials', [] as string[])
  const [tutorialProgress, setTutorialProgress] = useKV('tutorial-progress-detailed', {} as Record<string, number>)

  const updateTutorialProgress = (tutorialId: string, progress: number) => {
    setTutorialProgress((prev) => ({ ...prev, [tutorialId]: progress }))
  }

  const markTutorialComplete = (tutorialId: string) => {
    setCompletedTutorials((prev) => [...prev, tutorialId])
    updateTutorialProgress(tutorialId, 100)
  }

  const getTutorialsByCategory = (category: string) => {
    return availableTutorials.filter(tutorial => tutorial.category === category)
  }

  const getCompletionRate = () => {
    const completed = availableTutorials.filter(tutorial => 
      completedTutorials.includes(tutorial.id)
    ).length
    return Math.round((completed / availableTutorials.length) * 100)
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800 border-green-200'
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'Advanced': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const categories = ['Getting Started', 'Compliance', 'AI Features', 'Enterprise']

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="p-4 bg-primary/10 rounded-full">
            <BookOpen size={32} className="text-primary" />
          </div>
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Interactive Learning Center</h1>
          <p className="text-muted-foreground mt-2">
            Master VirtualBackroom.ai with guided tutorials and hands-on training
          </p>
        </div>
      </div>

      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy size={20} />
            Learning Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-2xl font-bold">{getCompletionRate()}%</span>
                <p className="text-sm text-muted-foreground">
                  {completedTutorials.length} of {availableTutorials.length} tutorials completed
                </p>
              </div>
              <div className="flex items-center gap-2">
                {completedTutorials.length > 0 && (
                  <Badge variant="default" className="bg-green-600 text-white">
                    <Star size={12} className="mr-1" />
                    {completedTutorials.length} Completed
                  </Badge>
                )}
              </div>
            </div>
            <Progress value={getCompletionRate()} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Quick Start */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <Play size={24} className="text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">New to VirtualBackroom.ai?</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Start with our comprehensive platform overview to get familiar with all features
                </p>
              </div>
            </div>
            <Button size="lg" onClick={onStartTutorial} className="px-6">
              Start Platform Tour
              <ArrowRight size={16} className="ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tutorial Categories */}
      {categories.map((category) => {
        const tutorials = getTutorialsByCategory(category)
        const completedInCategory = tutorials.filter(t => completedTutorials.includes(t.id)).length
        
        return (
          <div key={category} className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-foreground">{category}</h2>
              <Badge variant="outline">
                {completedInCategory}/{tutorials.length} Complete
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tutorials.map((tutorial) => {
                const Icon = tutorial.icon
                const isCompleted = completedTutorials.includes(tutorial.id)
                const progress = tutorialProgress[tutorial.id] || 0
                
                return (
                  <Card 
                    key={tutorial.id}
                    className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                      isCompleted ? 'border-green-200 bg-green-50/30' : 'hover:border-primary/20'
                    }`}
                    onClick={() => onStartSpecificTutorial(tutorial.id)}
                  >
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${
                              isCompleted ? 'bg-green-100' : 'bg-primary/10'
                            }`}>
                              <Icon size={20} className={
                                isCompleted ? 'text-green-600' : 'text-primary'
                              } />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-medium text-foreground">{tutorial.title}</h3>
                              <p className="text-sm text-muted-foreground mt-1">
                                {tutorial.description}
                              </p>
                            </div>
                          </div>
                          {isCompleted && (
                            <CheckCircle size={20} className="text-green-600 flex-shrink-0" />
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock size={12} />
                          <span>{tutorial.duration} min</span>
                          <Separator orientation="vertical" className="h-3" />
                          <span>{tutorial.steps} steps</span>
                          <Separator orientation="vertical" className="h-3" />
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${getDifficultyColor(tutorial.difficulty)}`}
                          >
                            {tutorial.difficulty}
                          </Badge>
                        </div>
                        
                        {progress > 0 && progress < 100 && (
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">Progress</span>
                              <span className="text-primary font-medium">{progress}%</span>
                            </div>
                            <Progress value={progress} className="h-1" />
                          </div>
                        )}
                        
                        <div className="pt-2 border-t border-dashed">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">
                              {isCompleted ? 'Completed' : 'Click to start'}
                            </span>
                            <ArrowRight size={12} className="text-primary" />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        )
      })}
      
      {/* Achievement Section */}
      {completedTutorials.length >= 3 && (
        <Card className="border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50">
          <CardContent className="p-6 text-center">
            <div className="space-y-3">
              <div className="flex justify-center">
                <Trophy size={32} className="text-yellow-600" />
              </div>
              <div>
                <h3 className="font-semibold text-yellow-800">Compliance Expert!</h3>
                <p className="text-sm text-yellow-700">
                  You've completed {completedTutorials.length} tutorials. You're becoming a VirtualBackroom.ai expert!
                </p>
              </div>
              {getCompletionRate() === 100 && (
                <Badge className="bg-yellow-600 text-white">
                  🏆 Master Level Achieved
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default TutorialDashboard