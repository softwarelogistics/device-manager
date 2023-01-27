/// <reference path="../core/core.ts" />

namespace Simulators {
    const Transport_RestHttp = "resthttp";
    const Transport_RestHttps = "resthttps";
    const Transport_RabbitMQ = "rabbitmq";
    const Transport_MQTT = "mqtt";
    const Transport_IOT_HUB = "azureiothub";
    const Transport_AzureServiceBus = "azureservicebus";
    const Transport_Azure_EventHub = "azureeventhub";
    const Transport_AMQP = "amqp";
    const Transport_UDP = "udp";
    const Transport_TCP = "tcp";

    const PayloadTypes_Text = "text";
    const PayloadTypes_Binary = "binary";
    const PayloadTypes_GeoPath = "geopath";

    const HttpVerb_GET = "GET";
    const HttpVerb_POST = "POST";
    const HttpVerb_PUT = "PUT";
    const HttpVerb_DELETE = "DELETE";

    const QOS0 = "qos0";
    const QOS1 = "qos1";
    const QOS2 = "qos2";

    export interface Simulator {
        id: string;
        name: Core.FormField;
        key: Core.FormField;
        deploymentConfiguration: Core.FormField;
        deviceConfiguration: Core.FormField;
        deviceType: Core.FormField;
        pipelineModuleConfiguration: Core.FormField;
        description: Core.FormField;
        credentialStorage: Core.FormField;
        defaultTransport: Core.FormField;
        defaultEndPoint: Core.FormField;
        connectionString: Core.FormField;
        hubName: Core.FormField;
        queueName: Core.FormField;
        topic: Core.FormField;
        subscription: Core.FormField;
        defaultPort: Core.FormField;
        defaultPayloadType: Core.FormField;
        password: Core.FormField;
        userName: Core.FormField;
        tLSSL: Core.FormField;
        accessKey: Core.FormField;
        accessKeyName: Core.FormField;
        anonymous: Core.FormField;
        basicAuth: Core.FormField;
        deviceId: Core.FormField;
    }

    export interface MessageTemplate {
        id: string;
        name: Core.FormField;
        key: Core.FormField;
        description: Core.FormField;
        pathAndQueryString: Core.FormField;
        textPayload: Core.FormField;
        binaryPayload: Core.FormField;
        queueName: Core.FormField;
        httpVerb: Core.FormField;
        to: Core.FormField;
        messageId: Core.FormField;
        contentType: Core.FormField;
        topic: Core.FormField;
        qualityOfServiceLevel: Core.FormField;
        retainFlag: Core.FormField;
        appendCR: Core.FormField;
        appendLF: Core.FormField;
        transport: Core.FormField;
        endpoint: Core.FormField;
        geoPoints: Core.FormField;
        port: Core.FormField;
    }

    export interface MessageHeader {
        id: string;
        name: Core.FormField;
        key: Core.FormField;
        headerName: Core.FormField;
        value: Core.FormField;
        description: Core.FormField;
    }

    export interface MessageDynamicAttribute {
        id: string;
        name: Core.FormField;
        parameterType: Core.FormField;
        key: Core.FormField;
        defaultValue: Core.FormField;
        description: Core.FormField;
    }

    export interface MessageProperty {
        key: string;
        value: string;
    }
}