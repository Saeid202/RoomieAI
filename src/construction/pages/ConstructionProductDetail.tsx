// v2
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
  sage: '#DC2626',
  sageDark: '#B91C1C',
  grey: '#8a8a8e',
  greyLight: '#f0ede8',
  border: '#E8E2D9',
  text: '#2c2c2e',
  subtext: '#6c6c70',
}

const DETAIL_TABS = ['Ready to Install', 'Customize Features', 'Configuration']

// Default finishes for backward compatibility
const DEFAULT_FINISHES = [
  { label: 'Matte White', color: '#F5F5F3', border: '#ddd' },
  { label: 'Warm Oak', color: '#C4956A', border: '#b07d4e' },
  { label: 'Matte Black', color: '#1C1C1E', border: '#333' },
  { label: 'Stone Grey', color: '#8E8E93', border: '#777' },
  { label: 'Natural Walnut', color: '#7B5E3A', border: '#5a4020' },
]

export default function ConstructionProductDetail() {
  console.log('ConstructionProductDetail component rendering')
  
  const { slug } = useParams<{ slug: string }>()
  console.log('Slug from params:', slug)
  
  const navigate = useNavigate()
  const { data: product, isLoading, error } = useProductBySlug(slug || '')
  console.log('Product data:', { product, isLoading, error })
  
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState(0)
  const [selectedFinish, setSelectedFinish] = useState(0)
  const [showQuoteForm, setShowQuoteForm] = useState(false)
  const [quoteMessage, setQuoteMessage] = useState('')
  const [submittingQuote, setSubmittingQuote] = useState(false)
  const [downloadingDocs, setDownloadingDocs] = useState(false)
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null)

  // Get finishes from product or use defaults
  const getFinishes = () => {
    if (product?.available_colors && product.available_colors.length > 0) {
      return product.available_colors.map((option: any) => {
        if (option.type === 'pattern') {
          return {
            label: option.name,
            color: null,
            border: '#ddd',
            imageUrl: option.imageUrl,
            isPattern: true,
            code: option.code || null
          }
        } else {
          return {
            label: option.name,
            color: option.hex,
            border: option.hex === '#F5F5F3' || option.hex === '#FAF9F6' ? '#ddd' : '#333',
            imageUrl: null,
            isPattern: false,
            code: option.code || null
          }
        }
      })
    }
    return []
  }

  const finishes = getFinishes()

  useEffect(() => {
    if (product?.construction_product_images) {
      // Prioritize primary image, fallback to first image
      const primaryImg = product.construction_product_images.find(img => img.is_primary)
      setSelectedImage(primaryImg?.public_url || product.construction_product_images[0]?.public_url || null)
    }
  }, [product])

  const handleRequestQuote = async () => {
    if (!product) return
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { navigate('/construction'); return }
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

  const handleDownloadDocuments = async () => {
    if (!product) return
    setDownloadingDocs(true)
    try {
      const { downloadProductDocuments } = await import('@/services/productDocumentService')
      await downloadProductDocuments(product.id, product.title)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to download documents')
    }
    setDownloadingDocs(false)
  }

  if (isLoading) {
    console.log('ConstructionProductDetail: Showing loading skeleton')
    return <ProductDetailSkeleton />
  }

  if (error || !product) {
    console.log('ConstructionProductDetail: Showing error state', { error, product })
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

  console.log('ConstructionProductDetail: Rendering main content for product:', product?.title)

  const images = product.construction_product_images || []
  const displayImage = selectedImage || images.find(img => img.is_primary)?.public_url || images[0]?.public_url

  return (
    <div style={{ fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif", minHeight: '100vh', background: C.bg }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Cormorant+Garamond:wght@300;400;500;600&display=swap" rel="stylesheet" />
      <style>{`
        .thumbnail-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .thumbnail-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .thumbnail-scroll::-webkit-scrollbar-thumb {
          background: ${C.gold};
          border-radius: 3px;
        }
        .thumbnail-scroll::-webkit-scrollbar-thumb:hover {
          background: ${C.goldLight};
        }
      `}</style>

      <ConstructionHeader />

      {/* Category filter bar — not sticky, sits naturally in flow */}
      <div style={{ background: C.white, borderBottom: `1px solid ${C.border}`, marginTop: '72px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '14px 32px', display: 'flex', gap: 10 }}>
          {['All Types', 'Pre-fabricated Houses', 'Cabinets', 'Bath & Kitchen'].map((label, i) => (
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
          height: 550,
        }}>

          {/* ── LEFT: Image Gallery Panel (Alibaba Style) ── */}
          <div style={{ display: 'flex', gap: 12, padding: 16, background: C.greyLight, overflow: 'hidden', height: '100%' }}>
            {/* Thumbnail Strip - Left Side */}
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: 8, 
              overflowY: 'auto',
              overflowX: 'hidden',
              width: 120, 
              flexShrink: 0, 
              height: '100%',
              paddingRight: 4,
              scrollBehavior: 'smooth',
            }} className="thumbnail-scroll">
              {images.map((img, idx) => (
                <div
                  key={img.id}
                  onClick={() => setSelectedImage(img.public_url)}
                  style={{
                    width: 100,
                    height: 100,
                    borderRadius: 8,
                    overflow: 'hidden',
                    cursor: 'pointer',
                    border: displayImage === img.public_url ? `3px solid ${C.gold}` : `2px solid ${C.border}`,
                    boxShadow: displayImage === img.public_url ? `0 0 0 2px ${C.goldLight}` : 'none',
                    transition: 'all 0.2s',
                    position: 'relative',
                    background: '#e8e4dc',
                    flexShrink: 0,
                  }}
                  onMouseEnter={(e) => {
                    if (displayImage !== img.public_url) {
                      e.currentTarget.style.borderColor = C.goldLight
                      e.currentTarget.style.transform = 'scale(1.05)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (displayImage !== img.public_url) {
                      e.currentTarget.style.borderColor = C.border
                      e.currentTarget.style.transform = 'scale(1)'
                    }
                  }}
                >
                  <img
                    src={img.public_url}
                    alt={`${product.title} - ${idx + 1}`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  {/* Code overlay on thumbnail */}
                  {img.code && (
                    <div style={{
                      position: 'absolute',
                      top: 4,
                      left: 4,
                      background: 'rgba(0, 0, 0, 0.8)',
                      color: C.white,
                      fontSize: 10,
                      fontWeight: 600,
                      padding: '2px 4px',
                      borderRadius: 3,
                      backdropFilter: 'blur(4px)',
                    }}>
                      {img.code}
                    </div>
                  )}
                  {displayImage === img.public_url && (
                    <div style={{
                      position: 'absolute',
                      bottom: 4,
                      right: 4,
                      background: C.gold,
                      color: C.white,
                      fontSize: 11,
                      fontWeight: 700,
                      padding: '3px 6px',
                      borderRadius: 3,
                    }}>
                      {idx + 1}/{images.length}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Main Image Display - Center */}
            <div style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column', height: '100%' }}>
              {/* Gold border frame */}
              <div style={{
                position: 'relative',
                flex: 1,
                borderRadius: 12,
                padding: 3,
                background: `linear-gradient(135deg, ${C.goldBorder} 0%, ${C.goldLight} 50%, ${C.goldBorder} 100%)`,
                boxShadow: '0 12px 40px rgba(0,0,0,0.12)',
                minHeight: 0,
              }}>
                <div style={{ borderRadius: 8, overflow: 'hidden', background: '#e8e4dc', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: displayImage ? 'none' : 'default', position: 'relative' }} onClick={() => displayImage && setEnlargedImage(displayImage)} onMouseEnter={(e) => { if (displayImage) { const div = document.createElement('div'); div.textContent = '👷'; div.style.position = 'fixed'; div.style.pointerEvents = 'none'; div.style.fontSize = '48px'; div.style.zIndex = '10000'; div.id = 'emoji-cursor'; document.body.appendChild(div); const moveCursor = (ev: MouseEvent) => { const el = document.getElementById('emoji-cursor'); if (el) { el.style.left = (ev.clientX - 24) + 'px'; el.style.top = (ev.clientY - 24) + 'px'; } }; e.currentTarget.addEventListener('mousemove', moveCursor as any); e.currentTarget.addEventListener('mouseleave', () => { const el = document.getElementById('emoji-cursor'); if (el) el.remove(); e.currentTarget.removeEventListener('mousemove', moveCursor as any); }); } }}>
                  {displayImage ? (
                    <>
                      <img
                        src={displayImage}
                        alt={product.title}
                        style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
                        loading="eager"
                      />
                      {/* Code overlay on main image */}
                      {(() => {
                        const currentImage = images.find(img => img.public_url === displayImage)
                        return currentImage?.code && (
                          <div style={{
                            position: 'absolute',
                            top: 12,
                            right: 12,
                            background: 'rgba(0, 0, 0, 0.85)',
                            color: C.white,
                            fontSize: 14,
                            fontWeight: 600,
                            padding: '6px 10px',
                            borderRadius: 6,
                            backdropFilter: 'blur(8px)',
                            border: `1px solid ${C.gold}`,
                            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                          }}>
                            {currentImage.code}
                          </div>
                        )
                      })()}
                    </>
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#e8e4dc', color: C.subtext, fontSize: 14, fontWeight: 500 }}>
                      No image available
                    </div>
                  )}
                </div>
              </div>

              {/* Navigation Buttons */}
              {images.length > 1 && (
                <div style={{ display: 'flex', gap: 8, marginTop: 12, justifyContent: 'center', flexShrink: 0 }}>
                  <button
                    onClick={() => {
                      const currentIdx = images.findIndex(img => img.public_url === displayImage)
                      const prevIdx = currentIdx === 0 ? images.length - 1 : currentIdx - 1
                      setSelectedImage(images[prevIdx].public_url)
                    }}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 8,
                      background: C.gold,
                      color: C.white,
                      border: 'none',
                      cursor: 'pointer',
                      fontWeight: 700,
                      fontSize: 18,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = C.goldLight
                      e.currentTarget.style.transform = 'scale(1.1)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = C.gold
                      e.currentTarget.style.transform = 'scale(1)'
                    }}
                  >
                    ←
                  </button>
                  <button
                    onClick={() => {
                      const currentIdx = images.findIndex(img => img.public_url === displayImage)
                      const nextIdx = currentIdx === images.length - 1 ? 0 : currentIdx + 1
                      setSelectedImage(images[nextIdx].public_url)
                    }}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 8,
                      background: C.gold,
                      color: C.white,
                      border: 'none',
                      cursor: 'pointer',
                      fontWeight: 700,
                      fontSize: 18,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = C.goldLight
                      e.currentTarget.style.transform = 'scale(1.1)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = C.gold
                      e.currentTarget.style.transform = 'scale(1)'
                    }}
                  >
                    →
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ── RIGHT: Details panel ── */}
          <div style={{ padding: '48px 44px', display: 'flex', flexDirection: 'column', borderLeft: `1px solid ${C.border}`, height: '100%', overflow: 'hidden' }}>

            {/* Title + Price on one line */}
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 16, marginBottom: 8, flexShrink: 0 }}>
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

            <p style={{ margin: '0 0 24px 0', fontSize: 12, color: C.subtext, letterSpacing: '0.03em', flexShrink: 0 }}>
              Factory-direct&nbsp;&nbsp;•&nbsp;&nbsp;{product.lead_time || '4–6 weeks'}
            </p>

            {/* Elegant tabs */}
            <div style={{ display: 'flex', gap: 0, borderBottom: `1px solid ${C.border}`, marginBottom: 28, flexShrink: 0 }}>
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
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
                {/* Finish swatches */}
                {finishes.length > 0 ? (
                  <>
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
                      {finishes.map((finish, i) => (
                        <div
                          key={finish.label}
                          onClick={() => setSelectedFinish(i)}
                          style={{ cursor: 'pointer', textAlign: 'center' }}
                        >
                          <div style={{ position: 'relative', display: 'inline-block' }}>
                          {finish.isPattern ? (
                            <img
                              src={finish.imageUrl}
                              alt={finish.label}
                              style={{
                                width: 56,
                                height: 56,
                                borderRadius: 8,
                                objectFit: 'cover',
                                border: selectedFinish === i ? `2px solid ${C.gold}` : `1px solid ${finish.border}`,
                                boxShadow: selectedFinish === i ? `0 0 0 3px ${C.goldLight}44` : 'none',
                                transition: 'all 0.2s',
                                marginBottom: 6,
                              }}
                            />
                          ) : (
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
                          )}
                          {/* Code overlay on pattern/color */}
                          {finish.code && (
                            <div style={{
                              position: 'absolute',
                              top: 2,
                              right: 2,
                              background: 'rgba(0, 0, 0, 0.8)',
                              color: C.white,
                              fontSize: 8,
                              fontWeight: 600,
                              padding: '1px 3px',
                              borderRadius: 2,
                              backdropFilter: 'blur(2px)',
                            }}>
                              {finish.code}
                            </div>
                          )}
                        </div>
                          <div style={{ fontSize: 10, color: C.charcoal, fontWeight: 500, lineHeight: 1.3, maxWidth: 56 }}>{finish.label}</div>
                          <div style={{ fontSize: 9, color: C.sage, fontWeight: 500, marginTop: 2 }}>In Stock</div>
                        </div>
                      ))}
                    </div>
                    <p style={{ fontSize: 11, color: C.subtext, margin: '0 0 20px 0', letterSpacing: '0.02em' }}>
                      {finishes.length} finish{finishes.length !== 1 ? 'es' : ''} available&nbsp;&nbsp;•&nbsp;&nbsp;Live preview updates on main image
                    </p>
                  </>
                ) : (
                  <p style={{ fontSize: 13, color: C.subtext, margin: '0 0 20px 0', fontStyle: 'italic' }}>
                    Contact supplier for available color options.
                  </p>
                )}

                {/* Trust line */}
                {product.product_specs && (
                  <p style={{ fontSize: 12, color: C.subtext, fontStyle: 'italic', margin: '0 0 28px 0', letterSpacing: '0.02em' }}>
                    {product.product_specs}
                  </p>
                )}
              </div>
            )}

            {activeTab === 1 && (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'auto', paddingBottom: 28 }}>
                <p style={{ color: C.subtext, fontSize: 13, lineHeight: 1.7 }}>{product.description || 'Custom configuration options available. Contact us for personalized specifications.'}</p>
              </div>
            )}

            {activeTab === 2 && (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', paddingBottom: 28 }}>
                <div>
                  {[
                    ['Size', product.size_ft || 'Custom'],
                    ['Bedrooms', product.bedrooms || '—'],
                    ['Frame Type', product.frame_type || '—'],
                    ['Weight', product.weight_kg || '—'],
                  ].map(([k, v]) => (
                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: `1px solid ${C.border}`, fontSize: 13 }}>
                      <span style={{ color: C.subtext }}>{k}</span>
                      <span style={{ color: C.charcoal, fontWeight: 500 }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CTA Buttons */}
            <div style={{ display: 'flex', gap: 12, marginTop: 'auto', flexShrink: 0 }}>
              {/* Download button - only in Configuration tab */}
              {activeTab === 2 && product.construction_product_documents && product.construction_product_documents.length > 0 && (
                <button
                  onClick={handleDownloadDocuments}
                  disabled={downloadingDocs}
                  style={{
                    flex: 1,
                    padding: '14px 20px',
                    background: '#E67E22',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: 100,
                    fontWeight: 600,
                    fontSize: 13,
                    cursor: downloadingDocs ? 'not-allowed' : 'pointer',
                    opacity: downloadingDocs ? 0.6 : 1,
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    letterSpacing: '0.02em',
                  }}
                  onMouseEnter={(e) => {
                    if (!downloadingDocs) {
                      e.currentTarget.style.background = '#D35400'
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#E67E22'
                  }}
                >
                  <span style={{ fontSize: 14 }}>📥</span>
                  {downloadingDocs ? 'Downloading...' : 'Download Details'}
                </button>
              )}
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
              {product?.custom_build_enabled && (
                <Link
                  to="/construction/custom"
                  style={{
                    flex: 1,
                    background: '#E67E22',
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
                  onMouseEnter={e => (e.currentTarget.style.background = '#D35400')}
                  onMouseLeave={e => (e.currentTarget.style.background = '#E67E22')}
                >
                  <span style={{ fontSize: 14 }}>▶</span>
                  Begin Live Factory Custom Build →
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Product Description Section */}
        {product.description && (
          <div style={{ width: '55%', marginTop: 24, padding: '32px 40px', background: C.white, borderRadius: 20, border: `1px solid ${C.border}`, boxShadow: '0 8px 48px rgba(0,0,0,0.07)' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: 18, fontWeight: 600, color: C.charcoal, letterSpacing: '-0.01em' }}>Product Description</h3>
            <p style={{ margin: 0, color: C.subtext, fontSize: 13, lineHeight: 1.8 }}>{product.description}</p>
          </div>
        )}

        {/* Configuration Details Section */}
        <div style={{ width: '55%', marginTop: 24, padding: '32px 40px', background: C.white, borderRadius: 20, border: `1px solid ${C.border}`, boxShadow: '0 8px 48px rgba(0,0,0,0.07)' }}>
          <h3 style={{ margin: '0 0 24px 0', fontSize: 18, fontWeight: 600, color: C.charcoal, letterSpacing: '-0.01em' }}>Configuration Details</h3>
          
          {/* Top 4 Fields Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: 32, paddingBottom: 32, borderBottom: `1px solid ${C.border}` }}>
            {[
              ['Size', product.size_ft || '—'],
              ['Bedrooms', product.bedrooms || '—'],
              ['Frame Type', product.frame_type || '—'],
              ['Weight', product.weight_kg || '—'],
            ].map(([k, v]) => (
              <div key={k}>
                <div style={{ fontSize: 12, color: C.subtext, fontWeight: 500, marginBottom: 6, letterSpacing: '0.02em', textTransform: 'uppercase' }}>{k}</div>
                <div style={{ fontSize: 16, color: C.charcoal, fontWeight: 600 }}>{v}</div>
              </div>
            ))}
          </div>

          {/* Additional Details Placeholder */}
          <div style={{ color: C.subtext, fontSize: 13, fontStyle: 'italic', lineHeight: 1.6 }}>
            Additional configuration details will appear here.
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

      {/* Enlarged Image Modal */}
      {enlargedImage && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.95)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px',
            cursor: 'pointer',
          }}
          onClick={() => setEnlargedImage(null)}
        >
          <div
            style={{
              position: 'relative',
              maxWidth: '90vw',
              maxHeight: '90vh',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={enlargedImage}
              alt="Enlarged view"
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
                borderRadius: 8,
                cursor: 'pointer',
              }}
              onClick={() => setEnlargedImage(null)}
            />
            <div
              style={{
                position: 'absolute',
                top: '-50px',
                right: 0,
                fontSize: 28,
                cursor: 'pointer',
                transition: 'transform 0.2s',
              }}
              onClick={() => setEnlargedImage(null)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.2) rotate(10deg)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1) rotate(0deg)'
              }}
              title="Click to close"
            >
              👷
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
