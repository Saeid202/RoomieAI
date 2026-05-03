// APSContractDocument.tsx
// HomieAI Agreement of Purchase and Sale
// Premium legal document â€” slate monochrome design

import { APSContractData, formatCurrency, formatDate } from '@/services/apsContractService'

interface APSContractDocumentProps {
  data: APSContractData
  onSign?: () => void
  isSigned?: boolean
  signerRole?: 'buyer' | 'seller' | 'lawyer'
  isEditable?: boolean
  onDataChange?: (updated: APSContractData) => void
}

// Style constants â€” premium legal document
const SH = "font-['Playfair_Display'] text-base font-bold text-slate-800 border-b-2 border-slate-800 pb-2 mb-5 tracking-wide"
const FL = "text-[10px] font-bold tracking-widest text-slate-500 uppercase mb-1 font-['Inter']"
const FV = "text-sm font-semibold text-slate-900 font-['Inter']"
const INP = "w-full border-0 border-b border-slate-400 bg-transparent px-0 py-1 text-sm font-medium text-slate-900 focus:outline-none focus:border-slate-700 font-['Inter']"
const SEL = "w-full border border-slate-300 rounded px-2 py-1 text-sm font-medium text-slate-900 bg-gray-50 focus:outline-none focus:border-slate-600 font-['Inter']"

export default function APSContractDocument({
  data,
  onSign,
  isSigned = false,
  signerRole = 'buyer',
  isEditable = false,
  onDataChange
}: APSContractDocumentProps) {
  return (
    <div className="max-w-none mx-auto bg-gray-100 text-slate-900 px-12 py-10 font-['Inter']">

      {/* â”€â”€ Header â”€â”€ */}
      <div className="text-center mb-10">
        <div className="border-t-2 border-slate-800 pt-4 pb-4 border-b-2">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="w-8 h-8 border-2 border-slate-800 rounded-full flex items-center justify-center">
              <span className="text-slate-800 font-bold text-sm leading-none font-['Playfair_Display']">H</span>
            </div>
            <span className="text-xs font-bold tracking-[0.35em] text-slate-600 uppercase font-['Inter']">HomieAI</span>
          </div>
          <h1 className="font-['Playfair_Display'] text-2xl font-bold tracking-wide text-slate-900 uppercase mb-1">
            Agreement of Purchase and Sale
          </h1>
          <p className="text-xs tracking-widest text-slate-500 uppercase font-['Inter']">
            Residential Real Estate â€” Province of Ontario, Canada
          </p>
          <p className="text-xs text-slate-400 mt-2 font-['Inter']">
            Transaction ID: {data.transactionId} &nbsp;Â·&nbsp; Date: {formatDate(data.agreementDate)}
          </p>
        </div>
      </div>

      {/* â”€â”€ PARTIES â”€â”€ */}
      <section className="mb-10">
        <h2 className={SH}>Parties</h2>
        <div className="grid grid-cols-2 divide-x divide-slate-200">
          {/* Buyer */}
          <div className="pr-8 space-y-4">
            <p className="font-['Playfair_Display'] text-sm font-bold text-slate-700 mb-4">Buyer</p>
            <div>
              <p className={FL}>Full Legal Name</p>
              {isEditable ? (
                <input type="text" value={data.buyerName}
                  onChange={(e) => onDataChange?.({ ...data, buyerName: e.target.value })}
                  placeholder="Enter full legal name" className={INP} />
              ) : (
                <p className={FV}>{data.buyerName || '________________'}</p>
              )}
            </div>
            <div>
              <p className={FL}>Email</p>
              {isEditable ? (
                <input type="email" value={data.buyerEmail}
                  onChange={(e) => onDataChange?.({ ...data, buyerEmail: e.target.value })}
                  placeholder="Enter email" className={INP} />
              ) : (
                <p className={FV}>{data.buyerEmail || '________________'}</p>
              )}
            </div>
            <div>
              <p className={FL}>Phone</p>
              {isEditable ? (
                <input type="tel" value={data.buyerPhone}
                  onChange={(e) => onDataChange?.({ ...data, buyerPhone: e.target.value })}
                  placeholder="Enter phone number" className={INP} />
              ) : (
                <p className={FV}>{data.buyerPhone || '________________'}</p>
              )}
            </div>
            <div>
              <p className={FL}>Mailing Address</p>
              {isEditable ? (
                <input type="text" value={data.buyerAddress}
                  onChange={(e) => onDataChange?.({ ...data, buyerAddress: e.target.value })}
                  placeholder="Enter address" className={INP} />
              ) : (
                <p className={FV}>{data.buyerAddress || '________________'}</p>
              )}
            </div>
          </div>
          {/* Seller */}
          <div className="pl-8 space-y-4">
            <p className="font-['Playfair_Display'] text-sm font-bold text-slate-700 mb-4">Seller</p>
            <div>
              <p className={FL}>Full Legal Name</p>
              {isEditable ? (
                <input type="text" value={data.sellerName}
                  onChange={(e) => onDataChange?.({ ...data, sellerName: e.target.value })}
                  placeholder="Enter full legal name" className={INP} />
              ) : (
                <p className={FV}>{data.sellerName || '________________'}</p>
              )}
            </div>
            <div>
              <p className={FL}>Email</p>
              {isEditable ? (
                <input type="email" value={data.sellerEmail}
                  onChange={(e) => onDataChange?.({ ...data, sellerEmail: e.target.value })}
                  placeholder="Enter email" className={INP} />
              ) : (
                <p className={FV}>{data.sellerEmail || '________________'}</p>
              )}
            </div>
            <div>
              <p className={FL}>Phone</p>
              {isEditable ? (
                <input type="tel" value={data.sellerPhone}
                  onChange={(e) => onDataChange?.({ ...data, sellerPhone: e.target.value })}
                  placeholder="Enter phone number" className={INP} />
              ) : (
                <p className={FV}>{data.sellerPhone || '________________'}</p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* â”€â”€ 1. PROPERTY â”€â”€ */}
      <section className="mb-10">
        <h2 className={SH}>1. Property</h2>
        <p className="text-sm text-slate-700 mb-5">
          The Buyer agrees to purchase from the Seller the following property:
        </p>
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-x-8 gap-y-5">
            <div>
              <p className={FL}>Municipal Address</p>
              {isEditable ? (
                <input type="text" value={data.propertyAddress}
                  onChange={(e) => onDataChange?.({ ...data, propertyAddress: e.target.value })}
                  placeholder="Enter address" className={INP} />
              ) : (
                <p className={FV}>{data.propertyAddress || '________________'}</p>
              )}
            </div>
            <div>
              <p className={FL}>City</p>
              {isEditable ? (
                <input type="text" value={data.propertyCity}
                  onChange={(e) => onDataChange?.({ ...data, propertyCity: e.target.value })}
                  placeholder="Enter city" className={INP} />
              ) : (
                <p className={FV}>{data.propertyCity || '________________'}</p>
              )}
            </div>
            <div>
              <p className={FL}>Province</p>
              {isEditable ? (
                <select value={data.propertyProvince || 'Ontario'}
                  onChange={(e) => onDataChange?.({ ...data, propertyProvince: e.target.value })}
                  className={SEL}>
                  <option>Alberta</option>
                  <option>British Columbia</option>
                  <option>Manitoba</option>
                  <option>New Brunswick</option>
                  <option>Newfoundland and Labrador</option>
                  <option>Northwest Territories</option>
                  <option>Nova Scotia</option>
                  <option>Nunavut</option>
                  <option>Ontario</option>
                  <option>Prince Edward Island</option>
                  <option>Quebec</option>
                  <option>Saskatchewan</option>
                  <option>Yukon</option>
                </select>
              ) : (
                <p className={FV}>{data.propertyProvince || 'Ontario'}</p>
              )}
            </div>
            <div>
              <p className={FL}>Postal Code</p>
              {isEditable ? (
                <input type="text" value={data.propertyPostalCode}
                  onChange={(e) => onDataChange?.({ ...data, propertyPostalCode: e.target.value })}
                  placeholder="e.g. M5V 3A8" className={INP} />
              ) : (
                <p className={FV}>{data.propertyPostalCode || '________________'}</p>
              )}
            </div>
            <div>
              <p className={FL}>Property Type</p>
              {isEditable ? (
                <input type="text" value={data.propertyType}
                  onChange={(e) => onDataChange?.({ ...data, propertyType: e.target.value })}
                  placeholder="e.g. Detached, Condo" className={INP} />
              ) : (
                <p className={FV}>{data.propertyType || '________________'}</p>
              )}
            </div>
            <div>
              <p className={FL}>PIN Number</p>
              {isEditable ? (
                <input type="text" value={data.propertyPin}
                  onChange={(e) => onDataChange?.({ ...data, propertyPin: e.target.value })}
                  placeholder="Enter PIN" className={INP} />
              ) : (
                <p className={FV}>{data.propertyPin || '________________'}</p>
              )}
            </div>
          </div>
          <div>
            <p className={FL}>Legal Description</p>
            {isEditable ? (
              <input type="text" value={data.legalDescription}
                onChange={(e) => onDataChange?.({ ...data, legalDescription: e.target.value })}
                placeholder="Enter legal description" className={INP} />
            ) : (
              <p className={FV}>{data.legalDescription || '________________'}</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-x-8 pt-4 border-t border-slate-100">
            <div>
              <p className={FL}>Unit Number</p>
              {isEditable ? (
                <input type="text" value={data.unitNumber || ''}
                  onChange={(e) => onDataChange?.({ ...data, unitNumber: e.target.value })}
                  placeholder="If applicable" className={INP} />
              ) : (
                <p className={FV}>{data.unitNumber || 'â€”'}</p>
              )}
            </div>
            <div>
              <p className={FL}>Condo Corp Number</p>
              {isEditable ? (
                <input type="text" value={data.condoCorpNumber || ''}
                  onChange={(e) => onDataChange?.({ ...data, condoCorpNumber: e.target.value })}
                  placeholder="If applicable" className={INP} />
              ) : (
                <p className={FV}>{data.condoCorpNumber || 'â€”'}</p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* â”€â”€ 2. PURCHASE PRICE â”€â”€ */}
      <section className="mb-10">
        <h2 className={SH}>2. Purchase Price</h2>
        <p className="text-sm text-slate-700 mb-5">
          The total purchase price shall be{' '}
          {isEditable ? (
            <input
              type="number"
              value={data.purchasePrice}
              min={0}
              step={1000}
              onChange={(e) => {
                const price = parseFloat(e.target.value) || 0
                onDataChange?.({
                  ...data,
                  purchasePrice: price,
                  depositAmount: parseFloat((price * 0.05).toFixed(2)),
                  balanceAmount: parseFloat((price * 0.95).toFixed(2)),
                })
              }}
              className="inline-block w-40 border-0 border-b border-slate-400 bg-transparent px-0 py-0.5 text-sm font-bold text-slate-900 focus:outline-none focus:border-slate-700 mx-1 text-center"
            />
          ) : (
            <span className="font-bold text-slate-900">{formatCurrency(data.purchasePrice)}</span>
          )}{' '}
          Canadian Dollars, payable as follows:
        </p>
        <div className="border border-slate-100">
          {/* Header row */}
          <div className="grid grid-cols-3 bg-slate-50 border-b border-slate-100 px-4 py-2">
            <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase col-span-2">Description</p>
            <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase text-right">Amount (CAD)</p>
          </div>
          {/* Deposit row */}
          <div className="grid grid-cols-3 items-center border-b border-slate-100 px-4 py-3">
            <div className="col-span-2">
              <p className="text-sm font-medium text-slate-900">A. Initial Deposit</p>
              <p className="text-xs text-slate-400 mt-0.5">Payable to HomieAI Digital Wallet (Escrow) within 24 hours of acceptance</p>
            </div>
            <div className="text-right">
              {isEditable ? (
                <input
                  type="number"
                  value={data.depositAmount}
                  min={0}
                  step={500}
                  onChange={(e) => {
                    const deposit = parseFloat(e.target.value) || 0
                    onDataChange?.({
                      ...data,
                      depositAmount: deposit,
                      balanceAmount: parseFloat((data.purchasePrice - deposit).toFixed(2)),
                    })
                  }}
                  className="w-36 border-0 border-b border-slate-300 bg-transparent px-0 py-1 text-sm font-bold text-slate-900 text-right focus:outline-none focus:border-slate-600"
                />
              ) : (
                <span className="text-sm font-bold text-slate-900">{formatCurrency(data.depositAmount)}</span>
              )}
            </div>
          </div>
          {/* Balance row */}
          <div className="grid grid-cols-3 items-center px-4 py-3">
            <div className="col-span-2">
              <p className="text-sm font-medium text-slate-900">B. Balance Due on Closing</p>
              <p className="text-xs text-slate-400 mt-0.5">Payable on Closing Date via Bank Draft or Electronic Transfer</p>
            </div>
            <div className="text-right">
              {isEditable ? (
                <input
                  type="number"
                  value={data.balanceAmount}
                  min={0}
                  step={500}
                  onChange={(e) => onDataChange?.({ ...data, balanceAmount: parseFloat(e.target.value) || 0 })}
                  className="w-36 border-0 border-b border-slate-300 bg-transparent px-0 py-1 text-sm font-bold text-slate-900 text-right focus:outline-none focus:border-slate-600"
                />
              ) : (
                <span className="text-sm font-bold text-slate-900">{formatCurrency(data.balanceAmount)}</span>
              )}
            </div>
          </div>
          {/* Total row */}
          <div className="grid grid-cols-3 items-center bg-slate-50 border-t border-slate-200 px-4 py-3">
            <div className="col-span-2">
              <p className="text-sm font-bold text-slate-900">Total Purchase Price</p>
            </div>
            <div className="text-right">
              <span className="text-sm font-bold text-slate-900">{formatCurrency(data.purchasePrice)}</span>
            </div>
          </div>
        </div>
      </section>

      {/* â”€â”€ 3. CONDITIONS â”€â”€ */}
      <section className="mb-10">
        <h2 className={SH}>3. Conditions</h2>
        <p className="text-sm text-slate-700 mb-5">
          This Agreement is conditional upon the following:
        </p>
        <div className="space-y-0 border border-slate-100">
          {/* Financing */}
          <div className="flex items-start gap-4 px-4 py-4 border-b border-slate-100">
            <input
              type="checkbox"
              id="financingCondition"
              checked={data.hasFinancingCondition}
              disabled={!isEditable}
              onChange={(e) => onDataChange?.({ ...data, hasFinancingCondition: e.target.checked })}
              className="w-4 h-4 accent-slate-700 mt-0.5 shrink-0"
            />
            <div className="flex-1">
              <label htmlFor="financingCondition" className="text-sm font-semibold text-slate-900 cursor-pointer">
                Financing Condition
              </label>
              <p className="text-sm text-slate-700 mt-1">
                The Buyer shall have until{' '}
                {isEditable ? (
                  <input
                    type="date"
                    value={data.financingDeadline || ''}
                    onChange={(e) => onDataChange?.({ ...data, financingDeadline: e.target.value })}
                    className="border-0 border-b border-slate-300 bg-transparent px-0 py-0 text-sm font-semibold text-slate-900 focus:outline-none focus:border-slate-600 mx-1"
                  />
                ) : (
                  <span className="font-semibold">{formatDate(data.financingDeadline)}</span>
                )}{' '}
                to obtain satisfactory financing approval. If financing is not obtained by this date, this Agreement shall be null and void.
              </p>
            </div>
          </div>
          {/* Inspection */}
          <div className="flex items-start gap-4 px-4 py-4 border-b border-slate-100">
            <input
              type="checkbox"
              id="inspectionCondition"
              checked={data.hasInspectionCondition}
              disabled={!isEditable}
              onChange={(e) => onDataChange?.({ ...data, hasInspectionCondition: e.target.checked })}
              className="w-4 h-4 accent-slate-700 mt-0.5 shrink-0"
            />
            <div className="flex-1">
              <label htmlFor="inspectionCondition" className="text-sm font-semibold text-slate-900 cursor-pointer">
                Home Inspection Condition
              </label>
              <p className="text-sm text-slate-700 mt-1">
                The Buyer shall have until{' '}
                {isEditable ? (
                  <input
                    type="date"
                    value={data.inspectionDeadline || ''}
                    onChange={(e) => onDataChange?.({ ...data, inspectionDeadline: e.target.value })}
                    className="border-0 border-b border-slate-300 bg-transparent px-0 py-0 text-sm font-semibold text-slate-900 focus:outline-none focus:border-slate-600 mx-1"
                  />
                ) : (
                  <span className="font-semibold">{formatDate(data.inspectionDeadline)}</span>
                )}{' '}
                to conduct a professional home inspection. The Buyer may terminate this Agreement if the inspection reveals material defects.
              </p>
            </div>
          </div>
          {/* Status Certificate */}
          <div className="flex items-start gap-4 px-4 py-4">
            <input
              type="checkbox"
              id="statusCertCondition"
              checked={data.hasStatusCertCondition}
              disabled={!isEditable}
              onChange={(e) => onDataChange?.({ ...data, hasStatusCertCondition: e.target.checked })}
              className="w-4 h-4 accent-slate-700 mt-0.5 shrink-0"
            />
            <div className="flex-1">
              <label htmlFor="statusCertCondition" className="text-sm font-semibold text-slate-900 cursor-pointer">
                Status Certificate (Condo)
              </label>
              <p className="text-sm text-slate-700 mt-1">
                The Seller shall provide a current Status Certificate by{' '}
                {isEditable ? (
                  <input
                    type="date"
                    value={data.statusCertDeadline || ''}
                    onChange={(e) => onDataChange?.({ ...data, statusCertDeadline: e.target.value })}
                    className="border-0 border-b border-slate-300 bg-transparent px-0 py-0 text-sm font-semibold text-slate-900 focus:outline-none focus:border-slate-600 mx-1"
                  />
                ) : (
                  <span className="font-semibold">{formatDate(data.statusCertDeadline)}</span>
                )}
                . The Buyer may terminate if the certificate reveals material issues.
              </p>
            </div>
          </div>
        </div>
      </section>
      {/* â”€â”€ 4. CLOSING DATE & POSSESSION â”€â”€ */}
      <section className="mb-10">
        <h2 className={SH}>4. Closing Date &amp; Possession</h2>
        <div className="grid grid-cols-2 gap-x-8 gap-y-5">
          <div>
            <p className={FL}>Closing Date</p>
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
                className={INP}
              />
            ) : (
              <p className={FV}>{formatDate(data.closingDate)}</p>
            )}
          </div>
          <div>
            <p className={FL}>Possession Date</p>
            {isEditable ? (
              <input
                type="date"
                value={data.possessionDate}
                onChange={(e) => onDataChange?.({ ...data, possessionDate: e.target.value })}
                className={INP}
              />
            ) : (
              <p className={FV}>{formatDate(data.possessionDate)}</p>
            )}
          </div>
          <div>
            <p className={FL}>Requisition Date</p>
            {isEditable ? (
              <input
                type="date"
                value={data.requisitionDate}
                onChange={(e) => onDataChange?.({ ...data, requisitionDate: e.target.value })}
                className={INP}
              />
            ) : (
              <p className={FV}>{formatDate(data.requisitionDate)}</p>
            )}
          </div>
          <div>
            <p className={FL}>Irrevocability Date &amp; Time</p>
            {isEditable ? (
              <div className="flex gap-2">
                <input
                  type="date"
                  value={data.irrevocabilityDate}
                  onChange={(e) => onDataChange?.({ ...data, irrevocabilityDate: e.target.value })}
                  className={INP}
                />
                <input
                  type="time"
                  value={data.irrevocabilityTime}
                  onChange={(e) => onDataChange?.({ ...data, irrevocabilityTime: e.target.value })}
                  className="border-0 border-b border-slate-300 bg-transparent px-0 py-1 text-sm text-slate-900 focus:outline-none focus:border-slate-600 w-28"
                />
              </div>
            ) : (
              <p className={FV}>{formatDate(data.irrevocabilityDate)} at {data.irrevocabilityTime}</p>
            )}
          </div>
        </div>
      </section>

      {/* â”€â”€ 5. CHATTELS INCLUDED â”€â”€ */}
      <section className="mb-10">
        <h2 className={SH}>5. Chattels Included</h2>
        <p className="text-sm text-slate-700 mb-5">
          The following chattels are included in the purchase price:
        </p>
        <div className="grid grid-cols-2 gap-x-8 gap-y-3 mb-5">
          {[
            { id: 'refrigerator', key: 'includesRefrigerator', label: 'Refrigerator' },
            { id: 'stove',        key: 'includesStove',        label: 'Stove / Range' },
            { id: 'dishwasher',   key: 'includesDishwasher',   label: 'Dishwasher' },
            { id: 'washer',       key: 'includesWasher',       label: 'Washer' },
            { id: 'dryer',        key: 'includesDryer',        label: 'Dryer' },
            { id: 'microwave',    key: 'includesMicrowave',    label: 'Microwave' },
            { id: 'allBlinds',    key: 'includesAllBlinds',    label: 'All Blinds & Coverings' },
            { id: 'allCurtains',  key: 'includesAllCurtains',  label: 'All Curtains & Rods' },
          ].map(({ id, key, label }) => (
            <div key={id} className="flex items-center gap-3">
              <input
                type="checkbox"
                id={id}
                checked={(data as any)[key]}
                disabled={!isEditable}
                onChange={(e) => onDataChange?.({ ...data, [key]: e.target.checked })}
                className="w-4 h-4 accent-slate-700 shrink-0"
              />
              <label htmlFor={id} className="text-sm text-slate-900 cursor-pointer">
                {label}
              </label>
            </div>
          ))}
        </div>
        <div>
          <p className={FL}>Additional Chattels</p>
          {isEditable ? (
            <textarea
              value={data.additionalChattels}
              onChange={(e) => onDataChange?.({ ...data, additionalChattels: e.target.value })}
              rows={2}
              placeholder="Describe any additional chattels included..."
              className="w-full border-0 border-b border-slate-300 bg-transparent px-0 py-1 text-sm text-slate-900 focus:outline-none focus:border-slate-600 resize-none"
            />
          ) : (
            <p className="text-sm text-slate-900">{data.additionalChattels || 'â€”'}</p>
          )}
        </div>
      </section>
      {/* â”€â”€ 6. FIXTURES EXCLUDED â”€â”€ */}
      <section className="mb-10">
        <h2 className={SH}>6. Fixtures Excluded</h2>
        <p className="text-sm text-slate-700 mb-5">
          The following fixtures are excluded from the sale:
        </p>
        {isEditable ? (
          <textarea
            value={data.excludedFixtures}
            onChange={(e) => onDataChange?.({ ...data, excludedFixtures: e.target.value })}
            rows={3}
            placeholder="Enter excluded fixtures..."
            className="w-full border-0 border-b border-slate-300 bg-transparent px-0 py-1 text-sm text-slate-900 focus:outline-none focus:border-slate-600 resize-none"
          />
        ) : (
          <p className="text-sm text-slate-900">{data.excludedFixtures || 'No fixtures excluded.'}</p>
        )}
      </section>

      {/* â”€â”€ 7. RENTAL ITEMS â”€â”€ */}
      {data.hasRentalItems && (
        <section className="mb-10">
          <h2 className={SH}>7. Rental Items</h2>
          <div className="grid grid-cols-2 gap-x-8 gap-y-4">
            <div>
              <p className={FL}>Items</p>
              <p className={FV}>{data.rentalItemsList}</p>
            </div>
            <div>
              <p className={FL}>Monthly Cost</p>
              <p className={FV}>{formatCurrency(data.rentalMonthlyCost)}/month</p>
            </div>
          </div>
        </section>
      )}
      {/* â”€â”€ 8. TITLE â”€â”€ */}
      <section className="mb-10">
        <h2 className={SH}>8. Title</h2>
        <p className="text-sm text-slate-700">
          The Seller warrants that they have good and marketable title to the property,
          free and clear of all liens, mortgages, and encumbrances, except as disclosed
          in writing to the Buyer.
        </p>
      </section>

      {/* â”€â”€ 9. HST & PROPERTY TAX â”€â”€ */}
      <section className="mb-10">
        <h2 className={SH}>9. HST &amp; Property Tax</h2>
        <div className="grid grid-cols-2 gap-x-8 gap-y-5 mb-4">
          <div>
            <p className={FL}>Annual Property Tax</p>
            {isEditable ? (
              <input
                type="number"
                value={data.annualPropertyTax || 0}
                min={0}
                step={100}
                onChange={(e) => onDataChange?.({ ...data, annualPropertyTax: parseFloat(e.target.value) || 0 })}
                className={INP}
              />
            ) : (
              <p className={FV}>{formatCurrency(data.annualPropertyTax || 0)}</p>
            )}
          </div>
          <div>
            <p className={FL}>HST Applicable?</p>
            {isEditable ? (
              <select
                value={data.hstApplicable ?? 'no'}
                onChange={(e) => onDataChange?.({ ...data, hstApplicable: e.target.value as 'yes' | 'no' | 'new_build' })}
                className={SEL}
              >
                <option value="no">No â€” Resale Property</option>
                <option value="yes">Yes â€” New Build / Assignment</option>
                <option value="new_build">Yes â€” New Build (HST Rebate May Apply)</option>
              </select>
            ) : (
              <p className={FV}>
                {data.hstApplicable === 'yes' ? 'Yes â€” New Build / Assignment'
                  : data.hstApplicable === 'new_build' ? 'Yes â€” New Build (HST Rebate May Apply)'
                  : 'No â€” Resale Property'}
              </p>
            )}
          </div>
        </div>
        <p className="text-sm text-slate-700">
          Property taxes shall be apportioned as of the Closing Date. The Seller shall be
          responsible for taxes up to and including the day before Closing.
        </p>
      </section>

      {/* â”€â”€ 10. INSURANCE â”€â”€ */}
      <section className="mb-10">
        <h2 className={SH}>10. Insurance</h2>
        <p className="text-sm text-slate-700">
          The Seller shall maintain comprehensive property insurance until the Closing Date.
          The Buyer is responsible for obtaining insurance coverage effective on the Closing Date.
        </p>
      </section>

      {/* â”€â”€ 11. PLANNING ACT COMPLIANCE â”€â”€ */}
      <section className="mb-10">
        <h2 className={SH}>11. Planning Act Compliance</h2>
        <p className="text-sm text-slate-700">
          The Seller represents that the property is in compliance with all applicable
          zoning and planning regulations. The Buyer may terminate if material non-compliance is discovered.
        </p>
      </section>

      {/* â”€â”€ 12. DOCUMENT DELIVERY â”€â”€ */}
      <section className="mb-10">
        <h2 className={SH}>12. Document Delivery</h2>
        <p className="text-sm text-slate-700 mb-5">
          The Seller shall deliver the following documents by{' '}
          {isEditable ? (
            <input
              type="date"
              value={data.documentDate}
              onChange={(e) => onDataChange?.({ ...data, documentDate: e.target.value })}
              className="border-0 border-b border-slate-300 bg-transparent px-0 py-0 text-sm font-semibold text-slate-900 focus:outline-none focus:border-slate-600 mx-1"
            />
          ) : (
            <span className="font-semibold">{formatDate(data.documentDate)}</span>
          )}
          . Check each box to confirm delivery:
        </p>
        <div className="border border-slate-100">
          {[
            { key: 'docDeedDelivered',         label: 'Deed or Transfer of Land' },
            { key: 'docStatusCertDelivered',   label: 'Status Certificate (if applicable)' },
            { key: 'docTaxAssessDelivered',    label: 'Property Tax Assessment' },
            { key: 'docUtilityBillsDelivered', label: 'Utility Bills (last 3 months)' },
            { key: 'docInspectionDelivered',   label: 'Home Inspection Report (if available)' },
            { key: 'docDisclosureDelivered',   label: 'Disclosure Statements' },
          ].map(({ key, label }, i, arr) => (
            <label
              key={key}
              className={`flex items-center gap-3 px-4 py-3 cursor-pointer ${i < arr.length - 1 ? 'border-b border-slate-100' : ''}`}
            >
              <input
                type="checkbox"
                checked={(data as any)[key] || false}
                disabled={!isEditable}
                onChange={(e) => onDataChange?.({ ...data, [key]: e.target.checked })}
                className="w-4 h-4 accent-slate-700 shrink-0"
              />
              <span className="text-sm text-slate-900 flex-1">{label}</span>
              {(data as any)[key] && (
                <span className="text-xs text-slate-500">âœ“</span>
              )}
            </label>
          ))}
        </div>
      </section>

      {/* â”€â”€ 13. DISPUTE RESOLUTION â”€â”€ */}
      <section className="mb-10">
        <h2 className={SH}>13. Dispute Resolution</h2>
        <p className="text-sm text-slate-700">
          Any disputes arising from this Agreement shall be resolved through mediation
          or arbitration as provided by Ontario law. Both parties agree to attempt
          good faith resolution before pursuing legal action.
        </p>
      </section>

      {/* â”€â”€ 14. REPRESENTATIONS & WARRANTIES â”€â”€ */}
      <section className="mb-10">
        <h2 className={SH}>14. Representations &amp; Warranties</h2>
        <div className="space-y-4 text-sm text-slate-600">
          <p>
            <span className="font-bold text-slate-900">Seller's Representations. </span>
            The Seller represents that they have disclosed all known material defects,
            liens, and encumbrances affecting the property.
          </p>
          <p>
            <span className="font-bold text-slate-900">Buyer's Representations. </span>
            The Buyer represents that they have the financial capacity to complete this purchase
            and have conducted appropriate due diligence.
          </p>
        </div>
      </section>

      {/* â”€â”€ 15. HOMIEAI PLATFORM TERMS â”€â”€ */}
      <section className="mb-10">
        <h2 className={SH}>15. HomieAI Platform Terms</h2>
        <p className="text-sm text-slate-700 mb-4">
          This transaction is facilitated through the HomieAI platform. Both parties agree to:
        </p>
        <ul className="space-y-1 text-sm text-slate-600 list-disc list-inside mb-5">
          <li>Use HomieAI's digital wallet for deposit and payment processing</li>
          <li>Comply with HomieAI's terms of service and privacy policy</li>
          <li>Allow HomieAI to facilitate communication between parties</li>
          <li>Pay applicable platform fees as disclosed</li>
        </ul>
        <div className="border border-slate-200 px-4 py-3">
          <p className={FL}>Platform Fee</p>
          <p className={FV}>{formatCurrency(data.platformFee || 0)}</p>
          <p className="text-xs text-slate-400 mt-0.5">1% of purchase price</p>
        </div>
      </section>

      {/* â”€â”€ 16. GENERAL CONDITIONS â”€â”€ */}
      <section className="mb-10">
        <h2 className={SH}>16. General Conditions</h2>
        <div className="space-y-3 text-sm text-slate-600">
          <p>
            <span className="font-bold text-slate-900">Entire Agreement. </span>
            This Agreement constitutes the entire agreement between the parties and supersedes all prior negotiations.
          </p>
          <p>
            <span className="font-bold text-slate-900">Amendments. </span>
            No amendments to this Agreement are valid unless made in writing and signed by all parties.
          </p>
          <p>
            <span className="font-bold text-slate-900">Severability. </span>
            If any provision is found to be invalid, the remaining provisions shall continue in full force and effect.
          </p>
          <p>
            <span className="font-bold text-slate-900">Governing Law. </span>
            This Agreement is governed by the laws of the Province of Ontario, Canada.
          </p>
        </div>
      </section>

      {/* â”€â”€ 17. IRREVOCABILITY â”€â”€ */}
      <section className="mb-10">
        <h2 className={SH}>17. Irrevocability</h2>
        <p className="text-sm text-slate-700">
          This offer shall remain irrevocable until{' '}
          <span className="font-semibold text-slate-900">{formatDate(data.irrevocabilityDate)}</span>
          {' '}at{' '}
          <span className="font-semibold text-slate-900">{data.irrevocabilityTime}</span>
          {' '}Eastern Time. After this time, the offer may be withdrawn by the Buyer without penalty.
        </p>
      </section>

      {/* â”€â”€ 18. SIGNATURES â”€â”€ */}
      <section className="mb-10">
        <h2 className={SH}>18. Signatures</h2>
        <div className="space-y-10">

          {/* Buyer */}
          <div>
            <p className="text-[10px] font-bold tracking-widest text-slate-500 uppercase mb-4">Buyer</p>
            <div className="space-y-5">
              <div>
                <p className={FL}>Signature (type full legal name)</p>
                {isEditable && !data.buyerSignature ? (
                  <input
                    type="text"
                    value={data.buyerSignature || ''}
                    onChange={(e) => onDataChange?.({ ...data, buyerSignature: e.target.value })}
                    placeholder="Type your full legal name to sign"
                    className="w-full border-0 border-b-2 border-slate-400 bg-transparent px-0 py-2 text-base italic text-slate-900 focus:outline-none focus:border-slate-700 placeholder:text-slate-300"
                  />
                ) : (
                  <div className="h-14 border-b-2 border-slate-400 flex items-end pb-1">
                    <span className="text-base italic text-slate-900">{data.buyerSignature || ''}</span>
                    {data.buyerSignature && <span className="ml-3 text-xs text-slate-500">(Signed)</span>}
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-x-8">
                <div>
                  <p className={FL}>Printed Name</p>
                  {isEditable ? (
                    <input type="text" value={data.buyerName}
                      onChange={(e) => onDataChange?.({ ...data, buyerName: e.target.value })}
                      placeholder="Full legal name" className={INP} />
                  ) : (
                    <p className={FV}>{data.buyerName || '________________'}</p>
                  )}
                </div>
                <div>
                  <p className={FL}>Date Signed</p>
                  {isEditable ? (
                    <input type="date"
                      value={data.buyerSignDatetime ? data.buyerSignDatetime.split('T')[0] : ''}
                      onChange={(e) => onDataChange?.({ ...data, buyerSignDatetime: e.target.value })}
                      className={INP} />
                  ) : (
                    <p className={FV}>{data.buyerSignDatetime ? formatDate(data.buyerSignDatetime) : '________________'}</p>
                  )}
                </div>
              </div>
              {data.buyerBiometricVerified && (
                <p className="text-xs text-slate-500">Identity verified</p>
              )}
            </div>
          </div>

          <div className="border-t border-slate-100" />

          {/* Seller */}
          <div>
            <p className="text-[10px] font-bold tracking-widest text-slate-500 uppercase mb-4">Seller</p>
            <div className="space-y-5">
              <div>
                <p className={FL}>Signature (type full legal name)</p>
                {isEditable && !data.sellerSignature ? (
                  <input
                    type="text"
                    value={data.sellerSignature || ''}
                    onChange={(e) => onDataChange?.({ ...data, sellerSignature: e.target.value })}
                    placeholder="Type full legal name to sign"
                    className="w-full border-0 border-b-2 border-slate-400 bg-transparent px-0 py-2 text-base italic text-slate-900 focus:outline-none focus:border-slate-700 placeholder:text-slate-300"
                  />
                ) : (
                  <div className="h-14 border-b-2 border-slate-400 flex items-end pb-1">
                    <span className="text-base italic text-slate-900">{data.sellerSignature || ''}</span>
                    {data.sellerSignature && <span className="ml-3 text-xs text-slate-500">(Signed)</span>}
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-x-8">
                <div>
                  <p className={FL}>Printed Name</p>
                  {isEditable ? (
                    <input type="text" value={data.sellerName}
                      onChange={(e) => onDataChange?.({ ...data, sellerName: e.target.value })}
                      placeholder="Full legal name" className={INP} />
                  ) : (
                    <p className={FV}>{data.sellerName || '________________'}</p>
                  )}
                </div>
                <div>
                  <p className={FL}>Date Signed</p>
                  {isEditable ? (
                    <input type="date"
                      value={data.sellerSignDatetime ? data.sellerSignDatetime.split('T')[0] : ''}
                      onChange={(e) => onDataChange?.({ ...data, sellerSignDatetime: e.target.value })}
                      className={INP} />
                  ) : (
                    <p className={FV}>{data.sellerSignDatetime ? formatDate(data.sellerSignDatetime) : '________________'}</p>
                  )}
                </div>
              </div>
              {data.sellerBiometricVerified && (
                <p className="text-xs text-slate-500">Identity verified</p>
              )}
            </div>
          </div>

          <div className="border-t border-slate-100" />

          {/* Lawyer */}
          <div>
            <p className="text-[10px] font-bold tracking-widest text-slate-500 uppercase mb-4">Lawyer / Representative</p>
            <div className="space-y-5">
              <div>
                <p className={FL}>Signature (type full legal name)</p>
                {isEditable && !data.lawyerSignature ? (
                  <input
                    type="text"
                    value={data.lawyerSignature || ''}
                    onChange={(e) => onDataChange?.({ ...data, lawyerSignature: e.target.value })}
                    placeholder="Type full legal name to sign"
                    className="w-full border-0 border-b-2 border-slate-400 bg-transparent px-0 py-2 text-base italic text-slate-900 focus:outline-none focus:border-slate-700 placeholder:text-slate-300"
                  />
                ) : (
                  <div className="h-14 border-b-2 border-slate-400 flex items-end pb-1">
                    <span className="text-base italic text-slate-900">{data.lawyerSignature || ''}</span>
                    {data.lawyerSignature && <span className="ml-3 text-xs text-slate-500">(Signed)</span>}
                  </div>
                )}
              </div>
              <div className="grid grid-cols-3 gap-x-8">
                <div>
                  <p className={FL}>Printed Name</p>
                  {isEditable ? (
                    <input type="text" value={data.lawyerName}
                      onChange={(e) => onDataChange?.({ ...data, lawyerName: e.target.value })}
                      placeholder="Full legal name" className={INP} />
                  ) : (
                    <p className={FV}>{data.lawyerName || '________________'}</p>
                  )}
                </div>
                <div>
                  <p className={FL}>License Number</p>
                  {isEditable ? (
                    <input type="text" value={data.lawyerLicense}
                      onChange={(e) => onDataChange?.({ ...data, lawyerLicense: e.target.value })}
                      placeholder="License #" className={INP} />
                  ) : (
                    <p className={FV}>{data.lawyerLicense || '________________'}</p>
                  )}
                </div>
                <div>
                  <p className={FL}>Date Signed</p>
                  {isEditable ? (
                    <input type="date"
                      value={data.lawyerSignDatetime ? data.lawyerSignDatetime.split('T')[0] : ''}
                      onChange={(e) => onDataChange?.({ ...data, lawyerSignDatetime: e.target.value })}
                      className={INP} />
                  ) : (
                    <p className={FV}>{data.lawyerSignDatetime ? formatDate(data.lawyerSignDatetime) : '________________'}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* â”€â”€ Footer Seal â”€â”€ */}
      <div className="border-t-2 border-slate-900 pt-6 mt-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="w-7 h-7 border-2 border-slate-400 rounded-full flex items-center justify-center">
            <span className="text-slate-600 font-bold text-xs leading-none">H</span>
          </div>
          <p className="text-xs font-bold tracking-[0.25em] text-slate-500 uppercase">HomieAI Digital Seal</p>
        </div>
        <p className="text-[10px] text-slate-400 mb-1">
          Document Hash: {data.documentHash || 'Pending â€” document not yet finalized'}
        </p>
        <p className="text-[10px] text-slate-400 max-w-2xl mx-auto leading-relaxed">
          This Agreement of Purchase and Sale has been generated and facilitated through the HomieAI platform.
          All parties acknowledge that they have read, understood, and agree to be bound by the terms and conditions herein.
        </p>
      </div>

    </div>
  )
}
