/** A category as the anchor of its section on the Components index: `Forms` → `forms`. */
export function categoryId(category: string): string {
  return category.toLowerCase().replace(/[^a-z0-9]+/g, "-")
}
