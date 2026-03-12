import { supabase } from "@/integrations/supabase/client";
import { fetchMortgageProfile } from "./mortgageProfileService";
import { getDocumentsByProfile, getDocumentUrl } from "./mortgageDocumentService";
import type { MortgageProfile, MortgageProfileFormData } from "@/types/mortgage";
import type { MortgageDocument } from "@/types/mortgageDocument";

/**
 * Build a unified mortgage package containing profile, documents, and consent
 */
export async function buildMortgagePackage(userId: string) {
  try {
    // Step 1 - Fetch profile data
    const profile = await fetchMortgageProfile(userId);
    if (!profile) {
      throw new Error('Mortgage profile not found');
    }

    // Step 2 - Fetch all mortgage documents
    const { data: documents } = await getDocumentsByProfile(profile.id);

    // Step 3 - Get consent status
    const { data: consentData, error: consentError } = await supabase
      .from('mortgage_profiles')
      .select('broker_consent, broker_consent_date')
      .eq('id', profile.id)
      .single();

    if (consentError) {
      console.error('Error fetching consent:', consentError);
      throw consentError;
    }

    // Step 4 - Get document URLs
    const documentsWithUrls = documents ? await Promise.all(
      documents.map(async (doc) => {
        const { data: url } = await getDocumentUrl(doc.file_path);
        return {
          type: doc.document_type,
          category: doc.document_category,
          fileName: doc.file_name,
          fileUrl: url || null,
          uploadedAt: doc.uploaded_at,
          status: doc.upload_status,
          isRequired: doc.is_required
        };
      })
    ) : [];

    // Step 5 - Determine consentedTo based on user selections
    const consentedTo: string[] = [];
    if (profile.broker_consent) {
      consentedTo.push('homie_broker');
      // Add other consented services here as needed
    }

    // Step 6 - Calculate completion status
    const hasPersonalInfo = !!(profile.full_name && profile.email && profile.phone_number);
    const hasEmploymentInfo = !!(profile.employment_status && profile.income_range);
    const hasAssetsInfo = !!(profile.intended_down_payment && profile.funding_sources);
    const hasCreditInfo = !!(profile.credit_score_range);
    const hasPropertyInfo = !!(profile.purchase_price_range && profile.property_type);

    const profileComplete = hasPersonalInfo && hasEmploymentInfo && hasAssetsInfo && hasCreditInfo && hasPropertyInfo;

    const totalDocuments = documentsWithUrls.length;
    const requiredDocuments = documentsWithUrls.filter(d => d.isRequired).length;
    const documentsComplete = requiredDocuments > 0 ? requiredDocuments === totalDocuments : true;

    // Step 7 - Return unified package
    return {
      package: {
        // Profile section - organized by categories
        profile: {
          personal: {
            full_name: profile.full_name,
            email: profile.email,
            phone_number: profile.phone_number,
            date_of_birth: profile.date_of_birth,
            age: profile.age,
            first_time_buyer: profile.first_time_buyer,
            buying_with_co_borrower: profile.buying_with_co_borrower
          },
          employment: {
            employment_status: profile.employment_status,
            employer_name: profile.employer_name,
            industry: profile.industry,
            income_range: profile.income_range,
            variable_income_types: profile.variable_income_types
          },
          assets: {
            intended_down_payment: profile.intended_down_payment,
            funding_sources: profile.funding_sources,
            liquid_savings_balance: profile.liquid_savings_balance,
            has_investments: profile.has_investments
          },
          credit: {
            credit_score_range: profile.credit_score_range,
            monthly_debt_payments: profile.monthly_debt_payments,
            debt_credit_cards: profile.debt_credit_cards,
            debt_personal_loans: profile.debt_personal_loans
          },
          property: {
            purchase_price_range: profile.purchase_price_range,
            property_type: profile.property_type,
            intended_use: profile.intended_use,
            target_location: profile.target_location,
            timeline_to_buy: profile.timeline_to_buy
          }
        },

        // Documents section
        documents: documentsWithUrls,

        // Consent section
        consent: {
          broker_consent: consentData?.broker_consent || false,
          broker_consent_date: consentData?.broker_consent_date || null,
          consentedTo: consentedTo
        },

        // Package metadata
        metadata: {
          userId: profile.user_id,
          packageCreatedAt: new Date().toISOString(),
          profileComplete: profileComplete,
          documentsComplete: documentsComplete,
          totalDocuments: totalDocuments,
          readyToSubmit: profileComplete && documentsComplete
        }
      }
    };
  } catch (error) {
    console.error('Error building mortgage package:', error);
    throw error;
  }
}

/**
 * Check if the mortgage package is ready for submission
 */
export async function checkPackageReadiness(userId: string) {
  try {
    // Fetch profile
    const profile = await fetchMortgageProfile(userId);
    if (!profile) {
      return {
        isReady: false,
        profile: {
          complete: false,
          missingFields: ['Profile not found']
        },
        documents: {
          complete: false,
          uploaded: 0,
          required: 0,
          missingDocuments: ['No profile found']
        },
        consent: {
          given: false,
          date: null
        },
        canSubmitToHomieBroker: false,
        canSubmitToNewton: false
      };
    }

    // Fetch documents
    const { data: documents } = await getDocumentsByProfile(profile.id);
    const docList = documents || [];

    // Check profile completeness
    const missingFields: string[] = [];

    // Required profile fields
    if (!profile.full_name) missingFields.push('Full Name');
    if (!profile.email) missingFields.push('Email');
    if (!profile.phone_number) missingFields.push('Phone Number');
    if (!profile.date_of_birth) missingFields.push('Date of Birth');
    if (!profile.employment_status) missingFields.push('Employment Status');
    if (!profile.income_range) missingFields.push('Income Range');
    if (!profile.intended_down_payment) missingFields.push('Down Payment');
    if (!profile.funding_sources) missingFields.push('Funding Sources');
    if (!profile.credit_score_range) missingFields.push('Credit Score');
    if (!profile.purchase_price_range) missingFields.push('Purchase Price Range');
    if (!profile.property_type) missingFields.push('Property Type');

    const profileComplete = missingFields.length === 0;

    // Check document completeness
    // Required documents based on the user's requirements:
    // - Identity: drivers_license OR passport (at least one)
    // - Income: t4 (at least one year) - we'll check for t4_slips
    // - Income: pay_stub (at least one)
    // - Financial: bank_statement (at least one)

    const hasIdentityDoc = docList.some(d => 
      d.document_type === 'drivers_license' || d.document_type === 'passport'
    );
    const hasT4Doc = docList.some(d => d.document_type === 't4');
    const hasPayStubDoc = docList.some(d => d.document_type === 'pay_stub');
    const hasBankStatementDoc = docList.some(d => d.document_type === 'bank_statement');

    const missingDocuments: string[] = [];
    if (!hasIdentityDoc) missingDocuments.push('Identity Document (Driver\'s License or Passport)');
    if (!hasT4Doc) missingDocuments.push('T4 (Last 2 Years)');
    if (!hasPayStubDoc) missingDocuments.push('Pay Stubs (Recent 2 Months)');
    if (!hasBankStatementDoc) missingDocuments.push('Bank Statements (Last 3 Months)');

    const documentsComplete = missingDocuments.length === 0;
    const uploadedCount = docList.length;
    const requiredCount = 4; // 4 required document types

    // Check consent
    const consentGiven = profile.broker_consent || false;
    const consentDate = profile.broker_consent_date || null;

    // Determine readiness
    const isReady = profileComplete && documentsComplete && consentGiven;
    const canSubmitToHomieBroker = isReady;
    const canSubmitToNewton = isReady; // For future Newton integration

    return {
      isReady,
      profile: {
        complete: profileComplete,
        missingFields
      },
      documents: {
        complete: documentsComplete,
        uploaded: uploadedCount,
        required: requiredCount,
        missingDocuments
      },
      consent: {
        given: consentGiven,
        date: consentDate
      },
      canSubmitToHomieBroker,
      canSubmitToNewton
    };
  } catch (error) {
    console.error('Error checking package readiness:', error);
    throw error;
  }
}
