"use client"

import { useMemo } from "react"
import { Label, Pie, PieChart } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"

export interface BookingStatusData {
  pending?: number
  approved?: number
  issued?: number
  returned?: number
  rejected?: number
}

export interface BookingStatusPieProps {
  data?: BookingStatusData
}

const defaultData: Required<BookingStatusData> = {
  pending: 48,
  approved: 96,
  issued: 132,
  returned: 210,
  rejected: 24,
}

const chartConfig = {
  count: { label: "Bookings" },
  pending: { label: "Pending", color: "var(--status-yellow)" },
  approved: { label: "Approved", color: "var(--status-green)" },
  issued: { label: "Issued", color: "var(--status-blue)" },
  returned: { label: "Returned", color: "var(--status-grey)" },
  rejected: { label: "Rejected", color: "var(--status-red)" },
} satisfies ChartConfig

export function BookingStatusPie({ data = defaultData }: BookingStatusPieProps) {
  const merged = { ...defaultData, ...data }

  const chartData = useMemo(
    () => [
      { status: "pending", count: merged.pending, fill: "var(--color-pending)" },
      { status: "approved", count: merged.approved, fill: "var(--color-approved)" },
      { status: "issued", count: merged.issued, fill: "var(--color-issued)" },
      { status: "returned", count: merged.returned, fill: "var(--color-returned)" },
      { status: "rejected", count: merged.rejected, fill: "var(--color-rejected)" },
    ],
    [merged.pending, merged.approved, merged.issued, merged.returned, merged.rejected],
  )

  const total = useMemo(() => chartData.reduce((sum, d) => sum + d.count, 0), [chartData])

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>Booking Status</CardTitle>
        <CardDescription>Distribution across booking lifecycle</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col">
        <ChartContainer config={chartConfig} className="mx-auto aspect-square h-[200px]">
          <PieChart>
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Pie data={chartData} dataKey="count" nameKey="status" innerRadius={58} strokeWidth={4}>
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-2xl font-semibold tabular-nums"
                        >
                          {total.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy ?? 0) + 20}
                          className="fill-muted-foreground text-xs"
                        >
                          Bookings
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
        <ul className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-2">
          {chartData.map((d) => (
            <li key={d.status} className="flex items-center gap-1.5 text-xs">
              <span className="size-2.5 rounded-[2px]" style={{ backgroundColor: d.fill }} aria-hidden="true" />
              <span className="capitalize text-muted-foreground">{d.status}</span>
              <span className="font-medium tabular-nums">{d.count}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
