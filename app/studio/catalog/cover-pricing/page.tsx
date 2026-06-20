import { getCoverPricingMatrix } from "@/lib/actions/catalog";
import { CoverPricingClient } from "./client";
export default async function CoverPricingPage() {
  const data = await getCoverPricingMatrix();
  return <CoverPricingClient data={data} />;
}
