import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const Home = () => {
  const { isAuthenticated, user } = useAuth();
  const [slide, setSlide] = useState(0);
  // Generic image fallback helper
  const imgFallback = (fallbackUrl) => (e) => {
    const el = e.currentTarget;
    if (el.dataset.fallbackApplied) return; // avoid loops
    el.dataset.fallbackApplied = '1';
    el.src = fallbackUrl;
  };
  const slides = [
    {
      title: 'Seamless Flight Booking',
      subtitle: 'Search, compare, and book in minutes',
      bg: 'from-indigo-600 to-fuchsia-600',
    },
    {
      title: 'Global Destinations',
      subtitle: 'From Dubai to Tokyo and beyond',
      bg: 'from-sky-500 to-indigo-600',
    },
    {
      title: 'Fly With Confidence',
      subtitle: 'Modern fleet. Exceptional service.',
      bg: 'from-purple-600 to-pink-600',
    },
  ];

  const partnersRef = useRef(null);

  useEffect(() => {
    const id = setInterval(() => setSlide((s) => (s + 1) % slides.length), 5000);
    return () => clearInterval(id);
  }, []);

  // Auto-scroll partners slider
  useEffect(() => {
    const el = partnersRef.current;
    if (!el) return;
    const timer = setInterval(() => {
      el.scrollBy({ left: 220, behavior: 'smooth' });
      if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 5) {
        el.scrollTo({ left: 0, behavior: 'smooth' });
      }
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen w-full">
      {/* Hero Carousel */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?q=80&w=2000&auto=format&fit=crop"
            alt="Airplane wing over clouds"
            className="h-full w-full object-cover"
            onError={imgFallback('https://images.unsplash.com/photo-1502920917128-ca07cf9746fc?q=80&w=2000&auto=format&fit=crop')}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-36">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={slide}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                >
                  <h1 className="text-4xl md:text-6xl font-extrabold leading-tight text-white">
                    <span className={`bg-clip-text text-transparent bg-gradient-to-r ${slides[slide].bg}`}>
                      {slides[slide].title}
                    </span>
                  </h1>
                  <p className="mt-4 text-lg md:text-xl text-gray-100">
                    {slides[slide].subtitle}
                  </p>
                  <div className="mt-8 flex flex-wrap gap-4">
                    {isAuthenticated ? (
                      <>
                        {user?.role === 'customer' ? (
                          <>
                            <Link to="/customer/search" className="px-6 py-3 rounded-lg bg-white text-indigo-700 ring-1 ring-black/5 hover:bg-indigo-50">
                              Search Flights
                            </Link>
                            <Link to="/customer/bookings" className="px-6 py-3 rounded-lg bg-white text-indigo-700 ring-1 ring-black/5 hover:bg-indigo-50">
                              My Bookings
                            </Link>
                          </>
                        ) : (
                          <>
                            <Link to="/employee/dashboard" className="px-6 py-3 rounded-lg bg-white text-indigo-700 ring-1 ring-black/5 hover:bg-indigo-50">
                              Employee Dashboard
                            </Link>
                            <Link to="/employee/profile" className="px-6 py-3 rounded-lg bg-white text-indigo-700 ring-1 ring-black/5 hover:bg-indigo-50">
                              Profile
                            </Link>
                          </>
                        )}
                      </>
                    ) : (
                      <>
                        <Link to="/login" className="px-6 py-3 rounded-lg bg-white text-indigo-700 ring-1 ring-black/5 hover:bg-indigo-50">
                          Sign In
                        </Link>
                        <Link to="/register" className="px-6 py-3 rounded-lg bg-white text-indigo-700 ring-1 ring-black/5 hover:bg-indigo-50">
                          Create Account
                        </Link>
                      </>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>
              <div className="flex gap-2 mt-6">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setSlide(i)}
                    className={`h-2 w-8 rounded-full ${i === slide ? 'bg-white' : 'bg-white/50'}`}
                    aria-label={`Go to slide ${i + 1}`}
                  />
                ))}
              </div>
            </div>
            <div className="relative hidden md:block">
              <img
                src="https://images.unsplash.com/photo-1502920917128-ca07cf9746fc?q=80&w=1600&auto=format&fit=crop"
                alt="Modern aircraft on runway"
                className="rounded-2xl shadow-2xl ring-1 ring-white/20 object-cover h-[420px] w-full"
                onError={imgFallback('https://images.unsplash.com/photo-1535223289827-42f1e9919769?q=80&w=1600&auto=format&fit=crop')}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Travel Tips / Blog */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <h2 className="text-3xl font-bold mb-8">Travel Tips & News</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: 'Maximize your miles on every trip', img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format&fit=crop' },
              { title: 'How to find the best off-peak fares', img: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?q=80&w=1200&auto=format&fit=crop' },
              { title: 'Business class: when does it pay off?', img: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?q=80&w=1200&auto=format&fit=crop' },
              { title: 'Carry-on packing checklist (pro tips)', img: 'https://images.unsplash.com/photo-1519222970733-f546218fa6d7?q=80&w=1200&auto=format&fit=crop' },
              { title: 'Airport lounge hacks you should know', img: 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?q=80&w=1200&auto=format&fit=crop' },
              { title: 'Red-eye flights: sleep better in the air', img: 'https://images.unsplash.com/photo-1517959105821-eaf2591984dd?q=80&w=1200&auto=format&fit=crop' },
            ].map((p, i) => (
              <div key={i} className="rounded-2xl overflow-hidden border border-gray-200 bg-white shadow-sm hover:shadow-md transition">
                <img src={p.img} alt="post" className="h-44 w-full object-cover" onError={imgFallback('https://images.unsplash.com/photo-1501862700950-18382cd41497?q=80&w=1200&auto=format&fit=crop')} />
                <div className="p-5">
                  <p className="font-semibold">{p.title}</p>
                  <p className="mt-2 text-sm text-gray-600">Read more →</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FAQs */}
      <div className="bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <h2 className="text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              { q: 'Can I change my booking after purchase?', a: 'Yes, most fares allow changes with a fee. Visit My Bookings to manage your trip.' },
              { q: 'Do you offer student discounts?', a: 'We frequently run promotions and offer special fares. Subscribe to our newsletter for alerts.' },
              { q: 'What payment methods are accepted?', a: 'We accept major cards and UPI. All transactions are encrypted and secure.' },
              { q: 'How much baggage can I carry?', a: 'Baggage allowance depends on route and fare class. Details are shown during booking and in your confirmation email.' },
              { q: 'When do online check-in and seat selection open?', a: 'Online check-in opens 24–48 hours before departure depending on the route. You can select seats during check‑in.' },
              { q: 'Do you send fare alerts?', a: 'Yes. Subscribe in the newsletter section to receive personalized fare alerts and tips.' },
            ].map((f, i) => (
              <details key={i} className="group border border-gray-200 rounded-xl bg-white p-4">
                <summary className="cursor-pointer list-none flex items-center justify-between">
                  <span className="font-semibold">{f.q}</span>
                  <span className="text-indigo-600 group-open:rotate-45 transition">+</span>
                </summary>
                <p className="mt-2 text-gray-600">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </div>

      {/* In-flight Experience */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <h2 className="text-3xl font-bold mb-8">In‑flight Experience</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { t: 'Next‑gen seats', d: 'Ergonomic design, extra legroom options, and USB‑C at every seat.', img: 'https://images.unsplash.com/photo-1511732351157-1865efcb7b7b?q=80&w=1200&auto=format&fit=crop' },
              { t: 'Cuisine you’ll love', d: 'Seasonal menus with regional favorites and special meal requests.', img: 'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?q=80&w=1200&auto=format&fit=crop' },
              { t: 'Wi‑Fi & entertainment', d: 'Stream, browse, and enjoy a curated library of movies and music.', img: 'https://images.unsplash.com/photo-1495567720989-cebdbdd97913?q=80&w=1200&auto=format&fit=crop' },
            ].map((c, i) => (
              <div key={i} className="rounded-2xl overflow-hidden border border-gray-200 bg-white shadow-sm">
                <img src={c.img} alt={c.t} className="h-52 w-full object-cover" onError={imgFallback('https://images.unsplash.com/photo-1511732351157-1865efcb7b7b?q=80&w=1200&auto=format&fit=crop')} />
                <div className="p-5">
                  <h3 className="font-semibold">{c.t}</h3>
                  <p className="mt-2 text-gray-600 text-sm">{c.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Awards & Certifications */}
      <div className="bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <h2 className="text-3xl font-bold mb-8">Awards & Certifications</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { t: 'Skytrax 2025', s: 'Top Regional Airline' },
              { t: 'Aviation Safety', s: 'IATA Certified' },
              { t: 'Customer Delight', s: 'CSAT 4.7/5' },
              { t: 'Green Operations', s: 'CarbonSmart Gold' },
            ].map((a, i) => (
              <div key={i} className="p-6 rounded-xl bg-white border border-gray-200 text-center shadow-sm">
                <p className="text-xl font-extrabold text-indigo-600">{a.t}</p>
                <p className="mt-2 text-sm text-gray-600">{a.s}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Popular Destinations (Carousel) */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">Popular Destinations</h2>
            <Link to={isAuthenticated && user?.role === 'customer' ? '/customer/search' : '/login'} className="text-indigo-600 hover:text-indigo-700 font-semibold">Explore flights →</Link>
          </div>
          <Slider
            dots={false}
            infinite
            speed={500}
            slidesToShow={4}
            slidesToScroll={1}
            autoplay
            autoplaySpeed={2500}
            responsive={[
              { breakpoint: 1280, settings: { slidesToShow: 3 } },
              { breakpoint: 1024, settings: { slidesToShow: 2 } },
              { breakpoint: 640, settings: { slidesToShow: 1 } },
            ]}
            className="!overflow-visible"
          >
            {[
              { city: 'Dubai', code: 'DXB', img: 'https://images.unsplash.com/photo-1526772662000-3f88f10405ff?q=80&w=1200&auto=format&fit=crop' },
              { city: 'Tokyo', code: 'NRT', img: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=1200&auto=format&fit=crop' },
              { city: 'London', code: 'LHR', img: 'https://images.unsplash.com/photo-1471623320832-44cd264c9a50?q=80&w=1200&auto=format&fit=crop' },
              { city: 'New York', code: 'JFK', img: 'https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?q=80&w=1200&auto=format&fit=crop' },
              { city: 'Singapore', code: 'SIN', img: 'https://images.unsplash.com/photo-1509228627152-72ae9ae6848d?q=80&w=1200&auto=format&fit=crop' },
            ].map((d, i) => (
              <div key={i} className="px-2">
                <div className="group relative overflow-hidden rounded-2xl shadow hover:shadow-lg transition">
                  <img src={d.img} alt={d.city} className="h-64 w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={imgFallback('https://images.unsplash.com/photo-1470240731273-7821a6eeb6bd?q=80&w=1200&auto=format&fit=crop')}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/10" />
                  <div className="absolute bottom-4 left-4 text-white">
                    <p className="text-lg font-semibold">{d.city}</p>
                    <p className="text-sm opacity-90">{d.code}</p>
                  </div>
                </div>
              </div>
            ))}
          </Slider>
        </div>
      </div>

      {/* Featured Deals (Carousel) */}
      <div className="bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">Featured Deals</h2>
            <Link to={isAuthenticated && user?.role === 'customer' ? '/customer/search' : '/login'} className="text-indigo-600 hover:text-indigo-700 font-semibold">View all →</Link>
          </div>
          <Slider
            dots
            infinite
            speed={500}
            slidesToShow={3}
            slidesToScroll={1}
            autoplay
            autoplaySpeed={3500}
            responsive={[
              { breakpoint: 1280, settings: { slidesToShow: 3 } },
              { breakpoint: 1024, settings: { slidesToShow: 2 } },
              { breakpoint: 640, settings: { slidesToShow: 1 } },
            ]}
            className="!overflow-visible"
          >
            {[
              { route: 'Dubai → Tokyo', price: 499, class: 'Economy', img: 'https://images.unsplash.com/photo-1516397281156-ca07cf9746fc?q=80&w=1200&auto=format&fit=crop' },
              { route: 'London → New York', price: 899, class: 'Business', img: 'https://images.unsplash.com/photo-1502920514313-52581002a659?q=80&w=1200&auto=format&fit=crop' },
              { route: 'Tokyo → Dubai', price: 520, class: 'Economy', img: 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?q=80&w=1200&auto=format&fit=crop' },
              { route: 'Delhi → Singapore', price: 350, class: 'Economy', img: 'https://images.unsplash.com/photo-1535223289827-42f1e9919769?q=80&w=1200&auto=format&fit=crop' },
            ].map((deal, i) => (
              <div key={i} className="px-2">
                <div className="overflow-hidden rounded-2xl bg-white shadow hover:shadow-lg transition">
                  <div className="relative">
                    <img src={deal.img} alt={deal.route} className="h-56 w-full object-cover"
                         onError={imgFallback('https://images.unsplash.com/photo-1535223289827-42f1e9919769?q=80&w=1200&auto=format&fit=crop')} />
                    <span className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-sm font-semibold">{deal.class}</span>
                  </div>
                  <div className="p-5">
                    <p className="font-semibold">{deal.route}</p>
                    <p className="mt-1 text-sm text-gray-600">Limited-time offer</p>
                    <div className="mt-4 flex items-center justify-between">
                      <p className="text-2xl font-extrabold text-indigo-600">${deal.price}</p>
                      <Link to={isAuthenticated && user?.role === 'customer' ? '/customer/search' : '/login'} className="px-4 py-2 rounded-md bg-white text-indigo-700 ring-1 ring-black/5 hover:bg-indigo-50">Book now</Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </Slider>
        </div>
      </div>

      {/* Company Info */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: '24/7 Support', desc: 'Dedicated support team to assist you anytime, anywhere.' },
              { title: 'Reliable & On-time', desc: 'We value your time. High on-time performance and reliability.' },
              { title: 'Secure Payments', desc: 'Encrypted transactions and multiple payment options.' },
            ].map((f, idx) => (
              <div key={idx} className="p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition">
                <h3 className="text-xl font-semibold mb-2">{f.title}</h3>
                <p className="text-gray-600">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Why Us */}
      <div className="bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-3xl font-bold text-center mb-10">Why Choose HCL Airlines</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'Transparent Pricing', desc: 'No hidden fees. Clear breakdown before you pay.' },
              { title: 'Flexible Options', desc: 'Choose Economy or Business with real-time seat availability.' },
              { title: 'Instant Confirmations', desc: 'Immediate email with your boarding pass PDF.' },
              { title: 'Loyalty Benefits', desc: 'Earn rewards and unlock exclusive perks.' },
            ].map((item, i) => (
              <div key={i} className="p-6 rounded-xl bg-white border border-gray-200 shadow-sm">
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[{ k: 'Destinations', v: '120+' }, { k: 'Daily Flights', v: '800+' }, { k: 'Happy Travelers', v: '2M+' }, { k: 'On-time Rate', v: '93%' }].map((m, i) => (
              <div key={i} className="p-6 rounded-xl border border-gray-200 bg-white shadow-sm">
                <p className="text-3xl font-extrabold text-indigo-600">{m.v}</p>
                <p className="mt-1 text-sm text-gray-600">{m.k}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Loyalty Program */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <img
              src="https://images.unsplash.com/photo-1529074963764-98f45c47344b?q=80&w=1600&auto=format&fit=crop"
              alt="Loyalty program"
              className="rounded-2xl shadow"
            />
            <div>
              <h2 className="text-3xl font-bold">HCL Airlines Rewards</h2>
              <p className="mt-3 text-gray-600">Earn miles on every trip and elevate your status to enjoy lounge access, extra baggage, and priority boarding.</p>
              <ul className="mt-6 space-y-2 text-gray-700 list-disc list-inside">
                <li>Earn 1 mile for every $50 spent</li>
                <li>Tiered benefits: Silver, Gold, Platinum</li>
                <li>Redeem miles for flights and upgrades</li>
              </ul>
              <div className="mt-6">
                <Link to={isAuthenticated ? '/customer/profile' : '/register'} className="px-5 py-2.5 rounded-md bg-white text-indigo-700 ring-1 ring-black/5 hover:bg-indigo-50">Join for free</Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-3xl font-bold text-center mb-10">What Our Travelers Say</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: 'Aisha K.', text: 'Smooth booking and excellent service. My Dubai to Tokyo trip was perfect!', img: 'https://randomuser.me/api/portraits/women/65.jpg' },
              { name: 'Daniel R.', text: 'Great deals and on-time flights. Highly recommend HCL Airlines!', img: 'https://randomuser.me/api/portraits/men/14.jpg' },
              { name: 'Meera S.', text: 'Customer support was super helpful with a last-minute change.', img: 'https://randomuser.me/api/portraits/women/44.jpg' },
            ].map((t, i) => (
              <div key={i} className="p-6 rounded-2xl bg-white shadow border border-gray-200">
                <div className="flex items-center gap-3">
                  <img src={t.img} alt={t.name} className="h-12 w-12 rounded-full object-cover"
                       onError={imgFallback('https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop')} />
                  <p className="font-semibold">{t.name}</p>
                </div>
                <p className="mt-4 text-gray-600">“{t.text}”</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Partners (Auto-scrolling slider) */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-3xl font-bold text-center mb-8">Trusted Partners</h2>
          <div ref={partnersRef} className="flex gap-10 overflow-x-auto no-scrollbar scroll-smooth py-4" style={{ scrollBehavior: 'smooth' }}>
            {[
              { name: 'Visa', url: 'https://logo.clearbit.com/visa.com' },
              { name: 'Mastercard', url: 'https://logo.clearbit.com/mastercard.com' },
              { name: 'Amadeus', url: 'https://logo.clearbit.com/amadeus.com' },
              { name: 'Sabre', url: 'https://logo.clearbit.com/sabre.com' },
              { name: 'IATA', url: 'https://logo.clearbit.com/iata.org' },
              { name: 'Visa', url: 'https://logo.clearbit.com/visa.com' },
              { name: 'Mastercard', url: 'https://logo.clearbit.com/mastercard.com' },
              { name: 'Amadeus', url: 'https://logo.clearbit.com/amadeus.com' },
              { name: 'Sabre', url: 'https://logo.clearbit.com/sabre.com' },
              { name: 'IATA', url: 'https://logo.clearbit.com/iata.org' },
            ].map((l, i) => (
              <div key={i} className="shrink-0 h-14 w-[180px] flex items-center justify-center rounded-xl border border-gray-200 bg-white/70">
                <img src={l.url} alt={l.name} className="h-8 object-contain"
                     onError={imgFallback('https://dummyimage.com/140x40/ffffff/cccccc.png&text=+')} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* App & Newsletter CTA */}
      <div className="bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="p-6 rounded-2xl bg-white shadow border border-gray-200">
              <h3 className="text-2xl font-bold">Get our App</h3>
              <p className="mt-2 text-gray-600">Book, manage, and track your flights on the go.</p>
              <div className="mt-4 flex gap-3">
                <a href="#" className="px-4 py-2 rounded-md bg-white text-gray-800 ring-1 ring-black/5 hover:bg-gray-50">App Store</a>
                <a href="#" className="px-4 py-2 rounded-md bg-white text-gray-800 ring-1 ring-black/5 hover:bg-gray-50">Google Play</a>
              </div>
            </div>
            <div className="p-6 rounded-2xl bg-white shadow border border-gray-200">
              <h3 className="text-2xl font-bold">Stay in the loop</h3>
              <p className="mt-2 text-gray-600">Subscribe for fare alerts and travel tips.</p>
              <form className="mt-4 flex gap-3">
                <input type="email" className="flex-1 px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Your email" />
                <button type="button" className="px-5 py-2 rounded-md bg-white text-indigo-700 ring-1 ring-black/5 hover:bg-indigo-50">Subscribe</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
