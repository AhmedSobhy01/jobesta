import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

function StatsCard({
  title,
  icon,
  min,
  max,
  avg,
  color = 'purple',
}: {
  title: string;
  min: number;
  max: number;
  avg: number;
  icon: IconDefinition;
  color?: string;
}) {
  const stringMin = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(min);

  const stringMax = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(max);

  const stringAvg = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(avg);

  return (
    <div className="flex flex-col rounded-xl border border-gray-200 bg-white bg-clip-border shadow-md shadow-gray-100 dark:border-gray-600 dark:text-white dark:shadow-none py-4 px-6 max-w-sm">
      <div className="flex flex-row my-2">
        <div
          className={`rounded-full text-${color}-600 bg-${color}-100 h-12 w-12 flex items-center justify-center text-lg`}
        >
          <FontAwesomeIcon icon={icon} />
        </div>
        <div className="flex w-auto flex-col justify-center ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
        </div>
      </div>

      <section>
        <div className="flex flex-row justify-between gap-4">
          <div className="flex flex-col items-center justify-center py-2 px-4 my-2 border border-gray-300 rounded-lg hover:bg-gray-100">
            <p className="select-none text-sm font-medium text-gray-600">Min</p>
            <p className="select-none text-md font-bold text-zinc-800">
              {stringMin}
            </p>
          </div>
          <div className="flex flex-col items-center justify-center py-2 px-4 my-2 border border-gray-300 rounded-lg hover:bg-gray-100">
            <p className="select-none text-sm font-medium text-gray-600">Max</p>
            <p className="select-none text-md font-bold text-zinc-800">
              {stringMax}
            </p>
          </div>
          <div className="flex flex-col items-center justify-center py-2 px-4 my-2 border border-gray-300 rounded-lg hover:bg-gray-100">
            <p className="select-none text-sm font-medium text-gray-600">Avg</p>
            <p className="select-none text-md font-bold text-zinc-800">
              {stringAvg}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default StatsCard;
