const CategoryLoadingSkeleton = () => {
  return (
    <div className="animate-pulse">
      {[...Array(5)].map((_, index) => (
        <div key={index} className="h-6 bg-gray-200 rounded mb-2"></div>
      ))}
    </div>
  );
};

export default CategoryLoadingSkeleton;
