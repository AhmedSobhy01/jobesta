import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
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
import { toast } from 'react-toastify';
import NotificationsDropdownSkeleton from '../Skeletons/NotificationsDropdownSkeleton';
import { getAuthJwtToken } from '@/utils/auth';

const NotificationsDropdown = () => {
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState('');

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

  const fetchDataRef = useRef(false);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/notifications?page=1`,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${getAuthJwtToken()}`,
            },
          },
        );

        const notificationsData = await response.json();

        if (!response.ok) {
          setError(notificationsData.message);
          toast(notificationsData.message, {
            type: 'error',
          });
          setLoading(false);
          fetchDataRef.current = false;
          return;
        }

        setNotifications(notificationsData.data.notifications);
      } catch {
        setError('An error occurred while fetching notifications data.');
        toast('An error occurred while fetching notifications data.', {
          type: 'error',
        });
      }

      setLoading(false);
      fetchDataRef.current = false;
    };

    if (fetchDataRef.current === false) {
      fetchDataRef.current = true;
      fetchNotifications();
    }
  }, []);

  return (
    <>
      <div className="relative">
        <div className="absolute right-0 mt-2 bg-white dark:bg-gray-900 dark:border-gray-700 border border-gray-200 rounded-xl shadow-lg z-10">
          <div className="flex flex-col min-w-[16rem] h-fit">
            {' '}
            <div className="flex-grow py-2">
              {loading && <NotificationsDropdownSkeleton />}
              {error && <p className="text-red-500 text-center">{error}</p>}
              {!error &&
                notifications.length > 0 &&
                notifications
                  .slice(0, 5)
                  .map((notification: INotifications, index: number) => (
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
                  ))}

              {!error && !loading && notifications.length === 0 && (
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
    </>
  );
};

export default NotificationsDropdown;
