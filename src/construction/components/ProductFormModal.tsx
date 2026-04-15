import { useState, useRef, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client-simple'
import { Upload } from 'lucide-react'

interface ProductImage {
  id: string
  product_id: string
  storage_path: string
  public_url: string
  is_primary: boolean
  uploaded_at: string
  image_order?: number
}

interface ExistingImage {
  id: string
  public_url: string
  image_order: number
}

interface ColorOption {
  name: string
  hex: string
}

interface Product {
  id: string
  title: string
  product_type: string
  category?: string
  status: string
  price_cad: number
  created_at: string
  description?: string
  bedrooms?: string
  size_ft?: string
  lead_time?: string
  bathrooms?: string
  area_sqm?: number
  frame_type?: string
  shipping_port?: string
  badge_label?: string | null
  available_colors?: ColorOption[]
  custom_build_enabled?: boolean
  product_specs?: string | null
  weight_kg?: string | null
  construction_product_images?: ProductImage[]
}

interface FormState {
  step: number
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
  customizationOptions: Record<string, any>
  globalAddons: Array<{ name: string; price: string; description: string }>
  photos: File[]
  photoPreviews: string[]
  primaryPhotoIndex: number
  documents: Record<string, File | null>
  badgeText: string
  badgeStyle: string
  availableColors: ColorOption[]
  customColorHex: string
  customColorName: string
  customBuildEnabled: boolean
  productSpecs: string
  weight: string
  existingImages: ExistingImage[]
  enablePatternUpload: boolean
  patternImages: Array<{ name: string; url: string; isPattern: boolean }>
}

const CATEGORIES = {
  'Categories': [
    'Pre-fabricated Houses',
    'Cabinets',
    'Bath & Kitchen'
  ]
}

const PREDEFINED_COLORS: ColorOption[] = [
  { name: 'Matte White', hex: '#F5F5F3' },
  { name: 'Warm Oak', hex: '#C4956A' },
  { name: 'Matte Black', hex: '#1C1C1E' },
  { name: 'Stone Grey', hex: '#8E8E93' },
  { name: 'Natural Walnut', hex: '#7B5E3A' },
  { name: 'Soft Cream', hex: '#FAF9F6' },
  { name: 'Charcoal', hex: '#2C2C2E' },
  { name: 'Navy Blue', hex: '#1E3A5F' },
  { name: 'Sage Green', hex: '#7A9E7E' },
  { name: 'Terracotta', hex: '#D97B48' },
  { name: 'Mustard', hex: '#D4B04C' },
  { name: 'Dusty Rose', hex: '#D4A5A5' },
  { name: 'Slate Blue', hex: '#5E7A8A' },
  { name: 'Emerald', hex: '#2E5D3E' },
  { name: 'Coffee', hex: '#6F4E37' },
]

interface ProductFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  editingProduct?: Product
}


export default function ProductFormModal({ isOpen, onClose, onSuccess, editingProduct }: ProductFormModalProps) {
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
    standardSize: '',
    floorAreaSqm: '',
    numFloors: '1',
    ceilingHeight: '',
    frameMaterial: 'Steel',
    wallPanelMaterial: 'SIP Panel',
    roofType: 'Flat',
    numModules: '',
    assemblyTime: '',
    bedrooms: '',
    bathrooms: '',
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
    badgeStyle: 'Green',
    availableColors: [],
    customColorHex: '#000000',
    customColorName: '',
    customBuildEnabled: false,
    productSpecs: '',
    weight: '',
    existingImages: [],
    enablePatternUpload: false,
    patternImages: []
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [productDocuments, setProductDocuments] = useState<Array<{ id: string; file_name: string; file_size: number | null }>>([])
  const [uploadingDocuments, setUploadingDocuments] = useState(false)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  // Populate form with editing product data
  useEffect(() => {
    if (editingProduct && isOpen) {
      // Reverse map product_type back to display category
      const productTypeToCategory: Record<string, string> = {
        'house': 'Pre-fabricated Houses',
        'cabinet': 'Cabinets',
        'bath_kitchen': 'Bath & Kitchen'
      }
      const resolvedCategory = editingProduct.category || productTypeToCategory[editingProduct.product_type] || ''
      // Load existing images for this product
      const loadImages = async () => {
        const { data: images } = await supabase
          .from('construction_product_images')
          .select('*')
          .eq('product_id', editingProduct.id)
          .order('image_order', { ascending: true })
        
        // Load existing documents
        const { data: docs } = await supabase
          .from('construction_product_documents')
          .select('id, file_name, file_size')
          .eq('product_id', editingProduct.id)
        
        if (images && images.length > 0) {
          const photoPreviews = images.map(img => img.public_url)
          const existingImages = images.map(img => ({
            id: img.id,
            public_url: img.public_url,
            image_order: img.image_order
          }))
          setForm(prev => ({
            ...prev,
            productName: editingProduct.title,
            category: resolvedCategory,
            description: editingProduct.description || '',
            basePrice: editingProduct.price_cad.toString(),
            standardSize: editingProduct.size_ft || '',
            bedrooms: editingProduct.bedrooms || '',
            weight: editingProduct.weight_kg || '',
            leadTime: editingProduct.lead_time || '',
            shippingPort: editingProduct.shipping_port || '',
            badgeText: editingProduct.badge_label || '',
            availableColors: editingProduct.available_colors?.filter((color: any) => color.type !== 'pattern').map((color: any) => ({
              name: color.name,
              hex: color.hex
            })) || [],
            customBuildEnabled: editingProduct.custom_build_enabled || false,
            productSpecs: editingProduct.product_specs || '',
            photoPreviews: photoPreviews,
            existingImages: existingImages,
            primaryPhotoIndex: 0,
            enablePatternUpload: false,
            patternImages: editingProduct.available_colors?.filter((color: any) => color.type === 'pattern').map((pattern: any) => ({
              name: pattern.name,
              url: pattern.imageUrl,
              isPattern: true
            })) || [],
            step: 1
          }))
        } else {
          setForm(prev => ({
            ...prev,
            productName: editingProduct.title,
            category: resolvedCategory,
            description: editingProduct.description || '',
            basePrice: editingProduct.price_cad.toString(),
            standardSize: editingProduct.size_ft || '',
            bedrooms: editingProduct.bedrooms || '',
            weight: editingProduct.weight_kg || '',
            leadTime: editingProduct.lead_time || '',
            shippingPort: editingProduct.shipping_port || '',
            badgeText: editingProduct.badge_label || '',
            availableColors: editingProduct.available_colors?.filter((color: any) => color.type !== 'pattern').map((color: any) => ({
              name: color.name,
              hex: color.hex
            })) || [],
            customBuildEnabled: editingProduct.custom_build_enabled || false,
            productSpecs: editingProduct.product_specs || '',
            enablePatternUpload: false,
            patternImages: [],
            step: 1
          }))
        }
        
        if (docs && docs.length > 0) {
          setProductDocuments(docs)
        }
      }
      loadImages()
    }
  }, [editingProduct, isOpen])

  const updateForm = (field: keyof FormState, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  // Auto-switch to pattern mode when patterns are added
  useEffect(() => {
    if (form.patternImages && form.patternImages.length > 0 && !form.enablePatternUpload) {
      updateForm('enablePatternUpload', true)
    }
  }, [form.patternImages])

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

  const handleClose = () => {
    setForm(prev => ({ ...prev, step: 1 }))
    setError('')
    onClose()
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

      // Check user role
      const userRole = session.user.user_metadata?.role
      console.log('User role:', userRole)
      
      if (userRole !== 'construction_supplier') {
        console.warn('User is not a construction supplier, role:', userRole)
        setError('You must be a construction supplier to create products')
        setLoading(false)
        return
      }

      // Get supplier profile for this user
      console.log('Current user ID:', session.user.id)
      console.log('Current user email:', session.user.email)
      
      const { data: supplierProfile } = await supabase
        .from('construction_supplier_profiles')
        .select('id')
        .eq('id', session.user.id)
        .maybeSingle()
        
      console.log('Supplier profile found:', supplierProfile)

      let supplierId: string
      
      if (supplierProfile) {
        supplierId = supplierProfile.id
      } else {
        // Create supplier profile if it doesn't exist
        const { data: newSupplierProfile, error: createError } = await supabase
          .from('construction_supplier_profiles')
          .insert({
            id: session.user.id,
            user_id: session.user.id,
            company_name: 'Default Company',
            contact_name: session.user.email?.split('@')[0] || 'Default Contact',
            email: session.user.email,
            phone: '',
            verified: false
          })
          .select('id')
          .single()
          
        if (createError) {
          console.error('Error creating supplier profile:', createError)
          console.error('Error details:', JSON.stringify(createError, null, 2))
          console.error('User session:', session)
          setError(`Failed to create supplier profile: ${createError.message || 'Unknown error'}`)
          setLoading(false)
          return
        }
        
        supplierId = newSupplierProfile.id
        console.log('Created new supplier profile with ID:', supplierId)
      }
      
      console.log('Using supplier profile with ID:', supplierId)

      // Map category to product_type (must match database constraint)
      const categoryMap: Record<string, string> = {
        'Pre-fabricated Houses': 'house',
        'Cabinets': 'cabinet',
        'Bath & Kitchen': 'bath_kitchen'
      }
      const productType = categoryMap[form.category] || 'modular'

      // Combine colors and patterns for storage in available_colors field
      const enhancedAvailableColors = [
        ...form.availableColors.map(color => ({
          name: color.name,
          hex: color.hex,
          type: 'color',
          imageUrl: null
        })),
        ...form.patternImages.map(pattern => ({
          name: pattern.name,
          hex: null,
          type: 'pattern',
          imageUrl: pattern.url
        }))
      ]

      // Create or update product
      const productData = {
        title: form.productName,
        slug: form.productName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + (editingProduct ? '' : '-' + Date.now()),
        product_type: productType,
        description: form.description,
        price_cad: parseFloat(form.basePrice) || 0,
        bedrooms: form.bedrooms || null,
        size_ft: form.standardSize || null,
        weight_kg: form.weight || null,
        lead_time: form.leadTime || null,
        shipping_port: form.shippingPort || null,
        badge_label: form.badgeText || null,
        available_colors: enhancedAvailableColors.length > 0 ? enhancedAvailableColors : null,
        custom_build_enabled: form.customBuildEnabled,
        product_specs: form.productSpecs || null,
        status: 'live',
        supplier_id: supplierId
      }

      console.log('Product data to be created:', productData)
      console.log('Product status:', productData.status)

      let product: any
      let productError: any

      if (editingProduct) {
        // Update existing product
        const { data: updatedProduct, error: updateError } = await supabase
          .from('construction_products')
          .update(productData)
          .eq('id', editingProduct.id)
          .select()

        product = updatedProduct
        productError = updateError
      } else {
        // Insert new product
        const { data: newProduct, error: insertError } = await supabase
          .from('construction_products')
          .insert([productData])
          .select()

        product = newProduct
        productError = insertError
      }

      if (productError) {
        console.error('Product operation error:', productError)
        throw new Error(`Failed to ${editingProduct ? 'update' : 'create'} product: ${productError.message}`)
      }

      console.log('Product created/updated successfully:', product)
      console.log('Product array length:', Array.isArray(product) ? product.length : 'not array')

      if (!product || (Array.isArray(product) && product.length === 0)) {
        throw new Error(`Product was ${editingProduct ? 'updated but' : 'created but'} no data returned`)
      }

      // Update existing images' image_order if they were reordered
      if (editingProduct && form.existingImages.length > 0) {
        const updatePromises = form.existingImages.map((img, idx) => {
          return supabase
            .from('construction_product_images')
            .update({ 
              image_order: idx,
              is_primary: idx === 0  // First image is always primary
            })
            .eq('id', img.id)
        })

        await Promise.all(updatePromises)
      }

      // Close modal immediately for better UX
      setLoading(false)
      handleClose()

      // Upload images in background (don't wait for completion)
      if (form.photos && form.photos.length > 0) {
        // Only upload File objects (new photos), not URLs (existing photos)
        const newPhotos = form.photos.filter(photo => photo instanceof File)
        
        if (newPhotos.length > 0) {
          // Parallelize image uploads
          const uploadPromises = newPhotos.map(async (photo, i) => {
            const filename = `products/${session.user?.id}/${Date.now()}-${i}-${photo.name}`
            
            try {
              const { error: uploadError } = await supabase.storage
                .from('construction-images')
                .upload(filename, photo)
              
              if (uploadError) return null

              const { data: urlData } = supabase.storage
                .from('construction-images')
                .getPublicUrl(filename)

              return {
                product_id: product[0]?.id,
                storage_path: filename,
                public_url: urlData?.publicUrl,
                is_primary: false,
                image_order: form.existingImages.length + i
              }
            } catch (err) {
              return null
            }
          })

          // Wait for all uploads to complete
          const results = await Promise.all(uploadPromises)
          const imageInserts = results.filter(Boolean)

          if (imageInserts.length > 0) {
            // New images are never primary (existing images are already ordered with first as primary)
            imageInserts.forEach((img) => {
              img.is_primary = false
            })

            await supabase
              .from('construction_product_images')
              .insert(imageInserts)
          }
        }
      } else if (editingProduct && (!form.photos || form.photos.length === 0)) {
        // If editing and no new photos, keep existing images
      }
      
      // Call success callback to refresh products list
      if (onSuccess) {
        onSuccess()
      }
    } catch (err: any) {
      console.error('Publish error:', err)
      setError(err.message || 'Failed to publish product. Please try again.')
      setLoading(false)
    }
  }

  const handleUploadDocuments = async (files: File[]) => {
    if (!editingProduct) {
      setError('Please save the product first before uploading documents')
      return
    }

    setUploadingDocuments(true)
    try {
      const { uploadProductDocument } = await import('@/services/productDocumentService')
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.user?.id) {
        throw new Error('You must be logged in to upload documents')
      }

      const uploadPromises = files.map(file => 
        uploadProductDocument(editingProduct.id, file, session.user.id)
      )

      const results = await Promise.all(uploadPromises)
      setProductDocuments(prev => [...prev, ...results.map(r => ({ id: r.id, file_name: r.file_name, file_size: r.file_size }))])
      setError('')
    } catch (err: any) {
      console.error('Document upload error:', err)
      setError(err.message || 'Failed to upload documents')
    } finally {
      setUploadingDocuments(false)
    }
  }

  const handleDeleteDocument = async (documentId: string, filePath: string) => {
    try {
      const { deleteProductDocument } = await import('@/services/productDocumentService')
      await deleteProductDocument(documentId, filePath)
      setProductDocuments(prev => prev.filter(d => d.id !== documentId))
    } catch (err: any) {
      console.error('Document delete error:', err)
      setError(err.message || 'Failed to delete document')
    }
  }

  // Shared input style - LARGER AND MORE VISIBLE
  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '18px 20px',
    border: '3px solid #cbd5e1',
    borderRadius: 12,
    fontFamily: 'Inter, sans-serif',
    fontSize: 17,
    fontWeight: 500,
    color: '#0f172a',
    background: '#ffffff',
    boxSizing: 'border-box',
    outline: 'none',
    transition: 'all 0.2s'
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: 18,
    fontWeight: 800,
    color: '#0f172a',
    marginBottom: 12,
    letterSpacing: '-0.01em'
  }

  const cardStyle: React.CSSProperties = {
    background: '#f8fafc',
    padding: 40,
    borderRadius: 18,
    border: '3px solid #e2e8f0',
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
  }

  const sectionTitleStyle: React.CSSProperties = {
    margin: '0 0 32px 0',
    fontSize: 28,
    fontWeight: 900,
    color: '#0f172a',
    fontFamily: 'Inter, sans-serif',
    letterSpacing: '-0.02em'
  }

  // Step 1: Basic Info & Pricing
  const renderStep1 = () => (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 36 }}>
      {/* Card 1: Product Identity & Photos */}
      <div style={cardStyle}>
        <h3 style={sectionTitleStyle}>Product Identity</h3>

        <div style={{ marginBottom: 32 }}>
          <label style={labelStyle}>Product Name *</label>
          <input
            type="text"
            value={form.productName}
            onChange={e => updateForm('productName', e.target.value)}
            placeholder="e.g., Expandable 40ft Home"
            style={inputStyle}
            onFocus={(e) => { e.currentTarget.style.borderColor = '#FF6B35'; e.currentTarget.style.boxShadow = '0 0 0 6px rgba(255,107,53,0.15)' }}
            onBlur={(e) => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.boxShadow = 'none' }}
          />
        </div>

        {/* Product Photos - NEW */}
        <div style={{ marginBottom: 32 }}>
          <label style={labelStyle}>Product Photos *</label>
          <div style={{
            border: '3px dashed #cbd5e1',
            borderRadius: 12,
            padding: 24,
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s',
            background: '#f8fafc'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#FF6B35'; e.currentTarget.style.background = '#fff5f0' }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.background = '#f8fafc' }}
          onClick={() => fileInputRef.current?.click()}
          >
            <div style={{ fontSize: 32, marginBottom: 12 }}>📸</div>
            <p style={{ margin: '0 0 8px 0', fontSize: 16, fontWeight: 600, color: '#0f172a' }}>
              Click to upload photos
            </p>
            <p style={{ margin: 0, fontSize: 14, color: '#64748b' }}>
              or drag and drop (JPG, PNG, WebP)
            </p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              style={{ display: 'none' }}
              onChange={(e) => {
                const files = Array.from(e.target.files || [])
                const newPhotos = [...form.photos, ...files]
                const newPreviews = files.map(f => URL.createObjectURL(f))
                updateForm('photos', newPhotos)
                updateForm('photoPreviews', [...form.photoPreviews, ...newPreviews])
              }}
            />
          </div>
          
          {/* Photo Preview with Drag-and-Drop Reordering */}
          {form.photoPreviews.length > 0 && (
            <div style={{ marginTop: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', margin: 0 }}>
                  {form.photoPreviews.length} photo{form.photoPreviews.length !== 1 ? 's' : ''} uploaded — Drag to reorder
                </p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    padding: '8px 16px',
                    background: '#FF6B35',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 8,
                    fontWeight: 600,
                    fontSize: 13,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#E67E22' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = '#FF6B35' }}
                >
                  + Add More Photos
                </button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: 12 }}>
                {form.photoPreviews.map((preview, idx) => {
                  const isExisting = idx < form.existingImages.length
                  const existingImage = isExisting ? form.existingImages[idx] : null
                  
                  return (
                    <div 
                      key={idx} 
                      style={{ position: 'relative', cursor: 'grab' }}
                      draggable
                      onDragStart={(e) => {
                        setDraggedIndex(idx)
                        e.dataTransfer.effectAllowed = 'move'
                        e.dataTransfer.setData('text/plain', idx.toString())
                      }}
                      onDragEnd={() => {
                        setDraggedIndex(null)
                        setDragOverIndex(null)
                      }}
                      onDragOver={(e) => {
                        e.preventDefault()
                        e.dataTransfer.dropEffect = 'move'
                        setDragOverIndex(idx)
                      }}
                      onDragLeave={() => {
                        setDragOverIndex(null)
                      }}
                      onDrop={(e) => {
                        e.preventDefault()
                        const sourceIdx = parseInt(e.dataTransfer.getData('text/plain'))
                        if (sourceIdx !== idx) {
                          const newPhotos = [...form.photos]
                          const newPreviews = [...form.photoPreviews]
                          const newExistingImages = [...form.existingImages]
                          
                          // Swap photos
                          ;[newPhotos[sourceIdx], newPhotos[idx]] = [newPhotos[idx], newPhotos[sourceIdx]]
                          ;[newPreviews[sourceIdx], newPreviews[idx]] = [newPreviews[idx], newPreviews[sourceIdx]]
                          
                          // Swap existing images if both are existing
                          if (sourceIdx < form.existingImages.length && idx < form.existingImages.length) {
                            ;[newExistingImages[sourceIdx], newExistingImages[idx]] = [newExistingImages[idx], newExistingImages[sourceIdx]]
                          }
                          
                          updateForm('photos', newPhotos)
                          updateForm('photoPreviews', newPreviews)
                          updateForm('existingImages', newExistingImages)
                        }
                        setDraggedIndex(null)
                        setDragOverIndex(null)
                      }}
                    >
                      <img
                        src={preview}
                        alt={`Preview ${idx}`}
                        style={{
                          width: '100%',
                          height: 80,
                          objectFit: 'cover',
                          borderRadius: 8,
                          border: idx === 0 ? '3px solid #FF6B35' : dragOverIndex === idx ? '3px dashed #FF6B35' : '1px solid #e2e8f0',
                          cursor: 'grab',
                          opacity: draggedIndex === idx ? 0.5 : 1,
                          transition: 'all 0.2s ease',
                          transform: draggedIndex === idx ? 'scale(0.95)' : dragOverIndex === idx ? 'scale(1.05)' : 'scale(1)',
                          boxShadow: draggedIndex === idx ? '0 8px 16px rgba(0,0,0,0.2)' : dragOverIndex === idx ? '0 4px 12px rgba(255,107,53,0.3)' : 'none',
                        }}
                        onMouseEnter={(e) => {
                          if (draggedIndex === null) {
                            e.currentTarget.style.transform = 'scale(1.08)'
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (draggedIndex === null && dragOverIndex !== idx) {
                            e.currentTarget.style.transform = 'scale(1)'
                            e.currentTarget.style.boxShadow = 'none'
                          }
                        }}
                      />
                      {idx === 0 && (
                        <div style={{
                          position: 'absolute',
                          bottom: 4,
                          left: 4,
                          background: '#FF6B35',
                          color: 'white',
                          fontSize: 10,
                          fontWeight: 700,
                          padding: '2px 6px',
                          borderRadius: 4,
                          animation: 'pulse 2s infinite',
                        }}>
                          PRIMARY
                        </div>
                      )}
                      {draggedIndex === null && (
                        <div style={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          fontSize: 20,
                          opacity: 0,
                          transition: 'opacity 0.2s',
                          pointerEvents: 'none',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.opacity = '1'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.opacity = '0'
                        }}
                        >
                          ⋮⋮
                        </div>
                      )}
                      <button
                        onClick={async () => {
                          // Check if this is an existing image from database
                          if (existingImage && editingProduct) {
                            // Delete from database
                            try {
                              const { error: deleteError } = await supabase
                                .from('construction_product_images')
                                .delete()
                                .eq('id', existingImage.id)
                              
                              if (deleteError) {
                                console.error('Delete error:', deleteError)
                                setError('Failed to delete image from database')
                                return
                              }
                            } catch (err) {
                              console.error('Delete exception:', err)
                              setError('Error deleting image')
                              return
                            }
                          }
                          
                          // Remove from form state
                          const newPhotos = form.photos.filter((_, i) => i !== idx)
                          const newPreviews = form.photoPreviews.filter((_, i) => i !== idx)
                          const newExistingImages = form.existingImages.filter((_, i) => i !== idx)
                          
                          updateForm('photos', newPhotos)
                          updateForm('photoPreviews', newPreviews)
                          updateForm('existingImages', newExistingImages)
                          
                          if (form.primaryPhotoIndex === idx) {
                            updateForm('primaryPhotoIndex', 0)
                          }
                        }}
                        style={{
                          position: 'absolute',
                          top: -8,
                          right: -8,
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          background: '#FF6B35',
                          color: 'white',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: 14,
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.2s',
                        }}>
                        ✕
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        <div style={{ marginBottom: 32 }}>
          <label style={labelStyle}>Category *</label>
          <select
            value={form.category}
            onChange={e => updateForm('category', e.target.value)}
            style={inputStyle}
            onFocus={(e) => { e.currentTarget.style.borderColor = '#FF6B35'; e.currentTarget.style.boxShadow = '0 0 0 6px rgba(255,107,53,0.15)' }}
            onBlur={(e) => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.boxShadow = 'none' }}
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
          <div style={{ marginBottom: 32 }}>
            <label style={labelStyle}>Commercial Purpose</label>
            <input
              type="text"
              value={form.commercialPurpose}
              onChange={e => updateForm('commercialPurpose', e.target.value)}
              placeholder="e.g., Office, Retail, Warehouse"
              style={inputStyle}
              onFocus={(e) => { e.currentTarget.style.borderColor = '#FF6B35'; e.currentTarget.style.boxShadow = '0 0 0 6px rgba(255,107,53,0.15)' }}
              onBlur={(e) => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.boxShadow = 'none' }}
            />
          </div>
        )}

        <div style={{ marginBottom: 32 }}>
          <label style={labelStyle}>Available Colors <span style={{ fontWeight: 500, color: '#64748b', fontSize: 16 }}>(optional)</span></label>

          {/* Mode Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, padding: 12, background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#374151' }}>Input Mode:</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 13, color: '#6b7280' }}>Color</span>
              <div 
                style={{
                  width: 48, height: 24, background: '#e5e7eb', borderRadius: 12, position: 'relative', cursor: 'pointer'
                }}
                onClick={() => {
                  const newMode = !form.enablePatternUpload
                  updateForm('enablePatternUpload', newMode)
                }}
              >
                <div 
                  style={{
                    width: 20, height: 20, background: form.enablePatternUpload ? '#FF6B35' : '#d1d5db', borderRadius: 8, 
                    position: 'absolute', top: 2, left: form.enablePatternUpload ? 26 : 2,
                    transition: 'all 0.2s'
                  }}
                />
              </div>
              <span style={{ fontSize: 13, color: '#6b7280' }}>Pattern</span>
            </div>
          </div>

          {/* Pattern Upload Mode */}
          {form.enablePatternUpload && (
            <div style={{ marginBottom: 20, padding: 16, background: '#fef3c7', border: '1px solid #f59e0b', borderRadius: 8 }}>
              <p style={{ margin: '0 0 12px 0', fontSize: 13, fontWeight: 600, color: '#92400e' }}>
                Upload Pattern Images (e.g., SPV flooring textures)
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div 
                  style={{ display: 'flex', gap: 12, alignItems: 'center' }}
                  onDragOver={(e) => {
                    e.preventDefault()
                    e.currentTarget.style.background = '#fef9c3'
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault()
                    e.currentTarget.style.background = 'transparent'
                  }}
                  onDrop={async (e) => {
                    e.preventDefault()
                    e.currentTarget.style.background = 'transparent'
                    
                    const files = Array.from(e.dataTransfer.files)
                    const imageFiles = files.filter(file => file.type.startsWith('image/'))
                    
                    if (imageFiles.length > 0) {
                      // Auto-switch to pattern mode when images are dropped
                      updateForm('enablePatternUpload', true)
                      
                      for (const file of imageFiles) {
                        const reader = new FileReader()
                        reader.onload = (e) => {
                          const patternImage = {
                            name: file.name,
                            url: e.target?.result as string,
                            isPattern: true
                          }
                          updateForm('patternImages', [...(form.patternImages || []), patternImage])
                        }
                        reader.readAsDataURL(file)
                      }
                    }
                  }}
                >
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={async (e) => {
                      const files = Array.from(e.target.files || [])
                      if (files.length === 0) return
                      
                      // Auto-switch to pattern mode when images are uploaded
                      updateForm('enablePatternUpload', true)
                      
                      for (const file of files) {
                        const reader = new FileReader()
                        reader.onload = (e) => {
                          const patternImage = {
                            name: file.name,
                            url: e.target?.result as string,
                            isPattern: true
                          }
                          updateForm('patternImages', [...(form.patternImages || []), patternImage])
                        }
                        reader.readAsDataURL(file)
                      }
                    }}
                    style={{ display: 'none' }}
                    id="pattern-upload"
                  />
                  <label 
                    htmlFor="pattern-upload"
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8, padding: 16, 
                      background: '#fff', border: '2px dashed #f59e0b', borderRadius: 8,
                      cursor: 'pointer', fontSize: 13, color: '#92400e', flex: 1,
                      justifyContent: 'center', minHeight: 60
                    }}
                  >
                    <Upload style={{ width: 20, height: 20 }} />
                    <span>Click to upload or drag & drop pattern images</span>
                  </label>
                </div>
                
                {/* Pattern Preview */}
                {form.patternImages && form.patternImages.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {form.patternImages.map((pattern, index) => (
                      <div key={index} style={{ position: 'relative' }}>
                        <img 
                          src={pattern.url} 
                          alt={pattern.name}
                          style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8, border: '2px solid #f59e0b' }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const updatedPatterns = form.patternImages.filter((_, i) => i !== index)
                            updateForm('patternImages', updatedPatterns)
                          }}
                          style={{
                            position: 'absolute', top: -4, right: -4, width: 20, height: 20,
                            background: '#ef4444', color: '#fff', border: 'none', borderRadius: '50%',
                            cursor: 'pointer', fontSize: 12, fontWeight: 'bold'
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Predefined swatches */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
            {PREDEFINED_COLORS.map(color => {
              const isSelected = form.availableColors.some(c => c.hex?.toLowerCase() === color.hex?.toLowerCase())
              return (
                <div
                  key={color.hex}
                  title={color.name}
                  onClick={() => {
                    if (isSelected) {
                      updateForm('availableColors', form.availableColors.filter(c => c.hex?.toLowerCase() !== color.hex?.toLowerCase()))
                    } else {
                      updateForm('availableColors', [...form.availableColors, color])
                    }
                  }}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 8,
                    background: color.hex,
                    border: isSelected ? '3px solid #FF6B35' : '2px solid #cbd5e1',
                    cursor: 'pointer',
                    boxShadow: isSelected ? '0 0 0 3px rgba(255,107,53,0.25)' : 'none',
                    transition: 'all 0.15s',
                    position: 'relative'
                  }}
                >
                  {isSelected && (
                    <div style={{
                      position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 16, color: color.hex === '#F5F5F3' || color.hex === '#FAF9F6' ? '#333' : '#fff',
                      fontWeight: 900
                    }}>✓</div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Custom color picker */}
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 16 }}>
            <input
              type="color"
              value={form.customColorHex}
              onChange={e => updateForm('customColorHex', e.target.value)}
              style={{ width: 48, height: 48, border: '2px solid #cbd5e1', borderRadius: 8, cursor: 'pointer', padding: 2 }}
            />
            <input
              type="text"
              value={form.customColorName}
              onChange={e => updateForm('customColorName', e.target.value)}
              placeholder="Color name (e.g. Ocean Blue)"
              style={{ ...inputStyle, flex: 1 }}
              onFocus={(e) => { e.currentTarget.style.borderColor = '#FF6B35'; e.currentTarget.style.boxShadow = '0 0 0 6px rgba(255,107,53,0.15)' }}
              onBlur={(e) => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.boxShadow = 'none' }}
            />
            <button
              type="button"
              onClick={() => {
                if (!form.customColorName.trim()) return
                const newColor: ColorOption = { name: form.customColorName.trim(), hex: form.customColorHex }
                if (!form.availableColors.some(c => c.hex?.toLowerCase() === newColor.hex?.toLowerCase())) {
                  updateForm('availableColors', [...form.availableColors, newColor])
                }
                updateForm('customColorName', '')
                updateForm('customColorHex', '#000000')
              }}
              style={{
                padding: '14px 20px', background: '#FF6B35', color: '#fff', border: 'none',
                borderRadius: 10, fontWeight: 700, fontSize: 15, cursor: 'pointer', whiteSpace: 'nowrap'
              }}
            >
              + Add
            </button>
          </div>

          {/* Selected colors and patterns */}
          {(form.availableColors.length > 0 || (form.patternImages && form.patternImages.length > 0)) && (
            <div style={{ background: '#f8fafc', border: '2px solid #e2e8f0', borderRadius: 12, padding: '14px 16px', marginTop: 4 }}>
              <p style={{ margin: '0 0 10px 0', fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {form.availableColors.length + (form.patternImages?.length || 0)} option{form.availableColors.length + (form.patternImages?.length || 0) !== 1 ? 's' : ''} selected
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {/* Color chips */}
                {form.availableColors.map(color => (
                  <div
                    key={color.hex}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      background: '#ffffff', border: '2px solid #e2e8f0',
                      borderRadius: 100, padding: '6px 14px 6px 8px', fontSize: 13, fontWeight: 600,
                      boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
                    }}
                  >
                    <div style={{ width: 22, height: 22, borderRadius: '50%', background: color.hex, border: '2px solid rgba(0,0,0,0.1)', flexShrink: 0 }} />
                    <span style={{ color: '#0f172a' }}>{color.name}</span>
                    <button
                      type="button"
                      onClick={() => updateForm('availableColors', form.availableColors.filter(c => c.hex?.toLowerCase() !== color.hex?.toLowerCase()))}
                      style={{ background: '#fee2e2', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: 13, padding: '2px 5px', lineHeight: 1, borderRadius: '50%', fontWeight: 700 }}
                    >×</button>
                  </div>
                ))}
                
                {/* Pattern chips */}
                {form.patternImages && form.patternImages.map((pattern, index) => (
                  <div
                    key={`pattern-${index}`}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      background: '#ffffff', border: '2px solid #f59e0b',
                      borderRadius: 100, padding: '6px 14px 6px 8px', fontSize: 13, fontWeight: 600,
                      boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
                    }}
                  >
                    <img 
                      src={pattern.url} 
                      alt={pattern.name}
                      style={{ width: 22, height: 22, borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(0,0,0,0.1)', flexShrink: 0 }} 
                    />
                    <span style={{ color: '#0f172a' }}>{pattern.name}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const updatedPatterns = form.patternImages.filter((_, i) => i !== index)
                        updateForm('patternImages', updatedPatterns)
                      }}
                      style={{ background: '#fee2e2', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: 13, padding: '2px 5px', lineHeight: 1, borderRadius: '50%', fontWeight: 700 }}
                    >×</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div style={{ marginBottom: 32 }}>
          <label style={labelStyle}>Tagline <span style={{ fontWeight: 500, color: '#64748b', fontSize: 16 }}>(optional)</span></label>
          <input
            type="text"
            value={form.tagline}
            onChange={e => updateForm('tagline', e.target.value)}
            placeholder="Short catchy description for listing card"
            style={inputStyle}
            onFocus={(e) => { e.currentTarget.style.borderColor = '#FF6B35'; e.currentTarget.style.boxShadow = '0 0 0 6px rgba(255,107,53,0.15)' }}
            onBlur={(e) => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.boxShadow = 'none' }}
          />
        </div>

        <div style={{ marginBottom: 32 }}>
          <label style={labelStyle}>Product Specs / Trust Line <span style={{ fontWeight: 500, color: '#64748b', fontSize: 16 }}>(optional)</span></label>
          <input
            type="text"
            value={form.productSpecs}
            onChange={e => updateForm('productSpecs', e.target.value)}
            placeholder="e.g., German-inspired precision • FSC-certified • Lifetime warranty"
            style={inputStyle}
            onFocus={(e) => { e.currentTarget.style.borderColor = '#FF6B35'; e.currentTarget.style.boxShadow = '0 0 0 6px rgba(255,107,53,0.15)' }}
            onBlur={(e) => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.boxShadow = 'none' }}
          />
        </div>

        <div style={{ marginBottom: 32, display: 'flex', alignItems: 'center', gap: 12, background: '#f8fafc', border: '2px solid #e2e8f0', borderRadius: 12, padding: '16px 14px' }}>
          <input
            type="checkbox"
            checked={form.customBuildEnabled}
            onChange={e => updateForm('customBuildEnabled', e.target.checked)}
            style={{ width: 20, height: 20, cursor: 'pointer', accentColor: '#FF6B35' }}
          />
          <label style={{ margin: 0, cursor: 'pointer', fontSize: 15, fontWeight: 600, color: '#0f172a', flex: 1 }}>
            ▶ Begin Live Factory Custom Build
          </label>
        </div>

        <div>
          <label style={labelStyle}>Full Description *</label>
          <textarea
            value={form.description}
            onChange={e => updateForm('description', e.target.value)}
            placeholder="Describe your product in detail — features, materials, use cases..."
            rows={7}
            style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6, fontFamily: 'Inter, sans-serif' }}
            onFocus={(e) => { e.currentTarget.style.borderColor = '#FF6B35'; e.currentTarget.style.boxShadow = '0 0 0 6px rgba(255,107,53,0.15)' }}
            onBlur={(e) => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.boxShadow = 'none' }}
          />
        </div>

        <div style={{ marginBottom: 32 }}>
          <label style={labelStyle}>Size <span style={{ fontWeight: 500, color: '#64748b', fontSize: 16 }}>(optional)</span></label>
          <select
            value={form.standardSize}
            onChange={e => updateForm('standardSize', e.target.value)}
            style={inputStyle}
            onFocus={(e) => { e.currentTarget.style.borderColor = '#FF6B35'; e.currentTarget.style.boxShadow = '0 0 0 6px rgba(255,107,53,0.15)' }}
            onBlur={(e) => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.boxShadow = 'none' }}
          >
            <option value="">Not specified</option>
            <option value="10ft">10ft</option>
            <option value="20ft">20ft</option>
            <option value="40ft">40ft</option>
            <option value="60ft">60ft</option>
            <option value="custom">Custom</option>
          </select>
        </div>

        <div style={{ marginBottom: 32 }}>
          <label style={labelStyle}>Bedrooms <span style={{ fontWeight: 500, color: '#64748b', fontSize: 16 }}>(optional)</span></label>
          <select
            value={form.bedrooms}
            onChange={e => updateForm('bedrooms', e.target.value)}
            style={inputStyle}
            onFocus={(e) => { e.currentTarget.style.borderColor = '#FF6B35'; e.currentTarget.style.boxShadow = '0 0 0 6px rgba(255,107,53,0.15)' }}
            onBlur={(e) => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.boxShadow = 'none' }}
          >
            <option value="">Not specified</option>
            <option value="Studio">Studio</option>
            <option value="1">1 Bedroom</option>
            <option value="2">2 Bedrooms</option>
            <option value="3">3 Bedrooms</option>
            <option value="4">4 Bedrooms</option>
            <option value="5+">5+ Bedrooms</option>
          </select>
        </div>

        <div style={{ marginBottom: 32 }}>
          <label style={labelStyle}>Weight <span style={{ fontWeight: 500, color: '#64748b', fontSize: 16 }}>(optional)</span></label>
          <input
            type="text"
            value={form.weight}
            onChange={e => updateForm('weight', e.target.value)}
            placeholder="e.g., 2500 kg, 3 tons"
            style={inputStyle}
            onFocus={(e) => { e.currentTarget.style.borderColor = '#FF6B35'; e.currentTarget.style.boxShadow = '0 0 0 6px rgba(255,107,53,0.15)' }}
            onBlur={(e) => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.boxShadow = 'none' }}
          />
        </div>

        <div style={{ marginBottom: 32 }}>
          <label style={labelStyle}>Lead Time <span style={{ fontWeight: 500, color: '#64748b', fontSize: 16 }}>(optional)</span></label>
          <input
            type="text"
            value={form.leadTime}
            onChange={e => updateForm('leadTime', e.target.value)}
            placeholder="e.g., 8-12 weeks, 3 months"
            style={inputStyle}
            onFocus={(e) => { e.currentTarget.style.borderColor = '#FF6B35'; e.currentTarget.style.boxShadow = '0 0 0 6px rgba(255,107,53,0.15)' }}
            onBlur={(e) => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.boxShadow = 'none' }}
          />
        </div>

        <div>
          <label style={labelStyle}>Product Documents <span style={{ fontWeight: 500, color: '#64748b', fontSize: 16 }}>(optional)</span></label>
          <p style={{ fontSize: 13, color: '#64748b', marginBottom: 16, margin: '0 0 16px 0' }}>
            Upload PDFs, images, specifications, or any files buyers can download
          </p>
          <div style={{
            border: '3px dashed #cbd5e1',
            borderRadius: 12,
            padding: 24,
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s',
            background: '#f8fafc'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#FF6B35'; e.currentTarget.style.background = '#fff5f0' }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.background = '#f8fafc' }}
          onClick={() => {
            const input = document.createElement('input')
            input.type = 'file'
            input.multiple = true
            input.onchange = (e) => {
              const files = Array.from((e.target as HTMLInputElement).files || [])
              if (files.length > 0) {
                handleUploadDocuments(files)
              }
            }
            input.click()
          }}
          >
            <div style={{ fontSize: 32, marginBottom: 12 }}>📄</div>
            <p style={{ margin: '0 0 8px 0', fontSize: 16, fontWeight: 600, color: '#0f172a' }}>
              Click to upload documents
            </p>
            <p style={{ margin: 0, fontSize: 14, color: '#64748b' }}>
              or drag and drop (PDF, images, Excel, Word, etc.)
            </p>
          </div>

          {/* Uploaded documents list */}
          {productDocuments.length > 0 && (
            <div style={{ marginTop: 20, background: '#f8fafc', border: '2px solid #e2e8f0', borderRadius: 12, padding: '14px 16px' }}>
              <p style={{ margin: '0 0 10px 0', fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {productDocuments.length} document{productDocuments.length !== 1 ? 's' : ''} uploaded
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {productDocuments.map(doc => (
                  <div
                    key={doc.id}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      background: '#ffffff', border: '1px solid #e2e8f0',
                      borderRadius: 8, padding: '10px 12px', fontSize: 13, fontWeight: 500,
                      boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
                    }}
                  >
                    <span style={{ fontSize: 14 }}>📎</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.file_name}</div>
                      {doc.file_size && <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>({(doc.file_size / 1024 / 1024).toFixed(2)} MB)</div>}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteDocument(doc.id, `products/${editingProduct?.id}/${doc.file_name}`)}
                      style={{ background: '#fee2e2', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: 12, padding: '4px 8px', lineHeight: 1, borderRadius: '4px', fontWeight: 700 }}
                    >✕</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {uploadingDocuments && (
            <p style={{ fontSize: 13, color: '#FF6B35', marginTop: 12, fontWeight: 500 }}>Uploading documents...</p>
          )}
        </div>

        <div style={{ marginBottom: 32 }}>
          <label style={labelStyle}>Badge Label <span style={{ fontWeight: 500, color: '#64748b', fontSize: 16 }}>(optional)</span></label>
          <input
            type="text"
            value={form.badgeText}
            onChange={e => updateForm('badgeText', e.target.value)}
            placeholder="e.g., In Stock, New Arrival, Limited Edition"
            style={inputStyle}
            onFocus={(e) => { e.currentTarget.style.borderColor = '#FF6B35'; e.currentTarget.style.boxShadow = '0 0 0 6px rgba(255,107,53,0.15)' }}
            onBlur={(e) => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.boxShadow = 'none' }}
          />
          <p style={{ fontSize: 14, color: '#64748b', marginTop: 8 }}>
            Shows on product card (e.g., "In Stock", "New")
          </p>
        </div>
      </div>

      {/* Card 2: Pricing Mode */}
      <div style={cardStyle}>
        <h3 style={sectionTitleStyle}>Pricing Mode</h3>

        <div style={{ display: 'flex', gap: 14, marginBottom: 36 }}>
          {(['fixed', 'quote', 'both'] as const).map(mode => (
            <button
              key={mode}
              onClick={() => updateForm('pricingMode', mode)}
              style={{
                flex: 1,
                padding: '18px 14px',
                background: form.pricingMode === mode ? 'linear-gradient(135deg, #FF6B35 0%, #8B5CF6 100%)' : '#f1f5f9',
                color: form.pricingMode === mode ? 'white' : '#475569',
                border: form.pricingMode === mode ? 'none' : '3px solid #cbd5e1',
                borderRadius: 12,
                fontWeight: 800,
                fontSize: 16,
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: form.pricingMode === mode ? '0 4px 12px rgba(255,107,53,0.3)' : 'none'
              }}
            >
              {mode === 'fixed' ? 'Fixed Price' : mode === 'quote' ? 'Quote Only' : 'Both'}
            </button>
          ))}
        </div>

        <div style={{ marginBottom: 32 }}>
          <label style={labelStyle}>Base Price CAD *</label>
          <input
            type="number"
            value={form.basePrice}
            onChange={e => updateForm('basePrice', e.target.value)}
            placeholder="0.00"
            min="0"
            step="0.01"
            style={inputStyle}
            onFocus={(e) => { e.currentTarget.style.borderColor = '#FF6B35'; e.currentTarget.style.boxShadow = '0 0 0 6px rgba(255,107,53,0.15)' }}
            onBlur={(e) => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.boxShadow = 'none' }}
          />
        </div>

        <div style={{ marginBottom: 32 }}>
          <label style={labelStyle}>Price per sqm <span style={{ fontWeight: 500, color: '#64748b', fontSize: 16 }}>(optional)</span></label>
          <input
            type="number"
            value={form.pricePerSqm}
            onChange={e => updateForm('pricePerSqm', e.target.value)}
            placeholder="For custom sizes"
            min="0"
            step="0.01"
            style={inputStyle}
            onFocus={(e) => { e.currentTarget.style.borderColor = '#FF6B35'; e.currentTarget.style.boxShadow = '0 0 0 6px rgba(255,107,53,0.15)' }}
            onBlur={(e) => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.boxShadow = 'none' }}
          />
        </div>

        <div style={{ marginBottom: 32 }}>
          <label style={labelStyle}>What's included in base price</label>
          <textarea
            value={form.includedInPrice}
            onChange={e => updateForm('includedInPrice', e.target.value)}
            placeholder="e.g., Delivery, Installation, 1-year Warranty"
            rows={4}
            style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6, fontFamily: 'Inter, sans-serif' }}
            onFocus={(e) => { e.currentTarget.style.borderColor = '#FF6B35'; e.currentTarget.style.boxShadow = '0 0 0 6px rgba(255,107,53,0.15)' }}
            onBlur={(e) => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.boxShadow = 'none' }}
          />
        </div>

        <div>
          <label style={labelStyle}>What is NOT included</label>
          <textarea
            value={form.notIncluded}
            onChange={e => updateForm('notIncluded', e.target.value)}
            placeholder="e.g., Site preparation, Utilities connection"
            rows={4}
            style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6, fontFamily: 'Inter, sans-serif' }}
            onFocus={(e) => { e.currentTarget.style.borderColor = '#FF6B35'; e.currentTarget.style.boxShadow = '0 0 0 6px rgba(255,107,53,0.15)' }}
            onBlur={(e) => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.boxShadow = 'none' }}
          />
        </div>
      </div>
    </div>
  )

  // Progress Bar
  const renderProgressBar = () => {
    const steps = ['Basic Info', 'Specs', 'Customize', 'Media', 'Review']
    return (
      <div style={{ marginBottom: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24 }}>
          {steps.map((label, idx) => {
            const stepNum = idx + 1
            const isCompleted = form.step > stepNum
            const isActive = form.step === stepNum
            return (
              <div key={stepNum} style={{ display: 'flex', alignItems: 'center', flex: 1, gap: 20 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, minWidth: 'fit-content' }}>
                  <button
                    onClick={() => goToStep(stepNum)}
                    style={{
                      width: 72,
                      height: 72,
                      borderRadius: '50%',
                      border: 'none',
                      background: isCompleted
                        ? 'linear-gradient(135deg, #10b981, #059669)'
                        : isActive
                        ? 'linear-gradient(135deg, #FF6B35, #8B5CF6)'
                        : '#e2e8f0',
                      color: isCompleted || isActive ? 'white' : '#64748b',
                      fontWeight: 900,
                      fontSize: 28,
                      cursor: form.step >= stepNum ? 'pointer' : 'not-allowed',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                      boxShadow: isActive 
                        ? '0 8px 24px rgba(255,107,53,0.4), 0 0 0 8px rgba(255,107,53,0.1)' 
                        : isCompleted 
                        ? '0 8px 24px rgba(16,185,129,0.3)' 
                        : 'none',
                      transform: isActive ? 'scale(1.1)' : 'scale(1)'
                    }}
                    onMouseEnter={(e) => {
                      if (form.step >= stepNum) {
                        e.currentTarget.style.transform = 'scale(1.15)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = isActive ? 'scale(1.1)' : 'scale(1)'
                    }}
                  >
                    {isCompleted ? '✓' : stepNum}
                  </button>
                  <span style={{
                    fontSize: 16,
                    fontWeight: isActive ? 800 : 600,
                    color: isActive ? '#FF6B35' : isCompleted ? '#10b981' : '#64748b',
                    whiteSpace: 'nowrap',
                    textAlign: 'center',
                    transition: 'all 0.3s'
                  }}>
                    {label}
                  </span>
                </div>
                {idx < 4 && (
                  <div style={{
                    flex: 1,
                    height: 6,
                    background: isCompleted ? 'linear-gradient(90deg, #10b981, #059669)' : '#e2e8f0',
                    borderRadius: 3,
                    transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    boxShadow: isCompleted ? '0 4px 12px rgba(16,185,129,0.3)' : 'none'
                  }} />
                )}
              </div>
            )
          })}
        </div>
        
        {/* Progress percentage bar */}
        <div style={{
          width: '100%',
          height: 8,
          background: '#e2e8f0',
          borderRadius: 4,
          overflow: 'hidden',
          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06)'
        }}>
          <div style={{
            height: '100%',
            width: `${(form.step / 5) * 100}%`,
            background: 'linear-gradient(90deg, #FF6B35, #8B5CF6, #10b981)',
            borderRadius: 4,
            transition: 'width 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
            boxShadow: '0 0 12px rgba(255,107,53,0.5)'
          }} />
        </div>
      </div>
    )
  }

  if (!isOpen) return null

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'transparent',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      fontFamily: 'Inter, sans-serif',
      backdropFilter: 'none',
      padding: '20px'
    }}>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
      `}</style>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      <div style={{
        background: '#ffffff',
        borderRadius: 24,
        width: '100%',
        maxWidth: 1200,
        maxHeight: '95vh',
        overflow: 'auto',
        padding: '50px 70px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        border: '4px solid #e2e8f0'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 40 }}>
          <div>
            <h2 style={{
              margin: '0 0 10px 0',
              fontSize: 42,
              fontWeight: 900,
              background: 'linear-gradient(135deg, #FF6B35 0%, #8B5CF6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              letterSpacing: '-0.03em',
              lineHeight: 1.1
            }}>
              Add New Product
            </h2>
            <p style={{ margin: 0, color: '#475569', fontSize: 20, fontWeight: 600 }}>
              Step {form.step} of 5 — Fill in the details to list your product
            </p>
          </div>
          <button
            onClick={handleClose}
            style={{
              background: '#f1f5f9',
              border: '3px solid #cbd5e1',
              fontSize: 28,
              color: '#475569',
              cursor: 'pointer',
              width: 56,
              height: 56,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 14,
              transition: 'all 0.2s',
              flexShrink: 0
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#FF6B35'; e.currentTarget.style.color = '#FF6B35'; e.currentTarget.style.background = '#fff5f0' }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.color = '#475569'; e.currentTarget.style.background = '#f1f5f9' }}
          >
            ✕
          </button>
        </div>

        {renderProgressBar()}

        {error && (
          <div style={{
            background: '#fee2e2',
            color: '#7f1d1d',
            padding: '28px 32px',
            borderRadius: 14,
            marginBottom: 40,
            fontSize: 19,
            fontWeight: 600,
            border: '3px solid #fca5a5'
          }}>
            {error}
          </div>
        )}

        {form.step === 1 && renderStep1()}

        {form.step === 2 && (
          <div style={{ background: '#ffffff', padding: 50, borderRadius: 16, border: 'none', textAlign: 'center', color: '#6b7280', fontSize: 20, fontWeight: 500 }}>
            Specifications step coming soon
          </div>
        )}
        {form.step === 3 && (
          <div style={{ background: '#ffffff', padding: 50, borderRadius: 16, border: 'none', textAlign: 'center', color: '#6b7280', fontSize: 20, fontWeight: 500 }}>
            Customization step coming soon
          </div>
        )}
        {form.step === 4 && (
          <div style={{ background: '#ffffff', padding: 50, borderRadius: 16, border: 'none', textAlign: 'center', color: '#6b7280', fontSize: 20, fontWeight: 500 }}>
            Media step coming soon
          </div>
        )}
        {form.step === 5 && (
          <div style={{ background: '#ffffff', padding: 50, borderRadius: 16, border: 'none', textAlign: 'center', color: '#6b7280', fontSize: 20, fontWeight: 500 }}>
            Review step coming soon
          </div>
        )}

        {/* Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 50, paddingTop: 36, borderTop: '4px solid #e2e8f0' }}>
          <button
            onClick={handleBack}
            disabled={form.step === 1}
            style={{
              padding: '18px 36px',
              background: form.step === 1 ? '#f1f5f9' : '#ffffff',
              color: form.step === 1 ? '#cbd5e1' : '#475569',
              border: `3px solid ${form.step === 1 ? '#e2e8f0' : '#cbd5e1'}`,
              borderRadius: 12,
              fontWeight: 800,
              fontSize: 18,
              cursor: form.step === 1 ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => { if (form.step !== 1) { e.currentTarget.style.borderColor = '#FF6B35'; e.currentTarget.style.color = '#FF6B35' } }}
            onMouseLeave={(e) => { if (form.step !== 1) { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.color = '#475569' } }}
          >
            ← Back
          </button>

          <div style={{ display: 'flex', gap: 18 }}>
            <button
              onClick={handleClose}
              style={{
                padding: '18px 36px',
                background: '#ffffff',
                color: '#475569',
                border: '3px solid #cbd5e1',
                borderRadius: 12,
                fontWeight: 800,
                fontSize: 18,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#94a3b8'; e.currentTarget.style.color = '#0f172a' }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.color = '#475569' }}
            >
              Cancel
            </button>
            <button
              onClick={handlePublish}
              disabled={loading}
              style={{
                padding: '18px 44px',
                background: loading ? '#9ca3af' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: 'white',
                border: 'none',
                borderRadius: 12,
                fontWeight: 800,
                fontSize: 18,
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 4px 16px rgba(16,185,129,0.35)'
              }}
              onMouseEnter={e => { if (!loading) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(16,185,129,0.45)' } }}
              onMouseLeave={e => { if (!loading) { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(16,185,129,0.35)' } }}
            >
              {loading ? 'Publishing...' : 'Publish Now ✓'}
            </button>
            {form.step < 5 && (
              <button
                onClick={handleNext}
                style={{
                  padding: '18px 44px',
                  background: 'linear-gradient(135deg, #FF6B35 0%, #8B5CF6 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 12,
                  fontWeight: 800,
                  fontSize: 18,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: '0 4px 16px rgba(255,107,53,0.35)'
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(255,107,53,0.45)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(255,107,53,0.35)' }}
              >
                Next Step →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
