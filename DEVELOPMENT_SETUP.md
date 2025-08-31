# VirtualBackroom.ai V2.0 - Development Setup

## 🚀 Quick Development Start

### Prerequisites
- **Node.js**: 18+ (recommended: 20+)
- **npm**: 8+ (comes with Node.js)
- **Git**: Latest version
- **Code Editor**: VS Code recommended

### Development Environment Setup

1. **Clone and Install**
   ```bash
   # Clone repository
   git clone https://github.com/virtualbackroom/platform-v2.git
   cd platform-v2
   
   # Install dependencies
   npm install
   ```

2. **Start Development Server**
   ```bash
   # Start with hot reload
   npm run dev
   
   # Access the application
   # http://localhost:5173
   ```

3. **Verify Setup**
   - Navigate to http://localhost:5173
   - You should see the VirtualBackroom.ai dashboard
   - All features should be accessible via the navigation sidebar

## 📁 Project Structure

```
src/
├── components/           # React components
│   ├── ui/              # shadcn/ui components
│   ├── sso/             # SSO-specific components
│   ├── App.tsx          # Main application component
│   ├── Navigation.tsx   # Sidebar navigation
│   └── index.ts         # Component exports
├── hooks/               # Custom React hooks
├── lib/                 # Utility libraries
├── services/            # API and data services
├── styles/              # CSS and styling
├── assets/              # Static assets
├── database/            # Database schemas and migrations
└── index.css            # Global styles and theme
```

## 🛠️ Available Scripts

```bash
# Development
npm run dev              # Start development server with hot reload
npm run build            # Build for production
npm run preview          # Preview production build locally
npm run type-check       # TypeScript type checking

# Quality
npm run lint             # Run ESLint
npm run lint:fix         # Fix linting issues automatically
npm run format           # Format code with Prettier

# Testing
npm run test             # Run unit tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Generate test coverage report
```

## 🎨 Development Guidelines

### Code Style
- **TypeScript**: Strict mode enabled
- **ESLint**: Configured for React and TypeScript
- **Prettier**: Automatic code formatting
- **Tailwind CSS**: Utility-first styling approach

### Component Development
- Use functional components with hooks
- Follow React best practices
- Implement proper TypeScript types
- Use shadcn/ui components for consistency

### State Management
- **useKV Hook**: For persistent data (user preferences, saved data)
- **useState**: For temporary UI state
- **Props**: For component communication

### Styling
- **Tailwind Classes**: Use utility classes for styling
- **CSS Variables**: Defined in `index.css` for theming
- **Component Variants**: Use shadcn/ui component patterns

## 🔧 Key Technologies

### Frontend Stack
- **React 18**: Modern React with hooks and concurrent features
- **TypeScript**: Type-safe JavaScript development
- **Vite**: Fast build tool and development server
- **Tailwind CSS**: Utility-first CSS framework

### UI Framework
- **shadcn/ui v4**: Modern component library
- **Radix UI**: Accessible component primitives
- **Phosphor Icons**: Comprehensive icon set
- **Framer Motion**: Animation library

### Development Tools
- **ESLint**: Code linting and quality
- **TypeScript**: Static type checking
- **Hot Reload**: Instant development feedback
- **Source Maps**: Debugging support

## 🧩 Key Components

### Core Platform Components
- **App.tsx**: Main application with routing logic
- **Navigation.tsx**: Sidebar navigation with feature organization
- **BreadcrumbNavigation.tsx**: Page context navigation

### Feature Components
- **RegulatoryUpdatesFeed.tsx**: Real-time regulatory monitoring
- **GapAnalysisReport.tsx**: Comprehensive platform analysis
- **RegulatoryAnalysisEngine.tsx**: AI-powered analysis tools
- **AuditSimulationEngine.tsx**: Interactive training system

### SSO Components
- **AutomatedSSOIntegrationHub.tsx**: SSO management interface
- **SSOProviderWizard.tsx**: Step-by-step SSO setup
- **EnhancedEnterpriseSSOPage.tsx**: Enterprise SSO dashboard

### Multi-Tenant Components
- **MultiTenantDashboard.tsx**: Tenant administration
- **ProductionMonitoringDashboard.tsx**: System monitoring
- **AuditTrailViewer.tsx**: Compliance tracking

## 🔍 Data Management

### Persistent Storage
```typescript
// Use useKV for data that persists between sessions
import { useKV } from '@github/spark/hooks'

const [userData, setUserData] = useKV('user-preferences', defaultValue)
```

### Temporary State
```typescript
// Use useState for UI state that doesn't need persistence
import { useState } from 'react'

const [isLoading, setIsLoading] = useState(false)
const [selectedTab, setSelectedTab] = useState('overview')
```

### API Integration
```typescript
// Use the spark global object for LLM integration
const prompt = spark.llmPrompt`Analyze this regulatory document: ${content}`
const analysis = await spark.llm(prompt)
```

## 🎯 Feature Development

### Adding New Components
1. Create component in appropriate directory
2. Follow TypeScript and React patterns
3. Export from `components/index.ts`
4. Add to navigation if needed
5. Update routing in `App.tsx`

### Styling Guidelines
- Use Tailwind utility classes
- Follow design system colors and spacing
- Ensure responsive design
- Test accessibility

### Testing Strategy
- Unit tests for utility functions
- Component tests for UI behavior
- Integration tests for user workflows
- Manual testing across browsers

## 📱 Responsive Design

### Breakpoints
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

### Design Principles
- Mobile-first approach
- Touch-friendly interfaces
- Readable typography
- Accessible color contrast

## 🔐 Security Considerations

### Development Security
- Never commit sensitive data
- Use environment variables for configuration
- Follow secure coding practices
- Regular dependency updates

### Authentication
- SSO integration for enterprise users
- Session management
- Role-based access control
- Audit trail logging

## 🚀 Deployment

### Production Build
```bash
# Build optimized production bundle
npm run build

# Preview production build locally
npm run preview
```

### Environment Configuration
- Production settings in environment variables
- Build-time optimizations
- Asset optimization and compression
- Performance monitoring

## 📞 Development Support

### Getting Help
- **Documentation**: Complete feature documentation in codebase
- **Code Comments**: Inline documentation for complex logic
- **TypeScript**: Type definitions provide API guidance
- **Examples**: Reference existing components for patterns

### Common Development Tasks
1. **Adding a new page**: Update App.tsx routing and Navigation.tsx
2. **Creating components**: Follow existing patterns in components/
3. **Styling**: Use Tailwind classes and design system variables
4. **Data persistence**: Use useKV hook for lasting data

### Troubleshooting
- **Build errors**: Check TypeScript types and imports
- **Styling issues**: Verify Tailwind class names and CSS variables
- **State problems**: Ensure proper hook usage and dependencies
- **Performance**: Use React DevTools for optimization

---

**Ready to develop! Run `npm run dev` to start building amazing regulatory compliance features.**