
// This file now serves as a re-export to maintain backward compatibility
// while moving the actual implementation to more focused files

import { mapDbRowToFormValues, mapFormValuesToDbRow } from './mappers/profileMappers';
import { mapCoOwnerDbRowToFormValues, mapCoOwnerFormToDbRow } from './mappers/coOwnerMappers';

// Re-export roommate profile mappers
export { mapDbRowToFormValues, mapFormValuesToDbRow };

// Export co-owner profile mappers
export { mapCoOwnerDbRowToFormValues, mapCoOwnerFormToDbRow };
