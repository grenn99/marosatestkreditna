import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Ticket, Check, X, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { DiscountCodeDisplay } from './DiscountCodeDisplay';

interface DiscountCode {
  id: number;
  code: string;
  discount_percent: number;
  discount_amount: number | null;
  min_order_amount: number | null;
}

interface DiscountCodeInputProps {
  orderTotal: number;
  onApply: (discountCode: DiscountCode | null) => void;
}

export function DiscountCodeInput({ orderTotal, onApply }: DiscountCodeInputProps) {
  const { t, i18n } = useTranslation();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [appliedCode, setAppliedCode] = useState<DiscountCode | null>(null);

  const handleApplyCode = async () => {
    if (!code.trim()) {
      setError(t('checkout.discount.emptyCode'));
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('discount_codes')
        .select('*')
        .eq('code', code.trim().toUpperCase())
        .eq('is_active', true)
        .single();

      if (fetchError) {
        setError(t('checkout.discount.invalidCode'));
        return;
      }

      // Check if code is valid
      const now = new Date();
      const validFrom = new Date(data.valid_from);
      const validTo = data.valid_to ? new Date(data.valid_to) : null;

      if (validFrom > now || (validTo && validTo < now)) {
        setError(t('checkout.discount.expiredCode'));
        return;
      }

      // Check if code has reached max uses
      if (data.max_uses && data.current_uses >= data.max_uses) {
        setError(t('checkout.discount.maxUsesReached'));
        return;
      }

      // Check minimum order amount
      if (data.min_order_amount && orderTotal < data.min_order_amount) {
        setError(
          t('checkout.discount.minOrderAmount', {
            amount: data.min_order_amount.toFixed(2),
          })
        );
        return;
      }

      // Apply the discount
      setAppliedCode(data);
      onApply(data);
    } catch (err) {
      console.error('Error applying discount code:', err);
      setError(t('checkout.discount.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveCode = () => {
    setAppliedCode(null);
    setCode('');
    onApply(null);
  };

  return (
    <div className="mt-6 border border-amber-200 rounded-lg p-4 bg-amber-50">
      <div className="flex items-center mb-4">
        <Ticket className="w-5 h-5 text-amber-600 mr-2" />
        <h3 className="text-lg font-medium text-amber-800">
          <DiscountCodeDisplay type="title" />
        </h3>
      </div>

      {appliedCode ? (
        <div className="bg-green-50 border border-green-200 rounded-md p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Check className="w-5 h-5 text-green-500 mr-2" />
              <div>
                <p className="text-green-700 font-medium">{appliedCode.code}</p>
                <p className="text-green-600 text-sm">
                  {appliedCode.discount_percent > 0
                    ? t('checkout.discount.percentOff', { percent: appliedCode.discount_percent })
                    : appliedCode.discount_amount
                    ? t('checkout.discount.amountOff', {
                        amount: appliedCode.discount_amount.toFixed(2),
                      })
                    : ''}
                </p>
              </div>
            </div>
            <button
              type="button"
              className="text-gray-400 hover:text-gray-500"
              onClick={handleRemoveCode}
              aria-label={t('checkout.discount.remove')}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex space-x-2">
            <input
              type="text"
              className="shadow-sm focus:ring-amber-500 focus:border-amber-500 block w-full sm:text-sm border-gray-300 rounded-md uppercase"
              placeholder={t('checkout.discount.placeholder', 'Enter discount code')}
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
              onClick={handleApplyCode}
              disabled={loading}
            >
              {loading
                ? <DiscountCodeDisplay type="applying" />
                : <DiscountCodeDisplay type="apply" />
              }
            </button>
          </div>

          {error && (
            <div className="mt-2 flex items-center text-sm text-red-600">
              <AlertCircle className="w-4 h-4 mr-1" />
              {error}
            </div>
          )}
        </>
      )}
    </div>
  );
}
