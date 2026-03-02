'use client';

import { useEffect, useState } from 'react';
import { Header } from '@/components/layout/Header';
import { DocumentUploader } from '@/components/dashboard/DocumentUploader';
import { DocumentList } from '@/components/dashboard/DocumentList';
import type { KBDocument } from '@/types';

export default function KnowledgeBasePage() {
  const [documents, setDocuments] = useState<KBDocument[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/knowledge-base');
      const data = await response.json();
      setDocuments(data.documents || []);
    } catch (error) {
      console.error('Failed to fetch documents:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleUploadComplete = () => {
    fetchDocuments();
  };

  const handleDelete = (id: string) => {
    setDocuments((prev) => prev.filter((doc) => doc.id !== id));
  };

  return (
    <>
      <Header onRefresh={fetchDocuments} isRefreshing={loading} />
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Knowledge Base
          </h1>
          <p className="text-gray-600">
            Upload documents to enhance auto-reply responses with product-specific
            information. Technical issues are still routed to TechSupport AI™.
          </p>
        </div>

        <DocumentUploader onUploadComplete={handleUploadComplete} />

        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading...</div>
        ) : (
          <DocumentList documents={documents} onDelete={handleDelete} />
        )}
      </div>
    </>
  );
}
