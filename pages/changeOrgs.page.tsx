import React, { useEffect, useState } from "react";

import { IReactPageServices } from "../services/react-page-services";
import { StatusBar } from "expo-status-bar";
import { View, Text, FlatList, ActivityIndicator, Pressable, Alert, ViewStyle, TextStyle } from "react-native";
import MciIcon from "react-native-vector-icons/MaterialCommunityIcons";
import OctIcon from "react-native-vector-icons/Octicons";

import AppServices from '../services/app-services';

import styles from '../styles';
import colors from "../styles.colors";
import fontSizes from "../styles.fontSizes";
import ViewStylesHelper from "../utils/viewStylesHelper";
import palettes from "../styles.palettes";
import Page from "../mobile-ui-common/page";

export const ChangeOrgPage = ({ props, navigation, route }: IReactPageServices) => {

  const [initialCall, setInitialCall] = useState<boolean>(true);
  const [orgs, setOrgs] = useState<Users.OrgUser[]>();
  const [user, setUser] = useState<Users.AppUser>();
  
  const themePalette = AppServices.instance.getAppTheme();

  const loadUserOrgs = async () => {
    await AppServices.instance.userServices.getOrgsForCurrentUser()
      .then(orgResult => {
        setOrgs(orgResult.model);
      })
      .then(async () => {
        await AppServices.instance.userServices.getUser()
          .then(user => {
            setUser(user);
          });
      });
  };

  const setNewUserOrg = async (org: Users.OrgUser) => {
    console.log('ChangeOrgPage__setNewUserOrg, Org=' + org.organizationName);
    let result = await AppServices.instance.userServices.changeOrganization(org.orgId);
    if (result) {
      AppServices.instance.userServices.refreshToken();
    }

    let user = await AppServices.instance.userServices.getUser();
    setUser(user);

    Alert.alert('Organization Changed', `Welcome to the ${user?.currentOrganization.text}!`)
  };

  const myItemSeparator = () => { return <View style={{ height: 1, backgroundColor: "#c0c0c0git ", marginHorizontal: 6 }} />; };

  const myListEmpty = () => {
    return (
      <View style={{ backgroundColor: themePalette.background, alignItems: "center" }}>
        <Text style={[styles.item, { color: themePalette.shellTextColor }]}> no data </Text>
      </View>
    );
  };

  useEffect(() => {
    if (initialCall) {
      setInitialCall(false);
      loadUserOrgs();
    }
  });

  const currentOrganizationHeaderCircleStyle: TextStyle = ViewStylesHelper.combineTextStyles([styles.iconButtonCircle, styles.alignCenter, { color: colors.white, fontSize: 72, marginTop: 16, textAlign: 'center' }]);
  const currentOrganizationHeaderCircleOverlayStyle: TextStyle = ViewStylesHelper.combineTextStyles([styles.iconButtonCircleOverlay, { color: colors.accentColor, fontSize: 21.3333, fontWeight: '400', top: -(fontSizes.iconButtonLarge + 20) }]);
  const currentOrganizationHeaderNameStyle: TextStyle = ViewStylesHelper.combineTextStyles([styles.alignCenter, { color: colors.white, marginTop: 0, paddingTop: 0, fontSize: 18, fontWeight: '700', top: -(fontSizes.iconButtonLarge - 10) }]);
  const selectOrganizationCircleStyle: TextStyle = ViewStylesHelper.combineTextStyles([styles.iconButtonCircle, { color: colors.transparent, fontSize: 48, marginTop: 0, paddingTop: 0 }]);
  const selectOrganizationTextStyle: TextStyle = ViewStylesHelper.combineTextStyles([styles.alignVerticalMiddle, { color: themePalette.shellTextColor, marginLeft: -14, marginTop: 14, paddingTop: 0, fontSize: 18, fontWeight: '700' }]);

  const circleColors: string[] = [
    palettes.accent2.normal,
    palettes.accent1.normal,
    palettes.accent.normal
  ];

  let idx: number = 0;
  return (
    <Page style={[styles.container, { backgroundColor: themePalette.background }]}>
      <StatusBar style="auto" />
        {
          orgs && user && 
          <View style={{ height:'100%', backgroundColor: themePalette.background, width: "100%" }}>
              <FlatList
                contentContainerStyle={{ backgroundColor: themePalette.background, alignItems: "stretch" }}
                style={{ backgroundColor: themePalette.background}}
                ItemSeparatorComponent={myItemSeparator}
                stickyHeaderIndices={[0]}
                ListHeaderComponent={() => {
                  return ( <View style={{height:'auto', backgroundColor: themePalette.background }} >
                      <Text style={[styles.currentOrganizationHeader, { color: themePalette.shellTextColor }]}>Current Organization</Text>
                      <View style={[styles.currentOrganizationView, { backgroundColor: themePalette.currentOrganizationBackgroundColor }]}>
                        <View>
                          <MciIcon name='circle' style={currentOrganizationHeaderCircleStyle} />
                          <Text style={currentOrganizationHeaderCircleOverlayStyle}>{user.currentOrganizationInitials || '?'}</Text>
                        </View>
                        <Text style={currentOrganizationHeaderNameStyle}>{user.currentOrganization.text}</Text>
                      </View>
                      <Text style={[styles.currentOrganizationHeader, { marginTop: 30, color: themePalette.shellTextColor, fontWeight: 600 }]}>Switch Organization:</Text>
                 </View>
                  )
                }}
                ListEmptyComponent={myListEmpty}
                data={orgs}
                renderItem={({ item }) =>
                  <Pressable onPress={() => setNewUserOrg(item)} key={item.orgId} >
                    <View style={[styles.listRow, { padding: 10, backgroundColor: (idx++ % 2 == 0 ? themePalette.shell : themePalette.background) }]}  >
                      <MciIcon name='circle' style={[selectOrganizationCircleStyle, { color: circleColors[idx % 3] }]} />
                      <OctIcon name="organization" color={colors.white} style={{ marginTop: 0, marginLeft: 0, left: -32, top: 14, fontSize: 18 }} />
                      <Text style={selectOrganizationTextStyle}>{item.organizationName}</Text>
                    </View>
                  </Pressable>
                }
              />
          </View>
        }
      </Page>
  )
}

export default ChangeOrgPage;