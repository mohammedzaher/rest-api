import axios from 'axios';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/router';
import { object, string, TypeOf } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const createUserSchema = object({
  name: string().min(1, { message: 'Name is required' }),
  password: string().min(6, {
    message: 'Password too short - should be 6 chars minimum',
  }),
  passwordConfirmation: string().min(1, {
    message: 'Please confirm your password',
  }),
  email: string().email('Not a valid email').min(1, {
    message: 'Email is required',
  }),
}).refine((data) => data.password === data.passwordConfirmation, {
  message: 'Passwords do not match',
  path: ['passwordConfirmation'],
});

type createUserInput = TypeOf<typeof createUserSchema>;

function RegisterPage() {
  const router = useRouter();
  const [registerError, setRegisterError] = useState<string | null>(null);
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm<createUserInput>({
    resolver: zodResolver(createUserSchema),
  });

  async function onSubmit(values: createUserInput) {
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_ENDPOINT}/api/users`,
        values
      );
      router.push('/');
    } catch (e: any) {
      setRegisterError(e.message);
    }
  }
  console.log({ errors });
  return (
    <>
      <p>{registerError}</p>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="form-element">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            placeholder="jane.doe@example.com"
            {...register('email')}
          ></input>
          {/* @ts-ignore */}
          <p>{errors.email?.message}</p>
        </div>

        <div className="form-element">
          <label htmlFor="name">Name</label>
          <input
            id="name"
            type="text"
            placeholder="Jane Doe"
            {...register('name')}
          ></input>
          {/* @ts-ignore */}
          <p>{errors.name?.message}</p>
        </div>

        <div className="form-element">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            placeholder="********"
            {...register('password')}
          ></input>
          {/* @ts-ignore */}
          <p>{errors.password?.message}</p>
        </div>

        <div className="form-element">
          <label htmlFor="passwordConfirmation">Confirm password</label>
          <input
            id="passwordConfirmation"
            type="password"
            placeholder="********"
            {...register('passwordConfirmation')}
          ></input>
          {/* @ts-ignore */}
          <p>{errors.passwordConfirmation?.message}</p>
        </div>
        <button type="submit">SUBMIT</button>
      </form>
    </>
  );
}

export default RegisterPage;
