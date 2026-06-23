import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Field,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Stack,
  Textarea,
} from '@jasonruesch/react';
import { Plus } from 'lucide-react';
import { type FormEvent, useState } from 'react';
import {
  PRIORITY_LABELS,
  TASK_PRIORITIES,
  type TaskPriority,
  type User,
} from '~/types';
import { useCreateTask } from '../_lib/use-tasks';

const UNASSIGNED = 'unassigned';

export function CreateTaskDialog({
  projectId,
  members,
}: {
  projectId: string;
  members: User[];
}) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [assigneeId, setAssigneeId] = useState<string>(UNASSIGNED);
  const [dueDate, setDueDate] = useState('');
  const [createTask, { loading }] = useCreateTask(projectId);

  const reset = () => {
    setTitle('');
    setDescription('');
    setPriority('medium');
    setAssigneeId(UNASSIGNED);
    setDueDate('');
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    await createTask({
      variables: {
        input: {
          projectId,
          title,
          description,
          priority,
          assigneeId: assigneeId === UNASSIGNED ? null : assigneeId,
          dueDate: dueDate ? new Date(dueDate).toISOString() : null,
        },
      },
    });
    setOpen(false);
    reset();
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
        <Button size="sm">
          <Plus size={16} aria-hidden /> Add task
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle>Add task</DialogTitle>
          </DialogHeader>

          <Stack gap={4} className="py-4">
            <Field label="Title" required>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What needs to be done?"
                required
                autoFocus
              />
            </Field>
            <Field label="Description">
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Priority">
                <Select
                  value={priority}
                  onValueChange={(v) => setPriority(v as TaskPriority)}
                >
                  <SelectTrigger aria-label="Priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TASK_PRIORITIES.map((p) => (
                      <SelectItem key={p} value={p}>
                        {PRIORITY_LABELS[p]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Assignee">
                <Select value={assigneeId} onValueChange={setAssigneeId}>
                  <SelectTrigger aria-label="Assignee">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={UNASSIGNED}>Unassigned</SelectItem>
                    {members.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>
            <Field label="Due date">
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </Field>
          </Stack>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="ghost">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" loading={loading} disabled={!title}>
              Add task
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
