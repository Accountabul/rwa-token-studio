import React, { useState, KeyboardEvent } from "react";
import { X, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface WalletTagsInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  maxTags?: number;
}

const suggestedTags = [
  "production",
  "staging",
  "development",
  "high-priority",
  "audit-required",
  "compliance",
  "escrow-pool",
  "liquidity",
  "cold-storage",
  "hot-wallet",
  "multi-sig",
  "institutional",
];

export const WalletTagsInput: React.FC<WalletTagsInputProps> = ({
  tags,
  onChange,
  placeholder = "Add tag and press Enter",
  maxTags = 10,
}) => {
  const [inputValue, setInputValue] = useState("");

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim().toLowerCase();
    if (trimmedTag && !tags.includes(trimmedTag) && tags.length < maxTags) {
      onChange([...tags, trimmedTag]);
      setInputValue("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === "Backspace" && !inputValue && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  };

  const availableSuggestions = suggestedTags.filter(
    (tag) => !tags.includes(tag)
  );

  return (
    <div className="space-y-3">
      {/* Current Tags */}
      <div className="flex flex-wrap gap-1.5 min-h-[32px]">
        {tags.map((tag) => (
          <Badge
            key={tag}
            variant="secondary"
            className="pl-2 pr-1 py-1 text-xs flex items-center gap-1"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="ml-1 rounded-full p-0.5 hover:bg-destructive/20 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </Badge>
        ))}
        {tags.length === 0 && (
          <span className="text-xs text-muted-foreground italic">No tags added</span>
        )}
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1"
          disabled={tags.length >= maxTags}
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => addTag(inputValue)}
          disabled={!inputValue.trim() || tags.length >= maxTags}
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {/* Suggested Tags */}
      {availableSuggestions.length > 0 && tags.length < maxTags && (
        <div className="space-y-1.5">
          <span className="text-xs text-muted-foreground">Suggestions:</span>
          <div className="flex flex-wrap gap-1">
            {availableSuggestions.slice(0, 8).map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="text-[10px] cursor-pointer hover:bg-primary/10 transition-colors"
                onClick={() => addTag(tag)}
              >
                + {tag}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {tags.length >= maxTags && (
        <p className="text-xs text-muted-foreground">
          Maximum {maxTags} tags reached
        </p>
      )}
    </div>
  );
};
