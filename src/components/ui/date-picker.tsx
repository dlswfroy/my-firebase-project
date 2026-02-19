"use client"

import * as React from "react"
import { format } from "date-fns"
import { bn } from 'date-fns/locale'
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea } from "./scroll-area"

type DatePickerProps = {
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
  triggerClassName?: string;
  placeholder?: string;
}

export function DatePicker({ value, onChange, triggerClassName, placeholder = "একটি তারিখ নির্বাচন করুন" }: DatePickerProps) {
  const [open, setOpen] = React.useState(false)
  const [displayDate, setDisplayDate] = React.useState<Date | undefined>(value)
  const [view, setView] = React.useState<'day' | 'year'>('day');

  React.useEffect(() => {
    setDisplayDate(value);
  }, [value]);
  
  React.useEffect(() => {
    if (open) {
      setView('day');
    }
  }, [open]);


  const handleSet = () => {
    onChange(displayDate);
    setOpen(false);
  }
  
  const handleCancel = () => {
    setOpen(false);
  }

  const handleClear = () => {
    onChange(undefined);
    setOpen(false);
  }

  const handleYearSelect = (year: number) => {
    const newDate = displayDate ? new Date(displayDate) : new Date();
    newDate.setFullYear(year);
    setDisplayDate(newDate);
    setView('day');
  }

  const years = Array.from(
    { length: (new Date().getFullYear() + 10) - 1950 + 1 },
    (_, i) => 1950 + i
  ).reverse();
  
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
         <div className="p-4 bg-primary text-primary-foreground rounded-t-md">
            <div 
                className="font-semibold cursor-pointer"
                onClick={() => setView(v => v === 'day' ? 'year' : 'day')}
            >
                {displayDate ? displayDate.getFullYear().toLocaleString('bn-BD') : new Date().getFullYear().toLocaleString('bn-BD')}
            </div>
            <div className="text-2xl font-bold">
                {displayDate ? format(displayDate, "E, d MMM", { locale: bn }) : "তারিখ নির্বাচন"}
            </div>
        </div>

        {view === 'day' ? (
             <Calendar
                mode="single"
                selected={displayDate}
                onSelect={setDisplayDate}
                month={displayDate}
                onMonthChange={setDisplayDate}
                initialFocus
                locale={bn}
                fromYear={1950}
                toYear={new Date().getFullYear() + 10}
            />
        ) : (
             <ScrollArea className="h-[254px]">
                <div className="grid grid-cols-1 gap-1 p-2 text-center">
                    {years.map((year) => (
                    <Button
                        key={year}
                        variant={displayDate?.getFullYear() === year ? "default" : "ghost"}
                        className={cn("w-full", displayDate?.getFullYear() === year && "bg-primary text-primary-foreground")}
                        onClick={() => handleYearSelect(year)}
                    >
                        {year.toLocaleString('bn-BD')}
                    </Button>
                    ))}
                </div>
            </ScrollArea>
        )}
       
        <div className="flex justify-end gap-2 p-2 border-t">
          <Button variant="ghost" onClick={handleClear}>মুছুন</Button>
          <Button variant="ghost" onClick={handleCancel}>বাতিল</Button>
          <Button onClick={handleSet}>সেট</Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
