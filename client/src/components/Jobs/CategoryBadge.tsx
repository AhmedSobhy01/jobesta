const CategoryBadge = ({ category }: { category: string }) => {
  return (
    <span className=" rounded-full bg-emerald-50 text-emerald-700 px-3 py-px text-sm select-none">
      {category ?? 'Uncategorized'}
    </span>
  );
};

export default CategoryBadge;
