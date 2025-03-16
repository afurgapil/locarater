import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-background">
      <div className="text-center space-y-6">
        <h1 className="text-9xl font-extrabold tracking-widest text-primary">
          404
        </h1>

        <div className="mt-8">
          <p className="text-2xl font-semibold md:text-3xl mb-8">
            Aradığınız sayfaya ulaşılamıyor
          </p>
          <p className="text-muted-foreground mb-8">
            Sayfa kaldırılmış, adı değiştirilmiş veya geçici olarak
            kullanılamıyor olabilir.
          </p>
          <Link href="/">
            <Button variant="default" className="gap-2">
              <Home className="h-4 w-4" />
              Ana Sayfaya Dön
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
