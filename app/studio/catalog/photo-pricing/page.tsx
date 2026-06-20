import { getPhotoPricingMatrix } from "@/lib/actions/catalog";
import { PhotoPricingClient } from "./client";
export default async function PhotoPricingPage() {
  const data = await getPhotoPricingMatrix();
  return <PhotoPricingClient data={data} />;
}
