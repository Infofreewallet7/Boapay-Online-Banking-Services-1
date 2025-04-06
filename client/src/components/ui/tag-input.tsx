import { useState, useRef, KeyboardEvent } from "react";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface Tag {
  id: string;
  text: string;
}

interface TagInputProps {
  placeholder?: string;
  tags: Tag[];
  setTags: (tags: Tag[]) => void;
  id?: string;
  className?: string;
  disabled?: boolean;
  maxTags?: number;
}

export function TagInput({
  placeholder = "Add tag...",
  tags,
  setTags,
  id,
  className,
  disabled = false,
  maxTags = 10,
}: TagInputProps) {
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue.trim() && tags.length < maxTags) {
      e.preventDefault();
      const trimmedValue = inputValue.trim();
      // Only add if not already in the list
      if (!tags.some((tag) => tag.text.toLowerCase() === trimmedValue.toLowerCase())) {
        const newTag = { id: trimmedValue, text: trimmedValue };
        setTags([...tags, newTag]);
        setInputValue("");
      }
    } else if (e.key === "Backspace" && !inputValue && tags.length > 0) {
      e.preventDefault();
      // Remove last tag
      const newTags = [...tags];
      newTags.pop();
      setTags(newTags);
    }
  };

  const removeTag = (id: string) => {
    const newTags = tags.filter((tag) => tag.id !== id);
    setTags(newTags);
  };

  const handleContainerClick = () => {
    inputRef.current?.focus();
  };

  return (
    <div
      className={cn(
        "flex flex-wrap gap-2 border rounded-md p-1 focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-ring",
        { "bg-muted cursor-not-allowed": disabled },
        className
      )}
      onClick={handleContainerClick}
    >
      {tags.map((tag) => (
        <Badge key={tag.id} variant="secondary" className="flex items-center gap-1">
          {tag.text}
          {!disabled && (
            <X
              className="h-3 w-3 cursor-pointer opacity-70 hover:opacity-100 transition-opacity"
              onClick={() => removeTag(tag.id)}
            />
          )}
        </Badge>
      ))}
      <Input
        ref={inputRef}
        id={id}
        type="text"
        placeholder={tags.length < maxTags ? placeholder : `Max ${maxTags} tags reached`}
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        className="flex-1 border-0 p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
        disabled={disabled || tags.length >= maxTags}
      />
    </div>
  );
}