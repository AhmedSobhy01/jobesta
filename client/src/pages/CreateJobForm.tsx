import { Form, useLoaderData, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import ErrorModule from '@/components/ErrorModule';
import { useContext } from 'react';
import UserContext from '@/store/userContext';

const CreateJobForm = () => {
  const {
    categories,
    status: categoriesStatus,
    error: categoriesError,
  } = useLoaderData<{
    status: boolean;
    error?: string;
    categories: JobCategory[];
  }>();

  const navigate = useNavigate();
  const user = useContext(UserContext);

  const handleSuccess = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const formData = new FormData(e.currentTarget);
      const jobData = Object.fromEntries(formData.entries());

      const response = await fetch(import.meta.env.VITE_API_URL + '/jobs', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${user.jwtToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: jobData.title,
          description: jobData.description,
          category: parseInt(jobData.category as string, 10),
          budget: parseFloat(jobData.budget as string),
          duration: parseInt(jobData.duration as string, 10),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();

        toast(errorData.message || 'Failed to create job.', {
          type: 'error',
        });

        throw new Error(errorData.message || 'Failed to create job.');
      }

      const result = await response.json();

      toast('Job created successfully.', { type: 'success' });
      navigate(`/jobs/${result.data.jobId}`);
    } catch (err) {
      if (err instanceof Error) {
        toast(err.message || 'Failed to create job.', { type: 'error' });
      } else {
        toast('Failed to create job.', { type: 'error' });
      }
    }
  };

  if (!categoriesStatus) {
    return (
      <ErrorModule
        errorMessage={categoriesError}
        onClose={() => navigate('/')}
      />
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Create a Job</h2>
        <Form method="post" className="space-y-4" onSubmit={handleSuccess}>
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Title
            </label>
            <input
              type="text"
              name="title"
              placeholder="Enter job title"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Description
            </label>
            <textarea
              name="description"
              placeholder="Enter job description"
              rows={4}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              required
            ></textarea>
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Category
            </label>
            <select
              name="category"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              required
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Budget ($)
            </label>
            <input
              type="number"
              name="budget"
              placeholder="Enter budget"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              required
              min={1}
              step={0.01}
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Duration (days)
            </label>
            <input
              type="number"
              name="duration"
              placeholder="Enter duration"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              required
              min={0}
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all"
          >
            Create Job
          </button>
        </Form>
      </div>
    </div>
  );
};

CreateJobForm.loader = async () => {
  const response = await fetch(import.meta.env.VITE_API_URL + '/categories');

  if (!response.ok)
    return { status: false, message: 'Failed to fetch categories.' };

  const data = await response.json();

  return { status: true, categories: data.data.categories };
};

export default CreateJobForm;
