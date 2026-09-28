import heroStudioImg from '../assets/images/hero_photography_studio_1790578641845.jpg';
import weddingEditorialImg from '../assets/images/portfolio_wedding_editorial_1790578663754.jpg';
import fashionPortraitImg from '../assets/images/portfolio_fashion_portrait_1790578680548.jpg';
import productTravelImg from '../assets/images/portfolio_product_travel_1790578701443.jpg';
import photographerAvatarImg from '../assets/images/photographer_portrait_avatar_1790578718409.jpg';

export type PhotographyCategory =
  | 'Wedding'
  | 'Pre-Wedding'
  | 'Birthday'
  | 'Portrait'
  | 'Fashion'
  | 'Events'
  | 'Product Photography'
  | 'Travel Photography';

export interface CategoryInfo {
  name: PhotographyCategory;
  tagline: string;
  startingRate: number;
  deliverablesSummary: string;
  coverImage: string;
  sessionCount: string;
}

export interface PortfolioShot {
  id: string;
  title: string;
  category: PhotographyCategory;
  image: string;
  location: string;
  year: string;
  exif: {
    camera: string;
    lens: string;
    aperture: string;
    shutter: string;
    iso: string;
  };
}

export interface PricingPackage {
  id: string;
  name: string;
  recommendedHours: number;
  price: number;
  turnaround: string;
  editedCount: number;
  features: string[];
}

export interface ClientReview {
  id: string;
  clientName: string;
  clientRole: string;
  shootCategory: PhotographyCategory;
  rating: number;
  date: string;
  comment: string;
}

export interface Photographer {
  id: string;
  name: string;
  title: string;
  primaryCategory: PhotographyCategory;
  specializations: PhotographyCategory[];
  location: string;
  rating: number;
  reviewCount: number;
  hourlyRate: number;
  startingPackagePrice: number;
  experienceYears: number;
  completedShoots: number;
  avatar: string;
  coverImage: string;
  bio: string;
  equipmentSummary: string;
  services: string[];
  availabilityDays: string[];
  availableTimeSlots: string[];
  turnaroundDays: number;
  portfolio: PortfolioShot[];
  packages: PricingPackage[];
  reviews: ClientReview[];
}

export const HERO_IMAGE = heroStudioImg;

export const PHOTOGRAPHY_CATEGORIES: CategoryInfo[] = [
  {
    name: 'Wedding',
    tagline: 'Documentary & fine-art ceremony storytelling on medium format and digital.',
    startingRate: 280,
    deliverablesSummary: 'Full-day coverage · 450+ archival color-graded frames · Online print gallery',
    coverImage: weddingEditorialImg,
    sessionCount: '420+ ceremonies archived',
  },
  {
    name: 'Pre-Wedding',
    tagline: 'Golden-hour engagement stories and architectural destination sessions.',
    startingRate: 220,
    deliverablesSummary: '2 locations · Wardrobe styling direction · 90+ high-res retouched stills',
    coverImage: weddingEditorialImg,
    sessionCount: '310+ couple sessions',
  },
  {
    name: 'Birthday',
    tagline: 'Milestone celebrations, private soirées, and candid evening festivities.',
    startingRate: 160,
    deliverablesSummary: '48-hour express preview · Candid + portrait lighting · 120+ edited photos',
    coverImage: heroStudioImg,
    sessionCount: '275+ milestone events',
  },
  {
    name: 'Portrait',
    tagline: 'Architectural natural-light headshots, founder profiles, and studio editorials.',
    startingRate: 180,
    deliverablesSummary: 'Studio or on-location · Tethering preview · 25 skin-true retouched portraits',
    coverImage: photographerAvatarImg,
    sessionCount: '640+ portrait sittings',
  },
  {
    name: 'Fashion',
    tagline: 'Lookbooks, campaign editorials, and sculptural studio lighting setups.',
    startingRate: 260,
    deliverablesSummary: 'Commercial usage license · Color-calibrated TIFF/JPEG · Creative lighting',
    coverImage: fashionPortraitImg,
    sessionCount: '195+ seasonal lookbooks',
  },
  {
    name: 'Events',
    tagline: 'Galas, brand launches, keynote summits, and architectural openings.',
    startingRate: 200,
    deliverablesSummary: 'Same-night press selects · Multi-camera low-light capture · Full event archive',
    coverImage: heroStudioImg,
    sessionCount: '510+ live productions',
  },
  {
    name: 'Product Photography',
    tagline: 'Tactile still-life compositions for fragrance, horology, and design objects.',
    startingRate: 240,
    deliverablesSummary: 'Prop & surface styling · Focus-stacked macro clarity · E-commerce + print crops',
    coverImage: productTravelImg,
    sessionCount: '380+ brand campaigns',
  },
  {
    name: 'Travel Photography',
    tagline: 'Hospitality commissions, coastal retreats, and destination editorial essays.',
    startingRate: 250,
    deliverablesSummary: 'Dawn-to-dusk natural light · Architectural & lifestyle coverage · Global licensing',
    coverImage: productTravelImg,
    sessionCount: '160+ destination dispatches',
  },
];

export const PHOTOGRAPHERS: Photographer[] = [
  {
    id: 'photog_julian_vance',
    name: 'Julian Vance',
    title: 'Principal Wedding & Pre-Wedding Documentary Photographer',
    primaryCategory: 'Wedding',
    specializations: ['Wedding', 'Pre-Wedding', 'Portrait'],
    location: 'New York, NY',
    rating: 4.9,
    reviewCount: 142,
    hourlyRate: 280,
    startingPackagePrice: 840,
    experienceYears: 11,
    completedShoots: 394,
    avatar: photographerAvatarImg,
    coverImage: weddingEditorialImg,
    bio: 'Former photojournalist specializing in unscripted ceremony storytelling and architectural pre-wedding portraits. Working with Leica M digital and medium-format film to preserve skin tones and atmospheric golden-hour shadow detail.',
    equipmentSummary: 'Leica SL2-S · Hasselblad 500C/M · Summilux 35mm & 50mm f/1.4',
    services: [
      'Full Wedding & Elopement Documentary',
      'Destination Pre-Wedding Editorial',
      '35mm & 120 Medium-Format Film Add-On',
      'Museum-Grade Linen Heirloom Albums',
    ],
    availabilityDays: ['Mon', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    availableTimeSlots: ['08:00 AM', '11:00 AM', '02:30 PM', '05:00 PM'],
    turnaroundDays: 7,
    portfolio: [
      {
        id: 'jv_1',
        title: 'Villa Cetinale Dusk Vows',
        category: 'Wedding',
        image: weddingEditorialImg,
        location: 'Hudson Valley, NY',
        year: '2026',
        exif: {
          camera: 'Leica SL2-S',
          lens: '50mm Summilux-SL f/1.4',
          aperture: 'f/2.0',
          shutter: '1/640s',
          iso: 'ISO 160',
        },
      },
      {
        id: 'jv_2',
        title: 'SoHo Cast-Iron Loft Engagement',
        category: 'Pre-Wedding',
        image: heroStudioImg,
        location: 'Manhattan, NY',
        year: '2026',
        exif: {
          camera: 'Leica M11',
          lens: '35mm Summilux-M f/1.4',
          aperture: 'f/2.8',
          shutter: '1/500s',
          iso: 'ISO 200',
        },
      },
      {
        id: 'jv_3',
        title: 'Solstice Bridal Study',
        category: 'Portrait',
        image: fashionPortraitImg,
        location: 'Brooklyn Heights, NY',
        year: '2025',
        exif: {
          camera: 'Hasselblad X2D 100C',
          lens: 'XCD 90V f/2.5',
          aperture: 'f/2.8',
          shutter: '1/400s',
          iso: 'ISO 64',
        },
      },
    ],
    packages: [
      {
        id: 'pkg_jv_essential',
        name: 'Essential Session',
        recommendedHours: 3,
        price: 840,
        turnaround: '5 business days',
        editedCount: 90,
        features: [
          '3 hours continuous on-location coverage',
          '90 color-graded high-resolution stills',
          'Private online gallery with uncompressed downloads',
          'Pre-shoot lighting & location consultation',
        ],
      },
      {
        id: 'pkg_jv_editorial',
        name: 'Editorial Signature',
        recommendedHours: 6,
        price: 1580,
        turnaround: '7 business days',
        editedCount: 240,
        features: [
          '6 hours multi-location documentary coverage',
          '240 retouched archival stills + 2 rolls 35mm film',
          '48-hour express 20-image preview delivery',
          'Print release + bespoke web story gallery',
        ],
      },
      {
        id: 'pkg_jv_archive',
        name: 'Full Archive Production',
        recommendedHours: 10,
        price: 2650,
        turnaround: '10 business days',
        editedCount: 480,
        features: [
          '10 hours full-day coverage with second shooter',
          '480+ master-retouched photographs',
          'Handbound Italian linen proof box',
          'Dedicated lighting assistant & backup studio kit',
        ],
      },
    ],
    reviews: [
      {
        id: 'rev_jv_1',
        clientName: 'Eleanor & Marcus Sterling',
        clientRole: 'Architectural Restorers, Tribeca',
        shootCategory: 'Wedding',
        rating: 5.0,
        date: 'August 2026',
        comment:
          'We were worried traditional wedding photography would feel staged and interrupt our guests. Julian blended into our candlelit dinner and delivered 460 frames within six days that looked like an Italian cinema archive.',
      },
      {
        id: 'rev_jv_2',
        clientName: 'Priya Nair & Dev Patel',
        clientRole: 'Creative Directors, Brooklyn',
        shootCategory: 'Pre-Wedding',
        rating: 4.9,
        date: 'July 2026',
        comment:
          'Before booking Julian we had zero comfortable photos together. He scouted quiet morning light in Dumbo at 7 AM and guided us naturally—we printed three large-format frames for our reception entrance.',
      },
    ],
  },
  {
    id: 'photog_clara_moreau',
    name: 'Clara Moreau',
    title: 'Editorial Fashion & Studio Portrait Director',
    primaryCategory: 'Fashion',
    specializations: ['Fashion', 'Portrait', 'Product Photography'],
    location: 'Los Angeles, CA',
    rating: 5.0,
    reviewCount: 118,
    hourlyRate: 310,
    startingPackagePrice: 620,
    experienceYears: 9,
    completedShoots: 312,
    avatar: fashionPortraitImg,
    coverImage: fashionPortraitImg,
    bio: 'Paris-trained fashion and portrait photographer operating between Downtown LA daylight lofts and architectural desert locations. Known for sculptural single-source lighting and tactile fabric rendering.',
    equipmentSummary: 'Hasselblad X2D 100C · Profoto Pro-11 Studio Pack · Capture One Live Tethering',
    services: [
      'Seasonal Lookbook & Campaign Direction',
      'Executive & Artist Editorial Portraits',
      'Live Tethered Art Direction Workstation',
      'High-Bitrate 16-bit TIFF Color Grading',
    ],
    availabilityDays: ['Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    availableTimeSlots: ['09:00 AM', '12:00 PM', '03:00 PM', '05:30 PM'],
    turnaroundDays: 5,
    portfolio: [
      {
        id: 'cm_1',
        title: 'Monolith Autumn Lookbook',
        category: 'Fashion',
        image: fashionPortraitImg,
        location: 'Arts District, Los Angeles',
        year: '2026',
        exif: {
          camera: 'Hasselblad X2D 100C',
          lens: 'XCD 55V f/2.5',
          aperture: 'f/5.6',
          shutter: '1/250s',
          iso: 'ISO 64',
        },
      },
      {
        id: 'cm_2',
        title: 'Daylight Loft Portrait Series',
        category: 'Portrait',
        image: photographerAvatarImg,
        location: 'Silver Lake, CA',
        year: '2026',
        exif: {
          camera: 'Hasselblad X2D 100C',
          lens: 'XCD 90V f/2.5',
          aperture: 'f/4.0',
          shutter: '1/320s',
          iso: 'ISO 100',
        },
      },
      {
        id: 'cm_3',
        title: 'Botanical Essence Still Life',
        category: 'Product Photography',
        image: productTravelImg,
        location: 'Culver City Studio, CA',
        year: '2025',
        exif: {
          camera: 'Hasselblad X2D 100C',
          lens: 'XCD 120mm Macro',
          aperture: 'f/8.0',
          shutter: '1/160s',
          iso: 'ISO 64',
        },
      },
    ],
    packages: [
      {
        id: 'pkg_cm_essential',
        name: 'Essential Session',
        recommendedHours: 2,
        price: 620,
        turnaround: '4 business days',
        editedCount: 20,
        features: [
          '2 hours studio or location portrait sitting',
          'Up to 3 wardrobe changes with tethered selection',
          '20 magazine-grade retouched master files',
          'Editorial & personal digital usage rights',
        ],
      },
      {
        id: 'pkg_cm_editorial',
        name: 'Editorial Signature',
        recommendedHours: 4,
        price: 1180,
        turnaround: '5 business days',
        editedCount: 55,
        features: [
          '4 hours lookbook or campaign production',
          '55 retouched high-resolution deliverables',
          'Full Profoto continuous & strobe lighting kit',
          'Global web & social commercial licensing',
        ],
      },
      {
        id: 'pkg_cm_archive',
        name: 'Full Archive Production',
        recommendedHours: 8,
        price: 2280,
        turnaround: '7 business days',
        editedCount: 120,
        features: [
          '8 hours full-day campaign shoot with digital tech',
          '120 retouched 100MP medium-format deliverables',
          'Custom color LUT matching brand guidelines',
          'Express 24-hour press kit selects',
        ],
      },
    ],
    reviews: [
      {
        id: 'rev_cm_1',
        clientName: 'Soren Lindqvist',
        clientRole: 'Founder, Atelier Nord Menswear',
        shootCategory: 'Fashion',
        rating: 5.0,
        date: 'September 2026',
        comment:
          'Our previous e-commerce photos flattened the texture of our raw wool coats. Clara shot our 24-piece collection in four hours with side-lit travertine backdrops, increasing product page conversion by 38% in the first month.',
      },
    ],
  },
  {
    id: 'photog_mateo_silva',
    name: 'Mateo Silva',
    title: 'Luxury Product & Coastal Travel Photographer',
    primaryCategory: 'Product Photography',
    specializations: ['Product Photography', 'Travel Photography', 'Fashion'],
    location: 'San Francisco, CA',
    rating: 4.9,
    reviewCount: 96,
    hourlyRate: 240,
    startingPackagePrice: 480,
    experienceYears: 8,
    completedShoots: 284,
    avatar: photographerAvatarImg,
    coverImage: productTravelImg,
    bio: 'Combining architectural sunlight and precision macro optics for design objects, skincare brands, and boutique hospitality destinations across California and the Mediterranean.',
    equipmentSummary: 'Sony Alpha 1 · 90mm f/2.8 Macro G · Tilt-Shift 50mm f/2.8 · Sunbounce Diffusers',
    services: [
      'Tactile Still Life & Fragrance Campaigns',
      'Boutique Hotel & Architectural Travel Essays',
      'Focus-Stacked Horology & Jewelry Macro',
      'Natural Sunlight & Hard-Shadow Set Design',
    ],
    availabilityDays: ['Mon', 'Tue', 'Wed', 'Fri', 'Sat'],
    availableTimeSlots: ['08:30 AM', '11:30 AM', '02:00 PM', '04:30 PM'],
    turnaroundDays: 4,
    portfolio: [
      {
        id: 'ms_1',
        title: 'Amalfi Citrus Extrait Campaign',
        category: 'Product Photography',
        image: productTravelImg,
        location: 'Big Sur Coast, CA',
        year: '2026',
        exif: {
          camera: 'Sony Alpha 1',
          lens: '90mm f/2.8 Macro G OSS',
          aperture: 'f/8.0',
          shutter: '1/500s',
          iso: 'ISO 100',
        },
      },
      {
        id: 'ms_2',
        title: 'Pacific Cliffside Pavilion',
        category: 'Travel Photography',
        image: heroStudioImg,
        location: 'Carmel-by-the-Sea, CA',
        year: '2026',
        exif: {
          camera: 'Sony Alpha 1',
          lens: '24-70mm f/2.8 GM II',
          aperture: 'f/5.6',
          shutter: '1/800s',
          iso: 'ISO 100',
        },
      },
    ],
    packages: [
      {
        id: 'pkg_ms_essential',
        name: 'Essential Session',
        recommendedHours: 2,
        price: 480,
        turnaround: '3 business days',
        editedCount: 18,
        features: [
          '2 hours dedicated product or travel vignette shoot',
          '18 dust-free retouched hero compositions',
          'Natural stone & linen surface prop library included',
          '4:5, 1:1, and 16:9 pre-cropped masters',
        ],
      },
      {
        id: 'pkg_ms_editorial',
        name: 'Editorial Signature',
        recommendedHours: 5,
        price: 1120,
        turnaround: '5 business days',
        editedCount: 50,
        features: [
          '5 hours studio + outdoor coastal light production',
          '50 high-resolution commercial assets',
          'Custom set styling & botanical sourcing',
          'Perpetual brand digital & print usage license',
        ],
      },
      {
        id: 'pkg_ms_archive',
        name: 'Full Archive Production',
        recommendedHours: 8,
        price: 1790,
        turnaround: '6 business days',
        editedCount: 95,
        features: [
          '8 hours comprehensive brand or resort library shoot',
          '95 color-matched deliverables in TIFF & JPEG',
          'On-site client live review via iPad Pro',
          'Priority 48-hour launch asset delivery',
        ],
      },
    ],
    reviews: [
      {
        id: 'rev_ms_1',
        clientName: 'Camille Laurent',
        clientRole: 'Brand Director, Maison Solis Skincare',
        shootCategory: 'Product Photography',
        rating: 4.9,
        date: 'August 2026',
        comment:
          'We needed glass bottle photography without artificial studio reflections. Mateo shot our entire 8-SKU line on natural coastal limestone in a single afternoon—our retail pitch deck immediately secured two flagship stockists.',
      },
    ],
  },
  {
    id: 'photog_amara_okonkwo',
    name: 'Amara Okonkwo',
    title: 'Live Events, Milestone Birthday & Cultural Gala Photographer',
    primaryCategory: 'Events',
    specializations: ['Events', 'Birthday', 'Portrait'],
    location: 'Chicago, IL',
    rating: 4.8,
    reviewCount: 164,
    hourlyRate: 190,
    startingPackagePrice: 380,
    experienceYears: 7,
    completedShoots: 430,
    avatar: heroStudioImg,
    coverImage: heroStudioImg,
    bio: 'Capturing the kinetic energy of milestone birthdays, museum galas, and private architectural dinners across Chicago. Mastering bounce flash and fast prime lenses so guests feel relaxed and celebratory.',
    equipmentSummary: 'Canon EOS R5 Mark II · RF 28-70mm f/2L · Off-Camera Warm Diffused Strobe',
    services: [
      'Milestone 30th/40th/50th Birthday Soirées',
      'Corporate Keynotes & Cultural Museum Galas',
      'Same-Night 15-Photo Press & Social Dispatch',
      'On-Site Mobile Portrait Lounge Setup',
    ],
    availabilityDays: ['Mon', 'Thu', 'Fri', 'Sat', 'Sun'],
    availableTimeSlots: ['10:00 AM', '01:00 PM', '04:00 PM', '07:00 PM'],
    turnaroundDays: 3,
    portfolio: [
      {
        id: 'ao_1',
        title: 'Fulton Market Glasshouse 40th Soirée',
        category: 'Birthday',
        image: heroStudioImg,
        location: 'West Loop, Chicago',
        year: '2026',
        exif: {
          camera: 'Canon EOS R5 Mark II',
          lens: 'RF 35mm f/1.4L VCM',
          aperture: 'f/2.0',
          shutter: '1/200s',
          iso: 'ISO 800',
        },
      },
      {
        id: 'ao_2',
        title: 'Art Institute Patron Autumn Gala',
        category: 'Events',
        image: weddingEditorialImg,
        location: 'Grant Park, Chicago',
        year: '2026',
        exif: {
          camera: 'Canon EOS R5 Mark II',
          lens: 'RF 28-70mm f/2L USM',
          aperture: 'f/2.2',
          shutter: '1/250s',
          iso: 'ISO 640',
        },
      },
    ],
    packages: [
      {
        id: 'pkg_ao_essential',
        name: 'Essential Session',
        recommendedHours: 2,
        price: 380,
        turnaround: '48 hours',
        editedCount: 80,
        features: [
          '2 hours intimate birthday or cocktail event coverage',
          '80+ candid & group portraits edited in 48 hours',
          '10 same-night highlight frames for immediate sharing',
          'Shareable guest gallery link with one-click downloads',
        ],
      },
      {
        id: 'pkg_ao_editorial',
        name: 'Editorial Signature',
        recommendedHours: 4,
        price: 720,
        turnaround: '3 business days',
        editedCount: 180,
        features: [
          '4 hours full soirée or corporate summit coverage',
          '180+ warm editorial-graded event photographs',
          'Dedicated architectural room & table detail set',
          '25 same-night press/social selects',
        ],
      },
      {
        id: 'pkg_ao_archive',
        name: 'Full Archive Production',
        recommendedHours: 6,
        price: 1080,
        turnaround: '4 business days',
        editedCount: 300,
        features: [
          '6 hours coverage + dedicated mobile portrait backdrop',
          '300+ high-resolution photographs',
          'Studio-lit guest portraits alongside candid roaming',
          'Full commercial & press distribution license',
        ],
      },
    ],
    reviews: [
      {
        id: 'rev_ao_1',
        clientName: 'David Thorne',
        clientRole: 'Principal Architect, Studio Thorne',
        shootCategory: 'Birthday',
        rating: 4.9,
        date: 'September 2026',
        comment:
          'For my wife’s 40th dinner in a dimly lit Fulton Market loft, we feared harsh flash photos. Amara used warm bounced light that preserved the candlelight mood and sent us 20 highlights before breakfast the next morning.',
      },
    ],
  },
  {
    id: 'photog_hana_takahashi',
    name: 'Hana Takahashi',
    title: 'Intimate Pre-Wedding, Portrait & Birthday Storyteller',
    primaryCategory: 'Pre-Wedding',
    specializations: ['Pre-Wedding', 'Birthday', 'Portrait', 'Wedding'],
    location: 'Seattle, WA',
    rating: 4.9,
    reviewCount: 109,
    hourlyRate: 210,
    startingPackagePrice: 420,
    experienceYears: 6,
    completedShoots: 245,
    avatar: weddingEditorialImg,
    coverImage: weddingEditorialImg,
    bio: 'Inspired by Japanese photobooks and Pacific Northwest coastal mist, Hana creates quiet, emotionally resonant pre-wedding essays, milestone birthday portraits, and intimate family commissions.',
    equipmentSummary: 'Fujifilm GFX 100 II · GF 55mm f/1.7 · Contax 645 Medium Format Film',
    services: [
      'Coastal & Alpine Pre-Wedding Sessions',
      'Intimate Milestone Birthday Portraits',
      'Artist & Author Natural-Light Sittings',
      'Archival Fine-Art Cotton Rag Prints',
    ],
    availabilityDays: ['Tue', 'Wed', 'Fri', 'Sat', 'Sun'],
    availableTimeSlots: ['07:30 AM', '10:30 AM', '03:00 PM', '05:30 PM'],
    turnaroundDays: 5,
    portfolio: [
      {
        id: 'ht_1',
        title: 'Bainbridge Ferry Dawn Engagement',
        category: 'Pre-Wedding',
        image: weddingEditorialImg,
        location: 'Puget Sound, WA',
        year: '2026',
        exif: {
          camera: 'Fujifilm GFX 100 II',
          lens: 'GF 55mm f/1.7 R WR',
          aperture: 'f/2.0',
          shutter: '1/1000s',
          iso: 'ISO 160',
        },
      },
      {
        id: 'ht_2',
        title: 'Conservatory 30th Milestone Sitting',
        category: 'Birthday',
        image: fashionPortraitImg,
        location: 'Volunteer Park, Seattle',
        year: '2026',
        exif: {
          camera: 'Fujifilm GFX 100 II',
          lens: 'GF 80mm f/1.7 R WR',
          aperture: 'f/2.2',
          shutter: '1/640s',
          iso: 'ISO 200',
        },
      },
    ],
    packages: [
      {
        id: 'pkg_ht_essential',
        name: 'Essential Session',
        recommendedHours: 2,
        price: 420,
        turnaround: '5 business days',
        editedCount: 60,
        features: [
          '2 hours natural-light portrait or pre-wedding session',
          '60 fine-art color & monochrome edited stills',
          'Location scouting guide across 15 Pacific NW spots',
          'High-res print & web download archive',
        ],
      },
      {
        id: 'pkg_ht_editorial',
        name: 'Editorial Signature',
        recommendedHours: 4,
        price: 800,
        turnaround: '6 business days',
        editedCount: 130,
        features: [
          '4 hours dual-location adventure or celebration shoot',
          '130 retouched medium-format digital + film frames',
          'Complimentary 8x10 Hahnemühle fine-art print set',
          'Wardrobe palette & styling moodboard',
        ],
      },
      {
        id: 'pkg_ht_archive',
        name: 'Full Archive Production',
        recommendedHours: 7,
        price: 1390,
        turnaround: '8 business days',
        editedCount: 250,
        features: [
          '7 hours full pre-wedding or intimate wedding story',
          '250+ edited frames + custom layflat photobook',
          'Sunrise + sunset split-session scheduling option',
          'Priority 48-hour preview gallery',
        ],
      },
    ],
    reviews: [
      {
        id: 'rev_ht_1',
        clientName: 'Linnea & Jonas Berg',
        clientRole: 'Product Designers, Capitol Hill',
        shootCategory: 'Pre-Wedding',
        rating: 5.0,
        date: 'July 2026',
        comment:
          'Even when overcast drizzle rolled over Discovery Park, Hana turned the mist into the most poetic light we have ever seen. The 100MP medium-format detail is extraordinary.',
      },
    ],
  },
  {
    id: 'photog_lucas_bennett',
    name: 'Lucas Bennett',
    title: 'Expedition Travel, Hospitality & Lifestyle Photographer',
    primaryCategory: 'Travel Photography',
    specializations: ['Travel Photography', 'Events', 'Product Photography'],
    location: 'Austin, TX',
    rating: 4.8,
    reviewCount: 87,
    hourlyRate: 230,
    startingPackagePrice: 460,
    experienceYears: 10,
    completedShoots: 268,
    avatar: productTravelImg,
    coverImage: productTravelImg,
    bio: 'Documenting architectural boutique hotels, culinary retreats, and destination travel essays across the American Southwest and abroad. Delivering sunlit, editorial narratives with authentic sense of place.',
    equipmentSummary: 'Leica Q3 43 · Nikon Z8 · 24-70mm f/2.8 S · FAA Part 107 Aerial Cinema Drone',
    services: [
      'Hospitality & Architectural Resort Commissions',
      'Destination Travel & Solo/Couple Essays',
      'FAA-Licensed Aerial Architectural Perspectives',
      'Culinary & Artisanal Craft Documentation',
    ],
    availabilityDays: ['Mon', 'Tue', 'Thu', 'Fri', 'Sat', 'Sun'],
    availableTimeSlots: ['07:00 AM', '10:00 AM', '03:30 PM', '06:00 PM'],
    turnaroundDays: 5,
    portfolio: [
      {
        id: 'lb_1',
        title: 'Marfa Adobe Courtyard Dawn',
        category: 'Travel Photography',
        image: productTravelImg,
        location: 'Hill Country, Austin TX',
        year: '2026',
        exif: {
          camera: 'Leica Q3',
          lens: 'Summilux 28mm f/1.7 ASPH',
          aperture: 'f/4.0',
          shutter: '1/1000s',
          iso: 'ISO 100',
        },
      },
      {
        id: 'lb_2',
        title: 'South Congress Mezcal Launch',
        category: 'Events',
        image: heroStudioImg,
        location: 'Austin, TX',
        year: '2026',
        exif: {
          camera: 'Nikon Z8',
          lens: 'NIKKOR Z 50mm f/1.2 S',
          aperture: 'f/1.8',
          shutter: '1/400s',
          iso: 'ISO 250',
        },
      },
    ],
    packages: [
      {
        id: 'pkg_lb_essential',
        name: 'Essential Session',
        recommendedHours: 2,
        price: 460,
        turnaround: '4 business days',
        editedCount: 45,
        features: [
          '2 hours destination travel or property session',
          '45 editorial color-graded photographs',
          'Architectural + lifestyle composition balance',
          'Full personal & hospitality social usage',
        ],
      },
      {
        id: 'pkg_lb_editorial',
        name: 'Editorial Signature',
        recommendedHours: 4,
        price: 880,
        turnaround: '5 business days',
        editedCount: 100,
        features: [
          '4 hours golden-hour + blue-hour coverage',
          '100 high-resolution deliverables + aerial perspectives',
          'Shot list tailored for publication & press pitches',
          '48-hour express highlight selects',
        ],
      },
      {
        id: 'pkg_lb_archive',
        name: 'Full Archive Production',
        recommendedHours: 8,
        price: 1680,
        turnaround: '7 business days',
        editedCount: 220,
        features: [
          '8 hours dawn-to-dusk property & lifestyle commission',
          '220+ retouched master files in print & web formats',
          'Complete commercial hospitality licensing',
          'Dedicated production assistant',
        ],
      },
    ],
    reviews: [
      {
        id: 'rev_lb_1',
        clientName: 'Sofia Mendoza',
        clientRole: 'General Manager, Casa Loma Boutique Hotel',
        shootCategory: 'Travel Photography',
        rating: 4.8,
        date: 'June 2026',
        comment:
          'Lucas captured our courtyard suites and limestone pool at sunrise with zero disruption to guests. Condé Nast Traveler picked up two of his frames for their Southwest feature.',
      },
    ],
  },
  {
    id: 'photog_nadia_koury',
    name: 'Nadia Koury',
    title: 'Architectural Portrait, Executive & Fashion Specialist',
    primaryCategory: 'Portrait',
    specializations: ['Portrait', 'Fashion', 'Events'],
    location: 'Boston, MA',
    rating: 4.9,
    reviewCount: 127,
    hourlyRate: 180,
    startingPackagePrice: 360,
    experienceYears: 8,
    completedShoots: 356,
    avatar: photographerAvatarImg,
    coverImage: photographerAvatarImg,
    bio: 'Specializing in dignified, magazine-caliber portraits for authors, executives, musicians, and creative teams. Nadia’s calm direction transforms camera-shy subjects within minutes.',
    equipmentSummary: 'Sony A7R V · 85mm f/1.4 GM II · 50mm f/1.2 GM · Profoto B10X Plus',
    services: [
      'Author, Founder & Executive Editorial Portraits',
      'Academic & Creative Team Directory Sessions',
      'Musician Album Jacket & Press Kit Sittings',
      'Express On-Site Tethered Selection',
    ],
    availabilityDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    availableTimeSlots: ['09:00 AM', '11:30 AM', '02:00 PM', '04:30 PM'],
    turnaroundDays: 3,
    portfolio: [
      {
        id: 'nk_1',
        title: 'Beacon Hill Literary Portrait',
        category: 'Portrait',
        image: photographerAvatarImg,
        location: 'Beacon Hill, Boston',
        year: '2026',
        exif: {
          camera: 'Sony A7R V',
          lens: '85mm f/1.4 GM II',
          aperture: 'f/2.0',
          shutter: '1/500s',
          iso: 'ISO 125',
        },
      },
      {
        id: 'nk_2',
        title: 'Back Bay Minimalist Silhouette',
        category: 'Fashion',
        image: fashionPortraitImg,
        location: 'Back Bay, Boston',
        year: '2026',
        exif: {
          camera: 'Sony A7R V',
          lens: '50mm f/1.2 GM',
          aperture: 'f/2.8',
          shutter: '1/640s',
          iso: 'ISO 100',
        },
      },
    ],
    packages: [
      {
        id: 'pkg_nk_essential',
        name: 'Essential Session',
        recommendedHours: 2,
        price: 360,
        turnaround: '3 business days',
        editedCount: 15,
        features: [
          '2 hours studio or architectural location sitting',
          '15 natural skin-texture retouched portraits',
          'Live iPad tethering to review posture & expression',
          '3 wardrobe looks included',
        ],
      },
      {
        id: 'pkg_nk_editorial',
        name: 'Editorial Signature',
        recommendedHours: 4,
        price: 680,
        turnaround: '4 business days',
        editedCount: 40,
        features: [
          '4 hours multi-backdrop portrait & press kit shoot',
          '40 high-resolution color & B&W masters',
          'Indoor studio + historic streetscape walk',
          'Full press, book jacket & keynote usage rights',
        ],
      },
      {
        id: 'pkg_nk_archive',
        name: 'Full Archive Production',
        recommendedHours: 6,
        price: 990,
        turnaround: '5 business days',
        editedCount: 75,
        features: [
          '6 hours leadership team or personal brand archive',
          '75 retouched images across up to 8 team members',
          'Consistent lighting blueprint for future hires',
          '24-hour rush delivery on top 10 selects',
        ],
      },
    ],
    reviews: [
      {
        id: 'rev_nk_1',
        clientName: 'Dr. Helena Vance-Sterling',
        clientRole: 'MIT Press Author & Fellow',
        shootCategory: 'Portrait',
        rating: 5.0,
        date: 'September 2026',
        comment:
          'I had used the same stiff headshot for eight years because I dread being photographed. Nadia showed me frames live on her monitor as we adjusted window light—my publisher immediately selected her first frame for my hardcover jacket.',
      },
    ],
  },
  {
    id: 'photog_devon_brooks',
    name: 'Devon Brooks',
    title: 'Coastal Wedding, Birthday & Destination Event Photographer',
    primaryCategory: 'Birthday',
    specializations: ['Birthday', 'Wedding', 'Events', 'Travel Photography'],
    location: 'Miami, FL',
    rating: 4.7,
    reviewCount: 91,
    hourlyRate: 160,
    startingPackagePrice: 320,
    experienceYears: 5,
    completedShoots: 210,
    avatar: heroStudioImg,
    coverImage: weddingEditorialImg,
    bio: 'Bringing warm tropical film tones and effortless documentary pacing to Miami Beach milestone celebrations, yacht birthdays, and coastal weddings.',
    equipmentSummary: 'Nikon Z9 · 35mm f/1.2 S · 85mm f/1.2 S · Contax T2 35mm Point-and-Shoot',
    services: [
      'Private Villa & Yacht Milestone Birthdays',
      'Coastal Sunset Weddings & Rehearsal Dinners',
      'Art Basel & Design District Brand Events',
      'Express 24-Hour Social Reel & Still Package',
    ],
    availabilityDays: ['Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    availableTimeSlots: ['09:30 AM', '01:30 PM', '04:30 PM', '07:30 PM'],
    turnaroundDays: 3,
    portfolio: [
      {
        id: 'db_1',
        title: 'Coconut Grove Villa 30th Celebration',
        category: 'Birthday',
        image: heroStudioImg,
        location: 'Coconut Grove, Miami',
        year: '2026',
        exif: {
          camera: 'Nikon Z9',
          lens: '35mm f/1.2 S',
          aperture: 'f/1.8',
          shutter: '1/500s',
          iso: 'ISO 200',
        },
      },
      {
        id: 'db_2',
        title: 'Vizcaya Sunset Terrace Ceremony',
        category: 'Wedding',
        image: weddingEditorialImg,
        location: 'Key Biscayne, FL',
        year: '2026',
        exif: {
          camera: 'Nikon Z9',
          lens: '85mm f/1.2 S',
          aperture: 'f/2.0',
          shutter: '1/1250s',
          iso: 'ISO 64',
        },
      },
    ],
    packages: [
      {
        id: 'pkg_db_essential',
        name: 'Essential Session',
        recommendedHours: 2,
        price: 320,
        turnaround: '48 hours',
        editedCount: 70,
        features: [
          '2 hours birthday party, dinner, or portrait coverage',
          '70 warm film-graded high-resolution images',
          '24-hour express highlight preview',
          'Online gallery with instant guest access',
        ],
      },
      {
        id: 'pkg_db_editorial',
        name: 'Editorial Signature',
        recommendedHours: 4,
        price: 600,
        turnaround: '3 business days',
        editedCount: 160,
        features: [
          '4 hours milestone celebration or coastal event',
          '160 edited digital stills + 1 roll 35mm film',
          'Sunset portrait session + evening party coverage',
          'Full print & digital download rights',
        ],
      },
      {
        id: 'pkg_db_archive',
        name: 'Full Archive Production',
        recommendedHours: 6,
        price: 890,
        turnaround: '4 business days',
        editedCount: 260,
        features: [
          '6 hours full weekend celebration coverage',
          '260+ retouched photographs',
          'Dedicated assistant for off-camera evening lighting',
          'Custom linen keepsake box with 30 prints',
        ],
      },
    ],
    reviews: [
      {
        id: 'rev_db_1',
        clientName: 'Gabriela Reyes',
        clientRole: 'Hospitality Consultant, Brickell',
        shootCategory: 'Birthday',
        rating: 4.8,
        date: 'August 2026',
        comment:
          'Devon photographed my 30th sunset dinner on a terrace in Coconut Grove. Every single guest asked for his contact because the photos felt like a vintage Mediterranean summer.',
      },
    ],
  },
];
