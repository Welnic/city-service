"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import {
  Plus,
  Search,
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  Loader2,
  AlertCircle,
  FileText,
  MapPin,
  Building2,
  ArrowUpDown,
} from "lucide-react"
import {
  getApiV1LabbisDefectActOptions,
  getApiV1LabbisObjectOptions,
} from "@/generated/api/@tanstack/react-query.gen"
import type {
  DefectAct,
  Object as BuildingObject,
} from "@/generated/api/types.gen"

const ROWS_PER_PAGE = 10

const mockDefects: DefectAct[] = [
  {
    DefectActId: "d1a1b2c3-0001-4000-8000-000000000001",
    ActNumber: "DA-2025-0847",
    DefectActDate: "2025-10-24T10:30:00Z",
    ObjectId: "obj-001",
    Problem: "Water leakage from roof membrane",
    Place: "Roof, Section B",
    Status: "In Progress",
    Description: "Active water infiltration during rainfall",
    Solution: null,
    SystemosId: "sys-001",
    SystGroupId: "sg-001",
    InspectionDate: "2025-10-22T09:00:00Z",
  },
  {
    DefectActId: "d1a1b2c3-0002-4000-8000-000000000002",
    ActNumber: "DA-2025-0823",
    DefectActDate: "2025-10-23T14:15:00Z",
    ObjectId: "obj-002",
    Problem: "Elevator maintenance required",
    Place: "Elevator shaft #2",
    Status: "Awaiting Approval",
    Description: "Annual inspection overdue",
    Solution: null,
    SystemosId: "sys-002",
    SystGroupId: "sg-002",
    InspectionDate: null,
  },
  {
    DefectActId: "d1a1b2c3-0003-4000-8000-000000000003",
    ActNumber: "DA-2025-0901",
    DefectActDate: "2025-10-22T08:00:00Z",
    ObjectId: "obj-001",
    Problem: "Broken window panel - 3rd floor",
    Place: "Floor 3, Unit 12",
    Status: "Completed",
    Description: "Double-glazed window cracked",
    Solution: "Window replaced with matching specification",
    SystemosId: "sys-003",
    SystGroupId: "sg-001",
    InspectionDate: "2025-10-20T11:00:00Z",
  },
  {
    DefectActId: "d1a1b2c3-0004-4000-8000-000000000004",
    ActNumber: "DA-2025-0789",
    DefectActDate: "2025-10-21T16:45:00Z",
    ObjectId: "obj-003",
    Problem: "Heating system failure in basement",
    Place: "Basement, Boiler room",
    Status: "Declined",
    Description: "Warranty claim for boiler unit",
    Solution: null,
    SystemosId: "sys-004",
    SystGroupId: "sg-003",
    InspectionDate: "2025-10-19T14:00:00Z",
  },
  {
    DefectActId: "d1a1b2c3-0005-4000-8000-000000000005",
    ActNumber: "DA-2025-0812",
    DefectActDate: "2025-10-20T09:30:00Z",
    ObjectId: "obj-002",
    Problem: "Parking lot drainage blocked",
    Place: "Underground parking, Level -1",
    Status: "Under Review",
    Description: "Storm drain clogged causing flooding",
    Solution: null,
    SystemosId: "sys-005",
    SystGroupId: "sg-002",
    InspectionDate: "2025-10-18T10:00:00Z",
  },
  {
    DefectActId: "d1a1b2c3-0006-4000-8000-000000000006",
    ActNumber: "DA-2025-0756",
    DefectActDate: "2025-10-19T11:20:00Z",
    ObjectId: "obj-001",
    Problem: "Fire alarm sensor malfunction",
    Place: "Floor 5, Corridor",
    Status: "In Progress",
    Description: "Smoke detector triggering false alarms",
    Solution: null,
    SystemosId: "sys-006",
    SystGroupId: "sg-001",
    InspectionDate: "2025-10-17T13:00:00Z",
  },
  {
    DefectActId: "d1a1b2c3-0007-4000-8000-000000000007",
    ActNumber: "DA-2025-0734",
    DefectActDate: "2025-10-18T15:00:00Z",
    ObjectId: "obj-003",
    Problem: "Cracked facade tiles",
    Place: "North facade, Level 2-3",
    Status: "Awaiting Approval",
    Description: "Multiple tiles showing cracks after frost damage",
    Solution: null,
    SystemosId: "sys-007",
    SystGroupId: "sg-003",
    InspectionDate: null,
  },
  {
    DefectActId: "d1a1b2c3-0008-4000-8000-000000000008",
    ActNumber: "DA-2025-0698",
    DefectActDate: "2025-10-17T10:00:00Z",
    ObjectId: "obj-002",
    Problem: "Intercom system not responding",
    Place: "Main entrance",
    Status: "Completed",
    Description: "Residents unable to buzz visitors in",
    Solution: "Intercom controller board replaced",
    SystemosId: "sys-008",
    SystGroupId: "sg-002",
    InspectionDate: "2025-10-15T09:00:00Z",
  },
]

const mockBuildings: Record<string, { code: string; name: string }> = {
  "obj-001": { code: "BLD-A", name: "Main Office" },
  "obj-002": { code: "BLD-B", name: "Residential Block" },
  "obj-003": { code: "BLD-C", name: "Warehouse" },
}

const statusConfig: Record<string, { bg: string; text: string; dot: string }> =
  {
    "In Progress": {
      bg: "bg-blue-50",
      text: "text-blue-700",
      dot: "bg-blue-500",
    },
    "Awaiting Approval": {
      bg: "bg-amber-50",
      text: "text-amber-700",
      dot: "bg-amber-500",
    },
    Completed: {
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      dot: "bg-emerald-500",
    },
    Declined: {
      bg: "bg-red-50",
      text: "text-red-700",
      dot: "bg-red-500",
    },
    "Under Review": {
      bg: "bg-violet-50",
      text: "text-violet-700",
      dot: "bg-violet-500",
    },
  }

const defaultStatusConfig = {
  bg: "bg-gray-50",
  text: "text-gray-700",
  dot: "bg-gray-400",
}

const statuses = [
  "All",
  "In Progress",
  "Awaiting Approval",
  "Under Review",
  "Completed",
  "Declined",
]

export default function DefectsPage() {
  const [pageNumber, setPageNumber] = useState(1)
  const [search, setSearch] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("All")
  const [selectedBuilding, setSelectedBuilding] = useState("all")
  const [showBuildingDropdown, setShowBuildingDropdown] = useState(false)
  const [sortField, setSortField] = useState<"date" | "status">("date")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc")

  const defectsQuery = useQuery(
    getApiV1LabbisDefectActOptions({
      query: {
        pageNumber,
        rowsPerPage: ROWS_PER_PAGE,
        orderBy: "DefectActDate desc",
      },
    })
  )

  const objectsQuery = useQuery({
    ...getApiV1LabbisObjectOptions(),
    enabled: false,
  })

  const apiDefects = (defectsQuery.data as Array<DefectAct>) ?? []
  const objects = (objectsQuery.data as Array<BuildingObject>) ?? []

  const defects = apiDefects.length > 0 ? apiDefects : mockDefects
  const usingMock = apiDefects.length === 0

  const objectMap = new Map(objects.map((o) => [o.ObjectId, o]))

  function getBuildingLabel(objectId: string) {
    if (usingMock) {
      const mock = mockBuildings[objectId]
      return mock ? `${mock.code} – ${mock.name}` : objectId
    }
    const obj = objectMap.get(objectId)
    if (!obj) return objectId.slice(0, 8) + "..."
    return obj.Code + (obj.Description ? ` – ${obj.Description}` : "")
  }

  function getBuildingCode(objectId: string) {
    if (usingMock) return mockBuildings[objectId]?.code ?? "—"
    const obj = objectMap.get(objectId)
    return obj?.Code ?? objectId.slice(0, 8)
  }

  const filtered = useMemo(() => {
    let items = defects

    if (search) {
      const q = search.toLowerCase()
      items = items.filter(
        (d) =>
          d.Problem?.toLowerCase().includes(q) ||
          d.Place?.toLowerCase().includes(q) ||
          d.ActNumber?.toLowerCase().includes(q) ||
          d.Description?.toLowerCase().includes(q)
      )
    }

    if (selectedStatus !== "All") {
      items = items.filter((d) => d.Status === selectedStatus)
    }

    if (selectedBuilding !== "all") {
      items = items.filter((d) => d.ObjectId === selectedBuilding)
    }

    items = [...items].sort((a, b) => {
      if (sortField === "date") {
        const diff =
          new Date(a.DefectActDate).getTime() -
          new Date(b.DefectActDate).getTime()
        return sortDir === "asc" ? diff : -diff
      }
      const diff = (a.Status ?? "").localeCompare(b.Status ?? "")
      return sortDir === "asc" ? diff : -diff
    })

    return items
  }, [defects, search, selectedStatus, selectedBuilding, sortField, sortDir])

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { All: defects.length }
    for (const d of defects) {
      counts[d.Status] = (counts[d.Status] ?? 0) + 1
    }
    return counts
  }, [defects])

  const buildingOptions = useMemo(() => {
    const ids = [...new Set(defects.map((d) => d.ObjectId))]
    return ids.map((id) => ({ id, label: getBuildingLabel(id) }))
  }, [defects])

  function toggleSort(field: "date" | "status") {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    } else {
      setSortField(field)
      setSortDir("desc")
    }
  }

  const hasNextPage = defects.length === ROWS_PER_PAGE

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
            Defects List
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            All defect records and management
          </p>
        </div>
        <Link
          href="/defects/new"
          className="inline-flex items-center rounded-lg bg-[#6B1D1D] px-3 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#5a1818]"
        >
          <Plus className="mr-1.5 h-4 w-4" />
          New Defect
        </Link>
      </div>

      {/* Status Tabs */}
      <div className="flex items-center gap-1 border-b border-gray-200">
        {statuses.map((s) => {
          const count = statusCounts[s] ?? 0
          const active = selectedStatus === s
          return (
            <button
              key={s}
              onClick={() => {
                setSelectedStatus(s)
                setPageNumber(1)
              }}
              className={`relative flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "text-[#6B1D1D]"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {s}
              {count > 0 && (
                <span
                  className={`rounded-full px-1.5 py-0.5 text-xs ${
                    active
                      ? "bg-[#6B1D1D]/10 text-[#6B1D1D]"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {count}
                </span>
              )}
              {active && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-[#6B1D1D]" />
              )}
            </button>
          )
        })}
      </div>

      {/* Search & Filters Row */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by ID, problem, location..."
            className="h-9 w-full rounded-lg border border-gray-200 bg-white pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#6B1D1D] focus:outline-none focus:ring-1 focus:ring-[#6B1D1D]"
          />
        </div>

        <button className="flex h-9 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
          <Calendar className="h-3.5 w-3.5 text-gray-400" />
          Date range
        </button>

        <div className="relative">
          <button
            onClick={() => setShowBuildingDropdown((v) => !v)}
            className="flex h-9 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <Building2 className="h-3.5 w-3.5 text-gray-400" />
            {selectedBuilding === "all"
              ? "All buildings"
              : getBuildingCode(selectedBuilding)}
            <ChevronDown
              className={`h-3.5 w-3.5 text-gray-400 transition-transform ${showBuildingDropdown ? "rotate-180" : ""}`}
            />
          </button>
          {showBuildingDropdown && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowBuildingDropdown(false)}
              />
              <div className="absolute right-0 top-full z-20 mt-1 w-56 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                <button
                  onClick={() => {
                    setSelectedBuilding("all")
                    setShowBuildingDropdown(false)
                  }}
                  className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 ${
                    selectedBuilding === "all"
                      ? "font-medium text-[#6B1D1D]"
                      : "text-gray-600"
                  }`}
                >
                  All buildings
                </button>
                {buildingOptions.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => {
                      setSelectedBuilding(b.id)
                      setShowBuildingDropdown(false)
                    }}
                    className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 ${
                      selectedBuilding === b.id
                        ? "font-medium text-[#6B1D1D]"
                        : "text-gray-600"
                    }`}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Loading */}
      {defectsQuery.isLoading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          <span className="ml-2 text-sm text-gray-500">
            Loading defects...
          </span>
        </div>
      )}

      {/* Error */}
      {defectsQuery.isError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
          <AlertCircle className="mx-auto h-8 w-8 text-red-400" />
          <p className="mt-2 text-sm font-medium text-red-800">
            Failed to load defects
          </p>
          <button
            onClick={() => defectsQuery.refetch()}
            className="mt-3 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50"
          >
            Retry
          </button>
        </div>
      )}

      {/* Table */}
      {!defectsQuery.isLoading && !defectsQuery.isError && (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                <FileText className="h-6 w-6 text-gray-400" />
              </div>
              <p className="mt-3 text-sm font-medium text-gray-900">
                No defects found
              </p>
              <p className="mt-1 text-sm text-gray-500">
                {search || selectedStatus !== "All"
                  ? "Try adjusting your filters"
                  : "Create your first defect to get started"}
              </p>
              {!search && selectedStatus === "All" && (
                <Link
                  href="/defects/new"
                  className="mt-4 inline-flex items-center rounded-lg bg-[#6B1D1D] px-3 py-2 text-sm font-medium text-white hover:bg-[#5a1818]"
                >
                  <Plus className="mr-1.5 h-4 w-4" />
                  New Defect
                </Link>
              )}
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Problem
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Location
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Building
                  </th>
                  <th className="px-4 py-3 text-left">
                    <button
                      onClick={() => toggleSort("status")}
                      className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-gray-500 hover:text-gray-700"
                    >
                      Status
                      <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <button
                      onClick={() => toggleSort("date")}
                      className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-gray-500 hover:text-gray-700"
                    >
                      Date
                      <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </th>
                  <th className="w-16 px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((defect) => {
                  const sc =
                    statusConfig[defect.Status] ?? defaultStatusConfig
                  return (
                    <tr
                      key={defect.DefectActId}
                      className="transition-colors hover:bg-gray-50/50"
                    >
                      <td className="px-4 py-3.5">
                        <span className="text-sm font-medium text-[#6B1D1D]">
                          {defect.ActNumber ?? "—"}
                        </span>
                      </td>
                      <td className="max-w-[260px] px-4 py-3.5">
                        <p className="truncate text-sm font-medium text-gray-900">
                          {defect.Problem ?? defect.Description ?? "—"}
                        </p>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {defect.Place ?? "—"}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-sm text-gray-600">
                          {getBuildingCode(defect.ObjectId)}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${sc.bg} ${sc.text}`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${sc.dot}`}
                          />
                          {defect.Status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-sm text-gray-500">
                          {new Date(
                            defect.DefectActDate
                          ).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <Link
                          href={`/defects/${defect.DefectActId}`}
                          className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors inline-flex"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Pagination */}
      {filtered.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Showing{" "}
            <span className="font-medium text-gray-700">
              {filtered.length}
            </span>{" "}
            {filtered.length === 1 ? "defect" : "defects"}
            {usingMock && (
              <span className="ml-2 rounded bg-amber-50 px-1.5 py-0.5 text-xs font-medium text-amber-600">
                Sample data
              </span>
            )}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
              disabled={pageNumber === 1}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition-colors hover:bg-gray-50 disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="px-3 text-sm text-gray-600">
              Page {pageNumber}
            </span>
            <button
              onClick={() => setPageNumber((p) => p + 1)}
              disabled={!hasNextPage}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition-colors hover:bg-gray-50 disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
