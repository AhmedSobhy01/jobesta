import { Form, Link, redirect, useActionData } from 'react-router-dom';
import { ActionFunctionArgs } from 'react-router-dom';
import Input from '@/utils/Input';
//type ErrorsState = Record<string, string>;

const SignUpForm: React.FC = () => {
  const errors = useActionData();

  return (
    <>
      <Link
        to="/"
        className="font-customFont text-5xl basis-20 text-green-700  font-bold mb-2"
      >
        Jobesta
      </Link>
      <h2 className="text-3xl font-bold text-gray-800 mb-4">
        Create New Account
      </h2>
      <div className=" flex flex-col max-w-md w-full px-8">
        <Form method="post" className=" border-green-700 border-6 border-solid">
          <div className="flex">
            <Input label="first-name">First Name</Input>
            {errors?.first_name && (
              <p className="mt-1 text-sm text-red-500">{errors.first_name}</p>
            )}
            <Input label="last-name">Last Name</Input>
            {errors?.last_name && (
              <p className="mt-1 text-sm text-red-500">{errors.last_name}</p>
            )}
          </div>
          <Input label="user-name">User Name</Input>
          {errors?.username && (
            <p className="mt-1 text-sm text-red-500">{errors.username}</p>
          )}
          <Input label="email">Email</Input>
          {errors?.email && (
            <p className="mt-1 text-sm text-red-500">{errors.email}</p>
          )}
          <Input minLenght={8} label="password">
            Password
          </Input>
          {errors?.password && (
            <p className="mt-1 text-sm text-red-500">{errors.password}</p>
          )}

          <button className="w-full mt-2 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring focus:ring-green-500">
            Register
          </button>
        </Form>
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

export async function action({ request }: ActionFunctionArgs) {
  const data = await request.formData();

  //get the role from the url parameters
  const url = new URL(request.url);
  const role = url.searchParams.get('role');

  const authData = {
    first_name: data.get('first-name'),
    last_name: data.get('last-name'),
    username: data.get('user-name'),
    email: data.get('email'),
    password: data.get('password'),
    role: role,
    profile_picture: null,
  };

  console.log(authData);
  try {
    const response = await fetch('http://localhost:3000/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(authData),
    });

    const resData = await response.json();

    if (!response.ok) {
      return resData.errors;
    }

    const jwtToken = resData.data.jwtToken;
    const refreshToken = resData.data.refreshToken;

    //store tokens in local storage
    localStorage.setItem('jwtToken', jwtToken);
    localStorage.setItem('refreshToken', refreshToken);

    const jwtTokenExpiration = new Date();
    jwtTokenExpiration.setHours(jwtTokenExpiration.getHours() + 1);

    //store jwtTokens expirationdate in local storage
    localStorage.setItem(
      'jwtTokenExpiration',
      jwtTokenExpiration.toISOString(),
    );

    const refreshedTokenExpiration = new Date();
    refreshedTokenExpiration.setDate(refreshedTokenExpiration.getDate() + 30);

    //store refreshedToken expirationdate in local storage
    localStorage.setItem(
      'refreshTokenExpiration',
      refreshedTokenExpiration.toISOString(),
    );

    return redirect('/set-tokens');
  } catch {
    return { global: 'A network error occurred. Please try again later.' };
  }
}
