import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Home } from "lucide-react";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] w-full flex items-center justify-center">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-8 pb-8">
          <div className="flex flex-col items-center text-center gap-4">
            <div className="h-16 w-16 rounded-full bg-red-50 flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Page introuvable
              </h1>
              <p className="mt-2 text-sm text-gray-500">
                La page que vous recherchez n'existe pas ou a été déplacée.
              </p>
            </div>
            <Link href="/">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-md text-sm font-medium cursor-pointer transition-colors">
                <Home className="h-4 w-4" />
                Retour au tableau de bord
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
