"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import {
  Plus,
  Search,
  ChevronDown,
  Pencil,
  Trash2,
  Users,
  UserCheck,
  Shield,
  ArrowUpDown,
  Mail,
  Loader2,
  AlertCircle,
  Check,
} from "lucide-react"
import { fetchSystemUsers } from "@/lib/directus-api"

type SystemUser = {
  SystemUserId: string;
  LoginName: string;
  FullName: string | null;
  Email: string | null;
  JobTitle: string | null;
  IsDisabled: boolean;
  Roles: string[];
  CreatedOn: string | null;
  OfficePhone: string | null;
}

const avatarColors = [
  "bg-[#6B1D1D]",
  "bg-stone-600",
  "bg-amber-700",
  "bg-emerald-700",
  "bg-blue-700",
  "bg-violet-700",
  "bg-rose-700",
  "bg-cyan-700",
]

const roleConfig: Record<string, { bg: string; text: string }> = {
  Admin: { bg: "bg-[#6B1D1D]/10", text: "text-[#6B1D1D]" },
  Manager: { bg: "bg-violet-50", text: "text-violet-700" },
  Engineer: { bg: "bg-amber-50", text: "text-amber-700" },
  Technician: { bg: "bg-blue-50", text: "text-blue-700" },
  Inspector: { bg: "bg-emerald-50", text: "text-emerald-700" },
  Clerk: { bg: "bg-gray-100", text: "text-gray-600" },
}

const defaultRoleConfig = { bg: "bg-gray-100", text: "text-gray-600" }

const positionFilters = ["All positions", "Admin", "Manager", "Engineer", "Technician", "Inspector", "Clerk"]
const statusFilters = ["All", "Active", "Inactive"]

function getInitials(name: string | null | undefined, login: string): string {
  if (name) {
    const parts = name.trim().split(/\s+/)
    if (parts.length >= 2)
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    if (parts[0]) return parts[0].slice(0, 2).toUpperCase()
  }
  return login.slice(0, 2).toUpperCase()
}

function formatDate(dateStr: string | null | undefined) {
  if (!dateStr) return "—"
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export default function UsersPage() {
  const [search, setSearch] = useState("")
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set())
  const [positionFilter, setPositionFilter] = useState("All positions")
  const [statusFilter, setStatusFilter] = useState("All")
  const [showPositionDropdown, setShowPositionDropdown] = useState(false)
  const [showStatusDropdown, setShowStatusDropdown] = useState(false)
  const [sortField, setSortField] = useState<"name" | "created">("name")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc")

  const usersQuery = useQuery({
    queryKey: ["system_users"],
    queryFn: fetchSystemUsers,
  })

  const users = (usersQuery.data as SystemUser[]) ?? []

  const filtered = useMemo(() => {
    let items = users

    if (search) {
      const q = search.toLowerCase()
      items = items.filter(
        (u) =>
          u.FullName?.toLowerCase().includes(q) ||
          u.Email?.toLowerCase().includes(q) ||
          u.LoginName.toLowerCase().includes(q) ||
          u.JobTitle?.toLowerCase().includes(q)
      )
    }

    if (positionFilter !== "All positions") {
      items = items.filter(
        (u) =>
          u.Roles.includes(positionFilter) ||
          u.JobTitle?.toLowerCase().includes(positionFilter.toLowerCase())
      )
    }

    if (statusFilter === "Active") {
      items = items.filter((u) => !u.IsDisabled)
    } else if (statusFilter === "Inactive") {
      items = items.filter((u) => u.IsDisabled)
    }

    items = [...items].sort((a, b) => {
      if (sortField === "name") {
        const diff = (a.FullName ?? a.LoginName).localeCompare(
          b.FullName ?? b.LoginName
        )
        return sortDir === "asc" ? diff : -diff
      }
      const da = a.CreatedOn ? new Date(a.CreatedOn).getTime() : 0
      const db = b.CreatedOn ? new Date(b.CreatedOn).getTime() : 0
      return sortDir === "asc" ? da - db : db - da
    })

    return items
  }, [users, search, positionFilter, statusFilter, sortField, sortDir])

  const totalUsers = users.length
  const activeUsers = users.filter((u) => !u.IsDisabled).length
  const inactiveUsers = totalUsers - activeUsers

  const allSelected =
    filtered.length > 0 &&
    filtered.every((u) => selectedUsers.has(u.SystemUserId))

  function toggleAll() {
    if (allSelected) {
      setSelectedUsers(new Set())
    } else {
      setSelectedUsers(new Set(filtered.map((u) => u.SystemUserId)))
    }
  }

  function toggleUser(id: string) {
    setSelectedUsers((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleSort(field: "name" | "created") {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    } else {
      setSortField(field)
      setSortDir("asc")
    }
  }

  function getRoleBadge(user: SystemUser) {
    const role = user.Roles[0] ?? "User"
    const config = roleConfig[role] ?? defaultRoleConfig
    return { label: user.JobTitle ?? role, ...config }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
            Users
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            System user management
          </p>
        </div>
        <Link
          href="/users/new"
          className="inline-flex items-center rounded-lg bg-[#6B1D1D] px-3 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#5a1818]"
        >
          <Plus className="mr-1.5 h-4 w-4" />
          Add user
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100">
              <Users className="h-4.5 w-4.5 text-gray-600" />
            </div>
            <div>
              <p className="text-2xl font-bold tracking-tight text-gray-900">
                {totalUsers}
              </p>
              <p className="text-xs text-gray-500">Total users</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50">
              <UserCheck className="h-4.5 w-4.5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold tracking-tight text-gray-900">
                {activeUsers}
              </p>
              <p className="text-xs text-gray-500">Active</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100">
              <Shield className="h-4.5 w-4.5 text-gray-500" />
            </div>
            <div>
              <p className="text-2xl font-bold tracking-tight text-gray-900">
                {users.filter((u) => u.Roles.includes("Admin")).length}
              </p>
              <p className="text-xs text-gray-500">Admins</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, or role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 w-full rounded-lg border border-gray-200 bg-white pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#6B1D1D] focus:outline-none focus:ring-1 focus:ring-[#6B1D1D]"
          />
        </div>

        {/* Status filter */}
        <div className="relative">
          <button
            onClick={() => setShowStatusDropdown((v) => !v)}
            className="flex h-9 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
          >
            {statusFilter === "All" ? "All statuses" : statusFilter}
            <ChevronDown
              className={`h-3.5 w-3.5 text-gray-400 transition-transform ${showStatusDropdown ? "rotate-180" : ""}`}
            />
          </button>
          {showStatusDropdown && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowStatusDropdown(false)}
              />
              <div className="absolute right-0 top-full z-20 mt-1 w-40 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                {statusFilters.map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      setStatusFilter(s)
                      setShowStatusDropdown(false)
                    }}
                    className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50 ${
                      statusFilter === s
                        ? "font-medium text-[#6B1D1D]"
                        : "text-gray-600"
                    }`}
                  >
                    {statusFilter === s && <Check className="h-3.5 w-3.5" />}
                    <span className={statusFilter === s ? "" : "ml-[22px]"}>
                      {s === "All" ? "All statuses" : s}
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Position filter */}
        <div className="relative">
          <button
            onClick={() => setShowPositionDropdown((v) => !v)}
            className="flex h-9 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
          >
            {positionFilter}
            <ChevronDown
              className={`h-3.5 w-3.5 text-gray-400 transition-transform ${showPositionDropdown ? "rotate-180" : ""}`}
            />
          </button>
          {showPositionDropdown && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowPositionDropdown(false)}
              />
              <div className="absolute right-0 top-full z-20 mt-1 w-48 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                {positionFilters.map((p) => (
                  <button
                    key={p}
                    onClick={() => {
                      setPositionFilter(p)
                      setShowPositionDropdown(false)
                    }}
                    className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50 ${
                      positionFilter === p
                        ? "font-medium text-[#6B1D1D]"
                        : "text-gray-600"
                    }`}
                  >
                    {positionFilter === p && (
                      <Check className="h-3.5 w-3.5" />
                    )}
                    <span className={positionFilter === p ? "" : "ml-[22px]"}>
                      {p}
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {selectedUsers.size > 0 && (
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs font-medium text-[#6B1D1D]">
              {selectedUsers.size} selected
            </span>
            <button className="flex h-8 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2.5 text-xs font-medium text-gray-600 hover:bg-gray-50">
              <Mail className="h-3 w-3" />
              Email
            </button>
          </div>
        )}
      </div>

      {/* Loading */}
      {usersQuery.isLoading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          <span className="ml-2 text-sm text-gray-500">Loading users...</span>
        </div>
      )}

      {/* Error */}
      {usersQuery.isError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
          <AlertCircle className="mx-auto h-8 w-8 text-red-400" />
          <p className="mt-2 text-sm font-medium text-red-800">
            Failed to load users
          </p>
          <button
            onClick={() => usersQuery.refetch()}
            className="mt-3 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50"
          >
            Retry
          </button>
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
              <Users className="h-6 w-6 text-gray-400" />
            </div>
            <p className="mt-3 text-sm font-medium text-gray-900">
              No users found
            </p>
            <p className="mt-1 text-sm text-gray-500">
              {search || positionFilter !== "All positions" || statusFilter !== "All"
                ? "Try adjusting your search or filters"
                : "Add your first user to get started"}
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="w-10 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    className="h-3.5 w-3.5 rounded border-gray-300 text-[#6B1D1D] focus:ring-[#6B1D1D]"
                  />
                </th>
                <th className="px-4 py-3 text-left">
                  <button
                    onClick={() => toggleSort("name")}
                    className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-gray-500 hover:text-gray-700"
                  >
                    User
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Role
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Status
                </th>
                <th className="px-4 py-3 text-left">
                  <button
                    onClick={() => toggleSort("created")}
                    className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-gray-500 hover:text-gray-700"
                  >
                    Joined
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="w-24 px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((user, i) => {
                const badge = getRoleBadge(user)
                const checked = selectedUsers.has(user.SystemUserId)
                return (
                  <tr
                    key={user.SystemUserId}
                    className={`transition-colors ${
                      checked
                        ? "bg-[#6B1D1D]/[0.02]"
                        : "hover:bg-gray-50/50"
                    }`}
                  >
                    <td className="px-4 py-3.5">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleUser(user.SystemUserId)}
                        className="h-3.5 w-3.5 rounded border-gray-300 text-[#6B1D1D] focus:ring-[#6B1D1D]"
                      />
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-medium text-white ${avatarColors[i % avatarColors.length]}`}
                        >
                          {getInitials(user.FullName, user.LoginName)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {user.FullName ?? user.LoginName}
                          </p>
                          <p className="text-xs text-gray-400">
                            @{user.LoginName}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      {user.Email ? (
                        <a
                          href={`mailto:${user.Email}`}
                          className="text-sm text-[#6B1D1D] hover:underline"
                        >
                          {user.Email}
                        </a>
                      ) : (
                        <span className="text-sm text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${badge.bg} ${badge.text}`}
                      >
                        {badge.label}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      {user.IsDisabled ? (
                        <span className="inline-flex items-center gap-1.5 text-xs text-gray-400">
                          <span className="h-1.5 w-1.5 rounded-full bg-gray-300" />
                          Inactive
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          Active
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-sm text-gray-500">
                        {formatDate(user.CreatedOn)}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-0.5">
                        <button className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer */}
      {filtered.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Showing{" "}
            <span className="font-medium text-gray-700">
              {filtered.length}
            </span>{" "}
            of{" "}
            <span className="font-medium text-gray-700">{totalUsers}</span>{" "}
            users
          </p>
          <div className="text-xs text-gray-400">
            {activeUsers} active · {inactiveUsers} inactive
          </div>
        </div>
      )}
    </div>
  )
}
