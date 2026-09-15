import { Frame } from "./grpc/rate";
import cfg from "~/constant";

let socket: WebSocket | null = null;

export const getHeartbeat = (onMessage: (data: string) => void) => {
	if (socket !== null) {
		socket.close();
	}

	socket = new WebSocket(cfg.heartrate_endpoint);
    socket.binaryType = "arraybuffer";

	socket.onmessage = (event) => {
        try {
            const buffer = new Uint8Array(event.data);
            const frame = Frame.decode(buffer);
            
            if (frame.rate) {
                onMessage(frame.rate.value.toString());
            } else if (frame.status) {
                console.log("Status update:", frame.status);
            }
        } catch (e) {
            console.error("Failed to decode frame", e);
        }
	};

	socket.onclose = () => {
		console.log("WebSocket closed");
		onMessage("~");
	};

	socket.onerror = (error) => {
		console.error(`WebSocket error: ${error}`);
	};
};
