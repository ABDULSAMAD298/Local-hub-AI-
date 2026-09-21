import { Suspense } from "react";

import { Logo } from "@/components/layout/logo";
import { SignupWizard } from "@/components/auth/signup-wizard";
import { createClient } from "@/lib/supabase/server";
import type { BusinessTypeConfig } from "@/lib/types";

export default async function SignupPage() {
  const supabase = createClient();
  const { data: businessTypes } = await supabase
    .from("business_type_config")
    .select("*")
    .order("display_name");

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 px-6 py-16">
      <Logo />
      <Suspense fallback={null}>
        <SignupWizard businessTypes={(businessTypes as BusinessTypeConfig[]) ?? []} />
      </Suspense>
    </main>
  );
}
