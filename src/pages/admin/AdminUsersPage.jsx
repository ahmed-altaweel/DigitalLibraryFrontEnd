import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Users, 
  ShieldCheck, 
  UserX, 
  Search, 
  ShieldAlert, 
  UserCog, 
  Check, 
  Calendar 
} from 'lucide-react';
import { adminApi } from '../../services/api.js';
import { useTranslation } from '../../i18n/index.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import Table from '../../components/common/Table/Table.jsx';
import Button from '../../components/common/Button/Button.jsx';
import Badge from '../../components/common/Badge/Badge.jsx';
import Input from '../../components/common/Input/Input.jsx';
import Modal from '../../components/common/Modal/Modal.jsx';
import ConfirmDialog from '../../components/common/ConfirmDialog/ConfirmDialog.jsx';
import Avatar from '../../components/common/Avatar/Avatar.jsx';
import Pagination from '../../components/common/Pagination/Pagination.jsx';
import styles from './AdminUsersPage.module.css';

export default function AdminUsersPage() {
  const { t, language } = useTranslation();
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const pageSize = 20;
  const [searchTerm, setSearchTerm] = useState('');

  // Modals state
  const [editingUser, setEditingUser] = useState(null);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [deactivateId, setDeactivateId] = useState(null);

  // Fetch users
  const { data: users = [], isLoading, error, refetch } = useQuery({
    queryKey: ['admin-users', { page, size: pageSize, search: searchTerm }],
    queryFn: () => adminApi.getUsers({
      page,
      size: pageSize,
      search: searchTerm.trim() || undefined,
    }),
  });

  // Update roles mutation
  const updateRolesMutation = useMutation({
    mutationFn: ({ userId, roles }) => adminApi.updateUserRoles(userId, roles),
    onSuccess: () => {
      showToast(language === 'ar' ? 'تم تحديث أدوار وصلاحيات المستخدم' : 'User roles updated successfully', 'success');
      closeRoleModal();
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: (err) => {
      showToast(err.message, 'error');
    }
  });

  // Deactivate user mutation
  const deactivateMutation = useMutation({
    mutationFn: (userId) => adminApi.deactivateUser(userId),
    onSuccess: () => {
      showToast(language === 'ar' ? 'تم تعطيل حساب المستخدم' : 'User account deactivated', 'info');
      setDeactivateId(null);
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: (err) => {
      showToast(err.message, 'error');
    }
  });

  const openRoleModal = (u) => {
    setEditingUser(u);
    setSelectedRoles(u.roles || ['member']);
  };

  const closeRoleModal = () => {
    setEditingUser(null);
    setSelectedRoles([]);
  };

  const toggleRole = (role) => {
    setSelectedRoles((prev) => 
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };

  const handleSaveRoles = () => {
    if (!editingUser) return;
    if (selectedRoles.length === 0) {
      showToast(language === 'ar' ? 'يجب تعيين دور واحد على الأقل للمستخدم' : 'User must have at least one role', 'error');
      return;
    }
    updateRolesMutation.mutate({ userId: editingUser.id, roles: selectedRoles });
  };

  const availableRoles = [
    {
      id: 'admin',
      name: language === 'ar' ? 'مسؤول النظام (Admin)' : 'Administrator',
      desc: language === 'ar' ? 'كامل الصلاحيات لإدارة المستخدمين، الفهرس، والأمان.' : 'Full access to users, catalog, system configuration, and audit logs.',
    },
    {
      id: 'editor',
      name: language === 'ar' ? 'محرر وقيم علمي (Editor)' : 'Curator & Editor',
      desc: language === 'ar' ? 'صلاحيات إضافة وتعديل ونشر الأوعية والموافقة على المقترحات.' : 'Can create, edit, publish materials, and review catalog suggestions.',
    },
    {
      id: 'member',
      name: language === 'ar' ? 'باحث ومستخدم (Member)' : 'Researcher & Reader',
      desc: language === 'ar' ? 'صلاحيات القراءة، تدوين الهوامش، وتقديم المقترحات.' : 'Standard academic reader account with library and notes features.',
    },
  ];

  const columns = [
    {
      key: 'username',
      label: language === 'ar' ? 'المستخدم' : 'User',
      render: (_, row) => (
        <div className={styles.userCell}>
          <Avatar name={row.username} size="sm" />
          <div>
            <div className={styles.username}>{row.username}</div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>{row.email}</div>
          </div>
        </div>
      )
    },
    {
      key: 'roles',
      label: t('admin.roles'),
      render: (roles) => (
        <div className={styles.roleTags}>
          {roles && roles.length > 0 ? (
            roles.map((r) => {
              const variant = r === 'admin' ? 'danger' : r === 'editor' ? 'warning' : 'secondary';
              return <Badge key={r} variant={variant}>{r}</Badge>;
            })
          ) : (
            <Badge variant="secondary">member</Badge>
          )}
        </div>
      )
    },
    {
      key: 'is_active',
      label: t('common.status'),
      render: (isActive) => (
        <Badge variant={isActive ? 'success' : 'default'}>
          {isActive 
            ? (language === 'ar' ? 'نشط' : 'Active') 
            : (language === 'ar' ? 'معطل' : 'Deactivated')}
        </Badge>
      )
    },
    {
      key: 'created_at',
      label: language === 'ar' ? 'تاريخ الانضمام' : 'Joined',
      render: (v) => v ? new Date(v).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US') : '—'
    },
    {
      key: 'actions',
      label: t('common.actions'),
      render: (_, row) => (
        <div className={styles.actionButtons}>
          <Button 
            size="sm" 
            variant="outline" 
            iconLeft={<UserCog size={14} />} 
            onClick={() => openRoleModal(row)}
            title={language === 'ar' ? 'تعديل الأدوار' : 'Edit Roles'}
          >
            {language === 'ar' ? 'الأدوار' : 'Roles'}
          </Button>

          {row.is_active && (
            <Button 
              size="sm" 
              variant="danger" 
              iconLeft={<UserX size={14} />} 
              onClick={() => setDeactivateId(row.id)}
              title={language === 'ar' ? 'تعطيل الحساب' : 'Deactivate'}
            >
              {language === 'ar' ? 'تعطيل' : 'Deactivate'}
            </Button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <h1>{t('admin.usersManage')}</h1>
          <p>{language === 'ar' ? 'إدارة حسابات الباحثين والمحررين وتوزيع الصلاحيات' : 'Manage scholar accounts, access roles, and activation status'}</p>
        </div>
      </header>

      <div className={styles.searchBar}>
        <Input 
          placeholder={language === 'ar' ? 'بحث باسم المستخدم أو البريد...' : 'Search by username or email...'}
          value={searchTerm}
          onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
          icon={<Search size={18} />}
        />
      </div>

      {error ? (
        <div style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
          <p style={{ color: 'var(--color-error)', marginBottom: 'var(--space-4)' }}>
            {t('common.error')}: {error.message}
          </p>
          <Button variant="outline" onClick={() => refetch()}>{t('common.retry')}</Button>
        </div>
      ) : (
        <Table 
          columns={columns} 
          data={users} 
          loading={isLoading} 
          emptyMessage={language === 'ar' ? 'لا يوجد مستخدمون مطابقون للبحث' : 'No users match criteria'}
        />
      )}

      {/* Role Assignment Modal */}
      <Modal
        isOpen={Boolean(editingUser)}
        onClose={closeRoleModal}
        title={language === 'ar' ? `تعديل صلاحيات: ${editingUser?.username}` : `Edit Roles for: ${editingUser?.username}`}
        footer={
          <>
            <Button variant="ghost" onClick={closeRoleModal}>{t('common.cancel')}</Button>
            <Button 
              onClick={handleSaveRoles} 
              loading={updateRolesMutation.isPending}
            >
              {t('common.save')}
            </Button>
          </>
        }
      >
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', margin: 0 }}>
          {language === 'ar' 
            ? 'حدد الأدوار المناسبة لهذا الحساب. تمنح الأدوار صلاحيات فورية في النظام.' 
            : 'Select the roles assigned to this scholar. Changes take effect on next request.'}
        </p>

        <div className={styles.roleCheckboxList}>
          {availableRoles.map((role) => {
            const isChecked = selectedRoles.includes(role.id);
            return (
              <label 
                key={role.id} 
                className={styles.roleItem}
                style={{ borderColor: isChecked ? 'var(--color-primary)' : undefined }}
              >
                <input 
                  type="checkbox" 
                  checked={isChecked}
                  onChange={() => toggleRole(role.id)}
                  style={{ marginBlockStart: '4px' }}
                />
                <div>
                  <strong style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text)' }}>{role.name}</strong>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', marginBlockStart: '2px' }}>
                    {role.desc}
                  </div>
                </div>
              </label>
            );
          })}
        </div>
      </Modal>

      {/* Deactivate User Confirm Dialog */}
      <ConfirmDialog 
        isOpen={Boolean(deactivateId)}
        title={language === 'ar' ? 'تعطيل حساب مستخدم' : 'Deactivate User'}
        message={language === 'ar' 
          ? 'هل أنت متأكد من رغبتك في تعطيل هذا الحساب؟ لن يتمكن المستخدم من تسجيل الدخول حتى إعادة تفعيله.' 
          : 'Are you sure you want to deactivate this account? The user will not be able to sign in.'}
        confirmText={language === 'ar' ? 'تعطيل الحساب' : 'Deactivate'}
        cancelText={t('common.cancel')}
        onConfirm={() => deactivateId && deactivateMutation.mutate(deactivateId)}
        onCancel={() => setDeactivateId(null)}
      />
    </div>
  );
}
