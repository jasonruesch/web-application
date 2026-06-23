import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Field,
  Input,
  Stack,
} from '@jasonruesch/react';
import { type FormEvent, useState } from 'react';
import { AppearanceControls } from '~/components/appearance';
import { PageHeader } from '~/components/page-header';
import { UserAvatar } from '~/components/task-meta';
import { useCurrentUser } from '~/lib/use-auth';
import { useSessionStore } from '~/stores/session.store';

export default function SettingsPage() {
  const user = useCurrentUser();
  const updateUser = useSessionStore((s) => s.updateUser);
  const [name, setName] = useState(user?.name ?? '');
  const [jobTitle, setJobTitle] = useState(user?.jobTitle ?? '');
  const [saved, setSaved] = useState(false);

  if (!user) return null;

  const onSave = (event: FormEvent) => {
    event.preventDefault();
    updateUser({ name, jobTitle });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-xl">
      <PageHeader title="Settings" description="Manage your profile and appearance." />
      <Stack gap={6}>
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>How you appear to your team.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSave}>
              <Stack gap={4}>
                <div className="flex items-center gap-4">
                  <UserAvatar user={user} size="lg" />
                  <div>
                    <p className="text-sm font-medium">{user.email}</p>
                    <p className="text-xs text-fg-subtle">
                      Sign-in email (read only)
                    </p>
                  </div>
                </div>
                <Field label="Display name">
                  <Input value={name} onChange={(e) => setName(e.target.value)} />
                </Field>
                <Field label="Job title">
                  <Input
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                  />
                </Field>
                <div className="flex items-center justify-end gap-3">
                  {saved && (
                    <span className="text-sm text-success" role="status">
                      Saved
                    </span>
                  )}
                  <Button type="submit" disabled={!name}>
                    Save profile
                  </Button>
                </div>
              </Stack>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>
              Theme and brand are saved to this device.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AppearanceControls />
          </CardContent>
        </Card>
      </Stack>
    </div>
  );
}
