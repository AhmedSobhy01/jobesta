import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import MainLayout from '@/layouts/MainLayout';
import Home from '@/pages/Home';
import About from '@/pages/About';
import Jobs from '@/pages/Jobs';
import Contacts from '@/pages/Contacts';
import Login from '@/pages/Login';
import SignUp from '@/pages/SignUp';

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
    { path: '/login', element: <Login /> },
    { path: '/signup', element: <SignUp /> },
  ]);

  return <RouterProvider router={router} />;
}

export default App;
