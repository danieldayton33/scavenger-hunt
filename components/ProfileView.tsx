'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import ProfileForm from './ProfileForm';
import { Pencil } from 'lucide-react';

export type ProfileViewProps = {
  name?: string | null;
  email: string;
  role?: 'admin' | 'user';
  isAdmin: boolean;
};

export default function ProfileView({ name, email, role, isAdmin }: ProfileViewProps) {
  const [isEditing, setIsEditing] = useState(false);

  if (isEditing) {
    return (
      <div className="space-y-4">
        <ProfileForm
          initialName={name}
          initialRole={role}
          isAdmin={isAdmin}
          onSuccess={() => setIsEditing(false)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium text-muted-foreground">Email</label>
        <p className="text-sm">{email}</p>
      </div>
      {name && (
        <div>
          <label className="text-sm font-medium text-muted-foreground">Name</label>
          <p className="text-sm">{name}</p>
        </div>
      )}
      {isAdmin && role && (
        <div>
          <label className="text-sm font-medium text-muted-foreground">Role</label>
          <p className="text-sm capitalize">{role}</p>
        </div>
      )}
      <div className="pt-2">
        <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
          <Pencil className="h-4 w-4" />
          Edit Profile
        </Button>
      </div>
    </div>
  );
}

