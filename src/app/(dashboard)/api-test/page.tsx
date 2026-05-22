"use client"

import { useState } from "react"
import { Play, Plus, Trash2, ChevronDown } from "lucide-react"

const PRESETS = [
  {
    name: "List Clerks",
    method: "GET" as const,
    path: "/api/v1/labbis/Clerk",
    body: "",
  },
  {
    name: "Create Clerk",
    method: "POST" as const,
    path: "/api/v1/labbis/Clerk",
    body: JSON.stringify(
      {
        ClerkId: crypto.randomUUID(),
        ClerkFullName: "Test Inspector",
      },
      null,
      2
    ),
  },
  {
    name: "List Objects",
    method: "GET" as const,
    path: "/api/v1/labbis/Object",
    body: "",
  },
  {
    name: "List DefectActs",
    method: "GET" as const,
    path: "/api/v1/labbis/DefectAct?pageNumber=1&rowsPerPage=20",
    body: "",
  },
  {
    name: "List SystemUsers",
    method: "GET" as const,
    path: "/api/v1/labbis/SystemUser",
    body: "",
  },
  {
    name: "List Activities",
    method: "GET" as const,
    path: "/api/v1/labbis/Activity",
    body: "",
  },
]

type HistoryEntry = {
  id: string
  method: string
  path: string
  status: number
  duration: number
  response: string
  timestamp: Date
}

export default function ApiTestPage() {
  const [method, setMethod] = useState<"GET" | "POST" | "PUT" | "DELETE">("GET")
  const [path, setPath] = useState("/api/v1/labbis/Clerk")
  const [body, setBody] = useState("")
  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState<string | null>(null)
  const [responseStatus, setResponseStatus] = useState<number | null>(null)
  const [duration, setDuration] = useState<number | null>(null)
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [showPresets, setShowPresets] = useState(false)

  async function sendRequest() {
    setLoading(true)
    setResponse(null)
    setResponseStatus(null)

    const start = performance.now()

    try {
      const opts: RequestInit = {
        method,
        headers: { "Content-Type": "application/json" },
      }
      if (method !== "GET" && body.trim()) {
        opts.body = body
      }

      const res = await fetch(path, opts)
      const elapsed = Math.round(performance.now() - start)
      const text = await res.text()

      let formatted = text
      try {
        formatted = JSON.stringify(JSON.parse(text), null, 2)
      } catch {
        // not json
      }

      setResponse(formatted)
      setResponseStatus(res.status)
      setDuration(elapsed)

      setHistory((prev) => [
        {
          id: crypto.randomUUID(),
          method,
          path,
          status: res.status,
          duration: elapsed,
          response: formatted,
          timestamp: new Date(),
        },
        ...prev.slice(0, 19),
      ])
    } catch (err) {
      setResponse(err instanceof Error ? err.message : "Request failed")
      setResponseStatus(0)
      setDuration(Math.round(performance.now() - start))
    } finally {
      setLoading(false)
    }
  }

  function loadPreset(preset: (typeof PRESETS)[number]) {
    setMethod(preset.method)
    setPath(preset.path)
    setBody(preset.body)
    setShowPresets(false)
    setResponse(null)
    setResponseStatus(null)
  }

  const methodColors: Record<string, string> = {
    GET: "bg-emerald-100 text-emerald-700",
    POST: "bg-blue-100 text-blue-700",
    PUT: "bg-amber-100 text-amber-700",
    DELETE: "bg-red-100 text-red-700",
  }

  const statusColor =
    responseStatus === null
      ? ""
      : responseStatus >= 200 && responseStatus < 300
        ? "text-emerald-600"
        : responseStatus >= 400
          ? "text-red-600"
          : "text-amber-600"

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">API Test</h1>
        <p className="mt-1 text-sm text-gray-500">
          Test API endpoints through the proxy
        </p>
      </div>

      {/* Request builder */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-4">
        {/* Presets */}
        <div className="relative">
          <button
            onClick={() => setShowPresets((v) => !v)}
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            Presets
            <ChevronDown
              className={`h-3.5 w-3.5 transition-transform ${showPresets ? "rotate-180" : ""}`}
            />
          </button>
          {showPresets && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowPresets(false)}
              />
              <div className="absolute left-0 top-full z-20 mt-1 w-64 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                {PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => loadPreset(preset)}
                    className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm hover:bg-gray-50 transition-colors"
                  >
                    <span
                      className={`rounded px-1.5 py-0.5 text-xs font-mono font-medium ${methodColors[preset.method]}`}
                    >
                      {preset.method}
                    </span>
                    <span className="text-gray-700">{preset.name}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Method + Path */}
        <div className="flex gap-2">
          <select
            value={method}
            onChange={(e) =>
              setMethod(e.target.value as "GET" | "POST" | "PUT" | "DELETE")
            }
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50"
          >
            <option>GET</option>
            <option>POST</option>
            <option>PUT</option>
            <option>DELETE</option>
          </select>
          <input
            type="text"
            value={path}
            onChange={(e) => setPath(e.target.value)}
            placeholder="/api/v1/labbis/..."
            className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm font-mono text-gray-700 placeholder:text-gray-400"
          />
          <button
            onClick={sendRequest}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg bg-[#6B1D1D] px-4 py-2 text-sm font-medium text-white hover:bg-[#5a1818] disabled:opacity-50 transition-colors"
          >
            <Play className="h-3.5 w-3.5" />
            {loading ? "Sending..." : "Send"}
          </button>
        </div>

        {/* Body */}
        {method !== "GET" && (
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">
              Request Body (JSON)
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={6}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-mono text-gray-700 placeholder:text-gray-400"
              placeholder='{ "key": "value" }'
            />
          </div>
        )}
      </div>

      {/* Response */}
      {response !== null && (
        <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-3">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-semibold text-gray-900">Response</h2>
            <span className={`text-sm font-mono font-medium ${statusColor}`}>
              {responseStatus}
            </span>
            {duration !== null && (
              <span className="text-xs text-gray-400">{duration}ms</span>
            )}
          </div>
          <pre className="max-h-96 overflow-auto rounded-lg bg-gray-50 p-4 text-xs font-mono text-gray-700 leading-relaxed">
            {response || "(empty response)"}
          </pre>
        </div>
      )}

      {/* History */}
      {history.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900">History</h2>
            <button
              onClick={() => setHistory([])}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              <Trash2 className="h-3 w-3" />
              Clear
            </button>
          </div>
          <div className="space-y-1">
            {history.map((entry) => (
              <button
                key={entry.id}
                onClick={() => {
                  setResponse(entry.response)
                  setResponseStatus(entry.status)
                  setDuration(entry.duration)
                  setMethod(
                    entry.method as "GET" | "POST" | "PUT" | "DELETE"
                  )
                  setPath(entry.path)
                }}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm hover:bg-gray-50 transition-colors"
              >
                <span
                  className={`rounded px-1.5 py-0.5 text-xs font-mono font-medium ${methodColors[entry.method] ?? "bg-gray-100 text-gray-600"}`}
                >
                  {entry.method}
                </span>
                <span className="flex-1 truncate font-mono text-xs text-gray-600">
                  {entry.path}
                </span>
                <span
                  className={`text-xs font-mono font-medium ${
                    entry.status >= 200 && entry.status < 300
                      ? "text-emerald-600"
                      : "text-red-600"
                  }`}
                >
                  {entry.status}
                </span>
                <span className="text-xs text-gray-400">
                  {entry.duration}ms
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
