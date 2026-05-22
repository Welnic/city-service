"use client"

import { use, useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  XCircle,
  Pause,
  Download,
  AlertTriangle,
  ChevronRight,
  ImageIcon,
  X,
} from "lucide-react"

const mockDefect = {
  id: "DEF-00000915",
  title: "HVAC Filter Replacement – Building A",
  priority: "High" as const,
  status: "In Progress" as const,
  updates: 2,
  object: "JF, Franconiho g. 2, Grīstāulji k., Šešuv sen., Trakų unis.",
  registration: "2025-02-18 14:35",
  actNumber: "SV47-032",
  date: "2025-02-18 00:00",
  location: "Building A, Floor 3",
  system: "HVAC – Ventilation",
  systemGroup: "Heating & Cooling",
  description:
    "Pastatas o statinio, konstrukcijų ir pamatinių plokščių defektas. Stogo danga yra pažeista, matomi prisilaimai ir drėgmės pasireiškimai. Konstrukcijų pažeidimai apima medinias elementus, povirnio ir matinią dielių koroziją. Pamatiniškas plokštelės parodyti vertikalius prisilaiminius, kurie gali lemti tolimesnies pastatou dieliau nugrūtę. Būtina atlikti skubias remontes, kad išvengi didesnių struktūrinių problemų ir užtikrinti pastatou singtį.",
  solution: "Reikalingas skubus remontas",
  attachments: [
    "/placeholder-1.jpg",
    "/placeholder-2.jpg",
    "/placeholder-3.jpg",
    "/placeholder-4.jpg",
    "/placeholder-5.jpg",
    "/placeholder-6.jpg",
  ],
}

const timeline = [
  {
    author: "John Contractor",
    date: "Apr 15, 2025",
    avatar: "JC",
    avatarBg: "bg-amber-700",
    text: "Finished the roof repair work today. Removed the damaged sections and prepared the surface for new waterproofing layer. Weather conditions are favorable for continuing tomorrow.",
  },
  {
    author: "Mike Supervisor",
    date: "Apr 12, 2025",
    avatar: "MS",
    avatarBg: "bg-blue-700",
    text: "Materials delivered and inspected. All items match the specifications in the estimate. Ready to begin work phase 1.",
  },
  {
    author: "Sarah Project Manager",
    date: "Apr 10, 2025",
    avatar: "SP",
    avatarBg: "bg-violet-700",
    text: "Work scheduled to begin on April 15th. Team assigned and materials ordered. Clerk will be notified of any changes.",
  },
]

const worksData = [
  {
    category: "Stogo remontas",
    items: [
      { name: "Stogo danga", quantity: "25.5 m²", price: "€45.00", total: "€1,147.50" },
      { name: "Stogo danga", quantity: "30 m²", price: "€25.00", total: "€750.00" },
      { name: "Tvirtinimo elementai", quantity: "15 kg", price: "€8.50", total: "€127.50" },
    ],
  },
  {
    category: "Konstrukcijų stiprinimas",
    items: [
      { name: "—", quantity: "3 vnt", price: "€120.00", total: "€360.00" },
      { name: "Hidroizoliacija", quantity: "28 m²", price: "€12.00", total: "€336.00" },
    ],
  },
]

const priorityConfig = {
  High: { bg: "bg-red-100", text: "text-red-700", dot: "bg-red-500" },
  Medium: { bg: "bg-amber-100", text: "text-amber-700", dot: "bg-amber-500" },
  Low: { bg: "bg-blue-100", text: "text-blue-700", dot: "bg-blue-500" },
}

const statusStyles: Record<string, { bg: string; text: string; dot: string }> = {
  "In Progress": { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500" },
  Completed: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
  Declined: { bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500" },
  Postponed: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
}

const steps = ["Approved", "In Progress", "Completed"]

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
  const defect = mockDefect
  const pc = priorityConfig[defect.priority]

  const [status, setStatus] = useState<string>(defect.status)
  const [currentStep, setCurrentStep] = useState(1)
  const [showDecline, setShowDecline] = useState(false)
  const [showPostpone, setShowPostpone] = useState(false)
  const [postponements, setPostponements] = useState(0)

  const isResolved = status === "Completed" || status === "Declined" || status === "Postponed"

  const ss = statusStyles[status] ?? statusStyles["In Progress"]

  function handleApprove() {
    setStatus("Completed")
    setCurrentStep(2)
  }

  function handleDecline(reason: string) {
    setStatus("Declined")
    setShowDecline(false)
  }

  function handlePostpone() {
    setPostponements((p) => p + 1)
    setStatus("Postponed")
    setShowPostpone(false)
  }

  const worksSubtotal = 1897.5
  const materialsSubtotal = 823.5
  const grandTotal = 2721.0

  return (
    <div className="space-y-6 pb-24">
      {/* Modals */}
      {showDecline && (
        <DeclineModal
          defectId={id || defect.id}
          onClose={() => setShowDecline(false)}
          onConfirm={handleDecline}
        />
      )}
      {showPostpone && (
        <PostponeModal
          defectId={id || defect.id}
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
        <p className="mt-0.5 text-sm text-gray-500">Defect #{id || defect.id}</p>
      </div>

      {/* Title + Tags + Actions */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-900">{defect.title}</h2>
        <div className="mt-3 flex items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${pc.bg} ${pc.text}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${pc.dot}`} />
            {defect.priority}
          </span>
          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${ss.bg} ${ss.text}`}>
            {status === "Completed" && <CheckCircle className="h-3 w-3" />}
            {status === "Declined" && <XCircle className="h-3 w-3" />}
            {status !== "Completed" && status !== "Declined" && <span className={`h-1.5 w-1.5 rounded-full ${ss.dot}`} />}
            {status}
          </span>
          {defect.updates > 0 && (
            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
              status === "Completed"
                ? "bg-[#6B1D1D] text-white"
                : "bg-emerald-50 text-emerald-700"
            }`}>
              <Clock className="h-3 w-3" />
              {defect.updates} new updates
            </span>
          )}
        </div>

        {/* Progress Stepper */}
        <div className="mt-6 flex items-center gap-0">
          {steps.map((step, i) => {
            const completed = i <= currentStep
            const stepColor = status === "Completed" ? "bg-emerald-600" : "bg-[#6B1D1D]"
            const textColor = status === "Completed" ? "text-emerald-600" : "text-[#6B1D1D]"
            const lineColor = status === "Completed" ? "bg-emerald-600" : "bg-[#6B1D1D]"
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
                    ) : i === currentStep && status === "Completed" ? (
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
            {defect.updates > 0 && (
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                {defect.updates} new
              </span>
            )}
          </div>
          <button className="text-sm font-medium text-[#6B1D1D] hover:underline">Mark read</button>
        </div>
        <div className="mt-4 space-y-0">
          {timeline.map((entry, i) => (
            <div key={i} className="relative flex gap-4 pb-6 last:pb-0">
              {i < timeline.length - 1 && (
                <div className="absolute left-[15px] top-9 h-[calc(100%-20px)] w-px bg-gray-200" />
              )}
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-medium text-white ${entry.avatarBg}`}>
                {entry.avatar}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900">{entry.author}</span>
                  <span className="text-xs text-gray-400">{entry.date}</span>
                </div>
                <p className="mt-1 text-sm leading-relaxed text-gray-600">{entry.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
          <h3 className="text-sm font-semibold text-gray-900">Details</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-medium text-gray-400">Object</p>
              <p className="mt-1 text-sm text-gray-700">{defect.object}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-400">Registration</p>
              <p className="mt-1 text-sm text-gray-700">{defect.registration}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-400">Act Number</p>
              <p className="mt-1 text-sm text-gray-700">{defect.actNumber}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-400">Date</p>
              <p className="mt-1 text-sm text-gray-700">{defect.date}</p>
            </div>
          </div>
          <h3 className="text-sm font-semibold text-gray-900 pt-2">Location & System</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-medium text-gray-400">Location</p>
              <p className="mt-1 text-sm text-gray-700">{defect.location}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-400">System</p>
              <p className="mt-1 text-sm text-gray-700">{defect.system}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-400">System Group</p>
              <p className="mt-1 text-sm text-gray-700">{defect.systemGroup}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
          <h3 className="text-sm font-semibold text-gray-900">Issue Details</h3>
          <div>
            <p className="text-xs font-medium text-gray-400">Description</p>
            <p className="mt-1 text-sm leading-relaxed text-gray-700">{defect.description}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-400">Solution</p>
            <p className="mt-1 text-sm text-gray-700">{defect.solution}</p>
          </div>
        </div>
      </div>

      {/* Attachments */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h3 className="text-sm font-semibold text-gray-900">Attachments</h3>
        <div className="mt-4 grid grid-cols-6 gap-3">
          {defect.attachments.map((_, i) => (
            <div
              key={i}
              className="group relative aspect-square overflow-hidden rounded-lg border border-gray-200 bg-gray-100 cursor-pointer hover:border-[#6B1D1D]/30 transition-colors"
            >
              <div className="flex h-full w-full items-center justify-center">
                <ImageIcon className="h-8 w-8 text-gray-300" />
              </div>
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
            </div>
          ))}
        </div>
      </div>

      {/* Works & Materials */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <div className="p-6 pb-0">
          <h3 className="text-sm font-semibold text-gray-900">Works & Materials</h3>
        </div>
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
              {worksData.map((category) => (
                <tr key={category.category}>
                  <td colSpan={4} className="px-0 py-0">
                    <div className="border-b border-gray-100 bg-gray-50/30 px-6 py-2">
                      <span className="text-xs font-semibold text-gray-700">{category.category}</span>
                    </div>
                    <table className="w-full">
                      <tbody className="divide-y divide-gray-50">
                        {category.items.map((item, j) => (
                          <tr key={j} className="hover:bg-gray-50/50 transition-colors">
                            <td className="py-3 pl-10 pr-4 text-sm text-gray-700">
                              <div className="flex items-center gap-1.5">
                                <ChevronRight className="h-3 w-3 text-gray-300" />
                                {item.name}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">{item.quantity}</td>
                            <td className="px-4 py-3 text-right text-sm text-gray-600">{item.price}</td>
                            <td className="px-6 py-3 text-right text-sm font-medium text-gray-900">{item.total}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
        </div>
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
