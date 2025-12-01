import React, { useState } from "react";

import { EyeClosedIcon, EyeIcon } from "lucide-react";
import { Input } from "./input";
import { cn } from "@/lib/utils";

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  showPassword?: boolean;
  toggleVisibility?: () => void;
}

const PasswordInput = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, showPassword, toggleVisibility, ...props }, ref) => {
    const [show, setShow] = useState(false);

    const toggle = () => {
      if (toggleVisibility) {
        toggleVisibility();
        return;
      }
      setShow((s) => !s);
    };

    return (
      <div className="pwd-wrapper relative">
        <Input
          {...props}
          className={cn("pr-12", className)}
          ref={ref}
          type={showPassword || show ? "text" : "password"}
        />

        <button
          type="button"
          className="center p-1 absolute text-foreground z-10 right-2 top-1/2 -translate-y-1/2 "
          onClick={toggle}
          aria-label="Toggle visibility"
        >
          {show ? (
            <EyeClosedIcon className="w-5 h-5" />
          ) : (
            <EyeIcon className="w-5 h-5" />
          )}
        </button>
      </div>
    );
  }
);
PasswordInput.displayName = "PasswordInput";

export { PasswordInput };
