import React from 'react';
import { motion } from 'framer-motion';

const CreatePage = () => {
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container-custom section-padding">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center"
                >
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        Create DataStream NFT
                    </h1>
                    <p className="text-xl text-gray-600 mb-8">
                        Upload your data and mint it as a queryable NFT
                    </p>
                    <div className="bg-white rounded-lg shadow-sm p-8">
                        <p className="text-gray-500">
                            Create functionality coming soon...
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default CreatePage;
