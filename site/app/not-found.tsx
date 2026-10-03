import Link from "next/link"

import { Button } from "@/components/ui/button"
import { SiteHeader } from "@/site/ui/site-header"
import { ThemeProvider } from "@/site/ui/theme-provider"
import { PageHeader } from "@/site/ui/page-header"

/** A path the site does not have: the header, a sentence, a way back. */
export default function NotFound() {
  return (
    <ThemeProvider>
      <SiteHeader />
      <main
        id="main"
        className="mx-auto flex max-w-3xl flex-col gap-6 px-page py-16"
      >
        <PageHeader
          title="Page not found"
          lead="This address matches no page of the documentation. The component, pattern or foundation may have another name."
        />
        <div className="flex flex-wrap gap-2">
          <Button asChild>
            <Link href="/components/">Browse the components</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/">Go to the overview</Link>
          </Button>
        </div>
      </main>
    </ThemeProvider>
  )
}
