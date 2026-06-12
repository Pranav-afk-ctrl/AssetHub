import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

export interface OverdueRecord {
  assetName: string
  borrower: string
  quantity: number
  dueDate: string
  daysOverdue: number
}

export interface OverdueTableProps {
  data?: OverdueRecord[]
}

const defaultData: OverdueRecord[] = [
  { assetName: "Canon EOS R5", borrower: "Maya Chen", quantity: 1, dueDate: "2026-05-28", daysOverdue: 15 },
  { assetName: "MacBook Pro 16”", borrower: "Liam Patel", quantity: 2, dueDate: "2026-05-30", daysOverdue: 13 },
  { assetName: "DJI Mavic 3", borrower: "Sofia Rossi", quantity: 1, dueDate: "2026-06-02", daysOverdue: 10 },
  { assetName: "Projector X900", borrower: "Noah Kim", quantity: 1, dueDate: "2026-06-05", daysOverdue: 7 },
  { assetName: "iPad Pro 12.9”", borrower: "Ava Johnson", quantity: 3, dueDate: "2026-06-08", daysOverdue: 4 },
  { assetName: "Studio Light Kit", borrower: "Ethan Brown", quantity: 1, dueDate: "2026-06-10", daysOverdue: 2 },
]

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

export function OverdueTable({ data = defaultData }: OverdueTableProps) {
  const rows = [...data].sort((a, b) => b.daysOverdue - a.daysOverdue)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Overdue Returns</CardTitle>
        <CardDescription>Bookings past their due date, most overdue first</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Asset Name</TableHead>
              <TableHead>Borrower</TableHead>
              <TableHead className="text-right">Quantity</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead className="text-right">Days Overdue</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, i) => (
              <TableRow key={`${row.assetName}-${i}`}>
                <TableCell className="font-medium">{row.assetName}</TableCell>
                <TableCell className="text-muted-foreground">{row.borrower}</TableCell>
                <TableCell className="text-right tabular-nums">{row.quantity}</TableCell>
                <TableCell className="text-muted-foreground">{formatDate(row.dueDate)}</TableCell>
                <TableCell className={cn("text-right font-semibold tabular-nums text-status-red")}>
                  {row.daysOverdue} {row.daysOverdue === 1 ? "day" : "days"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
