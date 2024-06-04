import { useState } from "react";
import { Button, View } from 'react-native';
import AppServices from "../services/app-services";
import { ThemePalette, ThemePaletteService } from "../styles.palette.theme";

export default function ThemeSwitcher(props: any) {
  const [themePalette, setThemePalette] = useState<ThemePalette>(AppServices.getAppTheme() as ThemePalette);
  
  const switchThemes = () => {
    let current = themePalette.name;
    let newPalette = current == 'dark' ? 'light' : 'dark';
    let nextPalette = ThemePaletteService.getThemePalette(newPalette)
    AppServices.setAppTheme(nextPalette);
    AppServices.themeChangeSubscription?.emit('changed', newPalette);
  
    setThemePalette(nextPalette);
  }

  return (
    <View style={{position:'absolute',  marginTop:40, marginRight: 10}}>
      <Button onPress={() => switchThemes()} title="ST"></Button>
    </View>
  );
}