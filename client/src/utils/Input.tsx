import React from 'react';

const Input: React.FC<{
  label: string;
  children: React.ReactNode;
}> = (props) => {
  let css =
    'px-3 py-2 border border-gray-300 rounded-md focus:ring focus:outline-none focus:ring-green-500 focus:border-green-500';
  if (props.label === 'first-name' || props.label === 'last-name') {
    css = css.concat(' w-11/12');
  } else {
    css = css.concat(' w-full');
  }

  return (
    <div className="mb-2">
      <label
        htmlFor={props.label}
        className="block text-gray-700 font-medium text-base mb-1"
      >
        {props.children}
      </label>

      <input
        type={props.label}
        id={props.label}
        className={css}
        name={props.label}
        required
        placeholder={`Enter your ${props.label}`}
      />
    </div>
  );
};

export default Input;
