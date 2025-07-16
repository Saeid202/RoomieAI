# Database Migration Guide

## Overview

This guide documents the comprehensive database restructuring and field consistency fixes implemented for the Roommate AI Match project. The migration addresses critical mismatches between frontend types, database schema, and code usage.

## 🚨 Critical Issues Identified

### 1. **Field Mismatches**
- **Frontend vs Database naming**: camelCase vs snake_case inconsistencies
- **Missing demographic fields**: nationality, language, ethnicity, religion, occupation
- **Dual date fields**: Frontend expects moveInDateStart/End, database had single move_in_date
- **Duplicate pet preference fields**: Legacy and new enum fields coexisting

### 2. **Enum Value Inconsistencies**
- **workSchedule**: Code used "nightShift" vs frontend/database "afternoonShift"
- **diet**: Code sometimes used "noRestrictions" vs standard "noPreference"
- **gender**: No enum constraints, inconsistent case usage

### 3. **Data Type Mismatches**
- **preferredLocation**: Frontend array vs database text
- **budgetRange**: Frontend number array vs database text

## 📁 Migration Files

### 1. Database Schema Recreation
**File**: `supabase/migrations/20250117_recreate_roommate_table.sql`

**Key Changes**:
```sql
-- Added missing demographic fields
nationality TEXT,
language TEXT,
ethnicity TEXT,
religion TEXT,
occupation TEXT,

-- Fixed array fields
preferred_location TEXT[], -- Was single TEXT
budget_range INTEGER[], -- Was TEXT

-- Added dual date fields
move_in_date_start DATE,
move_in_date_end DATE,

-- Added proper enum constraints
housing_type TEXT CHECK (housing_type IN ('house', 'apartment')),
work_schedule TEXT CHECK (work_schedule IN ('dayShift', 'afternoonShift', 'overnightShift')),
diet TEXT CHECK (diet IN ('vegetarian', 'halal', 'kosher', 'noPreference', 'other')),

-- Added new pet preference enum field
pet_preference_enum TEXT CHECK (pet_preference_enum IN ('noPets', 'catOk', 'smallPetsOk')),
```

### 2. Mock Data Generation
**File**: `supabase/migrations/20250117_insert_mock_roommate_data.sql`

**Features**:
- 10 diverse user profiles
- Comprehensive demographic data
- Various preference importance levels
- Multiple nationality/language/ethnicity/religion combinations
- Different occupation types and work schedules
- Realistic budget ranges and locations

**Sample Profiles**:
1. **Sarah Chen** - Chinese Software Engineer, vegetarian, tech preferences
2. **Marcus Johnson** - American Graphic Designer, creative background
3. **Priya Patel** - Indian Medical Student, strict preferences
4. **Alex Rodriguez** - Mexican Financial Analyst, multicultural
5. **Emma Thompson** - British PhD Student, academic focus
6. **David Kim** - Korean Chef, culinary background
7. **Jessica Williams** - American Nurse, healthcare focus
8. **Ahmed Hassan** - Egyptian CS Student, religious preferences
9. **Lisa Chang** - Taiwanese Marketing Manager, professional
10. **James O'Connor** - Irish MBA Student, business-minded

### 3. Consistency Checker
**File**: `scripts/check_field_consistency.ts`

**Capabilities**:
- Automated field mismatch detection
- Enum consistency validation
- Severity classification (error/warning/info)
- Detailed recommendations
- Migration checklist generation

## 🔧 Implementation Steps

### Phase 1: Database Migration
```sql
-- 1. Run the recreation script
psql -f supabase/migrations/20250117_recreate_roommate_table.sql

-- 2. Insert mock data
psql -f supabase/migrations/20250117_insert_mock_roommate_data.sql

-- 3. Verify data integrity
SELECT COUNT(*) FROM roommate; -- Should return 10
```

### Phase 2: Code Updates

#### A. Fix Enum Inconsistencies
```typescript
// Replace all instances of "nightShift" with "afternoonShift"
// Replace all instances of "noRestrictions" with "noPreference"

// Files to update:
- src/services/idealRoommateMatchingService.ts
- src/services/customPreferenceMatchingService.ts
- src/utils/matchingAlgorithm/profileMapper.ts
- src/hooks/useRoommateProfile.ts
```

#### B. Update Type Definitions
```typescript
// src/types/profile.ts - Ensure consistency with database
export const profileSchema = z.object({
  // Update to match new database fields
  moveInDateStart: z.date(),
  moveInDateEnd: z.date(),
  preferredLocation: z.array(z.string()),
  budgetRange: z.array(z.number()).min(2).max(2),
  
  // Add demographic fields
  nationality: z.string().optional(),
  language: z.string().optional(),
  ethnicity: z.string().optional(),
  religion: z.string().optional(),
  occupation: z.string().optional(),
  
  // Use new pet preference field
  petPreference: z.enum(["noPets", "catOk", "smallPetsOk"]).optional(),
});
```

#### C. Update Mappers
```typescript
// src/utils/mappers/mappingUtils.ts
// Ensure proper camelCase ↔ snake_case conversion

const mapToDatabase = (frontendData: ProfileFormValues) => ({
  // Existing mappings...
  preferred_location: frontendData.preferredLocation,
  budget_range: frontendData.budgetRange,
  move_in_date_start: frontendData.moveInDateStart,
  move_in_date_end: frontendData.moveInDateEnd,
  nationality: frontendData.nationality,
  language: frontendData.language,
  ethnicity: frontendData.ethnicity,
  religion: frontendData.religion,
  occupation: frontendData.occupation,
  pet_preference_enum: frontendData.petPreference,
});
```

### Phase 3: Frontend Updates

#### A. Update Forms
- Add demographic information fields
- Update date pickers for start/end dates
- Migrate to new pet preference enum
- Add proper validation for all fields

#### B. Update Matching Algorithm
- Integrate new demographic matching logic
- Update compatibility calculations
- Add match reasons for new fields

## 🧪 Testing Strategy

### 1. Database Tests
```sql
-- Verify schema constraints
INSERT INTO roommate (housing_type) VALUES ('invalid'); -- Should fail

-- Test array fields
INSERT INTO roommate (preferred_location) VALUES (ARRAY['Location1', 'Location2']);

-- Test enum constraints
INSERT INTO roommate (work_schedule) VALUES ('invalidSchedule'); -- Should fail
```

### 2. Matching Algorithm Tests
```typescript
// Test new demographic matching
const testUser = { nationality: 'Chinese', nationalityPreference: 'sameCountry' };
const matches = await findMatches(testUser);
// Should prioritize Chinese candidates
```

### 3. Integration Tests
- Test form submission with new fields
- Verify data mapping accuracy
- Test matching results with diverse profiles

## 📊 Data Migration Impact

### Benefits
- ✅ **Consistent field naming** across frontend/backend
- ✅ **Rich demographic matching** capabilities
- ✅ **Proper enum constraints** prevent invalid data
- ✅ **Flexible date ranges** for move-in preferences
- ✅ **Array-based locations** for multiple preferences
- ✅ **Comprehensive test data** for development

### Breaking Changes
- ⚠️ **API Response Structure**: Some field names changed
- ⚠️ **Database Schema**: Complete table recreation required
- ⚠️ **Frontend Forms**: Need updates for new fields
- ⚠️ **Matching Logic**: Enhanced with new criteria

## 🔍 Validation Checklist

### Pre-Migration
- [ ] Backup existing data
- [ ] Test migration scripts on staging
- [ ] Update environment configurations
- [ ] Prepare rollback procedures

### Post-Migration
- [ ] Verify all 10 mock users inserted correctly
- [ ] Test matching algorithm with new data
- [ ] Validate form submissions work
- [ ] Check enum constraints are enforced
- [ ] Verify array fields handle multiple values
- [ ] Test demographic filtering functionality

## 🛠️ Maintenance

### Regular Checks
1. Run consistency checker monthly: `npx tsx scripts/check_field_consistency.ts`
2. Monitor for new field mismatches
3. Update mock data as features evolve
4. Review enum constraints for new values

### Adding New Fields
1. Update database schema with proper constraints
2. Add to frontend type definitions
3. Update mappers for camelCase/snake_case conversion
4. Add to consistency checker
5. Update mock data examples
6. Test thoroughly

## 📚 References

- [Frontend Types](../src/types/profile.ts)
- [Database Schema](../supabase/migrations/20250117_recreate_roommate_table.sql)
- [Mock Data](../supabase/migrations/20250117_insert_mock_roommate_data.sql)
- [Consistency Checker](../scripts/check_field_consistency.ts)
- [Matching Service](../src/services/idealRoommateMatchingService.ts)

---

**Last Updated**: 2025-01-17  
**Migration Version**: v2.0.0  
**Status**: Ready for Implementation 