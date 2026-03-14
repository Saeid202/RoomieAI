import { useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client-simple'
import { Link, useParams, useNavigate } from 'react-router-dom'

interface Product {
  id: string
  title: string
  slug: string
  description: string
  price_cad: number
  product_type: string
  size_ft: string | null
  bedrooms: string | null
  bathrooms: string | null
  area_sqm: number | null
  lead_time: string | null
  frame_type: string | null
  shipping_port: string | null
  created_at: string
  construction_product_images: Array<{ id: string; public_url: string; is_primary: boolean }>
  construction_supplier_profiles: { company_name: string; shipping_port: string }
}

export default function ConstructionProductDetail() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [showQuoteForm, setShowQuoteForm] = useState(false)
  const [quoteMessage, setQuoteMessage] = useState('')
  const [submittingQuote, setSubmittingQuote] = useState(false)

  useEffect(() => {
    const loadProduct = async () => {
      setLoading(true)
      setError('')

      console.log('=== PRODUCT DETAIL DEBUG ===')
      console.log('Slug from URL:', slug)

      // First test: can we query the table at all?
      const { data: allProducts, error: listError } = await supabase
        .from('construction_products')
        .select('id, slug, status, title')

      console.log('All products:', allProducts)
      console.log('List error:', listError)

      const { data: productData, error: productError } = await supabase
        .from('construction_products')
        .select('id, title, slug, description, price_cad, product_type, size_ft, bedrooms, bathrooms, area_sqm, lead_time, frame_type, shipping_port, supplier_id, created_at')
        .eq('slug', slug)
        .single()

      console.log('Product data:', productData)
      console.log('Product error:', productError)

      if (productError || !productData) {
        setError('Product not found')
        setLoading(false)
        return
      }

      // Fetch images separately
      const { data: images } = await supabase
        .from('construction_product_images')
        .select('id, public_url, is_primary')
        .eq('product_id', productData.id)

      // Fetch supplier separately
      const { data: supplier } = await supabase
        .from('construction_supplier_profiles')
        .select('company_name, shipping_port')
        .eq('id', productData.supplier_id)
        .single()

      console.log('Images:', images)
      console.log('Supplier:', supplier)

      setProduct({
        ...productData,
        construction_product_images: images || [],
        construction_supplier_profiles: supplier || { company_name: '', shipping_port: '' }
      } as any)
      const primaryImg = (images || []).find((img: any) => img.is_primary)
      setSelectedImage(primaryImg?.public_url || (images || [])[0]?.public_url || null)
      setLoading(false)
    }

    loadProduct()
  }, [slug])

  const handleRequestQuote = async () => {
    if (!product) return
    
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      navigate('/construction/login')
      return
    }

    setSubmittingQuote(true)
    try {
      const { error } = await supabase
        .from('construction_quotes')
        .insert({
          buyer_id: session.user.id,
          supplier_id: product.construction_supplier_profiles?.company_name ? 
            (await supabase
              .from('construction_supplier_profiles')
              .select('id')
              .eq('company_name', product.construction_supplier_profiles.company_name)
              .single()).data?.id : null,
          product_id: product.id,
          message: quoteMessage,
          status: 'pending'
        })

      if (error) throw error

      setShowQuoteForm(false)
      setQuoteMessage('')
      alert('Quote request sent successfully!')
    } catch (err) {
      alert('Failed to send quote request')
      console.error(err)
    }
    setSubmittingQuote(false)
  }

  if (loading) {
    return (
      <div style={{ fontFamily: "'DM Sans', sans-serif", minHeight: '100vh', background: '#f5f3ef', padding: '40px' }}>
        <div style={{ textAlign: 'center', color: '#64748b' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>⟳</div>
          Loading product...
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div style={{ fontFamily: "'DM Sans', sans-serif", minHeight: '100vh', background: '#f5f3ef', padding: '40px' }}>
        <div style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ color: '#1a2332', marginBottom: 16 }}>Product Not Found</h2>
          <p style={{ color: '#64748b', marginBottom: 24 }}>{error}</p>
          <Link to="/construction" style={{
            background: '#63c18a',
            color: '#1a2332',
            textDecoration: 'none',
            padding: '12px 24px',
            borderRadius: 6,
            fontWeight: 600,
            display: 'inline-block'
          }}>
            Back to Products
          </Link>
        </div>
      </div>
    )
  }

  const images = product.construction_product_images || []
  const primaryImage = images.find(img => img.is_primary)
  const displayImage = selectedImage || primaryImage?.public_url || images[0]?.public_url

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", minHeight: '100vh', background: '#f5f3ef' }}>
      <link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700&family=DM+Sans:wght@400;500&display=swap" rel="stylesheet" />

      {/* Navigation */}
      <nav style={{
        background: '#1a2332',
        padding: '0 40px',
        height: 64,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <Link to="/construction" style={{
          textDecoration: 'none',
          color: 'white',
          fontWeight: 700,
          fontSize: 20,
          fontFamily: "'Sora', sans-serif"
        }}>
          HomieAI <span style={{ color: '#63c18a' }}>AI</span>
        </Link>
        <Link to="/construction" style={{
          color: 'white',
          textDecoration: 'none',
          fontSize: 14,
          fontWeight: 500,
          padding: '8px 16px',
          border: '1px solid rgba(255,255,255,0.3)',
          borderRadius: 6,
          transition: 'all 0.2s'
        }} onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = '#63c18a'
          e.currentTarget.style.color = '#63c18a'
        }} onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'
          e.currentTarget.style.color = 'white'
        }}>
          ← Back to Products
        </Link>
      </nav>

      {/* Main Content */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, background: 'white', borderRadius: 16, overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
          
          {/* Left: Images */}
          <div style={{ padding: '40px' }}>
            {/* Main Image */}
            <div style={{
              height: 400,
              background: '#f5f3ef',
              borderRadius: 12,
              overflow: 'hidden',
              marginBottom: 20,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {displayImage ? (
                <img
                  src={displayImage}
                  alt={product.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <div style={{ fontSize: 48, color: '#cbd5e1' }}>🏠</div>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {images.length > 1 && (
              <div style={{ display: 'flex', gap: 12, overflowX: 'auto' }}>
                {images.map(img => (
                  <img
                    key={img.id}
                    src={img.public_url}
                    alt="Thumbnail"
                    onClick={() => setSelectedImage(img.public_url)}
                    style={{
                      width: 80,
                      height: 80,
                      objectFit: 'cover',
                      borderRadius: 8,
                      cursor: 'pointer',
                      border: selectedImage === img.public_url ? '2px solid #63c18a' : '2px solid #e8e4dc',
                      transition: 'all 0.2s'
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Right: Details */}
          <div style={{ padding: '40px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ marginBottom: 24 }}>
              <div style={{
                display: 'inline-block',
                background: '#e8f5ee',
                color: '#1a2332',
                padding: '4px 12px',
                borderRadius: 4,
                fontSize: 11,
                fontWeight: 700,
                textTransform: 'uppercase',
                marginBottom: 12
              }}>
                {product.product_type}
              </div>

              <h1 style={{
                margin: '0 0 12px 0',
                fontSize: 32,
                fontWeight: 700,
                color: '#1a2332',
                fontFamily: "'Sora', sans-serif"
              }}>
                {product.title}
              </h1>

              <p style={{
                margin: 0,
                fontSize: 14,
                color: '#64748b'
              }}>
                by {product.construction_supplier_profiles?.company_name}
                {product.construction_supplier_profiles?.shipping_port && (
                  <> • Ships from {product.construction_supplier_profiles.shipping_port}</>
                )}
              </p>
            </div>

            {/* Price */}
            <div style={{
              fontSize: 28,
              fontWeight: 800,
              color: '#1a2332',
              marginBottom: 24,
              fontFamily: "'Sora', sans-serif"
            }}>
              ${product.price_cad.toLocaleString()} <span style={{ fontSize: 16, fontWeight: 400, color: '#64748b' }}>CAD</span>
            </div>

            {/* Specs */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
              {product.size_ft && (
                <div style={{ background: '#f5f3ef', padding: 12, borderRadius: 8 }}>
                  <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>Size</div>
                  <div style={{ fontWeight: 600, color: '#1a2332' }}>{product.size_ft}</div>
                </div>
              )}
              {product.bedrooms && (
                <div style={{ background: '#f5f3ef', padding: 12, borderRadius: 8 }}>
                  <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>Bedrooms</div>
                  <div style={{ fontWeight: 600, color: '#1a2332' }}>{product.bedrooms}</div>
                </div>
              )}
              {product.bathrooms && (
                <div style={{ background: '#f5f3ef', padding: 12, borderRadius: 8 }}>
                  <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>Bathrooms</div>
                  <div style={{ fontWeight: 600, color: '#1a2332' }}>{product.bathrooms}</div>
                </div>
              )}
              {product.lead_time && (
                <div style={{ background: '#f5f3ef', padding: 12, borderRadius: 8 }}>
                  <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>Lead Time</div>
                  <div style={{ fontWeight: 600, color: '#1a2332' }}>{product.lead_time}</div>
                </div>
              )}
              {product.area_sqm && (
                <div style={{ background: '#f5f3ef', padding: 12, borderRadius: 8 }}>
                  <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>Area</div>
                  <div style={{ fontWeight: 600, color: '#1a2332' }}>{product.area_sqm} sqm</div>
                </div>
              )}
              {product.frame_type && (
                <div style={{ background: '#f5f3ef', padding: 12, borderRadius: 8 }}>
                  <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>Frame</div>
                  <div style={{ fontWeight: 600, color: '#1a2332' }}>{product.frame_type}</div>
                </div>
              )}
            </div>

            {/* Description */}
            <div style={{ marginBottom: 24 }}>
              <h3 style={{ margin: '0 0 12px 0', color: '#1a2332', fontFamily: "'Sora', sans-serif" }}>About this product</h3>
              <p style={{ margin: 0, color: '#64748b', lineHeight: 1.6 }}>{product.description}</p>
            </div>

            {/* CTA Buttons */}
            <div style={{ display: 'flex', gap: 12, marginTop: 'auto' }}>
              <button
                onClick={() => setShowQuoteForm(!showQuoteForm)}
                style={{
                  flex: 1,
                  background: '#63c18a',
                  color: '#1a2332',
                  border: 'none',
                  padding: '14px 24px',
                  borderRadius: 8,
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#52b373'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#63c18a'
                }}
              >
                {showQuoteForm ? 'Cancel' : 'Request Quote'}
              </button>
              <Link to="/construction/custom" style={{
                flex: 1,
                background: '#1a2332',
                color: 'white',
                border: 'none',
                padding: '14px 24px',
                borderRadius: 8,
                fontWeight: 600,
                fontSize: 14,
                textDecoration: 'none',
                textAlign: 'center',
                transition: 'all 0.2s',
                cursor: 'pointer'
              }} onMouseEnter={(e) => {
                e.currentTarget.style.background = '#2d3a4a'
              }} onMouseLeave={(e) => {
                e.currentTarget.style.background = '#1a2332'
              }}>
                Custom Build
              </Link>
            </div>
          </div>
        </div>

        {/* Quote Form Modal */}
        {showQuoteForm && (
          <div style={{
            marginTop: 40,
            padding: 40,
            background: 'white',
            borderRadius: 16,
            boxShadow: '0 4px 16px rgba(0,0,0,0.08)'
          }}>
            <h3 style={{ margin: '0 0 16px 0', color: '#1a2332', fontFamily: "'Sora', sans-serif" }}>
              Request a Custom Quote
            </h3>
            <p style={{ color: '#64748b', marginBottom: 20 }}>
              Tell the supplier about your specific needs and they'll get back to you with a custom quote.
            </p>
            <textarea
              value={quoteMessage}
              onChange={(e) => setQuoteMessage(e.target.value)}
              placeholder="Describe your requirements, customizations, timeline, etc."
              style={{
                width: '100%',
                minHeight: 120,
                padding: 12,
                border: '1px solid #e8e4dc',
                borderRadius: 8,
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 14,
                marginBottom: 16,
                resize: 'vertical'
              }}
            />
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={handleRequestQuote}
                disabled={submittingQuote || !quoteMessage.trim()}
                style={{
                  background: '#63c18a',
                  color: '#1a2332',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: 8,
                  fontWeight: 600,
                  cursor: submittingQuote || !quoteMessage.trim() ? 'not-allowed' : 'pointer',
                  opacity: submittingQuote || !quoteMessage.trim() ? 0.6 : 1,
                  transition: 'all 0.2s'
                }}
              >
                {submittingQuote ? 'Sending...' : 'Send Quote Request'}
              </button>
              <button
                onClick={() => {
                  setShowQuoteForm(false)
                  setQuoteMessage('')
                }}
                style={{
                  background: '#f5f3ef',
                  color: '#1a2332',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: 8,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
