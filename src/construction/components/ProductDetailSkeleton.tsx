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

export const ProductDetailSkeleton: React.FC = () => {
  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", minHeight: '100vh', background: '#f5f3ef' }}>
      {/* Header Skeleton */}
      <div style={{ height: '72px', background: COLORS.dark }} />
      
      {/* Hero Section Skeleton */}
      <section style={{
        background: 'linear-gradient(135deg, #1a2332 0%, #2d1b4e 100%)',
        padding: '100px 24px 80px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ 
            display: 'inline-block', 
            background: '#e8f5ee', 
            color: '#1a2332', 
            padding: '4px 12px', 
            borderRadius: '100px', 
            fontSize: '12px', 
            fontWeight: 600, 
            marginBottom: '24px',
            width: '120px',
            height: '24px',
            opacity: 0.7
          }} />
          <div style={{ 
            width: '60%', 
            height: '48px', 
            background: 'rgba(255,255,255,0.1)', 
            margin: '0 auto 20px', 
            borderRadius: '8px',
            opacity: 0.7
          }} />
          <div style={{ 
            width: '80%', 
            height: '24px', 
            background: 'rgba(255,255,255,0.1)', 
            margin: '0 auto', 
            borderRadius: '4px',
            opacity: 0.7
          }} />
        </div>
      </section>

      {/* Filter Bar Skeleton */}
      <div style={{ background: COLORS.white, borderBottom: '1px solid ' + COLORS.border }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '16px 24px', display: 'flex', gap: '12px' }}>
          {[1, 2, 3].map((i) => (
            <div key={i} style={{
              padding: '10px 20px',
              borderRadius: '8px',
              background: '#f5f3ef',
              width: '120px',
              height: '40px',
              opacity: 0.7
            }} />
          ))}
        </div>
      </div>

      {/* Product Details Skeleton */}
      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '60px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', background: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
          
          {/* Left: Images Skeleton */}
          <div style={{ padding: '40px', background: '#f5f3ef' }}>
            <div style={{
              height: 400,
              background: '#e8e4dc',
              borderRadius: '12px',
              marginBottom: '20px',
              opacity: 0.7
            }} />
            <div style={{ display: 'flex', gap: '12px' }}>
              {[1, 2, 3].map((i) => (
                <div key={i} style={{
                  width: 80,
                  height: 80,
                  background: '#e8e4dc',
                  borderRadius: 8,
                  opacity: 0.7
                }} />
              ))}
            </div>
          </div>

          {/* Right: Details Skeleton */}
          <div style={{ padding: '40px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ marginBottom: '24px' }}>
              <div style={{
                width: '80%',
                height: '32px',
                background: '#e8e4dc',
                marginBottom: '12px',
                borderRadius: '4px',
                opacity: 0.7
              }} />
              <div style={{
                width: '60%',
                height: '24px',
                background: '#e8e4dc',
                borderRadius: '4px',
                opacity: 0.7
              }} />
            </div>

            <div style={{
              width: '40%',
              height: '28px',
              background: '#e8e4dc',
              marginBottom: '24px',
              borderRadius: '4px',
              opacity: 0.7
            }} />

            <div style={{ marginBottom: '24px' }}>
              <div style={{
                width: '40%',
                height: '24px',
                background: '#e8e4dc',
                marginBottom: '12px',
                borderRadius: '4px',
                opacity: 0.7
              }} />
              <div style={{
                width: '100%',
                height: '80px',
                background: '#e8e4dc',
                borderRadius: '4px',
                opacity: 0.7
              }} />
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: 'auto' }}>
              <div style={{
                flex: 1,
                background: '#e8e4dc',
                padding: '14px 24px',
                borderRadius: 8,
                height: '48px',
                opacity: 0.7
              }} />
              <div style={{
                flex: 1,
                background: '#e8e4dc',
                padding: '14px 24px',
                borderRadius: 8,
                height: '48px',
                opacity: 0.7
              }} />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}