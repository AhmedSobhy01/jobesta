import React from 'react';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router';
import ErrorModule from '@/components/ErrorModule';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { getAuthJwtToken } from '@/utils/auth';
import { createPortal } from 'react-dom';

const SkeletonLoader = () => (
  <div className="animate-pulse">
    <div className="h-6 bg-gray-200 rounded my-2"></div>
  </div>
);

const EditJobModal = ({ job, onClose }: { job: Job; onClose: () => void }) => {
  const navigate = useNavigate();

  const [globalError, setGlobalError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [categories, setCategories] = useState([]);
  const [errors, setErrors] = useState<{ [key: string]: string } | null>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClose = () => {
    if (isSubmitting) return;
    onClose();
  };

  const handleModalClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) handleClose();
  };

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);

      try {
        const response = await fetch(
          import.meta.env.VITE_API_URL + '/categories',
        );

        if (!response.ok) throw new Error('Failed to fetch categories.');

        const data = await response.json();

        setCategories(data.data.categories);
      } catch (err) {
        setGlobalError((err as Error).message);
      }

      setLoading(false);
    };

    fetchCategories();
  }, []);

  const handleUpdateJob = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData(e.currentTarget);
      const updatedJob = Object.fromEntries(formData.entries());

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/jobs/${job.id}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${getAuthJwtToken()}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: updatedJob.title,
            description: updatedJob.description,
            category: parseInt(updatedJob.category as string, 10),
            budget: parseFloat(updatedJob.budget as string),
            duration: parseInt(updatedJob.duration as string, 10),
          }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();

        if (response.status === 422) {
          if (errorData.errors.jobId) throw new Error(errorData.errors.jobId);

          setErrors(errorData.errors);
          throw new Error('Validation error.');
        }

        throw new Error(errorData.message || 'Failed to update job.');
      }

      toast('Job updated successfully.', { type: 'success' });
      navigate(`/jobs/${job.id}`);
      handleClose();
    } catch (err) {
      toast((err as Error).message || 'Failed to update job.', {
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (globalError) {
    return (
      <ErrorModule
        onClose={() => navigate('/')}
        errorMessage={globalError || undefined}
      />
    );
  }

  return createPortal(
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
      onMouseDown={handleModalClick}
    >
      <div className="flex flex-col bg-white rounded-lg shadow-lg max-w-lg w-full p-6 relative max-h-[90vh]">
        <div>
          <button
            className="absolute top-6 right-6 text-gray-400 hover:text-gray-800 focus:outline-none p-0 m-0"
            onClick={handleClose}
          >
            <FontAwesomeIcon icon={faXmark} className="text-xl" />
          </button>
          <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">
            Edit job
          </h2>
        </div>

        <form
          onSubmit={handleUpdateJob}
          className="space-y-4 flex flex-col max-h-[70vh]"
        >
          <div className=" overflow-y-auto">
            <div className="mb-4 mx-2">
              <label className="block text-gray-700 font-medium mb-2">
                Title
              </label>
              <input
                type="text"
                name="title"
                defaultValue={job.title}
                placeholder="Enter job title"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                required
              />
              <p className="text-sm text-red-500 mt-1">{errors?.title}</p>
            </div>

            <div className="mb-4 mx-2">
              <label className="block text-gray-700 font-medium mb-2">
                Description
              </label>
              <textarea
                name="description"
                defaultValue={job.description}
                placeholder="Enter job description"
                rows={4}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                required
              ></textarea>
              <p className="text-sm text-red-500 mt-1">{errors?.description}</p>
            </div>

            <div className="mb-4 mx-2">
              <label className="block text-gray-700 font-medium mb-2">
                Category
              </label>
              {loading ? (
                <SkeletonLoader />
              ) : (
                <select
                  name="category"
                  defaultValue={job.category.id}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  required
                >
                  {categories.map((category: JobCategory) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              )}
              <p className="text-sm text-red-500 mt-1">{errors?.category}</p>
            </div>

            <div className="mb-4 mx-2">
              <label className="block text-gray-700 font-medium mb-2">
                Budget ($)
              </label>
              <input
                type="number"
                name="budget"
                defaultValue={job.budget}
                placeholder="Enter budget"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                required
                min={1}
                step={0.01}
              />
              <p className="text-sm text-red-500 mt-1">{errors?.budget}</p>
            </div>

            <div className="mb-4 mx-2">
              <label className="block text-gray-700 font-medium mb-2">
                Duration (days)
              </label>
              <input
                type="number"
                name="duration"
                defaultValue={job.duration}
                placeholder="Enter duration"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                required
                min={1}
              />
              <p className="text-sm text-red-500 mt-1">{errors?.duration}</p>
            </div>
          </div>
          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={handleClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none"
            >
              Cancel
            </button>

            <button
              type="submit"
              className={`px-4 py-2 rounded-md focus:outline-none  bg-emerald-500
            ${isSubmitting ? 'bg-opacity-50 cursor-not-allowed' : 'text-white hover:bg-emerald-600'}`}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Updating...' : 'Update job'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body as HTMLElement,
  );
};

export default EditJobModal;
