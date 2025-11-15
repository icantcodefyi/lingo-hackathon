import { createFileRoute } from "@tanstack/react-router";
import ShaderBackground from "@/components/shader-background";
import Header from "@/components/header";
import HeroContent from "@/components/hero-content";
import PulsingCircle from "@/components/pulsing-circle";

export const Route = createFileRoute("/")({
  component: HomeComponent,
});

function HomeComponent() {
  return (
    <ShaderBackground>
      <HeroContent />
      <PulsingCircle />
    </ShaderBackground>
  );
}
