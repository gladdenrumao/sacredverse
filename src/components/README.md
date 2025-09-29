# SacredVerse UI Components

This directory contains the modular, reusable UI components for the SacredVerse application.

## 🏗️ Architecture

The application has been refactored from a monolithic 500+ line component into focused, single-responsibility components following React best practices.

## 📁 Component Structure

```
components/
├── Button/
│   ├── Button.jsx         # Button variants (Primary, Secondary, Theme, Deed)
│   └── Button.md          # Documentation
├── Header/
│   ├── Header.jsx         # App header with branding and stats
│   └── Header.md          # Documentation
├── MainContent/
│   ├── MainContent.jsx    # Daily verse content and actions
│   └── MainContent.md     # Documentation
├── DeedsPanel/
│   ├── DeedsPanel.jsx     # Interactive deeds sidebar
│   └── DeedsPanel.md      # Documentation
├── Footer/
│   ├── Footer.jsx         # Joy messages and tagline
│   └── Footer.md          # Documentation
├── Modal/
│   ├── Modal.jsx          # Badge, Badges List, and Onboarding modals
│   └── Modal.md           # Documentation
└── index.js               # Centralized exports
```

## 🎯 Design Principles

### Single Responsibility
Each component has a clear, focused purpose:
- **Header**: Branding, navigation, and progress display
- **MainContent**: Daily verse content and sharing actions
- **DeedsPanel**: Interactive deed completion tracking
- **Footer**: Feedback messages and tagline
- **Modal**: Overlay dialogs for various workflows
- **Button**: Consistent interactive elements

### Props Interface
All components use clear, typed props with JSDoc documentation:
```jsx
/**
 * Component description
 * @param {type} propName - Description
 */
```

### Accessibility
- Proper ARIA attributes
- Semantic HTML elements
- Keyboard navigation support
- Screen reader friendly
- Focus management

### Responsive Design
- Mobile-first approach
- Touch-friendly interactions (48px minimum)
- Fluid layouts with Flexbox/Grid
- Breakpoint-specific optimizations

## 📱 Mobile Responsiveness

### Breakpoints
- **Desktop**: 860px+
- **Tablet**: 520px - 860px  
- **Mobile**: 375px - 520px
- **Small Mobile**: < 375px

### Touch Optimization
- Minimum 48px touch targets
- Comfortable spacing between interactive elements
- Swipe-friendly layouts
- Optimized typography for mobile reading

## 🎨 Component Usage

### Basic Usage
```jsx
import { Header, MainContent, DeedsPanel } from './components';

function App() {
  return (
    <div>
      <Header {...headerProps} />
      <main>
        <MainContent {...contentProps} />
        <DeedsPanel {...deedsProps} />
      </main>
    </div>
  );
}
```

### With TypeScript Support
All components include comprehensive JSDoc comments that work with TypeScript for type checking and IDE autocomplete.

## 🧪 Testing

Components are designed to be:
- **Testable**: Clear props interface for easy mocking
- **Isolated**: No external dependencies beyond React
- **Predictable**: Pure functions with consistent behavior

## 📈 Performance

- **Minimal re-renders**: Optimized prop passing
- **Small bundle size**: Modular imports
- **Efficient CSS**: Scoped styles with CSS variables
- **Lazy loading ready**: Component-based architecture

## 🚀 Future Enhancements

The modular structure enables easy:
- Component library extraction
- Storybook integration
- Unit test addition
- Performance optimization
- Feature expansion

## 💡 Contributing

When adding new components:
1. Follow the existing folder structure
2. Include comprehensive JSDoc documentation
3. Add a markdown README with usage examples
4. Ensure mobile responsiveness
5. Test accessibility features
6. Update the main index.js exports