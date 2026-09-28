import React, { useState, useEffect } from 'react';
import { X, ArrowUpRight, Check, Maximize2 } from 'lucide-react';
import { Photographer, PortfolioShot, PricingPackage } from '../data/photographers';
import { SafeImage } from './SafeImage';

interface PhotographerProfileModalProps {
  photographer: Photographer | null;
  onClose: () => void;
  onSelectForBooking: (photographer: Photographer, pkg?: PricingPackage, timeSlot?: string) => void;
}

export const PhotographerProfileModal: React.FC<PhotographerProfileModalProps> = ({
  photographer,
  onClose,
  onSelectForBooking,
}) => {
  const [activeTab, setActiveTab] = useState<'portfolio' | 'packages' | 'about' | 'reviews'>('portfolio');
  const [lightboxShot, setLightboxShot] = useState<PortfolioShot | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');

  useEffect(() => {
    if (photographer) {
      setActiveTab('portfolio');
      setSelectedTimeSlot(photographer.availableTimeSlots[0] || '09:00 AM');
    }
  }, [photographer]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (lightboxShot) {
          setLightboxShot(null);
        } else if (photographer) {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxShot, photographer, onClose]);

  if (!photographer) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 md:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="photographer-profile-title"
    >
      <div className="relative w-full max-w-5xl bg-[#F4F4F0] text-[#141413] border border-[#D8D5CC] rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col">
        {/* Top Cover & Identity Header */}
        <div className="relative h-56 md:h-64 w-full shrink-0 overflow-hidden bg-[#141413]">
          <SafeImage
            src={photographer.coverImage}
            alt={`${photographer.name} cover work`}
            className="w-full h-full object-cover opacity-85"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/10" />

          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/60 text-white hover:bg-black flex items-center justify-center transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            aria-label="Close photographer profile"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="absolute bottom-5 left-6 right-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden border-2 border-[#F4F4F0] shrink-0 bg-[#27272A]">
                <SafeImage
                  src={photographer.avatar}
                  alt={photographer.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <p className="text-xs text-[#E4E2DD] tracking-wide">
                  {photographer.specializations.join(' · ')}
                </p>
                <h2
                  id="photographer-profile-title"
                  className="font-editorial text-2xl md:text-4xl font-semibold text-white tracking-tight"
                >
                  {photographer.name}
                </h2>
                <p className="text-xs md:text-sm text-[#D6D3CD] mt-0.5">
                  {photographer.location} · ★ {photographer.rating.toFixed(1)} ({photographer.reviewCount} reviews) · {photographer.experienceYears} yrs experience · {photographer.completedShoots} shoots archived
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="text-right hidden sm:block text-white">
                <span className="text-xs text-[#D6D3CD] block">Hourly Rate</span>
                <span className="font-mono-tabular text-lg font-medium">${photographer.hourlyRate}/hr</span>
              </div>
              <button
                onClick={() => onSelectForBooking(photographer, photographer.packages[1], selectedTimeSlot)}
                className="px-5 py-2.5 bg-[#C84B31] hover:bg-[#B03E26] text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5"
              >
                <span>Book Session</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs (Functional Segmented Controls) */}
        <div className="px-6 py-3 bg-[#EAE8E1] border-b border-[#DCD9D0] flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-1 p-1 bg-[#DFDDD4] rounded-lg">
            {(
              [
                { id: 'portfolio', label: 'Portfolio & EXIF' },
                { id: 'packages', label: 'Pricing Packages' },
                { id: 'about', label: 'Experience & Availability' },
                { id: 'reviews', label: `Client Reviews (${photographer.reviews.length})` },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-[#F4F4F0] text-[#141413] shadow-xs'
                    : 'text-[#57554F] hover:text-[#141413]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="text-xs text-[#57554F] font-mono-tabular hidden lg:block">
            Turnaround: {photographer.turnaroundDays} business days · Starting at ${photographer.startingPackagePrice}
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 md:p-8 overflow-y-auto space-y-8 flex-1">
          {activeTab === 'portfolio' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-[#E2E0D8] pb-4">
                <div>
                  <h3 className="font-editorial text-2xl font-semibold text-[#141413]">
                    Curated Portfolio Plates
                  </h3>
                  <p className="text-sm text-[#57554F]">
                    Select any photograph to inspect full-screen resolution and optical EXIF telemetry.
                  </p>
                </div>
                <p className="text-xs text-[#57554F] font-mono-tabular">
                  {photographer.equipmentSummary}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {photographer.portfolio.map((shot) => (
                  <div
                    key={shot.id}
                    onClick={() => setLightboxShot(shot)}
                    className="group cursor-pointer bg-white border border-[#E2E0D8] rounded-xl overflow-hidden transition-transform duration-150 hover:-translate-y-0.5"
                  >
                    <div className="relative aspect-4/3 overflow-hidden bg-[#141413]">
                      <SafeImage
                        src={shot.image}
                        alt={shot.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-3 text-white">
                        <span className="text-xs font-mono-tabular">
                          {shot.exif.lens} · {shot.exif.aperture}
                        </span>
                        <Maximize2 className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="p-4">
                      <p className="text-xs text-[#6E6B64]">
                        {shot.category} · {shot.location} · {shot.year}
                      </p>
                      <h4 className="font-editorial text-lg font-semibold text-[#141413] mt-0.5">
                        {shot.title}
                      </h4>
                      <p className="text-xs font-mono-tabular text-[#57554F] mt-2 pt-2 border-t border-[#F0EFEA]">
                        {shot.exif.camera} · {shot.exif.aperture} · {shot.exif.shutter} · {shot.exif.iso}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'packages' && (
            <div className="space-y-6">
              <div className="border-b border-[#E2E0D8] pb-4">
                <h3 className="font-editorial text-2xl font-semibold text-[#141413]">
                  Session Packages & Deliverables
                </h3>
                <p className="text-sm text-[#57554F]">
                  Transparent all-inclusive pricing with high-resolution archival delivery. Or book custom hourly coverage at ${photographer.hourlyRate}/hr.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {photographer.packages.map((pkg, idx) => {
                  const isFeatured = idx === 1;
                  return (
                    <div
                      key={pkg.id}
                      className={`p-6 rounded-xl border flex flex-col justify-between ${
                        isFeatured
                          ? 'bg-[#141413] text-[#F4F4F0] border-[#141413]'
                          : 'bg-white text-[#141413] border-[#E2E0D8]'
                      }`}
                    >
                      <div>
                        <p
                          className={`text-xs ${
                            isFeatured ? 'text-[#C84B31]' : 'text-[#6E6B64]'
                          }`}
                        >
                          0{idx + 1}. {isFeatured ? 'Most Commissioned' : 'Curated Tier'}
                        </p>
                        <h4 className="font-editorial text-2xl font-semibold mt-1">
                          {pkg.name}
                        </h4>
                        <div className="mt-3 flex items-baseline gap-2">
                          <span className="font-mono-tabular text-3xl font-semibold">
                            ${pkg.price.toLocaleString()}
                          </span>
                          <span
                            className={`text-xs ${
                              isFeatured ? 'text-[#A8A49C]' : 'text-[#6E6B64]'
                            }`}
                          >
                            / {pkg.recommendedHours} hrs · {pkg.editedCount} stills
                          </span>
                        </div>
                        <p
                          className={`text-xs mt-1 font-mono-tabular ${
                            isFeatured ? 'text-[#A8A49C]' : 'text-[#6E6B64]'
                          }`}
                        >
                          Delivery turnaround: {pkg.turnaround}
                        </p>

                        <ul className="mt-5 space-y-2.5 text-sm border-t border-current/10 pt-4">
                          {pkg.features.map((feat, fIdx) => (
                            <li key={fIdx} className="flex items-start gap-2">
                              <Check
                                className={`w-4 h-4 shrink-0 mt-0.5 ${
                                  isFeatured ? 'text-[#C84B31]' : 'text-[#141413]'
                                }`}
                              />
                              <span className={isFeatured ? 'text-[#E4E2DD]' : 'text-[#3D3B37]'}>
                                {feat}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <button
                        onClick={() => onSelectForBooking(photographer, pkg, selectedTimeSlot)}
                        className={`mt-6 w-full py-2.5 px-4 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                          isFeatured
                            ? 'bg-[#C84B31] hover:bg-[#B03E26] text-white'
                            : 'bg-[#141413] hover:bg-[#2B2A27] text-white'
                        }`}
                      >
                        Select {pkg.name}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'about' && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              <div className="md:col-span-7 space-y-6">
                <div>
                  <h3 className="font-editorial text-2xl font-semibold text-[#141413]">
                    Artistic Statement & Background
                  </h3>
                  <p className="text-sm md:text-base text-[#3D3B37] leading-relaxed mt-2">
                    {photographer.bio}
                  </p>
                </div>

                <div className="border-t border-[#E2E0D8] pt-5">
                  <h4 className="font-editorial text-xl font-semibold text-[#141413]">
                    Specialized Services Included
                  </h4>
                  <ul className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {photographer.services.map((service, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2 text-sm text-[#3D3B37]"
                      >
                        <Check className="w-4 h-4 text-[#C84B31] shrink-0 mt-0.5" />
                        <span>{service}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="border-t border-[#E2E0D8] pt-5">
                  <h4 className="font-editorial text-xl font-semibold text-[#141413]">
                    Camera & Lighting Locker
                  </h4>
                  <p className="text-sm font-mono-tabular text-[#57554F] mt-1">
                    {photographer.equipmentSummary}
                  </p>
                </div>
              </div>

              <div className="md:col-span-5 bg-white border border-[#E2E0D8] rounded-xl p-5 space-y-5">
                <div>
                  <h4 className="font-editorial text-xl font-semibold text-[#141413]">
                    Weekly Studio & Location Availability
                  </h4>
                  <p className="text-xs text-[#6E6B64] mt-0.5">
                    Select a preferred call time below to pre-fill your booking sheet.
                  </p>
                </div>

                <div>
                  <span className="text-xs text-[#57554F] block mb-2">
                    Active Shoot Days
                  </span>
                  <p className="text-sm font-medium text-[#141413]">
                    {photographer.availabilityDays.join(' · ')}
                  </p>
                </div>

                <div>
                  <span className="text-xs text-[#57554F] block mb-2">
                    Preferred Call Times
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {photographer.availableTimeSlots.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setSelectedTimeSlot(slot)}
                        className={`py-2 px-3 rounded-lg text-xs font-mono-tabular transition-colors border ${
                          selectedTimeSlot === slot
                            ? 'bg-[#141413] text-white border-[#141413]'
                            : 'bg-[#F4F4F0] text-[#141413] border-[#DCD9D0] hover:border-[#141413]'
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() =>
                    onSelectForBooking(photographer, photographer.packages[0], selectedTimeSlot)
                  }
                  className="w-full py-2.5 px-4 bg-[#C84B31] hover:bg-[#B03E26] text-white text-xs font-medium rounded-lg transition-colors whitespace-nowrap"
                >
                  Book {selectedTimeSlot} Call Time
                </button>
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-6">
              <div className="border-b border-[#E2E0D8] pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
                <div>
                  <h3 className="font-editorial text-2xl font-semibold text-[#141413]">
                    Verified Client Commissions
                  </h3>
                  <p className="text-sm text-[#57554F]">
                    Attributable testimonials from completed studio and location shoots.
                  </p>
                </div>
                <div className="font-mono-tabular text-sm text-[#141413]">
                  ★ {photographer.rating.toFixed(1)} average across {photographer.reviewCount} sessions
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {photographer.reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-5 bg-white border border-[#E2E0D8] rounded-xl space-y-3"
                  >
                    <div className="flex items-center justify-between text-xs text-[#6E6B64]">
                      <span>
                        {rev.shootCategory} · {rev.date}
                      </span>
                      <span className="font-mono-tabular text-[#141413] font-medium">
                        ★ {rev.rating.toFixed(1)}
                      </span>
                    </div>
                    <p className="text-sm text-[#2B2A27] leading-relaxed italic">
                      “{rev.comment}”
                    </p>
                    <div className="pt-2 border-t border-[#F0EFEA]">
                      <p className="text-sm font-semibold text-[#141413]">{rev.clientName}</p>
                      <p className="text-xs text-[#6E6B64]">{rev.clientRole}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Fullscreen Lightbox Viewer for Portfolio Plates */}
      {lightboxShot && (
        <div
          className="fixed inset-0 z-60 bg-[#050505]/95 flex flex-col items-center justify-center p-4 md:p-10"
          onClick={() => setLightboxShot(null)}
        >
          <button
            onClick={() => setLightboxShot(null)}
            className="absolute top-6 right-6 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-mono-tabular flex items-center gap-2 transition-colors"
          >
            <span>ESC / Close</span>
            <X className="w-4 h-4" />
          </button>

          <div
            className="max-w-4xl w-full space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="aspect-4/3 w-full max-h-[72vh] rounded-xl overflow-hidden bg-black border border-white/15">
              <SafeImage
                src={lightboxShot.image}
                alt={lightboxShot.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-white px-1">
              <div>
                <p className="text-xs text-neutral-400">
                  {lightboxShot.category} · {lightboxShot.location} · {lightboxShot.year} · Photographed by {photographer.name}
                </p>
                <h4 className="font-editorial text-2xl font-semibold">
                  {lightboxShot.title}
                </h4>
              </div>
              <div className="text-xs font-mono-tabular text-neutral-300">
                {lightboxShot.exif.camera} · {lightboxShot.exif.lens} · {lightboxShot.exif.aperture} · {lightboxShot.exif.shutter} · {lightboxShot.exif.iso}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
