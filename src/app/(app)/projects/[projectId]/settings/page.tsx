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
  Textarea,
} from '@jasonruesch/react';
import { type FormEvent, useState } from 'react';
import { useNavigate } from 'react-router';
import type { RouteProps } from 'virtual:react-router-next/(app)/projects/[projectId]/settings';
import { useDocumentTitle } from '~/lib/a11y';
import {
  useDeleteProject,
  useProject,
  useUpdateProject,
} from '../../_lib/use-projects';

export default function ProjectSettingsPage({ params }: RouteProps) {
  const { projectId } = params;
  const { data: project } = useProject(projectId);
  const updateProject = useUpdateProject(projectId);
  const deleteProject = useDeleteProject();
  const navigate = useNavigate();
  useDocumentTitle(`${project.name} settings`);

  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description);
  const [color, setColor] = useState(project.color);

  const onSave = (event: FormEvent) => {
    event.preventDefault();
    updateProject.mutate({ name, description, color });
  };

  const onDelete = async () => {
    if (!window.confirm(`Delete “${project.name}” and all its tasks?`)) return;
    await deleteProject.mutateAsync(projectId);
    navigate('/projects', { replace: true });
  };

  return (
    <Stack gap={6} className="max-w-xl">
      <Card>
        <CardHeader>
          <CardTitle>Project details</CardTitle>
          <CardDescription>Update how this project appears.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSave}>
            <Stack gap={4}>
              <Field label="Name">
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </Field>
              <Field label="Description">
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </Field>
              <Field label="Color">
                <input
                  type="color"
                  aria-label="Project color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="h-10 w-16 cursor-pointer rounded-md border border-line bg-canvas"
                />
              </Field>
              <div className="flex justify-end">
                <Button
                  type="submit"
                  loading={updateProject.isPending}
                  disabled={!name}
                >
                  Save changes
                </Button>
              </div>
            </Stack>
          </form>
        </CardContent>
      </Card>

      <Card className="border-danger-border">
        <CardHeader>
          <CardTitle>Danger zone</CardTitle>
          <CardDescription>
            Deleting a project permanently removes it and all of its tasks.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="danger"
            loading={deleteProject.isPending}
            onClick={onDelete}
          >
            Delete project
          </Button>
        </CardContent>
      </Card>
    </Stack>
  );
}
