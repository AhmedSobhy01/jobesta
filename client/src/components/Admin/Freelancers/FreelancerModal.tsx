import { faXmark, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect, useState, useRef } from 'react';
import { toast } from 'react-toastify';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router';
import { getAuthJwtToken } from '@/utils/auth';

const FreelancerModal: React.FC<{
  freelancer?: Account;
  onClose: () => void;
}> = ({ freelancer, onClose }) => {
  const navigate = useNavigate();
  const isUpdate = !!freelancer;

  const [firstName, setFirstName] = useState(freelancer?.firstName || '');
  const [lastName, setLastName] = useState(freelancer?.lastName || '');
  const [username, setUsername] = useState(freelancer?.username || '');
  const [email, setEmail] = useState(freelancer?.email || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [bio, setBio] = useState('');
  const [previousWork, setPreviousWork] = useState<IPreviousWork[]>([]);
  const [skills, setSkills] = useState<string[]>([]);

  const [errors, setErrors] = useState<{ [key: string]: string } | null>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchDataRef = useRef(false);
  useEffect(() => {
    if (!isUpdate || fetchDataRef.current) return;
    fetchDataRef.current = true;
    (async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/admin/accounts/freelancer/${freelancer?.id}`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${getAuthJwtToken()}`,
              'Content-Type': 'application/json',
            },
          },
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);

        setSkills(data.data.freelancer.skills);
        setPreviousWork(data.data.freelancer.previousWork);
        setBio(data.data.freelancer.bio);
      } catch (error) {
        toast((error as Error).message, { type: 'error' });
      }
      fetchDataRef.current = false;
    })();
  }, [freelancer, isUpdate]);

  const handleClose = () => {
    if (isSubmitting) return;
    onClose();
  };

  const handleModalClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) handleClose();
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

  const handleSubmit = async () => {
    setErrors(null);
    setIsSubmitting(true);
    let errorFlag = false;

    const modifiedPreviousWorks = previousWork.map((previousWork, i) => ({
      title: previousWork.title,
      description: previousWork.description,
      url: previousWork.url || undefined,
      order: i + 1,
    }));

    const accountData: {
      role: string;
      firstName: string;
      lastName: string;
      username: string;
      email: string;
      password?: string;
      confirmPassword?: string;
      bio: string;
      skills: string[];
      previousWork: IPreviousWork[];
    } = {
      role: 'freelancer',
      firstName,
      lastName,
      username,
      email,
      password,
      confirmPassword,
      bio,
      skills,
      previousWork: modifiedPreviousWorks,
    };

    if (password.trim() === '') {
      delete accountData.password;
      delete accountData.confirmPassword;
    }

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/admin/accounts/${freelancer?.id || ''}`,
        {
          method: isUpdate ? 'PUT' : 'POST',
          headers: {
            Authorization: `Bearer ${getAuthJwtToken()}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(accountData),
        },
      );

      if (!res.ok && res.status !== 422)
        throw new Error('Something went wrong!');

      const data = await res.json();

      if (Object.values(data?.errors || {}).length) {
        setErrors(data.errors);
        errorFlag = true;
      }

      if (errorFlag) throw new Error('Validation failed');

      toast(data.message, { type: 'success' });
      navigate('/admin/freelancers?reload=true');
      onClose();
    } catch (error) {
      if ((error as Error).message === 'Validation failed') return;
      toast((error as Error).message, { type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
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
            {isUpdate ? 'Update Freelancer' : 'Create Freelancer'}
          </h2>
        </div>

        <div className="overflow-y-scroll">
          <div className="mb-4 flex flex-col">
            <label
              htmlFor="firstName"
              className="block text-sm font-medium text-gray-600 mb-2 mx-2 mx-2"
            >
              First Name
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="First Name"
              className="flex-grow mx-2 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
            <p className="text-sm text-red-500 mt-1 mx-2">{errors?.firstName}</p>
          </div>

          <div className="mb-4 flex flex-col">
            <label
              htmlFor="lastName"
              className="block text-sm font-medium text-gray-600 mb-2 mx-2"
            >
              Last Name
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Last Name"
              className="mx-2 flex-grow p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
            <p className="text-sm text-red-500 mt-1 mx-2">{errors?.lastName}</p>
          </div>

          <div className="mb-4 flex flex-col">
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-600 mb-2 mx-2"
            >
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              className="mx-2 flex-grow p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
            <p className="text-sm text-red-500 mt-1 mx-2">{errors?.username}</p>
          </div>

          <div className="mb-4 flex flex-col">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-600 mb-2 mx-2"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="mx-2 flex-grow p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
            <p className="text-sm text-red-500 mt-1 mx-2">{errors?.email}</p>
          </div>

          <div className="mb-4 flex flex-col">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-600 mb-2 mx-2"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="mx-2 flex-grow p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
            <p className="text-sm text-red-500 mt-1 mx-2">{errors?.password}</p>
          </div>

          <div className="mb-4 flex flex-col">
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-600 mb-2 mx-2"
            >
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm Password"
              className="mx-2 flex-grow p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
            <p className="text-sm text-red-500 mt-1 mx-2">
              {errors?.confirmPassword}
            </p>
          </div>

          <div className="mb-4 flex flex-col">
            <label
              htmlFor="bio"
              className="block text-sm font-medium text-gray-600 mb-2 mx-2"
            >
              Bio
            </label>
            <textarea
              id="bio"
              name="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Write a small bio about yourself..."
              className="mx-2 flex-grow p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              rows={3}
            />
            <p className="text-sm text-red-500 mt-1 mx-2">{errors?.bio}</p>
          </div>

          <div className="space-y-4 mb-4 flex flex-col">
            <h3 className="text-lg font-medium text-gray-700 mx-2">Previous Work</h3>
            {previousWork.length > 0 ? (
              previousWork.map((previousWork, index) => (
                <div
                  key={index}
                  className="border rounded-lg p-4 bg-gray-50 shadow-sm space-y-4 mx-2"
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
              <p className="text-gray-500 mx-2">No Previous Work added</p>
            )}

            <button
              type="button"
              onClick={addPreviousWork}
              className="w-fit px-4 py-2 bg-emerald-100 text-emerald-600 rounded-md hover:bg-blue-200 focus:outline-none mx-2"
            >
              + Add Previous Work
            </button>
          </div>

          <div className="space-y-4 mb-4 flex flex-col">
            <h3 className="text-lg font-medium text-gray-700 mx-2">Skills</h3>
            {skills.length > 0 ? (
              <div className="border rounded-lg p-4 bg-gray-50 shadow-sm space-y-4 mx-2">
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
              <p className="text-gray-500 mx-2">No skills added</p>
            )}
            <button
              type="button"
              onClick={() => setSkills((oldSkills) => [...oldSkills, ''])}
              className="mx-2 w-fit px-4 py-2 bg-emerald-100 text-emerald-600 rounded-md hover:bg-blue-200 focus:outline-none"
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
            {isSubmitting
              ? 'Loading...'
              : isUpdate
                ? 'Update Freelancer'
                : 'Create Freelancer'}
          </button>
        </div>
      </div>
    </div>,
    document.body as HTMLElement,
  );
};

export default FreelancerModal;
