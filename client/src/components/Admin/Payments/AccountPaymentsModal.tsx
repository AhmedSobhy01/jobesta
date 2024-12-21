import { getAuthJwtToken } from '@/utils/auth';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'react-toastify';
import JobProposalsSkeleton from '@/components/Skeletons/JobProposalsSkeleton';

const AccountPaymentsModal: React.FC<{
  accountId: number;
  role: string;
  onClose: () => void;
}> = ({ accountId, role, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState<Payment[]>([]);

  const fetchDataRef = useRef(false);
  const fetchPayments = useCallback(async () => {
    fetchDataRef.current = true;
    setLoading(true);

    try {
      const res = await fetch(
        import.meta.env.VITE_API_URL + '/admin/payments/' + accountId,
        {
          headers: {
            Authorization: `Bearer ${getAuthJwtToken()}`,
          },
        },
      );

      if (!res.ok) throw new Error('Failed to fetch payments');

      const data = await res.json();
      setPayments(data.data.payments);
    } catch (err) {
      toast((err as Error).message, { type: 'error' });
      onClose();
    }

    setLoading(false);
    fetchDataRef.current = false;
  }, [accountId, onClose]);

  useEffect(() => {
    if (!fetchDataRef.current) {
      fetchDataRef.current = true;
      fetchPayments();
    }
  }, [fetchPayments]);

  const handleModalClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <>
      {createPortal(
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
          onMouseDown={handleModalClick}
        >
          <div className="flex flex-col bg-white rounded-lg shadow-lg max-w-lg w-full p-6 relative max-h-[90vh]">
            <div>
              <button
                className="absolute top-6 right-6 text-gray-400 hover:text-gray-800 focus:outline-none p-0 m-0"
                onClick={onClose}
              >
                <FontAwesomeIcon icon={faXmark} className="text-xl" />
              </button>

              <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">
                Payments
              </h2>
            </div>

            <div className="overflow-y-auto">
              {loading ? (
                <JobProposalsSkeleton />
              ) : payments.length === 0 ? (
                <p className="text-center">No payments found</p>
              ) : (
                payments.map((payment: Payment, index: number) => (
                  <div
                    key={index}
                    className="bg-white border border-gray-200 rounded-lg shadow-md p-6 mb-6 hover:shadow-lg transition-shadow duration-300"
                  >
                    <div className="flex justify-between items-center mb-4">
                      <span className="font-medium text-gray-500">Sender:</span>
                      <a
                        href={`/users/${payment.client?.username}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-gray-900 font-semibold hover:text-blue-500 transition-colors"
                      >
                        {payment.client?.firstName} {payment.client?.lastName}
                      </a>
                    </div>
                    <div className="flex justify-between items-center mb-4">
                      <span className="font-medium text-gray-500">
                        Receiver:
                      </span>
                      <a
                        href={`/users/${payment.freelancer?.username}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-gray-900 font-semibold hover:text-blue-500 transition-colors"
                      >
                        {payment.freelancer?.firstName}{' '}
                        {payment.freelancer?.lastName}
                      </a>
                    </div>
                    <div className="flex justify-between items-center mb-4">
                      <span className="font-medium text-gray-500">Amount:</span>
                      <span
                        className={`text-gray-800 font-semibold ${role === 'client' ? 'text-red-500' : 'text-green-500'}`}
                      >
                        {role === 'client' ? '-' : '+'}${payment.amount}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mb-4">
                      <span className="font-medium text-gray-500">
                        Milestone:
                      </span>
                      <span className="text-gray-800">
                        {payment.milestoneName}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-500">Job:</span>
                      <a
                        href={`/jobs/${payment.job?.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-500 font-semibold hover:underline"
                      >
                        {payment.job?.title}
                      </a>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>,
        document.body as HTMLElement,
      )}
    </>
  );
};

export default AccountPaymentsModal;
