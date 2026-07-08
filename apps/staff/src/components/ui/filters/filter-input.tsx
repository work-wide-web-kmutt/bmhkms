import { AlertCircleIcon } from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

import { useFilterContext } from "./filter-context";
import { NON_EDITING_KEYS, validateInputValue } from "./filter-utils";
import type { FilterFieldConfig } from "./types";

export function FilterInput<T = unknown>({
  field,
  onBlur,
  onKeyDown,
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  className?: string;
  field?: FilterFieldConfig<T>;
}) {
  const context = useFilterContext();
  const [isValid, setIsValid] = useState(true);
  const [validationMessage, setValidationMessage] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!props.autoFocus) {
      return;
    }

    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 300);

    return () => clearTimeout(timer);
  }, [props.autoFocus]);

  function handleBlur(e: React.FocusEvent<HTMLInputElement>) {
    const { value } = e.target;
    const pattern = field?.pattern || props.pattern;

    if (value && (pattern || field?.validation)) {
      let valid = true;
      let customMessage = "";

      if (field?.validation) {
        const result = field.validation(value);
        if (typeof result === "boolean") {
          valid = result;
        } else {
          ({ valid } = result);
          customMessage = result.message || "";
        }
      } else if (pattern) {
        valid = validateInputValue(value, pattern);
      }

      setIsValid(valid);
      setValidationMessage(
        valid ? "" : customMessage || context.i18n.validation.invalid
      );
    } else {
      setIsValid(true);
      setValidationMessage("");
    }

    onBlur?.(e);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!isValid && !NON_EDITING_KEYS.has(e.key)) {
      setIsValid(true);
      setValidationMessage("");
    }

    onKeyDown?.(e);
  }

  return (
    <InputGroup
      className={cn(
        "w-36",
        context.size === "sm" && "h-7!",
        context.size === "default" && "h-8!",
        context.size === "lg" && "h-9!",
        className
      )}
    >
      {field?.prefix && (
        <InputGroupAddon>
          <InputGroupText>{field.prefix}</InputGroupText>
        </InputGroupAddon>
      )}
      <InputGroupInput
        ref={inputRef}
        aria-invalid={!isValid}
        aria-describedby={
          !isValid && validationMessage
            ? `${field?.key || "input"}-error`
            : undefined
        }
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={cn(
          context.size === "sm" && "h-7! text-xs",
          context.size === "default" && "h-8!",
          context.size === "lg" && "h-9!"
        )}
        {...props}
      />
      {!isValid && validationMessage && (
        <InputGroupAddon align="inline-end">
          <Tooltip>
            <TooltipTrigger render={<InputGroupButton size="icon-xs" />}>
              <AlertCircleIcon className="text-destructive size-3.5" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-sm">{validationMessage}</p>
            </TooltipContent>
          </Tooltip>
        </InputGroupAddon>
      )}
      {field?.suffix && (
        <InputGroupAddon align="inline-end">
          <InputGroupText>{field.suffix}</InputGroupText>
        </InputGroupAddon>
      )}
    </InputGroup>
  );
}
