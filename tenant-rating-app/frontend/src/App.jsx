import React, { useState } from 'react';

function App() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const checkServerStatus = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch('http://localhost:5001/api/health');
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setResult({ error: err.message || 'Could not reach server' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">
        Tenant Rating App - Coming Soon
      </h1>
      <button
        onClick={checkServerStatus}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Checking...' : 'Check Server Status'}
      </button>
      {result && (
        <pre className="mt-4 p-4 bg-white rounded border text-left text-sm text-gray-700 overflow-auto max-w-md">
          {result.error ? result.error : JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}

export default App;
