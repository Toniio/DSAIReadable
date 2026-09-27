import Link from "next/link"

export default function LoginIndexPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-8 p-8">
      <h1 className="font-heading text-xl font-semibold">
        Login — 3 déclinaisons
      </h1>
      <nav className="flex flex-col gap-4 text-sm">
        <Link
          href="/login/split-screen"
          className="underline underline-offset-4 hover:text-primary"
        >
          1. Split-screen
        </Link>
        <Link
          href="/login/centered"
          className="underline underline-offset-4 hover:text-primary"
        >
          2. Centré (Card)
        </Link>
        <Link
          href="/login/fullscreen"
          className="underline underline-offset-4 hover:text-primary"
        >
          3. Full-screen
        </Link>
        <Link
          href="/login/secure"
          className="underline underline-offset-4 hover:text-primary"
        >
          4. Secure (dark + dots)
        </Link>
      </nav>
    </div>
  )
}
