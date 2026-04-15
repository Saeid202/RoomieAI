import { useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client-simple'
import { Link } from 'react-router-dom'
import ProductFormModal from '@/construction/components/ProductFormModal'

interface Product {
  id: string
  title: string
  product_type: string
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
  construction_product_images?: ProductImage[]
}

interface ProductImage {
  id: string
  product_id: string
  storage_path: string
  public_url: string
  is_primary: boolean
  uploaded_at: string
}

const productTypeColors: Record<string, string> = {
  house: '#2196F3',
  cabinet: '#795548',
  bath_kitchen: '#00897B'
}

export default function ConstructionProducts() {
  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState<Product[]>([])
  const [filter, setFilter] = useState<'all' | 'live' | 'draft' | 'archived'>('all')
  const [showFormModal, setShowFormModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [previewProduct, setPreviewProduct] = useState<Product | null>(null)
  const [previewImages, setPreviewImages] = useState<ProductImage[]>([])
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true)
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        window.location.href = '/construction/login'
        return
      }

      const role = session.user.user_metadata?.role
      if (role !== 'construction_supplier') {
        console.warn('User role is not construction_supplier:', role)
      }

      // Fetch all products — single-supplier portal, no need to filter by supplier_id
      let query = supabase
        .from('construction_products')
        .select('id, title, product_type, status, price_cad, created_at, description, bedrooms, size_ft, lead_time, bathrooms, area_sqm, frame_type, shipping_port, available_colors, badge_label, custom_build_enabled')
        .order('created_at', { ascending: false })

      if (filter !== 'all') {
        query = query.eq('status', filter)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching products:', error)
        alert(`Error loading products: ${error.message}`)
      }

      if (data) {
        console.log('Products loaded:', data.length, data)
        setProducts(data)
      } else {
        console.log('No products data returned, error:', error)
      }

      setLoading(false)
    }

    loadProducts()
  }, [filter, refreshTrigger])

  const handleToggleStatus = async (productId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'draft' ? 'live' : 'draft'
    const { error } = await supabase
      .from('construction_products')
      .update({ status: newStatus })
      .eq('id', productId)

    if (error) {
      console.error('Failed to update status:', error)
      alert(`Failed to update status: ${error.message}`)
      return
    }

    // Update local state without triggering a re-fetch
    setProducts(prev => prev.map(p => p.id === productId ? { ...p, status: newStatus } : p))
  }

  const handleArchive = async (productId: string) => {
    await supabase
      .from('construction_products')
      .update({ status: 'archived' })
      .eq('id', productId)

    setProducts(products.map(p => p.id === productId ? { ...p, status: 'archived' } : p))
  }

  const handleDelete = async (productId: string) => {
    if (!window.confirm('Are you sure you want to delete this listing? This action cannot be undone.')) {
      return
    }
    await supabase
      .from('construction_products')
      .delete()
      .eq('id', productId)

    setProducts(products.filter(p => p.id !== productId))
  }

  const handlePreviewClick = async (product: Product) => {
    setPreviewProduct(product)
    setSelectedImageIndex(0)
    
    // Fetch images for the product
    const { data: images } = await supabase
      .from('construction_product_images')
      .select('id, product_id, storage_path, public_url, is_primary, uploaded_at')
      .eq('product_id', product.id)
      .order('is_primary', { ascending: false })
      .order('sort_order', { ascending: true })

    setPreviewImages(images || [])
    
    // Log for debugging
    console.log('Preview product:', product)
    console.log('Preview images:', images)
  }

  const closePreview = () => {
    setPreviewProduct(null)
    setPreviewImages([])
    setSelectedImageIndex(0)
  }

  const handleEditClick = (product: Product) => {
    setEditingProduct(product)
    setShowFormModal(true)
  }

  if (loading) {
    return <div style={{ padding: 40, fontFamily: 'sans-serif' }}>Loading...</div>
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Inter, sans-serif', background: '#f8f9fa' }}>
      {/* Sidebar */}
      <div style={{ 
        width: 250, 
        background: 'linear-gradient(135deg, #1a1f2e 0%, #2d1b4e 100%)',
        color: 'white', 
        padding: 24, 
        display: 'flex', 
        flexDirection: 'column',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ marginBottom: 40, fontSize: 18, fontWeight: 'bold', background: 'linear-gradient(135deg, #FF6B35 0%, #8B5CF6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>HomieAI Construction</div>
        <nav style={{ flex: 1 }}>
          <Link to="/construction/dashboard" style={{ display: 'block', padding: '12px 16px', color: '#b0b8c1', textDecoration: 'none', marginBottom: 8, borderRadius: 8, transition: 'all 0.3s ease', cursor: 'pointer' }} onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(139, 92, 246, 0.1)'; (e.currentTarget as HTMLAnchorElement).style.color = 'white' }} onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = 'transparent'; (e.currentTarget as HTMLAnchorElement).style.color = '#b0b8c1' }}>Home</Link>
          <Link to="/construction/dashboard/products" style={{ display: 'block', padding: '12px 16px', color: 'white', textDecoration: 'none', borderLeft: '3px solid #FF6B35', paddingLeft: '13px', background: 'rgba(255, 107, 53, 0.1)', borderRadius: '0 8px 8px 0', marginBottom: 8 }}>Products</Link>
          <Link to="/construction/dashboard/quotes" style={{ display: 'block', padding: '12px 16px', color: '#b0b8c1', textDecoration: 'none', marginBottom: 8, borderRadius: 8, transition: 'all 0.3s ease', cursor: 'pointer' }} onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(139, 92, 246, 0.1)'; (e.currentTarget as HTMLAnchorElement).style.color = 'white' }} onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = 'transparent'; (e.currentTarget as HTMLAnchorElement).style.color = '#b0b8c1' }}>Quotes</Link>
          <Link to="/construction/dashboard/messages" style={{ display: 'block', padding: '12px 16px', color: '#b0b8c1', textDecoration: 'none', marginBottom: 8, borderRadius: 8, transition: 'all 0.3s ease', cursor: 'pointer' }} onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(139, 92, 246, 0.1)'; (e.currentTarget as HTMLAnchorElement).style.color = 'white' }} onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = 'transparent'; (e.currentTarget as HTMLAnchorElement).style.color = '#b0b8c1' }}>Messages</Link>
          <Link to="/construction/dashboard/profile" style={{ display: 'block', padding: '12px 16px', color: '#b0b8c1', textDecoration: 'none', marginBottom: 8, borderRadius: 8, transition: 'all 0.3s ease', cursor: 'pointer' }} onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(139, 92, 246, 0.1)'; (e.currentTarget as HTMLAnchorElement).style.color = 'white' }} onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = 'transparent'; (e.currentTarget as HTMLAnchorElement).style.color = '#b0b8c1' }}>Profile</Link>
        </nav>
        <Link to="/construction/login" style={{ padding: '12px 16px', background: 'linear-gradient(135deg, #FF6B35 0%, #E55A2B 100%)', color: 'white', border: 'none', cursor: 'pointer', borderRadius: 8, width: '100%', textAlign: 'center', textDecoration: 'none', fontWeight: 600, transition: 'all 0.3s ease', boxShadow: '0 4px 12px rgba(255, 107, 53, 0.3)' }} onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 6px 16px rgba(255, 107, 53, 0.4)' }} onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 4px 12px rgba(255, 107, 53, 0.3)' }}>
          Logout
        </Link>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: 40, overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <div>
            <h2 style={{ fontSize: 32, fontWeight: 700, color: '#1a1f2e', marginBottom: 8 }}>Products</h2>
            <p style={{ color: '#6b7280', fontSize: 15 }}>Manage and publish your construction products</p>
          </div>
          <button
            onClick={() => setShowFormModal(true)}
            style={{ 
              padding: '12px 24px', 
              background: 'linear-gradient(135deg, #FF6B35 0%, #8B5CF6 100%)',
              color: 'white', 
              border: 'none', 
              cursor: 'pointer', 
              borderRadius: 8, 
              fontWeight: 600,
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 12px rgba(255, 107, 53, 0.3)'
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 6px 16px rgba(255, 107, 53, 0.4)' }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 12px rgba(255, 107, 53, 0.3)' }}
          >
            + New Product
          </button>
        </div>

        {/* Filter Tabs */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 32, borderBottom: '1px solid #e5e7eb', paddingBottom: 16 }}>
          {['all', 'live', 'draft', 'archived'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              style={{
                padding: '8px 16px',
                background: filter === f ? 'linear-gradient(135deg, #FF6B35 0%, #8B5CF6 100%)' : 'transparent',
                color: filter === f ? 'white' : '#6b7280',
                border: filter === f ? 'none' : '1px solid #e5e7eb',
                cursor: 'pointer',
                borderRadius: 6,
                fontWeight: 600,
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => { if (filter !== f) { (e.currentTarget as HTMLButtonElement).style.borderColor = '#FF6B35'; (e.currentTarget as HTMLButtonElement).style.color = '#FF6B35' } }}
              onMouseLeave={(e) => { if (filter !== f) { (e.currentTarget as HTMLButtonElement).style.borderColor = '#e5e7eb'; (e.currentTarget as HTMLButtonElement).style.color = '#6b7280' } }}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, background: 'white', borderRadius: 12, boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)', border: '1px solid #e5e7eb' }}>
            <p style={{ color: '#6b7280', marginBottom: 24, fontSize: 16 }}>No products yet. Add your first product to get started.</p>
            <button
              onClick={() => setShowFormModal(true)}
              style={{ 
                padding: '12px 24px', 
                background: 'linear-gradient(135deg, #FF6B35 0%, #8B5CF6 100%)',
                color: 'white', 
                border: 'none', 
                cursor: 'pointer', 
                borderRadius: 8, 
                fontWeight: 600,
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 12px rgba(255, 107, 53, 0.3)'
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 6px 16px rgba(255, 107, 53, 0.4)' }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 12px rgba(255, 107, 53, 0.3)' }}
            >
              Add Product
            </button>
          </div>
        ) : (
          <div style={{ background: 'white', borderRadius: 12, boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'linear-gradient(135deg, rgba(255, 107, 53, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%)', borderBottom: '2px solid #e5e7eb' }}>
                  <th style={{ textAlign: 'left', padding: 16, fontWeight: 700, color: '#1a1f2e', fontSize: 14 }}>Title</th>
                  <th style={{ textAlign: 'left', padding: 16, fontWeight: 700, color: '#1a1f2e', fontSize: 14 }}>Type</th>
                  <th style={{ textAlign: 'left', padding: 16, fontWeight: 700, color: '#1a1f2e', fontSize: 14 }}>Status</th>
                  <th style={{ textAlign: 'left', padding: 16, fontWeight: 700, color: '#1a1f2e', fontSize: 14 }}>Price</th>
                  <th style={{ textAlign: 'left', padding: 16, fontWeight: 700, color: '#1a1f2e', fontSize: 14 }}>Colors/Patterns</th>
                  <th style={{ textAlign: 'left', padding: 16, fontWeight: 700, color: '#1a1f2e', fontSize: 14 }}>Created</th>
                  <th style={{ textAlign: 'left', padding: 16, fontWeight: 700, color: '#1a1f2e', fontSize: 14 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(product => (
                  <tr key={product.id} style={{ borderBottom: '1px solid #e5e7eb', transition: 'all 0.3s ease' }} onMouseEnter={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = 'rgba(255, 107, 53, 0.02)' }} onMouseLeave={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = 'transparent' }}>
                    <td style={{ padding: 16, color: '#1a1f2e', fontWeight: 500 }}>{product.title}</td>
                    <td style={{ padding: 16 }}>
                      <span style={{
                        padding: '6px 12px',
                        borderRadius: 6,
                        fontSize: 12,
                        background: productTypeColors[product.product_type] || '#999',
                        color: 'white',
                        fontWeight: 600
                      }}>
                        {product.product_type}
                      </span>
                    </td>
                    <td style={{ padding: 16 }}>
                      <span style={{
                        padding: '6px 12px',
                        borderRadius: 6,
                        fontSize: 12,
                        background: product.status === 'live' ? '#10b981' : product.status === 'draft' ? '#f59e0b' : '#6b7280',
                        color: 'white',
                        fontWeight: 600
                      }}>
                        {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
                      </span>
                    </td>
                    <td style={{ padding: 16, color: '#1a1f2e', fontWeight: 600 }}>${product.price_cad.toLocaleString()}</td>
                    <td style={{ padding: 16 }}>
                      {product.available_colors && product.available_colors.length > 0 ? (
                        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                          {product.available_colors.slice(0, 3).map((option: any, index: number) => (
                            <div key={index} style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              {option.type === 'pattern' ? (
                                <img
                                  src={option.imageUrl}
                                  alt={option.name}
                                  style={{
                                    width: 24,
                                    height: 24,
                                    borderRadius: 4,
                                    objectFit: 'cover',
                                    border: '1px solid #e5e7eb'
                                  }}
                                  title={option.name}
                                />
                              ) : (
                                <div
                                  style={{
                                    width: 24,
                                    height: 24,
                                    borderRadius: 4,
                                    background: option.hex,
                                    border: '1px solid #e5e7eb'
                                  }}
                                  title={option.name}
                                />
                              )}
                            </div>
                          ))}
                          {product.available_colors.length > 3 && (
                            <span style={{ fontSize: 12, color: '#6b7280', fontWeight: 500 }}>
                              +{product.available_colors.length - 3}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span style={{ fontSize: 12, color: '#9ca3af', fontStyle: 'italic' }}>None</span>
                      )}
                    </td>
                    <td style={{ padding: 16, color: '#6b7280', fontSize: 14 }}>{new Date(product.created_at).toLocaleDateString()}</td>
                    <td style={{ padding: 16 }}>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => handlePreviewClick(product)} style={{ padding: '6px 12px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white', border: 'none', cursor: 'pointer', textDecoration: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, transition: 'all 0.3s ease', boxShadow: '0 2px 6px rgba(16, 185, 129, 0.2)' }} onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 10px rgba(16, 185, 129, 0.3)' }} onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 2px 6px rgba(16, 185, 129, 0.2)' }}>
                          👁 View
                        </button>
                        <button onClick={() => handleEditClick(product)} style={{ padding: '6px 12px', background: 'linear-gradient(135deg, #FF6B35 0%, #E55A2B 100%)', color: 'white', border: 'none', cursor: 'pointer', textDecoration: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, transition: 'all 0.3s ease', boxShadow: '0 2px 6px rgba(255, 107, 53, 0.2)' }} onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 10px rgba(255, 107, 53, 0.3)' }} onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 2px 6px rgba(255, 107, 53, 0.2)' }}>
                          Edit
                        </button>
                        <button
                          onClick={() => handleToggleStatus(product.id, product.status)}
                          style={{ padding: '6px 12px', background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)', color: 'white', border: 'none', cursor: 'pointer', borderRadius: 6, fontSize: 12, fontWeight: 600, transition: 'all 0.3s ease', boxShadow: '0 2px 6px rgba(139, 92, 246, 0.2)' }}
                          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 10px rgba(139, 92, 246, 0.3)' }}
                          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 2px 6px rgba(139, 92, 246, 0.2)' }}
                        >
                          {product.status === 'draft' ? 'Publish' : 'Draft'}
                        </button>
                        <button
                          onClick={() => handleArchive(product.id)}
                          style={{ padding: '6px 12px', background: '#d1d5db', color: '#1a1f2e', border: 'none', cursor: 'pointer', borderRadius: 6, fontSize: 12, fontWeight: 600, transition: 'all 0.3s ease' }}
                          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#9ca3af'; (e.currentTarget as HTMLButtonElement).style.color = 'white' }}
                          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#d1d5db'; (e.currentTarget as HTMLButtonElement).style.color = '#1a1f2e' }}
                        >
                          Archive
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          style={{ padding: '6px 12px', background: '#ef4444', color: 'white', border: 'none', cursor: 'pointer', borderRadius: 6, fontSize: 12, fontWeight: 600, transition: 'all 0.3s ease' }}
                          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#dc2626'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 2px 6px rgba(239, 68, 68, 0.3)' }}
                          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#ef4444'; (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none' }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <ProductFormModal
          isOpen={showFormModal}
          onClose={() => {
            setShowFormModal(false)
            setEditingProduct(null)
          }}
          onSuccess={() => {
            setShowFormModal(false)
            setEditingProduct(null)
            setFilter('all')
            setRefreshTrigger(prev => prev + 1)
          }}
          editingProduct={editingProduct}
        />

        {/* Product Preview Modal */}
        {previewProduct && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 20,
            cursor: 'pointer'
          }} onClick={closePreview}>
            <div style={{
              background: 'white',
              borderRadius: 12,
              maxWidth: 1000,
              width: '100%',
              maxHeight: '95vh',
              overflowY: 'auto',
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.3)',
              position: 'relative',
              pointerEvents: 'auto'
            }}>
              {/* Close Button */}
              <button
                onClick={closePreview}
                style={{
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  background: 'rgba(255, 255, 255, 0.9)',
                  border: 'none',
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  cursor: 'pointer',
                  fontSize: 20,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 10,
                  transition: 'all 0.3s ease',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'white'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)' }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255, 255, 255, 0.9)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)' }}
              >
                ✕
              </button>

              {/* Product Content */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0, minHeight: '600px' }}>
                {/* Left: Image Gallery */}
                <div style={{ background: '#f9fafb', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                  {previewImages.length > 0 ? (
                    <>
                      {/* Main Image */}
                      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, position: 'relative' }}>
                        <img
                          src={previewImages[selectedImageIndex].public_url}
                          alt={previewProduct.title}
                          style={{
                            maxWidth: '100%',
                            maxHeight: '100%',
                            objectFit: 'contain',
                            borderRadius: 8
                          }}
                        />
                        
                        {/* Navigation Arrows */}
                        {previewImages.length > 1 && (
                          <>
                            <button
                              onClick={() => setSelectedImageIndex((prev) => (prev === 0 ? previewImages.length - 1 : prev - 1))}
                              style={{
                                position: 'absolute',
                                left: 12,
                                top: '50%',
                                transform: 'translateY(-50%)',
                                background: 'rgba(0, 0, 0, 0.5)',
                                color: 'white',
                                border: 'none',
                                width: 40,
                                height: 40,
                                borderRadius: '50%',
                                cursor: 'pointer',
                                fontSize: 20,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.3s ease'
                              }}
                              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0, 0, 0, 0.7)' }}
                              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0, 0, 0, 0.5)' }}
                            >
                              ‹
                            </button>
                            <button
                              onClick={() => setSelectedImageIndex((prev) => (prev === previewImages.length - 1 ? 0 : prev + 1))}
                              style={{
                                position: 'absolute',
                                right: 12,
                                top: '50%',
                                transform: 'translateY(-50%)',
                                background: 'rgba(0, 0, 0, 0.5)',
                                color: 'white',
                                border: 'none',
                                width: 40,
                                height: 40,
                                borderRadius: '50%',
                                cursor: 'pointer',
                                fontSize: 20,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.3s ease'
                              }}
                              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0, 0, 0, 0.7)' }}
                              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0, 0, 0, 0.5)' }}
                            >
                              ›
                            </button>
                          </>
                        )}
                      </div>

                      {/* Thumbnail Gallery */}
                      {previewImages.length > 1 && (
                        <div style={{
                          padding: 12,
                          borderTop: '1px solid #e5e7eb',
                          display: 'flex',
                          gap: 8,
                          overflowX: 'auto',
                          background: 'white'
                        }}>
                          {previewImages.map((img, idx) => (
                            <button
                              key={img.id}
                              onClick={() => setSelectedImageIndex(idx)}
                              style={{
                                width: 70,
                                height: 70,
                                minWidth: 70,
                                padding: 0,
                                border: selectedImageIndex === idx ? '3px solid #FF6B35' : '2px solid #e5e7eb',
                                borderRadius: 6,
                                cursor: 'pointer',
                                overflow: 'hidden',
                                transition: 'all 0.3s ease',
                                background: 'white'
                              }}
                              onMouseEnter={(e) => { if (selectedImageIndex !== idx) { (e.currentTarget as HTMLButtonElement).style.borderColor = '#FF6B35' } }}
                              onMouseLeave={(e) => { if (selectedImageIndex !== idx) { (e.currentTarget as HTMLButtonElement).style.borderColor = '#e5e7eb' } }}
                            >
                              <img
                                src={img.public_url}
                                alt="Thumbnail"
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover'
                                }}
                              />
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <div style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#9ca3af',
                      fontSize: 14
                    }}>
                      No images available
                    </div>
                  )}
                </div>

                {/* Right: Product Details */}
                <div style={{ padding: 32, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
                  {/* Title and Type */}
                  <div style={{ marginBottom: 24 }}>
                    <h2 style={{ fontSize: 28, fontWeight: 700, color: '#1a1f2e', marginBottom: 12 }}>
                      {previewProduct.title}
                    </h2>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                      <span style={{
                        padding: '8px 14px',
                        borderRadius: 6,
                        fontSize: 12,
                        background: productTypeColors[previewProduct.product_type] || '#999',
                        color: 'white',
                        fontWeight: 600
                      }}>
                        {previewProduct.product_type.charAt(0).toUpperCase() + previewProduct.product_type.slice(1)}
                      </span>
                      <span style={{
                        padding: '8px 14px',
                        borderRadius: 6,
                        fontSize: 12,
                        background: previewProduct.status === 'live' ? '#10b981' : previewProduct.status === 'draft' ? '#f59e0b' : '#6b7280',
                        color: 'white',
                        fontWeight: 600
                      }}>
                        {previewProduct.status.charAt(0).toUpperCase() + previewProduct.status.slice(1)}
                      </span>
                    </div>
                  </div>

                  {/* Price */}
                  <div style={{ marginBottom: 24, paddingBottom: 24, borderBottom: '1px solid #e5e7eb' }}>
                    <p style={{ color: '#6b7280', fontSize: 13, marginBottom: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Price</p>
                    <p style={{ fontSize: 32, fontWeight: 700, color: '#FF6B35' }}>
                      ${previewProduct.price_cad.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </p>
                  </div>

                  {/* Description */}
                  {previewProduct.description && (
                    <div style={{ marginBottom: 24, paddingBottom: 24, borderBottom: '1px solid #e5e7eb' }}>
                      <p style={{ color: '#6b7280', fontSize: 13, marginBottom: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Description</p>
                      <p style={{ color: '#1a1f2e', fontSize: 15, lineHeight: 1.7 }}>
                        {previewProduct.description}
                      </p>
                    </div>
                  )}

                  {/* Specifications */}
                  <div style={{ marginBottom: 24 }}>
                    <p style={{ color: '#6b7280', fontSize: 13, marginBottom: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Specifications</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      {previewProduct.bedrooms && (
                        <div style={{ padding: 12, background: '#f9fafb', borderRadius: 8, border: '1px solid #e5e7eb' }}>
                          <p style={{ color: '#6b7280', fontSize: 12, marginBottom: 4 }}>Bedrooms</p>
                          <p style={{ color: '#1a1f2e', fontWeight: 600, fontSize: 15 }}>{previewProduct.bedrooms}</p>
                        </div>
                      )}
                      {previewProduct.bathrooms && (
                        <div style={{ padding: 12, background: '#f9fafb', borderRadius: 8, border: '1px solid #e5e7eb' }}>
                          <p style={{ color: '#6b7280', fontSize: 12, marginBottom: 4 }}>Bathrooms</p>
                          <p style={{ color: '#1a1f2e', fontWeight: 600, fontSize: 15 }}>{previewProduct.bathrooms}</p>
                        </div>
                      )}
                      {previewProduct.size_ft && (
                        <div style={{ padding: 12, background: '#f9fafb', borderRadius: 8, border: '1px solid #e5e7eb' }}>
                          <p style={{ color: '#6b7280', fontSize: 12, marginBottom: 4 }}>Size (sq ft)</p>
                          <p style={{ color: '#1a1f2e', fontWeight: 600, fontSize: 15 }}>{previewProduct.size_ft}</p>
                        </div>
                      )}
                      {previewProduct.area_sqm && (
                        <div style={{ padding: 12, background: '#f9fafb', borderRadius: 8, border: '1px solid #e5e7eb' }}>
                          <p style={{ color: '#6b7280', fontSize: 12, marginBottom: 4 }}>Area (sqm)</p>
                          <p style={{ color: '#1a1f2e', fontWeight: 600, fontSize: 15 }}>{previewProduct.area_sqm}</p>
                        </div>
                      )}
                      {previewProduct.lead_time && (
                        <div style={{ padding: 12, background: '#f9fafb', borderRadius: 8, border: '1px solid #e5e7eb' }}>
                          <p style={{ color: '#6b7280', fontSize: 12, marginBottom: 4 }}>Lead Time</p>
                          <p style={{ color: '#1a1f2e', fontWeight: 600, fontSize: 15 }}>{previewProduct.lead_time}</p>
                        </div>
                      )}
                      {previewProduct.frame_type && (
                        <div style={{ padding: 12, background: '#f9fafb', borderRadius: 8, border: '1px solid #e5e7eb' }}>
                          <p style={{ color: '#6b7280', fontSize: 12, marginBottom: 4 }}>Frame Type</p>
                          <p style={{ color: '#1a1f2e', fontWeight: 600, fontSize: 15 }}>{previewProduct.frame_type}</p>
                        </div>
                      )}
                      {previewProduct.shipping_port && (
                        <div style={{ padding: 12, background: '#f9fafb', borderRadius: 8, border: '1px solid #e5e7eb' }}>
                          <p style={{ color: '#6b7280', fontSize: 12, marginBottom: 4 }}>Shipping Port</p>
                          <p style={{ color: '#1a1f2e', fontWeight: 600, fontSize: 15 }}>{previewProduct.shipping_port}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Close Button */}
                  <button
                    onClick={closePreview}
                    style={{
                      width: '100%',
                      padding: '12px 24px',
                      background: 'linear-gradient(135deg, #FF6B35 0%, #E55A2B 100%)',
                      color: 'white',
                      border: 'none',
                      cursor: 'pointer',
                      borderRadius: 8,
                      fontWeight: 600,
                      transition: 'all 0.3s ease',
                      marginTop: 'auto'
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 6px 16px rgba(255, 107, 53, 0.4)' }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none' }}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

