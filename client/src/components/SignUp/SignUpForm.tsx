import { Form, Link, redirect, useActionData } from 'react-router-dom';
import { ActionFunctionArgs } from 'react-router-dom';
import Input from '@/utils/Input';

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
      <div className="flex flex-col w-full px-8">
        <Form method="post" className=" border-green-700 border-6 border-solid">
          <div className="space-y-2.5">
            <div className="flex flex-col md:flex-row md:gap-4">
              <Input
                className="w-full inline-block"
                label="first-name"
                errorMessage={errors?.firstName}
              >
                First Name
              </Input>

              <Input
                className="w-full inline-block"
                label="last-name"
                errorMessage={errors?.lastName}
              >
                Last Name
              </Input>
            </div>

            <Input label="user-name" errorMessage={errors?.username}>
              User Name
            </Input>

            <Input label="email" type="email" errorMessage={errors?.email}>
              Email
            </Input>

            <Input
              minLength={8}
              label="password"
              type="password"
              errorMessage={errors?.password}
            >
              Password
            </Input>
          </div>

          <button className="w-full mt-4 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring focus:ring-green-500">
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
    firstName: data.get('first-name'),
    lastName: data.get('last-name'),
    username: data.get('user-name'),
    email: data.get('email'),
    password: data.get('password'),
    role: role,
    profilePicture: null,
  };

  try {
    const response = await fetch(
      import.meta.env.VITE_API_URL + '/auth/register',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(authData),
      },
    );

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

    //store jwtTokens expiration date in local storage
    localStorage.setItem(
      'jwtTokenExpiration',
      jwtTokenExpiration.toISOString(),
    );

    const refreshedTokenExpiration = new Date();
    refreshedTokenExpiration.setDate(refreshedTokenExpiration.getDate() + 30);

    //store refreshedToken expiration date in local storage
    localStorage.setItem(
      'refreshTokenExpiration',
      refreshedTokenExpiration.toISOString(),
    );

    return redirect('/set-tokens');
  } catch {
    return { global: 'A network error occurred. Please try again later.' };
  }
}
