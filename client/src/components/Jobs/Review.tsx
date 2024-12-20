import { useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faComments, faTrash } from '@fortawesome/free-solid-svg-icons';
import UserContext from '@/store/userContext';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
import { Link, useNavigate } from 'react-router';
import { getAuthJwtToken } from '@/utils/auth';
import { humanReadable } from '@/utils/time';
import getProfilePicture from '@/utils/profilePicture';

const Reviews: React.FC<{ job: Job }> = ({ job }) => {
  const user = useContext(UserContext);
  const navigate = useNavigate();

  const reviews: Review[] | undefined = job.reviews;

  const handleDeleteReview = () => {
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
      preConfirm: () => {
        const acceptedProposal = job.proposals?.reduce<Proposal | undefined>(
          (acc, proposal) => {
            if (proposal.status === 'accepted') {
              return proposal;
            }
            return acc;
          },
          undefined,
        );

        let freelancerID = null;

        if (job.myJob) {
          freelancerID = acceptedProposal?.freelancer?.id;
        } else {
          freelancerID = job.myProposal?.freelancer?.id;
        }

        new Promise<void>((resolve) => {
          fetch(
            `${import.meta.env.VITE_API_URL}/reviews/${job.id}/${freelancerID}`,
            {
              method: 'DELETE',
              headers: {
                Authorization: `Bearer ${getAuthJwtToken()}`,
                'Content-Type': 'application/json',
              },
            },
          )
            .then((res) => {
              if (!res.ok && res.status !== 422)
                throw new Error('Failed to delete review');

              return res.json();
            })
            .then((data) => {
              if (Object.values(data?.errors || {}).length) {
                if (data.errors.jobId) throw new Error(data.errors.jobId);

                throw new Error('Validation failed');
              }

              return data;
            })
            .then((data) => {
              toast(data.message, { type: 'success' });
              navigate(`/jobs/${job.id}`);
            })
            .catch((error) => {
              toast(error.message, { type: 'error' });
            })
            .finally(() => {
              resolve();
            });
        });
      },
    });
  };

  return (
    <div className="border-t py-8">
      <h3 className="text-2xl font-bold flex items-center gap-2">
        <FontAwesomeIcon icon={faComments} />
        <span>Reviews</span>
      </h3>

      <div className="mt-5">
        {reviews?.length === 0 && (
          <p className="text-lg text-gray-400 text-center">
            No Reviews on this job yet
          </p>
        )}

        {reviews?.map((review: Review, index: number) => (
          <div key={index} className="border-2 rounded-lg overflow-hidden mb-4">
            <div className="p-6 bg-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 w-1/5">
                  <img
                    alt="Freelancer profile picture"
                    src={getProfilePicture(review.sender!.profilePicture)}
                    decoding="async"
                    loading="lazy"
                    className="rounded-full w-16 h-16"
                  />
                  <div>
                    <h4 className="text-lg font-semibold">
                      {review.sender!.firstName} {review.sender!.lastName}
                    </h4>
                    <Link
                      to={`/users/${review.sender!.username}`}
                      className="text-sm hover:underline text-gray-400"
                    >
                      {review.sender!.username}
                    </Link>
                  </div>
                </div>

                <div className="w-1/4 text-center">
                  <p className="text-sm font-semibold truncate">
                    {review.comment}
                  </p>
                </div>

                <div className="w-1/6 text-center">
                  <p className="text-sm text-gray-400">
                    Rating: {review.rating}
                  </p>
                </div>

                <div className="w-1/6 text-center">
                  <time dateTime={review.createdAt} className="">
                    Posted {humanReadable(review.createdAt)}
                  </time>
                </div>

                <div className="w-1/6 text-center justify-items-center">
                  {review.sender!.username === user.username ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteReview();
                      }}
                      className="flex items-center gap-2 text-sm bg-red-500 text-white px-3 py-1 rounded-lg select-none"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                      Delete Review
                    </button>
                  ) : (
                    <div className="invisible h-8"></div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Reviews;
