import React, { useState, useEffect } from 'react'
import { Search, Plus, Edit2, Trash2, Shield, Users, Settings, Eye, EyeOff, Copy, Check, X, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Checkbox } from '@/components/ui/Checkbox'
import { Badge } from '@/components/ui/Badge'
import { roleApi } from '@/services/roleApi'
import { useTranslation } from 'react-i18next'

interface Role {
  id: string
  name: string
  description: string
  permissions: string[]
  isSystem: boolean
  userCount: number
  createdAt: string
  updatedAt: string
}

interface Permission {
  id: string
  name: string
  description: string
  category: string
  resource: string
  action: string
}

interface RoleFormData {
  name: string
  description: string
  permissions: string[]
}

const RoleManager: React.FC = () => {
  const { t } = useTranslation()
  const [roles, setRoles] = useState<Role[]>([])
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showCloneModal, setShowCloneModal] = useState(false)
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [formData, setFormData] = useState<RoleFormData>({
    name: '',
    description: '',
    permissions: []
  })
  const [showSystemRoles, setShowSystemRoles] = useState(false)

  useEffect(() => {
    fetchRoles()
    fetchPermissions()
  }, [])

  const fetchRoles = async () => {
    setLoading(true)
    try {
      const response = await roleApi.getRoles()
      setRoles(response.data)
    } catch (error) {
      console.error('Error fetching roles:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPermissions = async () => {
    try {
      const response = await roleApi.getPermissions()
      setPermissions(response.data)
    } catch (error) {
      console.error('Error fetching permissions:', error)
    }
  }

  const handleCreateRole = async () => {
    try {
      await roleApi.createRole(formData)
      setShowCreateModal(false)
      resetForm()
      fetchRoles()
    } catch (error) {
      console.error('Error creating role:', error)
    }
  }

  const handleUpdateRole = async () => {
    if (!selectedRole) return
    
    try {
      await roleApi.updateRole(selectedRole.id, formData)
      setShowEditModal(false)
      resetForm()
      fetchRoles()
    } catch (error) {
      console.error('Error updating role:', error)
    }
  }

  const handleDeleteRole = async () => {
    if (!selectedRole) return
    
    try {
      await roleApi.deleteRole(selectedRole.id)
      setShowDeleteModal(false)
      setSelectedRole(null)
      fetchRoles()
    } catch (error) {
      console.error('Error deleting role:', error)
    }
  }

  const handleCloneRole = async () => {
    if (!selectedRole) return
    
    try {
      await roleApi.cloneRole(selectedRole.id, {
        name: formData.name,
        description: formData.description
      })
      setShowCloneModal(false)
      resetForm()
      fetchRoles()
    } catch (error) {
      console.error('Error cloning role:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      permissions: []
    })
    setSelectedRole(null)
  }

  const openEditModal = (role: Role) => {
    setSelectedRole(role)
    setFormData({
      name: role.name,
      description: role.description,
      permissions: role.permissions
    })
    setShowEditModal(true)
  }

  const openCloneModal = (role: Role) => {
    setSelectedRole(role)
    setFormData({
      name: `${role.name} (Copy)`,
      description: role.description,
      permissions: role.permissions
    })
    setShowCloneModal(true)
  }

  const openDeleteModal = (role: Role) => {
    setSelectedRole(role)
    setShowDeleteModal(true)
  }

  const togglePermission = (permissionId: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter(id => id !== permissionId)
        : [...prev.permissions, permissionId]
    }))
  }

  const filteredRoles = roles.filter(role => {
    const matchesSystem = showSystemRoles || !role.isSystem
    const q = searchTerm.toLowerCase()
    const matchesSearch = role.name.toLowerCase().includes(q) || role.description.toLowerCase().includes(q)
    return matchesSystem && matchesSearch
  })

  const groupedPermissions = permissions.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = []
    }
    acc[permission.category].push(permission)
    return acc
  }, {} as Record<string, Permission[]>)

  const getSeverityColor = (role: Role) => {
    if (role.isSystem) return 'bg-purple-100 text-purple-800'
    if (role.userCount === 0) return 'bg-gray-100 text-gray-800'
    return 'bg-blue-100 text-blue-800'
  }

  const getSeverityText = (role: Role) => {
    if (role.isSystem) return t('roleManagement.system')
    if (role.userCount === 0) return t('roleManagement.unused')
    return t('roleManagement.active')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{t('roleManagement.title')}</h2>
          <p className="text-gray-600">{t('roleManagement.subtitle')}</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          {t('roleManagement.createRole')}
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <Input
              placeholder={t('roleManagement.searchRoles')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<Search className="w-4 h-4" />}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="show-system"
              checked={showSystemRoles}
              onChange={(checked) => setShowSystemRoles(checked)}
            />
            <label htmlFor="show-system" className="text-sm text-gray-700">
              {t('roleManagement.showSystemRoles')}
            </label>
          </div>
        </div>
      </div>

      {/* Roles Table */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('roleManagement.role')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('roleManagement.description')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('roleManagement.permissions')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('roleManagement.users')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('roleManagement.status')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('roleManagement.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                  </td>
                </tr>
              ) : filteredRoles.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    {t('roleManagement.noRolesFound')}
                  </td>
                </tr>
              ) : (
                filteredRoles.map((role) => (
                  <tr key={role.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Shield className="w-5 h-5 text-gray-400 mr-2" />
                        <span className="font-medium text-gray-900">{role.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">{role.description}</span>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="secondary">{role.permissions.length} {t('roleManagement.permissions').toLowerCase()}</Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Users className="w-4 h-4 text-gray-400 mr-1" />
                        <span className="text-sm text-gray-900">{role.userCount}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge className={getSeverityColor(role)}>
                        {getSeverityText(role)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditModal(role)}
                          disabled={role.isSystem}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openCloneModal(role)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDeleteModal(role)}
                          disabled={role.isSystem || role.userCount > 0}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Role Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false)
          resetForm()
        }}
        title="Create New Role"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('roleManagement.modals.roleName')}
            </label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder={t('roleManagement.modals.placeholderName')}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('roleManagement.description')}
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder={t('roleManagement.modals.placeholderDescription')}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('roleManagement.permissions')}
            </label>
            <div className="space-y-4 max-h-64 overflow-y-auto">
              {Object.entries(groupedPermissions).map(([category, categoryPermissions]) => (
                <div key={category}>
                  <h4 className="font-medium text-gray-900 mb-2 capitalize">{category}</h4>
                  <div className="space-y-2">
                    {categoryPermissions.map((permission) => (
                      <div key={permission.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={permission.id}
                          checked={formData.permissions.includes(permission.id)}
                          onChange={(checked) => {
                            if (checked) {
                              setFormData(prev => ({
                                ...prev,
                                permissions: [...prev.permissions, permission.id]
                              }))
                            } else {
                              setFormData(prev => ({
                                ...prev,
                                permissions: prev.permissions.filter(id => id !== permission.id)
                              }))
                            }
                          }}
                        />
                        <label htmlFor={permission.id} className="text-sm text-gray-700">
                          {permission.name}
                        </label>
                        <span className="text-xs text-gray-500">- {permission.description}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex justify-end space-x-3 mt-6">
          <Button
            variant="outline"
            onClick={() => {
              setShowCreateModal(false)
              resetForm()
            }}
          >
            {t('common.cancel')}
          </Button>
          <Button onClick={handleCreateRole}>
            {t('roleManagement.modals.create')}
          </Button>
        </div>
      </Modal>

      {/* Edit Role Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          resetForm()
        }}
        title="Edit Role"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role Name
            </label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Sales Manager"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe the role and its purpose"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Permissions
            </label>
            <div className="space-y-4 max-h-64 overflow-y-auto">
              {Object.entries(groupedPermissions).map(([category, categoryPermissions]) => (
                <div key={category}>
                  <h4 className="font-medium text-gray-900 mb-2 capitalize">{category}</h4>
                  <div className="space-y-2">
                    {categoryPermissions.map((permission) => (
                      <div key={permission.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={permission.id}
                          checked={formData.permissions.includes(permission.id)}
                          onChange={(checked) => {
                            if (checked) {
                              setFormData(prev => ({
                                ...prev,
                                permissions: [...prev.permissions, permission.id]
                              }))
                            } else {
                              setFormData(prev => ({
                                ...prev,
                                permissions: prev.permissions.filter(id => id !== permission.id)
                              }))
                            }
                          }}
                        />
                        <label htmlFor={permission.id} className="text-sm text-gray-700">
                          {permission.name}
                        </label>
                        <span className="text-xs text-gray-500">- {permission.description}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex justify-end space-x-3 mt-6">
          <Button
            variant="outline"
            onClick={() => {
              setShowEditModal(false)
              resetForm()
            }}
          >
            {t('common.cancel')}
          </Button>
          <Button onClick={handleUpdateRole}>
            {t('roleManagement.modals.update')}
          </Button>
        </div>
      </Modal>

      {/* Clone Role Modal */}
      <Modal
        isOpen={showCloneModal}
        onClose={() => {
          setShowCloneModal(false)
          resetForm()
        }}
        title="Clone Role"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('roleManagement.modals.newRoleName')}
            </label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder={t('roleManagement.modals.placeholderName')}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('roleManagement.description')}
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder={t('roleManagement.modals.placeholderDescription')}
            />
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <div className="flex items-start">
              <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5 mr-2" />
              <div>
                <p className="text-sm text-blue-800">
                  {t('roleManagement.modals.cloneInfo', { name: selectedRole?.name })}
                </p>
                <p className="text-sm text-blue-600 mt-1">
                  {t('roleManagement.modals.clonePermissionCount', { count: formData.permissions.length })}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-end space-x-3 mt-6">
          <Button
            variant="outline"
            onClick={() => {
              setShowCloneModal(false)
              resetForm()
            }}
          >
            {t('common.cancel')}
          </Button>
          <Button onClick={handleCloneRole}>
            {t('roleManagement.modals.clone')}
          </Button>
        </div>
      </Modal>

      {/* Delete Role Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false)
          setSelectedRole(null)
        }}
        title="Delete Role"
      >
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex items-start">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 mr-2" />
              <div>
                <h3 className="text-sm font-medium text-red-800">Warning</h3>
                <p className="text-sm text-red-700 mt-1">
                  {t('roleManagement.modals.deleteConfirm', { name: selectedRole?.name })}
                </p>
                {selectedRole?.userCount && selectedRole.userCount > 0 && (
                  <p className="text-sm text-red-600 mt-2">
                    {t('roleManagement.modals.roleAssignedToUsers', { count: selectedRole.userCount })}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-end space-x-3 mt-6">
          <Button
            variant="outline"
            onClick={() => {
              setShowDeleteModal(false)
              setSelectedRole(null)
            }}
          >
            {t('common.cancel')}
          </Button>
          <Button
            variant="destructive"
            onClick={handleDeleteRole}
            disabled={selectedRole?.userCount && selectedRole.userCount > 0}
          >
            {t('roleManagement.modals.delete')}
          </Button>
        </div>
      </Modal>
    </div>
  )
}

export default RoleManager
