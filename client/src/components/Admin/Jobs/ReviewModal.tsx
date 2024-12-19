import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faXmark } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import { getAuthJwtToken } from '@/utils/auth';

const ReviewModal: React.FC<{
  jobId: number;
  review: Review | null;
  onUpdate: () => void;
  onClose: () => void;
}> = ({ review, onUpdate, onClose }) => {
  const [rating, setRating] = useState(Number(review?.rating) || 0);
  const [comment, setComment] = useState<string>(review?.comment || '');
  const [errors, setErrors] = useState<{ [key: string]: string } | null>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClose = () => {
    if (isSubmitting) return;
    onClose();
  };

  const handleModalClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) handleClose();
  };

  const handleFeedbackChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setComment(e.target.value);
  };

  const handleRatingChange = (newRating: number) => {
    setRating(newRating);
  };

  const handleSubmit = () => {
    setErrors(null);
    setIsSubmitting(true);

    const reviewData = { rating, comment };

    fetch(`${import.meta.env.VITE_API_URL}/admin/reviews/${review?.id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${getAuthJwtToken()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reviewData),
    })
      .then((res) => {
        if (!res.ok && res.status !== 422)
          throw new Error('Failed to submit review');

        return res.json();
      })
      .then((data) => {
        if (Object.values(data?.errors || {}).length) {
          setErrors(data.errors);
          throw new Error('Validation failed');
        }

        toast(data.message, { type: 'success' });
        onUpdate();
        onClose();
      })
      .catch((error) => {
        toast(error.message, { type: 'error' });
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[100]"
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
          {review ? 'Update Review' : 'Add Review'}
        </h2>

        <div className="mb-4">
          <label
            htmlFor="feedback"
            className="block text-sm font-medium text-gray-600 mb-2"
          >
            Feedback
          </label>
          <textarea
            id="feedback"
            name="feedback"
            value={comment}
            onChange={handleFeedbackChange}
            placeholder="Write your feedback..."
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            rows={3}
          />
          <p className="text-sm text-red-500 mt-1">{errors?.feedback}</p>
        </div>

        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Rating</h3>
          <div className="flex space-x-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => handleRatingChange(star)}
                className={`text-2xl ${
                  star <= rating ? 'text-emerald-500' : 'text-gray-300'
                }`}
              >
                <FontAwesomeIcon icon={faStar} />
              </button>
            ))}
          </div>
          <p className="text-sm text-red-500 mt-1">{errors?.rating}</p>
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
            {isSubmitting ? 'Loading...' : 'Update Review'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;
