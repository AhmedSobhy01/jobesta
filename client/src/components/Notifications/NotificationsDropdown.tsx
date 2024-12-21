import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { toast } from 'react-toastify';
import NotificationsDropdownSkeleton from '../Skeletons/NotificationsDropdownSkeleton';
import { getAuthJwtToken } from '@/utils/auth';
import NavButton from '../NavBar/NavButton';
import { faBell } from '@fortawesome/free-regular-svg-icons';
import { humanReadable } from '@/utils/time';
import {
  faAward,
  faCheckCircle,
  faComments,
  faExclamationCircle,
  faHourglassHalf,
  faMedal,
  faMoneyBillWave,
  faPaperPlane,
  faStarHalfAlt,
  faTimesCircle,
} from '@fortawesome/free-solid-svg-icons';

const NotificationsDropdown = ({ onOpen }: { onOpen: () => void }) => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);

  const [notifications, setNotifications] = useState<INotifications[]>([]);
  const [error, setError] = useState('');

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [totalUnread, setTotalUnread] = useState(0);

  const getIconByType = (type: string) => {
    switch (type) {
      case 'proposal_submitted':
        return (
          <FontAwesomeIcon icon={faPaperPlane} className="text-blue-500" />
        );
      case 'proposal_accepted':
        return (
          <FontAwesomeIcon icon={faCheckCircle} className="text-green-500" />
        );
      case 'proposal_rejected':
        return (
          <FontAwesomeIcon icon={faTimesCircle} className="text-red-500" />
        );
      case 'milestone_completed':
        return <FontAwesomeIcon icon={faMedal} className="text-yellow-500" />;
      case 'payment_received':
        return (
          <FontAwesomeIcon icon={faMoneyBillWave} className="text-green-500" />
        );
      case 'message_received':
        return <FontAwesomeIcon icon={faComments} className="text-blue-500" />;
      case 'review_received':
        return (
          <FontAwesomeIcon icon={faStarHalfAlt} className="text-purple-500" />
        );
      case 'badge_earned':
        return <FontAwesomeIcon icon={faAward} className="text-purple-500" />;
      case 'withdrawal_processed':
        return (
          <FontAwesomeIcon
            icon={faHourglassHalf}
            className="text-gray-500 animate-spin"
          />
        );
      default:
        return (
          <FontAwesomeIcon
            icon={faExclamationCircle}
            className="text-orange-500"
          />
        );
    }
  };

  const markAsRead = useCallback(async () => {
    if (notifications.some((notification) => !notification.isRead)) {
      setTotalUnread(0);
      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) => ({
          ...notification,
          isRead: true,
        })),
      );

      try {
        await fetch(
          `${import.meta.env.VITE_API_URL}/notifications/mark-as-read`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${getAuthJwtToken()}`,
            },
          },
        );
      } catch {
        toast('An error occurred while marking notifications as read.', {
          type: 'error',
        });
      }
    }
  }, [notifications]);

  const openButtonRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        event.target === openButtonRef.current ||
        (event.target as Node).parentNode === openButtonRef.current ||
        (event.target as Node).parentNode?.parentNode ===
          openButtonRef.current ||
        (event.target as Node).parentNode?.parentNode?.parentNode ===
          openButtonRef.current
      ) {
        return;
      } else if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        onOpen();
        setIsDropdownOpen(false);
        markAsRead();
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen, onOpen, markAsRead]);

  const fetchDataRef = useRef(false);
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
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
        setTotalUnread(notificationsData.data.totalUnread);
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

    const interval = setInterval(() => {
      if (fetchDataRef.current === false) {
        fetchDataRef.current = true;
        fetchNotifications();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <div className="relative" ref={openButtonRef}>
        <NavButton
          focus={false}
          handleClick={() => {
            if (isDropdownOpen) markAsRead();
            setIsDropdownOpen(!isDropdownOpen);
            onOpen();
          }}
          wideHidden={false}
        >
          <FontAwesomeIcon icon={faBell} />
          {totalUnread > 0 && (
            <span className="bg-red-500 text-white text-xs rounded-full w-4 h-4 absolute top-0 right-1 flex justify-center items-center">
              {totalUnread}
            </span>
          )}
        </NavButton>
      </div>

      {isDropdownOpen && (
        <div className="relative" ref={dropdownRef}>
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
                    .map((notification: INotifications) => (
                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          navigate(notification.url);
                        }}
                        key={notification.id}
                        className={`flex items-center px-4 py-2 gap-4 justify-start text-gray-700 dark:text-gray-200 hover:text-green-700 dark:hover:text-green-700 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer text-left w-full ${
                          notification.isRead
                            ? 'bg-white dark:bg-gray-900'
                            : 'bg-green-100 dark:bg-green-800'
                        }`}
                      >
                        <div className="flex-shrink-0 text-lg">
                          {getIconByType(notification.type)}
                        </div>
                        <div className="flex-grow">
                          <p className="text-sm font-medium">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {humanReadable(notification.createdAt)}
                          </p>
                        </div>
                      </button>
                    ))}

                {!error && !loading && notifications.length === 0 && (
                  <div className="px-4 py-2 text-gray-500 dark:text-gray-400 text-center">
                    No notifications available
                  </div>
                )}
              </div>
              <button
                onClick={() => {
                  setIsDropdownOpen(false);
                  navigate('/notifications');
                }}
                className="rounded-b-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-blue-500 dark:text-blue-400 px-4 py-2 text-center border-t border-gray-300 dark:border-gray-600"
              >
                View All Notifications
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default NotificationsDropdown;
