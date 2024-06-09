import React, { useState, useEffect } from "react";
import { Text, View, Image, FlatList, Pressable } from 'react-native';
import Icon from "react-native-vector-icons/Entypo";
import IconIonicons from "react-native-vector-icons/Ionicons";
import { IReactPageServices } from "../services/react-page-services";
import styles from '../styles';
import colors from "../styles.colors";
import AppServices from "../services/app-services";
import Page from "../mobile-ui-common/page";
import SLIcon from "../mobile-ui-common/sl-icon";
import { AppLogo } from "../mobile-ui-common/AppLogo";
import { useFocusEffect } from "@react-navigation/native";

export default function HomePage({ navigation }: IReactPageServices) {
  const [instances, setInstances] = useState<Deployment.DeploymentInstanceSummary[]>([]);
  const [user, setUser] = useState<Users.AppUser>();
  const [firstLoad, setFirstLoad] = useState<boolean>(true);  
  const themePalette = AppServices.instance.getAppTheme();

  const loadInstances = async () => {
    let user = await  AppServices.instance.userServices.getUser();
    setUser(user);
    let instances = await AppServices.instance.deploymentServices.GetInstances();
    setInstances(instances!.model!);
  }

  useFocusEffect(() => {
    if(firstLoad){
      setFirstLoad(false);
      loadInstances();    
    }
  })

  const showInstance = (instance: Deployment.DeploymentInstanceSummary) => {
    AppServices.instance.navService.navigate('instancePage', { instanceId: instance.id, repoId: instance.deviceRepoId, instanceName: instance.name });
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
        <View style={{ flexDirection: 'row' }} onTouchStart={() => AppServices.instance.navService.navigate('userOptionsPage')}>
          <IconIonicons name="cog-outline" color={colors.white} size={24} />    
        </View>
      )
    });
  });

  return (
    <Page  >
      <View style={[styles.stdPadding]} >
        <AppLogo />
        <Text style={[{ marginBottom: 5, color: themePalette.shellTextColor, fontSize: 24 }]}>{user?.currentOrganization.text} Instances</Text>
        <FlatList contentContainerStyle={{ height: "auto"  }} style={{ backgroundColor: themePalette.background, width: "100%" }} 
          ItemSeparatorComponent={myItemSeparator} ListEmptyComponent={myListEmpty}data={instances} renderItem={({ item }) => 
            <Pressable onPress={() => showInstance(item)} key={item.id} >
              <View style={[styles.listRow, { display:"flex", alignItems:"center", gap:16, padding: 8, margin: 8, height: 72, backgroundColor: themePalette.inputBackgroundColor, borderRadius: 8 }]}  >              
                <View style={{ backgroundColor: colors.primaryBlue, borderRadius: 8, height: 56, width: 56, alignItems: "center", justifyContent: "center",}}>
                      <SLIcon icon={item.icon} />
                  </View>
                <View style={{ flexDirection: 'column', flex: 1 }}>
              <View > <Text style={{ color: themePalette.name === 'light' ? colors.darkTitle : colors.white  , marginBottom: 3, fontSize: 16 }}>{item.name}</Text>
              </View>
                <Text style={{ color:themePalette.subtitleColor, fontSize: 14 }}>{item.description}</Text>
              </View>
            
              <Icon name="chevron-right" color={themePalette.subtitleColor} size={24} style={{ textAlign: "center", marginRight: 8}} />
              </View>
            </Pressable>
          }
        />
        </View>
    </Page>
  );
}