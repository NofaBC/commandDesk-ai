import type {
  TechSupportCaseRequest,
  TechSupportCaseResponse,
} from '@/types';

/**
 * Forward a technical issue to TechSupport-AI by creating a new case.
 * Calls POST /api/cases on the TechSupport-AI instance.
 */
export async function forwardToTechSupport(
  data: TechSupportCaseRequest
): Promise<TechSupportCaseResponse> {
  const baseUrl = process.env.TECHSUPPORT_API_URL;
  const tenantId = process.env.TECHSUPPORT_TENANT_ID;
  const apiKey = process.env.TECHSUPPORT_API_KEY;

  if (!baseUrl || !tenantId) {
    throw new Error(
      'TechSupport-AI not configured: missing TECHSUPPORT_API_URL or TECHSUPPORT_TENANT_ID'
    );
  }

  const url = `${baseUrl}/api/cases`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-tenant-id': tenantId,
  };

  if (apiKey) {
    headers['Authorization'] = `Bearer ${apiKey}`;
  }

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      product: data.product,
      category: data.category,
      severity: data.severity,
      language: data.language || 'en',
      customerContact: {
        phone: data.customerContact.phone || '',
        email: data.customerContact.email,
        name: data.customerContact.name,
      },
      problem: data.problem,
      source: 'commanddesk-ai',
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `TechSupport-AI API error (${response.status}): ${errorText}`
    );
  }

  const result: TechSupportCaseResponse = await response.json();
  return result;
}

/**
 * Check the status of a case in TechSupport-AI.
 */
export async function getTechSupportCaseStatus(
  caseId: string
): Promise<TechSupportCaseResponse | null> {
  const baseUrl = process.env.TECHSUPPORT_API_URL;
  const tenantId = process.env.TECHSUPPORT_TENANT_ID;
  const apiKey = process.env.TECHSUPPORT_API_KEY;

  if (!baseUrl || !tenantId) return null;

  const url = `${baseUrl}/api/cases/${caseId}`;

  const headers: Record<string, string> = {
    'x-tenant-id': tenantId,
  };

  if (apiKey) {
    headers['Authorization'] = `Bearer ${apiKey}`;
  }

  try {
    const response = await fetch(url, { headers });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}
