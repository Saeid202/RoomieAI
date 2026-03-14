import { useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client-simple'
import { Link } from 'react-router-dom'

interface Product {
  id: string
  title: string
  product_type: string
  status: string
  price_cad: number
  created_at: string
}

const productTypeColors: Record<string, string> = {
  expandable: '#2196F3',
  foldable: '#4CAF50',
  flatpack: '#FF9800',
  capsule: '#9C27B0',
  modular: '#F44336'
}

export default function ConstructionProducts() {
  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState<Product[]>([])
  const [filter, setFilter] = useState<'all' | 'live' | 'draft' | 'archived'>('all')

  useEffect(() => {
    const loadProducts = async () => {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        window.location.href = '/construction/login'
        return
      }

      const role = session.user.user_metadata?.role
      if (role !== 'construction_supplier') {
        await supabase.auth.signOut()
        window.location.href = '/construction/login'
        return
      }

      let query = supabase
        .from('construction_products')
        .select('id, title, product_type, status, price_cad, created_at')
        .eq('supplier_id', session.user.id)
        .order('created_at', { ascending: false })

      if (filter !== 'all') {
        query = query.eq('status', filter)
      }

      const { data } = await query

      if (data) {
        setProducts(data)
      }

      setLoading(false)
    }

    loadProducts()
  }, [filter])

  const handleToggleStatus = async (productId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'draft' ? 'live' : 'draft'
    await supabase
      .from('construction_products')
      .update({ status: newStatus })
      .eq('id', productId)

    setProducts(products.map(p => p.id === productId ? { ...p, status: newStatus } : p))
  }

  const handleArchive = async (productId: string) => {
    await supabase
      .from('construction_products')
      .update({ status: 'archived' })
      .eq('id', productId)

    setProducts(products.map(p => p.id === productId ? { ...p, status: 'archived' } : p))
  }

  if (loading) {
    return <div style={{ padding: 40, fontFamily: 'sans-serif' }}>Loading...</div>
  }

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
          <h2>Products</h2>
          <Link to="/construction/dashboard/products/new" style={{ padding: '10px 20px', background: '#4a90e2', color: 'white', textDecoration: 'none', borderRadius: 6 }}>
            New Product
          </Link>
        </div>

        {/* Filter Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          {['all', 'live', 'draft', 'archived'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              style={{
                padding: '8px 16px',
                background: filter === f ? '#4a90e2' : '#f5f5f5',
                color: filter === f ? 'white' : '#333',
                border: 'none',
                cursor: 'pointer',
                borderRadius: 4
              }}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, background: '#f5f5f5', borderRadius: 8 }}>
            <p style={{ color: '#666', marginBottom: 16 }}>No products yet. Add your first product.</p>
            <Link to="/construction/dashboard/products/new" style={{ padding: '10px 20px', background: '#4a90e2', color: 'white', textDecoration: 'none', borderRadius: 6 }}>
              Add Product
            </Link>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #ddd' }}>
                <th style={{ textAlign: 'left', padding: 12 }}>Title</th>
                <th style={{ textAlign: 'left', padding: 12 }}>Type</th>
                <th style={{ textAlign: 'left', padding: 12 }}>Status</th>
                <th style={{ textAlign: 'left', padding: 12 }}>Price</th>
                <th style={{ textAlign: 'left', padding: 12 }}>Created</th>
                <th style={{ textAlign: 'left', padding: 12 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: 12 }}>{product.title}</td>
                  <td style={{ padding: 12 }}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: 4,
                      fontSize: 12,
                      background: productTypeColors[product.product_type] || '#999',
                      color: 'white'
                    }}>
                      {product.product_type}
                    </span>
                  </td>
                  <td style={{ padding: 12 }}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: 4,
                      fontSize: 12,
                      background: product.status === 'live' ? '#4caf50' : product.status === 'draft' ? '#ff9800' : '#999',
                      color: 'white'
                    }}>
                      {product.status}
                    </span>
                  </td>
                  <td style={{ padding: 12 }}>${product.price_cad}</td>
                  <td style={{ padding: 12 }}>{new Date(product.created_at).toLocaleDateString()}</td>
                  <td style={{ padding: 12 }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <Link to={`/construction/dashboard/products/${product.id}/edit`} style={{ padding: '4px 8px', background: '#4a90e2', color: 'white', textDecoration: 'none', borderRadius: 4, fontSize: 12 }}>
                        Edit
                      </Link>
                      <button
                        onClick={() => handleToggleStatus(product.id, product.status)}
                        style={{ padding: '4px 8px', background: '#2196F3', color: 'white', border: 'none', cursor: 'pointer', borderRadius: 4, fontSize: 12 }}
                      >
                        {product.status === 'draft' ? 'Publish' : 'Draft'}
                      </button>
                      <button
                        onClick={() => handleArchive(product.id)}
                        style={{ padding: '4px 8px', background: '#999', color: 'white', border: 'none', cursor: 'pointer', borderRadius: 4, fontSize: 12 }}
                      >
                        Archive
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
