import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import MainLayout from '@/layouts/MainLayout';
import Home from '@/pages/Home';
import About from '@/pages/About';
import Jobs from '@/pages/Jobs';
import Contacts from '@/pages/Contacts';
import Login from '@/pages/Login';
import SignUp from '@/pages/SignUp';
import SignUpForm, {
  action as signupAction,
} from '@/components/SignUp/SignUpForm';
import { TokensContextProvider } from './store/tokensContext';
import { SetTokensPage } from './utils/SetTokensPage';
import { Logout } from '@/utils/Logout';
import { action as loginAction } from '@/pages/Login';

function App() {
  const router = createBrowserRouter([
    {
      path: '/',
      element: <MainLayout />,
      children: [
        { index: true, element: <Home /> },
        { path: 'about', element: <About /> },
        { path: 'jobs', element: <Jobs /> },
        { path: 'contacts', element: <Contacts /> },
      ],
    },
    { path: '/login', element: <Login />, action: loginAction },
    {
      path: '/signup',
      element: <SignUp />,
      action: signupAction,
      children: [{ path: '', element: <SignUpForm /> }],
    },
    { path: '/set-tokens', element: <SetTokensPage /> },
    {
      path: '/logout',
      element: <Logout />,
    },
  ]);

  return (
    <TokensContextProvider>
      <RouterProvider router={router} />
    </TokensContextProvider>
  );
}

export default App;
