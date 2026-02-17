// src/components/settings/TableManagement.tsx

"use client"

import { useState } from "react"
import useSWR from "swr"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { createTableSchema, CreateTableInput } from "@/lib/validations/settings"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table as UITable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import { PageLoader, ButtonLoader } from "@/components/shared/LoadingSpinner"
import { EmptyState } from "@/components/shared/EmptyState"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { Plus, MoreHorizontal, Pencil, Trash2, UtensilsCrossed } from "lucide-react"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface Table {
  id: string
  number: number
  capacity: number
  status: "AVAILABLE" | "OCCUPIED" | "RESERVED"
}

export function TableManagement() {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [selectedTable, setSelectedTable] = useState<Table | null>(null)
  const [deleteTableId, setDeleteTableId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { data, error, isLoading, mutate } = useSWR<{ success: boolean; data: Table[] }>(
    "/api/tables",
    fetcher
  )

  const createForm = useForm<CreateTableInput>({
    resolver: zodResolver(createTableSchema),
    defaultValues: {
      number: 1,
      capacity: 4,
    },
  })

  const editForm = useForm<CreateTableInput & { status?: string }>({
    defaultValues: {
      number: 1,
      capacity: 4,
      status: "AVAILABLE",
    },
  })

  async function handleCreateTable(data: CreateTableInput) {
    try {
      setIsSubmitting(true)

      const response = await fetch("/api/tables", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || "Failed to create table")
      }

      toast.success("Table created successfully")
      setIsCreateOpen(false)
      createForm.reset()
      mutate()
    } catch (error: any) {
      console.error("Error creating table:", error)
      toast.error(error.message || "Failed to create table")
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleEditTable(data: CreateTableInput & { status?: string }) {
    if (!selectedTable) return

    try {
      setIsSubmitting(true)

      const response = await fetch(`/api/tables/${selectedTable.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || "Failed to update table")
      }

      toast.success("Table updated successfully")
      setIsEditOpen(false)
      setSelectedTable(null)
      editForm.reset()
      mutate()
    } catch (error: any) {
      console.error("Error updating table:", error)
      toast.error(error.message || "Failed to update table")
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDeleteTable() {
    if (!deleteTableId) return

    try {
      const response = await fetch(`/api/tables/${deleteTableId}`, {
        method: "DELETE",
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || "Failed to delete table")
      }

      toast.success("Table deleted successfully")
      setDeleteTableId(null)
      mutate()
    } catch (error: any) {
      console.error("Error deleting table:", error)
      toast.error(error.message || "Failed to delete table")
    }
  }

  function openEditDialog(table: Table) {
    setSelectedTable(table)
    editForm.reset({
      number: table.number,
      capacity: table.capacity,
      status: table.status,
    })
    setIsEditOpen(true)
  }

  function getStatusBadge(status: string) {
    const variants: Record<string, { variant: any; label: string }> = {
      AVAILABLE: { variant: "success", label: "Available" },
      OCCUPIED: { variant: "destructive", label: "Occupied" },
      RESERVED: { variant: "warning", label: "Reserved" },
    }

    const config = variants[status] || variants.AVAILABLE

    return (
      <Badge variant={config.variant as any}>
        {config.label}
      </Badge>
    )
  }

  if (isLoading) return <PageLoader text="Loading tables..." />
  if (error) return <div>Error loading tables</div>

  const tables = data?.data || []
  const sortedTables = [...tables].sort((a, b) => a.number - b.number)

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Table Management</h2>
          <p className="text-sm text-muted-foreground">
            Manage restaurant tables and their availability
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Table
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Table</DialogTitle>
              <DialogDescription>
                Add a new table to your restaurant
              </DialogDescription>
            </DialogHeader>
            <Form {...createForm}>
              <form onSubmit={createForm.handleSubmit(handleCreateTable)} className="space-y-4">
                <FormField
                  control={createForm.control}
                  name="number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Table Number</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          placeholder="1"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={createForm.control}
                  name="capacity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Capacity (Number of Seats)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          placeholder="4"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateOpen(false)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <ButtonLoader />}
                    Create Table
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tables Grid */}
      {sortedTables.length === 0 ? (
        <EmptyState
          icon={UtensilsCrossed}
          title="No tables found"
          description="Get started by adding your first table"
          action={{
            label: "Add Table",
            onClick: () => setIsCreateOpen(true),
          }}
        />
      ) : (
        <div className="rounded-md border">
          <UITable>
            <TableHeader>
              <TableRow>
                <TableHead>Table Number</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedTables.map((table) => (
                <TableRow key={table.id}>
                  <TableCell className="font-medium">
                    Table {table.number}
                  </TableCell>
                  <TableCell>{table.capacity} seats</TableCell>
                  <TableCell>{getStatusBadge(table.status)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => openEditDialog(table)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setDeleteTableId(table.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </UITable>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Table</DialogTitle>
            <DialogDescription>
              Update table information
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleEditTable)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Table Number</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        placeholder="1"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="capacity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Capacity (Number of Seats)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        placeholder="4"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="AVAILABLE">Available</SelectItem>
                        <SelectItem value="OCCUPIED">Occupied</SelectItem>
                        <SelectItem value="RESERVED">Reserved</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <ButtonLoader />}
                  Update Table
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteTableId}
        onOpenChange={(open) => !open && setDeleteTableId(null)}
        title="Delete Table"
        description="Are you sure you want to delete this table? This action cannot be undone."
        onConfirm={handleDeleteTable}
        confirmText="Delete"
        variant="destructive"
      />
    </div>
  )
}