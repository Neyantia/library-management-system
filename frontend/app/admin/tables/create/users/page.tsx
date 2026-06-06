import CreateAdminForm from "@/components/CreateAdminForm";
import ProtectedRoute from "@/components/ProtectRoute";

export default function CreateUserPage() {
    return (
        <ProtectedRoute>
            <CreateAdminForm type="user" />;
        </ProtectedRoute>
    )
}