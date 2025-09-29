# Header Component

The Header component displays the application branding, stats, and navigation controls.

## Purpose
Provides a consistent header layout with brand identity, progress tracking, and user controls.

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `todayIndex` | number | Yes | Current day index (0-based) |
| `contentLength` | number | Yes | Total number of content entries |
| `totalDoneToday` | number | Yes | Number of deeds completed today |
| `meta` | object | Yes | Meta data with streak and total points |
| `theme` | string | Yes | Current theme ('light' or 'dark') |
| `onThemeToggle` | function | Yes | Theme toggle handler |
| `onShowBadges` | function | Yes | Show badges modal handler |

## Usage Example

```jsx
<Header
  todayIndex={5}
  contentLength={365}
  totalDoneToday={2}
  meta={{ streak: 7, totalPoints: 42 }}
  theme="light"
  onThemeToggle={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
  onShowBadges={() => setShowBadges(true)}
/>
```

## Features
- Brand logo and title
- Day counter and progress
- Points and streak display
- Badges access button
- Theme toggle