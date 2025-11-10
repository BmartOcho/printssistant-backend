export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="max-w-2xl text-center">
        <h1 className="text-4xl font-bold mb-4">Printssistant Backend</h1>
        <p className="text-muted-foreground mb-8">
          API backend for handling print job submissions from multiple sources
        </p>

        <div className="grid gap-4 text-left">
          <div className="border rounded-lg p-4">
            <h2 className="font-semibold mb-2">📧 Email Jobs</h2>
            <code className="text-sm text-muted-foreground">POST /api/jobs/email</code>
          </div>

          <div className="border rounded-lg p-4">
            <h2 className="font-semibold mb-2">📝 Web Form Jobs</h2>
            <code className="text-sm text-muted-foreground">POST /api/jobs/form</code>
          </div>

          <div className="border rounded-lg p-4">
            <h2 className="font-semibold mb-2">🎨 Canva Webhook</h2>
            <code className="text-sm text-muted-foreground">POST /api/webhooks/canva</code>
          </div>
        </div>

        <div className="mt-8">
          <a
            href="/admin/jobs"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            View All Jobs
          </a>
        </div>

        <p className="mt-8 text-sm text-muted-foreground">See SETUP.md for complete integration instructions</p>
      </div>
    </main>
  )
}
