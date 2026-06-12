import { createFileRoute } from "@tanstack/react-router";
import { Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AssetHub — Resource Management" },
      { name: "description", content: "Manage and book company assets with ease." },
    ],
  }),
  component: Index,
});

function Index() {
  return <Navigate to="/dashboard" />;
}
