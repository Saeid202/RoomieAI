# Requirements Document: Co-Ownership Profile

## Introduction

The Co-Ownership Profile feature enables users to create a general co-buyer profile for matching with compatible co-ownership partners. This is distinct from the existing Signal feature, which represents property-specific interest. The Co-Ownership Profile represents a user's general intent and preferences for finding a co-buyer partner, independent of any specific property.

## Glossary

- **Co-Ownership Profile**: A user's general profile expressing their intent to find a co-buyer partner, including financial capacity, property preferences, co-ownership preferences, and personal information
- **Signal**: Property-specific interest indicating "I want to co-buy THIS property" (existing feature)
- **Profile Completeness**: A percentage indicator showing how much of the profile has been filled out
- **Basic Info Box**: The main container displaying the four sections of profile information
- **RLS (Row Level Security)**: Database-level security policies that control data access
- **Seeker**: A user with the role of property seeker/buyer

## Requirements

### Requirement 1: Profile Creation and Management

**User Story:** As a seeker, I want to create and manage my co-ownership profile, so that I can find compatible co-buyer partners.

#### Acceptance Criteria

1. WHEN a seeker navigates to the Co-Ownership Profile page, THE System SHALL display an empty profile form if no profile exists
2. WHEN a seeker has an existing profile, THE System SHALL load and display their saved profile data
3. WHEN a seeker updates any profile field, THE System SHALL enable the save button
4. WHEN a seeker clicks the save button, THE System SHALL persist all profile data to the database
5. WHEN profile data is saved successfully, THE System SHALL display a success confirmation message
6. WHEN profile data fails to save, THE System SHALL display an error message with details

### Requirement 2: Financial Capacity Section

**User Story:** As a seeker, I want to specify my financial capacity, so that I can be matched with partners in a compatible price range.

#### Acceptance Criteria

1. THE System SHALL provide input fields for budget range (minimum and maximum)
2. THE System SHALL provide an input field for down payment amount
3. THE System SHALL provide an input field for annual income
4. THE System SHALL provide a selector for credit score range
5. WHEN a user enters a minimum budget greater than maximum budget, THE System SHALL display a validation error
6. WHEN a user enters non-numeric values in financial fields, THE System SHALL display a validation error
7. THE System SHALL format currency values with appropriate separators and symbols

### Requirement 3: Property Preferences Section

**User Story:** As a seeker, I want to specify my property preferences, so that I can find partners interested in similar properties.

#### Acceptance Criteria

1. THE System SHALL provide a multi-select field for property types (e.g., condo, townhouse, detached, semi-detached)
2. THE System SHALL provide a multi-select field for preferred locations
3. THE System SHALL provide a selector for minimum number of bedrooms
4. THE System SHALL provide a selector for purchase timeline (e.g., 0-3 months, 3-6 months, 6-12 months, 12+ months)
5. WHEN no property type is selected, THE System SHALL display a validation warning
6. WHEN no location is selected, THE System SHALL display a validation warning

### Requirement 4: Co-Ownership Preferences Section

**User Story:** As a seeker, I want to specify my co-ownership preferences, so that I can find partners with compatible ownership arrangements.

#### Acceptance Criteria

1. THE System SHALL provide a selector for preferred ownership split (e.g., 50/50, 60/40, 70/30, flexible)
2. THE System SHALL provide a selector for living arrangement preference (e.g., live together, rent out, investment only)
3. THE System SHALL provide a selector for co-ownership purpose (e.g., primary residence, investment, vacation property)
4. THE System SHALL allow users to select multiple living arrangement preferences
5. THE System SHALL allow users to select multiple co-ownership purposes

### Requirement 5: About You Section

**User Story:** As a seeker, I want to share information about myself, so that potential partners can understand my background and motivations.

#### Acceptance Criteria

1. THE System SHALL provide a selector for age range (e.g., 18-25, 26-35, 36-45, 46-55, 56+)
2. THE System SHALL provide an input field for occupation
3. THE System SHALL provide a text area for explaining why they are interested in co-ownership
4. WHEN the "why co-ownership" text exceeds 500 characters, THE System SHALL display a character count warning
5. THE System SHALL allow the occupation field to accept alphanumeric characters and common punctuation

### Requirement 6: Profile Completeness Indicator

**User Story:** As a seeker, I want to see how complete my profile is, so that I can ensure I've provided sufficient information for matching.

#### Acceptance Criteria

1. THE System SHALL calculate profile completeness as a percentage based on filled fields
2. THE System SHALL display the completeness percentage prominently at the top of the profile
3. WHEN profile completeness changes, THE System SHALL update the indicator in real-time
4. THE System SHALL use a visual progress bar to represent completeness percentage
5. WHEN profile completeness is below 50%, THE System SHALL display the indicator in a warning color
6. WHEN profile completeness is 100%, THE System SHALL display the indicator in a success color

### Requirement 7: Form Validation

**User Story:** As a seeker, I want immediate feedback on form errors, so that I can correct issues before saving.

#### Acceptance Criteria

1. WHEN a required field is left empty and the user moves to another field, THE System SHALL display an inline validation error
2. WHEN a user enters invalid data format, THE System SHALL display a format-specific error message
3. WHEN all validation errors are resolved, THE System SHALL remove error messages
4. WHEN a user attempts to save with validation errors, THE System SHALL prevent submission and highlight all error fields
5. THE System SHALL display validation errors in a consistent, accessible manner

### Requirement 8: Data Security and Privacy

**User Story:** As a seeker, I want my profile data to be secure, so that only authorized users can access my information.

#### Acceptance Criteria

1. THE System SHALL implement RLS policies that restrict profile access to the profile owner
2. WHEN a user attempts to access another user's profile, THE System SHALL deny access
3. WHEN a user attempts to update another user's profile, THE System SHALL deny the operation
4. THE System SHALL encrypt sensitive financial data at rest
5. THE System SHALL log all profile access attempts for security auditing

### Requirement 9: Mobile Responsive Design

**User Story:** As a seeker using a mobile device, I want the profile form to be fully functional on my device, so that I can manage my profile anywhere.

#### Acceptance Criteria

1. WHEN the viewport width is less than 768px, THE System SHALL display the form in a single-column layout
2. WHEN the viewport width is 768px or greater, THE System SHALL display the form in a multi-column layout where appropriate
3. THE System SHALL ensure all interactive elements have touch-friendly sizes (minimum 44x44px)
4. THE System SHALL ensure text remains readable without horizontal scrolling on mobile devices
5. WHEN a mobile keyboard appears, THE System SHALL ensure the active input field remains visible

### Requirement 10: Navigation and Page Location

**User Story:** As a seeker, I want to easily find the Co-Ownership Profile page, so that I can access my profile quickly.

#### Acceptance Criteria

1. THE System SHALL display the Co-Ownership Profile link in the Buying Opportunities section of the navigation
2. THE System SHALL position the Co-Ownership Profile link beside the Co-Buying Scenario link
3. WHEN a user clicks the Co-Ownership Profile link, THE System SHALL navigate to the profile page
4. THE System SHALL highlight the active navigation item when on the Co-Ownership Profile page
5. WHEN a user is not authenticated, THE System SHALL redirect to the login page when attempting to access the profile

### Requirement 11: Profile Data Persistence

**User Story:** As a seeker, I want my profile changes to be saved reliably, so that I don't lose my work.

#### Acceptance Criteria

1. WHEN a user saves their profile, THE System SHALL persist all data to the database within 2 seconds
2. WHEN a network error occurs during save, THE System SHALL retry the operation up to 3 times
3. WHEN all retry attempts fail, THE System SHALL display an error message and preserve the user's input
4. THE System SHALL maintain data consistency across all profile sections during save operations
5. WHEN a save operation is in progress, THE System SHALL disable the save button and display a loading indicator

### Requirement 12: Initial Profile State

**User Story:** As a new seeker, I want to see an empty but structured profile form, so that I understand what information to provide.

#### Acceptance Criteria

1. WHEN a seeker accesses the profile page for the first time, THE System SHALL display all four sections with empty fields
2. THE System SHALL display placeholder text in input fields to guide data entry
3. THE System SHALL display the profile completeness indicator at 0%
4. THE System SHALL provide helpful tooltips or hints for complex fields
5. THE System SHALL not require all fields to be filled before allowing a save operation
