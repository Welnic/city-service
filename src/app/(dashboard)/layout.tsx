import { Sidebar } from "@/components/layout/sidebar"
import { Providers } from "@/app/providers"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Providers>
      <div className="flex h-screen">
        <Sidebar />
        <main className="flex-1 overflow-auto bg-white p-8">{children}</main>
      </div>
    </Providers>
  )
}
