import React from 'react';
import { Link } from 'react-router-dom';
import { 
    Github, 
    Twitter, 
    Discord, 
    Mail, 
    ExternalLink,
    Heart
} from 'lucide-react';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    const footerLinks = {
        Product: [
            { name: 'Marketplace', href: '/marketplace' },
            { name: 'Create NFT', href: '/create' },
            { name: 'Documentation', href: 'https://docs.datastreamnft.com', external: true },
            { name: 'API Reference', href: 'https://api.datastreamnft.com', external: true },
        ],
        Community: [
            { name: 'Discord', href: 'https://discord.gg/datastreamnft', external: true },
            { name: 'Twitter', href: 'https://twitter.com/datastreamnft', external: true },
            { name: 'GitHub', href: 'https://github.com/yourusername/DataStreamNFT', external: true },
            { name: 'Blog', href: 'https://blog.datastreamnft.com', external: true },
        ],
        Support: [
            { name: 'Help Center', href: 'https://help.datastreamnft.com', external: true },
            { name: 'Contact Us', href: 'mailto:support@datastreamnft.com' },
            { name: 'Bug Reports', href: 'https://github.com/yourusername/DataStreamNFT/issues', external: true },
            { name: 'Feature Requests', href: 'https://github.com/yourusername/DataStreamNFT/discussions', external: true },
        ],
        Legal: [
            { name: 'Privacy Policy', href: 'https://datastreamnft.com/privacy' },
            { name: 'Terms of Service', href: 'https://datastreamnft.com/terms' },
            { name: 'Cookie Policy', href: 'https://datastreamnft.com/cookies' },
            { name: 'License', href: 'https://github.com/yourusername/DataStreamNFT/blob/main/LICENSE', external: true },
        ],
    };

    const socialLinks = [
        { name: 'GitHub', href: 'https://github.com/yourusername/DataStreamNFT', icon: Github },
        { name: 'Twitter', href: 'https://twitter.com/datastreamnft', icon: Twitter },
        { name: 'Discord', href: 'https://discord.gg/datastreamnft', icon: Discord },
        { name: 'Email', href: 'mailto:hello@datastreamnft.com', icon: Mail },
    ];

    return (
        <footer className="bg-gray-900 text-white">
            <div className="container-custom">
                {/* Main Footer Content */}
                <div className="py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
                    {/* Brand Section */}
                    <div className="lg:col-span-2">
                        <Link to="/" className="flex items-center space-x-2 mb-4">
                            <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-accent-600 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-sm">DS</span>
                            </div>
                            <span className="text-xl font-bold">DataStreamNFT</span>
                        </Link>
                        <p className="text-gray-400 mb-6 max-w-md">
                            Revolutionary Data Monetization Platform. Transform your data into queryable NFTs 
                            that generate continuous revenue through AI model usage.
                        </p>
                        <div className="flex space-x-4">
                            {socialLinks.map((social) => {
                                const Icon = social.icon;
                                return (
                                    <a
                                        key={social.name}
                                        href={social.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-gray-400 hover:text-white transition-colors"
                                        aria-label={social.name}
                                    >
                                        <Icon className="w-5 h-5" />
                                    </a>
                                );
                            })}
                        </div>
                    </div>

                    {/* Links Sections */}
                    {Object.entries(footerLinks).map(([title, links]) => (
                        <div key={title}>
                            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                                {title}
                            </h3>
                            <ul className="space-y-3">
                                {links.map((link) => (
                                    <li key={link.name}>
                                        {link.external ? (
                                            <a
                                                href={link.href}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-gray-400 hover:text-white transition-colors flex items-center group"
                                            >
                                                {link.name}
                                                <ExternalLink className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </a>
                                        ) : (
                                            <Link
                                                to={link.href}
                                                className="text-gray-400 hover:text-white transition-colors"
                                            >
                                                {link.name}
                                            </Link>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Bottom Section */}
                <div className="border-t border-gray-800 py-8">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <div className="flex items-center text-gray-400 text-sm mb-4 md:mb-0">
                            <span>© {currentYear} DataStreamNFT. All rights reserved.</span>
                        </div>
                        
                        <div className="flex items-center space-x-6 text-sm text-gray-400">
                            <span className="flex items-center">
                                Built with <Heart className="w-4 h-4 mx-1 text-red-500" /> for the future of data economy
                            </span>
                            <span>•</span>
                            <span>Powered by Lazchain & IPFS</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
