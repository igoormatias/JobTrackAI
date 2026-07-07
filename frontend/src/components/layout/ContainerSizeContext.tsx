"use client";

import { createContext, useContext, type ReactNode } from "react";

import type { ContainerProps } from "./Container";

type ContainerSize = NonNullable<ContainerProps["size"]> | "full";

const ContainerSizeContext = createContext<ContainerSize>("default");

export const ContainerSizeProvider = ({
  size,
  children,
}: {
  size: ContainerSize;
  children: ReactNode;
}) => <ContainerSizeContext.Provider value={size}>{children}</ContainerSizeContext.Provider>;

export const useContainerSize = (): ContainerSize => useContext(ContainerSizeContext);
