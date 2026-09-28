"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Heading } from "@/components/ui/heading"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const accounts = [
  {
    id: "checking",
    label: "Checking account",
    number: "•••• 4821",
    balance: 12_847.32,
    currency: "$",
  },
  {
    id: "savings",
    label: "Savings account",
    number: "•••• 9103",
    balance: 34_520.0,
    currency: "$",
  },
  {
    id: "investment",
    label: "Brokerage account",
    number: "•••• 6754",
    balance: 8_312.45,
    currency: "$",
    trend: "+3.2%",
  },
]

const transactions = [
  {
    id: "t1",
    label: "Corner Grocery",
    category: "Groceries",
    date: "May 10",
    amount: -67.42,
    status: "completed",
  },
  {
    id: "t2",
    label: "Direct deposit — Salary",
    category: "Income",
    date: "May 5",
    amount: 3_240.0,
    status: "completed",
  },
  {
    id: "t3",
    label: "Netflix",
    category: "Subscriptions",
    date: "May 3",
    amount: -17.99,
    status: "completed",
  },
  {
    id: "t4",
    label: "Metro Electric",
    category: "Utilities",
    date: "May 2",
    amount: -89.0,
    status: "pending",
  },
  {
    id: "t5",
    label: "Transfer → Savings",
    category: "Savings",
    date: "May 1",
    amount: -500.0,
    status: "completed",
  },
]

const budgets = [
  { label: "Groceries", spent: 320, limit: 450, color: "bg-chart-1" },
  { label: "Transportation", spent: 85, limit: 120, color: "bg-chart-2" },
  { label: "Entertainment", spent: 190, limit: 200, color: "bg-chart-3" },
  { label: "Subscriptions", spent: 62, limit: 80, color: "bg-chart-4" },
]

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}

export default function BankingHomePage() {
  return (
    <div className="mx-auto flex min-h-svh max-w-6xl flex-col gap-6 p-6">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <span className="text-sm font-semibold">B</span>
          </div>
          <Heading level={3} className="text-foreground">
            BankApp
          </Heading>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm">
            Notifications
          </Button>
          <Separator orientation="vertical" className="h-5" />
          <Avatar size="default">
            <AvatarImage src="" alt="Anthony B." />
            <AvatarFallback>AB</AvatarFallback>
          </Avatar>
        </div>
      </header>

      <Separator />

      {/* Welcome */}
      <section className="flex flex-col gap-1">
        <Heading level={1}>Hello, Anthony</Heading>
        <p className="text-sm text-muted-foreground">
          Here is a summary of your accounts as of May 10, 2026.
        </p>
      </section>

      {/* Account Cards */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {accounts.map((account) => (
          <Card key={account.id}>
            <CardHeader>
              <CardDescription>{account.label}</CardDescription>
              <CardTitle className="text-lg tabular-nums">
                {formatCurrency(account.balance)}
              </CardTitle>
              {account.trend && (
                <CardAction>
                  <Badge variant="secondary">{account.trend}</Badge>
                </CardAction>
              )}
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">{account.number}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* Quick Actions */}
      <section className="flex flex-wrap gap-2">
        <Button variant="default" size="sm">
          Transfer
        </Button>
        <Button variant="outline" size="sm">
          Pay
        </Button>
        <Button variant="outline" size="sm">
          Account details
        </Button>
        <Button variant="ghost" size="sm">
          Limits
        </Button>
      </section>

      <Separator />

      {/* Tabs: Transactions / Budget */}
      <Tabs defaultValue="transactions" className="flex flex-col gap-4">
        <TabsList variant="line">
          <TabsTrigger value="transactions">Recent transactions</TabsTrigger>
          <TabsTrigger value="budget">Monthly budget</TabsTrigger>
        </TabsList>

        {/* Transactions Tab */}
        <TabsContent value="transactions">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transaction</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell className="font-medium">{tx.label}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {tx.category}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {tx.date}
                      </TableCell>
                      <TableCell className="text-right text-foreground tabular-nums">
                        {tx.amount > 0 ? "+" : ""}
                        {formatCurrency(tx.amount)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            tx.status === "completed" ? "secondary" : "outline"
                          }
                        >
                          {tx.status === "completed" ? "Completed" : "Pending"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Budget Tab */}
        <TabsContent value="budget">
          <div className="grid gap-4 sm:grid-cols-2">
            {budgets.map((budget) => (
              <Card key={budget.label} size="sm">
                <CardHeader>
                  <CardTitle>{budget.label}</CardTitle>
                  <CardAction>
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {formatCurrency(budget.spent)} /{" "}
                      {formatCurrency(budget.limit)}
                    </span>
                  </CardAction>
                </CardHeader>
                <CardContent>
                  <Progress
                    value={Math.round((budget.spent / budget.limit) * 100)}
                    className={`h-2 [&>*]:${budget.color}`}
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    {Math.round(
                      ((budget.limit - budget.spent) / budget.limit) * 100
                    )}
                    % left
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Footer */}
      <footer className="mt-auto pt-4">
        <Separator />
        <p className="pt-4 text-center text-xs text-muted-foreground">
          © 2026 BankApp — Simulated data for demonstration purposes.
        </p>
      </footer>
    </div>
  )
}
