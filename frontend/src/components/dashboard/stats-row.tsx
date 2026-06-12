import { Card, CardContent } from "@/components/ui/card"
import { Package, CalendarCheck, Clock, TriangleAlert, TrendingUp, TrendingDown } from "lucide-react"
import { cn } from "@/lib/utils"

export interface StatItem {
  label: string
  value: number
  trend: number
}

export interface StatsRowProps {
  totalAssets?: StatItem
  activeBookings?: StatItem
  pendingApprovals?: StatItem
  overdueReturns?: StatItem
}

const defaults: Required<StatsRowProps> = {
  totalAssets: { label: "Total Assets", value: 1284, trend: 4.2 },
  activeBookings: { label: "Active Bookings", value: 342, trend: 8.1 },
  pendingApprovals: { label: "Pending Approvals", value: 27, trend: -3.4 },
  overdueReturns: { label: "Overdue Returns", value: 14, trend: 12.5 },
}

type Accent = "blue" | "green" | "yellow" | "red"

const accentMap: Record<
  Accent,
  { icon: typeof Package; text: string; bg: string }
> = {
  blue: { icon: Package, text: "text-status-blue", bg: "bg-status-blue/10" },
  green: { icon: CalendarCheck, text: "text-status-green", bg: "bg-status-green/10" },
  yellow: { icon: Clock, text: "text-status-yellow", bg: "bg-status-yellow/10" },
  red: { icon: TriangleAlert, text: "text-status-red", bg: "bg-status-red/10" },
}

function StatCard({ stat, accent, invertTrend }: { stat: StatItem; accent: Accent; invertTrend?: boolean }) {
  const { icon: Icon, text, bg } = accentMap[accent]
  const up = stat.trend >= 0
  // For "bad" metrics (overdue/pending), a rise is negative.
  const positive = invertTrend ? !up : up
  const TrendIcon = up ? TrendingUp : TrendingDown

  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-4 p-6">
        <div className="flex flex-col gap-2">
          <span className="text-sm text-muted-foreground">{stat.label}</span>
          <span className="text-3xl font-semibold tracking-tight tabular-nums">
            {stat.value.toLocaleString()}
          </span>
          <span
            className={cn(
              "flex items-center gap-1 text-xs font-medium",
              positive ? "text-status-green" : "text-status-red",
            )}
          >
            <TrendIcon className="size-3.5" aria-hidden="true" />
            {Math.abs(stat.trend)}%
            <span className="text-muted-foreground font-normal">vs last month</span>
          </span>
        </div>
        <div className={cn("flex size-11 shrink-0 items-center justify-center rounded-lg", bg)}>
          <Icon className={cn("size-5", text)} aria-hidden="true" />
        </div>
      </CardContent>
    </Card>
  )
}

export function StatsRow(props: StatsRowProps) {
  const data = { ...defaults, ...props }
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard stat={data.totalAssets} accent="blue" />
      <StatCard stat={data.activeBookings} accent="green" />
      <StatCard stat={data.pendingApprovals} accent="yellow" invertTrend />
      <StatCard stat={data.overdueReturns} accent="red" invertTrend />
    </div>
  )
}
