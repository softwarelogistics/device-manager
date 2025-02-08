import React, { useState, useEffect } from "react";
import { Text, View, Image, FlatList, Pressable } from 'react-native';
import Icon from "react-native-vector-icons/Entypo";
import { IReactPageServices } from "../services/react-page-services";
import styles from '../styles';
import colors from "../styles.colors";
import AppServices from "../services/app-services";
import Page from "../mobile-ui-common/page";
import SLIcon from "../mobile-ui-common/sl-icon";
import { AppLogo } from "../mobile-ui-common/AppLogo";
import { useFocusEffect } from "@react-navigation/native";

export default function CustomersPage({ navigation }: IReactPageServices) {
  const [customers, setCustomers] = useState<Business.CustomerEntitySummary[]>([]);
  const [user, setUser] = useState<Users.AppUser>();
  const [firstLoad, setFirstLoad] = useState<boolean>(true);
  const themePalette = AppServices.instance.getAppTheme();

  const loadInstances = async () => {
    let user = await AppServices.instance.userServices.getUser();
    setUser(user);
    
    let customers = await AppServices.instance.businessService.getCustomers();
    setCustomers(customers!.model!);
  }

  useFocusEffect(() => {
    if (firstLoad) {
      setFirstLoad(false);
      loadInstances();
    }    
  })

  const showCustomer = (customer: Business.CustomerEntitySummary) => {
    AppServices.instance.navService.navigate('customerPage', { customerId: customer.id});
  }

  const myItemSeparator = () => { return <View style={{ height: 1, backgroundColor: "#c0c0c0git ", marginHorizontal: 6 }} />; };

  const myListEmpty = () => {
    return (
      <View style={{ alignItems: "center" }}>
        <Text style={[{ textAlign: 'center', marginBottom: 5, color: themePalette.shellTextColor, fontSize: 16 }]}>
          You currently don't have any Customers.</Text>
      </View>
    );
  };

  return (
    <Page>
      <View style={[styles.stdPadding]}>
        <AppLogo />
        <Text style={[{ marginBottom: 5, color: themePalette.shellTextColor, fontSize: 24 }]}>{user?.currentOrganization.text} Customers</Text>
        <FlatList contentContainerStyle={{ height: "auto" }} style={{ backgroundColor: themePalette.background, width: "100%" }}
          ItemSeparatorComponent={myItemSeparator} ListEmptyComponent={myListEmpty} data={customers} renderItem={({ item }) =>
            <Pressable onPress={() => showCustomer(item)} key={item.id} >
              <View style={[styles.listRow, { display: "flex", alignItems: "center", gap: 16, padding: 8, margin: 8, height: 72, backgroundColor: themePalette.inputBackgroundColor, borderRadius: 8 }]}  >
                <View style={{ backgroundColor: colors.primaryBlue, borderRadius: 8, height: 56, width: 56, alignItems: "center", justifyContent: "center", }}>
                  <SLIcon icon={item.icon} />
                </View>
            
                <View style={{ flexDirection: 'column', flex: 1 }}>
                  <View > 
                    <Text style={{ color: themePalette.name === 'light' ? colors.darkTitle : colors.white, marginBottom: 3, fontSize: 16 }}>{item.name}</Text>
                  </View>
                  <Text style={{ color: themePalette.subtitleColor, fontSize: 14 }}>{item.description}</Text>
                </View>

                <Icon name="chevron-right" color={themePalette.subtitleColor} size={24} style={{ textAlign: "center", marginRight: 8 }} />
              </View>
            </Pressable>
          }
        />
      </View>
    </Page>
  );
}