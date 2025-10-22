'use client';

// Complete Homepage - Luxor Auto Sale
// All sections from original index.html with backend integration

import Link from 'next/link';
import Script from 'next/script';
import { useState, useEffect } from 'react';

export default function HomePage() {
  const [vehicles, setVehicles] = useState([]);
  const [featuredVehicles, setFeaturedVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formStatus, setFormStatus] = useState({ type: '', message: '' });

  // Fetch vehicles from API
  useEffect(() => {
    async function fetchVehicles() {
      try {
        const response = await fetch('/api/vehicles?status=AVAILABLE&perPage=50');
        const data = await response.json();
        if (data.success) {
          setVehicles(data.data || []);
          setFeaturedVehicles((data.data || []).slice(0, 6)); // First 6 as featured
        }
      } catch (error) {
        console.error('Failed to fetch vehicles:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchVehicles();
  }, []);

  // Handle Contact Form Submission
  const handleContactSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.get('name'),
          email: formData.get('email'),
          phone: formData.get('phone'),
          message: formData.get('message'),
        }),
      });

      const result = await response.json();
      if (result.success) {
        setFormStatus({ type: 'success', message: 'Message sent! We\'ll get back to you soon.' });
        form.reset();
      } else {
        setFormStatus({ type: 'error', message: 'Failed to send message. Please try again.' });
      }
    } catch (error) {
      setFormStatus({ type: 'error', message: 'Network error. Please try again.' });
    }
  };

  // Handle Financing Form Submission
  const handleFinancingSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      const response = await fetch('/api/financing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: formData.get('firstName'),
          lastName: formData.get('lastName'),
          email: formData.get('email'),
          phone: formData.get('phone'),
          vehicleInterest: formData.get('vehicleInterest'),
        }),
      });

      const result = await response.json();
      if (result.success) {
        setFormStatus({ type: 'success', message: 'Application received! We\'ll contact you shortly.' });
        form.reset();
      } else {
        setFormStatus({ type: 'error', message: 'Failed to submit. Please try again.' });
      }
    } catch (error) {
      setFormStatus({ type: 'error', message: 'Network error. Please try again.' });
    }
  };

  // Handle Trade-In Form Submission
  const handleTradeSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      const response = await fetch('/api/trade-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicle: formData.get('vehicle'),
          mileage: formData.get('mileage'),
          condition: formData.get('condition'),
          email: formData.get('email'),
        }),
      });

      const result = await response.json();
      if (result.success) {
        setFormStatus({ type: 'success', message: 'Appraisal request received! Check your email.' });
        form.reset();
      } else {
        setFormStatus({ type: 'error', message: 'Failed to submit. Please try again.' });
      }
    } catch (error) {
      setFormStatus({ type: 'error', message: 'Network error. Please try again.' });
    }
  };

  const formatPrice = (priceCents: number) => {
    return new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD', minimumFractionDigits: 0 }).format(priceCents / 100);
  };

  const formatMileage = (km: number) => {
    return new Intl.NumberFormat('en-CA').format(km) + ' km';
  };

  return (
    <>
      {/* Skip to main content for accessibility */}
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-red-600 text-white px-4 py-2 rounded-lg z-50 transition-all">
        Skip to main content
      </a>

      {/* Header */}
      <header className="sticky-header bg-gray-900 bg-opacity-80 shadow-lg" role="banner">
        <nav className="container mx-auto px-6 py-4 flex justify-between items-center" role="navigation" aria-label="Main navigation">
          <a href="#home" className="flex items-center" aria-label="Luxor Auto Sale - Home">
            <span className="text-white text-xl font-bold tracking-wider">
              LUXOR <span className="text-red-500">AUTO</span> SALE
            </span>
          </a>
          <div className="hidden md:flex space-x-8 items-center" role="menubar">
            <a href="#home" className="text-gray-300 hover:text-red-500 transition-colors" role="menuitem">Home</a>
            <a href="#inventory" className="text-gray-300 hover:text-red-500 transition-colors" role="menuitem">Inventory</a>
            <a href="#financing" className="text-gray-300 hover:text-red-500 transition-colors" role="menuitem">Financing</a>
            <a href="#sell-trade" className="text-gray-300 hover:text-red-500 transition-colors" role="menuitem">Sell/Trade</a>
            <a href="#about" className="text-gray-300 hover:text-red-500 transition-colors" role="menuitem">About</a>
            <a href="#contact" className="text-gray-300 hover:text-red-500 transition-colors" role="menuitem">Contact</a>
          </div>
          <a href="#contact" className="hidden md:inline-block btn-indigo text-base" role="button">
            Book a Viewing
          </a>
          <div className="md:hidden">
            <button id="mobile-menu-button" className="text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-900 rounded">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </nav>
        
        {/* Mobile Menu */}
        <div id="mobile-menu" className="md:hidden bg-gray-800 shadow-lg hidden">
          <a href="#home" className="mobile-menu-item block text-white hover:bg-red-600 transition-colors px-6 py-4">Home</a>
          <a href="#inventory" className="mobile-menu-item block text-white hover:bg-red-600 transition-colors px-6 py-4">Inventory</a>
          <a href="#financing" className="mobile-menu-item block text-white hover:bg-red-600 transition-colors px-6 py-4">Financing</a>
          <a href="#sell-trade" className="mobile-menu-item block text-white hover:bg-red-600 transition-colors px-6 py-4">Sell/Trade</a>
          <a href="#about" className="mobile-menu-item block text-white hover:bg-red-600 transition-colors px-6 py-4">About</a>
          <a href="#contact" className="mobile-menu-item block text-white hover:bg-red-600 transition-colors px-6 py-4">Contact</a>
          <div className="p-4">
            <a href="#contact" className="block text-center btn-indigo w-full">Book a Viewing</a>
          </div>
        </div>
      </header>

      <main id="main-content" role="main">
        {/* Hero Section */}
        <section id="home" className="hero-section min-h-screen flex items-center justify-center text-center px-4">
          <div className="reveal visible max-w-4xl mx-auto">
            <h1 id="hero-title" className="text-5xl md:text-7xl font-bold mb-6 drop-shadow-2xl">
              Drive Confidently.
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-200 leading-relaxed">
              Your trusted, stress-free car buying experience starts here.
            </p>
            <a href="#contact" className="btn-indigo text-2xl animate-pulse">
              Book a Viewing
            </a>
          </div>
        </section>

        {/* Featured Inventory Section */}
        <section id="featured-inventory" className="py-20 bg-gray-800">
          <div className="container mx-auto px-6 text-center reveal">
            <h2 className="text-3xl md:text-4xl font-bold mb-2">Featured Vehicles</h2>
            <p className="mb-12 text-gray-400">Hand-picked selection of our finest cars, inspected for your peace of mind.</p>
            
            {loading ? (
              <div className="text-gray-400">Loading vehicles...</div>
            ) : featuredVehicles.length > 0 ? (
              <div className="swiper featured-carousel">
                <div className="swiper-wrapper">
                  {featuredVehicles.map((vehicle: any) => (
                    <div key={vehicle.id} className="swiper-slide">
                      <div className="car-card bg-gray-900 rounded-2xl overflow-hidden shadow-2xl transform hover:scale-105 transition-transform duration-300 h-full flex flex-col">
                        <img 
                          src={vehicle.photos?.[0]?.url || 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800'} 
                          alt={vehicle.title} 
                          className="w-full h-48 object-cover" 
                          loading="lazy" 
                        />
                        <div className="p-6 flex-grow flex flex-col justify-between">
                          <div>
                            <h3 className="text-xl font-bold">{vehicle.title || `${vehicle.year} ${vehicle.make} ${vehicle.model}`}</h3>
                            <p className="text-green-500 font-semibold mt-2 text-2xl">{formatPrice(vehicle.priceCents)}</p>
                            <p className="text-gray-400 text-sm">{formatMileage(vehicle.odometerKm)}</p>
                          </div>
                          <Link href={`/vehicles/${vehicle.slug}`} className="mt-4 inline-block btn-outline w-full text-center">
                            View Details
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="swiper-button-next text-red-500"></div>
                <div className="swiper-button-prev text-red-500"></div>
              </div>
            ) : (
              <div className="text-gray-400">No featured vehicles available yet. Check back soon!</div>
            )}
          </div>
        </section>

        {/* About Section Teaser */}
        <section className="py-20 bg-gray-900">
          <div className="container mx-auto px-6 text-center reveal">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose a Family-Owned Dealership?</h2>
            <p className="max-w-3xl mx-auto font-serif-georgia text-gray-400 leading-relaxed">
              At Luxor Auto Sale, you're not just another sale; you're our neighbour. As a family-owned business in Oshawa, our reputation is built on honesty and trust. We're here to build relationships and help our community drive with confidence.
            </p>
            <div className="mt-12 flex flex-col md:flex-row justify-center space-y-4 md:space-y-0 md:space-x-4">
              <a href="#inventory" className="btn-indigo">Browse Inventory</a>
              <a href="#financing" className="btn-outline">Get Financing</a>
              <a href="#sell-trade" className="btn-outline">Value Your Trade</a>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-20 bg-gray-800">
          <div className="container mx-auto px-6 text-center reveal">
            <h2 className="text-3xl md:text-4xl font-bold mb-12">Here's What Our Neighbours are Saying</h2>
            <div className="swiper testimonial-carousel">
              <div className="swiper-wrapper">
                <div className="swiper-slide">
                  <div className="bg-gray-900 p-8 rounded-2xl shadow-lg h-full">
                    <div className="text-red-500 text-3xl mb-4">"</div>
                    <p className="font-serif-georgia text-gray-300">"I was dreading the car buying process, but the team at Luxor made it so easy and stress-free. No pressure, just honest advice."</p>
                    <div className="mt-4">
                      <p className="font-bold">- John D., Oshawa</p>
                      <div className="text-red-500 mt-1">★★★★★</div>
                    </div>
                  </div>
                </div>
                <div className="swiper-slide">
                  <div className="bg-gray-900 p-8 rounded-2xl shadow-lg h-full">
                    <div className="text-red-500 text-3xl mb-4">"</div>
                    <p className="font-serif-georgia text-gray-300">"They gave me a better trade-in value than any of the big dealerships. It felt good to support a local family business."</p>
                    <div className="mt-4">
                      <p className="font-bold">- Sarah K., Whitby</p>
                      <div className="text-red-500 mt-1">★★★★★</div>
                    </div>
                  </div>
                </div>
                <div className="swiper-slide">
                  <div className="bg-gray-900 p-8 rounded-2xl shadow-lg h-full">
                    <div className="text-red-500 text-3xl mb-4">"</div>
                    <p className="font-serif-georgia text-gray-300">"My credit isn't perfect, and I was worried I wouldn't get approved. They worked with me and found a financing solution that fit my budget. So grateful!"</p>
                    <div className="mt-4">
                      <p className="font-bold">- Mike R., Bowmanville</p>
                      <div className="text-red-500 mt-1">★★★★½</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Full Inventory Section */}
        <section id="inventory" className="py-20 bg-gray-900">
          <div className="container mx-auto px-6 reveal">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Our Inventory</h2>
            
            {loading ? (
              <div className="text-center text-gray-400">Loading inventory...</div>
            ) : vehicles.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {vehicles.slice(0, 6).map((vehicle: any) => (
                    <div key={vehicle.id} className="bg-gray-800 rounded-2xl overflow-hidden shadow-xl transform hover:-translate-y-2 transition-transform duration-300">
                      <img 
                        src={vehicle.photos?.[0]?.url || 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800'} 
                        alt={vehicle.title} 
                        className="w-full h-56 object-cover" 
                        loading="lazy" 
                      />
                      <div className="p-6">
                        <h3 className="text-xl font-bold">{vehicle.title || `${vehicle.year} ${vehicle.make} ${vehicle.model}`}</h3>
                        <p className="text-green-500 font-semibold mt-2 text-2xl">{formatPrice(vehicle.priceCents)}</p>
                        <p className="text-gray-400 text-sm">{formatMileage(vehicle.odometerKm)} | {vehicle.transmission}</p>
                        <div className="mt-4 flex space-x-2">
                          <a href="#contact" className="btn-indigo flex-1 text-center py-2 px-4">Book Viewing</a>
                          <Link href={`/vehicles/${vehicle.slug}`} className="btn-outline flex-1 text-center py-2 px-4">
                            Details
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="text-center mt-12">
                  <Link href="/inventory" className="btn-indigo text-lg px-8 py-4">
                    View All {vehicles.length} Vehicles
                  </Link>
                </div>
              </>
            ) : (
              <div className="text-center text-gray-400">
                <p className="mb-4">We're currently updating our inventory. Check back soon!</p>
                <Link href="/admin" className="btn-indigo">Admin: Add Vehicles</Link>
              </div>
            )}
          </div>
        </section>

        {/* Financing Section */}
        <section id="financing" className="py-20 bg-gray-800">
          <div className="container mx-auto px-6 text-center reveal">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Financing Shouldn't Be a Roadblock.</h2>
            <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
              Worried about your credit? Don't be. We specialize in finding solutions for every situation. Let us handle the financing so you can focus on the test drive.
            </p>
            <div className="max-w-2xl mx-auto bg-gray-900 p-8 rounded-2xl shadow-2xl">
              <form onSubmit={handleFinancingSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="firstName"
                    placeholder="First Name"
                    required
                    className="bg-gray-700 text-white rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                  <input
                    type="text"
                    name="lastName"
                    placeholder="Last Name"
                    required
                    className="bg-gray-700 text-white rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                  <input
                    type="email"
                    name="email"
                    placeholder="Email Address"
                    required
                    className="bg-gray-700 text-white rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Phone Number"
                    required
                    className="bg-gray-700 text-white rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                  <input
                    type="text"
                    name="vehicleInterest"
                    placeholder="Vehicle of Interest"
                    className="bg-gray-700 text-white rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-red-500 md:col-span-2"
                  />
                </div>
                <button type="submit" className="btn-indigo w-full mt-6">Get Pre-Approved in Seconds</button>
                {formStatus.type === 'success' && <p className="text-green-500 mt-4">{formStatus.message}</p>}
                {formStatus.type === 'error' && <p className="text-red-500 mt-4">{formStatus.message}</p>}
              </form>
            </div>
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
              <div className="p-6 bg-gray-900 rounded-2xl">
                <div className="text-red-500 text-3xl mb-4">✓</div>
                <h3 className="font-bold text-xl mb-2">Quick Approvals</h3>
                <p className="text-gray-400">Get a decision in minutes, not days.</p>
              </div>
              <div className="p-6 bg-gray-900 rounded-2xl">
                <div className="text-red-500 text-3xl mb-4">%</div>
                <h3 className="font-bold text-xl mb-2">Competitive Rates</h3>
                <p className="text-gray-400">We work with multiple lenders to find you the best rates.</p>
              </div>
              <div className="p-6 bg-gray-900 rounded-2xl">
                <div className="text-red-500 text-3xl mb-4">🤝</div>
                <h3 className="font-bold text-xl mb-2">Solutions for All Credit</h3>
                <p className="text-gray-400">We believe everyone deserves a reliable car.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Sell/Trade Section */}
        <section id="sell-trade" className="py-20 bg-gray-900">
          <div className="container mx-auto px-6 grid md:grid-cols-2 gap-12 items-center reveal">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Get a Real Offer for Your Car. Not Just an Estimate.</h2>
              <p className="text-gray-300 mb-6 font-serif-georgia leading-relaxed">
                Tired of lowball offers and time-wasters? We provide fair, transparent valuations for your vehicle. We buy all makes and models, even if you don't buy from us. Find out what your car is really worth today.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <span className="bg-red-600 text-white rounded-full h-8 w-8 text-center leading-8 font-bold mr-4 shrink-0">1</span>
                  <span>Fast & Easy Form: Tell us about your car in under 2 minutes.</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-red-600 text-white rounded-full h-8 w-8 text-center leading-8 font-bold mr-4 shrink-0">2</span>
                  <span>Get a Fair Offer: We'll send you a competitive, real-market valuation.</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-red-600 text-white rounded-full h-8 w-8 text-center leading-8 font-bold mr-4 shrink-0">3</span>
                  <span>Get Paid: Bring your car in for a quick inspection and walk away with a check.</span>
                </li>
              </ul>
            </div>
            <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl">
              <h3 className="text-xl font-bold mb-4 text-center">Get Your Instant Appraisal</h3>
              <form onSubmit={handleTradeSubmit}>
                <div className="space-y-4">
                  <input
                    type="text"
                    name="vehicle"
                    placeholder="Year, Make, Model"
                    required
                    className="bg-gray-700 text-white rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                  <input
                    type="text"
                    name="mileage"
                    placeholder="Mileage (km)"
                    required
                    className="bg-gray-700 text-white rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                  <textarea
                    name="condition"
                    placeholder="Describe the condition..."
                    rows={3}
                    required
                    className="bg-gray-700 text-white rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                  <input
                    type="email"
                    name="email"
                    placeholder="Your Email"
                    required
                    className="bg-gray-700 text-white rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <button type="submit" className="btn-indigo w-full mt-6">Get My Offer</button>
                {formStatus.type === 'success' && <p className="text-green-500 mt-4 text-sm">{formStatus.message}</p>}
                {formStatus.type === 'error' && <p className="text-red-500 mt-4 text-sm">{formStatus.message}</p>}
              </form>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-20 bg-gray-800">
          <div className="container mx-auto px-6 reveal">
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">About Luxor Auto Sale</h2>
              <p className="max-w-3xl mx-auto text-gray-300 font-serif-georgia mb-12 leading-relaxed">
                Founded on the principles of honesty, integrity, and community, Luxor Auto Sale has been proudly serving Oshawa and the Durham Region. As a family-owned business, we understand the importance of trust. Our mission is to provide high-quality, reliable pre-owned vehicles at fair prices, ensuring a transparent and enjoyable car-buying experience for every customer.
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <img
                src="https://images.unsplash.com/photo-1549411227-5afe55a93551?q=80&w=1965&auto=format&fit=crop"
                alt="Luxor Auto Sale dealership"
                className="rounded-2xl shadow-xl"
                loading="lazy"
              />
              <div>
                <h3 className="text-2xl font-bold mb-4">Our Commitment to You</h3>
                <p className="text-gray-400 font-serif-georgia leading-relaxed">
                  We're not just selling cars; we're building relationships. Our knowledgeable team is here to guide you, not pressure you. Every vehicle on our lot undergoes a rigorous inspection to meet our high standards for safety and quality. Come visit us and experience the Luxor Auto difference.
                </p>
                <div className="mt-6">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2878.891395982877!2d-78.8576486845!3d43.878132979114!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDPCsDUyJzQxLjMiTiA3OMKwNTEnMjcuNSJX!5e0!3m2!1sen!2sca!4v1672545600000!5m2!1sen!2sca"
                    width="100%"
                    height="250"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    className="rounded-2xl"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-20 bg-gray-900">
          <div className="container mx-auto px-6 grid md:grid-cols-2 gap-12 reveal">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Get In Touch</h2>
              <p className="text-gray-300 mb-6">Have a question or want to book a viewing? Send us a message!</p>
              <form onSubmit={handleContactSubmit}>
                <div className="space-y-4">
                  <input
                    type="text"
                    name="name"
                    placeholder="Your Name"
                    required
                    className="bg-gray-800 text-white rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                  <input
                    type="email"
                    name="email"
                    placeholder="Your Email"
                    required
                    className="bg-gray-800 text-white rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Your Phone"
                    className="bg-gray-800 text-white rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                  <textarea
                    name="message"
                    placeholder="Your Message..."
                    rows={4}
                    required
                    className="bg-gray-800 text-white rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <button type="submit" className="btn-indigo w-full mt-6">Send Message</button>
                {formStatus.type === 'success' && <p className="text-green-500 mt-4">{formStatus.message}</p>}
                {formStatus.type === 'error' && <p className="text-red-500 mt-4">{formStatus.message}</p>}
              </form>
            </div>
            <div className="text-left">
              <h3 className="text-2xl font-bold mb-4">Contact Information</h3>
              <ul className="space-y-4 text-gray-300">
                <li className="flex items-center">
                  <span className="text-red-500 w-6 text-center mr-4">📍</span>
                  477 Ritson Rd S, Oshawa, ON L1H 5K1
                </li>
                <li className="flex items-center">
                  <span className="text-red-500 w-6 text-center mr-4">📞</span>
                  <a href="tel:416-523-5375" className="hover:text-red-500">416-523-5375</a>
                </li>
                <li className="flex items-center">
                  <span className="text-red-500 w-6 text-center mr-4">✉️</span>
                  <a href="mailto:sales@luxorautosale.com" className="hover:text-red-500">sales@luxorautosale.com</a>
                </li>
              </ul>
              <h3 className="text-2xl font-bold mt-8 mb-4">Business Hours</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Mon - Fri: 9:00 AM - 7:00 PM</li>
                <li>Saturday: 10:00 AM - 5:00 PM</li>
                <li>Sunday: Closed</li>
              </ul>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-black py-12">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
            <div>
              <a href="#home" className="text-white text-2xl font-bold tracking-wider mb-4 inline-block">
                LUXOR <span className="text-red-500">AUTO</span> SALE
              </a>
              <p className="text-gray-400 mb-4">
                Family-owned dealership serving Oshawa and the Durham Region with quality used vehicles and exceptional service.
              </p>
            </div>
            <div>
              <h3 className="text-white text-lg font-bold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#inventory" className="hover:text-red-500 transition-colors">Browse Inventory</a></li>
                <li><a href="#financing" className="hover:text-red-500 transition-colors">Get Financing</a></li>
                <li><a href="#sell-trade" className="hover:text-red-500 transition-colors">Sell Your Car</a></li>
                <li><a href="#about" className="hover:text-red-500 transition-colors">About Us</a></li>
                <li><a href="#contact" className="hover:text-red-500 transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white text-lg font-bold mb-4">Legal</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/privacy" className="hover:text-red-500 transition-colors">Privacy Policy</a></li>
                <li><a href="/terms" className="hover:text-red-500 transition-colors">Terms of Service</a></li>
              </ul>
              <div className="mt-4">
                <Link href="/admin" className="text-gray-600 hover:text-gray-400 text-sm">Staff Login</Link>
              </div>
            </div>
          </div>
          <div className="text-center text-gray-500 mt-8 pt-8 border-t border-gray-800">
            <p>&copy; {new Date().getFullYear()} Luxor Auto Sale. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Mobile Menu Toggle Script */}
      <Script id="mobile-menu-script" strategy="afterInteractive">
        {`
          document.getElementById('mobile-menu-button')?.addEventListener('click', function() {
            const menu = document.getElementById('mobile-menu');
            const isHidden = menu.classList.contains('hidden');
            menu.classList.toggle('hidden');
            this.setAttribute('aria-expanded', isHidden ? 'true' : 'false');
          });
          
          document.querySelectorAll('#mobile-menu a').forEach(link => {
            link.addEventListener('click', () => {
              document.getElementById('mobile-menu').classList.add('hidden');
              document.getElementById('mobile-menu-button').setAttribute('aria-expanded', 'false');
            });
          });
        `}
      </Script>

      {/* Swiper Carousel */}
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css" />
      <Script src="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js" strategy="afterInteractive" />
      <Script id="swiper-init" strategy="afterInteractive">
        {`
          window.addEventListener('load', function() {
            if (typeof Swiper !== 'undefined') {
              new Swiper('.featured-carousel', {
                slidesPerView: 1,
                spaceBetween: 30,
                loop: true,
                navigation: {
                  nextEl: '.swiper-button-next',
                  prevEl: '.swiper-button-prev',
                },
                breakpoints: {
                  640: { slidesPerView: 2 },
                  1024: { slidesPerView: 3 },
                },
              });
              
              new Swiper('.testimonial-carousel', {
                slidesPerView: 1,
                spaceBetween: 30,
                loop: true,
                autoplay: {
                  delay: 5000,
                  disableOnInteraction: false,
                },
                breakpoints: {
                  768: { slidesPerView: 2 },
                  1024: { slidesPerView: 3 },
                },
              });
            }
          });
        `}
      </Script>
    </>
  );
}

