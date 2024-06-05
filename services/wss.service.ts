import { NuviotClientService } from "./nuviot-client.service";

class WssService {
    ws: WebSocket | undefined;

    constructor(private client: NuviotClientService) {}

    onmessage: ((event: WebSocketMessageEvent) => void) | undefined;

    getWSSUrl(channel: string, id: string): Promise<Core.InvokeResultEx<string>> {
        return this.client.request<Core.InvokeResultEx<string>>(`/api/wsuri/${channel}/${id}/normal`)
    }

    async init(channel: string, id: string) {
        let url = await this.getWSSUrl(channel, id);
        this.ws = new WebSocket(url.result);
        this.ws.onopen = () => {
            console.log('[WssService__onopen] web socket on open;');
        };

        this.ws.onmessage = (e) => {            
            if(this.onmessage){
                this.onmessage(e);
            }
        };

        this.ws.onclose = () => {
            console.log('[WssService__onclose] web socket closed;');
        }

        this.ws.onerror = () => {};
    }

    close() {
        if (this.ws) {
            this.ws.close();
            this.ws = undefined;
        }
    }
}

export default WssService;