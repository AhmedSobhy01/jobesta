import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

function StatsCard({
  title,
  value,
  icon,
  color = 'purple',
}: {
  title: string;
  value: number;
  icon: IconDefinition;
  color?: string;
}) {


  return (
    <div className="relative flex flex-grow items-center rounded-xl border border-gray-200 bg-white bg-clip-border shadow-md shadow-gray-100 dark:border-gray-600 dark:text-white dark:shadow-none py-4 px-6 max-w-sm">
      <div
        className={`rounded-full text-${color}-600 bg-${color}-100 h-12 w-12 flex items-center justify-center text-lg`}
      >
        <FontAwesomeIcon icon={icon} />
      </div>

      <div className="ml-4 flex w-auto flex-col justify-center">
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <h4 className="text-xl font-bold text-zinc-800 dark:text-white">
          {value}
        </h4>
      </div>
    </div>
  );
}

export default StatsCard;
