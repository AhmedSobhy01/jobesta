import React from 'react';
import {
  Link,
  LoaderFunctionArgs,
  redirect,
  useLoaderData,
} from 'react-router';
import { getAuthJwtToken, getAuthRefreshToken } from '@/utils/auth';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCircleCheck,
  faCircleExclamation,
  faCircleXmark,
  faDollarSign,
  faEnvelope,
  faSpinner,
  faStar,
  faTrophy,
} from '@fortawesome/free-solid-svg-icons';

const NotificationsDropdown: React.FC & {
  loader?: (args: LoaderFunctionArgs) => Promise<unknown>;
} = () => {
  const loaderData = useLoaderData();

  const notifications = loaderData?.notifications || [];

  const getIconByType = (type: string) => {
    switch (type) {
      case 'proposal_submitted':
        return <FontAwesomeIcon icon={faEnvelope} className="text-blue-500" />;
      case 'proposal_accepted':
        return <FontAwesomeIcon icon={faCircleCheck} />;
      case 'proposal_rejected':
        return (
          <FontAwesomeIcon icon={faCircleXmark} className="text-red-500" />
        );
      case 'milestone_completed':
        return <FontAwesomeIcon icon={faStar} className="text-yellow-500" />;
      case 'payment_received':
        return (
          <FontAwesomeIcon icon={faDollarSign} className="text-green-500" />
        );
      case 'message_received':
        return <FontAwesomeIcon icon={faEnvelope} className="text-blue-500" />;
      case 'review_received':
        return <FontAwesomeIcon icon={faTrophy} className="text-purple-500" />;
      case 'badge_earned':
        return <FontAwesomeIcon icon={faTrophy} className="text-purple-500" />;
      case 'withdrawal_requested':
        return (
          <FontAwesomeIcon
            icon={faCircleExclamation}
            className="text-orange-500"
          />
        );
      case 'withdrawal_processed':
        return <FontAwesomeIcon icon={faSpinner} className="text-gray-500" />;
      default:
        return (
          <FontAwesomeIcon
            icon={faCircleExclamation}
            className="text-orange-500"
          />
        );
    }
  };

  return (
    <div className="relative">
      <div className="absolute right-0 mt-2 bg-white dark:bg-gray-900 dark:border-gray-700 border border-gray-200 rounded-xl shadow-lg z-10">
        <div className="flex flex-col min-w-[16rem] h-fit">
          {' '}
          <div className="flex-grow py-2">
            {notifications.length > 0 ? (
              notifications.map(
                (notification: INotifications, index: number) => (
                  <Link
                    to={notification.url}
                    key={index}
                    className="flex px-4 py-2 gap-4 justify-center text-gray-700 dark:text-gray-200 hover:text-green-700 dark:hover:text-green-700 hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <div className="my-auto">
                      {getIconByType(notification.type)}
                    </div>
                    <div className="w-44 cursor-pointer">
                      {notification.message}
                    </div>
                  </Link>
                ),
              )
            ) : (
              <div className="px-4 py-2 text-gray-500 dark:text-gray-400">
                No notifications available
              </div>
            )}
          </div>
          <Link
            to="/notifications"
            className="rounded-b-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-blue-500 dark:text-blue-400 px-4 py-2 text-center border-t border-gray-300 dark:border-gray-600"
          >
            View All Notifications
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotificationsDropdown;

NotificationsDropdown.loader = async function loader() {
  const jwtToken = getAuthJwtToken();
  const refreshToken = getAuthRefreshToken();

  if (!refreshToken || refreshToken === 'EXPIRED') {
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('jwtTokenExpiration');
    return { user: null };
  }

  try {
    let newJwtToken = jwtToken;

    // Refresh JWT token if expired
    if (!jwtToken || jwtToken === 'EXPIRED') {
      localStorage.removeItem('jwtToken');

      const authData = { refreshToken };
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/refresh`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(authData),
        },
      );

      if (response.status === 403) {
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('refreshTokenExpiration');
      }

      const resData = await response.json();

      if (!response.ok) {
        return { message: resData.message };
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

    // Fetch user data with the (refreshed) JWT token
    const userResponse = await fetch(
      `${import.meta.env.VITE_API_URL}/notifications?page=1`,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${newJwtToken}`,
        },
      },
    );

    if (userResponse.status === 401) {
      localStorage.removeItem('jwtToken');
      localStorage.removeItem('jwtTokenExpiration');
      return redirect('/');
    }

    const notifications = await userResponse.json();

    if (!userResponse.ok) {
      return { message: notifications.message };
    }

    return {
      notifications: notifications.data.notifications,
      pagination: {
        currentPage: notifications.data.pagination.currentPage,
        totalItems: notifications.data.pagination.totalItems,
        totalPages: notifications.data.pagination.totalPages,
        perPage: notifications.data.pagination.perPage,
      },
    };
  } catch {
    return { message: 'An error occurred while fetching notifications data' };
  }
};
