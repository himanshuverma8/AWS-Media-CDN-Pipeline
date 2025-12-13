import { getServerSession } from 'next-auth';
import { authOptions } from './auth';

export async function validateAuth() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return {
      isAuthenticated: false,
      error: 'Authentication required'
    };
  }

  // Allow all authenticated users
  return {
    isAuthenticated: true,
    user: session.user
  };
}

export async function validateReadOnlyAuth() {
  const session = await getServerSession(authOptions);
  
  // Allow read and write access for all authenticated users
  if (session?.user?.email) {
    return {
      isAuthenticated: true,
      user: session.user,
      canWrite: true
    };
  }

  return {
    isAuthenticated: false,
    user: null,
    canWrite: false
  };
}
