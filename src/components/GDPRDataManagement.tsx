import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { Download, Trash2, Eye, AlertTriangle, Check, X } from 'lucide-react';

interface DataExportData {
  profile: any;
  orders: any[];
  newsletter: any;
}

export function GDPRDataManagement() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [exportData, setExportData] = useState<DataExportData | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);

  const exportMyData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Fetch user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      // Fetch user orders
      const { data: orders } = await supabase
        .from('orders')
        .select('*')
        .eq('profile_id', user.id);

      // Fetch newsletter subscription
      const { data: newsletter } = await supabase
        .from('newsletter_subscribers')
        .select('*')
        .eq('email', user.email)
        .single();

      const exportData: DataExportData = {
        profile: profile || {},
        orders: orders || [],
        newsletter: newsletter || null
      };

      setExportData(exportData);
      setShowExportModal(true);
    } catch (error) {
      console.error('Error exporting data:', error);
      alert(t('gdpr.export.error', 'Napaka pri izvozu podatkov'));
    } finally {
      setLoading(false);
    }
  };

  const downloadDataAsJSON = () => {
    if (!exportData) return;

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `kmetija-marosa-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    setShowExportModal(false);
  };

  const deleteMyAccount = async () => {
    if (!user || deleteConfirmText !== 'IZBRIŠI') return;
    
    setLoading(true);
    try {
      // Delete from newsletter if subscribed
      await supabase
        .from('newsletter_subscribers')
        .delete()
        .eq('email', user.email);

      // Delete orders (or anonymize them)
      await supabase
        .from('orders')
        .delete()
        .eq('profile_id', user.id);

      // Delete profile
      await supabase
        .from('profiles')
        .delete()
        .eq('id', user.id);

      // Delete auth user
      const { error } = await supabase.auth.admin.deleteUser(user.id);
      if (error) throw error;

      alert(t('gdpr.delete.success', 'Vaš račun je bil uspešno izbrisan'));
      window.location.href = '/';
    } catch (error) {
      console.error('Error deleting account:', error);
      alert(t('gdpr.delete.error', 'Napaka pri brisanju računa'));
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  if (!user) return null;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-brown-800 mb-6 flex items-center gap-2">
        <Eye className="w-6 h-6" />
        {t('gdpr.title', 'Upravljanje osebnih podatkov')}
      </h2>

      <div className="space-y-6">
        {/* Data Export */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
            <Download className="w-5 h-5" />
            {t('gdpr.export.title', 'Izvoz mojih podatkov')}
          </h3>
          <p className="text-gray-600 mb-4">
            {t('gdpr.export.description', 'Prenesite kopijo vseh svojih osebnih podatkov, ki jih hranimo.')}
          </p>
          <button
            onClick={exportMyData}
            disabled={loading}
            className="bg-brown-600 text-white px-4 py-2 rounded-md hover:bg-brown-700 disabled:opacity-50 flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            {loading ? t('gdpr.export.loading', 'Izvažam...') : t('gdpr.export.button', 'Izvozi podatke')}
          </button>
        </div>

        {/* Data Deletion */}
        <div className="border border-red-200 rounded-lg p-4 bg-red-50">
          <h3 className="text-lg font-semibold mb-2 flex items-center gap-2 text-red-800">
            <Trash2 className="w-5 h-5" />
            {t('gdpr.delete.title', 'Izbris računa')}
          </h3>
          <p className="text-red-700 mb-4">
            {t('gdpr.delete.description', 'Trajno izbriši svoj račun in vse povezane podatke. Ta dejanja ni mogoče razveljaviti.')}
          </p>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            {t('gdpr.delete.button', 'Izbriši račun')}
          </button>
        </div>

        {/* Contact Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-2 text-blue-800">
            {t('gdpr.contact.title', 'Vprašanja o zasebnosti')}
          </h3>
          <p className="text-blue-700 mb-2">
            {t('gdpr.contact.description', 'Za vprašanja o obdelavi vaših osebnih podatkov nas kontaktirajte:')}
          </p>
          <div className="space-y-1 text-blue-700">
            <p><strong>E-pošta:</strong> kmetija.marosa@gmail.com</p>
            <p><strong>Telefon:</strong> +386 31 627 364</p>
          </div>
        </div>
      </div>

      {/* Export Modal */}
      {showExportModal && exportData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">{t('gdpr.export.modal.title', 'Vaši podatki')}</h3>
                <button onClick={() => setShowExportModal(false)}>
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-4 mb-6">
                <div>
                  <h4 className="font-semibold">{t('gdpr.export.modal.profile', 'Profil')}</h4>
                  <p className="text-sm text-gray-600">
                    {t('gdpr.export.modal.profileDesc', 'Ime, e-pošta, telefon, naslov')}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold">{t('gdpr.export.modal.orders', 'Naročila')}</h4>
                  <p className="text-sm text-gray-600">
                    {exportData.orders.length} {t('gdpr.export.modal.ordersCount', 'naročil')}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold">{t('gdpr.export.modal.newsletter', 'E-novice')}</h4>
                  <p className="text-sm text-gray-600">
                    {exportData.newsletter ? 
                      t('gdpr.export.modal.subscribed', 'Naročeni') : 
                      t('gdpr.export.modal.notSubscribed', 'Niste naročeni')
                    }
                  </p>
                </div>
              </div>

              <button
                onClick={downloadDataAsJSON}
                className="w-full bg-brown-600 text-white py-3 px-6 rounded-md hover:bg-brown-700 flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" />
                {t('gdpr.export.modal.download', 'Prenesi kot JSON')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600" />
                <h3 className="text-xl font-bold text-red-800">
                  {t('gdpr.delete.confirm.title', 'Potrdite izbris')}
                </h3>
              </div>
              
              <p className="text-gray-700 mb-4">
                {t('gdpr.delete.confirm.warning', 'Ta dejanja ni mogoče razveljaviti. Vsi vaši podatki bodo trajno izbrisani.')}
              </p>
              
              <p className="text-sm text-gray-600 mb-4">
                {t('gdpr.delete.confirm.instruction', 'Vtipkajte "IZBRIŠI" za potrditev:')}
              </p>
              
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4"
                placeholder="IZBRIŠI"
              />
              
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeleteConfirmText('');
                  }}
                  className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50"
                >
                  {t('gdpr.delete.confirm.cancel', 'Prekliči')}
                </button>
                <button
                  onClick={deleteMyAccount}
                  disabled={deleteConfirmText !== 'IZBRIŠI' || loading}
                  className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 disabled:opacity-50"
                >
                  {loading ? t('gdpr.delete.confirm.deleting', 'Brišem...') : t('gdpr.delete.confirm.delete', 'Izbriši')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
