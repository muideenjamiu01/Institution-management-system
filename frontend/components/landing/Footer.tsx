'use client';

import { GraduationCap, Mail, Phone, MapPin } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <GraduationCap className="h-8 w-8 text-blue-500" />
              <span className="text-xl font-bold text-white">IMS</span>
            </div>
            <p className="text-sm">
              Empowering African education through innovative institutional
              management solutions.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#features" className="hover:text-blue-400 transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link href="#portals" className="hover:text-blue-400 transition-colors">
                  Portals
                </Link>
              </li>
              <li>
                <Link href="#about" className="hover:text-blue-400 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="#contact" className="hover:text-blue-400 transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Portals */}
          <div>
            <h3 className="text-white font-semibold mb-4">Portals</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/applicant/login"
                  className="hover:text-blue-400 transition-colors"
                >
                  Applicant Portal
                </Link>
              </li>
              <li>
                <Link
                  href="/student/login"
                  className="hover:text-blue-400 transition-colors"
                >
                  Student Portal
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-blue-400 transition-colors">
                  Admin Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start space-x-2">
                <MapPin className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <span>Lagos, Nigeria</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="h-5 w-5 text-blue-500 flex-shrink-0" />
                <span>+234 XXX XXX XXXX</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="h-5 w-5 text-blue-500 flex-shrink-0" />
                <span>info@ims.edu.ng</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-sm text-center">
          <p>
            &copy; {new Date().getFullYear()} Institutional Management System.
            All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
