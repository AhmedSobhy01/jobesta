const getProfilePicture = (profilePicture: string) => {
  if (
    !profilePicture?.startsWith('http') ||
    !profilePicture?.startsWith('https')
  ) {
    return import.meta.env.VITE_API_URL + '/' + profilePicture;
  }

  return profilePicture;
};

export default getProfilePicture;
