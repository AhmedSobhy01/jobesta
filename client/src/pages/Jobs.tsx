import { useCallback, useEffect, useRef, useState } from 'react';
import { useLoaderData, useNavigate, useSearchParams } from 'react-router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretDown, faSliders } from '@fortawesome/free-solid-svg-icons';
import MultiRangeSlider from '@/components/Common/MultiRangeSlider';
import ErrorModule from '@/components/ErrorModule';
import JobCard from '@/components/Jobs/JobCard';
import Pagination from '@/components/Common/Pagination';
import { useCategories } from '@/utils/hooks/useCategories';
import CategoryLoadingSkeleton from '@/components/Skeletons/CategoryLoadingSkeleton';

const MAX_BUDGET = 10000;

function Jobs() {
  const [isFiltersDropdownOpen, setIsFiltersDropdownOpen] = useState(false);

  const {
    jobs: { jobs, pagination },
  } = useLoaderData() as {
    jobs: { jobs: Job[]; pagination: PaginationData };
  };

  const {
    categories,
    loading: categoriesLoading,
    error: categoriesError,
  } = useCategories();

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const selectedSortOption = useRef('newest');
  const [filters, setFilters] = useState({
    categories: (searchParams.get('categories') || '')
      .split(',')
      .filter(Boolean)
      .join(','),
    minBudget: parseInt(searchParams.get('minBudget') || '0'),
    maxBudget: parseInt(searchParams.get('maxBudget') || MAX_BUDGET.toString()),
    sortBy: searchParams.get('sortBy') || 'created_at',
    sortOrder: searchParams.get('sortOrder') || 'desc',
  });

  useEffect(() => {
    setFilters({
      categories: searchParams.get('categories') || '',
      minBudget: parseInt(searchParams.get('minBudget') || '0'),
      maxBudget: parseInt(
        searchParams.get('maxBudget') || MAX_BUDGET.toString(),
      ),
      sortBy: searchParams.get('sortBy') || 'created_at',
      sortOrder: searchParams.get('sortOrder') || 'desc',
    });
  }, [searchParams]);

  const handleFiltersChange = useCallback(
    (newFilters: Record<string, string | number | undefined>) => {
      const updatedFilters = { ...filters, ...newFilters };

      if (
        Object.keys(updatedFilters).every(
          (key) =>
            updatedFilters[key as keyof typeof updatedFilters] ===
            filters[key as keyof typeof updatedFilters],
        )
      )
        return;

      setFilters(updatedFilters);

      const updatedSearchParams = new URLSearchParams({
        page: '1',
        categories: updatedFilters.categories,
        minBudget: updatedFilters.minBudget.toString(),
        maxBudget: updatedFilters.maxBudget.toString(),
        sortBy: updatedFilters.sortBy,
        sortOrder: updatedFilters.sortOrder,
      });

      navigate(`/jobs?${updatedSearchParams.toString()}`);
    },
    [filters, navigate],
  );

  const handleSortChange = (sortOption: string) => {
    let sortBy = 'created_at';
    let sortOrder = 'desc';

    switch (sortOption) {
      case 'budgetLowToHigh':
        sortBy = 'budget';
        sortOrder = 'asc';
        break;
      case 'budgetHighToLow':
        sortBy = 'budget';
        sortOrder = 'desc';
        break;
      case 'oldest':
        sortBy = 'created_at';
        sortOrder = 'asc';
        break;
    }

    selectedSortOption.current = sortOption;
    handleFiltersChange({ sortBy, sortOrder });
  };

  const handleCategoryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const category = event.target.id.split('-')[1];
    const updatedCategories = filters.categories.split(',').filter(Boolean);

    if (updatedCategories.includes(category)) {
      updatedCategories.splice(updatedCategories.indexOf(category), 1);
    } else {
      updatedCategories.push(category);
    }

    handleFiltersChange({
      categories: updatedCategories.join(','),
    });
  };

  const onBudgetChange = useCallback(
    (value: { min: number; max: number }) => {
      handleFiltersChange({
        minBudget: value.min,
        maxBudget: value.max,
      });
    },
    [handleFiltersChange],
  );

  if (categoriesError) {
    return (
      <ErrorModule
        onClose={() => navigate('/')}
        errorMessage={categoriesError}
      />
    );
  }

  return (
    <div className="py-10">
      <h1 className="text-center w-full max-w-screen-xl mx-auto px-5 text-3xl font-bold lg:text-4xl">
        Jobs
      </h1>

      <div className="w-full max-w-screen-xl mx-auto px-5 mt-5">
        <div className="flex flex-col flex-wrap gap-8 mt-16 lg:gap-16 md:flex-row">
          <div className="w-full lg:w-52">
            <div>
              <div className="lg:hidden">
                <button
                  className="flex items-center justify-between w-full gap-2 px-3 py-3 text-gray-700 border rounded-md"
                  type="button"
                  onClick={() => setIsFiltersDropdownOpen((prev) => !prev)}
                >
                  <div className="flex items-center gap-4">
                    <FontAwesomeIcon icon={faSliders} />
                    <span>Filters</span>
                  </div>

                  <FontAwesomeIcon icon={faCaretDown} />
                </button>
              </div>

              <div
                className={`flex flex-col lg:grid md:grid-cols-3 lg:grid-cols-1 mt-8 lg:mt-0 gap-8 max-w-xs md:max-w-full ${isFiltersDropdownOpen ? '' : 'hidden'}`}
              >
                <h3 className="text-xl font-medium hidden lg:block">
                  <span className="hidden lg:inline">Filters</span>
                </h3>

                <div>
                  <h3 className="text-xl font-medium ">Category</h3>

                  <ul className="grid gap-3 mt-6">
                    {categoriesLoading && <CategoryLoadingSkeleton />}

                    {categories.map((category) => (
                      <li className="text-gray-500" key={category.id}>
                        <label
                          className="flex items-center gap-3"
                          htmlFor={`category-${category.id}`}
                        >
                          <input
                            type="checkbox"
                            id={`category-${category.id}`}
                            className="w-5 h-5 border-gray-300 rounded form-checkbox text-emerald-500 focus:ring focus:ring-offset-0 focus:ring-opacity-50"
                            onChange={handleCategoryChange}
                            checked={filters.categories
                              .split(',')
                              .includes(category.id.toString())}
                          />
                          <div>
                            {category.name}
                            <span className="ml-1 text-sm text-gray-400">
                              ({category.jobsCount})
                            </span>
                          </div>
                        </label>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-medium">Budget</h3>
                  <MultiRangeSlider
                    min={0}
                    max={10000}
                    initialMin={filters.minBudget}
                    initialMax={filters.maxBudget}
                    onChange={onBudgetChange}
                    className="mt-4"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 w-full">
            <div className="flex justify-between items-center">
              <div>Showing {jobs.length} results</div>
              <div>
                <label htmlFor="sort" className="mr-2 text-gray-600">
                  Sort by:
                </label>
                <select
                  id="sort"
                  value={selectedSortOption.current}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="px-3 py-2 border rounded-md"
                >
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                  <option value="budgetLowToHigh">Budget: Low to High</option>
                  <option value="budgetHighToLow">Budget: High to Low</option>
                </select>
              </div>
            </div>

            <div className="grid gap-6 mt-5 md:gap-10">
              {jobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>

            {jobs.length === 0 && (
              <div className="mt-10 text-center text-gray-500">
                No jobs found
              </div>
            )}

            <Pagination pagination={pagination} />
          </div>
        </div>
      </div>
    </div>
  );
}

Jobs.loader = async ({ request }: { request: Request }) => {
  const url = new URL(request.url);
  const queryParams = url.searchParams;

  const filteringSearchParams = new URLSearchParams({
    page: queryParams.get('page') || '1',
    categories: queryParams.get('categories') || '',
    minBudget: queryParams.get('minBudget') || '0',
    maxBudget: queryParams.get('maxBudget') || MAX_BUDGET.toString(),
    sortBy: queryParams.get('sortBy') || 'created_at',
    sortOrder: queryParams.get('sortOrder') || 'desc',
  });

  try {
    const jobsResponse = await fetch(
      `${import.meta.env.VITE_API_URL}/jobs?${filteringSearchParams.toString()}`,
    );

    if (!jobsResponse.ok) {
      return {
        status: false,
        error: (await jobsResponse.json()).message || 'Error fetching jobs',
      };
    }

    const jobsData = await jobsResponse.json();
    return {
      jobs: jobsData.data,
    };
  } catch {
    return {
      status: false,
      error: 'Error fetching jobs',
    };
  }
};

export default Jobs;
