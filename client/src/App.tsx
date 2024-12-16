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
import Freelancers from '@/pages/Admin/Freelancers';
import CreateJobForm from '@/pages/CreateJobForm';
import ManageJob from './pages/ManageJob';

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    loader: MainLayout.loader,
    children: [
      { index: true, element: <Home /> },
      { path: 'about', element: <About /> },
      {
        path: 'jobs',
        children: [
          { path: '', element: <Jobs />, loader: Jobs.loader },
          {
            path: 'create',
            element: <CreateJobForm />,
            loader: CreateJobForm.loader,
          },
          {
            path: ':jobId/manage',
            element: <ManageJob />,
            loader: ManageJob.loader,
          },
          {
            path: ':jobId',
            element: <Job />,
            loader: Job.loader,
          },
        ],
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
    loader: AdminLayout.loader,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: 'clients',
        element: <Clients />,
      },
      {
        path: 'freelancers',
        element: <Freelancers />,
      },
    ],
  },
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
