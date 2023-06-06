export interface Subscription {
    name: string,
    serialNumber: string;
    callback: (event: any) => void
}

export class NuvIoTEventEmitter {
    subscriptions: Subscription[] = [];

    static eventId: number = 1;

    emit(name: string, data: any) {        
        for(let subscription of this.subscriptions ){
            console.log(subscription.name + ' := ' + name);
            if(subscription.name == name) {                
                console.log('sending');    
                subscription.callback(data);
            }
        }
    }

    addListener(name: string, callback: (event: any) => void) {
        NuvIoTEventEmitter.eventId++;

        console.log('add sub=>' + name);
        let subscription = {
            name: name,
            serialNumber: `eventId${NuvIoTEventEmitter.eventId}`,
            callback: callback
        }

        this.subscriptions.push(subscription);

        return subscription;
    }

    remove(subscription: Subscription){
        

        let idx = this.subscriptions.indexOf(subscription);
        if(idx != -1) {
            this.subscriptions.splice(idx, 1);            
        }
    }

    removeAllListeners(name: string) {
        console.log('remove sub=>' + name);

        let activeSubscriptions = this.subscriptions.filter(sub=>sub.name == name);
        for(let subscription of activeSubscriptions) {
            let idx = this.subscriptions.indexOf(subscription);
            this.subscriptions.splice(idx, 1);
        }
    }
}