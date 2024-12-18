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
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 relative">
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
        >
          <FontAwesomeIcon icon={faXmark} />
        </button>
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Edit Job</h2>

        <form onSubmit={handleUpdateJob} className="space-y-4">
          <div>
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

          <div>
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

          <div>
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

          <div>
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

          <div>
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

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-2 bg-emerald-600  text-white rounded-lg transition-all ${
              isSubmitting
                ? 'cursor-not-allowed bg-opacity-50'
                : 'hover:bg-emerald-700'
            }`}
          >
            {isSubmitting ? 'Updating...' : 'Update Job'}
          </button>
        </form>
      </div>
    </div>,
    document.body as HTMLElement,
  );
};

export default EditJobModal;
