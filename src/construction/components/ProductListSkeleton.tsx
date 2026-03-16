import React from 'react'

const COLORS = {
  dark: '#1a2332',
  green: '#63c18a',
  lightGreen: '#e8f5ee',
  background: '#f5f3ef',
  border: '#e8e4dc',
  grey: '#666',
  white: '#ffffff'
}

export const ProductListSkeleton: React.FC = () => {
  return (
    <div style={{ background: COLORS.background, minHeight: '100vh', fontFamily: "'DM Sans', sans-serif", color: COLORS.dark }}>
      {/* Header Skeleton */}
      <div style={{ height: '72px', background: COLORS.dark }} />
      
      {/* Hero Section Skeleton */}
      <section style={{ background: COLORS.dark, padding: '140px 24px 80px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ 
            display: 'inline-block', 
            background: COLORS.lightGreen, 
            padding: '4px 12px', 
            borderRadius: '100px', 
            fontSize: '12px', 
            fontWeight: 600, 
            marginBottom: '24px',
            width: '150px',
            height: '24px',
            opacity: 0.7
          }} />
          <div style={{ 
            width: '70%', 
            height: '48px', 
            background: 'rgba(255,255,255,0.1)', 
            margin: '0 auto 20px', 
            borderRadius: '8px',
            opacity: 0.7
          }} />
          <div style={{ 
            width: '90%', 
            height: '24px', 
            background: 'rgba(255,255,255,0.1)', 
            margin: '0 auto', 
            borderRadius: '4px',
            opacity: 0.7
          }} />
        </div>
      </section>

      {/* Filter Bar Skeleton */}
      <div style={{ background: COLORS.white, borderBottom: `1px solid ${COLORS.border}` }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '16px 24px', display: 'flex', gap: '12px' }}>
          {[1, 2, 3].map((i) => (
            <div key={i} style={{
              padding: '10px 20px',
              borderRadius: '8px',
              background: '#f5f3ef',
              width: '140px',
              height: '40px',
              opacity: 0.7
            }} />
          ))}
        </div>
      </div>

      {/* Product Grid Skeleton */}
      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '60px 24px 80px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '32px' }}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} style={{ background: COLORS.white, borderRadius: '16px', border: `1px solid ${COLORS.border}`, overflow: 'hidden' }}>
              <div style={{ height: '240px', background: '#f1f5f9', opacity: 0.7 }} />
              <div style={{ padding: '24px' }}>
                <div style={{ 
                  width: '80%', 
                  height: '24px', 
                  background: '#e8e4dc', 
                  marginBottom: '20px', 
                  borderRadius: '4px',
                  opacity: 0.7
                }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ 
                    width: '40%', 
                    height: '24px', 
                    background: '#e8e4dc', 
                    borderRadius: '4px',
                    opacity: 0.7
                  }} />
                  <div style={{ 
                    width: '30%', 
                    height: '40px', 
                    background: COLORS.dark, 
                    borderRadius: '8px',
                    opacity: 0.7
                  }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}