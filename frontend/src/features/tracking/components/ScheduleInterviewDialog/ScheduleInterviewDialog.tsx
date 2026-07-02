"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
} from "@/components/ui/Modal";
import { Textarea } from "@/components/ui/Textarea";
import type { Application } from "@/types";

const scheduleInterviewSchema = z.object({
  scheduledAt: z.string().min(1, "Informe a data da entrevista"),
  link: z.string().url("Informe uma URL válida").optional().or(z.literal("")),
  notes: z.string().optional(),
});

type ScheduleInterviewFormValues = z.infer<typeof scheduleInterviewSchema>;

export type ScheduleInterviewDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  application: Application | null;
  isPending?: boolean;
  onSubmit: (values: { scheduledAt: string; link?: string | null; notes?: string | null }) => void;
};

export const ScheduleInterviewDialog = ({
  open,
  onOpenChange,
  application,
  isPending = false,
  onSubmit,
}: ScheduleInterviewDialogProps) => {
  const form = useForm<ScheduleInterviewFormValues>({
    resolver: zodResolver(scheduleInterviewSchema),
    defaultValues: {
      scheduledAt: new Date().toISOString().slice(0, 16),
      link: "",
      notes: "",
    },
  });

  const handleSubmit = form.handleSubmit((values) => {
    onSubmit({
      scheduledAt: new Date(values.scheduledAt).toISOString(),
      link: values.link?.trim() ? values.link.trim() : null,
      notes: values.notes?.trim() ? values.notes.trim() : null,
    });
  });

  return (
    <Modal
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) form.reset();
        onOpenChange(nextOpen);
      }}
    >
      <ModalContent>
        <ModalHeader>
          <ModalTitle>Agendar entrevista</ModalTitle>
        </ModalHeader>

        {application ? (
          <p className="text-sm text-muted-foreground">
            {application.job.title} · {application.job.company.name}
          </p>
        ) : null}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="interview-scheduled-at">Data e hora</Label>
            <Input
              id="interview-scheduled-at"
              type="datetime-local"
              {...form.register("scheduledAt")}
            />
            {form.formState.errors.scheduledAt ? (
              <p className="text-sm text-destructive">{form.formState.errors.scheduledAt.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="interview-link">Link da reunião (opcional)</Label>
            <Input id="interview-link" type="url" placeholder="https://..." {...form.register("link")} />
            {form.formState.errors.link ? (
              <p className="text-sm text-destructive">{form.formState.errors.link.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="interview-notes">Observações (opcional)</Label>
            <Textarea id="interview-notes" rows={3} {...form.register("notes")} />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending} isLoading={isPending}>
              Agendar
            </Button>
          </div>
        </form>
      </ModalContent>
    </Modal>
  );
};
