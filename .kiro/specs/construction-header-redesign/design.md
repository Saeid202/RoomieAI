# Design Document

## Introduction

This document outlines the technical design for the modern luxury header redesign. The design implements the requirements from requirements.md using a component-based approach with Tailwind CSS for styling.

## Architecture Overview

```
src/
├── components/
│   ├── Navbar.tsx              # Main header container
│   └── navbar/
│       ├── NavLogo.tsx         # Logo component with gold accent
│       ├── NavLinks.tsx        # Navigation links and CTA buttons
│       └── MobileMenu.tsx      # Mobile menu implementation
└── index.css                   # Global styles and CSS variables
```

## Component Design

### 1. Navbar.tsx (Main Container)

**Purpose:** Main header component that orchestrates all sub-components

**Props:**
- `isScrolled: boolean` - Tracks scroll state for glassmorphism effect

**Structure:**
```tsx
<header className={`
  fixed top-0 left-0 right-0 z-50
  transition-all duration-300 ease-in-out
  ${isScrolled ? 'glassmorphism' : 'solid'}
`}>
  <div className="container mx-auto px-4 h-full">
    <div className="flex items-center justify-between h-full">
      <NavLogo />
      <NavLinks />
    </div>
  </div>
</header>
```

**Key Features:**
- Fixed positioning for persistent navigation
- Scroll detection for glassmorphism effect
- Responsive container with padding
- Flexbox layout for logo and links

### 2. NavLogo.tsx

**Purpose:** Brand logo with gold accent styling

**Props:**
- None (uses static brand data)

**Structure:**
```tsx
<div className="flex items-center gap-2 cursor-pointer group">
  <div className="w-10 h-10 bg-gradient-to-br from-gold-600 to-gold-500 rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-gold/30 transition-all duration-300">
    <BuildingIcon className="text-white w-6 h-6" />
  </div>
  <div className="flex flex-col">
    <h1 className="text-2xl font-extrabold text-dark-slate tracking-tight">
      Construction<span className="text-gold-600">Pro</span>
    </h1>
    <p className="text-xs text-navy-700 font-medium tracking-wider uppercase">
      Luxury Building Solutions
    </p>
  </div>
</div>
```

**Styling:**
- Logo icon with gold gradient background
- Gold accent on "Pro" text
- Hover effect with gold glow shadow
- Two-line brand presentation

### 3. NavLinks.tsx

**Purpose:** Navigation links and CTA buttons

**Props:**
- None

**Structure:**
```tsx
<div className="hidden md:flex items-center gap-8">
  <nav className="flex items-center gap-6">
    <a href="#about" className="nav-link">About Us</a>
    <a href="#services" className="nav-link">Our Services</a>
    <a href="#products" className="nav-link">Products</a>
    <a href="#contact" className="nav-link">Contact Us</a>
  </nav>
  
  <div className="flex items-center gap-4">
    <button className="nav-login-btn">Log in</button>
    <button className="nav-quote-btn">Get a Quote</button>
  </div>
</div>
```

**Styling:**
- Navigation links: Inter Medium, dark slate color
- Link hover: Gold/Amber color transition
- Log in button: Navy background with white text
- Get a Quote button: Gold gradient with white text
- All buttons use Inter SemiBold font weight

### 4. MobileMenu.tsx

**Purpose:** Mobile navigation menu with slide-in animation

**Props:**
- `isOpen: boolean` - Menu open state
- `onClose: () => void` - Close handler

**Structure:**
```tsx
<div className={`
  fixed inset-0 z-[60] bg-navy-900/95 backdrop-blur-sm
  transition-transform duration-250 ease-in-out
  ${isOpen ? 'translate-x-0' : 'translate-x-full'}
`}>
  <div className="flex flex-col h-full p-6">
    <div className="flex justify-end">
      <button onClick={onClose} className="text-white text-2xl">
        ×
      </button>
    </div>
    
    <nav className="flex flex-col gap-6 mt-8">
      <a href="#about" className="mobile-nav-link">About Us</a>
      <a href="#services" className="mobile-nav-link">Our Services</a>
      <a href="#products" className="mobile-nav-link">Products</a>
      <a href="#contact" className="mobile-nav-link">Contact Us</a>
    </nav>
    
    <div className="mt-auto flex flex-col gap-4">
      <button className="mobile-login-btn">Log in</button>
      <button className="mobile-quote-btn">Get a Quote</button>
    </div>
  </div>
</div>
```

**Styling:**
- Full-screen overlay with backdrop blur
- Slide-in animation from right
- Vertical navigation layout
- Full-width CTA buttons

## CSS Variables (index.css)

```css
:root {
  /* Deep Navy Blue - Primary Color */
  --color-navy-900: #0b1120;
  --color-navy-800: #1e293b;
  --color-navy-700: #334155;
  
  /* Gold/Amber - Accent Color */
  --color-gold-600: #d97706;
  --color-gold-500: #f59e0b;
  --color-gold-400: #fb923c;
  
  /* Dark Slate - Text Color */
  --color-dark-slate: #0f172a;
  --color-white: #ffffff;
  
  /* Typography */
  --font-inter: 'Inter', sans-serif;
  --font-weight-extrabold: 800;
  --font-weight-semibold: 600;
  --font-weight-medium: 500;
  
  /* Spacing */
  --header-height: 90px;
  
  /* Transitions */
  --transition-fast: 200ms ease-in-out;
  --transition-normal: 300ms ease-in-out;
}

/* Glassmorphism Effect */
.glassmorphism {
  background: rgba(30, 41, 59, 0.95);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
}

/* Navigation Link Hover */
.nav-link:hover {
  color: var(--color-gold-600);
  transition: color var(--transition-fast);
}

/* CTA Button Styles */
.nav-quote-btn {
  background: linear-gradient(135deg, var(--color-gold-600), var(--color-gold-500));
  color: var(--color-white);
  font-weight: var(--font-weight-semibold);
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  transition: all var(--transition-fast);
}

.nav-quote-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(217, 119, 6, 0.3);
}
```

## State Management

### Scroll Detection

```tsx
const [isScrolled, setIsScrolled] = useState(false);

useEffect(() => {
  const handleScroll = () => {
    setIsScrolled(window.scrollY > 20);
  };
  
  window.addEventListener('scroll', handleScroll);
  return () => window.removeEventListener('scroll', handleScroll);
}, []);
```

### Mobile Menu State

```tsx
const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

const toggleMobileMenu = () => {
  setIsMobileMenuOpen(!isMobileMenuOpen);
};

const closeMobileMenu = () => {
  setIsMobileMenuOpen(false);
};
```

## Responsive Breakpoints

- **Desktop (>768px):** Full navigation with links and CTAs visible
- **Mobile (≤768px):** Hamburger menu icon, mobile menu slide-in

## Animation Specifications

| Element | Animation | Duration | Timing |
|---------|-----------|----------|--------|
| Header scroll effect | Opacity + backdrop-filter | 300ms | ease-in-out |
| Navigation hover | Color | 200ms | ease-in-out |
| CTA hover | Scale + shadow | 200ms | ease-in-out |
| Mobile menu slide | Transform (translate-x) | 250ms | ease-in-out |
| Logo hover | Shadow glow | 300ms | ease-in-out |

## Accessibility Features

1. **Focus States:** Visible outline on all interactive elements
2. **Screen Reader:** Proper ARIA labels for menu toggle
3. **Keyboard Navigation:** Full keyboard accessibility
4. **Contrast:** All text meets WCAG 2.1 AA standards
5. **Reduced Motion:** Respects prefers-reduced-motion media query

## Performance Optimizations

1. **Hardware Acceleration:** Use transform and opacity for animations
2. **Font Loading:** Preload Inter font with font-display: swap
3. **Image Optimization:** SVG icons instead of raster images
4. **CSS Optimization:** Use CSS variables for theme management
5. **Bundle Size:** Lazy load mobile menu component if needed

## File Structure

```
src/
├── components/
│   ├── Navbar.tsx              # Main header with scroll detection
│   └── navbar/
│       ├── NavLogo.tsx         # Logo component
│       ├── NavLinks.tsx        # Links and CTAs
│       └── MobileMenu.tsx      # Mobile menu component
└── index.css                   # Global styles and variables
```

## Implementation Order

1. Update `index.css` with CSS variables and global styles
2. Create `NavLogo.tsx` component
3. Create `NavLinks.tsx` component
4. Create `MobileMenu.tsx` component
5. Update `Navbar.tsx` to orchestrate all components
6. Test responsive behavior and animations
7. Verify accessibility compliance