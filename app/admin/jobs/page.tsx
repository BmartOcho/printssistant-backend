import { createServerClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default async function JobsPage() {
  const supabase = await createServerClient()

  // Fetch all jobs from the database
  const { data: jobs, error } = await supabase.from("print_jobs").select("*").order("created_at", { ascending: false })

  if (error) {
    console.error("[v0] Error fetching jobs:", error)
    return (
      <main className="container mx-auto p-8">
        <h1 className="text-3xl font-bold mb-6">Print Jobs</h1>
        <div className="text-red-500">Error loading jobs: {error.message}</div>
      </main>
    )
  }

  return (
    <main className="container mx-auto p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Print Jobs</h1>
        <p className="text-muted-foreground">
          Total jobs in database: <strong>{jobs?.length || 0}</strong>
        </p>
      </div>

      {!jobs || jobs.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">No jobs found in the database.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {jobs.map((job) => (
            <Card key={job.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      {job.job_title || job.design_title || job.subject || "Untitled Job"}
                    </CardTitle>
                    <CardDescription>{new Date(job.created_at).toLocaleString()}</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="outline">{job.source || "unknown"}</Badge>
                    {job.status && <Badge>{job.status}</Badge>}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2 text-sm">
                  {job.customer_name && (
                    <div>
                      <span className="font-medium">Customer:</span> {job.customer_name}
                      {job.customer_email && ` (${job.customer_email})`}
                    </div>
                  )}
                  {job.description && (
                    <div>
                      <span className="font-medium">Description:</span> {job.description}
                    </div>
                  )}
                  {job.quantity && (
                    <div>
                      <span className="font-medium">Quantity:</span> {job.quantity}
                    </div>
                  )}
                  {job.paper_size && (
                    <div>
                      <span className="font-medium">Paper Size:</span> {job.paper_size}
                    </div>
                  )}
                  {job.color_mode && (
                    <div>
                      <span className="font-medium">Color Mode:</span> {job.color_mode}
                    </div>
                  )}
                  {job.urgency && (
                    <div>
                      <span className="font-medium">Urgency:</span> {job.urgency}
                    </div>
                  )}
                  {job.export_url && (
                    <div>
                      <span className="font-medium">File:</span>{" "}
                      <a
                        href={job.export_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        View Design
                      </a>
                    </div>
                  )}
                  {job.file_urls && Array.isArray(job.file_urls) && job.file_urls.length > 0 && (
                    <div>
                      <span className="font-medium">Files:</span>{" "}
                      {job.file_urls.map((url, idx) => (
                        <a
                          key={idx}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline mr-2"
                        >
                          File {idx + 1}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </main>
  )
}
