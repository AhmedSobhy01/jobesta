import React from 'react';
import {
  Link,
  LoaderFunctionArgs,
  redirect,
  useLoaderData,
} from 'react-router';
import { getAuthJwtToken, getAuthRefreshToken } from '@/utils/auth';
import {
  FaCheckCircle,
  FaTimesCircle,
  FaStar,
  FaDollarSign,
  FaEnvelope,
  FaTrophy,
  FaExclamationCircle,
  FaSpinner,
} from 'react-icons/fa';

interface INotifications {
  type: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  url: string;
}

// const NOTIFICATIONS: INotifications[] = [
//   {
//     type: 'proposal_accepted',
//     message: 'your proposal have been proposal_accepted',
//     isRead: false,
//     createdAt: '2 days ago',
//     url: 'https://drive.google.com/drive/u/0/folders/1Dd4C5h0tQgYutvyW03oRKSM5fMIrTeGV',
//   },
//   {
//     type: 'proposal_rejected',
//     message: 'your proposal have been proposal_rejected',
//     isRead: false,
//     createdAt: '2 days ago',
//     url: 'https://drive.google.com/drive/u/0/folders/1Dd4C5h0tQgYutvyW03oRKSM5fMIrTeGV',
//   },
//   {
//     type: 'milestone_completed',
//     message: 'your proposal have been milestone_completed',
//     isRead: false,
//     createdAt: '2 days ago',
//     url: 'https://drive.google.com/drive/u/0/folders/1Dd4C5h0tQgYutvyW03oRKSM5fMIrTeGV',
//   },
//   {
//     type: 'payment_received',
//     message: 'your proposal have been payment_received',
//     isRead: false,
//     createdAt: '2 days ago',
//     url: 'https://drive.google.com/drive/u/0/folders/1Dd4C5h0tQgYutvyW03oRKSM5fMIrTeGV',
//   },
//   {
//     type: 'message_received',
//     message: 'your proposal have been message_received',
//     isRead: false,
//     createdAt: '2 days ago',
//     url: 'https://drive.google.com/drive/u/0/folders/1Dd4C5h0tQgYutvyW03oRKSM5fMIrTeGV',
//   },
//   {
//     type: 'review_received',
//     message: 'your proposal have been review_received',
//     isRead: false,
//     createdAt: '2 days ago',
//     url: 'https://drive.google.com/drive/u/0/folders/1Dd4C5h0tQgYutvyW03oRKSM5fMIrTeGV',
//   },
//   {
//     type: 'badge_earned',
//     message: 'your proposal have been badge_earned',
//     isRead: false,
//     createdAt: '2 days ago',
//     url: 'https://drive.google.com/drive/u/0/folders/1Dd4C5h0tQgYutvyW03oRKSM5fMIrTeGV',
//   },
//   {
//     type: 'withdrawal_requested',
//     message: 'your proposal have been withdrawal_requested',
//     isRead: false,
//     createdAt: '2 days ago',
//     url: 'https://drive.google.com/drive/u/0/folders/1Dd4C5h0tQgYutvyW03oRKSM5fMIrTeGV',
//   },
// ];

const NotificationsDropdown: React.FC & {
  loader?: (args: LoaderFunctionArgs) => Promise<unknown>;
} = () => {
  const loaderData = useLoaderData();

  const notifications = loaderData?.notifications || [];

  const getIconByType = (type: string) => {
    switch (type) {
      case 'proposal_submitted':
        return <FaEnvelope className="text-blue-500" />;
      case 'proposal_accepted':
        return <FaCheckCircle className="text-green-500" />;
      case 'proposal_rejected':
        return <FaTimesCircle className="text-red-500" />;
      case 'milestone_completed':
        return <FaStar className="text-yellow-500" />;
      case 'payment_received':
        return <FaDollarSign className="text-green-500" />;
      case 'message_received':
        return <FaEnvelope className="text-blue-500" />;
      case 'review_received':
        return <FaTrophy className="text-purple-500" />;
      case 'badge_earned':
        return <FaTrophy className="text-purple-500" />;
      case 'withdrawal_requested':
        return <FaExclamationCircle className="text-orange-500" />;
      case 'withdrawal_processed':
        return <FaSpinner className="text-gray-500" />;
      default:
        return <FaExclamationCircle className="text-gray-500" />;
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
