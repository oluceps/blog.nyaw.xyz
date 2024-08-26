import ky from "ky";

export async function GET() {
	interface UserResponse {
		onlineStatus: string;
	}

	const qBody = {
		i: "RWKGJuqW8xcIsSd2kfKhgHOPzePHWMNu",
		userId: "9wmrojkev8wp001z",
	};
	const misskeyInstance = "https://nyaw.xyz";

	const fetchOnlineStatus = async () => {
		try {
			const response = await ky
				.post(`${misskeyInstance}/api/users/show`, {
					json: qBody,
				})
				.json<UserResponse>();

			return response.onlineStatus === "online" ? 1 : 0;
		} catch (error) {
			console.error("Failed to fetch user status:", error);
			return 0;
		}
	};

	const res = await fetchOnlineStatus();
	return res;
}
