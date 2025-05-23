import type React from 'react';
import { useState, useEffect } from 'react';
import { useUser, ROLES, PERMISSIONS, ROLE_PERMISSIONS } from '../context/UserContext';

// Type for filter state
interface FiltersState {
  role: string;
  status: string;
  search: string;
}

const ManageUsers: React.FC = () => {
  const { users, addUser, updateUser, deleteUser, updateUserRole, currentUser } = useUser();

  // State for filtering and sorting
  const [filters, setFilters] = useState<FiltersState>({
    role: '',
    status: '',
    search: ''
  });

  // State for the user being edited
  const [editingUser, setEditingUser] = useState<string | null>(null);

  // State for the modal
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');

  // Form state for new/edited user
  const [userForm, setUserForm] = useState({
    email: '',
    password: '',
    displayName: '',
    role: ROLES.SUBSCRIBER,
    status: 'active' as 'active' | 'inactive' | 'pending' | 'banned',
  });

  // Reset form when modal is closed
  useEffect(() => {
    if (!showModal) {
      setUserForm({
        email: '',
        password: '',
        displayName: '',
        role: ROLES.SUBSCRIBER,
        status: 'active',
      });
      setEditingUser(null);
    }
  }, [showModal]);

  // Filtered and sorted users
  const filteredUsers = users.filter(user => {
    // Don't show the current user in the list
    if (currentUser && user.id === currentUser.id) return false;

    // Apply role filter
    if (filters.role && user.role !== filters.role) return false;

    // Apply status filter
    if (filters.status && user.status !== filters.status) return false;

    // Apply search filter (case insensitive)
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return (
        user.displayName.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower)
      );
    }

    return true;
  });

  // Handler for opening the add user modal
  const handleAddUser = () => {
    setModalMode('add');
    setShowModal(true);
  };

  // Handler for opening the edit user modal
  const handleEditUser = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    setUserForm({
      email: user.email,
      password: '', // Don't populate password for security
      displayName: user.displayName,
      role: user.role,
      status: user.status,
    });

    setEditingUser(userId);
    setModalMode('edit');
    setShowModal(true);
  };

  // Handler for saving a user (add or edit)
  const handleSaveUser = () => {
    if (modalMode === 'add') {
      // Add new user
      addUser({
        email: userForm.email,
        password: userForm.password,
        displayName: userForm.displayName,
        isAdmin: [ROLES.SUPER_ADMIN, ROLES.ADMIN].includes(userForm.role),
        role: userForm.role,
        permissions: ROLE_PERMISSIONS[userForm.role as keyof typeof ROLE_PERMISSIONS] || [],
        photoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(userForm.displayName)}&background=718096&color=fff`,
        status: userForm.status,
        preferences: {
          darkMode: false,
          language: 'en',
          notifications: {
            email: true,
            push: true
          }
        }
      });
    } else if (modalMode === 'edit' && editingUser) {
      // Update existing user
      const updates: Record<string, any> = {
        displayName: userForm.displayName,
        role: userForm.role,
        isAdmin: [ROLES.SUPER_ADMIN, ROLES.ADMIN].includes(userForm.role),
        permissions: ROLE_PERMISSIONS[userForm.role as keyof typeof ROLE_PERMISSIONS] || [],
        status: userForm.status,
      };

      // Only update password if provided
      if (userForm.password) {
        updates.password = userForm.password;
      }

      updateUser(editingUser, updates);
    }

    // Close the modal
    setShowModal(false);
  };

  // Handler for deleting a user
  const handleDeleteUser = (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      deleteUser(userId);
    }
  };

  // Handler for changing a user's role
  const handleRoleChange = (userId: string, newRole: string) => {
    updateUserRole(userId, newRole);
  };

  // Handler for changing a user's status
  const handleStatusChange = (userId: string, newStatus: 'active' | 'inactive' | 'pending' | 'banned') => {
    updateUser(userId, { status: newStatus });
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Status color mapping
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'banned': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Role color mapping
  const getRoleColor = (role: string) => {
    switch (role) {
      case ROLES.SUPER_ADMIN: return 'bg-purple-100 text-purple-800';
      case ROLES.ADMIN: return 'bg-indigo-100 text-indigo-800';
      case ROLES.EDITOR: return 'bg-blue-100 text-blue-800';
      case ROLES.AUTHOR: return 'bg-cyan-100 text-cyan-800';
      case ROLES.MODERATOR: return 'bg-green-100 text-green-800';
      case ROLES.ANALYST: return 'bg-orange-100 text-orange-800';
      case ROLES.SUBSCRIBER: return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="user-management">
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <h1 className="text-2xl font-bold mb-4 sm:mb-0">User Management</h1>

        <button
          onClick={handleAddUser}
          className="px-4 py-2 bg-[#982a4a] text-white rounded-lg hover:bg-[#982a4a]/90"
        >
          Add New User
        </button>
      </div>

      {/* Filters */}
      <div className="mb-6 p-4 bg-white rounded-lg shadow-sm">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm text-gray-600 mb-1">Search</label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
              placeholder="Search users..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#982a4a]/50"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Role</label>
            <select
              value={filters.role}
              onChange={(e) => setFilters({...filters, role: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#982a4a]/50"
            >
              <option value="">All Roles</option>
              {Object.values(ROLES).map(role => (
                <option key={role} value={role}>{role.charAt(0).toUpperCase() + role.slice(1).replace('_', ' ')}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#982a4a]/50"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
              <option value="banned">Banned</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.length > 0 ? (
                filteredUsers.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img
                            className="h-10 w-10 rounded-full"
                            src={user.photoURL}
                            alt={user.displayName}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.displayName}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleColor(user.role)}`}>
                        {user.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(user.status)}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(user.createdAt as unknown as string)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.lastLogin ? formatDate(user.lastLogin as unknown as string) : 'Never'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                      <button
                        onClick={() => handleEditUser(user.id)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    No users found matching your criteria
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Modal */}
      {showModal && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {modalMode === 'add' ? 'Add New User' : 'Edit User'}
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Display Name</label>
                    <input
                      type="text"
                      value={userForm.displayName}
                      onChange={(e) => setUserForm({...userForm, displayName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#982a4a]/50"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={userForm.email}
                      onChange={(e) => setUserForm({...userForm, email: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#982a4a]/50"
                      required
                      disabled={modalMode === 'edit'} // Disable email editing
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      {modalMode === 'add' ? 'Password' : 'New Password (leave blank to keep current)'}
                    </label>
                    <input
                      type="password"
                      value={userForm.password}
                      onChange={(e) => setUserForm({...userForm, password: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#982a4a]/50"
                      required={modalMode === 'add'} // Only required for new users
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Role</label>
                    <select
                      value={userForm.role}
                      onChange={(e) => setUserForm({...userForm, role: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#982a4a]/50"
                    >
                      {Object.values(ROLES).map(role => (
                        <option key={role} value={role}>
                          {role.charAt(0).toUpperCase() + role.slice(1).replace('_', ' ')}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Status</label>
                    <select
                      value={userForm.status}
                      onChange={(e) => setUserForm({...userForm, status: e.target.value as 'active' | 'inactive' | 'pending' | 'banned'})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#982a4a]/50"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="pending">Pending</option>
                      <option value="banned">Banned</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleSaveUser}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-[#982a4a] text-base font-medium text-white hover:bg-[#982a4a]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#982a4a] sm:ml-3 sm:w-auto sm:text-sm"
                >
                  {modalMode === 'add' ? 'Add User' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;
