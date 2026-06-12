"use client"

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"

export interface TrendPoint {
  date: string
  bookings: number
}

export interface BookingTrendLineProps {
  data?: TrendPoint[]
}

function generateDefaultData(): TrendPoint[] {
  const points: TrendPoint[] = []
  const today = new Date()
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    const base = 12 + Math.sin(i / 3) * 5
    const value = Math.max(0, Math.round(base + (i % 5) - 2))
    points.push({
      date: d.toISOString().slice(0, 10),
      bookings: value,
    })
  }
  return points
}

const chartConfig = {
  bookings: { label: "New Bookings", color: "var(--status-blue)" },
} satisfies ChartConfig

export function BookingTrendLine({ data }: BookingTrendLineProps) {
  const chartData = data ?? generateDefaultData()

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>Booking Trend</CardTitle>
        <CardDescription>New bookings over the last 30 days</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <ChartContainer config={chartConfig} className="h-[260px] w-full">
          <AreaChart accessibilityLayer data={chartData} margin={{ left: 4, right: 12, top: 8 }}>
            <defs>
              <linearGradient id="fillBookings" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-bookings)" stopOpacity={0.4} />
                <stop offset="95%" stopColor="var(--color-bookings)" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={28}
              fontSize={12}
              tickFormatter={(value: string) =>
                new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })
              }
            />
            <YAxis tickLine={false} axisLine={false} width={28} fontSize={12} allowDecimals={false} />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) =>
                    new Date(value as string).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  }
                />
              }
            />
            <Area
              dataKey="bookings"
              type="monotone"
              stroke="var(--color-bookings)"
              strokeWidth={2}
              fill="url(#fillBookings)"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
