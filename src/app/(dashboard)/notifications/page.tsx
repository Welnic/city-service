"use client"

import { useState, useMemo } from "react"
import {
  CheckCircle,
  AlertCircle,
  Clock,
  MessageCircle,
  ArrowRightLeft,
  Pause,
  ChevronDown,
  Check,
  X,
} from "lucide-react"

type Notification = {
  id: number
  icon: typeof CheckCircle
  iconColor: string
  iconBg: string
  title: string
  description: string
  date: string
  reference: string
  unread: boolean
  type: "status" | "comment" | "assignment" | "completion" | "postponed" | "warranty"
}

const initialNotifications: Notification[] = [
  {
    id: 1,
    icon: ArrowRightLeft,
    iconColor: "text-[#6B1D1D]",
    iconBg: "bg-[#6B1D1D]/10",
    title: "Defect status changed",
    description:
      'Defect DEV-00000847 changed from "Awaiting approval" to "In Progress"',
    date: "2025-10-24",
    reference: "DEV-00000847",
    unread: true,
    type: "status",
  },
  {
    id: 2,
    icon: Pause,
    iconColor: "text-amber-600",
    iconBg: "bg-amber-50",
    title: "Defect postponed",
    description:
      "Defect DEV-00000823 postponed for 3 days. New deadline: 2025-10-28",
    date: "2025-10-24",
    reference: "DEV-00000823",
    unread: true,
    type: "postponed",
  },
  {
    id: 3,
    icon: MessageCircle,
    iconColor: "text-blue-600",
    iconBg: "bg-blue-50",
    title: "New comment",
    description:
      "Technical specialist left a comment on defect DEV-00000901",
    date: "2025-10-23",
    reference: "DEV-00000901",
    unread: false,
    type: "comment",
  },
  {
    id: 4,
    icon: CheckCircle,
    iconColor: "text-emerald-600",
    iconBg: "bg-emerald-50",
    title: "Defect completed",
    description: "Defect DEV-00000789 was completed and approved",
    date: "2025-10-22",
    reference: "DEV-00000789",
    unread: false,
    type: "completion",
  },
  {
    id: 5,
    icon: ArrowRightLeft,
    iconColor: "text-[#6B1D1D]",
    iconBg: "bg-[#6B1D1D]/10",
    title: "Defect status changed",
    description:
      'Defect DEV-00000812 changed from "In Progress" to "Under Review"',
    date: "2025-10-22",
    reference: "DEV-00000812",
    unread: false,
    type: "status",
  },
  {
    id: 6,
    icon: AlertCircle,
    iconColor: "text-red-600",
    iconBg: "bg-red-50",
    title: "Warranty claim declined",
    description:
      'The warranty claim for "Heating System Failure - Building A" was declined by the manufacturer.',
    date: "2025-10-21",
    reference: "DEV-00000756",
    unread: false,
    type: "warranty",
  },
  {
    id: 7,
    icon: Clock,
    iconColor: "text-violet-600",
    iconBg: "bg-violet-50",
    title: "Defect assigned to contractor",
    description:
      'Defect "Water Leak - Building B" has been assigned to Nordic Plumbing Services.',
    date: "2025-10-21",
    reference: "DEV-00000734",
    unread: false,
    type: "assignment",
  },
  {
    id: 8,
    icon: MessageCircle,
    iconColor: "text-blue-600",
    iconBg: "bg-blue-50",
    title: "New comment",
    description:
      "Facility manager replied to your comment on defect DEV-00000698",
    date: "2025-10-20",
    reference: "DEV-00000698",
    unread: false,
    type: "comment",
  },
]

const objectTypes = [
  { label: "All objects", value: "all" },
  { label: "Status changes", value: "status" },
  { label: "Comments", value: "comment" },
  { label: "Assignments", value: "assignment" },
  { label: "Completions", value: "completion" },
  { label: "Postponed", value: "postponed" },
  { label: "Warranty", value: "warranty" },
]

function formatDate(dateStr: string) {
  const date = new Date(dateStr + "T00:00:00")
  return date.toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  })
}

function groupLabel(dateStr: string): string {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const date = new Date(dateStr + "T00:00:00")
  const diffDays = Math.floor(
    (today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
  )
  if (diffDays === 0) return "Today"
  if (diffDays === 1) return "Yesterday"
  if (diffDays < 7) return "This week"
  return "Earlier"
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(initialNotifications)
  const [activeTab, setActiveTab] = useState<"all" | "unread">("all")
  const [objectFilter, setObjectFilter] = useState("all")
  const [showObjectDropdown, setShowObjectDropdown] = useState(false)

  const unreadCount = notifications.filter((n) => n.unread).length

  const filtered = useMemo(() => {
    let items = notifications
    if (activeTab === "unread") items = items.filter((n) => n.unread)
    if (objectFilter !== "all")
      items = items.filter((n) => n.type === objectFilter)
    return items
  }, [notifications, activeTab, objectFilter])

  const grouped = useMemo(() => {
    const groups: { label: string; items: Notification[] }[] = []
    for (const item of filtered) {
      const label = groupLabel(item.date)
      const existing = groups.find((g) => g.label === label)
      if (existing) {
        existing.items.push(item)
      } else {
        groups.push({ label, items: [item] })
      }
    }
    return groups
  }, [filtered])

  function markAsRead(id: number) {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: false } : n))
    )
  }

  function markAllAsRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })))
  }

  function dismiss(id: number) {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  const selectedObjectLabel =
    objectTypes.find((o) => o.value === objectFilter)?.label ?? "All objects"

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Notifications</h1>
        <p className="mt-1 text-sm text-gray-500">
          System notifications about defect statuses and actions
        </p>
      </div>

      {/* Tab bar and controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab("all")}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              activeTab === "all"
                ? "bg-[#6B1D1D] text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setActiveTab("unread")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              activeTab === "unread"
                ? "bg-[#6B1D1D] text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Unread
            {unreadCount > 0 && (
              <span
                className={`rounded-full px-1.5 py-0.5 text-xs font-medium ${
                  activeTab === "unread"
                    ? "bg-white/20 text-white"
                    : "bg-[#6B1D1D] text-white"
                }`}
              >
                {unreadCount}
              </span>
            )}
          </button>

          {/* Object type filter */}
          <div className="relative ml-2">
            <button
              onClick={() => setShowObjectDropdown((v) => !v)}
              className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              {selectedObjectLabel}
              <ChevronDown
                className={`h-3.5 w-3.5 transition-transform ${showObjectDropdown ? "rotate-180" : ""}`}
              />
            </button>
            {showObjectDropdown && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowObjectDropdown(false)}
                />
                <div className="absolute left-0 top-full z-20 mt-1 w-48 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                  {objectTypes.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        setObjectFilter(opt.value)
                        setShowObjectDropdown(false)
                      }}
                      className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-gray-50 ${
                        objectFilter === opt.value
                          ? "font-medium text-[#6B1D1D]"
                          : "text-gray-600"
                      }`}
                    >
                      {objectFilter === opt.value && (
                        <Check className="h-3.5 w-3.5" />
                      )}
                      <span
                        className={
                          objectFilter === opt.value ? "" : "ml-[22px]"
                        }
                      >
                        {opt.label}
                      </span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="text-sm font-medium text-[#6B1D1D] hover:underline transition-colors"
          >
            Mark all as read
          </button>
        )}
      </div>

      {/* Notification Cards - Grouped */}
      {grouped.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 py-16">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
            <CheckCircle className="h-6 w-6 text-gray-400" />
          </div>
          <p className="mt-3 text-sm font-medium text-gray-900">
            All caught up
          </p>
          <p className="mt-1 text-sm text-gray-500">
            {activeTab === "unread"
              ? "No unread notifications"
              : "No notifications to show"}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {grouped.map((group) => (
            <div key={group.label}>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                {group.label}
              </p>
              <div className="space-y-2">
                {group.items.map((notification) => {
                  const Icon = notification.icon
                  return (
                    <div
                      key={notification.id}
                      className={`group relative flex gap-4 rounded-xl border p-4 transition-all ${
                        notification.unread
                          ? "border-gray-200 bg-white shadow-sm"
                          : "border-gray-100 bg-gray-50/50 hover:bg-gray-50"
                      }`}
                    >
                      {/* Unread indicator */}
                      {notification.unread && (
                        <span className="absolute top-4 right-4 h-2.5 w-2.5 rounded-full bg-[#6B1D1D]" />
                      )}

                      {/* Hover actions */}
                      <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        {notification.unread && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            title="Mark as read"
                            className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                          >
                            <Check className="h-3.5 w-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => dismiss(notification.id)}
                          title="Dismiss"
                          className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      {/* Icon */}
                      <div
                        className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${notification.iconBg} ${notification.iconColor}`}
                      >
                        <Icon className="h-4.5 w-4.5" />
                      </div>

                      {/* Content */}
                      <div className="min-w-0 flex-1 space-y-1">
                        <h3
                          className={`text-sm ${
                            notification.unread
                              ? "font-semibold text-gray-900"
                              : "font-medium text-gray-700"
                          }`}
                        >
                          {notification.title}
                        </h3>
                        <p className="text-sm leading-relaxed text-gray-500">
                          {notification.description}
                        </p>
                        <div className="flex items-center gap-3 pt-0.5">
                          <span className="text-xs text-gray-400">
                            {formatDate(notification.date)}
                          </span>
                          <span className="text-xs font-medium text-[#6B1D1D] hover:underline cursor-pointer">
                            {notification.reference}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
