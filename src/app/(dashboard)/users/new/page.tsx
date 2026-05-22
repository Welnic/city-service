"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Mail, ChevronDown, ArrowLeft, Check } from "lucide-react"

const userTypes = ["Facility Owner", "Property Manager", "Technical Engineer", "Maintenance Technician", "Inspector", "Clerk", "System Administrator"]
const objectOptions = [
  { id: "obj-001", label: "BLD-A – Main Office" },
  { id: "obj-002", label: "BLD-B – Residential Block" },
  { id: "obj-003", label: "BLD-C – Warehouse" },
]

export default function CreateUserPage() {
  const router = useRouter()

  const [userType, setUserType] = useState("")
  const [objectId, setObjectId] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [username, setUsername] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showUserTypeDropdown, setShowUserTypeDropdown] = useState(false)
  const [showObjectDropdown, setShowObjectDropdown] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  function validate() {
    const errs: Record<string, string> = {}
    if (!userType) errs.userType = "User type is required"
    if (!objectId) errs.objectId = "Object is required"
    if (!firstName.trim()) errs.firstName = "First name is required"
    if (!lastName.trim()) errs.lastName = "Last name is required"
    if (!phone.trim()) errs.phone = "Mobile phone is required"
    if (!email.trim()) errs.email = "Email is required"
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = "Invalid email"
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    setSubmitting(true)
    await new Promise((r) => setTimeout(r, 1000))
    setSubmitting(false)
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
          <Check className="h-7 w-7 text-emerald-600" />
        </div>
        <h2 className="mt-4 text-lg font-semibold text-gray-900">Invitation sent</h2>
        <p className="mt-1 text-sm text-gray-500">
          An invitation has been sent to {email}
        </p>
        <div className="mt-6 flex gap-3">
          <button
            onClick={() => {
              setSubmitted(false)
              setFirstName("")
              setLastName("")
              setUsername("")
              setPhone("")
              setEmail("")
              setPassword("")
              setUserType("")
              setObjectId("")
            }}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Add another
          </button>
          <button
            onClick={() => router.push("/users")}
            className="rounded-lg bg-[#6B1D1D] px-4 py-2 text-sm font-medium text-white hover:bg-[#5a1818]"
          >
            Back to Users
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/users"
          className="mb-3 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Users
        </Link>
        <h1 className="text-2xl font-semibold text-gray-900">Create User</h1>
        <p className="mt-1 text-sm text-gray-500">
          Fill out the form to create a new user and send invitation
        </p>
      </div>

      <div className="mx-auto max-w-2xl">
        <form onSubmit={handleSubmit} className="rounded-xl border border-gray-200 bg-white p-8 space-y-6">
          {/* User Type + Object */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                User Type <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowUserTypeDropdown((v) => !v)}
                  className={`flex h-10 w-full items-center justify-between rounded-lg border px-3 text-sm transition-colors ${
                    errors.userType
                      ? "border-red-300 bg-red-50/50"
                      : "border-gray-200 bg-white hover:bg-gray-50"
                  } ${userType ? "text-gray-900" : "text-gray-400"}`}
                >
                  {userType || "Select user type"}
                  <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${showUserTypeDropdown ? "rotate-180" : ""}`} />
                </button>
                {showUserTypeDropdown && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowUserTypeDropdown(false)} />
                    <div className="absolute left-0 top-full z-20 mt-1 w-full rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                      {userTypes.map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => { setUserType(t); setShowUserTypeDropdown(false); setErrors((e) => { const { userType: _, ...rest } = e; return rest }) }}
                          className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 ${userType === t ? "font-medium text-[#6B1D1D]" : "text-gray-600"}`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
              {errors.userType && <p className="mt-1 text-xs text-red-500">{errors.userType}</p>}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Object <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowObjectDropdown((v) => !v)}
                  className={`flex h-10 w-full items-center justify-between rounded-lg border px-3 text-sm transition-colors ${
                    errors.objectId
                      ? "border-red-300 bg-red-50/50"
                      : "border-gray-200 bg-white hover:bg-gray-50"
                  } ${objectId ? "text-gray-900" : "text-gray-400"}`}
                >
                  {objectOptions.find((o) => o.id === objectId)?.label || "Select object"}
                  <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${showObjectDropdown ? "rotate-180" : ""}`} />
                </button>
                {showObjectDropdown && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowObjectDropdown(false)} />
                    <div className="absolute left-0 top-full z-20 mt-1 w-full rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                      {objectOptions.map((o) => (
                        <button
                          key={o.id}
                          type="button"
                          onClick={() => { setObjectId(o.id); setShowObjectDropdown(false); setErrors((e) => { const { objectId: _, ...rest } = e; return rest }) }}
                          className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 ${objectId === o.id ? "font-medium text-[#6B1D1D]" : "text-gray-600"}`}
                        >
                          {o.label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
              {errors.objectId && <p className="mt-1 text-xs text-red-500">{errors.objectId}</p>}
            </div>
          </div>

          {/* First Name + Last Name */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => { setFirstName(e.target.value); setErrors((er) => { const { firstName: _, ...rest } = er; return rest }) }}
                placeholder="First name"
                className={`h-10 w-full rounded-lg border px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 ${
                  errors.firstName ? "border-red-300 focus:border-red-500 focus:ring-red-500" : "border-gray-200 focus:border-[#6B1D1D] focus:ring-[#6B1D1D]"
                }`}
              />
              {errors.firstName && <p className="mt-1 text-xs text-red-500">{errors.firstName}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => { setLastName(e.target.value); setErrors((er) => { const { lastName: _, ...rest } = er; return rest }) }}
                placeholder="Last name"
                className={`h-10 w-full rounded-lg border px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 ${
                  errors.lastName ? "border-red-300 focus:border-red-500 focus:ring-red-500" : "border-gray-200 focus:border-[#6B1D1D] focus:ring-[#6B1D1D]"
                }`}
              />
              {errors.lastName && <p className="mt-1 text-xs text-red-500">{errors.lastName}</p>}
            </div>
          </div>

          {/* Username */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#6B1D1D] focus:outline-none focus:ring-1 focus:ring-[#6B1D1D]"
            />
          </div>

          {/* Mobile Phone + Email */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Mobile Phone <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => { setPhone(e.target.value); setErrors((er) => { const { phone: _, ...rest } = er; return rest }) }}
                placeholder="Mobile phone"
                className={`h-10 w-full rounded-lg border px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 ${
                  errors.phone ? "border-red-300 focus:border-red-500 focus:ring-red-500" : "border-gray-200 focus:border-[#6B1D1D] focus:ring-[#6B1D1D]"
                }`}
              />
              {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setErrors((er) => { const { email: _, ...rest } = er; return rest }) }}
                placeholder="Email"
                className={`h-10 w-full rounded-lg border px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 ${
                  errors.email ? "border-red-300 focus:border-red-500 focus:ring-red-500" : "border-gray-200 focus:border-[#6B1D1D] focus:ring-[#6B1D1D]"
                }`}
              />
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#6B1D1D] focus:outline-none focus:ring-1 focus:ring-[#6B1D1D]"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#6B1D1D] text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-[#5a1818] disabled:opacity-50"
          >
            <Mail className="h-4 w-4" />
            {submitting ? "Sending..." : "Send Invitation"}
          </button>
        </form>
      </div>
    </div>
  )
}
