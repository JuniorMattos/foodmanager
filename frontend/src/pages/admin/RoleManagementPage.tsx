import React, { useState, useEffect } from 'react'
import { Shield, Users, Settings, AlertTriangle, TrendingUp, Activity, Lock, Eye, BarChart3, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import RoleManager from '@/components/admin/RoleManager'
import { roleApi } from '@/services/roleApi'
import { useTranslation } from 'react-i18next'

interface RoleStats {
  totalRoles: number
  systemRoles: number
  customRoles: number
  activeRoles: number
  unusedRoles: number
  totalUsers: number
  usersWithRoles: number
  usersWithoutRoles: number
  recentActivity: Array<{
    id: string
    action: string
    roleName: string
    userName: string
    timestamp: string
    severity: 'low' | 'medium' | 'high'
  }>
  roleDistribution: Array<{
    roleName: string
    userCount: number
    percentage: number
  }>
  permissionUsage: Array<{
    category: string
    usageCount: number
    totalPermissions: number
  }>
}

const RoleManagementPage: React.FC = () => {
  const [stats, setStats] = useState<RoleStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'roles' | 'permissions'>('overview')
  const [refreshing, setRefreshing] = useState(false)
  const { t } = useTranslation()

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    setLoading(true)
    try {
      const response = await roleApi.getRoleStats()
      setStats(response.data)
    } catch (error) {
      console.error('Error fetching role stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchStats()
    setRefreshing(false)
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getActivityIcon = (action: string) => {
    switch (action) {
      case 'role_created': return <Shield className="w-4 h-4" />
      case 'role_updated': return <Settings className="w-4 h-4" />
      case 'role_deleted': return <AlertTriangle className="w-4 h-4" />
      case 'user_assigned': return <Users className="w-4 h-4" />
      case 'permission_granted': return <Lock className="w-4 h-4" />
      default: return <Activity className="w-4 h-4" />
    }
  }

  if (activeTab === 'roles') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{t('roleManagement.title')}</h2>
            <p className="text-gray-600">{t('roleManagement.subtitle')}</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={() => setActiveTab('overview')}
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              {t('common.overview')}
            </Button>
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              {t('common.refresh')}
            </Button>
          </div>
        </div>
        <RoleManager />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{t('roleManagement.title')}</h2>
          <p className="text-gray-600">{t('roleManagement.overviewSubtitle')}</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => setActiveTab('roles')}
          >
            <Shield className="w-4 h-4 mr-2" />
            {t('roleManagement.manageRoles')}
          </Button>
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {t('common.refresh')}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{t('roleManagement.stats.totalRoles')}</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.totalRoles || 0}</p>
              <p className="text-xs text-gray-500">
                {t('roleManagement.stats.systemAndCustom', { system: stats?.systemRoles || 0, custom: stats?.customRoles || 0 })}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{t('roleManagement.stats.activeRoles')}</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.activeRoles || 0}</p>
              <p className="text-xs text-gray-500">
                {t('roleManagement.stats.unused', { count: stats?.unusedRoles || 0 })}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <Users className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{t('roleManagement.stats.totalUsers')}</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.totalUsers || 0}</p>
              <p className="text-xs text-gray-500">
                {t('roleManagement.stats.withRoles', { count: stats?.usersWithRoles || 0 })}
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <Activity className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{t('roleManagement.stats.unassignedUsers')}</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.usersWithoutRoles || 0}</p>
              <p className="text-xs text-gray-500">
                {t('roleManagement.stats.needRoleAssignment')}
              </p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Role Distribution */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">{t('roleManagement.charts.roleDistribution')}</h3>
            <Eye className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {stats?.roleDistribution?.map((role) => (
              <div key={role.roleName} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-gray-700">{role.roleName}</span>
                  <Badge variant="secondary">{role.userCount} users</Badge>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${role.percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600">{role.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Permission Usage */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">{t('roleManagement.charts.permissionUsage')}</h3>
            <Lock className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {stats?.permissionUsage?.map((category) => (
              <div key={category.category} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-gray-700 capitalize">{category.category}</span>
                  <Badge variant="secondary">{category.usageCount} used</Badge>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${(category.usageCount / category.totalPermissions) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600">
                    {Math.round((category.usageCount / category.totalPermissions) * 100)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{t('roleManagement.recentActivity')}</h3>
          <TrendingUp className="w-5 h-5 text-gray-400" />
        </div>
        <div className="space-y-3">
          {stats?.recentActivity?.map((activity) => (
            <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="text-gray-400">
                  {getActivityIcon(activity.action)}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {activity.action.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </p>
                  <p className="text-xs text-gray-500">
                    {activity.roleName} • {activity.userName}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Badge className={getSeverityColor(activity.severity)}>
                  {activity.severity}
                </Badge>
                <span className="text-xs text-gray-500">
                  {new Date(activity.timestamp).toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Quick Actions */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{t('roleManagement.quickActions')}</h3>
          <Settings className="w-5 h-5 text-gray-400" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            onClick={() => setActiveTab('roles')}
            className="justify-start"
          >
            <Shield className="w-4 h-4 mr-2" />
            {t('roleManagement.createNewRole')}
          </Button>
          <Button
            variant="outline"
            className="justify-start"
          >
            <Users className="w-4 h-4 mr-2" />
            {t('roleManagement.assignRolesToUsers')}
          </Button>
          <Button
            variant="outline"
            className="justify-start"
          >
            <Lock className="w-4 h-4 mr-2" />
            {t('roleManagement.reviewPermissions')}
          </Button>
        </div>
      </Card>
    </div>
  )
}

export default RoleManagementPage
