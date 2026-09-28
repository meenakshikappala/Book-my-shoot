import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Check,
  XCircle,
  Send,
  Mail,
  Phone,
  ArrowUpRight,
  Edit3,
} from 'lucide-react';
import { BookingRecord } from './BookingSection';
import { PHOTOGRAPHY_CATEGORIES, PhotographyCategory } from '../data/photographers';

interface MyBookingsSectionProps {
  bookings: BookingRecord[];
  isSignedIn: boolean;
  onOpenAuth: () => void;
  onCancelBooking: (bookingId: string) => Promise<void>;
  onRescheduleBooking: (
    bookingId: string,
    newDate: string,
    newTime: string,
    newLocation: string,
    newNotes: string
  ) => Promise<void>;
  onBookNewSession: () => void;
}

export const MyBookingsSection: React.FC<MyBookingsSectionProps> = ({
  bookings,
  isSignedIn,
  onOpenAuth,
  onCancelBooking,
  onRescheduleBooking,
  onBookNewSession,
}) => {
  const [filterTab, setFilterTab] = useState<'upcoming' | 'previous'>('upcoming');
  const [editingBookingId, setEditingBookingId] = useState<string | null>(null);
  const [editDate, setEditDate] = useState('');
  const [editTime, setEditTime] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const todayStr = '2026-09-27';

  const upcomingBookings = bookings.filter(
    (b) => b.status === 'confirmed' && b.shootDate >= todayStr
  );
  const previousBookings = bookings.filter(
    (b) => b.status !== 'confirmed' || b.shootDate < todayStr
  );

  const displayedBookings =
    filterTab === 'upcoming' ? upcomingBookings : previousBookings;

  const startEditing = (b: BookingRecord) => {
    setEditingBookingId(b.id);
    setEditDate(b.shootDate);
    setEditTime(b.shootTime);
    setEditLocation(b.location);
    setEditNotes(b.notes);
  };

  const handleSaveReschedule = async (bookingId: string) => {
    setIsUpdating(true);
    try {
      await onRescheduleBooking(
        bookingId,
        editDate,
        editTime,
        editLocation.trim(),
        editNotes.trim()
      );
      setEditingBookingId(null);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#DCD9D0] pb-6">
        <div>
          <p className="text-xs text-[#6E6B64]">Client Production Ledger</p>
          <h2 className="font-editorial text-3xl md:text-4xl font-semibold text-[#141413] mt-1">
            My Bookings
          </h2>
          <p className="text-sm text-[#57554F] mt-1">
            Review upcoming photo-shoot call sheets, reschedule call times, or browse archived sessions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 p-1 bg-[#E5E3DC] rounded-lg">
            <button
              type="button"
              onClick={() => setFilterTab('upcoming')}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                filterTab === 'upcoming'
                  ? 'bg-white text-[#141413] shadow-xs'
                  : 'text-[#57554F] hover:text-[#141413]'
              }`}
            >
              Upcoming ({upcomingBookings.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterTab('previous')}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                filterTab === 'previous'
                  ? 'bg-white text-[#141413] shadow-xs'
                  : 'text-[#57554F] hover:text-[#141413]'
              }`}
            >
              Previous & Cancelled ({previousBookings.length})
            </button>
          </div>

          {!isSignedIn && (
            <button
              type="button"
              onClick={onOpenAuth}
              className="px-4 py-2 text-xs font-medium text-white bg-[#141413] hover:bg-[#2B2A27] rounded-lg transition-colors whitespace-nowrap"
            >
              Sign In to Sync Cloud
            </button>
          )}
        </div>
      </div>

      {displayedBookings.length === 0 ? (
        <div className="bg-white border border-[#DCD9D0] rounded-2xl p-10 text-center space-y-4">
          <h3 className="font-editorial text-2xl font-semibold text-[#141413]">
            No {filterTab === 'upcoming' ? 'Upcoming' : 'Previous'} Photo Shoots Found
          </h3>
          <p className="text-sm text-[#57554F] max-w-md mx-auto">
            {filterTab === 'upcoming'
              ? 'You have no active upcoming sessions scheduled. Explore our photographers and reserve a call time.'
              : 'Completed or cancelled photo shoot records will appear in this archive.'}
          </p>
          <button
            type="button"
            onClick={onBookNewSession}
            className="px-5 py-2.5 bg-[#C84B31] hover:bg-[#B03E26] text-white text-xs font-medium rounded-lg transition-colors whitespace-nowrap"
          >
            Book a Photo Shoot
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {displayedBookings.map((booking) => {
            const isEditing = editingBookingId === booking.id;
            return (
              <div
                key={booking.id}
                className="bg-white border border-[#DCD9D0] rounded-2xl p-6 flex flex-col justify-between space-y-5"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-[#6E6B64]">
                    <span className="font-mono-tabular">
                      REF #{booking.id.slice(0, 8).toUpperCase()} · {booking.category}
                    </span>
                    <span className="font-medium text-[#141413]">
                      {booking.status === 'confirmed'
                        ? 'Confirmed Session'
                        : booking.status === 'completed'
                        ? 'Completed Archive'
                        : 'Cancelled'}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-editorial text-2xl font-semibold text-[#141413]">
                      {booking.photographerName}
                    </h3>
                    <p className="text-xs text-[#57554F] mt-0.5">
                      {booking.packageName} · {booking.hours} hrs coverage · Client: {booking.clientName}
                    </p>
                  </div>

                  {isEditing ? (
                    <div className="p-4 bg-[#F4F4F0] rounded-xl border border-[#DCD9D0] space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-[#57554F] mb-1">
                            New Date
                          </label>
                          <input
                            type="date"
                            value={editDate}
                            onChange={(e) => setEditDate(e.target.value)}
                            className="w-full px-2.5 py-1.5 text-xs font-mono-tabular bg-white border border-[#D4D1C7] rounded-md"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-[#57554F] mb-1">
                            New Call Time
                          </label>
                          <input
                            type="text"
                            value={editTime}
                            onChange={(e) => setEditTime(e.target.value)}
                            className="w-full px-2.5 py-1.5 text-xs font-mono-tabular bg-white border border-[#D4D1C7] rounded-md"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-[#57554F] mb-1">
                          Updated Location
                        </label>
                        <input
                          type="text"
                          value={editLocation}
                          onChange={(e) => setEditLocation(e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#D4D1C7] rounded-md"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-[#57554F] mb-1">
                          Updated Notes
                        </label>
                        <input
                          type="text"
                          value={editNotes}
                          onChange={(e) => setEditNotes(e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#D4D1C7] rounded-md"
                        />
                      </div>
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() => handleSaveReschedule(booking.id)}
                          className="px-3 py-1.5 bg-[#141413] text-white text-xs font-medium rounded-md"
                        >
                          {isUpdating ? 'Saving...' : 'Save Changes'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingBookingId(null)}
                          className="px-3 py-1.5 bg-white border border-[#D4D1C7] text-xs font-medium rounded-md"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="pt-2 border-t border-[#F0EFEA] space-y-1.5 text-xs text-[#3D3B37]">
                      <p className="font-mono-tabular">
                        Date & Time: {booking.shootDate} · {booking.shootTime}
                      </p>
                      <p>Location: {booking.location}</p>
                      {booking.notes && (
                        <p className="text-[#6E6B64] italic">“{booking.notes}”</p>
                      )}
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-[#E2E0D8] flex items-center justify-between gap-3">
                  <span className="font-mono-tabular text-lg font-semibold text-[#141413]">
                    ${booking.totalPrice.toLocaleString()}
                  </span>

                  {booking.status === 'confirmed' && !isEditing && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => startEditing(booking)}
                        className="px-3 py-1.5 text-xs font-medium text-[#141413] bg-[#F4F4F0] hover:bg-[#E5E3DC] rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Reschedule</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onCancelBooking(booking.id)}
                        className="px-3 py-1.5 text-xs font-medium text-[#9E2A1B] bg-[#FDF2F0] hover:bg-[#F9E1DC] rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Cancel Shoot</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

interface ContactSectionProps {
  onSubmitInquiry: (payload: {
    name: string;
    subject: string;
    category: PhotographyCategory;
    message: string;
  }) => Promise<void>;
}

export const ContactSection: React.FC<ContactSectionProps> = ({ onSubmitInquiry }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState<PhotographyCategory>('Wedding');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !subject.trim() || message.trim().length < 5) return;
    setIsSending(true);
    try {
      await onSubmitInquiry({
        name: name.trim(),
        subject: subject.trim(),
        category,
        message: message.trim(),
      });
      setSubmitted(true);
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      <div className="lg:col-span-5 space-y-6">
        <div>
          <p className="text-xs text-[#6E6B64]">Concierge & Production Desk</p>
          <h2 className="font-editorial text-3xl md:text-4xl font-semibold text-[#141413] mt-1">
            Contact Us
          </h2>
          <p className="text-sm text-[#57554F] mt-2 leading-relaxed">
            Have a custom multi-day wedding brief, commercial campaign requirements, or studio lighting inquiry? Reach our booking producers directly.
          </p>
        </div>

        <div className="space-y-4 pt-2 border-t border-[#DCD9D0] text-sm">
          <div>
            <span className="text-xs text-[#6E6B64] block">Direct Booking Desk Email</span>
            <a
              href="mailto:concierge@atelierlumiere.studio"
              className="font-mono-tabular font-medium text-[#141413] hover:text-[#C84B31] transition-colors"
            >
              concierge@atelierlumiere.studio
            </a>
          </div>

          <div>
            <span className="text-xs text-[#6E6B64] block">Studio & Dispatch Phone</span>
            <a
              href="tel:+12125550194"
              className="font-mono-tabular font-medium text-[#141413] hover:text-[#C84B31] transition-colors"
            >
              +1 (212) 555-0194 · Mon–Sat, 8:00 AM – 8:00 PM EST
            </a>
          </div>

          <div>
            <span className="text-xs text-[#6E6B64] block">Flagship Daylight Studio</span>
            <p className="text-[#141413] font-medium">
              482 Broome Street, Penthouse 4B · SoHo, New York, NY 10013
            </p>
          </div>

          <div className="pt-2">
            <span className="text-xs text-[#6E6B64] block mb-2">
              Editorial Dispatches & Social Channels
            </span>
            <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-[#141413]">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="hover:text-[#C84B31] underline underline-offset-4 flex items-center gap-1"
              >
                <span>Instagram</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
              <span aria-hidden="true">·</span>
              <a
                href="https://behance.net"
                target="_blank"
                rel="noreferrer"
                className="hover:text-[#C84B31] underline underline-offset-4 flex items-center gap-1"
              >
                <span>Behance</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
              <span aria-hidden="true">·</span>
              <a
                href="https://pinterest.com"
                target="_blank"
                rel="noreferrer"
                className="hover:text-[#C84B31] underline underline-offset-4 flex items-center gap-1"
              >
                <span>Pinterest</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
              <span aria-hidden="true">·</span>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="hover:text-[#C84B31] underline underline-offset-4 flex items-center gap-1"
              >
                <span>LinkedIn</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="lg:col-span-7 bg-white border border-[#DCD9D0] rounded-2xl p-6 md:p-8">
        {submitted ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#141413] text-white flex items-center justify-center mx-auto">
              <Check className="w-6 h-6 text-[#C84B31]" />
            </div>
            <h3 className="font-editorial text-2xl font-semibold text-[#141413]">
              Production Inquiry Received
            </h3>
            <p className="text-sm text-[#57554F] max-w-md mx-auto">
              Thank you for reaching out to Atelier Lumière. A senior booking producer will respond within 4 business hours with photographer availability and custom rate cards.
            </p>
            <button
              type="button"
              onClick={() => setSubmitted(false)}
              className="px-4 py-2 bg-[#F4F4F0] hover:bg-[#E5E3DC] text-[#141413] text-xs font-medium rounded-lg transition-colors"
            >
              Send Another Message
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="font-editorial text-2xl font-semibold text-[#141413]">
              Send a Production Brief
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="contact-name"
                  className="block text-xs font-medium text-[#3D3B37] mb-1"
                >
                  Your Full Name
                </label>
                <input
                  id="contact-name"
                  type="text"
                  required
                  maxLength={80}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Eleanor Vance"
                  className="w-full px-3.5 py-2 text-sm bg-[#F4F4F0] border border-[#D4D1C7] rounded-lg text-[#141413] focus:outline-none focus:border-[#141413]"
                />
              </div>

              <div>
                <label
                  htmlFor="contact-email"
                  className="block text-xs font-medium text-[#3D3B37] mb-1"
                >
                  Email Address
                </label>
                <input
                  id="contact-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="eleanor@domain.com"
                  className="w-full px-3.5 py-2 text-sm bg-[#F4F4F0] border border-[#D4D1C7] rounded-lg text-[#141413] focus:outline-none focus:border-[#141413]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="contact-category"
                  className="block text-xs font-medium text-[#3D3B37] mb-1"
                >
                  Photography Type
                </label>
                <select
                  id="contact-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as PhotographyCategory)}
                  className="w-full px-3.5 py-2 text-sm bg-[#F4F4F0] border border-[#D4D1C7] rounded-lg text-[#141413] focus:outline-none focus:border-[#141413]"
                >
                  {PHOTOGRAPHY_CATEGORIES.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="contact-subject"
                  className="block text-xs font-medium text-[#3D3B37] mb-1"
                >
                  Subject
                </label>
                <input
                  id="contact-subject"
                  type="text"
                  required
                  maxLength={120}
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Autumn Wedding / Brand Lookbook Inquiry"
                  className="w-full px-3.5 py-2 text-sm bg-[#F4F4F0] border border-[#D4D1C7] rounded-lg text-[#141413] focus:outline-none focus:border-[#141413]"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="contact-message"
                className="block text-xs font-medium text-[#3D3B37] mb-1"
              >
                Message & Shoot Details
              </label>
              <textarea
                id="contact-message"
                rows={4}
                required
                minLength={5}
                maxLength={1000}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell us about your preferred dates, location, and creative vision..."
                className="w-full px-3.5 py-2 text-sm bg-[#F4F4F0] border border-[#D4D1C7] rounded-lg text-[#141413] focus:outline-none focus:border-[#141413]"
              />
            </div>

            <button
              type="submit"
              disabled={isSending}
              className="px-6 py-2.5 bg-[#141413] hover:bg-[#2B2A27] disabled:opacity-60 text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSending ? 'Sending Inquiry...' : 'Submit Inquiry'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
