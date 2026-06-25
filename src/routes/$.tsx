import { createFileRoute } from "@tanstack/react-router";
import { SPAApp } from "@/app/App";

export const Route = createFileRoute("/$")({
  ssr: false,
  component: SPAApp,
});
