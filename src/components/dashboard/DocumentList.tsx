'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Trash2, AlertCircle } from 'lucide-react';
import type { KBDocument } from '@/types';
import { formatDate } from '@/lib/utils';

interface DocumentListProps {
  documents: KBDocument[];
  onDelete?: (id: string) => void;
}

const statusVariants: Record<string, 'success' | 'warning' | 'info' | 'danger'> = {
  embedded: 'success',
  processing: 'info',
  error: 'danger',
  uploading: 'warning',
};

const PRODUCT_LABELS: Record<string, string> = {
  'careerpilot-ai': 'CareerPilot AI™',
  'magazinify-ai': 'MagazinifyAI™',
  'rfpmatch-ai': 'RFPMatch AI™',
  'techsupport-ai': 'TechSupport AI™',
  visionwing: 'VisionWing™',
  'affiliateledger-ai': 'AffiliateLedger AI™',
  general: 'General',
};

export function DocumentList({ documents, onDelete }: DocumentListProps) {
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this document?')) {
      return;
    }

    setDeleting(id);

    try {
      const response = await fetch(`/api/knowledge-base/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        if (onDelete) onDelete(id);
      } else {
        alert('Failed to delete document');
      }
    } catch (error) {
      alert('Failed to delete document');
    } finally {
      setDeleting(null);
    }
  };

  if (documents.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Knowledge Base Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>No documents uploaded yet.</p>
            <p className="text-sm mt-2">
              Upload PDF, MD, or TXT files to build your knowledge base.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Knowledge Base Documents</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <FileText className="h-5 w-5 text-blue-600 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-sm truncate">{doc.filename}</p>
                    <Badge variant="outline" className="flex-shrink-0">
                      {doc.fileType.toUpperCase()}
                    </Badge>
                    <Badge variant={statusVariants[doc.status]}>
                      {doc.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                    <span>{PRODUCT_LABELS[doc.product] || doc.product}</span>
                    <span>{doc.chunkCount} chunks</span>
                    <span>{formatDate(doc.createdAt)}</span>
                  </div>
                  {doc.errorMessage && (
                    <div className="flex items-center gap-1 mt-1 text-xs text-red-600">
                      <AlertCircle className="h-3 w-3" />
                      <span>{doc.errorMessage}</span>
                    </div>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(doc.id)}
                disabled={deleting === doc.id}
                className="flex-shrink-0 ml-2"
              >
                <Trash2 className="h-4 w-4 text-red-600" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
