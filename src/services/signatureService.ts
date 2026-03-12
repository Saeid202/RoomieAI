// signatureService.ts
import { supabase } from '@/integrations/supabase/client'
import { APSContractData, generateDocumentHash } from './apsContractService'

export async function saveContractSignature(
  propertyId: string,
  contractData: APSContractData,
  signerRole: 'buyer' | 'seller' | 'lawyer',
  signerName: string,
  signerId: string
) {
  const documentHash = generateDocumentHash(contractData)
  const now = new Date().toISOString()
  const deviceInfo = navigator.userAgent

  // Check if signature record exists
  const { data: existing } = await supabase
    .from('contract_signatures')
    .select('*')
    .eq('property_id', propertyId)
    .single()

  if (existing) {
    // Update existing record
    const updateData: any = { updated_at: now }

    if (signerRole === 'buyer') {
      updateData.buyer_id = signerId
      updateData.buyer_name_typed = signerName
      updateData.buyer_signed_at = now
      updateData.buyer_device_info = deviceInfo
      updateData.buyer_biometric_verified = true
      updateData.status = 'buyer_signed'
    }

    if (signerRole === 'seller') {
      updateData.seller_id = signerId
      updateData.seller_name_typed = signerName
      updateData.seller_signed_at = now
      updateData.seller_device_info = deviceInfo
      updateData.seller_biometric_verified = true
      updateData.status = 'seller_signed'
    }

    if (signerRole === 'lawyer') {
      updateData.lawyer_id = signerId
      updateData.lawyer_name_typed = signerName
      updateData.lawyer_signed_at = now
      updateData.status = 'fully_executed'
    }

    const { error } = await supabase
      .from('contract_signatures')
      .update(updateData)
      .eq('property_id', propertyId)

    return { success: !error, error, documentHash }
  } else {
    // Create new record
    const insertData: any = {
      property_id: propertyId,
      contract_data: contractData,
      document_hash: documentHash,
      status: 'pending'
    }

    if (signerRole === 'buyer') {
      insertData.buyer_id = signerId
      insertData.buyer_name_typed = signerName
      insertData.buyer_signed_at = now
      insertData.buyer_device_info = deviceInfo
      insertData.buyer_biometric_verified = true
      insertData.status = 'buyer_signed'
    }

    const { error } = await supabase
      .from('contract_signatures')
      .insert(insertData)

    return { success: !error, error, documentHash }
  }
}

export async function getContractSignature(propertyId: string) {
  const { data, error } = await supabase
    .from('contract_signatures')
    .select('*')
    .eq('property_id', propertyId)
    .single()

  return { data, error }
}

export async function isFullyExecuted(propertyId: string) {
  const { data } = await supabase
    .from('contract_signatures')
    .select('status')
    .eq('property_id', propertyId)
    .single()

  return data?.status === 'fully_executed'
}

export async function notifySellerToSign(
  propertyId: string,
  contractData: APSContractData,
  buyer: any,
  seller: any,
  lawyer: any
) {
  try {
    // 1. Save in-app notification for seller
    await supabase
      .from('payment_notifications')
      .insert({
        user_id: seller.id,
        notification_type: 'contract_signature_required',
        title: '📝 Contract Ready for Your Signature',
        message: `${buyer.full_name} has signed the Agreement of Purchase and Sale for ${contractData.propertyAddress}, ${contractData.propertyCity}. Please review and countersign to proceed with the transaction.`,
        property_id: propertyId,
        property_link: `/dashboard/property/${propertyId}/documents`
      })

    // 2. Send email notification to seller
    await supabase.functions.invoke('send-email', {
      body: {
        to: seller.email,
        subject: '📝 Action Required — Sign Purchase Agreement | HomieAI',
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #7c3aed, #a855f7); padding: 32px; border-radius: 16px 16px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px;">HomieAI</h1>
              <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0;">Real Estate Platform</p>
            </div>
            <div style="background: white; padding: 32px; border: 1px solid #e5e7eb;">
              <h2 style="color: #111827; margin: 0 0 8px;">Contract Ready for Your Signature</h2>
              <p style="color: #6b7280; margin: 0 0 24px;">
                A buyer has signed the Agreement of Purchase and Sale
                for your property. Your countersignature is required
                to proceed.
              </p>
              <div style="background: #f9fafb; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Property</td>
                    <td style="padding: 8px 0; color: #111827; font-weight: 600; font-size: 14px; text-align: right;">
                      ${contractData.propertyAddress}, ${contractData.propertyCity}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-size: 14px; border-top: 1px solid #e5e7eb;">Purchase Price</td>
                    <td style="padding: 8px 0; color: #7c3aed; font-weight: 700; font-size: 16px; text-align: right; border-top: 1px solid #e5e7eb;">
                      $${contractData.purchasePrice.toLocaleString('en-CA')} CAD
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-size: 14px; border-top: 1px solid #e5e7eb;">Buyer</td>
                    <td style="padding: 8px 0; color: #111827; font-weight: 600; font-size: 14px; text-align: right; border-top: 1px solid #e5e7eb;">
                      ${buyer.full_name}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-size: 14px; border-top: 1px solid #e5e7eb;">Closing Date</td>
                    <td style="padding: 8px 0; color: #111827; font-weight: 600; font-size: 14px; text-align: right; border-top: 1px solid #e5e7eb;">
                      ${new Date(contractData.closingDate).toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-size: 14px; border-top: 1px solid #e5e7eb;">Deposit</td>
                    <td style="padding: 8px 0; color: #111827; font-weight: 600; font-size: 14px; text-align: right; border-top: 1px solid #e5e7eb;">
                      $${contractData.depositAmount.toLocaleString('en-CA')} CAD
                    </td>
                  </tr>
                </table>
              </div>
              <div style="text-align: center; margin-bottom: 24px;">
                <a
                  href="${process.env.VITE_APP_URL}/dashboard/property/${propertyId}/documents"
                  style="background: #7c3aed; color: white; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 16px; display: inline-block;"
                >
                  Review and Sign Agreement →
                </a>
              </div>
              <div style="background: #fef3c7; border: 1px solid #fde68a; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
                <p style="margin: 0; color: #92400e; font-size: 14px;">
                  ⏰ <strong>Time sensitive:</strong> This offer is irrevocable until
                  ${contractData.irrevocabilityTime} on
                  ${new Date(contractData.irrevocabilityDate).toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' })}.
                  Please review and sign before this deadline.
                </p>
              </div>
              <p style="color: #6b7280; font-size: 14px; margin: 0;">
                If you have any questions please contact your assigned lawyer
                through the HomieAI platform or reach us at support@homieai.ca
              </p>
            </div>
            <div style="background: #f9fafb; padding: 24px; border-radius: 0 0 16px 16px; text-align: center; border: 1px solid #e5e7eb; border-top: none;">
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                HomieAI Inc. — FINTRAC Licensed Real Estate Platform<br/>This is an automated notification. Please do not reply to this email.
              </p>
            </div>
          </div>
        `
      }
    })

    // 3. Notify lawyer that buyer has signed
    if (contractData.lawyerName) {
      await supabase
        .from('payment_notifications')
        .insert({
          user_id: lawyer?.id,
          notification_type: 'contract_buyer_signed',
          title: '📋 Buyer Signed Purchase Agreement',
          message: `Buyer ${buyer.full_name} has signed the Agreement of Purchase and Sale for ${contractData.propertyAddress}. Seller has been notified to countersign. Please monitor progress.`,
          property_id: propertyId,
          property_link: `/dashboard/property/${propertyId}/documents`
        })
    }

    return { success: true }
  } catch (error) {
    console.error('Seller notification error:', error)
    return { success: false, error }
  }
}
