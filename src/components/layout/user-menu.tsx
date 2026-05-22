import Link from "next/link"

interface UserMenuProps {
  name: string
  role: string
  initials: string
}

export function UserMenu({ name, role, initials }: UserMenuProps) {
  return (
    <Link
      href="/profile"
      className="flex items-center gap-3 rounded-lg px-3 py-3 transition-colors hover:bg-gray-100"
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#6B1D1D] text-xs font-medium text-white">
        {initials}
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-gray-900">{name}</p>
        <p className="truncate text-xs text-gray-500">{role}</p>
      </div>
    </Link>
  )
}
