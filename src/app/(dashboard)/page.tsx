"use client"

import { useMemo } from "react"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import {
  AlertTriangle,
  Plus,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Hourglass,
  ChevronRight,
  Loader2,
  Building2,
  Clock,
  CheckCircle,
  AlertCircle,
  Eye,
} from "lucide-react"
import {
  getApiV1LabbisDefectActOptions,
  getApiV1LabbisObjectOptions,
} from "@/generated/api/@tanstack/react-query.gen"
import type {
  DefectAct,
  Object as BuildingObject,
} from "@/generated/api/types.gen"

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
]

const mockDefects: DefectAct[] = [
  { DefectActId: "m1", ActNumber: "DA-2025-0847", DefectActDate: "2025-10-24T10:30:00Z", ObjectId: "obj-001", Problem: "Water leakage from roof membrane", Place: "Roof, Section B", Status: "In Progress", SystemosId: "s1", SystGroupId: "g1" },
  { DefectActId: "m2", ActNumber: "DA-2025-0823", DefectActDate: "2025-10-23T14:15:00Z", ObjectId: "obj-002", Problem: "Elevator maintenance required", Place: "Elevator shaft #2", Status: "Awaiting Approval", SystemosId: "s2", SystGroupId: "g2" },
  { DefectActId: "m3", ActNumber: "DA-2025-0901", DefectActDate: "2025-10-22T08:00:00Z", ObjectId: "obj-001", Problem: "Broken window panel - 3rd floor", Place: "Floor 3, Unit 12", Status: "Completed", SystemosId: "s3", SystGroupId: "g1" },
  { DefectActId: "m4", ActNumber: "DA-2025-0789", DefectActDate: "2025-10-21T16:45:00Z", ObjectId: "obj-003", Problem: "Heating system failure in basement", Place: "Basement, Boiler room", Status: "Declined", SystemosId: "s4", SystGroupId: "g3" },
  { DefectActId: "m5", ActNumber: "DA-2025-0812", DefectActDate: "2025-10-20T09:30:00Z", ObjectId: "obj-002", Problem: "Parking lot drainage blocked", Place: "Underground parking", Status: "Under Review", SystemosId: "s5", SystGroupId: "g2" },
  { DefectActId: "m6", ActNumber: "DA-2025-0756", DefectActDate: "2025-10-19T11:20:00Z", ObjectId: "obj-001", Problem: "Fire alarm sensor malfunction", Place: "Floor 5, Corridor", Status: "In Progress", SystemosId: "s6", SystGroupId: "g1" },
  { DefectActId: "m7", ActNumber: "DA-2025-0734", DefectActDate: "2025-09-18T15:00:00Z", ObjectId: "obj-003", Problem: "Cracked facade tiles", Place: "North facade", Status: "Awaiting Approval", SystemosId: "s7", SystGroupId: "g3" },
  { DefectActId: "m8", ActNumber: "DA-2025-0698", DefectActDate: "2025-09-10T10:00:00Z", ObjectId: "obj-002", Problem: "Intercom system not responding", Place: "Main entrance", Status: "Completed", SystemosId: "s8", SystGroupId: "g2" },
  { DefectActId: "m9", ActNumber: "DA-2025-0650", DefectActDate: "2025-08-25T14:00:00Z", ObjectId: "obj-001", Problem: "Stairwell lighting failure", Place: "Stairwell B", Status: "Completed", SystemosId: "s9", SystGroupId: "g1" },
  { DefectActId: "m10", ActNumber: "DA-2025-0620", DefectActDate: "2025-08-12T09:00:00Z", ObjectId: "obj-003", Problem: "Garage door mechanism", Place: "Parking entrance", Status: "Completed", SystemosId: "s10", SystGroupId: "g3" },
  { DefectActId: "m11", ActNumber: "DA-2025-0590", DefectActDate: "2025-07-20T11:00:00Z", ObjectId: "obj-002", Problem: "Lobby floor tiles cracked", Place: "Ground floor lobby", Status: "Completed", SystemosId: "s11", SystGroupId: "g2" },
  { DefectActId: "m12", ActNumber: "DA-2025-0540", DefectActDate: "2025-07-05T08:30:00Z", ObjectId: "obj-001", Problem: "Water pipe leak", Place: "Floor 2, Unit 5", Status: "Completed", SystemosId: "s12", SystGroupId: "g1" },
  { DefectActId: "m13", ActNumber: "DA-2025-0500", DefectActDate: "2025-06-15T10:00:00Z", ObjectId: "obj-003", Problem: "AC unit noise", Place: "Floor 4", Status: "Completed", SystemosId: "s13", SystGroupId: "g3" },
  { DefectActId: "m14", ActNumber: "DA-2025-0460", DefectActDate: "2025-05-22T13:00:00Z", ObjectId: "obj-002", Problem: "Mailbox lock broken", Place: "Ground floor", Status: "Completed", SystemosId: "s14", SystGroupId: "g2" },
  { DefectActId: "m15", ActNumber: "DA-2025-0420", DefectActDate: "2025-04-10T09:00:00Z", ObjectId: "obj-001", Problem: "Balcony railing loose", Place: "Floor 6, Unit 18", Status: "Completed", SystemosId: "s15", SystGroupId: "g1" },
  { DefectActId: "m16", ActNumber: "DA-2025-0380", DefectActDate: "2025-03-18T14:00:00Z", ObjectId: "obj-003", Problem: "Elevator button stuck", Place: "Elevator #1", Status: "Completed", SystemosId: "s16", SystGroupId: "g3" },
  { DefectActId: "m17", ActNumber: "DA-2025-0350", DefectActDate: "2025-02-25T10:00:00Z", ObjectId: "obj-002", Problem: "Hallway paint peeling", Place: "Floor 3, Corridor", Status: "Completed", SystemosId: "s17", SystGroupId: "g2" },
  { DefectActId: "m18", ActNumber: "DA-2025-0310", DefectActDate: "2025-01-12T11:00:00Z", ObjectId: "obj-001", Problem: "Front door hinge", Place: "Main entrance", Status: "Completed", SystemosId: "s18", SystGroupId: "g1" },
  { DefectActId: "m19", ActNumber: "DA-2024-0280", DefectActDate: "2024-12-08T09:00:00Z", ObjectId: "obj-003", Problem: "Gutter overflow", Place: "Roof east side", Status: "Completed", SystemosId: "s19", SystGroupId: "g3" },
  { DefectActId: "m20", ActNumber: "DA-2024-0250", DefectActDate: "2024-11-20T14:00:00Z", ObjectId: "obj-002", Problem: "Security camera offline", Place: "Parking Level -2", Status: "Completed", SystemosId: "s20", SystGroupId: "g2" },
]

const mockBuildings: Record<string, { code: string; name: string }> = {
  "obj-001": { code: "BLD-A", name: "Main Office" },
  "obj-002": { code: "BLD-B", name: "Residential Block" },
  "obj-003": { code: "BLD-C", name: "Warehouse" },
}

const statusConfig: Record<string, { bg: string; text: string; dot: string; icon: typeof Clock }> = {
  "In Progress": { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500", icon: Clock },
  "Awaiting Approval": { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500", icon: AlertCircle },
  "Under Review": { bg: "bg-violet-50", text: "text-violet-700", dot: "bg-violet-500", icon: Eye },
  Completed: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500", icon: CheckCircle },
  Declined: { bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500", icon: AlertTriangle },
}

function useAggregations(defects: DefectAct[]) {
  return useMemo(() => {
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()

    const monthlyMap = new Map<string, number>()
    for (let i = 11; i >= 0; i--) {
      const d = new Date(currentYear, currentMonth - i, 1)
      const key = `${d.getFullYear()}-${d.getMonth()}`
      monthlyMap.set(key, 0)
    }

    const buildingCounts = new Map<string, number>()
    let currentMonthCount = 0
    let prevMonthCount = 0

    for (const defect of defects) {
      const date = new Date(defect.DefectActDate)
      const key = `${date.getFullYear()}-${date.getMonth()}`
      if (monthlyMap.has(key)) {
        monthlyMap.set(key, (monthlyMap.get(key) ?? 0) + 1)
      }

      if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) currentMonthCount++
      const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1
      const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear
      if (date.getMonth() === prevMonth && date.getFullYear() === prevYear) prevMonthCount++

      buildingCounts.set(defect.ObjectId, (buildingCounts.get(defect.ObjectId) ?? 0) + 1)
    }

    const chartData = [...monthlyMap.entries()].map(([key, value]) => {
      const [, monthStr] = key.split("-")
      return { month: MONTH_NAMES[Number(monthStr)], value }
    })

    const pctChange = prevMonthCount > 0
      ? Math.round(((currentMonthCount - prevMonthCount) / prevMonthCount) * 100)
      : currentMonthCount > 0 ? 100 : 0

    const statusCounts = new Map<string, number>()
    for (const defect of defects) {
      if (defect.Status) statusCounts.set(defect.Status, (statusCounts.get(defect.Status) ?? 0) + 1)
    }

    const openCount = defects.filter((d) =>
      ["In Progress", "Awaiting Approval", "Under Review"].includes(d.Status)
    ).length

    return {
      chartData,
      currentMonthCount,
      pctChange,
      totalDefects: defects.length,
      openCount,
      statusCounts: [...statusCounts.entries()].sort((a, b) => b[1] - a[1]),
      buildingCounts: [...buildingCounts.entries()].sort((a, b) => b[1] - a[1]),
      trendingUp: pctChange >= 0,
    }
  }, [defects])
}

function TrendChart({ data }: { data: { month: string; value: number }[] }) {
  if (data.length === 0) return null

  const width = 520
  const height = 180
  const padding = { top: 20, right: 16, bottom: 30, left: 32 }
  const chartW = width - padding.left - padding.right
  const chartH = height - padding.top - padding.bottom
  const maxVal = Math.max(...data.map((d) => d.value), 1)

  const points = data.map((d, i) => ({
    x: padding.left + (i / (data.length - 1)) * chartW,
    y: padding.top + chartH - (d.value / maxVal) * chartH,
  }))

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ")
  const areaPath = `${linePath} L${points[points.length - 1].x},${padding.top + chartH} L${points[0].x},${padding.top + chartH} Z`

  const yTicks = [0, Math.round(maxVal / 2), maxVal]

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6B1D1D" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#6B1D1D" stopOpacity="0.01" />
        </linearGradient>
      </defs>
      {yTicks.map((tick) => {
        const y = padding.top + chartH - (tick / maxVal) * chartH
        return (
          <g key={tick}>
            <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="#f0f0f0" />
            <text x={padding.left - 6} y={y + 3} textAnchor="end" className="fill-gray-400" fontSize="9">{tick}</text>
          </g>
        )
      })}
      <path d={areaPath} fill="url(#areaFill)" />
      <path d={linePath} fill="none" stroke="#6B1D1D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3" fill="#fff" stroke="#6B1D1D" strokeWidth="1.5" />
      ))}
      {data.map((d, i) => (
        <text key={d.month + i} x={points[i].x} y={height - 6} textAnchor="middle" className="fill-gray-400" fontSize="9">
          {d.month}
        </text>
      ))}
    </svg>
  )
}

export default function DashboardPage() {
  const defectsQuery = useQuery(
    getApiV1LabbisDefectActOptions({
      query: { rowsPerPage: 2000 },
    })
  )
  const objectsQuery = useQuery({ ...getApiV1LabbisObjectOptions(), enabled: false })

  const apiDefects = (defectsQuery.data as Array<DefectAct>) ?? []
  const defects = apiDefects.length > 0 ? apiDefects : mockDefects
  const usingMock = apiDefects.length === 0

  const agg = useAggregations(defects)
  const isLoading = defectsQuery.isLoading

  const recentDefects = [...defects]
    .sort((a, b) => new Date(b.DefectActDate).getTime() - new Date(a.DefectActDate).getTime())
    .slice(0, 5)

  function getBuildingLabel(objectId: string) {
    if (usingMock) {
      const m = mockBuildings[objectId]
      return m ? `${m.code} – ${m.name}` : objectId
    }
    return objectId.slice(0, 8)
  }

  function getBuildingCode(objectId: string) {
    if (usingMock) return mockBuildings[objectId]?.code ?? "—"
    return objectId.slice(0, 8)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">Overview of all defect management activities</p>
        </div>
        <Link
          href="/defects/new"
          className="inline-flex items-center rounded-lg bg-[#6B1D1D] px-3 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#5a1818]"
        >
          <Plus className="mr-1.5 h-4 w-4" />
          New Defect
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Defects", value: agg.totalDefects, icon: Hourglass, iconBg: "bg-gray-100", iconColor: "text-gray-600" },
          { label: "Open", value: agg.openCount, icon: AlertCircle, iconBg: "bg-amber-50", iconColor: "text-amber-600" },
          { label: "Completed", value: agg.statusCounts.find(([s]) => s === "Completed")?.[1] ?? 0, icon: CheckCircle, iconBg: "bg-emerald-50", iconColor: "text-emerald-600" },
          { label: "This Month", value: agg.currentMonthCount, icon: TrendingUp, iconBg: "bg-[#6B1D1D]/10", iconColor: "text-[#6B1D1D]" },
        ].map((kpi) => (
          <div key={kpi.label} className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="flex items-center gap-3">
              <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${kpi.iconBg}`}>
                <kpi.icon className={`h-4.5 w-4.5 ${kpi.iconColor}`} />
              </div>
              <div>
                <p className="text-2xl font-bold tracking-tight text-gray-900">
                  {isLoading ? "—" : kpi.value}
                </p>
                <p className="text-xs text-gray-500">{kpi.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* To Do List */}
      {agg.openCount > 0 && (
        <div className="rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50/50 p-5">
          <div className="flex items-start gap-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100">
              <AlertTriangle className="h-4.5 w-4.5 text-amber-600" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-semibold text-gray-900">
                Action Needed: {agg.openCount} open defects require attention
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-gray-600">
                You have{" "}
                <span className="font-medium text-gray-900">
                  {agg.statusCounts.find(([s]) => s === "Awaiting Approval")?.[1] ?? 0} awaiting approval
                </span>{" "}
                and{" "}
                <span className="font-medium text-gray-900">
                  {agg.statusCounts.find(([s]) => s === "In Progress")?.[1] ?? 0} in progress
                </span>
                . Review and prioritize to maintain SLA compliance.
              </p>
            </div>
            <Link href="/defects" className="shrink-0 text-sm font-medium text-[#6B1D1D] hover:underline">
              View all
            </Link>
          </div>
        </div>
      )}

      {/* Chart + Stat */}
      <div className="grid grid-cols-[1fr_200px] gap-4">
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="mb-4 flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#6B1D1D]/10">
              <Hourglass className="h-4 w-4 text-[#6B1D1D]" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Defects Trend</h3>
              <p className="text-xs text-gray-500">New defects per month (12 months)</p>
            </div>
          </div>
          {isLoading ? (
            <div className="flex h-[180px] items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-gray-300" />
            </div>
          ) : (
            <TrendChart data={agg.chartData} />
          )}
        </div>

        <div className="flex flex-col justify-between rounded-xl border border-gray-200 bg-white p-5">
          <span
            className={`inline-flex w-fit items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${
              agg.trendingUp
                ? "bg-red-50 text-red-700 ring-red-600/10"
                : "bg-emerald-50 text-emerald-700 ring-emerald-600/10"
            }`}
          >
            {agg.trendingUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {agg.trendingUp ? "Trending Up" : "Trending Down"}
          </span>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Current Month</p>
            <p className="mt-1 text-4xl font-bold tracking-tight text-gray-900">
              {isLoading ? "—" : agg.currentMonthCount}
            </p>
            <p className="text-sm text-gray-500">defects</p>
          </div>
          <div className="flex items-center gap-1 text-sm">
            <span
              className={`inline-flex items-center gap-0.5 font-medium ${
                agg.pctChange >= 0 ? "text-red-600" : "text-emerald-600"
              }`}
            >
              {agg.pctChange >= 0 ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
              {agg.pctChange >= 0 ? "+" : ""}{agg.pctChange}%
            </span>
            <span className="text-gray-400">vs prev</span>
          </div>
        </div>
      </div>

      {/* Status Breakdown + Buildings + Recent */}
      <div className="grid grid-cols-[1fr_1fr] gap-4">
        {/* Status Breakdown */}
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h3 className="text-sm font-semibold text-gray-900">Status Breakdown</h3>
          <p className="mb-4 text-xs text-gray-500">{agg.totalDefects} total defects</p>
          {isLoading ? (
            <div className="flex h-32 items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-gray-300" />
            </div>
          ) : (
            <div className="space-y-3">
              {agg.statusCounts.map(([status, count]) => {
                const sc = statusConfig[status]
                const pct = Math.round((count / agg.totalDefects) * 100)
                return (
                  <div key={status} className="flex items-center gap-3">
                    <div className="w-28 flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${sc?.dot ?? "bg-gray-400"}`} />
                      <span className="text-xs font-medium text-gray-700 truncate">{status}</span>
                    </div>
                    <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${sc?.dot ?? "bg-gray-400"}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-12 text-right text-xs font-medium text-gray-500">{count} ({pct}%)</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* My Buildings */}
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h3 className="text-sm font-semibold text-gray-900">My Buildings</h3>
          <p className="mb-4 text-xs text-gray-500">By defect count</p>
          {isLoading ? (
            <div className="flex h-32 items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-gray-300" />
            </div>
          ) : (
            <div className="space-y-1">
              {agg.buildingCounts.map(([objectId, count]) => (
                <div
                  key={objectId}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-gray-50"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-stone-100 text-xs font-semibold text-stone-600">
                    {getBuildingCode(objectId).replace("BLD-", "")}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900">{getBuildingLabel(objectId)}</p>
                    <p className="text-xs text-gray-400">{count} defects</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-300" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Defects */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Recent Defects</h2>
            <p className="text-xs text-gray-500">Latest reported issues</p>
          </div>
          <Link href="/defects" className="text-sm font-medium text-[#6B1D1D] hover:underline">
            View all
          </Link>
        </div>
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">ID</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Problem</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Building</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Status</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentDefects.map((defect) => {
                const sc = statusConfig[defect.Status]
                return (
                  <tr key={defect.DefectActId} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <span className="text-sm font-medium text-[#6B1D1D]">{defect.ActNumber ?? "—"}</span>
                    </td>
                    <td className="max-w-[240px] px-4 py-3">
                      <p className="truncate text-sm text-gray-900">{defect.Problem ?? "—"}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-600">{getBuildingCode(defect.ObjectId)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${sc?.bg ?? "bg-gray-50"} ${sc?.text ?? "text-gray-700"}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${sc?.dot ?? "bg-gray-400"}`} />
                        {defect.Status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-500">
                        {new Date(defect.DefectActDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {usingMock && (
          <p className="mt-2 text-right">
            <span className="rounded bg-amber-50 px-1.5 py-0.5 text-xs font-medium text-amber-600">Sample data</span>
          </p>
        )}
      </section>
    </div>
  )
}
