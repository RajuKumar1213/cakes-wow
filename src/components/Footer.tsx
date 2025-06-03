import { Facebook, Instagram, Twitter, Youtube, Linkedin, MapPin, Phone, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white">      {/* Trust badges */}
      <div className="bg-gray-100 py-3 sm:py-6">
        <div className="container mx-auto px-2 sm:px-4">
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-3 sm:space-y-0 sm:space-x-6 lg:space-x-12">
            <div className="flex  items-center space-x-2">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 sm:w-5 sm:h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-sm sm:text-base font-medium text-gray-800">On Time Delivery</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 sm:w-5 sm:h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-sm sm:text-base font-medium text-gray-800">100% Fresh & Hygienic</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 sm:w-5 sm:h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-sm sm:text-base font-medium text-gray-800">FSSAI Certified</span>
            </div>
          </div>
        </div>
      </div>      {/* Newsletter */}
      <div className="bg-red-500 py-3 sm:py-6">
        <div className="container mx-auto px-2 sm:px-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <h3 className="font-poppins text-base sm:text-xl font-bold mb-3 md:mb-0 text-white text-center md:text-left">Subscribe To Newsletter</h3>
            <div className="flex w-full md:w-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="px-2 sm:px-4 py-1.5 sm:py-2 rounded-l-lg text-gray-900 flex-1 md:w-80 focus:outline-none text-sm sm:text-base"
              />
              <button className="bg-gray-900 hover:bg-gray-800 px-3 sm:px-6 py-1.5 sm:py-2 rounded-r-lg font-medium text-white transition-colors text-sm sm:text-base">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>      {/* Main footer */}
      <div className="py-6 sm:py-12 bg-white">
        <div className="container mx-auto px-2 sm:px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
            {/* Company Info */}
            <div className="col-span-1 sm:col-span-2 lg:col-span-1">
              <h3 className="font-poppins text-xl sm:text-2xl font-bold text-red-500 mb-2 sm:mb-4">Cakes wow</h3>              <p className="font-inter text-gray-600 mb-3 sm:mb-4 text-sm sm:text-base">
                Your trusted FSSAI-certified bakery where every dessert tells a story! 
                We bake perfection with quality ingredients into impeccable cakes, pastries, and more.
              </p>
              <div className="flex space-x-3 sm:space-x-4">
                <Instagram className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600 hover:text-red-500 cursor-pointer transition-colors" />
                <Facebook className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600 hover:text-red-500 cursor-pointer transition-colors" />
                <Youtube className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600 hover:text-red-500 cursor-pointer transition-colors" />
                <Linkedin className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600 hover:text-red-500 cursor-pointer transition-colors" />
                <Twitter className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600 hover:text-red-500 cursor-pointer transition-colors" />
              </div>
            </div>

            {/* Know Us */}
            <div>
              <h4 className="font-poppins text-base sm:text-lg font-semibold mb-2 sm:mb-4 text-gray-800">Know Us</h4>
              <ul className="space-y-1 sm:space-y-2">
                <li><a href="#" className="text-gray-600 hover:text-red-500 transition-colors text-sm sm:text-base">Our Story</a></li>
                <li><a href="#" className="text-gray-600 hover:text-red-500 transition-colors text-sm sm:text-base">Contact Us</a></li>
                <li><a href="#" className="text-gray-600 hover:text-red-500 transition-colors text-sm sm:text-base">Locate Us</a></li>
                <li><a href="#" className="text-gray-600 hover:text-red-500 transition-colors text-sm sm:text-base">Blog</a></li>
                <li><a href="#" className="text-gray-600 hover:text-red-500 transition-colors text-sm sm:text-base">Media</a></li>
                <li><a href="#" className="text-gray-600 hover:text-red-500 transition-colors text-sm sm:text-base">Careers</a></li>
              </ul>
            </div>

            {/* Need Help */}
            <div>
              <h4 className="font-poppins text-base sm:text-lg font-semibold mb-2 sm:mb-4 text-gray-800">Need Help</h4>
              <ul className="space-y-1 sm:space-y-2">
                <li><a href="#" className="text-gray-600 hover:text-red-500 transition-colors text-sm sm:text-base">FAQ</a></li>
                <li><a href="#" className="text-gray-600 hover:text-red-500 transition-colors text-sm sm:text-base">Cancellation & Refund</a></li>
                <li><a href="#" className="text-gray-600 hover:text-red-500 transition-colors text-sm sm:text-base">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-600 hover:text-red-500 transition-colors text-sm sm:text-base">Terms & Conditions</a></li>
                <li><a href="#" className="text-gray-600 hover:text-red-500 transition-colors text-sm sm:text-base">Sitemap</a></li>
              </ul>
            </div>

            {/* More */}
            <div>
              <h4 className="font-poppins text-base sm:text-lg font-semibold mb-2 sm:mb-4 text-gray-800">More</h4>
              <ul className="space-y-1 sm:space-y-2">
                <li><a href="#" className="text-gray-600 hover:text-red-500 transition-colors text-sm sm:text-base">Trending Cakes</a></li>
                <li><a href="#" className="text-gray-600 hover:text-red-500 transition-colors text-sm sm:text-base">By Type</a></li>
                <li><a href="#" className="text-gray-600 hover:text-red-500 transition-colors text-sm sm:text-base">By Flavours</a></li>
                <li><a href="#" className="text-gray-600 hover:text-red-500 transition-colors text-sm sm:text-base">Delivery Cities</a></li>
              </ul>
            </div>
          </div>
        </div>
      </div>      {/* Bottom footer */}
      <div className="border-t border-gray-200 py-3 sm:py-6 bg-white">
        <div className="container mx-auto px-2 sm:px-4">
          <div className="flex flex-col md:flex-row justify-between items-center text-center md:text-left">
            <p className="text-gray-500 text-xs sm:text-sm">
              © 2025 Cakes wow. All rights reserved.
            </p>
            <div className="flex items-center space-x-2 sm:space-x-4 mt-2 md:mt-0">
              <span className="text-gray-500 text-xs sm:text-sm">Show us some love ❤ & connect with us!</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
