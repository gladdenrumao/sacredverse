# Button Components

This folder contains reusable button components for the SacredVerse application.

## Components

### PrimaryButton
Primary button for main actions like form submissions.

**Props:**
- `children` (string): Button text
- `onClick` (function): Click handler
- `className` (string, optional): Additional CSS classes
- `style` (object, optional): Inline styles
- `ariaLabel` (string, optional): Accessibility label

**Usage:**
```jsx
<PrimaryButton onClick={handleSubmit}>Submit</PrimaryButton>
```

### SecondaryButton
Secondary button for secondary actions.

**Props:**
- `children` (string): Button text
- `onClick` (function): Click handler
- `className` (string, optional): Additional CSS classes
- `style` (object, optional): Inline styles
- `ariaLabel` (string, optional): Accessibility label

**Usage:**
```jsx
<SecondaryButton onClick={handleCancel}>Cancel</SecondaryButton>
```

### ThemeToggleButton
Theme toggle button for switching between light and dark mode.

**Props:**
- `theme` (string): Current theme ('light' or 'dark')
- `onToggle` (function): Theme toggle handler

**Usage:**
```jsx
<ThemeToggleButton theme={theme} onToggle={toggleTheme} />
```

### DeedButton
Button for toggling deed completion status.

**Props:**
- `checked` (boolean): Whether the deed is completed
- `onToggle` (function): Toggle handler
- `deedIndex` (number): Index of the deed

**Usage:**
```jsx
<DeedButton checked={isCompleted} onToggle={handleToggle} deedIndex={0} />
```