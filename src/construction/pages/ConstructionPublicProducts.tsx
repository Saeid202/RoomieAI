import { useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client-simple'
import { Link } from 'react-router-dom'
import ConstructionHeader from '@/construction/components/ConstructionHeader'

const FONT_IMPORT = "https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700&family=DM+Sans:wght@400;500&display=swap"

interface Product {
  id: string
  title: string
  product_type: string
  price_cad: number
  slug: string
  construction_product_images: { public_url: string; is_primary: boolean }[]
}

const COLORS = {
  dark: '#1a2332',
  green: '#63c18a',
  lightGreen: '#e8f5ee',
  background: '#f5f3ef',
  border: '#e8e4dc',
  grey: '#666',
  white: '#ffffff'
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
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: COLORS.background, fontFamily: "'DM Sans', sans-serif" }}>
        <div style={{ color: COLORS.dark, fontSize: '1.2rem' }}>Loading marketplace...</div>
      </div>
    )
  }

  return (
    <div style={{ background: COLORS.background, minHeight: '100vh', fontFamily: "'DM Sans', sans-serif", color: COLORS.dark }}>
      <ConstructionHeader />

      <section style={{ background: COLORS.dark, padding: '140px 24px 80px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '400px', height: '400px', background: `radial-gradient(circle, ${COLORS.green}22 0%, transparent 70%)`, pointerEvents: 'none' }} />
        <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-block', background: COLORS.lightGreen, color: COLORS.green, padding: '4px 12px', borderRadius: '100px', fontSize: '12px', fontWeight: 600, marginBottom: '24px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            HomieAI Construction
          </div>
          <h1 style={{ color: COLORS.white, fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 700, fontFamily: "'Sora', sans-serif", lineHeight: 1.2, marginBottom: '20px' }}>
            Prefab Homes <span style={{ color: COLORS.green }}>Direct</span> from Manufacturer
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '18px', lineHeight: 1.6, maxWidth: '600px', margin: '0 auto' }}>
            Verified prefabricated homes shipped directly to Canada. Factory prices, Canadian-certified.
          </p>
        </div>
      </section>

      <div style={{ background: COLORS.white, borderBottom: `1px solid ${COLORS.border}`, position: 'sticky', top: '72px', zIndex: 900 }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '16px 24px', display: 'flex', gap: '12px', overflowX: 'auto', scrollbarWidth: 'none' }}>
          {[
            { value: 'all', label: 'All Types' },
            { value: 'house', label: 'Pre-fabricated Houses' },
            { value: 'cabinet', label: 'Cabinets' }
          ].map((filter) => (
            <button
              key={filter.value}
              onClick={() => setActiveFilter(filter.value)}
              style={{
                padding: '10px 20px', borderRadius: '8px', fontSize: '14px', fontWeight: 600,
                cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap',
                background: activeFilter === filter.value ? COLORS.dark : 'transparent',
                color: activeFilter === filter.value ? COLORS.white : COLORS.grey,
                border: `1px solid ${activeFilter === filter.value ? COLORS.dark : COLORS.border}`
              }}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '60px 24px 80px' }}>
        {filteredProducts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '100px 0' }}>
            <h3 style={{ fontSize: '24px', fontWeight: 600, color: COLORS.grey }}>No products listed yet. Check back soon.</h3>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '32px' }}>
            {filteredProducts.map(product => {
              const primaryImage = product.construction_product_images?.find(img => img.is_primary) || product.construction_product_images?.[0]
              return (
                <div
                  key={product.id}
                  style={{ background: COLORS.white, borderRadius: '16px', border: `1px solid ${COLORS.border}`, overflow: 'hidden', transition: 'all 0.3s ease', cursor: 'pointer' }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-8px)'; e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0,0,0,0.1)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
                >
                  <Link to={`/construction/${product.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div style={{ height: '240px', background: '#f1f5f9', overflow: 'hidden' }}>
                      {primaryImage ? (
                        <img src={primaryImage.public_url} alt={product.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>No image available</div>
                      )}
                    </div>
                    <div style={{ padding: '24px' }}>
                      <h3 style={{ fontSize: '20px', fontWeight: 700, fontFamily: "'Sora', sans-serif", marginBottom: '20px' }}>
                        {product.title}
                      </h3>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ fontSize: '24px', fontWeight: 700, color: COLORS.dark }}>
                          ${product.price_cad.toLocaleString()} <span style={{ fontSize: '14px', fontWeight: 500, color: COLORS.grey }}>CAD</span>
                        </div>
                        <div style={{ background: COLORS.dark, color: COLORS.white, padding: '10px 20px', borderRadius: '8px', fontSize: '14px', fontWeight: 600 }}>
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

        <div style={{ marginTop: '80px', background: COLORS.dark, borderRadius: '24px', padding: '48px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '32px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', bottom: '-50px', right: '-50px', width: '200px', height: '200px', background: `${COLORS.green}11`, borderRadius: '50%' }} />
          <div style={{ textAlign: 'left', flex: 1 }}>
            <h2 style={{ color: COLORS.white, fontSize: '32px', fontWeight: 700, fontFamily: "'Sora', sans-serif", marginBottom: '12px' }}>
              Have your own design? Build it custom.
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '18px' }}>Upload your floor plan and our supplier will build it to your vision.</p>
          </div>
          <Link to="/construction/custom" style={{ background: COLORS.green, color: COLORS.dark, padding: '16px 32px', borderRadius: '12px', fontSize: '18px', fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap' }}>
            Start Custom Order
          </Link>
        </div>
      </main>

      <footer style={{ background: COLORS.dark, padding: '60px 24px', borderTop: `1px solid rgba(255,255,255,0.1)` }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '24px' }}>
          <div style={{ color: '#94a3b8', fontSize: '14px' }}>HomieAI Construction 2026</div>
          <div style={{ display: 'flex', gap: '32px' }}>
            <Link to="/construction/signup" style={{ color: COLORS.white, fontSize: '14px', textDecoration: 'none', fontWeight: 500 }}>
              Supplier? Sign up here
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}