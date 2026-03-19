import { useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client-simple'
import { Link } from 'react-router-dom'
import ConstructionHeader from '@/construction/components/ConstructionHeader'

const FONT_IMPORT = "https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700&family=DM+Sans:wght@400;500;600&family=Cormorant+Garamond:wght@300;400;500;600&display=swap"

interface Product {
  id: string
  title: string
  product_type: string
  price_cad: number
  slug: string
  construction_product_images: { public_url: string; is_primary: boolean }[]
}

const C = {
  bg: '#F8F5F0',
  white: '#ffffff',
  charcoal: '#1C1C1E',
  teal: '#0F766E',
  tealDark: '#0D6460',
  gold: '#B8965A',
  goldLight: '#D4AF72',
  goldBorder: '#C9A96E',
  orange: '#E67E22',
  orangeDark: '#D35400',
  grey: '#8a8a8e',
  greyLight: '#f0ede8',
  border: '#E8E2D9',
  text: '#2c2c2e',
  subtext: '#6c6c70',
}

export default function ConstructionPublicProducts() {
  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState<Product[]>([])
  const [activeFilter, setActiveFilter] = useState('all')

  useEffect(() => {
    if (!document.getElementById('construction-fonts')) {
      const link = document.createElement('link')
      link.id = 'construction-fonts'
      link.rel = 'stylesheet'
      link.href = FONT_IMPORT
      document.head.appendChild(link)
    }

    const loadProducts = async () => {
      setLoading(true)
      const { data: productsData, error: productsError } = await supabase
        .from('construction_products')
        .select('id, title, product_type, price_cad, slug')
        .eq('status', 'live')
        .order('created_at', { ascending: false })

      if (productsError || !productsData || productsData.length === 0) {
        setProducts([])
        setLoading(false)
        return
      }

      const productIds = productsData.map(p => p.id)
      const { data: imagesData } = await supabase
        .from('construction_product_images')
        .select('product_id, public_url, is_primary')
        .in('product_id', productIds)

      const imagesByProduct: Record<string, { public_url: string; is_primary: boolean }[]> = {}
      for (const img of (imagesData || [])) {
        if (!imagesByProduct[img.product_id]) imagesByProduct[img.product_id] = []
        imagesByProduct[img.product_id].push(img)
      }

      setProducts(productsData.map(p => ({
        ...p,
        construction_product_images: imagesByProduct[p.id] || [],
      })))
      setLoading(false)
    }

    loadProducts()
  }, [])

  const filteredProducts = activeFilter === 'all'
    ? products
    : products.filter(p => p.product_type === activeFilter)

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: C.bg, fontFamily: "'DM Sans', sans-serif" }}>
        <div style={{ color: C.charcoal, fontSize: '1.2rem', fontWeight: 500 }}>Loading marketplace...</div>
      </div>
    )
  }

  return (
    <div style={{ background: C.bg, minHeight: '100vh', fontFamily: "'DM Sans', sans-serif", color: C.text }}>
      <ConstructionHeader />

      {/* Hero */}
      <section style={{ background: C.teal, padding: '140px 24px 80px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '420px', height: '420px', background: 'radial-gradient(circle, rgba(184,150,90,0.2) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-60px', left: '-60px', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(230,126,34,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-block', background: 'rgba(184,150,90,0.2)', color: C.goldLight, padding: '5px 14px', borderRadius: '100px', fontSize: '11px', fontWeight: 600, marginBottom: '24px', textTransform: 'uppercase', letterSpacing: '0.1em', border: '1px solid rgba(184,150,90,0.4)' }}>
            HomieAI Construction
          </div>
          <h1 style={{ color: C.white, fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 300, fontFamily: "'Cormorant Garamond', Georgia, serif", lineHeight: 1.15, marginBottom: '20px', letterSpacing: '-0.01em' }}>
            Prefab Homes <span style={{ color: C.goldLight, fontStyle: 'italic' }}>Direct</span> from Manufacturer
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '17px', lineHeight: 1.7, maxWidth: '560px', margin: '0 auto' }}>
            Verified prefabricated homes shipped directly to Canada. Factory prices, Canadian-certified.
          </p>
        </div>
      </section>

      {/* Filter bar */}
      <div style={{ background: C.white, borderBottom: `1px solid ${C.border}`, position: 'sticky', top: '72px', zIndex: 900 }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '14px 32px', display: 'flex', gap: '10px', overflowX: 'auto', scrollbarWidth: 'none' }}>
          {[
            { value: 'all', label: 'All Types' },
            { value: 'house', label: 'Pre-fabricated Houses' },
            { value: 'cabinet', label: 'Cabinets' }
          ].map((filter) => (
            <button
              key={filter.value}
              onClick={() => setActiveFilter(filter.value)}
              style={{
                padding: '8px 20px', borderRadius: '8px', fontSize: '13px', fontWeight: 600,
                cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap',
                background: activeFilter === filter.value ? C.teal : 'transparent',
                color: activeFilter === filter.value ? C.white : C.grey,
                border: `1px solid ${activeFilter === filter.value ? C.teal : C.border}`
              }}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Product grid */}
      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '60px 32px 80px' }}>
        {filteredProducts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '100px 0' }}>
            <h3 style={{ fontSize: '24px', fontWeight: 400, color: C.subtext, fontFamily: "'Cormorant Garamond', serif" }}>No products listed yet. Check back soon.</h3>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '28px' }}>
            {filteredProducts.map(product => {
              const primaryImage = product.construction_product_images?.find(img => img.is_primary) || product.construction_product_images?.[0]
              return (
                <div
                  key={product.id}
                  style={{
                    background: C.white,
                    borderRadius: '16px',
                    border: `1px solid ${C.border}`,
                    overflow: 'hidden',
                    transition: 'transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease',
                    cursor: 'pointer',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-6px)'
                    e.currentTarget.style.boxShadow = '0 20px 48px rgba(0,0,0,0.12)'
                    e.currentTarget.style.borderColor = C.goldBorder
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.05)'
                    e.currentTarget.style.borderColor = C.border
                  }}
                >
                  <Link to={`/construction/${product.slug}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>

                    {/* Image */}
                    <div style={{ position: 'relative', height: '280px', background: C.greyLight, overflow: 'hidden' }}>
                      {primaryImage ? (
                        <img
                          src={primaryImage.public_url}
                          alt={product.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
                          onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.04)' }}
                          onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)' }}
                        />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.grey, fontSize: '48px' }}>🏠</div>
                      )}
                    </div>

                    {/* Card body */}
                    <div style={{ padding: '24px 24px 20px' }}>
                      {/* Gold divider line */}
                      <div style={{ height: '2px', background: `linear-gradient(90deg, ${C.gold}, ${C.goldLight}, transparent)`, marginBottom: '16px', borderRadius: '2px' }} />

                      <h3 style={{
                        fontSize: '20px', fontWeight: 400, margin: '0 0 8px 0',
                        fontFamily: "'Cormorant Garamond', Georgia, serif",
                        color: C.charcoal, lineHeight: 1.3, letterSpacing: '-0.01em',
                      }}>
                        {product.title}
                      </h3>

                      <p style={{ fontSize: '12px', color: C.subtext, margin: '0 0 20px 0', letterSpacing: '0.03em' }}>
                        Factory-direct&nbsp;&nbsp;•&nbsp;&nbsp;Canadian-certified
                      </p>

                      {/* Price + CTA row */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <span style={{ fontSize: '22px', fontWeight: 600, color: C.charcoal }}>
                            ${product.price_cad.toLocaleString()}
                          </span>
                          <span style={{ fontSize: '12px', color: C.subtext, marginLeft: '5px' }}>CAD</span>
                        </div>
                        <div
                          style={{
                            background: C.orange,
                            color: C.white,
                            padding: '10px 22px',
                            borderRadius: '100px',
                            fontSize: '13px',
                            fontWeight: 600,
                            letterSpacing: '0.02em',
                            transition: 'background 0.2s',
                          }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = C.orangeDark }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = C.orange }}
                        >
                          View Details
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              )
            })}
          </div>
        )}

        {/* CTA banner */}
        <div style={{ marginTop: '80px', background: C.teal, borderRadius: '20px', padding: '52px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '32px', flexWrap: 'wrap', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '240px', height: '240px', background: 'radial-gradient(circle, rgba(184,150,90,0.15) 0%, transparent 70%)' }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h2 style={{ color: C.white, fontSize: '28px', fontWeight: 300, fontFamily: "'Cormorant Garamond', serif", marginBottom: '10px', letterSpacing: '-0.01em' }}>
              Have your own design? Build it custom.
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '16px', margin: 0 }}>Upload your floor plan and our supplier will build it to your vision.</p>
          </div>
          <Link
            to="/construction/custom"
            style={{ background: C.orange, color: C.white, padding: '14px 32px', borderRadius: '100px', fontSize: '15px', fontWeight: 600, textDecoration: 'none', whiteSpace: 'nowrap', letterSpacing: '0.02em', position: 'relative', zIndex: 1 }}
          >
            Start Custom Order
          </Link>
        </div>
      </main>

      <footer style={{ background: C.charcoal, padding: '48px 32px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '24px' }}>
          <div style={{ color: '#6c6c70', fontSize: '13px' }}>HomieAI Construction 2026</div>
          <Link to="/construction/signup" style={{ color: C.goldLight, fontSize: '13px', textDecoration: 'none', fontWeight: 500 }}>
            Supplier? Sign up here
          </Link>
        </div>
      </footer>
    </div>
  )
}