"use client"

import * as React from "react"
import { format } from "date-fns"
import { bn } from 'date-fns/locale'
import { Calendar as CalendarIcon } from "lucide-react"
import { DayPicker, DropdownProps } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea } from "./scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select"

type DatePickerProps = {
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
  triggerClassName?: string;
  placeholder?: string;
}

export function DatePicker({ value, onChange, triggerClassName, placeholder = "একটি তারিখ নির্বাচন করুন" }: DatePickerProps) {
  const [open, setOpen] = React.useState(false)
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(value)
  const [displayMonth, setDisplayMonth] = React.useState<Date>(value || new Date());

  React.useEffect(() => {
    // When the main value prop changes, update the internal state
    setSelectedDate(value)
    setDisplayMonth(value || new Date())
  }, [value])
  
  React.useEffect(() => {
    // When the popover opens, sync the internal state with the prop
    if (open) {
      setSelectedDate(value)
      setDisplayMonth(value || new Date())
    }
  }, [open, value])

  const handleSet = () => {
    onChange(selectedDate);
    setOpen(false);
  }
  
  const handleCancel = () => {
    setOpen(false);
  }

  const handleClear = () => {
    onChange(undefined);
    setOpen(false);
  }

  const headerDate = selectedDate;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground",
            triggerClassName
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? format(value, "PPP", { locale: bn }) : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <div className="bg-primary text-primary-foreground p-4 rounded-t-lg">
          <div className="text-sm">{headerDate ? format(headerDate, "yyyy", { locale: bn }) : 'বছর'}</div>
          <div className="text-2xl font-bold">{headerDate ? format(headerDate, "eeee, d MMMM", { locale: bn }) : 'তারিখ নির্বাচন করুন'}</div>
        </div>
        <div className="p-3">
            <DayPicker
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            month={displayMonth}
            onMonthChange={setDisplayMonth}
            locale={bn}
            captionLayout="dropdown-buttons"
            fromYear={1950}
            toYear={new Date().getFullYear() + 5}
            classNames={{
                caption: "flex items-center justify-center relative pt-1",
                caption_label: "hidden",
                caption_dropdowns: "flex gap-2 w-full justify-center",
                dropdown_month: "relative w-full",
                dropdown_year: "relative w-full",
                dropdown: "appearance-none w-full bg-background border border-input rounded-md px-3 py-1.5 text-sm",
                vhidden: "hidden",
                nav: "space-x-1 flex items-center",
                nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
                nav_button_previous: "absolute left-1",
                nav_button_next: "absolute right-1",
                table: "w-full border-collapse space-y-1 mt-4",
                head_row: "flex",
                head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
                row: "flex w-full mt-2",
                cell: "h-9 w-9 text-center text-sm p-0 relative focus-within:relative focus-within:z-20",
                day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100",
                day_selected: "bg-primary text-primary-foreground rounded-full hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                day_today: "bg-accent text-accent-foreground rounded-full",
                day_outside: "text-muted-foreground opacity-50",
                day_disabled: "text-muted-foreground opacity-50",
                day_hidden: "invisible",
            }}
            components={{
                Dropdown: ({ value, onChange, children }: DropdownProps) => {
                const options = React.Children.toArray(children) as React.ReactElement<React.HTMLProps<HTMLOptionElement>>[];
                const selected = options.find((child) => child.props.value === value);
                const handleChange = (newValue: string) => {
                    const event = {
                    target: { value: newValue },
                    } as React.ChangeEvent<HTMLSelectElement>;
                    onChange?.(event);
                };
                return (
                    <Select
                    value={value?.toString()}
                    onValueChange={(newValue) => handleChange(newValue)}
                    >
                    <SelectTrigger className="h-9 truncate">{selected?.props.children}</SelectTrigger>
                    <SelectContent>
                        <ScrollArea className="h-72">
                        {options.map((option, i) => (
                            <SelectItem
                            key={`${option.props.value}-${i}`}
                            value={option.props.value?.toString() ?? ""}
                            >
                            {option.props.children}
                            </SelectItem>
                        ))}
                        </ScrollArea>
                    </SelectContent>
                    </Select>
                );
                },
            }}
            />
        </div>
        <div className="flex justify-end gap-2 p-3 border-t">
          <Button variant="ghost" onClick={handleClear}>মুছুন</Button>
          <Button variant="ghost" onClick={handleCancel}>বাতিল</Button>
          <Button onClick={handleSet}>সেট</Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
