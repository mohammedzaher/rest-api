import axios from 'axios';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/router';
import { object, string, TypeOf } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

export const createSessionSchema = object({
  email: string().min(1, { message: 'Email is required' }),
  password: string().min(1, { message: 'Password is required' }),
});

type createSessionInput = TypeOf<typeof createSessionSchema>;

function LoginPage() {
  const router = useRouter();
  const [loginError, setLoginError] = useState<string | null>(null);
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm<createSessionInput>({
    resolver: zodResolver(createSessionSchema),
  });

  async function onSubmit(values: createSessionInput) {
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_ENDPOINT}/api/sessions`,
        values,
        { withCredentials: true }
      );
      router.push('/');
    } catch (e: any) {
      setLoginError(e.message);
    }
  }
  console.log({ errors });
  return (
    <>
      <p>{loginError}</p>
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

        <button type="submit">LOGIN</button>
      </form>
    </>
  );
}

export default LoginPage;
