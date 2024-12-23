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
import { PieChart } from '@mui/x-charts/PieChart';
import { mangoFusionPalette } from '@mui/x-charts';
import { BarChart } from '@mui/x-charts/BarChart';
import { useEffect, useState } from 'react';
import ThreeStatCard from '@/components/Admin/ThreeStatCard';

const Dashboard: React.FC & {
  loader?: (args: LoaderFunctionArgs) => Promise<unknown>;
} = () => {
  const navigate = useNavigate();

  const {
    status: loaderStatus,
    error: loaderError,
    data,
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
        minBudget: number;
        maxBudget: number;
        avgBudget: number;
        jobsPerCategory: { name: string; jobsCount: number }[];
        paymentsPerMonth: { month: string; totalPrice: number }[];
        freelancerBadgesCount: {
          badgeName: string;
          freelancersCount: number;
        }[];
      };
    };
  };

  const [isMobile, setScreenSize] = useState(window.innerWidth < 640);

  useEffect(() => {
    window.addEventListener('resize', () => {
      setScreenSize(window.innerWidth < 640);
    });
  }, []);

  if (!loaderStatus) {
    return (
      <ErrorModule onClose={() => navigate('/')} errorMessage={loaderError} />
    );
  }

  const sortedJobsPerCategory = data.statistics.jobsPerCategory
    .filter((job) => job.name !== 'Uncategorized')
    .sort((a, b) => b.jobsCount - a.jobsCount);

  const uncategorizedCount = data.statistics.jobsPerCategory.find(
    (job) => job.name === 'Uncategorized',
  );

  if (uncategorizedCount) {
    sortedJobsPerCategory.push(uncategorizedCount);
  }

  const formattedPaymentsPerMonth = data.statistics.paymentsPerMonth.map(
    (payment) => ({
      month: new Date(payment.month).toLocaleString('default', {
        month: 'long',
      }),
      totalPrice: Number(payment.totalPrice),
    }),
  );

  const valueFormatter = (value: number | null) => {
    if (!value) return '$0.00';
    return value.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 xl:px-8">
      <h1 className="font-bold text-3xl lg:text-4xl font-heading text-gray-900">
        Statistics
      </h1>
      <div className="mt-3 flex flex-wrap gap-4">
        <StatsCard
          title="Total Clients"
          value={data.statistics.totalClients}
          icon={faUser}
        />
        <StatsCard
          title="Total Freelancers"
          value={data.statistics.totalFreelancers}
          icon={faUser}
        />
        <StatsCard
          title="Total Reviews"
          value={data.statistics.totalReviews}
          icon={faCommentDots}
        />
        <StatsCard
          title="Total Categories"
          value={data.statistics.totalCategories}
          icon={faLayerGroup}
        />
        <div className="flex flex-wrap gap-4 w-full">
          <StatsCard
            title="Total Proposals"
            value={data.statistics.totalProposals}
            icon={faChartSimple}
            color="cyan"
          />
          <StatsCard
            title="Total Accepted Proposals"
            value={data.statistics.totalAcceptedProposals}
            icon={faChartSimple}
            color="cyan"
          />
        </div>
        <div className="flex flex-wrap gap-4 w-full">
          <StatsCard
            title="Total Jobs"
            value={data.statistics.totalJobs}
            icon={faBriefcase}
            color="orange"
          />
          <StatsCard
            title="Total Open Jobs"
            value={data.statistics.totalOpenJobs}
            icon={faBriefcase}
            color="orange"
          />
          <StatsCard
            title="Total Completed Jobs"
            value={data.statistics.totalCompletedJobs}
            icon={faBriefcase}
            color="orange"
          />
        </div>
        <ThreeStatCard
          title="Job Budget"
          min={data.statistics.minBudget}
          max={data.statistics.maxBudget}
          avg={data.statistics.avgBudget}
          icon={faBriefcase}
          color="orange"
        />
      </div>

      <div className="flex flex-wrap gap-4 w-full mt-10">
        <h1 className="font-bold text-3xl lg:text-4xl font-heading text-gray-900">
          Graphs
        </h1>
        <div className="w-full flex flex-wrap gap-4">
          <div className="flex-grow flex flex-col items-center shadow-sm p-4 bg-white rounded-lg border border-gray-200 w-full xl:w-1/2 2xl:w-1/3 justify-center">
            <h2 className="font-semibold text-xl lg:text-2xl font-heading text-gray-900">
              Jobs Count per Category
            </h2>
            <PieChart
              series={[
                {
                  data: sortedJobsPerCategory.map((category, i) => ({
                    id: i,
                    label: category.name,
                    value: category.jobsCount,
                  })),
                  innerRadius: 40,
                  outerRadius: 100,
                  paddingAngle: 3,
                  cornerRadius: 12,
                  cx: '50%',
                },
              ]}
              width={isMobile ? 300 : 500}
              height={isMobile ? 300 : 400}
              colors={mangoFusionPalette}
              slotProps={{
                legend: {
                  direction: 'row',
                  position: { vertical: 'top', horizontal: 'middle' },
                  padding: 3,
                },
              }}
            />
          </div>
          <div className="flex-grow flex flex-col items-center shadow-sm p-4 bg-white rounded-lg border border-gray-200 w-full xl:w-1/2 2xl:w-1/3 justify-center">
            <h2 className="font-semibold text-xl lg:text-2xl font-heading text-gray-900">
              Users Count
            </h2>
            <PieChart
              series={[
                {
                  data: [
                    {
                      id: 0,
                      label: 'Clients',
                      value: data.statistics.totalClients,
                    },
                    {
                      id: 1,
                      label: 'Freelancers',
                      value: data.statistics.totalFreelancers,
                    },
                  ],
                  innerRadius: 40,
                  outerRadius: 100,
                  paddingAngle: 3,
                  cornerRadius: 12,
                  cx: '50%',
                },
              ]}
              width={isMobile ? 300 : 500}
              height={isMobile ? 300 : 400}
              colors={mangoFusionPalette}
              slotProps={{
                legend: {
                  direction: 'row',
                  position: { vertical: 'top', horizontal: 'middle' },
                  padding: 3,
                },
              }}
            />
          </div>

          <div className="flex-grow flex flex-col items-center shadow-sm p-4 bg-white rounded-lg border border-gray-200 w-full xl:w-1/2 2xl:w-1/3">
            <h2 className="font-semibold text-xl lg:text-2xl font-heading text-gray-900">
              Payments in the last 6 months
            </h2>
            <BarChart
              dataset={formattedPaymentsPerMonth}
              xAxis={[{ scaleType: 'band', dataKey: 'month' }]}
              series={[
                {
                  dataKey: 'totalPrice',
                  label: 'Payments per Month',
                  valueFormatter,
                },
              ]}
              width={isMobile ? 300 : 500}
              height={isMobile ? 300 : 400}
              colors={mangoFusionPalette}
              slotProps={{
                legend: {
                  direction: 'row',
                  position: { vertical: 'top', horizontal: 'middle' },
                  padding: 3,
                },
              }}
            />
          </div>
          <div className="flex-grow flex flex-col items-center shadow-sm p-4 bg-white rounded-lg border border-gray-200 w-full xl:w-1/2 2xl:w-1/3">
            <h2 className="font-semibold text-xl lg:text-2xl font-heading text-gray-900">
              Freelancers Count per Badge
            </h2>
            <BarChart
              dataset={data.statistics.freelancerBadgesCount}
              xAxis={[{ scaleType: 'band', dataKey: 'badgeName' }]}
              yAxis={[{ domainLimit: 'nice', tickMinStep: 1 }]}
              series={[
                {
                  dataKey: 'freelancersCount',
                  label: 'Freelancers Count per Badge',
                },
              ]}
              width={isMobile ? 300 : 500}
              height={isMobile ? 300 : 400}
              colors={mangoFusionPalette}
              borderRadius={12}
              slotProps={{
                legend: {
                  direction: 'row',
                  position: { vertical: 'top', horizontal: 'middle' },
                  padding: 3,
                },
              }}
            />
          </div>
        </div>
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
