import { auth } from '@/auth/config';
import { redirect } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ProfileView from '@/components/ProfileView';

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const user = session.user;
  const isAdmin = user.role === 'admin';

  return (
    <div className="container mx-auto max-w-2xl">
      <h1 className="mb-6 text-3xl font-bold">User Profile</h1>
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Your account details and information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user.image || undefined} alt={user.name || 'User'} />
              <AvatarFallback className="text-2xl">
                {user.name
                  ? user.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()
                  : 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-semibold">{user.name || 'User'}</h2>
              <p className="text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <ProfileView
            name={user.name}
            email={user?.email || ''}
            role={isAdmin ? user.role : undefined}
            isAdmin={isAdmin}
          />
        </CardContent>
      </Card>
    </div>
  );
}
