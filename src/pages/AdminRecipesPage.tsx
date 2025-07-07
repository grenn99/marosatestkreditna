import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { Recipe } from '../types';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import { isAdminEmail } from '../config/adminConfig';
import { EditRecipeForm } from '../components/EditRecipeForm';
import { AddRecipeForm } from '../components/AddRecipeForm';
import AdminNavigation from '../components/AdminNavigation';

export function AdminRecipesPage() {
  const { t, i18n } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // State
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [showAddRecipeModal, setShowAddRecipeModal] = useState(false);
  const [deletingRecipeId, setDeletingRecipeId] = useState<number | null>(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  // Check if user is admin
  const isAdmin = user && isAdminEmail(user.email);

  useEffect(() => {
    // Redirect if not logged in or not admin
    if (!authLoading && (!user || !isAdmin)) {
      navigate(`/?lang=${i18n.language}`);
      return;
    }

    fetchRecipes();
  }, [user, authLoading, navigate, i18n.language, isAdmin]);

  const fetchRecipes = async () => {
    if (!user || !isAdmin) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('recipes')
        .select('*')
        .order('id', { ascending: true });

      if (fetchError) {
        throw fetchError;
      }

      setRecipes(data || []);
    } catch (err: any) {
      console.error('Error fetching recipes:', err);
      setError(t('admin.recipes.fetchError', 'Failed to load recipes. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  const handleAddRecipe = () => {
    setShowAddRecipeModal(true);
  };

  const handleEditRecipe = (recipe: Recipe) => {
    setEditingRecipe(recipe);
  };

  const handleDeleteRecipe = (recipeId: number) => {
    setDeletingRecipeId(recipeId);
    setShowDeleteConfirmation(true);
  };

  const confirmDeleteRecipe = async () => {
    if (!deletingRecipeId) return;

    try {
      setLoading(true);
      const { error: deleteError } = await supabase
        .from('recipes')
        .delete()
        .eq('id', deletingRecipeId);

      if (deleteError) {
        throw deleteError;
      }

      setSuccessMessage(t('admin.recipes.deleteSuccess', 'Recipe deleted successfully'));
      fetchRecipes();
    } catch (err: any) {
      console.error('Error deleting recipe:', err);
      setError(t('admin.recipes.deleteError', 'Failed to delete recipe. Please try again.'));
    } finally {
      setLoading(false);
      setShowDeleteConfirmation(false);
      setDeletingRecipeId(null);
    }
  };

  const cancelDeleteRecipe = () => {
    setShowDeleteConfirmation(false);
    setDeletingRecipeId(null);
  };

  // Clear success message after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  return (
    <div className="admin-container">
      <AdminNavigation />
      
      <div className="admin-header">
        <h1 className="admin-title">{t('admin.recipes.title', 'Recipes Management')}</h1>
        <p className="admin-subtitle">{t('admin.recipes.manage', 'Manage recipes for your products')}</p>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {successMessage}
        </div>
      )}

      <div className="admin-actions">
        <button
          type="button"
          className="admin-button-primary"
          onClick={handleAddRecipe}
        >
          <PlusCircle className="admin-button-icon" />
          {t('admin.recipes.addRecipe', 'Add Recipe')}
        </button>
      </div>

      {loading && !recipes.length ? (
        <div className="admin-loading">{t('admin.recipes.loading', 'Loading recipes...')}</div>
      ) : !recipes.length ? (
        <div className="admin-empty-state">
          <p>{t('admin.recipes.noRecipes', 'No recipes found.')}</p>
          <button
            type="button"
            className="admin-button-primary mt-4"
            onClick={handleAddRecipe}
          >
            <PlusCircle className="admin-button-icon" />
            {t('admin.recipes.addFirstRecipe', 'Add Your First Recipe')}
          </button>
        </div>
      ) : (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th className="admin-table-header">{t('admin.recipes.id', 'ID')}</th>
                <th className="admin-table-header">{t('admin.recipes.image', 'Image')}</th>
                <th className="admin-table-header">{t('admin.recipes.title', 'Title')}</th>
                <th className="admin-table-header">{t('admin.recipes.difficulty', 'Difficulty')}</th>
                <th className="admin-table-header">{t('admin.recipes.prepTime', 'Prep Time')}</th>
                <th className="admin-table-header">{t('admin.recipes.actions', 'Actions')}</th>
              </tr>
            </thead>
            <tbody>
              {recipes.map((recipe) => (
                <tr key={recipe.id} className="admin-table-row">
                  <td className="admin-table-cell">{recipe.id}</td>
                  <td className="admin-table-cell">
                    <img
                      src={recipe.image_url}
                      alt={recipe.title}
                      className="w-16 h-16 object-cover rounded"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/recipe-placeholder.svg';
                      }}
                    />
                  </td>
                  <td className="admin-table-cell">{recipe.title}</td>
                  <td className="admin-table-cell">{recipe.difficulty}</td>
                  <td className="admin-table-cell">{recipe.prepTime}</td>
                  <td className="admin-table-cell">
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        className="admin-button-secondary"
                        onClick={() => handleEditRecipe(recipe)}
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        className="admin-button-danger"
                        onClick={() => handleDeleteRecipe(recipe.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Recipe Modal */}
      {editingRecipe && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <EditRecipeForm
              recipe={editingRecipe}
              onClose={() => setEditingRecipe(null)}
              onSuccess={() => {
                setEditingRecipe(null);
                fetchRecipes();
                setSuccessMessage(t('admin.recipes.updateSuccess', 'Recipe updated successfully'));
              }}
            />
          </div>
        </div>
      )}

      {/* Add Recipe Modal */}
      {showAddRecipeModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <AddRecipeForm
              onClose={() => setShowAddRecipeModal(false)}
              onSuccess={() => {
                setShowAddRecipeModal(false);
                fetchRecipes();
                setSuccessMessage(t('admin.recipes.addSuccess', 'Recipe added successfully'));
              }}
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirmation && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-small">
            <h2 className="admin-modal-title">{t('admin.recipes.confirmDelete', 'Confirm Delete')}</h2>
            <p className="mb-6">{t('admin.recipes.deleteWarning', 'Are you sure you want to delete this recipe? This action cannot be undone.')}</p>
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                className="admin-button-secondary"
                onClick={cancelDeleteRecipe}
              >
                {t('admin.recipes.cancel', 'Cancel')}
              </button>
              <button
                type="button"
                className="admin-button-danger"
                onClick={confirmDeleteRecipe}
              >
                {t('admin.recipes.delete', 'Delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
