import { getAuthJwtToken } from '@/utils/auth';
import {
  faChevronDown,
  faChevronUp,
  faHourglassHalf,
  faMoneyBill1Wave,
  faPenToSquare,
  faTrash,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import ProposalModal from '@/components/Admin/Jobs/ProposalModal';
import JobProposalsSkeleton from '@/components/Skeletons/JobProposalsSkeleton';
import getProfilePicture from '@/utils/profilePicture';

const JobProposalsModal: React.FC<{
  jobId: number;
  onClose: () => void;
}> = ({ jobId, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [proposals, setProposals] = useState<Proposal[]>([]);

  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const toggleAccordion = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const fetchDataRef = useRef(false);
  const fetchJobProposals = useCallback(async () => {
    fetchDataRef.current = true;
    setLoading(true);

    try {
      const res = await fetch(
        import.meta.env.VITE_API_URL + '/admin/proposals/' + jobId,
        {
          headers: {
            Authorization: `Bearer ${getAuthJwtToken()}`,
          },
        },
      );

      if (!res.ok) throw new Error('Failed to fetch job proposals');

      const data = await res.json();
      setProposals(data.data.proposals);
    } catch (err) {
      toast((err as Error).message, { type: 'error' });
      onClose();
    }

    setLoading(false);
    fetchDataRef.current = false;
  }, [jobId, onClose]);

  useEffect(() => {
    if (!fetchDataRef.current) {
      fetchDataRef.current = true;
      fetchJobProposals();
    }
  }, [fetchJobProposals]);

  const handleModalClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  const [isEditJobModalOpen, setIsEditJobModalOpen] = useState(false);
  const [currentProposal, setCurrentProposal] = useState<Proposal | null>(null);
  const handleEditProposal = (proposal: Proposal) => {
    setCurrentProposal(proposal);
    setIsEditJobModalOpen(true);
  };

  const handleDeleteProposal = (proposal: Proposal) => {
    Swal.fire({
      title: 'Are you sure?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#F44336',
      cancelButtonColor: '#3085d6',
      cancelButtonText: 'Cancel',
      confirmButtonText: 'Yes, delete it',
      showLoaderOnConfirm: true,
      allowOutsideClick: () => !Swal.isLoading(),
      backdrop: true,
      preConfirm: () =>
        new Promise<void>((resolve) => {
          fetch(
            import.meta.env.VITE_API_URL +
              '/admin/proposals/' +
              jobId +
              '/' +
              proposal.freelancer?.id,
            {
              method: 'DELETE',
              headers: {
                Authorization: `Bearer ${getAuthJwtToken()}`,
                'Content-Type': 'application/json',
              },
            },
          )
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
              fetchJobProposals();
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
        <ProposalModal
          jobId={jobId}
          proposal={currentProposal!}
          onUpdate={fetchJobProposals}
          onClose={() => setIsEditJobModalOpen(false)}
        />
      )}

      {createPortal(
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
          onMouseDown={handleModalClick}
        >
          <div className="flex flex-col bg-white rounded-lg shadow-lg max-w-lg w-full p-6 relative max-h-[90vh]">
            <div>
              <button
                className="absolute top-6 right-6 text-gray-400 hover:text-gray-800 focus:outline-none p-0 m-0"
                onClick={onClose}
              >
                <FontAwesomeIcon icon={faXmark} className="text-xl" />
              </button>

              <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">
                Job Proposals
              </h2>
            </div>

            <div className="overflow-y-auto">
              {loading ? (
                <JobProposalsSkeleton />
              ) : proposals.length === 0 ? (
                <p className="text-center">No proposals found</p>
              ) : (
                proposals.map((proposal: Proposal, index: number) => (
                  <div
                    key={index}
                    className="border rounded-lg overflow-hidden mb-4 shadow-sm mx-2"
                  >
                    <div
                      className="p-4 cursor-pointer bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
                      onClick={() => toggleAccordion(index)}
                    >
                      <div className="flex justify-between items-center gap-4">
                        <div className="flex items-center flex-wrap gap-4">
                          <img
                            alt="Freelancer profile picture"
                            src={getProfilePicture(
                              proposal.freelancer!.profilePicture,
                            )}
                            decoding="async"
                            loading="lazy"
                            className="rounded-full w-12 h-12"
                          />
                          <div>
                            <h4 className="text-lg font-semibold">
                              {proposal.freelancer!.firstName}{' '}
                              {proposal.freelancer!.lastName}
                            </h4>
                            <p className="text-sm text-gray-500">
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
                            } py-0.5 px-3 rounded-full`}
                          >
                            {proposal.status
                              ? proposal.status[0].toUpperCase() +
                                proposal.status.slice(1)
                              : ''}
                          </div>
                        </div>
                        <FontAwesomeIcon
                          icon={
                            expandedIndex === index
                              ? faChevronUp
                              : faChevronDown
                          }
                        />
                      </div>

                      {proposal.status === 'pending' && (
                        <div className="flex items-center gap-3 mt-4">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditProposal(proposal);
                            }}
                            className="flex items-center gap-2 text-sm bg-yellow-500 text-white px-3 py-1 rounded-lg hover:bg-yellow-600 transition-colors duration-200"
                          >
                            <FontAwesomeIcon icon={faPenToSquare} />
                            Edit Proposal
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteProposal(proposal);
                            }}
                            className="flex items-center gap-2 text-sm bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition-colors duration-200"
                          >
                            <FontAwesomeIcon icon={faTrash} />
                            Delete Proposal
                          </button>
                        </div>
                      )}
                    </div>

                    {expandedIndex === index && (
                      <div className="p-3 bg-white">
                        <div className="flex items-center justify-around gap-2">
                          <div className="flex items-center gap-1">
                            <FontAwesomeIcon
                              icon={faMoneyBill1Wave}
                              className="text-lg text-green-500"
                            />
                            <span className="font-semibold text-base">
                              Total Amount:{' '}
                            </span>
                            <span className="text-base">
                              {proposal.milestones.reduce(
                                (
                                  acc: number,
                                  milestone: { amount: string },
                                ) => {
                                  return acc + parseFloat(milestone.amount);
                                },
                                0,
                              )}
                              $
                            </span>
                          </div>

                          <div className="flex items-center gap-1">
                            <FontAwesomeIcon
                              icon={faHourglassHalf}
                              className="text-lg text-yellow-500"
                            />
                            <span className="font-semibold text-base">
                              Total Duration:{' '}
                            </span>
                            <span className="text-base">
                              {proposal.milestones.reduce(
                                (
                                  acc: number,
                                  milestone: { duration: string },
                                ) => {
                                  return acc + parseFloat(milestone.duration);
                                },
                                0,
                              )}{' '}
                              Days
                            </span>
                          </div>
                        </div>

                        <div className="mt-3">
                          <div className="flex flex-col gap-2 border rounded-lg p-3 bg-gray-50 shadow-sm">
                            <h4 className="text-base font-semibold">
                              Cover Letter
                            </h4>
                            <p className="mt-1 text-gray-700 text-sm">
                              {proposal.coverLetter}
                            </p>
                          </div>

                          <div className="mt-2 border rounded-lg p-3 bg-gray-50 shadow-sm">
                            <h4 className="text-base font-semibold">
                              Milestones
                            </h4>
                            <div className="divide-y">
                              {proposal.milestones.map(
                                (milestone, milestoneIndex) => (
                                  <div key={milestoneIndex} className="py-2">
                                    <div className="flex items-center justify-between gap-2">
                                      <span className="font-semibold text-base">
                                        {milestone.name}
                                      </span>
                                      <span
                                        className={`text-xs text-white ${
                                          milestone.status === 'completed'
                                            ? 'bg-green-500'
                                            : 'bg-yellow-500'
                                        } py-0.5 px-2 rounded-full`}
                                      >
                                        {milestone.status
                                          ? milestone.status[0].toUpperCase() +
                                            milestone.status.slice(1)
                                          : ''}
                                      </span>
                                    </div>

                                    <div className="flex flex-col gap-1 mt-1 text-sm">
                                      <div>
                                        <span className="font-semibold">
                                          Amount:
                                        </span>{' '}
                                        <span>{milestone.amount}$</span>
                                      </div>
                                      <div>
                                        <span className="font-semibold">
                                          Duration:
                                        </span>{' '}
                                        <span>{milestone.duration} Days</span>
                                      </div>
                                    </div>
                                  </div>
                                ),
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>,
        document.body as HTMLElement,
      )}
    </>
  );
};

export default JobProposalsModal;
