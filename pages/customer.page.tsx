import React, { useState, useEffect } from "react";
import { Image, ScrollView, Text } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import IconButton from "../mobile-ui-common/icon-button";
import AppServices from "../services/app-services";
import styles from '../styles';
import { IReactPageServices } from "../services/react-page-services";
import Page from "../mobile-ui-common/page";

export const CustomerPage = ({ navigation, props, route }: IReactPageServices) => {  
    const customerId = route.params.customerId;

    const [customer, setCustomer] = useState<Business.CustomerEntity>();
    const [firstLoad, setFirstLoad] = useState<boolean>(true);
    const themePalette = AppServices.instance.getAppTheme();

    const loadCustomer = async() => {
        let customer = await AppServices.instance.businessService.getCustomer(customerId);
        if(customer.successful) 
            setCustomer(customer.result);
    }

    useFocusEffect(() => {
        if (firstLoad) {
          setFirstLoad(false);
          loadCustomer();
        }    
      })


    return (
    <Page >
      <Text style={[{ marginBottom: 5, color: themePalette.shellTextColor, fontSize: 24 }]}>{customer?.name}</Text>
        
      <ScrollView style={[styles.stdPadding]}>
        <Image style={styles.logoImage} source={require('../assets/app-icon.png')} />          
          <IconButton label="Customer Detail" icon="folder-open-outline" iconType="ion" onPress={() => AppServices.instance.navService.navigate('customerLocationsPage', {customerId: customerId})}  ></IconButton>
          <IconButton label="Customer Locations" icon="folder-open-outline" iconType="ion" onPress={() => AppServices.instance.navService.navigate('customerLocationsPage', {customerId: customerId})}  ></IconButton>
      </ScrollView>
    </Page>
  )
}