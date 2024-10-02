import { geolocation } from '@vercel/functions';

export function GET(request: Request) {
	const { country } = geolocation(request);
	// return country === "CN" ? 1 : 0;
	return new Response((country === "CN" ? 1 : 0).toString(), {
		headers: { 'content-type': 'application/json' },
	});
}
