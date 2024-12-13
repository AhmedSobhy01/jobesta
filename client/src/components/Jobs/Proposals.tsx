import { useContext, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faRectangleList,
  faChevronDown,
  faChevronUp,
  faHourglassHalf,
  faPenToSquare,
  faTrash,
  faCheck,
} from '@fortawesome/free-solid-svg-icons';
import { faMoneyBill1Wave } from '@fortawesome/free-solid-svg-icons/faMoneyBill1Wave';
import UserContext from '@/store/userContext';
import ProposalModal from '@/components/Proposals/ProposalModal';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router';

const Proposals: React.FC<{ job: Job }> = ({ job }) => {
  const user = useContext(UserContext);
  const navigate = useNavigate();

  const proposals: Proposal[] = job.myProposal ? [job.myProposal] : [];
  if (job.proposals && job.proposals.length) proposals.push(...job.proposals);

  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const toggleAccordion = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const [isEditProposalModalOpen, setEditProposalModalOpen] = useState(false);
  const [currentProposal, setCurrentProposal] = useState<Proposal | undefined>(
    undefined,
  );

  const handleEditProposal = (proposal: Proposal) => {
    setCurrentProposal(proposal);
    setEditProposalModalOpen(true);
  };

  const handleDeleteProposal = () => {
    Swal.fire({
      title: 'Are you sure?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      cancelButtonText: 'Cancel',
      confirmButtonText: 'Yes, delete it',
      showLoaderOnConfirm: true,
      allowOutsideClick: () => !Swal.isLoading(),
      backdrop: true,
      preConfirm: () =>
        new Promise<void>((resolve) => {
          fetch(import.meta.env.VITE_API_URL + '/proposals/' + job.id, {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${user.jwtToken}`,
              'Content-Type': 'application/json',
            },
          })
            .then((res) => {
              if (!res.ok && res.status !== 422)
                throw new Error('Failed to delete proposal');

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

  const handleAcceptProposal = (proposal: Proposal) => {
    Swal.fire({
      title: 'Are you sure?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      cancelButtonText: 'Cancel',
      confirmButtonText: 'Yes, accept it',
      showLoaderOnConfirm: true,
      allowOutsideClick: () => !Swal.isLoading(),
      backdrop: true,
      preConfirm: () =>
        new Promise<void>((resolve) => {
          fetch(
            `${import.meta.env.VITE_API_URL}/jobs/${job.id}/${proposal.freelancer?.id}/accept`,
            {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${user.jwtToken}`,
                'Content-Type': 'application/json',
              },
            },
          )
            .then((res) => {
              if (!res.ok && res.status !== 422)
                throw new Error('Failed to accept proposal');

              return res.json();
            })
            .then((data) => {
              if (Object.values(data?.errors || {}).length) {
                if (data.errors.jobId || data.errors.freelancerId)
                  throw new Error(
                    data.errors.jobId || data.errors.freelancerId,
                  );

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

  return (
    <div className="border-t py-8 mt-10">
      {isEditProposalModalOpen && (
        <ProposalModal
          job={job}
          proposal={currentProposal}
          onClose={() => setEditProposalModalOpen(false)}
        />
      )}

      <h3 className="text-2xl font-bold flex items-center gap-2">
        <FontAwesomeIcon icon={faRectangleList} />
        <span>Proposals</span>
      </h3>

      <div className="mt-5">
        {proposals.length === 0 && (
          <p className="text-lg text-gray-400 text-center">
            No proposals on this job yet
          </p>
        )}

        {proposals.map((proposal: Proposal, index: number) => (
          <div key={index} className="border-2 rounded-lg overflow-hidden mb-4">
            <div
              className="p-6 flex justify-between items-center cursor-pointer bg-gray-100"
              onClick={() => toggleAccordion(index)}
            >
              <div className="flex items-center gap-4">
                <img
                  alt="Freelancer profile picture"
                  src={proposal.freelancer!.profilePicture}
                  decoding="async"
                  loading="lazy"
                  className="rounded-full w-16 h-16"
                />

                <div>
                  <h4 className="text-lg font-semibold">
                    {proposal.freelancer!.firstName}{' '}
                    {proposal.freelancer!.lastName}
                  </h4>
                  <p className="text-sm text-gray-400">
                    {proposal.freelancer!.username}
                  </p>
                </div>

                <div
                  className={`text-sm text-white ${
                    proposal.status === 'accepted'
                      ? 'bg-green-500'
                      : proposal.status === 'rejected'
                        ? 'bg-red-500'
                        : 'bg-yellow-500'
                  } py-0.5 px-3 rounded-3xl`}
                >
                  {proposal.status
                    ? proposal.status[0].toUpperCase() +
                      proposal.status.slice(1)
                    : ''}
                </div>
              </div>

              <div className="flex items-center gap-7">
                {proposal.status === 'pending' &&
                  proposal.freelancer!.username === user.username && (
                    <div className="flex flex-col items-end gap-2 z-30">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditProposal(proposal);
                        }}
                        className="flex items-center gap-2 text-sm bg-yellow-500 text-white px-3 py-1 rounded-lg select-none"
                      >
                        <FontAwesomeIcon icon={faPenToSquare} />
                        Edit Proposal
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteProposal();
                        }}
                        className="flex items-center gap-2 text-sm bg-red-500 text-white px-3 py-1 rounded-lg select-none"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                        Delete Proposal
                      </button>
                    </div>
                  )}

                {proposal.status === 'pending' &&
                  job.client.username === user.username && (
                    <div className="flex flex-col items-end gap-2 z-30">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAcceptProposal(proposal);
                        }}
                        className="flex items-center gap-2 text-sm bg-green-500 text-white px-3 py-1 rounded-lg select-none"
                      >
                        <FontAwesomeIcon icon={faCheck} />
                        Accept Proposal
                      </button>
                    </div>
                  )}

                <FontAwesomeIcon
                  icon={expandedIndex === index ? faChevronUp : faChevronDown}
                />
              </div>
            </div>

            {expandedIndex === index && (
              <div className="p-6">
                <div className="flex items-center justify-around gap-3">
                  <div>
                    <FontAwesomeIcon
                      icon={faMoneyBill1Wave}
                      className="text-2xl"
                    />
                    <span className="ml-4 font-bold text-2xl">
                      Total Amount:{' '}
                    </span>
                    <span className="text-2xl">
                      {proposal.milestones.reduce(
                        (acc: number, milestone: { amount: string }) => {
                          return acc + parseFloat(milestone.amount);
                        },
                        0,
                      )}
                      $
                    </span>
                  </div>

                  <div>
                    <FontAwesomeIcon
                      icon={faHourglassHalf}
                      className="text-2xl"
                    />
                    <span className="ml-4 font-bold text-2xl">
                      Total Duration:{' '}
                    </span>
                    <span className="text-2xl">
                      {proposal.milestones.reduce(
                        (acc: number, milestone: { duration: string }) => {
                          return acc + parseFloat(milestone.duration);
                        },
                        0,
                      )}{' '}
                      Days
                    </span>
                  </div>
                </div>

                <div>
                  <div className="flex flex-col gap-3 mt-6 border rounded-lg p-5 bg-gray-50 shadow-sm">
                    <h4 className="text-lg font-bold">Cover Letter</h4>
                    <p className="mt-2">{proposal.coverLetter}</p>
                  </div>

                  <div className="flex flex-col gap-3 mt-3 border rounded-lg p-5 bg-gray-50 shadow-sm">
                    <h4 className="text-lg font-bold">Milestones</h4>
                    {proposal.milestones.map((milestone, milestoneIndex) => (
                      <div key={milestoneIndex} className="border-b py-3">
                        <div className="flex items-center justify-between gap-3">
                          <span className="font-semibold text-lg">
                            {milestone.name}
                          </span>
                          <span
                            className={`text-sm text-white ${
                              milestone.status === 'completed'
                                ? 'bg-green-500'
                                : 'bg-yellow-500'
                            } py-0.5 px-3 rounded-3xl`}
                          >
                            {milestone.status
                              ? milestone.status[0].toUpperCase() +
                                milestone.status.slice(1)
                              : ''}
                          </span>
                        </div>
                        <div className="flex flex-col gap-3 mt-2">
                          <div>
                            <span className="font-bold">Amount:</span>{' '}
                            <span>{milestone.amount}$</span>
                          </div>
                          <div>
                            <span className="font-bold">Duration:</span>{' '}
                            <span>{milestone.duration} Days</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Proposals;
