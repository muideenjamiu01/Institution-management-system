import axios from 'axios';
import logger from '../config/logger';

const FLUTTERWAVE_SECRET_KEY = process.env.FLUTTERWAVE_SECRET_KEY || '';
const FLUTTERWAVE_BASE_URL = 'https://api.flutterwave.com/v3';

interface InitializePaymentData {
  tx_ref: string;
  amount: number;
  currency: string;
  redirect_url: string;
  customer: {
    email: string;
    name: string;
    phonenumber?: string;
  };
  customizations?: {
    title: string;
    description: string;
    logo: string;
  };
  meta?: any;
}

export const initializePayment = async (data: InitializePaymentData) => {
  try {
    const response = await axios.post(
      `${FLUTTERWAVE_BASE_URL}/payments`,
      data,
      {
        headers: {
          Authorization: `Bearer ${FLUTTERWAVE_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return {
      success: true,
      data: response.data.data,
    };
  } catch (error: any) {
    logger.error('Flutterwave initialization error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.message || 'Payment initialization failed',
    };
  }
};

export const verifyPayment = async (transactionId: string) => {
  try {
    const response = await axios.get(
      `${FLUTTERWAVE_BASE_URL}/transactions/${transactionId}/verify`,
      {
        headers: {
          Authorization: `Bearer ${FLUTTERWAVE_SECRET_KEY}`,
        },
      }
    );

    return {
      success: true,
      data: response.data.data,
    };
  } catch (error: any) {
    logger.error('Flutterwave verification error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.message || 'Payment verification failed',
    };
  }
};

export const getAllBanks = async () => {
  try {
    const response = await axios.get(`${FLUTTERWAVE_BASE_URL}/banks/NG`, {
      headers: {
        Authorization: `Bearer ${FLUTTERWAVE_SECRET_KEY}`,
      },
    });

    return {
      success: true,
      data: response.data.data,
    };
  } catch (error: any) {
    logger.error('Flutterwave banks error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to get banks',
    };
  }
};
