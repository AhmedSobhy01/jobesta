import React, { useState } from 'react';
import Swal from 'sweetalert2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faInfoCircle,
  faPenToSquare,
  faTrash,
} from '@fortawesome/free-solid-svg-icons';
import CategoryModal from '@/components/Admin/Categories/CategoryModal';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router';
import { getAuthJwtToken } from '@/utils/auth';

const CategoryRowItem: React.FC<{
  category: JobCategory;
}> = ({ category }) => {
  const navigate = useNavigate();

  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditAccountModalOpen, setIsEditAccountModalOpen] = useState(false);

  const deleteCategory = () => {
    Swal.fire({
      title: 'Are you sure?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#F44336',
      cancelButtonColor: '#3085d6',
      cancelButtonText: 'Cancel',
      confirmButtonText: 'Yes, delete Category',
      showLoaderOnConfirm: true,
      allowOutsideClick: () => !Swal.isLoading(),
      backdrop: true,
      preConfirm: () => {
        fetch(
          `${import.meta.env.VITE_API_URL}/admin/categories/${category.id}`,
          {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${getAuthJwtToken()}`,
            },
          },
        )
          .then((response) => {
            if (!response.ok) throw new Error('Failed to delete category');

            return response.json();
          })
          .then((data) => {
            toast(data.message, { type: 'success' });
            navigate('/admin/categories?reload=true');
          })
          .catch(() => {
            toast('Failed to delete category', { type: 'error' });
          });
      },
    });
  };

  return (
    <>
      {isEditAccountModalOpen && (
        <CategoryModal
          category={category}
          onClose={() => setIsEditAccountModalOpen(false)}
        />
      )}

      <tr className="bg-white border-b hover:bg-gray-50">
        <td className="px-3 py-2 xl:px-6 xl:py-4 text-sm text-gray-900">
          <div className="flex items-center gap-2">
            {category.id}
            <button
              className="xl:hidden text-gray-500"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <FontAwesomeIcon icon={faInfoCircle} />
            </button>
          </div>
        </td>
        <td className=" xl:table-cell px-3 py-2 xl:px-6 xl:py-4 text-sm text-gray-900">
          {category.name}
        </td>
        <td className="hidden xl:table-cell px-3 py-2 xl:px-6 xl:py-4 text-sm text-gray-900">
          {category.description}
        </td>
        <td className="px-3 py-2 xl:px-6 xl:py-4 text-sm text-gray-900">
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setIsEditAccountModalOpen(true)}
              className="text-gray-600 hover:text-gray-900"
            >
              <FontAwesomeIcon icon={faPenToSquare} />
            </button>
            <button
              type="button"
              onClick={deleteCategory}
              className="text-red-600 hover:text-red-900"
            >
              <FontAwesomeIcon icon={faTrash} />
            </button>
          </div>
        </td>
      </tr>

      {isExpanded && (
        <tr className="xl:hidden bg-gray-50">
          <td colSpan={4} className="px-3 py-2">
            <div className="space-y-2">
              <p>
                <span className="font-medium">Description:</span>{' '}
                {category.description}
              </p>
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

export default CategoryRowItem;
