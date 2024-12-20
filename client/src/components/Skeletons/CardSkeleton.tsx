function CardSkeleton() {
  return (
    <div className="flex flex-col items-center justify-between px-5 py-4 transition-all bg-white border hover:shadow-lg rounded-2xl gap-2">
      <div className="w-full h-6 bg-gray-300 animate-pulse rounded-lg mb-4"></div>{' '}
      <div className="w-full h-4 bg-gray-300 animate-pulse rounded-lg mb-4"></div>{' '}
      <div className="w-2/3 h-4 bg-gray-300 animate-pulse rounded-lg mt-auto"></div>{' '}
    </div>
  );
}

export default CardSkeleton;
