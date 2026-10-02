// fails: axe, lint:inline-svg, lint:native-elements, lint:off-system-classes
// A sign-in screen built by hand: native controls, an inline icon, a raw color
// and fields with no name. It navigates with next/navigation's useRouter,
// which stage B renders: it fails nothing for that.
"use client"

import { useRouter } from "next/navigation"

export default function SignIn() {
  const router = useRouter()
  return (
    <main className="flex min-h-screen items-center justify-center">
      <form
        className="flex flex-col gap-4 bg-[#ffffff]"
        onSubmit={(event) => {
          event.preventDefault()
          router.push("/")
        }}
      >
        <svg viewBox="0 0 16 16" className="size-4">
          <circle cx="8" cy="8" r="8" />
        </svg>
        <input type="email" placeholder="Email" />
        <input type="password" placeholder="Password" />
        <button type="submit">Sign in</button>
      </form>
    </main>
  )
}
