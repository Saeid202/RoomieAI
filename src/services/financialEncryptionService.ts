/**
 * financialEncryptionService.ts
 *
 * Thin wrapper around the Postgres `encrypt_financial` / `decrypt_financial`
 * RPC functions (backed by pgcrypto pgp_sym_encrypt/decrypt).
 *
 * The encryption key lives exclusively in `app.settings.encryption_key` on
 * the Postgres server – it never touches the client bundle.
 *
 * Usage
 * -----
 *   // Write
 *   const enc = await encryptField('750-799');
 *   await supabase.from('mortgage_profiles').update({ credit_score_range_enc: enc });
 *
 *   // Read
 *   const row = await supabase.from('mortgage_profiles').select('credit_score_range_enc').single();
 *   const plain = await decryptField(row.credit_score_range_enc);
 */

import { supabase } from '@/integrations/supabase/client';

/** Encrypt a plaintext string via the server-side pgcrypto wrapper. */
export async function encryptField(plaintext: string): Promise<string> {
  // Cast to `any` – the generated types won't include these functions until
  // after the migration runs and types are regenerated.
  const { data, error } = await (supabase.rpc as any)('encrypt_financial', {
    plaintext,
  });

  if (error) throw new Error(`Encryption failed: ${error.message}`);
  // RPC returns the BYTEA as a hex-encoded string in the JS client
  return data as string;
}

/** Decrypt a ciphertext value (hex string from Supabase) via the server-side wrapper. */
export async function decryptField(ciphertext: string | null): Promise<string | null> {
  if (!ciphertext) return null;

  const { data, error } = await (supabase.rpc as any)('decrypt_financial', {
    ciphertext,
  });

  if (error) throw new Error(`Decryption failed: ${error.message}`);
  return data as string | null;
}

// ---------------------------------------------------------------------------
// Typed helpers for mortgage_profiles
// ---------------------------------------------------------------------------

/** Sensitive fields on mortgage_profiles that are stored encrypted. */
export interface MortgageProfileSensitiveFields {
  creditScoreRange?: string | null;
  monthlyDebtPayments?: string | null;
  missedPayments?: string | null;
  bankruptcyHistory?: string | null;
  creditNotes?: string | null;
  incomeRange?: string | null;
  liquidSavings?: string | null;
  investmentValue?: string | null;
  intendedDownPayment?: string | null;
  giftAmountRange?: string | null;
  fundingOther?: string | null;
  coBorrowerDetails?: string | null;
  dateOfBirth?: string | null;
  phoneNumber?: string | null;
}

/** Column name map: logical field → encrypted DB column */
const MORTGAGE_ENC_COLUMNS: Record<keyof MortgageProfileSensitiveFields, string> = {
  creditScoreRange:    'credit_score_range_enc',
  monthlyDebtPayments: 'monthly_debt_payments_enc',
  missedPayments:      'missed_payments_enc',
  bankruptcyHistory:   'bankruptcy_history_enc',
  creditNotes:         'credit_notes_enc',
  incomeRange:         'income_range_enc',
  liquidSavings:       'liquid_savings_enc',
  investmentValue:     'investment_value_enc',
  intendedDownPayment: 'intended_down_payment_enc',
  giftAmountRange:     'gift_amount_range_enc',
  fundingOther:        'funding_other_enc',
  coBorrowerDetails:   'co_borrower_details_enc',
  dateOfBirth:         'date_of_birth_enc',
  phoneNumber:         'phone_number_enc',
};

/**
 * Encrypt a partial set of mortgage profile sensitive fields and return
 * a record ready to pass to a Supabase `.update()` / `.insert()` call.
 */
export async function encryptMortgageFields(
  fields: MortgageProfileSensitiveFields
): Promise<Record<string, string | null>> {
  const result: Record<string, string | null> = {};

  await Promise.all(
    (Object.keys(fields) as Array<keyof MortgageProfileSensitiveFields>).map(async (key) => {
      const value = fields[key];
      const col = MORTGAGE_ENC_COLUMNS[key];
      result[col] = value != null ? await encryptField(value) : null;
    })
  );

  return result;
}

/**
 * Decrypt a raw mortgage_profiles row (as returned by Supabase) and return
 * the plaintext sensitive fields.
 */
export async function decryptMortgageFields(
  row: Record<string, string | null>
): Promise<MortgageProfileSensitiveFields> {
  const result: MortgageProfileSensitiveFields = {};

  await Promise.all(
    (Object.keys(MORTGAGE_ENC_COLUMNS) as Array<keyof MortgageProfileSensitiveFields>).map(
      async (key) => {
        const col = MORTGAGE_ENC_COLUMNS[key];
        if (col in row) {
          (result as Record<string, string | null>)[key] = await decryptField(row[col]);
        }
      }
    )
  );

  return result;
}

// ---------------------------------------------------------------------------
// Typed helpers for rental_applications
// ---------------------------------------------------------------------------

/**
 * Encrypt the monthly_income value for a rental application.
 * @returns `{ monthly_income_enc: string | null }`
 */
export async function encryptRentalIncome(
  monthlyIncome: number | null
): Promise<{ monthly_income_enc: string | null }> {
  if (monthlyIncome == null) return { monthly_income_enc: null };
  return { monthly_income_enc: await encryptField(String(monthlyIncome)) };
}

/**
 * Decrypt the monthly_income_enc column from a rental_applications row.
 * @returns The income as a number, or null.
 */
export async function decryptRentalIncome(
  row: { monthly_income_enc?: string | null }
): Promise<number | null> {
  const plain = await decryptField(row.monthly_income_enc ?? null);
  if (plain == null) return null;
  const num = parseFloat(plain);
  return isNaN(num) ? null : num;
}
