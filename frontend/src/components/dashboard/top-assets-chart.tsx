"use client"

import { Bar, BarChart, XAxis, YAxis, CartesianGrid } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"

export interface TopAsset {
  name: string
  bookings: number
}

export interface TopAssetsChartProps {
  data?: TopAsset[]
}

const defaultData: TopAsset[] = [
  { name: "MacBook Pro 16”", bookings: 184 },
  { name: "Canon EOS R5", bookings: 152 },
  { name: "DJI Mavic 3", bookings: 121 },
  { name: "Projector X900", bookings: 98 },
  { name: "iPad Pro 12.9”", bookings: 76 },
]

const chartConfig = {
  bookings: { label: "Bookings", color: "var(--status-blue)" },
} satisfies ChartConfig

export function TopAssetsChart({ data = defaultData }: TopAssetsChartProps) {
  const top5 = [...data].sort((a, b) => b.bookings - a.bookings).slice(0, 5)

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>Top Assets</CardTitle>
        <CardDescription>Top 5 assets by total bookings</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <ChartContainer config={chartConfig} className="h-[260px] w-full">
          <BarChart accessibilityLayer data={top5} layout="vertical" margin={{ left: 8, right: 16 }}>
            <CartesianGrid horizontal={false} />
            <XAxis type="number" dataKey="bookings" tickLine={false} axisLine={false} fontSize={12} />
            <YAxis
              type="category"
              dataKey="name"
              tickLine={false}
              axisLine={false}
              width={110}
              fontSize={12}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Bar dataKey="bookings" fill="var(--color-bookings)" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
