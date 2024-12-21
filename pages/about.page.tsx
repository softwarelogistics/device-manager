import React from 'react';
import { IReactPageServices } from '../services/react-page-services';
import Page from '../mobile-ui-common/page';
import styles from '../styles';
import * as Updates from 'expo-updates';
import AppServices from '../services/app-services';
import IconButton from '../mobile-ui-common/icon-button';
import { StaticContent } from '../services/content';
import Paragraph from '../mobile-ui-common/paragraph';
import { AppLogo } from '../mobile-ui-common/AppLogo';
import WebLink from '../mobile-ui-common/web-link';
import AppVersionLabel from '../mobile-ui-common/AppVersion';
import { View } from 'react-native';

export const AboutPage = ({ props, navigation, route }: IReactPageServices) => {

  const themePalette = AppServices.instance.getAppTheme();
  const onFetchUpdateAsync = async () => {
    console.log('hi there');
    try {
      const update = await Updates.checkForUpdateAsync();

      if (update.isAvailable) {
        await Updates.fetchUpdateAsync();
        await Updates.reloadAsync();
      }
      else {
        alert('No Updates Available.');
      }
    } catch (error) {
      // You can also add an alert() to see the error message in case of an error when fetching updates.
      alert(`Error fetching latest Expo update: ${error}`);
    }
  }

  return <Page style={[styles.container,  { backgroundColor: themePalette.background }]}>
          <View style={[styles.stdPadding]}>
            <AppLogo />
            <Paragraph content={StaticContent.appDescription}></Paragraph>
            <IconButton color={themePalette.buttonPrimaryText} label={StaticContent.checkForUpdates} icon="cloud-download-outline" iconType="ion" onPress={() => onFetchUpdateAsync()} ></IconButton>
        
            <WebLink url="https://www.software-logistics.com" label="Software Logistics, LLC"  />
            <WebLink url="https://www.nuviot.com" label="NuvIoT"  />
            <WebLink url="https://app.termly.io/document/terms-of-use-for-saas/90eaf71a-610a-435e-95b1-c94b808f8aca" label="Terms and Conditions"  />
            <WebLink url="https://app.termly.io/document/privacy-policy/fb547f70-fe4e-43d6-9a28-15d403e4c720" label="Privacy Statement"  />          
            <AppVersionLabel />
          </View>
        </Page>;
}