import CreateAdminForm from "@/components/CreateAdminForm";
import ProtectedRoute from "@/components/ProtectRoute";

export default function CreateBookPage() {
    return (
        <ProtectedRoute>
            <CreateAdminForm type="book" />;
        </ProtectedRoute>
    )
}