import { useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client-simple'
import { Link, useParams, useNavigate } from 'react-router-dom'
import ConstructionHeader from '@/construction/components/ConstructionHeader'

const COLORS = { dark: '#1a2332', green: '#63c18a', lightGreen: '#e8f5ee', background: '#f5f3ef', border: '#e8e4dc', grey: '#666', white: '#ffffff' }

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
const [activeFilter, setActiveFilter] = useState('all')

  useEffect(() => {
    const loadProduct = async () => {
      setLoading(true)
      setError('')

      const { data: productData, error: productError } = await supabase
        .from('construction_products')
        .select('id, title, slug, description, price_cad, product_type, size_ft, bedrooms, bathrooms, area_sqm, lead_time, frame_type, shipping_port, supplier_id, created_at')
        .eq('slug', slug)
        .single()

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
      
      {/* Header */}
      <ConstructionHeader />

      {/* Hero Section - Product Specific */}
      <section style={{
        background: 'linear-gradient(135deg, #1a2332 0%, #2d1b4e 100%)',
        padding: '100px 24px 80px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '400px', height: '400px', background: `radial-gradient(circle, #63c18a22 0%, transparent 70%)`, pointerEvents: 'none' }} />
        <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-block', background: '#e8f5ee', color: '#1a2332', padding: '4px 12px', borderRadius: '100px', fontSize: '12px', fontWeight: 600, marginBottom: '24px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {product.product_type}
          </div>
          <h1 style={{ color: '#ffffff', fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 700, fontFamily: "'Sora', sans-serif", lineHeight: 1.2, marginBottom: '20px' }}>
            {product.title}
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '18px', lineHeight: 1.6, maxWidth: '600px', margin: '0 auto' }}>
            {product.description?.substring(0, 200)}{product.description && product.description.length > 200 ? '...' : ''}
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginTop: '32px' }}>
            <Link to="/construction" style={{
              background: '#63c18a',
              color: '#1a2332',
              textDecoration: 'none',
              padding: '12px 32px',
              borderRadius: 8,
              fontWeight: 600,
              fontSize: 16
            }}>
              ← Back to Products
            </Link>
            <button
              onClick={() => setShowQuoteForm(!showQuoteForm)}
              style={{
                background: 'linear-gradient(135deg, #FF6B35 0%, #8B5CF6 100%)',
                color: 'white',
                border: 'none',
                padding: '12px 32px',
                borderRadius: 8,
                fontWeight: 600,
                fontSize: 16,
                cursor: 'pointer'
              }}
            >
              {showQuoteForm ? 'Cancel' : 'Request Quote'}
            </button>
          </div>
        </div>
      </section>

      {/* Filter Bar */}
      <div style={{ background: COLORS.white, borderBottom: '1px solid ' + COLORS.border, position: 'sticky', top: '72px', zIndex: 900 }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '16px 24px', display: 'flex', gap: '12px', overflowX: 'auto' }}>
          {['all', 'expandable', 'foldable', 'flatpack', 'capsule', 'modular'].map(f => (
            <Link key={f} to="/construction" style={{
              padding: '10px 20px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 600,
              textDecoration: 'none',
              whiteSpace: 'nowrap',
              background: activeFilter === f ? COLORS.dark : 'transparent',
              color: activeFilter === f ? COLORS.white : COLORS.grey,
              border: '1px solid ' + (activeFilter === f ? COLORS.dark : COLORS.border)
            }}>
              {f === 'all' ? 'All Types' : f.charAt(0).toUpperCase() + f.slice(1)}
            </Link>
          ))}
        </div>
      </div>

      {/* Product Details Section */}
      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '60px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', background: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
          
          {/* Left: Images */}
          <div style={{ padding: '40px', background: '#f5f3ef' }}>
            {/* Main Image */}
            <div style={{
              height: 400,
              background: '#f5f3ef',
              borderRadius: '12px',
              overflow: 'hidden',
              marginBottom: '20px',
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
              <div style={{ display: 'flex', gap: '12px', overflowX: 'auto' }}>
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
            <div style={{ marginBottom: '24px' }}>
              <h1 style={{
                margin: '0 0 12px 0',
                fontSize: 32,
                fontWeight: 700,
                color: '#1a2332',
                fontFamily: "'Sora', sans-serif"
              }}>
                {product.title}
              </h1>
              <p style={{ margin: 0, fontSize: 14, color: '#64748b' }}>
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
              marginBottom: '24px',
              fontFamily: "'Sora', sans-serif"
            }}>
              ${product.price_cad.toLocaleString()} <span style={{ fontSize: 16, fontWeight: 400, color: '#64748b' }}>CAD</span>
            </div>

            {/* Specs */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
              {product.size_ft && (
                <div style={{ background: '#f5f3ef', padding: '12px', borderRadius: 8 }}>
                  <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>Size</div>
                  <div style={{ fontWeight: 600, color: '#1a2332' }}>{product.size_ft}</div>
                </div>
              )}
              {product.bedrooms && (
                <div style={{ background: '#f5f3ef', padding: '12px', borderRadius: 8 }}>
                  <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>Bedrooms</div>
                  <div style={{ fontWeight: 600, color: '#1a2332' }}>{product.bedrooms}</div>
                </div>
              )}
              {product.bathrooms && (
                <div style={{ background: '#f5f3ef', padding: '12px', borderRadius: 8 }}>
                  <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>Bathrooms</div>
                  <div style={{ fontWeight: 600, color: '#1a2332' }}>{product.bathrooms}</div>
                </div>
              )}
              {product.lead_time && (
                <div style={{ background: '#f5f3ef', padding: '12px', borderRadius: 8 }}>
                  <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>Lead Time</div>
                  <div style={{ fontWeight: 600, color: '#1a2332' }}>{product.lead_time}</div>
                </div>
              )}
              {product.area_sqm && (
                <div style={{ background: '#f5f3ef', padding: '12px', borderRadius: 8 }}>
                  <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>Area</div>
                  <div style={{ fontWeight: 600, color: '#1a2332' }}>{product.area_sqm} sqm</div>
                </div>
              )}
              {product.frame_type && (
                <div style={{ background: '#f5f3ef', padding: '12px', borderRadius: 8 }}>
                  <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>Frame</div>
                  <div style={{ fontWeight: 600, color: '#1a2332' }}>{product.frame_type}</div>
                </div>
              )}
            </div>

            {/* Description */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ margin: '0 0 12px 0', color: '#1a2332', fontFamily: "'Sora', sans-serif" }}>About this product</h3>
              <p style={{ margin: 0, color: '#64748b', lineHeight: 1.6 }}>{product.description}</p>
            </div>

            {/* CTA Buttons */}
            <div style={{ display: 'flex', gap: '12px', marginTop: 'auto' }}>
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
                onMouseEnter={(e) => { e.currentTarget.style.background = '#52b373' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#63c18a' }}
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
              }} onMouseEnter={(e) => { e.currentTarget.style.background = '#2d3a4a' }} onMouseLeave={(e) => { e.currentTarget.style.background = '#1a2332' }}>
                Custom Build
              </Link>
            </div>
          </div>
        </div>

        {/* Quote Form Modal */}
        {showQuoteForm && (
          <div style={{ marginTop: '40px', padding: '40px', background: 'white', borderRadius: '16px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
            <h3 style={{ margin: '0 0 16px 0', color: '#1a2332', fontFamily: "'Sora', sans-serif" }}>Request a Custom Quote</h3>
            <p style={{ color: '#64748b', marginBottom: '20px' }}>Tell the supplier about your specific needs and they'll get back to you with a custom quote.</p>
            <textarea
              value={quoteMessage}
              onChange={(e) => setQuoteMessage(e.target.value)}
              placeholder="Describe your requirements, customizations, timeline, etc."
              style={{
                width: '100%',
                minHeight: 120,
                padding: '12px',
                border: '1px solid #e8e4dc',
                borderRadius: 8,
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 14,
                marginBottom: '16px',
                resize: 'vertical'
              }}
            />
            <div style={{ display: 'flex', gap: '12px' }}>
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
                onClick={() => { setShowQuoteForm(false); setQuoteMessage('') }}
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
      </main>
    </div>
  )
}
