export interface IReactPageServices {
    navigation: any;
    props: any;
    route: {params: any};
    onReceived?: (itemValue: any) => void;
    onConnected?: () => void;
    onDisconnected?: () => void;
    subscriptions?: string[];
    peripheralId?: string;
}