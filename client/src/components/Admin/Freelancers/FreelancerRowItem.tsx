import React, { useState } from 'react';
import Swal from 'sweetalert2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBan,
  faCheck,
  faPenToSquare,
  faTimes,
  faTrash,
  faEye,
  faInfoCircle,
} from '@fortawesome/free-solid-svg-icons';
import FreelancerModal from '@/components/Admin/Freelancers/FreelancerModal';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router';
import { Link } from 'react-router';
import { getAuthJwtToken } from '@/utils/auth';

const FreelancerRowItem: React.FC<{
  freelancer: Account;
}> = ({ freelancer }) => {
  const navigate = useNavigate();

  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditAccountModalOpen, setIsEditAccountModalOpen] = useState(false);

  const banFreelancer = () => {
    Swal.fire({
      title: 'Are you sure?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#F44336',
      cancelButtonColor: '#3085d6',
      cancelButtonText: 'Cancel',
      confirmButtonText: 'Yes, ban freelancer',
      showLoaderOnConfirm: true,
      allowOutsideClick: () => !Swal.isLoading(),
      backdrop: true,
      preConfirm: () => {
        fetch(
          `${import.meta.env.VITE_API_URL}/admin/accounts/ban/${freelancer.id}`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${getAuthJwtToken()}`,
            },
          },
        )
          .then((response) => {
            if (!response.ok) throw new Error('Failed to ban freelancer');

            return response.json();
          })
          .then((data) => {
            toast(data.message, { type: 'success' });
            navigate('/admin/freelancers?reload=true');
          })
          .catch(() => {
            toast('Failed to ban freelancer', { type: 'error' });
          });
      },
    });
  };

  const unbanFreelancer = () => {
    Swal.fire({
      title: 'Are you sure?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#F44336',
      cancelButtonColor: '#3085d6',
      cancelButtonText: 'Cancel',
      confirmButtonText: 'Yes, unban freelancer',
      showLoaderOnConfirm: true,
      allowOutsideClick: () => !Swal.isLoading(),
      backdrop: true,
      preConfirm: () => {
        fetch(
          `${import.meta.env.VITE_API_URL}/admin/accounts/unban/${freelancer.id}`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${getAuthJwtToken()}`,
            },
          },
        )
          .then((response) => {
            if (!response.ok) throw new Error('Failed to unban freelancer');

            return response.json();
          })
          .then((data) => {
            toast(data.message, { type: 'success' });
            navigate('/admin/freelancers?reload=true');
          })
          .catch(() => {
            toast('Failed to unban freelancer', { type: 'error' });
          });
      },
    });
  };

  const deleteFreelancer = () => {
    Swal.fire({
      title: 'Are you sure?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#F44336',
      cancelButtonColor: '#3085d6',
      cancelButtonText: 'Cancel',
      confirmButtonText: 'Yes, delete freelancer',
      showLoaderOnConfirm: true,
      allowOutsideClick: () => !Swal.isLoading(),
      backdrop: true,
      preConfirm: () => {
        fetch(
          `${import.meta.env.VITE_API_URL}/admin/accounts/${freelancer.id}`,
          {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${getAuthJwtToken()}`,
            },
          },
        )
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

              throw new Error('Failed to delete freelancer');
            }

            return response.json();
          })
          .then((data) => {
            toast(data.message, { type: 'success' });
            navigate('/admin/freelancers?reload=true');
          })
          .catch((error) => {
            if (error.message !== 'Validation error')
              toast('Failed to delete freelancer', { type: 'error' });
          });
      },
    });
  };

  return (
    <>
      {isEditAccountModalOpen && (
        <FreelancerModal
          freelancer={freelancer}
          onClose={() => setIsEditAccountModalOpen(false)}
        />
      )}

      <tr className="bg-white border-b hover:bg-gray-50">
        <td className="px-3 py-2 2xl:px-6 2xl:py-4 text-sm text-gray-900">
          <div className="flex items-center gap-2">
            {freelancer.id}
            <button
              className="2xl:hidden text-gray-500"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <FontAwesomeIcon icon={faInfoCircle} />
            </button>
          </div>
        </td>
        <td className="hidden 2xl:table-cell px-3 py-2 2xl:px-6 2xl:py-4 text-sm text-gray-900">
          {freelancer.firstName}
        </td>
        <td className="hidden 2xl:table-cell px-3 py-2 2xl:px-6 2xl:py-4 text-sm text-gray-900">
          {freelancer.lastName}
        </td>
        <td className=" 2xl:table-cell px-3 py-2 2xl:px-6 2xl:py-4 text-sm text-gray-900">
          {freelancer.username}
        </td>
        <td className="hidden 2xl:table-cell px-3 py-2 2xl:px-6 2xl:py-4 text-sm text-gray-900">
          {freelancer.email}
        </td>
        <td className="hidden 2xl:table-cell px-3 py-2 2xl:px-6 2xl:py-4 text-sm text-gray-900">
          {freelancer.isBanned ? (
            <FontAwesomeIcon icon={faCheck} className="text-red-500" />
          ) : (
            <FontAwesomeIcon icon={faTimes} className="text-green-500" />
          )}
        </td>
        <td className="hidden 2xl:table-cell px-3 py-2 2xl:px-6 2xl:py-4 text-sm text-gray-900">
          {freelancer.createdAt}
        </td>
        <td className="px-3 py-2 2xl:px-6 2xl:py-4 text-sm text-gray-900">
          <div className="flex gap-4">
            <Link
              to={`/users/${freelancer.username}`}
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

            {freelancer.isBanned ? (
              <button
                type="button"
                onClick={unbanFreelancer}
                className="text-green-600 hover:text-green-900"
                title="Unban freelancer"
              >
                <FontAwesomeIcon icon={faCheck} />
              </button>
            ) : (
              <button
                type="button"
                onClick={banFreelancer}
                className="text-red-600 hover:text-red-900"
                title="Ban freelancer"
              >
                <FontAwesomeIcon icon={faBan} />
              </button>
            )}

            <button
              type="button"
              onClick={deleteFreelancer}
              className="text-red-600 hover:text-red-900"
            >
              <FontAwesomeIcon icon={faTrash} />
            </button>
          </div>
        </td>
      </tr>

      {isExpanded && (
        <tr className="2xl:hidden bg-gray-50">
          <td colSpan={8} className="px-3 py-2">
            <div className="space-y-2">
              <p>
                <span className="font-medium">First Name:</span>{' '}
                {freelancer.firstName}
              </p>
              <p>
                <span className="font-medium">Last Name:</span>{' '}
                {freelancer.lastName}
              </p>
              <p>
                <span className="font-medium">Username:</span>{' '}
                {freelancer.username}
              </p>
              <p>
                <span className="font-medium">Email:</span> {freelancer.email}
              </p>
              <p>
                <span className="font-medium">Banned:</span>{' '}
                {freelancer.isBanned ? 'Yes' : 'No'}
              </p>
              <p>
                <span className="font-medium">Created At:</span>{' '}
                {freelancer.createdAt}
              </p>
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

export default FreelancerRowItem;
