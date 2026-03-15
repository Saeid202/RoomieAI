# Requirements Document

## Introduction

Redesign the header component for the construction-themed website to create a modern, luxury, energetic, and professional appearance. The current header is too small, not readable, and doesn't follow the main app color scheme. The new header will use a deep navy and gold color scheme to convey luxury and professionalism while maintaining excellent readability and user experience.

## Glossary

- **Header**: The top navigation bar of the website containing logo, navigation links, and CTA buttons
- **Deep Navy Blue**: Primary color (#1e293b or hsl(210, 40%, 15%)) used for backgrounds and primary elements
- **Gold/Amber**: Accent color (#d97706 or hsl(45, 100%, 50%)) used for highlights, hover effects, and CTAs
- **Dark Slate**: Text color (#0f172a) used for maximum contrast and readability
- **Glassmorphism**: Visual effect where the header becomes semi-transparent with blur when scrolling
- **Inter**: Google font family used for all typography (ExtraBold, SemiBold, Medium weights)

## Requirements

### Requirement 1: Header Size and Layout

**User Story:** As a visitor, I want a larger, more prominent header, so that I can easily navigate the site and feel confident in the company's professionalism.

#### Acceptance Criteria

1. THE Header SHALL have a minimum height of 80 pixels and maximum height of 100 pixels
2. THE Header SHALL use a deep navy blue gradient background
3. THE Header SHALL center navigation links horizontally with equal spacing
4. THE Header SHALL position the logo on the left and CTA buttons on the right
5. WHILE scrolling down the page, THE Header SHALL apply a glassmorphism effect with semi-transparent background and blur

### Requirement 2: Color Scheme

**User Story:** As a visitor, I want to see a consistent luxury color scheme, so that the website feels professional and high-end.

#### Acceptance Criteria

1. THE Header background SHALL use Deep Navy Blue (#1e293b or hsl(210, 40%, 15%))
2. THE Header accent elements SHALL use Gold/Amber (#d97706 or hsl(45, 100%, 50%))
3. THE Header text SHALL use Dark Slate (#0f172a) for maximum contrast
4. WHEN hovering over navigation links, THE link text SHALL change to Gold/Amber color
5. WHEN hovering over CTA buttons, THE button background SHALL use a gold gradient

### Requirement 3: Typography

**User Story:** As a visitor, I want to read clear, professional typography, so that I can easily understand the navigation options.

#### Acceptance Criteria

1. ALL header headings SHALL use Inter ExtraBold font weight (800-900)
2. ALL header body text SHALL use Inter Medium font weight (500-600)
3. ALL CTA button text SHALL use Inter SemiBold font weight (600)
4. THE Logo text SHALL use Inter ExtraBold with gold accent styling
5. WHEN the header scrolls, THE font rendering SHALL maintain clarity and sharpness

### Requirement 4: Navigation Links

**User Story:** As a visitor, I want clearly labeled navigation links, so that I can find the information I need quickly.

#### Acceptance Criteria

1. THE Header SHALL display four navigation links: About Us, Our Services, Products, Contact Us
2. WHEN hovering over a navigation link, THE link text SHALL change to Gold/Amber color
3. WHEN clicking a navigation link, THE page SHALL scroll to the corresponding section
4. ALL navigation links SHALL be evenly spaced with consistent padding
5. THE navigation links SHALL be centered horizontally in the header

### Requirement 5: CTA Buttons

**User Story:** As a visitor, I want prominent call-to-action buttons, so that I can easily take the next step.

#### Acceptance Criteria

1. THE Header SHALL display two CTA buttons: Log in and Get a Quote
2. THE "Get a Quote" button SHALL use a gold gradient background with white text
3. WHEN hovering over the "Get a Quote" button, THE button SHALL scale slightly (1.05x) with smooth transition
4. WHEN hovering over the "Log in" button, THE button background SHALL change to a lighter navy
5. ALL CTA buttons SHALL have consistent padding and font weight (Inter SemiBold)

### Requirement 6: Logo Design

**User Story:** As a visitor, I want a bold, recognizable logo, so that I can easily identify the brand.

#### Acceptance Criteria

1. THE Logo SHALL be larger and bolder than the current implementation
2. THE Logo text SHALL use Inter ExtraBold font weight
3. THE Logo SHALL include a gold accent element (underline, icon, or text highlight)
4. WHEN hovering over the logo, THE logo SHALL have a subtle gold glow effect
5. THE Logo SHALL link to the homepage when clicked

### Requirement 7: Mobile Responsiveness

**User Story:** As a mobile visitor, I want a functional mobile menu, so that I can navigate the site on smaller screens.

#### Acceptance Criteria

1. WHEN the screen width is less than 768 pixels, THE navigation links SHALL be hidden from the main header
2. THE Header SHALL display a hamburger menu icon on mobile devices
3. WHEN clicking the hamburger menu, THE Mobile Menu SHALL slide in from the right side
4. THE Mobile Menu SHALL contain all navigation links and CTA buttons in a vertical layout
5. WHEN clicking outside the Mobile Menu, THE menu SHALL close

### Requirement 8: Visual Effects and Transitions

**User Story:** As a visitor, I want smooth, professional visual effects, so that the website feels modern and polished.

#### Acceptance Criteria

1. ALL hover effects SHALL have smooth transitions (200-300ms)
2. WHEN scrolling, THE Header SHALL transition to glassmorphism effect over 300ms
3. THE CTA button hover effects SHALL include both background and scale transitions
4. WHEN the Mobile Menu opens, SHALL animate smoothly over 250ms
5. ALL transitions SHALL use ease-in-out timing function for natural feel

### Requirement 9: Accessibility and Readability

**User Story:** As a visitor with visual impairments, I want high contrast and readable text, so that I can use the website effectively.

#### Acceptance Criteria

1. ALL text in the header SHALL meet WCAG 2.1 AA contrast ratios (4.5:1 minimum)
2. THE Header SHALL maintain readability on all screen sizes
3. ALL interactive elements SHALL have visible focus states
4. THE Logo alt text SHALL be properly set for screen readers
5. WHEN keyboard navigating, THE focus indicators SHALL be clearly visible

### Requirement 10: Performance

**User Story:** As a visitor, I want fast-loading animations, so that the website feels responsive.

#### Acceptance Criteria

1. ALL CSS transitions SHALL use hardware-accelerated properties (transform, opacity)
2. THE Header SHALL load within 100ms on standard connections
3. WHEN scrolling, THE glassmorphism effect SHALL maintain 60fps performance
4. THE Mobile Menu animation SHALL complete within 250ms
5. ALL font loading SHALL use font-display: swap to prevent text flashing