import React, { useContext, useState } from 'react';
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
import FreelancerModal from '@/components/Admin/Freelancers/FreelancerModal';
import UserContext from '@/store/userContext';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router';
import { Link } from 'react-router';

const FreelancerRowItem: React.FC<{
  freelancer: Account;
}> = ({ freelancer }) => {
  const navigate = useNavigate();
  const user = useContext(UserContext);

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
              Authorization: `Bearer ${user.jwtToken}`,
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
              Authorization: `Bearer ${user.jwtToken}`,
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
              Authorization: `Bearer ${user.jwtToken}`,
            },
          },
        )
          .then((response) => {
            if (!response.ok) throw new Error('Failed to delete freelancer');

            return response.json();
          })
          .then((data) => {
            toast(data.message, { type: 'success' });
            navigate('/admin/freelancers?reload=true');
          })
          .catch(() => {
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

      <tr className="bg-white border-b">
        <th
          scope="row"
          className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap"
        >
          {freelancer.id}
        </th>
        <td className="px-6 py-4 whitespace-nowrap">{freelancer.firstName}</td>
        <td className="px-6 py-4 whitespace-nowrap">{freelancer.lastName}</td>
        <td className="px-6 py-4 whitespace-nowrap">{freelancer.username}</td>
        <td className="px-6 py-4 whitespace-nowrap">{freelancer.email}</td>
        <td className="px-6 py-4 whitespace-nowrap">
          {freelancer.isBanned ? (
            <FontAwesomeIcon icon={faCheck} />
          ) : (
            <FontAwesomeIcon icon={faTimes} />
          )}
        </td>
        <td className="px-6 py-4 whitespace-nowrap">{freelancer.createdAt}</td>
        <td className="px-6 py-4 space-x-5 rtl:space-x-reverse whitespace-nowrap">
          <Link to={`/users/${freelancer.username}`}>
            <FontAwesomeIcon icon={faEye} />
          </Link>

          <button type="button" onClick={() => setIsEditAccountModalOpen(true)}>
            <FontAwesomeIcon icon={faPenToSquare} />
          </button>

          {freelancer.isBanned ? (
            <button
              type="button"
              onClick={unbanFreelancer}
              title="Unban freelancer"
            >
              <FontAwesomeIcon icon={faCheck} />
            </button>
          ) : (
            <button
              type="button"
              onClick={banFreelancer}
              title="Ban freelancer"
            >
              <FontAwesomeIcon icon={faBan} />
            </button>
          )}

          <button type="button" onClick={deleteFreelancer}>
            <FontAwesomeIcon icon={faTrash} />
          </button>
        </td>
      </tr>
    </>
  );
};

export default FreelancerRowItem;
