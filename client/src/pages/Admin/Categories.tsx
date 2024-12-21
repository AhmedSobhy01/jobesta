import CategoryModal from '@/components/Admin/Categories/CategoryModal';
import CategoryRowItem from '@/components/Admin/Categories/CategoryRowItem';
import TableLoader from '@/components/Common/TableLoader';
import TableSkeleton from '@/components/Skeletons/TableSkeleton';
import { useEffect, useRef, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import ErrorModule from '@/components/ErrorModule';
import { useNavigate, useSearchParams } from 'react-router';
import { getAuthJwtToken } from '@/utils/auth';

const Categories = () => {
  const navigate = useNavigate();

  const [globalError, setGlobalError] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();

  const [categories, setCategories] = useState<JobCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationData>({
    currentPage: 0,
    totalItems: 0,
    totalPages: 0,
    perPage: 0,
  });

  const [isCreateCategoryModalOpen, setIsCreateCategoryModalOpen] =
    useState(false);

  const fetchDataRef = useRef(false);
  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/admin/categories?page=${currentPage}`,
        {
          headers: {
            Authorization: `Bearer ${getAuthJwtToken()}`,
          },
        },
      );

      if (!res.ok) {
        setGlobalError("Couldn't fetch categories. Please try again later.");
        return;
      }

      const data = await res.json();
      setCategories((prevClients) => [...prevClients, ...data.data.categories]);
      setPagination(data.data.pagination);

      setLoading(false);

      fetchDataRef.current = false;
    };

    if (!fetchDataRef.current) {
      if (searchParams.get('reload')) {
        setCategories([]);
        setPagination({
          currentPage: 0,
          totalItems: 0,
          totalPages: 0,
          perPage: 0,
        });
        setCurrentPage(1);
        setSearchParams({ ...searchParams, reload: undefined });
        navigate('/admin/categories');
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 xl:px-8">
      {isCreateCategoryModalOpen && (
        <CategoryModal onClose={() => setIsCreateCategoryModalOpen(false)} />
      )}

      <div className="py-6 xl:py-12">
        <div className="text-center pb-6 flex items-center justify-between flex-col xl:flex-row gap-4">
          <h1 className="font-bold text-xl xl:text-5xl font-heading text-gray-900">
            Categories
          </h1>

          <button
            type="button"
            className="px-5 py-2 bg-blue-600 text-white rounded-lg font-bold focus:outline-none hover:bg-blue-700 transition-colors duration-300 ease-in-out w-full xl:w-auto"
            onClick={() => setIsCreateCategoryModalOpen(true)}
          >
            Add Category
          </button>
        </div>

        <div
          className="relative overflow-x-auto shadow-md rounded-lg max-h-[70vh]"
          id="table"
        >
          <InfiniteScroll
            dataLength={categories.length}
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
                      className="px-3 py-2 xl:px-6 xl:py-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-left"
                    >
                      ID
                    </th>
                    <th
                      scope="col"
                      className=" xl:table-cell px-3 py-2 xl:px-6 xl:py-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-left"
                    >
                      Name
                    </th>
                    <th
                      scope="col"
                      className="hidden xl:table-cell px-3 py-2 xl:px-6 xl:py-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-left"
                    >
                      Description
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-2 xl:px-6 xl:py-3 text-xs font-bold text-gray-500 uppercase tracking-wider w-fit text-left"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading && (
                    <>
                      <TableSkeleton
                        columns={4}
                        className="xl:table-row hidden"
                      />
                      <TableSkeleton columns={3} className="xl:hidden" />
                    </>
                  )}
                  {categories.map((category: JobCategory) => (
                    <CategoryRowItem key={category.id} category={category} />
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

export default Categories;
