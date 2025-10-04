'use client'

import Link from 'next/link';
import { Github, Twitter, MessageCircle, Mail, Heart } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { name: 'GitHub', href: 'https://github.com/yourusername/DataStreamNFT', icon: Github },
    { name: 'Twitter', href: 'https://twitter.com/datastreamnft', icon: Twitter },
    { name: 'Discord', href: 'https://discord.gg/datastreamnft', icon: MessageCircle },
    { name: 'Email', href: 'mailto:hello@datastreamnft.com', icon: Mail },
  ];

  const quickLinks = [
    { name: 'Home', href: '/' },
    { name: 'Marketplace', href: '/marketplace' },
    { name: 'Create', href: '/create' },
    { name: 'LazAI', href: '/lazai' },
    { name: 'Profile', href: '/profile' },
  ];

  const legalLinks = [
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms of Service', href: '/terms' },
    { name: 'Cookie Policy', href: '/cookies' },
  ];

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center mb-4">
              <span className="text-2xl font-bold text-blue-400">DataStreamNFT</span>
            </Link>
            <p className="text-gray-300 mb-6 max-w-md">
              Revolutionary Data Monetization Platform. Transform your data into queryable NFTs 
              that generate continuous revenue through AI model usage.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <a
                    key={link.name}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <Icon className="h-6 w-6" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              {legalLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © {currentYear} DataStreamNFT. All rights reserved.
            </p>
            <div className="flex items-center mt-4 md:mt-0">
              <span className="text-gray-400 text-sm mr-2">Made with</span>
              <Heart className="h-4 w-4 text-red-500" />
              <span className="text-gray-400 text-sm ml-2">for the decentralized future</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
