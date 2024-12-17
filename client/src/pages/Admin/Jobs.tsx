import JobRowItem from '@/components/Admin/Jobs/JobRowItem.tsx';
import TableLoader from '@/components/Common/TableLoader.tsx';
import TableSkeleton from '@/components/Skeletons/TableSkeleton.tsx';
import { useEffect, useRef, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import ErrorModule from '@/components/ErrorModule.tsx';
import { useNavigate, useSearchParams } from 'react-router';
import { getAuthJwtToken } from '@/utils/auth';

const Jobs = () => {
  const navigate = useNavigate();

  const [globalError, setGlobalError] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationData>({
    currentPage: 0,
    totalItems: 0,
    totalPages: 0,
    perPage: 0,
  });

  const fetchDataRef = useRef(false);
  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/admin/jobs?page=${currentPage}`,
        {
          headers: {
            Authorization: `Bearer ${getAuthJwtToken()}`,
          },
        },
      );

      if (!res.ok) {
        setGlobalError("Couldn't fetch jobs. Please try again later.");
        return;
      }

      const data = await res.json();
      setJobs((prevJobs) => [...prevJobs, ...data.data.jobs]);
      setPagination(data.data.pagination);

      setLoading(false);

      fetchDataRef.current = false;
    };

    if (!fetchDataRef.current) {
      if (searchParams.get('reload')) {
        setJobs([]);
        setPagination({
          currentPage: 0,
          totalItems: 0,
          totalPages: 0,
          perPage: 0,
        });
        setCurrentPage(1);
        setSearchParams({ ...searchParams, reload: undefined });
        navigate('/admin/jobs');
        return;
      }
      fetchDataRef.current = true;
      fetchData();
    }
  }, [currentPage, searchParams, navigate, setSearchParams]);

  if (globalError)
    return (
      <ErrorModule
        errorMessage={globalError}
        onClose={() => navigate('/admin')}
      />
    );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-9 lg:py-12">
        <div className="text-center pb-6 flex items-center justify-between flex-col lg:flex-row gap-10">
          <h1 className="font-bold text-3xl lg:text-5xl font-heading text-gray-900">
            Jobs
          </h1>
        </div>

        <div
          className="relative overflow-x-auto shadow-md sm:rounded-lg max-h-[70vh]"
          id="table"
        >
          <InfiniteScroll
            dataLength={jobs.length}
            next={() => setCurrentPage((prev) => prev + 1)}
            hasMore={pagination.currentPage < pagination.totalPages}
            loader={<TableLoader />}
            scrollableTarget="table"
          >
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3">
                    Job ID
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Title
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Category
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Client Name
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Freelancer Name
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Budget
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Duration
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Proposals Count
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading && <TableSkeleton columns={7} />}

                {jobs.map((job: Job) => (
                  <JobRowItem key={job.id} job={job} />
                ))}
              </tbody>
            </table>
          </InfiniteScroll>
        </div>
      </div>
    </div>
  );
};

export default Jobs;
