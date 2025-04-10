
import ProfileForm from "@/components/ProfileForm";

export function ProfileContent() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight mb-4">My Profile</h1>
      
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <ProfileForm />
        </div>
      </div>
    </div>
  );
}
