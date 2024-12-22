import React, { useState } from 'react';
import Swal from 'sweetalert2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTrash,
  faPenToSquare,
  faEye,
  faFolderOpen,
  faFolderClosed,
  faFileContract,
  faInfoCircle,
  faComments,
  faCheck,
} from '@fortawesome/free-solid-svg-icons';
import JobModal from '@/components/Admin/Jobs/JobModal.tsx';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router';
import { Link } from 'react-router';
import { getAuthJwtToken } from '@/utils/auth';
import JobProposalsModal from './JobProposalsModal';
import JobReviewsModal from './JobReviewsModal';

const JobRowItem: React.FC<{
  job: Job;
}> = ({ job }) => {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditJobModalOpen, setIsEditJobModalOpen] = useState(false);
  const [isShowProposalsModalOpen, setIsShowProposalsModalOpen] =
    useState(false);
  const [isShowReviewssModalOpen, setIsShowReviewsModalOpen] = useState(false);

  const handleCloseJob = () => {
    Swal.fire({
      title: 'Are you sure?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#F44336',
      cancelButtonColor: '#3085d6',
      cancelButtonText: 'Cancel',
      confirmButtonText: 'Yes, close it!',
      showLoaderOnConfirm: true,
      allowOutsideClick: () => !Swal.isLoading(),
      backdrop: true,
      preConfirm: () =>
        new Promise<void>((resolve) => {
          fetch(
            import.meta.env.VITE_API_URL + '/admin/jobs/' + job.id + '/close',
            {
              method: 'PUT',
              headers: {
                Authorization: `Bearer ${getAuthJwtToken()}`,
                'Content-Type': 'application/json',
              },
            },
          )
            .then((res) => {
              if (!res.ok && res.status !== 422)
                throw new Error('Failed to close job');

              return res.json();
            })
            .then((data) => {
              if (Object.values(data?.errors || {}).length) {
                if (data.errors.jobId) throw new Error(data.errors.jobId);

                throw new Error('Validation failed');
              }

              return data;
            })
            .then((data) => {
              toast(data.message, { type: 'success' });
              navigate('/admin/jobs?reload=true');
            })
            .catch((error) => {
              toast(error.message, { type: 'error' });
            })
            .finally(() => {
              resolve();
            });
        }),
    });
  };

  const handleReopenJob = () => {
    Swal.fire({
      title: 'Are you sure?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#F44336',
      cancelButtonColor: '#3085d6',
      cancelButtonText: 'Cancel',
      confirmButtonText: 'Yes, reopen it!',
      showLoaderOnConfirm: true,
      allowOutsideClick: () => !Swal.isLoading(),
      backdrop: true,
      preConfirm: () =>
        new Promise<void>((resolve) => {
          fetch(
            import.meta.env.VITE_API_URL + '/admin/jobs/' + job.id + '/reopen',
            {
              method: 'PUT',
              headers: {
                Authorization: `Bearer ${getAuthJwtToken()}`,
                'Content-Type': 'application/json',
              },
            },
          )
            .then((res) => {
              if (!res.ok && res.status !== 422)
                throw new Error('Failed to reopen job');

              return res.json();
            })
            .then((data) => {
              if (Object.values(data?.errors || {}).length) {
                if (data.errors.jobId) throw new Error(data.errors.jobId);

                throw new Error('Validation failed');
              }

              return data;
            })
            .then((data) => {
              toast(data.message, { type: 'success' });
              navigate('/admin/jobs?reload=true');
            })
            .catch((error) => {
              toast(error.message, { type: 'error' });
            })
            .finally(() => {
              resolve();
            });
        }),
    });
  };

  const deleteJob = () => {
    Swal.fire({
      title: 'Are you sure?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#F44336',
      cancelButtonColor: '#3085d6',
      cancelButtonText: 'Cancel',
      confirmButtonText: 'Yes, delete job',
      showLoaderOnConfirm: true,
      allowOutsideClick: () => !Swal.isLoading(),
      backdrop: true,
      preConfirm: () => {
        fetch(`${import.meta.env.VITE_API_URL}/admin/jobs/${job.id}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${getAuthJwtToken()}`,
          },
        })
          .then((response) => {
            if (!response.ok) throw new Error('Failed to delete job');

            return response.json();
          })
          .then((data) => {
            toast(data.message, { type: 'success' });
            navigate('/admin/jobs?reload=true');
          })
          .catch(() => {
            toast('Failed to delete job', { type: 'error' });
          });
      },
    });
  };

  const handleAcceptJob = () => {
    Swal.fire({
      title: 'Are you sure?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#F44336',
      cancelButtonColor: '#3085d6',
      cancelButtonText: 'Cancel',
      confirmButtonText: 'Yes, Approve it!',
      showLoaderOnConfirm: true,
      allowOutsideClick: () => !Swal.isLoading(),
      backdrop: true,
      preConfirm: () =>
        new Promise<void>((resolve) => {
          fetch(
            import.meta.env.VITE_API_URL + '/admin/jobs/' + job.id + '/approve',
            {
              method: 'PUT',
              headers: {
                Authorization: `Bearer ${getAuthJwtToken()}`,
                'Content-Type': 'application/json',
              },
            },
          )
            .then((res) => {
              if (!res.ok && res.status !== 422)
                throw new Error('Failed to Approve job');

              return res.json();
            })
            .then((data) => {
              if (Object.values(data?.errors || {}).length) {
                if (data.errors.jobId) throw new Error(data.errors.jobId);

                throw new Error('Validation failed');
              }

              return data;
            })
            .then((data) => {
              toast(data.message, { type: 'success' });
              navigate('/admin/jobs?reload=true');
            })
            .catch((error) => {
              toast(error.message, { type: 'error' });
            })
            .finally(() => {
              resolve();
            });
        }),
    });
  };

  return (
    <>
      {isEditJobModalOpen && (
        <JobModal job={job} onClose={() => setIsEditJobModalOpen(false)} />
      )}

      {isShowProposalsModalOpen && (
        <JobProposalsModal
          jobId={job.id}
          onClose={() => setIsShowProposalsModalOpen(false)}
        />
      )}

      {isShowReviewssModalOpen && (
        <JobReviewsModal
          jobId={job.id}
          onClose={() => setIsShowReviewsModalOpen(false)}
        />
      )}

      <tr className="bg-white border-b hover:bg-gray-50">
        <td className="px-3 py-2 2xl:px-6 2xl:py-4 text-sm text-gray-900">
          <div className="flex items-center gap-2">
            {job.id}
            <button
              className="2xl:hidden text-gray-500"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <FontAwesomeIcon icon={faInfoCircle} />
            </button>
          </div>
        </td>

        <td className="hidden 2xl:table-cell px-3 py-2 2xl:px-6 2xl:py-4 text-sm text-gray-900">
          {job.title}
        </td>

        <td className="hidden 2xl:table-cell px-3 py-2 2xl:px-6 2xl:py-4 text-sm text-gray-900">
          {job.category.name || 'Uncategorized'}
        </td>

        <td className="px-3 py-2 2xl:px-6 2xl:py-4 text-sm">
          <span
            className={`whitespace-nowrap px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full text-white ${
              job.status === 'completed'
                ? 'bg-green-500'
                : job.status === 'open'
                  ? 'bg-yellow-500'
                  : job.status === 'closed'
                    ? 'bg-red-500'
                    : job.status == 'pending'
                      ? 'bg-gray-500'
                      : 'bg-blue-500'
            }`}
          >
            {job.status
              .split('_')
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' ')}
          </span>
        </td>

        <td className="hidden 2xl:table-cell px-3 py-2 2xl:px-6 2xl:py-4 text-sm text-gray-900">
          {job.client.firstName} {job.client.lastName}
        </td>

        <td className="hidden 2xl:table-cell px-3 py-2 2xl:px-6 2xl:py-4 text-sm text-gray-900">
          {job.freelancer
            ? `${job.freelancer.firstName} ${job.freelancer.lastName}`
            : '-'}
        </td>

        <td className="hidden 2xl:table-cell px-3 py-2 2xl:px-6 2xl:py-4 text-sm text-gray-900">
          {job.budget}
        </td>

        <td className="hidden 2xl:table-cell px-3 py-2 2xl:px-6 2xl:py-4 text-sm text-gray-900">
          {job.duration}
        </td>

        <td className="hidden 2xl:table-cell px-3 py-2 2xl:px-6 2xl:py-4 text-sm text-gray-900">
          {job.proposalsCount}
        </td>

        <td className="px-3 py-2 2xl:px-6 2xl:py-4 text-sm text-gray-900">
          <div className="flex gap-4">
            <Link
              to={`/jobs/${job.id}/${job.status === 'in_progress' || job.status === 'completed' ? 'manage' : ''}`}
              className="text-blue-600 hover:text-blue-900"
              title="See job"
            >
              <FontAwesomeIcon icon={faEye} />
            </Link>

            {job.status === 'open' && (
              <button
                type="button"
                onClick={handleCloseJob}
                className="text-yellow-600 hover:text-yellow-900"
                title="Close job"
              >
                <FontAwesomeIcon icon={faFolderClosed} />
              </button>
            )}

            {job.status === 'closed' && (
              <button
                type="button"
                onClick={handleReopenJob}
                className="text-green-600 hover:text-green-900"
                title="Reopen job"
              >
                <FontAwesomeIcon icon={faFolderOpen} />
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsShowProposalsModalOpen(true)}
              className="text-purple-600 hover:text-purple-900"
              title="Show all proposals"
            >
              <FontAwesomeIcon icon={faFileContract} />
            </button>

            {job.status === 'pending' && (
              <button
                type="button"
                title="Accept job"
                onClick={handleAcceptJob}
              >
                <FontAwesomeIcon icon={faCheck} />
              </button>
            )}

            <button
              type="button"
              title="Show all reviews"
              onClick={() => setIsShowReviewsModalOpen(true)}
            >
              <FontAwesomeIcon icon={faComments} />
            </button>

            <button
              type="button"
              onClick={() => setIsEditJobModalOpen(true)}
              className="text-gray-600 hover:text-gray-900"
              title="Edit job"
            >
              <FontAwesomeIcon icon={faPenToSquare} />
            </button>

            <button
              type="button"
              onClick={deleteJob}
              className="text-red-600 hover:text-red-900"
              title="Delete job"
            >
              <FontAwesomeIcon icon={faTrash} />
            </button>
          </div>
        </td>
      </tr>

      {isExpanded && (
        <tr className="2xl:hidden bg-gray-50">
          <td colSpan={10} className="px-3 py-2">
            <div className="space-y-2">
              <p>
                <span className="font-medium">Title:</span> {job.title}
              </p>
              <p>
                <span className="font-medium">Category:</span>{' '}
                {job.category.name || 'Uncategorized'}
              </p>
              <p>
                <span className="font-medium">Client:</span>{' '}
                {job.client.firstName} {job.client.lastName}
              </p>
              <p>
                <span className="font-medium">Freelancer:</span>{' '}
                {job.freelancer
                  ? `${job.freelancer.firstName} ${job.freelancer.lastName}`
                  : '-'}
              </p>
              <p>
                <span className="font-medium">Budget:</span> {job.budget}
              </p>
              <p>
                <span className="font-medium">Duration:</span> {job.duration}
              </p>
              <p>
                <span className="font-medium">Proposals:</span>{' '}
                {job.proposalsCount}
              </p>
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

export default JobRowItem;
