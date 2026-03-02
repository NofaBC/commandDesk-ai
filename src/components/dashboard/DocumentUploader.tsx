'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, FileText } from 'lucide-react';

const PRODUCTS = [
  { value: 'careerpilot-ai', label: 'CareerPilot AI™' },
  { value: 'magazinify-ai', label: 'MagazinifyAI™' },
  { value: 'rfpmatch-ai', label: 'RFPMatch AI™' },
  { value: 'techsupport-ai', label: 'TechSupport AI™' },
  { value: 'visionwing', label: 'VisionWing™' },
  { value: 'affiliateledger-ai', label: 'AffiliateLedger AI™' },
  { value: 'general', label: 'General (All Products)' },
];

interface DocumentUploaderProps {
  onUploadComplete?: () => void;
}

export function DocumentUploader({ onUploadComplete }: DocumentUploaderProps) {
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setMessage(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !selectedProduct) {
      setMessage({ type: 'error', text: 'Please select both a file and a product' });
      return;
    }

    setUploading(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('product', selectedProduct);

      const response = await fetch('/api/knowledge-base/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({
          type: 'success',
          text: `Document uploaded successfully! ${data.chunkCount} chunks created.`,
        });
        setSelectedFile(null);
        setSelectedProduct('');
        if (onUploadComplete) onUploadComplete();
      } else {
        setMessage({ type: 'error', text: data.error || 'Upload failed' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to upload document' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload Document
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Product
          </label>
          <select
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={uploading}
          >
            <option value="">Choose a product...</option>
            {PRODUCTS.map((product) => (
              <option key={product.value} value={product.value}>
                {product.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload File (PDF, MD, TXT)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="file"
              accept=".pdf,.md,.txt"
              onChange={handleFileChange}
              className="flex-1 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              disabled={uploading}
            />
            {selectedFile && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FileText className="h-4 w-4" />
                <span className="truncate max-w-[200px]">{selectedFile.name}</span>
              </div>
            )}
          </div>
        </div>

        <Button
          onClick={handleUpload}
          disabled={!selectedFile || !selectedProduct || uploading}
          className="w-full"
        >
          {uploading ? 'Uploading...' : 'Upload Document'}
        </Button>

        {message && (
          <div
            className={`p-3 rounded-md text-sm ${
              message.type === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {message.text}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
