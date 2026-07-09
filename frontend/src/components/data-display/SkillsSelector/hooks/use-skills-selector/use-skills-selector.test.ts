import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { mockNormalizeSkills, mockSearchSkillsCatalog } = vi.hoisted(() => ({
  mockNormalizeSkills: vi.fn(),
  mockSearchSkillsCatalog: vi.fn(),
}));

vi.mock("@dnd-kit/core", () => ({
  KeyboardSensor: class KeyboardSensor {},
  PointerSensor: class PointerSensor {},
  useSensor: vi.fn(() => ({})),
  useSensors: vi.fn(() => []),
}));

vi.mock("@dnd-kit/sortable", () => ({
  arrayMove: <T,>(array: T[], from: number, to: number) => {
    const next = [...array];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    return next;
  },
  sortableKeyboardCoordinates: vi.fn(),
}));

vi.mock("@/features/ai/services/skills-service", () => ({
  normalizeSkills: (...args: unknown[]) => mockNormalizeSkills(...args),
  searchSkillsCatalog: (...args: unknown[]) => mockSearchSkillsCatalog(...args),
}));

import { useSkillsSelector } from "./use-skills-selector";

describe("useSkillsSelector", () => {
  beforeEach(() => {
    mockNormalizeSkills.mockReset();
    mockSearchSkillsCatalog.mockReset();
    mockNormalizeSkills.mockImplementation(async (skills: string[]) =>
      skills.map((skill) => ({ input: skill, name: skill, slug: skill.toLowerCase() })),
    );
    mockSearchSkillsCatalog.mockResolvedValue([]);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("addSkill rejects duplicate and sets duplicateMessage", async () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useSkillsSelector({
        value: ["React"],
        onChange,
        normalizeOnAdd: false,
      }),
    );

    await act(async () => {
      await result.current.addSkill("react");
    });

    expect(onChange).not.toHaveBeenCalled();
    expect(result.current.duplicateMessage).toBe("Essa competência já foi adicionada.");
  });

  it("addSkill with normalizeOnAdd false does not call normalize API", async () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useSkillsSelector({
        value: [],
        onChange,
        normalizeOnAdd: false,
      }),
    );

    await act(async () => {
      await result.current.addSkill("TypeScript");
    });

    expect(mockNormalizeSkills).not.toHaveBeenCalled();
    expect(onChange).toHaveBeenCalledWith(["TypeScript"]);
  });

  it("addSkill with normalizeOnAdd true calls normalize API", async () => {
    mockNormalizeSkills.mockResolvedValue([{ input: "react", name: "React", slug: "react" }]);
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useSkillsSelector({
        value: [],
        onChange,
        normalizeOnAdd: true,
      }),
    );

    await act(async () => {
      await result.current.addSkill("react");
    });

    expect(mockNormalizeSkills).toHaveBeenCalledWith(["react"]);
    expect(onChange).toHaveBeenCalledWith(["React"]);
  });

  it("handlePaste parses list and deduplicates via addMany", async () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useSkillsSelector({
        value: ["React"],
        onChange,
        normalizeOnAdd: false,
      }),
    );

    const preventDefault = vi.fn();
    const event = {
      clipboardData: { getData: () => "React, Node\nDocker;TypeScript" },
      preventDefault,
    } as unknown as React.ClipboardEvent<HTMLInputElement>;

    await act(async () => {
      result.current.handlePaste(event);
    });

    expect(preventDefault).toHaveBeenCalled();
    expect(onChange).toHaveBeenCalledWith(["React", "Node", "Docker", "TypeScript"]);
  });

  it("filteredSkills only filters when value.length >= filterThreshold", () => {
    const skills = Array.from({ length: 12 }, (_, i) => `Skill ${i + 1}`);
    const onChange = vi.fn();
    const { result, rerender } = renderHook(
      (props: { value: string[] }) =>
        useSkillsSelector({
          value: props.value,
          onChange,
          filterThreshold: 12,
        }),
      { initialProps: { value: skills } },
    );

    expect(result.current.showListFilter).toBe(true);
    expect(result.current.filteredSkills).toEqual(skills);

    act(() => {
      result.current.setListFilter("skill 1");
    });

    expect(result.current.filteredSkills).toEqual(["Skill 1", "Skill 10", "Skill 11", "Skill 12"]);

    rerender({ value: skills.slice(0, 11) });

    act(() => {
      result.current.setListFilter("skill 1");
    });

    expect(result.current.showListFilter).toBe(false);
    expect(result.current.filteredSkills).toEqual(skills.slice(0, 11));
  });

  it("static suggestions filter by options and existingKeys", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useSkillsSelector({
        value: ["React"],
        onChange,
        options: [
          { value: "react", label: "React" },
          { value: "node", label: "Node.js" },
          { value: "typescript", label: "TypeScript" },
        ],
        useApiSuggestions: false,
      }),
    );

    act(() => {
      result.current.handleInputChange("type");
    });

    expect(result.current.suggestions).toEqual([{ value: "typescript", label: "TypeScript" }]);
    expect(mockSearchSkillsCatalog).not.toHaveBeenCalled();
  });

  it("debounces API suggestions when useApiSuggestions is true and no options", async () => {
    vi.useFakeTimers();
    mockSearchSkillsCatalog.mockResolvedValue([
      { id: "1", name: "React", slug: "react" },
      { id: "2", name: "React Native", slug: "react-native" },
    ]);

    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useSkillsSelector({
        value: [],
        onChange,
        useApiSuggestions: true,
        options: [],
      }),
    );

    act(() => {
      result.current.handleInputChange("re");
    });

    expect(mockSearchSkillsCatalog).not.toHaveBeenCalled();

    await act(async () => {
      vi.advanceTimersByTime(200);
      await Promise.resolve();
    });

    expect(mockSearchSkillsCatalog).toHaveBeenCalledWith("re", 8);

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.suggestions).toEqual([
      { value: "React", label: "React" },
      { value: "React Native", label: "React Native" },
    ]);
  });

  it("removeSkill removes skill from value", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useSkillsSelector({
        value: ["React", "Node"],
        onChange,
      }),
    );

    act(() => {
      result.current.removeSkill("React");
    });

    expect(onChange).toHaveBeenCalledWith(["Node"]);
  });
});
