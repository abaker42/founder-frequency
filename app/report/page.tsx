import { redirect } from "next/navigation";

// Report delivery now happens on /success after Stripe checkout.
// This route redirects anyone who lands here directly.
export default function ReportPage() {
	redirect("/");
}
