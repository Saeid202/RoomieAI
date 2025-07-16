# Custom Matching Preferences System

## Overview

This system allows users to customize the importance of different matching criteria when finding roommates. Users can set each criterion as "Must Have" (required), "Important", or "Not Important", giving them complete control over the matching algorithm.

## Features

### 1. Three Importance Levels

- **Must Have (Required)** - Absolute deal-breakers that filter out incompatible matches
- **Important** - High-weight preferences that significantly impact match scores
- **Not Important** - Low-weight preferences with minimal impact on matching

### 2. Preference Categories

The system covers 20 different matching criteria across 4 categories:

#### Demographics
- Gender preference
- Age range
- Nationality
- Language
- Ethnicity
- Religion
- Occupation

#### Housing
- Location
- Budget range
- Housing type (apartment/house)
- Living space (private/shared room)

#### Lifestyle
- Smoking policy
- Pet policy
- Work schedule compatibility
- Dietary preferences

#### Social
- Shared hobbies/interests
- Cleanliness standards
- Social interaction level
- Guest policies
- Sleep schedules

### 3. Smart Matching Algorithm

The matching algorithm uses user-defined weights to:
- Filter out candidates who don't meet "required" criteria
- Calculate weighted compatibility scores based on user preferences
- Generate personalized match reasons
- Provide detailed compatibility breakdowns

## Usage

### Accessing Preferences

1. Navigate to the Dashboard
2. Click "Matching Preferences" in the sidebar
3. Configure your preference importance levels
4. Save your preferences

### Setting Preferences

1. **Browse Categories**: Use the tabs to navigate between Demographics, Housing, Lifestyle, and Social preferences
2. **Set Importance**: For each criterion, select:
   - 🔴 **Must Have**: For absolute requirements
   - 🟠 **Important**: For significant preferences
   - ⚪ **Not Important**: For flexible criteria
3. **Save**: Click "Save Preferences" to store your settings

### Finding Matches

1. After setting preferences, click "Find Matches"
2. The algorithm will:
   - Filter out anyone who doesn't meet your "required" criteria
   - Score remaining candidates based on your importance weights
   - Show personalized match results with compatibility breakdowns

## Technical Implementation

### Data Storage

- User preferences are stored in the `user_preferences` table
- Includes localStorage backup for offline access
- Real-time sync across devices when online

### Algorithm Flow

```typescript
1. Load user profile and preferences
2. Fetch candidate roommates from database
3. For each candidate:
   - Check required criteria (skip if failed)
   - Calculate weighted compatibility scores
   - Generate match reasons
4. Sort by compatibility score
5. Return top matches
```

### Weight Calculation

- **Required**: 1.0 (100% weight) - filters rather than weights
- **Important**: 0.7 (70% weight)
- **Not Important**: 0.3 (30% weight)

## Example Scenarios

### Scenario 1: Location-Focused User
```
Location: Must Have
Budget: Important  
Gender: Important
Smoking: Must Have
Pets: Not Important
```
Result: Only shows matches in preferred areas who meet budget/gender preferences and smoking requirements.

### Scenario 2: Lifestyle-Focused User
```
Work Schedule: Must Have
Pets: Must Have
Smoking: Must Have
Hobbies: Important
Location: Not Important
```
Result: Prioritizes lifestyle compatibility over location, ensuring work schedule and pet/smoking compatibility.

### Scenario 3: Flexible User
```
Most criteria: Not Important
Budget: Important
Location: Important
```
Result: Shows many matches, primarily sorted by budget and location compatibility.

## Benefits

1. **Personalized Matching**: Each user gets results tailored to their specific priorities
2. **Efficient Filtering**: Required criteria eliminate incompatible matches early
3. **Transparent Scoring**: Users understand why matches were suggested
4. **Flexible System**: Easy to adjust preferences as needs change
5. **Better Outcomes**: Higher likelihood of successful roommate relationships

## Future Enhancements

- Machine learning to suggest optimal preference weights
- Seasonal preference adjustments
- Group matching with combined preferences
- Advanced location-based weighting
- Integration with calendar availability
- Preference templates for common user types

## API Usage

### Custom Matching Service
```typescript
import { customPreferenceMatchingEngine } from '@/services/customPreferenceMatchingService';

const results = await customPreferenceMatchingEngine.findMatches({
  currentUser: profileData,
  userPreferences: preferences,
  maxResults: 10,
  minScore: 60
});
```

### Preference Management
```typescript
import { useUserPreferences } from '@/hooks/useUserPreferences';

const { 
  preferences, 
  updatePreference, 
  savePreferences 
} = useUserPreferences();

// Update a preference
updatePreference('location', 'required');

// Save changes
await savePreferences();
```

This system transforms the roommate matching experience from a one-size-fits-all approach to a highly personalized, user-controlled matching process. 