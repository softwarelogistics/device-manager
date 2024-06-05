import React, { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";

import IconIonicons from "react-native-vector-icons/Ionicons";
import IconMaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import IconFeather from "react-native-vector-icons/Feather";
import ChevronIcons from "react-native-vector-icons/Entypo";

import Page from "../mobile-ui-common/page";
import AppServices from "../services/app-services";
import { IReactPageServices } from "../services/react-page-services";
import { ThemePalette } from "../styles.palette.theme";
import { Subscription } from "../utils/NuvIoTEventEmitter";
import { Button } from "react-native-ios-kit";
import {
  ActionSheetIOS,
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import SLIcon from "../mobile-ui-common/sl-icon";
import styles from "../styles";
import ModalSelector from "react-native-modal-selector";
import colors from "../styles.colors";

export const InstancePage = ({
  navigation,
  props,
  route,
}: IReactPageServices) => {
  const [appServices, setAppServices] = useState<AppServices>(
    new AppServices()
  );
  const [themePalette, setThemePalette] = useState<ThemePalette>(
    {} as ThemePalette
  );
  const [initialCall, setInitialCall] = useState<boolean>(true);
  const [subscription, setSubscription] = useState<Subscription | undefined>(
    undefined
  );
  const [deviceModelFilter, setDeviceModelFilter] = useState<
    Core.EntityHeader | undefined
  >(undefined);

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const [allDevices, setAllDevices] = useState<
    Devices.DeviceSummary[] | undefined
  >(undefined);
  const [devices, setDevices] = useState<Devices.DeviceSummary[] | undefined>(
    undefined
  );

  const [deviceModels, setDeviceModels] = useState<Core.EntityHeader[]>([]);

  const instanceId = route.params.instanceId;
  const deviceRepoId = route.params.repoId;
  const instanceName = route.params.instanceName;

  const loadDevices = async () => {
    let result = await appServices.deviceServices.getDevicesForRepoAsync(
      deviceRepoId
    );
    let uniqueDeviceModels: Core.EntityHeader[] = [];

    for (let device of result.model!) {
      if (
        uniqueDeviceModels.filter((mod) => mod.id == device.deviceTypeId)
          .length == 0
      ) {
        uniqueDeviceModels.push({
          id: device.deviceTypeId,
          text: device.deviceType,
        });
      }
    }

    uniqueDeviceModels = uniqueDeviceModels.sort((a, b) =>
      a.text > b.text ? 1 : -1
    );

    uniqueDeviceModels.unshift({ id: "all", text: "All Device Models" });
    setDeviceModelFilter(uniqueDeviceModels[0]);

    let devices = result.model!.sort((a, b) =>
      a.deviceName > b.deviceName ? 1 : -1
    );

    setDevices(devices);
    setAllDevices(devices);

    setDeviceModels(uniqueDeviceModels);
  };

  const addDevice = () => {
    navigation.navigate("scanPage", {
      repoId: deviceRepoId,
      instanceId: instanceId,
    });
  };

  const showDevice = (deviceSummary: Devices.DeviceSummary) => {
    if (deviceSummary.deviceTypeId === "D37B01208A6B4C4D8953C53435F1AD59") {
      navigation.navigate("seaWolfHomePage", {
        id: deviceSummary.id,
        repoId: deviceRepoId,
      });
    } else {
      navigation.navigate("deviceProfilePage", {
        id: deviceSummary.id,
        repoId: deviceRepoId,
      });
    }
  };

  const deviceTypeChanged = async (id: string) => {
    setDeviceModelFilter(deviceModels.find((itm) => itm.id == id));

    if (id === "all") setDevices(allDevices);
    else {
      let deviceModels = allDevices?.filter((dev) => dev.deviceTypeId == id);
      setDevices(deviceModels);
    }
  };

  const deviceModelFilterSelected = async () => {
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: deviceModels.map((item) => item.text),
        destructiveButtonIndex: 2,
        cancelButtonIndex: 0,
        userInterfaceStyle: "dark",
      },
      (buttonIndex) => {
        if (buttonIndex === 0) {
          // cancel action
        } else if (buttonIndex > 1) {
          deviceTypeChanged(deviceModels[buttonIndex].id);
        }
      }
    );
  };

  useEffect(() => {
    let palette = AppServices.getAppTheme();
    setThemePalette(palette);

    navigation.setOptions({
      headerRight: () => (
        <View style={{ flexDirection: "column" }}>
          <IconIonicons.Button
            backgroundColor="transparent"
            underlayColor="transparent"
            color={palette.shellNavColor}
            onPress={() => addDevice()}
            name="add-outline"
          />
        </View>
      ),
    });

    if (initialCall) {
      loadDevices();
      setInitialCall(false);
    }

    let changed = AppServices.themeChangeSubscription.addListener(
      "changed",
      () => setThemePalette(AppServices.getAppTheme())
    );
    setSubscription(changed);
    return () => {
      if (subscription)
        AppServices.themeChangeSubscription.remove(subscription);
    };
  }, []);

  const toggleViewMode = (mode: "grid" | "list") => {
    setViewMode(mode);
  };

  return (
    <Page
      style={[styles.container, { backgroundColor: themePalette.background }]}
    >
      <View
        style={{
          width: "100%",
          height: '100%',
          flexDirection: "column",
          padding: 16,
          backgroundColor: themePalette.background,
        }}
      >
        <Text
          style={[
            { color: themePalette.shellTextColor, fontSize: 24 },
          ]}
        >
          {instanceName}
        </Text>
        <View
          style={{
            flexDirection: "row-reverse",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >

          <View style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 10
          }}>
            <IconIonicons
              name="grid-outline"
              size={24}
              color={themePalette.shellTextColor}
              style={{ textAlign: "center" }}
              onPress={() => toggleViewMode("grid")}
            />

            <IconMaterialCommunityIcons
              name="format-list-checkbox"
              size={24}
              color={themePalette.shellTextColor}
              style={{ textAlign: "center" }}
              onPress={() => toggleViewMode("list")}
            />
          </View>

          {Platform.OS == "ios" && deviceModelFilter && (
            <Button
              style={{ color: themePalette.shellTextColor, margin: 20 }}
              inline
              onPress={() => deviceModelFilterSelected()}
            >
              {deviceModelFilter.text}
            </Button>
          )}
          {Platform.OS == "ios" && !deviceModelFilter && (
            <Button title="-all-" onPress={() => deviceModelFilterSelected()} />
          )}
          {Platform.OS != "ios" && (
            <ModalSelector
              data={deviceModels.map((itm) => ({
                key: itm.id,
                label: itm.text,
              }))}
              initValue={deviceModelFilter?.text}
              onChange={(option) => deviceTypeChanged(option.key)}
            >
              <Button
                style={{ color: themePalette.shellTextColor, marginBottom: 24, marginTop: 24 }}
              >
                {deviceModelFilter?.text}
              </Button>
            </ModalSelector>
          )}
        </View>
        <ScrollView >
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              flexWrap: "wrap",
              backgroundColor: themePalette.background,
              width: '100%',
              height: '100%',
              overflow: "visible"

            }}
          >
            {viewMode === "grid" &&
              devices &&
              devices.map((item, key) => (
                <Pressable onPress={() => showDevice(item)} key={item.id}>
                  <View
                    style={[
                      {
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 16,
                        padding: 16,
                        height: 180,
                        width: 160,
                        backgroundColor: themePalette.inputBackgroundColor,
                        borderRadius: 8,
                        margin: 8,
                        shadowColor: "#1F2F4C",
                        shadowOffset: {
                          width: 0,
                          height: 2,
                        },
                        shadowOpacity: 0.3,
                        shadowRadius: 4,
                        elevation: 5,
                      },
                    ]}
                  >
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

                    <View style={{ gap: 6 }}>
                      <Text
                        style={[
                          {
                            color: themePalette.shellTextColor,
                            fontSize: 16,
                          },
                        ]}
                      >
                        {item.deviceName}
                      </Text>

                      <Text
                        style={{
                          color: themePalette.subtitleColor,
                          fontSize: 12,
                        }}
                      >
                        {item.deviceType}
                      </Text>
                    </View>
                  </View>
                </Pressable>
              ))}
            {viewMode === "list" &&
              devices &&
              devices.map((item, key) => (
                <Pressable onPress={() => showDevice(item)} key={item.id} style={{ width: '100%' }}>
                  <View
                    style={[
                      styles.listRow,
                      {
                        display: "flex",
                        alignItems: "center",
                        gap: 16,
                        padding: 16,
                        margin: 8,
                        width: "100%",
                        backgroundColor: themePalette.inputBackgroundColor,
                        shadowColor: "#1F2F4C",
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.2,
                        shadowRadius: 2,
                        borderRadius: 8,
                      },
                    ]}
                  >
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

                    <View style={{ flexGrow: 1 }}>
                      <Text
                        style={{
                          color: themePalette.shellTextColor,
                          fontSize: 16,
                        }}
                      >
                        {item.deviceName}
                      </Text>
                      <Text
                        style={{
                          color: themePalette.subtitleColor,
                          fontSize: 14,
                        }}
                      >
                        {item.deviceType}
                      </Text>
                    </View>

                    <ChevronIcons
                      name="chevron-right"
                      color={themePalette.subtitleColor}
                      size={24}
                      style={{
                        textAlign: "center",
                      }}
                    />

                  </View>
                </Pressable>
              ))}
          </View>
        </ScrollView>
      </View>
    </Page>
  );
};
