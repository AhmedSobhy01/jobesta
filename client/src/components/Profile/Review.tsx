const Review: React.FC<{ review: Review }> = ({ review }) => {
  return (
    <div
      key={review.sender.username}
      className="border-2 rounded-lg overflow-hidden mb-4 w-full"
    >
      <div className="p-6 bg-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 w-1/4">
            <img
              alt="Freelancer profile picture"
              src={review.sender!.profilePicture}
              decoding="async"
              loading="lazy"
              className="rounded-full w-16 h-16"
            />
            <div>
              <h4 className="text-lg font-semibold">
                {review.sender!.firstName} {review.sender!.lastName}
              </h4>
              <p className="text-sm text-gray-400">{review.sender!.username}</p>
            </div>
          </div>

          <div className="w-1/3 text-center">
            <p className="text-sm font-semibold truncate">{review.comment}</p>
          </div>

          <div className="w-1/6 text-center">
            <p className="text-sm text-gray-400">Rating: {review.rating}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Review;
