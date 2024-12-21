import getProfilePicture from '@/utils/profilePicture';
import { humanReadable } from '@/utils/time';
import { faStar } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link } from 'react-router-dom';

const Review: React.FC<{ review: Review }> = ({ review }) => {
  return (
    <div
      key={review.sender.username}
      className="border-2 rounded-lg overflow-hidden mb-4 w-full"
    >
      <div className="p-6 bg-gray-100">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center gap-4 w-full md:w-1/4">
            <img
              alt="Freelancer profile picture"
              src={getProfilePicture(review.sender!.profilePicture)}
              decoding="async"
              loading="lazy"
              className="rounded-full w-16 h-16"
            />
            <div>
              <h4 className="text-lg hover:text-green-700 font-semibold">
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

          <div className="w-full md:w-1/3 text-center mt-4 md:mt-0">
            <p className="text-sm font-semibold truncate">
              {review.comment ?? 'No comment'}
            </p>
          </div>

          <div className="w-full md:w-1/6 text-center mt-4 md:mt-0">
            <p className="text-sm text-gray-400">Rating: {review.rating}</p>
            <div className="flex justify-center mt-2">
              {[...Array(5)].map((_, index) => {
                return (
                  <span key={index}>
                    {index < Number(review.rating) ? (
                      <FontAwesomeIcon
                        icon={faStar}
                        className="text-emerald-500"
                      />
                    ) : (
                      <FontAwesomeIcon
                        icon={faStar}
                        className="text-gray-300"
                      />
                    )}
                  </span>
                );
              })}
            </div>
          </div>

          <div className="w-full md:w-1/6 text-center mt-4 md:mt-0">
            <time dateTime={review.createdAt} className="">
              Posted {humanReadable(review.createdAt)}
            </time>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Review;
