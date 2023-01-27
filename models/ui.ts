
namespace UI {
  export interface Field {
    order: number;
    name: string;
    label: string;
    fieldAttributes: any[];
  }

  export interface WidgetTemplate {
    widgetId: string;
    name: string;
    isBeta: boolean;
    key: string;
    icon: string;
    title: string;
    description: string;
    shortDescription: string;
    fields: Field[];
    getDefaultWidgetAttributes(): string;
  }

  export interface ViewWidget {
    widgetId: string;
    id: string;
    name: string;
    title: string;
    widget?: WidgetTemplate;
    order: number;
    widgetAttributes: any;
  }

  export interface View {
    key: string;
    help?: string;
    name: string;
    icon: string;
    title: string;
    isBeta: boolean;
    foregroundColor: string;
    backgroundColor: string;
    widgets: ViewWidget[];
  }

  export interface IoTApp {
    id: string;
    isReadOnly: boolean;
    isBeta: boolean;
    key: string;
    name: string;
    title: string;
    foregroundColor: string;
    backgroundColor: string;
    help: string;
    icon: string;
    dashboards: Dashboard[];
  }

  export interface Dashboard {
    id: string;
    isBeta: boolean;
    key: string;
    icon: string;
    ioTApp: Core.EntityHeader;
    name: string;
    title: string;
    help: string;
    views: View[];
  }

  export interface BreadCrumb {
    title: string;
    icon: string;
    route: string[],
  }

  export interface Module {
    title: string;
    description: string;
    icon: string;
    isNgx: boolean;
    isExternal: boolean;
    uri: string;
  }

  export interface Kiosk {
    id: string;
    key: string;
    name: string;
    title: string;
    help: string;
    isPublic: boolean;
    viewDefinitions: KioskViewDefinition[];
    views: KioskView[];
  }

  export interface KioskView extends View {
    dashboardName: string;
    displayDuration: number;
    sortOrder: number;
  }

  export interface KioskViewDefinition {
    dashboardKey: string;
    dashboardName: string;
    viewKey: string;
    viewName: string;
    sortOrder: number;
    displayDuration: number;
  }

  export class EnumDescription {
    name: string;
    key: string;
    label: string;
    help: string;
  }
}
