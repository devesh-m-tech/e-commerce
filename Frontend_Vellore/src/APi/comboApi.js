import axios from 'axios';
import axiosInstance from './axiosInstance';
import { SERVER_URL } from '../config/envConfig.js';

export const getAllCombos = async () => {
    try {
        const response = await axiosInstance.get('/combo/all');
        console.log('Raw API Response:', response);
        console.log('Combo Images:', response.data.map(combo => ({
            id: combo._id,
            image: combo.ccImage
        })));
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to fetch combos' };
    }
};

export const getComboById = async (id) => {
    try {
        console.log('Fetching combo with ID:', id);
        const response = await axiosInstance.get(`/combo/${id}`);
        console.log('Raw combo response:', response);
        console.log('Combo Image:', response.data.combo?.ccImage);

        if (response.data && response.data.success) {
            const combo = response.data.combo;
            if (combo.ccProducts) {
                combo.ccProducts = combo.ccProducts.map(product => {
                    console.log('Product Image:', product.pImage);
                    const backendBase = SERVER_URL;
                    let productImage = 'default-image-path.jpg';
                    if (product.pImage) {
                        const raw = Array.isArray(product.pImage) ? product.pImage[0] : product.pImage;
                        if (typeof raw === 'string') {
                            const clean = raw.replace(/\\/g, '/');
                            productImage = clean.startsWith('http') || clean.startsWith('data:')
                                ? clean
                                : `${backendBase}${clean.startsWith('/') ? '' : '/'}${clean}`;
                        }
                    }
                    console.log('Processed Product Image:', productImage);
                    return {
                        ...product,
                        pImage: productImage
                    };
                });
            }
            return combo;
        }
        return null;
    } catch (error) {
        console.error('Error in getComboById:', error.response || error);
        if (error.response?.status === 404) {
            return null;
        }
        throw error.response?.data || error;
    }
};

export const getComboProducts = async (id) => {
    try {
        console.log('Fetching products for combo:', id);
        const response = await axiosInstance.get(`/combo/${id}/products`);

        if (response.data && response.data.success) {
            return response.data;
        }
        throw new Error('Failed to fetch combo products');
    } catch (error) {
        console.error('Error fetching combo products:', error);
        throw error.response?.data || error;
    }
};
