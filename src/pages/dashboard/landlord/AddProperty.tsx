
import PropertyForm from "@/components/property/PropertyForm";

export default function AddPropertyPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">List New Property</h1>
        <p className="text-muted-foreground mt-1">Add details about your property</p>
      </div>
      
      <PropertyForm />
    </div>
  );
}
