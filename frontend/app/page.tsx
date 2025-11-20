import { redirect } from 'next/navigation';

export default function Home() {
  // Redirect to dashboard as the default page
  redirect('/dashboard/content-banks');
}