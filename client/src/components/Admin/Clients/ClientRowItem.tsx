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
} from '@fortawesome/free-solid-svg-icons';

import ClientModal from '@/components/Admin/Clients/ClientModal';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router';
import { Link } from 'react-router';
import { getAuthJwtToken } from '@/utils/auth';

const ClientRowItem: React.FC<{
  client: Account;
}> = ({ client }) => {
  const navigate = useNavigate();

  const [isEditAccountModalOpen, setIsEditAccountModalOpen] = useState(false);

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
            if (!response.ok) throw new Error('Failed to delete client');

            return response.json();
          })
          .then((data) => {
            toast(data.message, { type: 'success' });
            navigate('/admin/clients?reload=true');
          })
          .catch(() => {
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

      <tr className="bg-white border-b">
        <th
          scope="row"
          className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap"
        >
          {client.id}
        </th>
        <td className="px-6 py-4 whitespace-nowrap">{client.firstName}</td>
        <td className="px-6 py-4 whitespace-nowrap">{client.lastName}</td>
        <td className="px-6 py-4 whitespace-nowrap">{client.username}</td>
        <td className="px-6 py-4 whitespace-nowrap">{client.email}</td>
        <td className="px-6 py-4 whitespace-nowrap">
          {client.isBanned ? (
            <FontAwesomeIcon icon={faCheck} />
          ) : (
            <FontAwesomeIcon icon={faTimes} />
          )}
        </td>
        <td className="px-6 py-4 whitespace-nowrap">{client.createdAt}</td>
        <td className="px-6 py-4 space-x-5 rtl:space-x-reverse whitespace-nowrap">
          <Link to={`/users/${client.username}`}>
            <FontAwesomeIcon icon={faEye} />
          </Link>

          <button type="button" onClick={() => setIsEditAccountModalOpen(true)}>
            <FontAwesomeIcon icon={faPenToSquare} />
          </button>

          {client.isBanned ? (
            <button type="button" onClick={unbanClient} title="Unban client">
              <FontAwesomeIcon icon={faCheck} />
            </button>
          ) : (
            <button type="button" onClick={banClient} title="Ban client">
              <FontAwesomeIcon icon={faBan} />
            </button>
          )}

          <button type="button" onClick={deleteClient}>
            <FontAwesomeIcon icon={faTrash} />
          </button>
        </td>
      </tr>
    </>
  );
};

export default ClientRowItem;
