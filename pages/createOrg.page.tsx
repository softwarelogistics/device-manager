import React, { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { IReactPageServices } from "../services/react-page-services";
import Page from "../mobile-ui-common/page";
import { View, Text, ScrollView } from "react-native";
import colors from "../styles.colors";
import EditField from "../mobile-ui-common/edit-field";
import IconButton from "../mobile-ui-common/icon-button";
import AppServices from "../services/app-services";

export default function CreateOrgPage({ navigation }: IReactPageServices) {
   
    const [appServices, setAppServices] = useState<AppServices>(new AppServices());
 

    const [selections, setSelections] = useState<Orgs.CreateOrgViewModel>({
        name: '',
        webSite: '',
        namespace: '',
        createGettingStartedData: false
    });

    const logOut = async () => {
        await AsyncStorage.setItem("isLoggedIn", "false");

        await AsyncStorage.removeItem("jwt");
        await AsyncStorage.removeItem("refreshtoken");
        await AsyncStorage.removeItem("refreshtokenExpires");
        await AsyncStorage.removeItem("jwtExpires");
        await AsyncStorage.removeItem("userInitials");
        await AsyncStorage.removeItem("app_user");
        navigation.replace('authPage');
    };

    const createOrganization = async () => {
        if(!selections.name) {
            alert('Please enter an organization name');
            return;
        }

        if(!selections.namespace) {
            alert('Please enter an organization namespace');
            return;
        }

        let pattern = new RegExp("^[a-z][0-9a-z]{5,20}$");
        if(!pattern.test(selections.namespace)) {
            alert('The namespace must be between 6 and 20 characters and can only contain lower case letters and numbers.  It must start with a letter.');
            return;
        }

        let result = await appServices.orgsService.createOrganization(selections);
        if(result.successful) {
            alert('Organization created successfully');
            navigation.replace('welcome');
        }

        console.log('createOrganization: selections', selections);
    };

    const setSelectionProperty = (name: string, value: string | undefined) => {
        setSelections((current: Orgs.CreateOrgViewModel) => ({ ...current, [name]: value }));
    };

    const handleUserPropertyChange = (e: any, name: string) => {
        console.log(`handleUserPropertyChange: ${name}: e`, e);

        let value: string = (e === undefined || e === '-1') || e._dispatchInstances?.memoizedProps === undefined && (e.target?.value === 'undefined' || e.target?.value === '-1' || e.target?.value === '')
            ? ''
            : e._dispatchInstances?.memoizedProps === undefined
                ? (e.target?.value || e)
                : e._dispatchInstances.memoizedProps?.testID;

        console.log('handleUserPropertyChange: value', value);

        setSelectionProperty(name, value);
    };

    return (
        <Page>
            <ScrollView style={[{margin:20}]}>
                <EditField onChangeText={e => { handleUserPropertyChange(e, 'name'); }} label="Organization Name" placeHolder='enter organization name' value={selections.name} />
                <Text style={[{marginBottom:10}]}>NuvIoT uses organizations to organize the resources, devices and IoT applications that you will build.  You can also invite other team members to your organization.  There is no cost to create an organization.</Text>
                <EditField onChangeText={e => { handleUserPropertyChange(e, 'namespace'); }} label="Namespace" placeHolder='enter organization namespace' value={selections.namespace} />
                <Text  style={[{marginBottom:10}]}>A namespace is used to uniquely identify your organization and once set, it can not be changed.Your namespace can only contain lower case numbers and letters, it must begin with a letter and be between 6 and 20 characters.</Text>
                <EditField onChangeText={e => { handleUserPropertyChange(e, 'webSite'); }} label="Web Site" placeHolder='enter organization web site' value={selections.webSite} />

                <IconButton iconType="mci" label="Create Organization" icon="content-save" onPress={() => createOrganization()} color={colors.primaryColor}></IconButton>
                <IconButton iconType="mci" label="Logout" icon="logout" onPress={() => logOut()} color={colors.errorColor}></IconButton>
            </ScrollView>
        </Page>
    )
}