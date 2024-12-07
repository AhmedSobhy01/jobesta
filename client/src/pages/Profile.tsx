import ErrorModule from '@/components/ErrorModule';
import profilePic from '@/assets/profile-pic.png';
import FreelancerContext from '@/store/freelancerContext';
import UserContext from '@/store/userContext';
import React, { useContext, useState } from 'react';
import {
  LoaderFunctionArgs,
  useLoaderData,
  useNavigate,
  useParams,
} from 'react-router-dom';

interface IPreviousWork {
  title: string;
  description: string;
  url?: string;
}

const activeCss =
  'text-green-700   font-semibold pb-2 border-b-2 border-gray-800 dark:text-green-700';
const notActiveCss =
  'text-gray-800 hover:bg-gray-100 md:hover:bg-transparent dark:text-gray-200 md:hover:text-green-700 md:dark:hover:text-green-700 font-semibold pb-2  border-gray-800';

const ProfilePage: React.FC & {
  loader?: (args: LoaderFunctionArgs) => Promise<unknown>;
} = () => {
  const navigate = useNavigate();

  const userData = useContext(UserContext);
  const freelancerData = useContext(FreelancerContext);

  const param = useParams();

  const [activeComp, setActiveComp] = useState({
    jobsActive: true,
    previousWorkActive: false,
    skillsActive: false,
  });

  const anyUserData = useLoaderData();

  const accountData = {
    firstName: anyUserData ? anyUserData.user.firstName : userData.firstName,
    lastName: anyUserData ? anyUserData.user.lastName : userData.lastName,
    username: anyUserData ? anyUserData.user.username : userData.username,
    role: anyUserData ? anyUserData.user.role : userData.role,
    isBanned: anyUserData ? anyUserData.user.isBanned : userData.isBanned,
    profilePicture: anyUserData
      ? anyUserData.user.profilePicture
      : userData.profilePicture,
  };

  const freelancerAccountData = {
    bio: anyUserData ? anyUserData.freelancer.bio : freelancerData.bio,
    previousWork: anyUserData
      ? anyUserData.freelancer.previousWork
      : freelancerData.previousWork,
    skills: anyUserData ? anyUserData.freelancer.skills : freelancerData.skills,
  };

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

  const handleErrorClose = () => {
    navigate('/');
  };

  if (userData.username != param.username && !anyUserData) {
    return (
      <ErrorModule onClose={handleErrorClose} errorMessage="User not found." />
    );
  }

  return (
    <div className="max-w-6xl mx-auto mt-10 p-4 ">
      <div className="bg-gradient-to-r from-green-500 to-green-300 p-6 rounded-lg shadow-lg relative">
        <div className="flex items-center space-x-6">
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white dark:border-gray-900">
            <img
              src={profilePic}
              alt="Profile Picture"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h1 className="text-2xl flex font-bold text-gray-800">
              {accountData.firstName} {accountData.lastName}{' '}
              <span className="bg-purple-500  text-white text-sm font-medium mx-2 px-2 py-1 rounded-2xl">
                {accountData.username}
              </span>
            </h1>
          </div>
        </div>

        {accountData.role === 'freelancer' && (
          <div className="absolute top-24 md:top-14 right-6 flex space-x-3">
            <span className="bg-orange-500 text-white text-sm font-medium px-3 py-1 rounded-full">
              26
            </span>
            <span className="bg-blue-500 text-white text-sm font-medium px-3 py-1 rounded-full">
              6
            </span>
            <span className="bg-gray-500 text-white text-sm font-medium px-3 py-1 rounded-full">
              12
            </span>
          </div>
        )}
      </div>

      <div className="mt-6 flex justify-around bg-white dark:bg-gray-900 p-4 rounded-lg shadow-md">
        {accountData.role === 'freelancer' && (
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
              0
            </h2>
            <p className="text-gray-600 dark:text-gray-200">Projects</p>
          </div>
        )}
        {accountData.role === 'client' && (
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
              0
            </h2>
            <p className="text-gray-600 dark:text-gray-200">Jobs</p>
          </div>
        )}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
            0
          </h2>
          <p className="text-gray-600 dark:text-gray-200">Reviews</p>
        </div>
      </div>

      {accountData.role === 'client' && (
        <div className="mt-6">
          <ul className="flex space-x-4 border-b">
            <button
              onClick={() => handleJobsClick()}
              className={activeComp.jobsActive ? activeCss : notActiveCss}
            >
              Jobs
            </button>
          </ul>
        </div>
      )}

      {accountData.role === 'freelancer' && (
        <div className="mt-6">
          <ul className="flex space-x-4 border-b">
            <button
              onClick={() => handleJobsClick()}
              className={activeComp.jobsActive ? activeCss : notActiveCss}
            >
              Jobs
            </button>
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
          </ul>
        </div>
      )}

      {activeComp.jobsActive && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white hover:text-green-700 dark:text-gray-200 dark:bg-gray-900 h-min p-5 rounded-xl shadow-md">
            <div className="mt-4">
              <h3 className="text-xl font-semibold ">Title</h3>
              <p className="text-sm dark:text-gray-200 text-gray-500">
                Category
              </p>
              <p className="text-base text-gray-700 dark:text-gray-200">
                Description
              </p>
              <div className="mt-2 flex justify-between items-center">
                <span className="text-gray-700 text-sm dark:text-gray-200">
                  budget
                </span>
                <span className="text-gray-700 text-sm dark:text-gray-200">
                  duration
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
      {activeComp.previousWorkActive && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {freelancerAccountData.previousWork.map((work: IPreviousWork) => {
            return (
              <>
                <a
                  href={work.url}
                  className="bg-white hover:text-green-700 hover:bg-gray-100 dark:bg-gray-900 dark:hover:bg-gray-700 h-min p-5 rounded-xl shadow-md"
                >
                  <div className="mt-4">
                    <h3 className="text-xl text-inherit text-gray-900 dark:text-gray-100 font-semibold">
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
              </>
            );
          })}
        </div>
      )}
      {activeComp.skillsActive && (
        <div className="mt-6  grid grid-cols-1 md:grid-cols-3 gap-6">
          {freelancerAccountData.skills.map((skill: string) => {
            return (
              <>
                <div className="bg-white hover:text-green-700 dark:bg-gray-900 h-min p-5 rounded-xl shadow-md">
                  <div className="mt-4">
                    <h3 className="text-xl text-inherit text-gray-900 dark:text-gray-100 font-semibold">
                      {skill}
                    </h3>
                  </div>
                </div>
              </>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProfilePage;

ProfilePage.loader = async function loader({
  params,
}: LoaderFunctionArgs): Promise<unknown> {
  const username = params.username;

  if (!username) {
    return null;
  }

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
