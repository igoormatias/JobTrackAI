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
import { PIPELINE_COLUMN_CONFIG } from "@/features/pipeline/constants/pipeline-columns";
import type { JobPriority, PipelineStage } from "@/types";

import type { TrackingDetail, UpdateProcessPayload } from "@/features/tracking/services/tracking-service";

const processFormSchema = z.object({
  stage: z.string(),
  notes: z.string().optional(),
  feedback: z.string().optional(),
  priority: z.enum(["HIGH", "MEDIUM", "LOW"]),
  isFavorite: z.boolean(),
  recruiterName: z.string().optional(),
  recruiterEmail: z.string().optional(),
  recruiterPhone: z.string().optional(),
  recruiterLinkedin: z.string().optional(),
  tags: z.string().optional(),
  negotiatedSalary: z.string().optional(),
  processLinkLabel: z.string().optional(),
  processLinkUrl: z.string().optional(),
});

type ProcessFormValues = z.infer<typeof processFormSchema>;

export type EditProcessModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tracking: TrackingDetail;
  isSubmitting?: boolean;
  onSubmit: (payload: UpdateProcessPayload) => void;
  onStageChange?: (stage: PipelineStage) => void;
};

const toFormValues = (tracking: TrackingDetail): ProcessFormValues => {
  const firstLink = tracking.processLinks
    ? Object.entries(tracking.processLinks)[0]
    : undefined;

  return {
    stage: tracking.stage,
    notes: tracking.notes ?? "",
    feedback: tracking.feedback ?? "",
    priority: tracking.priority,
    isFavorite: tracking.isFavorite,
    recruiterName: tracking.recruiterName ?? "",
    recruiterEmail: tracking.recruiterEmail ?? "",
    recruiterPhone: tracking.recruiterPhone ?? "",
    recruiterLinkedin: tracking.recruiterLinkedin ?? "",
    tags: tracking.tags?.join(", ") ?? "",
    negotiatedSalary: tracking.negotiatedSalary?.toString() ?? "",
    processLinkLabel: firstLink?.[0] ?? "",
    processLinkUrl: typeof firstLink?.[1] === "string" ? firstLink[1] : "",
  };
};

export const EditProcessModal = ({
  open,
  onOpenChange,
  tracking,
  isSubmitting = false,
  onSubmit,
  onStageChange,
}: EditProcessModalProps) => {
  const form = useForm<ProcessFormValues>({
    resolver: zodResolver(processFormSchema),
    defaultValues: toFormValues(tracking),
  });

  useEffect(() => {
    if (open) form.reset(toFormValues(tracking));
  }, [open, tracking, form]);

  const handleSubmit = form.handleSubmit((values) => {
    const processLinks =
      values.processLinkLabel && values.processLinkUrl
        ? { [values.processLinkLabel]: values.processLinkUrl }
        : null;

    if (values.stage !== tracking.stage) {
      onStageChange?.(values.stage as PipelineStage);
    }

    onSubmit({
      notes: values.notes || null,
      feedback: values.feedback || null,
      priority: values.priority as JobPriority,
      isFavorite: values.isFavorite,
      recruiterName: values.recruiterName || null,
      recruiterEmail: values.recruiterEmail || null,
      recruiterPhone: values.recruiterPhone || null,
      recruiterLinkedin: values.recruiterLinkedin || null,
      tags: values.tags
        ? values.tags.split(",").map((tag) => tag.trim()).filter(Boolean)
        : undefined,
      negotiatedSalary: values.negotiatedSalary ? Number(values.negotiatedSalary) : null,
      processLinks,
    });
  });

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <ModalHeader>
          <ModalTitle>Editar processo</ModalTitle>
        </ModalHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Status do processo</Label>
            <Select
              value={form.watch("stage")}
              onValueChange={(value) => form.setValue("stage", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PIPELINE_COLUMN_CONFIG.map((column) => (
                  <SelectItem key={column.stage} value={column.stage}>
                    {column.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea id="notes" rows={3} {...form.register("notes")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="feedback">Feedback</Label>
            <Textarea id="feedback" rows={2} {...form.register("feedback")} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Prioridade</Label>
              <Select
                value={form.watch("priority")}
                onValueChange={(value) => form.setValue("priority", value as ProcessFormValues["priority"])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="HIGH">Alta</SelectItem>
                  <SelectItem value="MEDIUM">Média</SelectItem>
                  <SelectItem value="LOW">Baixa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end gap-2 pb-2">
              <input
                id="isFavorite"
                type="checkbox"
                className="h-4 w-4"
                checked={form.watch("isFavorite")}
                onChange={(event) => form.setValue("isFavorite", event.target.checked)}
              />
              <Label htmlFor="isFavorite">Favorita</Label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="recruiterName">Recrutador(a)</Label>
            <Input id="recruiterName" {...form.register("recruiterName")} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="recruiterEmail">E-mail</Label>
              <Input id="recruiterEmail" type="email" {...form.register("recruiterEmail")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="recruiterPhone">Telefone</Label>
              <Input id="recruiterPhone" {...form.register("recruiterPhone")} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="recruiterLinkedin">LinkedIn do recrutador(a)</Label>
            <Input id="recruiterLinkedin" type="url" {...form.register("recruiterLinkedin")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags (separadas por vírgula)</Label>
            <Input id="tags" placeholder="Ex: remoto, sênior" {...form.register("tags")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="negotiatedSalary">Valor da oferta / salário negociado (R$)</Label>
            <Input id="negotiatedSalary" type="number" {...form.register("negotiatedSalary")} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="processLinkLabel">Link — rótulo</Label>
              <Input id="processLinkLabel" placeholder="Ex: Teste técnico" {...form.register("processLinkLabel")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="processLinkUrl">Link — URL</Label>
              <Input id="processLinkUrl" type="url" {...form.register("processLinkUrl")} />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Salvando…" : "Salvar"}
            </Button>
          </div>
        </form>
      </ModalContent>
    </Modal>
  );
};
