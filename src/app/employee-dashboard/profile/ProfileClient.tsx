'use client';

import React, { useState, useRef, useEffect } from 'react';
import { updateProfile } from '../../actions/profile';
import { useRouter } from 'next/navigation';

// --- Types ---
type WorkExperience = {
    id?: string;
    company: string;
    role: string;
    description: string | null;
    startDate: string | Date;
    endDate: string | Date | null;
};

type Education = {
    id?: string;
    level: string;
    institution: string;
    year: string;
    score: string | null;
};

type Certification = {
    id?: string;
    name: string;
    issuer: string;
    date: string | Date;
};

type Profile = {
    designation: string | null;
    department: string | null;
    phoneNumber: string | null;
    address: string | null;
    pincode: string | null;
    mapLocation: string | null;
    joiningDate: Date | null;
    dateOfBirth: Date | null;
    profileImage: string | null;

    guardianName: string | null;
    guardianDesignation: string | null;
    guardianPhone: string | null;
    guardianEmail: string | null;

    alternatePhone: string | null;
    alternateEmail: string | null;

    workExperiences: WorkExperience[];
    educations: Education[];
    certifications: Certification[];
} | null;

type User = {
    id: string;
    name: string;
    email: string;
    role: string;
};

// --- Helper Functions ---
const formatDateForInput = (date: Date | string | null | undefined) => {
    if (!date) return '';
    const d = new Date(date);
    return !isNaN(d.getTime()) ? d.toISOString().split('T')[0] : '';
};

const formatDateForDisplay = (date: Date | string | null | undefined) => {
    if (!date) return 'Not set';
    const d = new Date(date);
    return !isNaN(d.getTime()) ? d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Invalid Date';
};

// --- Main Component ---
export default function ProfileClient({ user, initialProfile }: { user: User; initialProfile: Profile }) {
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(!initialProfile);
    const [isLoading, setIsLoading] = useState(false);

    // Initial State Setup
    const [formData, setFormData] = useState({
        // User Basic Info (Editable)
        name: user.name,
        email: user.email,

        // Profile Info
        designation: initialProfile?.designation || '',
        department: initialProfile?.department || '',
        phoneNumber: initialProfile?.phoneNumber || '',
        address: initialProfile?.address || '',
        pincode: initialProfile?.pincode || '',
        mapLocation: initialProfile?.mapLocation || '',
        joiningDate: initialProfile?.joiningDate || '',
        dateOfBirth: initialProfile?.dateOfBirth || '',
        profileImage: initialProfile?.profileImage || '',

        // Guardian Info
        guardianName: initialProfile?.guardianName || '',
        guardianDesignation: initialProfile?.guardianDesignation || '',
        guardianPhone: initialProfile?.guardianPhone || '',
        guardianEmail: initialProfile?.guardianEmail || '',

        alternatePhone: initialProfile?.alternatePhone || '',
        alternateEmail: initialProfile?.alternateEmail || '',

        // Dynamic Lists
        workExperiences: initialProfile?.workExperiences || [] as WorkExperience[],
        educations: initialProfile?.educations || [] as Education[],
        certifications: initialProfile?.certifications || [] as Certification[]
    });

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Sync state if initialProfile changes (e.g. after save & refresh)
    useEffect(() => {
        if (initialProfile) {
            setFormData(prev => ({
                ...prev,
                designation: initialProfile.designation || '',
                department: initialProfile.department || '',
                phoneNumber: initialProfile.phoneNumber || '',
                address: initialProfile.address || '',
                pincode: initialProfile.pincode || '',
                mapLocation: initialProfile.mapLocation || '',
                joiningDate: initialProfile.joiningDate || '',
                dateOfBirth: initialProfile.dateOfBirth || '',
                profileImage: initialProfile.profileImage || '',
                guardianName: initialProfile.guardianName || '',
                guardianDesignation: initialProfile.guardianDesignation || '',
                guardianPhone: initialProfile.guardianPhone || '',
                guardianEmail: initialProfile.guardianEmail || '',
                alternatePhone: initialProfile.alternatePhone || '',
                alternateEmail: initialProfile.alternateEmail || '',
                workExperiences: initialProfile.workExperiences || [],
                educations: initialProfile.educations || [],
                certifications: initialProfile.certifications || []
            }));
        }
    }, [initialProfile]);

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleCancel = () => {
        setIsEditing(false);
        // Reset to initial
        setFormData(prev => ({
            ...prev,
            name: user.name,
            email: user.email,
        }));
        router.refresh();
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // --- Dynamic Section Handlers ---
    // Work Experience
    const addWorkExp = () => {
        if (formData.workExperiences.length >= 3) return;
        setFormData(prev => ({
            ...prev,
            workExperiences: [...prev.workExperiences, { company: '', role: '', description: '', startDate: '', endDate: null }]
        }));
    };
    const removeWorkExp = (index: number) => {
        setFormData(prev => ({
            ...prev,
            workExperiences: prev.workExperiences.filter((_, i) => i !== index)
        }));
    };
    const updateWorkExp = (index: number, field: keyof WorkExperience, value: any) => {
        const updated = [...formData.workExperiences];
        updated[index] = { ...updated[index], [field]: value };
        setFormData(prev => ({ ...prev, workExperiences: updated }));
    };

    // Education
    const addEducation = () => {
        setFormData(prev => ({
            ...prev,
            educations: [...prev.educations, { level: 'Graduation', institution: '', year: '', score: '' }]
        }));
    };
    const removeEducation = (index: number) => {
        setFormData(prev => ({
            ...prev,
            educations: prev.educations.filter((_, i) => i !== index)
        }));
    };
    const updateEducation = (index: number, field: keyof Education, value: any) => {
        const updated = [...formData.educations];
        updated[index] = { ...updated[index], [field]: value };
        setFormData(prev => ({ ...prev, educations: updated }));
    };

    // Certifications
    const addCertification = () => {
        setFormData(prev => ({
            ...prev,
            certifications: [...prev.certifications, { name: '', issuer: '', date: '' }]
        }));
    };
    const removeCertification = (index: number) => {
        setFormData(prev => ({
            ...prev,
            certifications: prev.certifications.filter((_, i) => i !== index)
        }));
    };
    const updateCertification = (index: number, field: keyof Certification, value: any) => {
        const updated = [...formData.certifications];
        updated[index] = { ...updated[index], [field]: value };
        setFormData(prev => ({ ...prev, certifications: updated }));
    };

    // --- Image Upload ---
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 1024 * 1024) { // 1MB limit
                alert("File size is too large. Max 1MB.");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, profileImage: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    // --- Submit ---
    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const hasHighSchool = formData.educations.some(e => e.level === 'High School');
        const hasSeniorSec = formData.educations.some(e => e.level === 'Senior Secondary');
        const hasGraduation = formData.educations.some(e => e.level === 'Graduation');

        if (!hasHighSchool || !hasSeniorSec || !hasGraduation) {
            alert("Please add at least High School, Senior Secondary, and Graduation details.");
            setIsLoading(false);
            return;
        }

        try {
            const result = await updateProfile(user.id, formData);
            if (result.success) {
                setIsEditing(false);
                router.refresh();
            } else {
                alert("Failed to update profile: " + result.error);
            }
        } catch (error) {
            console.error(error);
            alert("An error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    // --- Render Helpers ---
    const SectionHeader = ({ title, icon }: { title: string, icon: string }) => (
        <div className="flex items-center gap-2 mb-4 mt-8 pb-2 border-b border-slate-200 dark:border-slate-700">
            <span className="material-symbols-outlined text-employee-primary">{icon}</span>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">{title}</h3>
        </div>
    );

    // --- Styles ---
    const inputClasses = "w-full px-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-employee-primary/20 focus:border-employee-primary outline-none transition-all placeholder:font-normal placeholder:text-slate-400";
    const viewClasses = "w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm font-medium";

    return (
        <div className="p-4 md:p-8 max-w-[1600px] mx-auto pb-20">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Profile</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage your personal information</p>
                </div>
                {!isEditing && (
                    <button onClick={handleEdit} className="flex items-center gap-2 px-4 py-2 bg-employee-primary text-white rounded-lg hover:bg-employee-primary-hover transition-colors font-medium text-sm">
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                        Edit Profile
                    </button>
                )}
            </div>

            <div className="grid grid-cols-12 gap-8">
                {/* Left Column: Profile Card */}
                <div className="col-span-12 lg:col-span-4 space-y-6">
                    <div className="bg-employee-surface-light dark:bg-employee-surface-dark border border-employee-border-light dark:border-employee-border-dark rounded-xl p-6 flex flex-col items-center text-center sticky top-8">
                        {/* Profile Image */}
                        <div className="relative group">
                            <div className="size-32 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-700 ring-4 ring-white dark:ring-slate-800 shadow-md mb-4 flex items-center justify-center">
                                {formData.profileImage ? (
                                    <img src={formData.profileImage} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="material-symbols-outlined text-6xl text-slate-300 dark:text-slate-500">person</span>
                                )}
                            </div>
                            {isEditing && (
                                <button onClick={() => fileInputRef.current?.click()} className="absolute bottom-4 right-0 bg-slate-900 text-white p-2 rounded-full shadow-lg hover:bg-slate-700 transition-colors" type="button">
                                    <span className="material-symbols-outlined text-sm">photo_camera</span>
                                </button>
                            )}
                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                        </div>

                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">{formData.name}</h2>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mb-1">{formData.designation || 'Employee'}</p>
                        <p className="text-slate-400 dark:text-slate-500 text-xs">{formData.department || 'Department'}</p>

                        <div className="mt-6 w-full pt-6 border-t border-employee-border-light dark:border-employee-border-dark flex flex-col gap-3">
                            <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                                <span className="material-symbols-outlined text-slate-400">mail</span>
                                <span className="truncate">{formData.email}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                                <span className="material-symbols-outlined text-slate-400">call</span>
                                <span>{formData.phoneNumber || '--'}</span>
                            </div>
                            <div className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-400">
                                <span className="material-symbols-outlined text-slate-400 mt-0.5">location_on</span>
                                <div className="flex flex-col items-start text-left">
                                    <span className="break-words line-clamp-2">{formData.address || '--'}</span>
                                    {formData.pincode && <span className="text-xs text-slate-500">PIN: {formData.pincode}</span>}
                                    {formData.mapLocation && !isEditing && (
                                        <a href={formData.mapLocation} target="_blank" rel="noopener noreferrer" className="text-xs text-employee-primary hover:underline mt-1 flex items-center gap-1">
                                            View on Maps <span className="material-symbols-outlined text-[10px]">open_in_new</span>
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Form */}
                <div className="col-span-12 lg:col-span-8">
                    <form onSubmit={handleSave} className="bg-employee-surface-light dark:bg-employee-surface-dark border border-employee-border-light dark:border-employee-border-dark rounded-xl p-6 md:p-8 space-y-8">

                        {/* 1. Basic Information */}
                        <div>
                            <SectionHeader title="Basic Information" icon="badge" />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-semibold text-slate-500 uppercase">Full Name</label>
                                    {isEditing ? (
                                        <input type="text" name="name" required value={formData.name} onChange={handleChange} className={inputClasses} placeholder="Full Name" />
                                    ) : (
                                        <div className={viewClasses}>{formData.name}</div>
                                    )}
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-semibold text-slate-500 uppercase">Work Email Address</label>
                                    {isEditing ? (
                                        <input type="email" name="email" required value={formData.email} onChange={handleChange} className={inputClasses} placeholder="email@opsbeetech.com" />
                                    ) : (
                                        <div className={viewClasses}>{formData.email}</div>
                                    )}
                                </div>
                                {isEditing && (
                                    <>
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-xs font-semibold text-slate-500 uppercase">Alternate Email (Optional)</label>
                                            <input type="email" name="alternateEmail" value={formData.alternateEmail || ''} onChange={handleChange} className={inputClasses} placeholder="personal@example.com" />
                                        </div>
                                    </>
                                )}
                                {!isEditing && formData.alternateEmail && (
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-semibold text-slate-500 uppercase">Alternate Email</label>
                                        <div className={viewClasses}>{formData.alternateEmail}</div>
                                    </div>
                                )}
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-semibold text-slate-500 uppercase">Designation</label>
                                    {isEditing ? (
                                        <input type="text" name="designation" required value={formData.designation} onChange={handleChange} className={inputClasses} />
                                    ) : (
                                        <div className={viewClasses}>{formData.designation || '--'}</div>
                                    )}
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-semibold text-slate-500 uppercase">Department</label>
                                    {isEditing ? (
                                        <input type="text" name="department" required value={formData.department} onChange={handleChange} className={inputClasses} />
                                    ) : (
                                        <div className={viewClasses}>{formData.department || '--'}</div>
                                    )}
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-semibold text-slate-500 uppercase">Phone Number</label>
                                    {isEditing ? (
                                        <input type="tel" name="phoneNumber" required value={formData.phoneNumber} onChange={handleChange} className={inputClasses} />
                                    ) : (
                                        <div className={viewClasses}>{formData.phoneNumber || '--'}</div>
                                    )}
                                </div>
                                {isEditing && (
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-semibold text-slate-500 uppercase">Alternate Phone (Optional)</label>
                                        <input type="tel" name="alternatePhone" value={formData.alternatePhone || ''} onChange={handleChange} className={inputClasses} />
                                    </div>
                                )}
                                {!isEditing && formData.alternatePhone && (
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-semibold text-slate-500 uppercase">Alternate Phone</label>
                                        <div className={viewClasses}>{formData.alternatePhone}</div>
                                    </div>
                                )}
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-semibold text-slate-500 uppercase">Date of Birth</label>
                                    {isEditing ? (
                                        <input type="date" name="dateOfBirth" value={formatDateForInput(formData.dateOfBirth)} onChange={handleChange} className={inputClasses} />
                                    ) : (
                                        <div className={viewClasses}>{formatDateForDisplay(formData.dateOfBirth)}</div>
                                    )}
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-semibold text-slate-500 uppercase">Joining Date</label>
                                    {isEditing ? (
                                        <input type="date" name="joiningDate" value={formatDateForInput(formData.joiningDate)} onChange={handleChange} className={inputClasses} />
                                    ) : (
                                        <div className={viewClasses}>{formatDateForDisplay(formData.joiningDate)}</div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* 2. Address & Location */}
                        <div>
                            <SectionHeader title="Address & Location" icon="home_pin" />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="col-span-1 md:col-span-2 flex flex-col gap-1.5">
                                    <label className="text-xs font-semibold text-slate-500 uppercase">Full Address</label>
                                    {isEditing ? (
                                        <textarea name="address" rows={2} value={formData.address} onChange={handleChange} className={`${inputClasses} resize-none`} placeholder="#123 Street, City..." />
                                    ) : (
                                        <div className={viewClasses}>{formData.address || '--'}</div>
                                    )}
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-semibold text-slate-500 uppercase">Pincode</label>
                                    {isEditing ? (
                                        <input type="text" name="pincode" value={formData.pincode} onChange={handleChange} className={inputClasses} placeholder="123456" />
                                    ) : (
                                        <div className={viewClasses}>{formData.pincode || '--'}</div>
                                    )}
                                </div>
                                {isEditing && (
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-semibold text-slate-500 uppercase">Google Maps Link (Optional)</label>
                                        <input type="url" name="mapLocation" value={formData.mapLocation} onChange={handleChange} className={inputClasses} placeholder="https://maps.google.com/..." />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 3. Work Experience */}
                        <div>
                            <div className="flex items-center justify-between mb-4 mt-8 pb-2 border-b border-slate-200 dark:border-slate-700">
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-employee-primary">work</span>
                                    <h3 className="font-bold text-lg text-slate-900 dark:text-white">Work Experience</h3>
                                </div>
                                {isEditing && formData.workExperiences.length < 3 && (
                                    <button type="button" onClick={addWorkExp} className="text-xs font-bold text-employee-primary hover:underline">+ Add Experience</button>
                                )}
                            </div>

                            {(() => {
                                const opsBeeExps = formData.workExperiences.filter(e => e.company.toLowerCase().includes('opsbee') || e.company.toLowerCase().includes('ops bee'));
                                const otherExps = formData.workExperiences.filter(e => !e.company.toLowerCase().includes('opsbee') && !e.company.toLowerCase().includes('ops bee'));

                                // Logic to determine the Start Date of the "Current" role (OpsBee Full-time)
                                // It should be the end date of the latest OpsBee previous role, or the joining date.
                                let currentRoleStart = formData.joiningDate;
                                if (opsBeeExps.length > 0) {
                                    const sortedOpsBee = [...opsBeeExps].sort((a, b) => new Date(b.endDate || 0).getTime() - new Date(a.endDate || 0).getTime());
                                    if (sortedOpsBee[0].endDate) {
                                        currentRoleStart = sortedOpsBee[0].endDate;
                                    }
                                }

                                return (
                                    <>
                                        {/* VIEW MODE: LinkedIn-style Grouping */}
                                        {!isEditing && (
                                            <div className="space-y-4">
                                                {/* OpsBee Group Card (Current + Previous OpsBee) */}
                                                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl flex gap-4">
                                                    <div className="flex flex-col items-center">
                                                        <div className="size-12 rounded-lg bg-employee-primary/10 flex items-center justify-center shrink-0 z-10 bg-white dark:bg-slate-900">
                                                            <span className="material-symbols-outlined text-employee-primary text-2xl">business_center</span>
                                                        </div>
                                                        {opsBeeExps.length > 0 && <div className="w-0.5 flex-grow bg-slate-200 dark:bg-slate-700 my-2"></div>}
                                                    </div>
                                                    <div className="flex-grow space-y-6 py-1">
                                                        {/* Current Role */}
                                                        <div>
                                                            <h4 className="font-bold text-slate-900 dark:text-white text-base">{formData.designation || 'Employee'}</h4>
                                                            <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">OpsBee Technologies · Full-time</p>
                                                            <p className="text-xs text-slate-500 mt-1">
                                                                {formatDateForDisplay(currentRoleStart)} - Present
                                                            </p>
                                                        </div>
                                                        {/* Previous OpsBee Roles */}
                                                        {opsBeeExps.sort((a, b) => new Date(b.endDate || 0).getTime() - new Date(a.endDate || 0).getTime()).map((exp, idx) => (
                                                            <div key={`opsbee-${idx}`}>
                                                                <h4 className="font-bold text-slate-900 dark:text-white text-base">{exp.role}</h4>
                                                                <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">{exp.company}</p>
                                                                <p className="text-xs text-slate-500 mt-1">
                                                                    {formatDateForDisplay(exp.startDate)} - {formatDateForDisplay(exp.endDate)}
                                                                </p>
                                                                {exp.description && <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">{exp.description}</p>}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Other Experiences */}
                                                {otherExps.map((exp, idx) => (
                                                    <div key={`other-${idx}`} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 relative">
                                                        <h4 className="font-bold text-slate-900 dark:text-white">{exp.role}</h4>
                                                        <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">{exp.company}</p>
                                                        <p className="text-xs text-slate-500 mt-1">
                                                            {formatDateForDisplay(exp.startDate)} - {formatDateForDisplay(exp.endDate)}
                                                        </p>
                                                        {exp.description && <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">{exp.description}</p>}
                                                    </div>
                                                ))}

                                                {formData.workExperiences.length === 0 && <p className="text-slate-500 text-sm">No previous work experience added.</p>}
                                            </div>
                                        )}

                                        {/* EDIT MODE: Form Inputs */}
                                        {isEditing && (
                                            <>
                                                {/* OpsBee Current Role (Static display reference) */}
                                                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl flex gap-4 mb-4 opacity-75">
                                                    <div className="size-12 rounded-lg bg-employee-primary/10 flex items-center justify-center shrink-0 bg-white dark:bg-slate-900 z-10">
                                                        <span className="material-symbols-outlined text-employee-primary text-2xl">business_center</span>
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-slate-900 dark:text-white text-base">{formData.designation || 'Employee'}</h4>
                                                        <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">OpsBee Technologies · Full-time</p>
                                                        <p className="text-xs text-slate-500 mt-1">Present (Auto-calculated from Joining/Prev Exp)</p>
                                                    </div>
                                                </div>

                                                <div className="space-y-4">
                                                    {formData.workExperiences.map((exp, index) => (
                                                        <div key={index} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 relative group">
                                                            <button type="button" onClick={() => removeWorkExp(index)} className="absolute top-2 right-2 text-slate-400 hover:text-red-500">
                                                                <span className="material-symbols-outlined text-sm">close</span>
                                                            </button>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                <input type="text" placeholder="Previous Company Name" className={inputClasses} value={exp.company} onChange={(e) => updateWorkExp(index, 'company', e.target.value)} />
                                                                <input type="text" placeholder="Job Role" className={inputClasses} value={exp.role} onChange={(e) => updateWorkExp(index, 'role', e.target.value)} />
                                                                <input type="text" placeholder="Description" className={`${inputClasses} md:col-span-2`} value={exp.description || ''} onChange={(e) => updateWorkExp(index, 'description', e.target.value)} />
                                                                <div className="flex gap-2 items-center">
                                                                    <span className="text-xs text-slate-500 w-10">Start:</span>
                                                                    <input type="date" className={inputClasses} value={formatDateForInput(exp.startDate)} onChange={(e) => updateWorkExp(index, 'startDate', e.target.value)} />
                                                                </div>
                                                                <div className="flex gap-2 items-center">
                                                                    <span className="text-xs text-slate-500 w-10">End:</span>
                                                                    <input type="date" className={inputClasses} value={formatDateForInput(exp.endDate)} onChange={(e) => updateWorkExp(index, 'endDate', e.target.value)} />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    {formData.workExperiences.length === 0 && <p className="text-slate-500 text-sm">No previous work experience added.</p>}
                                                </div>
                                            </>
                                        )}
                                    </>
                                );
                            })()}
                        </div>

                        {/* 4. Education */}
                        <div>
                            <div className="flex items-center justify-between mb-4 mt-8 pb-2 border-b border-slate-200 dark:border-slate-700">
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-employee-primary">school</span>
                                    <h3 className="font-bold text-lg text-slate-900 dark:text-white">Education Details</h3>
                                </div>
                                {isEditing && (
                                    <button type="button" onClick={addEducation} className="text-xs font-bold text-employee-primary hover:underline">+ Add Education</button>
                                )}
                            </div>

                            {formData.educations.length === 0 && !isEditing && <p className="text-slate-500 text-sm">No education details added.</p>}

                            <div className="space-y-4">
                                {formData.educations.map((edu, index) => (
                                    <div key={index} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 relative">
                                        {isEditing && (
                                            <button type="button" onClick={() => removeEducation(index)} className="absolute top-2 right-2 text-slate-400 hover:text-red-500">
                                                <span className="material-symbols-outlined text-sm">close</span>
                                            </button>
                                        )}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {isEditing ? (
                                                <>
                                                    <select className={inputClasses} value={edu.level} onChange={(e) => updateEducation(index, 'level', e.target.value)}>
                                                        <option value="High School">High School</option>
                                                        <option value="Senior Secondary">Senior Secondary</option>
                                                        <option value="Graduation">Graduation</option>
                                                        <option value="Post Graduation">Post Graduation</option>
                                                        <option value="PhD">PhD</option>
                                                        <option value="Other">Other</option>
                                                    </select>
                                                    <input type="text" placeholder="Institution/School Name" className={inputClasses} value={edu.institution} onChange={(e) => updateEducation(index, 'institution', e.target.value)} />
                                                    <input type="text" placeholder="Passing Year" className={inputClasses} value={edu.year} onChange={(e) => updateEducation(index, 'year', e.target.value)} />
                                                    <input type="text" placeholder="Score (CGPA/%)" className={inputClasses} value={edu.score || ''} onChange={(e) => updateEducation(index, 'score', e.target.value)} />
                                                </>
                                            ) : (
                                                <div className="col-span-2">
                                                    <h4 className="font-bold text-slate-900 dark:text-white">{edu.level}</h4>
                                                    <p className="text-sm text-slate-600 dark:text-slate-400">{edu.institution}</p>
                                                    <div className="flex gap-4 mt-1 text-xs text-slate-500">
                                                        <span>Year: {edu.year}</span>
                                                        <span>Score: {edu.score}</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 5. Certifications */}
                        <div>
                            <div className="flex items-center justify-between mb-4 mt-8 pb-2 border-b border-slate-200 dark:border-slate-700">
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-employee-primary">verified</span>
                                    <h3 className="font-bold text-lg text-slate-900 dark:text-white">Certifications</h3>
                                </div>
                                {isEditing && (
                                    <button type="button" onClick={addCertification} className="text-xs font-bold text-employee-primary hover:underline">+ Add Certification</button>
                                )}
                            </div>

                            {formData.certifications.length === 0 && !isEditing && <p className="text-slate-500 text-sm">No certifications added.</p>}

                            <div className="space-y-4">
                                {formData.certifications.map((cert, index) => (
                                    <div key={index} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 relative">
                                        {isEditing && (
                                            <button type="button" onClick={() => removeCertification(index)} className="absolute top-2 right-2 text-slate-400 hover:text-red-500">
                                                <span className="material-symbols-outlined text-sm">close</span>
                                            </button>
                                        )}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {isEditing ? (
                                                <>
                                                    <input type="text" placeholder="Certification Name" className={inputClasses} value={cert.name} onChange={(e) => updateCertification(index, 'name', e.target.value)} />
                                                    <input type="text" placeholder="Issuer Organization" className={inputClasses} value={cert.issuer} onChange={(e) => updateCertification(index, 'issuer', e.target.value)} />
                                                    <div className="flex gap-2 items-center">
                                                        <span className="text-xs text-slate-500">Date:</span>
                                                        <input type="date" className={inputClasses} value={formatDateForInput(cert.date)} onChange={(e) => updateCertification(index, 'date', e.target.value)} />
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="col-span-2">
                                                    <h4 className="font-bold text-slate-900 dark:text-white">{cert.name}</h4>
                                                    <p className="text-sm text-slate-600 dark:text-slate-400">{cert.issuer}</p>
                                                    <p className="text-xs text-slate-500 mt-1">{formatDateForDisplay(cert.date)}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 6. Guardian Details */}
                        <div>
                            <SectionHeader title="Parents / Guardian Details" icon="family_restroom" />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-semibold text-slate-500 uppercase">Guardian Name</label>
                                    {isEditing ? (
                                        <input type="text" name="guardianName" value={formData.guardianName} onChange={handleChange} className={inputClasses} />
                                    ) : (
                                        <div className={viewClasses}>{formData.guardianName || '--'}</div>
                                    )}
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-semibold text-slate-500 uppercase">Designation/Relation</label>
                                    {isEditing ? (
                                        <input type="text" name="guardianDesignation" value={formData.guardianDesignation} onChange={handleChange} className={inputClasses} />
                                    ) : (
                                        <div className={viewClasses}>{formData.guardianDesignation || '--'}</div>
                                    )}
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-semibold text-slate-500 uppercase">Phone Number</label>
                                    {isEditing ? (
                                        <input type="tel" name="guardianPhone" value={formData.guardianPhone} onChange={handleChange} className={inputClasses} />
                                    ) : (
                                        <div className={viewClasses}>{formData.guardianPhone || '--'}</div>
                                    )}
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-semibold text-slate-500 uppercase">Email (Optional)</label>
                                    {isEditing ? (
                                        <input type="email" name="guardianEmail" value={formData.guardianEmail} onChange={handleChange} className={inputClasses} />
                                    ) : (
                                        <div className={viewClasses}>{formData.guardianEmail || '--'}</div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Save Actions */}
                        {isEditing && (
                            <div className="fixed bottom-0 left-0 right-0 p-4 bg-employee-surface-light dark:bg-employee-surface-dark border-t border-employee-border-light dark:border-employee-border-dark flex justify-end gap-3 z-50 md:static md:bg-transparent md:border-0 md:p-0 mt-8">
                                <button type="button" onClick={handleCancel} className="px-5 py-2.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium text-sm transition-colors">
                                    Cancel
                                </button>
                                <button type="submit" disabled={isLoading} className="px-6 py-2.5 bg-employee-primary hover:bg-employee-primary-hover text-white rounded-lg font-bold text-sm shadow-lg shadow-employee-primary/20 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
                                    {isLoading ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Saving...
                                        </>
                                    ) : 'Save Changes'}
                                </button>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
}
