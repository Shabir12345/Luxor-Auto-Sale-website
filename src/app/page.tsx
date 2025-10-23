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
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  // Fetch vehicles from API
  useEffect(() => {
    async function fetchVehicles() {
      try {
        // Fetch all vehicles for inventory (including pending and sold)
        const vehiclesResponse = await fetch('/api/vehicles?perPage=50');
        const vehiclesData = await vehiclesResponse.json();
        if (vehiclesData.success) {
          setVehicles(vehiclesData.data.data || []);
        }

        // Fetch featured vehicles
        const featuredResponse = await fetch('/api/vehicles/featured?limit=3');
        const featuredData = await featuredResponse.json();
        if (featuredData.success) {
          setFeaturedVehicles(featuredData.data || []);
        }
      } catch (error) {
        console.error('Failed to fetch vehicles:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchVehicles();
  }, []);

  // Modern scroll detection and navigation
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 50);

      // Update active section based on scroll position
      const sections = ['home', 'featured-inventory', 'financing', 'sell-trade', 'about', 'contact'];
      const currentSection = sections.find(section => {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          return rect.top <= 100 && rect.bottom >= 100;
        }
        return false;
      });
      
      if (currentSection) {
        setActiveSection(currentSection);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Smooth scroll to section
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Intersection Observer for reveal animations
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, observerOptions);

    // Observe all reveal elements
    const revealElements = document.querySelectorAll('.reveal');
    revealElements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
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
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-lg z-50 transition-all">
        Skip to main content
      </a>

      {/* Header */}
      <header className={`sticky-header bg-gray-900 bg-opacity-80 shadow-lg transition-all duration-300 ${isScrolled ? 'scrolled' : ''}`} role="banner">
        <nav className="container mx-auto px-6 flex justify-between items-center nav-mobile" role="navigation" aria-label="Main navigation" style={{height: '104px'}}>
          <a href="#home" className="flex items-center" aria-label="Luxor Auto Sale - Home">
            <img 
              src="/Logo.png" 
              alt="Luxor Auto Sale Logo" 
              className="logo transition-all duration-300"
            />
          </a>
          <div className="hidden md:flex space-x-6 items-center" role="menubar">
            <button 
              onClick={() => scrollToSection('home')} 
              className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                activeSection === 'home' 
                  ? 'text-blue-600 bg-blue-600/10' 
                  : 'text-gray-300 hover:text-blue-600 hover:bg-white/5'
              }`}
              role="menuitem"
            >
              Home
            </button>
            <button 
              onClick={() => scrollToSection('featured-inventory')} 
              className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                activeSection === 'featured-inventory' 
                  ? 'text-blue-600 bg-blue-600/10' 
                  : 'text-gray-300 hover:text-blue-600 hover:bg-white/5'
              }`}
              role="menuitem"
            >
              Inventory
            </button>
            <button 
              onClick={() => scrollToSection('financing')} 
              className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                activeSection === 'financing' 
                  ? 'text-blue-600 bg-blue-600/10' 
                  : 'text-gray-300 hover:text-blue-600 hover:bg-white/5'
              }`}
              role="menuitem"
            >
              Financing
            </button>
            <button 
              onClick={() => scrollToSection('sell-trade')} 
              className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                activeSection === 'sell-trade' 
                  ? 'text-blue-600 bg-blue-600/10' 
                  : 'text-gray-300 hover:text-blue-600 hover:bg-white/5'
              }`}
              role="menuitem"
            >
              Sell/Trade
            </button>
            <button 
              onClick={() => scrollToSection('about')} 
              className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                activeSection === 'about' 
                  ? 'text-blue-600 bg-blue-600/10' 
                  : 'text-gray-300 hover:text-blue-600 hover:bg-white/5'
              }`}
              role="menuitem"
            >
              About
            </button>
            <button 
              onClick={() => scrollToSection('contact')} 
              className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                activeSection === 'contact' 
                  ? 'text-blue-600 bg-blue-600/10' 
                  : 'text-gray-300 hover:text-blue-600 hover:bg-white/5'
              }`}
              role="menuitem"
            >
              Contact
            </button>
          </div>
          <button 
            onClick={() => scrollToSection('contact')} 
            className="hidden md:inline-block btn-modern text-base" 
            role="button"
          >
            Book a Viewing
          </button>
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
          <a href="#home" className="mobile-menu-item block text-white hover:bg-blue-600 transition-colors px-6 py-4">Home</a>
          <a href="#inventory" className="mobile-menu-item block text-white hover:bg-blue-600 transition-colors px-6 py-4">Inventory</a>
          <a href="#financing" className="mobile-menu-item block text-white hover:bg-blue-600 transition-colors px-6 py-4">Financing</a>
          <a href="#sell-trade" className="mobile-menu-item block text-white hover:bg-blue-600 transition-colors px-6 py-4">Sell/Trade</a>
          <a href="#about" className="mobile-menu-item block text-white hover:bg-blue-600 transition-colors px-6 py-4">About</a>
          <a href="#contact" className="mobile-menu-item block text-white hover:bg-blue-600 transition-colors px-6 py-4">Contact</a>
          <div className="p-4">
            <a href="#contact" className="block text-center btn-modern w-full">Book a Viewing</a>
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
            <button 
              onClick={() => scrollToSection('contact')} 
              className="btn-modern text-2xl animate-pulse"
            >
              Book a Viewing
            </button>
          </div>
        </section>

        {/* Featured Inventory Section */}
        <section id="featured-inventory" className="py-20 bg-gradient-to-br from-gray-800 via-gray-900 to-black relative overflow-hidden section-blend">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}></div>
          </div>
          
          <div className="container mx-auto px-6 text-center reveal relative z-10">
            <div className="mb-8">
              <span className="inline-block bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-semibold mb-4">
                ⭐ Featured Selection
              </span>
              <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Premium Vehicles
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                Hand-picked selection of our finest cars, meticulously inspected for your peace of mind.
              </p>
            </div>
            
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
                <span className="ml-4 text-gray-400 text-lg">Loading premium vehicles...</span>
              </div>
            ) : featuredVehicles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                {featuredVehicles.slice(0, 3).map((vehicle: any, index: number) => (
                  <div key={vehicle.id} className="group car-card bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl overflow-hidden shadow-2xl transform hover:scale-105 hover:shadow-blue-500/20 transition-all duration-500 h-full flex flex-col border border-gray-700 hover:border-blue-500/50">
                    <div className="relative overflow-hidden">
                      <img 
                        src={vehicle.photos?.[0]?.url || 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800'} 
                          alt={vehicle.title} 
                        className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-700" 
                          loading="lazy" 
                        />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                        Featured #{index + 1}
                      </div>
                      <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-sm font-bold ${
                        vehicle.status === 'AVAILABLE' ? 'bg-green-600 text-white' :
                        vehicle.status === 'PENDING' ? 'bg-yellow-600 text-white' :
                        vehicle.status === 'SOLD' ? 'bg-blue-600 text-white' :
                        'bg-gray-600 text-white'
                      }`}>
                        {vehicle.status === 'AVAILABLE' ? '✅ Available' :
                         vehicle.status === 'PENDING' ? '⏳ Pending Sale' :
                         vehicle.status === 'SOLD' ? '✅ Sold' :
                         vehicle.status}
                      </div>
                    </div>
                        <div className="p-6 flex-grow flex flex-col justify-between">
                          <div>
                        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                          {vehicle.title || `${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                        </h3>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-green-400 font-bold text-2xl">
                            {formatPrice(vehicle.priceCents)}
                          </span>
                          <span className="text-gray-400 text-sm">
                            {formatMileage(vehicle.odometerKm)}
                          </span>
                        </div>
                        <div className="flex items-center text-gray-400 text-sm">
                          <span className="mr-4">📅 {vehicle.year}</span>
                          <span>🔧 {vehicle.transmission || 'Auto'}</span>
                        </div>
                          </div>
                      <Link 
                        href={`/vehicles/${vehicle.seoSlug}`} 
                        className="mt-6 inline-block btn-modern w-full text-center"
                      >
                        View Details →
                          </Link>
                      </div>
                    </div>
                  ))}
                </div>
            ) : (
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-12 border border-gray-700">
                <div className="text-6xl mb-4">🚗</div>
                <h3 className="text-2xl font-bold text-white mb-4">Premium Vehicles Coming Soon</h3>
                <p className="text-gray-400 text-lg">We're curating an exceptional selection of vehicles for you. Check back soon!</p>
              </div>
            )}
          </div>
        </section>

        {/* About Section Teaser */}
        <section className="py-20 bg-gray-900 section-blend">
          <div className="container mx-auto px-6 text-center reveal">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose a Family-Owned Dealership?</h2>
            <p className="max-w-3xl mx-auto font-serif-georgia text-gray-400 leading-relaxed">
              At Luxor Auto Sale, you're not just another sale; you're our neighbour. As a family-owned business in Oshawa, our reputation is built on honesty and trust. We're here to build relationships and help our community drive with confidence.
            </p>
            <div className="mt-12 flex flex-col md:flex-row justify-center space-y-4 md:space-y-0 md:space-x-4">
              <button onClick={() => scrollToSection('featured-inventory')} className="btn-modern">Browse Inventory</button>
              <button onClick={() => scrollToSection('financing')} className="btn-outline-modern">Get Financing</button>
              <button onClick={() => scrollToSection('sell-trade')} className="btn-outline-modern">Value Your Trade</button>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-20 bg-gray-800 section-blend">
          <div className="container mx-auto px-6 text-center reveal">
            <h2 className="text-3xl md:text-4xl font-bold mb-12">Here's What Our Neighbours are Saying</h2>
            
            {/* Google Reviews Integration */}
            <div className="mb-8">
              <div className="inline-flex items-center bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 border border-white/20">
                <svg className="w-6 h-6 text-yellow-400 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                <span className="text-white font-semibold">Google Reviews</span>
                <span className="ml-2 text-yellow-400 font-bold">4.9/5</span>
              </div>
            </div>

            <div className="swiper testimonial-carousel">
              <div className="swiper-wrapper">
                {/* Google Review 1 */}
                <div className="swiper-slide">
                  <div className="card-modern p-8 h-full">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                          J
                        </div>
                        <div className="ml-3">
                          <p className="font-bold text-white">John D.</p>
                          <div className="flex text-yellow-400">
                            ★★★★★
                          </div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-400">2 days ago</div>
                    </div>
                    <p className="font-serif-georgia text-gray-300 text-left">"I was dreading the car buying process, but the team at Luxor made it so easy and stress-free. No pressure, just honest advice. Found the perfect car for my family!"</p>
                    <div className="mt-4 text-left">
                      <div className="flex items-center text-sm text-gray-400">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
                        </svg>
                        Oshawa, ON
                      </div>
                    </div>
                  </div>
                </div>

                {/* Google Review 2 */}
                <div className="swiper-slide">
                  <div className="card-modern p-8 h-full">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                          S
                        </div>
                        <div className="ml-3">
                          <p className="font-bold text-white">Sarah K.</p>
                          <div className="flex text-yellow-400">
                            ★★★★★
                          </div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-400">1 week ago</div>
                    </div>
                    <p className="font-serif-georgia text-gray-300 text-left">"They gave me a better trade-in value than any of the big dealerships. It felt good to support a local family business. The financing process was smooth and transparent."</p>
                    <div className="mt-4 text-left">
                      <div className="flex items-center text-sm text-gray-400">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
                        </svg>
                        Whitby, ON
                      </div>
                    </div>
                  </div>
                </div>

                {/* Google Review 3 */}
                <div className="swiper-slide">
                  <div className="card-modern p-8 h-full">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                          M
                        </div>
                        <div className="ml-3">
                          <p className="font-bold text-white">Mike R.</p>
                          <div className="flex text-yellow-400">
                            ★★★★★
                          </div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-400">2 weeks ago</div>
                    </div>
                    <p className="font-serif-georgia text-gray-300 text-left">"My credit isn't perfect, and I was worried I wouldn't get approved. They worked with me and found a financing solution that fit my budget. So grateful for their patience and understanding!"</p>
                    <div className="mt-4 text-left">
                      <div className="flex items-center text-sm text-gray-400">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
                        </svg>
                        Bowmanville, ON
                      </div>
                    </div>
                  </div>
                </div>

                {/* Google Review 4 */}
                <div className="swiper-slide">
                  <div className="card-modern p-8 h-full">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-yellow-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                          L
                        </div>
                        <div className="ml-3">
                          <p className="font-bold text-white">Lisa M.</p>
                          <div className="flex text-yellow-400">
                            ★★★★★
                          </div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-400">3 weeks ago</div>
                    </div>
                    <p className="font-serif-georgia text-gray-300 text-left">"Excellent service from start to finish! The team was knowledgeable, friendly, and never pressured me into anything. They helped me find exactly what I was looking for within my budget."</p>
                    <div className="mt-4 text-left">
                      <div className="flex items-center text-sm text-gray-400">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
                        </svg>
                        Ajax, ON
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Google Reviews Link */}
            <div className="mt-8">
              <a 
                href="https://www.google.com/search?q=Luxor+Auto+Sale+Oshawa+reviews" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center btn-outline-modern"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                View All Google Reviews
              </a>
            </div>
          </div>
        </section>

        {/* Full Inventory Section */}
        <section id="inventory" className="py-20 bg-gradient-to-br from-gray-900 via-black to-gray-900 relative overflow-hidden">
          {/* Background Elements */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 left-10 w-72 h-72 bg-red-500 rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
          </div>
          
          <div className="container mx-auto px-6 reveal relative z-10">
            <div className="text-center mb-16">
              <span className="inline-block btn-modern px-6 py-3 rounded-full text-sm font-semibold mb-6">
                🚗 Complete Inventory
              </span>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Our Vehicle Collection
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Explore our carefully curated selection of quality pre-owned vehicles, each inspected and ready for your next adventure.
              </p>
            </div>
            
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-500"></div>
                <span className="ml-4 text-gray-400 text-xl">Loading our collection...</span>
              </div>
            ) : vehicles.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                  {vehicles.slice(0, 6).map((vehicle: any, index: number) => (
                    <div key={vehicle.id} className="group bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl overflow-hidden shadow-2xl transform hover:-translate-y-4 hover:shadow-blue-500/20 transition-all duration-500 border border-gray-700 hover:border-blue-500/50">
                      <div className="relative overflow-hidden">
                        <img 
                          src={vehicle.photos?.[0]?.url || 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800'} 
                        alt={vehicle.title} 
                          className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-700" 
                        loading="lazy" 
                      />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-sm font-bold ${
                          vehicle.status === 'AVAILABLE' ? 'bg-green-600 text-white' :
                          vehicle.status === 'PENDING' ? 'bg-yellow-600 text-white' :
                          vehicle.status === 'SOLD' ? 'bg-blue-600 text-white' :
                          'bg-gray-600 text-white'
                        }`}>
                          {vehicle.status === 'AVAILABLE' ? '✅ Available' :
                           vehicle.status === 'PENDING' ? '⏳ Pending Sale' :
                           vehicle.status === 'SOLD' ? '✅ Sold' :
                           vehicle.status}
                        </div>
                      </div>
                      <div className="p-6">
                        <h3 className="text-xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors">
                          {vehicle.title || `${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                        </h3>
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-green-400 font-bold text-2xl">
                            {formatPrice(vehicle.priceCents)}
                          </span>
                          <span className="text-gray-400 text-sm">
                            {formatMileage(vehicle.odometerKm)}
                          </span>
                        </div>
                        <div className="flex items-center text-gray-400 text-sm mb-6">
                          <span className="mr-4">📅 {vehicle.year}</span>
                          <span>🔧 {vehicle.transmission || 'Auto'}</span>
                          {vehicle.exteriorColor && <span className="ml-4">🎨 {vehicle.exteriorColor}</span>}
                        </div>
                        <div className="flex space-x-3">
                          <a 
                            href="#contact" 
                            className="flex-1 btn-modern text-center"
                          >
                            Book Viewing
                          </a>
                          <Link 
                            href={`/vehicles/${vehicle.seoSlug}`} 
                            className="flex-1 btn-outline-modern text-center"
                          >
                            Details →
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="text-center">
                  <Link 
                    href="/inventory" 
                    className="inline-flex items-center btn-modern text-lg"
                  >
                    View All {vehicles.length} Vehicles
                    <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </>
            ) : (
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-3xl p-16 border border-gray-700 text-center">
                <div className="text-8xl mb-6">🚗</div>
                <h3 className="text-3xl font-bold text-white mb-6">Inventory Coming Soon</h3>
                <p className="text-gray-400 text-xl mb-8">We're preparing an amazing selection of vehicles for you. Check back soon!</p>
                <Link 
                  href="/admin" 
                  className="inline-block btn-modern"
                >
                  Admin: Add Vehicles
                </Link>
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
                    className="bg-gray-700 text-white rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    name="lastName"
                    placeholder="Last Name"
                    required
                    className="bg-gray-700 text-white rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="email"
                    name="email"
                    placeholder="Email Address"
                    required
                    className="bg-gray-700 text-white rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Phone Number"
                    required
                    className="bg-gray-700 text-white rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    name="vehicleInterest"
                    placeholder="Vehicle of Interest"
                    className="bg-gray-700 text-white rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 md:col-span-2"
                  />
                </div>
                <button type="submit" className="btn-modern w-full mt-6">Get Pre-Approved in Seconds</button>
                {formStatus.type === 'success' && <p className="text-green-500 mt-4">{formStatus.message}</p>}
                {formStatus.type === 'error' && <p className="text-red-500 mt-4">{formStatus.message}</p>}
              </form>
            </div>
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
              <div className="p-6 bg-gray-900 rounded-2xl">
                <div className="text-blue-500 text-3xl mb-4">✓</div>
                <h3 className="font-bold text-xl mb-2">Quick Approvals</h3>
                <p className="text-gray-400">Get a decision in minutes, not days.</p>
              </div>
              <div className="p-6 bg-gray-900 rounded-2xl">
                <div className="text-green-500 text-3xl mb-4">%</div>
                <h3 className="font-bold text-xl mb-2">Competitive Rates</h3>
                <p className="text-gray-400">We work with multiple lenders to find you the best rates.</p>
              </div>
              <div className="p-6 bg-gray-900 rounded-2xl">
                <div className="text-blue-500 text-3xl mb-4">🤝</div>
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
                  <span className="bg-blue-600 text-white rounded-full h-8 w-8 text-center leading-8 font-bold mr-4 shrink-0">1</span>
                  <span>Fast & Easy Form: Tell us about your car in under 2 minutes.</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-green-500 text-white rounded-full h-8 w-8 text-center leading-8 font-bold mr-4 shrink-0">2</span>
                  <span>Get a Fair Offer: We'll send you a competitive, real-market valuation.</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-blue-500 text-white rounded-full h-8 w-8 text-center leading-8 font-bold mr-4 shrink-0">3</span>
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
                    className="bg-gray-700 text-white rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    name="mileage"
                    placeholder="Mileage (km)"
                    required
                    className="bg-gray-700 text-white rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <textarea
                    name="condition"
                    placeholder="Describe the condition..."
                    rows={3}
                    required
                    className="bg-gray-700 text-white rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="email"
                    name="email"
                    placeholder="Your Email"
                    required
                    className="bg-gray-700 text-white rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button type="submit" className="btn-modern w-full mt-6">Get My Offer</button>
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
                    className="bg-gray-800 text-white rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="email"
                    name="email"
                    placeholder="Your Email"
                    required
                    className="bg-gray-800 text-white rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Your Phone"
                    className="bg-gray-800 text-white rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <textarea
                    name="message"
                    placeholder="Your Message..."
                    rows={4}
                    required
                    className="bg-gray-800 text-white rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button type="submit" className="btn-modern w-full mt-6">Send Message</button>
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
              <a href="#home" className="mb-4 inline-block">
                <img 
                  src="/Logo.png" 
                  alt="Luxor Auto Sale Logo" 
                  className="logo transition-all duration-300"
                />
              </a>
              <p className="text-gray-400 mb-4">
                Family-owned dealership serving Oshawa and the Durham Region with quality used vehicles and exceptional service.
              </p>
            </div>
            <div>
              <h3 className="text-white text-lg font-bold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#inventory" className="hover:text-blue-400 transition-colors">Browse Inventory</a></li>
                <li><a href="#financing" className="hover:text-blue-400 transition-colors">Get Financing</a></li>
                <li><a href="#sell-trade" className="hover:text-blue-400 transition-colors">Sell Your Car</a></li>
                <li><a href="#about" className="hover:text-blue-400 transition-colors">About Us</a></li>
                <li><a href="#contact" className="hover:text-blue-400 transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white text-lg font-bold mb-4">Legal</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/privacy" className="hover:text-blue-400 transition-colors">Privacy Policy</a></li>
                <li><a href="/terms" className="hover:text-blue-400 transition-colors">Terms of Service</a></li>
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

