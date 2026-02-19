# Ontario Lease Form Issues Analysis

## Issues Identified:

### 1. **Radio Buttons Not Connected to Form State**
**Location**: Sections 5, 6, 7, 8, 9, 10, 11, 15
**Problem**: All radio buttons use HTML `<input type="radio">` but don't have `checked` attributes or `onChange` handlers connected to `formData`
**Impact**: Radio button selections are not saved to form state and won't be submitted
**Examples**:
- Section 5a: `rentPaymentPeriod` (monthly/other)
- Section 6: All service/utility radio buttons (gas, electricity, heat, water, etc.)
- Section 7: `rentDiscount` (none/discounted)
- Section 8: `rentDeposit` (not-required/required)
- Section 9: `keyDeposit` (not-required/required)
- Section 10: `smokingRules` (none/rules)
- Section 11: `insuranceRequirements` (none/required)
- Section 15: `additionalTerms` (none/attachment)

### 2. **Missing CollapsibleSection Props**
**Location**: All CollapsibleSection components
**Problem**: CollapsibleSection component expects `isExpanded` and `onToggle` props but they are not provided
**Impact**: Sections cannot be collapsed/expanded (though based on context, sections should always be visible)
**Solution**: Either remove collapse functionality or add state management

### 3. **Incomplete Section 5e (Partial Rent)**
**Location**: Line 548-558
**Problem**: The sentence is incomplete - ends with "to" but no closing element
**Code**:
```tsx
to
<Input
  type="text"
  value={String(formData.partialRentEndDate || '')}
  onChange={(e) => handleInputChange('partialRentEndDate', e.target.value)}
  placeholder="end date"
  className="inline-block w-32 mx-2"
/>
.
```
**Impact**: Confusing UI, incomplete sentence

### 4. **Type Casting Issues**
**Location**: Section 17 (Signatures)
**Problem**: Unnecessary type casting with `as string` and `as boolean`
**Examples**:
```tsx
value={(formData.landlord1Name as string) || ''}
checked={(formData.landlordAgreement as boolean) || false}
```
**Impact**: Code smell, suggests type definitions may be incorrect

### 5. **Validation Logic Issues**
**Location**: `validateSection()` function
**Problem**: 
- Landlord name validation is commented out but still has logic
- Section 3 (Contact Information) fields are not validated but appear to have required fields
- Radio button selections are not validated

### 6. **Missing Form Data Fields**
**Problem**: Many radio button fields are not defined in the form state
**Missing fields**:
- `rentPaymentPeriod`
- `otherRentPaymentPeriod`
- `gas`, `airConditioning`, `additionalStorage`, `laundry`, `guestParking`
- `electricity`, `heat`, `water` (responsibility)
- `rentDiscount`
- `rentDeposit`, `keyDeposit`
- `smokingRules`
- `insuranceRequirements`
- `additionalTerms`

### 7. **Inconsistent Field Naming**
**Problem**: Some fields use different names in validation vs rendering
**Example**: 
- Validation checks `formData.startDate`
- Input field ID is `tenancyStartDate`
- This causes scroll-to-error to fail

### 8. **Section 3 Contact Information Not Auto-filled**
**Location**: Section 3 - Landlord Contact Information
**Problem**: Landlord contact fields (street number, street name, city, postal code) are not auto-filled from property data
**Impact**: Landlord has to manually re-enter address information

### 9. **Missing Error Display for Section 3**
**Problem**: Section 3 has required fields marked with * but no validation errors are set or displayed

### 10. **CollapsibleSection Always Expanded**
**Problem**: The design shows sections should not be collapsible (all content visible), but the component still has collapse UI elements
**Solution**: Either remove collapse functionality entirely or implement proper state management

## Priority Fixes:

### HIGH PRIORITY:
1. Connect all radio buttons to form state
2. Fix incomplete Section 5e sentence
3. Add validation for Section 3 required fields
4. Auto-fill Section 3 landlord contact information

### MEDIUM PRIORITY:
5. Remove or implement CollapsibleSection collapse functionality
6. Fix type casting issues in Section 17
7. Add missing form data fields to type definition
8. Fix field naming inconsistencies

### LOW PRIORITY:
9. Clean up validation logic comments
10. Add validation for radio button selections

## Recommended Fixes:

### Fix 1: Radio Button Connection Example
```tsx
// Section 5a - Rent Payment Period
<div className="flex items-center space-x-4">
  <input 
    type="radio" 
    name="rentPaymentPeriod" 
    value="monthly" 
    checked={formData.rentPaymentPeriod === 'monthly'}
    onChange={(e) => handleInputChange('rentPaymentPeriod', e.target.value)}
    className="text-emerald-600" 
  />
  <Label>Month</Label>
</div>
```

### Fix 2: Remove CollapsibleSection Collapse UI
Since all sections should be visible, simplify the component:
```tsx
const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  icon: Icon,
  color,
  children
}) => {
  // Remove isExpanded, onToggle props
  // Remove toggle button
  // Always show children
}
```

### Fix 3: Complete Section 5e
```tsx
<p className="text-gray-700">
  <strong>e)</strong> If the first rental period (e.g., month) is a partial period, the tenant will pay a partial rent of $
  <Input ... />
  on
  <Input ... />
  . This partial rent covers the rental of the unit from
  <Input ... />
  to
  <Input ... />
  .
</p>
```

### Fix 4: Auto-fill Section 3
```tsx
// In initialData prop or parent component
landlordNoticeStreetNumber: property?.address?.split(' ')[0] || '',
landlordNoticeStreetName: property?.address?.split(' ').slice(1).join(' ') || '',
landlordNoticeCityTown: property?.city || '',
landlordNoticeProvince: 'Ontario',
landlordNoticePostalCode: property?.zip_code || '',
```
