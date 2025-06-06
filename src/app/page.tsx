import { ColorScale } from '@/components/ColorScale';
import { Toaster } from '@/components/ui/sonner';

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <h1 className="text-4xl font-bold text-center mb-8">Color Scale Generator</h1>
        <ColorScale />
      </div>
      <Toaster />
    </main>
  );
}
