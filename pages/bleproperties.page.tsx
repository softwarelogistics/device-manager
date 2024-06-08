import React, { useEffect, useState } from "react";
import { StatusBar } from 'expo-status-bar';
import { TouchableOpacity, View, Text, TextInput } from "react-native";
import { IReactPageServices } from "../services/react-page-services";

import styles from '../styles';
import AppServices from "../services/app-services";

export const BlePropertiesPage = ({ props, navigation, route }: IReactPageServices) => {

  const themePalette = AppServices.instance.getAppTheme();

  useEffect(() => {    
  }, []);


  return (
    <View style={[styles.container, { backgroundColor: themePalette.background }]}>
      <StatusBar style="auto" />


    </View>
  );
}