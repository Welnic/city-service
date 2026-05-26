"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { LayoutDashboard, AlertCircle, Bell, Users, FlaskConical } from "lucide-react"
import { UserMenu } from "@/components/layout/user-menu"
import { fetchDefectActs, fetchSystemUsers, fetchNotifications } from "@/lib/directus-api"

export function Sidebar() {
  const pathname = usePathname()

  const defectsQuery = useQuery({
    queryKey: ["defect_acts_count"],
    queryFn: () => fetchDefectActs({ limit: 1000 }),
  })

  const notificationsQuery = useQuery({
    queryKey: ["notifications"],
    queryFn: fetchNotifications,
  })

  const usersQuery = useQuery({
    queryKey: ["system_users"],
    queryFn: fetchSystemUsers,
  })

  const defectCount = (defectsQuery.data as any[])?.length ?? 0
  const unreadNotifications = ((notificationsQuery.data as any[]) ?? []).filter((n: any) => !n.isRead).length > 0
  const currentUser = (usersQuery.data as any[])?.[0] ?? null

  const userName = currentUser?.FullName ?? currentUser?.LoginName ?? "User"
  const userRole = currentUser?.JobTitle ?? currentUser?.Roles?.[0] ?? "—"
  const initials = (() => {
    const name = currentUser?.FullName
    if (name) {
      const parts = name.trim().split(/\s+/)
      if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      if (parts[0]) return parts[0].slice(0, 2).toUpperCase()
    }
    return (currentUser?.LoginName ?? "U").slice(0, 2).toUpperCase()
  })()

  const navItems = [
    { label: "Dashboard", href: "/", icon: LayoutDashboard },
    { label: "Defects List", href: "/defects", icon: AlertCircle, badge: defectCount > 0 ? String(defectCount) : undefined },
    { label: "Notifications", href: "/notifications", icon: Bell, dot: unreadNotifications },
    { label: "Users", href: "/users", icon: Users },
    { label: "API Test", href: "/api-test", icon: FlaskConical },
  ]

  return (
    <aside className="flex h-full w-60 shrink-0 flex-col border-r border-gray-200 bg-[#FAFAF8]">
      {/* Logo */}
      <div className="px-5 pt-6 pb-8">
        <h1 className="text-lg tracking-wider text-[#6B1D1D]">
          <span className="italic font-medium">CITY</span>
          <span className="italic font-bold">SERVICE</span>
        </h1>
        <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-gray-400">
          Engineering
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3">
        {navItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href)
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-[#6B1D1D] text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <span className="relative shrink-0">
                <Icon className="h-4 w-4" />
                {item.dot && (
                  <span
                    className={`absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full border ${
                      isActive ? "border-[#6B1D1D] bg-white" : "border-[#FAFAF8] bg-red-500"
                    }`}
                  />
                )}
              </span>
              <span className="flex-1">{item.label}</span>
              {item.badge && (
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* User info */}
      <div className="mt-auto border-t border-gray-200 p-2">
        <UserMenu
          name={userName}
          role={userRole}
          initials={initials}
        />
      </div>
    </aside>
  )
}
