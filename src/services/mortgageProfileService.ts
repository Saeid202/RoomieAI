import { supabase } from "@/integrations/supabase/client";
import { MortgageProfile, MortgageProfileFormData } from "@/types/mortgage";

/**
 * Clean form data - convert empty strings to null for database
 */
function cleanFormData(formData: MortgageProfileFormData) {
  return {
    ...formData,
    date_of_birth: formData.date_of_birth || null,
    phone_number: formData.phone_number || null,
    co_borrower_details: formData.co_borrower_details || null,
    employer_name: formData.employer_name || null,
    business_name: formData.business_name || null,
    industry: formData.industry || null,
    employment_duration: formData.employment_duration || null,
    contracting_duration: formData.contracting_duration || null,
    business_duration: formData.business_duration || null,
    income_range: formData.income_range || null,
    intended_down_payment: formData.intended_down_payment || null,
    funding_other_explanation: formData.funding_other_explanation || null,
    gift_provider_relationship: formData.gift_provider_relationship || null,
    gift_amount_range: formData.gift_amount_range || null,
    liquid_savings_balance: formData.liquid_savings_balance || null,
    has_investments: formData.has_investments || null,
    investment_value_range: formData.investment_value_range || null,
    crypto_storage_type: formData.crypto_storage_type || null,
    crypto_exposure_level: formData.crypto_exposure_level || null,
    funds_country_region: formData.funds_country_region || null,
    credit_score_range: formData.credit_score_range || null,
    credit_additional_notes: formData.credit_additional_notes || null,
    missed_payment_type: formData.missed_payment_type || null,
    last_missed_payment_date: formData.last_missed_payment_date || null,
    bankruptcy_type: formData.bankruptcy_type || null,
    bankruptcy_filing_year: formData.bankruptcy_filing_year || null,
    bankruptcy_discharge_date: formData.bankruptcy_discharge_date || null,
    purchase_price_range: formData.purchase_price_range || null,
    property_type: formData.property_type || null,
    intended_use: formData.intended_use || null,
    target_location: formData.target_location || null,
    timeline_to_buy: formData.timeline_to_buy || null,
  };
}

/**
 * Fetch mortgage profile for the current user
 */
export async function fetchMortgageProfile(userId: string): Promise<MortgageProfile | null> {
  const { data, error } = await supabase
    .from('mortgage_profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error("Error fetching mortgage profile:", error);
    throw error;
  }

  return data;
}

/**
 * Create or update mortgage profile
 */
export async function saveMortgageProfile(
  userId: string,
  formData: MortgageProfileFormData
): Promise<MortgageProfile> {
  // Clean the form data (convert empty strings to null)
  const cleanedData = cleanFormData(formData);

  // Check if profile exists
  const { data: existing } = await supabase
    .from('mortgage_profiles')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle();

  if (existing) {
    // Update existing profile
    const { data, error } = await supabase
      .from('mortgage_profiles')
      .update({
        full_name: cleanedData.full_name,
        email: cleanedData.email,
        age: cleanedData.age,
        phone_number: cleanedData.phone_number,
        date_of_birth: cleanedData.date_of_birth,
        first_time_buyer: cleanedData.first_time_buyer,
        buying_with_co_borrower: cleanedData.buying_with_co_borrower,
        co_borrower_details: cleanedData.co_borrower_details,
        employment_status: cleanedData.employment_status,
        employment_type: cleanedData.employment_type,
        employer_name: cleanedData.employer_name,
        client_names: cleanedData.client_names,
        industry: cleanedData.industry,
        employment_duration: cleanedData.employment_duration,
        contracting_duration: cleanedData.contracting_duration,
        business_name: cleanedData.business_name,
        business_duration: cleanedData.business_duration,
        income_range: cleanedData.income_range,
        variable_income_types: cleanedData.variable_income_types,
        intended_down_payment: cleanedData.intended_down_payment,
        funding_sources: cleanedData.funding_sources,
        funding_other_explanation: cleanedData.funding_other_explanation,
        gift_provider_relationship: cleanedData.gift_provider_relationship,
        gift_amount_range: cleanedData.gift_amount_range,
        gift_letter_available: cleanedData.gift_letter_available,
        liquid_savings_balance: cleanedData.liquid_savings_balance,
        has_investments: cleanedData.has_investments,
        investment_value_range: cleanedData.investment_value_range,
        has_cryptocurrency: cleanedData.has_cryptocurrency,
        crypto_storage_type: cleanedData.crypto_storage_type,
        crypto_exposure_level: cleanedData.crypto_exposure_level,
        funds_outside_canada: cleanedData.funds_outside_canada,
        funds_country_region: cleanedData.funds_country_region,
        credit_score_range: cleanedData.credit_score_range,
        monthly_debt_payments: cleanedData.monthly_debt_payments,
        debt_credit_cards: cleanedData.debt_credit_cards,
        debt_personal_loans: cleanedData.debt_personal_loans,
        debt_auto_loans: cleanedData.debt_auto_loans,
        debt_student_loans: cleanedData.debt_student_loans,
        debt_other: cleanedData.debt_other,
        missed_payments_last_12_months: cleanedData.missed_payments_last_12_months,
        missed_payment_type: cleanedData.missed_payment_type,
        missed_payment_count: cleanedData.missed_payment_count,
        last_missed_payment_date: cleanedData.last_missed_payment_date,
        bankruptcy_proposal_history: cleanedData.bankruptcy_proposal_history,
        bankruptcy_type: cleanedData.bankruptcy_type,
        bankruptcy_filing_year: cleanedData.bankruptcy_filing_year,
        bankruptcy_discharge_date: cleanedData.bankruptcy_discharge_date,
        credit_additional_notes: cleanedData.credit_additional_notes,
        purchase_price_range: cleanedData.purchase_price_range,
        property_type: cleanedData.property_type,
        intended_use: cleanedData.intended_use,
        target_location: cleanedData.target_location,
        timeline_to_buy: cleanedData.timeline_to_buy,
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error("Error updating mortgage profile:", error);
      throw error;
    }

    return data;
  } else {
    // Create new profile
    const { data, error } = await supabase
      .from('mortgage_profiles')
      .insert({
        user_id: userId,
        full_name: cleanedData.full_name,
        email: cleanedData.email,
        age: cleanedData.age,
        phone_number: cleanedData.phone_number,
        date_of_birth: cleanedData.date_of_birth,
        first_time_buyer: cleanedData.first_time_buyer,
        buying_with_co_borrower: cleanedData.buying_with_co_borrower,
        co_borrower_details: cleanedData.co_borrower_details,
        employment_status: cleanedData.employment_status,
        employment_type: cleanedData.employment_type,
        employer_name: cleanedData.employer_name,
        client_names: cleanedData.client_names,
        industry: cleanedData.industry,
        employment_duration: cleanedData.employment_duration,
        contracting_duration: cleanedData.contracting_duration,
        business_name: cleanedData.business_name,
        business_duration: cleanedData.business_duration,
        income_range: cleanedData.income_range,
        variable_income_types: cleanedData.variable_income_types,
        intended_down_payment: cleanedData.intended_down_payment,
        funding_sources: cleanedData.funding_sources,
        funding_other_explanation: cleanedData.funding_other_explanation,
        gift_provider_relationship: cleanedData.gift_provider_relationship,
        gift_amount_range: cleanedData.gift_amount_range,
        gift_letter_available: cleanedData.gift_letter_available,
        liquid_savings_balance: cleanedData.liquid_savings_balance,
        has_investments: cleanedData.has_investments,
        investment_value_range: cleanedData.investment_value_range,
        has_cryptocurrency: cleanedData.has_cryptocurrency,
        crypto_storage_type: cleanedData.crypto_storage_type,
        crypto_exposure_level: cleanedData.crypto_exposure_level,
        funds_outside_canada: cleanedData.funds_outside_canada,
        funds_country_region: cleanedData.funds_country_region,
        credit_score_range: cleanedData.credit_score_range,
        monthly_debt_payments: cleanedData.monthly_debt_payments,
        debt_credit_cards: cleanedData.debt_credit_cards,
        debt_personal_loans: cleanedData.debt_personal_loans,
        debt_auto_loans: cleanedData.debt_auto_loans,
        debt_student_loans: cleanedData.debt_student_loans,
        debt_other: cleanedData.debt_other,
        missed_payments_last_12_months: cleanedData.missed_payments_last_12_months,
        missed_payment_type: cleanedData.missed_payment_type,
        missed_payment_count: cleanedData.missed_payment_count,
        last_missed_payment_date: cleanedData.last_missed_payment_date,
        bankruptcy_proposal_history: cleanedData.bankruptcy_proposal_history,
        bankruptcy_type: cleanedData.bankruptcy_type,
        bankruptcy_filing_year: cleanedData.bankruptcy_filing_year,
        bankruptcy_discharge_date: cleanedData.bankruptcy_discharge_date,
        credit_additional_notes: cleanedData.credit_additional_notes,
        purchase_price_range: cleanedData.purchase_price_range,
        property_type: cleanedData.property_type,
        intended_use: cleanedData.intended_use,
        target_location: cleanedData.target_location,
        timeline_to_buy: cleanedData.timeline_to_buy,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating mortgage profile:", error);
      throw error;
    }

    return data;
  }
}
