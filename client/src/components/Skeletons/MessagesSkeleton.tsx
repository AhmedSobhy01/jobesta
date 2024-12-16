function MessagesSkeleton() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="flex m-3 gap-3 items-center">
          <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-700 animate-pulse"></div>
          <div className="flex-1">
            <div className="w-2/3 h-4 bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
            <div className="w-1/3 h-4 bg-gray-300 dark:bg-gray-700 rounded mt-2 animate-pulse"></div>
          </div>
        </div>
      ))}
    </>
  );
}

export default MessagesSkeleton;
