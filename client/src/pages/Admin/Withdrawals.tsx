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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {isUpdateWithdrawalModalOpen && (
        <CategoryModal onClose={() => setIsUpdateWithdrawalModalOpen(false)} />
      )}

      <div className="py-9 lg:py-12">
        <div className="text-center pb-6 flex items-center justify-between flex-col lg:flex-row gap-10">
          <h1 className="font-bold text-3xl lg:text-5xl font-heading text-gray-900">
            Withdrawals
          </h1>
        </div>

        <div className="mb-6 flex justify-end items-center gap-4">
          <select
            className="w-full lg:w-64 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
            onChange={handleStatusChange}
            value={status}
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div
          className="relative overflow-x-auto shadow-md sm:rounded-lg max-h-[70vh]"
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
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3">
                    ID
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Freelancer Name
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Freelancer Username
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Amount
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Payment Method
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Payment Username
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Requested At
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading && <TableSkeleton columns={9} />}

                {withdrawals.map((withdrawal: Withdrawal) => (
                  <WithdrawalRowItem
                    key={withdrawal.id}
                    withdrawal={withdrawal}
                  />
                ))}
              </tbody>
            </table>
          </InfiniteScroll>
        </div>
      </div>
    </div>
  );
};

export default Withdrawals;
