import { getAuthJwtToken } from '@/utils/auth';
import {
  faChevronDown,
  faChevronUp,
  faPenToSquare,
  faTrash,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import ReviewModal from '@/components/Admin/Jobs/ReviewModal';
import JobProposalsSkeleton from '@/components/Skeletons/JobProposalsSkeleton';

const JobReviewsModal: React.FC<{
  jobId: number;
  onClose: () => void;
}> = ({ jobId, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<Review[]>([]);
  console.log(reviews);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const toggleAccordion = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const fetchDataRef = useRef(false);
  const fetchJobReviews = useCallback(async () => {
    fetchDataRef.current = true;
    setLoading(true);

    try {
      const res = await fetch(
        import.meta.env.VITE_API_URL + '/admin/reviews/' + jobId,
        {
          headers: {
            Authorization: `Bearer ${getAuthJwtToken()}`,
          },
        },
      );

      if (!res.ok) throw new Error('Failed to fetch job reviews');

      const data = await res.json();
      setReviews(data.data.reviews);
    } catch (err) {
      toast((err as Error).message, { type: 'error' });
      onClose();
    }

    setLoading(false);
    fetchDataRef.current = false;
  }, [jobId, onClose]);

  useEffect(() => {
    if (!fetchDataRef.current) {
      fetchDataRef.current = true;
      fetchJobReviews();
    }
  }, [fetchJobReviews]);

  const handleModalClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  const [isEditReviewModalOpen, setIsEditReviewModalOpen] = useState(false);
  const [currentReview, setCurrentReview] = useState<Review | null>(null);
  const handleEditReview = (review: Review) => {
    setCurrentReview(review);
    setIsEditReviewModalOpen(true);
  };

  const handleDeleteReview = (review: Review) => {
    Swal.fire({
      title: 'Are you sure?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#F44336',
      cancelButtonColor: '#3085d6',
      cancelButtonText: 'Cancel',
      confirmButtonText: 'Yes, delete it',
      showLoaderOnConfirm: true,
      allowOutsideClick: () => !Swal.isLoading(),
      backdrop: true,
      preConfirm: () =>
        new Promise<void>((resolve) => {
          fetch(import.meta.env.VITE_API_URL + '/admin/reviews/' + review.id, {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${getAuthJwtToken()}`,
              'Content-Type': 'application/json',
            },
          })
            .then((res) => {
              if (!res.ok && res.status !== 422)
                throw new Error('Failed to delete review');

              return res.json();
            })
            .then((data) => {
              toast(data.message, { type: 'success' });
              fetchJobReviews();
            })
            .catch((error) => {
              toast(error.message, { type: 'error' });
            })
            .finally(() => {
              resolve();
            });
        }),
    });
  };

  return (
    <>
      {isEditReviewModalOpen && (
        <ReviewModal
          jobId={jobId}
          review={currentReview!}
          onUpdate={fetchJobReviews}
          onClose={() => setIsEditReviewModalOpen(false)}
        />
      )}

      {createPortal(
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
          onMouseDown={handleModalClick}
        >
          <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 focus:outline-none"
              onClick={onClose}
            >
              <FontAwesomeIcon icon={faXmark} />
            </button>

            <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">
              Job Reviews
            </h2>

            {loading ? (
              <JobProposalsSkeleton />
            ) : reviews.length === 0 ? (
              <p className="text-center">No reviews found</p>
            ) : (
              reviews.map((review: Review, index: number) => (
                <div
                  key={index}
                  className="border rounded-lg overflow-hidden mb-4 shadow-sm"
                >
                  <div
                    className="p-4 cursor-pointer bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
                    onClick={() => toggleAccordion(index)}
                  >
                    <div className="flex justify-between items-center gap-4">
                      <div>
                        <h4 className="text-lg font-semibold">
                          {review.sender.firstName} {review.sender.lastName}
                        </h4>
                        <p className="text-sm text-gray-500">
                          Rating: {review.rating}/5
                        </p>
                      </div>
                      <FontAwesomeIcon
                        icon={
                          expandedIndex === index ? faChevronUp : faChevronDown
                        }
                      />
                    </div>
                  </div>

                  {expandedIndex === index && (
                    <div className="p-3 bg-white">
                      <div className="mt-3">
                        <div className="border rounded-lg p-3 bg-gray-50 shadow-sm">
                          <h4 className="text-base font-semibold">
                            Review Comment
                          </h4>
                          <p className="mt-1 text-gray-700 text-sm">
                            {review.comment
                              ? review.comment
                              : "user didn't add any comment."}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 mt-4">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditReview(review);
                            }}
                            className="flex items-center gap-2 text-sm bg-yellow-500 text-white px-3 py-1 rounded-lg hover:bg-yellow-600 transition-colors duration-200"
                          >
                            <FontAwesomeIcon icon={faPenToSquare} />
                            Edit Review
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteReview(review);
                            }}
                            className="flex items-center gap-2 text-sm bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition-colors duration-200"
                          >
                            <FontAwesomeIcon icon={faTrash} />
                            Delete Review
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>,
        document.body as HTMLElement,
      )}
    </>
  );
};

export default JobReviewsModal;
