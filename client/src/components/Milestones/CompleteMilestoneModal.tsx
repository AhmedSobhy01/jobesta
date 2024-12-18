import { getAuthJwtToken } from '@/utils/auth';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'react-toastify';

const CompleteMilestoneModal: React.FC<{
  jobId: number;
  freelancerId: number;
  milestoneOrder: number;
  onClose: (success?: boolean) => void;
}> = ({ jobId, freelancerId, milestoneOrder, onClose }) => {
  const [errors, setErrors] = useState<{ [key: string]: string } | null>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [card, setCard] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  const handleClose = () => {
    if (isSubmitting) return;
    onClose();
  };

  const handleModalClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) handleClose();
  };

  const handleSubmit = () => {
    setErrors(null);
    setIsSubmitting(true);

    fetch(
      `${import.meta.env.VITE_API_URL}/milestones/${jobId}/${freelancerId}/${milestoneOrder}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${getAuthJwtToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ card, expiry, cvv }),
      },
    )
      .then((response) => {
        if (!response.ok) {
          if (response.status === 422) {
            response.json().then((data) => {
              setErrors(data.errors);

              if (
                data.errors.jobId ||
                data.errors.freelancerId ||
                data.errors.milestoneOrder
              ) {
                toast(
                  data.errors.jobId ||
                    data.errors.freelancerId ||
                    data.errors.milestoneOrder,
                  { type: 'error' },
                );
              }
            });

            throw new Error('Validation error');
          } else {
            throw new Error('Failed to complete milestone');
          }
        }

        return response.json();
      })
      .then((data) => {
        toast(data.message, { type: 'success' });
        onClose(true);
      })
      .catch((err) => {
        if (err instanceof Error) {
          if (err.message === 'Validation error') return;
          toast(err.message, { type: 'error' });
        } else {
          toast('Failed to complete milestone', { type: 'error' });
        }
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  return createPortal(
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
      onMouseDown={handleModalClick}
    >
      <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6 relative max-h-[90vh] overflow-y-auto">
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 focus:outline-none"
          onClick={handleClose}
        >
          <FontAwesomeIcon icon={faXmark} />
        </button>

        <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">
          {`Complete Milestone #${milestoneOrder}`}
        </h2>

        <div className="mb-4">
          <label
            htmlFor="card"
            className="block text-sm font-medium text-gray-700"
          >
            Card Number
          </label>
          <input
            type="text"
            id="card"
            value={card}
            onChange={(e) => setCard(e.target.value.replace(/\D/g, ''))}
            className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm
            ${errors?.card ? 'border-red-500' : ''}`}
            maxLength={16}
          />
          {errors?.card && (
            <p className="mt-1 text-sm text-red-500">{errors.card}</p>
          )}
        </div>

        <div className="mb-4">
          <label
            htmlFor="expiry"
            className="block text-sm font-medium text-gray-700"
          >
            Expiry Date
          </label>
          <input
            type="month"
            id="expiry"
            value={expiry}
            onChange={(e) => setExpiry(e.target.value)}
            className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm
            ${errors?.expiry ? 'border-red-500' : ''}`}
          />
          {errors?.expiry && (
            <p className="mt-1 text-sm text-red-500">{errors.expiry}</p>
          )}
        </div>

        <div className="mb-4">
          <label
            htmlFor="cvv"
            className="block text-sm font-medium text-gray-700"
          >
            CVV
          </label>
          <input
            type="text"
            id="cvv"
            value={cvv}
            onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
            className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm
            ${errors?.cvv ? 'border-red-500' : ''}`}
            maxLength={3}
          />
          {errors?.cvv && (
            <p className="mt-1 text-sm text-red-500">{errors.cvv}</p>
          )}
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={handleClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none"
          >
            Cancel
          </button>
          <button
            onClick={() => handleSubmit()}
            className={`px-4 py-2 rounded-md focus:outline-none  bg-emerald-500
            ${isSubmitting ? 'bg-opacity-50 cursor-not-allowed' : 'text-white hover:bg-emerald-600'}`}
            disabled={isSubmitting}
          >
            {isSubmitting
              ? 'Loading...'
              : `Complete Milestone #${milestoneOrder}`}
          </button>
        </div>
      </div>
    </div>,
    document.body as HTMLElement,
  );
};

export default CompleteMilestoneModal;
