import { ComingSoon } from "@/components/layout/coming-soon";

export default function ClientDetailPage({ params }: { params: { id: string } }) {
  return <ComingSoon title={`Client Detail — ${params.id}`} />;
}
