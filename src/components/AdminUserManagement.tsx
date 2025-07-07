import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getAllUsers, updateUserAdminStatus } from '../utils/userManagement';

interface AdminUser {
  id: string;
  email: string;
  isAdmin: boolean;
}

export function AdminUserManagement() {
  const { t } = useTranslation();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const usersData = await getAllUsers();
      setUsers(usersData);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(t('admin.users.fetchError', 'Failed to fetch users'));
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAdminStatus = async (userId: string, currentStatus: boolean) => {
    try {
      setUpdatingUserId(userId);
      setError(null);
      setSuccessMessage(null);
      
      const success = await updateUserAdminStatus(userId, !currentStatus);
      
      if (success) {
        setSuccessMessage(
          currentStatus 
            ? t('admin.users.removedAdmin', 'Admin privileges removed successfully') 
            : t('admin.users.addedAdmin', 'Admin privileges granted successfully')
        );
        
        // Update the local state
        setUsers(prevUsers => 
          prevUsers.map(user => 
            user.id === userId 
              ? { ...user, isAdmin: !currentStatus } 
              : user
          )
        );
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage(null);
        }, 3000);
      } else {
        setError(t('admin.users.updateError', 'Failed to update user admin status'));
      }
    } catch (err) {
      console.error('Error updating user admin status:', err);
      setError(t('admin.users.updateError', 'Failed to update user admin status'));
    } finally {
      setUpdatingUserId(null);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">{t('admin.users.title', 'Admin User Management')}</h2>
      <p className="text-gray-600 mb-6">
        {t('admin.users.description', 'Manage which users have admin privileges.')}
      </p>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      {successMessage && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
          {successMessage}
        </div>
      )}
      
      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          {t('admin.users.noUsers', 'No users found')}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('admin.users.email', 'Email')}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('admin.users.status', 'Status')}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('admin.users.actions', 'Actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.isAdmin 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {user.isAdmin 
                        ? t('admin.users.adminStatus', 'Admin') 
                        : t('admin.users.userStatus', 'User')
                      }
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      type="button"
                      className={`px-3 py-1 rounded-md text-sm font-medium ${
                        user.isAdmin
                          ? 'bg-red-50 text-red-700 hover:bg-red-100'
                          : 'bg-green-50 text-green-700 hover:bg-green-100'
                      }`}
                      onClick={() => handleToggleAdminStatus(user.id, user.isAdmin)}
                      disabled={updatingUserId === user.id}
                    >
                      {updatingUserId === user.id ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          {t('admin.users.updating', 'Updating...')}
                        </span>
                      ) : user.isAdmin ? (
                        t('admin.users.removeAdmin', 'Remove Admin')
                      ) : (
                        t('admin.users.makeAdmin', 'Make Admin')
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
