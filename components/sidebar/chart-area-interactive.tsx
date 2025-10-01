"use client";

import * as React from "react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

export const description = "An interactive area chart";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const dummyEnrollmentsData = [
  { date: "2024-05-01", enrollments: 8 },
  { date: "2024-05-02", enrollments: 5 },
  { date: "2024-05-03", enrollments: 10 },
  { date: "2024-05-04", enrollments: 3 },
  { date: "2024-05-05", enrollments: 12 },
  { date: "2024-05-06", enrollments: 7 },
  { date: "2024-05-07", enrollments: 15 },
  { date: "2024-05-08", enrollments: 6 },
  { date: "2024-05-09", enrollments: 9 },
  { date: "2024-05-10", enrollments: 11 },
  { date: "2024-05-11", enrollments: 4 },
  { date: "2024-05-12", enrollments: 12 },
  { date: "2024-05-13", enrollments: 5 },
  { date: "2024-05-14", enrollments: 2 },
  { date: "2024-05-15", enrollments: 8 },
  { date: "2024-05-16", enrollments: 19 },
  { date: "2024-05-17", enrollments: 12 },
  { date: "2024-05-18", enrollments: 14 },
  { date: "2024-05-19", enrollments: 7 },
  { date: "2024-05-20", enrollments: 13 },
  { date: "2024-05-21", enrollments: 9 },
  { date: "2024-05-22", enrollments: 6 },
  { date: "2024-05-23", enrollments: 15 },
  { date: "2024-05-24", enrollments: 10 },
  { date: "2024-05-25", enrollments: 4 },
  { date: "2024-05-26", enrollments: 11 },
  { date: "2024-05-27", enrollments: 8 },
  { date: "2024-05-28", enrollments: 14 },
  { date: "2024-05-29", enrollments: 6 },
  { date: "2024-05-30", enrollments: 13 },
  { date: "2024-05-31", enrollments: 9 },
];

const chartConfig = {
  enrollments: {
    label: "Enrollments",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

interface ChartAreaInteractiveProps {
  data: { date: string; enrollments: number }[];
}

export function ChartAreaInteractive({ data }: ChartAreaInteractiveProps) {
  const totalEnrollmentsNumber = React.useMemo(
    () => data.reduce((acc, curr) => acc + curr.enrollments, 0),
    [data]
  );

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Total Enrollment</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            Total Enrollments for the last 30 days: {totalEnrollmentsNumber}
          </span>
          <span className="@[540px]/card:hidden">
            Last 30 days: {totalEnrollmentsNumber}
          </span>
        </CardDescription>
      </CardHeader>

      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <BarChart
            margin={{
              left: 12,
              right: 12,
            }}
            data={data}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              interval={"preserveStartEnd"}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
              }}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-[150px]"
                  labelFormatter={(value) => {
                    const date = new Date(value);
                    return date.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    });
                  }}
                />
              }
            />

            <Bar dataKey={"enrollments"} fill="var(--color-enrollments)" />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
