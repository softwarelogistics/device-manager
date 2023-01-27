import { ImageStyle, TextStyle, ViewStyle } from "react-native";

const ViewStylesHelper = {

  combineImageStyles: (sourceStyles: ImageStyle[]): ImageStyle => {
    const result: ImageStyle = {};

    for (let sourceStyle of sourceStyles) {
      // @ts-ignore
      Object.keys(sourceStyle).map((key: any) => result[key] = sourceStyle[key]);
    }

    return result;
  },

  combineTextStyles: (sourceStyles: TextStyle[]): TextStyle => {
    const result: TextStyle = {};

    for (let sourceStyle of sourceStyles) {
      // @ts-ignore
      Object.keys(sourceStyle).map((key: any) => result[key] = sourceStyle[key]);
    }

    return result;
  },

  combineViewStyles: (sourceStyles: ViewStyle[]): ViewStyle => {
    const result: ViewStyle = {};

    for (let sourceStyle of sourceStyles) {
      // @ts-ignore
      Object.keys(sourceStyle).map((key: any) => result[key] = sourceStyle[key]);
    }

    return result;
  },

  combineInlineStyles: (sourceStyles: any[]): ElementCSSInlineStyle => {
    // @ts-ignore
    const result: ElementCSSInlineStyle = { style: {} };

    for (let sourceStyle of sourceStyles) {
      // @ts-ignore
      Object.keys(sourceStyle).map((key: any) => result.style[key] = sourceStyle[key]);
    }

    return result;
},

};

export default ViewStylesHelper;