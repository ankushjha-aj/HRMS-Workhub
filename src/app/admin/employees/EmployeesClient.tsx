'use client';

import React, { useState, useEffect } from 'react';
import { addUser, deleteUser, updateUser, resetPassword } from '../../actions/userActions';
import { GlobalLoader } from '../../../components/GlobalLoader';

type User = {
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: Date;
};

export default function EmployeesClient({ initialEmployees }: { initialEmployees: User[] }) {
    const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
    const [emailPrefix, setEmailPrefix] = useState('');

    // Feature State
    const [isLoading, setIsLoading] = useState(false);
    const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    // Filtering State
    const [filterRole, setFilterRole] = useState<'all' | 'admin' | 'employee'>('all');
    const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);

    // Filtered Employees
    const filteredEmployees = initialEmployees.filter(user => {
        if (filterRole === 'all') return true;
        return user.role === filterRole;
    });

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (activeDropdownId && !(event.target as Element).closest('.dropdown-container')) {
                setActiveDropdownId(null);
            }
            if (isFilterDropdownOpen && !(event.target as Element).closest('.filter-dropdown-container')) {
                setIsFilterDropdownOpen(false);
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [activeDropdownId, isFilterDropdownOpen]);

    const handleEditClick = (user: User) => {
        setSelectedUser(user);
        setIsEditModalOpen(true);
        setActiveDropdownId(null);
    };

    const handleResetPasswordClick = (user: User) => {
        setSelectedUser(user);
        setIsResetPasswordModalOpen(true);
        setActiveDropdownId(null);
    };

    const handleDeleteClick = (user: User) => {
        setSelectedUser(user);
        setIsDeleteModalOpen(true);
        setActiveDropdownId(null);
    };

    return (
        <>
            {isLoading && <GlobalLoader />}

            <div className="bg-white dark:bg-admin-surface-dark rounded-xl border border-admin-border-light dark:border-admin-border-dark shadow-sm overflow-hidden p-6 pb-24">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3 relative filter-dropdown-container">
                        <h3 className="text-slate-900 dark:text-white text-lg font-bold">All Employees</h3>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsFilterDropdownOpen(!isFilterDropdownOpen);
                            }}
                            className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                        >
                            {filterRole === 'all' ? 'All Roles' : filterRole === 'admin' ? 'Admins Only' : 'Employees Only'}
                            <span className="material-symbols-outlined text-[16px]">expand_more</span>
                        </button>

                        {isFilterDropdownOpen && (
                            <div className="absolute top-full left-0 mt-2 w-40 bg-white dark:bg-[#1e232e] rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 z-[101] overflow-hidden animate-in fade-in zoom-in-95 duration-100 origin-top-left">
                                <button
                                    onClick={() => { setFilterRole('all'); setIsFilterDropdownOpen(false); }}
                                    className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${filterRole === 'all' ? 'text-blue-600 font-semibold bg-blue-50 dark:bg-blue-900/10' : 'text-slate-600 dark:text-slate-300'}`}
                                >
                                    All Roles
                                </button>
                                <button
                                    onClick={() => { setFilterRole('employee'); setIsFilterDropdownOpen(false); }}
                                    className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${filterRole === 'employee' ? 'text-blue-600 font-semibold bg-blue-50 dark:bg-blue-900/10' : 'text-slate-600 dark:text-slate-300'}`}
                                >
                                    Employees Only
                                </button>
                                <button
                                    onClick={() => { setFilterRole('admin'); setIsFilterDropdownOpen(false); }}
                                    className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${filterRole === 'admin' ? 'text-blue-600 font-semibold bg-blue-50 dark:bg-blue-900/10' : 'text-slate-600 dark:text-slate-300'}`}
                                >
                                    Admins Only
                                </button>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={() => setIsAddUserModalOpen(true)}
                        className="flex items-center gap-2 bg-admin-primary hover:bg-admin-primary-hover text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                        <span className="material-symbols-outlined text-[18px]">add</span>
                        Add New Employee
                    </button>
                </div>

                <div className="overflow-x-visible min-h-[400px]">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-[#161a23] border-b border-admin-border-light dark:border-admin-border-dark text-xs uppercase tracking-wider text-slate-500 dark:text-[#9da6b8]">
                                <th className="px-6 py-4 font-semibold">Name</th>
                                <th className="px-6 py-4 font-semibold">Email</th>
                                <th className="px-6 py-4 font-semibold">Role</th>
                                <th className="px-6 py-4 font-semibold">Joined</th>
                                <th className="px-6 py-4 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-admin-border-light dark:divide-admin-border-dark">
                            {filteredEmployees.length === 0 ? (
                                <tr className="group hover:bg-slate-50 dark:hover:bg-[#252b38] transition-colors cursor-pointer">
                                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500 dark:text-[#9da6b8] italic">
                                        No employees found matching filter.
                                    </td>
                                </tr>
                            ) : (
                                filteredEmployees.map((user) => (
                                    <tr key={user.id} className="group hover:bg-slate-50 dark:hover:bg-[#252b38] transition-colors">
                                        <td className="px-6 py-4 text-slate-900 dark:text-white font-medium">{user.name}</td>
                                        <td className="px-6 py-4 text-slate-500 dark:text-[#9da6b8]">{user.email}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-xs font-semibold ${user.role === 'admin' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'} uppercase`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-500 dark:text-[#9da6b8] text-sm">
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right relative dropdown-container">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setActiveDropdownId(activeDropdownId === user.id ? null : user.id);
                                                }}
                                                className={`text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-all ${activeDropdownId === user.id ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-200' : ''}`}
                                            >
                                                <span className="material-symbols-outlined text-[20px]">more_vert</span>
                                            </button>

                                            {/* Dropdown Menu */}
                                            {activeDropdownId === user.id && (
                                                <div className="absolute right-8 top-8 w-48 bg-white dark:bg-[#1e232e] rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.2)] border border-gray-100 dark:border-gray-700 z-[100] overflow-hidden animate-in fade-in zoom-in-95 duration-100 origin-top-right">
                                                    <div className="p-1">
                                                        <button
                                                            onClick={() => handleEditClick(user)}
                                                            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors text-left"
                                                        >
                                                            <span className="material-symbols-outlined text-[18px] text-gray-400">edit</span>
                                                            Edit Details
                                                        </button>
                                                        <button
                                                            onClick={() => handleResetPasswordClick(user)}
                                                            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors text-left"
                                                        >
                                                            <span className="material-symbols-outlined text-[18px] text-gray-400">lock_reset</span>
                                                            Reset Password
                                                        </button>
                                                        <div className="h-px bg-gray-100 dark:bg-gray-700 my-1"></div>
                                                        <button
                                                            onClick={() => handleDeleteClick(user)}
                                                            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors text-left"
                                                        >
                                                            <span className="material-symbols-outlined text-[18px]">delete</span>
                                                            Delete User
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Add User Modal */}
                {isAddUserModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <div className="bg-white dark:bg-[#1e232e] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-800">
                            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                                <h3 className="font-bold text-lg text-gray-900 dark:text-white">Add New Employee</h3>
                                <button onClick={() => setIsAddUserModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>
                            <div className="p-6">
                                <form action={async (formData) => {
                                    setIsLoading(true);
                                    try {
                                        const email = `${emailPrefix}@opsbeetech.com`;
                                        formData.set('email', email);

                                        const result = await addUser(null, formData);
                                        if (result?.success) {
                                            setIsAddUserModalOpen(false);
                                            setEmailPrefix('');
                                            alert('User created successfully!');
                                            window.location.reload();
                                        } else {
                                            alert(result?.error || 'Failed to add user');
                                        }
                                    } finally {
                                        setIsLoading(false);
                                    }
                                }} className="flex flex-col gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5 ml-1">Full Name</label>
                                        <input name="name" type="text" placeholder="e.g. John Doe" required className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-[#252b36] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5 ml-1">Email Address</label>
                                        <div className="flex items-center rounded-lg bg-gray-50 dark:bg-[#252b36] border border-gray-200 dark:border-gray-700 focus-within:ring-2 focus-within:ring-blue-500 transition-all overflow-hidden">
                                            <input
                                                name="email_prefix"
                                                type="text"
                                                value={emailPrefix}
                                                onChange={(e) => setEmailPrefix(e.target.value)}
                                                placeholder="john"
                                                required
                                                className="flex-1 px-4 py-2.5 bg-transparent border-none text-gray-900 dark:text-white outline-none"
                                            />
                                            <span className="px-4 py-2.5 bg-gray-100 dark:bg-[#2f3642] text-gray-500 dark:text-gray-400 text-sm font-medium border-l border-gray-200 dark:border-gray-700">
                                                @opsbeetech.com
                                            </span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5 ml-1">Password</label>
                                        <input name="password" type="password" placeholder="••••••••" required className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-[#252b36] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5 ml-1">Role</label>
                                        <select name="role" className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-[#252b36] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none">
                                            <option value="employee">Employee</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </div>
                                    <div className="pt-4 flex gap-3">
                                        <button type="button" onClick={() => setIsAddUserModalOpen(false)} className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">Cancel</button>
                                        <button type="submit" className="flex-1 px-4 py-2.5 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all">Create Account</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {/* Edit User Modal */}
                {isEditModalOpen && selectedUser && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <div className="bg-white dark:bg-[#1e232e] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-800">
                            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                                <h3 className="font-bold text-lg text-gray-900 dark:text-white">Edit User Details</h3>
                                <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>
                            <div className="p-6">
                                <form action={async (formData) => {
                                    setIsLoading(true);
                                    try {
                                        const result = await updateUser(selectedUser.id, formData);
                                        if (result?.success) {
                                            setIsEditModalOpen(false);
                                            alert('User updated successfully!');
                                            window.location.reload();
                                        } else {
                                            alert(result?.error || 'Failed to update user');
                                        }
                                    } finally {
                                        setIsLoading(false);
                                    }
                                }} className="flex flex-col gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5 ml-1">Full Name</label>
                                        <input name="name" type="text" defaultValue={selectedUser.name} required className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-[#252b36] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5 ml-1">Email Address</label>
                                        <input name="email" type="email" defaultValue={selectedUser.email} required className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-[#252b36] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5 ml-1">Role</label>
                                        <select
                                            name="role"
                                            defaultValue={selectedUser.role}
                                            disabled={selectedUser.role === 'employee'}
                                            className={`w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-[#252b36] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none ${selectedUser.role === 'employee' ? 'opacity-50 cursor-not-allowed bg-gray-100 dark:bg-[#2f3642]' : ''}`}
                                        >
                                            <option value="employee">Employee</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                        {selectedUser.role === 'employee' && (
                                            <input type="hidden" name="role" value="employee" />
                                        )}
                                        {selectedUser.role === 'employee' && (
                                            <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                                                * Role promotion is restricted for employees.
                                            </p>
                                        )}
                                    </div>
                                    {selectedUser.role === 'employee' && (
                                        <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-900/30 rounded-lg p-3 text-xs text-yellow-800 dark:text-yellow-200">
                                            <strong>Note:</strong> Employees cannot be promoted to Admin from this interface.
                                        </div>
                                    )}
                                    <div className="pt-4 flex gap-3">
                                        <button type="button" onClick={() => setIsEditModalOpen(false)} className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">Cancel</button>
                                        <button type="submit" className="flex-1 px-4 py-2.5 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all">Save Changes</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {/* Reset Password Modal */}
                {isResetPasswordModalOpen && selectedUser && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <div className="bg-white dark:bg-[#1e232e] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-800">
                            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                                <h3 className="font-bold text-lg text-gray-900 dark:text-white">Reset Password</h3>
                                <button onClick={() => setIsResetPasswordModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>
                            <div className="p-6">
                                <form action={async (formData) => {
                                    setIsLoading(true);
                                    try {
                                        const result = await resetPassword(selectedUser.id, formData);
                                        if (result?.success) {
                                            setIsResetPasswordModalOpen(false);
                                            alert('Password reset successfully!');
                                            // No need to reload for password reset, but good practice to clear state
                                            setSelectedUser(null);
                                        } else {
                                            alert(result?.error || 'Failed to reset password');
                                        }
                                    } finally {
                                        setIsLoading(false);
                                    }
                                }} className="flex flex-col gap-4">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Enter a new password for <span className="font-semibold text-gray-900 dark:text-white">{selectedUser.name}</span>.
                                    </p>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5 ml-1">New Password</label>
                                        <input name="password" type="password" placeholder="••••••••" required minLength={6} className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-[#252b36] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                                    </div>
                                    <div className="pt-4 flex gap-3">
                                        <button type="button" onClick={() => setIsResetPasswordModalOpen(false)} className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">Cancel</button>
                                        <button type="submit" className="flex-1 px-4 py-2.5 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 shadow-lg shadow-indigo-500/30 transition-all">Reset Password</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                {isDeleteModalOpen && selectedUser && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <div className="bg-white dark:bg-[#1e232e] rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-800">
                            <div className="p-6 text-center">
                                <div className="size-14 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span className="material-symbols-outlined text-3xl">warning</span>
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Delete User?</h3>
                                <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
                                    Are you sure you want to permanently delete <span className="font-bold text-slate-900 dark:text-white">{selectedUser.name}</span>? This action cannot be undone.
                                </p>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setIsDeleteModalOpen(false)}
                                        className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={async () => {
                                            setIsLoading(true);
                                            try {
                                                const result = await deleteUser(selectedUser.id);
                                                if (result?.success) {
                                                    setIsDeleteModalOpen(false);
                                                    alert('User deleted successfully');
                                                    window.location.reload();
                                                } else {
                                                    alert(result?.error || 'Failed to delete user');
                                                }
                                            } finally {
                                                setIsLoading(false);
                                            }
                                        }}
                                        className="flex-1 px-4 py-2.5 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 shadow-lg shadow-red-500/30 transition-all"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
