import { getSession } from '@/lib/auth/session';

export async function GET() {
  const session = await getSession();
  if (!session.userId) {
    return Response.json(null);
  }
  return Response.json({ id: session.userId, email: session.email });
}
