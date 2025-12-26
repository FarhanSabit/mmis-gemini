"use client";

import { AuthPage } from "@/components/auth/AuthPage";
import { UserProfile } from "@/types";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const handleSuccess = (userData: UserProfile) => {
    // Store user in localStorage
    localStorage.setItem("mmis_user", JSON.stringify(userData));
    
    // Redirect based on onboarding status
    if (userData.kycStatus === "APPROVED" || userData.role === "SUPER_ADMIN") {
      router.push("/dashboard");
    } else {
      router.push("/apply-access");
    }
  };

  return <AuthPage onSuccess={handleSuccess} />;
}
