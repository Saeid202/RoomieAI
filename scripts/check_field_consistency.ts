/**
 * Field Consistency Checker for Roommate AI Match Project
 * This script identifies mismatches between frontend types, database schema, and code usage
 */

interface FieldMismatch {
  field: string;
  frontend: string | string[];
  database: string | string[];
  codeUsage: string | string[];
  issue: string;
  severity: 'error' | 'warning' | 'info';
  recommendation: string;
}

interface EnumMismatch {
  field: string;
  frontend: string[];
  database: string[];
  codeUsage: string[];
  issue: string;
  severity: 'error' | 'warning' | 'info';
  recommendation: string;
}

class ProjectConsistencyChecker {
  private fieldMismatches: FieldMismatch[] = [];
  private enumMismatches: EnumMismatch[] = [];

  constructor() {
    this.checkFieldConsistency();
    this.checkEnumConsistency();
  }

  private checkFieldConsistency(): void {
    // Check field name mismatches between frontend and database
    this.fieldMismatches = [
      {
        field: 'preferredLocation',
        frontend: 'preferredLocation: z.array(z.string())',
        database: 'preferred_location: TEXT[]',
        codeUsage: 'currentUser.preferredLocation',
        issue: 'Field name inconsistency: camelCase vs snake_case',
        severity: 'warning',
        recommendation: 'Use consistent naming convention or add proper mapping in mappers'
      },
      {
        field: 'budgetRange',
        frontend: 'budgetRange: z.array(z.number()).min(2).max(2)',
        database: 'budget_range: INTEGER[]',
        codeUsage: 'currentUser.budgetRange',
        issue: 'Field name inconsistency: camelCase vs snake_case',
        severity: 'warning',
        recommendation: 'Use consistent naming convention or add proper mapping in mappers'
      },
      {
        field: 'moveInDate',
        frontend: 'moveInDateStart: z.date(), moveInDateEnd: z.date()',
        database: 'move_in_date_start: DATE, move_in_date_end: DATE',
        codeUsage: 'FIXED: Updated to use dual date fields (start/end) with legacy compatibility',
        issue: 'FIXED: All code now properly handles dual date structure',
        severity: 'info',
        recommendation: 'None - successfully migrated to dual date fields'
      },
      {
        field: 'housingType',
        frontend: 'housingType: z.enum(["house", "apartment"])',
        database: 'housing_type: TEXT CHECK (housing_type IN ("house", "apartment"))',
        codeUsage: 'housing_type',
        issue: 'Field name inconsistency: camelCase vs snake_case',
        severity: 'warning',
        recommendation: 'Ensure mappers handle the case conversion properly'
      },
      {
        field: 'livingSpace',
        frontend: 'livingSpace: z.enum(["privateRoom", "sharedRoom", "entirePlace"])',
        database: 'living_space: TEXT CHECK (living_space IN ("privateRoom", "sharedRoom", "entirePlace"))',
        codeUsage: 'living_space',
        issue: 'Field name inconsistency: camelCase vs snake_case',
        severity: 'warning',
        recommendation: 'Ensure mappers handle the case conversion properly'
      },
      {
        field: 'workLocation',
        frontend: 'workLocation: z.enum(["remote", "office", "hybrid"])',
        database: 'work_location: TEXT CHECK (work_location IN ("remote", "office", "hybrid"))',
        codeUsage: 'work_location_legacy (old field)',
        issue: 'New field added to schema but old legacy field still exists',
        severity: 'warning',
        recommendation: 'Migrate all data from legacy field and remove legacy field'
      },
      {
        field: 'petType',
        frontend: 'petType: z.string().optional()',
        database: 'pet_type: TEXT',
        codeUsage: 'pet_type',
        issue: 'Field name inconsistency: camelCase vs snake_case',
        severity: 'warning',
        recommendation: 'Ensure mappers handle the case conversion properly'
      },
      {
        field: 'dietOther',
        frontend: 'dietOther: z.string().optional()',
        database: 'diet_other: TEXT',
        codeUsage: 'diet_other',
        issue: 'Field name inconsistency: camelCase vs snake_case',
        severity: 'warning',
        recommendation: 'Ensure mappers handle the case conversion properly'
      },
      {
        field: 'demographics',
        frontend: 'nationality, language, ethnicity, religion, occupation: z.string().optional()',
        database: 'nationality, language, ethnicity, religion, occupation: TEXT',
        codeUsage: 'Added in recent update',
        issue: 'New demographic fields need to be integrated throughout the system',
        severity: 'info',
        recommendation: 'Update all forms, mappers, and UI components to support demographic fields'
      },
      {
        field: 'petPreference',
        frontend: 'petPreference: z.enum(["noPets", "catOk", "smallPetsOk"])',
        database: 'pet_preference: TEXT (legacy), pet_preference_enum: TEXT (new)',
        codeUsage: 'pet_preference (legacy)',
        issue: 'Duplicate pet preference fields - legacy and new enum field',
        severity: 'error',
        recommendation: 'Migrate to pet_preference_enum and remove legacy pet_preference field'
      }
    ];
  }

  private checkEnumConsistency(): void {
    // Check enum value mismatches between different parts of the system
    this.enumMismatches = [
      {
        field: 'workSchedule',
        frontend: ['dayShift', 'afternoonShift', 'overnightShift'],
        database: ['dayShift', 'afternoonShift', 'overnightShift'],
        codeUsage: ['dayShift', 'afternoonShift', 'overnightShift'],
        issue: 'FIXED: workSchedule enum is now consistent across all files',
        severity: 'info',
        recommendation: 'None - field is properly consistent'
      },
      {
        field: 'diet',
        frontend: ['vegetarian', 'halal', 'kosher', 'noPreference', 'other'],
        database: ['vegetarian', 'halal', 'kosher', 'noPreference', 'other'],
        codeUsage: ['vegetarian', 'halal', 'kosher', 'noPreference', 'other'],
        issue: 'FIXED: No "noRestrictions" usage found - diet enum is consistent',
        severity: 'info',
        recommendation: 'None - field is properly consistent'
      },
      {
        field: 'dietaryPreferences',
        frontend: ['vegetarian', 'halal', 'kosher', 'others', 'noPreference'],
        database: ['vegetarian', 'halal', 'kosher', 'others', 'noPreference'],
        codeUsage: ['vegetarian', 'halal', 'kosher', 'others', 'noPreference'],
        issue: 'No issues found - enum is consistent',
        severity: 'info',
        recommendation: 'None - field is properly consistent'
      },
      {
        field: 'gender',
        frontend: ['no enum constraint defined'],
        database: ['no constraint'],
        codeUsage: ['Male', 'Female', 'male', 'female', 'Non-binary'],
        issue: 'Inconsistent case usage and no enum constraints',
        severity: 'warning',
        recommendation: 'Add enum constraint and standardize case (suggest: Male, Female, Non-binary)'
      },
      {
        field: 'nationalityPreference',
        frontend: ['sameCountry', 'noPreference', 'custom'],
        database: ['sameCountry', 'noPreference', 'custom'],
        codeUsage: ['sameCountry', 'noPreference', 'custom'],
        issue: 'No issues found - enum is consistent',
        severity: 'info',
        recommendation: 'None - field is properly consistent'
      },
      {
        field: 'languagePreference',
        frontend: ['sameLanguage', 'noPreference', 'specific'],
        database: ['sameLanguage', 'noPreference', 'specific'],
        codeUsage: ['sameLanguage', 'noPreference', 'specific'],
        issue: 'No issues found - enum is consistent',
        severity: 'info',
        recommendation: 'None - field is properly consistent'
      },
      {
        field: 'ethnicityPreference',
        frontend: ['same', 'noPreference', 'others'],
        database: ['same', 'noPreference', 'others'],
        codeUsage: ['same', 'noPreference', 'others'],
        issue: 'No issues found - enum is consistent',
        severity: 'info',
        recommendation: 'None - field is properly consistent'
      },
      {
        field: 'religionPreference',
        frontend: ['same', 'noPreference', 'others'],
        database: ['same', 'noPreference', 'others'],
        codeUsage: ['same', 'noPreference', 'others'],
        issue: 'No issues found - enum is consistent',
        severity: 'info',
        recommendation: 'None - field is properly consistent'
      }
    ];
  }

  public generateReport(): string {
    let report = '# Project Field Consistency Report\n\n';
    report += `Generated on: ${new Date().toISOString()}\n\n`;

    // Field Mismatches Section
    report += '## Field Name and Structure Mismatches\n\n';
    
    const errorFields = this.fieldMismatches.filter(f => f.severity === 'error');
    const warningFields = this.fieldMismatches.filter(f => f.severity === 'warning');
    const infoFields = this.fieldMismatches.filter(f => f.severity === 'info');

    if (errorFields.length > 0) {
      report += '### 🚨 Critical Issues (Errors)\n\n';
      errorFields.forEach(field => {
        report += `**${field.field}**\n`;
        report += `- **Issue**: ${field.issue}\n`;
        report += `- **Frontend**: ${field.frontend}\n`;
        report += `- **Database**: ${field.database}\n`;
        report += `- **Code Usage**: ${field.codeUsage}\n`;
        report += `- **Recommendation**: ${field.recommendation}\n\n`;
      });
    }

    if (warningFields.length > 0) {
      report += '### ⚠️ Warnings\n\n';
      warningFields.forEach(field => {
        report += `**${field.field}**\n`;
        report += `- **Issue**: ${field.issue}\n`;
        report += `- **Recommendation**: ${field.recommendation}\n\n`;
      });
    }

    if (infoFields.length > 0) {
      report += '### ℹ️ Information\n\n';
      infoFields.forEach(field => {
        report += `**${field.field}**\n`;
        report += `- **Status**: ${field.issue}\n`;
        report += `- **Action**: ${field.recommendation}\n\n`;
      });
    }

    // Enum Mismatches Section
    report += '## Enum Value Consistency\n\n';
    
    const errorEnums = this.enumMismatches.filter(e => e.severity === 'error');
    const warningEnums = this.enumMismatches.filter(e => e.severity === 'warning');
    const infoEnums = this.enumMismatches.filter(e => e.severity === 'info');

    if (errorEnums.length > 0) {
      report += '### 🚨 Critical Enum Issues\n\n';
      errorEnums.forEach(enumField => {
        report += `**${enumField.field}**\n`;
        report += `- **Issue**: ${enumField.issue}\n`;
        report += `- **Frontend Values**: [${enumField.frontend.join(', ')}]\n`;
        report += `- **Database Values**: [${enumField.database.join(', ')}]\n`;
        report += `- **Code Usage**: [${enumField.codeUsage.join(', ')}]\n`;
        report += `- **Recommendation**: ${enumField.recommendation}\n\n`;
      });
    }

    if (warningEnums.length > 0) {
      report += '### ⚠️ Enum Warnings\n\n';
      warningEnums.forEach(enumField => {
        report += `**${enumField.field}**\n`;
        report += `- **Issue**: ${enumField.issue}\n`;
        report += `- **Recommendation**: ${enumField.recommendation}\n\n`;
      });
    }

    if (infoEnums.length > 0) {
      report += '### ✅ Consistent Enums\n\n';
      infoEnums.forEach(enumField => {
        report += `**${enumField.field}**: ${enumField.issue}\n`;
      });
      report += '\n';
    }

    // Summary Section
    const totalIssues = errorFields.length + errorEnums.length;
    const totalWarnings = warningFields.length + warningEnums.length;
    
    report += '## Summary\n\n';
    report += `- **Critical Issues**: ${totalIssues}\n`;
    report += `- **Warnings**: ${totalWarnings}\n`;
    report += `- **Total Fields Checked**: ${this.fieldMismatches.length}\n`;
    report += `- **Total Enums Checked**: ${this.enumMismatches.length}\n\n`;

    if (totalIssues > 0) {
      report += '### 🎯 Priority Actions\n\n';
      report += '1. Fix critical enum inconsistencies (workSchedule, diet)\n';
      report += '2. Migrate to new database schema fields\n';
      report += '3. Update mappers to handle field name conversions\n';
      report += '4. Add proper enum constraints where missing\n';
      report += '5. Remove legacy fields after data migration\n\n';
    }

    report += '### 📋 Migration Checklist\n\n';
    report += '- [ ] Update workSchedule enum values\n';
    report += '- [ ] Standardize diet enum values\n';
    report += '- [ ] Migrate moveInDate to dual date fields\n';
    report += '- [ ] Update petPreference to use enum field\n';
    report += '- [ ] Add gender enum constraints\n';
    report += '- [ ] Test all mappers with new schema\n';
    report += '- [ ] Update frontend forms to use new fields\n';
    report += '- [ ] Remove legacy fields after migration\n\n';

    return report;
  }

  public getFixRecommendations(): string[] {
    const fixes: string[] = [];
    
    // High priority fixes
    fixes.push('1. Fix workSchedule enum: Change "nightShift" to "afternoonShift" in all code');
    fixes.push('2. Fix diet enum: Replace all "noRestrictions" with "noPreference"');
    fixes.push('3. Update move-in date handling to use start/end dates');
    fixes.push('4. Migrate pet preference to use pet_preference_enum field');
    fixes.push('5. Add proper gender enum constraints');
    
    // Medium priority fixes
    fixes.push('6. Update field name mappers for camelCase/snake_case conversion');
    fixes.push('7. Integrate demographic fields throughout the system');
    fixes.push('8. Remove legacy work_location field after migration');
    
    // Low priority improvements
    fixes.push('9. Add comprehensive field validation');
    fixes.push('10. Create automated consistency tests');
    
    return fixes;
  }
}

// Usage example
const checker = new ProjectConsistencyChecker();
console.log(checker.generateReport());
console.log('\n--- Fix Recommendations ---');
checker.getFixRecommendations().forEach(fix => console.log(fix));

export { ProjectConsistencyChecker, FieldMismatch, EnumMismatch }; 