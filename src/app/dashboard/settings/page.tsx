import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function SettingsPage() {
  return (
    <>
      <Header />
      <div className="p-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Email Configuration</CardTitle>
            <CardDescription>
              Configure your Gmail OAuth2 credentials and support email address.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Support Email</label>
                <p className="text-sm text-gray-500 mt-1">
                  {process.env.GMAIL_USER_EMAIL || 'Not configured'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Gmail OAuth2</label>
                <p className="text-sm text-gray-500 mt-1">
                  {process.env.GMAIL_CLIENT_ID ? '✅ Configured' : '❌ Not configured'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>TechSupport-AI Integration</CardTitle>
            <CardDescription>
              Connection to TechSupport-AI for technical issue escalation.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">API URL</label>
                <p className="text-sm text-gray-500 mt-1">
                  {process.env.TECHSUPPORT_API_URL || 'Not configured'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Tenant ID</label>
                <p className="text-sm text-gray-500 mt-1">
                  {process.env.TECHSUPPORT_TENANT_ID ? '✅ Configured' : '❌ Not configured'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Slack Notifications</CardTitle>
            <CardDescription>
              Slack webhook for real-time notifications.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div>
              <label className="text-sm font-medium text-gray-700">Webhook URL</label>
              <p className="text-sm text-gray-500 mt-1">
                {process.env.SLACK_WEBHOOK_URL ? '✅ Configured' : '❌ Not configured'}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Registered Products</CardTitle>
            <CardDescription>
              NOFA AI Factory products monitored by CommandDesk.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[
                'CareerPilot AI™',
                'TechSupport AI™',
                'VisionWing™',
                'MagazinifyAI™',
                'AffiliateLedger AI™',
                'RFPMatch AI™',
              ].map((product) => (
                <div key={product} className="flex items-center gap-2 text-sm">
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  {product}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
