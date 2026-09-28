import React, { useState, useEffect } from 'react';
import { Check, Calendar, Clock, MapPin, ArrowRight, RotateCcw } from 'lucide-react';
import {
  PHOTOGRAPHERS,
  PHOTOGRAPHY_CATEGORIES,
  Photographer,
  PhotographyCategory,
  PricingPackage,
} from '../data/photographers';
import { SafeImage } from './SafeImage';

export interface BookingRecord {
  id: string;
  userId: string;
  clientName: string;
  photographerId: string;
  photographerName: string;
  category: PhotographyCategory;
  shootDate: string;
  shootTime: string;
  location: string;
  hours: number;
  packageName: string;
  totalPrice: number;
  notes: string;
  status: 'confirmed' | 'completed' | 'cancelled';
  createdAtIso: string;
}

interface BookingSectionProps {
  preselectedPhotographer: Photographer;
  preselectedCategory?: PhotographyCategory;
  preselectedPackage?: PricingPackage | null;
  preselectedTimeSlot?: string;
  currentUserDisplayName: string;
  isSubmitting: boolean;
  confirmedBooking: BookingRecord | null;
  onSubmitBooking: (payload: {
    clientName: string;
    photographer: Photographer;
    category: PhotographyCategory;
    shootDate: string;
    shootTime: string;
    location: string;
    hours: number;
    packageName: string;
    totalPrice: number;
    notes: string;
  }) => Promise<void>;
  onResetConfirmation: () => void;
  onViewMyBookings: () => void;
}

export const BookingSection: React.FC<BookingSectionProps> = ({
  preselectedPhotographer,
  preselectedCategory,
  preselectedPackage,
  preselectedTimeSlot,
  currentUserDisplayName,
  isSubmitting,
  confirmedBooking,
  onSubmitBooking,
  onResetConfirmation,
  onViewMyBookings,
}) => {
  const [selectedPhotographerId, setSelectedPhotographerId] = useState<string>(
    preselectedPhotographer.id
  );

  const activePhotographer =
    PHOTOGRAPHERS.find((p) => p.id === selectedPhotographerId) || PHOTOGRAPHERS[0];

  const [category, setCategory] = useState<PhotographyCategory>(
    preselectedCategory || activePhotographer.primaryCategory
  );
  const [selectedPackageName, setSelectedPackageName] = useState<string>(
    preselectedPackage?.name || activePhotographer.packages[0].name
  );
  const [hours, setHours] = useState<number>(
    preselectedPackage?.recommendedHours || activePhotographer.packages[0].recommendedHours
  );
  const [shootDate, setShootDate] = useState<string>('2026-10-18');
  const [shootTime, setShootTime] = useState<string>(
    preselectedTimeSlot || activePhotographer.availableTimeSlots[0] || '09:00 AM'
  );
  const [location, setLocation] = useState<string>(activePhotographer.location);
  const [clientName, setClientName] = useState<string>(
    currentUserDisplayName || 'Clara Vance'
  );
  const [notes, setNotes] = useState<string>(
    'Prefer natural golden-hour lighting and candid documentary framing.'
  );
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    setSelectedPhotographerId(preselectedPhotographer.id);
    setCategory(preselectedCategory || preselectedPhotographer.primaryCategory);
    const targetPkg = preselectedPackage || preselectedPhotographer.packages[0];
    setSelectedPackageName(targetPkg.name);
    setHours(targetPkg.recommendedHours);
    setLocation(preselectedPhotographer.location);
    if (preselectedTimeSlot) {
      setShootTime(preselectedTimeSlot);
    } else if (preselectedPhotographer.availableTimeSlots[0]) {
      setShootTime(preselectedPhotographer.availableTimeSlots[0]);
    }
  }, [preselectedPhotographer, preselectedCategory, preselectedPackage, preselectedTimeSlot]);

  useEffect(() => {
    if (currentUserDisplayName) {
      setClientName(currentUserDisplayName);
    }
  }, [currentUserDisplayName]);

  const handlePhotographerChange = (newId: string) => {
    setSelectedPhotographerId(newId);
    const found = PHOTOGRAPHERS.find((p) => p.id === newId);
    if (found) {
      setCategory(found.primaryCategory);
      setSelectedPackageName(found.packages[0].name);
      setHours(found.packages[0].recommendedHours);
      setLocation(found.location);
      setShootTime(found.availableTimeSlots[0] || '09:00 AM');
    }
  };

  const handlePackageSelect = (pkg: PricingPackage) => {
    setSelectedPackageName(pkg.name);
    setHours(pkg.recommendedHours);
  };

  // Calculate total price based on package base + any additional hours
  const matchedPackage =
    activePhotographer.packages.find((p) => p.name === selectedPackageName) ||
    activePhotographer.packages[0];
  const extraHours = hours - matchedPackage.recommendedHours;
  const calculatedTotal = Math.max(
    100,
    matchedPackage.price + extraHours * activePhotographer.hourlyRate
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const trimmedClient = clientName.trim();
    const trimmedLocation = location.trim();
    const trimmedNotes = notes.trim();

    if (trimmedClient.length < 1 || trimmedClient.length > 80) {
      setValidationError('Client full name must be between 1 and 80 characters.');
      return;
    }
    if (!/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(shootDate)) {
      setValidationError('Please select a valid date in YYYY-MM-DD format.');
      return;
    }
    if (trimmedLocation.length < 2 || trimmedLocation.length > 140) {
      setValidationError('Shoot location must be between 2 and 140 characters.');
      return;
    }
    if (hours < 1 || hours > 12) {
      setValidationError('Coverage duration must be between 1 and 12 hours.');
      return;
    }
    if (trimmedNotes.length > 500) {
      setValidationError('Creative direction notes cannot exceed 500 characters.');
      return;
    }

    await onSubmitBooking({
      clientName: trimmedClient,
      photographer: activePhotographer,
      category,
      shootDate,
      shootTime,
      location: trimmedLocation,
      hours,
      packageName: matchedPackage.name,
      totalPrice: calculatedTotal,
      notes: trimmedNotes,
    });
  };

  // Booking Confirmation State
  if (confirmedBooking) {
    return (
      <div className="bg-white border border-[#DCD9D0] rounded-2xl p-6 md:p-10 shadow-xs">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E0D8] pb-6">
            <div>
              <p className="text-xs text-[#C84B31] font-medium">
                Booking Confirmed · Production Call Sheet Issued
              </p>
              <h3 className="font-editorial text-3xl md:text-4xl font-semibold text-[#141413] mt-1">
                Your Photo Shoot is Reserved
              </h3>
              <p className="text-sm text-[#57554F] mt-1">
                Confirmation Reference:{' '}
                <span className="font-mono-tabular text-[#141413] font-medium">
                  #{confirmedBooking.id.slice(0, 10).toUpperCase()}
                </span>
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-[#141413] text-white flex items-center justify-center shrink-0">
              <Check className="w-6 h-6 text-[#C84B31]" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 py-2">
            <div>
              <span className="text-xs text-[#6E6B64] block">Assigned Photographer</span>
              <span className="font-editorial text-xl font-semibold text-[#141413]">
                {confirmedBooking.photographerName}
              </span>
            </div>
            <div>
              <span className="text-xs text-[#6E6B64] block">Photography Category</span>
              <span className="text-sm font-medium text-[#141413]">
                {confirmedBooking.category}
              </span>
            </div>
            <div>
              <span className="text-xs text-[#6E6B64] block">Selected Package</span>
              <span className="text-sm font-medium text-[#141413]">
                {confirmedBooking.packageName} ({confirmedBooking.hours} hrs)
              </span>
            </div>
            <div>
              <span className="text-xs text-[#6E6B64] block">Date & Call Time</span>
              <span className="text-sm font-mono-tabular font-medium text-[#141413]">
                {confirmedBooking.shootDate} · {confirmedBooking.shootTime}
              </span>
            </div>
            <div>
              <span className="text-xs text-[#6E6B64] block">Shoot Location</span>
              <span className="text-sm font-medium text-[#141413]">
                {confirmedBooking.location}
              </span>
            </div>
            <div>
              <span className="text-xs text-[#6E6B64] block">Total Investment</span>
              <span className="text-lg font-mono-tabular font-semibold text-[#141413]">
                ${confirmedBooking.totalPrice.toLocaleString()} USD
              </span>
            </div>
          </div>

          {confirmedBooking.notes && (
            <div className="p-4 bg-[#F4F4F0] rounded-xl border border-[#E2E0D8]">
              <span className="text-xs text-[#6E6B64] block mb-1">
                Creative Direction & Call Sheet Notes
              </span>
              <p className="text-sm text-[#2B2A27]">{confirmedBooking.notes}</p>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-[#E2E0D8]">
            <button
              type="button"
              onClick={onResetConfirmation}
              className="px-4 py-2.5 text-xs font-medium text-[#141413] bg-[#F4F4F0] hover:bg-[#E5E3DC] rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Book Another Session</span>
            </button>

            <button
              type="button"
              onClick={onViewMyBookings}
              className="px-6 py-2.5 text-xs font-medium text-white bg-[#141413] hover:bg-[#2B2A27] rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap"
            >
              <span>View in My Bookings</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Left 7 Cols: Interactive Booking Form */}
      <form
        onSubmit={handleSubmit}
        className="lg:col-span-7 bg-white border border-[#DCD9D0] rounded-2xl p-6 md:p-8 space-y-6"
      >
        <div className="border-b border-[#E2E0D8] pb-4">
          <h3 className="font-editorial text-2xl md:text-3xl font-semibold text-[#141413]">
            Configure Your Shoot Call Sheet
          </h3>
          <p className="text-sm text-[#57554F] mt-1">
            Select your photographer, specialization, date, time, location, hours, and package tier.
          </p>
        </div>

        {validationError && (
          <div className="p-3.5 rounded-lg bg-[#FDF2F0] border border-[#E6B8AF] text-xs text-[#9E2A1B] font-medium">
            {validationError}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* 1. Select Photographer */}
          <div>
            <label
              htmlFor="booking-photographer"
              className="block text-xs font-medium text-[#3D3B37] mb-1.5"
            >
              Select Photographer
            </label>
            <select
              id="booking-photographer"
              value={selectedPhotographerId}
              onChange={(e) => handlePhotographerChange(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-[#F4F4F0] border border-[#D4D1C7] rounded-lg text-[#141413] focus:outline-none focus:border-[#141413]"
            >
              {PHOTOGRAPHERS.map((photog) => (
                <option key={photog.id} value={photog.id}>
                  {photog.name} — {photog.location} (${photog.hourlyRate}/hr)
                </option>
              ))}
            </select>
          </div>

          {/* 2. Photography Type / Category */}
          <div>
            <label
              htmlFor="booking-category"
              className="block text-xs font-medium text-[#3D3B37] mb-1.5"
            >
              Photography Type
            </label>
            <select
              id="booking-category"
              value={category}
              onChange={(e) => setCategory(e.target.value as PhotographyCategory)}
              className="w-full px-3.5 py-2.5 text-sm bg-[#F4F4F0] border border-[#D4D1C7] rounded-lg text-[#141413] focus:outline-none focus:border-[#141413]"
            >
              {PHOTOGRAPHY_CATEGORIES.map((cat) => (
                <option key={cat.name} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 3. Select Package Tier */}
        <div>
          <span className="block text-xs font-medium text-[#3D3B37] mb-2">
            Select Package Tier
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {activePhotographer.packages.map((pkg) => {
              const isSelected = pkg.name === selectedPackageName;
              return (
                <button
                  key={pkg.id}
                  type="button"
                  onClick={() => handlePackageSelect(pkg)}
                  className={`p-3.5 rounded-xl border text-left transition-colors ${
                    isSelected
                      ? 'bg-[#141413] text-white border-[#141413]'
                      : 'bg-[#F4F4F0] text-[#141413] border-[#D4D1C7] hover:border-[#141413]'
                  }`}
                >
                  <span className="block font-editorial text-lg font-semibold leading-tight">
                    {pkg.name}
                  </span>
                  <span
                    className={`block font-mono-tabular text-xs mt-1 ${
                      isSelected ? 'text-[#E4E2DD]' : 'text-[#57554F]'
                    }`}
                  >
                    ${pkg.price.toLocaleString()} · {pkg.recommendedHours} hrs · {pkg.editedCount} photos
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Date, Time & Hours */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label
              htmlFor="booking-date"
              className="block text-xs font-medium text-[#3D3B37] mb-1.5"
            >
              Shoot Date
            </label>
            <input
              id="booking-date"
              type="date"
              value={shootDate}
              min="2026-01-01"
              max="2027-12-31"
              onChange={(e) => setShootDate(e.target.value)}
              required
              className="w-full px-3.5 py-2 text-sm font-mono-tabular bg-[#F4F4F0] border border-[#D4D1C7] rounded-lg text-[#141413] focus:outline-none focus:border-[#141413]"
            />
          </div>

          <div>
            <label
              htmlFor="booking-time"
              className="block text-xs font-medium text-[#3D3B37] mb-1.5"
            >
              Call Time Slot
            </label>
            <select
              id="booking-time"
              value={shootTime}
              onChange={(e) => setShootTime(e.target.value)}
              className="w-full px-3.5 py-2 text-sm font-mono-tabular bg-[#F4F4F0] border border-[#D4D1C7] rounded-lg text-[#141413] focus:outline-none focus:border-[#141413]"
            >
              {activePhotographer.availableTimeSlots.map((slot) => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))}
              <option value="06:30 AM (Sunrise)">06:30 AM (Sunrise)</option>
              <option value="06:00 PM (Evening)">06:00 PM (Evening)</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="booking-hours"
              className="block text-xs font-medium text-[#3D3B37] mb-1.5"
            >
              Duration (Hours: {hours}h)
            </label>
            <input
              id="booking-hours"
              type="number"
              min={1}
              max={12}
              value={hours}
              onChange={(e) => setHours(Math.min(12, Math.max(1, Number(e.target.value) || 1)))}
              className="w-full px-3.5 py-2 text-sm font-mono-tabular bg-[#F4F4F0] border border-[#D4D1C7] rounded-lg text-[#141413] focus:outline-none focus:border-[#141413]"
            />
          </div>
        </div>

        {/* 5. Client Name & Shoot Location */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="booking-client-name"
              className="block text-xs font-medium text-[#3D3B37] mb-1.5"
            >
              Client Full Name
            </label>
            <input
              id="booking-client-name"
              type="text"
              maxLength={80}
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="Your full name"
              required
              className="w-full px-3.5 py-2 text-sm bg-[#F4F4F0] border border-[#D4D1C7] rounded-lg text-[#141413] focus:outline-none focus:border-[#141413]"
            />
          </div>

          <div>
            <label
              htmlFor="booking-location"
              className="block text-xs font-medium text-[#3D3B37] mb-1.5"
            >
              Shoot Location / Venue Address
            </label>
            <input
              id="booking-location"
              type="text"
              maxLength={140}
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="City, studio, or venue address"
              required
              className="w-full px-3.5 py-2 text-sm bg-[#F4F4F0] border border-[#D4D1C7] rounded-lg text-[#141413] focus:outline-none focus:border-[#141413]"
            />
          </div>
        </div>

        {/* 6. Creative Notes */}
        <div>
          <label
            htmlFor="booking-notes"
            className="block text-xs font-medium text-[#3D3B37] mb-1.5"
          >
            Creative Direction & Lighting Notes (Optional)
          </label>
          <textarea
            id="booking-notes"
            rows={2}
            maxLength={500}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Share moodboard details, wardrobe notes, or specific framing requests..."
            className="w-full px-3.5 py-2 text-sm bg-[#F4F4F0] border border-[#D4D1C7] rounded-lg text-[#141413] focus:outline-none focus:border-[#141413]"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 px-6 bg-[#C84B31] hover:bg-[#B03E26] disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
        >
          <span>
            {isSubmitting
              ? 'Confirming Reservation...'
              : `Confirm Photo Shoot Booking · $${calculatedTotal.toLocaleString()}`}
          </span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      {/* Right 5 Cols: Live Call Sheet Summary */}
      <div className="lg:col-span-5 bg-[#141413] text-[#F4F4F0] rounded-2xl p-6 md:p-8 space-y-6">
        <div className="flex items-center gap-4 border-b border-white/15 pb-5">
          <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-white/20">
            <SafeImage
              src={activePhotographer.avatar}
              alt={activePhotographer.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <span className="text-xs text-[#C84B31] block">Selected Lead Photographer</span>
            <h4 className="font-editorial text-2xl font-semibold text-white">
              {activePhotographer.name}
            </h4>
            <p className="text-xs text-[#B8B5AD]">
              {activePhotographer.location} · ★ {activePhotographer.rating.toFixed(1)} ({activePhotographer.reviewCount} reviews)
            </p>
          </div>
        </div>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between py-1.5 border-b border-white/10">
            <span className="text-[#A8A49C]">Specialization</span>
            <span className="font-medium text-white">{category}</span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-white/10">
            <span className="text-[#A8A49C]">Package Tier</span>
            <span className="font-medium text-white">{matchedPackage.name}</span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-white/10">
            <span className="text-[#A8A49C]">Scheduled Date & Time</span>
            <span className="font-mono-tabular text-white">
              {shootDate} · {shootTime}
            </span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-white/10">
            <span className="text-[#A8A49C]">Coverage Duration</span>
            <span className="font-mono-tabular text-white">{hours} hours</span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-white/10">
            <span className="text-[#A8A49C]">Deliverables</span>
            <span className="font-mono-tabular text-white">
              {matchedPackage.editedCount}+ retouched stills
            </span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-white/10">
            <span className="text-[#A8A49C]">Location</span>
            <span className="text-white truncate max-w-[200px]">{location}</span>
          </div>
        </div>

        <div className="pt-2">
          <div className="flex items-baseline justify-between">
            <span className="text-xs text-[#A8A49C]">Estimated Total Investment</span>
            <span className="font-mono-tabular text-3xl font-semibold text-white">
              ${calculatedTotal.toLocaleString()}
            </span>
          </div>
          <p className="text-xs text-[#A8A49C] mt-2 leading-relaxed">
            Includes pre-shoot lighting consultation, optical backup gear, high-resolution archival gallery, and full personal print release.
          </p>
        </div>
      </div>
    </div>
  );
};
