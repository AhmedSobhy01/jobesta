import { Link, useLoaderData, useNavigate } from 'react-router';
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
import Pagination from '@/components/Common/Pagination';
import ErrorModule from '@/components/ErrorModule';

const NOTIFICATIONS: INotifications[] = [
  {
    type: 'proposal_accepted',
    message: 'your proposal have been proposal_accepted',
    isRead: false,
    createdAt: '2 days ago',
    url: 'https://drive.google.com/drive/u/0/folders/1Dd4C5h0tQgYutvyW03oRKSM5fMIrTeGV',
  },
  {
    type: 'proposal_rejected',
    message: 'your proposal have been proposal_rejected',
    isRead: false,
    createdAt: '2 days ago',
    url: 'https://drive.google.com/drive/u/0/folders/1Dd4C5h0tQgYutvyW03oRKSM5fMIrTeGV',
  },
  {
    type: 'milestone_completed',
    message: 'your proposal have been milestone_completed',
    isRead: false,
    createdAt: '2 days ago',
    url: 'https://drive.google.com/drive/u/0/folders/1Dd4C5h0tQgYutvyW03oRKSM5fMIrTeGV',
  },
  {
    type: 'payment_received',
    message: 'your proposal have been payment_received',
    isRead: false,
    createdAt: '2 days ago',
    url: 'https://drive.google.com/drive/u/0/folders/1Dd4C5h0tQgYutvyW03oRKSM5fMIrTeGV',
  },
  {
    type: 'message_received',
    message: 'your proposal have been message_received',
    isRead: false,
    createdAt: '2 days ago',
    url: 'https://drive.google.com/drive/u/0/folders/1Dd4C5h0tQgYutvyW03oRKSM5fMIrTeGV',
  },
  {
    type: 'review_received',
    message: 'your proposal have been review_received',
    isRead: false,
    createdAt: '2 days ago',
    url: 'https://drive.google.com/drive/u/0/folders/1Dd4C5h0tQgYutvyW03oRKSM5fMIrTeGV',
  },
  {
    type: 'badge_earned',
    message: 'your proposal have been badge_earned',
    isRead: false,
    createdAt: '2 days ago',
    url: 'https://drive.google.com/drive/u/0/folders/1Dd4C5h0tQgYutvyW03oRKSM5fMIrTeGV',
  },
  {
    type: 'withdrawal_requested',
    message: 'your proposal have been withdrawal_requested',
    isRead: false,
    createdAt: '2 days ago',
    url: 'https://drive.google.com/drive/u/0/folders/1Dd4C5h0tQgYutvyW03oRKSM5fMIrTeGV',
  },
];

const NotificationsPage = () => {
  const navigate = useNavigate();
  const loaderData = useLoaderData();

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

  if (!loaderData.status) {
    return (
      <ErrorModule
        errorMessage={loaderData.message}
        onClose={() => navigate('/')}
      />
    );
  }

  return (
    <div className="flex justify-center min-h-full">
      <div className="w-full max-w-2xl bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4 text-center text-gray-700 dark:text-gray-200">
          Notifications
        </h1>

        {NOTIFICATIONS.length > 0 ? (
          <>
            <ul className="space-y-2">
              {NOTIFICATIONS.map(
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

            <Pagination pagination={loaderData.pagination} />
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

    const data = await response.json();
    if (!response.ok) {
      return {
        status: false,
        message: data.message,
      };
    }

    return {
      status: true,
      notifications: data.data.notifications,
      pagination: {
        currentPage: data.data.pagination.currentPage,
        totalPages: data.data.pagination.totalPages,
        totalItems: data.data.pagination.totalItems,
        perPage: data.data.pagination.perPage,
      },
    };
  } catch (error) {
    return {
      status: false,
      message: 'Error loading notifications' + error,
    };
  }
};
