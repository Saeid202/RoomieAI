import { useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client-simple'
import { Link, useParams, useNavigate } from 'react-router-dom'
import ConstructionHeader from '@/construction/components/ConstructionHeader'
import { ProductDetailSkeleton } from '@/construction/components/ProductDetailSkeleton'
import { useProductBySlug } from '@/hooks/useProductData'

const C = {
  bg: '#F8F5F0',
  white: '#ffffff',
  charcoal: '#1C1C1E',
  charcoalLight: '#3a3a3c',
  gold: '#B8965A',
  goldLight: '#D4AF72',
  goldBorder: '#C9A96E',
  sage: '#7A9E7E',
  sageDark: '#5E8262',
  grey: '#8a8a8e',
  greyLight: '#f0ede8',
  border: '#E8E2D9',
  text: '#2c2c2e',
  subtext: '#6c6c70',
}

const DETAIL_TABS = ['Ready to Install', 'Customize Features', 'Dimensions', 'Specifications']

// Default finishes for backward compatibility
const DEFAULT_FINISHES = [
  { label: 'Matte White', color: '#F5F5F3', border: '#ddd' },
  { label: 'Warm Oak', color: '#C4956A', border: '#b07d4e' },
  { label: 'Matte Black', color: '#1C1C1E', border: '#333' },
  { label: 'Stone Grey', color: '#8E8E93', border: '#777' },
  { label: 'Natural Walnut', color: '#7B5E3A', border: '#5a4020' },
]

export default function ConstructionProductDetail() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { data: product, isLoading, error } = useProductBySlug(slug || '')
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState(0)
  const [selectedFinish, setSelectedFinish] = useState(0)
  const [showQuoteForm, setShowQuoteForm] = useState(false)
  const [quoteMessage, setQuoteMessage] = useState('')
  const [submittingQuote, setSubmittingQuote] = useState(false)

  // Get finishes from product or use defaults
  const getFinishes = () => {
    if (product?.available_colors && product.available_colors.length > 0) {
      return product.available_colors.map((color: any) => ({
        label: color.name,
        color: color.hex,
        border: color.hex === '#F5F5F3' || color.hex === '#FAF9F6' ? '#ddd' : '#333'
      }))
    }
    return DEFAULT_FINISHES
  }

  const finishes = getFinishes()

  useEffect(() => {
    if (product?.construction_product_images) {
      const primaryImg = product.construction_product_images.find(img => img.is_primary)
      setSelectedImage(primaryImg?.public_url || product.construction_product_images[0]?.public_url || null)
    }
  }, [product])

  const handleRequestQuote = async () => {
    if (!product) return
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { navigate('/construction/login'); return }
    setSubmittingQuote(true)
    try {
      const { error } = await supabase.from('construction_quotes').insert({
        buyer_id: session.user.id,
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
    }
    setSubmittingQuote(false)
  }

  if (isLoading) return <ProductDetailSkeleton />

  if (error || !product) {
    return (
      <div style={{ fontFamily: 'system-ui, sans-serif', minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: C.charcoal, fontSize: 20, fontWeight: 600, marginBottom: 8 }}>Product Not Found</p>
          <p style={{ color: C.subtext, marginBottom: 24 }}>Product not found or no longer available</p>
          <Link to="/construction" style={{ background: C.sage, color: C.white, textDecoration: 'none', padding: '12px 28px', borderRadius: 100, fontWeight: 600, fontSize: 14 }}>
            Back to Products
          </Link>
        </div>
      </div>
    )
  }

  const images = product.construction_product_images || []
  const displayImage = selectedImage || images.find(img => img.is_primary)?.public_url || images[0]?.public_url

  return (
    <div style={{ fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif", minHeight: '100vh', background: C.bg }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Cormorant+Garamond:wght@300;400;500;600&display=swap" rel="stylesheet" />

      <ConstructionHeader />

      {/* Category filter bar — not sticky, sits naturally in flow */}
      <div style={{ background: C.white, borderBottom: `1px solid ${C.border}`, marginTop: '72px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '14px 32px', display: 'flex', gap: 10 }}>
          {['All Types', 'Pre-fabricated Houses', 'Cabinets'].map((label, i) => (
            <Link key={label} to="/construction" style={{
              padding: '8px 20px',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              textDecoration: 'none',
              whiteSpace: 'nowrap',
              background: i === 0 ? C.charcoal : 'transparent',
              color: i === 0 ? C.white : C.grey,
              border: `1px solid ${i === 0 ? C.charcoal : C.border}`,
              transition: 'all 0.2s',
            }}>
              {label}
            </Link>
          ))}
        </div>
      </div>

      {/* Main content — 60px gap below the filter bar */}
      <main style={{ maxWidth: 1280, margin: '0 auto', padding: '60px 32px 80px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '55% 45%',
          gap: 0,
          background: C.white,
          borderRadius: 20,
          overflow: 'hidden',
          boxShadow: '0 8px 48px rgba(0,0,0,0.07)',
        }}>

          {/* ── LEFT: Image panel ── */}
          <div style={{ position: 'relative', overflow: 'hidden', background: C.greyLight }}>
            {/* Gold border frame — fills entire left column */}
            <div style={{
              position: 'absolute',
              inset: 16,
              borderRadius: 12,
              padding: 5,
              background: `linear-gradient(135deg, ${C.goldBorder} 0%, ${C.goldLight} 50%, ${C.goldBorder} 100%)`,
              boxShadow: '0 12px 40px rgba(0,0,0,0.12)',
            }}>
              <div style={{ borderRadius: 8, overflow: 'hidden', background: '#e8e4dc', width: '100%', height: '100%' }}>
                {displayImage ? (
                  <img
                    src={displayImage}
                    alt={product.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    loading="eager"
                  />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.grey, fontSize: 48 }}>🏠</div>
                )}
              </div>
            </div>

            {/* "See in Your Space" floating pill */}
            <div style={{
              position: 'absolute',
              bottom: 32,
              right: 32,
              background: 'rgba(28,28,30,0.88)',
              backdropFilter: 'blur(8px)',
              color: C.white,
              padding: '8px 16px',
              borderRadius: 100,
              fontSize: 12,
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              cursor: 'pointer',
              letterSpacing: '0.02em',
              zIndex: 2,
            }}>
              <span style={{ fontSize: 14 }}>⬡</span>
              See in Your Space
            </div>
          </div>

          {/* ── RIGHT: Details panel ── */}
          <div style={{ padding: '48px 44px', display: 'flex', flexDirection: 'column', borderLeft: `1px solid ${C.border}` }}>

            {/* Title + Price on one line */}
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 16, marginBottom: 8 }}>
              <h1 style={{
                margin: 0,
                fontSize: 34,
                fontWeight: 300,
                color: C.charcoal,
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                lineHeight: 1.2,
                letterSpacing: '-0.01em',
              }}>
                {product.title}
              </h1>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <span style={{ fontSize: 22, fontWeight: 600, color: C.charcoal }}>
                  ${product.price_cad.toLocaleString()} CAD
                </span>
                <span style={{ fontSize: 13, color: C.subtext, marginLeft: 5 }}>per module</span>
              </div>
            </div>

            <p style={{ margin: '0 0 24px 0', fontSize: 12, color: C.subtext, letterSpacing: '0.03em' }}>
              Factory-direct&nbsp;&nbsp;•&nbsp;&nbsp;{product.lead_time || '4–6 weeks'}
            </p>

            {/* Elegant tabs */}
            <div style={{ display: 'flex', gap: 0, borderBottom: `1px solid ${C.border}`, marginBottom: 28 }}>
              {DETAIL_TABS.map((tab, i) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(i)}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: '10px 16px',
                    fontSize: 12,
                    fontWeight: activeTab === i ? 600 : 400,
                    color: activeTab === i ? C.charcoal : C.grey,
                    cursor: 'pointer',
                    borderBottom: activeTab === i ? `2px solid ${C.gold}` : '2px solid transparent',
                    marginBottom: -1,
                    letterSpacing: '0.02em',
                    transition: 'all 0.2s',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Tab content */}
            {activeTab === 0 && (
              <div style={{ flex: 1 }}>
                {/* Finish swatches */}
                <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                  {finishes.map((finish, i) => (
                    <div
                      key={finish.label}
                      onClick={() => setSelectedFinish(i)}
                      style={{ cursor: 'pointer', textAlign: 'center' }}
                    >
                      <div style={{
                        width: 56,
                        height: 56,
                        borderRadius: 8,
                        background: finish.color,
                        border: selectedFinish === i ? `2px solid ${C.gold}` : `1px solid ${finish.border}`,
                        boxShadow: selectedFinish === i ? `0 0 0 3px ${C.goldLight}44` : 'none',
                        transition: 'all 0.2s',
                        marginBottom: 6,
                      }} />
                      <div style={{ fontSize: 10, color: C.charcoal, fontWeight: 500, lineHeight: 1.3, maxWidth: 56 }}>{finish.label}</div>
                      <div style={{ fontSize: 9, color: C.sage, fontWeight: 500, marginTop: 2 }}>In Stock</div>
                    </div>
                  ))}
                </div>
                <p style={{ fontSize: 11, color: C.subtext, margin: '0 0 20px 0', letterSpacing: '0.02em' }}>
                  {finishes.length} finish{finishes.length !== 1 ? 'es' : ''} available&nbsp;&nbsp;•&nbsp;&nbsp;Live preview updates on main image
                </p>

                {/* Trust line */}
                <p style={{ fontSize: 12, color: C.subtext, fontStyle: 'italic', margin: '0 0 28px 0', letterSpacing: '0.02em' }}>
                  German-inspired precision&nbsp;&nbsp;•&nbsp;&nbsp;FSC-certified&nbsp;&nbsp;•&nbsp;&nbsp;Lifetime mechanism warranty
                </p>
              </div>
            )}

            {activeTab === 1 && (
              <div style={{ flex: 1, paddingBottom: 28 }}>
                <p style={{ color: C.subtext, fontSize: 13, lineHeight: 1.7 }}>{product.description || 'Custom configuration options available. Contact us for personalized specifications.'}</p>
              </div>
            )}

            {activeTab === 2 && (
              <div style={{ flex: 1, paddingBottom: 28 }}>
                {[
                  ['Width', product.size_ft || 'Custom'],
                  ['Bedrooms', product.bedrooms || '—'],
                  ['Bathrooms', product.bathrooms || '—'],
                  ['Area', product.area_sqm ? `${product.area_sqm} m²` : '—'],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: `1px solid ${C.border}`, fontSize: 13 }}>
                    <span style={{ color: C.subtext }}>{k}</span>
                    <span style={{ color: C.charcoal, fontWeight: 500 }}>{v}</span>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 3 && (
              <div style={{ flex: 1, paddingBottom: 28 }}>
                {[
                  ['Frame Type', product.frame_type || '—'],
                  ['Lead Time', product.lead_time || '4–6 weeks'],
                  ['Shipping Port', product.shipping_port || '—'],
                  ['Supplier', product.construction_supplier_profiles?.company_name || '—'],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: `1px solid ${C.border}`, fontSize: 13 }}>
                    <span style={{ color: C.subtext }}>{k}</span>
                    <span style={{ color: C.charcoal, fontWeight: 500 }}>{v}</span>
                  </div>
                ))}
              </div>
            )}

            {/* CTA Buttons */}
            <div style={{ display: 'flex', gap: 12, marginTop: 'auto' }}>
              <button
                onClick={() => setShowQuoteForm(!showQuoteForm)}
                style={{
                  flex: 1,
                  background: C.sage,
                  color: C.white,
                  border: 'none',
                  padding: '14px 20px',
                  borderRadius: 100,
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: 'pointer',
                  letterSpacing: '0.02em',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = C.sageDark)}
                onMouseLeave={e => (e.currentTarget.style.background = C.sage)}
              >
                Request Private Consultation
              </button>
              <Link
                to="/construction/custom"
                style={{
                  flex: 1,
                  background: C.charcoal,
                  color: C.white,
                  border: 'none',
                  padding: '14px 20px',
                  borderRadius: 100,
                  fontWeight: 600,
                  fontSize: 13,
                  textDecoration: 'none',
                  textAlign: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  letterSpacing: '0.02em',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = C.charcoalLight)}
                onMouseLeave={e => (e.currentTarget.style.background = C.charcoal)}
              >
                <span style={{ fontSize: 14 }}>▶</span>
                Begin Live Factory Custom Build →
              </Link>
            </div>
          </div>
        </div>

        {/* Quote form */}
        {showQuoteForm && (
          <div style={{ marginTop: 32, padding: 40, background: C.white, borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.07)' }}>
            <h3 style={{ margin: '0 0 8px 0', color: C.charcoal, fontSize: 20, fontWeight: 500, fontFamily: "'Cormorant Garamond', serif" }}>Request a Private Consultation</h3>
            <p style={{ color: C.subtext, marginBottom: 20, fontSize: 13 }}>Describe your requirements and our team will prepare a tailored proposal.</p>
            <textarea
              value={quoteMessage}
              onChange={e => setQuoteMessage(e.target.value)}
              placeholder="Your requirements, customizations, timeline..."
              style={{ width: '100%', minHeight: 110, padding: '12px 16px', border: `1px solid ${C.border}`, borderRadius: 10, fontFamily: 'inherit', fontSize: 13, marginBottom: 16, resize: 'vertical', outline: 'none', color: C.text, background: C.bg, boxSizing: 'border-box' }}
            />
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={handleRequestQuote}
                disabled={submittingQuote || !quoteMessage.trim()}
                style={{ background: C.sage, color: C.white, border: 'none', padding: '12px 28px', borderRadius: 100, fontWeight: 600, fontSize: 13, cursor: submittingQuote || !quoteMessage.trim() ? 'not-allowed' : 'pointer', opacity: submittingQuote || !quoteMessage.trim() ? 0.5 : 1 }}
              >
                {submittingQuote ? 'Sending…' : 'Send Request'}
              </button>
              <button
                onClick={() => { setShowQuoteForm(false); setQuoteMessage('') }}
                style={{ background: C.greyLight, color: C.charcoal, border: 'none', padding: '12px 28px', borderRadius: 100, fontWeight: 600, fontSize: 13, cursor: 'pointer' }}
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
