# Modal Components

This folder contains modal components for the SacredVerse application.

## Components

### BadgeModal
Modal displayed when user earns a new badge.

**Props:**
- `badgeNumber` (number): Number of days for the badge
- `onClose` (function): Close modal handler
- `onShare` (function): Share achievement handler

**Usage:**
```jsx
<BadgeModal 
  badgeNumber={7} 
  onClose={() => setBadgeModal(null)}
  onShare={shareAchievement}
/>
```

### BadgesModal
Modal displaying all available badges and their status.

**Props:**
- `show` (boolean): Whether to show the modal
- `onClose` (function): Close modal handler
- `meta` (object): Meta data containing badges array
- `badgeThresholds` (number[]): Array of badge threshold values

**Usage:**
```jsx
<BadgesModal 
  show={showBadges}
  onClose={() => setShowBadges(false)}
  meta={meta}
  badgeThresholds={[3, 7, 30]}
/>
```

### OnboardingModal
Welcome modal for first-time users.

**Props:**
- `show` (boolean): Whether to show the modal
- `onStart` (function): Start journey handler

**Usage:**
```jsx
<OnboardingModal 
  show={showOnboarding}
  onStart={() => setShowOnboarding(false)}
/>
```

## Features
- Accessible modal dialogs with proper ARIA attributes
- Overlay backgrounds with click-to-close functionality
- Responsive design for mobile and desktop
- Smooth animations and transitions
- Social sharing integration