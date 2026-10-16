import { useState } from 'react';

export default function useForm(initial) {
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState({});

  const bind = (name) => ({
    name,
    value: values[name],
    error: errors[name],
    onChange: (e) => {
      const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
      setValues((v) => ({ ...v, [name]: val }));
      setErrors((er) => ({ ...er, [name]: '' }));
    },
  });

  const reset = () => { setValues(initial); setErrors({}); };

  return { values, errors, setErrors, setValues, bind, reset };
}