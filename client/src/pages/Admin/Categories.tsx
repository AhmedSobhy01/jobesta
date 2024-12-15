import CategoryModal from '@/components/Admin/Categories/CategoryModal';
import CategoryRowItem from '@/components/Admin/Categories/CategoryRowItem';
import TableLoader from '@/components/Common/TableLoader';
import TableSkeleton from '@/components/Skeletons/TableSkeleton';
import { useContext, useEffect, useRef, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import ErrorModule from '@/components/ErrorModule';
import { useNavigate, useSearchParams } from 'react-router';
import UserContext from '@/store/userContext';

const Categories = () => {
  const navigate = useNavigate();
  const user = useContext(UserContext);

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
            Authorization: `Bearer ${user.jwtToken}`,
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
  }, [user.jwtToken, currentPage, searchParams, navigate, setSearchParams]);

  if (globalError)
    return (
      <ErrorModule
        errorMessage={globalError}
        onClose={() => navigate('/admin')}
      />
    );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {isCreateCategoryModalOpen && (
        <CategoryModal onClose={() => setIsCreateCategoryModalOpen(false)} />
      )}

      <div className="py-9 lg:py-12">
        <div className="text-center pb-6 flex items-center justify-between flex-col lg:flex-row gap-10">
          <h1 className="font-bold text-3xl lg:text-5xl font-heading text-gray-900">
            Categories
          </h1>

          <button
            type="button"
            className="px-5 py-2 bg-blue-600 text-white rounded-lg font-medium focus:outline-none hover:bg-blue-700 transition-colors duration-300 ease-in-out w-full lg:w-auto"
            onClick={() => setIsCreateCategoryModalOpen(true)}
          >
            Add Category
          </button>
        </div>

        <div
          className="relative overflow-x-auto shadow-md sm:rounded-lg max-h-[70vh]"
          id="table"
        >
          <InfiniteScroll
            dataLength={categories.length}
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
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Description
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading && <TableSkeleton columns={3} />}

                {categories.map((category: JobCategory) => (
                  <CategoryRowItem key={category.id} category={category} />
                ))}
              </tbody>
            </table>
          </InfiniteScroll>
        </div>
      </div>
    </div>
  );
};

export default Categories;
