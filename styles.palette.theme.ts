import palettes from "./styles.palettes";

export class ThemePalette {
  background: string;
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
  shellTextColor: string;
  toggleColor: string;
  name: string;

  constructor() {
    this.background = '';
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
    this.shellTextColor = '';
    this.toggleColor = '';
    this.name = '?'
  }
}

export class ThemePaletteService {
  static getThemePalette(theme: string): ThemePalette {
    // @ts-ignore
    return palettes[theme]!;
  }
}