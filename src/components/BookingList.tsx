import { useState } from 'react';
import { Check, X, Save, Phone, Car, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { Booking } from '../lib/supabase';
import { useLanguage } from '../contexts/LanguageContext';

type BookingListProps = {
  bookings: Booking[];
  onUpdateStatus: (id: string, status: 'approved' | 'declined') => void;
  onUpdateNotes: (id: string, notes: string) => void;
};

export const BookingList = ({ bookings, onUpdateStatus, onUpdateNotes }: BookingListProps) => {
  const { t } = useLanguage();
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [notesValue, setNotesValue] = useState('');

  const handleSaveNotes = (id: string) => {
    onUpdateNotes(id, notesValue);
    setEditingNotes(null);
    setNotesValue('');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'declined':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-4">
      {bookings.map((booking) => (
        <div
          key={booking.id}
          className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow bg-white"
        >
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div className="flex-1 space-y-3">
              <div className="flex items-center justify-between">
                <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(booking.status)}`}>
                  {t[booking.status as keyof typeof t]}
                </span>
                <span className="text-sm text-gray-500">
                  {new Date(booking.created_at).toLocaleString()}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="font-medium">{booking.phone_number}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <CalendarIcon className="w-4 h-4 text-gray-400" />
                    <span>{formatDate(booking.booking_date)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span>{booking.booking_time}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Car className="w-4 h-4 text-gray-400" />
                    <span className="font-medium">{booking.car_plate}</span>
                  </div>
                  {booking.car_vin && (
                    <div className="text-sm text-gray-600">
                      VIN: {booking.car_vin}
                    </div>
                  )}
                  <div className="text-sm">
                    <span className="text-gray-600">{t.serviceType}: </span>
                    <span className="font-medium">{t[booking.service_type as keyof typeof t]}</span>
                  </div>
                  <div className="text-lg font-bold text-blue-600">
                    ${booking.price.toFixed(2)}
                  </div>
                </div>
              </div>

              {booking.customer_notes && (
                <div className="bg-gray-50 rounded p-3 border border-gray-200">
                  <div className="text-xs font-semibold text-gray-600 mb-1">Customer Notes:</div>
                  <div className="text-sm text-gray-700">{booking.customer_notes}</div>
                </div>
              )}

              <div className="bg-blue-50 rounded p-3 border border-blue-200">
                <div className="text-xs font-semibold text-blue-800 mb-2">{t.adminNotes}:</div>
                {editingNotes === booking.id ? (
                  <div className="flex gap-2">
                    <textarea
                      value={notesValue}
                      onChange={(e) => setNotesValue(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={2}
                      placeholder="Add notes..."
                    />
                    <button
                      onClick={() => handleSaveNotes(booking.id)}
                      className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                      <Save className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => {
                      setEditingNotes(booking.id);
                      setNotesValue(booking.admin_notes || '');
                    }}
                    className="text-sm text-gray-700 cursor-pointer hover:bg-blue-100 rounded p-2 transition-colors min-h-[2rem]"
                  >
                    {booking.admin_notes || 'Click to add notes...'}
                  </div>
                )}
              </div>
            </div>

            {booking.status === 'pending' && (
              <div className="flex lg:flex-col gap-2">
                <button
                  onClick={() => onUpdateStatus(booking.id, 'approved')}
                  className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Check className="w-4 h-4" />
                  <span>{t.approve}</span>
                </button>
                <button
                  onClick={() => onUpdateStatus(booking.id, 'declined')}
                  className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <X className="w-4 h-4" />
                  <span>{t.decline}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
