# MainContent Component

The MainContent component displays the daily verse content and action buttons.

## Purpose
Renders the main text content for each day, including the title, verse text, and share/copy actions.

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `today` | object | Yes | Today's content object with title, text, and deeds |
| `onShare` | function | Yes | Handler for sharing content |
| `onCopy` | function | Yes | Handler for copying content to clipboard |

### today object structure
```javascript
{
  id: number,
  title: string,
  text: string,
  deeds: string[]
}
```

## Usage Example

```jsx
<MainContent
  today={{
    id: 1,
    title: "Greet with kindness",
    text: "Say a warm 'Good morning' to the watchman...",
    deeds: ["Greet one person with a smile"]
  }}
  onShare={shareToday}
  onCopy={copyTodayText}
/>
```

## Features
- Displays daily verse title and content
- Share and copy action buttons
- Responsive text layout
- Semantic HTML structure