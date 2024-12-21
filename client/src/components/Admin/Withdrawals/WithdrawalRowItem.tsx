import React, { useState } from 'react';
import Swal from 'sweetalert2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCheck,
  faInfoCircle,
  faTrash,
} from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router';
import { getAuthJwtToken } from '@/utils/auth';

const WithdrawalRowItem: React.FC<{
  withdrawal: Withdrawal;
}> = ({ withdrawal }) => {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);

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
      <tr className="bg-white border-b hover:bg-gray-50">
        <td className="px-3 py-2 xl:px-6 xl:py-4 text-sm text-gray-900">
          <div className="flex items-center gap-2">
            {withdrawal.id}
            <button
              className="xl:hidden text-gray-500"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <FontAwesomeIcon icon={faInfoCircle} />
            </button>
          </div>
        </td>
        <td className="hidden xl:table-cell px-3 py-2 xl:px-6 xl:py-4 text-sm text-gray-900">
          {withdrawal.status
            .split('_')
            .map((word) => word[0].toUpperCase() + word.slice(1))
            .join(' ')}
        </td>
        <td className="hidden xl:table-cell px-3 py-2 xl:px-6 xl:py-4 text-sm text-gray-900">
          {withdrawal.freelancer?.firstName} {withdrawal.freelancer?.lastName}
        </td>
        <td className="xl:table-cell px-3 py-2 xl:px-6 xl:py-4 text-sm text-gray-900">
          {withdrawal.freelancer?.username}
        </td>
        <td className="hidden xl:table-cell px-3 py-2 xl:px-6 xl:py-4 text-sm text-gray-900">
          {withdrawal.amount}
        </td>
        <td className="hidden xl:table-cell px-3 py-2 xl:px-6 xl:py-4 text-sm text-gray-900">
          {withdrawal.paymentMethod
            .split('_')
            .map((word) => word[0].toUpperCase() + word.slice(1))
            .join(' ')}
        </td>
        <td className="hidden xl:table-cell px-3 py-2 xl:px-6 xl:py-4 text-sm text-gray-900">
          {withdrawal.paymentUsername}
        </td>
        <td className="hidden xl:table-cell px-3 py-2 xl:px-6 xl:py-4 text-sm text-gray-900">
          {new Date(withdrawal.requestedAt).toLocaleString()}
        </td>
        <td className="px-3 py-2 xl:px-6 xl:py-4 text-sm text-gray-900">
          <div className="flex gap-4">
            {withdrawal.status === 'pending' && (
              <>
                <button
                  type="button"
                  onClick={completeWithdrawal}
                  className="text-green-600 hover:text-green-900"
                  title="Complete withdrawal"
                >
                  <FontAwesomeIcon icon={faCheck} />
                </button>
                <button
                  type="button"
                  onClick={deleteWithdrawal}
                  className="text-red-600 hover:text-red-900"
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </>
            )}
          </div>
        </td>
      </tr>

      {isExpanded && (
        <tr className="xl:hidden bg-gray-50">
          <td colSpan={9} className="px-3 py-2">
            <div className="space-y-2">
              <p>
                <span className="font-medium">Status:</span>{' '}
                {withdrawal.status
                  .split('_')
                  .map((word) => word[0].toUpperCase() + word.slice(1))
                  .join(' ')}
              </p>
              <p>
                <span className="font-medium">Freelancer:</span>{' '}
                {withdrawal.freelancer?.firstName}{' '}
                {withdrawal.freelancer?.lastName}
              </p>
              <p>
                <span className="font-medium">Amount:</span> {withdrawal.amount}
              </p>
              <p>
                <span className="font-medium">Payment Method:</span>{' '}
                {withdrawal.paymentMethod
                  .split('_')
                  .map((word) => word[0].toUpperCase() + word.slice(1))
                  .join(' ')}
              </p>
              <p>
                <span className="font-medium">Payment Username:</span>{' '}
                {withdrawal.paymentUsername}
              </p>
              <p>
                <span className="font-medium">Requested At:</span>{' '}
                {new Date(withdrawal.requestedAt).toLocaleString()}
              </p>
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

export default WithdrawalRowItem;
