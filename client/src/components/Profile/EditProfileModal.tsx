import UserContext from '@/store/userContext';
import { getAuthJwtToken, getAuthRefreshToken } from '@/utils/auth';
import React, { useContext, useState } from 'react';
import { ActionFunctionArgs, useNavigate } from 'react-router-dom';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: {
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    password: string;
  };
  setError: React.Dispatch<React.SetStateAction<boolean>>;
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>;
}

const EditProfileModal: React.FC<EditProfileModalProps> & {
  action?: (args: ActionFunctionArgs) => Promise<unknown>;
} = ({ setError, setErrorMessage, isOpen, onClose, initialData }) => {
  const user = useContext(UserContext);
  const [formData, setFormData] = useState(initialData);
  const navigate = useNavigate();
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  async function handleSubmitEditProfile(data: {
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    password: string;
  }) {
    interface INewData {
      firstName: string;
      lastName: string;
      username: string;
      email: string;
      password?: string;
    }
    const newData: INewData = {
      firstName: data.firstName,
      lastName: data.lastName,
      username: data.username,
      email: data.email,
    };

    const jwtToken = getAuthJwtToken();
    const refreshToken = getAuthRefreshToken();

    if (!refreshToken || refreshToken === 'EXPIRED') {
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('jwtToken');
      localStorage.removeItem('jwtTokenExpiration');
      navigate('/login');
    }

    if (data.password !== '') {
      newData.password = data.password;
    }

    try {
      let newJwtToken = jwtToken;
      if (!jwtToken || jwtToken === 'EXPIRED') {
        localStorage.removeItem('jwtToken');
        localStorage.removeItem('jwtTokenExpiration');

        const authData = { refreshToken };
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/auth/refresh`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(authData),
          },
        );

        const resData = await response.json();

        if (!response.ok) {
          setError(true);
          setErrorMessage(resData.message);
          return;
        }

        newJwtToken = resData.data.jwtToken;
        if (newJwtToken) localStorage.setItem('jwtToken', newJwtToken);

        const jwtTokenExpiration = new Date();
        jwtTokenExpiration.setHours(jwtTokenExpiration.getHours() + 1);
        localStorage.setItem(
          'jwtTokenExpiration',
          jwtTokenExpiration.toISOString(),
        );
      }

      const response = await fetch(
        import.meta.env.VITE_API_URL + '/account/me',
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + jwtToken,
          },
          body: JSON.stringify(newData),
        },
      );

      const resData = await response.json();

      if (!resData.status) {
        setError(true);
        setErrorMessage(resData.message);
      }

      user.setUsername(resData.data.username);
      navigate(`/users/${resData.data.username}`);
    } catch {
      setError(true);
      setErrorMessage('A network error occurred. Please try again later.');
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmitEditProfile(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-lg w-full p-6">
        <h2 className="text-xl font-semibold dark:text-white text-gray-800 mb-4">
          Edit Profile
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="firstName"
                className="block text-sm dark:text-gray-300 text-gray-700"
              >
                First Name
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full mt-1 p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label
                htmlFor="lastName"
                className="block text-sm dark:text-gray-300 text-gray-700"
              >
                Last Name
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full mt-1 p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label
                htmlFor="username"
                className="block text-sm dark:text-gray-300 text-gray-700"
              >
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full mt-1 p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label
                htmlFor="username"
                className="block text-sm dark:text-gray-300 text-gray-700"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full mt-1 p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <div className="flex">
                <label
                  htmlFor="password"
                  className="block text-sm dark:text-gray-300 text-gray-700"
                >
                  Password
                </label>
                <p className="block text-sm dark:text-red-300 text-red-700">
                  (*Optional)
                </p>
              </div>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full mt-1 p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>
          <div className="flex justify-end mt-6 space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 dark:bg-gray-600 dark:text-white rounded hover:bg-gray-400 dark:hover:bg-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-700 text-white rounded hover:bg-green-800"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;
