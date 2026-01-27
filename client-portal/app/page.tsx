import { redirect } from 'next/navigation';

// Redirect root to /home which serves the nordic index.html
export default function RootPage() {
  redirect('/home');
}
