"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { AreaChart, Area, BarChart, Bar, XAxis, CartesianGrid } from "recharts";
import { BarChart3, Users, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface AnalyticsChartsProps {
  data: {
    monthlyData: any[];
    departmentStats: any[];
    recentActivity: any[];
    totalApprovals: number;
  };
}

export default function AnalyticsCharts({ data }: AnalyticsChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Monthly Trends - Area Chart */}
      <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <BarChart3 className="w-5 h-5 mr-2" />
            Monthly Trends
          </CardTitle>
          <CardDescription>Approval activity over the last 6 months</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              created: {
                label: "Created",
                color: "#3b82f6", // Blue
              },
              approved: {
                label: "Approved",
                color: "#1d4ed8", // Darker blue
              },
              rejected: {
                label: "Rejected",
                color: "#60a5fa", // Lighter blue
              },
            }}
            className="h-[300px] w-full"
          >
            <AreaChart
              accessibilityLayer
              data={data.monthlyData}
              margin={{
                left: 12,
                right: 12,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => value.slice(0, 3)}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dot" />}
              />
              <Area
                dataKey="rejected"
                type="natural"
                fill="var(--color-rejected)"
                fillOpacity={0.4}
                stroke="var(--color-rejected)"
                stackId="a"
              />
              <Area
                dataKey="approved"
                type="natural"
                fill="var(--color-approved)"
                fillOpacity={0.4}
                stroke="var(--color-approved)"
                stackId="a"
              />
              <Area
                dataKey="created"
                type="natural"
                fill="var(--color-created)"
                fillOpacity={0.4}
                stroke="var(--color-created)"
                stackId="a"
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Department Stats - Bar Chart */}
      <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Department Activity
          </CardTitle>
          <CardDescription>Top departments by approval requests</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              count: {
                label: "Requests",
                color: "#3b82f6", // Blue
              },
            }}
            className="h-[310px] w-full"
          >
            <BarChart
              accessibilityLayer
              data={data.departmentStats.map((dept) => ({
                department: dept.department,
                count: dept._count.id,
              }))}
              margin={{
                left: 12,
                right: 12,
                top: 10,
                bottom: 10,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="department"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => value.slice(0, 6)}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dashed" />}
              />
              <Bar dataKey="count" fill="var(--color-count)" radius={12} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 col-span-1 lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Recent Activity
          </CardTitle>
          <CardDescription>Latest approval updates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.recentActivity.slice(0, 5).map((activity) => (
              <div key={activity.id} className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">
                    {activity.title}
                  </p>
                  <p className="text-slate-400 text-xs">
                    by {activity.requester.name}
                  </p>
                </div>
                <Badge
                  className={`${
                    activity.status === "APPROVED"
                      ? "bg-green-500/20 text-green-400"
                      : activity.status === "REJECTED"
                      ? "bg-red-500/20 text-red-400"
                      : "bg-yellow-500/20 text-yellow-400"
                  } text-xs`}
                >
                  {activity.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
