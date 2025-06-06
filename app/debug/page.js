// Debug page to check environment variables
'use client';

export default function DebugPage() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  
  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>Debug Info</h1>
      <p><strong>API URL:</strong> {apiUrl || 'Not set'}</p>
      <p><strong>Default:</strong> http://localhost:8000</p>
      
      <button onClick={() => {
        fetch(`${apiUrl || 'http://localhost:8000'}/`)
          .then(res => res.text())
          .then(data => alert(`Response: ${data}`))
          .catch(err => alert(`Error: ${err.message}`));
      }}>
        Test API Connection
      </button>
    </div>
  );
}
