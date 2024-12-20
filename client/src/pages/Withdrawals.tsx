import { useLoaderData, useNavigate } from 'react-router';
import { getAuthJwtToken } from '@/utils/auth';
import Pagination from '@/components/Common/Pagination';
import ErrorModule from '@/components/ErrorModule';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { useState } from 'react';
import CreateWithdrawalModal from '@/components/Withdrawals/CreateWithdrawalModal';

const Withdrawals = () => {
  const navigate = useNavigate();
  const loaderData = useLoaderData();

  const [isCreateWithdrawalModalOpen, setIsCreateWithdrawalModalOpen] =
    useState(false);

  const handleDelete = async (id: number) => {
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
        fetch(`${import.meta.env.VITE_API_URL}/withdrawals/${id}`, {
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
              } else throw new Error('Failed to delete withdrawal');
            }

            return response.json();
          })
          .then((data) => {
            toast(data.message, { type: 'success' });
            navigate('/withdrawals');
          })
          .catch((error) => {
            if (error.message !== 'Validation error') {
              toast('Failed to delete withdrawal', { type: 'error' });
            }
          });
      },
    });
  };

  if (!loaderData.status) {
    return (
      <ErrorModule
        errorMessage={loaderData.message}
        onClose={() => navigate('/')}
      />
    );
  }

  return (
    <div className="flex justify-center min-h-full py-8">
      {isCreateWithdrawalModalOpen && (
        <CreateWithdrawalModal
          onClose={() => setIsCreateWithdrawalModalOpen(false)}
        />
      )}

      <div className="w-full max-w-2xl bg-white dark:bg-gray-900 p-8 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800 dark:text-gray-200">
          Withdrawals
        </h1>

        <button
          onClick={() => setIsCreateWithdrawalModalOpen(true)}
          className="w-full mb-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-opacity-50"
        >
          Create Withdrawal
        </button>

        {loaderData.withdrawals.length > 0 ? (
          <>
            <ul className="space-y-4">
              {loaderData.withdrawals.map(
                (withdrawal: Withdrawal, index: number) => (
                  <li
                    key={index}
                    className="flex items-center p-4 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-md hover:bg-gray-200 dark:hover:bg-gray-700"
                  >
                    <div className="flex-1">
                      <p className="text-lg text-gray-700 dark:text-gray-200">
                        Amount: ${withdrawal.amount}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Date:{' '}
                        {new Date(withdrawal.requestedAt).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Status:{' '}
                        {withdrawal.status
                          .split('_')
                          .map(
                            (word) =>
                              word.charAt(0).toUpperCase() + word.slice(1),
                          )
                          .join(' ')}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Payment Method:{' '}
                        {withdrawal.paymentMethod
                          .split('_')
                          .map(
                            (word) =>
                              word.charAt(0).toUpperCase() + word.slice(1),
                          )
                          .join(' ')}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Account Number: {withdrawal.paymentUsername}
                      </p>
                    </div>
                    {withdrawal.status === 'pending' && (
                      <button
                        onClick={() => handleDelete(withdrawal.id)}
                        className="ml-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-opacity-50"
                      >
                        Delete
                      </button>
                    )}
                  </li>
                ),
              )}
            </ul>

            <Pagination pagination={loaderData.pagination} />
          </>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-center">
            No withdrawals available.
          </p>
        )}
      </div>
    </div>
  );
};

export default Withdrawals;

Withdrawals.loader = async function loader({ request }: { request: Request }) {
  const url = new URL(request.url);
  const queryParams = url.searchParams;
  const page = queryParams.get('page') || '1';

  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/withdrawals?page=${page}`,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getAuthJwtToken()}`,
        },
      },
    );

    const data = await response.json();
    if (!response.ok) {
      return {
        status: false,
        message: data.message,
      };
    }

    return {
      status: true,
      withdrawals: data.data.withdrawals,
      pagination: {
        currentPage: data.data.pagination.currentPage,
        totalPages: data.data.pagination.totalPages,
        totalItems: data.data.pagination.totalItems,
        perPage: data.data.pagination.perPage,
      },
    };
  } catch (error) {
    return {
      status: false,
      message: 'Error loading withdrawals' + error,
    };
  }
};
