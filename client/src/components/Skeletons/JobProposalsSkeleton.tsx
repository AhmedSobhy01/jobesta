const JobProposalsSkeleton = () => {
  return (
    <div className="animate-pulse space-y-3">
      {[...Array(3)].map((_, index) => (
        <div
          className="flex justify-between items-center gap-4 bg-gray-100 p-4"
          key={index}
        >
          <div className="flex items-center flex-wrap gap-4">
            <div className="rounded-full bg-gray-300 w-12 h-12"></div>
            <div>
              <div className="h-5 bg-gray-300 rounded w-32 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-24"></div>
            </div>
            <div className="h-5 bg-gray-300 rounded-full w-20 py-0.5 px-3"></div>
          </div>
          <div className="h-5 bg-gray-300 rounded w-5"></div>
        </div>
      ))}
    </div>
  );
};

export default JobProposalsSkeleton;
