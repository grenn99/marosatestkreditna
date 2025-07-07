import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabaseClient';
import { AlertCircle, Save, Plus, Trash2 } from 'lucide-react';

interface MetaTag {
  id?: number;
  page_path: string;
  title: string;
  description: string;
  keywords: string;
  created_at?: string;
}

export function AdminSEOManagement() {
  const { t } = useTranslation();
  const [metaTags, setMetaTags] = useState<MetaTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editingTag, setEditingTag] = useState<MetaTag | null>(null);
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [newTag, setNewTag] = useState<MetaTag>({
    page_path: '',
    title: '',
    description: '',
    keywords: '',
  });

  useEffect(() => {
    fetchMetaTags();
  }, []);

  const fetchMetaTags = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('meta_tags')
        .select('*')
        .order('page_path');

      if (error) throw error;
      setMetaTags(data || []);
    } catch (err: any) {
      console.error('Error fetching meta tags:', err);
      setError(t('admin.seo.fetchError', 'Failed to load SEO data'));
    } finally {
      setLoading(false);
    }
  };

  const handleEditTag = (tag: MetaTag) => {
    setEditingTag({ ...tag });
  };

  const handleSaveTag = async () => {
    if (!editingTag) return;

    try {
      const { error } = await supabase
        .from('meta_tags')
        .update({
          title: editingTag.title,
          description: editingTag.description,
          keywords: editingTag.keywords,
        })
        .eq('id', editingTag.id);

      if (error) throw error;

      setMetaTags(metaTags.map(tag => 
        tag.id === editingTag.id ? editingTag : tag
      ));
      setSuccess(t('admin.seo.updateSuccess', 'SEO data updated successfully'));
      setEditingTag(null);
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Error updating meta tag:', err);
      setError(t('admin.seo.updateError', 'Failed to update SEO data'));
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleAddTag = async () => {
    if (!newTag.page_path || !newTag.title) {
      setError(t('admin.seo.requiredFields', 'Page path and title are required'));
      setTimeout(() => setError(null), 3000);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('meta_tags')
        .insert([newTag])
        .select();

      if (error) throw error;

      setMetaTags([...metaTags, data[0]]);
      setSuccess(t('admin.seo.addSuccess', 'SEO data added successfully'));
      setIsAddingTag(false);
      setNewTag({
        page_path: '',
        title: '',
        description: '',
        keywords: '',
      });
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Error adding meta tag:', err);
      setError(t('admin.seo.addError', 'Failed to add SEO data'));
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleDeleteTag = async (id: number) => {
    if (!window.confirm(t('admin.seo.confirmDelete', 'Are you sure you want to delete this SEO data?'))) {
      return;
    }

    try {
      const { error } = await supabase
        .from('meta_tags')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setMetaTags(metaTags.filter(tag => tag.id !== id));
      setSuccess(t('admin.seo.deleteSuccess', 'SEO data deleted successfully'));
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Error deleting meta tag:', err);
      setError(t('admin.seo.deleteError', 'Failed to delete SEO data'));
      setTimeout(() => setError(null), 3000);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">
          {t('admin.seo.title', 'SEO Management')}
        </h2>
        <button
          type="button"
          className="admin-button-primary"
          onClick={() => setIsAddingTag(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          {t('admin.seo.addNew', 'Add New Meta Tags')}
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
        <div className="text-center py-4">{t('admin.seo.loading', 'Loading SEO data...')}</div>
      ) : metaTags.length === 0 ? (
        <div className="text-center py-4 text-gray-500">
          {t('admin.seo.noData', 'No SEO data found. Add meta tags to improve your site\'s SEO.')}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('admin.seo.pagePath', 'Page Path')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('admin.seo.title', 'Title')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('admin.seo.description', 'Description')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('admin.seo.actions', 'Actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {metaTags.map((tag) => (
                <tr key={tag.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {tag.page_path}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-xs truncate">
                    {tag.title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-xs truncate">
                    {tag.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        className="text-indigo-600 hover:text-indigo-900"
                        onClick={() => handleEditTag(tag)}
                      >
                        {t('admin.seo.edit', 'Edit')}
                      </button>
                      <button
                        type="button"
                        className="text-red-600 hover:text-red-900"
                        onClick={() => handleDeleteTag(tag.id!)}
                      >
                        {t('admin.seo.delete', 'Delete')}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Meta Tag Modal */}
      {editingTag && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {t('admin.seo.editMetaTags', 'Edit Meta Tags')}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('admin.seo.pagePath', 'Page Path')}
                </label>
                <input
                  type="text"
                  className="admin-form-input"
                  value={editingTag.page_path}
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('admin.seo.title', 'Title')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="admin-form-input"
                  value={editingTag.title}
                  onChange={(e) => setEditingTag({ ...editingTag, title: e.target.value })}
                  maxLength={60}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {editingTag.title.length}/60 {t('admin.seo.characters', 'characters')}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('admin.seo.description', 'Description')}
                </label>
                <textarea
                  className="admin-form-input"
                  value={editingTag.description}
                  onChange={(e) => setEditingTag({ ...editingTag, description: e.target.value })}
                  rows={3}
                  maxLength={160}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {editingTag.description.length}/160 {t('admin.seo.characters', 'characters')}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('admin.seo.keywords', 'Keywords')}
                </label>
                <input
                  type="text"
                  className="admin-form-input"
                  value={editingTag.keywords}
                  onChange={(e) => setEditingTag({ ...editingTag, keywords: e.target.value })}
                  placeholder={t('admin.seo.keywordsPlaceholder', 'Comma-separated keywords')}
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                className="admin-button-secondary"
                onClick={() => setEditingTag(null)}
              >
                {t('admin.seo.cancel', 'Cancel')}
              </button>
              <button
                type="button"
                className="admin-button-primary"
                onClick={handleSaveTag}
              >
                <Save className="w-4 h-4 mr-2" />
                {t('admin.seo.save', 'Save')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Meta Tag Modal */}
      {isAddingTag && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {t('admin.seo.addMetaTags', 'Add Meta Tags')}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('admin.seo.pagePath', 'Page Path')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="admin-form-input"
                  value={newTag.page_path}
                  onChange={(e) => setNewTag({ ...newTag, page_path: e.target.value })}
                  placeholder="/izdelek/1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {t('admin.seo.pagePathHelp', 'Example: / for homepage, /izdelek/1 for product page')}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('admin.seo.title', 'Title')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="admin-form-input"
                  value={newTag.title}
                  onChange={(e) => setNewTag({ ...newTag, title: e.target.value })}
                  maxLength={60}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {newTag.title.length}/60 {t('admin.seo.characters', 'characters')}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('admin.seo.description', 'Description')}
                </label>
                <textarea
                  className="admin-form-input"
                  value={newTag.description}
                  onChange={(e) => setNewTag({ ...newTag, description: e.target.value })}
                  rows={3}
                  maxLength={160}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {newTag.description.length}/160 {t('admin.seo.characters', 'characters')}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('admin.seo.keywords', 'Keywords')}
                </label>
                <input
                  type="text"
                  className="admin-form-input"
                  value={newTag.keywords}
                  onChange={(e) => setNewTag({ ...newTag, keywords: e.target.value })}
                  placeholder={t('admin.seo.keywordsPlaceholder', 'Comma-separated keywords')}
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                className="admin-button-secondary"
                onClick={() => setIsAddingTag(false)}
              >
                {t('admin.seo.cancel', 'Cancel')}
              </button>
              <button
                type="button"
                className="admin-button-primary"
                onClick={handleAddTag}
              >
                <Plus className="w-4 h-4 mr-2" />
                {t('admin.seo.add', 'Add')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
