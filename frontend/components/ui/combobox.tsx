"use client";

import React from "react";
import get from "lodash/get";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronDownIcon } from "lucide-react";

export interface ComboboxProps<T> {
  items: T[];
  labelKey: string;
  valueKey: string;
  onItemSelected: (item: T | undefined) => void;
  emptyValConfig?: {
    label: React.ReactNode;
    value: any;
  };
  placeholder?: string;
  buttonClassName?: string;
  buttonPlaceholder?: string;
  disabled?: boolean;
  selectedValue?: string | number | boolean;
  renderContent?: (isOpen: boolean, selectedItem?: T) => React.ReactNode;
  //Helps with interaction when within a modal/dialog
  isModal?: boolean;
}

const getLabel = <T,>(item: T, labelKey: string) =>
  get(item, labelKey)?.toString();
const getValue = <T,>(item: T, valueKey: string) => get(item, valueKey);

const Combobox = <T,>({
  items = [],
  labelKey,
  valueKey,
  onItemSelected,
  emptyValConfig,
  placeholder = "Search...",
  buttonClassName = "",
  buttonPlaceholder = "Select an option",
  selectedValue,
  disabled = false,
  renderContent,
  isModal = false,
}: ComboboxProps<T>) => {
  const [open, setOpen] = React.useState(false);

  const selectedItem = React.useMemo(
    () =>
      items.find(
        (item) => String(getValue(item, valueKey)) === String(selectedValue)
      ) ?? null,
    [items, selectedValue, valueKey]
  );

  const handleSelect = (item: T) => {
    const isSelected =
      selectedItem &&
      String(getValue(selectedItem, valueKey)) ===
        String(getValue(item, valueKey));
    const newItem = isSelected ? undefined : item;
    setOpen(false);
    onItemSelected(newItem);
  };

  const handleSelectEmpty = () => {
    setOpen(false);
    onItemSelected(undefined);
  };

  return (
    <Popover modal={isModal} open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "btwn! gap-2 shadow-none!",

            buttonClassName
          )}
        >
          {renderContent ? (
            renderContent(open, selectedItem ?? undefined)
          ) : (
            <>
              {selectedItem
                ? getLabel(selectedItem, labelKey)
                : buttonPlaceholder}
              <ChevronDownIcon className="h-4 w-4 shrink-0 opacity-50" />
            </>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="p-0 w-(--radix-popover-trigger-width)"
        style={{ zIndex: 100000 }}
        align="start"
      >
        <Command>
          <CommandInput placeholder={placeholder} />
          <CommandList>
            <CommandEmpty>No items found.</CommandEmpty>
            <CommandGroup>
              {emptyValConfig && (
                <CommandItem onSelect={handleSelectEmpty}>
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedItem === null ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {emptyValConfig.label}
                </CommandItem>
              )}

              {items.map((item) => {
                const value = getValue(item, valueKey);
                const label = getLabel(item, labelKey);
                const isSelected =
                  selectedItem &&
                  String(getValue(selectedItem, valueKey)) === String(value);

                return (
                  <CommandItem
                    key={String(value)}
                    value={String(label)}
                    onSelect={() => handleSelect(item)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        isSelected ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {label}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default React.memo(Combobox);
