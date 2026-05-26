"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Plus, Upload, X, FileText, Image, Loader2 } from "lucide-react"
import { fetchObjects, fetchSystemGroups, fetchSystems } from "@/lib/directus-api"

const LOCATION_MAX = 65
const DESCRIPTION_MAX = 518
const MAX_FILE_SIZE = 10 * 1024 * 1024
const ACCEPTED_TYPES = ["application/pdf", "image/jpeg", "image/png"]

interface AttachedFile {
  file: File
  id: string
}

export default function NewDefectPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [objectId, setObjectId] = useState("")
  const [systemGroupId, setSystemGroupId] = useState("")
  const [systemId, setSystemId] = useState("")
  const [location, setLocation] = useState("")
  const [description, setDescription] = useState("")
  const [files, setFiles] = useState<AttachedFile[]>([])
  const [dragOver, setDragOver] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  const objectsQuery = useQuery({
    queryKey: ["objects"],
    queryFn: fetchObjects,
  })

  const systGroupsQuery = useQuery({
    queryKey: ["system_groups"],
    queryFn: fetchSystemGroups,
  })

  const systemosQuery = useQuery({
    queryKey: ["systems"],
    queryFn: fetchSystems,
  })

  const objects = (objectsQuery.data as Array<{ ObjectId: string; Code: string; Description?: string | null; FullAddress?: string | null }>) ?? []
  const allSystGroups = (systGroupsQuery.data as Array<{ SystGroupId: string; SystGroupName: string }>) ?? []
  const allSystemos = (systemosQuery.data as Array<{ SystemosId: string; SystemosName: string; SystGroupId: string }>) ?? []

  const filteredSystemos = systemGroupId
    ? allSystemos.filter((s) => s.SystGroupId === systemGroupId)
    : allSystemos

  function handleObjectChange(value: string) {
    setObjectId(value)
    setSystemGroupId("")
    setSystemId("")
  }

  function handleSystemGroupChange(value: string) {
    setSystemGroupId(value)
    setSystemId("")
  }

  function addFiles(incoming: FileList | File[]) {
    const newFiles: AttachedFile[] = []
    for (const file of Array.from(incoming)) {
      if (!ACCEPTED_TYPES.includes(file.type)) continue
      if (file.size > MAX_FILE_SIZE) continue
      newFiles.push({ file, id: crypto.randomUUID() })
    }
    setFiles((prev) => [...prev, ...newFiles])
  }

  function removeFile(id: string) {
    setFiles((prev) => prev.filter((f) => f.id !== id))
  }

  function validate() {
    const e: Record<string, string> = {}
    if (!objectId) e.objectId = "Required"
    if (!systemGroupId) e.systemGroupId = "Required"
    if (!systemId) e.systemId = "Required"
    if (!location.trim()) e.location = "Required"
    if (!description.trim()) e.description = "Required"
    if (files.length === 0) e.files = "At least one file is required"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    setSubmitting(true)
    try {
      const DIRECTUS_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL || "http://localhost:8055"
      const DIRECTUS_TOKEN = process.env.NEXT_PUBLIC_DIRECTUS_TOKEN || ""
      const headers: Record<string, string> = { "Content-Type": "application/json" }
      if (DIRECTUS_TOKEN) headers["Authorization"] = `Bearer ${DIRECTUS_TOKEN}`

      const res = await fetch(`${DIRECTUS_URL}/items/defect_acts`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          id: crypto.randomUUID(),
          defect_date: new Date().toISOString(),
          object_id: objectId,
          system_group_id: systemGroupId,
          system_id: systemId,
          place: location,
          problem: description,
          status: "In Progress",
        }),
      })

      if (!res.ok) throw new Error("Failed to create")
      router.push("/defects")
    } catch {
      setErrors((prev) => ({
        ...prev,
        submit: "Failed to create defect. Please try again.",
      }))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
          New Defect
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Fill out the form below to register a defect, leave feedback or ask a
          question
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          {/* Row 1: Object / System Group / System */}
          <div className="grid grid-cols-3 gap-4">
            <Field label="Select Object" required error={errors.objectId}>
              <Select
                value={objectId}
                onChange={handleObjectChange}
                placeholder="Select object"
                loading={objectsQuery.isLoading}
                options={objects.map((o) => ({
                  value: o.ObjectId,
                  label: o.Code + (o.Description ? ` – ${o.Description}` : ""),
                }))}
              />
            </Field>
            <Field label="System Group:" required error={errors.systemGroupId}>
              <Select
                value={systemGroupId}
                onChange={handleSystemGroupChange}
                placeholder="Select system group"
                loading={systGroupsQuery.isLoading}
                options={allSystGroups.map((g) => ({
                  value: g.SystGroupId,
                  label: g.SystGroupName,
                }))}
              />
            </Field>
            <Field label="System:" required error={errors.systemId}>
              <Select
                value={systemId}
                onChange={setSystemId}
                placeholder="Select system"
                loading={systemosQuery.isLoading}
                disabled={!systemGroupId}
                options={filteredSystemos.map((s) => ({
                  value: s.SystemosId,
                  label: s.SystemosName,
                }))}
              />
            </Field>
          </div>

          {/* Location */}
          <div className="mt-5">
            <Field
              label="Location in Building:"
              required
              counter={`${location.length}/${LOCATION_MAX}`}
              error={errors.location}
            >
              <input
                type="text"
                value={location}
                onChange={(e) =>
                  setLocation(e.target.value.slice(0, LOCATION_MAX))
                }
                placeholder="Building floor and other location details..."
                className="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#6B1D1D] focus:outline-none focus:ring-1 focus:ring-[#6B1D1D]"
              />
            </Field>
          </div>

          {/* Description */}
          <div className="mt-5">
            <Field
              label="Defect Description:"
              required
              counter={`${description.length}/${DESCRIPTION_MAX}`}
              error={errors.description}
            >
              <textarea
                value={description}
                onChange={(e) =>
                  setDescription(e.target.value.slice(0, DESCRIPTION_MAX))
                }
                placeholder="Please enter description...."
                rows={3}
                className="w-full resize-none rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#6B1D1D] focus:outline-none focus:ring-1 focus:ring-[#6B1D1D]"
              />
            </Field>
          </div>
        </div>

        {/* File Upload */}
        <div className="mt-6">
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Attach photo(s) or PDF{" "}
            <span className="text-red-500">*</span>
          </label>
          <div
            role="button"
            tabIndex={0}
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ")
                fileInputRef.current?.click()
            }}
            onDragOver={(e) => {
              e.preventDefault()
              setDragOver(true)
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault()
              setDragOver(false)
              if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files)
            }}
            className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-12 transition-colors ${
              dragOver
                ? "border-[#6B1D1D] bg-[#6B1D1D]/5"
                : errors.files
                  ? "border-red-300 bg-red-50/50"
                  : "border-gray-200 bg-gray-50 hover:border-gray-300"
            }`}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
              <Upload className="h-5 w-5 text-gray-500" />
            </div>
            <p className="mt-3 text-sm font-medium text-gray-700">
              Click or drag files here
            </p>
            <p className="mt-1 text-xs text-gray-400">
              PDF, JPG, PNG iki 10MB
            </p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.length) addFiles(e.target.files)
                e.target.value = ""
              }}
            />
          </div>
          {errors.files && (
            <p className="mt-1.5 text-xs text-red-500">{errors.files}</p>
          )}

          {/* Attached files list */}
          {files.length > 0 && (
            <div className="mt-3 space-y-2">
              {files.map((f) => (
                <div
                  key={f.id}
                  className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-3 py-2"
                >
                  {f.file.type === "application/pdf" ? (
                    <FileText className="h-4 w-4 shrink-0 text-red-500" />
                  ) : (
                    <Image className="h-4 w-4 shrink-0 text-blue-500" />
                  )}
                  <span className="min-w-0 flex-1 truncate text-sm text-gray-700">
                    {f.file.name}
                  </span>
                  <span className="shrink-0 text-xs text-gray-400">
                    {(f.file.size / 1024).toFixed(0)} KB
                  </span>
                  <button
                    type="button"
                    onClick={() => removeFile(f.id)}
                    className="shrink-0 rounded p-0.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Error message */}
        {errors.submit && (
          <p className="mt-3 text-sm text-red-600">{errors.submit}</p>
        )}

        {/* Submit */}
        <Button
          type="submit"
          disabled={submitting}
          className="mt-6 w-full bg-[#6B1D1D] py-3 text-white shadow-sm hover:bg-[#5a1818]"
        >
          {submitting ? (
            <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
          ) : (
            <Plus className="mr-1.5 h-4 w-4" />
          )}
          {submitting ? "Submitting..." : "Register Defect"}
        </Button>
      </form>
    </div>
  )
}

function Field({
  label,
  required,
  counter,
  error,
  children,
}: {
  label: string
  required?: boolean
  counter?: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="mb-1.5 flex items-baseline gap-1 text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500">*</span>}
        {counter && (
          <span className="ml-auto text-xs font-normal text-gray-400">
            {counter}
          </span>
        )}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
}

function Select({
  value,
  onChange,
  placeholder,
  options,
  disabled,
  loading,
}: {
  value: string
  onChange: (v: string) => void
  placeholder: string
  options: { value: string; label: string }[]
  disabled?: boolean
  loading?: boolean
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled || loading}
        className={`w-full appearance-none rounded-lg border border-gray-200 bg-white py-2.5 pr-8 pl-3.5 text-sm focus:border-[#6B1D1D] focus:outline-none focus:ring-1 focus:ring-[#6B1D1D] disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400 ${
          value ? "text-gray-900" : "text-gray-400"
        }`}
      >
        <option value="" disabled>
          {loading ? "Loading..." : placeholder}
        </option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <svg
        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 9l-7 7-7-7"
        />
      </svg>
    </div>
  )
}
