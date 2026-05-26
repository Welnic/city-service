"use client"

import { use, useState, useMemo } from "react"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  XCircle,
  Pause,
  Download,
  ChevronRight,
  ImageIcon,
  X,
  Loader2,
  AlertCircle,
} from "lucide-react"
import {
  fetchDefectActById,
  fetchNotesByDefectAct,
  fetchJobsByDefectAct,
  fetchMaterialsByDefectAct,
  fetchObjectById,
  fetchSystems,
  fetchSystemGroups,
} from "@/lib/directus-api"

const priorityConfig: Record<string, { bg: string; text: string; dot: string }> = {
  High: { bg: "bg-red-100", text: "text-red-700", dot: "bg-red-500" },
  Medium: { bg: "bg-amber-100", text: "text-amber-700", dot: "bg-amber-500" },
  Low: { bg: "bg-blue-100", text: "text-blue-700", dot: "bg-blue-500" },
}

const statusStyles: Record<string, { bg: string; text: string; dot: string }> = {
  "In Progress": { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500" },
  Completed: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
  Declined: { bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500" },
  Postponed: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
  "Awaiting Approval": { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
  "Under Review": { bg: "bg-violet-50", text: "text-violet-700", dot: "bg-violet-500" },
}

const steps = ["Approved", "In Progress", "Completed"]

const avatarColors = [
  "bg-amber-700", "bg-blue-700", "bg-violet-700", "bg-emerald-700",
  "bg-rose-700", "bg-cyan-700", "bg-stone-600", "bg-[#6B1D1D]",
]

function getInitials(name: string | null | undefined): string {
  if (!name) return "??"
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  return parts[0].slice(0, 2).toUpperCase()
}

function DeclineModal({
  defectId,
  onClose,
  onConfirm,
}: {
  defectId: string
  onClose: () => void
  onConfirm: (reason: string) => void
}) {
  const [reason, setReason] = useState("")
  const [error, setError] = useState(false)

  function handleConfirm() {
    if (!reason.trim()) {
      setError(true)
      return
    }
    onConfirm(reason)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Decline Defect</h2>
          <button onClick={onClose} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="mt-4 text-sm text-gray-600">
          Please provide a reason for declining defect{" "}
          <span className="font-semibold text-gray-900">{defectId}</span>
        </p>

        <div className="mt-4">
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Decline Reason <span className="text-red-500">*</span>
          </label>
          <textarea
            value={reason}
            onChange={(e) => { setReason(e.target.value); setError(false) }}
            placeholder="Enter the reason for declining this defect..."
            rows={5}
            className={`w-full rounded-lg border px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 ${
              error
                ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                : "border-gray-200 focus:border-[#6B1D1D] focus:ring-[#6B1D1D]"
            }`}
          />
          {error && <p className="mt-1 text-xs text-red-500">Please provide a reason</p>}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600"
          >
            Confirm Decline
          </button>
        </div>
      </div>
    </div>
  )
}

function PostponeModal({
  defectId,
  postponements,
  onClose,
  onConfirm,
}: {
  defectId: string
  postponements: number
  onClose: () => void
  onConfirm: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Postpone Approval</h2>
          <button onClick={onClose} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 flex items-center gap-3 rounded-lg bg-amber-50 border border-amber-200 p-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100">
            <Clock className="h-4.5 w-4.5 text-amber-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-amber-900">Defect {defectId}</p>
            <p className="text-xs text-amber-700">Postpone approval decision</p>
          </div>
        </div>

        <p className="mt-4 text-sm text-gray-600">
          You can postpone this defect approval up to <span className="font-semibold text-gray-900">3</span> times.
        </p>

        <div className="mt-3 rounded-lg bg-gray-50 px-4 py-3">
          <span className="text-sm text-gray-600">
            Current postponements:{" "}
            <span className="font-semibold text-amber-600">{postponements} / 3</span>
          </span>
        </div>

        <div className="mt-4">
          <p className="text-sm font-medium text-gray-700">By postponing:</p>
          <ul className="mt-2 space-y-1.5">
            <li className="flex items-start gap-2 text-sm text-gray-600">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gray-400" />
              A reminder will be scheduled
            </li>
            <li className="flex items-start gap-2 text-sm text-gray-600">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gray-400" />
              The defect will remain in &quot;Pending&quot; status
            </li>
            <li className="flex items-start gap-2 text-sm text-gray-600">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gray-400" />
              You can approve or decline later
            </li>
          </ul>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={postponements >= 3}
            className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600 disabled:opacity-50"
          >
            <Clock className="h-4 w-4" />
            Postpone
          </button>
        </div>
      </div>
    </div>
  )
}

export default function DefectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)

  const defectQuery = useQuery({
    queryKey: ["defect_act", id],
    queryFn: () => fetchDefectActById(id),
  })
  const notesQuery = useQuery({
    queryKey: ["notes", id],
    queryFn: () => fetchNotesByDefectAct(id),
  })
  const jobsQuery = useQuery({
    queryKey: ["jobs", id],
    queryFn: () => fetchJobsByDefectAct(id),
  })
  const materialsQuery = useQuery({
    queryKey: ["materials", id],
    queryFn: () => fetchMaterialsByDefectAct(id),
  })
  const systemsQuery = useQuery({
    queryKey: ["systems"],
    queryFn: fetchSystems,
  })
  const systemGroupsQuery = useQuery({
    queryKey: ["system_groups"],
    queryFn: fetchSystemGroups,
  })

  const defect = defectQuery.data as any | null
  const notes = (notesQuery.data as any[]) ?? []
  const jobs = (jobsQuery.data as any[]) ?? []
  const materials = (materialsQuery.data as any[]) ?? []

  const objectQuery = useQuery({
    queryKey: ["object", defect?.ObjectId],
    queryFn: () => fetchObjectById(defect!.ObjectId),
    enabled: !!defect?.ObjectId,
  })

  const systemMap = useMemo(() => {
    const map = new Map<string, string>()
    for (const s of (systemsQuery.data as any[]) ?? []) {
      map.set(s.SystemosId, s.SystemosName)
    }
    return map
  }, [systemsQuery.data])

  const systemGroupMap = useMemo(() => {
    const map = new Map<string, string>()
    for (const sg of (systemGroupsQuery.data as any[]) ?? []) {
      map.set(sg.SystGroupId, sg.SystGroupName)
    }
    return map
  }, [systemGroupsQuery.data])

  const obj = objectQuery.data as any | null

  const [status, setStatus] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState(1)
  const [showDecline, setShowDecline] = useState(false)
  const [showPostpone, setShowPostpone] = useState(false)
  const [postponements, setPostponements] = useState(0)

  const displayStatus = status ?? defect?.Status ?? "In Progress"
  const isResolved = displayStatus === "Completed" || displayStatus === "Declined" || displayStatus === "Postponed"
  const ss = statusStyles[displayStatus] ?? statusStyles["In Progress"]
  const priority = defect?.Priority ?? null
  const pc = priority ? priorityConfig[priority] : null

  const isLoading = defectQuery.isLoading

  function handleApprove() {
    setStatus("Completed")
    setCurrentStep(2)
  }

  function handleDecline() {
    setStatus("Declined")
    setShowDecline(false)
  }

  function handlePostpone() {
    setPostponements((p) => p + 1)
    setStatus("Postponed")
    setShowPostpone(false)
  }

  const worksSubtotal = useMemo(() => {
    return jobs.reduce((sum: number, j: any) => sum + (j.Amount ?? 0) * (j.Price ?? 0), 0)
  }, [jobs])

  const materialsSubtotal = useMemo(() => {
    return materials.reduce((sum: number, m: any) => sum + (m.Amount ?? 0) * (m.Price ?? 0), 0)
  }, [materials])

  const grandTotal = worksSubtotal + materialsSubtotal

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        <span className="ml-2 text-sm text-gray-500">Loading defect...</span>
      </div>
    )
  }

  if (!defect) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <AlertCircle className="h-8 w-8 text-gray-400" />
        <p className="mt-3 text-sm font-medium text-gray-900">Defect not found</p>
        <p className="mt-1 text-sm text-gray-500">No data available for defect #{id}</p>
        <Link href="/defects" className="mt-4 text-sm font-medium text-[#6B1D1D] hover:underline">
          Back to Defects
        </Link>
      </div>
    )
  }

  const actNumber = defect.ActNumber ?? id
  const objectLabel = obj ? `${obj.Code} – ${obj.FullAddress ?? obj.Description ?? ""}` : defect.ObjectId?.slice(0, 12) ?? "—"
  const systemName = defect.SystemosId ? (systemMap.get(defect.SystemosId) ?? "—") : "—"
  const systemGroupName = defect.SystGroupId ? (systemGroupMap.get(defect.SystGroupId) ?? "—") : "—"

  return (
    <div className="space-y-6 pb-24">
      {/* Modals */}
      {showDecline && (
        <DeclineModal
          defectId={actNumber}
          onClose={() => setShowDecline(false)}
          onConfirm={handleDecline}
        />
      )}
      {showPostpone && (
        <PostponeModal
          defectId={actNumber}
          postponements={postponements}
          onClose={() => setShowPostpone(false)}
          onConfirm={handlePostpone}
        />
      )}

      {/* Header */}
      <div>
        <Link
          href="/defects"
          className="mb-2 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Defects
        </Link>
        <h1 className="text-2xl font-semibold text-gray-900">Defect Details</h1>
        <p className="mt-0.5 text-sm text-gray-500">Defect #{actNumber}</p>
      </div>

      {/* Title + Tags + Actions */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-900">{defect.Problem ?? "Untitled Defect"}</h2>
        <div className="mt-3 flex items-center gap-2">
          {pc && (
            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${pc.bg} ${pc.text}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${pc.dot}`} />
              {priority}
            </span>
          )}
          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${ss.bg} ${ss.text}`}>
            {displayStatus === "Completed" && <CheckCircle className="h-3 w-3" />}
            {displayStatus === "Declined" && <XCircle className="h-3 w-3" />}
            {displayStatus !== "Completed" && displayStatus !== "Declined" && <span className={`h-1.5 w-1.5 rounded-full ${ss.dot}`} />}
            {displayStatus}
          </span>
          {notes.length > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
              <Clock className="h-3 w-3" />
              {notes.length} updates
            </span>
          )}
        </div>

        {/* Progress Stepper */}
        <div className="mt-6 flex items-center gap-0">
          {steps.map((step, i) => {
            const completed = i <= currentStep
            const stepColor = displayStatus === "Completed" ? "bg-emerald-600" : "bg-[#6B1D1D]"
            const textColor = displayStatus === "Completed" ? "text-emerald-600" : "text-[#6B1D1D]"
            const lineColor = displayStatus === "Completed" ? "bg-emerald-600" : "bg-[#6B1D1D]"
            return (
              <div key={step} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium ${
                      completed
                        ? `${stepColor} text-white`
                        : "border-2 border-gray-200 text-gray-400"
                    }`}
                  >
                    {i < currentStep ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : i === currentStep && displayStatus === "Completed" ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      i + 1
                    )}
                  </div>
                  <span className={`mt-1.5 text-xs font-medium ${completed ? textColor : "text-gray-400"}`}>
                    {step}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div className={`mx-2 h-0.5 flex-1 rounded-full ${i < currentStep ? lineColor : "bg-gray-200"}`} />
                )}
              </div>
            )
          })}
        </div>

        {/* Action Buttons */}
        {!isResolved && (
          <div className="mt-6 flex items-center gap-2">
            <button
              onClick={handleApprove}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#6B1D1D] px-4 py-2 text-sm font-medium text-white hover:bg-[#5a1818] transition-colors"
            >
              <CheckCircle className="h-4 w-4" />
              Approve
            </button>
            <button
              onClick={() => setShowPostpone(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Pause className="h-4 w-4" />
              Postpone
            </button>
            <button
              onClick={() => setShowDecline(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
            >
              <XCircle className="h-4 w-4" />
              Decline
            </button>
          </div>
        )}
      </div>

      {/* Work Progress Timeline */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-semibold text-gray-900">Work Progress</h3>
            {notes.length > 0 && (
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                {notes.length} entries
              </span>
            )}
          </div>
        </div>
        {notesQuery.isLoading ? (
          <div className="mt-4 flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-gray-300" />
          </div>
        ) : notes.length === 0 ? (
          <p className="mt-4 text-sm text-gray-400">No timeline entries yet.</p>
        ) : (
          <div className="mt-4 space-y-0">
            {notes.map((entry: any, i: number) => (
              <div key={entry.NoteId ?? i} className="relative flex gap-4 pb-6 last:pb-0">
                {i < notes.length - 1 && (
                  <div className="absolute left-[15px] top-9 h-[calc(100%-20px)] w-px bg-gray-200" />
                )}
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-medium text-white ${avatarColors[i % avatarColors.length]}`}>
                  {getInitials(entry.CreatedByName)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900">{entry.CreatedByName ?? "Unknown"}</span>
                    <span className="text-xs text-gray-400">
                      {entry.CreatedOn ? new Date(entry.CreatedOn).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : ""}
                    </span>
                  </div>
                  <p className="mt-1 text-sm leading-relaxed text-gray-600">{entry.Text ?? ""}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
          <h3 className="text-sm font-semibold text-gray-900">Details</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-medium text-gray-400">Object</p>
              <p className="mt-1 text-sm text-gray-700">{objectLabel}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-400">Registration</p>
              <p className="mt-1 text-sm text-gray-700">{defect.CreatedOn ? new Date(defect.CreatedOn).toLocaleString() : "—"}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-400">Act Number</p>
              <p className="mt-1 text-sm text-gray-700">{defect.ActNumber ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-400">Date</p>
              <p className="mt-1 text-sm text-gray-700">{defect.DefectActDate ? new Date(defect.DefectActDate).toLocaleDateString() : "—"}</p>
            </div>
          </div>
          <h3 className="text-sm font-semibold text-gray-900 pt-2">Location & System</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-medium text-gray-400">Location</p>
              <p className="mt-1 text-sm text-gray-700">{defect.Place ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-400">System</p>
              <p className="mt-1 text-sm text-gray-700">{systemName}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-400">System Group</p>
              <p className="mt-1 text-sm text-gray-700">{systemGroupName}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
          <h3 className="text-sm font-semibold text-gray-900">Issue Details</h3>
          <div>
            <p className="text-xs font-medium text-gray-400">Description</p>
            <p className="mt-1 text-sm leading-relaxed text-gray-700">{defect.Description ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-400">Solution</p>
            <p className="mt-1 text-sm text-gray-700">{defect.Solution ?? "—"}</p>
          </div>
        </div>
      </div>

      {/* Works & Materials */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <div className="p-6 pb-0">
          <h3 className="text-sm font-semibold text-gray-900">Works & Materials</h3>
        </div>
        {jobsQuery.isLoading || materialsQuery.isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-gray-300" />
          </div>
        ) : jobs.length === 0 && materials.length === 0 ? (
          <p className="px-6 py-8 text-sm text-gray-400">No works or materials data available.</p>
        ) : (
          <div className="mt-4">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="px-6 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Item</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Quantity</th>
                  <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Price</th>
                  <th className="px-6 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {jobs.length > 0 && (
                  <tr>
                    <td colSpan={4} className="px-0 py-0">
                      <div className="border-b border-gray-100 bg-gray-50/30 px-6 py-2">
                        <span className="text-xs font-semibold text-gray-700">Works</span>
                      </div>
                      <table className="w-full">
                        <tbody className="divide-y divide-gray-50">
                          {jobs.map((job: any) => (
                            <tr key={job.DefectActJobId} className="hover:bg-gray-50/50 transition-colors">
                              <td className="py-3 pl-10 pr-4 text-sm text-gray-700">
                                <div className="flex items-center gap-1.5">
                                  <ChevronRight className="h-3 w-3 text-gray-300" />
                                  {job.Description ?? "—"}
                                </div>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-600">{job.Amount ?? "—"}</td>
                              <td className="px-4 py-3 text-right text-sm text-gray-600">
                                {job.Price != null ? `€${Number(job.Price).toFixed(2)}` : "—"}
                              </td>
                              <td className="px-6 py-3 text-right text-sm font-medium text-gray-900">
                                {job.Amount != null && job.Price != null
                                  ? `€${(job.Amount * job.Price).toFixed(2)}`
                                  : "—"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </td>
                  </tr>
                )}
                {materials.length > 0 && (
                  <tr>
                    <td colSpan={4} className="px-0 py-0">
                      <div className="border-b border-gray-100 bg-gray-50/30 px-6 py-2">
                        <span className="text-xs font-semibold text-gray-700">Materials</span>
                      </div>
                      <table className="w-full">
                        <tbody className="divide-y divide-gray-50">
                          {materials.map((mat: any) => (
                            <tr key={mat.DefectActMaterialId} className="hover:bg-gray-50/50 transition-colors">
                              <td className="py-3 pl-10 pr-4 text-sm text-gray-700">
                                <div className="flex items-center gap-1.5">
                                  <ChevronRight className="h-3 w-3 text-gray-300" />
                                  {mat.Description ?? "—"}
                                </div>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-600">{mat.Amount ?? "—"}</td>
                              <td className="px-4 py-3 text-right text-sm text-gray-600">
                                {mat.Price != null ? `€${Number(mat.Price).toFixed(2)}` : "—"}
                              </td>
                              <td className="px-6 py-3 text-right text-sm font-medium text-gray-900">
                                {mat.Amount != null && mat.Price != null
                                  ? `€${(mat.Amount * mat.Price).toFixed(2)}`
                                  : "—"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            {(jobs.length > 0 || materials.length > 0) && (
              <div className="border-t border-gray-200">
                <div className="flex justify-end px-6 py-2.5">
                  <div className="w-64 space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Works Subtotal</span>
                      <span className="font-medium text-gray-700">€{worksSubtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Materials Subtotal</span>
                      <span className="font-medium text-gray-700">€{materialsSubtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between border-t border-gray-200 pt-2 text-base">
                      <span className="font-semibold text-gray-900">Grand Total</span>
                      <span className="font-bold text-gray-900">€{grandTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Sticky Footer Actions */}
      <div className="fixed bottom-0 left-60 right-0 border-t border-gray-200 bg-white px-8 py-4">
        <div className="flex items-center justify-between">
          <button className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            <Download className="h-4 w-4" />
            Download Estimate
          </button>
          {!isResolved && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleApprove}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#6B1D1D] px-4 py-2 text-sm font-medium text-white hover:bg-[#5a1818] transition-colors"
              >
                <CheckCircle className="h-4 w-4" />
                Approve
              </button>
              <button
                onClick={() => setShowPostpone(true)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Pause className="h-4 w-4" />
                Postpone
              </button>
              <button
                onClick={() => setShowDecline(true)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
              >
                <XCircle className="h-4 w-4" />
                Decline
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
