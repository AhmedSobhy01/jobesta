import { Outlet } from 'react-router-dom';

function MainLayout() {
  return (
    <>
      <h1 className="text-blue-400 text-3xl">on progress....</h1>
      <main>
        <Outlet />
      </main>
    </>
  );
}

export default MainLayout;
