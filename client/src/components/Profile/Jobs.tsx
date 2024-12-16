import { Link } from 'react-router';

const Jobs: React.FC<{ job: IJob }> = ({ job }) => {
  const {
    title,
    description,
    budget,
    duration,
    category,
    createdAt,
    status,
    client,
  } = job;

  let statusColor = '';
  if (status && status == 'open') {
    statusColor =
      'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900';
  } else if (status && status == 'in_progress') {
    statusColor =
      'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900';
  } else if (status && status == 'completed') {
    statusColor =
      'text-gray-600 bg-gray-200 dark:text-gray-400 dark:bg-gray-800';
  } else if (status && (status == 'closed' || status == 'cancelled')) {
    statusColor = 'text-gray-600 bg-red-200 dark:text-gray-400 dark:bg-red-900';
  } else {
    statusColor =
      'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-700';
  }

  return (
    <Link
      to={`/jobs/${job.id}`}
      className="bg-inherit shadow-md rounded-lg p-6 w-80 space-y-4 border border-gray-200"
    >
      <div className="flex justify-between items-center">
        <h2 className="text-lg dark:text-gray-200 hover:text-green-500 font-semibold text-gray-800">
          {title || 'No Title'}
        </h2>
        {status && (
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${statusColor}`}
          >
            {status
              .split('_')
              .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
              .join(' ')}
          </span>
        )}
      </div>
      <p className="text-gray-600 dark:text-gray-100 text-sm">
        {description || 'No Description'}
      </p>
      <p className="text-gray-800 dark:text-gray-200 text-sm font-medium">
        Category:{' '}
        <span className="text-gray-600 dark:text-gray-100">
          {category?.name || 'Uncategorized'}
        </span>
      </p>
      <p className="text-gray-800 dark:text-gray-200 text-sm font-medium">
        Budget:{' '}
        <span className="text-green-600">
          {budget ? `$${budget}` : 'Not Specified'}
        </span>
      </p>
      <p className="text-gray-800 dark:text-gray-200 text-sm font-medium">
        Duration:{' '}
        <span className="text-gray-600 dark:text-gray-200">
          {duration || 'Not Specified'}
        </span>
      </p>
      <div className="flex items-center space-x-4 mt-4">
        <img
          className="w-12 h-12 rounded-full object-cover"
          src={client?.profilePicture || '/default-profile.jpg'}
          alt="Client Profile"
        />
        <p className="text-gray-800 dark:text-gray-200 text-sm">
          Client:{' '}
          <span className="font-semibold">
            {client?.firstName || 'Unknown'} {client?.lastName || ''}
          </span>
        </p>
      </div>
      <p className="text-gray-500 dark:text-gray-100 text-xs">
        Posted: {createdAt || 'N/A'}
      </p>
    </Link>
  );
};

export default Jobs;
