import { getAuthJwtToken } from '@/utils/auth';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';

const ReviewModal = ({ job, onClose }: { job: Job; onClose: () => void }) => {
  const navigate = useNavigate();

  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [review, setReview] = useState('');

  const [errors, setErrors] = useState<{ [key: string]: string } | null>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleStarClick = (value: number) => setRating(value);

  const handleStarHover = (value: number) => setHover(value);

  const handleClose = () => {
    if (isSubmitting) return;
    onClose();
    setRating(0);
    setReview('');
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      Swal.fire('Error', 'Please provide a rating', 'error');
      return;
    }
    setIsSubmitting(true);

    try {
      const acceptedProposal = job.proposals?.reduce<Proposal | undefined>(
        (acc, proposal) => {
          if (proposal.status === 'accepted') {
            return proposal;
          }
          return acc;
        },
        undefined,
      );

      let fetchUrl = null;

      if (job.myJob) {
        fetchUrl = `${import.meta.env.VITE_API_URL}/reviews/${job.id}/${acceptedProposal?.freelancer?.id}`;
      } else {
        fetchUrl = `${import.meta.env.VITE_API_URL}/reviews/${job.id}/${job.myProposal?.freelancer?.id}`;
      }
      const response = await fetch(fetchUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${getAuthJwtToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rating,
          comment: review,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();

        if (response.status === 422) {
          if (errorData.errors.jobId) throw new Error(errorData.errors.jobId);
          if (errorData.errors.freelancerId)
            throw new Error(errorData.errors.freelancerId);

          setErrors(errorData.errors);
          throw new Error('Validation error.');
        }

        throw new Error(errorData.message || 'Failed to add review.');
      }

      toast('Review added successfully.', { type: 'success' });
      navigate(`/jobs/${job.id}`);
      handleClose();
    } catch (err) {
      toast((err as Error).message || 'Failed to add review.', {
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Add Review</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            &times;
          </button>
        </div>

        <div className="mt-4">
          <label className="block text-gray-700">Rate the Job:</label>
          <div className="flex space-x-2 mt-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={`cursor-pointer text-3xl ${
                  (hover || rating) >= star
                    ? 'text-emerald-500'
                    : 'text-gray-300'
                }`}
                onMouseEnter={() => handleStarHover(star)}
                onMouseLeave={() => setHover(0)}
                onClick={() => handleStarClick(star)}
              >
                ★
              </span>
            ))}
          </div>
          <p className="text-sm text-red-500 mt-1">{errors?.rating}</p>
        </div>

        <div className="mt-4">
          <label className="block text-gray-700">Your Review:</label>
          <textarea
            value={review}
            onChange={(e) => setReview(e.target.value)}
            className="w-full mt-2 border rounded p-2"
            rows={4}
            placeholder="Write your feedback here..."
          ></textarea>
          <p className="text-sm text-red-500 mt-1">{errors?.comment}</p>
        </div>

        <div className="mt-6 flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Submit Review
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;
