import UserContext from '@/store/userContext';
import React, { useContext, useState } from 'react';

const activeCss =
  'text-green-700  font-semibold pb-2 border-b-2 border-gray-800';
const notActiveCss =
  'text-gray-800 hover:bg-gray-100 md:hover:bg-transparent md:hover:text-green-700 md:dark:hover:text-green-500 font-semibold pb-2  border-gray-800';

const ProfilePage: React.FC = () => {
  const userData = useContext(UserContext);
  const [activeComp, setActiveComp] = useState({
    jobsActive: false,
    previousWorkActive: false,
    skillsActive: false,
  });

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

  return (
    <div className="max-w-6xl mx-auto p-4 ">
      <div className="bg-gradient-to-r from-green-500 to-green-300 p-6 rounded-lg shadow-lg relative">
        <div className="flex items-center space-x-6">
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white">
            <img
              src="https://via.placeholder.com/150"
              alt="Profile Picture"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h1 className="text-2xl flex font-bold text-gray-800">
              {userData.firstName} {userData.lastName}{' '}
              <span className="bg-purple-500  text-white text-sm font-medium mx-2 px-2 py-1 rounded-2xl">
                {userData.userName}
              </span>
            </h1>
          </div>
        </div>

        {userData.role === 'freelancer' && (
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

      <div className="mt-6 flex justify-around bg-white p-4 rounded-lg shadow-md">
        {userData.role === 'freelancer' && (
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800">0</h2>
            <p className="text-gray-600">Projects</p>
          </div>
        )}
        {userData.role === 'client' && (
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800">0</h2>
            <p className="text-gray-600">Jobs</p>
          </div>
        )}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800">0</h2>
          <p className="text-gray-600">Reviews</p>
        </div>
      </div>

      {userData.role === 'client' && (
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

      {userData.role === 'freelancer' && (
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
          <div className="bg-white h-min p-5 rounded-xl shadow-md">
            <div className="mt-4">
              <h3 className="text-xl font-semibold">Title</h3>
              <p className="text-sm text-gray-500">Category</p>
              <p className="text-base text-gray-700">Description</p>
              <div className="mt-2 flex justify-between items-center">
                <span className="text-gray-700 text-sm">budget</span>
                <span className="text-gray-700 text-sm">duration</span>
              </div>
            </div>
          </div>

          <div className="bg-white h-min p-5 rounded-xl shadow-md">
            <div className="mt-4">
              <h3 className="text-xl font-semibold">Title</h3>
              <p className="text-sm text-gray-500">Category</p>
              <p className="text-base text-gray-700">Description</p>
              <div className="mt-2 flex justify-between items-center">
                <span className="text-gray-700 text-sm">budget</span>
                <span className="text-gray-700 text-sm">duration</span>
              </div>
            </div>
          </div>

          <div className="bg-white h-min p-5 rounded-xl shadow-md">
            <div className="mt-4">
              <h3 className="text-xl font-semibold">Title</h3>
              <p className="text-sm text-gray-500">Category</p>
              <p className="text-base text-gray-700">Description</p>
              <div className="mt-2 flex justify-between items-center">
                <span className="text-gray-700 text-sm">budget$</span>
                <span className="text-gray-700 text-sm">duration</span>
              </div>
            </div>
          </div>
        </div>
      )}
      {activeComp.previousWorkActive && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white h-min p-5 rounded-xl shadow-md">
            <div className="mt-4">
              <h3 className="text-xl font-semibold">Title</h3>

              <p className="text-base text-gray-700">Description</p>
            </div>
          </div>

          <div className="bg-white h-min p-5 rounded-xl shadow-md">
            <div className="mt-4">
              <h3 className="text-xl font-semibold">Title</h3>

              <p className="text-base text-gray-700">Description</p>
            </div>
          </div>

          <div className="bg-white h-min p-5 rounded-xl shadow-md">
            <div className="mt-4">
              <h3 className="text-xl font-semibold">Title</h3>

              <p className="text-base text-gray-700">Description</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
