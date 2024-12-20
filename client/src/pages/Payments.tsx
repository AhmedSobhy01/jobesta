import { Link, useLoaderData, useNavigate } from 'react-router';
import { getAuthJwtToken } from '@/utils/auth';
import Pagination from '@/components/Common/Pagination';
import ErrorModule from '@/components/ErrorModule';
import { useContext } from 'react';
import UserContext from '@/store/userContext';

const PaymentsPage = () => {
  const navigate = useNavigate();
  const user = useContext(UserContext);
  const loaderData = useLoaderData();

  if (!loaderData.status) {
    return (
      <ErrorModule
        errorMessage={loaderData.message}
        onClose={() => navigate('/')}
      />
    );
  }

  return (
    <div className="flex justify-center min-h-full">
      <div className="w-full max-w-2xl bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4 text-center text-gray-700 dark:text-gray-200">
          Payments
        </h1>

        {loaderData.payments.length > 0 ? (
          <ul className="space-y-2">
            {loaderData.payments.map((payment: Payment, index: number) => (
              <Link
                key={index}
                to={`/jobs/${payment.jobId}/manage`}
                className="flex flex-col p-4 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-md hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                <div className="mb-2">
                  <p className="text-lg font-bold text-gray-800 dark:text-gray-200">
                    Job Title: {payment.jobTitle}
                  </p>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <p className="text-gray-800 dark:text-gray-200 font-medium">
                    Milestone: {payment.milestoneName}
                  </p>
                  <p
                    className={`text-lg font-bold ${
                      user.role === 'client' ? 'text-red-500' : 'text-green-500'
                    }`}
                  >
                    {user.role === 'client' ? '-' : ''}$
                    {Number(payment.amount).toFixed(2)}
                  </p>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-baseline gap-3">
                    <p className="text-lg text-gray-800 dark:text-gray-200">
                      {user.role === 'client' ? 'To:' : 'From:'}
                    </p>
                    <p className="text-lg">{payment.username}</p>
                  </div>
                  <p
                    className={`font-semibold ${
                      payment.status === 'completed'
                        ? 'text-green-500'
                        : payment.status === 'pending'
                          ? 'text-yellow-500'
                          : 'text-red-500'
                    }`}
                  >
                    Status: {payment.status}
                  </p>

                  <p>
                    Date: {new Date(payment.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </Link>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-center">
            No payments available.
          </p>
        )}

        <Pagination pagination={loaderData.pagination} />
      </div>
    </div>
  );
};

export default PaymentsPage;

PaymentsPage.loader = async function loader({ request }: { request: Request }) {
  const url = new URL(request.url);
  const queryParams = url.searchParams;
  const page = queryParams.get('page') || '1';

  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/payments?page=${page}`,
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
      payments: data.data.payments,

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
      message: 'Error loading payments: ' + error,
    };
  }
};
