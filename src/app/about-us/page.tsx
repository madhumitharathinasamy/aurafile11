import { redirect } from "next/navigation";

// /about-us redirects to the canonical /about page
export default function AboutUsRedirect() {
    redirect("/about");
}
