import React, { useState } from 'react';
import Swal from 'sweetalert2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPenToSquare, faTrash } from '@fortawesome/free-solid-svg-icons';
import CategoryModal from '@/components/Admin/Categories/CategoryModal';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router';
import { getAuthJwtToken } from '@/utils/auth';

const CategoryRowItem: React.FC<{
  category: JobCategory;
}> = ({ category }) => {
  const navigate = useNavigate();

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

      <tr className="bg-white border-b">
        <th
          scope="row"
          className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap"
        >
          {category.id}
        </th>
        <td className="px-6 py-4 whitespace-nowrap">{category.name}</td>
        <td className="px-6 py-4 whitespace-nowrap">{category.description}</td>

        <td className="px-6 py-4 space-x-5 rtl:space-x-reverse whitespace-nowrap">
          <button type="button" onClick={() => setIsEditAccountModalOpen(true)}>
            <FontAwesomeIcon icon={faPenToSquare} />
          </button>

          <button type="button" onClick={deleteCategory}>
            <FontAwesomeIcon icon={faTrash} />
          </button>
        </td>
      </tr>
    </>
  );
};

export default CategoryRowItem;
