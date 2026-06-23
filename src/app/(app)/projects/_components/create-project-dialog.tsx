import {
  Alert,
  AlertDescription,
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Field,
  Input,
  Stack,
  Textarea,
} from '@jasonruesch/react';
import { Plus } from 'lucide-react';
import { type FormEvent, useState } from 'react';
import { useNavigate } from 'react-router';
import { generate as generateProject } from 'virtual:react-router-next/(app)/projects/[projectId]';
import { useCreateProject } from '../_lib/use-projects';

export function CreateProjectDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [key, setKey] = useState('');
  const [description, setDescription] = useState('');
  const navigate = useNavigate();
  const createProject = useCreateProject();

  const reset = () => {
    setName('');
    setKey('');
    setDescription('');
    createProject.reset();
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const project = await createProject.mutateAsync({ name, key, description });
    setOpen(false);
    reset();
    navigate(generateProject({ projectId: project.id }));
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button>
          <Plus size={16} aria-hidden /> New project
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle>Create project</DialogTitle>
            <DialogDescription>
              Projects group tasks into boards your team can work from.
            </DialogDescription>
          </DialogHeader>

          <Stack gap={4} className="py-4">
            {createProject.isError && (
              <Alert variant="danger">
                <AlertDescription>
                  Couldn&apos;t create the project. Please try again.
                </AlertDescription>
              </Alert>
            )}
            <Field label="Name" required>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Marketing Website"
                required
                autoFocus
              />
            </Field>
            <Field
              label="Key"
              description="A short uppercase code (up to 4 letters), e.g. MKT."
              required
            >
              <Input
                value={key}
                onChange={(e) => setKey(e.target.value.toUpperCase())}
                placeholder="MKT"
                maxLength={4}
                required
              />
            </Field>
            <Field label="Description">
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What is this project about?"
                rows={3}
              />
            </Field>
          </Stack>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="ghost">
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="submit"
              loading={createProject.isPending}
              disabled={!name || !key}
            >
              Create project
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
