import React, { useState, useEffect } from 'react';
import { useUser, PERMISSIONS } from '../context/UserContext';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from './ui/Card';
import { Button } from './ui/Button';
import { Switch } from './ui/Switch';
import { useActivityLog } from '../context/ActivityLogContext';
import { useToast } from '../context/ToastContext';

interface Role {
  id: string;
  name: string;
  permissions: string[];
  description: string;
  isSystem: boolean;
}

const RolePermissionManager: React.FC = () => {
  const { allRoles, updateRole, createRole, deleteRole, PERMISSIONS } = useUser();
  const { addLogEntry } = useActivityLog();
  const { showToast } = useToast();

  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [isCreatingRole, setIsCreatingRole] = useState(false);

  // Sort permissions by category for better organization
  const permissionCategories = [
    {
      name: 'Content Management',
      permissions: [
        PERMISSIONS.MANAGE_DEALS,
        PERMISSIONS.PUBLISH_DEALS,
        PERMISSIONS.MANAGE_STORES,
        PERMISSIONS.MANAGE_PAGES,
      ],
    },
    {
      name: 'User Management',
      permissions: [
        PERMISSIONS.MANAGE_USERS,
        PERMISSIONS.MODERATE_COMMENTS,
      ],
    },
    {
      name: 'Media & Design',
      permissions: [
        PERMISSIONS.MANAGE_MEDIA,
        PERMISSIONS.MANAGE_DESIGN,
        PERMISSIONS.MANAGE_SEO,
      ],
    },
    {
      name: 'System & Analytics',
      permissions: [
        PERMISSIONS.SYSTEM_SETTINGS,
        PERMISSIONS.VIEW_ANALYTICS,
        PERMISSIONS.VIEW_API_INTEGRATIONS,
        PERMISSIONS.MANAGE_API_INTEGRATIONS,
      ],
    },
  ];

  // Initialize with roles from context
  useEffect(() => {
    if (allRoles && allRoles.length > 0) {
      setRoles(allRoles);
      if (!selectedRoleId && allRoles.length > 0) {
        setSelectedRoleId(allRoles[0].id);
      }
    }
  }, [allRoles, selectedRoleId]);

  // Set the editing role when selection changes
  useEffect(() => {
    if (selectedRoleId && roles.length > 0) {
      const role = roles.find(r => r.id === selectedRoleId);
      if (role) {
        setEditingRole({ ...role });
      }
    } else {
      setEditingRole(null);
    }
  }, [selectedRoleId, roles]);

  const handlePermissionChange = (permission: string, checked: boolean) => {
    if (!editingRole) return;

    setEditingRole(prev => {
      if (!prev) return null;

      const updatedPermissions = checked
        ? [...prev.permissions, permission]
        : prev.permissions.filter(p => p !== permission);

      return {
        ...prev,
        permissions: updatedPermissions,
      };
    });
  };

  const handleRoleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editingRole) return;
    setEditingRole({ ...editingRole, name: e.target.value });
  };

  const handleRoleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!editingRole) return;
    setEditingRole({ ...editingRole, description: e.target.value });
  };

  const handleCreateNewRole = () => {
    setSelectedRoleId(null);
    setIsCreatingRole(true);
    setEditingRole({
      id: `role_${Date.now()}`,
      name: 'New Role',
      permissions: [],
      description: 'Role description',
      isSystem: false,
    });
  };

  const handleSaveRole = () => {
    if (!editingRole) return;

    if (isCreatingRole) {
      createRole(editingRole);
      addLogEntry({
        action: 'Create',
        targetType: 'Role',
        targetName: editingRole.name,
        details: `Created new role with ${editingRole.permissions.length} permissions`,
      });
      showToast(`Role "${editingRole.name}" created successfully`, 'success');
      setIsCreatingRole(false);
    } else {
      updateRole(editingRole);
      addLogEntry({
        action: 'Update',
        targetType: 'Role',
        targetId: editingRole.id,
        targetName: editingRole.name,
        details: `Updated role permissions`,
      });
      showToast(`Role "${editingRole.name}" updated successfully`, 'success');
    }

    // Reset editing state
    setSelectedRoleId(editingRole.id);
  };

  const handleDeleteRole = () => {
    if (!editingRole || editingRole.isSystem) return;

    if (window.confirm(`Are you sure you want to delete the role "${editingRole.name}"?`)) {
      deleteRole(editingRole.id);
      addLogEntry({
        action: 'Delete',
        targetType: 'Role',
        targetId: editingRole.id,
        targetName: editingRole.name,
        details: `Deleted role`,
      });
      showToast(`Role "${editingRole.name}" deleted successfully`, 'info');
      setSelectedRoleId(roles.length > 1 ? roles[0].id : null);
    }
  };

  const handleCancelEdit = () => {
    if (isCreatingRole) {
      setIsCreatingRole(false);
      setSelectedRoleId(roles.length > 0 ? roles[0].id : null);
    } else if (selectedRoleId) {
      // Reset to original role
      const originalRole = roles.find(r => r.id === selectedRoleId);
      if (originalRole) {
        setEditingRole({ ...originalRole });
      }
    }
  };

  // Check if a permission is enabled for the current role
  const isPermissionEnabled = (permission: string) => {
    return editingRole?.permissions.includes(permission) || false;
  };

  // Format permission name for display
  const formatPermissionName = (permission: string) => {
    return permission
      .replace('PERMISSION_', '')
      .split('_')
      .map(word => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' ');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Role & Permission Management</h1>
        <Button onClick={handleCreateNewRole}>Create New Role</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Role Selection */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Roles</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1">
                {roles.map(role => (
                  <li key={role.id}>
                    <button
                      className={`w-full text-left px-3 py-2 rounded-md ${
                        selectedRoleId === role.id
                          ? 'bg-[#982a4a]/10 text-[#982a4a] font-medium'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                      onClick={() => {
                        setSelectedRoleId(role.id);
                        setIsCreatingRole(false);
                      }}
                    >
                      {role.name}
                      {role.isSystem && (
                        <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                          System
                        </span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Role Details and Permissions */}
        <div className="md:col-span-3">
          {editingRole ? (
            <Card>
              <CardHeader>
                <CardTitle>
                  {isCreatingRole ? 'Create New Role' : `Edit Role: ${editingRole.name}`}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Role Details */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Role Name</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#982a4a] focus:border-[#982a4a]"
                        value={editingRole.name}
                        onChange={handleRoleNameChange}
                        disabled={editingRole.isSystem}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#982a4a] focus:border-[#982a4a]"
                        rows={3}
                        value={editingRole.description}
                        onChange={handleRoleDescriptionChange}
                        disabled={editingRole.isSystem}
                      />
                    </div>
                  </div>

                  {/* Permission Categories */}
                  <div className="space-y-6">
                    {permissionCategories.map(category => (
                      <div key={category.name} className="border rounded-md p-4">
                        <h3 className="font-medium text-gray-900 mb-4">{category.name}</h3>
                        <div className="space-y-3">
                          {category.permissions.map(permission => (
                            <div key={permission} className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-gray-700">
                                  {formatPermissionName(permission)}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {/* Simple permission description */}
                                  {permission.includes('MANAGE') ? 'Can add, edit and delete' :
                                   permission.includes('VIEW') ? 'Can view but not modify' :
                                   permission.includes('PUBLISH') ? 'Can publish content' : 'Can moderate'}
                                </p>
                              </div>
                              <Switch
                                checked={isPermissionEnabled(permission)}
                                onChange={(checked) => handlePermissionChange(permission, checked)}
                                disabled={editingRole.isSystem && (
                                  // Prevent modifying critical permissions on system roles
                                  (editingRole.name === 'Administrator' ||
                                   (editingRole.name === 'Editor' && permission === PERMISSIONS.SYSTEM_SETTINGS))
                                )}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <div>
                  {!editingRole.isSystem && (
                    <Button
                      variant="danger"
                      onClick={handleDeleteRole}
                      disabled={isCreatingRole}
                    >
                      Delete Role
                    </Button>
                  )}
                </div>
                <div className="flex space-x-2">
                  <Button variant="secondary" onClick={handleCancelEdit}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveRole}>
                    {isCreatingRole ? 'Create Role' : 'Save Changes'}
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ) : (
            <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <p className="text-gray-500">Select a role or create a new one</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RolePermissionManager;
