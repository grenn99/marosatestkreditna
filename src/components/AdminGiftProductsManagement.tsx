import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabaseClient';
import { AlertCircle, Save, Plus, Trash2, Gift, Package, Edit } from 'lucide-react';

interface GiftPackage {
  id: number;
  name: string;
  name_en?: string;
  name_de?: string;
  name_hr?: string;
  description?: string;
  description_en?: string;
  description_de?: string;
  description_hr?: string;
  base_price: number;
  image_url?: string;
  is_active: boolean;
  created_at?: string;
}

interface GiftProduct {
  id: string;
  name: string;
  package_options: any[];
  image_url?: string;
  category?: string;
}

export function AdminGiftProductsManagement() {
  const { t, i18n } = useTranslation();
  const [giftPackages, setGiftPackages] = useState<GiftPackage[]>([]);
  const [products, setProducts] = useState<GiftProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editingPackage, setEditingPackage] = useState<GiftPackage | null>(null);
  const [isAddingPackage, setIsAddingPackage] = useState(false);
  const [newPackage, setNewPackage] = useState<GiftPackage>({
    name: '',
    base_price: 0,
    is_active: true,
  });

  useEffect(() => {
    fetchGiftPackages();
    fetchProducts();
  }, []);

  const fetchGiftPackages = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('gift_packages')
        .select('*')
        .order('created_at');

      if (error) throw error;
      setGiftPackages(data || []);
    } catch (err: any) {
      console.error('Error fetching gift packages:', err);
      setError(t('admin.gifts.fetchError', 'Failed to load gift packages'));
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, package_options, image_url, category')
        .order('name');

      if (error) throw error;
      setProducts(data || []);
    } catch (err: any) {
      console.error('Error fetching products:', err);
    }
  };

  const handleEditPackage = (giftPackage: GiftPackage) => {
    setEditingPackage({ ...giftPackage });
  };

  const handleSavePackage = async () => {
    if (!editingPackage) return;

    try {
      const { data, error } = await supabase
        .from('gift_packages')
        .update({
          name: editingPackage.name,
          name_en: editingPackage.name_en,
          name_de: editingPackage.name_de,
          name_hr: editingPackage.name_hr,
          description: editingPackage.description,
          description_en: editingPackage.description_en,
          description_de: editingPackage.description_de,
          description_hr: editingPackage.description_hr,
          base_price: editingPackage.base_price,
          image_url: editingPackage.image_url,
          is_active: editingPackage.is_active,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingPackage.id)
        .select();

      if (error) throw error;

      setGiftPackages(giftPackages.map(pkg =>
        pkg.id === editingPackage.id ? editingPackage : pkg
      ));
      setSuccess(t('admin.gifts.updateSuccess', 'Gift package updated successfully'));
      setEditingPackage(null);

      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Error updating gift package:', err);
      setError(t('admin.gifts.updateError', 'Failed to update gift package'));
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleAddPackage = async () => {
    try {
      const { data, error } = await supabase
        .from('gift_packages')
        .insert([
          {
            name: newPackage.name,
            name_en: newPackage.name_en,
            name_de: newPackage.name_de,
            name_hr: newPackage.name_hr,
            description: newPackage.description,
            description_en: newPackage.description_en,
            description_de: newPackage.description_de,
            description_hr: newPackage.description_hr,
            base_price: newPackage.base_price,
            image_url: newPackage.image_url,
            is_active: newPackage.is_active
          }
        ])
        .select();

      if (error) throw error;

      setGiftPackages([...giftPackages, data[0]]);
      setSuccess(t('admin.gifts.addSuccess', 'Gift package added successfully'));
      setIsAddingPackage(false);
      setNewPackage({
        name: '',
        base_price: 0,
        is_active: true,
      });

      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Error adding gift package:', err);
      setError(t('admin.gifts.addError', 'Failed to add gift package'));
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleDeletePackage = async (id: number) => {
    if (!window.confirm(t('admin.gifts.confirmDelete', 'Are you sure you want to delete this gift package?'))) {
      return;
    }

    try {
      const { error } = await supabase
        .from('gift_packages')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setGiftPackages(giftPackages.filter(pkg => pkg.id !== id));
      setSuccess(t('admin.gifts.deleteSuccess', 'Gift package deleted successfully'));

      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Error deleting gift package:', err);
      setError(t('admin.gifts.deleteError', 'Failed to delete gift package'));
      setTimeout(() => setError(null), 3000);
    }
  };

  // Helper function to get translated name based on current language
  const getTranslatedName = (item: GiftPackage) => {
    const lang = i18n.language;
    if (lang === 'en' && item.name_en) return item.name_en;
    if (lang === 'de' && item.name_de) return item.name_de;
    if (lang === 'hr' && item.name_hr) return item.name_hr;
    return item.name;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">
          {t('admin.giftProducts.title', 'Gift Packages')}
        </h2>
        <button
          type="button"
          className="admin-button-primary"
          onClick={() => setIsAddingPackage(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          {t('admin.giftProducts.addNew', 'Add New Gift Package')}
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      {loading ? (
        <div className="text-center py-4">{t('admin.giftProducts.loading', 'Loading gift packages...')}</div>
      ) : giftPackages.length === 0 ? (
        <div className="text-center py-4 text-gray-500">
          {t('admin.giftProducts.noData', 'No gift packages found. Create one to offer gift options to your customers.')}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('admin.giftProducts.name', 'Name')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('admin.giftProducts.price', 'Base Price')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('admin.giftProducts.image', 'Image')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('admin.giftProducts.status', 'Status')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('admin.giftProducts.actions', 'Actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {giftPackages.map((giftPackage) => (
                <tr key={giftPackage.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    <div className="flex items-center">
                      <Gift className="w-4 h-4 mr-2 text-pink-500" />
                      {getTranslatedName(giftPackage)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Intl.NumberFormat(i18n.language, { style: 'currency', currency: 'EUR' }).format(giftPackage.base_price)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {giftPackage.image_url ? (
                      <img
                        src={giftPackage.image_url}
                        alt={getTranslatedName(giftPackage)}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-gray-400">{t('admin.giftProducts.noImage', 'No image')}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      giftPackage.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {giftPackage.is_active
                        ? t('admin.giftProducts.active', 'Active')
                        : t('admin.giftProducts.inactive', 'Inactive')
                      }
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        className="text-indigo-600 hover:text-indigo-900"
                        onClick={() => handleEditPackage(giftPackage)}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        className="text-red-600 hover:text-red-900"
                        onClick={() => handleDeletePackage(giftPackage.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Gift Package Modal */}
      {editingPackage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {t('admin.giftProducts.editPackage', 'Edit Gift Package')}
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('admin.giftProducts.name', 'Name')} (SL) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className="admin-form-input"
                    value={editingPackage.name}
                    onChange={(e) => setEditingPackage({ ...editingPackage, name: e.target.value })}
                    placeholder={t('admin.giftProducts.namePlaceholder', 'Premium Gift Package')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('admin.giftProducts.nameEn', 'Name (EN)')}
                  </label>
                  <input
                    type="text"
                    className="admin-form-input"
                    value={editingPackage.name_en || ''}
                    onChange={(e) => setEditingPackage({ ...editingPackage, name_en: e.target.value })}
                    placeholder={t('admin.giftProducts.nameEnPlaceholder', 'Premium Gift Package')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('admin.giftProducts.nameDe', 'Name (DE)')}
                  </label>
                  <input
                    type="text"
                    className="admin-form-input"
                    value={editingPackage.name_de || ''}
                    onChange={(e) => setEditingPackage({ ...editingPackage, name_de: e.target.value })}
                    placeholder={t('admin.giftProducts.nameDePlaceholder', 'Premium Geschenkpaket')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('admin.giftProducts.nameHr', 'Name (HR)')}
                  </label>
                  <input
                    type="text"
                    className="admin-form-input"
                    value={editingPackage.name_hr || ''}
                    onChange={(e) => setEditingPackage({ ...editingPackage, name_hr: e.target.value })}
                    placeholder={t('admin.giftProducts.nameHrPlaceholder', 'Premium poklon paket')}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('admin.giftProducts.description', 'Description (SL)')}
                </label>
                <textarea
                  className="admin-form-input"
                  rows={3}
                  value={editingPackage.description || ''}
                  onChange={(e) => setEditingPackage({ ...editingPackage, description: e.target.value })}
                  placeholder={t('admin.giftProducts.descriptionPlaceholder', 'Elegantna darilna embalaža z do tremi izdelki po vaši izbiri.')}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('admin.giftProducts.descriptionEn', 'Description (EN)')}
                  </label>
                  <textarea
                    className="admin-form-input"
                    rows={3}
                    value={editingPackage.description_en || ''}
                    onChange={(e) => setEditingPackage({ ...editingPackage, description_en: e.target.value })}
                    placeholder={t('admin.giftProducts.descriptionEnPlaceholder', 'Elegant gift packaging with up to three products of your choice.')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('admin.giftProducts.descriptionDe', 'Description (DE)')}
                  </label>
                  <textarea
                    className="admin-form-input"
                    rows={3}
                    value={editingPackage.description_de || ''}
                    onChange={(e) => setEditingPackage({ ...editingPackage, description_de: e.target.value })}
                    placeholder={t('admin.giftProducts.descriptionDePlaceholder', 'Elegante Geschenkverpackung mit bis zu drei Produkten Ihrer Wahl.')}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('admin.giftProducts.descriptionHr', 'Description (HR)')}
                </label>
                <textarea
                  className="admin-form-input"
                  rows={3}
                  value={editingPackage.description_hr || ''}
                  onChange={(e) => setEditingPackage({ ...editingPackage, description_hr: e.target.value })}
                  placeholder={t('admin.giftProducts.descriptionHrPlaceholder', 'Elegantno poklon pakiranje s do tri proizvoda po vašem izboru.')}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('admin.giftProducts.basePrice', 'Base Price')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className="admin-form-input"
                    value={editingPackage.base_price}
                    onChange={(e) => setEditingPackage({ ...editingPackage, base_price: parseFloat(e.target.value) })}
                    placeholder="12.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('admin.giftProducts.imageUrl', 'Image URL')}
                  </label>
                  <input
                    type="text"
                    className="admin-form-input"
                    value={editingPackage.image_url || ''}
                    onChange={(e) => setEditingPackage({ ...editingPackage, image_url: e.target.value })}
                    placeholder="/images/gifts/premium.jpg"
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is-active"
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  checked={editingPackage.is_active}
                  onChange={(e) => setEditingPackage({ ...editingPackage, is_active: e.target.checked })}
                />
                <label htmlFor="is-active" className="ml-2 block text-sm text-gray-900">
                  {t('admin.giftProducts.isActive', 'Active')}
                </label>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                className="admin-button-secondary"
                onClick={() => setEditingPackage(null)}
              >
                {t('admin.giftProducts.cancel', 'Cancel')}
              </button>
              <button
                type="button"
                className="admin-button-primary"
                onClick={handleSavePackage}
              >
                <Save className="w-4 h-4 mr-2" />
                {t('admin.giftProducts.save', 'Save')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Gift Package Modal */}
      {isAddingPackage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {t('admin.giftProducts.addPackage', 'Add Gift Package')}
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('admin.giftProducts.name', 'Name')} (SL) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className="admin-form-input"
                    value={newPackage.name}
                    onChange={(e) => setNewPackage({ ...newPackage, name: e.target.value })}
                    placeholder={t('admin.giftProducts.namePlaceholder', 'Premium Gift Package')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('admin.giftProducts.nameEn', 'Name (EN)')}
                  </label>
                  <input
                    type="text"
                    className="admin-form-input"
                    value={newPackage.name_en || ''}
                    onChange={(e) => setNewPackage({ ...newPackage, name_en: e.target.value })}
                    placeholder={t('admin.giftProducts.nameEnPlaceholder', 'Premium Gift Package')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('admin.giftProducts.nameDe', 'Name (DE)')}
                  </label>
                  <input
                    type="text"
                    className="admin-form-input"
                    value={newPackage.name_de || ''}
                    onChange={(e) => setNewPackage({ ...newPackage, name_de: e.target.value })}
                    placeholder={t('admin.giftProducts.nameDePlaceholder', 'Premium Geschenkpaket')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('admin.giftProducts.nameHr', 'Name (HR)')}
                  </label>
                  <input
                    type="text"
                    className="admin-form-input"
                    value={newPackage.name_hr || ''}
                    onChange={(e) => setNewPackage({ ...newPackage, name_hr: e.target.value })}
                    placeholder={t('admin.giftProducts.nameHrPlaceholder', 'Premium poklon paket')}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('admin.giftProducts.description', 'Description (SL)')}
                </label>
                <textarea
                  className="admin-form-input"
                  rows={3}
                  value={newPackage.description || ''}
                  onChange={(e) => setNewPackage({ ...newPackage, description: e.target.value })}
                  placeholder={t('admin.giftProducts.descriptionPlaceholder', 'Elegantna darilna embalaža z do tremi izdelki po vaši izbiri.')}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('admin.giftProducts.descriptionEn', 'Description (EN)')}
                  </label>
                  <textarea
                    className="admin-form-input"
                    rows={3}
                    value={newPackage.description_en || ''}
                    onChange={(e) => setNewPackage({ ...newPackage, description_en: e.target.value })}
                    placeholder={t('admin.giftProducts.descriptionEnPlaceholder', 'Elegant gift packaging with up to three products of your choice.')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('admin.giftProducts.descriptionDe', 'Description (DE)')}
                  </label>
                  <textarea
                    className="admin-form-input"
                    rows={3}
                    value={newPackage.description_de || ''}
                    onChange={(e) => setNewPackage({ ...newPackage, description_de: e.target.value })}
                    placeholder={t('admin.giftProducts.descriptionDePlaceholder', 'Elegante Geschenkverpackung mit bis zu drei Produkten Ihrer Wahl.')}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('admin.giftProducts.descriptionHr', 'Description (HR)')}
                </label>
                <textarea
                  className="admin-form-input"
                  rows={3}
                  value={newPackage.description_hr || ''}
                  onChange={(e) => setNewPackage({ ...newPackage, description_hr: e.target.value })}
                  placeholder={t('admin.giftProducts.descriptionHrPlaceholder', 'Elegantno poklon pakiranje s do tri proizvoda po vašem izboru.')}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('admin.giftProducts.basePrice', 'Base Price')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className="admin-form-input"
                    value={newPackage.base_price}
                    onChange={(e) => setNewPackage({ ...newPackage, base_price: parseFloat(e.target.value) })}
                    placeholder="12.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('admin.giftProducts.imageUrl', 'Image URL')}
                  </label>
                  <input
                    type="text"
                    className="admin-form-input"
                    value={newPackage.image_url || ''}
                    onChange={(e) => setNewPackage({ ...newPackage, image_url: e.target.value })}
                    placeholder="/images/gifts/premium.jpg"
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="new-is-active"
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  checked={newPackage.is_active}
                  onChange={(e) => setNewPackage({ ...newPackage, is_active: e.target.checked })}
                />
                <label htmlFor="new-is-active" className="ml-2 block text-sm text-gray-900">
                  {t('admin.giftProducts.isActive', 'Active')}
                </label>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                className="admin-button-secondary"
                onClick={() => setIsAddingPackage(false)}
              >
                {t('admin.giftProducts.cancel', 'Cancel')}
              </button>
              <button
                type="button"
                className="admin-button-primary"
                onClick={handleAddPackage}
              >
                <Plus className="w-4 h-4 mr-2" />
                {t('admin.giftProducts.add', 'Add')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
