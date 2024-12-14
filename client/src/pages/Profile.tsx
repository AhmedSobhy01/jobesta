import ErrorModule from '@/components/ErrorModule';
import FreelancerContext from '@/store/freelancerContext';
import UserContext from '@/store/userContext';
import React, { useContext, useEffect, useState } from 'react';
import {
  LoaderFunctionArgs,
  useLoaderData,
  useNavigate,
  useParams,
} from 'react-router-dom';
import EditProfileModal from '@/components/Profile/EditProfileModal';
import { getAuthJwtToken, getAuthRefreshToken } from '@/utils/auth';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import ProfilePicture from '@/components/Profile/ProfilePicture';
import ProfileBio from '@/components/Profile/ProfileBio';
import Badge from '@/components/Profile/Badge';
import Jobs from '@/components/Profile/Jobs';

const activeCss =
  'text-green-700   font-semibold pb-2 border-b-2 border-gray-800 dark:text-green-700';
const notActiveCss =
  'text-gray-800 hover:bg-gray-100 md:hover:bg-transparent dark:text-gray-200 md:hover:text-green-700 md:dark:hover:text-green-700 font-semibold pb-2  border-gray-800';

const ProfilePage: React.FC & {
  loader?: (args: LoaderFunctionArgs) => Promise<unknown>;
} = () => {
  //contexts
  const userData = useContext(UserContext);
  const freelancerData = useContext(FreelancerContext);
  const { setFreelancer } = useContext(FreelancerContext);
  //nav and params
  const navigate = useNavigate();
  const param = useParams();

  //loader data
  const anyUserData = useLoaderData();

  //some states needed
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [activeComp, setActiveComp] = useState({
    jobsActive: true,
    previousWorkActive: false,
    skillsActive: false,
  });

  //bio states
  const [isEditModalOpen, setEditModalOpen] = useState(false);

  //prevWork states
  const [editPrevWork, setEditPrevWork] = useState(false);
  const [newPreviousWork, setNewPreviousWork] = useState<
    IPreviousWork | undefined
  >({
    title: '',
    description: '',
    url: '',
  });

  //skills states
  const [newSkill, setNewSkill] = useState('');
  const [editSkill, setEditSkill] = useState(false);

  const accountData = {
    firstName: anyUserData.user
      ? anyUserData.user.firstName
      : userData.firstName,
    lastName: anyUserData.user ? anyUserData.user.lastName : userData.lastName,
    username: anyUserData.user ? anyUserData.user.username : userData.username,
    role: anyUserData.user ? anyUserData.user.role : userData.role,
    isBanned: anyUserData.user ? anyUserData.user.isBanned : userData.isBanned,
    profilePicture: anyUserData.user
      ? anyUserData.user.profilePicture
      : userData.profilePicture,
    jobs: anyUserData.user?.jobs,
  };

  const freelancerAccountData = {
    bio: anyUserData.freelancer?.bio,
    previousWork: anyUserData.freelancer?.previousWork,
    skills: anyUserData.freelancer?.skills,
    badges: anyUserData.freelancer?.badges,
  };

  useEffect(() => {
    if (
      userData.username === param.username &&
      anyUserData.user &&
      anyUserData.freelancer &&
      anyUserData.user.role === 'freelancer'
    ) {
      const { bio, skills, previousWork, badges, jobs } =
        anyUserData.freelancer;
      setFreelancer({ bio, skills, previousWork, badges, jobs });
    }
    setError(false);
  }, [anyUserData, param.username, setFreelancer, userData]);

  const handleAddSkill = () => {
    if (!newSkill) {
      setError(true);
      setErrorMessage('Skill name cannot be empty.');
      return;
    }

    handleUpdateFreelancerData({ newSkill });
    setNewSkill('');
    setEditSkill(false);
  };

  const handleSavePreviousWork = () => {
    if (!newPreviousWork?.title || !newPreviousWork?.description) {
      setError(true);
      setErrorMessage('Title and description are required.');
      return;
    }

    handleUpdateFreelancerData({ newPreviousWork });

    setNewPreviousWork({ title: '', description: '', url: '' });
    setEditPrevWork(false);
  };

  async function handleUpdateFreelancerData(data: {
    newBio?: string;
    updatingBio?: boolean;
    newPreviousWork?: IPreviousWork;
    newSkill?: string;
  }) {
    const jwtToken = getAuthJwtToken();
    const refreshToken = getAuthRefreshToken();

    if (!refreshToken || refreshToken === 'EXPIRED') {
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('jwtToken');
      localStorage.removeItem('jwtTokenExpiration');
      navigate('/login');
    }

    let allPrevWork = [
      ...(freelancerData.previousWork ? freelancerData.previousWork : []),
    ];

    if (data.newPreviousWork) {
      allPrevWork = [...(allPrevWork ? allPrevWork : []), data.newPreviousWork];
    }

    allPrevWork = allPrevWork.map((prev, index) => ({
      title: prev.title,
      description: prev.description,
      ...(prev.url && { url: prev.url }),
      order: index + 1,
    }));

    const allSkills = [
      ...(freelancerData.skills ? freelancerData.skills : []),
      data.newSkill,
    ];

    let newbio = freelancerData.bio;

    if (data.updatingBio && data.newBio === '') {
      newbio = '';
    }
    if (data.updatingBio && data.newBio !== '') {
      newbio = data.newBio;
    }

    const newData = {
      bio: newbio,
      previousWork: allPrevWork,
      skills: data.newSkill ? allSkills : freelancerData.skills,
    };

    try {
      let newJwtToken = jwtToken;
      if (!jwtToken || jwtToken === 'EXPIRED') {
        localStorage.removeItem('jwtToken');
        localStorage.removeItem('jwtTokenExpiration');

        const authData = { refreshToken };
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/auth/refresh`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(authData),
          },
        );

        const resData = await response.json();

        if (!response.ok) {
          setError(true);
          setErrorMessage(resData.message);
          return;
        }

        newJwtToken = resData.data.jwtToken;
        if (newJwtToken) localStorage.setItem('jwtToken', newJwtToken);

        const jwtTokenExpiration = new Date();
        jwtTokenExpiration.setHours(jwtTokenExpiration.getHours() + 1);
        localStorage.setItem(
          'jwtTokenExpiration',
          jwtTokenExpiration.toISOString(),
        );
      }
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/freelancer/me`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${jwtToken}`,
          },
          body: JSON.stringify(newData),
        },
      );

      const resData = await response.json();

      if (!response.ok) {
        if (!resData.status) {
          if (response.status === 422) {
            if (data.newSkill) {
              const index = freelancerData.skills
                ? freelancerData.skills.length
                : 0;
              const obj = `skills[${index}]`;
              if (freelancerData.skills && resData.errors[obj]) {
                throw new Error(resData.errors[obj]);
              }
            } else if (data.newPreviousWork && freelancerData.previousWork) {
              const index = freelancerData.previousWork
                ? freelancerData.previousWork.length
                : 0;
              const titObj = `previousWork[${index}].title`;
              const descObj = `previousWork[${index}].description`;
              const urlObj = `previousWork[${index}].url`;
              if (resData.errors[titObj]) {
                throw new Error(resData.errors[titObj]);
              } else if (resData.errors[descObj]) {
                throw new Error(resData.errors[descObj]);
              } else if (resData.errors[urlObj]) {
                throw new Error(resData.errors[urlObj]);
              }
            } else if (newData.bio && resData.errors?.bio) {
              throw new Error(resData.errors?.bio);
            }
            throw new Error('Invalid data');
          }
          throw new Error('Error updatiing data');
        }
        return;
      }

      navigate(`/users/${userData.username}`);
    } catch (err) {
      setError(true);
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('A network error occurred. Please try again later.');
      }
    }
  }

  function handleCancelEdit() {
    setEditPrevWork(false);
    setEditSkill(false);
  }

  function handleEditClick() {
    setEditModalOpen(true);
  }

  function handleModalClose() {
    setEditModalOpen(false);
  }

  function handleJobsClick(): void {
    setActiveComp({
      jobsActive: true,
      previousWorkActive: false,
      skillsActive: false,
    });
  }

  function handleAboutClick(): void {
    setActiveComp({
      jobsActive: false,
      previousWorkActive: false,
      skillsActive: true,
    });
  }

  function handlePrevWorkClick(): void {
    setActiveComp({
      jobsActive: false,
      previousWorkActive: true,
      skillsActive: false,
    });
  }

  const handleEditErrorClose = () => {
    setError(false);
  };

  const handleErrorClose = () => {
    navigate('/');
  };

  if (anyUserData.message) {
    return (
      <ErrorModule
        onClose={handleErrorClose}
        errorMessage="Error getting user"
      />
    );
  }

  if (userData.username != param.username && !anyUserData) {
    return (
      <ErrorModule onClose={handleErrorClose} errorMessage="User not found." />
    );
  }

  return (
    <>
      {error && (
        <ErrorModule
          errorMessage={errorMessage}
          onClose={handleEditErrorClose}
        />
      )}
      {isEditModalOpen && (
        <EditProfileModal
          isOpen={isEditModalOpen}
          onClose={handleModalClose}
          initialData={{
            firstName: accountData.firstName,
            lastName: accountData.lastName,
            username: accountData.username,
            email: userData.email ? userData.email : '',
            password: '',
            confirmPassword: '',
          }}
          setError={setError}
          setErrorMessage={setErrorMessage}
        />
      )}
      <div className="max-w-6xl h-screen mx-auto mt-6 p-4">
        <div className="relative w-full bg-gradient-to-t from-green-200 to-green-500 h-48 rounded-lg shadow-lg">
          <ProfilePicture
            anyUserData={anyUserData}
            setError={setError}
            setErrorMessage={setErrorMessage}
          />
        </div>
        <div className="mt-12 bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md flex flex-col md:flex-row gap-6 items-center">
          <div className="w-full md:w-1/3 text-left">
            <div className="flex gap-4 items-baseline">
              <h2 className="text-xl font-bold text-green-700 dark:text-green-700">
                {accountData.firstName} {accountData.lastName}
              </h2>
              {param.username === userData.username && (
                <button
                  onClick={handleEditClick}
                  className="dark:text-gray-600 text-gray-800 hover:text-gray-500 dark:hover:text-gray-400"
                >
                  Edit Profile
                </button>
              )}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              @{accountData.username}
            </p>
            {accountData.role === 'freelancer' && (
              <div className="mt-4">
                <ProfileBio
                  anyUserData={anyUserData}
                  setError={setError}
                  handleUpdateFreelancerData={handleUpdateFreelancerData}
                  freelancerAccountData={freelancerAccountData}
                />
              </div>
            )}
          </div>

          {/* Stats Section */}
          {userData.role === 'freelancer' && (
            <div className="flex gap-4">
              {freelancerAccountData.badges.map(
                (badge: IBadge, index: number) => {
                  return <Badge key={index} badge={badge} />;
                },
              )}
            </div>
          )}

          <div className="w-full md:w-2/3 grid grid-cols-2 gap-4">
            {/* Projects/Jobs */}
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                {accountData.jobs?.length}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Jobs</p>
            </div>

            {/* Reviews */}
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                0
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Reviews
              </p>
            </div>
          </div>
        </div>
        {/* Tabs Section */}
        <div className="mt-4">
          <ul className="flex space-x-4 border-b">
            <button
              onClick={() => handleJobsClick()}
              className={activeComp.jobsActive ? activeCss : notActiveCss}
            >
              Jobs
            </button>
            {accountData.role === 'freelancer' && (
              <>
                <button
                  onClick={() => handlePrevWorkClick()}
                  className={
                    activeComp.previousWorkActive ? activeCss : notActiveCss
                  }
                >
                  Previous Work
                </button>
                <button
                  onClick={() => handleAboutClick()}
                  className={activeComp.skillsActive ? activeCss : notActiveCss}
                >
                  Skills
                </button>
              </>
            )}
          </ul>
        </div>
        {/* Active Section */}
        {activeComp.jobsActive && accountData.jobs?.length > 0 && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6 bg-white hover:text-green-700 dark:text-gray-200 dark:bg-gray-900 h-min p-5 rounded-xl shadow-md">
            {accountData.jobs?.map((job: IJob) => (
              <Jobs key={job.id} job={job} />
            ))}
          </div>
        )}
        {activeComp.jobsActive && accountData.jobs?.length === 0 && (
          <div className="bg-white dark:bg-gray-900 p-5 rounded-xl shadow-md">
            <p className=" dark:text-gray-200">No Jobs Available</p>
          </div>
        )}
        {activeComp.previousWorkActive && accountData.role === 'freelancer' && (
          <>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              {freelancerAccountData.previousWork.map(
                (work: IPreviousWork, index: number) => (
                  <a
                    href={work.url}
                    key={index}
                    className="bg-white hover:text-green-700 hover:bg-gray-100 dark:bg-gray-900 dark:hover:bg-gray-700 h-min p-5 rounded-xl shadow-md"
                  >
                    <div className="mt-4">
                      <h3 className="text-xl text-inherit overflow-hidden text-gray-900 dark:text-gray-100 font-semibold">
                        {work.order}
                        {work.title}
                      </h3>
                      <p
                        className="text-sm text-gray-900 dark:text-green-100 overflow-hidden text-ellipsis break-words"
                        style={{
                          display: '-webkit-box',
                          WebkitBoxOrient: 'vertical',
                          WebkitLineClamp: '4',
                          whiteSpace: 'normal',
                        }}
                      >
                        {work.description}
                      </p>
                    </div>
                  </a>
                ),
              )}

              {param.username === userData.username && (
                <div className="mt-4 flex items-center gap-2">
                  {!editPrevWork && (
                    <FontAwesomeIcon
                      className="cursor-pointer p-3 bg-green-500 rounded-full text-gray-200 hover:text-green-700"
                      onClick={() => setEditPrevWork(true)}
                      icon={faPlus}
                    />
                  )}
                  {editPrevWork && (
                    <div className="flex flex-col gap-1">
                      <input
                        type="text"
                        placeholder="Title"
                        className="px-2 py-1 bg-gray-300 dark:bg-gray-600 dark:text-white rounded hover:bg-gray-400 dark:hover:bg-gray-500"
                        value={newPreviousWork?.title}
                        onChange={(e) =>
                          setNewPreviousWork({
                            ...newPreviousWork,
                            title: e.target.value,
                          })
                        }
                      />

                      <textarea
                        placeholder="Description"
                        className="px-2 py-1 h-8 bg-gray-300 dark:bg-gray-600 dark:text-white rounded hover:bg-gray-400 dark:hover:bg-gray-500"
                        value={newPreviousWork?.description}
                        onChange={(e) =>
                          setNewPreviousWork({
                            ...newPreviousWork,
                            description: e.target.value,
                          })
                        }
                      ></textarea>
                      <input
                        type="text"
                        className="px-2 py-1 bg-gray-300 dark:bg-gray-600 dark:text-white rounded hover:bg-gray-400 dark:hover:bg-gray-500"
                        placeholder="URL (optional)"
                        value={newPreviousWork?.url}
                        onChange={(e) =>
                          setNewPreviousWork({
                            ...newPreviousWork,
                            url: e.target.value,
                          })
                        }
                      />
                      <div className="flex gap-4">
                        <FontAwesomeIcon
                          className=" w-4 cursor-pointer p-3 mt-1 bg-green-500 rounded-full text-gray-200 hover:text-green-700"
                          onClick={handleSavePreviousWork}
                          icon={faPlus}
                        />
                        <button
                          className="dark:text-gray-600 text-gray-800 hover:text-gray-500 dark:hover:text-gray-400"
                          onClick={handleCancelEdit}
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
        {activeComp.skillsActive && (
          <div className="mt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {freelancerAccountData.skills &&
                freelancerAccountData.skills.map(
                  (skill: string, index: number) => (
                    <div
                      key={index}
                      className="p-2 border rounded-lg text-center bg-white dark:bg-gray-900 dark:text-gray-200 shadow-md overflow-hidden cursor-pointer hover:text-green-700"
                    >
                      {skill}
                    </div>
                  ),
                )}
            </div>

            {param.username === userData.username && (
              <div className="mt-4 flex items-center gap-2">
                {!editSkill && (
                  <FontAwesomeIcon
                    className="cursor-pointer p-3 bg-green-500 rounded-full text-gray-200 hover:text-green-700"
                    onClick={() => setEditSkill(true)}
                    icon={faPlus}
                  />
                )}
                {editSkill && (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="New Skill"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      className="flex-1 p-2 border rounded-md dark:bg-gray-800 dark:text-gray-100"
                    />
                    <FontAwesomeIcon
                      className="cursor-pointer p-3 bg-green-500 rounded-full text-gray-600 hover:text-green-700"
                      onClick={handleAddSkill}
                      icon={faPlus}
                    />
                    <button
                      className="dark:text-gray-600 text-gray-800 hover:text-gray-500 dark:hover:text-gray-400"
                      onClick={handleCancelEdit}
                    >
                      Close
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default ProfilePage;

ProfilePage.loader = async function loader({
  params,
}: LoaderFunctionArgs): Promise<unknown> {
  const username = params.username;

  try {
    const userResponse = await fetch(
      `${import.meta.env.VITE_API_URL}/account/${username}`,
    );

    const userData = await userResponse.json();

    if (!userResponse.ok) {
      return { message: userData.message };
    }

    if (userData.data.role === 'freelancer') {
      const freelancerResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/freelancer/${username}`,
      );

      const freelancerData = await freelancerResponse.json();
      if (!freelancerResponse.ok) {
        return { message: freelancerData.message };
      }

      return {
        user: userData.data,
        freelancer: freelancerData.data,
      };
    }

    return { user: userData.data };
  } catch {
    return {
      user: null,
      message: 'An error occurred while fetching user data',
    };
  }
};
