
import ky from "ky";

import cfg from "./constant";

const tier = async () => {
  try {
    const response = await ky
      .get(`${cfg.base_url}/api/tier`).json<boolean>();

    return response;
  } catch (error) {
    console.error("Failed to fetch user status:", error);
    return false;
  }
}
export default tier;
