# Navigation

## Metadata

| Field | Value      |
| ----- | ---------- |
| Name  | navigation |
| Kind  | UI         |

## Role

Frames every page of an application in the same shell, and tells the person where they are and where they can go next.

## Usage

- **MUST** — put the application's sections in a `Sidebar`, the current one marked with `isActive`; below `md` it opens as a `Sheet` from `SidebarTrigger`
- **MUST** — show a `Breadcrumb` above the page title once a page sits 3 levels deep or more; its last item is the current page, in `BreadcrumbPage`
- **MUST** — switch between views of the same object with `Tabs` (at most 7); separate pages are links, never tabs
- **MUST** — split a collection of more than 50 entries into pages with `Pagination` below it, or load more on demand
- **MUST** — give each page one `Heading` `level={1}`, and put the page's primary action beside it
- **MUST** — keep one page container for every page, so the content does not jump from one page to the next

## Structure

| Region      | Content                                            | Components                                            |
| ----------- | -------------------------------------------------- | ----------------------------------------------------- |
| Shell       | The sidebar and the page beside it                 | `SidebarProvider`, `Sidebar`, `SidebarInset`          |
| Sections    | The application's sections, the current one active | `SidebarMenu`, `SidebarMenuItem`, `SidebarMenuButton` |
| Top bar     | The sidebar toggle and the breadcrumb              | `SidebarTrigger`, `Breadcrumb`                        |
| Page header | The page title and its primary action              | `Heading`, `Button`                                   |
| Views       | Sibling views of the same object                   | `Tabs`                                                |
| Content     | The page itself                                    | —                                                     |
| Pages       | The pages of a long collection                     | `Pagination`                                          |

## Components

| Component           | Variant / props                                              | Job                            |
| ------------------- | ------------------------------------------------------------ | ------------------------------ |
| `SidebarMenuButton` | `asChild` around a `Link`, `isActive` on the current section | One section of the application |
| `SidebarInset`      | —                                                            | The page next to the sidebar   |
| `SidebarTrigger`    | —                                                            | Opens and closes the sidebar   |
| `Breadcrumb`        | from 3 levels deep                                           | Where the page sits            |
| `Tabs`              | at most 7 `TabsTrigger`s                                     | Views of the same object       |
| `Pagination`        | below the collection                                         | The pages of a long collection |

## Spacing

- **MUST** — wrap the page content in `mx-auto flex w-full max-w-5xl flex-col gap-section px-page py-section` (`space.layout.content-default`, `page-padding`, `section-gap`); a dashboard widens it to `max-w-7xl` (`content-lg`), an article narrows it to `max-w-2xl` (`content-sm`)
- **MUST** — apply `px-page` once, on the page container, never on each section
- **MUST** — lay the page header out as `flex flex-wrap items-center justify-between gap-4`, so the action wraps under the title on a narrow screen

## Content

| Element        | Write                                         | Not                             |
| -------------- | --------------------------------------------- | ------------------------------- |
| Section        | `Projects` · `Invoices` (a noun)              | `Manage projects`, `My Stuff`   |
| Page title     | The section or the object's name              | `Welcome to the projects page!` |
| Sidebar toggle | `Show or hide the sidebar` (its default name) | `Toggle Sidebar`                |

## Code example

```tsx
import Link from "next/link"
import { FolderIcon, GearIcon, PlusIcon } from "@phosphor-icons/react"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Heading } from "@/components/ui/heading"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

export default function ProjectsLayout() {
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarContent>
          <SidebarGroup>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive>
                  <Link href="/projects">
                    <FolderIcon />
                    Projects
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/settings">
                    <GearIcon />
                    Settings
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <SidebarInset className="bg-background text-foreground">
        <div className="flex items-center gap-2 px-page py-4">
          <SidebarTrigger />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/workspace">Workspace</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Projects</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <main className="mx-auto flex w-full max-w-5xl flex-col gap-section px-page py-section">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Heading level={1}>Projects</Heading>
            <Button>
              <PlusIcon />
              Create project
            </Button>
          </div>
          {/* The page content */}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
```

## Cross-references

- [settings](./settings.md) — a page that splits its sections with `Tabs` or a `Sidebar` group
- [filter](./filter.md), [search](./search.md) — what sits above a paginated collection
- [spacing](../foundations/spacing.md) — the `space.layout.*` tokens of the page container
- [`Sidebar`](../components/Sidebar.md), [`Breadcrumb`](../components/Breadcrumb.md), [`Tabs`](../components/Tabs.md), [`Pagination`](../components/Pagination.md), [`NavigationMenu`](../components/NavigationMenu.md) — the component specs
