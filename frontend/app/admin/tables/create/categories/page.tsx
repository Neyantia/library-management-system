import CreateAdminForm from "@/components/CreateAdminForm";
import ProtectedRoute from "@/components/ProtectRoute";

export default function CreateCategoryPage() {
    return (
        <ProtectedRoute>
            <CreateAdminForm type="category" />;
        </ProtectedRoute>
    )
}