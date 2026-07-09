"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { SkillsSelector } from "@/components/data-display/SkillsSelector";
import { Button } from "@/components/ui/Button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/Drawer";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { Textarea } from "@/components/ui/Textarea";
import { PIPELINE_COLUMN_CONFIG } from "@/features/pipeline/constants/pipeline-columns";
import { PipelineApplicationTimeline } from "@/features/pipeline/components/PipelineApplicationTimeline";
import { useIsDesktop } from "@/hooks/use-breakpoint";
import type { JobPriority, PipelineStage, TimelineEvent } from "@/types";

import type { TrackingDetail, UpdateProcessPayload } from "@/features/tracking/services/tracking-service";

const processFormSchema = z.object({
  companyName: z.string().min(1, "Informe a empresa"),
  title: z.string().min(1, "Informe o cargo"),
  sourceUrl: z.string().optional(),
  description: z.string().optional(),
  stage: z.string(),
  notes: z.string().optional(),
  feedback: z.string().optional(),
  priority: z.enum(["HIGH", "MEDIUM", "LOW"]),
  isFavorite: z.boolean(),
  recruiterName: z.string().optional(),
  recruiterEmail: z.string().optional(),
  recruiterPhone: z.string().optional(),
  recruiterLinkedin: z.string().optional(),
  tags: z.array(z.string()).optional(),
  negotiatedSalary: z.string().optional(),
  salaryExpectationMin: z.string().optional(),
  salaryExpectationMax: z.string().optional(),
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
    companyName: tracking.job.company.name,
    title: tracking.job.title,
    sourceUrl: tracking.job.sourceUrl ?? "",
    description: tracking.job.description ?? "",
    stage: tracking.stage,
    notes: tracking.notes ?? "",
    feedback: tracking.feedback ?? "",
    priority: tracking.priority,
    isFavorite: tracking.isFavorite,
    recruiterName: tracking.recruiterName ?? "",
    recruiterEmail: tracking.recruiterEmail ?? "",
    recruiterPhone: tracking.recruiterPhone ?? "",
    recruiterLinkedin: tracking.recruiterLinkedin ?? "",
    tags: tracking.tags ?? [],
    negotiatedSalary: tracking.negotiatedSalary?.toString() ?? "",
    salaryExpectationMin: tracking.salaryExpectation?.min?.toString() ?? "",
    salaryExpectationMax: tracking.salaryExpectation?.max?.toString() ?? "",
    processLinkLabel: firstLink?.[0] ?? "",
    processLinkUrl: typeof firstLink?.[1] === "string" ? firstLink[1] : "",
  };
};

const mapTimeline = (tracking: TrackingDetail): TimelineEvent[] =>
  (tracking.timeline ?? []).map((event) => ({
    id: event.id,
    applicationId: tracking.id,
    type: event.type,
    title: event.title,
    description: event.description ?? null,
    metadata: event.metadata ?? {},
    occurredAt: event.occurredAt,
  }));

export const EditProcessModal = ({
  open,
  onOpenChange,
  tracking,
  isSubmitting = false,
  onSubmit,
  onStageChange,
}: EditProcessModalProps) => {
  const isDesktop = useIsDesktop();

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
      companyName: values.companyName,
      title: values.title,
      sourceUrl: values.sourceUrl || null,
      description: values.description || null,
      notes: values.notes || null,
      feedback: values.feedback || null,
      priority: values.priority as JobPriority,
      isFavorite: values.isFavorite,
      recruiterName: values.recruiterName || null,
      recruiterEmail: values.recruiterEmail || null,
      recruiterPhone: values.recruiterPhone || null,
      recruiterLinkedin: values.recruiterLinkedin || null,
      tags: values.tags?.length ? values.tags : undefined,
      negotiatedSalary: values.negotiatedSalary ? Number(values.negotiatedSalary) : null,
      salaryExpectation:
        values.salaryExpectationMin || values.salaryExpectationMax
          ? {
              min: values.salaryExpectationMin ? Number(values.salaryExpectationMin) : 0,
              max: values.salaryExpectationMax ? Number(values.salaryExpectationMax) : 0,
              currency: "BRL" as const,
            }
          : null,
      processLinks,
    });
  });

  const timeline = mapTimeline(tracking);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={isDesktop ? "right" : "bottom"}
        className={
          isDesktop
            ? "flex h-full w-full max-w-2xl flex-col overflow-hidden p-0"
            : "flex max-h-[92dvh] flex-col overflow-hidden rounded-t-xl p-0"
        }
      >
        <SheetHeader className="shrink-0 border-b border-border px-6 py-4">
          <SheetTitle>Editar processo</SheetTitle>
          <SheetDescription>
            {tracking.job.title} · {tracking.job.company.name}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <Tabs defaultValue="dados" className="flex min-h-0 flex-1 flex-col px-6 pt-4">
            <TabsList className="mb-4 h-auto w-full flex-wrap justify-start gap-1">
              <TabsTrigger value="dados">Dados</TabsTrigger>
              <TabsTrigger value="descricao">Descrição</TabsTrigger>
              <TabsTrigger value="recrutador">Recrutador</TabsTrigger>
              <TabsTrigger value="observacoes">Observações</TabsTrigger>
              <TabsTrigger value="historico">Histórico</TabsTrigger>
            </TabsList>

            <div className="min-h-0 flex-1 overflow-y-auto pb-4">
              <TabsContent value="dados" className="mt-0 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Empresa</Label>
                  <Input id="companyName" {...form.register("companyName")} />
                  {form.formState.errors.companyName ? (
                    <p className="text-xs text-destructive">{form.formState.errors.companyName.message}</p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Nome da vaga</Label>
                  <Input id="title" {...form.register("title")} />
                  {form.formState.errors.title ? (
                    <p className="text-xs text-destructive">{form.formState.errors.title.message}</p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sourceUrl">URL da vaga</Label>
                  <Input id="sourceUrl" type="url" placeholder="https://..." {...form.register("sourceUrl")} />
                </div>

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

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Prioridade</Label>
                    <Select
                      value={form.watch("priority")}
                      onValueChange={(value) =>
                        form.setValue("priority", value as ProcessFormValues["priority"])
                      }
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
              </TabsContent>

              <TabsContent value="descricao" className="mt-0 space-y-2">
                <Label htmlFor="description">Descrição completa</Label>
                <Textarea
                  id="description"
                  rows={14}
                  className="min-h-[280px] resize-y"
                  placeholder="Cole ou edite a descrição da vaga para melhorar o match e a análise de IA..."
                  {...form.register("description")}
                />
                <p className="text-xs text-muted-foreground">
                  Vagas importadas podem estar incompletas — complemente aqui para melhorar match e IA.
                </p>
              </TabsContent>

              <TabsContent value="recrutador" className="mt-0 space-y-4">
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
              </TabsContent>

              <TabsContent value="observacoes" className="mt-0 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="notes">Observações</Label>
                  <Textarea id="notes" rows={4} {...form.register("notes")} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="feedback">Feedback</Label>
                  <Textarea id="feedback" rows={3} {...form.register("feedback")} />
                </div>

                <SkillsSelector
                  id="tags"
                  label="Tags"
                  placeholder="Ex.: remoto, sênior..."
                  value={form.watch("tags") ?? []}
                  onChange={(tags) => form.setValue("tags", tags, { shouldDirty: true })}
                  normalizeOnAdd={false}
                  sortable={false}
                />

                <div className="space-y-2">
                  <Label htmlFor="negotiatedSalary">Valor da oferta / salário negociado (R$)</Label>
                  <Input id="negotiatedSalary" type="number" {...form.register("negotiatedSalary")} />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="salaryExpectationMin">Pretensão salarial — mínimo (R$)</Label>
                    <Input id="salaryExpectationMin" type="number" {...form.register("salaryExpectationMin")} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="salaryExpectationMax">Pretensão salarial — máximo (R$)</Label>
                    <Input id="salaryExpectationMax" type="number" {...form.register("salaryExpectationMax")} />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="processLinkLabel">Link — rótulo</Label>
                    <Input
                      id="processLinkLabel"
                      placeholder="Ex: Teste técnico"
                      {...form.register("processLinkLabel")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="processLinkUrl">Link — URL</Label>
                    <Input id="processLinkUrl" type="url" {...form.register("processLinkUrl")} />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="historico" className="mt-0">
                <PipelineApplicationTimeline
                  events={timeline}
                  currentStage={tracking.stage}
                  variant="embedded"
                />
              </TabsContent>
            </div>
          </Tabs>

          <div className="flex shrink-0 justify-end gap-2 border-t border-border bg-background px-6 py-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Salvando…" : "Salvar"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
};
