import { useState, useRef } from 'react'
import { supabase } from '@/integrations/supabase/client-simple'
import { useNavigate } from 'react-router-dom'

interface FormState {
  step: number
  // Step 1: Basic Info & Pricing
  productName: string
  category: string
  commercialPurpose: string
  tagline: string
  description: string
  pricingMode: 'fixed' | 'quote' | 'both'
  basePrice: string
  pricePerSqm: string
  includedInPrice: string
  notIncluded: string
  // Step 2: Specifications
  standardSize: string
  floorAreaSqm: string
  numFloors: string
  ceilingHeight: string
  frameMaterial: string
  wallPanelMaterial: string
  roofType: string
  numModules: string
  assemblyTime: string
  bedrooms: string
  bathrooms: string
  openPlanLiving: string
  kitchenIncluded: string
  laundrySpace: string
  insulationRValue: string
  climateSuitability: string
  windRating: string
  snowLoad: string
  fireRating: string
  energyRating: string
  buildingCodeCompliance: string
  csaCertified: string
  shippingPort: string
  leadTime: string
  shippingMethod: string
  numContainers: string
  shipsTo: string
  // Step 3: Customization
  customizationOptions: Record<string, any>
  globalAddons: Array<{ name: string; price: string; description: string }>
  // Step 4: Media
  photos: File[]
  photoPreviews: string[]
  primaryPhotoIndex: number
  documents: Record<string, File | null>
  badgeText: string
  badgeStyle: string
}

const CATEGORIES = {
  'Categories': [
    'Pre-fabricated Houses',
    'Cabinets'
  ]
}

export default function ConstructionProductNew() {
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [form, setForm] = useState<FormState>({
    step: 1,
    productName: '',
    category: '',
    commercialPurpose: '',
    tagline: '',
    description: '',
    pricingMode: 'fixed',
    basePrice: '',
    pricePerSqm: '',
    includedInPrice: '',
    notIncluded: '',
    standardSize: '40ft',
    floorAreaSqm: '',
    numFloors: '1',
    ceilingHeight: '',
    frameMaterial: 'Steel',
    wallPanelMaterial: 'SIP Panel',
    roofType: 'Flat',
    numModules: '',
    assemblyTime: '',
    bedrooms: 'Studio',
    bathrooms: '1',
    openPlanLiving: 'Yes',
    kitchenIncluded: 'Yes basic',
    laundrySpace: 'No',
    insulationRValue: '',
    climateSuitability: 'Mild',
    windRating: '',
    snowLoad: '',
    fireRating: 'Standard',
    energyRating: '',
    buildingCodeCompliance: 'Compliant',
    csaCertified: 'No',
    shippingPort: '',
    leadTime: '',
    shippingMethod: 'Flat pack',
    numContainers: '',
    shipsTo: 'Canada only',
    customizationOptions: {},
    globalAddons: [],
    photos: [],
    photoPreviews: [],
    primaryPhotoIndex: 0,
    documents: {
      brochure: null,
      specifications: null,
      floorPlan: null,
      buildingCode: null,
      installationGuide: null
    },
    badgeText: '',
    badgeStyle: 'Green'
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const updateForm = (field: keyof FormState, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const handleNext = () => {
    if (form.step < 5) {
      setForm(prev => ({ ...prev, step: prev.step + 1 }))
    }
  }

  const handleBack = () => {
    if (form.step > 1) {
      setForm(prev => ({ ...prev, step: prev.step - 1 }))
    }
  }

  const goToStep = (stepNum: number) => {
    if (stepNum <= form.step) {
      setForm(prev => ({ ...prev, step: stepNum }))
    }
  }

  const handlePublish = async () => {
    try {
      setLoading(true)
      setError('')

      // Validate required fields
      if (!form.productName || !form.category || !form.description || !form.basePrice) {
        setError('Please fill in all required fields (Product Name, Category, Description, Base Price)')
        setLoading(false)
        return
      }

      // Get current user
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user?.id) {
        setError('You must be logged in to publish a product')
        setLoading(false)
        return
      }

      // Map category to product_type (must match database constraint)
      const categoryMap: Record<string, string> = {
        'Pre-fabricated Houses': 'house',
        'Cabinets': 'cabinet'
      }
      const productType = categoryMap[form.category] || 'modular'

      // Create product first (without images)
      const productData = {
        supplier_id: session.user.id,
        title: form.productName,
        slug: form.productName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Date.now(),
        product_type: productType,
        description: form.description,
        price_cad: parseFloat(form.basePrice) || 0,
        bedrooms: form.bedrooms || 'Studio',
        size_ft: form.standardSize || '40ft',
        lead_time: form.leadTime || '',
        badge_label: form.badgeText || null,
        status: 'live'
      }

      const { data: product, error: productError } = await supabase
        .from('construction_products')
        .insert([productData])
        .select()

      if (productError) {
        throw new Error(`Failed to create product: ${productError.message}`)
      }

      if (!product || product.length === 0) {
        throw new Error('Product was created but no data returned')
      }

      // Redirect immediately for better UX
      setLoading(false)
      
      // Upload images in background (don't wait for completion)
      if (form.photos && form.photos.length > 0) {
        // Parallelize image uploads
        const uploadPromises = form.photos.map(async (photo, i) => {
          const filename = `products/${session.user.id}/${Date.now()}-${i}-${photo.name}`
          
          try {
            const { error: uploadError } = await supabase.storage
              .from('construction-images')
              .upload(filename, photo)
            
            if (uploadError) return null

            const { data: urlData } = supabase.storage
              .from('construction-images')
              .getPublicUrl(filename)

            return {
              product_id: product[0].id,
              storage_path: filename,
              public_url: urlData.publicUrl,
              is_primary: i === form.primaryPhotoIndex
            }
          } catch (err) {
            return null
          }
        })

        // Wait for all uploads to complete
        const results = await Promise.all(uploadPromises)
        const imageInserts = results.filter(Boolean)

        if (imageInserts.length > 0) {
          await supabase
            .from('construction_product_images')
            .insert(imageInserts)
        }
      }
      
      // Redirect after a short delay to ensure everything is saved
      setTimeout(() => {
        navigate('/construction/dashboard/products')
      }, 500)
    } catch (err: any) {
      setError(err.message || 'Failed to publish product. Please try again.')
      setLoading(false)
    }
  }

  // Step 1: Basic Info & Pricing
  const renderStep1 = () => (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
      {/* Card 1: Product Identity */}
      <div style={{
        background: 'white',
        padding: 24,
        borderRadius: 12,
        border: '1px solid #e5e7eb',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
      }}>
        <h3 style={{ margin: '0 0 20px 0', color: '#1a1f2e', fontFamily: "'Sora', sans-serif", fontSize: 20, fontWeight: 700 }}>
          Product Identity
        </h3>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#1a1f2e', marginBottom: 8 }}>
            Product Name *
          </label>
          <input
            type="text"
            value={form.productName}
            onChange={e => updateForm('productName', e.target.value)}
            placeholder="e.g., Expandable 40ft Home"
            style={{
              width: '100%',
              padding: '12px 14px',
              border: '1px solid #e5e7eb',
              borderRadius: 8,
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 15,
              transition: 'all 0.2s'
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = '#FF6B35'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(255, 107, 53, 0.1)' }}
            onBlur={(e) => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.boxShadow = 'none' }}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#1a1f2e', marginBottom: 8 }}>
            Category *
          </label>
          <select
            value={form.category}
            onChange={e => updateForm('category', e.target.value)}
            style={{
              width: '100%',
              padding: '12px 14px',
              border: '1px solid #e5e7eb',
              borderRadius: 8,
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 15,
              transition: 'all 0.2s'
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = '#FF6B35'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(255, 107, 53, 0.1)' }}
            onBlur={(e) => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.boxShadow = 'none' }}
          >
            <option value="">Select category</option>
            {Object.entries(CATEGORIES).map(([group, options]) => (
              <optgroup key={group} label={group}>
                {options.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        {form.category.includes('Commercial') && (
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#1a1f2e', marginBottom: 8 }}>
              Commercial Purpose
            </label>
            <input
              type="text"
              value={form.commercialPurpose}
              onChange={e => updateForm('commercialPurpose', e.target.value)}
              placeholder="e.g., Office, Retail, Warehouse"
              style={{
                width: '100%',
                padding: '12px 14px',
                border: '1px solid #e5e7eb',
                borderRadius: 8,
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 15,
                transition: 'all 0.2s'
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = '#FF6B35'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(255, 107, 53, 0.1)' }}
              onBlur={(e) => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.boxShadow = 'none' }}
            />
          </div>
        )}

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#1a1f2e', marginBottom: 8 }}>
            Tagline (optional)
          </label>
          <input
            type="text"
            value={form.tagline}
            onChange={e => updateForm('tagline', e.target.value)}
            placeholder="Short description for listing card"
            style={{
              width: '100%',
              padding: '12px 14px',
              border: '1px solid #e5e7eb',
              borderRadius: 8,
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 15,
              transition: 'all 0.2s'
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = '#FF6B35'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(255, 107, 53, 0.1)' }}
            onBlur={(e) => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.boxShadow = 'none' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#1a1f2e', marginBottom: 8 }}>
            Full Description *
          </label>
          <textarea
            value={form.description}
            onChange={e => updateForm('description', e.target.value)}
            placeholder="Detailed description of your product"
            rows={4}
            style={{
              width: '100%',
              padding: '12px 14px',
              border: '1px solid #e5e7eb',
              borderRadius: 8,
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 15,
              resize: 'vertical',
              transition: 'all 0.2s'
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = '#FF6B35'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(255, 107, 53, 0.1)' }}
            onBlur={(e) => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.boxShadow = 'none' }}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#1a1f2e', marginBottom: 8 }}>
            Size (optional)
          </label>
          <select
            value={form.standardSize}
            onChange={e => updateForm('standardSize', e.target.value)}
            style={{
              width: '100%',
              padding: '12px 14px',
              border: '1px solid #e5e7eb',
              borderRadius: 8,
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 15,
              transition: 'all 0.2s'
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = '#FF6B35'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(255, 107, 53, 0.1)' }}
            onBlur={(e) => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.boxShadow = 'none' }}
          >
            <option value="20ft">20ft</option>
            <option value="40ft">40ft</option>
            <option value="60ft">60ft</option>
            <option value="custom">Custom</option>
          </select>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#1a1f2e', marginBottom: 8 }}>
            Bedrooms (optional)
          </label>
          <select
            value={form.bedrooms}
            onChange={e => updateForm('bedrooms', e.target.value)}
            style={{
              width: '100%',
              padding: '12px 14px',
              border: '1px solid #e5e7eb',
              borderRadius: 8,
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 15,
              transition: 'all 0.2s'
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = '#FF6B35'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(255, 107, 53, 0.1)' }}
            onBlur={(e) => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.boxShadow = 'none' }}
          >
            <option value="Studio">Studio</option>
            <option value="1">1 Bedroom</option>
            <option value="2">2 Bedrooms</option>
            <option value="3">3 Bedrooms</option>
            <option value="4">4 Bedrooms</option>
            <option value="5+">5+ Bedrooms</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#1a1f2e', marginBottom: 8 }}>
            Lead Time (optional)
          </label>
          <input
            type="text"
            value={form.leadTime}
            onChange={e => updateForm('leadTime', e.target.value)}
            placeholder="e.g., 8-12 weeks, 3 months"
            style={{
              width: '100%',
              padding: '12px 14px',
              border: '1px solid #e5e7eb',
              borderRadius: 8,
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 15,
              transition: 'all 0.2s'
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = '#FF6B35'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(255, 107, 53, 0.1)' }}
            onBlur={(e) => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.boxShadow = 'none' }}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#1a1f2e', marginBottom: 8 }}>
            Badge Label (optional)
          </label>
          <input
            type="text"
            value={form.badgeText}
            onChange={e => updateForm('badgeText', e.target.value)}
            placeholder="e.g., In Stock, New Arrival"
            style={{
              width: '100%',
              padding: '12px 14px',
              border: '1px solid #e5e7eb',
              borderRadius: 8,
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 15,
              transition: 'all 0.2s'
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = '#FF6B35'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(255, 107, 53, 0.1)' }}
            onBlur={(e) => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.boxShadow = 'none' }}
          />
          <p style={{ fontSize: 13, color: '#6b7280', marginTop: 6 }}>
            Shows on product card (e.g., "In Stock", "New")
          </p>
        </div>
      </div>

      {/* Card 2: Pricing Mode */}
      <div style={{
        background: 'white',
        padding: 24,
        borderRadius: 12,
        border: '1px solid #e5e7eb',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
      }}>
        <h3 style={{ margin: '0 0 20px 0', color: '#1a1f2e', fontFamily: "'Sora', sans-serif", fontSize: 20, fontWeight: 700 }}>
          Pricing Mode
        </h3>

        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {['fixed', 'quote', 'both'].map(mode => (
            <button
              key={mode}
              onClick={() => updateForm('pricingMode', mode as any)}
              style={{
                flex: 1,
                padding: '12px 14px',
                background: form.pricingMode === mode ? 'linear-gradient(135deg, #FF6B35 0%, #8B5CF6 100%)' : '#f9fafb',
                color: form.pricingMode === mode ? 'white' : '#374151',
                border: form.pricingMode === mode ? 'none' : '1px solid #e5e7eb',
                borderRadius: 8,
                fontWeight: 600,
                fontSize: 13,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {mode === 'fixed' ? 'Fixed Price' : mode === 'quote' ? 'Quote Only' : 'Both'}
            </button>
          ))}
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#1a1f2e', marginBottom: 8 }}>
            Base Price CAD *
          </label>
          <input
            type="number"
            value={form.basePrice}
            onChange={e => updateForm('basePrice', e.target.value)}
            placeholder="0.00"
            min="0"
            step="0.01"
            style={{
              width: '100%',
              padding: '12px 14px',
              border: '1px solid #e5e7eb',
              borderRadius: 8,
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 15,
              transition: 'all 0.2s'
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = '#FF6B35'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(255, 107, 53, 0.1)' }}
            onBlur={(e) => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.boxShadow = 'none' }}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#1a1f2e', marginBottom: 8 }}>
            Price per sqm (optional)
          </label>
          <input
            type="number"
            value={form.pricePerSqm}
            onChange={e => updateForm('pricePerSqm', e.target.value)}
            placeholder="For custom sizes"
            min="0"
            step="0.01"
            style={{
              width: '100%',
              padding: '12px 14px',
              border: '1px solid #e5e7eb',
              borderRadius: 8,
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 15,
              transition: 'all 0.2s'
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = '#FF6B35'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(255, 107, 53, 0.1)' }}
            onBlur={(e) => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.boxShadow = 'none' }}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#1a1f2e', marginBottom: 8 }}>
            What is included in base price
          </label>
          <textarea
            value={form.includedInPrice}
            onChange={e => updateForm('includedInPrice', e.target.value)}
            placeholder="e.g., Delivery, Installation, Warranty"
            rows={2}
            style={{
              width: '100%',
              padding: '12px 14px',
              border: '1px solid #e5e7eb',
              borderRadius: 8,
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 15,
              resize: 'vertical',
              transition: 'all 0.2s'
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = '#FF6B35'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(255, 107, 53, 0.1)' }}
            onBlur={(e) => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.boxShadow = 'none' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#1a1f2e', marginBottom: 8 }}>
            What is NOT included
          </label>
          <textarea
            value={form.notIncluded}
            onChange={e => updateForm('notIncluded', e.target.value)}
            placeholder="e.g., Site preparation, Utilities connection"
            rows={2}
            style={{
              width: '100%',
              padding: '12px 14px',
              border: '1px solid #e5e7eb',
              borderRadius: 8,
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 15,
              resize: 'vertical',
              transition: 'all 0.2s'
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = '#FF6B35'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(255, 107, 53, 0.1)' }}
            onBlur={(e) => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.boxShadow = 'none' }}
          />
        </div>
      </div>
    </div>
  )

  // Progress Bar
  const renderProgressBar = () => (
    <div style={{ marginBottom: 40 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        {[1, 2, 3, 4, 5].map((step, idx) => (
          <div key={step} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            <button
              onClick={() => goToStep(step)}
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                border: 'none',
                background: form.step > step ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : form.step === step ? 'linear-gradient(135deg, #FF6B35 0%, #8B5CF6 100%)' : '#e5e7eb',
                color: form.step > step || form.step === step ? 'white' : '#9ca3af',
                fontWeight: 700,
                fontSize: 16,
                cursor: form.step >= step ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s'
              }}
            >
              {form.step > step ? '✓' : step}
            </button>
            {idx < 4 && (
              <div style={{
                flex: 1,
                height: 2,
                background: form.step > step + 1 ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : '#e5e7eb',
                margin: '0 8px',
                transition: 'all 0.2s'
              }} />
            )}
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#6b7280', fontWeight: 500 }}>
        <span>Basic Info</span>
        <span>Specs</span>
        <span>Customize</span>
        <span>Media</span>
        <span>Review</span>
      </div>
    </div>
  )

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", minHeight: '100vh', background: '#f8f9fa', padding: '40px' }}>
      <link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700&family=DM+Sans:wght@400;500&display=swap" rel="stylesheet" />

      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ margin: '0 0 8px 0', fontSize: 32, fontWeight: 700, background: 'linear-gradient(135deg, #FF6B35 0%, #8B5CF6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', fontFamily: "'Sora', sans-serif" }}>
            Add New Product
          </h1>
          <p style={{ margin: 0, color: '#6b7280', fontSize: 15, fontWeight: 500 }}>
            Step {form.step} of 5 - Complete all steps to publish your product
          </p>
        </div>

        {renderProgressBar()}

        {error && (
          <div style={{
            background: '#fee2e2',
            color: '#991b1b',
            padding: 16,
            borderRadius: 8,
            marginBottom: 24,
            fontSize: 14,
            border: '1px solid #fecaca'
          }}>
            {error}
          </div>
        )}

        {form.step === 1 && renderStep1()}

        {/* Step 2: Specifications */}
        {form.step === 2 && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            {/* Size & Structure */}
            <div style={{ background: 'white', padding: 24, borderRadius: 12, border: '1px solid #e8e4dc' }}>
              <h3 style={{ margin: '0 0 20px 0', color: '#1a2332', fontFamily: "'Sora', sans-serif" }}>Size & Structure</h3>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#1a2332', marginBottom: 6 }}>Standard Size</label>
                <select value={form.standardSize} onChange={e => updateForm('standardSize', e.target.value)} style={{ width: '100%', padding: '10px 12px', border: '1px solid #e8e4dc', borderRadius: 8, fontFamily: "'DM Sans', sans-serif", fontSize: 14 }}>
                  <option value="20ft">20ft</option>
                  <option value="40ft">40ft</option>
                  <option value="60ft">60ft</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#1a2332', marginBottom: 6 }}>Floor Area sqm *</label>
                <input type="number" value={form.floorAreaSqm} onChange={e => updateForm('floorAreaSqm', e.target.value)} min="0" step="0.1" style={{ width: '100%', padding: '10px 12px', border: '1px solid #e8e4dc', borderRadius: 8, fontFamily: "'DM Sans', sans-serif", fontSize: 14 }} />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#1a2332', marginBottom: 6 }}>Number of Floors</label>
                <select value={form.numFloors} onChange={e => updateForm('numFloors', e.target.value)} style={{ width: '100%', padding: '10px 12px', border: '1px solid #e8e4dc', borderRadius: 8, fontFamily: "'DM Sans', sans-serif", fontSize: 14 }}>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3+">3+</option>
                </select>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#1a2332', marginBottom: 6 }}>Ceiling Height (m)</label>
                <input type="number" value={form.ceilingHeight} onChange={e => updateForm('ceilingHeight', e.target.value)} min="0" step="0.1" style={{ width: '100%', padding: '10px 12px', border: '1px solid #e8e4dc', borderRadius: 8, fontFamily: "'DM Sans', sans-serif", fontSize: 14 }} />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#1a2332', marginBottom: 6 }}>Frame Material</label>
                <select value={form.frameMaterial} onChange={e => updateForm('frameMaterial', e.target.value)} style={{ width: '100%', padding: '10px 12px', border: '1px solid #e8e4dc', borderRadius: 8, fontFamily: "'DM Sans', sans-serif", fontSize: 14 }}>
                  <option value="Steel">Steel</option>
                  <option value="Aluminium">Aluminium</option>
                  <option value="Timber">Timber</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#1a2332', marginBottom: 6 }}>Wall Panel Material</label>
                <select value={form.wallPanelMaterial} onChange={e => updateForm('wallPanelMaterial', e.target.value)} style={{ width: '100%', padding: '10px 12px', border: '1px solid #e8e4dc', borderRadius: 8, fontFamily: "'DM Sans', sans-serif", fontSize: 14 }}>
                  <option value="SIP Panel">SIP Panel</option>
                  <option value="Sandwich Panel">Sandwich Panel</option>
                  <option value="Concrete">Concrete</option>
                  <option value="Timber">Timber</option>
                </select>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#1a2332', marginBottom: 6 }}>Roof Type</label>
                <select value={form.roofType} onChange={e => updateForm('roofType', e.target.value)} style={{ width: '100%', padding: '10px 12px', border: '1px solid #e8e4dc', borderRadius: 8, fontFamily: "'DM Sans', sans-serif", fontSize: 14 }}>
                  <option value="Flat">Flat</option>
                  <option value="Gable">Gable</option>
                  <option value="Skillion">Skillion</option>
                  <option value="Custom">Custom</option>
                </select>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#1a2332', marginBottom: 6 }}>Number of Modules</label>
                <input type="number" value={form.numModules} onChange={e => updateForm('numModules', e.target.value)} min="0" style={{ width: '100%', padding: '10px 12px', border: '1px solid #e8e4dc', borderRadius: 8, fontFamily: "'DM Sans', sans-serif", fontSize: 14 }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#1a2332', marginBottom: 6 }}>Assembly Time (days)</label>
                <input type="number" value={form.assemblyTime} onChange={e => updateForm('assemblyTime', e.target.value)} min="0" style={{ width: '100%', padding: '10px 12px', border: '1px solid #e8e4dc', borderRadius: 8, fontFamily: "'DM Sans', sans-serif", fontSize: 14 }} />
              </div>
            </div>

            {/* Rooms & Layout (hidden for Commercial) */}
            {!form.category.includes('Commercial') && (
              <div style={{ background: 'white', padding: 24, borderRadius: 12, border: '1px solid #e8e4dc' }}>
                <h3 style={{ margin: '0 0 20px 0', color: '#1a2332', fontFamily: "'Sora', sans-serif" }}>Rooms & Layout</h3>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#1a2332', marginBottom: 6 }}>Bedrooms</label>
                  <select value={form.bedrooms} onChange={e => updateForm('bedrooms', e.target.value)} style={{ width: '100%', padding: '10px 12px', border: '1px solid #e8e4dc', borderRadius: 8, fontFamily: "'DM Sans', sans-serif", fontSize: 14 }}>
                    <option value="Studio">Studio</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4+">4+</option>
                  </select>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#1a2332', marginBottom: 6 }}>Bathrooms</label>
                  <select value={form.bathrooms} onChange={e => updateForm('bathrooms', e.target.value)} style={{ width: '100%', padding: '10px 12px', border: '1px solid #e8e4dc', borderRadius: 8, fontFamily: "'DM Sans', sans-serif", fontSize: 14 }}>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3+">3+</option>
                  </select>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#1a2332', marginBottom: 6 }}>Open Plan Living</label>
                  <select value={form.openPlanLiving} onChange={e => updateForm('openPlanLiving', e.target.value)} style={{ width: '100%', padding: '10px 12px', border: '1px solid #e8e4dc', borderRadius: 8, fontFamily: "'DM Sans', sans-serif", fontSize: 14 }}>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#1a2332', marginBottom: 6 }}>Kitchen Included</label>
                  <select value={form.kitchenIncluded} onChange={e => updateForm('kitchenIncluded', e.target.value)} style={{ width: '100%', padding: '10px 12px', border: '1px solid #e8e4dc', borderRadius: 8, fontFamily: "'DM Sans', sans-serif", fontSize: 14 }}>
                    <option value="Yes basic">Yes basic</option>
                    <option value="Yes full">Yes full</option>
                    <option value="No">No</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#1a2332', marginBottom: 6 }}>Laundry Space</label>
                  <select value={form.laundrySpace} onChange={e => updateForm('laundrySpace', e.target.value)} style={{ width: '100%', padding: '10px 12px', border: '1px solid #e8e4dc', borderRadius: 8, fontFamily: "'DM Sans', sans-serif", fontSize: 14 }}>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
              </div>
            )}

            {/* Performance & Certifications */}
            <div style={{ background: 'white', padding: 24, borderRadius: 12, border: '1px solid #e8e4dc' }}>
              <h3 style={{ margin: '0 0 20px 0', color: '#1a2332', fontFamily: "'Sora', sans-serif" }}>Performance & Certifications</h3>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#1a2332', marginBottom: 6 }}>Insulation R-value</label>
                <input type="text" value={form.insulationRValue} onChange={e => updateForm('insulationRValue', e.target.value)} placeholder="e.g., R-20" style={{ width: '100%', padding: '10px 12px', border: '1px solid #e8e4dc', borderRadius: 8, fontFamily: "'DM Sans', sans-serif", fontSize: 14 }} />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#1a2332', marginBottom: 6 }}>Climate Suitability</label>
                <select value={form.climateSuitability} onChange={e => updateForm('climateSuitability', e.target.value)} style={{ width: '100%', padding: '10px 12px', border: '1px solid #e8e4dc', borderRadius: 8, fontFamily: "'DM Sans', sans-serif", fontSize: 14 }}>
                  <option value="Mild">Mild</option>
                  <option value="Cold">Cold</option>
                  <option value="Arctic">Arctic</option>
                </select>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#1a2332', marginBottom: 6 }}>Wind Rating (km/h)</label>
                <input type="number" value={form.windRating} onChange={e => updateForm('windRating', e.target.value)} min="0" style={{ width: '100%', padding: '10px 12px', border: '1px solid #e8e4dc', borderRadius: 8, fontFamily: "'DM Sans', sans-serif", fontSize: 14 }} />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#1a2332', marginBottom: 6 }}>Snow Load (kPa)</label>
                <input type="number" value={form.snowLoad} onChange={e => updateForm('snowLoad', e.target.value)} min="0" style={{ width: '100%', padding: '10px 12px', border: '1px solid #e8e4dc', borderRadius: 8, fontFamily: "'DM Sans', sans-serif", fontSize: 14 }} />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#1a2332', marginBottom: 6 }}>Fire Rating</label>
                <select value={form.fireRating} onChange={e => updateForm('fireRating', e.target.value)} style={{ width: '100%', padding: '10px 12px', border: '1px solid #e8e4dc', borderRadius: 8, fontFamily: "'DM Sans', sans-serif", fontSize: 14 }}>
                  <option value="Standard">Standard</option>
                  <option value="1 hour">1 hour</option>
                  <option value="2 hour">2 hour</option>
                </select>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#1a2332', marginBottom: 6 }}>Energy Rating</label>
                <input type="text" value={form.energyRating} onChange={e => updateForm('energyRating', e.target.value)} placeholder="e.g., EnerGuide 80" style={{ width: '100%', padding: '10px 12px', border: '1px solid #e8e4dc', borderRadius: 8, fontFamily: "'DM Sans', sans-serif", fontSize: 14 }} />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#1a2332', marginBottom: 6 }}>Building Code Compliance</label>
                <select value={form.buildingCodeCompliance} onChange={e => updateForm('buildingCodeCompliance', e.target.value)} style={{ width: '100%', padding: '10px 12px', border: '1px solid #e8e4dc', borderRadius: 8, fontFamily: "'DM Sans', sans-serif", fontSize: 14 }}>
                  <option value="Compliant">Compliant</option>
                  <option value="In progress">In progress</option>
                  <option value="Not applicable">Not applicable</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#1a2332', marginBottom: 6 }}>CSA Certified</label>
                <select value={form.csaCertified} onChange={e => updateForm('csaCertified', e.target.value)} style={{ width: '100%', padding: '10px 12px', border: '1px solid #e8e4dc', borderRadius: 8, fontFamily: "'DM Sans', sans-serif", fontSize: 14 }}>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                  <option value="In progress">In progress</option>
                </select>
              </div>
            </div>

            {/* Shipping & Delivery */}
            <div style={{ background: 'white', padding: 24, borderRadius: 12, border: '1px solid #e8e4dc' }}>
              <h3 style={{ margin: '0 0 20px 0', color: '#1a2332', fontFamily: "'Sora', sans-serif" }}>Shipping & Delivery</h3>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#1a2332', marginBottom: 6 }}>Shipping Port *</label>
                <input type="text" value={form.shippingPort} onChange={e => updateForm('shippingPort', e.target.value)} placeholder="e.g., XinGang, China" style={{ width: '100%', padding: '10px 12px', border: '1px solid #e8e4dc', borderRadius: 8, fontFamily: "'DM Sans', sans-serif", fontSize: 14 }} />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#1a2332', marginBottom: 6 }}>Lead Time *</label>
                <input type="text" value={form.leadTime} onChange={e => updateForm('leadTime', e.target.value)} placeholder="e.g., 3-6 weeks" style={{ width: '100%', padding: '10px 12px', border: '1px solid #e8e4dc', borderRadius: 8, fontFamily: "'DM Sans', sans-serif", fontSize: 14 }} />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#1a2332', marginBottom: 6 }}>Shipping Method</label>
                <select value={form.shippingMethod} onChange={e => updateForm('shippingMethod', e.target.value)} style={{ width: '100%', padding: '10px 12px', border: '1px solid #e8e4dc', borderRadius: 8, fontFamily: "'DM Sans', sans-serif", fontSize: 14 }}>
                  <option value="Flat pack">Flat pack</option>
                  <option value="Fully assembled">Fully assembled</option>
                  <option value="Modular sections">Modular sections</option>
                </select>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#1a2332', marginBottom: 6 }}>Number of Containers</label>
                <input type="number" value={form.numContainers} onChange={e => updateForm('numContainers', e.target.value)} min="0" style={{ width: '100%', padding: '10px 12px', border: '1px solid #e8e4dc', borderRadius: 8, fontFamily: "'DM Sans', sans-serif", fontSize: 14 }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#1a2332', marginBottom: 6 }}>Ships To</label>
                <select value={form.shipsTo} onChange={e => updateForm('shipsTo', e.target.value)} style={{ width: '100%', padding: '10px 12px', border: '1px solid #e8e4dc', borderRadius: 8, fontFamily: "'DM Sans', sans-serif", fontSize: 14 }}>
                  <option value="Canada only">Canada only</option>
                  <option value="Canada + USA">Canada + USA</option>
                  <option value="Worldwide">Worldwide</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Customization */}
        {form.step === 3 && (
          <div style={{ background: 'white', padding: 24, borderRadius: 12, border: '1px solid #e8e4dc' }}>
            <h3 style={{ margin: '0 0 20px 0', color: '#1a2332', fontFamily: "'Sora', sans-serif" }}>Customization Options</h3>
            <p style={{ color: '#64748b', fontSize: 14, marginBottom: 20 }}>Configure customization options for buyers. Leave price blank for quote-based pricing.</p>
            <div style={{ padding: 12, background: '#f5f3ef', borderRadius: 8, color: '#64748b', fontSize: 13, marginBottom: 20 }}>
              Global add-ons will be configured in the next section and apply to all your products.
            </div>
          </div>
        )}

        {/* Step 4: Media */}
        {form.step === 4 && (
          <div style={{ background: 'white', padding: 24, borderRadius: 12, border: '1px solid #e8e4dc' }}>
            <h3 style={{ margin: '0 0 20px 0', color: '#1a2332', fontFamily: "'Sora', sans-serif" }}>Media</h3>
            <p style={{ color: '#64748b', fontSize: 14, marginBottom: 20 }}>Upload photos and documents for your product.</p>
          </div>
        )}

        {/* Step 5: Review */}
        {form.step === 5 && (
          <div style={{ background: 'white', padding: 24, borderRadius: 12, border: '1px solid #e8e4dc' }}>
            <h3 style={{ margin: '0 0 20px 0', color: '#1a2332', fontFamily: "'Sora', sans-serif" }}>Review & Publish</h3>
            <p style={{ color: '#64748b', fontSize: 14, marginBottom: 20 }}>Review your product details before publishing.</p>
          </div>
        )}

        {/* Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginTop: 40 }}>
          <button
            onClick={handleBack}
            disabled={form.step === 1}
            style={{
              padding: '12px 24px',
              background: form.step === 1 ? '#f3f4f6' : 'white',
              color: form.step === 1 ? '#9ca3af' : '#1a1f2e',
              border: '1px solid #e5e7eb',
              borderRadius: 8,
              fontWeight: 600,
              cursor: form.step === 1 ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => { if (form.step !== 1) { e.currentTarget.style.borderColor = '#FF6B35'; e.currentTarget.style.color = '#FF6B35' } }}
            onMouseLeave={(e) => { if (form.step !== 1) { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.color = '#1a1f2e' } }}
          >
            ← Back
          </button>
          {form.step < 5 ? (
            <button
              onClick={handleNext}
              style={{
                padding: '12px 24px',
                background: 'linear-gradient(135deg, #FF6B35 0%, #E55A2B 100%)',
                color: 'white',
                border: 'none',
                borderRadius: 8,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 4px 12px rgba(255, 107, 53, 0.3)'
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(255, 107, 53, 0.4)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 107, 53, 0.3)' }}
            >
              Next →
            </button>
          ) : (
            <button
              onClick={handlePublish}
              disabled={loading}
              style={{
                padding: '12px 24px',
                background: loading ? '#9ca3af' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: 'white',
                border: 'none',
                borderRadius: 8,
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
              }}
              onMouseEnter={e => { if (!loading) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(16, 185, 129, 0.4)' } }}
              onMouseLeave={e => { if (!loading) { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)' } }}
            >
              {loading ? 'Publishing...' : 'Publish Product ✓'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
