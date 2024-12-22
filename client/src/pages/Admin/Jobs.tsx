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
  const searchQueryRef = useRef(searchQuery);
  useEffect(() => {
    if (searchQuery.trim() === searchQueryRef.current.trim()) return;

    setLoading(true);
    setJobs([]);
    setPagination({
      currentPage: 0,
      totalItems: 0,
      totalPages: 0,
      perPage: 0,
    });
    setCurrentPage(1);
    setSearchParams((prev) => ({ ...prev, search: searchQuery.trim() }));
    searchQueryRef.current = searchQuery.trim();
  }, [searchQuery, setSearchParams]);

  const [status, setStatus] = useState(searchParams.get('status') || '');
  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLoading(true);
    setJobs([]);
    setPagination({
      currentPage: 0,
      totalItems: 0,
      totalPages: 0,
      perPage: 0,
    });
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
        `${import.meta.env.VITE_API_URL}/admin/jobs?page=${currentPage}${searchQueryRef.current ? `&search=${searchQueryRef.current}` : ''}${status ? `&status=${status}` : ''}`,
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
    }, [currentPage, searchQueryRef, status]),
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 2xl:px-8">
      <div className="py-6 2xl:py-12">
        <div className="text-center pb-6 flex items-center justify-between flex-col 2xl:flex-row gap-4">
          <h1 className="font-bold text-2xl 2xl:text-5xl font-heading text-gray-900">
            Jobs
          </h1>
        </div>

        <div className="mb-6 flex justify-between items-center gap-4">
          <input
            type="text"
            placeholder="Search jobs..."
            className="w-full lg:w-1/3 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
            onChange={(e) => setSearchQuery(e.target.value)}
            value={searchQuery}
          />
          <select
            className="w-full lg:w-64 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
            onChange={handleStatusChange}
            value={status}
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        <div
          className="relative overflow-x-auto shadow-md rounded-lg max-h-[70vh]"
          id="table"
        >
          <InfiniteScroll
            dataLength={jobs.length}
            next={() => setCurrentPage((prev) => prev + 1)}
            hasMore={pagination.currentPage < pagination.totalPages}
            loader={<TableLoader />}
            scrollableTarget="table"
          >
            <div className="block w-full overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-3 py-2 2xl:px-6 2xl:py-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-left"
                    >
                      ID
                    </th>
                    <th
                      scope="col"
                      className="hidden 2xl:table-cell px-3 py-2 2xl:px-6 2xl:py-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-left"
                    >
                      Title
                    </th>
                    <th
                      scope="col"
                      className="hidden 2xl:table-cell px-3 py-2 2xl:px-6 2xl:py-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-left"
                    >
                      Category
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-2 2xl:px-6 2xl:py-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-left"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="hidden 2xl:table-cell px-3 py-2 2xl:px-6 2xl:py-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-left"
                    >
                      Client
                    </th>
                    <th
                      scope="col"
                      className="hidden 2xl:table-cell px-3 py-2 2xl:px-6 2xl:py-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-left"
                    >
                      Freelancer
                    </th>
                    <th
                      scope="col"
                      className="hidden 2xl:table-cell px-3 py-2 2xl:px-6 2xl:py-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-left"
                    >
                      Budget
                    </th>
                    <th
                      scope="col"
                      className="hidden 2xl:table-cell px-3 py-2 2xl:px-6 2xl:py-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-left"
                    >
                      Duration
                    </th>
                    <th
                      scope="col"
                      className="hidden 2xl:table-cell px-3 py-2 2xl:px-6 2xl:py-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-left"
                    >
                      Proposals
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-2 2xl:px-6 2xl:py-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-left"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading && (
                    <>
                      <TableSkeleton
                        columns={10}
                        className="2xl:table-row hidden"
                      />
                      <TableSkeleton columns={3} className="2xl:hidden" />
                    </>
                  )}
                  {jobs.map((job) => (
                    <JobRowItem key={job.id} job={job} />
                  ))}
                </tbody>
              </table>
            </div>
          </InfiniteScroll>
        </div>
      </div>
    </div>
  );
};

export default Jobs;
