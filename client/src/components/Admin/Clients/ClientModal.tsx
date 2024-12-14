import UserContext from '@/store/userContext';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router';

const ClientModal: React.FC<{
  client?: Account;
  onClose: () => void;
}> = ({ client, onClose }) => {
  const navigate = useNavigate();
  const user = useContext(UserContext);
  const isUpdate = !!client;

  const [firstName, setFirstName] = useState(client?.firstName || '');
  const [lastName, setLastName] = useState(client?.lastName || '');
  const [username, setUsername] = useState(client?.username || '');
  const [email, setEmail] = useState(client?.email || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [errors, setErrors] = useState<{ [key: string]: string } | null>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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

    const clientData: {
      role: string;
      firstName: string;
      lastName: string;
      username: string;
      email: string;
      password?: string;
      confirmPassword?: string;
    } = {
      role: 'client',
      firstName,
      lastName,
      username,
      email,
      password,
      confirmPassword,
    };

    if (password.trim() === '') {
      delete clientData.password;
      delete clientData.confirmPassword;
    }

    fetch(
      `${import.meta.env.VITE_API_URL}/admin/accounts/${client?.id || ''}`,
      {
        method: isUpdate ? 'PUT' : 'POST',
        headers: {
          Authorization: `Bearer ${user.jwtToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(clientData),
      },
    )
      .then((res) => {
        if (!res.ok && res.status !== 422)
          throw new Error('Something went wrong!');

        return res.json();
      })
      .then((data) => {
        if (Object.values(data?.errors || {}).length) {
          setErrors(data.errors);

          if (data.errors.accountId) throw new Error(data.errors.accountId);

          throw new Error('Validation failed');
        }

        return data;
      })
      .then((data) => {
        toast(data.message, { type: 'success' });
        navigate('/admin/clients?reload=true');
        onClose();
      })
      .catch((error) => {
        if (error.message === 'Validation failed') return;

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
          {isUpdate ? 'Update Client' : 'Create Client'}
        </h2>

        <div className="mb-4">
          <label
            htmlFor="firstName"
            className="block text-sm font-medium text-gray-600 mb-2"
          >
            First Name
          </label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="First Name"
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
          <p className="text-sm text-red-500 mt-1">{errors?.firstName}</p>
        </div>

        <div className="mb-4">
          <label
            htmlFor="lastName"
            className="block text-sm font-medium text-gray-600 mb-2"
          >
            Last Name
          </label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Last Name"
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
          <p className="text-sm text-red-500 mt-1">{errors?.lastName}</p>
        </div>

        <div className="mb-4">
          <label
            htmlFor="username"
            className="block text-sm font-medium text-gray-600 mb-2"
          >
            Username
          </label>
          <input
            type="text"
            id="username"
            name="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
          <p className="text-sm text-red-500 mt-1">{errors?.username}</p>
        </div>

        <div className="mb-4">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-600 mb-2"
          >
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
          <p className="text-sm text-red-500 mt-1">{errors?.email}</p>
        </div>

        <div className="mb-4">
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-600 mb-2"
          >
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
          <p className="text-sm text-red-500 mt-1">{errors?.password}</p>
        </div>

        <div className="mb-4">
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-gray-600 mb-2"
          >
            Confirm Password
          </label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm Password"
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
          <p className="text-sm text-red-500 mt-1">{errors?.confirmPassword}</p>
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={handleClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            className={`px-4 py-2 rounded-md focus:outline-none  bg-emerald-500
            ${isSubmitting ? 'bg-opacity-50 cursor-not-allowed' : 'text-white hover:bg-emerald-600'}`}
            disabled={isSubmitting}
          >
            {isSubmitting
              ? 'Loading...'
              : isUpdate
                ? 'Update Client'
                : 'Create Client'}
          </button>
        </div>
      </div>
    </div>,
    document.body as HTMLElement,
  );
};

export default ClientModal;
