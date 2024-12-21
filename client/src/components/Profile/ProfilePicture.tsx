import { getAuthJwtToken } from '@/utils/auth';
import getProfilePicture from '@/utils/profilePicture';
import { FormEventHandler, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

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
  isMe: boolean;
}

const ProfilePicture: React.FC<ProfilePictureData> = ({
  anyUserData,
  isMe,
}) => {
  const navigate = useNavigate();
  const [pic, setPic] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | undefined>(undefined);

  const profilePic = getProfilePicture(anyUserData.user?.profilePicture ?? '');

  useEffect(() => {
    if (!pic) {
      setPreview(undefined);
      return;
    }

    const objectUrl = URL.createObjectURL(pic);
    setPreview(objectUrl);

    // free memory when ever this component is unmounted
    return () => URL.revokeObjectURL(objectUrl);
  }, [pic]);

  const handleSubmit: FormEventHandler<HTMLFormElement> = (
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();

    handleProfilePicChange();
  };

  const handleProfilePicChange = async () => {
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
        toast('Profile picture updated successfully', { type: 'success' });
      } catch (err) {
        if (err instanceof Error) {
          toast(err.message, { type: 'error' });
        } else {
          toast('An error occurred. Please try again later.', {
            type: 'error',
          });
        }
      }
    }
    navigate(`/users/${anyUserData.user.username}`);
    setPic(null);
  };

  return (
    <>
      <div className="bg-white absolute top-20 left-10 w-40 h-40 rounded-full overflow-hidden border-4 border-white dark:border-gray-900 group">
        <img
          src={preview ? preview : profilePic}
          alt="Profile Picture"
          className="w-full h-full object-cover cursor-pointer"
        />

        {isMe && (
          <label htmlFor="profile-picture" className="text-white font-semibold">
            <div
              onClick={() => {
                setPic(null);
              }}
              className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300 cursor-pointer"
            >
              <p>Edit Picture</p>
            </div>
          </label>
        )}
      </div>

      <form action="put" encType="multipart/form-data" onSubmit={handleSubmit}>
        <input
          name="profile-picture"
          id="profile-picture"
          type="file"
          accept="image/*"
          onChange={(e) => setPic(e.target.files![0])}
          className="cursor-pointer"
          hidden={true}
        />
        {pic && (
          <div className="absolute bottom-2 right-2 w-fit bg-white shadow-md broder border-gray-400 bg-opacity-80 p-2 rounded-lg flex justify-center">
            <div className="flex flex-start gap-4">
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
                hidden={!pic}
              >
                Save Profile Picture
              </button>
              <button
                onClick={() => {
                  setPic(null);
                }}
                className="px-4 py-2 bg-gray-200 text-black rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </form>
    </>
  );
};

export default ProfilePicture;
