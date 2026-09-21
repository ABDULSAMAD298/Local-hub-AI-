import { AnimatedCounter } from "@/components/landing/animated-counter";

const STATS = [
  { value: 10000, suffix: "+", label: "Messages Automated" },
  { value: 500, suffix: "+", label: "Businesses" },
  { value: 98, suffix: "%", label: "Response Rate" },
];

export function StatsBar() {
  return (
    <section className="border-y border-border bg-bg-secondary/50">
      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 px-4 py-10 text-center sm:grid-cols-3 sm:px-6 lg:px-8">
        {STATS.map((stat) => (
          <div key={stat.label}>
            <p className="text-3xl font-semibold text-text-primary sm:text-4xl">
              <AnimatedCounter value={stat.value} suffix={stat.suffix} />
            </p>
            <p className="mt-1 text-sm text-text-secondary">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
