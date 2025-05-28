import { Facebook, Instagram, Twitter, Youtube, Linkedin, MapPin, Phone, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white">
      {/* Trust badges */}
      <div className="bg-gray-100 py-6">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center space-x-12">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="font-medium text-gray-800">On Time Delivery</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="font-medium text-gray-800">100% Fresh & Hygienic</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="font-medium text-gray-800">FSSAI Certified</span>
            </div>
          </div>
        </div>
      </div>      {/* Newsletter */}
      <div className="bg-red-500 py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <h3 className="text-xl font-bold mb-4 md:mb-0 text-white">Subscribe To Newsletter</h3>
            <div className="flex w-full md:w-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="px-4 py-2 rounded-l-lg text-gray-900 flex-1 md:w-80 focus:outline-none"
              />
              <button className="bg-gray-900 hover:bg-gray-800 px-6 py-2 rounded-r-lg font-medium text-white transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Company Info */}
            <div>
              <h3 className="text-2xl font-bold text-red-500 mb-4">Bakingo</h3>
              <p className="text-gray-600 mb-4">
                Your trusted FSSAI-certified bakery where every dessert tells a story! 
                We bake perfection with quality ingredients into impeccable cakes, pastries, and more.
              </p>
              <div className="flex space-x-4">
                <Instagram className="w-6 h-6 text-gray-600 hover:text-red-500 cursor-pointer transition-colors" />
                <Facebook className="w-6 h-6 text-gray-600 hover:text-red-500 cursor-pointer transition-colors" />
                <Youtube className="w-6 h-6 text-gray-600 hover:text-red-500 cursor-pointer transition-colors" />
                <Linkedin className="w-6 h-6 text-gray-600 hover:text-red-500 cursor-pointer transition-colors" />
                <Twitter className="w-6 h-6 text-gray-600 hover:text-red-500 cursor-pointer transition-colors" />
              </div>
            </div>

            {/* Know Us */}
            <div>
              <h4 className="text-lg font-semibold mb-4 text-gray-800">Know Us</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-600 hover:text-red-500 transition-colors">Our Story</a></li>
                <li><a href="#" className="text-gray-600 hover:text-red-500 transition-colors">Contact Us</a></li>
                <li><a href="#" className="text-gray-600 hover:text-red-500 transition-colors">Locate Us</a></li>
                <li><a href="#" className="text-gray-600 hover:text-red-500 transition-colors">Blog</a></li>
                <li><a href="#" className="text-gray-600 hover:text-red-500 transition-colors">Media</a></li>
                <li><a href="#" className="text-gray-600 hover:text-red-500 transition-colors">Careers</a></li>
              </ul>
            </div>

            {/* Need Help */}
            <div>
              <h4 className="text-lg font-semibold mb-4 text-gray-800">Need Help</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-600 hover:text-red-500 transition-colors">FAQ</a></li>
                <li><a href="#" className="text-gray-600 hover:text-red-500 transition-colors">Cancellation & Refund</a></li>
                <li><a href="#" className="text-gray-600 hover:text-red-500 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-600 hover:text-red-500 transition-colors">Terms & Conditions</a></li>
                <li><a href="#" className="text-gray-600 hover:text-red-500 transition-colors">Sitemap</a></li>
              </ul>
            </div>

            {/* More */}
            <div>
              <h4 className="text-lg font-semibold mb-4 text-gray-800">More</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-600 hover:text-red-500 transition-colors">Trending Cakes</a></li>
                <li><a href="#" className="text-gray-600 hover:text-red-500 transition-colors">By Type</a></li>
                <li><a href="#" className="text-gray-600 hover:text-red-500 transition-colors">By Flavours</a></li>
                <li><a href="#" className="text-gray-600 hover:text-red-500 transition-colors">Delivery Cities</a></li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom footer */}
      <div className="border-t border-gray-200 py-6 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm">
              © 2025 Bakingo. All rights reserved.
            </p>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <span className="text-gray-500 text-sm">Show us some love ❤ & connect with us!</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
