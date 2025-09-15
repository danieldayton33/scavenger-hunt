import CreateHuntForm from '@/components/HuntForm';
import { createHunt } from '@/lib/api/mutations/hunts/createHunt';

export default function NewHuntPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h1>New Hunt</h1>
      <CreateHuntForm />
    </div>
  );
}
