import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import MainLayout from '@/layouts/MainLayout';
import AdminLayout from '@/layouts/AdminLayout';
import Home from '@/pages/Home';
import About from '@/pages/About';
import Jobs from '@/pages/Jobs';
import Job from '@/pages/Job';
import Contacts from '@/pages/Contacts';
import Login from '@/pages/Login';
import SignUp from '@/pages/SignUp';
import SignUpForm from '@/components/SignUp/SignUpForm';
import { UserContextProvider } from '@/store/userContext';
import { SetUserPage } from '@/utils/SetUserPage';
import { Logout } from '@/utils/Logout';
import ProfilePage from '@/pages/Profile';
import { FreelancerContextProvider } from '@/store/freelancerContext';
import Dashboard from '@/pages/Admin/Dashboard';
import Clients from '@/pages/Admin/Clients';
import Admins from '@/pages/Admin/Admins';
import Freelancers from '@/pages/Admin/Freelancers';
import Categories from '@/pages/Admin/Categories';
import Badges from '@/pages/Admin/Badges';
import CreateJobForm from '@/pages/CreateJobForm';
import Notifications from '@/pages/Notifications';
import ManageJob from '@/pages/ManageJob';
import AdminJobs from '@/pages/Admin/Jobs';
import NotFound from '@/pages/NotFound';
import AuthMiddleware from '@/components/AuthMiddleware';
import Withdrawals from '@/pages/Withdrawals';
import AdminWithdrawals from '@/pages/Admin/Withdrawals';

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'about', element: <About /> },
      {
        path: 'jobs',
        children: [
          { path: '', element: <Jobs />, loader: Jobs.loader },
          {
            path: 'create',
            element: (
              <AuthMiddleware>
                <CreateJobForm />
              </AuthMiddleware>
            ),
            loader: CreateJobForm.loader,
          },
          {
            path: ':jobId/manage',
            element: (
              <AuthMiddleware>
                <ManageJob />
              </AuthMiddleware>
            ),
            loader: ManageJob.loader,
          },
          {
            path: ':jobId',
            element: <Job />,
            loader: Job.loader,
          },
        ],
      },
      {
        path: '/notifications',
        element: (
          <AuthMiddleware>
            <Notifications />
          </AuthMiddleware>
        ),
        loader: Notifications.loader,
      },
      {
        path: '/withdrawals',
        element: (
          <AuthMiddleware>
            <Withdrawals />
          </AuthMiddleware>
        ),
        loader: Withdrawals.loader,
      },
      { path: 'contacts', element: <Contacts /> },
      {
        path: 'users/:username',
        element: <ProfilePage />,
        loader: ProfilePage.loader,
      },
    ],
  },
  { path: '/login', element: <Login />, action: Login.action },
  {
    path: '/signup',
    element: <SignUp />,
    action: SignUpForm.action,
    children: [{ path: '', element: <SignUpForm /> }],
  },
  { path: '/set-user', element: <SetUserPage /> },
  {
    path: '/logout',
    element: <Logout />,
  },
  {
    path: 'admin',
    element: <AdminLayout />,
    children: [
      {
        index: true,
        element: <Dashboard />,
        loader: Dashboard.loader,
      },
      {
        path: 'clients',
        element: <Clients />,
      },
      {
        path: 'admins',
        element: <Admins />,
      },
      {
        path: 'freelancers',
        element: <Freelancers />,
      },
      {
        path: 'categories',
        element: <Categories />,
      },
      {
        path: 'badges',
        element: <Badges />,
      },
      {
        path: 'withdrawals',
        element: <AdminWithdrawals />,
      },
      {
        path: 'jobs',
        element: <AdminJobs />,
      },
    ],
  },
  { path: '*', element: <NotFound /> },
]);

function App() {
  return (
    <UserContextProvider>
      <FreelancerContextProvider>
        <RouterProvider router={router} />
      </FreelancerContextProvider>
    </UserContextProvider>
  );
}

export default App;
