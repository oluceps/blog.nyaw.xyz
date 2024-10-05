import ky from "ky";

import cfg from "./constant";
import { cache, createAsync } from "@solidjs/router";

const tier = async () => {
	try {
		const response = await ky.get(`${cfg.base_url}/api/tier`).json<boolean>();

		return response;
	} catch (error) {
		console.error("Failed to fetch tier:", error);
		return false;
	}
};

// Perform async filtering
const limit = createAsync(
	() => cache(async () => await tier(), "limit")(), { deferStream: false });

export default tier;
export { limit };
