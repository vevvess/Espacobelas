import React from "react";
import { FiCalendar, FiGrid, FiList } from "react-icons/fi";

export type ViewType = "day" | "week" | "month";

interface ViewSelectorProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  currentDate: Date;
  onDateChange: (date: Date) => void;
}

export function ViewSelector({
  currentView,
  onViewChange,
  currentDate,
  onDateChange,
}: ViewSelectorProps) {
  const views = [
    { id: "day" as ViewType, label: "Dia", icon: FiList },
    { id: "week" as ViewType, label: "Semana", icon: FiGrid },
    { id: "month" as ViewType, label: "Mês", icon: FiCalendar },
  ];

  const formatDateForInput = (date: Date) => {
    return date.toISOString().split("T")[0];
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(e.target.value + "T00:00:00");
    onDateChange(newDate);
  };

  const navigateDate = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate);

    switch (currentView) {
      case "day":
        newDate.setDate(newDate.getDate() + (direction === "next" ? 1 : -1));
        break;
      case "week":
        newDate.setDate(newDate.getDate() + (direction === "next" ? 7 : -7));
        break;
      case "month":
        newDate.setMonth(newDate.getMonth() + (direction === "next" ? 1 : -1));
        break;
    }

    onDateChange(newDate);
  };

  const getDateRangeLabel = () => {
    const options: Intl.DateTimeFormatOptions = {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    };

    switch (currentView) {
      case "day":
        return currentDate.toLocaleDateString("pt-BR", options);
      case "week":
        const startOfWeek = new Date(currentDate);
        startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        return `${startOfWeek.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })} - ${endOfWeek.toLocaleDateString("pt-BR", options)}`;
      case "month":
        return currentDate.toLocaleDateString("pt-BR", {
          month: "long",
          year: "numeric",
        });
      default:
        return "";
    }
  };

  return (
    <div className="bella-card p-4 mb-6 animate-fade-in">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        {/* View Selector */}
        <div className="flex items-center space-x-1 bg-bella-100 rounded-lg p-1">
          {views.map((view) => {
            const Icon = view.icon;
            return (
              <button
                key={view.id}
                onClick={() => onViewChange(view.id)}
                className={`
                  flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all
                  ${
                    currentView === view.id
                      ? "bg-white text-bella-600 shadow-sm"
                      : "text-bella-500 hover:text-bella-600 hover:bg-white/50"
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{view.label}</span>
              </button>
            );
          })}
        </div>

        {/* Date Navigation */}
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigateDate("prev")}
            className="p-2 text-bella-600 hover:bg-bella-100 rounded-lg transition-colors"
            title="Anterior"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <div className="text-center min-w-[200px]">
            <div className="font-semibold text-bella-800">
              {getDateRangeLabel()}
            </div>
            <input
              type="date"
              value={formatDateForInput(currentDate)}
              onChange={handleDateChange}
              className="text-xs text-bella-500 bg-transparent border-none cursor-pointer hover:text-bella-600"
              title="Selecionar data"
            />
          </div>

          <button
            onClick={() => navigateDate("next")}
            className="p-2 text-bella-600 hover:bg-bella-100 rounded-lg transition-colors"
            title="Próximo"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>

        {/* Today Button */}
        <button
          onClick={() => onDateChange(new Date())}
          className="px-4 py-2 text-sm font-medium text-bella-600 bg-bella-100 hover:bg-bella-200 rounded-lg transition-colors"
        >
          Hoje
        </button>
      </div>
    </div>
  );
}

// Helper functions to get date ranges
export function getDateRange(
  date: Date,
  view: ViewType,
): { start: Date; end: Date } {
  const start = new Date(date);
  const end = new Date(date);

  switch (view) {
    case "day":
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;
    case "week":
      start.setDate(date.getDate() - date.getDay());
      start.setHours(0, 0, 0, 0);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
      break;
    case "month":
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      end.setMonth(start.getMonth() + 1);
      end.setDate(0);
      end.setHours(23, 59, 59, 999);
      break;
  }

  return { start, end };
}
