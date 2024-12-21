import BadgeRowItem from '@/components/Admin/Badges/BadgeRowItem';
import TableLoader from '@/components/Common/TableLoader';
import TableSkeleton from '@/components/Skeletons/TableSkeleton';
import { useEffect, useRef, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import ErrorModule from '@/components/ErrorModule';
import { useNavigate, useSearchParams } from 'react-router';
import { getAuthJwtToken } from '@/utils/auth';

const Badges = () => {
  const navigate = useNavigate();

  const [globalError, setGlobalError] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();

  const [badges, setBadges] = useState<Badge[]>([]);
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
        `${import.meta.env.VITE_API_URL}/admin/badges?page=${currentPage}`,
        {
          headers: {
            Authorization: `Bearer ${getAuthJwtToken()}`,
          },
        },
      );

      if (!res.ok) {
        setGlobalError("Couldn't fetch badges. Please try again later.");
        return;
      }

      const data = await res.json();
      setBadges((prevClients) => [...prevClients, ...data.data.badges]);
      setPagination(data.data.pagination);

      setLoading(false);

      fetchDataRef.current = false;
    };

    if (!fetchDataRef.current) {
      if (searchParams.get('reload')) {
        setBadges([]);
        setPagination({
          currentPage: 0,
          totalItems: 0,
          totalPages: 0,
          perPage: 0,
        });
        setCurrentPage(1);
        setSearchParams({ ...searchParams, reload: undefined });
        navigate('/admin/badges');
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
    <div className="w-full max-w-[95%] sm:max-w-[90%] lg:max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 xl:px-8">
      <div className="py-4 sm:py-6 lg:py-8 xl:py-12">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900">
            Badges
          </h1>
        </div>

        <div className="bg-white rounded-lg shadow-md">
          <div
            className="relative overflow-x-auto max-h-[70vh]"
            id="badges-table"
          >
            <InfiniteScroll
              dataLength={badges.length}
              next={() => setCurrentPage((prev) => prev + 1)}
              hasMore={pagination.currentPage < pagination.totalPages}
              loader={<TableLoader />}
              scrollableTarget="badges-table"
            >
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sm:table-header-group">
                  <tr>
                    <th className="px-3 py-2 lg:px-4 xl:px-6 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-3 py-2 lg:px-4 xl:px-6 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="hidden lg:table-cell px-3 py-2 lg:px-4 xl:px-6 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="hidden lg:table-cell px-3 py-2 lg:px-4 xl:px-6 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Icon
                    </th>
                    <th className="px-3 py-2 lg:px-4 xl:px-6 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="bg-white divide-y divide-gray-200">
                  {loading && (
                    <>
                      <TableSkeleton
                        columns={5}
                        className="lg:table-row hidden"
                      />
                      <TableSkeleton columns={3} className="lg:hidden" />
                    </>
                  )}
                  {badges.map((badge) => (
                    <BadgeRowItem key={badge.id} badge={badge} />
                  ))}
                </tbody>
              </table>

              {!loading && badges.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-sm sm:text-base">
                    No badges found. Create your first badge to get started.
                  </p>
                </div>
              )}
            </InfiniteScroll>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Badges;
