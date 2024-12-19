import ErrorModule from '@/components/ErrorModule';
import UserContext from '@/store/userContext';
import React, { useContext, useEffect, useState } from 'react';
import {
  LoaderFunctionArgs,
  useLoaderData,
  useNavigate,
  useParams,
} from 'react-router-dom';
import EditProfileModal from '@/components/Profile/EditProfileModal';
import ProfilePicture from '@/components/Profile/ProfilePicture';
import Badge from '@/components/Profile/Badge';
import Jobs from '@/components/Profile/Jobs';
import EditFreelancerModal from '@/components/Profile/EditFreelancerModal';
import Review from '@/components/Profile/Review';

const activeCss =
  'text-emerald-700 font-semibold pb-2 border-b-2 border-gray-800 dark:text-emerald-700';
const notActiveCss =
  'text-gray-800 hover:bg-gray-100 md:hover:bg-transparent dark:text-gray-200 md:hover:text-emerald-700 md:dark:hover:text-emerald-700 font-semibold pb-2  border-gray-800';

const ProfilePage: React.FC & {
  loader?: (args: LoaderFunctionArgs) => Promise<unknown>;
} = () => {
  //contexts
  const userData = useContext(UserContext);

  const [freelancerData, setFreelancer] = useState<
    | {
        bio: string | null;
        skills: string[];
        previousWork: IPreviousWork[];
        badges: IBadge[];
        jobs: IJob[];
      }
    | undefined
  >();
  //nav and params
  const navigate = useNavigate();
  const param = useParams();

  //loader data
  const anyUserData = useLoaderData();

  const [activeTab, setActiveTab] = useState({
    jobsActive: true,
    previousWorkActive: false,
    skillsActive: false,
    reviewsActive: false,
  });

  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isEditFreelancerModalOpen, setEditFreelancerModalOpen] =
    useState(false);

  const isMe = param.username === userData.username;

  const accountData = {
    firstName: anyUserData.user?.firstName,
    lastName: anyUserData.user?.lastName,
    username: anyUserData.user?.username,
    email: anyUserData.user?.email,
    role: anyUserData.user?.role,
    isBanned: anyUserData.user?.isBanned,
    profilePicture: anyUserData.user?.profilePicture,
    jobs: anyUserData.user?.jobs,
  };

  useEffect(() => {
    if (
      anyUserData.user &&
      anyUserData.user.role === 'freelancer' &&
      anyUserData.freelancer
    ) {
      const { bio, skills, previousWork, badges, jobs } =
        anyUserData.freelancer;
      setFreelancer({ bio, skills, previousWork, badges, jobs });
    }
  }, [anyUserData, param.username, setFreelancer]);

  function handleModalClose(): void {
    setEditModalOpen(false);
  }

  function handleTabClick(tab: string): void {
    setActiveTab({
      jobsActive: tab === 'jobs',
      previousWorkActive: tab === 'previousWork',
      skillsActive: tab === 'skills',
      reviewsActive: tab === 'reviews',
    });
  }

  const handleErrorClose = () => {
    navigate('/');
  };

  if (userData.username != param.username && !anyUserData) {
    return (
      <ErrorModule
        onClose={handleErrorClose}
        errorMessage="Error getting user"
      />
    );
  }

  if (anyUserData.status === false) {
    return (
      <ErrorModule onClose={handleErrorClose} errorMessage="User not found" />
    );
  }

  return (
    <>
      {isEditModalOpen && isMe && (
        <EditProfileModal onClose={handleModalClose} />
      )}
      {isEditFreelancerModalOpen && isMe && freelancerData && (
        <EditFreelancerModal
          onClose={() => setEditFreelancerModalOpen(false)}
          freelancerData={freelancerData}
          username={userData.username!}
        />
      )}
      <div className="max-w-6xl h-screen mx-auto mt-6 p-4">
        <div className="relative w-full bg-gradient-to-t from-emerald-200 to-emerald-500 h-48 rounded-lg shadow-lg">
          <ProfilePicture anyUserData={anyUserData} isMe={isMe} />
        </div>
        <div className="mt-12 bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md flex flex-col md:flex-row gap-6 items-center">
          <div className="w-full md:w-1/3 text-left">
            <div className="flex gap-4 items-baseline">
              <h2 className="text-xl font-bold text-emerald-700 dark:text-emerald-700">
                {accountData.firstName} {accountData.lastName}
              </h2>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              @{accountData.username}
            </p>
            {accountData.role === 'freelancer' && freelancerData && (
              <div className="mt-4">
                <div className="flex flex-col gap-4 items-start">
                  <p className=" text-gray-600 dark:text-gray-400">
                    {freelancerData.bio}
                  </p>
                </div>
              </div>
            )}
            {isMe && (
              <div className="mt-4 flex flex-col gap-2 items-start">
                <button
                  onClick={() => setEditModalOpen(true)}
                  className="dark:text-gray-600 text-gray-800 hover:text-gray-500 dark:hover:text-gray-400"
                >
                  Edit Account
                </button>
                {accountData.role === 'freelancer' && (
                  <button
                    onClick={() => setEditFreelancerModalOpen(true)}
                    className="dark:text-gray-600 text-gray-800 hover:text-gray-500 dark:hover:text-gray-400"
                  >
                    Edit Profile data
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Stats Section */}
          {accountData.role === 'freelancer' && freelancerData && (
            <div className="flex gap-4">
              {freelancerData.badges.map((badge: IBadge, index: number) => {
                return <Badge key={index} badge={badge} />;
              })}
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
                {Number(anyUserData.user.avgReviewRating).toFixed(2)}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Rating</p>
            </div>
          </div>
        </div>
        {/* Tabs Section */}
        <div className="mt-4">
          <ul className="flex space-x-4 border-b">
            <button
              onClick={() => handleTabClick('jobs')}
              className={activeTab.jobsActive ? activeCss : notActiveCss}
            >
              Jobs
            </button>
            <button
              onClick={() => handleTabClick('review')}
              className={activeTab.reviewsActive ? activeCss : notActiveCss}
            >
              Reviews
            </button>
            {accountData.role === 'freelancer' && (
              <>
                <button
                  onClick={() => handleTabClick('previousWork')}
                  className={
                    activeTab.previousWorkActive ? activeCss : notActiveCss
                  }
                >
                  Previous Work
                </button>
                <button
                  onClick={() => handleTabClick('skills')}
                  className={activeTab.skillsActive ? activeCss : notActiveCss}
                >
                  Skills
                </button>
              </>
            )}
          </ul>
        </div>
        {/* Active Section */}
        {activeTab.jobsActive && accountData.jobs?.length > 0 && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6 bg-white hover:text-emerald-700 dark:text-gray-200 dark:bg-gray-900 h-min p-5 rounded-xl shadow-md">
            {accountData.jobs?.map((job: IJob) => (
              <Jobs key={job.id} job={job} />
            ))}
          </div>
        )}
        {activeTab.jobsActive && accountData.jobs?.length === 0 && (
          <div className="bg-white dark:bg-gray-900 p-5 rounded-xl shadow-md">
            <p className=" dark:text-gray-200">No Jobs Available</p>
          </div>
        )}
        {activeTab.reviewsActive && anyUserData.user?.reviews.length > 0 && (
          <div className="mt-6 gap-6 bg-white  dark:text-gray-200 dark:bg-gray-900 h-min p-5 rounded-xl shadow-md">
            {anyUserData.user?.reviews.map((review: Review) => (
              <Review key={review.sender?.username} review={review} />
            ))}
          </div>
        )}
        {activeTab.reviewsActive && anyUserData.user?.reviews.length === 0 && (
          <div className="bg-white dark:bg-gray-900 p-5 rounded-xl shadow-md">
            <p className=" dark:text-gray-200">No Reviews Available</p>
          </div>
        )}
        {activeTab.previousWorkActive && accountData.role === 'freelancer' && (
          <div className="mt-6 flex flex-row gap-4">
            {freelancerData &&
              freelancerData.previousWork &&
              freelancerData.previousWork.map(
                (work: IPreviousWork, index: number) => (
                  <a
                    href={work.url}
                    key={index}
                    className="min-w-72 bg-white hover:text-emerald-700 hover:bg-gray-100 dark:bg-gray-900 dark:hover:bg-gray-700 h-min p-5 rounded-xl shadow-md"
                  >
                    <div className="mt-4">
                      <h3 className="text-xl text-inherit overflow-hidden text-gray-900 dark:text-gray-100 font-semibold">
                        {work.order}
                        {work.title}
                      </h3>
                      <p
                        className="text-sm text-gray-900 dark:text-emerald-100 overflow-hidden text-ellipsis break-words"
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
          </div>
        )}
        {activeTab.skillsActive && accountData.role === 'freelancer' && (
          <div className="mt-6">
            <div className="flex flex-row flex-wrap gap-2">
              {freelancerData &&
                freelancerData.skills.map((skill: string, index: number) => (
                  <div
                    key={index}
                    className="flex items-center justify-center py-1 px-2 border rounded-full text-center bg-white dark:bg-gray-900 dark:text-gray-200 overflow-hidden cursor-pointer hover:text-emerald-700"
                  >
                    {skill}
                  </div>
                ))}
            </div>
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
      return { status: false, message: userData.message };
    }

    if (userData.data.role === 'freelancer') {
      const freelancerResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/freelancer/${username}`,
      );

      const freelancerData = await freelancerResponse.json();
      if (!freelancerResponse.ok) {
        return { status: false, message: freelancerData.message };
      }

      return {
        user: userData.data,
        freelancer: freelancerData.data,
      };
    }

    return { user: userData.data };
  } catch {
    return {
      status: false,
      user: null,
      message: 'An error occurred while fetching user data',
    };
  }
};
