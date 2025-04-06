import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Search, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
    Table,
    TableHeader,
    TableBody,
    TableHead,
    TableRow,
    TableCell
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from '@/components/ui/dialog';
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent
} from '@/components/ui/card';

import { materialService } from '../services/api';

const MaterialsPage = () => {
    // State for materials data
    const [materials, setMaterials] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // State for dialogs
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    // State for form data
    const [newMaterial, setNewMaterial] = useState({ name: '', is_active: true });
    const [selectedMaterial, setSelectedMaterial] = useState(null);

    // State for loading states
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Load materials on component mount
    useEffect(() => {
        loadMaterials();
    }, []);

    // Load all materials
    const loadMaterials = async () => {
        try {
            setIsLoading(true);
            const response = await materialService.getAll();
            setMaterials(response.data.materials);
        } catch (error) {
            console.error('Error loading materials:', error);
            toast.error('خطا در بارگیری متریال‌ها');
        } finally {
            setIsLoading(false);
        }
    };

    // Create a new material
    const handleCreateMaterial = async () => {
        if (!newMaterial.name.trim()) {
            toast.error('نام متریال نمی‌تواند خالی باشد');
            return;
        }

        try {
            setIsSubmitting(true);
            const response = await materialService.create(newMaterial);
            setMaterials([...materials, response.data.material]);
            setIsAddDialogOpen(false);
            setNewMaterial({ name: '', is_active: true });
            toast.success('متریال با موفقیت ایجاد شد');
        } catch (error) {
            console.error('Error creating material:', error);
            if (error.response?.data?.message) {
                toast.error(error.response.data.message);
            } else {
                toast.error('خطا در ایجاد متریال');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    // Update an existing material
    const handleUpdateMaterial = async () => {
        if (!selectedMaterial || !selectedMaterial.name.trim()) {
            toast.error('نام متریال نمی‌تواند خالی باشد');
            return;
        }

        try {
            setIsSubmitting(true);
            const response = await materialService.update(selectedMaterial.id, selectedMaterial);

            // Update the materials state
            const updatedMaterials = materials.map(material =>
                material.id === selectedMaterial.id ? response.data.material : material
            );

            setMaterials(updatedMaterials);
            setIsEditDialogOpen(false);
            setSelectedMaterial(null);
            toast.success('متریال با موفقیت به‌روزرسانی شد');
        } catch (error) {
            console.error('Error updating material:', error);
            if (error.response?.data?.message) {
                toast.error(error.response.data.message);
            } else {
                toast.error('خطا در به‌روزرسانی متریال');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    // Delete a material
    const handleDeleteMaterial = async () => {
        if (!selectedMaterial) return;

        try {
            setIsSubmitting(true);
            await materialService.delete(selectedMaterial.id);

            // Remove the deleted material from state
            setMaterials(materials.filter(material => material.id !== selectedMaterial.id));

            setIsDeleteDialogOpen(false);
            setSelectedMaterial(null);
            toast.success('متریال با موفقیت حذف شد');
        } catch (error) {
            console.error('Error deleting material:', error);
            if (error.response?.data?.message) {
                toast.error(error.response.data.message);
            } else {
                toast.error('خطا در حذف متریال');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    // Filter materials based on search term
    const filteredMaterials = materials.filter(material =>
        material.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">مدیریت متریال‌ها</h1>
                <Button
                    onClick={() => setIsAddDialogOpen(true)}
                    className="flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    افزودن متریال جدید
                </Button>
            </div>

            {/* Search and filters */}
            <div className="flex items-center w-full max-w-sm">
                <div className="relative w-full">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                        placeholder="جستجو..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-3 pr-9"
                    />
                </div>
            </div>

            {/* Materials table */}
            <Card>
                <CardHeader>
                    <CardTitle>لیست متریال‌ها</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center items-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ردیف</TableHead>
                                    <TableHead>نام متریال</TableHead>
                                    <TableHead>تعداد آلیاژ</TableHead>
                                    <TableHead>وضعیت</TableHead>
                                    <TableHead>عملیات</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredMaterials.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                                            هیچ متریالی یافت نشد
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredMaterials.map((material, index) => (
                                        <TableRow key={material.id}>
                                            <TableCell>{index + 1}</TableCell>
                                            <TableCell className="font-medium">{material.name}</TableCell>
                                            <TableCell>
                                                {material.alloys_count || 0} آلیاژ
                                            </TableCell>
                                            <TableCell>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            material.is_active
                                ? 'bg-green-100 text-green-800'
                                : 'bg-slate-100 text-slate-800'
                        }`}>
                          {material.is_active ? 'فعال' : 'غیرفعال'}
                        </span>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex space-x-2 items-center">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 w-8 p-0"
                                                        onClick={() => {
                                                            setSelectedMaterial({...material});
                                                            setIsEditDialogOpen(true);
                                                        }}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
                                                        onClick={() => {
                                                            setSelectedMaterial(material);
                                                            setIsDeleteDialogOpen(true);
                                                        }}
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
                    )}
                </CardContent>
            </Card>

            {/* Add material dialog */}
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>افزودن متریال جدید</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <label htmlFor="name" className="text-sm font-medium">نام متریال</label>
                            <Input
                                id="name"
                                placeholder="نام متریال را وارد کنید"
                                value={newMaterial.name}
                                onChange={(e) => setNewMaterial({...newMaterial, name: e.target.value})}
                            />
                        </div>
                        <div className="flex items-center space-x-2">
                            <Switch
                                checked={newMaterial.is_active}
                                onCheckedChange={(checked) => setNewMaterial({...newMaterial, is_active: checked})}
                            />
                            <label className="text-sm font-medium">فعال</label>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>انصراف</Button>
                        <Button
                            onClick={handleCreateMaterial}
                            isLoading={isSubmitting}
                            disabled={!newMaterial.name.trim() || isSubmitting}
                        >
                            ذخیره
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit material dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>ویرایش متریال</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <label htmlFor="edit-name" className="text-sm font-medium">نام متریال</label>
                            <Input
                                id="edit-name"
                                placeholder="نام متریال را وارد کنید"
                                value={selectedMaterial?.name || ''}
                                onChange={(e) => setSelectedMaterial({...selectedMaterial, name: e.target.value})}
                            />
                        </div>
                        <div className="flex items-center space-x-2">
                            <Switch
                                checked={selectedMaterial?.is_active || false}
                                onCheckedChange={(checked) => setSelectedMaterial({...selectedMaterial, is_active: checked})}
                            />
                            <label className="text-sm font-medium">فعال</label>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>انصراف</Button>
                        <Button
                            onClick={handleUpdateMaterial}
                            isLoading={isSubmitting}
                            disabled={!selectedMaterial?.name.trim() || isSubmitting}
                        >
                            به‌روزرسانی
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete material dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>حذف متریال</DialogTitle>
                    </DialogHeader>
                    <div className="py-2">
                        <div className="flex items-center space-x-2 p-4 rounded-lg bg-amber-50 text-amber-900 mb-4">
                            <AlertTriangle className="h-5 w-5 text-amber-500" />
                            <p>آیا از حذف این متریال اطمینان دارید؟</p>
                        </div>
                        <p className="text-sm text-slate-500">
                            با حذف متریال "{selectedMaterial?.name}"، تمامی آلیاژهای مرتبط با آن نیز حذف خواهند شد.
                        </p>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>انصراف</Button>
                        <Button
                            variant="destructive"
                            onClick={handleDeleteMaterial}
                            isLoading={isSubmitting}
                        >
                            حذف
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default MaterialsPage;
