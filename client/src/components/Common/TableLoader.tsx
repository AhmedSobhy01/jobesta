const TableLoader: React.FC = () => {
  return (
    <div className="flex justify-center items-center gap-3 h-full py-2">
      <div className="w-4 h-4 border-2 border-t-2 border-t-transparent border-black rounded-full animate-spin"></div>

      <p className="text-gray-900 font-bold text-sm">Loading...</p>
    </div>
  );
};

export default TableLoader;
