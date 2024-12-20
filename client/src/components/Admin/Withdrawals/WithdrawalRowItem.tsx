import React from 'react';
import Swal from 'sweetalert2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTrash } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router';
import { getAuthJwtToken } from '@/utils/auth';

const WithdrawalRowItem: React.FC<{
  withdrawal: Withdrawal;
}> = ({ withdrawal }) => {
  const navigate = useNavigate();

  const completeWithdrawal = () => {
    Swal.fire({
      title: 'Are you sure?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#F44336',
      cancelButtonColor: '#3085d6',
      cancelButtonText: 'Cancel',
      confirmButtonText: 'Yes, complete withdrawal',
      showLoaderOnConfirm: true,
      allowOutsideClick: () => !Swal.isLoading(),
      backdrop: true,
      preConfirm: () => {
        fetch(
          `${import.meta.env.VITE_API_URL}/admin/withdrawals/${withdrawal.id}/complete`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${getAuthJwtToken()}`,
            },
          },
        )
          .then((response) => {
            if (!response.ok) {
              if (response.status === 422) {
                response.json().then((data) => {
                  toast(data.errors.id, { type: 'error' });
                });
                throw new Error('Validation error');
              }
              throw new Error('Failed to complete withdrawal');
            }

            return response.json();
          })
          .then((data) => {
            toast(data.message, { type: 'success' });
            navigate('/admin/withdrawals?reload=true');
          })
          .catch((error) => {
            if (error.message !== 'Validation error') {
              toast('Failed to complete withdrawal', { type: 'error' });
            }
          });
      },
    });
  };

  const deleteWithdrawal = () => {
    Swal.fire({
      title: 'Are you sure?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#F44336',
      cancelButtonColor: '#3085d6',
      cancelButtonText: 'Cancel',
      confirmButtonText: 'Yes, delete withdrawal',
      showLoaderOnConfirm: true,
      allowOutsideClick: () => !Swal.isLoading(),
      backdrop: true,
      preConfirm: () => {
        fetch(
          `${import.meta.env.VITE_API_URL}/admin/withdrawals/${withdrawal.id}`,
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
                  toast(data.errors.id, { type: 'error' });
                });
                throw new Error('Validation error');
              }
              throw new Error('Failed to delete withdrawal');
            }

            return response.json();
          })
          .then((data) => {
            toast(data.message, { type: 'success' });
            navigate('/admin/withdrawals?reload=true');
          })
          .catch((error) => {
            if (error.message !== 'Validation error')
              toast('Failed to delete withdrawal', { type: 'error' });
          });
      },
    });
  };

  return (
    <>
      <tr className="bg-white border-b">
        <th
          scope="row"
          className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap"
        >
          {withdrawal.id}
        </th>
        <td className="px-6 py-4 whitespace-nowrap">
          {withdrawal.status
            .split('_')
            .map((word) => word[0].toUpperCase() + word.slice(1))
            .join(' ')}
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          {withdrawal.freelancer?.firstName} {withdrawal.freelancer?.lastName}
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          {withdrawal.freelancer?.username}
        </td>
        <td className="px-6 py-4 whitespace-nowrap">{withdrawal.amount}</td>
        <td className="px-6 py-4 whitespace-nowrap">
          {withdrawal.paymentMethod
            .split('_')
            .map((word) => word[0].toUpperCase() + word.slice(1))
            .join(' ')}
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          {withdrawal.paymentUsername}
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          {new Date(withdrawal.requestedAt).toLocaleString()}
        </td>
        <td className="px-6 py-4 space-x-5 rtl:space-x-reverse whitespace-nowrap">
          {withdrawal.status == 'pending' && (
            <>
              <button
                type="button"
                onClick={completeWithdrawal}
                title="Complete withdrawal"
              >
                <FontAwesomeIcon icon={faCheck} />
              </button>

              <button type="button" onClick={deleteWithdrawal}>
                <FontAwesomeIcon icon={faTrash} />
              </button>
            </>
          )}

          {withdrawal.status == 'completed' && <>-</>}
        </td>
      </tr>
    </>
  );
};

export default WithdrawalRowItem;
