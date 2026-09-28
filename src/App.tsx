/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Search,
  SlidersHorizontal,
  ArrowUpRight,
  LogOut,
  User as UserIcon,
} from 'lucide-react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  query,
  where,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import {
  auth,
  db,
  googleProvider,
  OperationType,
  handleFirestoreError,
} from './firebase';
import {
  HERO_IMAGE,
  PHOTOGRAPHERS,
  PHOTOGRAPHY_CATEGORIES,
  Photographer,
  PhotographyCategory,
  PricingPackage,
} from './data/photographers';
import { SafeImage } from './components/SafeImage';
import { PhotographerProfileModal } from './components/PhotographerProfileModal';
import { BookingSection, BookingRecord } from './components/BookingSection';
import { AuthModal } from './components/AuthModal';
import {
  MyBookingsSection,
  ContactSection,
} from './components/MyBookingsAndContact';

const INITIAL_DEMO_BOOKINGS: BookingRecord[] = [
  {
    id: 'bk_2026_1042',
    userId: 'demo_client',
    clientName: 'Clara Vance',
    photographerId: 'photog_julian_vance',
    photographerName: 'Julian Vance',
    category: 'Pre-Wedding',
    shootDate: '2026-10-24',
    shootTime: '08:00 AM',
    location: 'Manhattan, NY',
    hours: 6,
    packageName: 'Editorial Signature',
    totalPrice: 1580,
    notes: 'Cast-iron loft morning light followed by Brooklyn Bridge Park walk.',
    status: 'confirmed',
    createdAtIso: '2026-09-20T14:30:00Z',
  },
  {
    id: 'bk_2026_0819',
    userId: 'demo_client',
    clientName: 'Clara Vance',
    photographerId: 'photog_clara_moreau',
    photographerName: 'Clara Moreau',
    category: 'Portrait',
    shootDate: '2026-08-12',
    shootTime: '12:00 PM',
    location: 'Arts District, Los Angeles, CA',
    hours: 2,
    packageName: 'Essential Session',
    totalPrice: 620,
    notes: 'Editorial daylight author portraits on warm travertine backdrop.',
    status: 'completed',
    createdAtIso: '2026-08-01T10:15:00Z',
  },
];

export default function App() {
  // Authentication & User State
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [localProfile, setLocalProfile] = useState<{
    name: string;
    email: string;
    city: string;
  } | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<PhotographyCategory | 'All'>('All');
  const [maxPriceFilter, setMaxPriceFilter] = useState<number>(350);
  const [minRatingFilter, setMinRatingFilter] = useState<number>(0);

  // Profile & Booking State
  const [inspectingPhotographer, setInspectingPhotographer] =
    useState<Photographer | null>(null);
  const [bookingPhotographer, setBookingPhotographer] = useState<Photographer>(
    PHOTOGRAPHERS[0]
  );
  const [bookingCategory, setBookingCategory] = useState<PhotographyCategory | undefined>(
    undefined
  );
  const [bookingPackage, setBookingPackage] = useState<PricingPackage | null>(null);
  const [bookingTimeSlot, setBookingTimeSlot] = useState<string | undefined>(undefined);
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<BookingRecord | null>(null);

  // Bookings List State (Firestore + Local Session)
  const [cloudBookings, setCloudBookings] = useState<BookingRecord[]>([]);
  const [localBookings, setLocalBookings] =
    useState<BookingRecord[]>(INITIAL_DEMO_BOOKINGS);

  // Section refs for smooth navigation
  const photographersRef = useRef<HTMLElement>(null);
  const categoriesRef = useRef<HTMLElement>(null);
  const bookingFormRef = useRef<HTMLElement>(null);
  const myBookingsRef = useRef<HTMLElement>(null);
  const contactRef = useRef<HTMLElement>(null);

  const scrollToSection = (ref: React.RefObject<HTMLElement | null>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Ensure /users/{uid} exists in Firestore when a verified Firebase user logs in
  const ensureUserProfileDocument = async (
    user: FirebaseUser,
    preferredCity = 'New York, NY',
    customDisplayName?: string
  ) => {
    const userPath = `users/${user.uid}`;
    const userRef = doc(db, 'users', user.uid);
    try {
      const snap = await getDoc(userRef);
      const safeName = (
        customDisplayName ||
        user.displayName ||
        user.email?.split('@')[0] ||
        'Atelier Client'
      ).slice(0, 80);
      const safeCity = preferredCity.slice(0, 80);

      if (!snap.exists()) {
        await setDoc(userRef, {
          uid: user.uid,
          displayName: safeName,
          preferredCity: safeCity,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, userPath);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      setIsAuthReady(true);
      if (user && user.emailVerified) {
        try {
          await ensureUserProfileDocument(user);
        } catch {
          // Handled by handleFirestoreError
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // Real-time Firestore listener for authenticated user's bookings
  useEffect(() => {
    if (!isAuthReady || !firebaseUser) {
      setCloudBookings([]);
      return;
    }

    const bookingsPath = 'bookings';
    const q = query(
      collection(db, bookingsPath),
      where('userId', '==', firebaseUser.uid)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const records: BookingRecord[] = snapshot.docs.map((docSnap) => {
          const d = docSnap.data();
          return {
            id: docSnap.id,
            userId: d.userId,
            clientName: d.clientName,
            photographerId: d.photographerId,
            photographerName: d.photographerName,
            category: d.category as PhotographyCategory,
            shootDate: d.shootDate,
            shootTime: d.shootTime,
            location: d.location,
            hours: d.hours,
            packageName: d.packageName,
            totalPrice: d.totalPrice,
            notes: d.notes || '',
            status: d.status,
            createdAtIso: new Date().toISOString(),
          };
        });
        setCloudBookings(records);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, bookingsPath);
      }
    );

    return () => unsubscribe();
  }, [isAuthReady, firebaseUser]);

  // Filtered Photographers
  const filteredPhotographers = useMemo(() => {
    return PHOTOGRAPHERS.filter((photog) => {
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        photog.name.toLowerCase().includes(q) ||
        photog.location.toLowerCase().includes(q) ||
        photog.title.toLowerCase().includes(q) ||
        photog.specializations.some((s) => s.toLowerCase().includes(q));

      const matchesCategory =
        selectedCategory === 'All' ||
        photog.specializations.includes(selectedCategory);

      const matchesPrice = photog.hourlyRate <= maxPriceFilter;
      const matchesRating = photog.rating >= minRatingFilter;

      return matchesSearch && matchesCategory && matchesPrice && matchesRating;
    });
  }, [searchQuery, selectedCategory, maxPriceFilter, minRatingFilter]);

  // Active user display name
  const currentUserDisplayName =
    firebaseUser?.displayName ||
    localProfile?.name ||
    (firebaseUser?.email ? firebaseUser.email.split('@')[0] : '');

  const isUserSignedIn = Boolean(firebaseUser || localProfile);

  // Combined bookings (cloud + local)
  const allUserBookings = useMemo(() => {
    if (firebaseUser && cloudBookings.length > 0) {
      return cloudBookings;
    }
    return localBookings;
  }, [firebaseUser, cloudBookings, localBookings]);

  // Auth Handlers
  const handleGoogleAuth = async (
    preferredCity = 'New York, NY',
    customDisplayName?: string
  ) => {
    setAuthError(null);
    setIsAuthenticating(true);
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      if (cred.user) {
        await ensureUserProfileDocument(cred.user, preferredCity, customDisplayName);
      }
      setIsAuthModalOpen(false);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Unable to complete Google sign-in.';
      setAuthError(
        `${message} You can also sign in immediately using the client credentials form below.`
      );
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleDirectProfileSession = (
    name: string,
    email: string,
    preferredCity: string
  ) => {
    setLocalProfile({ name, email, city: preferredCity });
    setIsAuthModalOpen(false);
  };

  const handleSignOut = async () => {
    setLocalProfile(null);
    if (firebaseUser) {
      await signOut(auth);
    }
  };

  // Trigger booking flow for a specific photographer
  const handleInitiateBooking = (
    photographer: Photographer,
    pkg?: PricingPackage,
    timeSlot?: string,
    cat?: PhotographyCategory
  ) => {
    setInspectingPhotographer(null);
    setConfirmedBooking(null);
    setBookingPhotographer(photographer);
    setBookingPackage(pkg || photographer.packages[0]);
    setBookingTimeSlot(timeSlot || photographer.availableTimeSlots[0]);
    setBookingCategory(cat || photographer.primaryCategory);
    scrollToSection(bookingFormRef);
  };

  // Create Booking Handler
  const handleSubmitBooking = async (payload: {
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
  }) => {
    setIsSubmittingBooking(true);
    const generatedId = `bk_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 7)}`;

    const newRecord: BookingRecord = {
      id: generatedId,
      userId: firebaseUser?.uid || 'local_client',
      clientName: payload.clientName.slice(0, 80),
      photographerId: payload.photographer.id,
      photographerName: payload.photographer.name.slice(0, 80),
      category: payload.category,
      shootDate: payload.shootDate,
      shootTime: payload.shootTime.slice(0, 30),
      location: payload.location.slice(0, 140),
      hours: Math.min(12, Math.max(1, Math.round(payload.hours))),
      packageName: payload.packageName.slice(0, 60),
      totalPrice: payload.totalPrice,
      notes: payload.notes.slice(0, 500),
      status: 'confirmed',
      createdAtIso: new Date().toISOString(),
    };

    try {
      if (firebaseUser && firebaseUser.emailVerified) {
        await ensureUserProfileDocument(firebaseUser, payload.location, payload.clientName);
        const bookingPath = `bookings/${generatedId}`;
        try {
          await setDoc(doc(db, 'bookings', generatedId), {
            userId: firebaseUser.uid,
            clientName: newRecord.clientName,
            photographerId: newRecord.photographerId,
            photographerName: newRecord.photographerName,
            category: newRecord.category,
            shootDate: newRecord.shootDate,
            shootTime: newRecord.shootTime,
            location: newRecord.location,
            hours: newRecord.hours,
            packageName: newRecord.packageName,
            totalPrice: newRecord.totalPrice,
            notes: newRecord.notes,
            status: 'confirmed',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        } catch (err) {
          handleFirestoreError(err, OperationType.CREATE, bookingPath);
        }
      }

      setLocalBookings((prev) => [newRecord, ...prev]);
      setConfirmedBooking(newRecord);
    } finally {
      setIsSubmittingBooking(false);
    }
  };

  // Cancel Booking Handler
  const handleCancelBooking = async (bookingId: string) => {
    if (firebaseUser && firebaseUser.emailVerified && cloudBookings.some((b) => b.id === bookingId)) {
      const bookingPath = `bookings/${bookingId}`;
      try {
        await updateDoc(doc(db, 'bookings', bookingId), {
          status: 'cancelled',
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, bookingPath);
      }
    }

    setLocalBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: 'cancelled' } : b))
    );
  };

  // Reschedule Booking Handler
  const handleRescheduleBooking = async (
    bookingId: string,
    newDate: string,
    newTime: string,
    newLocation: string,
    newNotes: string
  ) => {
    const safeLocation = newLocation.slice(0, 140) || 'Manhattan, NY';
    const safeNotes = newNotes.slice(0, 500);
    const safeTime = newTime.slice(0, 30) || '10:00 AM';

    if (firebaseUser && firebaseUser.emailVerified && cloudBookings.some((b) => b.id === bookingId)) {
      const bookingPath = `bookings/${bookingId}`;
      try {
        await updateDoc(doc(db, 'bookings', bookingId), {
          shootDate: newDate,
          shootTime: safeTime,
          location: safeLocation,
          notes: safeNotes,
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, bookingPath);
      }
    }

    setLocalBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId
          ? {
              ...b,
              shootDate: newDate,
              shootTime: safeTime,
              location: safeLocation,
              notes: safeNotes,
            }
          : b
      )
    );
  };

  // Submit Contact Inquiry Handler
  const handleSubmitInquiry = async (payload: {
    name: string;
    subject: string;
    category: PhotographyCategory;
    message: string;
  }) => {
    if (firebaseUser && firebaseUser.emailVerified) {
      await ensureUserProfileDocument(firebaseUser, 'New York, NY', payload.name);
      const inquiryId = `inq_${Date.now()}`;
      const inquiryPath = `inquiries/${inquiryId}`;
      try {
        await setDoc(doc(db, 'inquiries', inquiryId), {
          userId: firebaseUser.uid,
          name: payload.name.slice(0, 80),
          subject: payload.subject.slice(0, 120),
          category: payload.category.slice(0, 40),
          message: payload.message.slice(0, 1000),
          createdAt: serverTimestamp(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, inquiryPath);
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F4F0] text-[#141413]">
      {/* Strict 3-Zone Top Bar Contract */}
      <header className="sticky top-0 z-40 bg-[#F4F4F0]/95 backdrop-blur-xs border-b border-[#DCD9D0] px-6 lg:px-12 py-4 flex items-center justify-between">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#top"
          className="font-editorial text-2xl font-bold tracking-tight text-[#141413] whitespace-nowrap shrink-0"
        >
          Atelier Lumière
        </a>

        {/* Zone 2: 5 single-line navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-[#57554F]">
          <button
            type="button"
            onClick={() => scrollToSection(photographersRef)}
            className="hover:text-[#141413] hover:underline underline-offset-4 transition-colors whitespace-nowrap"
          >
            Photographers
          </button>
          <button
            type="button"
            onClick={() => scrollToSection(categoriesRef)}
            className="hover:text-[#141413] hover:underline underline-offset-4 transition-colors whitespace-nowrap"
          >
            Categories
          </button>
          <button
            type="button"
            onClick={() => scrollToSection(bookingFormRef)}
            className="hover:text-[#141413] hover:underline underline-offset-4 transition-colors whitespace-nowrap"
          >
            Book Shoot
          </button>
          <button
            type="button"
            onClick={() => scrollToSection(myBookingsRef)}
            className="hover:text-[#141413] hover:underline underline-offset-4 transition-colors whitespace-nowrap"
          >
            My Bookings
          </button>
          <button
            type="button"
            onClick={() => scrollToSection(contactRef)}
            className="hover:text-[#141413] hover:underline underline-offset-4 transition-colors whitespace-nowrap"
          >
            Contact Us
          </button>
        </nav>

        {/* Zone 3: 1-2 Primary Actions */}
        <div className="flex items-center gap-3 shrink-0">
          {isUserSignedIn ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => scrollToSection(myBookingsRef)}
                className="px-3 py-2 text-xs font-medium text-[#141413] hover:bg-[#E5E3DC] rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap"
              >
                <UserIcon className="w-3.5 h-3.5 text-[#C84B31]" />
                <span className="max-w-[120px] truncate">
                  {currentUserDisplayName || 'Client'}
                </span>
              </button>
              <button
                type="button"
                onClick={handleSignOut}
                className="p-2 text-[#57554F] hover:text-[#141413] rounded-lg transition-colors"
                aria-label="Sign out"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                setAuthModalMode('login');
                setIsAuthModalOpen(true);
              }}
              className="px-3.5 py-2 text-xs font-medium text-[#141413] hover:bg-[#E5E3DC] rounded-lg transition-colors whitespace-nowrap"
            >
              Login / Register
            </button>
          )}

          <button
            type="button"
            onClick={() => scrollToSection(bookingFormRef)}
            className="px-4 py-2 text-xs font-medium text-white bg-[#141413] hover:bg-[#C84B31] rounded-lg transition-colors whitespace-nowrap"
          >
            Book Now
          </button>
        </div>
      </header>

      <main id="top" className="flex-1">
        {/* 1. HOME — HERO SECTION */}
        <section className="px-6 lg:px-12 pt-6 pb-14 max-w-[1440px] mx-auto">
          <div className="relative rounded-2xl overflow-hidden bg-[#141413] min-h-[520px] md:min-h-[580px] flex items-end">
            <SafeImage
              src={HERO_IMAGE}
              alt="Professional photographer capturing golden hour editorial portrait in loft studio"
              className="absolute inset-0 w-full h-full object-cover opacity-85"
            />
            {/* Measured Scrim for WCAG AA Contrast */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/15" />

            <div className="relative z-10 w-full p-8 md:p-14 lg:p-16 flex flex-col lg:flex-row lg:items-end justify-between gap-8">
              <div className="max-w-2xl space-y-4">
                <p className="text-xs md:text-sm text-[#E4E2DD] tracking-wide">
                  Curated Photography Roster · Eight Specialized Disciplines · Instant Call Sheet Booking
                </p>
                <h1
                  className="font-editorial text-4xl sm:text-6xl lg:text-7xl font-semibold text-white tracking-tight leading-[1.04]"
                  style={{ textWrap: 'balance' }}
                >
                  Capture Your Moments
                </h1>
                <p className="text-base md:text-lg text-[#E4E2DD] leading-relaxed max-w-xl">
                  Discover vetted documentary, portrait, wedding, and commercial photographers. Inspect optical portfolios, compare all-inclusive session packages, and book your photo shoot online in minutes.
                </p>

                <div className="pt-3 flex flex-wrap items-center gap-4">
                  <button
                    type="button"
                    onClick={() => scrollToSection(bookingFormRef)}
                    className="px-6 py-3 bg-[#C84B31] hover:bg-[#B03E26] text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap"
                  >
                    <span>Book Now</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => scrollToSection(photographersRef)}
                    className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white border border-white/25 text-sm font-medium rounded-lg transition-colors whitespace-nowrap"
                  >
                    Explore Photographers
                  </button>
                </div>
              </div>

              {/* Quantitative Proof Adjacency */}
              <div className="grid grid-cols-3 gap-6 pt-6 lg:pt-0 border-t lg:border-t-0 border-white/20 text-white shrink-0">
                <div>
                  <span className="font-mono-tabular text-2xl md:text-3xl font-semibold block">
                    2,490+
                  </span>
                  <span className="text-xs text-[#D6D3CD]">
                    Verified Sessions Archived
                  </span>
                </div>
                <div>
                  <span className="font-mono-tabular text-2xl md:text-3xl font-semibold block">
                    4.9 ★
                  </span>
                  <span className="text-xs text-[#D6D3CD]">
                    Client Satisfaction Across 8 Cities
                  </span>
                </div>
                <div>
                  <span className="font-mono-tabular text-2xl md:text-3xl font-semibold block">
                    48–72h
                  </span>
                  <span className="text-xs text-[#D6D3CD]">
                    Express Preview Turnaround
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. PHOTOGRAPHY CATEGORIES SECTION */}
        <section
          ref={categoriesRef}
          className="px-6 lg:px-12 py-14 max-w-[1440px] mx-auto border-t border-[#DCD9D0]"
        >
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div>
              <p className="text-xs text-[#6E6B64]">
                Eight Curated Specializations
              </p>
              <h2 className="font-editorial text-3xl md:text-4xl font-semibold text-[#141413] mt-1">
                Photography Categories
              </h2>
            </div>
            <p className="text-sm text-[#57554F] max-w-md">
              Select any photography category below to filter specialists or jump directly into a tailored booking session.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {PHOTOGRAPHY_CATEGORIES.map((cat, idx) => {
              const isSelected = selectedCategory === cat.name;
              return (
                <div
                  key={cat.name}
                  onClick={() => {
                    setSelectedCategory(cat.name);
                    scrollToSection(photographersRef);
                  }}
                  className={`group cursor-pointer rounded-2xl overflow-hidden border transition-transform duration-150 hover:-translate-y-0.5 flex flex-col justify-between ${
                    isSelected
                      ? 'bg-[#141413] text-white border-[#141413]'
                      : 'bg-white text-[#141413] border-[#DCD9D0]'
                  }`}
                >
                  <div>
                    <div className="relative aspect-4/3 overflow-hidden bg-[#141413]">
                      <SafeImage
                        src={cat.coverImage}
                        alt={cat.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 opacity-90"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                      <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between text-white">
                        <span className="font-mono-tabular text-xs text-[#E4E2DD]">
                          0{idx + 1} · {cat.sessionCount}
                        </span>
                        <span className="font-mono-tabular text-xs font-medium">
                          From ${cat.startingRate}/hr
                        </span>
                      </div>
                    </div>

                    <div className="p-5">
                      <h3 className="font-editorial text-2xl font-semibold">
                        {cat.name}
                      </h3>
                      <p
                        className={`text-xs mt-1.5 leading-relaxed ${
                          isSelected ? 'text-[#D6D3CD]' : 'text-[#57554F]'
                        }`}
                      >
                        {cat.tagline}
                      </p>
                    </div>
                  </div>

                  <div
                    className={`px-5 pb-4 pt-3 border-t text-xs flex items-center justify-between ${
                      isSelected
                        ? 'border-white/15 text-[#E4E2DD]'
                        : 'border-[#F0EFEA] text-[#6E6B64]'
                    }`}
                  >
                    <span className="truncate pr-2">{cat.deliverablesSummary.split(' · ')[0]}</span>
                    <span className="font-medium text-[#C84B31] shrink-0 flex items-center gap-1">
                      <span>Filter</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 3. SEARCH & FILTER + PHOTOGRAPHERS DIRECTORY */}
        <section
          ref={photographersRef}
          className="px-6 lg:px-12 py-14 max-w-[1440px] mx-auto border-t border-[#DCD9D0] space-y-8"
        >
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <p className="text-xs text-[#6E6B64]">
                Vetted Portfolio Directory
              </p>
              <h2 className="font-editorial text-3xl md:text-4xl font-semibold text-[#141413] mt-1">
                Discover Photographers
              </h2>
            </div>
            <p className="text-sm text-[#57554F]">
              Showing{' '}
              <span className="font-mono-tabular font-semibold text-[#141413]">
                {filteredPhotographers.length}
              </span>{' '}
              of {PHOTOGRAPHERS.length} principal photographers
            </p>
          </div>

          {/* Search & Filter Controls Bar */}
          <div className="bg-white border border-[#DCD9D0] rounded-2xl p-5 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              {/* Search by name or location */}
              <div className="md:col-span-5 relative">
                <Search className="w-4 h-4 text-[#6E6B64] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by photographer name, city, or specialty..."
                  aria-label="Search photographers by name or location"
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-[#F4F4F0] border border-[#D4D1C7] rounded-lg text-[#141413] focus:outline-none focus:border-[#141413]"
                />
              </div>

              {/* Filter by Max Hourly Price */}
              <div className="md:col-span-4 flex flex-col justify-center px-2">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-[#57554F] font-medium">
                    Max Hourly Rate
                  </span>
                  <span className="font-mono-tabular font-semibold text-[#141413]">
                    Up to ${maxPriceFilter}/hr
                  </span>
                </div>
                <input
                  type="range"
                  min={150}
                  max={350}
                  step={10}
                  value={maxPriceFilter}
                  onChange={(e) => setMaxPriceFilter(Number(e.target.value))}
                  aria-label="Filter by maximum hourly price"
                  className="w-full accent-[#C84B31] cursor-pointer"
                />
              </div>

              {/* Filter by Minimum Rating */}
              <div className="md:col-span-3 flex items-center justify-end gap-2">
                <span className="text-xs text-[#57554F] whitespace-nowrap">
                  Min Rating:
                </span>
                <div className="flex items-center gap-1 p-1 bg-[#F4F4F0] rounded-lg border border-[#DCD9D0]">
                  {[
                    { label: 'All', val: 0 },
                    { label: '4.8★+', val: 4.8 },
                    { label: '4.9★+', val: 4.9 },
                  ].map((opt) => (
                    <button
                      key={opt.label}
                      type="button"
                      onClick={() => setMinRatingFilter(opt.val)}
                      className={`px-2.5 py-1 text-xs font-mono-tabular rounded-md transition-colors whitespace-nowrap ${
                        minRatingFilter === opt.val
                          ? 'bg-[#141413] text-white'
                          : 'text-[#57554F] hover:text-[#141413]'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Interactive Category Filter Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-[#F0EFEA]">
              <div className="flex flex-wrap items-center gap-1.5">
                {(
                  [
                    'All',
                    'Wedding',
                    'Pre-Wedding',
                    'Birthday',
                    'Portrait',
                    'Fashion',
                    'Events',
                    'Product Photography',
                    'Travel Photography',
                  ] as const
                ).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                      selectedCategory === cat
                        ? 'bg-[#141413] text-white'
                        : 'bg-[#F4F4F0] text-[#57554F] hover:text-[#141413]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {(searchQuery ||
                selectedCategory !== 'All' ||
                maxPriceFilter < 350 ||
                minRatingFilter > 0) && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('All');
                    setMaxPriceFilter(350);
                    setMinRatingFilter(0);
                  }}
                  className="text-xs font-medium text-[#C84B31] hover:underline whitespace-nowrap"
                >
                  Reset Filters
                </button>
              )}
            </div>
          </div>

          {/* Photographer Cards Grid */}
          {filteredPhotographers.length === 0 ? (
            <div className="bg-white border border-[#DCD9D0] rounded-2xl p-12 text-center space-y-3">
              <h3 className="font-editorial text-2xl font-semibold text-[#141413]">
                No Photographers Match Your Current Filter Criteria
              </h3>
              <p className="text-sm text-[#57554F]">
                Try broadening your price ceiling or clearing the category search filter.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                  setMaxPriceFilter(350);
                  setMinRatingFilter(0);
                }}
                className="px-4 py-2 bg-[#141413] text-white text-xs font-medium rounded-lg"
              >
                Show All Photographers
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPhotographers.map((photog) => (
                <article
                  key={photog.id}
                  className="bg-white border border-[#DCD9D0] rounded-2xl overflow-hidden flex flex-col justify-between transition-transform duration-150 hover:-translate-y-0.5"
                >
                  <div>
                    {/* Cover Showcase Image */}
                    <div
                      onClick={() => setInspectingPhotographer(photog)}
                      className="relative aspect-4/3 overflow-hidden bg-[#141413] cursor-pointer group"
                    >
                      <SafeImage
                        src={photog.coverImage}
                        alt={`${photog.name} portfolio preview`}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
                      <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white">
                        <span className="text-xs font-mono-tabular">
                          ★ {photog.rating.toFixed(1)} ({photog.reviewCount} reviews)
                        </span>
                        <span className="text-xs font-mono-tabular font-semibold">
                          ${photog.hourlyRate}/hr · Pkg from ${photog.startingPackagePrice}
                        </span>
                      </div>
                    </div>

                    {/* Photographer Identity & Unboxed Metadata */}
                    <div className="p-6 space-y-3">
                      <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-[#DCD9D0]">
                          <SafeImage
                            src={photog.avatar}
                            alt={photog.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs text-[#6E6B64] truncate">
                            {photog.specializations.join(' · ')}
                          </p>
                          <h3 className="font-editorial text-2xl font-semibold text-[#141413] truncate">
                            {photog.name}
                          </h3>
                        </div>
                      </div>

                      {/* Clean Unboxed Metadata with Typographic Separators */}
                      <div className="flex flex-wrap items-center gap-1.5 text-xs text-[#57554F] pt-1">
                        <span className="font-medium text-[#141413]">
                          {photog.location}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{photog.experienceYears} yrs experience</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono-tabular">
                          {photog.completedShoots} shoots
                        </span>
                      </div>

                      <p className="text-sm text-[#3D3B37] line-clamp-2 leading-relaxed">
                        {photog.bio}
                      </p>
                    </div>
                  </div>

                  {/* Card Actions: View Profile & Book Now */}
                  <div className="px-6 pb-6 pt-4 border-t border-[#F0EFEA] grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setInspectingPhotographer(photog)}
                      className="py-2.5 px-4 text-xs font-medium text-[#141413] bg-[#F4F4F0] hover:bg-[#E5E3DC] rounded-lg transition-colors whitespace-nowrap"
                    >
                      View Profile
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleInitiateBooking(
                          photog,
                          photog.packages[0],
                          photog.availableTimeSlots[0],
                          selectedCategory !== 'All'
                            ? selectedCategory
                            : photog.primaryCategory
                        )
                      }
                      className="py-2.5 px-4 text-xs font-medium text-white bg-[#141413] hover:bg-[#C84B31] rounded-lg transition-colors whitespace-nowrap"
                    >
                      Book Now
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* 4. BOOKING FORM & BOOKING CONFIRMATION SECTION */}
        <section
          ref={bookingFormRef}
          className="px-6 lg:px-12 py-14 max-w-[1440px] mx-auto border-t border-[#DCD9D0] space-y-8"
        >
          <div>
            <p className="text-xs text-[#6E6B64]">
              Online Session Reservation
            </p>
            <h2 className="font-editorial text-3xl md:text-4xl font-semibold text-[#141413] mt-1">
              Book Your Photo Shoot
            </h2>
          </div>

          <BookingSection
            preselectedPhotographer={bookingPhotographer}
            preselectedCategory={bookingCategory}
            preselectedPackage={bookingPackage}
            preselectedTimeSlot={bookingTimeSlot}
            currentUserDisplayName={currentUserDisplayName}
            isSubmitting={isSubmittingBooking}
            confirmedBooking={confirmedBooking}
            onSubmitBooking={handleSubmitBooking}
            onResetConfirmation={() => setConfirmedBooking(null)}
            onViewMyBookings={() => scrollToSection(myBookingsRef)}
          />
        </section>

        {/* 5. MY BOOKINGS SECTION */}
        <section
          ref={myBookingsRef}
          className="px-6 lg:px-12 py-14 max-w-[1440px] mx-auto border-t border-[#DCD9D0]"
        >
          <MyBookingsSection
            bookings={allUserBookings}
            isSignedIn={isUserSignedIn}
            onOpenAuth={() => {
              setAuthModalMode('login');
              setIsAuthModalOpen(true);
            }}
            onCancelBooking={handleCancelBooking}
            onRescheduleBooking={handleRescheduleBooking}
            onBookNewSession={() => scrollToSection(bookingFormRef)}
          />
        </section>

        {/* 6. CONTACT US SECTION */}
        <section
          ref={contactRef}
          className="px-6 lg:px-12 py-14 max-w-[1440px] mx-auto border-t border-[#DCD9D0]"
        >
          <ContactSection onSubmitInquiry={handleSubmitInquiry} />
        </section>
      </main>

      {/* Clean Editorial Footer */}
      <footer className="bg-[#141413] text-[#E4E2DD] px-6 lg:px-12 py-10 border-t border-[#27272A]">
        <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <span className="font-editorial text-2xl font-semibold text-white">
              Atelier Lumière
            </span>
            <p className="text-xs text-[#A8A49C] mt-1">
              Book My Photo Shoot · Curated Documentary, Editorial & Commercial Photography
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs text-[#A8A49C]">
            <button
              type="button"
              onClick={() => scrollToSection(photographersRef)}
              className="hover:text-white transition-colors"
            >
              Photographers
            </button>
            <button
              type="button"
              onClick={() => scrollToSection(categoriesRef)}
              className="hover:text-white transition-colors"
            >
              Categories
            </button>
            <button
              type="button"
              onClick={() => scrollToSection(bookingFormRef)}
              className="hover:text-white transition-colors"
            >
              Book Session
            </button>
            <button
              type="button"
              onClick={() => scrollToSection(myBookingsRef)}
              className="hover:text-white transition-colors"
            >
              My Bookings
            </button>
            <button
              type="button"
              onClick={() => scrollToSection(contactRef)}
              className="hover:text-white transition-colors"
            >
              Contact Us
            </button>
          </div>

          <p className="text-xs text-[#8E8A82]">
            © {new Date().getFullYear()} Atelier Lumière. All rights reserved.
          </p>
        </div>
      </footer>

      {/* Photographer Profile & Lightbox Modal */}
      <PhotographerProfileModal
        photographer={inspectingPhotographer}
        onClose={() => setInspectingPhotographer(null)}
        onSelectForBooking={(photog, pkg, slot) =>
          handleInitiateBooking(photog, pkg, slot)
        }
      />

      {/* Login / Register Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        initialMode={authModalMode}
        onClose={() => setIsAuthModalOpen(false)}
        onGoogleAuth={handleGoogleAuth}
        onDirectProfileSession={handleDirectProfileSession}
        authError={authError}
        isAuthenticating={isAuthenticating}
      />
    </div>
  );
}
