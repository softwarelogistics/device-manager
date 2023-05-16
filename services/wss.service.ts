import { NuviotClientService } from "./nuviot-client.service";

class WssService {
    constructor(private client: NuviotClientService) {

    }

    getWSSUrl(channel: string, id: string) :Promise<Core.InvokeResultEx<string>> {
            return this.client.request<Core.InvokeResultEx<string>>(`/api/wsuri/${channel}/${id}/normal`)            
    }
}

export default WssService;