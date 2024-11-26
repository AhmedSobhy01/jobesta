import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';

function App() {
  const router = createBrowserRouter([{ path: '/', element: <MainLayout /> }]);

  return <RouterProvider router={router} />;
}

export default App;
