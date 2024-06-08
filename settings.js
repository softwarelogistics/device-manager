export const CommonSettings = {
    environment: 'production', // 'development' or 'production'
}

export const environment = {
    appId: "1C114B00D8014BD988BF61D74672F9D2",
    clientType: 'mobileApp',
    deviceId: 'mobileApp',
    appInstanceid: "",
    siteUri: CommonSettings.environment == 'development' ? 'https://dev-api.nuviot.com' : 'https://api.nuviot.com'    
};