"use client"

import { useState } from "react"
import { Save, LogOut } from "lucide-react"

const tabs = ["My Objects", "Settings", "Security"] as const
type Tab = (typeof tabs)[number]

const mockObjects = [
  { id: "obj-001", code: "BLD-A", name: "Main Office", address: "Gedimino pr. 1, Vilnius", role: "Owner" },
  { id: "obj-002", code: "BLD-B", name: "Residential Block", address: "Konstitucijos pr. 12, Vilnius", role: "Manager" },
  { id: "obj-003", code: "BLD-C", name: "Warehouse", address: "Ozo g. 25, Vilnius", role: "Owner" },
]

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<Tab>("Settings")

  const [firstName, setFirstName] = useState("Almantas")
  const [lastName, setLastName] = useState("Jucius")
  const [userRole] = useState("Facility Owner")
  const [phone, setPhone] = useState("+37062010116")
  const [email, setEmail] = useState("almantas.jucius@swim.lt")

  const [monthlySummary, setMonthlySummary] = useState(true)
  const [defectUpdates, setDefectUpdates] = useState(true)
  const [phoneNotifications, setPhoneNotifications] = useState(false)
  const [emailNotifications, setEmailNotifications] = useState(true)

  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleSave() {
    setSaving(true)
    await new Promise((r) => setTimeout(r, 800))
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">My Profile</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your account settings and objects
        </p>
      </div>

      {/* Profile Card */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="flex items-center gap-5">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#6B1D1D] text-xl font-semibold text-white">
            AJ
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {firstName} {lastName}
            </h2>
            <p className="text-sm text-gray-500">{userRole}</p>
            <p className="text-sm text-gray-400">{email}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-6 flex items-center justify-between border-b border-gray-200">
          <div className="flex gap-1">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative px-4 py-2.5 text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? "text-[#6B1D1D]"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-[#6B1D1D]" />
                )}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-red-600 transition-colors">
            <LogOut className="h-3.5 w-3.5" />
            Logout
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "Settings" && (
        <div className="space-y-6">
          {/* Personal Information */}
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h3 className="text-sm font-semibold text-gray-900">Personal Information</h3>
            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-500">First Name</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm text-gray-900 focus:border-[#6B1D1D] focus:outline-none focus:ring-1 focus:ring-[#6B1D1D]"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-500">Last Name</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm text-gray-900 focus:border-[#6B1D1D] focus:outline-none focus:ring-1 focus:ring-[#6B1D1D]"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-500">User Role</label>
                  <input
                    type="text"
                    value={userRole}
                    disabled
                    className="h-10 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm text-gray-500"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-500">Mobile Phone</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm text-gray-900 focus:border-[#6B1D1D] focus:outline-none focus:ring-1 focus:ring-[#6B1D1D]"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-500">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm text-gray-900 focus:border-[#6B1D1D] focus:outline-none focus:ring-1 focus:ring-[#6B1D1D]"
                />
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h3 className="text-sm font-semibold text-gray-900">Notification Settings</h3>

            <div className="mt-4 space-y-5">
              <div>
                <p className="text-xs font-medium text-gray-500">
                  Select which notifications you want to receive:
                </p>
                <div className="mt-3 space-y-2.5">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={monthlySummary}
                      onChange={(e) => setMonthlySummary(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-[#6B1D1D] focus:ring-[#6B1D1D]"
                    />
                    <span className="text-sm text-gray-700">Monthly summary</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={defectUpdates}
                      onChange={(e) => setDefectUpdates(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-[#6B1D1D] focus:ring-[#6B1D1D]"
                    />
                    <span className="text-sm text-gray-700">Defect status updates</span>
                  </label>
                </div>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-500">
                  Select how you want to receive notifications:
                </p>
                <div className="mt-3 space-y-2.5">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={phoneNotifications}
                      onChange={(e) => setPhoneNotifications(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-[#6B1D1D] focus:ring-[#6B1D1D]"
                    />
                    <span className="text-sm text-gray-700">Phone notifications</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={emailNotifications}
                      onChange={(e) => setEmailNotifications(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-[#6B1D1D] focus:ring-[#6B1D1D]"
                    />
                    <span className="text-sm text-gray-700">By email</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Save */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#6B1D1D] text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-[#5a1818] disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
          </button>
        </div>
      )}

      {activeTab === "My Objects" && (
        <div className="rounded-xl border border-gray-200 bg-white">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Object</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Address</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {mockObjects.map((obj) => (
                <tr key={obj.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3.5">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{obj.code} – {obj.name}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-sm text-gray-600">{obj.address}</td>
                  <td className="px-4 py-3.5">
                    <span className="inline-flex items-center rounded-full bg-[#6B1D1D]/10 px-2.5 py-1 text-xs font-medium text-[#6B1D1D]">
                      {obj.role}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "Security" && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
          <h3 className="text-sm font-semibold text-gray-900">Change Password</h3>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-500">Current Password</label>
            <input
              type="password"
              placeholder="Enter current password"
              className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#6B1D1D] focus:outline-none focus:ring-1 focus:ring-[#6B1D1D]"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-500">New Password</label>
              <input
                type="password"
                placeholder="Enter new password"
                className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#6B1D1D] focus:outline-none focus:ring-1 focus:ring-[#6B1D1D]"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-500">Confirm Password</label>
              <input
                type="password"
                placeholder="Confirm new password"
                className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#6B1D1D] focus:outline-none focus:ring-1 focus:ring-[#6B1D1D]"
              />
            </div>
          </div>
          <button className="rounded-lg bg-[#6B1D1D] px-4 py-2 text-sm font-medium text-white hover:bg-[#5a1818]">
            Update Password
          </button>
        </div>
      )}
    </div>
  )
}
