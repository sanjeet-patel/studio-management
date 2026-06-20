import { getEmployee } from "@/lib/actions/finance";
import { EditEmployeeForm } from "./form";
export default async function EditEmployeePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const emp = await getEmployee(id);
  if (!emp) return <div>Not found</div>;
  return <EditEmployeeForm employee={emp} />;
}
