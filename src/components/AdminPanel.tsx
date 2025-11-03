import { useState, useEffect } from 'react';
import { LogOut, Calendar as CalendarIcon, List, Check, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase, Booking } from '../lib/supabase';
import { BookingCalendar } from './BookingCalendar';
import { BookingList } from './BookingList';

export const AdminPanel = () => {
  const { signOut } = useAuth();
  const { t } = useLanguage();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'list' | 'calendar'>('list');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'declined'>('all');

  useEffect(() => {
    loadBookings();

    const subscription = supabase
      .channel('bookings_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, () => {
        loadBookings();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (statusFilter === 'all') {
      setFilteredBookings(bookings);
    } else {
      setFilteredBookings(bookings.filter(b => b.status === statusFilter));
    }
  }, [bookings, statusFilter]);

  const loadBookings = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('bookings')
      .select('*')
      .order('booking_date', { ascending: true })
      .order('booking_time', { ascending: true });

    if (data) {
      setBookings(data);
    }
    setLoading(false);
  };

  const updateBookingStatus = async (id: string, status: 'approved' | 'declined') => {
    await supabase
      .from('bookings')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id);

    loadBookings();
  };

  const updateBookingNotes = async (id: string, adminNotes: string) => {
    await supabase
      .from('bookings')
      .update({ admin_notes: adminNotes, updated_at: new Date().toISOString() })
      .eq('id', id);

    loadBookings();
  };

  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    approved: bookings.filter(b => b.status === 'approved').length,
    declined: bookings.filter(b => b.status === 'declined').length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">{t.adminPanel}</h1>
            <button
              onClick={signOut}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">{t.logout}</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="text-sm font-medium text-gray-600 mb-1">{t.all}</div>
            <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 border border-yellow-200 bg-yellow-50">
            <div className="text-sm font-medium text-yellow-800 mb-1">{t.pending}</div>
            <div className="text-3xl font-bold text-yellow-900">{stats.pending}</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 border border-green-200 bg-green-50">
            <div className="text-sm font-medium text-green-800 mb-1">{t.approved}</div>
            <div className="text-3xl font-bold text-green-900">{stats.approved}</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 border border-red-200 bg-red-50">
            <div className="text-sm font-medium text-red-800 mb-1">{t.declined}</div>
            <div className="text-3xl font-bold text-red-900">{stats.declined}</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setView('list')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    view === 'list'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <List className="w-4 h-4" />
                  <span>{t.allBookings}</span>
                </button>
                <button
                  onClick={() => setView('calendar')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    view === 'calendar'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <CalendarIcon className="w-4 h-4" />
                  <span>{t.calendar}</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">{t.filter}:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="all">{t.all}</option>
                  <option value="pending">{t.pending}</option>
                  <option value="approved">{t.approved}</option>
                  <option value="declined">{t.declined}</option>
                </select>
              </div>
            </div>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="text-center py-12 text-gray-500">Loading...</div>
            ) : filteredBookings.length === 0 ? (
              <div className="text-center py-12 text-gray-500">{t.noBookings}</div>
            ) : view === 'list' ? (
              <BookingList
                bookings={filteredBookings}
                onUpdateStatus={updateBookingStatus}
                onUpdateNotes={updateBookingNotes}
              />
            ) : (
              <BookingCalendar bookings={filteredBookings} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
