import fs from "fs/promises";

async function writeCurrentTimeToFile() {
	try {
		const currentTime = new Date().toString();

		await fs.writeFile("time.json", JSON.stringify(currentTime, null, 2));
		console.log("written time.json");
	} catch (err) {
		console.error(err);
	}
}

writeCurrentTimeToFile();
