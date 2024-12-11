import FreelancerContext from '@/store/freelancerContext';
import UserContext from '@/store/userContext';
import { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

interface IPreviousWork {
  order: number;
  title: string;
  description: string;
  url?: string;
}

interface ProfileBioData {
  anyUserData: {
    user: {
      accountId: string | null;
      firstName: string | null;
      lastName: string | null;
      username?: string;
      email: string | null;
      role: string | null;
      isBanned: string | null;
      profilePicture?: string;
      jwtToken: string | null;
      refreshToken: string | null;
    };
    freelancer: {
      balance?: number;
      bio?: string;
      previousWork?: IPreviousWork[];
      skills?: string[];
    };
  };
  freelancerAccountData: {
    bio: string;
    previousWork: IPreviousWork[];
    skills: string[];
  };
  setError: React.Dispatch<React.SetStateAction<boolean>>;
  handleUpdateFreelancerData: (data: {
    newBio?: string;
    updatingBio?: boolean;
    newPreviousWork?: IPreviousWork;
    newSkill?: string;
  }) => Promise<void>;
}

const ProfileBio: React.FC<ProfileBioData> = ({
  anyUserData,
  setError,
  handleUpdateFreelancerData,
  freelancerAccountData,
}) => {
  const param = useParams();
  const freelancerData = useContext(FreelancerContext);
  const userData = useContext(UserContext);
  const [newBio, setNewBio] = useState<string | undefined>(
    freelancerData.bio || '',
  );
  const [isEditingBio, setIsEditingBio] = useState(false);

  useEffect(() => {
    if (anyUserData.freelancer.bio) {
      setNewBio(anyUserData.freelancer.bio);
    } else {
      setNewBio('');
    }
  }, [anyUserData]);

  const handleChangeBio = () => {
    const updatingBio = true;
    handleUpdateFreelancerData({ newBio, updatingBio });
    setIsEditingBio(false);
    setError(false);
  };

  function handleCancelEdit() {
    setIsEditingBio(false);
  }

  return (
    <>
      {isEditingBio ? (
        <div>
          <textarea
            value={newBio}
            onChange={(e) => setNewBio(e.target.value)}
            className="w-full  p-2 border rounded-md dark:bg-gray-800 dark:text-gray-100"
            rows={1}
          />
          <div className="flex gap-2 mt-2">
            <button
              onClick={handleChangeBio}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              Save
            </button>
            <button
              onClick={handleCancelEdit}
              className="px-4 py-2 bg-gray-300 dark:bg-gray-600 dark:text-white rounded hover:bg-gray-400 dark:hover:bg-gray-500"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4 items-start">
          <p className=" text-gray-600 dark:text-gray-400">
            {freelancerAccountData.bio}
          </p>
          {param.username === userData.username && (
            <button
              onClick={() => setIsEditingBio(true)}
              className=" dark:text-gray-600 text-gray-800 hover:text-gray-500 dark:hover:text-gray-400"
            >
              Edit Bio
            </button>
          )}
        </div>
      )}
    </>
  );
};

export default ProfileBio;
