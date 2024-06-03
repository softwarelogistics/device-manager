import palettes from "./styles.palettes";

export class ThemePalette {
  blueBox: string;
  titleColor: string;
  background: string;
  viewBackground: string;
  blueText: string;
  border: string;
  buttonPrimary: string;
  buttonPrimaryBorderColor;
  buttonPrimaryText: string;
  buttonSecondary: string;
  buttonSecondaryBorderColor: string;
  buttonSecondaryText: string;
  buttonTertiary: string;
  buttonTertiaryBorderColor: string;
  buttonTertiaryText: string;
  currentOrganizationBackgroundColor: string;
  inputBackgroundColor: string;
  listItemIconColor: string;
  shell: string;
  shellNavColor: string;
  placeHolderText: string;
  shellTextColor: string;
  subtitleColor: string;
  accentColor: string;
  toggleColor: string;
  name: string;

  constructor() {
    this.blueBox = '';
    this.titleColor = '';
    this.background = '';
    this.viewBackground = '';
    this.blueText = "";
    this.border = '' ;
    this.buttonPrimary = '';
    this.buttonPrimaryBorderColor = '';
    this.buttonPrimaryText = '';
    this.buttonSecondary = '';
    this.buttonSecondaryBorderColor = '';
    this.buttonSecondaryText = '';
    this.buttonTertiary = '';
    this.buttonTertiaryBorderColor = '';
    this.buttonTertiaryText = '';
    this.currentOrganizationBackgroundColor = '';
    this.inputBackgroundColor = '';
    this.listItemIconColor = '';
    this.shell = '';
    this.shellNavColor = '';
    this.shellTextColor = ''
    this.subtitleColor = '';
    this.toggleColor = '';
    this.accentColor = '';
    this.name = '';
    this.placeHolderText = ''
  }
}

export class ThemePaletteService {
  static getThemePalette(theme: string): ThemePalette {
    // @ts-ignore
    return palettes[theme]!;
  }
}