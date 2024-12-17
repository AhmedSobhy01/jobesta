import { Link, useLoaderData, useNavigate } from 'react-router';
import ErrorModule from '@/components/ErrorModule';
import { LoaderFunctionArgs } from 'react-router-dom';
import { humanReadable } from '@/utils/time';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCheck,
  faFolderOpen,
  faHourglassHalf,
  faInfoCircle,
  faLayerGroup,
  faListCheck,
  faMoneyBillWave,
  faPenToSquare,
  faTrash,
} from '@fortawesome/free-solid-svg-icons';
import ProposalModal from '@/components/Proposals/ProposalModal';
import { useContext, useState } from 'react';
import UserContext from '@/store/userContext';
import Proposals from '@/components/Jobs/Proposals';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
import EditJobModal from '@/components/Jobs/EditJobModal';
import { getAuthJwtToken } from '@/utils/auth';

function Job() {
  const navigate = useNavigate();
  const user = useContext(UserContext);

  const {
    status: loaderStatus,
    error: loaderError,
    job,
  } = useLoaderData() as {
    status: boolean;
    error?: string;
    job: Job;
  };

  const [isProposalModalOpen, setProposalModalOpen] = useState(false);

  const handleOpenProposalModal = () => {
    if (!user.username) {
      return navigate('/login?redirect=/jobs/' + job.id);
    }

    setProposalModalOpen(true);
  };

  const [isEditJobModalOpen, setEditJobModalOpen] = useState(false);

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
          fetch(import.meta.env.VITE_API_URL + '/jobs/' + job.id, {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${getAuthJwtToken()}`,
              'Content-Type': 'application/json',
            },
          })
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
              navigate(`/jobs/${job.id}`);
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
          fetch(import.meta.env.VITE_API_URL + '/jobs/' + job.id + '/reopen', {
            method: 'PUT',
            headers: {
              Authorization: `Bearer ${getAuthJwtToken()}`,
              'Content-Type': 'application/json',
            },
          })
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
              navigate(`/jobs/${job.id}`);
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

  if (!loaderStatus) {
    return (
      <ErrorModule onClose={() => navigate('/')} errorMessage={loaderError} />
    );
  }

  const canApplyToJob =
    (!user.username ||
      (user.role === 'freelancer' && job.myProposal === null)) &&
    job.status === 'open';
  const alreadyAppliedToJob = user && job?.myProposal !== null;

  return (
    <div>
      {isEditJobModalOpen && (
        <EditJobModal job={job} onClose={() => setEditJobModalOpen(false)} />
      )}

      {isProposalModalOpen && (
        <ProposalModal job={job} onClose={() => setProposalModalOpen(false)} />
      )}

      <div className="text-center bg-gray-100 py-14">
        <div className="w-full max-w-screen-xl mx-auto px-5">
          <div>
            <div className="grid gap-3">
              <div className="flex flex-col md:flex-row md:items-center gap-3 md:justify-between">
                <div className="flex flex-col md:flex-row items-center flex-1 gap-6">
                  <img
                    alt="Client profile picture"
                    src={job.client.profilePicture}
                    decoding="async"
                    loading="lazy"
                    className="rounded-full w-24 h-24"
                  />

                  <div className="md:text-left">
                    <h2 className="m-0 text-3xl font-bold tracking-tight">
                      {job.title}
                    </h2>

                    <div className=" text-lg mt-1">
                      <Link
                        to={`/users/${job.client.username}`}
                        className="text-gray-400 hover:text-gray-800 hover:underline transition-colors"
                      >
                        {job.client.firstName} {job.client.lastName}
                      </Link>
                    </div>
                  </div>
                </div>
                <div className="flex items-center flex-col md:first-letter:flex-row justify-between gap-px mr-2 md:flex-col md:items-end">
                  <span className="text-2xl font-medium">{job.budget}$</span>
                  <time dateTime="2022-12-26T05:54:30.717Z" className="">
                    Posted {humanReadable(job.createdAt)}
                  </time>

                  {canApplyToJob && (
                    <button
                      onClick={() => handleOpenProposalModal()}
                      type="button"
                      className="inline-flex text-black bg-emerald-200 border border-emerald-200 rounded-full hover:border-black justify-center px-8 py-3 mt-5"
                    >
                      Apply For this Job
                    </button>
                  )}

                  {alreadyAppliedToJob && (
                    <div className="text-sm text-gray-400 mt-5 flex items-center gap-2">
                      <FontAwesomeIcon
                        icon={faCheck}
                        className="text-green-600"
                      />
                      <span>Your proposal is already submitted</span>
                    </div>
                  )}

                  {user.username === job.client.username &&
                    job.status === 'open' && (
                      <div className="flex gap-2 mt-5">
                        <button
                          onClick={() => setEditJobModalOpen(true)}
                          type="button"
                          className="text-black bg-yellow-200 border border-yellow-200 rounded-full hover:border-black justify-center px-8 py-1.5 flex items-center gap-2"
                        >
                          <FontAwesomeIcon icon={faPenToSquare} />
                          <span>Edit Job</span>
                        </button>

                        <button
                          onClick={handleCloseJob}
                          type="button"
                          className="text-black bg-red-200 border border-red-200 rounded-full hover:border-black justify-center px-8 py-1.5 flex items-center gap-2"
                        >
                          <FontAwesomeIcon icon={faTrash} />
                          <span>Close Job</span>
                        </button>
                      </div>
                    )}

                  {user.username === job.client.username &&
                    job.status === 'closed' && (
                      <button
                        onClick={handleReopenJob}
                        type="button"
                        className="text-black bg-emerald-200 border border-emerald-200 rounded-full hover:border-black justify-center px-8 py-1.5 flex items-center gap-2 mt-5"
                      >
                        <FontAwesomeIcon icon={faFolderOpen} />
                        <span>Reopen Job</span>
                      </button>
                    )}

                  {(user.username === job.client.username ||
                    (job.myProposal &&
                      job.myProposal.freelancer &&
                      user.username === job.myProposal.freelancer.username)) &&
                    job.status === 'in_progress' && (
                      <Link
                        to={`/jobs/${job.id}/manage`}
                        className="text-black bg-emerald-200 border border-emerald-200 rounded-full hover:border-black justify-center px-8 py-1.5 flex items-center gap-2 mt-5"
                      >
                        <FontAwesomeIcon icon={faListCheck} />
                        <span>Manage Job</span>
                      </Link>
                    )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full max-w-screen-xl mx-auto px-5">
        <div>
          <div className="border-b">
            <div className="py-8">
              <div className="flex gap-10 md:gap-5 flex-wrap items-center justify-around md:justify-between">
                <div className="items-center gap-2 md:gap-5 text-center md:text-start flex flex-col md:flex-row">
                  <div className="text-2xl text-emerald-500">
                    <FontAwesomeIcon icon={faLayerGroup} />
                  </div>

                  <div className="">
                    <span className="text-sm">Category</span>
                    <p className="mt-1 font-semibold leading-none">
                      {job.category?.name || 'Uncategorized'}
                    </p>
                  </div>
                </div>

                <div className="items-center gap-2 md:gap-5 text-center md:text-start flex flex-col md:flex-row">
                  <div className="text-2xl text-emerald-500">
                    <FontAwesomeIcon icon={faInfoCircle} />
                  </div>

                  <div className="">
                    <span className="text-sm">Status</span>
                    <p className="mt-1 font-semibold leading-none">
                      {job.status
                        .split('_')
                        .map(
                          (word: string) =>
                            word[0].toUpperCase() + word.slice(1),
                        )
                        .join(' ')}
                    </p>
                  </div>
                </div>

                <div className="items-center gap-2 md:gap-5 text-center md:text-start flex flex-col md:flex-row">
                  <div className="text-2xl text-emerald-500">
                    <FontAwesomeIcon icon={faMoneyBillWave} />
                  </div>

                  <div className="">
                    <span className="text-sm">Budget</span>
                    <p className="mt-1 font-semibold leading-none">
                      {job.budget}$
                    </p>
                  </div>
                </div>

                <div className="items-center gap-2 md:gap-5 text-center md:text-start flex flex-col md:flex-row">
                  <div className="text-2xl text-emerald-500">
                    <FontAwesomeIcon icon={faHourglassHalf} />
                  </div>

                  <div className="">
                    <span className="text-sm">Duration</span>
                    <p className="mt-1 font-semibold leading-none">
                      {job.duration} Days
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10">
            <h3 className="text-2xl font-bold flex items-center gap-2">
              <FontAwesomeIcon icon={faInfoCircle} />
              <span>Description</span>
            </h3>

            <p className="mt-5">{job.description}</p>
          </div>

          {((job.proposals && job.proposals.length > 0) ||
            job?.myProposal ||
            job.client.username === user.username) && <Proposals job={job} />}
        </div>
      </div>
    </div>
  );
}

Job.loader = async ({ params }: LoaderFunctionArgs) => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/jobs/${params.jobId}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${getAuthJwtToken()}`,
          'Content-Type': 'application/json',
        },
      },
    );

    if (!response.ok) {
      return {
        status: false,
        error: (await response.json()).message || 'Error fetching job',
      };
    }

    const jobData = await response.json();
    return {
      status: true,
      job: jobData.data.job,
    };
  } catch {
    return {
      status: false,
      error: 'Error fetching job',
    };
  }
};

export default Job;
