import { useState, useEffect } from 'react';
import { Calendar, Clock, Phone, Car, Hash, FileText, DollarSign } from 'lucide-react';
import { supabase, ServiceType, TimeSlot } from '../lib/supabase';
import { useLanguage } from '../contexts/LanguageContext';

export const BookingForm = () => {
  const { t } = useLanguage();
  const [services, setServices] = useState<ServiceType[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    phoneNumber: '',
    bookingDate: '',
    bookingTime: '',
    carVin: '',
    carPlate: '',
    serviceType: '',
    customerNotes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadServices();
    loadTimeSlots();
  }, []);

  const loadServices = async () => {
    const { data } = await supabase
      .from('service_types')
      .select('*')
      .eq('active', true)
      .order('base_price');
    if (data) setServices(data);
  };

  const loadTimeSlots = async () => {
    const { data } = await supabase
      .from('time_slots')
      .select('*')
      .eq('active', true)
      .order('order_index');
    if (data) setTimeSlots(data);
  };

  const selectedService = services.find(s => s.name_key === formData.serviceType);
  const calculatedPrice = selectedService ? selectedService.base_price : 0;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.phoneNumber) {
      newErrors.phoneNumber = t.requiredField;
    } else if (!/^[\d\s+()-]+$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = t.invalidPhone;
    }

    if (!formData.bookingDate) {
      newErrors.bookingDate = t.selectDate;
    }

    if (!formData.bookingTime) {
      newErrors.bookingTime = t.selectTime;
    }

    if (!formData.carPlate) {
      newErrors.carPlate = t.requiredField;
    }

    if (!formData.serviceType) {
      newErrors.serviceType = t.requiredField;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const { error: submitError } = await supabase.from('bookings').insert({
        phone_number: formData.phoneNumber,
        booking_date: formData.bookingDate,
        booking_time: formData.bookingTime,
        car_vin: formData.carVin || null,
        car_plate: formData.carPlate,
        service_type: formData.serviceType,
        price: calculatedPrice,
        customer_notes: formData.customerNotes || null,
        status: 'pending',
      });

      if (submitError) throw submitError;

      setSuccess(true);
      setFormData({
        phoneNumber: '',
        bookingDate: '',
        bookingTime: '',
        carVin: '',
        carPlate: '',
        serviceType: '',
        customerNotes: '',
      });
      setErrors({});

      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      setError(t.bookingError);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const minDate = new Date().toISOString().split('T')[0];

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-6 md:p-8">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 text-center">
        {t.bookingTitle}
      </h2>

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm">
          {t.bookingSuccess}
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            {t.phoneNumber} *
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="tel"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              placeholder={t.phonePlaceholder}
              className={`w-full pl-11 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                errors.phoneNumber ? 'border-red-500' : 'border-gray-300'
              }`}
            />
          </div>
          {errors.phoneNumber && (
            <p className="mt-1 text-sm text-red-600">{errors.phoneNumber}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {t.bookingDate} *
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="date"
                min={minDate}
                value={formData.bookingDate}
                onChange={(e) => setFormData({ ...formData, bookingDate: e.target.value })}
                className={`w-full pl-11 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  errors.bookingDate ? 'border-red-500' : 'border-gray-300'
                }`}
              />
            </div>
            {errors.bookingDate && (
              <p className="mt-1 text-sm text-red-600">{errors.bookingDate}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {t.bookingTime} *
            </label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={formData.bookingTime}
                onChange={(e) => setFormData({ ...formData, bookingTime: e.target.value })}
                className={`w-full pl-11 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none bg-white ${
                  errors.bookingTime ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">{t.bookingTime}</option>
                {timeSlots.map((slot) => (
                  <option key={slot.id} value={slot.time_slot}>
                    {slot.time_slot}
                  </option>
                ))}
              </select>
            </div>
            {errors.bookingTime && (
              <p className="mt-1 text-sm text-red-600">{errors.bookingTime}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {t.carPlate} *
            </label>
            <div className="relative">
              <Car className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={formData.carPlate}
                onChange={(e) => setFormData({ ...formData, carPlate: e.target.value.toUpperCase() })}
                placeholder={t.platePlaceholder}
                className={`w-full pl-11 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all uppercase ${
                  errors.carPlate ? 'border-red-500' : 'border-gray-300'
                }`}
              />
            </div>
            {errors.carPlate && (
              <p className="mt-1 text-sm text-red-600">{errors.carPlate}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {t.carVin}
            </label>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={formData.carVin}
                onChange={(e) => setFormData({ ...formData, carVin: e.target.value.toUpperCase() })}
                placeholder={t.vinPlaceholder}
                maxLength={17}
                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all uppercase"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            {t.serviceType} *
          </label>
          <div className="space-y-3">
            {services.map((service) => (
              <label
                key={service.id}
                className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-all hover:border-blue-300 ${
                  formData.serviceType === service.name_key
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="serviceType"
                    value={service.name_key}
                    checked={formData.serviceType === service.name_key}
                    onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <div className="font-semibold text-gray-900">
                      {t[service.name_key as keyof typeof t]}
                    </div>
                    <div className="text-sm text-gray-600">
                      {t[`${service.name_key}_desc` as keyof typeof t]} • {service.duration_minutes} {t.minutes}
                    </div>
                  </div>
                </div>
                <div className="text-lg font-bold text-blue-600">
                  ${service.base_price.toFixed(2)}
                </div>
              </label>
            ))}
          </div>
          {errors.serviceType && (
            <p className="mt-1 text-sm text-red-600">{errors.serviceType}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            {t.customerNotes}
          </label>
          <div className="relative">
            <FileText className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <textarea
              value={formData.customerNotes}
              onChange={(e) => setFormData({ ...formData, customerNotes: e.target.value })}
              placeholder={t.notesPlaceholder}
              rows={3}
              className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
            />
          </div>
        </div>

        {calculatedPrice > 0 && (
          <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-700 font-semibold">
                <DollarSign className="w-5 h-5" />
                <span>{t.price}:</span>
              </div>
              <div className="text-3xl font-bold text-blue-600">
                ${calculatedPrice.toFixed(2)}
              </div>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? '...' : t.bookNow}
        </button>
      </form>
    </div>
  );
};
