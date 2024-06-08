import { Image, ScrollView } from "react-native";

import IconButton from "../mobile-ui-common/icon-button";
import AppServices from "../services/app-services";
import styles from '../styles';
import { IReactPageServices } from "../services/react-page-services";
import Page from "../mobile-ui-common/page";

export const WelcomePage = ({ navigation, props, route }: IReactPageServices) => {  
  return (
    <Page >
      <ScrollView style={[styles.stdPadding]}>
        <Image style={styles.logoImage} source={require('../assets/app-icon.png')} />
          <IconButton label="Home" icon="home" iconType="ion" onPress={() => AppServices.instance.navService.replace('homePage')} ></IconButton>
          <IconButton label="Switch Organization" icon="podium-outline" iconType="ion" onPress={() => AppServices.instance.navService.navigate('changeOrgsPage')} ></IconButton>
          <IconButton label="Settings" icon="settings-outline" iconType="ion" onPress={() => AppServices.instance.navService.navigate('accountPage')} ></IconButton>
          <IconButton label="About" icon="information-circle-outline" iconType="ion" onPress={() => AppServices.instance.navService.navigate('aboutPage')} ></IconButton>
          <IconButton label="Log Out" icon="log-out-outline" iconType="ion" onPress={() => AppServices.instance.navService.logout()} ></IconButton>        
      </ScrollView>
    </Page>
  )
}