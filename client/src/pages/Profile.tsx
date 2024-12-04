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
            <p className="text-gray-600">{userData.bio}</p>
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
        {userData.role === 'freelancer' && (
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800">
              {userData.balance}
            </h2>
            <p className="text-gray-600">Balance</p>
          </div>
        )}
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

{
  /* {
  <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
      <ProfileSideBar
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
      />

      <div
        className={`flex-grow transition-transform duration-300 ${
          isSidebarOpen ? 'translate-x-64 md:translate-x-0' : ''
        }`}
      >
        <div className="mx-4 my-10 bg-white shadow-xl rounded-lg text-gray-900">
          <div className="rounded-t-lg h-32 overflow-hidden">
            <img
              className="object-cover object-top w-full h-full"
              src="https://images.unsplash.com/photo-1549880338-65ddcdfd017b?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=400&fit=max&ixid=eyJhcHBfaWQiOjE0NTg5fQ"
              alt="Mountain"
            />
          </div>

          <div className="mx-auto w-32 h-32 relative -mt-16 border-4 border-white rounded-full overflow-hidden">
            <img
              className="object-cover w-full h-full"
              src={userProfile}
              alt="Profile"
            />
          </div>

          <div className="text-center mt-2">
            <h2 className="font-semibold text-lg">Sarah Smith</h2>
            <p className="text-gray-500">Freelance Web Designer</p>
          </div>

          <ul className="py-4 mt-2 text-gray-700 flex items-center justify-around">
            {[
              { count: '2k', label: 'Stars' },
              { count: '10k', label: 'Followers' },
              { count: '15', label: 'Projects' },
            ].map((stat, index) => (
              <li key={index} className="flex flex-col items-center">
                <span className="font-bold text-lg">{stat.count}</span>
                <span className="text-sm">{stat.label}</span>
              </li>
            ))}
          </ul>

          <div className="p-4 border-t mx-4 mt-2">
            <button className="w-1/2 block mx-auto rounded-full bg-gray-900 hover:bg-gray-700 hover:shadow-lg font-semibold text-white px-6 py-2">
              Follow
            </button>
          </div>
        </div>
      </div>
    </div>
} */
}
