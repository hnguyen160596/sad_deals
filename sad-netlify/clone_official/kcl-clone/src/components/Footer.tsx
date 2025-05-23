import type React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#1f1a1e] text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-[#f6cf13] rounded-lg p-6 mb-10 flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center mb-4 md:mb-0">
            <h2 className="text-[#1f1a1e] text-xl font-bold mr-2">
              Want cheap eats 365 days a year?
            </h2>
            <p className="text-[#1f1a1e] font-medium">
              Get our free food calendar and daily deals now!
            </p>
          </div>
          <div className="flex items-center">
            <input
              type="email"
              placeholder="Enter your email"
              className="px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none"
            />
            <button className="bg-[#982a4a] text-white px-4 py-2 rounded-r-md hover:bg-opacity-90 transition-colors">
              Submit
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center space-x-2">
              <img src="/images/sad-text-logo.png" alt="Sales Aholics Deals Logo" loading="lazy" decoding="async" className="h-8" />
            </Link>
            <p className="mt-4 text-sm">© 2025 Sales Aholics Deals</p>
            <div className="mt-4 flex space-x-4">
              <a href="#" aria-label="Facebook" className="text-white hover:text-[#f6cf13]">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" aria-label="Instagram" className="text-white hover:text-[#f6cf13]">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" aria-label="Twitter" className="text-white hover:text-[#f6cf13]">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a href="#" aria-label="Pinterest" className="text-white hover:text-[#f6cf13]">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z" />
                </svg>
              </a>
            </div>
          </div>

          <div className="lg:col-span-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4">Discover Deals</h3>
              <h4 className="text-sm text-gray-400 font-medium mb-2">Find Deals by Store</h4>
              <ul className="space-y-1 text-sm">
                <li><Link to="/coupons-for/amazon" className="hover:text-[#f6cf13] transition-colors">Amazon</Link></li>
                <li><Link to="/coupons-for/costco" className="hover:text-[#f6cf13] transition-colors">Costco</Link></li>
                <li><Link to="/coupons-for/cvs" className="hover:text-[#f6cf13] transition-colors">CVS</Link></li>
                <li><Link to="/coupons-for/target" className="hover:text-[#f6cf13] transition-colors">Target</Link></li>
                <li><Link to="/coupons-for/walmart" className="hover:text-[#f6cf13] transition-colors">Walmart</Link></li>
                <li><Link to="/stores" className="flex items-center text-[#f6cf13] hover:underline mt-2">
                  View all stores
                  <svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm text-gray-400 font-medium mb-2 mt-6">Find Deals by Category</h4>
              <ul className="space-y-1 text-sm">
                <li><Link to="/deals/baby-deals" className="hover:text-[#f6cf13] transition-colors">Baby</Link></li>
                <li><Link to="/deals/apparel" className="hover:text-[#f6cf13] transition-colors">Clothing</Link></li>
                <li><Link to="/deals/home" className="hover:text-[#f6cf13] transition-colors">Home</Link></li>
                <li><Link to="/deals/toys" className="hover:text-[#f6cf13] transition-colors">Toys</Link></li>
                <li><Link to="/deals" className="flex items-center text-[#f6cf13] hover:underline mt-2">
                  See all deals
                  <svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-4">Savings Hacks</h3>
              <h4 className="text-sm text-gray-400 font-medium mb-2">What's Happening This Month</h4>
              <ul className="space-y-1 text-sm">
                <li><Link to="/tips/money/amazon-memorial-day-deals" className="hover:text-[#f6cf13] transition-colors">Amazon Memorial Day Sale</Link></li>
                <li><Link to="/tips/money/target-memorial-day-deals" className="hover:text-[#f6cf13] transition-colors">Target Memorial Day Sale</Link></li>
                <li><Link to="/tips" className="flex items-center text-[#f6cf13] hover:underline mt-2">
                  See all savings hacks
                  <svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-4">Company</h3>
              <ul className="space-y-1 text-sm">
                <li><Link to="/about" className="hover:text-[#f6cf13] transition-colors">About Us</Link></li>
                <li><Link to="/beginners" className="hover:text-[#f6cf13] transition-colors">How to Coupon</Link></li>
                <li><Link to="/privacy-policy" className="hover:text-[#f6cf13] transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-[#f6cf13] transition-colors">Terms of Use</Link></li>
                <li><Link to="/contact" className="hover:text-[#f6cf13] transition-colors">Contact Us</Link></li>
              </ul>

              <div className="mt-6">
                <Link
                  to="/mobile-app"
                  className="flex items-center space-x-2 bg-[#f6cf13] text-[#1f1a1e] px-3 py-2 rounded-md text-sm font-medium hover:bg-opacity-90 transition-colors duration-200"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8zm3.36-11.5L9.64 12l5.72 3.5a.5.5 0 0 1 0 .86.5.5 0 0 1-.52 0l-6-3.65a.5.5 0 0 1 0-.86l6-3.65a.5.5 0 0 1 .52 0 .5.5 0 0 1 0 .8z" />
                  </svg>
                  <span>Download Our App</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-700">
          <p className="text-xs text-center text-gray-400">
            This is a clone project for educational purposes only. All deals and coupons are for demonstration.
          </p>
          <p className="text-xs text-center text-gray-400 mt-2">
            Information will be used in accordance with our Privacy Policy.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
