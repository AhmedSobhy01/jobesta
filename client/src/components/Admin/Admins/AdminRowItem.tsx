import React, { useContext, useState } from 'react';
import Swal from 'sweetalert2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEye,
  faCheck,
  faPenToSquare,
  faTimes,
  faTrash,
  faInfoCircle,
} from '@fortawesome/free-solid-svg-icons';
import AdminModal from '@/components/Admin/Admins/AdminModal';
import UserContext from '@/store/userContext';
import { toast } from 'react-toastify';
import { useNavigate, Link } from 'react-router';
import { getAuthJwtToken } from '@/utils/auth';

const AdminRowItem: React.FC<{
  admin: Account;
}> = ({ admin }) => {
  const navigate = useNavigate();
  const user = useContext(UserContext);

  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditAccountModalOpen, setIsEditAccountModalOpen] = useState(false);

  const deleteAdmin = () => {
    Swal.fire({
      title: 'Are you sure?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#F44336',
      cancelButtonColor: '#3085d6',
      cancelButtonText: 'Cancel',
      confirmButtonText: 'Yes, delete admin',
      showLoaderOnConfirm: true,
      allowOutsideClick: () => !Swal.isLoading(),
      backdrop: true,
      preConfirm: () => {
        fetch(`${import.meta.env.VITE_API_URL}/admin/accounts/${admin.id}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${getAuthJwtToken()}`,
          },
        })
          .then((response) => {
            if (!response.ok) {
              if (response.status === 422) {
                response.json().then((data) => {
                  Object.keys(data.errors).forEach((key) => {
                    toast(data.errors[key], { type: 'error' });
                  });
                });
                throw new Error('Validation error');
              }

              throw new Error('Failed to delete admin');
            }

            return response.json();
          })
          .then((data) => {
            toast(data.message, { type: 'success' });
            navigate('/admin/admins?reload=true');
          })
          .catch((error) => {
            if (error.message !== 'Validation error')
              toast('Failed to delete admin', { type: 'error' });
          });
      },
    });
  };

  return (
    <>
      {isEditAccountModalOpen && (
        <AdminModal
          admin={admin}
          onClose={() => setIsEditAccountModalOpen(false)}
        />
      )}

      <tr className="bg-white border-b hover:bg-gray-50">
        <td className="px-3 py-2 2xl:px-6 2xl:py-4 text-sm text-gray-900">
          <div className="flex items-center gap-2">
            {admin.id}
            <button
              className="2xl:hidden text-gray-500"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <FontAwesomeIcon icon={faInfoCircle} />
            </button>
          </div>
        </td>
        <td className="hidden 2xl:table-cell px-3 py-2 2xl:px-6 2xl:py-4 text-sm text-gray-900">
          {admin.firstName}
        </td>
        <td className="hidden 2xl:table-cell px-3 py-2 2xl:px-6 2xl:py-4 text-sm text-gray-900">
          {admin.lastName}
        </td>
        <td className="2xl:table-cell px-3 py-2 2xl:px-6 2xl:py-4 text-sm text-gray-900">
          {admin.username}
        </td>
        <td className="hidden 2xl:table-cell px-3 py-2 2xl:px-6 2xl:py-4 text-sm text-gray-900">
          {admin.email}
        </td>
        <td className="hidden 2xl:table-cell px-3 py-2 2xl:px-6 2xl:py-4 text-sm text-gray-900">
          {admin.isBanned ? (
            <FontAwesomeIcon icon={faCheck} className="text-red-500" />
          ) : (
            <FontAwesomeIcon icon={faTimes} className="text-green-500" />
          )}
        </td>
        <td className="hidden 2xl:table-cell px-3 py-2 2xl:px-6 2xl:py-4 text-sm text-gray-900">
          {admin.createdAt}
        </td>
        <td className="px-3 py-2 2xl:px-6 2xl:py-4 text-sm text-gray-900">
          <div className="flex gap-4">
            <Link
              to={`/users/${admin.username}`}
              className="text-blue-600 hover:text-blue-900"
            >
              <FontAwesomeIcon icon={faEye} />
            </Link>

            <button
              type="button"
              onClick={() => setIsEditAccountModalOpen(true)}
              className="text-gray-600 hover:text-gray-900"
            >
              <FontAwesomeIcon icon={faPenToSquare} />
            </button>

            {admin.username !== user.username && (
              <button
                type="button"
                onClick={deleteAdmin}
                className="text-red-600 hover:text-red-900"
              >
                <FontAwesomeIcon icon={faTrash} />
              </button>
            )}
          </div>
        </td>
      </tr>

      {isExpanded && (
        <tr className="2xl:hidden bg-gray-50">
          <td colSpan={8} className="px-3 py-2">
            <div className="space-y-2">
              <p>
                <span className="font-medium">First Name:</span>{' '}
                {admin.firstName}
              </p>
              <p>
                <span className="font-medium">Last Name:</span> {admin.lastName}
              </p>
              <p>
                <span className="font-medium">Username:</span> {admin.username}
              </p>
              <p>
                <span className="font-medium">Email:</span> {admin.email}
              </p>
              <p>
                <span className="font-medium">Banned:</span>{' '}
                {admin.isBanned ? 'Yes' : 'No'}
              </p>
              <p>
                <span className="font-medium">Created At:</span>{' '}
                {admin.createdAt}
              </p>
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

export default AdminRowItem;
