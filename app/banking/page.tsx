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
    label: "Compte courant",
    number: "•••• 4821",
    balance: 12_847.32,
    currency: "€",
  },
  {
    id: "savings",
    label: "Livret A",
    number: "•••• 9103",
    balance: 34_520.0,
    currency: "€",
  },
  {
    id: "investment",
    label: "PEA",
    number: "•••• 6754",
    balance: 8_312.45,
    currency: "€",
    trend: "+3.2%",
  },
]

const transactions = [
  {
    id: "t1",
    label: "Carrefour Market",
    category: "Courses",
    date: "10 mai",
    amount: -67.42,
    status: "completed",
  },
  {
    id: "t2",
    label: "Virement — Salaire",
    category: "Revenus",
    date: "5 mai",
    amount: 3_240.0,
    status: "completed",
  },
  {
    id: "t3",
    label: "Netflix",
    category: "Abonnements",
    date: "3 mai",
    amount: -17.99,
    status: "completed",
  },
  {
    id: "t4",
    label: "EDF Électricité",
    category: "Énergie",
    date: "2 mai",
    amount: -89.0,
    status: "pending",
  },
  {
    id: "t5",
    label: "Transfert → Livret A",
    category: "Épargne",
    date: "1 mai",
    amount: -500.0,
    status: "completed",
  },
]

const budgets = [
  { label: "Courses", spent: 320, limit: 450, color: "bg-chart-1" },
  { label: "Transports", spent: 85, limit: 120, color: "bg-chart-2" },
  { label: "Loisirs", spent: 190, limit: 200, color: "bg-chart-3" },
  { label: "Abonnements", spent: 62, limit: 80, color: "bg-chart-4" },
]

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
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
        <Heading level={1}>Bonjour, Anthony</Heading>
        <p className="text-sm text-muted-foreground">
          Voici le résumé de vos comptes au 10 mai 2026.
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
          Virement
        </Button>
        <Button variant="outline" size="sm">
          Paiement
        </Button>
        <Button variant="outline" size="sm">
          RIB
        </Button>
        <Button variant="ghost" size="sm">
          Plafonds
        </Button>
      </section>

      <Separator />

      {/* Tabs: Transactions / Budget */}
      <Tabs defaultValue="transactions" className="flex flex-col gap-4">
        <TabsList variant="line">
          <TabsTrigger value="transactions">Transactions récentes</TabsTrigger>
          <TabsTrigger value="budget">Budget mensuel</TabsTrigger>
        </TabsList>

        {/* Transactions Tab */}
        <TabsContent value="transactions">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Opération</TableHead>
                    <TableHead>Catégorie</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Montant</TableHead>
                    <TableHead>Statut</TableHead>
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
                          {tx.status === "completed" ? "Effectué" : "En cours"}
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
                    % restant
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
          © 2026 BankApp — Données simulées à des fins de démonstration.
        </p>
      </footer>
    </div>
  )
}
