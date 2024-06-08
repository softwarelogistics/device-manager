import React, { useState, useEffect } from "react";

import AppServices from "../services/app-services";
import { IReactPageServices } from "../services/react-page-services";
import Page from "../mobile-ui-common/page";
import { View, Text } from "react-native";

export default function AcceptInvitePage({ navigation }: IReactPageServices) {
    return (
        <Page>
            <View>
                <Text>Create Organization Page</Text>
            </View>
        </Page>
    )
}