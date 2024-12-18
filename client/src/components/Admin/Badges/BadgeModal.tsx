import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router';
import { getAuthJwtToken } from '@/utils/auth';

const BadgeModal: React.FC<{
  badge: Badge;
  onClose: () => void;
}> = ({ badge, onClose }) => {
  const navigate = useNavigate();

  const [name, setName] = useState(badge.name);
  const [description, setDescription] = useState(badge.description);
  const [attachment, setAttachment] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | undefined>(undefined);

  const [errors, setErrors] = useState<{ [key: string]: string } | null>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!attachment) {
      setPreview(undefined);
      return;
    }

    const objectUrl = URL.createObjectURL(attachment);
    setPreview(objectUrl);

    // free memory when ever this component is unmounted
    return () => URL.revokeObjectURL(objectUrl);
  }, [attachment]);

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

    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    if (attachment) formData.append('file', attachment);

    fetch(`${import.meta.env.VITE_API_URL}/admin/badges/${badge.id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${getAuthJwtToken()}`,
      },
      body: formData,
    })
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
        navigate('/admin/badges?reload=true');
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

  const handleAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    setAttachment(e.target.files[0]);
  };

  return createPortal(
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
      onClick={handleModalClick}
    >
      <div className="bg-white rounded-lg shadow-lg md:w-fit md:min-w-[32rem] w-full mx-16 p-6 relative max-h-[90vh] overflow-y-auto">
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 focus:outline-none"
          onClick={handleClose}
        >
          <FontAwesomeIcon icon={faXmark} />
        </button>

        <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">
          Update Badge
        </h2>

        <div className="mb-4">
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-600 mb-2"
          >
            Name
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

        <div className="mb-4">
          <label
            // htmlFor="attachment"
            className="block text-sm font-medium text-gray-600 mb-2"
          >
            Icon
          </label>

          <input
            type="file"
            id="attachment"
            name="attachment"
            onChange={handleAttachmentChange}
            placeholder="Last Name"
            className="hidden"
            accept="image/*"
          />
          <div className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:outline-none">
            {attachment && (
              <div className="flex items-center overflow-hidden">
                <img src={preview} alt="" className="w-20 my-4 rounded-lg" />
                <span className="ml-4">{attachment.name}</span>
              </div>
            )}
            <div className="flex items-center">
              <label
                htmlFor="attachment"
                className=" block bg-emerald-500 text-white rounded-lg px-4 py-2 w-20 text-center cursor-pointer transition-colors duration-100 ease-in-out hover:bg-emerald-700"
              >
                Attach
              </label>
              {attachment && (
                <button
                  className="text-red-500 dark:text-red-400 mx-4"
                  onClick={() => setAttachment(null)}
                >
                  Remove
                </button>
              )}
            </div>
          </div>
          <p className="text-sm text-red-500 mt-1">{errors?.file}</p>
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
            Update Badge
          </button>
        </div>
      </div>
    </div>,
    document.body as HTMLElement,
  );
};

export default BadgeModal;
