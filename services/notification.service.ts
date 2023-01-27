
import { NuviotClientService } from './nuviot-client.service';


export class NotificationService {

  constructor(private nuviotClient: NuviotClientService) {
  }

  openWebSocket(channel: string, id: string): Promise<WebSocket> {
    const uri = `api/wsuri/${channel}/${id}/normal`;
    const promise = new Promise<WebSocket>((resolve, reject) => {
      this.nuviotClient.requestForInvokeResultEx<string>(uri)
        .then(resp => {
          const notiifcationUri = resp.result as string;
          const webSocket = new WebSocket(notiifcationUri);
          webSocket.onopen = (evt) => {
            resolve(webSocket);
          };

          webSocket.onerror = (evt) => {
            console.log('err');
            console.log(evt);
          };
        });
    });

    return promise;
  }
}
