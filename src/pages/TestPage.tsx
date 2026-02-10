export default function TestPage() {
    return (
        <div style={{ padding: '20px', background: '#f0f0f0', minHeight: '100vh' }}>
            <h1 style={{ color: 'blue', fontSize: '24px' }}>Test Page (No Auth Required)</h1>
            <p>This page is not protected by authentication.</p>
            <p>If you can see this, the basic routing works.</p>
            
            <div style={{ background: 'yellow', padding: '10px', marginTop: '20px' }}>
                Yellow box test - if you see this, React is working!
            </div>
            
            <div style={{ background: 'lightblue', padding: '10px', marginTop: '20px' }}>
                Current URL: {typeof window !== 'undefined' ? window.location.href : 'Server-side'}
            </div>
        </div>
    );
}
