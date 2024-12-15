import React, { useContext, useState } from 'react';
import Swal from 'sweetalert2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEye,
  faCheck,
  faPenToSquare,
  faTimes,
  faTrash,
} from '@fortawesome/free-solid-svg-icons';
import AdminModal from '@/components/Admin/Admins/AdminModal';
import UserContext from '@/store/userContext';
import { toast } from 'react-toastify';
import { useNavigate,Link } from 'react-router';

const AdminRowItem: React.FC<{
  admin: Account;
}> = ({ admin }) => {
  const navigate = useNavigate();
  const user = useContext(UserContext);

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
            Authorization: `Bearer ${user.jwtToken}`,
          },
        })
          .then((response) => {
            if (!response.ok) throw new Error('Failed to delete admin');

            return response.json();
          })
          .then((data) => {
            toast(data.message, { type: 'success' });
            navigate('/admin/admins?reload=true');
          })
          .catch(() => {
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

      <tr className="bg-white border-b">
        <th
          scope="row"
          className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap"
        >
          {admin.id}
        </th>
        <td className="px-6 py-4 whitespace-nowrap">{admin.firstName}</td>
        <td className="px-6 py-4 whitespace-nowrap">{admin.lastName}</td>
        <td className="px-6 py-4 whitespace-nowrap">{admin.username}</td>
        <td className="px-6 py-4 whitespace-nowrap">{admin.email}</td>
        <td className="px-6 py-4 whitespace-nowrap">
          {admin.isBanned ? (
            <FontAwesomeIcon icon={faCheck} />
          ) : (
            <FontAwesomeIcon icon={faTimes} />
          )}
        </td>
        <td className="px-6 py-4 whitespace-nowrap">{admin.createdAt}</td>
        <td className="px-6 py-4 space-x-5 rtl:space-x-reverse whitespace-nowrap">
          <Link to={`/users/${admin.username}`}>
            <FontAwesomeIcon icon={faEye} />
          </Link>
          <button type="button" onClick={() => setIsEditAccountModalOpen(true)}>
            <FontAwesomeIcon icon={faPenToSquare} />
          </button>

          <button type="button" onClick={deleteAdmin}>
            <FontAwesomeIcon icon={faTrash} />
          </button>
        </td>
      </tr>
    </>
  );
};

export default AdminRowItem;
