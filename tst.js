const res1 = await fetch(
	`${import.meta.env.VITE_API_URL}/admin/accounts/${freelancer?.id || ''}`,
	{
	  method: isUpdate ? 'PUT' : 'POST',
	  headers: {
		Authorization: `Bearer ${user.jwtToken}`,
		'Content-Type': 'application/json',
	  },
	  body: JSON.stringify(accountData),
	},
  );

  if (!res1.ok && res1.status !== 422)
	throw new Error('Something went wrong!');
  const data1 = await res1.json();

  if (Object.values(data1?.errors || {}).length) 
	setErrors(data1.errors);

  const res2 = await fetch(
	`${import.meta.env.VITE_API_URL}/admin/accounts/freelancer/${freelancer?.id || ''}`,
	{
	  method: 'PUT',
	  headers: {
		Authorization: `Bearer ${user.jwtToken}`,
		'Content-Type': 'application/json',
	  },
	  body: JSON.stringify(freelancerData),
	},
  );

  if (!res2.ok && res2.status !== 422)
	throw new Error('Something went wrong!');
  
  const data2 = await res2.json();
  if (Object.values(data2?.errors || {}).length) {
	setErrors((prevErrors) => ({ ...prevErrors, ...data2.errors }));

	toast(data1.message, { type: 'success' });
	  navigate('/admin/freelancers?reload=true');
	  onClose();
