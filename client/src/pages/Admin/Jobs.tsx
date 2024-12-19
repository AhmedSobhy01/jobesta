import JobRowItem from '@/components/Admin/Jobs/JobRowItem.tsx';
import TableLoader from '@/components/Common/TableLoader.tsx';
import TableSkeleton from '@/components/Skeletons/TableSkeleton.tsx';
import { useCallback, useEffect, useRef, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import ErrorModule from '@/components/ErrorModule.tsx';
import { useNavigate, useSearchParams } from 'react-router';
import { getAuthJwtToken } from '@/utils/auth';
import { useDebounce } from '@/utils/hooks/useDebounce';

const Jobs = () => {
  const navigate = useNavigate();

  const [globalError, setGlobalError] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const tableElement = useRef<HTMLDivElement>(null);

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationData>({
    currentPage: 0,
    totalItems: 0,
    totalPages: 0,
    perPage: 0,
  });

  const [searchQuery, setSearchQuery] = useState(
    searchParams.get('search') || '',
  );
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoading(true);
    setJobs([]);
    setSearchParams((prev) => ({
      ...prev,
      search: e.target.value.trim(),
      status,
    }));
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const [status, setStatus] = useState(searchParams.get('status') || '');
  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLoading(true);
    setJobs([]);
    setSearchParams((prev) => ({
      ...prev,
      status: e.target.value,
      search: searchQuery,
    }));
    setStatus(e.target.value);
    setCurrentPage(1);
  };

  const fetchData = useDebounce(
    useCallback(async () => {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/admin/jobs?page=${currentPage}${searchQuery ? `&search=${searchQuery}` : ''}${status ? `&status=${status}` : ''}`,
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
      if (currentPage === 1) {
        if (tableElement.current) tableElement.current.scrollTo({ top: 0 });

        setJobs(data.data.jobs);
      } else setJobs((prevJobs) => [...prevJobs, ...data.data.jobs]);

      setPagination(data.data.pagination);

      setLoading(false);

      fetchDataRef.current = false;
    }, [currentPage, searchQuery, status]),
    300,
  );

  const fetchDataRef = useRef(false);
  useEffect(() => {
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
  }, [currentPage, searchParams, fetchData, navigate, setSearchParams]);

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

        <div className="mb-6 flex justify-between items-center gap-4">
          <input
            type="text"
            placeholder="Search jobs..."
            className="w-full lg:w-1/3 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
            onChange={handleSearchInputChange}
            value={searchQuery}
          />
          <select
            className="w-full lg:w-64 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
            onChange={handleStatusChange}
            value={status}
          >
            <option value="">All Statuses</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="closed">Closed</option>
            <option value="cancelled">Cancelled</option>
          </select>
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
                {loading && <TableSkeleton columns={10} />}

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
