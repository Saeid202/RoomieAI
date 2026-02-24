-- Check ALL fields in Saeid's mortgage profile to see what data exists
SELECT 
    -- Basic Info
    full_name,
    email,
    age,
    phone_number,
    date_of_birth,
    first_time_buyer,
    buying_with_co_borrower,
    co_borrower_details,
    
    -- Employment & Income
    employment_status,
    employment_type,
    employer_name,
    client_names,
    industry,
    employment_duration,
    contracting_duration,
    business_name,
    business_duration,
    income_range,
    variable_income_types,
    
    -- Assets & Down Payment
    intended_down_payment,
    funding_sources,
    funding_other_explanation,
    gift_provider_relationship,
    gift_amount_range,
    gift_letter_available,
    liquid_savings_balance,
    has_investments,
    investment_value_range,
    has_cryptocurrency,
    crypto_storage_type,
    crypto_exposure_level,
    funds_outside_canada,
    funds_country_region,
    
    -- Credit & Debts
    credit_score_range,
    monthly_debt_payments,
    debt_credit_cards,
    debt_personal_loans,
    debt_auto_loans,
    debt_student_loans,
    debt_other,
    missed_payments_last_12_months,
    missed_payment_type,
    missed_payment_count,
    last_missed_payment_date,
    bankruptcy_proposal_history,
    bankruptcy_type,
    bankruptcy_filing_year,
    bankruptcy_discharge_date,
    credit_additional_notes,
    
    -- Property Intent
    purchase_price_range,
    property_type,
    intended_use,
    target_location,
    timeline_to_buy,
    
    -- Consent
    broker_consent,
    broker_consent_date
FROM mortgage_profiles
WHERE user_id = 'd599e69e-407f-44f4-899d-14a1e3af1103';
