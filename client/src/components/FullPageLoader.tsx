const FullPageLoader = () => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="flex flex-col gap-4 items-center justify-center">
      <div className="w-20 h-20 border-4 border-transparent text-emerald-400 text-4xl animate-spin flex items-center justify-center border-t-emerald-400 rounded-full">
        <div className="w-16 h-16 border-4 border-transparent text-blue-400 text-2xl animate-spin flex items-center justify-center border-t-blue-400 rounded-full"></div>
      </div>
    </div>
  </div>
);

export default FullPageLoader;
