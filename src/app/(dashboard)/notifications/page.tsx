"use client"

import { useState, useMemo } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
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
  Loader2,
} from "lucide-react"
import { fetchNotifications, markNotificationRead } from "@/lib/directus-api"

type Notification = {
  id: string
  userId: string | null
  type: "status" | "comment" | "assignment" | "completion" | "postponed" | "warranty"
  title: string
  description: string
  reference: string
  referenceId: string | null
  isRead: boolean
  dateCreated: string
}

const typeIcons: Record<string, { icon: typeof CheckCircle; color: string; bg: string }> = {
  status: { icon: ArrowRightLeft, color: "text-[#6B1D1D]", bg: "bg-[#6B1D1D]/10" },
  comment: { icon: MessageCircle, color: "text-blue-600", bg: "bg-blue-50" },
  assignment: { icon: Clock, color: "text-violet-600", bg: "bg-violet-50" },
  completion: { icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50" },
  postponed: { icon: Pause, color: "text-amber-600", bg: "bg-amber-50" },
  warranty: { icon: AlertCircle, color: "text-red-600", bg: "bg-red-50" },
}

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
  const date = new Date(dateStr)
  return date.toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  })
}

function groupLabel(dateStr: string): string {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const date = new Date(dateStr)
  date.setHours(0, 0, 0, 0)
  const diffDays = Math.floor(
    (today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
  )
  if (diffDays === 0) return "Today"
  if (diffDays === 1) return "Yesterday"
  if (diffDays < 7) return "This week"
  return "Earlier"
}

export default function NotificationsPage() {
  const queryClient = useQueryClient()

  const notificationsQuery = useQuery({
    queryKey: ["notifications"],
    queryFn: fetchNotifications,
  })

  const notifications = (notificationsQuery.data as Notification[]) ?? []

  const markReadMutation = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  })

  const [activeTab, setActiveTab] = useState<"all" | "unread">("all")
  const [objectFilter, setObjectFilter] = useState("all")
  const [showObjectDropdown, setShowObjectDropdown] = useState(false)
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())

  const unreadCount = notifications.filter((n) => !n.isRead).length

  const filtered = useMemo(() => {
    let items = notifications.filter((n) => !dismissed.has(n.id))
    if (activeTab === "unread") items = items.filter((n) => !n.isRead)
    if (objectFilter !== "all")
      items = items.filter((n) => n.type === objectFilter)
    return items
  }, [notifications, activeTab, objectFilter, dismissed])

  const grouped = useMemo(() => {
    const groups: { label: string; items: Notification[] }[] = []
    for (const item of filtered) {
      const label = groupLabel(item.dateCreated)
      const existing = groups.find((g) => g.label === label)
      if (existing) {
        existing.items.push(item)
      } else {
        groups.push({ label, items: [item] })
      }
    }
    return groups
  }, [filtered])

  function handleMarkAsRead(id: string) {
    markReadMutation.mutate(id)
  }

  function handleMarkAllAsRead() {
    for (const n of notifications.filter((n) => !n.isRead)) {
      markReadMutation.mutate(n.id)
    }
  }

  function dismiss(id: string) {
    setDismissed((prev) => new Set(prev).add(id))
  }

  const selectedObjectLabel =
    objectTypes.find((o) => o.value === objectFilter)?.label ?? "All objects"

  const isLoading = notificationsQuery.isLoading

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
            onClick={handleMarkAllAsRead}
            className="text-sm font-medium text-[#6B1D1D] hover:underline transition-colors"
          >
            Mark all as read
          </button>
        )}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          <span className="ml-2 text-sm text-gray-500">Loading notifications...</span>
        </div>
      )}

      {/* Notification Cards - Grouped */}
      {!isLoading && grouped.length === 0 ? (
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
                  const typeConfig = typeIcons[notification.type] ?? typeIcons.status
                  const Icon = typeConfig.icon
                  return (
                    <div
                      key={notification.id}
                      className={`group relative flex gap-4 rounded-xl border p-4 transition-all ${
                        !notification.isRead
                          ? "border-gray-200 bg-white shadow-sm"
                          : "border-gray-100 bg-gray-50/50 hover:bg-gray-50"
                      }`}
                    >
                      {/* Unread indicator */}
                      {!notification.isRead && (
                        <span className="absolute top-4 right-4 h-2.5 w-2.5 rounded-full bg-[#6B1D1D]" />
                      )}

                      {/* Hover actions */}
                      <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        {!notification.isRead && (
                          <button
                            onClick={() => handleMarkAsRead(notification.id)}
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
                        className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${typeConfig.bg} ${typeConfig.color}`}
                      >
                        <Icon className="h-4.5 w-4.5" />
                      </div>

                      {/* Content */}
                      <div className="min-w-0 flex-1 space-y-1">
                        <h3
                          className={`text-sm ${
                            !notification.isRead
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
                            {notification.dateCreated ? formatDate(notification.dateCreated) : ""}
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
