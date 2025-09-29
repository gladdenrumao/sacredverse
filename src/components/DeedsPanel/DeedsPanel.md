# DeedsPanel Component

The DeedsPanel component displays the list of daily good deeds with toggle buttons.

## Purpose
Renders a sidebar panel with actionable deeds that users can mark as complete, tracking their progress.

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `deeds` | string[] | Yes | Array of deed text descriptions |
| `progress` | object | Yes | Progress data for the current day |
| `dayIndex` | number | Yes | Current day index |
| `onToggleDeed` | function | Yes | Handler for toggling deed completion |

### progress object structure
```javascript
{
  [deedIndex]: boolean  // true if deed is completed
}
```

## Usage Example

```jsx
<DeedsPanel
  deeds={["Greet one person with a smile", "Hold the door for someone"]}
  progress={{ 0: true, 1: false }}
  dayIndex={5}
  onToggleDeed={(dayIdx, deedIdx) => toggleDeed(dayIdx, deedIdx)}
/>
```

## Features
- Interactive deed completion buttons
- Visual feedback for completed deeds
- Responsive layout for mobile and desktop
- Accessible button states with ARIA attributes
- Smooth hover and click animations