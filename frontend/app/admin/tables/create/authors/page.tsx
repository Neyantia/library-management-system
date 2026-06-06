import CreateAdminForm from "@/components/CreateAdminForm";
import ProtectedRoute from "@/components/ProtectRoute";

export default function CreateAuthorPage() {
    return (
        <ProtectedRoute>
            <CreateAdminForm type="author" />;
        </ProtectedRoute>
    )
}