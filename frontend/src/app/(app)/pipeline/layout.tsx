import { ContainerSizeProvider } from "@/components/layout/ContainerSizeContext";

export default function PipelineLayout({ children }: { children: React.ReactNode }) {
  return <ContainerSizeProvider size="full">{children}</ContainerSizeProvider>;
}
