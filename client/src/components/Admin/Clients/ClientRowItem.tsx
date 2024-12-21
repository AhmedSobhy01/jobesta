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
  faNewspaper,
} from '@fortawesome/free-solid-svg-icons';

import ClientModal from '@/components/Admin/Clients/ClientModal';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router';
import { Link } from 'react-router';
import { getAuthJwtToken } from '@/utils/auth';
import AccountPaymentsModal from '@/components/Admin/Payments/AccountPaymentsModal';

const ClientRowItem: React.FC<{
  client: Account;
}> = ({ client }) => {
  const navigate = useNavigate();

  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditAccountModalOpen, setIsEditAccountModalOpen] = useState(false);
  const [isShowClientPaymentsModalOpen, setIsShowClientPaymentsModalOpen] =
    useState(false);

  const banClient = () => {
    Swal.fire({
      title: 'Are you sure?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#F44336',
      cancelButtonColor: '#3085d6',
      cancelButtonText: 'Cancel',
      confirmButtonText: 'Yes, ban client',
      showLoaderOnConfirm: true,
      allowOutsideClick: () => !Swal.isLoading(),
      backdrop: true,
      preConfirm: () => {
        fetch(
          `${import.meta.env.VITE_API_URL}/admin/accounts/ban/${client.id}`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${getAuthJwtToken()}`,
            },
          },
        )
          .then((response) => {
            if (!response.ok) throw new Error('Failed to ban client');

            return response.json();
          })
          .then((data) => {
            toast(data.message, { type: 'success' });
            navigate('/admin/clients?reload=true');
          })
          .catch(() => {
            toast('Failed to ban client', { type: 'error' });
          });
      },
    });
  };

  const unbanClient = () => {
    Swal.fire({
      title: 'Are you sure?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#F44336',
      cancelButtonColor: '#3085d6',
      cancelButtonText: 'Cancel',
      confirmButtonText: 'Yes, unban client',
      showLoaderOnConfirm: true,
      allowOutsideClick: () => !Swal.isLoading(),
      backdrop: true,
      preConfirm: () => {
        fetch(
          `${import.meta.env.VITE_API_URL}/admin/accounts/unban/${client.id}`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${getAuthJwtToken()}`,
            },
          },
        )
          .then((response) => {
            if (!response.ok) throw new Error('Failed to unban client');

            return response.json();
          })
          .then((data) => {
            toast(data.message, { type: 'success' });
            navigate('/admin/clients?reload=true');
          })
          .catch(() => {
            toast('Failed to unban client', { type: 'error' });
          });
      },
    });
  };

  const deleteClient = () => {
    Swal.fire({
      title: 'Are you sure?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#F44336',
      cancelButtonColor: '#3085d6',
      cancelButtonText: 'Cancel',
      confirmButtonText: 'Yes, delete client',
      showLoaderOnConfirm: true,
      allowOutsideClick: () => !Swal.isLoading(),
      backdrop: true,
      preConfirm: () => {
        fetch(`${import.meta.env.VITE_API_URL}/admin/accounts/${client.id}`, {
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

              throw new Error('Failed to delete client');
            }

            return response.json();
          })
          .then((data) => {
            toast(data.message, { type: 'success' });
            navigate('/admin/clients?reload=true');
          })
          .catch((error) => {
            if (error.message !== 'Validation error')
              toast('Failed to delete client', { type: 'error' });
          });
      },
    });
  };

  return (
    <>
      {isEditAccountModalOpen && (
        <ClientModal
          client={client}
          onClose={() => setIsEditAccountModalOpen(false)}
        />
      )}

      {isShowClientPaymentsModalOpen && (
        <AccountPaymentsModal
          accountId={client.id}
          role="client"
          onClose={() => setIsShowClientPaymentsModalOpen(false)}
        />
      )}

      <tr className="bg-white border-b hover:bg-gray-50">
        <td className="px-3 py-2 xl:px-6 xl:py-4 text-sm text-gray-900">
          <div className="flex items-center gap-2">
            {client.id}
            <button
              className="xl:hidden text-gray-500"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <FontAwesomeIcon icon={faInfoCircle} />
            </button>
          </div>
        </td>
        <td className="hidden xl:table-cell px-3 py-2 xl:px-6 xl:py-4 text-sm text-gray-900">
          {client.firstName}
        </td>
        <td className="hidden xl:table-cell px-3 py-2 xl:px-6 xl:py-4 text-sm text-gray-900">
          {client.lastName}
        </td>
        <td className=" xl:table-cell px-3 py-2 xl:px-6 xl:py-4 text-sm text-gray-900">
          {client.username}
        </td>
        <td className="hidden xl:table-cell px-3 py-2 xl:px-6 xl:py-4 text-sm text-gray-900">
          {client.email}
        </td>
        <td className="hidden xl:table-cell px-3 py-2 xl:px-6 xl:py-4 text-sm text-gray-900">
          {client.isBanned ? (
            <FontAwesomeIcon icon={faCheck} className="text-red-500" />
          ) : (
            <FontAwesomeIcon icon={faTimes} className="text-green-500" />
          )}
        </td>
        <td className="hidden xl:table-cell px-3 py-2 xl:px-6 xl:py-4 text-sm text-gray-900">
          {client.createdAt}
        </td>
        <td className="px-3 py-2 xl:px-6 xl:py-4 text-sm text-gray-900">
          <div className="flex gap-4">
            <Link
              to={`/users/${client.username}`}
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

            {client.isBanned ? (
              <button
                type="button"
                onClick={unbanClient}
                className="text-green-600 hover:text-green-900"
                title="Unban client"
              >
                <FontAwesomeIcon icon={faCheck} />
              </button>
            ) : (
              <button
                type="button"
                onClick={banClient}
                className="text-red-600 hover:text-red-900"
                title="Ban client"
              >
                <FontAwesomeIcon icon={faBan} />
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsShowClientPaymentsModalOpen(true)}
              className="text-cyan-600 hover:text-cyan-900"
              title="Show payments"
            >
              <FontAwesomeIcon icon={faNewspaper} />
            </button>

            <button
              type="button"
              onClick={deleteClient}
              className="text-red-600 hover:text-red-900"
            >
              <FontAwesomeIcon icon={faTrash} />
            </button>
          </div>
        </td>
      </tr>

      {isExpanded && (
        <tr className="xl:hidden bg-gray-50">
          <td colSpan={8} className="px-3 py-2">
            <div className="space-y-2">
              <p>
                <span className="font-medium">First Name:</span>{' '}
                {client.firstName}
              </p>
              <p>
                <span className="font-medium">Last Name:</span>{' '}
                {client.lastName}
              </p>
              <p>
                <span className="font-medium">Username:</span> {client.username}
              </p>
              <p>
                <span className="font-medium">Email:</span> {client.email}
              </p>
              <p>
                <span className="font-medium">Banned:</span>{' '}
                {client.isBanned ? 'Yes' : 'No'}
              </p>
              <p>
                <span className="font-medium">Created At:</span>{' '}
                {client.createdAt}
              </p>
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

export default ClientRowItem;
