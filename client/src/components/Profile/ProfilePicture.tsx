import { getAuthJwtToken } from '@/utils/auth';
import { FormEventHandler, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface IPreviousWork {
  order: number;
  title: string;
  description: string;
  url?: string;
}

interface ProfilePictureData {
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
    };
    freelancer: {
      balance?: number;
      bio?: string;
      previousWork?: IPreviousWork[];
      skills?: string[];
    };
  };
  setError: React.Dispatch<React.SetStateAction<boolean>>;
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>;
}

const ProfilePicture: React.FC<ProfilePictureData> = ({
  anyUserData,
  setError,
  setErrorMessage,
}) => {
  const navigate = useNavigate();
  const [isEditingPic, setIsEditingPic] = useState(false);
  const [pic, setPic] = useState<File | null>(null);

  let profilePic = anyUserData.user?.profilePicture;

  if (!profilePic?.startsWith('http')) {
    profilePic =
      import.meta.env.VITE_API_URL + '/' + anyUserData.user?.profilePicture;
  }

  const handleSubmit: FormEventHandler<HTMLFormElement> = (
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();

    handleProfilePicChange();
  };

  const handleProfilePicChange = async () => {
    setIsEditingPic(false);
    const file = pic;

    if (file) {
      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await fetch(
          import.meta.env.VITE_API_URL + '/account/me/profile-picture',
          {
            method: 'PUT',
            headers: {
              Authorization: 'Bearer ' + getAuthJwtToken(),
            },
            body: formData,
          },
        );

        const resData = await response.json();

        if (!resData.status) {
          if (response.status === 422) {
            if (resData.errors && resData.errors.file) {
              throw new Error(resData.errors.file);
            }
          }
          throw new Error(resData.message);
        }
      } catch (err) {
        if (err instanceof Error) {
          setError(true);
          setErrorMessage(err.message);
        } else {
          setErrorMessage('A network error occurred. Please try again later.');
        }
      }
    }
    navigate(`/users/${anyUserData.user.username}`);
  };

  return (
    <>
      <div className="absolute top-20 left-10 w-40 h-40 rounded-full overflow-hidden border-4 border-white dark:border-gray-900 group">
        <img
          src={profilePic}
          alt="Profile Picture"
          className="w-full h-full object-cover cursor-pointer"
        />

        <div
          onClick={() => setIsEditingPic(true)}
          className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300 cursor-pointer"
        >
          <p className="text-white font-semibold">Edit Picture</p>
        </div>
      </div>

      {isEditingPic && (
        <div className="absolute bottom-2 left-0 w-fit bg-white bg-opacity-80 p-2 rounded-lg flex justify-center">
          <form
            action="put"
            encType="multipart/form-data"
            onSubmit={handleSubmit}
          >
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setPic(e.target.files![0])}
              className="cursor-pointer"
            />
            <button
              type="submit"
              className="ml-4 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              Submit
            </button>
            <button
              onClick={() => setIsEditingPic(false)}
              className="ml-4 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              Cancel
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default ProfilePicture;
