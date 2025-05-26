import { createBrowserClient } from '@supabase/ssr';
import UserAuthDetails from '@/interfaces/user-auth';

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function signInWithPassword(payload: UserAuthDetails) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: payload.username,
    password: payload.password,
  });

  if (error) {
    console.error("Sign-in error:", error.message);
    throw error;
  }

  return data.user;
}

export async function userSignUp(payload: UserAuthDetails) {
  const { data, error } = await supabase.auth.signUp({
    email: payload.username,
    password: payload.password,
  });

  if (error) {
    console.error("Signup error:", error.message);
    throw error;
  }

  return data.user;
}
