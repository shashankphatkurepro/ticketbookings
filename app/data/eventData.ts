export const eventData = {
  title: "New Year's Eve 2026",
  subtitle: "The Ultimate Celebration",
  date: "31st December 2025",
  time: "7:00 PM onwards",
  duration: "6+ Hours",
  ageRestriction: "All Ages",
  languages: ["Hindi", "English", "Marathi"],
  genres: ["Video Dj", "Night"],
  interestedCount: 2500,

  description: `Get ready for the most spectacular New Year's Eve celebration at Mangozzz Magical World Resort! Join us for an unforgettable night filled with music, dance, gourmet food, and magical moments as we countdown to 2026.

Experience world-class DJ performances, live entertainment, unlimited premium buffet, and breathtaking fireworks display at midnight. Our resort offers the perfect blend of luxury and excitement for families, couples, and friends alike.

Don't miss this once-in-a-year opportunity to celebrate in style at one of Maharashtra's most beautiful resorts!`,

  venue: {
    name: "Mangozzz Magical World Resort",
    address: "At. Asare Wadi, Post. Chowk, Near Swaminarayan Gurukul School, Tal. Khalapur",
    city: "Karjat, Chowk",
    mapUrl: "https://maps.google.com/?q=Mangozzz+Resort+Shahapur",
  },

  images: [
    "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1600",
    "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1600",
    "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=1600",
  ],

  tickets: [
    {
      id: "kids-5-9",
      name: "Kids 5–9 Years",
      description: "Entry for kids aged 5-9 years",
      price: 649,
      originalPrice: 999,
      available: 100,
      maxPerOrder: 30,
      popular: false,
    },
    {
      id: "kids-10-15",
      name: "Kids 10–15 Years",
      description: "Entry for kids aged 10-15 years",
      price: 1099,
      originalPrice: 1999,
      available: 100,
      maxPerOrder: 30,
      popular: false,
    },
    {
      id: "stag-entry",
      name: "Stag Entry (Single)",
      description: "Single entry with unlimited food",
      price: 1299,
      originalPrice: 2499,
      available: 200,
      maxPerOrder: 30,
      popular: false,
    },
    {
      id: "couple-entry",
      name: "Couple Entry",
      description: "Entry for 2 with unlimited food",
      price: 2499,
      originalPrice: 4499,
      available: 150,
      maxPerOrder: 30,
      popular: true,
    },
    {
      id: "group-5-10",
      name: "Group of 5–10",
      description: "Group entry for 5-10 people (per head)",
      price: 1199,
      originalPrice: 1999,
      available: 100,
      maxPerOrder: 30,
      popular: false,
    },
    {
      id: "group-10-20",
      name: "Group of 10–20",
      description: "Group entry for 10-20 people (per head)",
      price: 1099,
      originalPrice: 1799,
      available: 100,
      maxPerOrder: 30,
      popular: false,
    },
    {
      id: "group-20-30",
      name: "Group of 20–30",
      description: "Group entry for 20-30 people (per head)",
      price: 999,
      originalPrice: 1599,
      available: 100,
      maxPerOrder: 30,
      popular: false,
    },
  ],

  highlights: [
    "Unlimited Gourmet Buffet",
    "Premium Drinks Package",
    "Live DJ & Dance Floor",
    "Spectacular Fireworks",
    "Pool Party Access",
    "Adventure Activities",
    "Kids Play Zone",
    "Photo Booth",
    "Bonfire Night",
    "Live Performances",
  ],

  activities: [
    "DJ Night & Dance Floor",
    "Swimming Pool Party",
    "Rain Dance Arena",
    "Adventure Sports",
    "Kids Game Zone",
    "Bonfire & BBQ",
    "Karaoke Lounge",
    "Photo Corners",
    "Fireworks Display",
  ],

  coolDrinks: [
    { name: "Teachers", type: "Scotch" },
    { name: "Black & White", type: "Scotch" },
    { name: "Blenders Pride", type: "Whisky" },
    { name: "Sula Wine", type: "Wine" },
    { name: "Old Monk", type: "Rum" },
    { name: "Bacardi Carta Blanca", type: "Rum" },
    { name: "Budweiser", type: "Beer" },
    { name: "Sula Satori", type: "Wine" },
    { name: "Smirnoff", type: "Vodka" },
    { name: "Romanov", type: "Vodka" },
  ],

  foodMenu: {
    starters: {
      veg: ["Corn Spinach", "Hara Bhara Kabab", "Paneer Chilli Dry", "Paneer Tikka"],
      nonVeg: ["Chicken Chilli Dry", "Kebab", "Chicken Malayani"],
    },
    soup: ["Veg Manchow"],
    mainCourse: {
      veg: ["Paneer Lababdar", "Veg Handi", "Jeera Rice", "Pad Fry"],
      nonVeg: ["Chicken Masala", "Chicken Hyderabadi Biryani"],
    },
    bread: ["Assorted Rotis"],
    dessert: ["Gulab Jamun", "Ice Cream"],
  },

  amenities: [
    "Free Parking",
    "Valet Service",
    "First Aid",
    "Security 24/7",
    "Clean Restrooms",
    "Baby Care Room",
    "Wheelchair Access",
    "Locker Facility",
  ],

  faqs: [
    {
      question: "What is included in the ticket price?",
      answer: "All tickets include entry to the event, unlimited buffet dinner, access to all entertainment areas, pool access, and the midnight fireworks show. Drink packages vary by ticket type.",
    },
    {
      question: "Is there an age restriction?",
      answer: "The event is open to all ages. Children under 5 years enter free with a paying adult. Kids' tickets are available for children aged 5-12 years.",
    },
    {
      question: "What is the cancellation policy?",
      answer: "Full refund if cancelled 7 days before the event. 50% refund for cancellations 3-7 days prior. No refunds within 72 hours of the event.",
    },
    {
      question: "Is parking available?",
      answer: "Yes, free parking is available for all guests. Valet parking service is also available at the venue.",
    },
    {
      question: "What should I wear?",
      answer: "Smart casuals or party wear is recommended. Please carry swimwear if you plan to use the pool. Comfortable footwear is advised.",
    },
  ],

  terms: [
    "Entry is subject to valid ticket/booking confirmation",
    "Management reserves the right to deny entry without explanation",
    "Outside food and beverages are not permitted",
    "The event will proceed rain or shine",
    "Photography for personal use only",
    "Guests must follow all safety guidelines",
    "Children must be accompanied by adults at all times",
    "Management is not responsible for lost valuables",
  ],
};

export const resortInfo = {
  name: "Mangozzz Magical World Resort",
  tagline: "Where Every Moment Becomes Magical",
  phone: "+91 7977127312",
  email: "bookings@mangozzz.com",
  website: "https://mangozzz.com",
  nearbyAttractions: ["Bhandardara Lake", "Randha Falls", "Ratangad Fort"],
  socialMedia: {
    facebook: "https://facebook.com/mangozzzresort",
    instagram: "https://instagram.com/mangozzzresort",
    twitter: "https://twitter.com/mangozzzresort",
  },
};
