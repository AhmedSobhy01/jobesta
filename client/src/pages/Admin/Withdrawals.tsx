import CategoryModal from '@/components/Admin/Categories/CategoryModal';
import WithdrawalRowItem from '@/components/Admin/Withdrawals/WithdrawalRowItem';
import TableLoader from '@/components/Common/TableLoader';
import TableSkeleton from '@/components/Skeletons/TableSkeleton';
import { useCallback, useEffect, useRef, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import ErrorModule from '@/components/ErrorModule';
import { useNavigate, useSearchParams } from 'react-router';
import { getAuthJwtToken } from '@/utils/auth';

const Withdrawals = () => {
  const navigate = useNavigate();

  const [globalError, setGlobalError] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const tableElement = useRef<HTMLDivElement>(null);

  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationData>({
    currentPage: 0,
    totalItems: 0,
    totalPages: 0,
    perPage: 0,
  });

  const [isUpdateWithdrawalModalOpen, setIsUpdateWithdrawalModalOpen] =
    useState(false);

  const [status, setStatus] = useState(searchParams.get('status') || '');
  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLoading(true);
    setWithdrawals([]);
    setPagination({
      currentPage: 0,
      totalItems: 0,
      totalPages: 0,
      perPage: 0,
    });
    setSearchParams((prev) => ({
      ...prev,
      status: e.target.value,
    }));
    setStatus(e.target.value);
    setCurrentPage(1);
  };

  const fetchData = useCallback(async () => {
    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/admin/withdrawals?page=${currentPage}${status ? `&status=${status}` : ''}`,
      {
        headers: {
          Authorization: `Bearer ${getAuthJwtToken()}`,
        },
      },
    );

    if (!res.ok) {
      setGlobalError("Couldn't fetch withdrawals. Please try again later.");
      return;
    }

    const data = await res.json();
    setWithdrawals((prevClients) => [...prevClients, ...data.data.withdrawals]);
    setPagination(data.data.pagination);

    setLoading(false);

    fetchDataRef.current = false;
  }, [currentPage, status]);

  const fetchDataRef = useRef(false);
  useEffect(() => {
    if (!fetchDataRef.current) {
      if (searchParams.get('reload')) {
        setWithdrawals([]);
        setPagination({
          currentPage: 0,
          totalItems: 0,
          totalPages: 0,
          perPage: 0,
        });
        setCurrentPage(1);
        setSearchParams({ ...searchParams, reload: undefined });
        navigate('/admin/withdrawals');
        return;
      }

      fetchDataRef.current = true;
      fetchData();
    }
  }, [fetchData, navigate, searchParams, setSearchParams]);

  if (globalError)
    return (
      <ErrorModule
        errorMessage={globalError}
        onClose={() => navigate('/admin')}
      />
    );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 xl:px-8">
      {isUpdateWithdrawalModalOpen && (
        <CategoryModal onClose={() => setIsUpdateWithdrawalModalOpen(false)} />
      )}

      <div className="py-6 xl:py-12">
        <div className="text-center pb-6 flex items-center justify-between flex-col xl:flex-row gap-4">
          <h1 className="font-bold text-xl xl:text-5xl font-heading text-gray-900">
            Withdrawals
          </h1>
        </div>

        <div className="mb-6">
          <select
            className="w-full lg:w-1/3 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
            onChange={handleStatusChange}
            value={status}
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div
          className="relative overflow-x-auto shadow-md rounded-lg max-h-[70vh]"
          id="table"
          ref={tableElement}
        >
          <InfiniteScroll
            dataLength={withdrawals.length}
            next={() => setCurrentPage((prev) => prev + 1)}
            hasMore={pagination.currentPage < pagination.totalPages}
            loader={<TableLoader />}
            scrollableTarget="table"
          >
            <div className="block w-full overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 xl:px-6 xl:py-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-left">
                      ID
                    </th>
                    <th className="hidden px-3 py-2 xl:px-6 xl:py-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-left">
                      Status
                    </th>
                    <th className="hidden xl:table-cell px-3 py-2 xl:px-6 xl:py-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-left">
                      Freelancer Name
                    </th>
                    <th className="px-3 py-2 xl:px-6 xl:py-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-left">
                      Freelancer Username
                    </th>
                    <th className="px-3 py-2 xl:px-6 xl:py-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-left">
                      Amount
                    </th>
                    <th className="hidden xl:table-cell px-3 py-2 xl:px-6 xl:py-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-left">
                      Payment Method
                    </th>
                    <th className="hidden xl:table-cell px-3 py-2 xl:px-6 xl:py-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-left">
                      Payment Username
                    </th>
                    <th className="hidden xl:table-cell px-3 py-2 xl:px-6 xl:py-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-left">
                      Requested At
                    </th>
                    <th className="px-3 py-2 xl:px-6 xl:py-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-left">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading && (
                    <>
                      <TableSkeleton
                        columns={9}
                        className="xl:table-row hidden"
                      />
                      <TableSkeleton columns={4} className="xl:hidden" />
                    </>
                  )}
                  {withdrawals.map((withdrawal: Withdrawal) => (
                    <WithdrawalRowItem
                      key={withdrawal.id}
                      withdrawal={withdrawal}
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

export default Withdrawals;
