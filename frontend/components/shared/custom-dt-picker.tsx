"use client";

import * as React from "react";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns/format";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { DayPicker } from "react-day-picker";

export type CalendarProps = Omit<
  React.ComponentProps<typeof DayPicker>,
  "onSelect" | "mode" | "selected" | "initialFocus"
>;
export interface DateTimePickerProps {
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
  className?: string;
  renderContent?: (isOpen: boolean, value?: Date) => React.ReactNode;
  showTime?: boolean;
  calendarProps?: CalendarProps;
  disabled?: boolean;
  showIcon?: boolean;
  dateTimeFormat?: string;
}

export const DateTimePicker: React.FC<DateTimePickerProps> = ({
  value,
  onChange,
  placeholder = "MM/DD/YYYY hh:mm aa",
  className = "",
  renderContent,
  showTime = true,
  disabled,
  calendarProps = {},
  showIcon = true,
  dateTimeFormat,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const fullCalendarProps = {
    startMonth: new Date(new Date().getFullYear() - 20, 0),
    endMonth: new Date(new Date().getFullYear() + 20, 11),
    ...calendarProps,
  };

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      const now = new Date();

      if (showTime && value) {
        selectedDate.setHours(value.getHours());
        selectedDate.setMinutes(value.getMinutes());
      } else {
        selectedDate.setHours(now.getHours());
        selectedDate.setMinutes(now.getMinutes());
      }

      onChange(selectedDate);
    }
  };

  const handleTimeChange = (
    type: "hour" | "minute" | "ampm",
    valueStr: string
  ) => {
    if (!value) return;

    const newDate = new Date(value);

    if (type === "hour") {
      const parsedHour = Number.parseInt(valueStr);
      const isPM = newDate.getHours() >= 12;
      newDate.setHours((parsedHour % 12) + (isPM ? 12 : 0));
    } else if (type === "minute") {
      newDate.setMinutes(Number.parseInt(valueStr));
    } else if (type === "ampm") {
      const currentHours = newDate.getHours();
      const isCurrentlyPM = currentHours >= 12;

      if (valueStr === "AM" && isCurrentlyPM) {
        newDate.setHours(currentHours - 12);
      } else if (valueStr === "PM" && !isCurrentlyPM) {
        newDate.setHours(currentHours + 12);
      }
    }

    onChange(newDate);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          disabled={disabled}
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground/50",
            className
          )}
        >
          {renderContent ? (
            renderContent(isOpen, value)
          ) : (
            <>
              <CalendarIcon
                className={cn("mr-2 h-4 w-4", { hidden: !showIcon })}
              />
              {value ? (
                (() => {
                  let formattedDate;
                  if (dateTimeFormat) {
                    formattedDate = format(value, dateTimeFormat);
                  } else {
                    formattedDate = format(
                      value,
                      showTime ? "MM/dd/yyyy hh:mm aa" : "MM/dd/yyyy"
                    );
                  }
                  return formattedDate;
                })()
              ) : (
                <span>{placeholder}</span>
              )}
            </>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-auto p-0">
        <div className={cn(showTime && "sm:flex")}>
          <Calendar
            mode="single"
            selected={value}
            onSelect={handleDateSelect}
            captionLayout="dropdown"
            {...fullCalendarProps}
          />

          {showTime && (
            <div className="flex flex-col sm:flex-row sm:h-[300px] divide-y sm:divide-y-0 sm:divide-x">
              <ScrollArea className="w-64 sm:w-auto">
                <div className="flex sm:flex-col p-2">
                  {hours
                    .slice()
                    .reverse()
                    .map((hour) => (
                      <Button
                        key={hour}
                        size="icon"
                        variant={
                          value && value.getHours() % 12 === hour % 12
                            ? "default"
                            : "ghost"
                        }
                        className="sm:w-full shrink-0 aspect-square"
                        onClick={() =>
                          handleTimeChange("hour", hour.toString())
                        }
                      >
                        {hour}
                      </Button>
                    ))}
                </div>
                <ScrollBar orientation="horizontal" className="sm:hidden" />
              </ScrollArea>

              <ScrollArea className="w-64 sm:w-auto">
                <div className="flex sm:flex-col p-2">
                  {Array.from({ length: 12 }, (_, i) => i * 5).map((minute) => (
                    <Button
                      key={minute}
                      size="icon"
                      variant={
                        value && value.getMinutes() === minute
                          ? "default"
                          : "ghost"
                      }
                      className="sm:w-full shrink-0 aspect-square"
                      onClick={() =>
                        handleTimeChange("minute", minute.toString())
                      }
                    >
                      {minute}
                    </Button>
                  ))}
                </div>
                <ScrollBar orientation="horizontal" className="sm:hidden" />
              </ScrollArea>

              <ScrollArea>
                <div className="flex sm:flex-col p-2">
                  {["AM", "PM"].map((ampm) => (
                    <Button
                      key={ampm}
                      size="icon"
                      variant={
                        value &&
                        ((ampm === "AM" && value.getHours() < 12) ||
                          (ampm === "PM" && value.getHours() >= 12))
                          ? "default"
                          : "ghost"
                      }
                      className="sm:w-full shrink-0 aspect-square"
                      onClick={() => handleTimeChange("ampm", ampm)}
                    >
                      {ampm}
                    </Button>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};
