import { Link } from 'react-router-dom'

export default function ConstructionCustomOrder() {
  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", minHeight: '100vh', background: '#f5f3ef' }}>
      <nav style={{
        background: '#1a2332',
        padding: '0 40px',
        height: 64,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <Link to="/construction" style={{ textDecoration: 'none', color: 'white', fontWeight: 700, fontSize: 20 }}>
          HomieAI <span style={{ color: '#63c18a' }}>AI</span>
        </Link>
        <Link to="/construction" style={{
          color: 'white',
          textDecoration: 'none',
          fontSize: 14,
          fontWeight: 500,
          padding: '8px 16px',
          border: '1px solid rgba(255,255,255,0.3)',
          borderRadius: 6
        }}>
          Back to Products
        </Link>
      </nav>

      <div style={{
        maxWidth: 600,
        margin: '80px auto',
        padding: '40px',
        background: 'white',
        borderRadius: 12,
        textAlign: 'center',
        border: '1px solid #e8e4dc'
      }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🏗️</div>
        <h1 style={{ color: '#1a2332', marginBottom: 8, fontFamily: "'Sora', sans-serif" }}>
          Custom Build Coming Soon
        </h1>
        <p style={{ color: '#64748b', marginBottom: 24 }}>
          Upload your floor plan and connect with our suppliers to build your custom prefab home.
        </p>
        <Link to="/construction" style={{
          background: '#63c18a',
          color: '#1a2332',
          textDecoration: 'none',
          padding: '12px 24px',
          borderRadius: 6,
          fontWeight: 600,
          display: 'inline-block'
        }}>
          Browse Products
        </Link>
      </div>
    </div>
  )
}
