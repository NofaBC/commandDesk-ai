'use client';

import { useState } from 'react';

export default function VectorDebugPage() {
  const [product, setProduct] = useState('careerpilot-ai');
  const [listResults, setListResults] = useState<any>(null);
  const [cleanupPattern, setCleanupPattern] = useState('');
  const [cleanupResults, setCleanupResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleListVectors = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/debug/list-vectors?product=${product}`);
      const data = await response.json();
      setListResults(data);
    } catch (error) {
      console.error('List error:', error);
      alert('Error listing vectors');
    } finally {
      setLoading(false);
    }
  };

  const handleCleanup = async (dryRun: boolean) => {
    if (!cleanupPattern) {
      alert('Please enter a filename pattern');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/debug/cleanup-vectors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product,
          filenamePattern: cleanupPattern,
          dryRun,
        }),
      });
      const data = await response.json();
      setCleanupResults(data);
      
      if (!dryRun && data.matchingVectors > 0) {
        // Refresh the list after deletion
        handleListVectors();
      }
    } catch (error) {
      console.error('Cleanup error:', error);
      alert('Error cleaning up vectors');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Vector Management</h1>

        {/* Product Selector */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <label className="block text-sm font-medium mb-2">Product Namespace</label>
          <input
            type="text"
            value={product}
            onChange={(e) => setProduct(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
            placeholder="careerpilot-ai"
          />
        </div>

        {/* List Vectors */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">List All Vectors</h2>
          <button
            onClick={handleListVectors}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? 'Loading...' : 'List Vectors'}
          </button>

          {listResults && (
            <div className="mt-6">
              <div className="mb-4">
                <p className="text-lg font-medium">
                  Total Vectors: {listResults.totalVectors}
                </p>
              </div>

              <div className="space-y-4">
                {Object.entries(listResults.files).map(([filename, data]: [string, any]) => (
                  <div key={filename} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-mono text-sm font-semibold">{filename}</h3>
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                        {data.count} chunks
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 font-mono mb-2">
                      {data.sampleText}...
                    </p>
                    <details className="text-xs">
                      <summary className="cursor-pointer text-gray-500 hover:text-gray-700">
                        Show vector IDs
                      </summary>
                      <pre className="mt-2 bg-gray-50 p-2 rounded overflow-x-auto">
                        {JSON.stringify(data.ids, null, 2)}
                      </pre>
                    </details>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Cleanup Vectors */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Delete Vectors by Filename</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Filename Pattern</label>
            <input
              type="text"
              value={cleanupPattern}
              onChange={(e) => setCleanupPattern(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
              placeholder="e.g., 02-pricing-plans.md"
            />
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => handleCleanup(true)}
              disabled={loading}
              className="px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:bg-gray-400"
            >
              {loading ? 'Processing...' : 'Dry Run (Preview)'}
            </button>
            <button
              onClick={() => handleCleanup(false)}
              disabled={loading}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400"
            >
              {loading ? 'Processing...' : 'Delete (Permanent)'}
            </button>
          </div>

          {cleanupResults && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <p className="font-medium mb-2">{cleanupResults.message}</p>
              <div className="text-sm space-y-1">
                <p>Pattern: <code className="bg-white px-2 py-1 rounded">{cleanupResults.filenamePattern}</code></p>
                <p>Matching vectors: <strong>{cleanupResults.matchingVectors}</strong></p>
                <p>Mode: <strong>{cleanupResults.dryRun ? 'DRY RUN' : 'DELETED'}</strong></p>
              </div>
              {cleanupResults.vectorIds.length > 0 && (
                <details className="mt-4">
                  <summary className="cursor-pointer text-gray-600 hover:text-gray-800 text-sm">
                    Show vector IDs
                  </summary>
                  <pre className="mt-2 bg-white p-2 rounded text-xs overflow-x-auto">
                    {JSON.stringify(cleanupResults.vectorIds, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
