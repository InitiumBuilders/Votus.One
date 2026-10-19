import { permanentRedirect } from "next/navigation";

// PromptHero lives at the root — shared /prompthero links come home, for good (308).
export default function PromptHeroRedirect() {
  permanentRedirect("/");
}
