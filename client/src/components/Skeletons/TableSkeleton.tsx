const TableSkeleton: React.FC<{
  columns?: number;
  rowCount?: number;
}> = ({ columns = 5, rowCount = 10 }) => {
  return (
    <>
      {Array(rowCount)
        .fill(0)
        .map((_, rowIndex) => (
          <tr key={rowIndex} className="bg-white border-b animate-pulse">
            {Array(columns)
              .fill(0)
              .map((_, colIndex) => (
                <td key={colIndex} className="px-6 py-4">
                  <div className="h-4 bg-gray-300 rounded w-full"></div>
                </td>
              ))}
          </tr>
        ))}
    </>
  );
};

export default TableSkeleton;
