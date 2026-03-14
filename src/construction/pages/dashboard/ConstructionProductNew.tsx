import { useState, useRef } from 'react'
import { supabase } from '@/integrations/supabase/client-simple'
import { Link, useNavigate } from 'react-router-dom'

type ProductType = 'expandable' | 'foldable' | 'flatpack' | 'capsule' | 'modular'
type DocType = 'brochure' | 'spec_sheet' | 'floor_plan' | 'compliance' | 'install_guide'

interface ProductData {
  title: string
  description: string
  price_cad: string
  product_type: ProductType
  size_ft: string
  bedrooms: string
  bathrooms: string
  area_sqm: string
  lead_time: string
  frame_type: string
  shipping_port: string
  badge_label: string
}

interface FormData {
  step: number
  product: ProductData
  images: File[]
  documents: Record<DocType, File | null>
  customization: Record<string, any>
}

export default function ConstructionProductNew() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState<FormData>({
    step: 1,
    product: {
      title: '',
      description: '',
      price_cad: '',
      product_type: 'expandable',
      size_ft: '',
      bedrooms: '',
      bathrooms: '',
      area_sqm: '',
      lead_time: '',
      frame_type: '',
      shipping_port: '',
      badge_label: ''
    },
    images: [],
    documents: {
      brochure: null,
      spec_sheet: null,
      floor_plan: null,
      compliance: null,
      install_guide: null
    },
    customization: {}
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [previewImages, setPreviewImages] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleProductChange = (field: keyof ProductData, value: string) => {
    setFormData(prev => ({
      ...prev,
      product: { ...prev.product, [field]: value }
    }))
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newImages = Array.from(e.target.files)
      if (formData.images.length + newImages.length > 10) {
        setError('Maximum 10 images allowed')
        return
      }

      const newPreviews = newImages.map(file => URL.createObjectURL(file))
      setPreviewImages(prev => [...prev, ...newPreviews])
      setFormData(prev => ({ ...prev, images: [...prev.images, ...newImages] }))
    }
  }

  const removeImage = (index: number) => {
    setPreviewImages(prev => prev.filter((_, i) => i !== index))
    setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }))
  }

  const handleDocumentUpload = (docType: DocType, file: File) => {
    setFormData(prev => ({
      ...prev,
      documents: { ...prev.documents, [docType]: file }
    }))
  }

  const removeDocument = (docType: DocType) => {
    setFormData(prev => ({
      ...prev,
      documents: { ...prev.documents, [docType]: null }
    }))
  }

  const handleCustomizationChange = (optionType: string, value: string, priceModifier: string = '0') => {
    setFormData(prev => ({
      ...prev,
      customization: {
        ...prev.customization,
        [optionType]: { value, priceModifier }
      }
    }))
  }

  const handleNext = () => {
    if (formData.step < 5) {
      setFormData(prev => ({ ...prev, step: prev.step + 1 }))
    }
  }

  const handleBack = () => {
    if (formData.step > 1) {
      setFormData(prev => ({ ...prev, step: prev.step - 1 }))
    }
  }

  const handleSubmit = async (publish: boolean) => {
    setError('')
    setLoading(true)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        window.location.href = '/construction/login'
        return
      }

      console.log('Current user ID:', session.user.id)

      // Look up the supplier profile (id = auth.users.id)
      let { data: profile, error: profileFetchError } = await supabase
        .from('construction_supplier_profiles')
        .select('id')
        .eq('id', session.user.id)
        .single()

      if (profileFetchError && profileFetchError.code !== 'PGRST116') {
        console.error('Profile fetch error:', profileFetchError)
        throw new Error(`Could not fetch supplier profile: ${profileFetchError.message}`)
      }

      // Auto-create supplier profile if it doesn't exist
      if (!profile) {
        console.log('Creating new supplier profile...')
        const { data: newProfile, error: profileError } = await supabase
          .from('construction_supplier_profiles')
          .insert({
            id: session.user.id,
            company_name: session.user.user_metadata?.company_name || 'My Company',
            contact_name: session.user.user_metadata?.contact_name || '',
            email: session.user.email || ''
          })
          .select('id')
          .single()

        if (profileError) {
          console.error('Profile creation error:', profileError)
          throw new Error(`Could not create supplier profile: ${profileError.message}`)
        }
        profile = newProfile
        console.log('Supplier profile created:', profile)
      } else {
        console.log('Supplier profile found:', profile)
      }

      // Generate slug from title
      const baseSlug = formData.product.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
      const slug = `${baseSlug}-${Date.now().toString(36)}`

      // Step 1: Insert product
      const { data: productData, error: productError } = await supabase
        .from('construction_products')
        .insert({
          supplier_id: profile.id,
          title: formData.product.title,
          slug,
          description: formData.product.description,
          price_cad: parseFloat(formData.product.price_cad),
          product_type: formData.product.product_type,
          size_ft: formData.product.size_ft || null,
          bedrooms: formData.product.bedrooms || null,
          bathrooms: formData.product.bathrooms || null,
          area_sqm: formData.product.area_sqm ? parseFloat(formData.product.area_sqm) : null,
          lead_time: formData.product.lead_time || null,
          frame_type: formData.product.frame_type || null,
          shipping_port: formData.product.shipping_port || null,
          status: publish ? 'live' : 'draft'
        })
        .select()
        .single()

      if (productError) {
        console.error('Product insert error - full object:', productError)
        console.error('Product insert error - keys:', Object.keys(productError))
        console.error('Product insert error - toString:', productError.toString())
        console.error('Product insert error - JSON:', JSON.stringify(productError, null, 2))
        
        let errorMsg = 'Unknown error'
        if (productError?.message) errorMsg = productError.message
        else if (productError?.details) errorMsg = productError.details
        else if (productError?.hint) errorMsg = productError.hint
        else if (Object.keys(productError).length === 0) errorMsg = 'RLS policy rejection or empty error'
        else errorMsg = JSON.stringify(productError)
        
        throw new Error(`Product insert failed: ${errorMsg}`)
      }

      if (!productData) {
        throw new Error('Product insert returned no data')
      }

      const product = productData

      // Step 2: Upload images
      const imageIds: { storage_path: string; public_url: string; is_primary: boolean }[] = []
      for (let i = 0; i < formData.images.length; i++) {
        const image = formData.images[i]
        const storagePath = `${session.user.id}/${product.id}/${image.name}`
        const { error: uploadError } = await supabase.storage
          .from('construction-images')
          .upload(storagePath, image, { contentType: image.type })

        if (uploadError) throw new Error(`Image upload failed: ${uploadError.message}`)

        const { data: { publicUrl } } = supabase.storage
          .from('construction-images')
          .getPublicUrl(storagePath)

        imageIds.push({
          storage_path: storagePath,
          public_url: publicUrl,
          is_primary: i === 0
        })
      }

      // Insert image records
      for (const img of imageIds) {
        await supabase
          .from('construction_product_images')
          .insert({
            product_id: product.id,
            storage_path: img.storage_path,
            public_url: img.public_url,
            is_primary: img.is_primary,
            sort_order: imageIds.indexOf(img)
          })
      }

      // Step 3: Upload documents
      for (const [docType, file] of Object.entries(formData.documents)) {
        if (file) {
          const storagePath = `${session.user.id}/${product.id}/${docType}/${file.name}`
          const { error: uploadError } = await supabase.storage
            .from('construction-documents')
            .upload(storagePath, file, { contentType: file.type })

          if (uploadError) throw new Error(`Document upload failed: ${uploadError.message}`)

          const { data: { publicUrl } } = supabase.storage
            .from('construction-documents')
            .getPublicUrl(storagePath)

          await supabase
            .from('construction_product_documents')
            .insert({
              product_id: product.id,
              doc_type: docType as DocType,
              file_name: file.name,
              storage_path: storagePath,
              file_size_kb: Math.round(file.size / 1024)
            })
        }
      }

      // Step 4: Skip customization options (table doesn't exist yet)
      // TODO: Add construction_customization_options table in future migration

      navigate('/construction/dashboard/products')
    } catch (err) {
      console.error('Submit error:', err)
      setError(err instanceof Error ? err.message : 'An error occurred')
    }

    setLoading(false)
  }

  // Step 1: Basic Info
  const renderStep1 = () => (
    <div style={{ padding: 20 }}>
      <h3>Basic Information</h3>
      <div style={{ marginBottom: 12 }}>
        <label>Title *</label>
        <input
          type="text"
          value={formData.product.title}
          onChange={e => handleProductChange('title', e.target.value)}
          required
          style={{ width: '100%', padding: 8, marginTop: 4 }}
        />
      </div>
      <div style={{ marginBottom: 12 }}>
        <label>Product Type *</label>
        <select
          value={formData.product.product_type}
          onChange={e => handleProductChange('product_type', e.target.value as ProductType)}
          required
          style={{ width: '100%', padding: 8, marginTop: 4 }}
        >
          <option value="expandable">Expandable</option>
          <option value="foldable">Foldable</option>
          <option value="flatpack">Flat Pack</option>
          <option value="capsule">Capsule</option>
          <option value="modular">Modular</option>
        </select>
      </div>
      <div style={{ marginBottom: 12 }}>
        <label>Description *</label>
        <textarea
          value={formData.product.description}
          onChange={e => handleProductChange('description', e.target.value)}
          required
          rows={4}
          style={{ width: '100%', padding: 8, marginTop: 4 }}
        />
      </div>
      <div style={{ marginBottom: 12 }}>
        <label>Base Price (CAD) *</label>
        <input
          type="number"
          value={formData.product.price_cad}
          onChange={e => handleProductChange('price_cad', e.target.value)}
          required
          min="0"
          step="0.01"
          style={{ width: '100%', padding: 8, marginTop: 4 }}
        />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <label>Size (ft)</label>
          <input
            type="text"
            value={formData.product.size_ft}
            onChange={e => handleProductChange('size_ft', e.target.value)}
            placeholder="e.g., 40ft"
            style={{ width: '100%', padding: 8, marginTop: 4 }}
          />
        </div>
        <div>
          <label>Bedrooms</label>
          <input
            type="text"
            value={formData.product.bedrooms}
            onChange={e => handleProductChange('bedrooms', e.target.value)}
            placeholder="e.g., 2 or Studio"
            style={{ width: '100%', padding: 8, marginTop: 4 }}
          />
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <label>Bathrooms</label>
          <input
            type="text"
            value={formData.product.bathrooms}
            onChange={e => handleProductChange('bathrooms', e.target.value)}
            style={{ width: '100%', padding: 8, marginTop: 4 }}
          />
        </div>
        <div>
          <label>Area (sqm)</label>
          <input
            type="number"
            value={formData.product.area_sqm}
            onChange={e => handleProductChange('area_sqm', e.target.value)}
            style={{ width: '100%', padding: 8, marginTop: 4 }}
          />
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <label>Lead Time</label>
          <input
            type="text"
            value={formData.product.lead_time}
            onChange={e => handleProductChange('lead_time', e.target.value)}
            placeholder="e.g., 3-15 days"
            style={{ width: '100%', padding: 8, marginTop: 4 }}
          />
        </div>
        <div>
          <label>Frame Type</label>
          <input
            type="text"
            value={formData.product.frame_type}
            onChange={e => handleProductChange('frame_type', e.target.value)}
            placeholder="e.g., Steel"
            style={{ width: '100%', padding: 8, marginTop: 4 }}
          />
        </div>
      </div>
      <div style={{ marginBottom: 12 }}>
        <label>Shipping Port</label>
        <input
          type="text"
          value={formData.product.shipping_port}
          onChange={e => handleProductChange('shipping_port', e.target.value)}
          placeholder="e.g., XinGang, China"
          style={{ width: '100%', padding: 8, marginTop: 4 }}
        />
      </div>
      <div style={{ marginBottom: 12 }}>
        <label>Badge Label (Optional)</label>
        <input
          type="text"
          value={formData.product.badge_label}
          onChange={e => handleProductChange('badge_label', e.target.value)}
          placeholder="e.g., In Stock / New / Popular"
          style={{ width: '100%', padding: 8, marginTop: 4 }}
        />
      </div>
    </div>
  )

  // Step 2: Photos
  const renderStep2 = () => (
    <div style={{ padding: 20 }}>
      <h3>Product Photos</h3>
      <p style={{ color: '#666', marginBottom: 16 }}>Upload up to 10 photos (jpg, png, webp)</p>
      
      <div
        onClick={() => fileInputRef.current?.click()}
        style={{
          border: '2px dashed #ccc',
          borderRadius: 8,
          padding: 40,
          textAlign: 'center',
          cursor: 'pointer',
          background: '#f9f9f9'
        }}
      >
        <p>Click to upload images</p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageUpload}
          style={{ display: 'none' }}
        />
      </div>

      {previewImages.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 12, marginTop: 20 }}>
          {previewImages.map((preview, index) => (
            <div key={index} style={{ position: 'relative' }}>
              <img src={preview} alt="Preview" style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: 4 }} />
              <button
                onClick={() => removeImage(index)}
                style={{
                  position: 'absolute',
                  top: 4,
                  right: 4,
                  background: 'rgba(255,0,0,0.8)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50%',
                  width: 24,
                  height: 24,
                  cursor: 'pointer'
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
      {previewImages.length > 0 && <p style={{ color: '#666', marginTop: 12 }}>{previewImages.length} images selected</p>}
    </div>
  )

  // Step 3: Documents
  const renderStep3 = () => (
    <div style={{ padding: 20 }}>
      <h3>Product Documents</h3>
      <p style={{ color: '#666', marginBottom: 16 }}>Upload supporting documents (PDF, images)</p>

      {(['brochure', 'spec_sheet', 'floor_plan', 'compliance', 'install_guide'] as DocType[]).map(docType => (
        <div key={docType} style={{ marginBottom: 16 }}>
          <label style={{ textTransform: 'capitalize' }}>{docType.replace('_', ' ')}</label>
          {formData.documents[docType] ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ color: '#666' }}>{formData.documents[docType]?.name}</span>
              <button
                onClick={() => removeDocument(docType)}
                style={{ padding: '4px 8px', background: '#e05a5a', color: 'white', border: 'none', cursor: 'pointer', borderRadius: 4 }}
              >
                Remove
              </button>
            </div>
          ) : (
            <input
              type="file"
              accept=".pdf,image/*"
              onChange={e => e.target.files && handleDocumentUpload(docType, e.target.files[0])}
              style={{ display: 'block', marginTop: 4 }}
            />
          )}
        </div>
      ))}
    </div>
  )

  // Step 4: Customization
  const renderStep4 = () => (
    <div style={{ padding: 20 }}>
      <h3>Customization Options</h3>
      <p style={{ color: '#666', marginBottom: 16 }}>Add customization options with price modifiers</p>

      {[
        { type: 'exterior_colour', label: 'Exterior Colour', inputType: 'color' },
        { type: 'interior_finish', label: 'Interior Finish', inputType: 'text' },
        { type: 'dimensions', label: 'Dimensions', inputType: 'text' },
        { type: 'rooms', label: 'Number of Rooms', inputType: 'text' },
        { type: 'windows', label: 'Window Style', inputType: 'text' },
        { type: 'door', label: 'Door Type', inputType: 'text' },
        { type: 'roofing', label: 'Roofing Type', inputType: 'text' },
        { type: 'insulation', label: 'Insulation Level', inputType: 'text' },
        { type: 'flooring', label: 'Flooring Type', inputType: 'text' }
      ].map(option => (
        <div key={option.type} style={{ marginBottom: 16, padding: 12, background: '#f9f9f9', borderRadius: 8 }}>
          <label style={{ textTransform: 'capitalize' }}>{option.label}</label>
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <input
              type={option.inputType}
              value={formData.customization[option.type]?.value || ''}
              onChange={e => handleCustomizationChange(option.type, e.target.value)}
              placeholder="Option value"
              style={{ flex: 1, padding: 8 }}
            />
            <input
              type="number"
              value={formData.customization[option.type]?.priceModifier || '0'}
              onChange={e => handleCustomizationChange(option.type, formData.customization[option.type]?.value || '', e.target.value)}
              placeholder="Price modifier"
              style={{ width: 100, padding: 8 }}
            />
          </div>
        </div>
      ))}
    </div>
  )

  // Step 5: Review
  const renderStep5 = () => (
    <div style={{ padding: 20 }}>
      <h3>Review & Publish</h3>
      <div style={{ background: '#f9f9f9', padding: 20, borderRadius: 8, marginBottom: 20 }}>
        <h4>Product Details</h4>
        <p><strong>Title:</strong> {formData.product.title}</p>
        <p><strong>Type:</strong> {formData.product.product_type}</p>
        <p><strong>Price:</strong> ${formData.product.price_cad}</p>
        <p><strong>Images:</strong> {previewImages.length}</p>
        <p><strong>Documents:</strong> {Object.values(formData.documents).filter(d => d).length}</p>
        <p><strong>Customization Options:</strong> {Object.keys(formData.customization).length}</p>
      </div>
      <p style={{ color: '#666' }}>Review your product details before publishing.</p>
    </div>
  )

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      {/* Sidebar */}
      <div style={{ width: 250, background: '#1a2332', color: 'white', padding: 20, display: 'flex', flexDirection: 'column' }}>
        <div style={{ marginBottom: 40, fontSize: 18, fontWeight: 'bold' }}>HomieAI Construction</div>
        <nav style={{ flex: 1 }}>
          <Link to="/construction/dashboard" style={{ display: 'block', padding: '12px 0', color: '#aaa', textDecoration: 'none' }}>Home</Link>
          <Link to="/construction/dashboard/products" style={{ display: 'block', padding: '12px 0', color: 'white', textDecoration: 'none', borderBottom: '2px solid #4a90e2', marginTop: 16 }}>Products</Link>
          <Link to="/construction/dashboard/quotes" style={{ display: 'block', padding: '12px 0', color: '#aaa', textDecoration: 'none', marginTop: 16 }}>Quotes</Link>
          <Link to="/construction/dashboard/messages" style={{ display: 'block', padding: '12px 0', color: '#aaa', textDecoration: 'none', marginTop: 16 }}>Messages</Link>
          <Link to="/construction/dashboard/profile" style={{ display: 'block', padding: '12px 0', color: '#aaa', textDecoration: 'none', marginTop: 16 }}>Profile</Link>
        </nav>
        <Link to="/construction/login" style={{ padding: '10px 16px', background: '#e05a5a', color: 'white', border: 'none', cursor: 'pointer', borderRadius: 6, width: '100%', textAlign: 'center', textDecoration: 'none' }}>
          Logout
        </Link>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: 40 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <h2>New Product</h2>
          <Link to="/construction/dashboard/products" style={{ padding: '10px 20px', background: '#666', color: 'white', textDecoration: 'none', borderRadius: 6 }}>
            Cancel
          </Link>
        </div>

        {/* Progress Steps */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 32 }}>
          {[1, 2, 3, 4, 5].map(step => (
            <div
              key={step}
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: formData.step >= step ? '#4a90e2' : '#ddd',
                color: formData.step >= step ? 'white' : '#666',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold'
              }}
            >
              {step}
            </div>
          ))}
        </div>

        {error && <p style={{ color: 'red', marginBottom: 16 }}>{error}</p>}

        {/* Step Content */}
        {formData.step === 1 && renderStep1()}
        {formData.step === 2 && renderStep2()}
        {formData.step === 3 && renderStep3()}
        {formData.step === 4 && renderStep4()}
        {formData.step === 5 && renderStep5()}

        {/* Navigation Buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20 }}>
          <button
            onClick={handleBack}
            disabled={formData.step === 1}
            style={{
              padding: '10px 20px',
              background: formData.step === 1 ? '#ccc' : '#666',
              color: 'white',
              border: 'none',
              cursor: formData.step === 1 ? 'not-allowed' : 'pointer',
              borderRadius: 6
            }}
          >
            Back
          </button>
          {formData.step < 5 ? (
            <button
              onClick={handleNext}
              style={{ padding: '10px 20px', background: '#4a90e2', color: 'white', border: 'none', cursor: 'pointer', borderRadius: 6 }}
            >
              Next
            </button>
          ) : (
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => handleSubmit(false)}
                disabled={loading}
                style={{ padding: '10px 20px', background: '#ff9800', color: 'white', border: 'none', cursor: 'pointer', borderRadius: 6 }}
              >
                {loading ? 'Saving...' : 'Save as Draft'}
              </button>
              <button
                onClick={() => handleSubmit(true)}
                disabled={loading}
                style={{ padding: '10px 20px', background: '#4caf50', color: 'white', border: 'none', cursor: 'pointer', borderRadius: 6 }}
              >
                {loading ? 'Publishing...' : 'Publish Now'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
