import {
  faBriefcase,
  faHeadset,
  faLaptopCode,
  faStar,
  faStarHalfStroke,
  faSuitcase,
  faUserFriends,
  faUserSecret,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link } from 'react-router';
import heroImage from '@/assets/hero.png';
import { toast } from 'react-toastify';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import LabelSkeleton from '@/components/Skeletons/LabelSkeleton';
import CardSkeleton from '@/components/Skeletons/CardSkeleton';
import UserContext from '@/store/userContext';
import getProfilePicture from '@/utils/profilePicture';

function Home() {
  const user = useContext(UserContext);

  const [statistics, setStatistics] = useState({
    freelancersCount: 0,
    clientsCount: 0,
    jobsCount: 0,
  });
  const [isStatisticsLoading, setIsStatisticsLoading] = useState(true);

  const fetchStatisticsRef = useRef(false);
  const fetchStatistics = useCallback(async () => {
    if (fetchStatisticsRef.current) return;

    fetchStatisticsRef.current = true;

    try {
      const response = await fetch(
        import.meta.env.VITE_API_URL + '/statistics',
      );

      if (!response.ok) throw new Error('Failed to fetch statistics');

      const data = await response.json();
      setStatistics(data.data);
      setIsStatisticsLoading(false);
    } catch {
      toast('Failed to fetch statistics', { type: 'error' });
    }

    fetchStatisticsRef.current = false;
  }, []);

  const [categories, setCategories] = useState<JobCategory[]>([]);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);

  const fetchCategoriesRef = useRef(false);
  const fetchCategories = useCallback(async () => {
    if (fetchCategoriesRef.current) return;

    fetchCategoriesRef.current = true;

    try {
      const response = await fetch(
        import.meta.env.VITE_API_URL + '/categories',
      );

      if (!response.ok) throw new Error('Failed to fetch categories');

      const data = await response.json();
      setCategories(data.data.categories.slice(0, 4));
      setIsCategoriesLoading(false);
    } catch {
      toast('Failed to fetch categories', { type: 'error' });
    }

    fetchCategoriesRef.current = false;
  }, []);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [isReviewsLoading, setIsReviewsLoading] = useState(true);

  const fetchReviewsRef = useRef(false);
  const fetchReviews = useCallback(async () => {
    if (fetchReviewsRef.current) return;

    fetchReviewsRef.current = true;

    try {
      const response = await fetch(
        import.meta.env.VITE_API_URL + '/reviews/recent',
      );

      if (!response.ok) throw new Error('Failed to fetch reviews');

      const data = await response.json();
      setReviews(data.data.reviews);
      setIsReviewsLoading(false);
    } catch {
      toast('Failed to fetch reviews', { type: 'error' });
    }

    fetchReviewsRef.current = false;
  }, []);

  useEffect(() => {
    fetchStatistics();
    fetchCategories();
    fetchReviews();
  }, [fetchStatistics, fetchCategories, fetchReviews]);

  return (
    <div>
      <div className="w-full max-w-screen-xl mx-auto px-5 py-10">
        <div className="flex flex-col items-center justify-between gap-5 pt-6 lg:flex-row">
          <div className="flex-1 w-full lg:max-w-2xl lg:-mt-6">
            <h1 className="text-2xl font-bold tracking-tight text-center md:text-3xl lg:text-4xl lg:text-start md:whitespace-pre">
              Find Your Dream Job <wbr />
              and Hire the Right Talent
            </h1>
            <p className="mt-4 text-lg text-center lg:text-start text-gray-600">
              Explore thousands of job opportunities and connect with top
              freelancers. Whether you're looking for a new career or seeking
              the best talent, we've got you covered.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
              <Link
                to="/jobs"
                className="py-3 px-16 text-lg font-bold bg-emerald-200 rounded-full text-center"
              >
                Find Jobs
              </Link>
              <Link
                to={
                  user.username
                    ? '/jobs/create'
                    : '/login?redirect=/jobs/create'
                }
                className="py-3 px-16 text-lg font-bold bg-yellow-200 rounded-full text-center"
              >
                Create Your Job
              </Link>
            </div>
          </div>
          <div className="w-full sm:w-[30rem] relative overflow-hidden mt-8 lg:mt-0">
            <img
              sizes="100vw"
              src={heroImage}
              width="984"
              height="984"
              decoding="async"
              className="w-full h-auto"
            />
          </div>
        </div>
      </div>

      <div className="py-14 bg-emerald-100/75">
        <div className="w-full max-w-screen-xl mx-auto px-5">
          <div className="text-center">
            <h2 className="max-w-xs mx-auto text-2xl font-bold md:whitespace-pre">
              Browse jobs by category
            </h2>
            <p className="mt-1 text-lg text-black/50">
              Find the best remote jobs in the most popular categories
            </p>
          </div>
          <div className="grid gap-8 mt-10 md:grid-cols-2 lg:grid-cols-4">
            {isCategoriesLoading &&
              [...Array(4)].map((_, index) => <CardSkeleton key={index} />)}

            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/jobs?categories=${category.id}`}
                className="flex flex-col items-center justify-between px-5 py-4 transition-all bg-white border hover:shadow-lg rounded-2xl gap-2"
              >
                <h3 className="mt-4 text-lg text-black">{category.name}</h3>
                <p className="mt-1 text-sm text-gray-600 text-center">
                  {category.description}
                </p>
                <h4 className="mt-px text-sm">
                  {category.jobsCount} open jobs
                </h4>
              </Link>
            ))}
          </div>
          <div className="flex justify-center mt-8">
            <Link
              to="/jobs"
              className="inline-flex text-black bg-yellow-200 border border-yellow-200 rounded-full hover:border-black justify-center px-8 py-3 font-bold"
            >
              Browse more Categories
            </Link>
          </div>
        </div>
      </div>

      <div className="w-full max-w-screen-xl mx-auto px-5">
        <div className="px-8 py-12 mt-24 border border-gray-200 shadow-lg rounded-xl bg-white">
          <div className="grid gap-12 md:grid-cols-3">
            <div className="flex flex-col items-center gap-4 text-center md:text-start lg:flex-row">
              <FontAwesomeIcon
                icon={faUserFriends}
                className="text-5xl text-emerald-500"
              />
              <div>
                <h2 className="text-3xl font-bold text-gray-800">
                  {isStatisticsLoading ? (
                    <LabelSkeleton />
                  ) : (
                    <>{statistics.freelancersCount}+</>
                  )}
                </h2>
                <p className="mt-1 text-lg font-medium text-gray-600">
                  Freelancers Registered
                </p>
              </div>
            </div>
            <div className="flex flex-col items-center gap-4 text-center md:text-start lg:flex-row">
              <FontAwesomeIcon
                icon={faUserSecret}
                className="text-5xl text-emerald-500"
              />
              <div>
                <h2 className="text-3xl font-bold text-gray-800">
                  {isStatisticsLoading ? (
                    <LabelSkeleton />
                  ) : (
                    <>{statistics.clientsCount}+</>
                  )}
                </h2>
                <p className="mt-1 text-lg font-medium text-gray-600">
                  Clients Registered
                </p>
              </div>
            </div>
            <div className="flex flex-col items-center gap-4 text-center md:text-start lg:flex-row">
              <FontAwesomeIcon
                icon={faSuitcase}
                className="text-5xl text-emerald-500"
              />
              <div>
                <h2 className="text-3xl font-bold text-gray-800">
                  {isStatisticsLoading ? (
                    <LabelSkeleton />
                  ) : (
                    <>{statistics.jobsCount}+</>
                  )}
                </h2>
                <p className="mt-1 text-lg font-medium text-gray-600">
                  Jobs Posted
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full mt-24 bg-emerald-100/75">
        <div className="max-w-screen-xl mx-auto px-5 py-14">
          <div className="text-center">
            <h2 className="mb-4 text-3xl font-bold">Latest Client Reviews</h2>
          </div>
          <div className="grid gap-8 mt-8 md:grid-cols-2 lg:grid-cols-3">
            {isReviewsLoading &&
              [...Array(3)].map((_, index) => <CardSkeleton key={index} />)}

            {reviews.map((review) => (
              <div
                className="p-6 bg-white border rounded-lg shadow-md"
                key={review.sender.username + review.createdAt}
              >
                {review.comment && (
                  <p className="leading-7 text-slate-500">{review.comment}</p>
                )}
                <div
                  className={`flex items-center gap-6 border-gray-200 ${review.comment ? 'border-t mt-6 pt-6' : ''}`}
                >
                  <img
                    src={getProfilePicture(review.sender.profilePicture)}
                    width="55"
                    height="55"
                    decoding="async"
                    className="rounded-full w-14 text-transparent"
                    loading="lazy"
                  />
                  <div>
                    <p>
                      {review.sender.firstName} {review.sender.lastName}
                    </p>
                    <div className="flex items-center mt-1">
                      {[...Array(5)].map((_, index) => {
                        const roundedRating =
                          Math.round(Number(review.rating) * 2) / 2;
                        return (
                          <span key={index}>
                            {index < Math.floor(roundedRating) ? (
                              <FontAwesomeIcon
                                icon={faStar}
                                className="text-emerald-500"
                              />
                            ) : index < roundedRating ? (
                              <FontAwesomeIcon
                                icon={faStarHalfStroke}
                                className="text-emerald-500"
                              />
                            ) : (
                              <FontAwesomeIcon
                                icon={faStar}
                                className="text-gray-300"
                              />
                            )}
                          </span>
                        );
                      })}
                    </div>
                    <Link
                      to={`/jobs/${review.job!.id}`}
                      className="text-emerald-500 hover:underline mt-2 block"
                    >
                      View Job
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div
        className="w-full max-w-screen-xl mx-auto px-5 py-14"
        id="contact-us"
      >
        <div className="text-center">
          <h2 className="mb-4 text-3xl font-bold">Contact Us</h2>
          <p className="text-lg text-gray-600">
            Have any questions? We'd love to hear from you.
          </p>
        </div>
        <div className="grid gap-8 mt-8 md:grid-cols-2 lg:grid-cols-3">
          <div className="flex flex-col items-center text-center">
            <FontAwesomeIcon
              icon={faHeadset}
              className="text-5xl text-emerald-500"
            />
            <h3 className="mt-4 text-lg font-bold">Customer Support</h3>
            <p className="mt-2 text-gray-600">support@jobesta.com</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <FontAwesomeIcon
              icon={faBriefcase}
              className="text-5xl text-emerald-500"
            />
            <h3 className="mt-4 text-lg font-bold">Business Inquiries</h3>
            <p className="mt-2 text-gray-600">business@jobesta.com</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <FontAwesomeIcon
              icon={faLaptopCode}
              className="text-5xl text-emerald-500"
            />
            <h3 className="mt-4 text-lg font-bold">Technical Support</h3>
            <p className="mt-2 text-gray-600">techsupport@jobesta.com</p>
          </div>
        </div>
      </div>

      <div className="w-full bg-gray-800 py-4">
        <div className="max-w-screen-xl mx-auto px-5 text-center text-white">
          <p>&copy; {new Date().getFullYear()} Jobesta. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}

export default Home;
