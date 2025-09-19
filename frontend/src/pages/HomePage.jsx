import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
    ArrowRight, 
    Zap, 
    Shield, 
    DollarSign, 
    Users, 
    TrendingUp,
    CheckCircle,
    Star
} from 'lucide-react';

import { useWeb3 } from '../contexts/Web3Context';
import Button from '../components/ui/Button';

const HomePage = () => {
    const { isConnected, connectWallet, isConnecting } = useWeb3();

    const features = [
        {
            icon: <Zap className="w-6 h-6" />,
            title: 'Instant Micropayments',
            description: 'Get paid instantly for every query on your data with automated smart contract payments.'
        },
        {
            icon: <Shield className="w-6 h-6" />,
            title: 'Secure & Decentralized',
            description: 'Your data is stored on IPFS with blockchain ownership and access control.'
        },
        {
            icon: <DollarSign className="w-6 h-6" />,
            title: 'Continuous Revenue',
            description: 'Earn ongoing income from your data assets through AI model usage.'
        },
        {
            icon: <Users className="w-6 h-6" />,
            title: 'Global Marketplace',
            description: 'Connect with AI developers and researchers worldwide in our data marketplace.'
        }
    ];

    const stats = [
        { label: 'Data NFTs Created', value: '1,234', icon: <TrendingUp className="w-5 h-5" /> },
        { label: 'Total Queries', value: '45,678', icon: <Zap className="w-5 h-5" /> },
        { label: 'Active Creators', value: '567', icon: <Users className="w-5 h-5" /> },
        { label: 'Total Earnings', value: '12.5K DAT', icon: <DollarSign className="w-5 h-5" /> }
    ];

    const testimonials = [
        {
            name: 'Sarah Chen',
            role: 'AI Researcher',
            content: 'DataStreamNFT has revolutionized how I monetize my research data. The automated payments make it effortless.',
            rating: 5
        },
        {
            name: 'Marcus Johnson',
            role: 'Data Scientist',
            content: 'Finally, a platform that values data contributors fairly. The continuous revenue model is game-changing.',
            rating: 5
        },
        {
            name: 'Dr. Elena Rodriguez',
            role: 'Machine Learning Engineer',
            content: 'The quality of data available through DataStreamNFT is exceptional. Worth every DAT token spent.',
            rating: 5
        }
    ];

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-accent-600 text-white overflow-hidden">
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="relative container-custom section-padding">
                    <div className="max-w-4xl mx-auto text-center">
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            className="text-4xl md:text-6xl font-bold mb-6"
                        >
                            Transform Your Data Into
                            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
                                Continuous Revenue
                            </span>
                        </motion.h1>
                        
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="text-xl md:text-2xl text-primary-100 mb-8 max-w-3xl mx-auto"
                        >
                            Mint your data as NFTs and earn micropayments every time AI models query your datasets. 
                            Join the future of data monetization.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.4 }}
                            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                        >
                            {isConnected ? (
                                <>
                                    <Link to="/create">
                                        <Button
                                            size="lg"
                                            icon={<ArrowRight className="w-5 h-5" />}
                                            className="bg-white text-primary-600 hover:bg-gray-100"
                                        >
                                            Create Your First DataStream NFT
                                        </Button>
                                    </Link>
                                    <Link to="/marketplace">
                                        <Button
                                            variant="outline"
                                            size="lg"
                                            className="border-white text-white hover:bg-white hover:text-primary-600"
                                        >
                                            Explore Marketplace
                                        </Button>
                                    </Link>
                                </>
                            ) : (
                                <Button
                                    size="lg"
                                    icon={<ArrowRight className="w-5 h-5" />}
                                    onClick={connectWallet}
                                    loading={isConnecting}
                                    className="bg-white text-primary-600 hover:bg-gray-100"
                                >
                                    Connect Wallet to Get Started
                                </Button>
                            )}
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-16 bg-white">
                <div className="container-custom">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {stats.map((stat, index) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: index * 0.1 }}
                                className="text-center"
                            >
                                <div className="flex items-center justify-center mb-2 text-primary-600">
                                    {stat.icon}
                                </div>
                                <div className="text-3xl font-bold text-gray-900 mb-1">
                                    {stat.value}
                                </div>
                                <div className="text-sm text-gray-600">
                                    {stat.label}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 bg-gray-50">
                <div className="container-custom">
                    <div className="text-center mb-16">
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
                        >
                            Why Choose DataStreamNFT?
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="text-xl text-gray-600 max-w-3xl mx-auto"
                        >
                            Our platform combines cutting-edge blockchain technology with user-friendly design 
                            to create the ultimate data monetization experience.
                        </motion.p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map((feature, index) => (
                            <motion.div
                                key={feature.title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: index * 0.1 }}
                                className="card hover-lift p-6 text-center"
                            >
                                <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-600">
                                    {feature.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="py-20 bg-white">
                <div className="container-custom">
                    <div className="text-center mb-16">
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
                        >
                            How It Works
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="text-xl text-gray-600 max-w-3xl mx-auto"
                        >
                            Get started in minutes with our simple three-step process
                        </motion.p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                step: '01',
                                title: 'Upload & Mint',
                                description: 'Upload your dataset to IPFS and mint it as a DataStream NFT with custom pricing.'
                            },
                            {
                                step: '02',
                                title: 'List & Share',
                                description: 'List your NFT in our marketplace and share it with AI developers and researchers.'
                            },
                            {
                                step: '03',
                                title: 'Earn Automatically',
                                description: 'Receive instant micropayments every time someone queries your data through smart contracts.'
                            }
                        ].map((step, index) => (
                            <motion.div
                                key={step.step}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: index * 0.2 }}
                                className="text-center"
                            >
                                <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-6">
                                    {step.step}
                                </div>
                                <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                                    {step.title}
                                </h3>
                                <p className="text-gray-600 text-lg">
                                    {step.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="py-20 bg-gray-50">
                <div className="container-custom">
                    <div className="text-center mb-16">
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
                        >
                            What Our Users Say
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="text-xl text-gray-600 max-w-3xl mx-auto"
                        >
                            Join thousands of data creators and AI developers already using DataStreamNFT
                        </motion.p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {testimonials.map((testimonial, index) => (
                            <motion.div
                                key={testimonial.name}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: index * 0.1 }}
                                className="card p-6"
                            >
                                <div className="flex items-center mb-4">
                                    {[...Array(testimonial.rating)].map((_, i) => (
                                        <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                                    ))}
                                </div>
                                <p className="text-gray-600 mb-6 italic">
                                    "{testimonial.content}"
                                </p>
                                <div>
                                    <div className="font-semibold text-gray-900">
                                        {testimonial.name}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {testimonial.role}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-gradient-to-r from-primary-600 to-accent-600 text-white">
                <div className="container-custom text-center">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-3xl md:text-4xl font-bold mb-4"
                    >
                        Ready to Start Earning?
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto"
                    >
                        Join the data economy revolution and start monetizing your datasets today.
                    </motion.p>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        className="flex flex-col sm:flex-row gap-4 justify-center"
                    >
                        {isConnected ? (
                            <Link to="/create">
                                <Button
                                    size="lg"
                                    icon={<ArrowRight className="w-5 h-5" />}
                                    className="bg-white text-primary-600 hover:bg-gray-100"
                                >
                                    Create Your First NFT
                                </Button>
                            </Link>
                        ) : (
                            <Button
                                size="lg"
                                icon={<ArrowRight className="w-5 h-5" />}
                                onClick={connectWallet}
                                loading={isConnecting}
                                className="bg-white text-primary-600 hover:bg-gray-100"
                            >
                                Get Started Now
                            </Button>
                        )}
                        <Link to="/marketplace">
                            <Button
                                variant="outline"
                                size="lg"
                                className="border-white text-white hover:bg-white hover:text-primary-600"
                            >
                                Browse Marketplace
                            </Button>
                        </Link>
                    </motion.div>
                </div>
            </section>
        </div>
    );
};

export default HomePage;
