import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Booking } from '../lib/supabase';
import { useLanguage } from '../contexts/LanguageContext';

type BookingCalendarProps = {
  bookings: Booking[];
};

export const BookingCalendar = ({ bookings }: BookingCalendarProps) => {
  const { t } = useLanguage();
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate();

  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  ).getDay();

  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const bookingsByDate = useMemo(() => {
    const map = new Map<string, Booking[]>();
    bookings.forEach((booking) => {
      const date = booking.booking_date;
      if (!map.has(date)) {
        map.set(date, []);
      }
      map.get(date)!.push(booking);
    });
    return map;
  }, [bookings]);

  const getDayBookings = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return bookingsByDate.get(dateStr) || [];
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-400';
      case 'approved':
        return 'bg-green-400';
      case 'declined':
        return 'bg-red-400';
      default:
        return 'bg-gray-400';
    }
  };

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={previousMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h3 className="text-xl font-bold text-gray-900">{monthName}</h3>
        <button
          onClick={nextMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {days.map((day) => (
          <div key={day} className="text-center font-semibold text-gray-600 text-sm py-2">
            {day}
          </div>
        ))}

        {Array.from({ length: firstDayOfMonth }).map((_, index) => (
          <div key={`empty-${index}`} className="aspect-square" />
        ))}

        {Array.from({ length: daysInMonth }).map((_, index) => {
          const day = index + 1;
          const dayBookings = getDayBookings(day);
          const today = isToday(day);

          return (
            <div
              key={day}
              className={`aspect-square border rounded-lg p-2 ${
                today ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'
              } hover:shadow-md transition-shadow`}
            >
              <div className="flex flex-col h-full">
                <div className={`text-sm font-semibold ${today ? 'text-blue-600' : 'text-gray-700'}`}>
                  {day}
                  {today && <span className="text-xs ml-1">({t.today})</span>}
                </div>
                {dayBookings.length > 0 && (
                  <div className="flex-1 mt-1 space-y-1 overflow-y-auto">
                    {dayBookings.map((booking) => (
                      <div
                        key={booking.id}
                        className={`text-xs p-1 rounded ${getStatusColor(booking.status)} text-white truncate`}
                        title={`${booking.booking_time} - ${booking.car_plate}`}
                      >
                        {booking.booking_time}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex items-center justify-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-400 rounded"></div>
          <span>{t.pending}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-400 rounded"></div>
          <span>{t.approved}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-400 rounded"></div>
          <span>{t.declined}</span>
        </div>
      </div>
    </div>
  );
};
