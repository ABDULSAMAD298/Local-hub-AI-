"use client";

import { motion } from "framer-motion";
import { Bell, Users2, TrendingUp } from "lucide-react";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";

import { AnimatedCounter } from "@/components/landing/animated-counter";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DASHBOARD_NAV_ITEMS } from "@/components/layout/dashboard-sidebar";

const CHART_DATA = [
  { day: "Mon", messages: 42 },
  { day: "Tue", messages: 58 },
  { day: "Wed", messages: 51 },
  { day: "Thu", messages: 74 },
  { day: "Fri", messages: 68 },
  { day: "Sat", messages: 89 },
  { day: "Sun", messages: 96 },
];

const STATS = [
  { label: "Messages Today", value: 96 },
  { label: "Follow-ups Sent", value: 34 },
  { label: "Videos Sent", value: 21 },
  { label: "Conversions", value: 12 },
];

const CONVERSATIONS = [
  { phone: "+971 ** *** 4567", message: "Is the 2BHK still available?", status: "active" },
  { phone: "+92 *** *** 9012", message: "Can I get the menu for lunch?", status: "follow_up" },
  { phone: "+966 ** *** 2231", message: "Thanks, booked my appointment!", status: "closed" },
];

const STATUS_VARIANT = {
  active: "success",
  follow_up: "warning",
  closed: "secondary",
} as const;

const HIGHLIGHTS = [
  { icon: TrendingUp, text: "Live analytics updated in real-time" },
  { icon: Bell, text: "Instant notifications for new customer inquiries" },
  { icon: Users2, text: "Manage multiple businesses from one account" },
];

export function DashboardPreview() {
  return (
    <section id="dashboard-preview" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">
          Everything in one dashboard
        </h2>
        <p className="mt-4 text-text-secondary">
          Track every conversation, follow-up and conversion in real-time.
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5 }}
        className="mx-auto mt-12 max-w-5xl overflow-hidden rounded-card border border-border bg-bg-secondary shadow-card"
      >
        <div className="flex items-center gap-1.5 border-b border-border bg-bg-tertiary px-4 py-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-error/60" />
          <span className="h-2.5 w-2.5 rounded-full bg-warning/60" />
          <span className="h-2.5 w-2.5 rounded-full bg-success/60" />
          <span className="ml-3 rounded-badge bg-bg-secondary px-3 py-1 text-xs text-text-muted">
            app.localhub.ai/dashboard
          </span>
        </div>

        <div className="flex">
          <div className="hidden w-40 shrink-0 border-r border-border p-3 sm:block">
            {DASHBOARD_NAV_ITEMS.slice(0, 5).map((item, index) => (
              <div
                key={item.href}
                className={`mb-1 rounded-control px-2.5 py-1.5 text-xs font-medium ${
                  index === 0
                    ? "bg-accent/10 text-text-primary"
                    : "text-text-secondary"
                }`}
              >
                {item.label}
              </div>
            ))}
          </div>

          <div className="flex-1 space-y-4 p-4 sm:p-5">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {STATS.map((stat) => (
                <div key={stat.label} className="rounded-control border border-border bg-bg-tertiary p-3">
                  <p className="text-lg font-semibold text-text-primary">
                    <AnimatedCounter value={stat.value} />
                  </p>
                  <p className="mt-0.5 truncate text-[11px] text-text-muted">{stat.label}</p>
                </div>
              ))}
            </div>

            <div className="h-32 rounded-control border border-border bg-bg-tertiary p-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={CHART_DATA}>
                  <XAxis
                    dataKey="day"
                    tick={{ fill: "#8899BB", fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "#111E35",
                      border: "1px solid #1A2F52",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                    labelStyle={{ color: "#F0F4FF" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="messages"
                    stroke="#00C6FF"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="overflow-hidden rounded-control border border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead className="hidden sm:table-cell">Last Message</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {CONVERSATIONS.map((conversation) => (
                    <TableRow key={conversation.phone}>
                      <TableCell className="font-mono text-xs">{conversation.phone}</TableCell>
                      <TableCell className="hidden truncate text-xs sm:table-cell">
                        {conversation.message}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={STATUS_VARIANT[conversation.status as keyof typeof STATUS_VARIANT]}
                          className="capitalize"
                        >
                          {conversation.status.replace("_", " ")}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="mx-auto mt-10 grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3">
        {HIGHLIGHTS.map((highlight) => (
          <div key={highlight.text} className="flex items-center gap-2 text-sm text-text-secondary">
            <highlight.icon className="h-4 w-4 shrink-0 text-accent" />
            {highlight.text}
          </div>
        ))}
      </div>
    </section>
  );
}
