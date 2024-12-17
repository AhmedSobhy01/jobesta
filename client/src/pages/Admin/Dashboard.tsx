import {
  faChartSimple,
  faUser,
  faCommentDots,
  faLayerGroup,
  faBriefcase,
} from '@fortawesome/free-solid-svg-icons';
import StatsCard from '@/components/Admin/StatCard';
import {
  LoaderFunctionArgs,
  useLoaderData,
  useNavigate,
} from 'react-router-dom';
import ErrorModule from '@/components/ErrorModule';
import { getAuthJwtToken } from '@/utils/auth';

const Dashboard: React.FC & {
  loader?: (args: LoaderFunctionArgs) => Promise<unknown>;
} = () => {
  const navigate = useNavigate();

  const {
    status: loaderStatus,
    error: loaderError,
    data: { statistics },
  } = useLoaderData() as {
    status: boolean;
    error?: string;
    data: {
      statistics: {
        totalClients: number;
        totalFreelancers: number;
        totalJobs: number;
        totalProposals: number;
        totalCategories: number;
        totalReviews: number;
        totalOpenJobs: number;
        totalCompletedJobs: number;
        totalAcceptedProposals: number;
      };
    };
  };

  if (!loaderStatus) {
    return (
      <ErrorModule onClose={() => navigate('/')} errorMessage={loaderError} />
    );
  }

  return (
    <div className="mt-3 flex flex-wrap gap-4">
      <StatsCard
        title="Total Clients"
        value={statistics.totalClients}
        icon={faUser}
      />
      <StatsCard
        title="Total Freelancers"
        value={statistics.totalFreelancers}
        icon={faUser}
      />
      <StatsCard
        title="Total Reviews"
        value={statistics.totalReviews}
        icon={faCommentDots}
      />
      <StatsCard
        title="Total Categories"
        value={statistics.totalCategories}
        icon={faLayerGroup}
      />
      <div className="flex flex-wrap gap-4 w-full">
        <StatsCard
          title="Total Proposals"
          value={statistics.totalProposals}
          icon={faChartSimple}
          color='cyan'
          />
        <StatsCard
          title="Total Accepted Proposals"
          value={statistics.totalAcceptedProposals}
          icon={faChartSimple}
          color='cyan'
        />
      </div>
      <div className="flex flex-wrap gap-4 w-full">
        <StatsCard
          title="Total Jobs"
          value={statistics.totalJobs}
          icon={faBriefcase}
          color='orange'
          />
        <StatsCard
          title="Total Open Jobs"
          value={statistics.totalOpenJobs}
          icon={faBriefcase}
          color='orange'
          />
        <StatsCard
          title="Total Completed Jobs"
          value={statistics.totalCompletedJobs}
          icon={faBriefcase}
          color='orange'
        />
      </div>
    </div>
  );
};

export default Dashboard;

Dashboard.loader = async function loader(): Promise<unknown> {
  try {
    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/admin/statistics`,
      {
        headers: {
          Authorization: `Bearer ${getAuthJwtToken()}`,
        },
      },
    );
    const data = await res.json();
    if (!data.status || !res.ok) {
      throw new Error(data.message);
    }
    return data;
  } catch (err) {
    return { status: false, error: (err as Error).message };
  }
};
