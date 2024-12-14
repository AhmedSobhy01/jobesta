import React, { useContext, useState } from 'react';
import Swal from 'sweetalert2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCheck,
  faPenToSquare,
  faTimes,
  faTrash,
} from '@fortawesome/free-solid-svg-icons';
import ClientModal from '@/components/Admin/Clients/ClientModal';
import UserContext from '@/store/userContext';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router';

const ClientRowItem: React.FC<{
  client: Account;
}> = ({ client }) => {
  const navigate = useNavigate();
  const user = useContext(UserContext);

  const [isEditAccountModalOpen, setIsEditAccountModalOpen] = useState(false);

  const deleteClient = () => {
    Swal.fire({
      title: 'Are you sure?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      cancelButtonText: 'Cancel',
      confirmButtonText: 'Yes, delete it',
      showLoaderOnConfirm: true,
      allowOutsideClick: () => !Swal.isLoading(),
      backdrop: true,
      preConfirm: () => {
        fetch(`${import.meta.env.VITE_API_URL}/admin/accounts/${client.id}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${user.jwtToken}`,
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
          <button type="button" onClick={() => setIsEditAccountModalOpen(true)}>
            <FontAwesomeIcon icon={faPenToSquare} />
          </button>

          <button type="button" onClick={deleteClient}>
            <FontAwesomeIcon icon={faTrash} />
          </button>
        </td>
      </tr>
    </>
  );
};

export default ClientRowItem;
