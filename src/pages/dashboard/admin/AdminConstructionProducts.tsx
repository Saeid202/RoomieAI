import { Package, Plus, Search, MoreVertical, Edit, Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import {
  EnhancedPageLayout,
  EnhancedHeader,
  EnhancedCard,
} from "@/components/ui/design-system";

export default function AdminConstructionProductsPage() {
  return (
    <EnhancedPageLayout>
      {/* Enhanced Header */}
      <EnhancedHeader
        title="Construction Products"
        subtitle="Manage construction products and marketplace listings"
      />

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <EnhancedCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Products</p>
              <p className="text-3xl font-bold mt-2">0</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
              <Package className="h-6 w-6 text-indigo-600" />
            </div>
          </div>
        </EnhancedCard>
        <EnhancedCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Products</p>
              <p className="text-3xl font-bold mt-2">0</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
              <div className="h-6 w-6 rounded-full bg-green-600" />
            </div>
          </div>
        </EnhancedCard>
        <EnhancedCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Pending Review</p>
              <p className="text-3xl font-bold mt-2">0</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center">
              <div className="h-6 w-6 rounded-full bg-yellow-600" />
            </div>
          </div>
        </EnhancedCard>
      </div>

      {/* Actions Bar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Input placeholder="Search products..." className="w-64" />
          <Button variant="outline" size="icon">
            <Search className="h-4 w-4" />
          </Button>
        </div>
        <Button asChild>
          <Link to="/dashboard/admin/construction/products/new">
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Link>
        </Button>
      </div>

      {/* Products Table */}
      <EnhancedCard>
        <CardHeader>
          <CardTitle>All Products</CardTitle>
          <CardDescription>
            Manage construction products, view orders, and update inventory
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-sm">Product</th>
                  <th className="text-left py-3 px-4 font-medium text-sm">Category</th>
                  <th className="text-left py-3 px-4 font-medium text-sm">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-sm">Price</th>
                  <th className="text-right py-3 px-4 font-medium text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b hover:bg-muted/50">
                  <td className="py-4 px-4">
                    <div className="font-medium">Construction Materials</div>
                    <div className="text-sm text-muted-foreground">Supplier ID: 12345</div>
                  </td>
                  <td className="py-4 px-4">Materials</td>
                  <td className="py-4 px-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Active
                    </span>
                  </td>
                  <td className="py-4 px-4">$0.00</td>
                  <td className="py-4 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" asChild>
                        <Link to="/dashboard/admin/construction/products/1/edit">
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="mt-4 text-center text-sm text-muted-foreground">
            No products found
          </div>
        </CardContent>
      </EnhancedCard>
    </EnhancedPageLayout>
  );
}
