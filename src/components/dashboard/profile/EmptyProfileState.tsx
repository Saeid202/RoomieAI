
import { useNavigate } from "react-router-dom";

export function EmptyProfileState() {
  const navigate = useNavigate();
  
  return (
    <div className="text-center py-8">
      <p className="text-lg text-gray-600">
        Please select your preference (roommate, co-owner, or both) before filling out your profile.
      </p>
      <button 
        onClick={() => navigate('/dashboard')}
        className="mt-4 px-4 py-2 bg-roomie-purple text-white rounded-md hover:bg-roomie-purple/90 transition-colors"
      >
        Go to Dashboard
      </button>
    </div>
  );
}
