import { useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client-simple'
import { Link } from 'react-router-dom'

// Import fonts at the components top
const FONT_IMPORT = "https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700&family=DM+Sans:wght@400;500&display=swap";

interface Product {
  id: string
  title: string
  product_type: string
  price_cad: number
  slug: string
  size_ft: string
  bedrooms: string
  lead_time: string
  badge_label: string
  construction_product_images: { public_url: string; is_primary: boolean }[]
  construction_supplier_profiles: { company_name: string; shipping_port: string }
}

const COLORS = {
  dark: '#1a2332',
  green: '#63c18a',
  lightGreen: '#e8f5ee',
  background: '#f5f3ef',
  border: '#e8e4dc',
  grey: '#666',
  white: '#ffffff'
};

export default function ConstructionPublicProducts() {
  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState<Product[]>([])
  const [activeFilter, setActiveFilter] = useState('all')

  useEffect(() => {
    // Inject fonts
    if (!document.getElementById('construction-fonts')) {
      const link = document.createElement('link');
      link.id = 'construction-fonts';
      link.rel = 'stylesheet';
      link.href = FONT_IMPORT;
      document.head.appendChild(link);
    }

    const loadProducts = async () => {
      setLoading(true)
      
      // Fetch products (no joins - avoids PostgREST FK cache issues)
      const { data: productsData, error: productsError } = await supabase
        .from('construction_products')
        .select('*')
        .eq('status', 'live')
        .order('created_at', { ascending: false })

      if (productsError) {
        console.error('Error fetching products:', productsError)
        setLoading(false)
        return
      }

      if (!productsData || productsData.length === 0) {
        setProducts([])
        setLoading(false)
        return
      }

      // Get all product IDs and supplier IDs
      const productIds = productsData.map(p => p.id)
      const supplierIds = [...new Set(productsData.map(p => p.supplier_id))]

      // Fetch images for these products
      const { data: imagesData } = await supabase
        .from('construction_product_images')
        .select('product_id, public_url, is_primary')
        .in('product_id', productIds)

      // Fetch supplier profiles
      const { data: suppliersData } = await supabase
        .from('construction_supplier_profiles')
        .select('id, company_name, shipping_port')
        .in('id', supplierIds)

      // Build lookup maps
      const imagesByProduct: Record<string, { public_url: string; is_primary: boolean }[]> = {}
      for (const img of (imagesData || [])) {
        if (!imagesByProduct[img.product_id]) imagesByProduct[img.product_id] = []
        imagesByProduct[img.product_id].push(img)
      }

      const suppliersById: Record<string, { company_name: string; shipping_port: string }> = {}
      for (const s of (suppliersData || [])) {
        suppliersById[s.id] = s
      }

      // Combine data
      const combined = productsData.map(p => ({
        ...p,
        construction_product_images: imagesByProduct[p.id] || [],
        construction_supplier_profiles: suppliersById[p.supplier_id] || { company_name: 'Unknown', shipping_port: '' }
      }))

      setProducts(combined as any)
      setLoading(false)
    }

    loadProducts()
  }, [])

  const filteredProducts = activeFilter === 'all'
    ? products
    : products.filter(p => p.product_type === activeFilter)

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh', 
        background: COLORS.background,
        fontFamily: "'DM Sans', sans-serif"
      }}>
        <div style={{ color: COLORS.dark, fontSize: '1.2rem' }}>Loading marketplace...</div>
      </div>
    )
  }

  return (
    <div style={{ 
      background: COLORS.background, 
      minHeight: '100vh', 
      fontFamily: "'DM Sans', sans-serif",
      color: COLORS.dark,
      margin: 0,
      padding: 0
    }}>
      {/* Top Navigation Bar */}
      <nav style={{
        background: COLORS.dark,
        height: '72px',
        width: '100%',
        position: 'fixed',
        top: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 24px'
      }}>
        <div style={{
          width: '100%',
          maxWidth: '1280px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Link to="/construction" style={{ textDecoration: 'none', color: COLORS.white, fontSize: '24px', fontWeight: 700, fontFamily: "'Sora', sans-serif" }}>
            Homie<span style={{ color: COLORS.green }}>AI</span>
          </Link>
          <div style={{ display: 'flex', gap: '16px' }}>
            <Link to="/construction/login" style={{
              padding: '10px 20px',
              borderRadius: '8px',
              border: `1px solid ${COLORS.white}`,
              color: COLORS.white,
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: 500
            }}>
              Supplier Login
            </Link>
            <Link to="/construction/signup" style={{
              padding: '10px 20px',
              borderRadius: '8px',
              background: COLORS.dark, // Filled dark button, though already on dark nav
              border: `1px solid ${COLORS.white}`, // Making it stand out
              color: COLORS.white,
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: 500
            }}>
              List Your Products
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{
        background: COLORS.dark,
        padding: '140px 24px 80px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Subtle radial green glow */}
        <div style={{
          position: 'absolute',
          top: '-100px',
          right: '-100px',
          width: '400px',
          height: '400px',
          background: `radial-gradient(circle, ${COLORS.green}22 0%, transparent 70%)`,
          pointerEvents: 'none'
        }} />

        <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'inline-block',
            background: COLORS.lightGreen,
            color: COLORS.green,
            padding: '4px 12px',
            borderRadius: '100px',
            fontSize: '12px',
            fontWeight: 600,
            marginBottom: '24px',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            HomieAI Construction
          </div>
          <h1 style={{
            color: COLORS.white,
            fontSize: 'clamp(32px, 5vw, 48px)',
            fontWeight: 700,
            fontFamily: "'Sora', sans-serif",
            lineHeight: 1.2,
            marginBottom: '20px'
          }}>
            Prefab Homes <span style={{ color: COLORS.green }}>Direct</span> from Manufacturer
          </h1>
          <p style={{
            color: '#94a3b8',
            fontSize: '18px',
            lineHeight: 1.6,
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            Verified prefabricated homes shipped directly to Canada. Factory prices, Canadian-certified.
          </p>
        </div>
      </section>

      {/* Filter Bar */}
      <div style={{
        background: COLORS.white,
        borderBottom: `1px solid ${COLORS.border}`,
        position: 'sticky',
        top: '72px',
        zIndex: 900
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '16px 24px',
          display: 'flex',
          gap: '12px',
          overflowX: 'auto',
          scrollbarWidth: 'none'
        }}>
          {['all', 'expandable', 'foldable', 'flat pack', 'capsule', 'modular'].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter.replace(' ', ''))}
              style={{
                padding: '10px 20px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap',
                background: activeFilter === filter.replace(' ', '') ? COLORS.dark : 'transparent',
                color: activeFilter === filter.replace(' ', '') ? COLORS.white : COLORS.grey,
                border: activeFilter === filter.replace(' ', '') ? `1px solid ${COLORS.dark}` : `1px solid ${COLORS.border}`
              }}
            >
              {filter === 'all' ? 'All Types' : filter.charAt(0).toUpperCase() + filter.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      <main style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '60px 24px 80px'
      }}>
        {filteredProducts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '100px 0' }}>
            <h3 style={{ fontSize: '24px', fontWeight: 600, color: COLORS.grey }}>No products listed yet. Check back soon.</h3>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
            gap: '32px'
          }}>
            {filteredProducts.map(product => {
              const primaryImage = product.construction_product_images?.find(img => img.is_primary) || product.construction_product_images?.[0];
              const supplier = product.construction_supplier_profiles;
              
              return (
                <div 
                  key={product.id}
                  className="product-card"
                  style={{
                    background: COLORS.white,
                    borderRadius: '16px',
                    border: `1px solid ${COLORS.border}`,
                    overflow: 'hidden',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-8px)';
                    e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <Link to={`/construction/${product.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div style={{ position: 'relative', height: '240px', background: '#f1f5f9' }}>
                      {primaryImage ? (
                        <img 
                          src={primaryImage.public_url} 
                          alt={product.title} 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                          No image available
                        </div>
                      )}
                      
                      {/* Badge */}
                      {product.badge_label && (
                        <div style={{
                          position: 'absolute',
                          top: '16px',
                          left: '16px',
                          padding: '4px 12px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: 700,
                          background: product.badge_label.toLowerCase() === 'in stock' ? COLORS.green : COLORS.dark,
                          color: COLORS.white,
                          textTransform: 'uppercase'
                        }}>
                          {product.badge_label}
                        </div>
                      )}
                    </div>

                    <div style={{ padding: '24px' }}>
                      <h3 style={{
                        fontSize: '20px',
                        fontWeight: 700,
                        fontFamily: "'Sora', sans-serif",
                        marginBottom: '4px'
                      }}>
                        {product.title}
                      </h3>
                      <p style={{ fontSize: '14px', color: COLORS.grey, marginBottom: '16px' }}>
                        {supplier?.company_name} • {supplier?.shipping_port || 'Global Shipping'}
                      </p>

                      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
                        {[
                          { label: product.size_ft, icon: '📏' },
                          { label: product.bedrooms ? `${product.bedrooms} BD` : 'Studio', icon: '🛏' },
                          { label: product.lead_time, icon: '⏱' }
                        ].map((spec, i) => spec.label && (
                          <div key={i} style={{
                            background: '#f1f5f9',
                            padding: '4px 10px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: 600,
                            color: COLORS.dark
                          }}>
                            {spec.label}
                          </div>
                        ))}
                      </div>

                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        marginTop: 'auto'
                      }}>
                        <div style={{ fontSize: '24px', fontWeight: 700, color: COLORS.dark }}>
                          ${product.price_cad.toLocaleString()} <span style={{ fontSize: '14px', fontWeight: 500, color: COLORS.grey }}>CAD</span>
                        </div>
                        <div style={{
                          background: COLORS.dark,
                          color: COLORS.white,
                          padding: '10px 20px',
                          borderRadius: '8px',
                          fontSize: '14px',
                          fontWeight: 600,
                          transition: 'opacity 0.2s'
                        }}>
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

        {/* Custom Build Banner */}
        <div style={{
          marginTop: '80px',
          background: COLORS.dark,
          borderRadius: '24px',
          padding: '48px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '32px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Subtle decoration */}
          <div style={{
            position: 'absolute',
            bottom: '-50px',
            right: '-50px',
            width: '200px',
            height: '200px',
            background: `${COLORS.green}11`,
            borderRadius: '50%'
          }} />

          <div style={{ textAlign: 'left', flex: 1 }}>
            <h2 style={{
              color: COLORS.white,
              fontSize: '32px',
              fontWeight: 700,
              fontFamily: "'Sora', sans-serif",
              marginBottom: '12px'
            }}>
              Have your own design? Build it custom. 🏗
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '18px' }}>
              Upload your floor plan and our supplier will build it to your vision.
            </p>
          </div>

          <Link to="/construction/custom" style={{
            background: COLORS.green,
            color: COLORS.dark,
            padding: '16px 32px',
            borderRadius: '12px',
            fontSize: '18px',
            fontWeight: 700,
            textDecoration: 'none',
            whiteSpace: 'nowrap',
            transition: 'transform 0.2s'
          }} onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'} 
             onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
            Start Custom Order
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        background: COLORS.dark,
        padding: '60px 24px',
        borderTop: `1px solid rgba(255,255,255,0.1)`
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '24px'
        }}>
          <div style={{ color: '#94a3b8', fontSize: '14px' }}>
            HomieAI Construction © 2026
          </div>
          <div style={{ display: 'flex', gap: '32px' }}>
            <Link to="/construction/signup" style={{ 
              color: COLORS.white, 
              fontSize: '14px', 
              textDecoration: 'none',
              fontWeight: 500
            }}>
              Supplier? Sign up here
            </Link>
          </div>
        </div>
      </footer>

      <style dangerouslySetInnerHTML={{ __html: `
        @media (max-width: 768px) {
          .custom-build-banner {
            flex-direction: column;
            text-align: center;
          }
        }
        .product-card:hover .view-details-btn {
          opacity: 0.9;
        }
      `}} />
    </div>
  )
}
