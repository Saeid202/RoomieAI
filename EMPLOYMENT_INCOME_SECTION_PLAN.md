# Employment & Income Section Implementation Plan

## Database Schema ✓
Added columns to `mortgage_profiles`:
- employment_status (employed/contractor/self_employed/business_owner)
- employment_type (permanent/part_time) - for employed only
- employer_name
- client_names (TEXT[] array)
- industry
- employment_duration
- contracting_duration
- business_name
- business_duration
- income_range
- variable_income_types (TEXT[] array)

## TypeScript Types ✓
Updated `MortgageProfile` and `MortgageProfileFormData` interfaces

## Service Layer ✓
Updated `saveMortgageProfile()` to handle all new fields

## Form Implementation (Next Steps)

### 1. Update Form Schema
Add validation for employment fields with conditional requirements

### 2. Update Form Default Values
Initialize all employment fields

### 3. Update Form Load Logic
Load employment data from saved profile

### 4. Update Form Submit Logic
Include employment data in save

### 5. Add UI Section
Create new Card section "Employment & Income Snapshot" with:
- Employment Status radio buttons (mandatory)
- Conditional fields based on status:
  - **Employed**: employment_type, employer_name, industry, employment_duration, income_range, variable_income
  - **Contractor**: client_names (multi-input), industry, contracting_duration, income_range, variable_income
  - **Self-Employed/Business Owner**: business_name, industry, business_duration, income_range, variable_income

### 6. Conditional Rendering Logic
Use `mortgageForm.watch('employment_status')` to show/hide fields

## Field Details

### Common Fields (All Types)
- Industry (dropdown/select - mandatory)
- Income Range (dropdown - mandatory)
- Variable Income Types (checkboxes - optional)

### Employed Specific
- Employment Type: Permanent/Part-time (radio - mandatory)
- Employer Name (text input - optional)
- Employment Duration (dropdown - mandatory)
- Variable Income: Bonus/Commission (checkboxes)

### Contractor Specific
- Client Names (dynamic list, up to 5 - optional)
- "Multiple Clients" checkbox option
- Contracting Duration (dropdown - mandatory)
- Variable Income: Project-based/Performance-based (checkboxes)

### Self-Employed/Business Owner Specific
- Business Name (text input - optional)
- Business Duration (dropdown - mandatory)
- Variable Income: Dividends/Profit distributions/Irregular income (checkboxes)

## Income Range Options
- Under $30,000
- $30,000 - $50,000
- $50,000 - $75,000
- $75,000 - $100,000
- $100,000 - $150,000
- $150,000 - $200,000
- Over $200,000

## Duration Options
- Less than 1 year
- 1-2 years
- 2-5 years
- 5-10 years
- Over 10 years

## Industry Options (Sample)
- Technology
- Healthcare
- Finance
- Education
- Construction
- Retail
- Manufacturing
- Services
- Other
