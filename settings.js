export const CommonSettings = {
    environment: 'production'
}

export const environment = {
    production: true,
    appId: "1C114B00D8014BD988BF61D74672F9D2",
    deviceId: 'mobileApp',
    appInstanceid: "",
    siteUri: CommonSettings.environment == 'development' ? 'https://dev-api.nuviot.com' : 'https://api.nuviot.com'
    // siteUri: 'https://localhost:5001'
    //siteUri: 'https://dev-api.nuviot.com'
};