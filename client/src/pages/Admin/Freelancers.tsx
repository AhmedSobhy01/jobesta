import FreelancerModal from '@/components/Admin/Freelancers/FreelancerModal';
import FreelancerRowItem from '@/components/Admin/Freelancers/FreelancerRowItem';
import TableLoader from '@/components/Common/TableLoader';
import TableSkeleton from '@/components/Skeletons/TableSkeleton';
import { useCallback, useEffect, useRef, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import ErrorModule from '@/components/ErrorModule';
import { useNavigate, useSearchParams } from 'react-router';
import { getAuthJwtToken } from '@/utils/auth';
import { useDebounce } from '@/utils/hooks/useDebounce';

const Freelancers = () => {
  const navigate = useNavigate();

  const [globalError, setGlobalError] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const tableElement = useRef<HTMLDivElement | null>(null);

  const [freelancers, setFreelancers] = useState<Account[]>([]);
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
    setFreelancers([]);
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

  const [isCreateFreelancerModalOpen, setIsCreateFreelancerModalOpen] =
    useState(false);

  const fetchData = useDebounce(
    useCallback(async () => {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/admin/accounts?page=${currentPage}&role=freelancer${searchQueryRef.current ? `&search=${searchQueryRef.current}` : ''}`,
        {
          headers: {
            Authorization: `Bearer ${getAuthJwtToken()}`,
          },
        },
      );

      if (!res.ok) {
        setGlobalError("Couldn't fetch freelancers. Please try again later.");
        return;
      }

      const data = await res.json();

      if (currentPage === 1) {
        if (tableElement.current) tableElement.current.scrollTo({ top: 0 });

        setFreelancers(data.data.accounts);
      } else
        setFreelancers((prevFreelancers) => [
          ...prevFreelancers,
          ...data.data.accounts,
        ]);

      setPagination(data.data.pagination);

      setLoading(false);

      fetchDataRef.current = false;
    }, [currentPage, searchQueryRef]),
    300,
  );

  const fetchDataRef = useRef(false);
  useEffect(() => {
    if (!fetchDataRef.current) {
      if (searchParams.get('reload')) {
        setFreelancers([]);
        setPagination({
          currentPage: 0,
          totalItems: 0,
          totalPages: 0,
          perPage: 0,
        });
        setCurrentPage(1);
        setSearchParams({ ...searchParams, reload: undefined });
        navigate('/admin/freelancers');
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
      {isCreateFreelancerModalOpen && (
        <FreelancerModal
          onClose={() => setIsCreateFreelancerModalOpen(false)}
        />
      )}

      <div className="py-6 2xl:py-12">
        <div className="text-center pb-6 flex items-center justify-between flex-col 2xl:flex-row gap-4">
          <h1 className="font-bold text-2xl 2xl:text-5xl font-heading text-gray-900">
            Freelancers
          </h1>

          <button
            type="button"
            className="px-5 py-2 bg-blue-600 text-white rounded-lg font-medium focus:outline-none hover:bg-blue-700 transition-colors duration-300 ease-in-out w-full 2xl:w-auto"
            onClick={() => setIsCreateFreelancerModalOpen(true)}
          >
            Add Freelancer
          </button>
        </div>

        <div className="mb-6">
          <input
            type="text"
            placeholder="Search freelancers..."
            className="w-full lg:w-1/3 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
            onChange={(e) => setSearchQuery(e.target.value)}
            value={searchQuery}
          />
        </div>

        <div
          className="relative overflow-x-auto shadow-md rounded-lg max-h-[70vh]"
          id="table"
          ref={tableElement}
        >
          <InfiniteScroll
            dataLength={freelancers.length}
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
                      className="px-3 py-2 2xl:px-6 2xl:py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-left"
                    >
                      ID
                    </th>
                    <th
                      scope="col"
                      className="hidden 2xl:table-cell px-3 py-2 2xl:px-6 2xl:py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-left"
                    >
                      First Name
                    </th>
                    <th
                      scope="col"
                      className="hidden 2xl:table-cell px-3 py-2 2xl:px-6 2xl:py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-left"
                    >
                      Last Name
                    </th>
                    <th
                      scope="col"
                      className="2xl:table-cell px-3 py-2 2xl:px-6 2xl:py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-left"
                    >
                      Username
                    </th>
                    <th
                      scope="col"
                      className="hidden 2xl:table-cell px-3 py-2 2xl:px-6 2xl:py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-left"
                    >
                      Email
                    </th>
                    <th
                      scope="col"
                      className="hidden 2xl:table-cell px-3 py-2 2xl:px-6 2xl:py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-left"
                    >
                      Banned
                    </th>
                    <th
                      scope="col"
                      className="hidden 2xl:table-cell px-3 py-2 2xl:px-6 2xl:py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-left"
                    >
                      Created At
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-2 2xl:px-6 2xl:py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-left"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading && <TableSkeleton columns={8} />}
                  {freelancers.map((freelancer: Account) => (
                    <FreelancerRowItem
                      key={freelancer.id}
                      freelancer={freelancer}
                    />
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

export default Freelancers;
