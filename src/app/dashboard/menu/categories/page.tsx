"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import CategoryCard from "@/components/menu/CategoryCard"
import CategoryForm from "@/components/menu/CategoryForm"
import {LoadingSpinner} from "@/components/shared/LoadingSpinner"
import {EmptyState} from "@/components/shared/EmptyState"
import { toast } from "sonner"

export default function CategoriesPage() {
    const [categories, setCategories] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [editingCategory, setEditingCategory] = useState<any>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)


    useEffect(() => {
        fetchCategories()
    }, [])

    const fetchCategories = async () => {
        try {
            setIsLoading(true)
            const response = await fetch("/api/categories")
            const data = await response.json()

            if (data.success) {
                setCategories(data.data)
            }
        } catch (error) {
            toast.error("Failed to fetch categories", {
                description: "Something went wrong while loading the categories."
            })

        } finally {
            setIsLoading(false)
        }
    }

    const handleCreate = async (data: any) => {
        try {
            setIsSubmitting(true)
            const response = await fetch("/api/categories", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            })

            const result = await response.json()

            if (result.success) {
                toast.success("Category created successfully")
                setIsFormOpen(false)
                fetchCategories()
            } else {
                toast.error(result.error || "Something went wrong")
            }
        } catch (error) {
           toast.error("Failed to create category")
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleEdit = async (data: any) => {
        try {
            setIsSubmitting(true)
            const response = await fetch(`/api/categories/${editingCategory.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            })

            const result = await response.json()

            if (result.success) {
                toast.success("Category updated successfully")
                setIsFormOpen(false)
                setEditingCategory(null)
                fetchCategories()
            } else {
               toast.error(result.error)
            }
        } catch (error) {
            toast.error("Failed to update category")
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this category?")) return

        try {
            const response = await fetch(`/api/categories/${id}`, {
                method: "DELETE",
            })

            const result = await response.json()

            if (result.success) {
             toast.success("Category deleted successfully")
                fetchCategories()
            } else {
               toast.error(result.error)
            }
        } catch (error) {
               toast.error("Failed to delete category")
        }
    }

    const handleToggleActive = async (id: string, isActive: boolean) => {
        try {
            const response = await fetch(`/api/categories/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isActive }),
            })

            const result = await response.json()

            if (result.success) {
                toast.success(`Category ${isActive ? "activated" : "deactivated"}`)
                fetchCategories()
            }
        } catch (error) {
            toast.error("Failed to update category")
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Menu Categories</h1>
                    <p className="text-gray-500">Organize your menu items by categories</p>
                </div>
                <Button onClick={() => setIsFormOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Category
                </Button>
            </div>

            {/* Categories List */}
            {isLoading ? (
                <LoadingSpinner />
            ) : categories.length === 0 ? (
                <EmptyState
                    icon={Plus}
                    title="No categories yet"
                    description="Get started by creating your first category"
                />
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {categories.map((category) => (
                        <CategoryCard
                            key={category.id}
                            category={category}
                            onEdit={(cat) => {
                                setEditingCategory(cat)
                                setIsFormOpen(true)
                            }}
                            onDelete={handleDelete}
                            onToggleActive={handleToggleActive}
                        />
                    ))}
                </div>
            )}

            {/* Category Form Dialog */}
            <CategoryForm
                isOpen={isFormOpen}
                onClose={() => {
                    setIsFormOpen(false)
                    setEditingCategory(null)
                }}
                onSubmit={editingCategory ? handleEdit : handleCreate}
                initialData={editingCategory}
                isLoading={isSubmitting}
            />
        </div>
    )
}