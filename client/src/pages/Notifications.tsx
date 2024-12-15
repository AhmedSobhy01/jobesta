import { useEffect, useState } from 'react';
import { Link, useLoaderData } from 'react-router';
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

interface IPagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  perPage: number;
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

const NotificationsPage = () => {
  const loaderData = useLoaderData();
  const [notifications, setNotifications] = useState(
    loaderData?.notifications || [],
  );
  console.log(notifications);

  const [paginationData, setPaginationData] = useState<IPagination>(
    loaderData?.pagination || {
      currentPage: 1,
      totalPages: 1,
      totalItems: 0,
      perPage: 10,
    },
  );

  useEffect(() => {
    async function fetchNotifications(page: number) {
      const jwtToken = getAuthJwtToken();
      const refreshToken = getAuthRefreshToken();

      if (!refreshToken || refreshToken === 'EXPIRED') {
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('jwtToken');
        localStorage.removeItem('jwtTokenExpiration');
        setNotifications([]);
        return;
      }

      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/notifications?page=${page}`,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${jwtToken}`,
            },
          },
        );

        if (response.ok) {
          const data = await response.json();
          setNotifications(data.data.notifications);
          setPaginationData({
            currentPage: data.data.pagination.currentPage,
            totalPages: data.data.pagination.totalPages,
            totalItems: data.data.pagination.totalItems,
            perPage: data.data.pagination.perPage,
          });
        } else {
          setNotifications([]);
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
        setNotifications([]);
      }
    }

    fetchNotifications(paginationData.currentPage);
  }, [paginationData.currentPage]);

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

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= paginationData.totalPages) {
      setPaginationData((prev) => ({ ...prev, currentPage: newPage }));
    }
  };

  return (
    <div className="flex justify-center min-h-full">
      <div className="w-full max-w-2xl bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4 text-center text-gray-700 dark:text-gray-200">
          Notifications
        </h1>

        {notifications.length > 0 ? (
          <>
            <ul className="space-y-2">
              {notifications.map(
                (notification: INotifications, index: number) => {
                  return (
                    <li
                      key={index}
                      className="flex items-center p-4 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-md hover:bg-gray-200 dark:hover:bg-gray-700"
                    >
                      <Link className="w-full" to={notification.url}>
                        <div className="mr-4 text-xl text-blue-500 dark:text-blue-400">
                          {getIconByType(notification.type)}
                        </div>
                        <div>
                          <p className="text-gray-800 dark:text-gray-200">
                            {notification.message}
                          </p>
                          <span className="text-sm text-gray-500 dark:text-gray-400 block">
                            {notification.createdAt}
                          </span>
                        </div>
                      </Link>
                    </li>
                  );
                },
              )}
            </ul>

            <div className="flex justify-between items-center mt-4">
              <button
                onClick={() => handlePageChange(paginationData.currentPage - 1)}
                className={`px-4 py-2 rounded-md hover:bg-gray-400 dark:hover:bg-gray-600 ${paginationData.currentPage === 1 ? 'bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed' : 'bg-gray-300 dark:bg-gray-700'}`}
                disabled={paginationData.currentPage === 1}
              >
                Previous
              </button>

              <span className="text-gray-700 dark:text-gray-300">
                Page {paginationData.currentPage} of {paginationData.totalPages}
              </span>

              <button
                onClick={() => handlePageChange(paginationData.currentPage + 1)}
                className={`px-4 py-2  rounded-md hover:bg-gray-400 dark:hover:bg-gray-600 ${paginationData.currentPage === 1 ? 'bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed' : 'bg-gray-300 dark:bg-gray-700'}`}
                disabled={
                  paginationData.currentPage === paginationData.totalPages
                }
              >
                Next
              </button>
            </div>
          </>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-center">
            No notifications available.
          </p>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;

NotificationsPage.loader = async function loader() {
  const jwtToken = getAuthJwtToken();
  const refreshToken = getAuthRefreshToken();

  if (!refreshToken || refreshToken === 'EXPIRED') {
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('jwtTokenExpiration');
    return {
      notifications: [],
      pagination: { currentPage: 1, totalPages: 1, totalItems: 0, perPage: 10 },
    };
  }

  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/notifications?page=1`,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwtToken}`,
        },
      },
    );

    if (!response.ok) {
      return {
        notifications: [],
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalItems: 0,
          perPage: 10,
        },
      };
    }

    const data = await response.json();
    return {
      notifications: data.data.notifications,
      pagination: {
        currentPage: data.data.pagination.currentPage,
        totalPages: data.data.pagination.totalPages,
        totalItems: data.data.pagination.totalItems,
        perPage: data.data.pagination.perPage,
      },
    };
  } catch (error) {
    console.error('Error loading notifications:', error);
    return {
      notifications: [],
      pagination: { currentPage: 1, totalPages: 1, totalItems: 0, perPage: 10 },
    };
  }
};
