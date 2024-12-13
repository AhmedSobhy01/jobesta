import { limitText } from '@/utils/string';
import { humanReadable } from '@/utils/time';
import CategoryBadge from '@/components/Jobs/CategoryBadge';

const JobCard: React.FC<{
  job: Job;
}> = ({ job }) => {
  return (
    <div className=" transition border rounded-xl hover:border-black hover:shadow-lg p-5 md:p-8">
      <div className="grid gap-3">
        <div className="flex flex-col justify-between md:flex-row">
          <div className="flex items-center gap-6">
            <img
              alt="Client profile picture"
              src={job.client.profilePicture}
              decoding="async"
              loading="lazy"
              className="rounded-full w-16 h-16"
            />

            <div>
              <h2 className="text-xl">{job.title}</h2>
              <span className="text-gray-400">
                {job.client.firstName} {job.client.lastName}
              </span>
            </div>
          </div>
          <div className="hidden items-center justify-between gap-px mt-4  md:flex md:mt-0 md:flex-col md:items-end">
            <span className="text-xl">{job.budget}$</span>
            <time date-time={job.createdAt} className="text-sm text-gray-400">
              Posted {humanReadable(job.createdAt)}
            </time>
          </div>
        </div>
        <div>
          <p className="text-lg text-gray-500">
            {limitText(job.description, 100)}
          </p>
        </div>
        <div className="flex flex-col justify-between gap-6 items-start  md:items-center md:flex-row">
          <div className="flex flex-wrap items-center justify-center gap-3 mt-3 md:mt-0 md:justify-start">
            <CategoryBadge category={job.category.name} />
          </div>
          <div className="flex justify-between items-center w-full md:w-auto">
            <div className="flex flex-col items-start justify-between gap-px md:hidden">
              <span className="text-xl">{job.budget}$</span>
              <time date-time={job.createdAt} className="text-sm text-gray-400">
                Posted {humanReadable(job.createdAt)}
              </time>
            </div>
            <button className="inline-flex text-black bg-green-200 border border-green-200 rounded-full hover:border-black justify-center px-8 py-2">
              Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobCard;
