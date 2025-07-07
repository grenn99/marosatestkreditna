import React from 'react';
import { useTranslation } from 'react-i18next';
import { calculatePasswordStrength } from '../utils/validation';

interface PasswordStrengthMeterProps {
  password: string;
}

const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({ password }) => {
  const { t } = useTranslation();
  const { score, feedback } = calculatePasswordStrength(password);

  // Determine color based on score
  let color = 'bg-red-500'; // default for weak passwords

  if (score >= 90) {
    color = 'bg-green-500'; // very strong
  } else if (score >= 70) {
    color = 'bg-green-400'; // strong
  } else if (score >= 50) {
    color = 'bg-yellow-400'; // moderate
  } else if (score >= 30) {
    color = 'bg-orange-400'; // weak
  }

  // Translate feedback based on score
  let translatedFeedback = '';
  if (score < 30) {
    translatedFeedback = t('password.veryWeak', 'Zelo šibko geslo');
  } else if (score < 50) {
    translatedFeedback = t('password.weak', 'Šibko geslo');
  } else if (score < 70) {
    translatedFeedback = t('password.moderate', 'Zmerno močno geslo');
  } else if (score < 90) {
    translatedFeedback = t('password.strong', 'Močno geslo');
  } else {
    translatedFeedback = t('password.veryStrong', 'Zelo močno geslo');
  }

  return (
    <div className="mt-1">
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className={`h-2.5 rounded-full ${color} transition-all duration-300`}
          style={{ width: `${score}%` }}
        ></div>
      </div>
      <p className="text-xs mt-1 text-gray-600">{translatedFeedback}</p>

      {/* Password requirements */}
      {password.length > 0 && (
        <div className="mt-2 text-xs text-gray-600">
          <p>{t('password.requirements', 'Geslo mora vsebovati:')}</p>
          <ul className="list-disc pl-5 mt-1 space-y-1">
            <li className={password.length >= 10 ? "text-green-600" : "text-gray-500"}>
              {t('password.minLength', 'Vsaj 10 znakov')}
            </li>
            <li className={/[A-Z]/.test(password) ? "text-green-600" : "text-gray-500"}>
              {t('password.uppercase', 'Vsaj eno veliko črko')}
            </li>
            <li className={/[a-z]/.test(password) ? "text-green-600" : "text-gray-500"}>
              {t('password.lowercase', 'Vsaj eno malo črko')}
            </li>
            <li className={/\d/.test(password) ? "text-green-600" : "text-gray-500"}>
              {t('password.number', 'Vsaj eno številko')}
            </li>
            <li className={/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) ? "text-green-600" : "text-gray-500"}>
              {t('password.special', 'Vsaj en poseben znak')}
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default PasswordStrengthMeter;
