import { getAuthJwtToken } from '@/utils/auth';
import { faTrash, faXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useState } from 'react';
import { toast } from 'react-toastify';

const ProposalModal: React.FC<{
  jobId: number;
  proposal: Proposal;
  onUpdate: () => void;
  onClose: () => void;
}> = ({ jobId, proposal, onUpdate, onClose }) => {
  const [coverLetter, setCoverLetter] = useState(proposal?.coverLetter || '');
  const [milestones, setMilestones] = useState<Milestone[]>(
    proposal?.milestones || [{ name: '', amount: '', duration: '', order: 1 }],
  );

  const [errors, setErrors] = useState<{ [key: string]: string } | null>({});

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClose = () => {
    if (isSubmitting) return;
    onClose();
  };

  const handleCoverLetterChange = (e: React.ChangeEvent<HTMLTextAreaElement>) =>
    setCoverLetter(e.target.value);

  const handleMilestoneChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
  ) => {
    const { name, value } = e.target;
    const updatedMilestones = milestones.map((milestone, i) =>
      i === index ? { ...milestone, [name]: value } : milestone,
    );
    setMilestones(updatedMilestones);
  };

  const addMilestone = () => {
    setMilestones([
      ...milestones,
      { name: '', amount: '', duration: '', order: milestones.length + 1 },
    ]);
  };

  const removeMilestone = (index: number) => {
    const updatedMilestones = milestones.filter((_, i) => i !== index);
    setMilestones(updatedMilestones);
  };

  const handleModalClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) handleClose();
  };

  const handleSubmit = (proposalData: Proposal) => {
    setErrors(null);
    setIsSubmitting(true);

    fetch(
      `${import.meta.env.VITE_API_URL}/admin/proposals/${jobId}/${proposal.freelancer?.id}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${getAuthJwtToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(proposalData),
      },
    )
      .then((res) => {
        if (!res.ok && res.status !== 422)
          throw new Error('Failed to update proposal');

        return res.json();
      })
      .then((data) => {
        if (Object.values(data?.errors || {}).length) {
          setErrors(data.errors);

          if (data.errors.jobId) throw new Error(data.errors.jobId);

          throw new Error('Validation failed');
        }

        return data;
      })
      .then((data) => {
        toast(data.message, { type: 'success' });
        onUpdate();
        onClose();
      })
      .catch((error) => {
        toast(error.message, { type: 'error' });
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[100]"
      onMouseDown={handleModalClick}
    >
      <div className="flex flex-col bg-white rounded-lg shadow-lg max-w-lg w-full p-6 relative max-h-[90vh]">
        <div>
          <button
            className="absolute top-6 right-6 text-gray-400 hover:text-gray-800 focus:outline-none p-0 m-0"
            onClick={handleClose}
          >
            <FontAwesomeIcon icon={faXmark} className="text-xl" />
          </button>

          <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">
            Update Proposal
          </h2>
        </div>

        <div className="overflow-y-auto">
          <div className="mb-4 mx-2">
            <label
              htmlFor="coverLetter"
              className="block text-sm font-medium text-gray-600 mb-2"
            >
              Cover Letter
            </label>
            <textarea
              id="coverLetter"
              name="coverLetter"
              value={coverLetter}
              onChange={handleCoverLetterChange}
              placeholder="Write a brief cover letter..."
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              rows={3}
            />
            <p className="text-sm text-red-500 mt-1">{errors?.coverLetter}</p>
          </div>

          <div className="space-y-4 mx-2">
            <h3 className="text-lg font-medium text-gray-700">Milestones</h3>
            {milestones.map((milestone, index) => (
              <div
                key={index}
                className="border rounded-lg p-4 bg-gray-50 shadow-sm space-y-4"
              >
                <div>
                  <label
                    htmlFor={`milestone-${index}-name`}
                    className="block text-sm font-medium text-gray-600"
                  >
                    Milestone Name
                  </label>
                  <input
                    type="text"
                    id={`milestone-${index}-name`}
                    name="name"
                    value={milestone.name}
                    onChange={(e) => handleMilestoneChange(e, index)}
                    placeholder="Enter milestone name"
                    className="w-full p-2 mt-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                  <p className="text-sm text-red-500 mt-1">
                    {errors?.[`milestones[${index}].name`]}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor={`milestone-${index}-amount`}
                      className="block text-sm font-medium text-gray-600"
                    >
                      Amount
                    </label>
                    <input
                      type="number"
                      id={`milestone-${index}-amount`}
                      name="amount"
                      min={1}
                      step={0.01}
                      value={milestone.amount}
                      onChange={(e) => handleMilestoneChange(e, index)}
                      placeholder="Amount in USD"
                      className="w-full p-2 mt-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                    <p className="text-sm text-red-500 mt-1">
                      {errors?.[`milestones[${index}].amount`]}
                    </p>
                  </div>
                  <div>
                    <label
                      htmlFor={`milestone-${index}-duration`}
                      className="block text-sm font-medium text-gray-600"
                    >
                      Duration (Days)
                    </label>
                    <input
                      type="number"
                      id={`milestone-${index}-duration`}
                      name="duration"
                      min={1}
                      value={milestone.duration}
                      onChange={(e) => handleMilestoneChange(e, index)}
                      placeholder="Days"
                      className="w-full p-2 mt-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                    <p className="text-sm text-red-500 mt-1">
                      {errors?.[`milestones[${index}].duration`]}
                    </p>
                  </div>
                </div>
                {milestones.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeMilestone(index)}
                    className="text-red-500 text-sm hover:underline mt-2"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                    <span className="ml-2">Remove Milestone</span>
                  </button>
                )}
              </div>
            ))}

            <button
              type="button"
              onClick={addMilestone}
              className="px-4 py-2 bg-emerald-100 text-emerald-600 rounded-md hover:bg-blue-200 focus:outline-none"
            >
              + Add Milestone
            </button>
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={handleClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none"
          >
            Cancel
          </button>
          <button
            onClick={() => handleSubmit({ coverLetter, milestones })}
            className={`px-4 py-2 rounded-md focus:outline-none  bg-emerald-500
            ${isSubmitting ? 'bg-opacity-50 cursor-not-allowed' : 'text-white hover:bg-emerald-600'}`}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Loading...' : 'Update Proposal'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProposalModal;
