'use client';

import { RegisterDialog } from "@/components/shared/RegisterDialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HandCoins } from "lucide-react";

export default function RegisterPage() {
  
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-8rem)] py-12 px-4">
       <Card className="mx-auto max-w-sm w-full">
        <CardHeader>
          <CardTitle className="text-2xl font-headline flex items-center gap-2">
            <HandCoins className="h-6 w-6" /> Create an Account
          </CardTitle>
          <CardDescription>
            Join CrowdFund by completing the two steps below.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <RegisterDialog />
        </CardContent>
      </Card>
    </div>
  )
}
