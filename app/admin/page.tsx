// app/admin/page.tsx
import { supabaseAdmin } from "@/app/lib/supabase-server"
import { format } from "date-fns"

export const dynamic = "force-dynamic" // always fetch fresh data on load

export default async function AdminPage() {
  // Fetch jobs from Supabase (newest first)
  const { data: jobs, error } = await supabaseAdmin
    .from("print_jobs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50)

  if (error) {
    console.error("[AdminPage] Supabase fetch error:", error)
    return (
      <main className="flex min-h-screen items-center justify-center text-red-500">
        <p>Failed to load jobs: {error.message}</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-6xl bg-white rounded-2xl shadow p-6">
        <h1 className="text-3xl font-bold mb-6">📋 Printssistant Job Dashboard</h1>

        <table className="w-full border-collapse text-sm">
          <thead className="border-b bg-gray-100 text-left">
            <tr>
              <th className="p-3">Source</th>
              <th className="p-3">Customer</th>
              <th className="p-3">Job Title</th>
              <th className="p-3">Status</th>
              <th className="p-3">Created</th>
              <th className="p-3">Export URL</th>
            </tr>
          </thead>
          <tbody>
            {jobs?.length ? (
              jobs.map((job) => (
                <tr key={job.id} className="border-b hover:bg-gray-50">
                  <td className="p-3 font-medium">{job.source}</td>
                  <td className="p-3">
                    <div className="flex flex-col">
                      <span>{job.customer_name || "—"}</span>
                      <span className="text-gray-500 text-xs">{job.customer_email}</span>
                    </div>
                  </td>
                  <td className="p-3">{job.job_title || job.subject || "—"}</td>
                  <td className="p-3">
                    <span
                      className={`inline-block px-2 py-1 text-xs rounded-full font-semibold ${
                        job.status === "completed"
                          ? "bg-green-100 text-green-700"
                          : job.status === "processing"
                          ? "bg-yellow-100 text-yellow-700"
                          : job.status === "asset_received"
                          ? "bg-blue-100 text-blue-700"
                          : job.status === "cancelled"
                          ? "bg-gray-200 text-gray-600"
                          : "bg-orange-100 text-orange-700"
                      }`}
                    >
                      {job.status}
                    </span>
                  </td>
                  <td className="p-3">
                    {job.created_at
                      ? format(new Date(job.created_at), "MMM d, yyyy h:mm a")
                      : "—"}
                  </td>
                  <td className="p-3 truncate max-w-xs">
                    {job.export_url ? (
                      <a
                        href={job.export_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:underline"
                      >
                        Open PDF
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-center text-gray-500 p-6">
                  No jobs found
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <p className="text-xs text-gray-400 mt-6">
          Showing {jobs?.length || 0} recent jobs. Auto-refresh coming soon.
        </p>
      </div>
    </main>
  )
}
