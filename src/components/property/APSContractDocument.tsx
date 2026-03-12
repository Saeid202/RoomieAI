// APSContractDocument.tsx
// HomieAI Agreement of Purchase and Sale
// Visual contract component

import { APSContractData, formatCurrency, formatDate } from '@/services/apsContractService'

interface APSContractDocumentProps {
  data: APSContractData
  onSign?: () => void
  isSigned?: boolean
  signerRole?: 'buyer' | 'seller' | 'lawyer'
  isEditable?: boolean
  onDataChange?: (updated: APSContractData) => void
}

export default function APSContractDocument({
  data,
  onSign,
  isSigned = false,
  signerRole = 'buyer',
  isEditable = false,
  onDataChange
}: APSContractDocumentProps) {
  return (
    <div className="max-w-5xl mx-auto bg-white text-gray-900 p-8 font-serif">
      {/* Header */}
      <div className="text-center border-b-2 border-purple-600 pb-6 mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">H</span>
          </div>
          <span className="text-2xl font-bold text-purple-600">HomieAI</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          AGREEMENT OF PURCHASE AND SALE
        </h1>
        <p className="text-sm text-gray-500">
          Residential Real Estate Transaction — Province of Ontario, Canada
        </p>
        <p className="text-sm text-gray-500 mt-1">
          Transaction ID: {data.transactionId}
        </p>
      </div>

      {/* Agreement Date */}
      <div className="mb-8">
        <p className="text-sm text-gray-600">
          This Agreement is made on{' '}
          <span className="font-semibold">{formatDate(data.agreementDate)}</span>
        </p>
      </div>

      {/* Parties */}
      <section className="mb-8">
        <h2 className="text-xl font-bold text-purple-600 border-b border-purple-200 pb-2 mb-4">
          PARTIES
        </h2>
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-purple-50 rounded-lg p-4">
            <h3 className="font-bold text-gray-700 mb-3">BUYER</h3>
            <div className="space-y-1 text-sm">
              <p><span className="text-gray-500">Full Legal Name:</span>{' '}
                <span className="font-semibold">{data.buyerName || '________________'}</span>
              </p>
              <p><span className="text-gray-500">Email:</span>{' '}
                {data.buyerEmail || '________________'}
              </p>
              <p><span className="text-gray-500">Phone:</span>{' '}
                {data.buyerPhone || '________________'}
              </p>
              <p><span className="text-gray-500">Address:</span>{' '}
                {data.buyerAddress || '________________'}
              </p>
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-bold text-gray-700 mb-3">SELLER</h3>
            <div className="space-y-1 text-sm">
              <p><span className="text-gray-500">Full Legal Name:</span>{' '}
                <span className="font-semibold">{data.sellerName || '________________'}</span>
              </p>
              <p><span className="text-gray-500">Email:</span>{' '}
                {data.sellerEmail || '________________'}
              </p>
              <p><span className="text-gray-500">Phone:</span>{' '}
                {data.sellerPhone || '________________'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 1 - Property */}
      <section className="mb-8">
        <h2 className="text-xl font-bold text-purple-600 border-b border-purple-200 pb-2 mb-4">
          1. PROPERTY
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          The Buyer agrees to purchase from the Seller the following property:
        </p>
        <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <p><span className="text-gray-500">Municipal Address:</span>{' '}
              <span className="font-semibold">{data.propertyAddress || '________________'}</span>
            </p>
            <p><span className="text-gray-500">City:</span>{' '}
              <span className="font-semibold">{data.propertyCity || '________________'}</span>
            </p>
            <p><span className="text-gray-500">Province:</span>{' '}
              <span className="font-semibold">Ontario</span>
            </p>
            <p><span className="text-gray-500">Postal Code:</span>{' '}
              {data.propertyPostalCode || '________________'}
            </p>
            <p><span className="text-gray-500">Property Type:</span>{' '}
              {data.propertyType || '________________'}
            </p>
            <p><span className="text-gray-500">PIN Number:</span>{' '}
              {data.propertyPin || '________________'}
            </p>
          </div>
          <p><span className="text-gray-500">Legal Description:</span>{' '}
            {data.legalDescription || '________________'}
          </p>
          {data.unitNumber && (
            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-200">
              <p><span className="text-gray-500">Unit Number:</span>{' '}
                {data.unitNumber}
              </p>
              <p><span className="text-gray-500">Condo Corp Number:</span>{' '}
                {data.condoCorpNumber || '________________'}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Section 2 - Purchase Price */}
      <section className="mb-8">
        <h2 className="text-xl font-bold text-purple-600 border-b border-purple-200 pb-2 mb-4">
          2. PURCHASE PRICE
        </h2>
        <p className="text-base text-gray-600 mb-4">
          The total purchase price shall be{' '}
          <span className="font-bold text-gray-900 text-lg">
            {formatCurrency(data.purchasePrice)}
          </span>{' '}
          Canadian Dollars, payable as follows:
        </p>
        <div className="bg-gray-50 rounded-lg p-4 space-y-3 text-base">
          <div className="flex justify-between items-center py-2 border-b border-gray-200">
            <div>
              <p className="font-semibold">A. Initial Deposit</p>
              <p className="text-gray-500 text-xs mt-1">
                Payable to HomieAI Digital Wallet (Escrow)
                within 24 hours of acceptance
              </p>
            </div>
            <span className="font-bold text-purple-600 text-base">
              {formatCurrency(data.depositAmount)}
            </span>
          </div>
          <div className="flex justify-between items-center py-2">
            <div>
              <p className="font-semibold">B. Balance Due on Closing</p>
              <p className="text-gray-500 text-xs mt-1">
                Payable on Closing Date via Bank Draft
                or Electronic Transfer
              </p>
            </div>
            <span className="font-bold text-gray-900 text-base">
              {formatCurrency(data.balanceAmount)}
            </span>
          </div>
        </div>
      </section>

      {/* Section 3 - Conditions */}
      <section className="mb-8">
        <h2 className="text-xl font-bold text-purple-600 border-b border-purple-200 pb-2 mb-4">
          3. CONDITIONS
        </h2>
        <p className="text-base text-gray-600 mb-4">
          This Agreement is conditional upon the following:
        </p>
        <div className="space-y-3 text-base">
          {isEditable ? (
            <div className="bg-blue-50 rounded-lg p-3 border-l-4 border-blue-400">
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="checkbox"
                  id="financingCondition"
                  checked={data.hasFinancingCondition}
                  onChange={(e) => onDataChange?.({
                    ...data,
                    hasFinancingCondition: e.target.checked
                  })}
                  className="w-4 h-4 accent-blue-600"
                />
                <label htmlFor="financingCondition" className="font-semibold text-gray-900 cursor-pointer">
                  Financing Condition
                </label>
              </div>
              <p className="text-gray-600 mt-1">
                The Buyer shall have until{' '}
                <input
                  type="date"
                  value={data.financingDeadline || ''}
                  onChange={(e) => onDataChange?.({
                    ...data,
                    financingDeadline: e.target.value
                  })}
                  className="border border-blue-300 rounded px-1 py-0.5 text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {' '}to obtain satisfactory financing approval. If financing is not obtained by this date, this Agreement shall be null and void.
              </p>
            </div>
          ) : (
            data.hasFinancingCondition && (
              <div className="bg-blue-50 rounded-lg p-3 border-l-4 border-blue-400">
                <p className="font-semibold text-gray-900">Financing Condition</p>
                <p className="text-gray-600 mt-1">
                  The Buyer shall have until {formatDate(data.financingDeadline)} to obtain 
                  satisfactory financing approval. If financing is not obtained by this date, 
                  this Agreement shall be null and void.
                </p>
              </div>
            )
          )}
          {isEditable ? (
            <div className="bg-green-50 rounded-lg p-3 border-l-4 border-green-400">
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="checkbox"
                  id="inspectionCondition"
                  checked={data.hasInspectionCondition}
                  onChange={(e) => onDataChange?.({
                    ...data,
                    hasInspectionCondition: e.target.checked
                  })}
                  className="w-4 h-4 accent-green-600"
                />
                <label htmlFor="inspectionCondition" className="font-semibold text-gray-900 cursor-pointer">
                  Home Inspection Condition
                </label>
              </div>
              <p className="text-gray-600 mt-1">
                The Buyer shall have until{' '}
                <input
                  type="date"
                  value={data.inspectionDeadline || ''}
                  onChange={(e) => onDataChange?.({
                    ...data,
                    inspectionDeadline: e.target.value
                  })}
                  className="border border-green-300 rounded px-1 py-0.5 text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                {' '}to conduct a professional home inspection. The Buyer may terminate this Agreement if the inspection reveals material defects.
              </p>
            </div>
          ) : (
            data.hasInspectionCondition && (
              <div className="bg-green-50 rounded-lg p-3 border-l-4 border-green-400">
                <p className="font-semibold text-gray-900">Home Inspection Condition</p>
                <p className="text-gray-600 mt-1">
                  The Buyer shall have until {formatDate(data.inspectionDeadline)} to conduct 
                  a professional home inspection. The Buyer may terminate this Agreement if 
                  the inspection reveals material defects.
                </p>
              </div>
            )
          )}
          {isEditable ? (
            <div className="bg-amber-50 rounded-lg p-3 border-l-4 border-amber-400">
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="checkbox"
                  id="statusCertCondition"
                  checked={data.hasStatusCertCondition}
                  onChange={(e) => onDataChange?.({
                    ...data,
                    hasStatusCertCondition: e.target.checked
                  })}
                  className="w-4 h-4 accent-amber-600"
                />
                <label htmlFor="statusCertCondition" className="font-semibold text-gray-900 cursor-pointer">
                  Status Certificate (Condo)
                </label>
              </div>
              <p className="text-gray-600 mt-1">
                The Seller shall provide a current Status Certificate by{' '}
                <input
                  type="date"
                  value={data.statusCertDeadline || ''}
                  onChange={(e) => onDataChange?.({
                    ...data,
                    statusCertDeadline: e.target.value
                  })}
                  className="border border-amber-300 rounded px-1 py-0.5 text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                {' '}. The Buyer may terminate if the certificate reveals material issues.
              </p>
            </div>
          ) : (
            data.hasStatusCertCondition && (
              <div className="bg-amber-50 rounded-lg p-3 border-l-4 border-amber-400">
                <p className="font-semibold text-gray-900">Status Certificate (Condo)</p>
                <p className="text-gray-600 mt-1">
                  The Seller shall provide a current Status Certificate by {formatDate(data.statusCertDeadline)}. 
                  The Buyer may terminate if the certificate reveals material issues.
                </p>
              </div>
            )
          )}
        </div>
      </section>
      {/* Section 4 - Closing Date */}
      <section className="mb-8">
        <h2 className="text-xl font-bold text-purple-600 border-b border-purple-200 pb-2 mb-4">
          4. CLOSING DATE & POSSESSION
        </h2>
        <div className="bg-gray-50 rounded-lg p-4 space-y-3 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-500 font-semibold">Closing Date</p>
              {isEditable ? (
                <input
                  type="date"
                  value={data.closingDate}
                  onChange={(e) => onDataChange?.({
                    ...data,
                    closingDate: e.target.value,
                    possessionDate: e.target.value,
                    requisitionDate: new Date(new Date(e.target.value).getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
                  })}
                  className="w-full mt-1 border border-purple-300 rounded px-2 py-1 text-base font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              ) : (
                <p className="text-gray-900 font-bold mt-1">{formatDate(data.closingDate)}</p>
              )}
            </div>
            <div>
              <p className="text-gray-500 font-semibold">Possession Date</p>
              {isEditable ? (
                <input
                  type="date"
                  value={data.possessionDate}
                  onChange={(e) => onDataChange?.({
                    ...data,
                    possessionDate: e.target.value
                  })}
                  className="w-full mt-1 border border-purple-300 rounded px-2 py-1 text-base font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              ) : (
                <p className="text-gray-900 font-bold mt-1">{formatDate(data.possessionDate)}</p>
              )}
            </div>
            <div>
              <p className="text-gray-500 font-semibold">Requisition Date</p>
              {isEditable ? (
                <input
                  type="date"
                  value={data.requisitionDate}
                  onChange={(e) => onDataChange?.({
                    ...data,
                    requisitionDate: e.target.value
                  })}
                  className="w-full mt-1 border border-purple-300 rounded px-2 py-1 text-base font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              ) : (
                <p className="text-gray-900 font-bold mt-1">{formatDate(data.requisitionDate)}</p>
              )}
            </div>
            <div>
              <p className="text-gray-500 font-semibold">Irrevocability</p>
              {isEditable ? (
                <div className="mt-1">
                  <input
                    type="date"
                    value={data.irrevocabilityDate}
                    onChange={(e) => onDataChange?.({
                      ...data,
                      irrevocabilityDate: e.target.value
                    })}
                    className="w-full border border-purple-300 rounded px-2 py-1 text-base font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <input
                    type="time"
                    value={data.irrevocabilityTime}
                    onChange={(e) => onDataChange?.({
                      ...data,
                      irrevocabilityTime: e.target.value
                    })}
                    className="w-full mt-1 border border-purple-300 rounded px-2 py-1 text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              ) : (
                <p className="text-gray-900 font-bold mt-1">
                  {formatDate(data.irrevocabilityDate)} at {data.irrevocabilityTime}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Section 5 - Chattels Included */}
      <section className="mb-8">
        <h2 className="text-xl font-bold text-purple-600 border-b border-purple-200 pb-2 mb-4">
          5. CHATTELS INCLUDED
        </h2>
        <p className="text-base text-gray-600 mb-4">
          The following chattels are included in the purchase price:
        </p>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="grid grid-cols-2 gap-3 text-base">
            {isEditable ? (
              <>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="refrigerator"
                    checked={data.includesRefrigerator}
                    onChange={(e) => onDataChange?.({
                      ...data,
                      includesRefrigerator: e.target.checked
                    })}
                    className="w-4 h-4 accent-purple-600"
                  />
                  <label htmlFor="refrigerator" className="font-semibold text-gray-900 cursor-pointer">
                    Refrigerator
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="stove"
                    checked={data.includesStove}
                    onChange={(e) => onDataChange?.({
                      ...data,
                      includesStove: e.target.checked
                    })}
                    className="w-4 h-4 accent-purple-600"
                  />
                  <label htmlFor="stove" className="font-semibold text-gray-900 cursor-pointer">
                    Stove/Range
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="dishwasher"
                    checked={data.includesDishwasher}
                    onChange={(e) => onDataChange?.({
                      ...data,
                      includesDishwasher: e.target.checked
                    })}
                    className="w-4 h-4 accent-purple-600"
                  />
                  <label htmlFor="dishwasher" className="font-semibold text-gray-900 cursor-pointer">
                    Dishwasher
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="washer"
                    checked={data.includesWasher}
                    onChange={(e) => onDataChange?.({
                      ...data,
                      includesWasher: e.target.checked
                    })}
                    className="w-4 h-4 accent-purple-600"
                  />
                  <label htmlFor="washer" className="font-semibold text-gray-900 cursor-pointer">
                    Washer
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="dryer"
                    checked={data.includesDryer}
                    onChange={(e) => onDataChange?.({
                      ...data,
                      includesDryer: e.target.checked
                    })}
                    className="w-4 h-4 accent-purple-600"
                  />
                  <label htmlFor="dryer" className="font-semibold text-gray-900 cursor-pointer">
                    Dryer
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="microwave"
                    checked={data.includesMicrowave}
                    onChange={(e) => onDataChange?.({
                      ...data,
                      includesMicrowave: e.target.checked
                    })}
                    className="w-4 h-4 accent-purple-600"
                  />
                  <label htmlFor="microwave" className="font-semibold text-gray-900 cursor-pointer">
                    Microwave
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="allBlinds"
                    checked={data.includesAllBlinds}
                    onChange={(e) => onDataChange?.({
                      ...data,
                      includesAllBlinds: e.target.checked
                    })}
                    className="w-4 h-4 accent-purple-600"
                  />
                  <label htmlFor="allBlinds" className="font-semibold text-gray-900 cursor-pointer">
                    All Blinds & Coverings
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="allCurtains"
                    checked={data.includesAllCurtains}
                    onChange={(e) => onDataChange?.({
                      ...data,
                      includesAllCurtains: e.target.checked
                    })}
                    className="w-4 h-4 accent-purple-600"
                  />
                  <label htmlFor="allCurtains" className="font-semibold text-gray-900 cursor-pointer">
                    All Curtains & Rods
                  </label>
                </div>
              </>
            ) : (
              <>
                {data.includesRefrigerator && (
                  <div className="flex items-center gap-2">
                    <span className="text-purple-600 font-bold">✓</span>
                    <span>Refrigerator</span>
                  </div>
                )}
                {data.includesStove && (
                  <div className="flex items-center gap-2">
                    <span className="text-purple-600 font-bold">✓</span>
                    <span>Stove/Range</span>
                  </div>
                )}
                {data.includesDishwasher && (
                  <div className="flex items-center gap-2">
                    <span className="text-purple-600 font-bold">✓</span>
                    <span>Dishwasher</span>
                  </div>
                )}
                {data.includesWasher && (
                  <div className="flex items-center gap-2">
                    <span className="text-purple-600 font-bold">✓</span>
                    <span>Washer</span>
                  </div>
                )}
                {data.includesDryer && (
                  <div className="flex items-center gap-2">
                    <span className="text-purple-600 font-bold">✓</span>
                    <span>Dryer</span>
                  </div>
                )}
                {data.includesMicrowave && (
                  <div className="flex items-center gap-2">
                    <span className="text-purple-600 font-bold">✓</span>
                    <span>Microwave</span>
                  </div>
                )}
                {data.includesAllBlinds && (
                  <div className="flex items-center gap-2">
                    <span className="text-purple-600 font-bold">✓</span>
                    <span>All Blinds & Coverings</span>
                  </div>
                )}
                {data.includesAllCurtains && (
                  <div className="flex items-center gap-2">
                    <span className="text-purple-600 font-bold">✓</span>
                    <span>All Curtains & Rods</span>
                  </div>
                )}
              </>
            )}
          </div>
          {isEditable ? (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-gray-500 text-xs mb-1">Additional Chattels:</p>
              <input
                type="text"
                value={data.additionalChattels}
                onChange={(e) => onDataChange?.({
                  ...data,
                  additionalChattels: e.target.value
                })}
                className="w-full border border-gray-300 rounded px-2 py-1 text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter additional chattels..."
              />
            </div>
          ) : (
            data.additionalChattels && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-gray-500 text-xs mb-1">Additional Chattels:</p>
                <p className="text-gray-900">{data.additionalChattels}</p>
              </div>
            )
          )}
        </div>
      </section>

      {/* Section 6 - Fixtures Excluded */}
      <section className="mb-8">
        <h2 className="text-xl font-bold text-purple-600 border-b border-purple-200 pb-2 mb-4">
          6. FIXTURES EXCLUDED
        </h2>
        <p className="text-base text-gray-600 mb-4">
          The following fixtures are excluded from the sale:
        </p>
        {isEditable ? (
          <div className="bg-gray-50 rounded-lg p-4">
            <textarea
              value={data.excludedFixtures}
              onChange={(e) => onDataChange?.({
                ...data,
                excludedFixtures: e.target.value
              })}
              className="w-full border border-gray-300 rounded px-3 py-2 text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
              rows={3}
              placeholder="Enter excluded fixtures..."
            />
          </div>
        ) : (
          data.excludedFixtures ? (
            <div className="bg-gray-50 rounded-lg p-4 text-base text-gray-900">
              {data.excludedFixtures}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-4 text-base text-gray-500">
              No fixtures excluded
            </div>
          )
        )}
      </section>

      {/* Section 7 - Rental Items */}
      {data.hasRentalItems && (
        <section className="mb-8">
          <h2 className="text-xl font-bold text-purple-600 border-b border-purple-200 pb-2 mb-4">
            7. RENTAL ITEMS
          </h2>
          <div className="bg-gray-50 rounded-lg p-4 space-y-3 text-sm">
            <div>
              <p className="text-gray-500 font-semibold">Items</p>
              <p className="text-gray-900 mt-1">{data.rentalItemsList}</p>
            </div>
            <div>
              <p className="text-gray-500 font-semibold">Monthly Cost</p>
              <p className="text-gray-900 font-bold">{formatCurrency(data.rentalMonthlyCost)}/month</p>
            </div>
          </div>
        </section>
      )}

      {/* Section 8 - Title */}
      <section className="mb-8">
        <h2 className="text-xl font-bold text-purple-600 border-b border-purple-200 pb-2 mb-4">
          8. TITLE
        </h2>
        <p className="text-sm text-gray-600">
          The Seller warrants that they have good and marketable title to the property, 
          free and clear of all liens, mortgages, and encumbrances, except as disclosed 
          in writing to the Buyer.
        </p>
      </section>

      {/* Section 9 - HST/Tax */}
      <section className="mb-8">
        <h2 className="text-xl font-bold text-purple-600 border-b border-purple-200 pb-2 mb-4">
          9. HST & PROPERTY TAX
        </h2>
        <div className="bg-gray-50 rounded-lg p-4 space-y-3 text-sm">
          <div>
            <p className="text-gray-500 font-semibold">Annual Property Tax</p>
            <p className="text-gray-900 font-bold">{formatCurrency(data.annualPropertyTax || 0)}</p>
          </div>
          <p className="text-gray-600">
            Property taxes shall be apportioned as of the Closing Date. 
            The Seller shall be responsible for taxes up to and including the day before Closing.
          </p>
        </div>
      </section>

      {/* Section 10 - Insurance */}
      <section className="mb-8">
        <h2 className="text-xl font-bold text-purple-600 border-b border-purple-200 pb-2 mb-4">
          10. INSURANCE
        </h2>
        <p className="text-sm text-gray-600">
          The Seller shall maintain comprehensive property insurance until the Closing Date. 
          The Buyer is responsible for obtaining insurance coverage effective on the Closing Date.
        </p>
      </section>

      {/* Section 11 - Planning Act */}
      <section className="mb-8">
        <h2 className="text-xl font-bold text-purple-600 border-b border-purple-200 pb-2 mb-4">
          11. PLANNING ACT COMPLIANCE
        </h2>
        <p className="text-sm text-gray-600">
          The Seller represents that the property is in compliance with all applicable 
          zoning and planning regulations. The Buyer may terminate if material non-compliance is discovered.
        </p>
      </section>

      {/* Section 12 - Document Delivery */}
      <section className="mb-8">
        <h2 className="text-xl font-bold text-purple-600 border-b border-purple-200 pb-2 mb-4">
          12. DOCUMENT DELIVERY
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          The Seller shall deliver the following documents by {formatDate(data.documentDate)}:
        </p>
        <ul className="space-y-2 text-sm text-gray-600 list-disc list-inside">
          <li>Deed or Transfer of Land</li>
          <li>Status Certificate (if applicable)</li>
          <li>Property Tax Assessment</li>
          <li>Utility Bills (last 3 months)</li>
          <li>Home Inspection Report (if available)</li>
          <li>Disclosure Statements</li>
        </ul>
      </section>

      {/* Section 13 - Dispute Resolution */}
      <section className="mb-8">
        <h2 className="text-xl font-bold text-purple-600 border-b border-purple-200 pb-2 mb-4">
          13. DISPUTE RESOLUTION
        </h2>
        <p className="text-sm text-gray-600">
          Any disputes arising from this Agreement shall be resolved through mediation 
          or arbitration as provided by Ontario law. Both parties agree to attempt 
          good faith resolution before pursuing legal action.
        </p>
      </section>

      {/* Section 14 - Representations & Warranties */}
      <section className="mb-8">
        <h2 className="text-xl font-bold text-purple-600 border-b border-purple-200 pb-2 mb-4">
          14. REPRESENTATIONS & WARRANTIES
        </h2>
        <div className="space-y-3 text-sm">
          <div className="bg-blue-50 rounded-lg p-3 border-l-4 border-blue-400">
            <p className="font-semibold text-gray-900">Seller's Representations</p>
            <p className="text-gray-600 mt-1">
              The Seller represents that they have disclosed all known material defects, 
              liens, and encumbrances affecting the property.
            </p>
          </div>
          <div className="bg-green-50 rounded-lg p-3 border-l-4 border-green-400">
            <p className="font-semibold text-gray-900">Buyer's Representations</p>
            <p className="text-gray-600 mt-1">
              The Buyer represents that they have the financial capacity to complete this purchase 
              and have conducted appropriate due diligence.
            </p>
          </div>
        </div>
      </section>

      {/* Section 15 - HomieAI Platform Terms */}
      <section className="mb-8">
        <h2 className="text-xl font-bold text-purple-600 border-b border-purple-200 pb-2 mb-4">
          15. HOMIEAI PLATFORM TERMS
        </h2>
        <div className="bg-purple-50 rounded-lg p-4 space-y-3 text-sm">
          <p className="text-gray-600">
            This transaction is facilitated through the HomieAI platform. Both parties agree to:
          </p>
          <ul className="space-y-2 text-gray-600 list-disc list-inside">
            <li>Use HomieAI's digital wallet for deposit and payment processing</li>
            <li>Comply with HomieAI's terms of service and privacy policy</li>
            <li>Allow HomieAI to facilitate communication between parties</li>
            <li>Pay applicable platform fees as disclosed</li>
          </ul>
          <div className="bg-white rounded-lg p-3 border border-purple-200 mt-3">
            <p className="font-semibold text-gray-900">Platform Fee</p>
            <p className="text-gray-900 font-bold">{formatCurrency(data.platformFee || 0)}</p>
            <p className="text-gray-500 text-xs mt-1">1% of purchase price</p>
          </div>
        </div>
      </section>

      {/* Section 16 - General Conditions */}
      <section className="mb-8">
        <h2 className="text-xl font-bold text-purple-600 border-b border-purple-200 pb-2 mb-4">
          16. GENERAL CONDITIONS
        </h2>
        <div className="space-y-3 text-sm text-gray-600">
          <p>
            <span className="font-semibold text-gray-900">Entire Agreement:</span> This Agreement 
            constitutes the entire agreement between the parties and supersedes all prior negotiations.
          </p>
          <p>
            <span className="font-semibold text-gray-900">Amendments:</span> No amendments to this 
            Agreement are valid unless made in writing and signed by all parties.
          </p>
          <p>
            <span className="font-semibold text-gray-900">Severability:</span> If any provision is 
            found to be invalid, the remaining provisions shall continue in full force and effect.
          </p>
          <p>
            <span className="font-semibold text-gray-900">Governing Law:</span> This Agreement is 
            governed by the laws of the Province of Ontario, Canada.
          </p>
        </div>
      </section>

      {/* Section 17 - Irrevocability */}
      <section className="mb-8">
        <h2 className="text-xl font-bold text-purple-600 border-b border-purple-200 pb-2 mb-4">
          17. IRREVOCABILITY
        </h2>
        <div className="bg-amber-50 rounded-lg p-4 border-l-4 border-amber-400">
          <p className="text-sm text-gray-600">
            This offer shall remain irrevocable until {formatDate(data.irrevocabilityDate)} 
            at {data.irrevocabilityTime} Eastern Time. After this time, the offer may be withdrawn 
            by the Buyer without penalty.
          </p>
        </div>
      </section>

      {/* Section 18 - Signatures */}
      <section className="mb-8">
        <h2 className="text-xl font-bold text-purple-600 border-b border-purple-200 pb-2 mb-4">
          18. SIGNATURES
        </h2>
        
        <div className="space-y-6">
          {/* Buyer Signature */}
          <div className="border-2 border-gray-300 rounded-lg p-6">
            <p className="text-sm font-semibold text-gray-700 mb-4">BUYER</p>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Signature</p>
                <div className="h-16 border-b-2 border-gray-400 flex items-end">
                  {data.buyerSignature && (
                    <span className="text-gray-900 font-script">{data.buyerSignature}</span>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Printed Name</p>
                  <p className="text-sm text-gray-900 font-semibold">{data.buyerName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Date</p>
                  <p className="text-sm text-gray-900">{data.buyerSignDatetime ? formatDate(data.buyerSignDatetime) : '________________'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Seller Signature */}
          <div className="border-2 border-gray-300 rounded-lg p-6">
            <p className="text-sm font-semibold text-gray-700 mb-4">SELLER</p>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Signature</p>
                <div className="h-16 border-b-2 border-gray-400 flex items-end">
                  {data.sellerSignature && (
                    <span className="text-gray-900 font-script">{data.sellerSignature}</span>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Printed Name</p>
                  <p className="text-sm text-gray-900 font-semibold">{data.sellerName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Date</p>
                  <p className="text-sm text-gray-900">{data.sellerSignDatetime ? formatDate(data.sellerSignDatetime) : '________________'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Lawyer Signature */}
          <div className="border-2 border-gray-300 rounded-lg p-6">
            <p className="text-sm font-semibold text-gray-700 mb-4">LAWYER/REPRESENTATIVE</p>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Signature</p>
                <div className="h-16 border-b-2 border-gray-400 flex items-end">
                  {data.lawyerSignature && (
                    <span className="text-gray-900 font-script">{data.lawyerSignature}</span>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Printed Name</p>
                  <p className="text-sm text-gray-900 font-semibold">{data.lawyerName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">License Number</p>
                  <p className="text-sm text-gray-900">{data.lawyerLicense || '________________'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HomieAI Platform Seal */}
      <div className="border-t-2 border-purple-600 pt-8 mt-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-lg">H</span>
          </div>
          <div>
            <p className="text-sm font-bold text-purple-600">HomieAI Digital Seal</p>
            <p className="text-xs text-gray-500">Document Hash: {data.documentHash || 'Pending'}</p>
          </div>
        </div>
        <p className="text-xs text-gray-500 max-w-2xl mx-auto">
          This Agreement of Purchase and Sale has been generated and facilitated through the HomieAI platform. 
          All parties acknowledge that they have read, understood, and agree to be bound by the terms and conditions herein.
        </p>
      </div>
    </div>
  )
}
