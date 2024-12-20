import ClientModal from '@/components/Admin/Clients/ClientModal';
import ClientRowItem from '@/components/Admin/Clients/ClientRowItem';
import TableLoader from '@/components/Common/TableLoader';
import TableSkeleton from '@/components/Skeletons/TableSkeleton';
import { useEffect, useRef, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import ErrorModule from '@/components/ErrorModule';
import { useNavigate, useSearchParams } from 'react-router';
import { getAuthJwtToken } from '@/utils/auth';

const Clients = () => {
  const navigate = useNavigate();

  const [globalError, setGlobalError] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();

  const [clients, setClients] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationData>({
    currentPage: 0,
    totalItems: 0,
    totalPages: 0,
    perPage: 0,
  });

  const [isCreateAdminModalOpen, setIsCreateClientModalOpen] = useState(false);

  const fetchDataRef = useRef(false);
  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/admin/accounts?page=${currentPage}&role=client`,
        {
          headers: {
            Authorization: `Bearer ${getAuthJwtToken()}`,
          },
        },
      );

      if (!res.ok) {
        setGlobalError("Couldn't fetch clients. Please try again later.");
        return;
      }

      const data = await res.json();
      setClients((prevClients) => [...prevClients, ...data.data.accounts]);
      setPagination(data.data.pagination);

      setLoading(false);

      fetchDataRef.current = false;
    };

    if (!fetchDataRef.current) {
      if (searchParams.get('reload')) {
        setClients([]);
        setPagination({
          currentPage: 0,
          totalItems: 0,
          totalPages: 0,
          perPage: 0,
        });
        setCurrentPage(1);
        setSearchParams({ ...searchParams, reload: undefined });
        navigate('/admin/clients');
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 2xl:px-8">
      {isCreateAdminModalOpen && (
        <ClientModal onClose={() => setIsCreateClientModalOpen(false)} />
      )}

      <div className="py-6 2xl:py-12">
        <div className="text-center pb-6 flex items-center justify-between flex-col 2xl:flex-row gap-4">
          <h1 className="font-bold text-2xl 2xl:text-5xl font-heading text-gray-900">
            Clients
          </h1>

          <button
            type="button"
            className="px-5 py-2 bg-blue-600 text-white rounded-lg font-medium focus:outline-none hover:bg-blue-700 transition-colors duration-300 ease-in-out w-full 2xl:w-auto"
            onClick={() => setIsCreateClientModalOpen(true)}
          >
            Add Client
          </button>
        </div>

        <div
          className="relative overflow-x-auto shadow-md rounded-lg max-h-[70vh]"
          id="table"
        >
          <InfiniteScroll
            dataLength={clients.length}
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
                      className=" 2xl:table-cell px-3 py-2 2xl:px-6 2xl:py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-left"
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
                  {clients.map((client: Account) => (
                    <ClientRowItem key={client.id} client={client} />
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

export default Clients;
