import React from 'react';

const Input: React.FC<{
  label: string;
  children: React.ReactNode;
  minLength?: number;
  type?: string;
  errorMessage?: string;
  className?: string;
}> = (props) => {
  let css =
    'px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:outline-none';
  if (props.label === 'first-name' || props.label === 'last-name') {
    css = css.concat(' w-full');
  } else {
    css = css.concat(' w-full');
  }

  return (
    <div className={props.className}>
      <label
        htmlFor={props.label}
        className="block text-gray-700 font-medium text-base mb-1"
      >
        {props.children}
      </label>

      <input
        type={props.type || 'text'}
        id={props.label}
        className={css}
        name={props.label}
        required
        minLength={props.minLength}
        placeholder={`Enter your ${props.label}`}
      />

      {props.errorMessage && (
        <p className="mt-1 text-sm text-red-500">{props.errorMessage}</p>
      )}
    </div>
  );
};

export default Input;
