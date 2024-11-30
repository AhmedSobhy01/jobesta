import { FormEvent } from 'react';
import { Link } from 'react-router';
import signinpic from '@/assets/signinpic.png';
import Input from '@/utils/Input';

function Login() {
  function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const fd = new FormData(event.target as HTMLFormElement);
    const data = Object.fromEntries(fd.entries());
    console.log(data);
  }

  return (
    <div className="justify-items-center">
      <div className="h-screen flex flex-row md:w-4/5">
        <div className="hidden md:basis-1/2 md:w-full md:h-full md:grid content-center justify-items-center">
          <img className="md:w-2/3" src={signinpic} />
        </div>
        <div className="-translate-x-3 md:basis-1/2 flex-col flex items-center justify-center">
          <h1 className="font-customFont text-5xl basis-20 text-green-700 font-bold mb-6">
            Jobesta
          </h1>
          <h2 className="text-3xl font-bold text-gray-800 mb-6">
            Login to Your Account
          </h2>
          <div className="flex flex-col max-w-md w-full px-8">
            <form onSubmit={handleSubmit}>
              <Input label="email">Email</Input>
              <Input label="password">Password</Input>
              <div className="mb-4 flex items-center justify-between">
                <a href="#" className="text-green-600 hover:underline">
                  Forgot Password?
                </a>
              </div>
              <button
                type="submit"
                className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring focus:ring-green-500"
              >
                Login
              </button>
            </form>
            <p className="mt-6 text-gray-700 text-center">
              Don't have an account?{' '}
              <Link to="/signup" className="text-green-600 hover:underline">
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
