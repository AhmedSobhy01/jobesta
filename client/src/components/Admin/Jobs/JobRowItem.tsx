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
  faComments,
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

      <tr className="bg-white border-b">
        <th
          scope="row"
          className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap"
        >
          {job.id}
        </th>

        <td className="px-6 py-4 whitespace-nowrap">{job.title}</td>

        <td className="px-6 py-4 whitespace-nowrap">
          {job.category.name || 'Uncategorized'}
        </td>

        <td className="px-6 py-4 whitespace-nowrap">
          <span
            className={`px-2 inline-flex text-xs leading-5 rounded-full text-white ${
              job.status === 'completed'
                ? 'bg-green-500'
                : job.status === 'open'
                  ? 'bg-yellow-500'
                  : job.status == 'closed'
                    ? 'bg-red-500'
                    : 'bg-blue-500'
            }`}
          >
            {job.status
              .split('_')
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' ')}
          </span>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          {job.client.firstName} {job.client.lastName}
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          {job.freelancer
            ? job.freelancer.firstName + ' ' + job.freelancer.lastName
            : '-'}
        </td>
        <td className="px-6 py-4 whitespace-nowrap">{job.budget}</td>
        <td className="px-6 py-4 whitespace-nowrap">{job.duration}</td>
        <td className="px-6 py-4 whitespace-nowrap">{job.proposalsCount}</td>
        <td className="px-6 py-4 space-x-5 rtl:space-x-reverse whitespace-nowrap">
          <Link
            to={`/jobs/${job.id}/${job.status === 'in_progress' || job.status === 'completed' ? 'manage' : ''}`}
          >
            <FontAwesomeIcon icon={faEye} />
          </Link>

          {job.status === 'open' && (
            <button type="button" onClick={handleCloseJob} title="Close job">
              <FontAwesomeIcon icon={faFolderClosed} />
            </button>
          )}

          {job.status === 'closed' && (
            <button type="button" onClick={handleReopenJob} title="Reopen job">
              <FontAwesomeIcon icon={faFolderOpen} />
            </button>
          )}

          <button
            type="button"
            title="Show all proposals"
            onClick={() => setIsShowProposalsModalOpen(true)}
          >
            <FontAwesomeIcon icon={faFileContract} />
          </button>

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
            title="Edit job"
          >
            <FontAwesomeIcon icon={faPenToSquare} />
          </button>

          <button type="button" onClick={deleteJob} title="Delete job">
            <FontAwesomeIcon icon={faTrash} />
          </button>
        </td>
      </tr>
    </>
  );
};

export default JobRowItem;
