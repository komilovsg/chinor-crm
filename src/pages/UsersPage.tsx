import { useCallback, useEffect, useState } from 'react'
import { Pencil, Plus, Trash2, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { getApiErrorMessage } from '@/api/client'
import { toast } from '@/lib/toast'
import {
  createUser,
  deleteUser,
  getUsers,
  updateUser,
} from '@/api/users'
import type { CreateUserRequest } from '@/api/users'
import { ResponsiveModal } from '@/components/ResponsiveModal'
import type { CrmUser } from '@/types'

const ROLE_LABELS: Record<string, string> = {
  admin: 'Администратор',
  hostess: 'Хостес',
  hostess_1: 'Хостес', // обратная совместимость до миграции
  hostess_2: 'Хостес',
}

/** Страница управления пользователями. Доступ: только admin. */
export function UsersPage() {
  const [list, setList] = useState<CrmUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editUser, setEditUser] = useState<CrmUser | null>(null)
  const [formEmail, setFormEmail] = useState('')
  const [formPassword, setFormPassword] = useState('')
  const [formRole, setFormRole] = useState<'admin' | 'hostess'>('hostess')
  const [formDisplayName, setFormDisplayName] = useState('')
  const [formSubmitting, setFormSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const users = await getUsers()
      setList(users)
    } catch (err) {
      const msg = getApiErrorMessage(err, 'Ошибка загрузки')
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const resetAddForm = () => {
    setFormEmail('')
    setFormPassword('')
    setFormRole('hostess')
    setFormDisplayName('')
    setFormError(null)
  }

  const resetEditForm = () => {
    setEditUser(null)
    setFormEmail('')
    setFormPassword('')
    setFormRole('hostess')
    setFormDisplayName('')
    setFormError(null)
  }

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formEmail.trim()) {
      setFormError('Email обязателен')
      return
    }
    if (!formPassword.trim()) {
      setFormError('Пароль обязателен')
      return
    }
    setFormSubmitting(true)
    setFormError(null)
    try {
      const body: CreateUserRequest = {
        email: formEmail.trim(),
        password: formPassword,
        role: formRole,
        display_name: formDisplayName.trim() || formEmail.trim(),
      }
      await createUser(body)
      setAddModalOpen(false)
      resetAddForm()
      loadData()
      toast.success('Пользователь создан')
    } catch (err) {
      const msg = getApiErrorMessage(err, 'Не удалось создать пользователя')
      setFormError(msg)
      toast.error(msg)
    } finally {
      setFormSubmitting(false)
    }
  }

  const handleEditClick = (user: CrmUser) => {
    setEditUser(user)
    setFormEmail(user.email)
    setFormPassword('')
    setFormRole(
      (['hostess_1', 'hostess_2'].includes(user.role as string) ? 'hostess' : user.role) as
        | 'admin'
        | 'hostess'
    )
    setFormDisplayName(user.display_name)
    setFormError(null)
    setEditModalOpen(true)
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editUser) return
    if (!formEmail.trim()) {
      setFormError('Email обязателен')
      return
    }
    setFormSubmitting(true)
    setFormError(null)
    try {
      await updateUser(editUser.id, {
        email: formEmail.trim(),
        role: formRole,
        display_name: formDisplayName.trim() || formEmail.trim(),
        ...(formPassword.trim() ? { password: formPassword } : {}),
      })
      setEditModalOpen(false)
      resetEditForm()
      loadData()
      toast.success('Пользователь обновлён')
    } catch (err) {
      const msg = getApiErrorMessage(err, 'Не удалось обновить пользователя')
      setFormError(msg)
      toast.error(msg)
    } finally {
      setFormSubmitting(false)
    }
  }

  const handleDelete = async (user: CrmUser) => {
    if (!confirm(`Удалить пользователя ${user.display_name} (${user.email})?`)) return
    try {
      await deleteUser(user.id)
      loadData()
      toast.success('Пользователь удалён')
    } catch (err) {
      const msg = getApiErrorMessage(err, 'Не удалось удалить')
      setError(msg)
      toast.error(msg)
    }
  }

  return (
    <div className="w-full p-4 sm:p-6 space-y-6 animate-in fade-in duration-300">
      <div className="sticky top-0 z-10 -mx-4 -mt-4 flex flex-col gap-4 bg-background px-4 pt-4 pb-4 sm:-mx-6 sm:px-6 sm:pt-6 sm:pb-4 border-b border-border">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Пользователи</h1>
            <p className="text-muted-foreground">
              Управление пользователями CRM: admin, хостесы.
            </p>
          </div>
          <Button
            className="min-w-[160px]"
            onClick={() => { setAddModalOpen(true); resetAddForm(); }}
          >
            <Plus className="h-4 w-4 shrink-0" />
            Добавить пользователя
          </Button>
        </div>
      </div>

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Список пользователей
          </CardTitle>
          <CardDescription>
            Администратор имеет полный доступ. Хостесы — гости, брони, посещения.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="w-full overflow-x-auto rounded-xl border border-border shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>EMAIL</TableHead>
                  <TableHead>ИМЯ</TableHead>
                  <TableHead>РОЛЬ</TableHead>
                  <TableHead className="w-24 text-right">ДЕЙСТВИЯ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                      Загрузка...
                    </TableCell>
                  </TableRow>
                ) : list.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                      Нет пользователей
                    </TableCell>
                  </TableRow>
                ) : (
                  list.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.email}</TableCell>
                      <TableCell>{user.display_name}</TableCell>
                      <TableCell>{ROLE_LABELS[user.role] ?? user.role}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            onClick={() => handleEditClick(user)}
                            title="Редактировать"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => handleDelete(user)}
                            title="Удалить"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <ResponsiveModal
        open={addModalOpen}
        onOpenChange={(open) => {
          setAddModalOpen(open)
          if (!open) resetAddForm()
        }}
        title="Добавить пользователя"
        description="Введите email, пароль, роль и имя."
      >
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="add-email">Email *</Label>
            <Input
              id="add-email"
              type="email"
              value={formEmail}
              onChange={(e) => setFormEmail(e.target.value)}
              placeholder="user@chinor.com"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="add-password">Пароль *</Label>
            <Input
              id="add-password"
              type="password"
              value={formPassword}
              onChange={(e) => setFormPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="new-password"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="add-role">Роль</Label>
            <select
              id="add-role"
              value={formRole}
              onChange={(e) => setFormRole(e.target.value as 'admin' | 'hostess')}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
            >
              <option value="admin">Администратор</option>
              <option value="hostess">Хостес</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="add-display">Отображаемое имя</Label>
            <Input
              id="add-display"
              value={formDisplayName}
              onChange={(e) => setFormDisplayName(e.target.value)}
              placeholder="Имя пользователя"
            />
          </div>
          {formError && (
            <p className="text-sm text-destructive" role="alert">
              {formError}
            </p>
          )}
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-2">
            <Button type="button" variant="outline" onClick={() => setAddModalOpen(false)}>
              Отмена
            </Button>
            <Button type="submit" disabled={formSubmitting}>
              {formSubmitting ? 'Создание...' : 'Создать'}
            </Button>
          </div>
        </form>
      </ResponsiveModal>

      <ResponsiveModal
        open={editModalOpen}
        onOpenChange={(open) => {
          setEditModalOpen(open)
          if (!open) resetEditForm()
        }}
        title="Редактировать пользователя"
        description="Измените данные пользователя."
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-email">Email *</Label>
            <Input
              id="edit-email"
              type="email"
              value={formEmail}
              onChange={(e) => setFormEmail(e.target.value)}
              placeholder="user@chinor.com"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-password">Новый пароль (оставьте пустым, чтобы не менять)</Label>
            <Input
              id="edit-password"
              type="password"
              value={formPassword}
              onChange={(e) => setFormPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-role">Роль</Label>
            <select
              id="edit-role"
              value={formRole}
              onChange={(e) => setFormRole(e.target.value as 'admin' | 'hostess')}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
            >
              <option value="admin">Администратор</option>
              <option value="hostess">Хостес</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-display">Отображаемое имя</Label>
            <Input
              id="edit-display"
              value={formDisplayName}
              onChange={(e) => setFormDisplayName(e.target.value)}
              placeholder="Имя пользователя"
            />
          </div>
          {formError && (
            <p className="text-sm text-destructive" role="alert">
              {formError}
            </p>
          )}
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-2">
            <Button type="button" variant="outline" onClick={() => setEditModalOpen(false)}>
              Отмена
            </Button>
            <Button type="submit" disabled={formSubmitting}>
              {formSubmitting ? 'Сохранение...' : 'Сохранить'}
            </Button>
          </div>
        </form>
      </ResponsiveModal>
    </div>
  )
}
