import { faChartSimple } from '@fortawesome/free-solid-svg-icons';
import StatsCard from '@/components/Admin/StatCard';

function Dashboard() {
  return (
    <div className="mt-3 flex flex-wrap gap-4">
      <StatsCard title="Total Clients" value="100" icon={faChartSimple} />
      <StatsCard title="Total Freelancers" value="200" icon={faChartSimple} />
      <StatsCard title="Total Jobs" value="300" icon={faChartSimple} />
      <StatsCard title="Total Proposals" value="400" icon={faChartSimple} />
    </div>
  );
}

export default Dashboard;
