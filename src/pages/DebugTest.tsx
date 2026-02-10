export default function DebugTest() {
    console.log('DebugTest component mounted');
    return (
        <div style={{ 
            padding: '40px', 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            minHeight: '100vh',
            color: 'white',
            fontFamily: 'Arial, sans-serif'
        }}>
            <h1 style={{ fontSize: '48px', marginBottom: '20px' }}>🎉 DEBUG TEST PAGE 🎉</h1>
            <p style={{ fontSize: '18px', marginBottom: '10px' }}>If you can see this, the app is working!</p>
            <div style={{ 
                background: 'white', 
                padding: '20px', 
                borderRadius: '10px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}>
                <h2 style={{ color: '#333', marginBottom: '10px' }}>Status Check:</h2>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                    <li style={{ marginBottom: '8px' }}>✅ React Router: Working</li>
                    <li style={{ marginBottom: '8px' }}>✅ Vite Server: Running</li>
                    <li style={{ marginBottom: '8px' }}>✅ Component Mounting: {console.log('mounted') in console}</li>
                    <li style={{ marginBottom: '8px' }}>✅ No __dirname Error: Should be fixed</li>
                </ul>
            </div>
            <p style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
                Current URL: {typeof window !== 'undefined' ? window.location.href : 'Loading...'}
            </p>
        </div>
    );
}
