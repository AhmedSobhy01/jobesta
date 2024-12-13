import {
  faChevronLeft,
  faChevronRight,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Pagination: React.FC<{
  pagination: PaginationData;
}> = ({ pagination }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const currentPage = pagination.currentPage;

  const pageLink = (page: number) => {
    const searchParams = new URLSearchParams(location.search);
    searchParams.set('page', page.toString());
    return `?${searchParams.toString()}`;
  };

  const handleNavigation = (page: number) => {
    const link = pageLink(page);
    navigate(link);
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  };

  return (
    <div className="flex flex-col md:flex-row justify-center md:justify-end mt-8">
      <div className="flex items-center gap-4">
        {currentPage > 1 && (
          <button
            onClick={() => handleNavigation(currentPage - 1)}
            className="flex items-center justify-center gap-2 md:gap-3 font-medium text-gray-500 rounded-full hover:text-gray-800"
          >
            <FontAwesomeIcon icon={faChevronLeft} />
            <span className="hidden md:inline">Prev</span>
          </button>
        )}

        {pagination.totalPages > 1 && (
          <ul className="flex flex-wrap items-center gap-2 md:gap-1 justify-center">
            {Array.from({ length: pagination.totalPages }).map((_, i) => (
              <li key={i}>
                <button
                  onClick={() => handleNavigation(i + 1)}
                  className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center font-medium ${
                    currentPage === i + 1
                      ? 'bg-emerald-300 hover:bg-emerald-400 text-gray-900'
                      : 'text-gray-600'
                  }`}
                >
                  {i + 1}
                </button>
              </li>
            ))}
          </ul>
        )}

        {currentPage < pagination.totalPages && (
          <button
            onClick={() => handleNavigation(currentPage + 1)}
            className="flex items-center justify-center gap-2 md:gap-3 font-medium text-gray-500 rounded-full hover:text-gray-800"
          >
            <span className="hidden md:inline">Next</span>
            <FontAwesomeIcon icon={faChevronRight} />
          </button>
        )}
      </div>
    </div>
  );
};

export default Pagination;
