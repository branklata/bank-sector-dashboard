import { fetchDashboardData } from "@/lib/data";
import { Dashboard } from "@/components/Dashboard";

export const revalidate = 300; // Refresh every 5 minutes

export default async function Home() {
  const data = await fetchDashboardData();
  return <Dashboard data={data} />;
}
