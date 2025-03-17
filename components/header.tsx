import Image from "next/image"
import Link from "next/link"

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="container flex h-14 items-center ml-4">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="Wire Van Logo"
            width={120}
            height={120}
            priority
          />
          <span className="font-semibold">Wire Van 3D Model</span>
        </Link>
        <nav className="ml-auto flex items-center gap-4">
          {/* Add your navigation items here */}
        </nav>
      </div>
    </header>
  )
}