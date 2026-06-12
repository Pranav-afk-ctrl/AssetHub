import { StatsRow, type StatsRowProps } from "@/components/dashboard/stats-row"
import { TopAssetsChart, type TopAssetsChartProps } from "@/components/dashboard/top-assets-chart"
import { BookingStatusPie, type BookingStatusPieProps } from "@/components/dashboard/booking-status-pie"
import { BookingTrendLine, type BookingTrendLineProps } from "@/components/dashboard/booking-trend-line"
import { OverdueTable, type OverdueTableProps } from "@/components/dashboard/overdue-table"

export interface AdminDashboardProps {
  stats?: StatsRowProps
  topAssets?: TopAssetsChartProps["data"]
  bookingStatus?: BookingStatusPieProps["data"]
  bookingTrend?: BookingTrendLineProps["data"]
  overdue?: OverdueTableProps["data"]
}

export function AdminDashboard({
  stats,
  topAssets,
  bookingStatus,
  bookingTrend,
  overdue,
}: AdminDashboardProps) {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight text-balance">Analytics Dashboard</h1>
        <p className="text-sm text-muted-foreground">Asset management overview and booking insights</p>
      </header>

      <StatsRow {...stats} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <TopAssetsChart data={topAssets} />
        <BookingStatusPie data={bookingStatus} />
        <BookingTrendLine data={bookingTrend} />
      </div>

      <OverdueTable data={overdue} />
    </div>
  )
}

export default AdminDashboard
