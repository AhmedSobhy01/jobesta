import { limitText } from '@/utils/string';
import ErrorModule from '@/components/ErrorModule';
import { LoaderFunctionArgs, useLoaderData, useNavigate } from 'react-router';
import UserContext from '@/store/userContext';
import { useContext, useEffect, useRef, useState } from 'react';
import MessagesSkeleton from '@/components/Skeletons/MessagesSkeleton';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { getAuthJwtToken } from '@/utils/auth';
import ReviewModal from '@/components/Jobs/AddReviewModal';
import CompleteMilestoneModal from '@/components/Milestones/CompleteMilestoneModal';
import getProfilePicture from '@/utils/profilePicture';

function ManageJob() {
  const navigate = useNavigate();
  const user = useContext(UserContext);

  const {
    status: jobFetchStatus,
    error: jobFetchError,
    job,
  } = useLoaderData<{
    status: boolean;
    error?: string;
    job: Job;
  }>();

  const [jobStatus, setJobStatus] = useState<string>(job?.status);

  const [proposal, setProposal] = useState<Proposal | null>(
    job?.proposals!.find((p) => p.status === 'accepted') ??
      job?.myProposal ??
      null,
  );

  const [currentMilestone, setCurrentMilestone] = useState<Milestone | null>(
    proposal?.milestones[0] ?? null,
  );
  const [isCompleteMilestoneModalOpen, setIsCompleteMilestoneModalOpen] =
    useState(false);

  const handleCompleteMilestoneModalClose = (success = false) => {
    if (success) {
      if (
        proposal?.milestones?.filter(
          (milestone) => milestone.status !== 'completed',
        ).length === 1
      )
        setJobStatus('completed');

      setProposal((prevProposal) => {
        if (!prevProposal) return null;

        return {
          ...prevProposal,
          milestones: prevProposal.milestones!.map((milestone) => {
            if (milestone.order === currentMilestone?.order)
              return { ...milestone, status: 'completed' };

            return milestone;
          }),
        };
      });
    }

    setIsCompleteMilestoneModalOpen(false);
  };

  const [loadingMessages, setLoadingMessages] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messagesError, setMessagesError] = useState('');
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const [isReviewModalOpen, setReviewModalOpen] = useState(false);

  useEffect(() => {
    if (
      user.username != null &&
      job &&
      job.status === 'completed' &&
      ((user.role === 'freelancer' && job.myProposal) ||
        (user.role === 'client' && job.myJob))
    ) {
      const myReview = job.reviews?.reduce<Review | undefined>(
        (acc, review) => {
          if (review.sender.username === user.username) {
            return review;
          }
          return acc;
        },
        undefined,
      );

      if (!myReview) {
        Swal.fire({
          title: 'This job has been completed. Would you like to add a review?',
          icon: 'success',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#F44336',
          confirmButtonText: 'Add Review',
          cancelButtonText: 'Maybe Later',
          showLoaderOnConfirm: true,
          allowOutsideClick: () => !Swal.isLoading(),
          backdrop: true,
          preConfirm: () => {
            setReviewModalOpen(true);
          },
        });
      }
    }
  }, [job, user, user.role, user.username]);

  const fetchDataRef = useRef(false);
  useEffect(() => {
    const fetchMessages = async () => {
      if (fetchDataRef.current) return;

      fetchDataRef.current = true;

      const oldMessagesLength = messages.length;

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/messages/${job?.id}/${proposal?.freelancer?.id}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getAuthJwtToken()}`,
          },
        },
      );

      if (!response.ok) {
        setMessagesError('Failed to fetch messages');
        setLoadingMessages(false);
        return;
      }

      const data = await response.json();
      setMessages(data.data.messages);
      setLoadingMessages(false);

      fetchDataRef.current = false;

      setTimeout(() => {
        if (
          messagesContainerRef.current &&
          data.data.messages.length !== oldMessagesLength
        )
          messagesContainerRef.current.scrollTo({
            top: messagesContainerRef.current.scrollHeight,
            behavior: 'smooth',
          });
      }, 100);
    };

    fetchMessages();

    const intervalId = setInterval(fetchMessages, 5000);

    return () => clearInterval(intervalId);
  }, [
    job?.id,
    proposal,
    messages.length,
    user.username,
    job?.reviews,
    job?.status,
  ]);

  const [message, setMessage] = useState('');
  const [attachment, setAttachment] = useState<File | null>(null);
  const [messageError, setMessageError] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  const handleAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    setMessageError('');
    setAttachment(e.target.files[0]);
  };

  const handleSendMessage = async () => {
    if (!message) {
      setMessageError('Message must not be empty');
      return;
    }

    if (message.length > 500) {
      setMessageError('Message must not exceed 500 characters');
      return;
    }

    setIsSendingMessage(true);

    const formData = new FormData();
    formData.append('message', message);
    if (attachment) {
      formData.append('file', attachment);
    }

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/messages/${job.id}/${proposal!.freelancer!.id}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${getAuthJwtToken()}`,
        },
        body: formData,
      },
    );

    if (!response.ok) {
      setIsSendingMessage(false);

      if (response.status === 422) {
        await response
          .json()
          .then((data) =>
            setMessageError(
              data.errors.message ||
                data.errors.file ||
                data.message ||
                'Failed to send message',
            ),
          );
        return;
      }

      setMessageError('Failed to send message');
      return;
    }

    const data = await response.json();
    setMessages((prevMessages) => [...prevMessages, data.data.message]);
    setMessage('');
    setAttachment(null);
    setIsSendingMessage(false);

    // Scroll to bottom of messages
    setTimeout(() => {
      if (messagesContainerRef.current)
        messagesContainerRef.current.scrollTo({
          top: messagesContainerRef.current.scrollHeight,
          behavior: 'smooth',
        });
    }, 100);
  };

  const handleDeleteMessage = async (messageId: number) => {
    Swal.fire({
      title: 'Are you sure?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#F44336',
      cancelButtonColor: '#3085d6',
      cancelButtonText: 'Cancel',
      confirmButtonText: 'Yes, delete message',
      showLoaderOnConfirm: true,
      allowOutsideClick: () => !Swal.isLoading(),
      backdrop: true,
      preConfirm: () => {
        fetch(
          `${import.meta.env.VITE_API_URL}/messages/${job.id}/${proposal!.freelancer!.id}/${messageId}`,
          {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${getAuthJwtToken()}`,
            },
          },
        )
          .then((response) => {
            if (!response.ok) throw new Error('Failed to delete message');

            return response.json();
          })
          .then(() => {
            setMessages((prevMessages) =>
              prevMessages.filter((m) => m.id !== messageId),
            );

            toast('Message deleted', { type: 'success' });
          })
          .catch(() => {
            toast('Failed to delete message', { type: 'error' });
          });
      },
    });
  };

  if (!jobFetchStatus) {
    return (
      <ErrorModule errorMessage={jobFetchError} onClose={() => navigate('/')} />
    );
  }

  return (
    <div className="py-10">
      {isReviewModalOpen && (
        <ReviewModal job={job} onClose={() => setReviewModalOpen(false)} />
      )}

      {isCompleteMilestoneModalOpen && (
        <CompleteMilestoneModal
          jobId={job.id}
          freelancerId={parseInt(proposal!.freelancer!.id!.toString())}
          milestoneOrder={
            currentMilestone ? parseInt(currentMilestone.order.toString()) : 0
          }
          onClose={handleCompleteMilestoneModalClose}
        />
      )}

      <h1 className="text-center w-full max-w-screen-xl mx-auto px-5 text-3xl font-bold lg:text-4xl">
        Manage Job
      </h1>

      <div className="max-w-screen-xl mx-auto px-5 md:min-h-[70vh] md:max-h-[80vh] flex flex-col gap-5 mt-5">
        <div className="w-full">
          <div className="flex gap-5 flex-col md:flex-row">
            <div className="border bg-white dark:bg-gray-800 dark:border-gray-700 p-5 rounded-lg shadow-md flex-1">
              <h2 className="text-xl font-semibold">Job Details</h2>
              <div className="flex flex-col space-y-2 mt-5">
                <div className="flex gap-3 flex-col md:flex-row item-center justify-between">
                  <div className="space-y-1 w-2/3">
                    <h4 className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Job Title
                    </h4>
                    <p className="block text-lg font-semibold text-gray-800 dark:text-gray-200">
                      {job.title}
                    </p>
                  </div>

                  <div className="space-y-1 w-1/3">
                    <h4 className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Job Category
                    </h4>
                    <p className="block text-lg font-semibold text-gray-800 dark:text-gray-200">
                      {job.category.name ?? 'Uncategorized'}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 flex-col md:flex-row item-center justify-between">
                  <div className="space-y-1 w-2/3">
                    <h4 className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Job Description
                    </h4>
                    <p className="block text-lg font-semibold text-gray-800 dark:text-gray-200">
                      {limitText(job.description, 60)}
                    </p>
                  </div>

                  <div className="space-y-1 w-1/3">
                    <h4 className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Status
                    </h4>
                    <p className="block text-lg font-semibold text-gray-800 dark:text-gray-200">
                      {jobStatus
                        .split('_')
                        .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
                        .join(' ')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="border bg-white dark:bg-gray-800 dark:border-gray-700 p-5 rounded-lg shadow-md flex-1">
              <h2 className="text-xl font-semibold">Proposal Details</h2>
              <div className="flex flex-col space-y-2 mt-5">
                <div className="flex gap-3 flex-col md:flex-row item-center justify-between">
                  <div className="space-y-1 md:w-1/3">
                    <h4 className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Freelancer Name
                    </h4>
                    <p className="block text-lg font-semibold text-gray-800 dark:text-gray-200">
                      {proposal?.freelancer?.firstName}{' '}
                      {proposal?.freelancer?.lastName}
                    </p>
                  </div>

                  <div className="space-y-1 md:w-1/3">
                    <h4 className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Freelancer Username
                    </h4>
                    <p className="block text-lg font-semibold text-gray-800 dark:text-gray-200">
                      {proposal?.freelancer?.username}
                    </p>
                  </div>

                  <div className="space-y-1 md:w-1/3">
                    <h4 className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Profile
                    </h4>
                    <a
                      href={`/users/${proposal?.freelancer?.username}`}
                      target="_blank"
                      className="block text-lg font-semibold hover:text-emerald-400 hover:dark:text-emerald-500 transition-colors duration-300 ease-in-out"
                    >
                      View Profile
                    </a>
                  </div>
                </div>

                <div className="flex gap-3 flex-col md:flex-row item-center justify-between">
                  <div className="space-y-1 md:w-1/3">
                    <h4 className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Total Price
                    </h4>
                    <p className="block text-lg font-semibold text-gray-800 dark:text-gray-200">
                      {proposal?.milestones?.reduce(
                        (acc: number, milestone: Milestone) =>
                          acc + parseFloat(milestone?.amount || '0'),
                        0,
                      )}
                      $
                    </p>
                  </div>

                  <div className="space-y-1 md:w-1/3">
                    <h4 className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Duration
                    </h4>
                    <p className="block text-lg font-semibold text-gray-800 dark:text-gray-200">
                      {proposal?.milestones?.reduce(
                        (acc: number, milestone: Milestone) =>
                          acc + parseFloat(milestone?.duration || '0'),
                        0,
                      )}{' '}
                      days
                    </p>
                  </div>

                  <div className="space-y-1 md:w-1/3">
                    <h4 className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Submission Date
                    </h4>
                    <p className="block text-lg font-semibold text-gray-800 dark:text-gray-200">
                      {new Date(proposal?.createdAt ?? '').toDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full flex gap-5 flex-1 min-h-full max-h-full flex-col md:flex-row">
          <div className="md:w-2/3 max-h-full">
            <div className="border bg-white dark:bg-gray-800 dark:border-gray-700 p-5 rounded-lg shadow-md min-h-[40rem] md:min-h-full md:max-h-full flex flex-col">
              <h2 className="text-xl font-semibold">Messages</h2>
              <div className="w-full px-5 flex flex-col justify-between flex-1 min-h-full">
                <div
                  className="flex flex-col mt-5 overflow-y-auto"
                  ref={messagesContainerRef}
                >
                  {loadingMessages && <MessagesSkeleton />}

                  {messagesError && <p>{messagesError}</p>}

                  {!loadingMessages &&
                    messages.map((message: Message) => (
                      <div
                        key={message.id}
                        className={`flex justify-${
                          message.sender.username === user.username
                            ? 'end'
                            : 'start'
                        } m-3 group`}
                      >
                        <div
                          className={`-mt-2 ${
                            message.sender.username === user.username
                              ? 'mr-2 text-white order-1'
                              : 'ml-2 text-white order-2'
                          }`}
                        >
                          <div className="flex items-center gap-2 w-full">
                            {(message.sender.username == user.username ||
                              user.role === 'admin') && (
                              <button
                                className={`text-red-500 dark:text-red-400 focus:outline-none w-0 opacity-0 group-hover:w-auto group-hover:opacity-100 transition-opacity duration-100 ease-in-out ${message.sender.username === user.username ? 'order-1' : 'order-2'}`}
                                onClick={() => handleDeleteMessage(message.id)}
                              >
                                <FontAwesomeIcon icon={faTrash} />
                              </button>
                            )}

                            <div
                              className={`py-1 px-5 flex items-center break-words whitespace-pre-wrap overflow-hidden text-ellipsis w-full ${
                                message.sender.username === user.username
                                  ? 'bg-blue-400 rounded-bl-3xl rounded-tl-3xl rounded-tr-xl text-white'
                                  : 'bg-gray-400 rounded-br-3xl rounded-tr-3xl rounded-tl-xl text-white'
                              } ${message.sender.username === user.username ? 'order-2' : 'order-1'}`}
                              style={{ wordBreak: 'break-word' }}
                            >
                              {message.sender.isAdmin && (
                                <span className="text-xs font-bold -ml-2 mr-2 bg-red-500 text-white px-1 rounded-full">
                                  Admin
                                </span>
                              )}
                              {user.role == 'admin' &&
                                message.sender.username ===
                                  job.client.username && (
                                  <span className="text-xs font-bold -ml-2 mr-2 bg-blue-500 text-white px-1 rounded-full">
                                    Client
                                  </span>
                                )}
                              {user.role == 'admin' &&
                                message.sender.username ===
                                  proposal?.freelancer?.username && (
                                  <span className="text-xs font-bold -ml-2 mr-2 bg-green-500 text-white px-1 rounded-full">
                                    Freelancer
                                  </span>
                                )}

                              {message.message}
                            </div>
                          </div>

                          {message.attachmentPath && (
                            <a
                              href={`${import.meta.env.VITE_API_URL}/${message.attachmentPath}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`text-blue-500 dark:text-blue-400 mt-1 text-sm w-full block`}
                            >
                              View Attachment
                            </a>
                          )}

                          <p className="text-xs text-gray-500 dark:text-gray-300 mt-1">
                            {new Date(message.sentAt).toLocaleString()}
                          </p>
                        </div>

                        <img
                          src={getProfilePicture(message.sender.profilePicture)}
                          className={`object-cover h-8 w-8 rounded-full ${message.sender.username === user.username ? 'order-2' : 'order-1'}`}
                          alt=""
                        />
                      </div>
                    ))}

                  {!loadingMessages && messages.length === 0 && (
                    <p className="text-center text-gray-500 dark:text-gray-300 mt-5">
                      No messages yet
                    </p>
                  )}
                </div>

                <div className="py-5 flex justify-between items-start border-t border-gray-300 gap-4">
                  <div className="w-full">
                    <input
                      type="text"
                      placeholder="Type a message"
                      className="w-full border border-gray-300 rounded-lg p-2"
                      value={message}
                      onChange={(e) => {
                        setMessage(e.target.value);
                        setMessageError('');
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSendMessage();
                      }}
                    />

                    {attachment && (
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-gray-500 dark:text-gray-300">
                          {attachment.name}
                        </span>
                        <button
                          className="text-red-500 dark:text-red-400"
                          onClick={() => {
                            setAttachment(null);
                            setMessageError('');
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    )}

                    {messageError && (
                      <p className="text-red-500 text-sm mt-1">
                        {messageError}
                      </p>
                    )}
                  </div>

                  <button
                    className={`bg-blue-400 text-white rounded-lg p-2 w-20 transition-colors duration-300 ease-in-out ${
                      isSendingMessage
                        ? 'cursor-not-allowed bg-opacity-50'
                        : 'hover:bg-blue-500'
                    }`}
                    onClick={handleSendMessage}
                    disabled={isSendingMessage}
                  >
                    {isSendingMessage ? 'Sending...' : 'Send'}
                  </button>

                  <label
                    htmlFor="attachment"
                    className="bg-gray-200 text-gray-700 rounded-lg p-2 w-20 text-center cursor-pointer transition-colors duration-300 ease-in-out hover:bg-gray-300"
                  >
                    Attach
                  </label>

                  <input
                    type="file"
                    id="attachment"
                    className="hidden"
                    onChange={handleAttachmentChange}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="border bg-white dark:bg-gray-800 dark:border-gray-700 p-5 rounded-lg shadow-md md:w-1/3 flex flex-col">
            <h2 className="text-xl font-semibold">Milestones</h2>
            <div className="flex flex-col space-y-2 mt-5 overflow-y-auto flex-1 px-2">
              {proposal?.milestones?.map((milestone: Milestone, i: number) => (
                <div key={i} className="border p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg font-semibold w-5 h-5 p-4 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-800 dark:text-gray-200">
                      {i + 1}
                    </span>
                    <span className="text-gray-600 dark:text-gray-200 font-bold">
                      {milestone.name}
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-200">
                    Price: ${milestone.amount}
                  </p>
                  <p className="text-gray-600 dark:text-gray-200">
                    Duration: {milestone.duration} days
                  </p>
                  <p className="text-gray-600 dark:text-gray-200">
                    {milestone.name}
                  </p>
                  <span
                    className={`inline-block ${milestone.status === 'completed' ? 'bg-green-200 text-green-800' : 'bg-gray-200 text-gray-800'} text-xs px-2 py-1 rounded-full mt-2`}
                  >
                    {milestone
                      .status!.split('_')
                      .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
                      .join(' ')}
                  </span>

                  {milestone.status !== 'completed' &&
                    job.client.username === user.username && (
                      <button
                        className="block text-sm mt-3 bg-emerald-500 text-white rounded-lg px-2 py-1.5 transition-colors duration-300 ease-in-out hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-opacity-75"
                        onClick={() => {
                          setCurrentMilestone(milestone);
                          setIsCompleteMilestoneModalOpen(true);
                        }}
                      >
                        Complete Milestone
                      </button>
                    )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

ManageJob.loader = async ({ params }: LoaderFunctionArgs) => {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/jobs/${params.jobId}`,
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAuthJwtToken()}`,
      },
    },
  );

  if (!response.ok)
    return { status: false, error: 'Failed to fetch job details' };

  const data = await response.json();

  if (
    (data.data.job.proposals!.find((p: Proposal) => p.status === 'accepted') ||
      data.data.job.myProposal) === null
  )
    return { status: false, error: 'Failed to fetch job details' };

  return { status: true, job: data.data.job };
};

export default ManageJob;
