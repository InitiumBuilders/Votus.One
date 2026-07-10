import { redirect } from "next/navigation";

// The whole site is PromptHero now — shared /prompthero links come home.
export default function PromptHeroRedirect() {
  redirect("/");
}
