// Icon compatibility mapping for Phosphor Icons
import * as PhosphorIcons from '@phosphor-icons/react'

// Map of old icon names to new ones
const iconMap = {
  'AlertTriangle': 'Warning',
  'BarChart': 'ChartBar', 
  'BarChart3': 'ChartBar',
  'Zap': 'Lightning',
  'Search': 'MagnifyingGlass',
  'ExternalLink': 'ArrowSquareOut',
  'ChevronRight': 'CaretRight',
  'ChevronLeft': 'CaretLeft', 
  'ChevronUp': 'CaretUp',
  'ChevronDown': 'CaretDown',
  'Workflow': 'FlowArrow',
  'MessageCircle': 'ChatCircle',
  'Building2': 'Buildings',
  'Filter': 'Funnel',
  'TrendingUp': 'TrendUp',
  'TrendingDown': 'TrendDown'
}

// Create a proxy that maps old names to new ones
const createIconProxy = () => {
  const handler = {
    get: (target: any, prop: string) => {
      // If the icon exists in the mapping, use the new name
      if (iconMap[prop as keyof typeof iconMap]) {
        const newIconName = iconMap[prop as keyof typeof iconMap]
        return target[newIconName] || target[prop]
      }
      // Otherwise return the original
      return target[prop]
    }
  }
  
  return new Proxy(PhosphorIcons, handler)
}

export const Icons = createIconProxy()
export default Icons