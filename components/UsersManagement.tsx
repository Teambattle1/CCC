import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Trash2,
  Shield,
  Clock,
  Mail,
  X,
  Check,
  AlertCircle,
  AlertTriangle,
  Activity,
  ChevronDown,
  KeyRound,
  Pencil,
  Lock
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import {
  OCCUser,
  UserRole,
  ActivityLog,
  getAllUsers,
  getActivityLogs,
  createUser,
  updateUserRole,
  deleteUser,
  updateUserPassword,
  updateUserName
} from '../lib/supabase';

interface UsersManagementProps {
  isOpen: boolean;
  onClose: () => void;
}

// Permission types
type PermissionKey =
  | 'landing_controlcenter' | 'landing_office' | 'landing_activities' | 'landing_admin'
  | 'office_economy' | 'office_googletools' | 'office_crewcontrolcenter' | 'office_office'
  | 'admin_code' | 'admin_users'
  | 'activity_teamplay' | 'activity_teamchallenge' | 'activity_teamtaste'
  | 'activity_teamlazer' | 'activity_teamrobin' | 'activity_teamsegway'
  | 'activity_teamconnect' | 'activity_teambox' | 'activity_teamcontrol'
  | 'activity_teamaction' | 'activity_teamconstruct';

type RolePermissions = {
  [key in PermissionKey]: boolean;
};

export type PermissionsConfig = {
  INSTRUCTOR: RolePermissions;
  GAMEMASTER: RolePermissions;
  ADMIN: RolePermissions;
};

// Default permissions
const DEFAULT_PERMISSIONS: PermissionsConfig = {
  INSTRUCTOR: {
    landing_controlcenter: true,
    landing_office: false,
    landing_activities: true,
    landing_admin: false,
    office_economy: false,
    office_googletools: true,
    office_crewcontrolcenter: true,
    office_office: true,
    admin_code: false,
    admin_users: false,
    activity_teamplay: true,
    activity_teamchallenge: true,
    activity_teamtaste: true,
    activity_teamlazer: true,
    activity_teamrobin: true,
    activity_teamsegway: true,
    activity_teamconnect: true,
    activity_teambox: true,
    activity_teamcontrol: true,
    activity_teamaction: true,
    activity_teamconstruct: true
  },
  GAMEMASTER: {
    landing_controlcenter: true,
    landing_office: true,
    landing_activities: true,
    landing_admin: false,
    office_economy: false,
    office_googletools: true,
    office_crewcontrolcenter: true,
    office_office: true,
    admin_code: false,
    admin_users: false,
    activity_teamplay: true,
    activity_teamchallenge: true,
    activity_teamtaste: true,
    activity_teamlazer: true,
    activity_teamrobin: true,
    activity_teamsegway: true,
    activity_teamconnect: true,
    activity_teambox: true,
    activity_teamcontrol: true,
    activity_teamaction: true,
    activity_teamconstruct: true
  },
  ADMIN: {
    landing_controlcenter: true,
    landing_office: true,
    landing_activities: true,
    landing_admin: true,
    office_economy: true,
    office_googletools: true,
    office_crewcontrolcenter: true,
    office_office: true,
    admin_code: true,
    admin_users: true,
    activity_teamplay: true,
    activity_teamchallenge: true,
    activity_teamtaste: true,
    activity_teamlazer: true,
    activity_teamrobin: true,
    activity_teamsegway: true,
    activity_teamconnect: true,
    activity_teambox: true,
    activity_teamcontrol: true,
    activity_teamaction: true,
    activity_teamconstruct: true
  }
};

// Load permissions from localStorage
const loadPermissions = (): PermissionsConfig => {
  try {
    const saved = localStorage.getItem('occ_permissions');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to load permissions:', e);
  }
  return DEFAULT_PERMISSIONS;
};

// Save permissions to localStorage
const savePermissions = (permissions: PermissionsConfig) => {
  try {
    localStorage.setItem('occ_permissions', JSON.stringify(permissions));
  } catch (e) {
    console.error('Failed to save permissions:', e);
  }
};

// Export for use in App.tsx
export const getPermissions = loadPermissions;

// User-level activity permissions (for instructors)
// Maps activity key to array of user emails who have access
type UserActivityPermissions = {
  [activityKey: string]: string[]; // emails of instructors who have access
};

const DEFAULT_USER_ACTIVITY_PERMISSIONS: UserActivityPermissions = {};

// Load user activity permissions from localStorage
const loadUserActivityPermissions = (): UserActivityPermissions => {
  try {
    const saved = localStorage.getItem('occ_user_activity_permissions');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to load user activity permissions:', e);
  }
  return DEFAULT_USER_ACTIVITY_PERMISSIONS;
};

// Save user activity permissions to localStorage
const saveUserActivityPermissions = (perms: UserActivityPermissions) => {
  try {
    localStorage.setItem('occ_user_activity_permissions', JSON.stringify(perms));
  } catch (e) {
    console.error('Failed to save user activity permissions:', e);
  }
};

// Export for use in App.tsx
export const getUserActivityPermissions = loadUserActivityPermissions;

const UsersManagement: React.FC<UsersManagementProps> = ({ isOpen, onClose }) => {
  const { hasPermission, logAction } = useAuth();
  const [users, setUsers] = useState<OCCUser[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'users' | 'logs' | 'permissions'>('users');
  const [showAddUser, setShowAddUser] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Permissions state
  const [permissions, setPermissions] = useState<PermissionsConfig>(loadPermissions);

  // User-level activity permissions state
  const [userActivityPermissions, setUserActivityPermissions] = useState<UserActivityPermissions>(loadUserActivityPermissions);
  const [selectedActivity, setSelectedActivity] = useState<{ key: string; name: string } | null>(null);

  // Get instructors list
  const instructors = users.filter(u => u.role === 'INSTRUCTOR');

  // Toggle user activity permission
  const toggleUserActivityPermission = (activityKey: string, userEmail: string) => {
    const currentAccess = userActivityPermissions[activityKey] || [];
    const hasAccess = currentAccess.includes(userEmail);

    let newAccess: string[];
    if (hasAccess) {
      newAccess = currentAccess.filter(email => email !== userEmail);
    } else {
      newAccess = [...currentAccess, userEmail];
    }

    const newPermissions = {
      ...userActivityPermissions,
      [activityKey]: newAccess
    };

    setUserActivityPermissions(newPermissions);
    saveUserActivityPermissions(newPermissions);
    logAction('UPDATE_USER_ACTIVITY_PERMISSION', `Changed ${userEmail} access for ${activityKey}`);
  };

  // Check if any instructor has access to an activity
  const hasAnyInstructorAccess = (activityKey: string): boolean => {
    const access = userActivityPermissions[activityKey] || [];
    return access.length > 0;
  };

  // Check if specific instructor has access
  const instructorHasAccess = (activityKey: string, userEmail: string): boolean => {
    const access = userActivityPermissions[activityKey] || [];
    return access.includes(userEmail);
  };

  // Toggle permission
  const togglePermission = (role: keyof PermissionsConfig, key: PermissionKey) => {
    // Don't allow removing Admin's own access to admin functions
    if (role === 'ADMIN' && (key === 'landing_admin' || key === 'admin_users')) {
      return;
    }

    const newPermissions = {
      ...permissions,
      [role]: {
        ...permissions[role],
        [key]: !permissions[role][key]
      }
    };
    setPermissions(newPermissions);
    savePermissions(newPermissions);
    logAction('UPDATE_PERMISSIONS', `Changed ${role} permission for ${key}`);
  };

  // Render permission cell
  const PermissionCell: React.FC<{
    role: keyof PermissionsConfig;
    permKey: PermissionKey;
    locked?: boolean;
  }> = ({ role, permKey, locked }) => {
    const hasAccess = permissions[role][permKey];
    const isLocked = locked || (role === 'ADMIN' && (permKey === 'landing_admin' || permKey === 'admin_users'));

    return (
      <td className="text-center py-2 px-4">
        <button
          onClick={() => !isLocked && togglePermission(role, permKey)}
          disabled={isLocked}
          className={`p-1 rounded transition-all ${
            isLocked
              ? 'cursor-not-allowed opacity-50'
              : 'cursor-pointer hover:bg-white/10 hover:scale-110'
          }`}
          title={isLocked ? 'Kan ikke ændres' : 'Klik for at ændre'}
        >
          {hasAccess ? (
            <Check className="w-5 h-5 text-green-500 mx-auto" />
          ) : (
            <X className="w-5 h-5 text-red-500/50 mx-auto" />
          )}
        </button>
      </td>
    );
  };

  // New user form state
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('INSTRUCTOR');

  // Password edit state
  const [editingPasswordUserId, setEditingPasswordUserId] = useState<string | null>(null);
  const [editingPasswordUserEmail, setEditingPasswordUserEmail] = useState('');
  const [newPasswordValue, setNewPasswordValue] = useState('');

  // Activity log filters
  const [filterUser, setFilterUser] = useState<string>('');
  const [filterAction, setFilterAction] = useState<string>('');
  const [filterDate, setFilterDate] = useState<string>('');

  // Name edit state
  const [editingNameUserId, setEditingNameUserId] = useState<string | null>(null);
  const [newNameValue, setNewNameValue] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [usersData, logsData] = await Promise.all([
        getAllUsers(),
        getActivityLogs(100)
      ]);
      setUsers(usersData);
      setActivityLogs(logsData);
    } catch (err) {
      setError('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const result = await createUser(newUserEmail, newUserPassword, newUserRole, newUserName);

    if (result.success) {
      setSuccess('Bruger oprettet');
      logAction('CREATE_USER', `Created user: ${newUserEmail} with role: ${newUserRole}`);
      setNewUserEmail('');
      setNewUserPassword('');
      setNewUserName('');
      setNewUserRole('INSTRUCTOR');
      setShowAddUser(false);
      loadData();
    } else {
      setError(result.error || 'Failed to create user');
    }
  };

  const handleUpdateRole = async (userId: string, email: string, newRole: UserRole) => {
    const result = await updateUserRole(userId, newRole);

    if (result.success) {
      logAction('UPDATE_USER_ROLE', `Updated ${email} role to: ${newRole}`);
      loadData();
    } else {
      setError(result.error || 'Failed to update role');
    }
  };

  const handleDeleteUser = async (userId: string, email: string) => {
    if (!confirm(`Er du sikker på at du vil slette ${email}?`)) return;

    const result = await deleteUser(userId);

    if (result.success) {
      logAction('DELETE_USER', `Deleted user: ${email}`);
      loadData();
    } else {
      setError(result.error || 'Failed to delete user');
    }
  };

  const handleOpenPasswordEdit = (userId: string, email: string) => {
    setEditingPasswordUserId(userId);
    setEditingPasswordUserEmail(email);
    setNewPasswordValue('');
    setError('');
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPasswordUserId || !newPasswordValue) return;

    setError('');
    setSuccess('');

    if (newPasswordValue.length < 6) {
      setError('Password skal være mindst 6 tegn');
      return;
    }

    const result = await updateUserPassword(editingPasswordUserId, newPasswordValue);

    if (result.success) {
      setSuccess(`Password opdateret for ${editingPasswordUserEmail}`);
      logAction('UPDATE_PASSWORD', `Updated password for: ${editingPasswordUserEmail}`);
      setEditingPasswordUserId(null);
      setEditingPasswordUserEmail('');
      setNewPasswordValue('');
    } else {
      setError(result.error || 'Kunne ikke opdatere password');
    }
  };

  const handleOpenNameEdit = (userId: string, currentName: string) => {
    setEditingNameUserId(userId);
    setNewNameValue(currentName || '');
    setError('');
  };

  const handleUpdateName = async (userId: string) => {
    if (!newNameValue.trim()) {
      setError('Navn må ikke være tomt');
      return;
    }

    setError('');
    setSuccess('');

    const result = await updateUserName(userId, newNameValue.trim());

    if (result.success) {
      setSuccess('Navn opdateret');
      logAction('UPDATE_NAME', `Updated name for user to: ${newNameValue}`);
      setEditingNameUserId(null);
      setNewNameValue('');
      loadData();
    } else {
      setError(result.error || 'Kunne ikke opdatere navn');
    }
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'ADMIN': return 'bg-red-500/20 text-red-400 border-red-500/50';
      case 'GAMEMASTER': return 'bg-purple-500/20 text-purple-400 border-purple-500/50';
      case 'INSTRUCTOR': return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  // Translate action names to user-friendly Danish
  const getActionLabel = (action: string): string => {
    const labels: Record<string, string> = {
      'LOGIN': 'Log ind',
      'LOGOUT': 'Log ud',
      'PAGE_VISIT': 'Åbnede side',
      'UPDATE_NAME': 'Skiftede navn',
      'UPDATE_USER_ROLE': 'Skiftede rolle',
      'UPDATE_PASSWORD': 'Nyt password',
      'CREATE_USER': 'Ny bruger',
      'DELETE_USER': 'Slettet bruger'
    };
    return labels[action] || action;
  };

  // Get user name from email
  const getUserNameByEmail = (email: string): string => {
    const user = users.find(u => u.email === email);
    return user?.name || email;
  };

  // Translate page names to user-friendly Danish
  // HUSK: Tilføj nye sider her når de oprettes!
  const getPageLabel = (page: string): string => {
    const labels: Record<string, string> = {
      'main': 'Forside',
      'activities': 'Aktiviteter',
      'economy': 'Økonomi',
      'coding': 'Udvikling',
      'task_control': 'Admin',
      'tools': 'Værktøjer',
      'office': 'Kontor',
      'team_challenge': 'TeamChallenge',
      'loquiz': 'Loquiz',
      'teamaction': 'TeamAction',
      'teamlazer': 'TeamLazer',
      'teamrobin': 'TeamRobin',
      'teamconnect': 'TeamConnect',
      'teambox': 'TeamBox',
      'teamsegway': 'TeamSegway',
      'teamcontrol': 'TeamControl',
      'teamconstruct': 'TeamConstruct',
      'distance_tool': 'Afstandsberegner'
    };
    return labels[page] || page;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('da-DK', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get unique users and actions for filter dropdowns
  const uniqueUsers = [...new Set(activityLogs.map(log => log.user_email))].sort();
  const uniqueActions = [...new Set(activityLogs.map(log => log.action))].sort();

  // Filter activity logs
  const filteredLogs = activityLogs.filter(log => {
    // Filter by user
    if (filterUser && log.user_email !== filterUser) return false;

    // Filter by action
    if (filterAction && log.action !== filterAction) return false;

    // Filter by date
    if (filterDate) {
      const logDate = new Date(log.timestamp).toISOString().split('T')[0];
      if (logDate !== filterDate) return false;
    }

    return true;
  });

  if (!isOpen) return null;

  if (!hasPermission('ADMIN')) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
        <div className="relative bg-battle-grey border border-red-500/30 rounded-2xl p-8 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Ingen adgang</h2>
          <p className="text-gray-400">Du har ikke rettigheder til at se denne side.</p>
          <button
            onClick={onClose}
            className="mt-6 px-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
          >
            Luk
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-battle-grey border border-battle-orange/30 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6 text-battle-orange" />
            <h2 className="text-xl font-bold text-white">Brugerstyring</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10">
          <button
            onClick={() => setActiveTab('users')}
            className={`flex-1 flex items-center justify-center gap-2 py-4 font-medium transition-colors ${
              activeTab === 'users'
                ? 'text-battle-orange border-b-2 border-battle-orange'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            Brugere ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('permissions')}
            className={`flex-1 flex items-center justify-center gap-2 py-4 font-medium transition-colors ${
              activeTab === 'permissions'
                ? 'text-battle-orange border-b-2 border-battle-orange'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Lock className="w-4 h-4" />
            Adgangsstyring
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`flex-1 flex items-center justify-center gap-2 py-4 font-medium transition-colors ${
              activeTab === 'logs'
                ? 'text-battle-orange border-b-2 border-battle-orange'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Activity className="w-4 h-4" />
            Aktivitetslog
          </button>
        </div>

        {/* Messages */}
        {error && (
          <div className="mx-6 mt-4 flex items-center gap-2 bg-red-500/20 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
            <button onClick={() => setError('')} className="ml-auto">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        {success && (
          <div className="mx-6 mt-4 flex items-center gap-2 bg-green-500/20 border border-green-500/50 text-green-400 px-4 py-3 rounded-lg">
            <Check className="w-5 h-5" />
            <span>{success}</span>
            <button onClick={() => setSuccess('')} className="ml-auto">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-battle-orange/30 border-t-battle-orange rounded-full animate-spin" />
            </div>
          ) : activeTab === 'users' ? (
            <div className="space-y-4">
              {/* Add User Button */}
              <button
                onClick={() => setShowAddUser(!showAddUser)}
                className="flex items-center gap-2 px-4 py-2 bg-battle-orange/20 hover:bg-battle-orange/30 text-battle-orange rounded-lg transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                Tilføj bruger
              </button>

              {/* Add User Form */}
              {showAddUser && (
                <form onSubmit={handleAddUser} className="bg-battle-black rounded-xl p-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Navn</label>
                      <input
                        type="text"
                        value={newUserName}
                        onChange={(e) => setNewUserName(e.target.value)}
                        placeholder="Fulde navn"
                        className="w-full bg-battle-grey border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-battle-orange"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Email *</label>
                      <input
                        type="email"
                        value={newUserEmail}
                        onChange={(e) => setNewUserEmail(e.target.value)}
                        placeholder="email@example.com"
                        className="w-full bg-battle-grey border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-battle-orange"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Password *</label>
                      <input
                        type="password"
                        value={newUserPassword}
                        onChange={(e) => setNewUserPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-battle-grey border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-battle-orange"
                        required
                        minLength={6}
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Rolle *</label>
                      <select
                        value={newUserRole}
                        onChange={(e) => setNewUserRole(e.target.value as UserRole)}
                        className="w-full bg-battle-grey border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-battle-orange"
                      >
                        <option value="INSTRUCTOR">Instructor</option>
                        <option value="GAMEMASTER">Gamemaster</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-battle-orange hover:bg-battle-orange/80 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      Opret bruger
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddUser(false)}
                      className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm transition-colors"
                    >
                      Annuller
                    </button>
                  </div>
                </form>
              )}

              {/* Users List */}
              <div className="space-y-2">
                {users.map(user => (
                  <div
                    key={user.id}
                    className="bg-battle-black rounded-xl p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-battle-grey rounded-full flex items-center justify-center">
                          <Mail className="w-5 h-5 text-gray-400" />
                        </div>
                        <div>
                          {editingNameUserId === user.id ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={newNameValue}
                                onChange={(e) => setNewNameValue(e.target.value)}
                                className="bg-battle-grey border border-white/20 rounded px-2 py-1 text-white text-sm focus:outline-none focus:border-battle-orange"
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleUpdateName(user.id);
                                  if (e.key === 'Escape') setEditingNameUserId(null);
                                }}
                              />
                              <button
                                onClick={() => handleUpdateName(user.id)}
                                className="p-1 text-green-500 hover:bg-green-500/10 rounded"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setEditingNameUserId(null)}
                                className="p-1 text-gray-500 hover:bg-white/10 rounded"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-white">{user.name || user.email}</p>
                              <button
                                onClick={() => handleOpenNameEdit(user.id, user.name || '')}
                                className="p-1 text-gray-500 hover:text-battle-orange hover:bg-battle-orange/10 rounded transition-colors"
                                title="Rediger navn"
                              >
                                <Pencil className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                      {/* Last Login */}
                      {user.last_login && (
                        <div className="text-right hidden md:block">
                          <p className="text-xs text-gray-500">Seneste login</p>
                          <p className="text-sm text-gray-400">{formatDate(user.last_login)}</p>
                        </div>
                      )}

                      {/* Role Selector */}
                      <div className="relative">
                        <select
                          value={user.role}
                          onChange={(e) => handleUpdateRole(user.id, user.email, e.target.value as UserRole)}
                          className={`appearance-none px-3 py-1.5 pr-8 rounded-lg text-sm font-medium border cursor-pointer focus:outline-none ${getRoleBadgeColor(user.role)}`}
                        >
                          <option value="INSTRUCTOR">Instructor</option>
                          <option value="GAMEMASTER">Gamemaster</option>
                          <option value="ADMIN">Admin</option>
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" />
                      </div>

                      {/* Password Edit Button */}
                      <button
                        onClick={() => handleOpenPasswordEdit(user.id, user.email)}
                        className="p-2 text-gray-500 hover:text-battle-orange hover:bg-battle-orange/10 rounded-lg transition-colors"
                        title="Skift password"
                      >
                        <KeyRound className="w-4 h-4" />
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={() => handleDeleteUser(user.id, user.email)}
                        className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Slet bruger"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      </div>
                    </div>

                    {/* Password Edit Form - shown inline when editing this user */}
                    {editingPasswordUserId === user.id && (
                      <form onSubmit={handleUpdatePassword} className="w-full mt-3 pt-3 border-t border-white/10">
                        <div className="flex items-center gap-3">
                          <input
                            type="password"
                            value={newPasswordValue}
                            onChange={(e) => setNewPasswordValue(e.target.value)}
                            placeholder="Nyt password (min. 6 tegn)"
                            className="flex-1 bg-battle-grey border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-battle-orange"
                            autoFocus
                            minLength={6}
                          />
                          <button
                            type="submit"
                            className="px-4 py-2 bg-battle-orange hover:bg-battle-orange/80 text-white rounded-lg text-sm font-medium transition-colors"
                          >
                            Gem
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingPasswordUserId(null);
                              setNewPasswordValue('');
                            }}
                            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm transition-colors"
                          >
                            Annuller
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                ))}

                {users.length === 0 && (
                  <p className="text-center text-gray-500 py-8">Ingen brugere fundet</p>
                )}
              </div>
            </div>
          ) : activeTab === 'permissions' ? (
            /* Permissions Matrix */
            <div className="space-y-4">
              <div className="bg-battle-black rounded-xl p-4">
                <h3 className="text-lg font-bold text-white mb-2">Adgangsrettigheder pr. rolle</h3>
                <p className="text-sm text-gray-400 mb-4">Klik på ikonerne for at ændre adgang.</p>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Sektion</th>
                        <th className="text-center py-3 px-4 text-blue-400 font-medium">Instructor</th>
                        <th className="text-center py-3 px-4 text-purple-400 font-medium">Gamemaster</th>
                        <th className="text-center py-3 px-4 text-red-400 font-medium">Admin</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Landing Page */}
                      <tr className="border-b border-white/5 bg-white/5">
                        <td colSpan={4} className="py-2 px-4 text-battle-orange font-bold text-sm">FORSIDE</td>
                      </tr>
                      <tr className="border-b border-white/5 hover:bg-white/5">
                        <td className="py-2 px-4 text-white">ControlCenter</td>
                        <PermissionCell role="INSTRUCTOR" permKey="landing_controlcenter" />
                        <PermissionCell role="GAMEMASTER" permKey="landing_controlcenter" />
                        <PermissionCell role="ADMIN" permKey="landing_controlcenter" />
                      </tr>
                      <tr className="border-b border-white/5 hover:bg-white/5">
                        <td className="py-2 px-4 text-white">Office</td>
                        <PermissionCell role="INSTRUCTOR" permKey="landing_office" />
                        <PermissionCell role="GAMEMASTER" permKey="landing_office" />
                        <PermissionCell role="ADMIN" permKey="landing_office" />
                      </tr>
                      <tr className="border-b border-white/5 hover:bg-white/5">
                        <td className="py-2 px-4 text-white">Activities</td>
                        <PermissionCell role="INSTRUCTOR" permKey="landing_activities" />
                        <PermissionCell role="GAMEMASTER" permKey="landing_activities" />
                        <PermissionCell role="ADMIN" permKey="landing_activities" />
                      </tr>
                      <tr className="border-b border-white/5 hover:bg-white/5">
                        <td className="py-2 px-4 text-white">Admin</td>
                        <PermissionCell role="INSTRUCTOR" permKey="landing_admin" />
                        <PermissionCell role="GAMEMASTER" permKey="landing_admin" />
                        <PermissionCell role="ADMIN" permKey="landing_admin" locked />
                      </tr>

                      {/* Office Section */}
                      <tr className="border-b border-white/5 bg-white/5">
                        <td colSpan={4} className="py-2 px-4 text-battle-orange font-bold text-sm">OFFICE</td>
                      </tr>
                      <tr className="border-b border-white/5 hover:bg-white/5">
                        <td className="py-2 px-4 text-white pl-8">CrewControlCenter</td>
                        <PermissionCell role="INSTRUCTOR" permKey="office_crewcontrolcenter" />
                        <PermissionCell role="GAMEMASTER" permKey="office_crewcontrolcenter" />
                        <PermissionCell role="ADMIN" permKey="office_crewcontrolcenter" />
                      </tr>
                      <tr className="border-b border-white/5 hover:bg-white/5">
                        <td className="py-2 px-4 text-white pl-8">Office Tools</td>
                        <PermissionCell role="INSTRUCTOR" permKey="office_office" />
                        <PermissionCell role="GAMEMASTER" permKey="office_office" />
                        <PermissionCell role="ADMIN" permKey="office_office" />
                      </tr>
                      <tr className="border-b border-white/5 hover:bg-white/5">
                        <td className="py-2 px-4 text-white pl-8">Economy (E-conomics, Bank)</td>
                        <PermissionCell role="INSTRUCTOR" permKey="office_economy" />
                        <PermissionCell role="GAMEMASTER" permKey="office_economy" />
                        <PermissionCell role="ADMIN" permKey="office_economy" />
                      </tr>
                      <tr className="border-b border-white/5 hover:bg-white/5">
                        <td className="py-2 px-4 text-white pl-8">Google Tools</td>
                        <PermissionCell role="INSTRUCTOR" permKey="office_googletools" />
                        <PermissionCell role="GAMEMASTER" permKey="office_googletools" />
                        <PermissionCell role="ADMIN" permKey="office_googletools" />
                      </tr>

                      {/* Admin Section */}
                      <tr className="border-b border-white/5 bg-white/5">
                        <td colSpan={4} className="py-2 px-4 text-battle-orange font-bold text-sm">ADMIN</td>
                      </tr>
                      <tr className="border-b border-white/5 hover:bg-white/5">
                        <td className="py-2 px-4 text-white pl-8">CODE (Development)</td>
                        <PermissionCell role="INSTRUCTOR" permKey="admin_code" />
                        <PermissionCell role="GAMEMASTER" permKey="admin_code" />
                        <PermissionCell role="ADMIN" permKey="admin_code" />
                      </tr>
                      <tr className="border-b border-white/5 hover:bg-white/5">
                        <td className="py-2 px-4 text-white pl-8">USERS (Brugerstyring)</td>
                        <PermissionCell role="INSTRUCTOR" permKey="admin_users" />
                        <PermissionCell role="GAMEMASTER" permKey="admin_users" />
                        <PermissionCell role="ADMIN" permKey="admin_users" locked />
                      </tr>

                      {/* Activities */}
                      <tr className="border-b border-white/5 bg-white/5">
                        <td colSpan={4} className="py-2 px-4 text-battle-orange font-bold text-sm">ACTIVITIES</td>
                      </tr>
                      {[
                        { key: 'activity_teamplay', name: 'TeamPlay' },
                        { key: 'activity_teamchallenge', name: 'TeamChallenge' },
                        { key: 'activity_teamtaste', name: 'TeamTaste' },
                        { key: 'activity_teamlazer', name: 'TeamLazer' },
                        { key: 'activity_teamrobin', name: 'TeamRobin' },
                        { key: 'activity_teamsegway', name: 'TeamSegway' },
                        { key: 'activity_teamconnect', name: 'TeamConnect' },
                        { key: 'activity_teambox', name: 'TeamBox' },
                        { key: 'activity_teamcontrol', name: 'TeamControl' },
                        { key: 'activity_teamaction', name: 'TeamAction' },
                        { key: 'activity_teamconstruct', name: 'TeamConstruct' }
                      ].map((activity) => (
                        <tr key={activity.key} className="border-b border-white/5 hover:bg-white/5">
                          <td className="py-2 px-4 pl-8">
                            <button
                              onClick={() => setSelectedActivity(activity)}
                              className="text-white hover:text-battle-orange transition-colors text-left"
                              title="Klik for at administrere instruktør-adgang"
                            >
                              {activity.name}
                            </button>
                          </td>
                          {/* Instructor - Yellow warning, clickable */}
                          <td className="text-center py-2 px-4">
                            <button
                              onClick={() => setSelectedActivity(activity)}
                              className="p-1 rounded cursor-pointer hover:bg-white/10 hover:scale-110 transition-all"
                              title="Klik for at administrere instruktør-adgang"
                            >
                              <AlertTriangle className={`w-5 h-5 mx-auto ${
                                hasAnyInstructorAccess(activity.key) ? 'text-yellow-500' : 'text-yellow-500/50'
                              }`} />
                            </button>
                          </td>
                          {/* Gamemaster - Always green */}
                          <td className="text-center py-2 px-4">
                            <Check className="w-5 h-5 text-green-500 mx-auto" />
                          </td>
                          {/* Admin - Always green */}
                          <td className="text-center py-2 px-4">
                            <Check className="w-5 h-5 text-green-500 mx-auto" />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-6 p-4 bg-battle-grey/50 rounded-lg">
                  <h4 className="font-medium text-white mb-2">Rollebeskrivelser:</h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-blue-400 font-medium">Instructor:</span> <span className="text-gray-400">Basis adgang til aktiviteter og ControlCenter</span></p>
                    <p><span className="text-purple-400 font-medium">Gamemaster:</span> <span className="text-gray-400">Udvidet adgang inkl. Office funktioner</span></p>
                    <p><span className="text-red-400 font-medium">Admin:</span> <span className="text-gray-400">Fuld adgang til alle funktioner inkl. brugerstyring</span></p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Activity Logs */
            <div className="space-y-4">
              {/* Filters */}
              <div className="bg-battle-black rounded-xl p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* User Filter */}
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Bruger</label>
                    <select
                      value={filterUser}
                      onChange={(e) => setFilterUser(e.target.value)}
                      className="w-full bg-battle-grey border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-battle-orange"
                    >
                      <option value="">Alle brugere</option>
                      {users.map(user => (
                        <option key={user.id} value={user.email}>{user.name || user.email}</option>
                      ))}
                    </select>
                  </div>

                  {/* Action Filter */}
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Hændelse</label>
                    <select
                      value={filterAction}
                      onChange={(e) => setFilterAction(e.target.value)}
                      className="w-full bg-battle-grey border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-battle-orange"
                    >
                      <option value="">Alle hændelser</option>
                      {uniqueActions.map(action => (
                        <option key={action} value={action}>{getActionLabel(action)}</option>
                      ))}
                    </select>
                  </div>

                  {/* Date Filter */}
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Dato</label>
                    <input
                      type="date"
                      value={filterDate}
                      onChange={(e) => setFilterDate(e.target.value)}
                      className="w-full bg-battle-grey border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-battle-orange"
                    />
                  </div>
                </div>

                {/* Clear Filters Button */}
                {(filterUser || filterAction || filterDate) && (
                  <button
                    onClick={() => {
                      setFilterUser('');
                      setFilterAction('');
                      setFilterDate('');
                    }}
                    className="mt-3 text-sm text-battle-orange hover:text-battle-orangeLight"
                  >
                    Ryd filtre
                  </button>
                )}
              </div>

              {/* Results Count */}
              <p className="text-sm text-gray-500">
                Viser {filteredLogs.length} af {activityLogs.length} hændelser
              </p>

              {/* Log List */}
              <div className="space-y-2">
                {filteredLogs.map((log, index) => (
                  <div
                    key={log.id || index}
                    className="flex items-start gap-4 bg-battle-black rounded-xl p-4"
                  >
                    <div className="w-10 h-10 bg-battle-grey rounded-full flex items-center justify-center flex-shrink-0">
                      <Activity className="w-5 h-5 text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-white">{getUserNameByEmail(log.user_email)}</span>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          log.action === 'LOGIN' ? 'bg-green-500/20 text-green-400' :
                          log.action === 'LOGOUT' ? 'bg-yellow-500/20 text-yellow-400' :
                          log.action === 'PAGE_VISIT' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-purple-500/20 text-purple-400'
                        }`}>
                          {getActionLabel(log.action)}
                        </span>
                      </div>
                      {log.page && <p className="text-sm text-gray-400">Side: {getPageLabel(log.page)}</p>}
                      {log.details && <p className="text-sm text-gray-500">{log.details}</p>}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs text-gray-500">{formatDate(log.timestamp)}</p>
                    </div>
                  </div>
                ))}

                {filteredLogs.length === 0 && (
                  <p className="text-center text-gray-500 py-8">
                    {activityLogs.length === 0 ? 'Ingen aktivitet registreret' : 'Ingen resultater matcher filtrene'}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Instructor Activity Access Modal */}
      {selectedActivity && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedActivity(null)} />
          <div className="relative bg-battle-grey border border-battle-orange/30 rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div>
                <h3 className="text-lg font-bold text-white">{selectedActivity.name}</h3>
                <p className="text-sm text-gray-400">INSTRUKTØR ADGANG</p>
              </div>
              <button onClick={() => setSelectedActivity(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {instructors.length === 0 ? (
                <p className="text-center text-gray-500 py-8">Ingen instruktører fundet</p>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs text-gray-500 mb-4">
                    Vælg hvilke instruktører der har adgang til {selectedActivity.name}
                  </p>
                  {instructors.map(instructor => {
                    const hasAccess = instructorHasAccess(selectedActivity.key, instructor.email);
                    return (
                      <div
                        key={instructor.id}
                        className="flex items-center justify-between bg-battle-black rounded-lg p-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-battle-grey rounded-full flex items-center justify-center">
                            <Mail className="w-4 h-4 text-gray-400" />
                          </div>
                          <div>
                            <p className="font-medium text-white text-sm">{instructor.name || instructor.email}</p>
                            <p className="text-xs text-gray-500">{instructor.email}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => toggleUserActivityPermission(selectedActivity.key, instructor.email)}
                          className={`p-2 rounded-lg transition-all ${
                            hasAccess
                              ? 'bg-green-500/20 text-green-500 hover:bg-green-500/30'
                              : 'bg-white/5 text-gray-500 hover:bg-white/10'
                          }`}
                        >
                          {hasAccess ? (
                            <Check className="w-5 h-5" />
                          ) : (
                            <X className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-white/10 bg-battle-black/50">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <AlertTriangle className="w-4 h-4 text-yellow-500" />
                <span>Gamemaster og Admin har altid adgang</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersManagement;
