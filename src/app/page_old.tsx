// Public Homepage - Luxor Auto Sale
// Ported from original index.html design

import Link from 'next/link';
import Script from 'next/script';

export const metadata = {
  title: 'Luxor Auto Sale - Drive with Confidence | Used Cars in Oshawa',
  description: 'Tired of the stressful car search? Luxor Auto Sale in Oshawa offers a trusted selection of pre-owned vehicles so you can buy with confidence and get on the road faster.',
};

export default function HomePage() {
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
          <a href="#contact" className="hidden md:inline-block btn-indigo text-base" role="button" aria-label="Book a viewing appointment">
            Book a Viewing
          </a>
          <div className="md:hidden">
            <button id="mobile-menu-button" className="text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-900 rounded" 
                    aria-expanded="false" 
                    aria-label="Toggle mobile menu"
                    aria-controls="mobile-menu">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </nav>
        
        {/* Mobile Menu */}
        <div id="mobile-menu" className="md:hidden bg-gray-800 shadow-lg hidden" role="menu" aria-label="Mobile navigation menu">
          <a href="#home" className="mobile-menu-item block text-white hover:bg-red-600 transition-colors px-6 py-4" role="menuitem">Home</a>
          <a href="#inventory" className="mobile-menu-item block text-white hover:bg-red-600 transition-colors px-6 py-4" role="menuitem">Inventory</a>
          <a href="#financing" className="mobile-menu-item block text-white hover:bg-red-600 transition-colors px-6 py-4" role="menuitem">Financing</a>
          <a href="#sell-trade" className="mobile-menu-item block text-white hover:bg-red-600 transition-colors px-6 py-4" role="menuitem">Sell/Trade</a>
          <a href="#about" className="mobile-menu-item block text-white hover:bg-red-600 transition-colors px-6 py-4" role="menuitem">About</a>
          <a href="#contact" className="mobile-menu-item block text-white hover:bg-red-600 transition-colors px-6 py-4" role="menuitem">Contact</a>
          <div className="p-4">
            <a href="#contact" className="block text-center btn-indigo w-full" role="button">Book a Viewing</a>
          </div>
        </div>
      </header>

      <main id="main-content" role="main">
        {/* Hero Section */}
        <section id="home" className="hero-section min-h-screen flex items-center justify-center text-center px-4" role="banner" aria-labelledby="hero-title">
          <div className="reveal visible max-w-4xl mx-auto">
            <h1 id="hero-title" className="text-5xl md:text-7xl font-bold mb-6 drop-shadow-2xl">
              Drive Confidently.
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-200 leading-relaxed">
              Your trusted, stress-free car buying experience starts here.
            </p>
            <a href="#contact" className="btn-indigo text-2xl animate-pulse" role="button" aria-label="Book a viewing appointment">
              Book a Viewing
            </a>
          </div>
        </section>

        {/* Featured Inventory Section */}
        <section id="featured-inventory" className="py-20 bg-gray-800">
          <div className="container mx-auto px-6 text-center reveal">
            <h2 className="text-3xl md:text-4xl font-bold mb-2">Featured Vehicles</h2>
            <p className="mb-12 text-gray-400">Hand-picked selection of our finest cars, inspected for your peace of mind.</p>
            
            <div className="swiper featured-carousel">
              <div className="swiper-wrapper">
                {/* Car Cards will be dynamically loaded */}
                <div className="swiper-slide">
                  <div className="car-card bg-gray-900 rounded-2xl overflow-hidden shadow-2xl transform hover:scale-105 transition-transform duration-300 h-full flex flex-col">
                    <img src="https://images.unsplash.com/photo-1621007958614-8557935f0453?q=80&w=800&auto=format&fit=crop" alt="Featured Vehicle" className="w-full h-48 object-cover" loading="lazy" />
                    <div className="p-6 flex-grow flex flex-col justify-between">
                      <div>
                        <h3 className="text-xl font-bold">2023 Toyota Camry</h3>
                        <p className="text-green-500 font-semibold mt-2 text-2xl">$35,000</p>
                        <p className="text-gray-400 text-sm">15,000 km</p>
                      </div>
                      <Link href="/inventory" className="mt-4 inline-block btn-outline w-full text-center">View Details</Link>
                    </div>
                  </div>
                </div>
              </div>
              <div className="swiper-button-next text-red-500"></div>
              <div className="swiper-button-prev text-red-500"></div>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section className="py-20 bg-gray-900">
          <div className="container mx-auto px-6 text-center reveal">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose a Family-Owned Dealership?</h2>
            <p className="max-w-3xl mx-auto font-serif-georgia text-gray-400 leading-relaxed">
              At Luxor Auto Sale, you're not just another sale; you're our neighbour. As a family-owned business in Oshawa, our reputation is built on honesty and trust. We're here to build relationships and help our community drive with confidence.
            </p>
            <div className="mt-12 flex flex-col md:flex-row justify-center space-y-4 md:space-y-0 md:space-x-4">
              <Link href="/inventory" className="btn-indigo">Browse Inventory</Link>
              <a href="#financing" className="btn-outline">Get Financing</a>
              <a href="#sell-trade" className="btn-outline">Value Your Trade</a>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-20 bg-gray-800">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Get in Touch</h2>
            <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-12">
              <div>
                <h3 className="text-2xl font-bold mb-4">Contact Information</h3>
                <div className="space-y-4 text-gray-300">
                  <p><strong>Phone:</strong> <a href="tel:+14165235375" className="text-red-500 hover:underline">+1 (416) 523-5375</a></p>
                  <p><strong>Email:</strong> <a href="mailto:sales@luxorautosale.com" className="text-red-500 hover:underline">sales@luxorautosale.com</a></p>
                  <p><strong>Address:</strong> 477 Ritson Rd S, Oshawa, ON L1H 5K1</p>
                  <p><strong>Hours:</strong><br />
                  Mon-Fri: 9:00 AM - 7:00 PM<br />
                  Sat: 10:00 AM - 5:00 PM<br />
                  Sun: Closed</p>
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-4">Book a Viewing</h3>
                <p className="text-gray-400 mb-6">Fill out the form and we'll get back to you shortly!</p>
                <Link href="/inventory" className="btn-indigo w-full block text-center">
                  View Our Inventory
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-8 bg-gray-950 text-center text-gray-500">
        <div className="container mx-auto px-6">
          <p>&copy; 2025 Luxor Auto Sale. All rights reserved.</p>
          <Link href="/admin" className="text-gray-600 hover:text-gray-400 text-sm mt-2 inline-block">
            Staff Login
          </Link>
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
          
          // Close mobile menu when clicking a link
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
          }
        `}
      </Script>
    </>
  );
}
