import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, format, isToday, isWithinInterval, startOfWeek, endOfWeek } from "date-fns"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export interface DateRange {
  from: Date
  to: Date | undefined
}

interface CalendarProps {
  mode?: "single" | "range"
  selected?: Date | DateRange
  onSelect?: (date: Date | DateRange | undefined) => void
  numberOfMonths?: number
  defaultMonth?: Date
  className?: string
}

export function Calendar({
  mode = "single",
  selected,
  onSelect,
  defaultMonth = new Date(),
  className,
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState<Date>(defaultMonth)
  const [hoveredDate, setHoveredDate] = React.useState<Date | undefined>()

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1))
  const previousMonth = () => setCurrentMonth(subMonths(currentMonth, 1))

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)

  // Указываем, что неделя начинается в понедельник ({ weekStartsOn: 1 })
  const displayStart = startOfWeek(monthStart, { weekStartsOn: 1 as const })
  // Указываем, что неделя начинается в понедельник ({ weekStartsOn: 1 })
  const displayEnd = endOfWeek(monthEnd, { weekStartsOn: 1 as const })

  const allDaysInGrid = eachDayOfInterval({ start: displayStart, end: displayEnd })

  const handleDateClick = (date: Date) => {
    if (mode === "single") {
      onSelect?.(date)
    } else {
      const range = selected as DateRange
      if (!range?.from || (range.from && range.to)) {
        onSelect?.({ from: date, to: undefined })
      } else {
        if (date < range.from) {
          onSelect?.({ from: date, to: range.from })
        } else {
          onSelect?.({ from: range.from, to: date })
        }
      }
    }
  }

  const isDateSelected = (date: Date) => {
    if (mode === "single") {
      return selected && isSameDay(date, selected as Date)
    }
    const range = selected as DateRange
    return (range?.from && isSameDay(date, range.from)) || (range?.to && isSameDay(date, range.to))
  }

  const isDateInRange = (date: Date) => {
    if (mode === "single") return false
    const range = selected as DateRange
    if (!range?.from || !range?.to) return false;
    return isWithinInterval(date, { start: range.from, end: range.to });
  }

  return (
    <div className={cn("p-3", className)}>
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="outline"
          size="icon"
          onClick={previousMonth}
          className="h-7 w-7"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="text-sm font-medium">
          {format(currentMonth, "MMMM yyyy")}
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={nextMonth}
          className="h-7 w-7"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {/* Изменен порядок дней недели: начинается с понедельника */}
        {["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"].map((day) => (
          <div
            key={day}
            className="text-center text-sm font-normal text-muted-foreground"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {allDaysInGrid.map((day) => {
          const isCurrentMonthDay = isSameMonth(day, currentMonth);

          if (!isCurrentMonthDay) {
            return (
              <div
                key={day.toString()}
                className="h-9 w-9 p-0"
              />
            );
          }

          const isSelected = isDateSelected(day);
          const isInRange = isDateInRange(day);
          const isCurrentDay = isToday(day);

          return (
            <Button
              key={day.toString()}
              variant="ghost"
              className={cn(
                "h-9 w-9 p-0 font-normal",
                isCurrentDay && "text-primary font-semibold bg-primary/20",
                (isSelected || isInRange) && "bg-primary text-primary-foreground hover:bg-primary/80 hover:text-primary-foreground",
                !isSelected && !isInRange && "hover:bg-accent hover:text-accent-foreground"
              )}
              onClick={() => handleDateClick(day)}
              onMouseEnter={() => setHoveredDate(day)}
              onMouseLeave={() => setHoveredDate(undefined)}
            >
              {format(day, "d")}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
