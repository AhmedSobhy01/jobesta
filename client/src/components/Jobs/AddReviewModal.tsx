import { getAuthJwtToken } from '@/utils/auth';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faStar } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';
import { createPortal } from 'react-dom';

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

  return createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="flex flex-col bg-white rounded-lg shadow-lg max-w-lg w-full p-6 relative max-h-[90vh]">
        <div>
          <button
            className="absolute top-6 right-6 text-gray-400 hover:text-gray-800 focus:outline-none p-0 m-0"
            onClick={handleClose}
          >
            <FontAwesomeIcon icon={faXmark} className="text-xl" />
          </button>

          <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">
            Add Review
          </h2>
        </div>

        <div className="overflow-y-auto">
          <div className="mb-6 mx-2">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Rating</h3>
            <div className="flex space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => handleStarClick(star)}
                  onMouseEnter={() => handleStarHover(star)}
                  onMouseLeave={() => handleStarHover(0)}
                  className={`text-2xl ${
                    star <= (hover || rating)
                      ? 'text-emerald-500'
                      : 'text-gray-300'
                  }`}
                >
                  <FontAwesomeIcon icon={faStar} />
                </button>
              ))}
            </div>
            <p className="text-sm text-red-500 mt-1">{errors?.rating}</p>
          </div>
          <div className="mb-4 mx-2">
            <label
              htmlFor="feedback"
              className="block text-sm font-medium text-gray-600 mb-2"
            >
              Feedback
            </label>
            <textarea
              id="feedback"
              name="feedback"
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Write your feedback..."
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              rows={3}
            />
            <p className="text-sm text-red-500 mt-1">{errors?.feedback}</p>
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
            className={`px-4 py-2 rounded-md focus:outline-none bg-emerald-500 ${
              isSubmitting
                ? 'bg-opacity-50 cursor-not-allowed'
                : 'text-white hover:bg-emerald-600'
            }`}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Loading...' : 'Submit'}
          </button>
        </div>
      </div>
    </div>,
    document.body as HTMLElement,
  );
};

export default ReviewModal;
