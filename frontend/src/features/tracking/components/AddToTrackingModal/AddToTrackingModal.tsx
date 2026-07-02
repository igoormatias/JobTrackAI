"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import type { Job } from "@/types";

import { JOB_SOURCE_OPTIONS, PIPELINE_STAGE_OPTIONS } from "../../constants/tracking-constants";

const trackingFormSchema = z.object({
  companyName: z.string().min(1),
  title: z.string().min(1),
  sourceUrl: z.string().optional(),
  description: z.string().optional(),
  source: z.string().min(1),
  stage: z.string().min(1),
  stageOccurredAt: z.string().min(1),
  notes: z.string().optional(),
});

type TrackingFormValues = z.infer<typeof trackingFormSchema>;

export type AddToTrackingModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "fromJob" | "manual";
  job?: Job | null;
  isSubmitting?: boolean;
  onSubmit: (values: Record<string, unknown>) => void;
};

export const AddToTrackingModal = ({
  open,
  onOpenChange,
  mode,
  job,
  isSubmitting = false,
  onSubmit,
}: AddToTrackingModalProps) => {
  const isManual = mode === "manual";

  const form = useForm<TrackingFormValues>({
    resolver: zodResolver(trackingFormSchema),
    defaultValues: {
      companyName: "",
      title: "",
      sourceUrl: "",
      description: "",
      source: "manual",
      stage: "applied",
      stageOccurredAt: new Date().toISOString().slice(0, 16),
      notes: "",
    },
  });

  useEffect(() => {
    if (!open) return;
    form.reset({
      companyName: job?.company.name ?? "",
      title: job?.title ?? "",
      sourceUrl: job?.sourceUrl ?? "",
      description: job?.description ?? "",
      source: job?.source ?? "manual",
      stage: "applied",
      stageOccurredAt: new Date().toISOString().slice(0, 16),
      notes: "",
    });
  }, [open, job, form]);

  const submit = form.handleSubmit((values) => {
    const occurredAt = new Date(values.stageOccurredAt).toISOString();

    if (isManual) {
      onSubmit({
        job: {
          companyName: values.companyName,
          title: values.title,
          sourceUrl: values.sourceUrl || null,
          description: values.description || null,
          source: values.source,
        },
        stage: values.stage,
        stageOccurredAt: occurredAt,
        notes: values.notes || null,
      });
      return;
    }

    onSubmit({
      jobId: job?.id,
      stage: values.stage,
      stageOccurredAt: occurredAt,
      notes: values.notes || null,
    });
  });

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>{isManual ? "Adicionar processo" : "Adicionar ao Pipeline"}</ModalTitle>
        </ModalHeader>
        <form className="space-y-4" onSubmit={submit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="tracking-company">Empresa</Label>
              <Input id="tracking-company" disabled={!isManual} {...form.register("companyName")} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="tracking-title">Cargo</Label>
              <Input id="tracking-title" disabled={!isManual} {...form.register("title")} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="tracking-url">URL da vaga</Label>
              <Input id="tracking-url" disabled={!isManual} {...form.register("sourceUrl")} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="tracking-description">Descrição</Label>
              <Textarea id="tracking-description" disabled={!isManual} rows={3} {...form.register("description")} />
            </div>
            <div className="space-y-2">
              <Label>Origem</Label>
              <Select
                disabled={!isManual}
                value={form.watch("source")}
                onValueChange={(value) => form.setValue("source", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Origem" />
                </SelectTrigger>
                <SelectContent>
                  {JOB_SOURCE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status atual</Label>
              <Select value={form.watch("stage")} onValueChange={(value) => form.setValue("stage", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {PIPELINE_STAGE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="tracking-date">Data do status atual</Label>
              <Input id="tracking-date" type="datetime-local" {...form.register("stageOccurredAt")} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="tracking-notes">Observações</Label>
              <Textarea id="tracking-notes" rows={3} {...form.register("notes")} />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </form>
      </ModalContent>
    </Modal>
  );
};
