"use client";

import {
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { useCallback, useEffect, useMemo, useState } from "react";

import { normalizeSkills, searchSkillsCatalog } from "@/features/ai/services/skills-service";

import type { SkillsSelectorOption, SkillsSelectorProps } from "../../SkillsSelector.types";
import { parsePastedSkills, skillDedupeKey } from "../../skills-selector.utils";

const DUPLICATE_MESSAGE = "Essa competência já foi adicionada.";

export type UseSkillsSelectorParams = Pick<SkillsSelectorProps, "value" | "onChange"> &
  Partial<
    Pick<
      SkillsSelectorProps,
      "options" | "useApiSuggestions" | "normalizeOnAdd" | "sortable" | "filterThreshold" | "id"
    >
  >;

export const useSkillsSelector = ({
  value,
  onChange,
  options = [],
  useApiSuggestions = true,
  normalizeOnAdd = true,
  sortable = true,
  filterThreshold = 12,
  id,
}: UseSkillsSelectorParams) => {
  const fieldId = id ?? "skills-selector";
  const [input, setInput] = useState("");
  const [duplicateMessage, setDuplicateMessage] = useState<string | null>(null);
  const [apiSuggestions, setApiSuggestions] = useState<SkillsSelectorOption[]>([]);
  const [listFilter, setListFilter] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const existingKeys = useMemo(() => new Set(value.map(skillDedupeKey)), [value]);
  const existingKeysKey = useMemo(() => value.map(skillDedupeKey).sort().join("\0"), [value]);

  const staticSuggestions = useMemo(() => {
    const query = input.trim().toLowerCase();
    if (!query) return [];
    return options
      .filter((opt) => !existingKeys.has(skillDedupeKey(opt.value)))
      .filter((opt) => opt.label.toLowerCase().includes(query) || opt.value.toLowerCase().includes(query))
      .slice(0, 8);
  }, [options, input, existingKeys]);

  const suggestions = useApiSuggestions && options.length === 0 ? apiSuggestions : staticSuggestions;

  useEffect(() => {
    if (!useApiSuggestions || options.length > 0) return;
    const query = input.trim();
    if (query.length < 2) {
      setApiSuggestions((current) => (current.length === 0 ? current : []));
      return;
    }

    const timer = setTimeout(() => {
      void searchSkillsCatalog(query, 8).then((items) => {
        setApiSuggestions(
          items
            .filter((item) => !existingKeys.has(skillDedupeKey(item.name)))
            .map((item) => ({ value: item.name, label: item.name })),
        );
      });
    }, 200);

    return () => clearTimeout(timer);
    // existingKeys is a fresh Set each render; existingKeysKey is its stable signature to avoid an infinite loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input, useApiSuggestions, options.length, existingKeysKey]);

  const addSkill = useCallback(
    async (raw: string) => {
      const trimmed = raw.trim();
      if (!trimmed) return;

      const key = skillDedupeKey(trimmed);
      if (existingKeys.has(key)) {
        setDuplicateMessage(DUPLICATE_MESSAGE);
        return;
      }

      setDuplicateMessage(null);

      let skillName = trimmed;
      if (normalizeOnAdd) {
        try {
          const normalized = await normalizeSkills([trimmed]);
          skillName = normalized[0]?.name ?? trimmed;
        } catch {
          skillName = trimmed;
        }
      }

      if (existingKeys.has(skillDedupeKey(skillName))) {
        setDuplicateMessage(DUPLICATE_MESSAGE);
        return;
      }

      onChange([...value, skillName]);
      setInput("");
      setActiveIndex(-1);
    },
    [existingKeys, normalizeOnAdd, onChange, value],
  );

  const addMany = useCallback(
    async (skills: string[]) => {
      const toAdd: string[] = [];
      for (const skill of skills) {
        const key = skillDedupeKey(skill);
        if (!key || existingKeys.has(key) || toAdd.some((s) => skillDedupeKey(s) === key)) continue;
        toAdd.push(skill);
      }
      if (toAdd.length === 0) {
        setDuplicateMessage(DUPLICATE_MESSAGE);
        return;
      }

      let names = toAdd;
      if (normalizeOnAdd) {
        try {
          const normalized = await normalizeSkills(toAdd);
          names = normalized.map((item) => item.name);
        } catch {
          names = toAdd;
        }
      }

      const merged = [...value];
      const mergedKeys = new Set(merged.map(skillDedupeKey));
      for (const name of names) {
        const key = skillDedupeKey(name);
        if (!mergedKeys.has(key)) {
          merged.push(name);
          mergedKeys.add(key);
        }
      }
      onChange(merged);
      setInput("");
    },
    [existingKeys, normalizeOnAdd, onChange, value],
  );

  const handleInputChange = useCallback((nextValue: string) => {
    setInput(nextValue);
    setDuplicateMessage(null);
    setActiveIndex(-1);
  }, []);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter") {
        event.preventDefault();
        if (activeIndex >= 0 && suggestions[activeIndex]) {
          void addSkill(suggestions[activeIndex].label);
          return;
        }
        void addSkill(input);
      } else if (event.key === "ArrowDown") {
        event.preventDefault();
        setActiveIndex((prev) => Math.min(prev + 1, suggestions.length - 1));
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        setActiveIndex((prev) => Math.max(prev - 1, 0));
      } else if (event.key === "Escape") {
        setActiveIndex(-1);
      }
    },
    [activeIndex, addSkill, input, suggestions],
  );

  const handlePaste = useCallback(
    (event: React.ClipboardEvent<HTMLInputElement>) => {
      const text = event.clipboardData.getData("text");
      if (!text.includes(",") && !text.includes(";") && !text.includes("\n")) return;
      event.preventDefault();
      void addMany(parsePastedSkills(text));
    },
    [addMany],
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;
      const oldIndex = value.indexOf(String(active.id));
      const newIndex = value.indexOf(String(over.id));
      if (oldIndex < 0 || newIndex < 0) return;
      onChange(arrayMove(value, oldIndex, newIndex));
    },
    [onChange, value],
  );

  const removeSkill = useCallback(
    (skill: string) => {
      onChange(value.filter((item) => item !== skill));
    },
    [onChange, value],
  );

  const filteredSkills = useMemo(() => {
    const query = listFilter.trim().toLowerCase();
    if (!query || value.length < filterThreshold) return value;
    return value.filter((skill) => skill.toLowerCase().includes(query));
  }, [value, listFilter, filterThreshold]);

  const enableSortable = sortable && value.length > 1;
  const showListFilter = value.length >= filterThreshold;

  return {
    fieldId,
    input,
    duplicateMessage,
    suggestions,
    activeIndex,
    listFilter,
    setListFilter,
    filteredSkills,
    showListFilter,
    enableSortable,
    sensors,
    addSkill,
    handleInputChange,
    handleKeyDown,
    handlePaste,
    handleDragEnd,
    removeSkill,
  };
};
