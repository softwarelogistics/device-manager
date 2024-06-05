import React, { useState, useEffect } from "react";
import { Text, Platform, View, Image, TextInput, TouchableOpacity, TextStyle, ViewStyle, FlatList, Pressable, ActivityIndicator } from 'react-native';
import Icon from "react-native-vector-icons/Entypo";
import IconIonicons from "react-native-vector-icons/Ionicons";
import { IReactPageServices } from "../services/react-page-services";
import AsyncStorage from "@react-native-async-storage/async-storage";
import styles from '../styles';
import colors from "../styles.colors";
import AppServices from "../services/app-services";
import { ThemePalette } from "../styles.palette.theme";
import Page from "../mobile-ui-common/page";
import { Subscription } from "../utils/NuvIoTEventEmitter";
import SLIcon from "../mobile-ui-common/sl-icon";


export default function HomePage({ navigation }: IReactPageServices) {
  const [appServices, setAppServices] = useState<AppServices>(new AppServices());

  const [themePalette, setThemePalette] = useState<ThemePalette>(AppServices.getAppTheme());
  const [subscription, setSubscription] = useState<Subscription | undefined>(undefined);
  const [instances, setInstances] = useState<Deployment.DeploymentInstanceSummary[]>([]);
  const [user, setUser] = useState<Users.AppUser>();

  const loadInstances = async () => {
    let user = await appServices.userServices.getUser();
    setUser(user);
    let instances = await appServices.deploymentServices.GetInstances();
    setInstances(instances!.model!);
  }

  useEffect(() => {
    //let changed = AppServices.themeChangeSubscription.addListener('changed', () => setThemePalette(AppServices.getAppTheme()));
   // setSubscription(changed);

    const focusSubscription = navigation.addListener("focus", () => {
      loadInstances();
    });

    return (() => {
      if (subscription) AppServices.themeChangeSubscription.remove(subscription);
      focusSubscription();
    });
  }, []);

  const showScanPage = () => {
    navigation.navigate('scanPage');
  };

  const showPage = (pageName: string) => {
    navigation.navigate(pageName);
  };

  const logOut = async () => {
    await AsyncStorage.setItem("isLoggedIn", "false");

    await AsyncStorage.removeItem("jwt");
    await AsyncStorage.removeItem("refreshtoken");
    await AsyncStorage.removeItem("refreshtokenExpires");
    await AsyncStorage.removeItem("jwtExpires");
    navigation.replace('authPage');
  };

  const showInstance = (instance: Deployment.DeploymentInstanceSummary) => {
    navigation.navigate('instancePage', { instanceId: instance.id, repoId: instance.deviceRepoId, instanceName: instance.name });
  }

  const myItemSeparator = () => { return <View style={{ height: 1, backgroundColor: "#c0c0c0git ", marginHorizontal: 6 }} />; };

  const myListEmpty = () => {
    return (
      <View style={{ alignItems: "center" }}>
        <Text style={[{ textAlign: 'center', marginBottom: 5, marginTop:20, color: themePalette.shellTextColor, fontSize: 16 }]}>
          The NuVIoT device manager is a companion applications that can be used to provision and configure devices connected 
        to NuVIoT application instances.</Text>
        <Text style={[{ textAlign: 'center', marginBottom: 5, color: themePalette.shellTextColor, fontSize: 16 }]}>
          You currently don't have any IoT applications.</Text>
      </View>
    );
  };

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={{ flexDirection: 'row' }} onTouchStart={() => showPage('profilePage')}>
        {/* <Image source={require('../assets/settings.png')} style={{ width: 24, height: 24 }} /> */}
        <IconIonicons name="cog-outline" color={colors.white} size={24} />    
      </View>
      )
    });
  });


  return (
    <Page >
      {/* <StatusBar style="auto" /> */}
      <View style={{padding: 16, width: "100%", height: "100%", backgroundColor: themePalette.background }} >
        {/* <Image style={[{ marginTop: 30, marginBottom: 30, alignSelf: "center" }]} source={require('../assets/logo.png')} /> */}
        <Image style={[{ marginTop: 30, marginBottom: 30, alignSelf: "center" }]} source={require('../assets/app-icon.png')} />
        <Text style={[{ textAlign: 'center', marginBottom: 5, color: themePalette.shellTextColor, fontSize: 24 }]}>{user?.currentOrganization.text} Instances</Text>
        <FlatList
          contentContainerStyle={{ height: "auto"  }}
          style={{ backgroundColor: themePalette.background, width: "100%" }}
          ItemSeparatorComponent={myItemSeparator}
          ListEmptyComponent={myListEmpty}
          data={instances}
          renderItem={({ item }) =>
            <Pressable onPress={() => showInstance(item)} key={item.id} >
              <View style={[styles.listRow, { display:"flex", alignItems:"center", gap:16, padding: 8, margin: 8, height: 72, backgroundColor: themePalette.inputBackgroundColor, borderRadius: 8 }]}  >
              
                {/* <SLIcon icon={item.icon} /> */}
                {/* <Image source={require('../assets/product-img.png')} /> */}
                <View
                      style={{
                        backgroundColor: colors.primaryBlue,
                        borderRadius: 8,
                        height: 56,
                        width: 56,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <SLIcon icon={item.icon} />
                    </View>
                <View style={{ flexDirection: 'column', flex: 1 }}>
                <View >
                <Text style={{ color: themePalette.name === 'light' ? colors.darkTitle : colors.white  , marginBottom: 3, fontSize: 16 }}>{item.name}</Text>
              </View>
                <Text style={{ color:themePalette.subtitleColor, fontSize: 14 }}>{item.description}</Text>
              </View>
              
              <Icon
                name="chevron-right"
                color={themePalette.subtitleColor}
                size={24}
                style={{
                  textAlign: "center",
                  marginRight: 8
                }}
              />
              </View>
            </Pressable>
          }
        />
      </View>
    </Page>
  );
}