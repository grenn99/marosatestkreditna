import React from 'react';
import { useTranslation } from 'react-i18next';
import { LoyaltyProfile, LoyaltyTier, LOYALTY_TIERS, getPointsForNextTier } from '../utils/loyaltyProgram';

interface LoyaltyCardProps {
  profile: LoyaltyProfile;
  className?: string;
}

/**
 * Component to display a user's loyalty program status
 */
export const LoyaltyCard: React.FC<LoyaltyCardProps> = ({
  profile,
  className = ''
}) => {
  const { t } = useTranslation();
  const tierInfo = LOYALTY_TIERS[profile.tier];
  const pointsForNextTier = getPointsForNextTier(profile);

  // Get tier color based on level
  const getTierColor = (tier: LoyaltyTier): string => {
    switch (tier) {
      case LoyaltyTier.BRONZE:
        return 'from-amber-700 to-amber-500';
      case LoyaltyTier.SILVER:
        return 'from-gray-400 to-gray-300';
      case LoyaltyTier.GOLD:
        return 'from-yellow-500 to-yellow-300';
      case LoyaltyTier.PLATINUM:
        return 'from-indigo-600 to-indigo-400';
      default:
        return 'from-amber-700 to-amber-500';
    }
  };

  return (
    <div className={`rounded-lg overflow-hidden shadow-lg ${className}`}>
      {/* Card header with tier info */}
      <div className={`bg-gradient-to-r ${getTierColor(profile.tier)} p-6 text-white`}>
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold">{t('loyalty.memberSince', 'Member Since')}</h3>
            <p>{new Date(profile.joinDate).toLocaleDateString()}</p>
          </div>
          <div className="text-right">
            <span className="text-sm uppercase tracking-wider opacity-80">{t('loyalty.tier', 'Tier')}</span>
            <h2 className="text-2xl font-bold">{tierInfo.name}</h2>
          </div>
        </div>
      </div>

      {/* Points information */}
      <div className="bg-white p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">{t('loyalty.yourPoints', 'Your Points')}</h3>
          <span className="text-2xl font-bold text-brown-600">{profile.points}</span>
        </div>

        {/* Progress to next tier */}
        {pointsForNextTier > 0 && (
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span>{t('loyalty.nextTier', 'Next Tier')}</span>
              <span>{pointsForNextTier} {t('loyalty.pointsToGo', 'points to go')}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-brown-600 h-2.5 rounded-full" 
                style={{ 
                  width: `${Math.min(100, (profile.points / (profile.points + pointsForNextTier)) * 100)}%` 
                }}
              ></div>
            </div>
          </div>
        )}

        {/* Benefits */}
        <div className="mt-6">
          <h4 className="font-semibold text-gray-700 mb-2">{t('loyalty.yourBenefits', 'Your Benefits')}</h4>
          <ul className="space-y-2">
            {tierInfo.benefits.map((benefit, index) => (
              <li key={index} className="flex items-center text-gray-600">
                <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                {benefit}
              </li>
            ))}
          </ul>
        </div>

        {/* Points multiplier */}
        <div className="mt-6 p-3 bg-brown-50 rounded-md">
          <p className="text-brown-700">
            <span className="font-semibold">{t('loyalty.currentMultiplier', 'Current Multiplier')}:</span> {tierInfo.pointsMultiplier}x
          </p>
          <p className="text-sm text-brown-600 mt-1">
            {t('loyalty.multiplierExplanation', 'You earn {{multiplier}}x points for every euro spent', { multiplier: tierInfo.pointsMultiplier })}
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoyaltyCard;
