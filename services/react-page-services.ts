export interface IReactPageServices {
    navigation: any;
    props: any;
    route: {params: any};
    onReceived?: (itemValue: any) => void
    subscriptions?: string[];
}