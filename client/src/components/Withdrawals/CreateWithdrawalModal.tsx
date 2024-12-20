import { getAuthJwtToken } from '@/utils/auth';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router';
import { toast } from 'react-toastify';

const paymentMethods = [
  { id: 'bank_transfer', name: 'Bank Transfer' },
  { id: 'paypal', name: 'Paypal' },
  { id: 'ewallet', name: 'E-Wallet' },
];

const CreateWithdrawalModal: React.FC<{
  onClose: () => void;
}> = ({ onClose }) => {
  const navigate = useNavigate();

  const [errors, setErrors] = useState<{ [key: string]: string } | null>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer');
  const [paymentUsername, setPaymentUsername] = useState('');

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

    fetch(`${import.meta.env.VITE_API_URL}/withdrawals`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${getAuthJwtToken()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount,
        paymentMethod,
        paymentUsername,
      }),
    })
      .then((res) => {
        if (!res.ok && res.status !== 422)
          throw new Error('Failed to submit withdrawal');

        return res.json();
      })
      .then((data) => {
        if (Object.values(data?.errors || {}).length) {
          setErrors(data.errors);

          throw new Error('Validation failed');
        }

        return data;
      })
      .then((data) => {
        toast(data.message, { type: 'success' });
        navigate('/withdrawals');
        onClose();
      })
      .catch((error) => {
        if (error.message !== 'Validation failed')
          toast(error.message, { type: 'error' });
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
          Request a Withdrawal
        </h2>

        <div className="space-y-4">
          <div>
            <label id="amount" className="block text-gray-700 font-medium mb-2">
              Amount ($)
            </label>
            <input
              type="number"
              name="amount"
              placeholder="Enter amount"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              required
              min={1}
              step={0.01}
              onChange={(e) => setAmount(e.target.value)}
            />
            <p className="text-sm text-red-500 mt-1">{errors?.amount}</p>
          </div>

          <div>
            <label
              id="paymentMethod"
              className="block text-gray-700 font-medium mb-2"
            >
              Payment Method
            </label>

            <select
              name="paymentMethod"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              required
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              {paymentMethods.map((paymentMethod) => (
                <option key={paymentMethod.id} value={paymentMethod.id}>
                  {paymentMethod.name}
                </option>
              ))}
            </select>
            <p className="text-sm text-red-500 mt-1">{errors?.paymentMethod}</p>
          </div>

          <div>
            <label
              id="paymentUsername"
              className="block text-gray-700 font-medium mb-2"
            >
              Payment Username
            </label>
            <input
              type="text"
              name="paymentUsername"
              placeholder="Enter payment username"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              required
              onChange={(e) => setPaymentUsername(e.target.value)}
            />
            <p className="text-sm text-red-500 mt-1">
              {errors?.paymentUsername}
            </p>
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`w-full py-2 bg-emerald-600  text-white rounded-lg transition-all ${
              isSubmitting
                ? 'cursor-not-allowed bg-opacity-50'
                : 'hover:bg-emerald-700'
            }`}
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </div>
    </div>,
    document.body as HTMLElement,
  );
};

export default CreateWithdrawalModal;
