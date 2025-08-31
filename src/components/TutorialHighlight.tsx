import { useState, useEffect, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ChevronRight, Target, Lightbulb } from '@phosphor-icons/react'

interface TutorialHighlightProps {
  isActive: boolean
  targetElement?: string
  title: string
  description: string
  position?: 'top' | 'bottom' | 'left' | 'right'
  onNext?: () => void
  onSkip?: () => void
  showNext?: boolean
}

export function TutorialHighlight({
  isActive,
  targetElement,
  title,
  description,
  position = 'bottom',
  onNext,
  onSkip,
  showNext = true
}: TutorialHighlightProps) {
  const [highlightPosition, setHighlightPosition] = useState({ top: 0, left: 0, width: 0, height: 0 })
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isActive && targetElement) {
      const element = document.querySelector(targetElement)
      if (element) {
        const rect = element.getBoundingClientRect()
        setHighlightPosition({
          top: rect.top + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width,
          height: rect.height
        })

        // Scroll element into view
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }
  }, [isActive, targetElement])

  if (!isActive) return null

  const getTooltipPosition = () => {
    const { top, left, width, height } = highlightPosition
    
    switch (position) {
      case 'top':
        return { top: top - 120, left: left + width / 2 - 200 }
      case 'bottom':
        return { top: top + height + 20, left: left + width / 2 - 200 }
      case 'left':
        return { top: top + height / 2 - 60, left: left - 420 }
      case 'right':
        return { top: top + height / 2 - 60, left: left + width + 20 }
      default:
        return { top: top + height + 20, left: left + width / 2 - 200 }
    }
  }

  const tooltipPos = getTooltipPosition()

  return (
    <>
      {/* Overlay */}
      <div 
        ref={overlayRef}
        className="fixed inset-0 bg-black/50 z-40 pointer-events-auto"
        style={{ zIndex: 9998 }}
      >
        {/* Highlight cutout */}
        {targetElement && (
          <>
            <div
              className="absolute border-2 border-primary rounded-lg shadow-lg shadow-primary/20 animate-pulse"
              style={{
                top: highlightPosition.top - 4,
                left: highlightPosition.left - 4,
                width: highlightPosition.width + 8,
                height: highlightPosition.height + 8,
                zIndex: 9999
              }}
            />
            <div
              className="absolute bg-background/95 backdrop-blur-sm rounded-lg"
              style={{
                top: highlightPosition.top,
                left: highlightPosition.left,
                width: highlightPosition.width,
                height: highlightPosition.height,
                zIndex: 9999
              }}
            />
          </>
        )}
        
        {/* Tooltip */}
        <Card 
          className="absolute w-96 shadow-xl border-primary/20 bg-card/95 backdrop-blur-sm"
          style={{
            top: Math.max(20, tooltipPos.top),
            left: Math.max(20, Math.min(window.innerWidth - 400, tooltipPos.left)),
            zIndex: 10000
          }}
        >
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Target size={20} className="text-primary" />
                <Badge variant="secondary" className="text-xs">Tutorial Step</Badge>
              </div>
              
              <div>
                <h3 className="font-semibold text-foreground mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
              </div>
              
              <div className="flex items-center justify-between pt-2 border-t">
                {onSkip && (
                  <Button variant="ghost" size="sm" onClick={onSkip} className="text-xs">
                    Skip Tutorial
                  </Button>
                )}
                
                {showNext && onNext && (
                  <Button size="sm" onClick={onNext} className="ml-auto">
                    Continue
                    <ChevronRight size={14} className="ml-1" />
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Floating hint */}
        {targetElement && (
          <div
            className="absolute flex items-center gap-2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-medium animate-bounce"
            style={{
              top: highlightPosition.top - 30,
              left: highlightPosition.left + highlightPosition.width / 2 - 50,
              zIndex: 10001
            }}
          >
            <Lightbulb size={12} />
            Look here!
          </div>
        )}
      </div>
    </>
  )
}

export default TutorialHighlight