import AdminModal from '@/components/Admin/Admins/AdminModal';
import AdminRowItem from '@/components/Admin/Admins/AdminRowItem.tsx';
import TableLoader from '@/components/Common/TableLoader';
import TableSkeleton from '@/components/Skeletons/TableSkeleton';
import { useEffect, useRef, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import ErrorModule from '@/components/ErrorModule';
import { useNavigate, useSearchParams } from 'react-router';
import { getAuthJwtToken } from '@/utils/auth';
import { useDebounce } from '@/utils/hooks/useDebounce';

const Admins = () => {
  const navigate = useNavigate();

  const [globalError, setGlobalError] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const tableElement = useRef<HTMLDivElement | null>(null);

  const [admins, setAdmins] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationData>({
    currentPage: 0,
    totalItems: 0,
    totalPages: 0,
    perPage: 0,
  });

  const [searchQuery, setSearchQuery] = useState('');
  const handleSearchInputChange = useDebounce(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value);
      setCurrentPage(1);
    },
    300,
  );

  const [isCreateAdminModalOpen, setIsCreateAdminModalOpen] = useState(false);

  const fetchDataRef = useRef(false);
  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/admin/accounts?page=${currentPage}&role=admin${searchQuery ? `&search=${searchQuery}` : ''}`,
        {
          headers: {
            Authorization: `Bearer ${getAuthJwtToken()}`,
          },
        },
      );

      if (!res.ok) {
        setGlobalError("Couldn't fetch admins. Please try again later.");
        return;
      }

      const data = await res.json();
      if (currentPage === 1) {
        if (tableElement.current) tableElement.current.scrollTo({ top: 0 });

        setAdmins(data.data.accounts);
      } else setAdmins((prevAdmins) => [...prevAdmins, ...data.data.accounts]);

      setPagination(data.data.pagination);

      setLoading(false);

      fetchDataRef.current = false;
    };

    if (!fetchDataRef.current) {
      if (searchParams.get('reload')) {
        setAdmins([]);
        setPagination({
          currentPage: 0,
          totalItems: 0,
          totalPages: 0,
          perPage: 0,
        });
        setCurrentPage(1);
        setSearchParams({ ...searchParams, reload: undefined });
        navigate('/admin/admins');
        return;
      }

      fetchDataRef.current = true;
      fetchData();
    }
  }, [currentPage, searchParams, navigate, setSearchParams, searchQuery]);

  if (globalError)
    return (
      <ErrorModule
        errorMessage={globalError}
        onClose={() => navigate('/admin')}
      />
    );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {isCreateAdminModalOpen && (
        <AdminModal onClose={() => setIsCreateAdminModalOpen(false)} />
      )}

      <div className="py-9 lg:py-12">
        <div className="text-center pb-6 flex items-center justify-between flex-col lg:flex-row gap-10">
          <h1 className="font-bold text-3xl lg:text-5xl font-heading text-gray-900">
            Admins
          </h1>

          <button
            type="button"
            className="px-5 py-2 bg-blue-600 text-white rounded-lg font-medium focus:outline-none hover:bg-blue-700 transition-colors duration-300 ease-in-out w-full lg:w-auto"
            onClick={() => setIsCreateAdminModalOpen(true)}
          >
            Add Admin
          </button>
        </div>

        <div className="mb-6">
          <input
            type="text"
            placeholder="Search admins..."
            className="w-full lg:w-1/3 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            onChange={handleSearchInputChange}
          />
        </div>

        <div
          className="relative overflow-x-auto shadow-md sm:rounded-lg max-h-[70vh]"
          id="table"
          ref={tableElement}
        >
          <InfiniteScroll
            dataLength={admins.length}
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
                    First Name
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Last Name
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Username
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Email
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Banned
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Created At
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading && <TableSkeleton columns={8} />}

                {admins.map((admin: Account) => (
                  <AdminRowItem key={admin.id} admin={admin} />
                ))}
              </tbody>
            </table>
          </InfiniteScroll>
        </div>
      </div>
    </div>
  );
};

export default Admins;
