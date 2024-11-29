import { Link } from 'react-router-dom';
import Input from '@/utils/Input';
import { FormEvent } from 'react';

const SignUpForm: React.FC<{ role: string }> = (props) => {
  function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const fd = new FormData(event.target as HTMLFormElement);
    const data = Object.fromEntries(fd.entries());
    data.role = props.role;
    console.log(data);
  }

  return (
    <>
      <h1 className="font-customFont text-5xl basis-20 text-green-700  font-bold mb-2">
        Jobesta
      </h1>
      <h2 className="text-3xl font-bold text-gray-800 mb-4">
        Create New Account
      </h2>
      <div className=" flex flex-col max-w-md w-full px-8">
        <form
          onSubmit={handleSubmit}
          className=" border-green-700 border-6 border-solid"
        >
          <div className="flex">
            <Input label="first-name">First Name</Input>
            <Input label="last-name">Last Name</Input>
          </div>
          <Input label="user-name">User Name</Input>
          <Input label="email">Email</Input>
          <Input label="password">Password</Input>

          <button className="w-full mt-2 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring focus:ring-green-500">
            Register
          </button>
        </form>
        <p className="mt-6 text-gray-700 text-center">
          Already have an account?{' '}
          <Link to="/login" className="text-green-600 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </>
  );
};

export default SignUpForm;
