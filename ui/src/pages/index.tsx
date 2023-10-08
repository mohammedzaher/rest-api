import useSwr from 'swr';
import { Inter } from 'next/font/google';
import styles from '@/styles/Home.module.css';
import fetcher from '../../utils/fetcher';
import { GetServerSideProps } from 'next';

const inter = Inter({ subsets: ['latin'] });

interface User {
  _id: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  __v: number;
  session: string;
  iat: number;
  exp: number;
}

export default function Home({ fallbackData }: { fallbackData: User }) {
  const { data, error } = useSwr(
    `${process.env.NEXT_PUBLIC_SERVER_ENDPOINT}/api/me`,
    fetcher,
    { fallbackData: fallbackData }
  );

  if (data) {
    return <div>Welcome! {data.name}</div>;
  }
  return <>Please login</>;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const data = await fetcher(
    `${process.env.NEXT_PUBLIC_SERVER_ENDPOINT}/api/me`,
    context.req.headers
  );
  return { props: { fallbackData: data } };
};
