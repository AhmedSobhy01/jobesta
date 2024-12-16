const NotificationsDropdownSkeleton = () => {
  return (
    <div className="animate-pulse">
      {[...Array(5)].map((_, i) => (
        <div className="px-4 py-2 flex gap-4 items-center" key={i}>
          <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
          <div className="flex-1">
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationsDropdownSkeleton;
