import UserContext from '@/store/userContext';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router';

const CategoryModal: React.FC<{
  category?: JobCategory;
  onClose: () => void;
}> = ({ category, onClose }) => {
  const navigate = useNavigate();
  const user = useContext(UserContext);
  const isUpdate = !!category;

  const [name, setName] = useState(category?.name || '');
  const [description, setDescription] = useState(category?.description || '');

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

    const categoryData: {
      name: string;
      description: string;
    } = {
      name,
      description,
    };

    fetch(
      `${import.meta.env.VITE_API_URL}/admin/categories/${category?.id || ''}`,
      {
        method: isUpdate ? 'PUT' : 'POST',
        headers: {
          Authorization: `Bearer ${user.jwtToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(categoryData),
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
        navigate('/admin/categories?reload=true');
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
      onClick={handleModalClick}
    >
      <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6 relative max-h-[90vh] overflow-y-auto">
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 focus:outline-none"
          onClick={handleClose}
        >
          <FontAwesomeIcon icon={faXmark} />
        </button>

        <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">
          {isUpdate ? 'Update Category' : 'Create Category'}
        </h2>

        <div className="mb-4">
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-600 mb-2"
          >
            Category Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Category Name"
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
          <p className="text-sm text-red-500 mt-1">{errors?.name}</p>
        </div>

        <div className="mb-4">
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-600 mb-2"
          >
            Description
          </label>
          <input
            type="text"
            id="description"
            name="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Last Name"
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
          <p className="text-sm text-red-500 mt-1">{errors?.description}</p>
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
                ? 'Update Category'
                : 'Create Category'}
          </button>
        </div>
      </div>
    </div>,
    document.body as HTMLElement,
  );
};

export default CategoryModal;
