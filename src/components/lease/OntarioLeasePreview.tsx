import React from 'react';
import { OntarioLeaseContract } from '@/types/ontarioLease';

interface Props {
  contract: OntarioLeaseContract;
}

const fmt = (v: any) => (v != null && v !== '' ? String(v) : 'N/A');
const fmtDate = (v: any) => (v ? new Date(v).toLocaleDateString('en-CA') : 'N/A');
const fmtMoney = (v: any) => (v ? `$${Number(v).toFixed(2)}` : '$0.00');
const yesNo = (v: any) => (v ? 'Yes' : 'No');

function Section({ num, title, children }: { num: string; title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h2 className="text-sm font-bold uppercase border-b-2 border-gray-800 pb-1 mb-3 tracking-wide">
        {num}. {title}
      </h2>
      <div className="text-sm space-y-1">{children}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <p><span className="font-semibold">{label}:</span> {value}</p>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-4">{children}</div>;
}

export function OntarioLeasePreview({ contract }: Props) {
  const d = (contract.ontario_form_data || {}) as any;

  return (
    <div className="bg-white text-gray-900 font-sans text-sm leading-relaxed max-w-4xl mx-auto p-8">

      {/* Header */}
      <div className="text-center border-b-4 border-gray-900 pb-4 mb-6">
        <h1 className="text-2xl font-black tracking-tight uppercase">Ontario Standard Lease</h1>
        <p className="text-xs text-gray-500 mt-1">Residential Tenancy Agreement — Form 2229E (2020/12)</p>
        <p className="text-xs text-gray-500">Residential Tenancies Act, 2006</p>
      </div>

      <div className="bg-amber-50 border border-amber-300 rounded p-3 mb-6 text-xs text-gray-700">
        <strong>Important:</strong> This agreement is required for tenancies entered into on March 1, 2021 or later.
        All sections are mandatory and cannot be changed.
      </div>

      <Section num="1" title="Parties to the Agreement">
        <Grid>
          <div className="border rounded p-3">
            <p className="font-bold text-blue-700 mb-2">Landlord(s)</p>
            <Row label="Legal Name" value={fmt(d.landlordLegalName || contract.landlord_name)} />
          </div>
          <div className="border rounded p-3">
            <p className="font-bold text-green-700 mb-2">Tenant(s)</p>
            <Row label="First Name" value={fmt(d.tenantFirstName)} />
            <Row label="Last Name" value={fmt(d.tenantLastName)} />
          </div>
        </Grid>
      </Section>

      <Section num="2" title="Rental Unit">
        <Grid>
          <div>
            <Row label="Unit" value={fmt(d.unitNumber)} />
            <Row label="Street Number" value={fmt(d.streetNumber || contract.property_address?.split(' ')[0])} />
            <Row label="Street Name" value={fmt(d.streetName || contract.property_address?.split(' ').slice(1).join(' '))} />
          </div>
          <div>
            <Row label="City/Town" value={fmt(d.cityTown || contract.property_city)} />
            <Row label="Province" value={fmt(d.province || contract.property_state || 'Ontario')} />
            <Row label="Postal Code" value={fmt(d.postalCode || contract.property_zip)} />
          </div>
        </Grid>
        <Row label="Parking Spaces" value={fmt(d.parkingSpaces || contract.parking_spaces)} />
        <Row label="Is Condominium" value={yesNo(d.isCondominium)} />
      </Section>

      <Section num="3" title="Contact Information">
        <p className="font-semibold mb-1">Address for Giving Notices to the Landlord:</p>
        <Grid>
          <div>
            <Row label="Street Number" value={fmt(d.landlordNoticeStreetNumber)} />
            <Row label="Street Name" value={fmt(d.landlordNoticeStreetName)} />
            <Row label="Unit" value={fmt(d.landlordNoticeUnit)} />
          </div>
          <div>
            <Row label="City/Town" value={fmt(d.landlordNoticeCityTown)} />
            <Row label="Province" value={fmt(d.landlordNoticeProvince)} />
            <Row label="Postal Code" value={fmt(d.landlordNoticePostalCode)} />
          </div>
        </Grid>
        <Row label="Email Consent" value={yesNo(d.emailConsent)} />
        <Row label="Landlord Email" value={fmt(d.landlordEmail || contract.landlord_email)} />
        <Row label="Tenant Email" value={fmt(d.tenantEmail || contract.tenant_email)} />
      </Section>

      <Section num="4" title="Term of Tenancy">
        <Row label="Start Date" value={fmtDate(d.startDate || contract.lease_start_date)} />
        <Row label="Tenancy Type" value={fmt(d.tenancyType)} />
        {d.tenancyType === 'fixed' && <Row label="End Date" value={fmtDate(d.endDate || contract.lease_end_date)} />}
        {d.tenancyType === 'periodic' && <Row label="Periodic Type" value={fmt(d.periodicType)} />}
      </Section>

      <Section num="5" title="Rent">
        <Row label="Rent Payment Day" value={fmt(d.rentPaymentDay)} />
        <Row label="Payment Period" value={d.rentPaymentPeriod === 'monthly' ? 'Monthly' : fmt(d.otherRentPaymentPeriod)} />
        <div className="bg-gray-50 border rounded p-3 my-2">
          <Row label="Base Rent" value={fmtMoney(d.baseRent)} />
          {Number(d.parkingRent) > 0 && <Row label="Parking" value={fmtMoney(d.parkingRent)} />}
          {Number(d.otherServicesRent) > 0 && <Row label={`${fmt(d.otherServicesDescription)} (Other)`} value={fmtMoney(d.otherServicesRent)} />}
          <p className="font-bold border-t pt-1 mt-1">Total Lawful Rent: {fmtMoney(d.totalRent || contract.monthly_rent)}</p>
        </div>
        <Row label="Rent Payable To" value={fmt(d.rentPayableTo)} />
        <Row label="Payment Method" value={fmt(d.paymentMethod || d.rentPaymentMethods)} />
        {Number(d.partialRentAmount) > 0 && <Row label="Partial Rent Amount" value={fmtMoney(d.partialRentAmount)} />}
        {Number(d.partialRentAmount) > 0 && <Row label="Partial Rent Date" value={fmtDate(d.partialRentDate)} />}
        <Row label="NSF Charge" value={fmtMoney(d.nsfCharge)} />
      </Section>

      <Section num="6" title="Services and Utilities">
        <p className="text-xs text-gray-500 mb-2">Services included in the lawful rent:</p>
        <div className="grid grid-cols-2 gap-1">
          {([
            ['Heat', d.heatIncluded],
            ['Electricity', d.electricityIncluded],
            ['Water', d.waterIncluded],
            ['Air Conditioning', d.airConditioningIncluded],
            ['Laundry (In-Unit)', d.laundryInUnit],
            ['Laundry (Shared)', d.laundryShared],
            ['Storage', d.storageIncluded],
            ['Parking', d.parkingIncluded],
            ['Internet', d.internetIncluded],
            ['Cable TV', d.cableTvIncluded],
          ] as [string, any][]).map(([label, val]) => (
            <p key={label}>{label}: <strong>{yesNo(val)}</strong></p>
          ))}
        </div>
        {d.otherServicesIncluded && <Row label="Other Services" value={fmt(d.otherServicesIncluded)} />}
        {d.tenantPaysUtilities && <p className="mt-1"><strong>Tenant pays separately for:</strong> {d.tenantPaysUtilities}</p>}
      </Section>

      <Section num="7" title="Rent Discounts">
        <p>{!d.rentDiscount || d.rentDiscount === 'none' ? 'No rent discount.' : fmt(d.rentDiscountDetails)}</p>
      </Section>

      <Section num="8" title="Rent Deposit">
        <p>{!d.rentDeposit || d.rentDeposit === 'not-required' ? 'Not required.' : 'Required.'}</p>
        {d.rentDeposit && d.rentDeposit !== 'not-required' && (
          <>
            <Row label="Deposit Amount" value={fmtMoney(d.rentDepositAmount)} />
            <Row label="Deposit Date" value={fmtDate(d.rentDepositDate)} />
          </>
        )}
      </Section>

      <Section num="9" title="Key Deposit">
        <p>{!d.keyDeposit || d.keyDeposit === 'not-required' ? 'Not required.' : 'Required.'}</p>
        {d.keyDeposit && d.keyDeposit !== 'not-required' && (
          <>
            <Row label="Key Deposit Amount" value={fmtMoney(d.keyDepositAmount)} />
            <Row label="Number of Keys" value={fmt(d.numberOfKeys)} />
          </>
        )}
      </Section>

      <Section num="10" title="Smoking">
        <p>{!d.smokingRules || d.smokingRules === 'none' ? 'No additional smoking rules.' : fmt(d.smokingDetails)}</p>
        <p className="text-xs text-gray-500 mt-1">Smoking is not allowed in any indoor common areas under provincial law.</p>
      </Section>

      <Section num="11" title="Tenant's Insurance">
        <p>{!d.insuranceRequirements || d.insuranceRequirements === 'none' ? 'Not required.' : 'Required.'}</p>
        {d.insuranceRequirements && d.insuranceRequirements !== 'none' && (
          <Row label="Insurance Details" value={fmt(d.insuranceDetails)} />
        )}
      </Section>

      <Section num="12" title="Changes to the Rental Unit">
        <p>The tenant may install decorative items such as pictures or window coverings. The tenant must repair any damage caused by installing or removing such items.</p>
      </Section>

      <Section num="13" title="Maintenance and Repairs">
        <p>The landlord must keep the rental unit and property in good repair and comply with all health, safety and maintenance standards.</p>
        <p className="mt-1">The tenant must repair or pay for any undue damage caused by wilful or negligent conduct.</p>
      </Section>

      <Section num="14" title="Assignment and Subletting">
        <p>The tenant may assign or sublet the rental unit only with the consent of the landlord. The landlord cannot arbitrarily or unreasonably withhold consent.</p>
      </Section>

      <Section num="15" title="Additional Terms">
        {!d.additionalTerms || d.additionalTerms === 'none' ? (
          <p>There are no additional terms.</p>
        ) : (
          <>
            <p>This tenancy agreement includes additional terms that the landlord and tenant agreed to.</p>
            {d.additionalTermsText && (
              <div className="mt-2 p-3 bg-gray-50 border rounded text-xs whitespace-pre-wrap">{d.additionalTermsText}</div>
            )}
          </>
        )}
      </Section>

      <Section num="16" title="Changes to this Agreement">
        <p>After this agreement is signed, it can be changed only if the landlord and tenant agree to the changes in writing.</p>
      </Section>

      <Section num="17" title="Signatures">
        <p className="mb-3">By signing this agreement, the landlord(s) and the tenant(s) agree to follow its terms.</p>
        <Grid>
          <div className="border rounded p-3">
            <p className="font-bold text-blue-700 mb-2">Landlord Signature</p>
            <Row label="Name" value={fmt(d.landlord1Name || contract.landlord_name)} />
            {(() => {
              const sig = contract.landlord_signature as any;
              if (!sig) return <p className="text-orange-600 text-xs mt-1">Not yet signed</p>;
              const sigData = typeof sig === 'string' ? JSON.parse(sig) : sig;
              return (
                <>
                  {sigData.signature_data?.startsWith('data:image') ? (
                    <div className="mt-2">
                      <p className="text-xs font-semibold mb-1">Signature:</p>
                      <img src={sigData.signature_data} alt="Landlord signature" className="border rounded max-h-16" />
                    </div>
                  ) : (
                    <Row label="Signed" value={sigData.signature_data || 'Yes'} />
                  )}
                  <Row label="Date" value={fmtDate(sigData.signed_at)} />
                  <p className="text-green-600 text-xs mt-1 font-semibold">✓ Signed</p>
                </>
              );
            })()}
          </div>
          <div className="border rounded p-3">
            <p className="font-bold text-green-700 mb-2">Tenant Signature</p>
            <Row label="Name" value={fmt(d.tenant1Name || contract.tenant_name)} />
            {(() => {
              const sig = contract.tenant_signature as any;
              if (!sig) return <p className="text-orange-600 text-xs mt-1">Not yet signed</p>;
              const sigData = typeof sig === 'string' ? JSON.parse(sig) : sig;
              return (
                <>
                  {sigData.signature_data?.startsWith('data:image') ? (
                    <div className="mt-2">
                      <p className="text-xs font-semibold mb-1">Signature:</p>
                      <img src={sigData.signature_data} alt="Tenant signature" className="border rounded max-h-16" />
                    </div>
                  ) : (
                    <Row label="Signed" value={sigData.signature_data || 'Yes'} />
                  )}
                  <Row label="Date" value={fmtDate(sigData.signed_at)} />
                  <p className="text-green-600 text-xs mt-1 font-semibold">✓ Signed</p>
                </>
              );
            })()}
          </div>
        </Grid>
      </Section>

      <div className="mt-8 pt-4 border-t text-xs text-gray-400 text-center">
        <p>2229E (2020/12) — Ontario Standard Lease — Residential Tenancies Act, 2006</p>
        <p className="mt-1">Contract ID: {contract.id}</p>
      </div>
    </div>
  );
}
