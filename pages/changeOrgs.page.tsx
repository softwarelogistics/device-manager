import React, { useEffect, useState } from "react";

import { IReactPageServices } from "../services/react-page-services";
import { View, Text, FlatList, ActivityIndicator, Pressable, Alert, ViewStyle, TextStyle } from "react-native";
import MciIcon from "react-native-vector-icons/MaterialCommunityIcons";
import OctIcon from "react-native-vector-icons/Octicons";

import AppServices from '../services/app-services';

import styles from '../styles';
import colors from "../styles.colors";
import ViewStylesHelper from "../utils/viewStylesHelper";
import palettes from "../styles.palettes";
import Page from "../mobile-ui-common/page";
import { LogWriter, showError, showMessage } from "../mobile-ui-common/logger";
import { currentOrganizationHeaderNameStyle, selectOrganizationCircleStyle, selectOrganizationTextStyle } from "../compound.styles";

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
    await LogWriter.log('[ChangeOrgPage__setNewUserOrg]', `Org=${org.organizationName}`);
    let result = await AppServices.instance.userServices.changeOrganization(org.orgId);
    if (result) {
      AppServices.instance.userServices.refreshToken();
      let user = await AppServices.instance.userServices.getUser();
      setUser(user);

      showMessage('Organization Changed', `Welcome to the ${user?.currentOrganization.text}!`)
    }
    else {
      showError('Error','Error changing organization');
    }
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

  const circleColors: string[] = [
    palettes.accent2.normal,
    palettes.accent1.normal,
    palettes.accent.normal
  ];

  let idx: number = 0;
  return (
    <Page>
        {
          orgs && user && 
          <View style={{ height:'100%', backgroundColor: themePalette.background, width: "100%" }}>
              <FlatList
                contentContainerStyle={{ backgroundColor: themePalette.background, alignItems: "stretch" }}
                style={{ backgroundColor: themePalette.background}}
                ItemSeparatorComponent={myItemSeparator}
                stickyHeaderIndices={[0]}
                ListHeaderComponent={() => {
                  return ( 
                      <View style={[styles.currentOrganizationView, { backgroundColor: themePalette.currentOrganizationBackgroundColor }]}>
                        <Text style={currentOrganizationHeaderNameStyle}>{user.currentOrganization.text}</Text>
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