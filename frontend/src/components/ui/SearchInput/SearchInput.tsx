"use client";

import { Search, X } from "lucide-react";
import { type ChangeEvent, useState } from "react";

import { Input, type InputProps } from "@/components/ui/Input";
import { cn } from "@/lib/utils";

export type SearchInputProps = Omit<InputProps, "type"> & {
  onClear?: () => void;
};

export const SearchInput = ({
  className,
  value: controlledValue,
  defaultValue,
  onChange,
  onClear,
  ...props
}: SearchInputProps) => {
  const [internalValue, setInternalValue] = useState(String(defaultValue ?? ""));
  const value = controlledValue !== undefined ? String(controlledValue) : internalValue;

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (controlledValue === undefined) {
      setInternalValue(event.target.value);
    }
    onChange?.(event);
  };

  const handleClear = () => {
    if (controlledValue === undefined) {
      setInternalValue("");
    }
    onClear?.();
  };

  return (
    <div className={cn("relative", className)}>
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        value={value}
        onChange={handleChange}
        className="pl-9 pr-9"
        {...props}
      />
      {value ? (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-muted-foreground hover:text-foreground"
          aria-label="Limpar busca"
        >
          <X className="h-4 w-4" />
        </button>
      ) : null}
    </div>
  );
};
