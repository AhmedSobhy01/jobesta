import { faXmark, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router';
import { getAuthJwtToken } from '@/utils/auth';

const EditFreelaancerModal: React.FC<{
  freelancerData: {
    bio: string | null;
    skills: string[];
    previousWork: IPreviousWork[];
  };
  username: string;
  onClose: () => void;
}> = ({ freelancerData, username, onClose }) => {
  const navigate = useNavigate();

  const [errors, setErrors] = useState<{ [key: string]: string } | null>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [bio, setBio] = useState(freelancerData.bio || '');
  const [previousWork, setPreviousWork] = useState<IPreviousWork[]>(
    freelancerData.previousWork,
  );
  const [skills, setSkills] = useState<string[]>(freelancerData.skills);

  const handleClose = () => {
    if (isSubmitting) return;
    onClose();
  };

  const handleModalClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) handleClose();
  };

  const addPreviousWork = () => {
    setPreviousWork((oldPreviousWorks) => [
      ...oldPreviousWorks,
      { title: '', description: '', url: '' },
    ]);
  };

  const removePreviousWork = (index: number) => {
    setPreviousWork((oldPreviousWorks) =>
      oldPreviousWorks.filter((_, i) => i !== index),
    );
  };

  const handlePreviousWorkChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    index: number,
  ) => {
    const { name, value } = e.target;
    setPreviousWork((oldPreviousWorks) => {
      const updatedPreviousWorks = [...oldPreviousWorks];
      updatedPreviousWorks[index] = {
        ...updatedPreviousWorks[index],
        [name]: value,
      };
      return updatedPreviousWorks;
    });
  };

  const handleSubmit = () => {
    setErrors(null);
    setIsSubmitting(true);

    const modifiedPreviousWorks = previousWork.map((previousWork, i) => ({
      title: previousWork.title,
      description: previousWork.description,
      url: previousWork.url || undefined,
      order: i + 1,
    }));

    const accountData: {
      bio: string | null;
      skills: string[];
      previousWork: IPreviousWork[];
    } = {
      bio: bio === '' ? null : bio,
      skills,
      previousWork: modifiedPreviousWorks,
    };

    fetch(`${import.meta.env.VITE_API_URL}/freelancer/me`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${getAuthJwtToken()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(accountData),
    })
      .then((res) => {
        if (!res.ok && res.status !== 422)
          throw new Error('Something went wrong!');

        return res.json();
      })
      .then((data) => {
        if (Object.values(data?.errors || {}).length) {
          setErrors(data.errors);
          if (data.errors.accountId) throw new Error(data.errors.accountId);

          throw new Error('Validation failed');
        }

        return data;
      })
      .then(() => {
        toast('Updated Sucessfully', { type: 'success' });
        navigate(`/users/${username}?reload=true`);
        onClose();
      })
      .catch((error) => {
        if (error.message === 'Validation failed') return;

        toast(error.message, { type: 'error' });
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  return createPortal(
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
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
            Edit freelancer Profile
          </h2>
        </div>

        <div className="overflow-y-auto">
          <div className="mb-4 mx-2">
            <label
              htmlFor="bio"
              className="block text-sm font-medium text-gray-600 mb-2"
            >
              Bio
            </label>
            <textarea
              id="bio"
              name="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Write a small bio about yourself..."
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              rows={3}
            />
            <p className="text-sm text-red-500 mt-1">{errors?.bio}</p>
          </div>

          <div className="space-y-4 mb-4 mx-2">
            <h3 className="text-lg font-medium text-gray-700">Previous Work</h3>
            {previousWork.length > 0 ? (
              previousWork.map((previousWork, index) => (
                <div
                  key={index}
                  className="border rounded-lg p-4 bg-gray-50 shadow-sm space-y-4"
                >
                  <div>
                    <label
                      htmlFor={`previous-work-${index}-title`}
                      className="block text-sm font-medium text-gray-600"
                    >
                      Title
                    </label>
                    <input
                      type="text"
                      id={`previous-work-${index}-title`}
                      name="title"
                      value={previousWork.title}
                      onChange={(e) => handlePreviousWorkChange(e, index)}
                      placeholder="Enter Previous Work Title"
                      className="w-full p-2 mt-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                    <p className="text-sm text-red-500 mt-1">
                      {errors?.[`previousWork[${index}].title`]}
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor={`previous-work-${index}-description`}
                      className="block text-sm font-medium text-gray-600"
                    >
                      Description
                    </label>
                    <textarea
                      id={`previous-work-${index}-description`}
                      name="description"
                      value={previousWork.description}
                      onChange={(e) => handlePreviousWorkChange(e, index)}
                      placeholder="Enter Previous Work Description"
                      className="w-full p-2 mt-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                    <p className="text-sm text-red-500 mt-1">
                      {errors?.[`previousWork[${index}].description`]}
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor={`previous-work-${index}-url`}
                      className="block text-sm font-medium text-gray-600"
                    >
                      URL
                    </label>
                    <input
                      type="text"
                      id={`previous-work-${index}-url`}
                      name="url"
                      value={previousWork.url}
                      onChange={(e) => handlePreviousWorkChange(e, index)}
                      placeholder="Enter Previous Work URL"
                      className="w-full p-2 mt-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                    <p className="text-sm text-red-500 mt-1">
                      {errors?.[`previousWork[${index}].url`]}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => removePreviousWork(index)}
                    className="text-red-500 text-sm hover:underline mt-2"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                    <span className="ml-2">Remove Previous Work</span>
                  </button>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No Previous Work added</p>
            )}

            <button
              type="button"
              onClick={addPreviousWork}
              className="px-4 py-2 bg-emerald-100 text-emerald-600 rounded-md hover:bg-blue-200 focus:outline-none"
            >
              + Add Previous Work
            </button>
          </div>

          <div className="space-y-4 mb-4 mx-2">
            <h3 className="text-lg font-medium text-gray-700">Skills</h3>
            {skills.length > 0 ? (
              <div className="border rounded-lg p-4 bg-gray-50 shadow-sm space-y-4">
                {skills.map((skill, index) => (
                  <div key={index}>
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        id={`skill-${index}`}
                        name="skill"
                        value={skill}
                        onChange={(e) => {
                          setSkills((prevSkills) => {
                            const updatedSkills = [...prevSkills];
                            updatedSkills[index] = e.target.value;
                            return updatedSkills;
                          });
                        }}
                        placeholder="Enter Skill"
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />

                      <button
                        type="button"
                        onClick={() => {
                          setSkills((previousSkills) => {
                            const updatedSkills = [...previousSkills];
                            updatedSkills.splice(index, 1);
                            return updatedSkills;
                          });
                        }}
                        className="text-red-500 hover:underline px-2"
                      >
                        <FontAwesomeIcon icon={faXmark} size="lg" />
                      </button>
                    </div>
                    {errors?.[`skills[${index}]`] && (
                      <p className="text-sm text-red-500 mt-1 block">
                        {errors?.[`skills[${index}]`]}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No skills added</p>
            )}
            <button
              type="button"
              onClick={() => setSkills((oldSkills) => [...oldSkills, ''])}
              className="px-4 py-2 bg-emerald-100 text-emerald-600 rounded-md hover:bg-blue-200 focus:outline-none"
            >
              + Add Skill
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
            onClick={handleSubmit}
            className={`px-4 py-2 rounded-md focus:outline-none  bg-emerald-500
            ${isSubmitting ? 'bg-opacity-50 cursor-not-allowed' : 'text-white hover:bg-emerald-600'}`}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Loading...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>,
    document.body as HTMLElement,
  );
};

export default EditFreelaancerModal;
