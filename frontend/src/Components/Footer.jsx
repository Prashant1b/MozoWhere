import React from "react";
import { Link } from "react-router-dom";
import {
    Facebook,
    Instagram,
    Twitter,
    Youtube,
    Mail,
    Phone,
    MapPin,
} from "lucide-react";

export default function Footer() {
    return (
        <footer className="bg-gray-950 text-gray-300 mt-20">

            {/* Top CTA Section */}
            <div className="border-b border-gray-800">
                <div className="max-w-7xl mx-auto px-6 py-12 text-center">
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                        Stay Updated with Mozowhere
                    </h2>
                    <p className="mt-3 text-gray-400 text-sm">
                        Subscribe for new drops, exclusive offers & custom design tips.
                    </p>

                    <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
                        <div className="flex items-center bg-gray-800 rounded-xl px-4 py-3 w-full sm:w-96">
                            <Mail className="h-5 w-5 text-gray-400 mr-2" />
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="bg-transparent outline-none text-sm flex-1 text-white placeholder-gray-500"
                            />
                        </div>

                        <button className="bg-[#FFD23D] text-gray-900 font-extrabold px-6 py-3 rounded-xl hover:opacity-90 transition">
                            Subscribe
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Footer Grid */}
            <div className="max-w-7xl mx-auto px-6 py-14 grid grid-cols-2 md:grid-cols-4 gap-10">

                {/* Brand Section */}
                <div className="col-span-2 sm:col-span-1">
                    <Link to="/" className="text-2xl font-extrabold text-white">
                        MOZOWHERE<span className="text-[#FFD23D]">®</span>
                    </Link>

                    <p className="mt-4 text-sm text-gray-400 leading-relaxed">
                        India's premium custom fashion brand. Design your own
                        T-Shirts, Hoodies & more with ease.
                    </p>

                    <div className="flex gap-4 mt-6">
                        <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook">
                            <Facebook className="h-5 w-5 hover:text-[#FFD23D] cursor-pointer transition" />
                        </a>
                        <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram">
                            <Instagram className="h-5 w-5 hover:text-[#FFD23D] cursor-pointer transition" />
                        </a>
                        <a href="https://twitter.com" target="_blank" rel="noreferrer" aria-label="Twitter">
                            <Twitter className="h-5 w-5 hover:text-[#FFD23D] cursor-pointer transition" />
                        </a>
                        <a href="https://youtube.com" target="_blank" rel="noreferrer" aria-label="YouTube">
                            <Youtube className="h-5 w-5 hover:text-[#FFD23D] cursor-pointer transition" />
                        </a>
                    </div>
                </div>

                {/* Shop Links */}
                <div>
                    <h4 className="text-white font-bold mb-4">Shop</h4>
                    <ul className="space-y-3 text-sm">
                        <li><Link to="/shop?cat=men" className="hover:text-[#FFD23D] transition">Men</Link></li>
                        <li><Link to="/shop?cat=women" className="hover:text-[#FFD23D] transition">Women</Link></li>
                        <li><Link to="/shop?category=hoodie" className="hover:text-[#FFD23D] transition">Hoodies</Link></li>
                        <li><Link to="/custom-tshirts" className="hover:text-[#FFD23D] transition">Customize</Link></li>
                        <li><Link to="/custom-accessories" className="hover:text-[#FFD23D] transition">Custom Accessories</Link></li>
                        <li><Link to="/bulk-order" className="hover:text-[#FFD23D] transition">Bulk Orders</Link></li>
                        <li><Link to="/trending" className="hover:text-[#FFD23D] transition">Trending</Link></li>
                    </ul>
                </div>

                {/* Support */}
                <div>
                    <h4 className="text-white font-bold mb-4">Support</h4>
                    <ul className="space-y-3 text-sm">
                        <li><Link to="/orders/track" className="hover:text-[#FFD23D] transition">Track Order</Link></li>
                        <li><Link to="/returns" className="hover:text-[#FFD23D] transition">Returns & Refunds</Link></li>
                        <li><Link to="/faq" className="hover:text-[#FFD23D] transition">FAQ</Link></li>
                        <li><Link to="/contact" className="hover:text-[#FFD23D] transition">Contact Us</Link></li>
                        <li><Link to="/profile" className="hover:text-[#FFD23D] transition">My Account</Link></li>
                        <li><Link to="/wishlist" className="hover:text-[#FFD23D] transition">Wishlist</Link></li>
                    </ul>
                </div>

                {/* Contact Info */}
                <div>
                    <h4 className="text-white font-bold mb-4">Contact</h4>

                    <div className="space-y-4 text-sm">
                        <a href="tel:+919123262970" className="flex items-center gap-3 hover:text-[#FFD23D] transition">
                            <Phone className="h-4 w-4 text-[#FFD23D]" />
                            <span>+91 9123262970</span>
                        </a>

                        <a href="mailto:mozowhere@gmail.com" className="flex items-center gap-3 hover:text-[#FFD23D] transition">
                            <Mail className="h-4 w-4 text-[#FFD23D]" />
                            <span>mozowhere@gmail.com</span>
                        </a>

                        <div className="flex items-start gap-3">
                            <MapPin className="h-4 w-4 text-[#FFD23D] mt-1 shrink-0" />
                            <span>
                                Chuharpur Khadar, Sector Chi 5 Road,<br />
                                Greater Noida, Gautam Buddha Nagar,<br />
                                Uttar Pradesh
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-gray-800">
                <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col sm:flex-row justify-between items-center text-sm text-gray-500">
                    <div>
                        © {new Date().getFullYear()} Mozowhere®. All rights reserved.
                    </div>

                    <div className="flex gap-6 mt-3 sm:mt-0">
                        <Link to="/privacy" className="hover:text-[#FFD23D] transition">
                            Privacy Policy
                        </Link>
                        <Link to="/terms" className="hover:text-[#FFD23D] transition">
                            Terms & Conditions
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
