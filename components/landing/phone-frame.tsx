export function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative mx-auto h-[560px] w-[280px] rounded-[2.5rem] border-[6px] border-bg-tertiary bg-black shadow-card sm:h-[620px] sm:w-[310px]">
      <div className="absolute left-1/2 top-0 z-10 h-6 w-32 -translate-x-1/2 rounded-b-2xl bg-bg-tertiary" />
      <div className="h-full w-full overflow-hidden rounded-[2rem] bg-bg-primary">{children}</div>
    </div>
  );
}
