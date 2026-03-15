import { Link } from 'react-router-dom'
import ConstructionHeader from '@/construction/components/ConstructionHeader'

export default function ConstructionCustomOrder() {
  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", minHeight: '100vh', background: '#f5f3ef' }}>
      <ConstructionHeader />

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
