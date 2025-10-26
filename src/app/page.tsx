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
  const [lastFeaturedUpdate, setLastFeaturedUpdate] = useState(Date.now());
  
  // Filter states for homepage inventory
  const [filters, setFilters] = useState({
    search: '',
    make: '',
    status: 'ALL',
    sortBy: 'newest',
    minPrice: '',
    maxPrice: '',
    minYear: '',
    maxYear: '',
    maxMileage: '',
    transmission: '',
    fuelType: '',
  });
  const [availableMakes, setAvailableMakes] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [searchDebounce, setSearchDebounce] = useState<NodeJS.Timeout | null>(null);
  
  // Google Reviews state
  const [googleReviews, setGoogleReviews] = useState<any>(null);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  // Initialize filters from URL parameters
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const urlFilters = {
        search: urlParams.get('search') || '',
        make: urlParams.get('make') || '',
        status: urlParams.get('status') || 'ALL',
        sortBy: urlParams.get('sortBy') || 'newest',
        minPrice: urlParams.get('minPrice') || '',
        maxPrice: urlParams.get('maxPrice') || '',
        minYear: urlParams.get('minYear') || '',
        maxYear: urlParams.get('maxYear') || '',
        maxMileage: urlParams.get('maxMileage') || '',
        transmission: urlParams.get('transmission') || '',
        fuelType: urlParams.get('fuelType') || '',
      };
      setFilters(urlFilters);
    }
  }, []);

  // Fetch vehicles from API
  useEffect(() => {
    async function fetchVehicles() {
      try {
        // Build query parameters for filtering
        const params = new URLSearchParams({
          perPage: '50',
          ...(filters.search && { search: filters.search }),
          ...(filters.make && { make: filters.make }),
          ...(filters.status !== 'ALL' && { status: filters.status }),
          ...(filters.sortBy && { sortBy: filters.sortBy }),
          ...(filters.minPrice && { minPrice: filters.minPrice }),
          ...(filters.maxPrice && { maxPrice: filters.maxPrice }),
          ...(filters.minYear && { minYear: filters.minYear }),
          ...(filters.maxYear && { maxYear: filters.maxYear }),
          ...(filters.maxMileage && { maxMileage: filters.maxMileage }),
          ...(filters.transmission && { transmission: filters.transmission }),
          ...(filters.fuelType && { fuelType: filters.fuelType }),
        });

        // Fetch all vehicles for inventory (including pending and sold)
        const vehiclesResponse = await fetch(`/api/vehicles?${params}`);
        const vehiclesData = await vehiclesResponse.json();
        console.log('Vehicles API Response:', vehiclesResponse.status, vehiclesData);
        
        if (vehiclesData.success) {
          console.log('Vehicles data received:', vehiclesData.data?.data?.length || 0, 'vehicles');
          setVehicles(vehiclesData.data.data || []);
          
          // Extract unique makes for dropdown
          const makes = [...new Set(vehiclesData.data.data.map((v: any) => v.make).filter(Boolean))].sort() as string[];
          setAvailableMakes(makes);
        } else {
          console.error('Vehicles API error:', vehiclesData.error);
          setVehicles([]); // Set empty array on error
        }

        // Fetch featured vehicles (only if no filters applied)
        if (!filters.search && !filters.make && filters.status === 'ALL') {
          console.log('Fetching featured vehicles...');
          const featuredResponse = await fetch('/api/vehicles/featured?limit=3', {
            cache: 'no-store', // Prevent caching
            headers: {
              'Cache-Control': 'no-cache',
            },
          });
          const featuredData = await featuredResponse.json();
          console.log('Featured vehicles response:', featuredData);
          if (featuredData.success) {
            setFeaturedVehicles(featuredData.data || []);
            console.log('Featured vehicles set:', featuredData.data);
          }
        }
      } catch (error) {
        console.error('Failed to fetch vehicles:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchVehicles();
  }, [filters]);

  // Separate effect to fetch featured vehicles independently
  useEffect(() => {
    const fetchFeaturedVehicles = async () => {
      try {
        console.log('Fetching featured vehicles independently...');
        const featuredResponse = await fetch('/api/vehicles/featured?limit=3', {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache',
          },
        });
        const featuredData = await featuredResponse.json();
        console.log('Independent featured vehicles response:', featuredData);
        if (featuredData.success) {
          setFeaturedVehicles(featuredData.data || []);
          console.log('Independent featured vehicles set:', featuredData.data);
        }
      } catch (error) {
        console.error('Failed to fetch featured vehicles:', error);
      }
    };

    fetchFeaturedVehicles();
  }, []); // Run once on mount

  // Periodic refresh of featured vehicles every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('Periodic featured vehicles refresh...');
      const fetchFeaturedVehicles = async () => {
        try {
          const featuredResponse = await fetch('/api/vehicles/featured?limit=3', {
            cache: 'no-store',
            headers: {
              'Cache-Control': 'no-cache',
            },
          });
          const featuredData = await featuredResponse.json();
          if (featuredData.success) {
            setFeaturedVehicles(featuredData.data || []);
            setLastFeaturedUpdate(Date.now());
          }
        } catch (error) {
          console.error('Failed to refresh featured vehicles:', error);
        }
      };
      fetchFeaturedVehicles();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Fetch Google Reviews
  useEffect(() => {
    async function fetchGoogleReviews() {
      try {
        const response = await fetch('/api/google-reviews', {
          cache: 'no-store',
        });
        const data = await response.json();
        if (data.success && data.data) {
          setGoogleReviews(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch Google reviews:', error);
      } finally {
        setReviewsLoading(false);
      }
    }
    fetchGoogleReviews();
  }, []);

  // Update URL when filters change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== 'ALL' && value !== 'newest') {
          params.set(key, value);
        }
      });
      
      const newUrl = params.toString() ? `${window.location.pathname}?${params.toString()}` : window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, [filters]);

  // Filter handlers with debouncing for search
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'search') {
      // Debounce search input for better performance
      if (searchDebounce) {
        clearTimeout(searchDebounce);
      }
      
      const timeout = setTimeout(() => {
        setFilters((prev) => ({ ...prev, [name]: value }));
      }, 300);
      
      setSearchDebounce(timeout);
    } else {
      // Immediate update for other filters
      setFilters((prev) => ({ ...prev, [name]: value }));
    }
  };

  const clearFilters = () => {
    if (searchDebounce) {
      clearTimeout(searchDebounce);
      setSearchDebounce(null);
    }
    setFilters({
      search: '',
      make: '',
      status: 'ALL',
      sortBy: 'newest',
      minPrice: '',
      maxPrice: '',
      minYear: '',
      maxYear: '',
      maxMileage: '',
      transmission: '',
      fuelType: '',
    });
  };

  const getFilterCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.make) count++;
    if (filters.status !== 'ALL') count++;
    if (filters.minPrice || filters.maxPrice) count++;
    if (filters.minYear || filters.maxYear) count++;
    if (filters.maxMileage) count++;
    if (filters.transmission) count++;
    if (filters.fuelType) count++;
    return count;
  };

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
      // Get phone value and convert to undefined if empty
      const phoneValue = formData.get('phone')?.toString().trim();
      
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.get('name'),
          email: formData.get('email'),
          phone: phoneValue || undefined,
          message: formData.get('message'),
        }),
      });

      const result = await response.json();
      if (result.success) {
        setFormStatus({ type: 'success', message: 'Message sent! We\'ll get back to you soon.' });
        form.reset();
      } else {
        setFormStatus({ type: 'error', message: result.error || 'Failed to send message. Please try again.' });
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

    const requestData = {
          vehicle: formData.get('vehicle'),
          mileage: formData.get('mileage'),
          condition: formData.get('condition'),
          email: formData.get('email'),
    };

    console.log('Trade-in form data:', requestData);

    try {
      const response = await fetch('/api/trade-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData),
      });

      const result = await response.json();
      console.log('Trade-in response:', result);
      if (result.success) {
        setFormStatus({ type: 'success', message: 'Appraisal request received! Check your email.' });
        form.reset();
      } else {
        setFormStatus({ type: 'error', message: result.error || 'Failed to submit. Please try again.' });
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
        <nav className="container mx-auto px-6 flex justify-between items-center nav-mobile" role="navigation" aria-label="Main navigation" style={{height: '88px'}}>
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
              Drive Confidently
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
                Featured Vehicles
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                Hand-picked selection of our finest cars, meticulously inspected for your peace of mind.
              </p>
              <div className="mt-4 flex items-center justify-center gap-4">
                <button 
                  onClick={async () => {
                    console.log('Manual refresh of featured vehicles...');
                    try {
                      const featuredResponse = await fetch('/api/vehicles/featured?limit=3', {
                        cache: 'no-store',
                        headers: { 'Cache-Control': 'no-cache' },
                      });
                      const featuredData = await featuredResponse.json();
                      if (featuredData.success) {
                        setFeaturedVehicles(featuredData.data || []);
                        setLastFeaturedUpdate(Date.now());
                        console.log('Featured vehicles manually refreshed:', featuredData.data);
                      }
                    } catch (error) {
                      console.error('Manual refresh failed:', error);
                    }
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  🔄 Refresh Featured
                </button>
                <span className="text-xs text-gray-400">
                  Last updated: <span suppressHydrationWarning>{new Date(lastFeaturedUpdate).toLocaleTimeString()}</span>
                </span>
              </div>
            </div>
            
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
                <span className="ml-4 text-gray-400 text-lg">Loading featured vehicles...</span>
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
                <h3 className="text-2xl font-bold text-white mb-4">Featured Vehicles Coming Soon</h3>
                <p className="text-gray-400 text-lg">We're curating an exceptional selection of vehicles for you. Check back soon!</p>
              </div>
            )}
          </div>
        </section>

        {/* About Section Teaser */}
        <section className="py-20 bg-gray-900 section-blend relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M20 20c0 5.523-4.477 10-10 10s-10-4.477-10-10 4.477-10 10-10 10 4.477 10 10z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}></div>
          </div>

          <div className="container mx-auto px-6 relative z-10">

          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-20 bg-gray-800 section-blend">
          <div className="container mx-auto px-6 text-center reveal">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Here's What Our Neighbours are Saying</h2>
            
            {/* Google Reviews Header */}
            <div className="mb-8">
              <div className="inline-flex items-center bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 border border-white/20">
                <svg className="w-6 h-6 text-yellow-400 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                <span className="text-white font-semibold">Google Reviews</span>
                {googleReviews && (
                  <span className="ml-2 text-yellow-400 font-bold">{googleReviews.rating}/5</span>
                )}
              </div>
            </div>

            {/* Google Reviews Display */}
            {reviewsLoading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                <p className="mt-4 text-gray-400">Loading reviews...</p>
              </div>
            ) : googleReviews?.reviews && googleReviews.reviews.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {googleReviews.reviews.map((review: any, index: number) => (
                    <div key={index} className="bg-gray-900/60 backdrop-blur-sm rounded-lg p-6 border border-white/10 hover:border-blue-500/50 transition-all hover:shadow-xl">
                      {/* Author Info */}
                      <div className="flex items-center mb-4">
                        {review.authorPhoto && (
                          <img 
                            src={review.authorPhoto} 
                            alt={review.author} 
                            className="w-12 h-12 rounded-full mr-3"
                          />
                        )}
                        <div className="flex-1">
                          <h4 className="font-semibold text-white">{review.author}</h4>
                          <p className="text-sm text-gray-400">{review.time}</p>
                        </div>
                      </div>
                      
                      {/* Rating Stars */}
                      <div className="flex mb-3">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`w-5 h-5 ${i < review.rating ? 'text-yellow-400' : 'text-gray-600'}`}
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                          </svg>
                        ))}
                      </div>
                      
                      {/* Review Text */}
                      <p className="text-gray-300 leading-relaxed line-clamp-4">{review.text}</p>
                    </div>
                  ))}
                </div>

                {/* View All Reviews Link */}
                <div className="text-center">
                  <a 
                    href="https://www.google.com/maps/place/Luxor+Auto+Sale/@43.897235,-78.850816,15z/data=!4m6!3m5!1s0x89d51e3b598e3b0f:0x1e0bbd5c4e8c9c8c!8m2!3d43.897235!4d-78.850816!16s%2Fg%2F1trvkkkz?entry=ttu"
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center btn-outline-modern px-6 py-3 rounded-full text-sm font-semibold hover:scale-105 transition-transform"
                  >
                    View All {googleReviews.totalRatings || ''} Reviews on Google
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </>
            ) : (
              <div className="bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-blue-600/20 backdrop-blur-sm rounded-lg p-8 border border-white/20 text-center">
                <svg className="w-16 h-16 text-yellow-400 mx-auto mb-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                <h3 className="text-2xl font-bold text-white mb-3">See What Our Customers Are Saying</h3>
                <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
                  We're proud of our 4.9-star rating from real customers. Read genuine reviews from families in Oshawa and across the Durham Region who have trusted us with their car buying journey.
                </p>
                <a 
                  href="https://www.google.com/maps/place/Luxor+Auto+Sale/@43.897235,-78.850816,15z/data=!4m6!3m5!1s0x89d51e3b598e3b0f:0x1e0bbd5c4e8c9c8c!8m2!3d43.897235!4d-78.850816!16s%2Fg%2F1trvkkkz?entry=ttu"
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center btn-modern px-8 py-4 rounded-full text-lg font-semibold hover:scale-105 transition-transform"
                >
                  Read All Reviews on Google
                </a>
              </div>
            )}
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

            {/* Quick Search & Filter */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 mb-8 border border-blue-500/20">
              {/* Search Bar */}
              <div className="mb-6">
                <div className="relative">
                  <input
                    type="text"
                    name="search"
                    value={filters.search}
                    onChange={handleFilterChange}
                    placeholder="Search by make, model, year, or any keyword..."
                    className="w-full px-4 py-3 pl-12 bg-gray-700/50 border border-blue-500/30 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition-colors"
                  />
                  <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              {/* Quick Filters */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                <select
                  name="make"
                  value={filters.make}
                  onChange={handleFilterChange}
                  className="px-4 py-2 bg-gray-700/50 border border-blue-500/30 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition-colors"
                >
                  <option value="">All Makes</option>
                  {availableMakes.map(make => (
                    <option key={make} value={make}>{make}</option>
                  ))}
                </select>

                <select
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  className="px-4 py-2 bg-gray-700/50 border border-blue-500/30 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition-colors"
                >
                  <option value="ALL">All Status</option>
                  <option value="AVAILABLE">Available</option>
                  <option value="PENDING">Pending</option>
                  <option value="SOLD">Sold</option>
                </select>

                <select
                  name="sortBy"
                  value={filters.sortBy}
                  onChange={handleFilterChange}
                  className="px-4 py-2 bg-gray-700/50 border border-blue-500/30 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition-colors"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="mileage-low">Mileage: Low to High</option>
                  <option value="mileage-high">Mileage: High to Low</option>
                </select>
              </div>

              {/* Advanced Filters Panel */}
              {showFilters && (
                <div className="mt-6 p-6 bg-gray-700/30 rounded-lg border border-gray-600/30">
                  <h3 className="text-lg font-semibold text-white mb-4">Advanced Filters</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="sm:col-span-2 lg:col-span-1">
                      <label className="block text-sm text-gray-300 mb-2">Price Range</label>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="number"
                          name="minPrice"
                          value={filters.minPrice}
                          onChange={handleFilterChange}
                          placeholder="Min Price"
                          className="w-full px-3 py-2 bg-gray-700/50 border border-blue-500/30 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition-colors"
                        />
                        <input
                          type="number"
                          name="maxPrice"
                          value={filters.maxPrice}
                          onChange={handleFilterChange}
                          placeholder="Max Price"
                          className="w-full px-3 py-2 bg-gray-700/50 border border-blue-500/30 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition-colors"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-2 lg:col-span-1">
                      <label className="block text-sm text-gray-300 mb-2">Year Range</label>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="number"
                          name="minYear"
                          value={filters.minYear}
                          onChange={handleFilterChange}
                          placeholder="Min Year"
                          min="1990"
                          max="2024"
                          className="w-full px-3 py-2 bg-gray-700/50 border border-blue-500/30 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition-colors"
                        />
                        <input
                          type="number"
                          name="maxYear"
                          value={filters.maxYear}
                          onChange={handleFilterChange}
                          placeholder="Max Year"
                          min="1990"
                          max="2024"
                          className="w-full px-3 py-2 bg-gray-700/50 border border-blue-500/30 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition-colors"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm text-gray-300 mb-2">Max Mileage</label>
                      <input
                        type="number"
                        name="maxMileage"
                        value={filters.maxMileage}
                        onChange={handleFilterChange}
                        placeholder="e.g., 100000"
                        min="0"
                        className="w-full px-3 py-2 bg-gray-700/50 border border-blue-500/30 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-gray-300 mb-2">Transmission</label>
                      <select
                        name="transmission"
                        value={filters.transmission}
                        onChange={handleFilterChange}
                        className="w-full px-3 py-2 bg-gray-700/50 border border-blue-500/30 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition-colors"
                      >
                        <option value="">Any Transmission</option>
                        <option value="AUTOMATIC">Automatic</option>
                        <option value="MANUAL">Manual</option>
                        <option value="CVT">CVT</option>
                        <option value="DCT">DCT</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm text-gray-300 mb-2">Fuel Type</label>
                      <select
                        name="fuelType"
                        value={filters.fuelType}
                        onChange={handleFilterChange}
                        className="w-full px-3 py-2 bg-gray-700/50 border border-blue-500/30 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition-colors"
                      >
                        <option value="">Any Fuel Type</option>
                        <option value="GASOLINE">Gasoline</option>
                        <option value="DIESEL">Diesel</option>
                        <option value="HYBRID">Hybrid</option>
                        <option value="ELECTRIC">Electric</option>
                        <option value="PLUG_IN_HYBRID">Plug-in Hybrid</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Filter Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    <svg className={`w-5 h-5 mr-2 transition-transform ${showFilters ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                    {showFilters ? 'Hide Advanced Filters' : 'Show Advanced Filters'}
                    {getFilterCount() > 0 && (
                      <span className="ml-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                        {getFilterCount()}
                      </span>
                    )}
                  </button>

                  {getFilterCount() > 0 && (
                    <button
                      onClick={clearFilters}
                      className="text-gray-400 hover:text-white transition-colors text-sm flex items-center"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Clear All Filters
                    </button>
                  )}
                </div>

                <div className="text-sm text-gray-400 text-center sm:text-right">
            {loading ? (
                    <div className="flex items-center justify-center sm:justify-end">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
                      Loading...
                    </div>
                  ) : (
                    `${vehicles.length} vehicle${vehicles.length !== 1 ? 's' : ''} found`
                  )}
                </div>
              </div>
            </div>
            
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-500"></div>
                <span className="ml-4 text-gray-400 text-xl">Loading our collection...</span>
              </div>
            ) : vehicles.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12 transition-all duration-500">
                  {vehicles.slice(0, 6).map((vehicle: any, index: number) => (
                    <div 
                      key={vehicle.id} 
                      className="group bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl overflow-hidden shadow-2xl transform hover:-translate-y-4 hover:shadow-blue-500/20 transition-all duration-500 border border-gray-700 hover:border-blue-500/50 animate-fadeInUp"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
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
        <section id="financing" className="py-20 bg-gray-800 relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}></div>
          </div>

          <div className="container mx-auto px-6 text-center reveal relative z-10">
            <span className="inline-block bg-green-600 text-white px-4 py-2 rounded-full text-sm font-semibold mb-4">
              💰 Flexible Financing Options
            </span>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
              Financing Shouldn't Be a Roadblock
            </h2>
            <p className="text-xl text-gray-300 mb-4 max-w-3xl mx-auto leading-relaxed">
              Worried about your credit? Don't be. We specialize in finding solutions for every situation. Let us handle the financing so you can focus on the test drive.
            </p>
            <p className="text-lg text-gray-400 mb-12 max-w-2xl mx-auto">
              Bad credit? No credit? We've helped hundreds of Oshawa residents get into quality vehicles with flexible financing options.
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
                <button type="submit" className="btn-modern w-full mt-6">Get Pre-Approved Now</button>
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
              <h3 className="text-xl font-bold mb-4 text-center">Get Your Offer Now</h3>
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
        <section id="about" className="py-24 bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800 relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }} />
            </div>
          
          <div className="container mx-auto px-6 relative z-10">
            {/* Header */}
            <div className="text-center mb-16 reveal">
              <span className="inline-block bg-gradient-to-r from-blue-600 to-green-600 text-white px-6 py-3 rounded-full text-sm font-semibold mb-6">
                🏠 Family-Owned & Operated Since Day One
              </span>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-green-400 to-blue-400 bg-clip-text text-transparent">
                About Luxor Auto Sale
              </h2>
              <p className="max-w-3xl mx-auto text-xl text-gray-300 leading-relaxed">
                Your trusted family in Oshawa's automotive community. Where relationships matter more than transactions.
              </p>
              <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-green-500 mx-auto rounded-full mt-6"></div>
            </div>

            {/* Main Content */}
            <div className="max-w-6xl mx-auto">
              {/* Values & Features Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                {/* Quality Card */}
                <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 backdrop-blur-sm border border-blue-500/20 rounded-2xl p-8 text-center hover:scale-105 transition-all duration-300 reveal">
                  <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h4 className="text-xl font-bold text-white mb-4">Quality Assurance</h4>
                  <p className="text-gray-300 mb-4">Every vehicle undergoes a comprehensive 150-point inspection to ensure safety and reliability.</p>
                  <div className="text-2xl font-bold text-blue-400">150+</div>
                  <div className="text-sm text-gray-400">Point Inspection</div>
                </div>

                {/* Trust Card */}
                <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 backdrop-blur-sm border border-green-500/20 rounded-2xl p-8 text-center hover:scale-105 transition-all duration-300 reveal">
                  <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <h4 className="text-xl font-bold text-white mb-4">Family Values</h4>
                  <p className="text-gray-300 mb-4">Community-focused approach with personalized service and local expertise.</p>
                  <div className="text-2xl font-bold text-green-400">100%</div>
                  <div className="text-sm text-gray-400">Family Owned</div>
                </div>

                {/* Value Card */}
                <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-8 text-center hover:scale-105 transition-all duration-300 reveal">
                  <div className="w-16 h-16 bg-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <h4 className="text-xl font-bold text-white mb-4">Fair Pricing</h4>
                  <p className="text-gray-300 mb-4">Transparent pricing with no hidden fees and competitive market rates.</p>
                  <div className="text-2xl font-bold text-purple-400">0%</div>
                  <div className="text-sm text-gray-400">Hidden Fees</div>
                </div>
              </div>

              {/* Services & Expertise */}
              <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
                <div className="reveal">
                  <h3 className="text-3xl font-bold mb-6 text-white">Why Choose Luxor Auto Sale?</h3>
                  <div className="space-y-6">
                    <div className="flex items-start">
                      <div className="w-8 h-8 bg-blue-600/20 rounded-lg flex items-center justify-center mr-4 mt-1">
                        <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-white font-semibold mb-2">No Pressure, Just Honest Advice</h4>
                        <p className="text-gray-300">Big dealerships see numbers; we see faces. We take time to understand your needs, budget, and lifestyle because your success is our success.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="w-8 h-8 bg-green-600/20 rounded-lg flex items-center justify-center mr-4 mt-1">
                        <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-white font-semibold mb-2">We Work With Real People</h4>
                        <p className="text-gray-300">Perfect credit? Great. Rebuilding? We got you. Life happens, and we understand. We'll find a solution that works for your situation, not just push a sale.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="w-8 h-8 bg-purple-600/20 rounded-lg flex items-center justify-center mr-4 mt-1">
                        <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-white font-semibold mb-2">We're Here to Stay</h4>
                        <p className="text-gray-300">We're not moving anywhere. We're invested in the Durham Region because this is our home too. Your support strengthens our entire community.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="reveal">
                  <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
                    <h4 className="text-xl font-bold text-white mb-6 text-center">Our Service Area</h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between py-3 border-b border-gray-700/50">
                        <span className="text-gray-300">Oshawa</span>
                        <span className="text-blue-400 font-semibold">Primary</span>
                      </div>
                      <div className="flex items-center justify-between py-3 border-b border-gray-700/50">
                        <span className="text-gray-300">Whitby</span>
                        <span className="text-green-400 font-semibold">Serving</span>
                      </div>
                      <div className="flex items-center justify-between py-3 border-b border-gray-700/50">
                        <span className="text-gray-300">Ajax</span>
                        <span className="text-green-400 font-semibold">Serving</span>
                      </div>
                      <div className="flex items-center justify-between py-3">
                        <span className="text-gray-300">Durham Region</span>
                        <span className="text-green-400 font-semibold">Full Coverage</span>
                      </div>
                    </div>
                    
                    <div className="mt-6 p-4 bg-gradient-to-r from-blue-500/10 to-green-500/10 rounded-xl border border-blue-500/20">
                      <p className="text-sm text-gray-300 text-center">
                        <span className="text-blue-400 font-semibold">Free Delivery:</span> We can deliver your vehicle anywhere in the Durham Region!
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Commitment Section */}
            <div className="bg-gradient-to-r from-blue-500/10 via-green-500/10 to-blue-500/10 backdrop-blur-sm border border-white/10 rounded-3xl p-8 md:p-12 reveal">
              <div className="text-center mb-8">
                <h3 className="text-3xl md:text-4xl font-bold mb-4 text-white">Our Commitment to You</h3>
                <div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-green-500 mx-auto rounded-full"></div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <p className="text-gray-300 leading-relaxed text-lg mb-6">
                    We're not just selling cars; we're <span className="text-blue-400 font-semibold">building relationships</span>. Our knowledgeable team is here to guide you, not pressure you.
                  </p>
                  <p className="text-gray-300 leading-relaxed text-lg mb-8">
                    Every vehicle on our lot undergoes a <span className="text-green-400 font-semibold">rigorous inspection</span> to meet our high standards for safety and quality. Come visit us and experience the Luxor Auto difference.
                  </p>
                  
                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-400 mb-2">100%</div>
                      <div className="text-sm text-gray-300">Quality Inspected</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-400 mb-2">24/7</div>
                      <div className="text-sm text-gray-300">Customer Support</div>
                    </div>
                  </div>
                </div>
                
                <div className="relative">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d9165.568808671715!2d-78.84816250000002!3d43.88747840000001!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89d51d6348abea79%3A0x7f64e7cc74c6053d!2sLuxor%20Auto%20Sales!5e1!3m2!1sen!2sca!4v1761310128466!5m2!1sen!2sca"
                    width="100%"
                    height="300"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    className="rounded-2xl shadow-2xl"
                    title="Luxor Auto Sale Location - 477 Ritson Rd S, Oshawa, ON L1H 5K1"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3">
                    <p className="text-sm font-semibold text-gray-800">📍 Visit Us</p>
                    <p className="text-xs text-gray-600">Oshawa, ON</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-24 bg-gradient-to-br from-gray-900 via-black to-gray-900 relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }} />
          </div>
          
          <div className="container mx-auto px-6 relative z-10">
            {/* Header */}
            <div className="text-center mb-16 reveal">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-green-500 rounded-full mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-green-400 to-blue-400 bg-clip-text text-transparent">
                Get In Touch
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                Have a question or want to <span className="text-blue-400 font-semibold">book a viewing</span>? 
                We're here to help you find your perfect vehicle!
              </p>
              <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-green-500 mx-auto rounded-full mt-6"></div>
            </div>

            <div className="grid lg:grid-cols-2 gap-16 items-start">
              {/* Contact Form */}
              <div className="reveal">
                <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-white/10 rounded-3xl p-8 md:p-10">
                  <div className="mb-8">
                    <h3 className="text-2xl font-bold text-white mb-4">Send us a Message</h3>
                    <p className="text-gray-300">We'll get back to you within 24 hours</p>
                  </div>
                  
                  <form onSubmit={handleContactSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="group">
                        <label className="block text-sm font-medium text-gray-300 mb-2">Your Name *</label>
                  <input
                    type="text"
                    name="name"
                          placeholder="Enter your full name"
                    required
                          className="w-full bg-gray-800/50 backdrop-blur-sm border border-gray-600/50 text-white rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 placeholder-gray-400"
                  />
                      </div>
                      <div className="group">
                        <label className="block text-sm font-medium text-gray-300 mb-2">Your Email *</label>
                  <input
                    type="email"
                    name="email"
                          placeholder="Enter your email address"
                    required
                          className="w-full bg-gray-800/50 backdrop-blur-sm border border-gray-600/50 text-white rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 placeholder-gray-400"
                  />
                      </div>
                    </div>
                    
                    <div className="group">
                      <label className="block text-sm font-medium text-gray-300 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                        placeholder="Enter your phone number"
                        className="w-full bg-gray-800/50 backdrop-blur-sm border border-gray-600/50 text-white rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 placeholder-gray-400"
                  />
                    </div>
                    
                    <div className="group">
                      <label className="block text-sm font-medium text-gray-300 mb-2">Your Message *</label>
                  <textarea
                    name="message"
                        placeholder="Tell us about your vehicle needs, questions, or how we can help you..."
                        rows={5}
                    required
                        className="w-full bg-gray-800/50 backdrop-blur-sm border border-gray-600/50 text-white rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 placeholder-gray-400 resize-none"
                  />
                </div>
                    
                    <button 
                      type="submit" 
                      className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/25"
                    >
                      <span className="flex items-center justify-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                        Send Message
                      </span>
                    </button>
                    
                    {formStatus.type === 'success' && (
                      <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 mt-4">
                        <p className="text-green-400 flex items-center">
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {formStatus.message}
                        </p>
                      </div>
                    )}
                    {formStatus.type === 'error' && (
                      <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mt-4">
                        <p className="text-red-400 flex items-center">
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {formStatus.message}
                        </p>
                      </div>
                    )}
              </form>
            </div>
              </div>

              {/* Contact Information */}
              <div className="reveal">
                <div className="space-y-8">
                  {/* Contact Details */}
                  <div className="bg-gradient-to-br from-blue-500/10 to-green-500/10 backdrop-blur-sm border border-white/10 rounded-3xl p-8">
                    <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                      <svg className="w-6 h-6 mr-3 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Contact Information
                    </h3>
                    
                    <div className="space-y-6">
                      <div className="flex items-start group">
                        <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mr-4 group-hover:bg-blue-500/30 transition-all duration-300">
                          <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-semibold text-white mb-1">Visit Our Showroom</h4>
                          <p className="text-gray-300">477 Ritson Rd S, Oshawa, ON L1H 5K1</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start group">
                        <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mr-4 group-hover:bg-green-500/30 transition-all duration-300">
                          <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-semibold text-white mb-1">Call Us Directly</h4>
                          <a href="tel:416-523-5375" className="text-green-400 hover:text-green-300 transition-colors duration-300 text-lg font-medium">
                            416-523-5375
                          </a>
                        </div>
                      </div>
                      
                      <div className="flex items-start group">
                        <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mr-4 group-hover:bg-purple-500/30 transition-all duration-300">
                          <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-semibold text-white mb-1">Email Us</h4>
                          <a href="mailto:sales@luxorautosale.com" className="text-purple-400 hover:text-purple-300 transition-colors duration-300">
                            sales@luxorautosale.com
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Business Hours */}
                  <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-white/10 rounded-3xl p-8">
                    <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                      <svg className="w-6 h-6 mr-3 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Business Hours
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="flex justify-between items-center py-3 border-b border-gray-700/50">
                        <span className="text-gray-300 font-medium">Monday - Friday</span>
                        <span className="text-green-400 font-semibold">9:00 AM - 7:00 PM</span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-gray-700/50">
                        <span className="text-gray-300 font-medium">Saturday</span>
                        <span className="text-green-400 font-semibold">10:00 AM - 5:00 PM</span>
                      </div>
                      <div className="flex justify-between items-center py-3">
                        <span className="text-gray-300 font-medium">Sunday</span>
                        <span className="text-red-400 font-semibold">Closed</span>
                      </div>
                    </div>
                    
                    <div className="mt-6 p-4 bg-gradient-to-r from-blue-500/10 to-green-500/10 rounded-xl border border-blue-500/20">
                      <p className="text-sm text-gray-300 text-center">
                        <span className="text-blue-400 font-semibold">Quick Response:</span> We typically respond to messages within 2-4 hours during business hours.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-gray-900 via-black to-gray-900 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>
        
        <div className="container mx-auto px-6 relative z-10">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 py-16">
            
            {/* Company Info */}
            <div className="lg:col-span-2">
              <a href="#home" className="mb-6 inline-block group">
                <img 
                  src="/Logo.png" 
                  alt="Luxor Auto Sale Logo" 
                  className="logo transition-all duration-300 group-hover:scale-105"
                />
              </a>
              <p className="text-gray-300 mb-6 leading-relaxed text-lg max-w-md">
                Family-owned dealership serving <span className="text-blue-400 font-semibold">Oshawa and the Durham Region</span> with quality used vehicles and exceptional service since day one.
              </p>
              
              {/* Contact Info */}
              <div className="space-y-3">
                <div className="flex items-center text-gray-300">
                  <div className="w-8 h-8 bg-blue-600/20 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
            </div>
                  <span>477 Ritson Rd S, Oshawa, ON L1H 5K1</span>
                </div>
                <div className="flex items-center text-gray-300">
                  <div className="w-8 h-8 bg-green-600/20 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <a href="tel:416-523-5375" className="hover:text-green-400 transition-colors">416-523-5375</a>
                </div>
                <div className="flex items-center text-gray-300">
                  <div className="w-8 h-8 bg-purple-600/20 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <a href="mailto:sales@luxorautosale.com" className="hover:text-purple-400 transition-colors">sales@luxorautosale.com</a>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-white text-xl font-bold mb-6 flex items-center">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-green-500 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </div>
                Quick Links
              </h3>
              <ul className="space-y-3">
                <li><a href="#inventory" className="text-gray-300 hover:text-blue-400 transition-all duration-300 flex items-center group">
                  <svg className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  Browse Inventory
                </a></li>
                <li><a href="#financing" className="text-gray-300 hover:text-blue-400 transition-all duration-300 flex items-center group">
                  <svg className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  Get Financing
                </a></li>
                <li><a href="#sell-trade" className="text-gray-300 hover:text-blue-400 transition-all duration-300 flex items-center group">
                  <svg className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  Sell Your Car
                </a></li>
                <li><a href="#about" className="text-gray-300 hover:text-blue-400 transition-all duration-300 flex items-center group">
                  <svg className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  About Us
                </a></li>
                <li><a href="#contact" className="text-gray-300 hover:text-blue-400 transition-all duration-300 flex items-center group">
                  <svg className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  Contact
                </a></li>
              </ul>
            </div>

            {/* Business Hours & Legal */}
            <div>
              <h3 className="text-white text-xl font-bold mb-6 flex items-center">
                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                Business Hours
              </h3>
              <div className="space-y-3 mb-8">
                <div className="flex justify-between items-center text-gray-300">
                  <span className="text-sm">Mon - Fri</span>
                  <span className="text-green-400 font-semibold">9:00 AM - 7:00 PM</span>
                </div>
                <div className="flex justify-between items-center text-gray-300">
                  <span className="text-sm">Saturday</span>
                  <span className="text-green-400 font-semibold">10:00 AM - 5:00 PM</span>
                </div>
                <div className="flex justify-between items-center text-gray-300">
                  <span className="text-sm">Sunday</span>
                  <span className="text-red-400 font-semibold">Closed</span>
                </div>
              </div>
              
              <div className="border-t border-gray-700 pt-6">
                <h4 className="text-white font-semibold mb-3">Legal</h4>
                <ul className="space-y-2">
                  <li><a href="/privacy" className="text-gray-400 hover:text-blue-400 transition-colors text-sm">Privacy Policy</a></li>
                  <li><a href="/terms" className="text-gray-400 hover:text-blue-400 transition-colors text-sm">Terms of Service</a></li>
                  <li><Link href="/admin" className="text-gray-500 hover:text-gray-300 transition-colors text-xs">Staff Login</Link></li>
              </ul>
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="border-t border-gray-700/50 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="text-gray-400 text-sm">
            <p>&copy; {new Date().getFullYear()} Luxor Auto Sale. All rights reserved.</p>
              </div>
              
              {/* Social Media Links */}
              <div className="flex items-center space-x-4">
                <span className="text-gray-400 text-sm mr-4">Follow us:</span>
                <a href="#" className="w-10 h-10 bg-gray-800 hover:bg-blue-600 rounded-lg flex items-center justify-center transition-all duration-300 group">
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 hover:bg-blue-600 rounded-lg flex items-center justify-center transition-all duration-300 group">
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                  </svg>
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 hover:bg-blue-600 rounded-lg flex items-center justify-center transition-all duration-300 group">
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.746-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001.012.001z"/>
                  </svg>
                </a>
              </div>
            </div>
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

