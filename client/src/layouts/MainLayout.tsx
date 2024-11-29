import { Outlet } from 'react-router-dom';
import MainNavigationBar from '@/components/NavBar/MainNavigationBar';

function MainLayout() {
  return (
    <>
      <MainNavigationBar />
      <main>
        <Outlet />
      </main>
    </>
  );
}

export default MainLayout;
