import { OntarioLeaseContract } from '@/types/ontarioLease';
import html2pdf from 'html2pdf.js';

export const printOntarioLease = async (contract: OntarioLeaseContract): Promise<void> => {
    const d = (contract.ontario_form_data || {}) as any;

    const fmt = (v: any) => v || 'N/A';
    const fmtDate = (v: any) => v ? new Date(v).toLocaleDateString('en-CA') : 'N/A';
    const fmtMoney = (v: any) => v ? `$${Number(v).toFixed(2)}` : '$0.00';
    const yesNo = (v: any) => v ? 'Yes' : 'No';

    const section = (num: string, title: string, body: string) => `
      <div style="margin-bottom:18px;page-break-inside:avoid;">
        <h2 style="font-size:13px;font-weight:bold;border-bottom:2px solid #333;padding-bottom:4px;margin-bottom:8px;">
          ${num}. ${title.toUpperCase()}
        </h2>
        ${body}
      </div>`;

    const row = (label: string, value: string) =>
        `<p style="margin:3px 0;font-size:11px;"><strong>${label}:</strong> ${value}</p>`;

    const html = `
    <div style="max-width:780px;margin:0 auto;font-family:Arial,sans-serif;font-size:11px;line-height:1.5;color:#111;">

      <!-- HEADER -->
      <div style="text-align:center;border-bottom:3px solid #000;padding-bottom:10px;margin-bottom:16px;">
        <h1 style="margin:0;font-size:20px;font-weight:bold;letter-spacing:1px;">ONTARIO STANDARD LEASE</h1>
        <p style="margin:4px 0;font-size:10px;">Residential Tenancy Agreement — Form 2229E (2020/12)</p>
        <p style="margin:4px 0;font-size:10px;">© Queen's Printer for Ontario, 2020 | Residential Tenancies Act, 2006</p>
        <p style="margin:4px 0;font-size:9px;color:#555;">Contract ID: ${contract.id} &nbsp;|&nbsp; Generated: ${new Date().toLocaleDateString('en-CA')}</p>
      </div>

      <!-- LEGAL NOTICE -->
      <div style="background:#fff8e1;border:1px solid #f0c040;border-radius:4px;padding:8px 12px;margin-bottom:16px;font-size:10px;">
        <strong>Important:</strong> This agreement is required for tenancies entered into on March 1, 2021 or later.
        Residential tenancies in Ontario are governed by the Residential Tenancies Act, 2006.
        This agreement cannot take away a right or responsibility under the Act.
        All sections of this agreement are mandatory and cannot be changed.
      </div>

      ${section('1', 'Parties to the Agreement', `
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
          <div style="border:1px solid #ccc;border-radius:4px;padding:8px;">
            <p style="font-weight:bold;margin:0 0 6px;color:#1a56db;">Landlord(s)</p>
            ${row('Legal Name', fmt(d.landlordLegalName || contract.landlord_name))}
          </div>
          <div style="border:1px solid #ccc;border-radius:4px;padding:8px;">
            <p style="font-weight:bold;margin:0 0 6px;color:#057a55;">Tenant(s)</p>
            ${row('First Name', fmt(d.tenantFirstName))}
            ${row('Last Name', fmt(d.tenantLastName))}
          </div>
        </div>
      `)}

      ${section('2', 'Rental Unit', `
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
          <div>
            ${row('Unit', fmt(d.unitNumber))}
            ${row('Street Number', fmt(d.streetNumber || contract.property_address?.split(' ')[0]))}
            ${row('Street Name', fmt(d.streetName || contract.property_address?.split(' ').slice(1).join(' ')))}
          </div>
          <div>
            ${row('City/Town', fmt(d.cityTown || contract.property_city))}
            ${row('Province', fmt(d.province || contract.property_state || 'Ontario'))}
            ${row('Postal Code', fmt(d.postalCode || contract.property_zip))}
          </div>
        </div>
        ${row('Parking Spaces', fmt(d.parkingSpaces || contract.parking_spaces))}
        ${row('Is Condominium', yesNo(d.isCondominium))}
      `)}

      ${section('3', 'Contact Information', `
        <p style="font-weight:bold;margin:0 0 4px;">Address for Giving Notices to the Landlord:</p>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:8px;">
          <div>
            ${row('Unit', fmt(d.landlordNoticeUnit))}
            ${row('Street Number', fmt(d.landlordNoticeStreetNumber))}
            ${row('Street Name', fmt(d.landlordNoticeStreetName))}
            ${row('PO Box', fmt(d.landlordNoticePOBox))}
          </div>
          <div>
            ${row('City/Town', fmt(d.landlordNoticeCityTown))}
            ${row('Province', fmt(d.landlordNoticeProvince))}
            ${row('Postal Code', fmt(d.landlordNoticePostalCode))}
          </div>
        </div>
        ${row('Email Consent', yesNo(d.emailConsent))}
        ${row('Landlord Email', fmt(d.landlordEmail || contract.landlord_email))}
        ${row('Tenant Email', fmt(d.tenantEmail || contract.tenant_email))}
        ${row('Emergency Contact Provided', yesNo(d.emergencyContactProvided))}
        ${d.emergencyPhone ? row('Emergency Phone', fmt(d.emergencyPhone)) : ''}
        ${d.emergencyEmail ? row('Emergency Email', fmt(d.emergencyEmail)) : ''}
      `)}

      ${section('4', 'Term of Tenancy', `
        ${row('Start Date', fmtDate(d.startDate || contract.lease_start_date))}
        ${row('Tenancy Type', fmt(d.tenancyType))}
        ${d.tenancyType === 'fixed' ? row('End Date', fmtDate(d.endDate || contract.lease_end_date)) : ''}
        ${d.tenancyType === 'periodic' ? row('Periodic Type', fmt(d.periodicType)) : ''}
        ${d.tenancyType === 'other' ? row('Other Type', fmt(d.otherTenancyType)) : ''}
      `)}

      ${section('5', 'Rent', `
        ${row('Rent Payment Day', fmt(d.rentPaymentDay))}
        ${row('Payment Period', d.rentPaymentPeriod === 'monthly' ? 'Monthly' : fmt(d.otherRentPaymentPeriod))}
        <div style="margin:6px 0;padding:6px;background:#f9f9f9;border:1px solid #ddd;border-radius:4px;">
          ${row('Base Rent', fmtMoney(d.baseRent))}
          ${Number(d.parkingRent) > 0 ? row('Parking', fmtMoney(d.parkingRent)) : ''}
          ${Number(d.otherServicesRent) > 0 ? row(fmt(d.otherServicesDescription) + ' (Other)', fmtMoney(d.otherServicesRent)) : ''}
          <p style="margin:4px 0;font-size:11px;font-weight:bold;border-top:1px solid #ccc;padding-top:4px;">Total Lawful Rent: ${fmtMoney(d.totalRent || contract.monthly_rent)}</p>
        </div>
        ${row('Rent Payable To', fmt(d.rentPayableTo))}
        ${row('Payment Method', fmt(d.paymentMethod || d.rentPaymentMethods))}
        ${Number(d.partialRentAmount) > 0 ? row('Partial Rent Amount', fmtMoney(d.partialRentAmount)) : ''}
        ${Number(d.partialRentAmount) > 0 ? row('Partial Rent Date', fmtDate(d.partialRentDate)) : ''}
        ${row('NSF Charge', fmtMoney(d.nsfCharge))}
      `)}

      ${section('6', 'Services and Utilities', `
        <p style="font-size:10px;margin:0 0 6px;">The following services are included in the lawful rent:</p>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;font-size:10px;">
          <p>Heat: <strong>${yesNo(d.heatIncluded)}</strong></p>
          <p>Electricity: <strong>${yesNo(d.electricityIncluded)}</strong></p>
          <p>Water: <strong>${yesNo(d.waterIncluded)}</strong></p>
          <p>Air Conditioning: <strong>${yesNo(d.airConditioningIncluded)}</strong></p>
          <p>Laundry (In-Unit): <strong>${yesNo(d.laundryInUnit)}</strong></p>
          <p>Laundry (Shared): <strong>${yesNo(d.laundryShared)}</strong></p>
          <p>Storage: <strong>${yesNo(d.storageIncluded)}</strong></p>
          <p>Parking: <strong>${yesNo(d.parkingIncluded)}</strong></p>
          <p>Internet: <strong>${yesNo(d.internetIncluded)}</strong></p>
          <p>Cable TV: <strong>${yesNo(d.cableTvIncluded)}</strong></p>
        </div>
        ${d.otherServicesIncluded ? row('Other Services', fmt(d.otherServicesIncluded)) : ''}
        ${d.tenantPaysUtilities ? `<p style="font-size:10px;margin:4px 0;"><strong>Tenant pays separately for:</strong> ${fmt(d.tenantPaysUtilities)}</p>` : ''}
      `)}

      ${section('7', 'Rent Discounts', `
        ${row('Rent Discount', d.rentDiscount === 'none' ? 'No rent discount' : fmt(d.rentDiscountDetails))}
      `)}

      ${section('8', 'Rent Deposit', `
        ${row('Rent Deposit Required', d.rentDeposit === 'not-required' ? 'Not required' : 'Required')}
        ${d.rentDeposit !== 'not-required' ? row('Deposit Amount', fmtMoney(d.rentDepositAmount)) : ''}
        ${d.rentDeposit !== 'not-required' ? row('Deposit Date', fmtDate(d.rentDepositDate)) : ''}
      `)}

      ${section('9', 'Key Deposit', `
        ${row('Key Deposit Required', d.keyDeposit === 'not-required' ? 'Not required' : 'Required')}
        ${d.keyDeposit !== 'not-required' ? row('Key Deposit Amount', fmtMoney(d.keyDepositAmount)) : ''}
        ${d.keyDeposit !== 'not-required' ? row('Number of Keys', fmt(d.numberOfKeys)) : ''}
      `)}

      ${section('10', 'Smoking', `
        ${row('Smoking Rules', d.smokingRules === 'none' ? 'No additional smoking rules' : fmt(d.smokingDetails))}
        <p style="font-size:10px;margin:4px 0;color:#555;">Note: Smoking is not allowed in any indoor common areas of the building under provincial law.</p>
      `)}

      ${section('11', "Tenant's Insurance", `
        ${row('Insurance Required', d.insuranceRequirements === 'none' ? 'Not required' : 'Required')}
        ${d.insuranceRequirements !== 'none' ? row('Insurance Details', fmt(d.insuranceDetails)) : ''}
      `)}

      ${section('12', 'Changes to the Rental Unit', `
        <p style="font-size:10px;margin:0;">The tenant may install decorative items such as pictures or window coverings, subject to any reasonable restrictions in Section 15. The tenant must repair any damage caused by installing or removing such items.</p>
      `)}

      ${section('13', 'Maintenance and Repairs', `
        <p style="font-size:10px;margin:0 0 4px;">The landlord must keep the rental unit and property in good repair and comply with all health, safety and maintenance standards.</p>
        <p style="font-size:10px;margin:0 0 4px;">The tenant must repair or pay for any undue damage caused by wilful or negligent conduct.</p>
        <p style="font-size:10px;margin:0;">The tenant is responsible for ordinary cleanliness of the rental unit.</p>
      `)}

      ${section('14', 'Assignment and Subletting', `
        <p style="font-size:10px;margin:0;">The tenant may assign or sublet the rental unit to another person only with the consent of the landlord. The landlord cannot arbitrarily or unreasonably withhold consent.</p>
      `)}

      ${section('15', 'Additional Terms', `
        ${d.additionalTerms === 'none' || !d.additionalTerms
            ? '<p style="font-size:10px;margin:0;">There are no additional terms.</p>'
            : `<p style="font-size:10px;margin:0;">This tenancy agreement includes an attachment with additional terms that the landlord and tenant agreed to.</p>
               ${d.additionalTermsText ? `<p style="font-size:10px;margin:6px 0;padding:6px;background:#f9f9f9;border:1px solid #ddd;border-radius:4px;">${fmt(d.additionalTermsText)}</p>` : ''}`
        }
      `)}

      ${section('16', 'Changes to this Agreement', `
        <p style="font-size:10px;margin:0;">After this agreement is signed, it can be changed only if the landlord and tenant agree to the changes in writing.</p>
      `)}

      ${section('17', 'Signatures', `
        <p style="font-size:10px;margin:0 0 8px;">By signing this agreement, the landlord(s) and the tenant(s) agree to follow its terms.</p>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
          <div style="border:1px solid #ccc;border-radius:4px;padding:8px;">
            <p style="font-weight:bold;color:#1a56db;margin:0 0 6px;">Landlord Signature</p>
            ${row('Name', fmt(d.landlord1Name || contract.landlord_name))}
            ${(() => {
              const sig = contract.landlord_signature as any;
              if (!sig) return '<p style="color:#e67e22;font-size:10px;margin:4px 0;">Not yet signed</p>';
              const sigData = typeof sig === 'string' ? JSON.parse(sig) : sig;
              const sigImg = sigData.signature_data?.startsWith('data:image')
                ? `<img src="${sigData.signature_data}" style="max-height:40px;border:1px solid #ccc;border-radius:2px;margin:4px 0;" />`
                : `<p style="font-size:10px;margin:3px 0;"><strong>Signed:</strong> ${sigData.signature_data || 'Yes'}</p>`;
              return `${sigImg}<p style="font-size:10px;margin:3px 0;"><strong>Date:</strong> ${sigData.signed_at ? new Date(sigData.signed_at).toLocaleDateString('en-CA') : 'N/A'}</p><p style="color:#057a55;font-size:10px;font-weight:bold;">✓ Signed</p>`;
            })()}
          </div>
          <div style="border:1px solid #ccc;border-radius:4px;padding:8px;">
            <p style="font-weight:bold;color:#057a55;margin:0 0 6px;">Tenant Signature</p>
            ${row('Name', fmt(d.tenant1Name || contract.tenant_name))}
            ${(() => {
              const sig = contract.tenant_signature as any;
              if (!sig) return '<p style="color:#e67e22;font-size:10px;margin:4px 0;">Not yet signed</p>';
              const sigData = typeof sig === 'string' ? JSON.parse(sig) : sig;
              const sigImg = sigData.signature_data?.startsWith('data:image')
                ? `<img src="${sigData.signature_data}" style="max-height:40px;border:1px solid #ccc;border-radius:2px;margin:4px 0;" />`
                : `<p style="font-size:10px;margin:3px 0;"><strong>Signed:</strong> ${sigData.signature_data || 'Yes'}</p>`;
              return `${sigImg}<p style="font-size:10px;margin:3px 0;"><strong>Date:</strong> ${sigData.signed_at ? new Date(sigData.signed_at).toLocaleDateString('en-CA') : 'N/A'}</p><p style="color:#057a55;font-size:10px;font-weight:bold;">✓ Signed</p>`;
            })()}
          </div>
        </div>
      `)}

      <!-- FOOTER -->
      <div style="margin-top:20px;padding-top:8px;border-top:1px solid #ccc;font-size:9px;color:#666;text-align:center;">
        <p style="margin:0;">2229E (2020/12) — Ontario Standard Lease — Residential Tenancies Act, 2006</p>
        <p style="margin:2px 0;">Generated on ${new Date().toLocaleDateString('en-CA')} &nbsp;|&nbsp; Contract ID: ${contract.id}</p>
      </div>
    </div>`;

    const element = document.createElement('div');
    element.innerHTML = html;
    document.body.appendChild(element);

    const blob: Blob = await html2pdf().set({
        margin: [10, 10, 10, 10],
        filename: `ontario-lease-${contract.id}.pdf`,
        image: { type: 'jpeg', quality: 0.9 },
        html2canvas: { scale: 1.5, useCORS: true, logging: false },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    }).from(element).outputPdf('blob');

    document.body.removeChild(element);

    // Force download without opening in browser
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ontario-lease-${contract.id}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
};
