import { getStudioSettings } from "@/lib/actions/settings";
import { SettingsForm } from "./form";
export default async function SettingsPage() {
  const tenant = await getStudioSettings();
  return <SettingsForm tenant={tenant} />;
}
