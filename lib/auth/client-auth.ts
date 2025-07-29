'use client';

import { signIn as nextAuthSignIn, signOut as nextAuthSignOut } from 'next-auth/react';
import { IUserSignIn } from '@/types';

// Client-side authentication functions

export async function signInWithCredentials(user: IUserSignIn) {
  return await nextAuthSignIn('credentials', { ...user, redirect: false });
}

export async function signInWithGoogle() {
  return await nextAuthSignIn('google');
}

export async function signOut() {
  return await nextAuthSignOut({ redirect: false });
}