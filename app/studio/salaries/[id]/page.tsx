import { getSalaryCycle } from "@/lib/actions/finance";
import { SalaryCycleClient } from "./client";
export default async function SalaryCyclePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cycle = await getSalaryCycle(id);
  if (!cycle) return <div>Not found</div>;
  return <SalaryCycleClient cycle={cycle} />;
}
