import { NextRequest, NextResponse, NextFetchEvent } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import aj, { createMiddleware, detectBot, shield } from "./lib/arcjet";

// Arcjet validation rules
const validate = aj
	.withRule(
		shield({
			mode: "LIVE", // Production mode protection
		})
	)
	.withRule(
		detectBot({
			mode: "LIVE",
			allow: ["CATEGORY:SEARCH_ENGINE", "G00G1E_CRAWLER"], // Allow certain bots
		})
	);

// Create Arcjet middleware handler
const arcjetMiddleware = createMiddleware(validate);

export async function middleware(request: NextRequest, event: NextFetchEvent) {
	// Run Arcjet first
	const arcjetResult = await arcjetMiddleware(request, event);
	if (arcjetResult) return arcjetResult;

	// Run authentication check
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	// If no session, redirect to sign-in
	if (!session) {
		return NextResponse.redirect(new URL("/sign-in", request.url));
	}

	// Allow request to proceed
	return NextResponse.next();
}

export const config = {
	matcher: [
		"/((?!api|_next/static|_next/image|favicon.ico|sign-in|assets).*)",
	],
};
