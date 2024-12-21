import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router';
import { getAuthJwtToken } from '@/utils/auth';
import InputSkeleton from '@/components/Skeletons/InputSkeleton';

const JobModal: React.FC<{
  job: Job;
  onClose: () => void;
}> = ({ job, onClose }) => {
  const navigate = useNavigate();

  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [categories, setCategories] = useState<JobCategory[]>([]);

  const fetchDataRef = useRef(false);
  useEffect(() => {
    fetchDataRef.current = true;

    (async () => {
      setIsLoadingCategories(true);

      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/categories`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);

        setCategories(data.data.categories);
      } catch (error) {
        toast((error as Error).message, { type: 'error' });
      }

      setIsLoadingCategories(false);

      fetchDataRef.current = false;
    })();
  }, []);

  const [title, setTitle] = useState(job.title.toString());
  const [description, setDescription] = useState(job.description.toString());
  const [category, setCategory] = useState(job.category.id.toString());
  const [budget, setBudget] = useState(job.budget.toString());
  const [duration, setDuration] = useState(job.duration.toString());

  const [errors, setErrors] = useState<{ [key: string]: string } | null>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClose = () => {
    if (isSubmitting) return;
    onClose();
  };

  const handleModalClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) handleClose();
  };

  const handleSubmit = async () => {
    setErrors(null);
    setIsSubmitting(true);

    const jobData = {
      title,
      description,
      category,
      budget: parseFloat(budget),
      duration: parseInt(duration, 10),
    };

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/admin/jobs/${job.id}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${getAuthJwtToken()}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(jobData),
        },
      );

      if (!res.ok && res.status !== 422)
        throw new Error('Something went wrong!');

      const data = await res.json();

      if (Object.values(data?.errors || {}).length) {
        setErrors(data.errors);

        throw new Error('Validation failed');
      }

      toast(data.message, { type: 'success' });
      navigate('/admin/jobs?reload=true');
      onClose();
    } catch (error) {
      if ((error as Error).message === 'Validation failed') return;

      toast((error as Error).message, { type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
      onMouseDown={handleModalClick}
    >
      <div className="flex flex-col bg-white rounded-lg shadow-lg max-w-lg w-full p-6 relative max-h-[90vh]">
        <button
          className="absolute top-6 right-6 text-gray-400 hover:text-gray-800 focus:outline-none p-0 m-0"
          onClick={handleClose}
        >
          <FontAwesomeIcon icon={faXmark} className="text-xl" />
        </button>

        <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">
          Update job
        </h2>

        <div className="overflow-y-auto">
          <div className="mb-4 mx-2">
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-600 mb-2"
            >
              Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter job title"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
            <p className="text-sm text-red-500 mt-1">{errors?.title}</p>
          </div>

          <div className="mb-4 mx-2">
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-600 mb-2"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter job description"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              rows={3}
            />
            <p className="text-sm text-red-500 mt-1">{errors?.description}</p>
          </div>

          <div className="mb-4 mx-2">
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Category
            </label>
            {isLoadingCategories ? (
              <InputSkeleton />
            ) : (
              <select
                name="category"
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {categories.map((category) => (
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
              placeholder="Enter budget"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              required
              min={1}
              step={0.01}
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
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
              placeholder="Enter duration"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              required
              min={1}
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
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
            onClick={handleSubmit}
            className={`px-4 py-2 rounded-md focus:outline-none  bg-emerald-500
            ${isSubmitting ? 'bg-opacity-50 cursor-not-allowed' : 'text-white hover:bg-emerald-600'}`}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Loading...' : 'Update job'}
          </button>
        </div>
      </div>
    </div>,
    document.body as HTMLElement,
  );
};

export default JobModal;
