'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useWeb3 } from '../auth/web3-context';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCredits?: number;
}

interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price: number;
  pricePerCredit: number;
  usdPrice?: number;
  popular?: boolean;
}

const creditPackages: CreditPackage[] = [
  {
    id: 'starter',
    name: 'Starter',
    credits: 100,
    price: 9.99,
    usdPrice: 9.99,
    pricePerCredit: 0.10,
  },
  {
    id: 'pro',
    name: 'Professional',
    credits: 500,
    price: 39.99,
    usdPrice: 39.99,
    pricePerCredit: 0.08,
    popular: true,
  },
  {
    id: 'business',
    name: 'Business',
    credits: 1500,
    price: 99.99,
    usdPrice: 99.99,
    pricePerCredit: 0.067,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    credits: 5000,
    price: 299.99,
    usdPrice: 299.99,
    pricePerCredit: 0.06,
  },
];

export default function PricingModal({
  isOpen,
  onClose,
  currentCredits = 0,
}: PricingModalProps) {
  const { address, isConnected, connectWallet } = useWeb3();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'wallet'>('card');

  const handlePurchaseWithCard = async (packageId: string) => {
    try {
      setLoading(true);
      setError(null);
      setSelectedPackage(packageId);

      const pkg = creditPackages.find(p => p.id === packageId);
      if (!pkg) {
        throw new Error('Invalid package selected');
      }

      const response = await fetch('/api/payments/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          packageId,
          credits: pkg.credits,
          amount: pkg.price,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create payment session');
      }

      const { redirectUrl } = await response.json();

      if (!redirectUrl) {
        throw new Error('Invalid payment session response');
      }

      // Redirect to payment gateway
      window.location.href = redirectUrl;
    } catch (err) {
      console.error('Purchase error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      setLoading(false);
      setSelectedPackage(null);
    }
  };

  const handlePurchaseWithWallet = async (packageId: string) => {
    try {
      setLoading(true);
      setError(null);
      setSelectedPackage(packageId);

      // Connect wallet if not already connected
      if (!isConnected) {
        await connectWallet();
      }

      const pkg = creditPackages.find(p => p.id === packageId);
      if (!pkg) {
        throw new Error('Invalid package selected');
      }

      // Create payment intent with wallet
      const response = await fetch('/api/payments/create-wallet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          packageId,
          credits: pkg.credits,
          amount: pkg.usdPrice,
          walletAddress: address,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create wallet payment');
      }

      const { txHash, amount, message } = await response.json();

      if (txHash) {
        // Show success message
        alert(`✅ Payment successful!\n\nTransaction: ${txHash}\n\nYour ${pkg.credits} credits will be added shortly.`);
        onClose();
      } else {
        throw new Error(message || 'Payment processing failed');
      }
    } catch (err) {
      console.error('Wallet payment error:', err);
      setError(err instanceof Error ? err.message : 'Wallet payment failed');
      setLoading(false);
      setSelectedPackage(null);
    }
  };

  const handlePurchase = (packageId: string) => {
    if (paymentMethod === 'card') {
      handlePurchaseWithCard(packageId);
    } else {
      handlePurchaseWithWallet(packageId);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6 md:p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 font-mono">Buy Credits</h2>
              <p className="text-gray-600 mt-2 font-mono">
                Current balance: <span className="font-semibold text-accent-green">{currentCredits.toLocaleString()} credits</span>
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl font-semibold"
            >
              ✕
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm font-mono">{error}</p>
            </div>
          )}

          {/* Payment Method Selection */}
          <div className="mb-8 p-4 border border-gray-200 rounded-lg bg-gray-50">
            <label className="block text-sm font-semibold text-gray-700 mb-3 font-mono">
              Payment Method
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label 
                className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all font-mono ${
                  paymentMethod === 'card'
                    ? 'border-accent-green bg-green-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="payment-method"
                  value="card"
                  checked={paymentMethod === 'card'}
                  onChange={(e) => setPaymentMethod(e.target.value as 'card' | 'wallet')}
                  className="w-4 h-4"
                />
                <span className="ml-3">
                  <span className="block font-semibold text-gray-900">💳 Credit Card</span>
                  <span className="text-xs text-gray-600">Visa, Mastercard</span>
                </span>
              </label>

              <label 
                className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all font-mono ${
                  paymentMethod === 'wallet'
                    ? 'border-accent-green bg-green-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="payment-method"
                  value="wallet"
                  checked={paymentMethod === 'wallet'}
                  onChange={(e) => setPaymentMethod(e.target.value as 'card' | 'wallet')}
                  className="w-4 h-4"
                />
                <span className="ml-3">
                  <span className="block font-semibold text-gray-900">🔗 Wallet</span>
                  <span className="text-xs text-gray-600">MetaMask, WalletConnect</span>
                </span>
              </label>
            </div>

            {/* Wallet Connection Status */}
            {paymentMethod === 'wallet' && (
              <div className="mt-4 p-3 bg-white border border-gray-200 rounded-lg">
                {isConnected ? (
                  <p className="text-sm font-mono text-green-700">
                    ✓ Wallet connected: <span className="font-semibold">{address?.slice(0, 6)}...{address?.slice(-4)}</span>
                  </p>
                ) : (
                  <p className="text-sm font-mono text-gray-600">
                    💡 Your wallet will connect when you click "Get Credits"
                  </p>
                )}
              </div>
            )}
          </div>
          </div>

          {/* Credit Packages Grid */}
          <div className="grid md:grid-cols-4 gap-4 mb-8">
            {creditPackages.map((pkg) => (
              <motion.div
                key={pkg.id}
                whileHover={{ translateY: -4 }}
                onClick={() => !loading && handlePurchase(pkg.id)}
                className={`rounded-xl p-5 cursor-pointer transition-all border-2 ${
                  pkg.popular
                    ? 'border-accent-green bg-green-50 ring-2 ring-accent-green'
                    : 'border-gray-200 bg-white hover:border-accent-green'
                } ${loading && selectedPackage !== pkg.id ? 'opacity-60' : ''}`}
              >
                {pkg.popular && (
                  <div className="mb-3 inline-block px-3 py-1 bg-accent-green text-white text-xs font-bold rounded-full font-mono">
                    POPULAR
                  </div>
                )}
                
                <h3 className="text-lg font-bold text-gray-900 mb-1 font-mono">
                  {pkg.name}
                </h3>
                
                <div className="mb-3">
                  <span className="text-3xl font-bold text-gray-900 font-mono">
                    {pkg.credits}
                  </span>
                  <span className="text-gray-600 text-sm"> credits</span>
                </div>

                <div className="mb-4 p-3 bg-white rounded-lg border border-gray-200">
                  <p className="text-gray-600 text-xs font-mono">Price</p>
                  <p className="text-xl font-bold text-accent-green font-mono">
                    ${pkg.price.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-600 font-mono mt-1">
                    ${pkg.pricePerCredit.toFixed(3)}/credit
                  </p>
                </div>

                <button
                  onClick={() => handlePurchase(pkg.id)}
                  disabled={loading && selectedPackage === pkg.id}
                  className={`w-full py-2 px-4 rounded-lg font-semibold text-sm font-mono transition-all ${
                    pkg.popular
                      ? 'bg-accent-green text-white hover:bg-accent-green-dark disabled:opacity-50'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200 disabled:opacity-50'
                  }`}
                >
                  {loading && selectedPackage === pkg.id 
                    ? 'Processing...' 
                    : paymentMethod === 'wallet'
                      ? `${isConnected ? '🔗' : '🔗'} Get ${pkg.credits}`
                      : `💳 Get ${pkg.credits}`
                  }
                </button>
              </motion.div>
            ))}
          </div>

          {/* Features Info */}
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            <div className="p-4 border border-gray-200 rounded-lg">
              <h4 className="font-bold text-gray-900 mb-2 font-mono">What You Get</h4>
              <ul className="space-y-2 text-sm text-gray-700 font-mono">
                <li>✓ Generate unlimited SDKs (1 credit per generation)</li>
                <li>✓ Support for 8+ programming languages</li>
                <li>✓ Web3 smart contract & REST API support</li>
                <li>✓ Multi-chain deployment (Ethereum, Polygon, etc.)</li>
              </ul>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <h4 className="font-bold text-gray-900 mb-2 font-mono">
                {paymentMethod === 'wallet' ? '🔗 Wallet Payment' : '💳 Card Payment'}
              </h4>
              {paymentMethod === 'wallet' ? (
                <ul className="space-y-2 text-sm text-gray-700 font-mono">
                  <li>✓ MetaMask & WalletConnect support</li>
                  <li>✓ Direct blockchain transaction</li>
                  <li>✓ Instant credit delivery</li>
                  <li>✓ Gas fees apply (depends on network)</li>
                </ul>
              ) : (
                <ul className="space-y-2 text-sm text-gray-700 font-mono">
                  <li>✓ Visa, Mastercard accepted</li>
                  <li>✓ Secure payment processing</li>
                  <li>✓ Instant credit delivery</li>
                  <li>✓ Invoice for every purchase</li>
                </ul>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="text-center pt-4 border-t border-gray-200">
            <p className="text-gray-600 text-sm font-mono">
              Need custom pricing? <span className="text-accent-green font-semibold cursor-pointer hover:underline">Contact us</span>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
