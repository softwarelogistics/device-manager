namespace Orgs {

  export interface Subscription {
    id: string;
    name: string;
    key: string;
    icon: string;
    description: string;
    customerId: string;
    status: string;

    paymentTokenExpires: string;
    paymentToken: string;
    paymentTokenDate: string;
    paymentTokenStatus: string;
  }

  export interface SubscriptionSummary {
    status: string;
    PaymentTokenStatus: string;
  }

  export interface SubscriptionView {
    name: Core.FormField;
    key: Core.FormField;
    icon: Core.FormField;
    description: Core.FormField;
    customerId: Core.FormField;
    status: Core.FormField;

    paymentTokenExpires: Core.FormField;
    paymentToken: Core.FormField;
    paymentTokenDate: Core.FormField;
    paymentTokenStatus: Core.FormField;
  }

  export interface ScheduledDowntimePeriod {
    id: string;
    name: string;
    key: string;
    description: string;
    start: number;
    end: number;
  }

  export interface ScheduledDowntimePeriodView {
    name: Core.FormField;
    key: Core.FormField;
    description: Core.FormField;
    start: Core.FormField;
    end: Core.FormField;
  }

  export interface ScheduledDowntimeSummary extends Core.SummaryData {
  }

  export interface ScheduledDowntime {
    originalId: string;
    isPublic: boolean;
    ownerOrganization: Core.EntityHeader;
    ownerUser: Core.EntityHeader;
    name: string;
    key: string;
    description: string;
    scheduleType: Core.EntityHeader;
    downtimeType: Core.EntityHeader;
    year: number | null;
    month: Core.EntityHeader;
    day: number | null;
    dayOfWeek: Core.EntityHeader;
    week: number | null;
    allDay: boolean;
    periods: ScheduledDowntimePeriod[];
  }

  export interface ScheduledDowntimeView {
    name: Core.FormField;
    key: Core.FormField;
    description: Core.FormField;
    scheduleType: Core.FormField;
    downtimeType: Core.FormField;
    year:  Core.FormField;
    month: Core.FormField;
    day: Core.FormField;
    dayOfWeek: Core.FormField;
    week: Core.FormField;
    allDay: Core.FormField;
    periods: Core.FormField;
  }

  export interface HolidaySet {
    id: string;
    name: string;
    key: string;
    description: string;
    cultureOrCountry: string;
    icon: string;
    holidays: ScheduledDowntime[];
    isPublic: boolean;
    ownerOrganization: Core.EntityHeader;
    ownerUser: Core.EntityHeader;
  }

  export interface HolidaySetSummary extends Core.SummaryData {
    cultureOrCountry: string;
  }

  export interface HolidaySetView {
    name: Core.FormField;
    key: Core.FormField;
    description: Core.FormField;
    cultureOrCountry: Core.FormField
    icon: Core.FormField
    holidays: Core.FormField
    isPublic: Core.FormField
    ownerOrganization: Core.FormField
    ownerUser: Core.FormField
  }


  export interface DistroListSummary {
    id: string;
    name: string;
    key: string;
    description: string;
  }

  export interface DistroList {
    id: string;
    name: string;
    key: string;
    description: string;
    isPublic: boolean;
    appUsers: Core.EntityHeader[];
  }

  export interface DistroListView {
    name: Core.FormField;
    key: Core.FormField;
    description: Core.FormField;
  }

  export interface CreateOrgViewModel {
    name: string;
    webSite: string;
    namespace: string;
    createGettingStartedData: boolean;
  }

  export interface CreateOrgViewModelView {
    name: Core.FormField;
    webSite: Core.FormField;
    namespace: Core.FormField;
    createGettingStartedData: Core.FormField;
  }

  export interface LocationDiagram  {
    name: string;
    key: string;
    icon: string;
    description: string;
    notes: string;
    location: Core.EntityHeader;
    width: number;
    height: number;
    layers: LocationDiagramLayer[];
  }

  export interface LocationDiagramView  {
    name: Core.FormField;
    key: Core.FormField;
    icon: Core.FormField;
    description: Core.FormField;
    notes: Core.FormField;
    location: Core.FormField;
    width: Core.FormField;
    height: Core.FormField;
    layers: Core.FormField;
  }

  export interface LocationDiagramShape {
    id: string;
    name: string;
    key: string;
    icon: string;
    location: Core.EntityHeader;
    notes: string;
    locked: boolean;
    x: number;
    y: number;
    width: number;
    height: number;
    flipX: boolean;
    flipY: boolean;
    shapeType: Core.EntityHeader;
    rotation: number;
    scale: number;
    stroke: string;
    fill: string;
    points: ShapePoint[];
    details: LocationDiagram;

    editing: boolean;
  }

  export interface ShapePoint {
    x: number;
    y: number;
  }

  export interface LocationDiagramShapeView {
    name: Core.FormField;
    key: Core.FormField;
    icon: Core.FormField;
    location: Core.FormField;
    notes: Core.FormField;
    x: Core.FormField;
    y: Core.FormField;
    width: Core.FormField;
    height: Core.FormField;
    flipX: Core.FormField;
    flipY: Core.FormField;
    shapeType: Core.FormField;
    rotation: Core.FormField;
    scale: Core.FormField;
    stroke: Core.FormField;
    fill: Core.FormField;
    points: Core.FormField;
    details: Core.FormField;
  }

  export interface LocationDiagramLayer {
    id: string;
    name: string;
    key: string;
    icon: string;
    description: string;
    locked: boolean;
    visible: boolean;
    shapes: LocationDiagramShape[];
    groups: LocationDiagramShapeGroup[];
  }


  export interface LocationDiagramLayerView {
    name: Core.FormField;
    key: Core.FormField;
    icon: Core.FormField;
    description: Core.FormField;
    locked: Core.FormField;
    visible: Core.FormField;
  }


  export interface LocationDiagramShapeGroup {
    id: string;
    name: string;
    key: string;
    icon: string;
    description: string;
    shapes: Core.EntityHeader[];
  }

  export interface LocationDiagramShapeGroupView {
    name: Core.FormField;
    key: Core.FormField;
    icon: Core.FormField;
    description: Core.FormField;
  }

  export interface LocationDiagramSummary extends Core.SummaryData {
    baseLocation: Core.EntityHeader;
  }

  export interface LocationDevice
  {
      device: Core.EntityHeader;
  }

  export interface OrgLocation {
    id: string;
    key: string;
    organization: Core.EntityHeader;
    category: Core.EntityHeader;
    icon: string;
    name: string;
    geoLocation: Core.GeoLocation;
    roomNumber: string;
    addr1: string;
    addr2: string;
    city: string;
    stateProvince: string;
    postalCode: string;
    country: string;
    adminContact: Core.EntityHeader;
    technicalContact: Core.EntityHeader;
    description: string;
    notes: string;
    isPublic: boolean;
    ownerOrganization: Core.EntityHeader;
    ownerUser: Core.EntityHeader;
    devices: LocationDevice[];
  }

  export interface OrgLocationView {
    category: Core.FormField;
    icon: Core.FormField;
    geoLocation: Core.FormField;
    name: Core.FormField;
    roomNumber: Core.FormField;
    addr1: Core.FormField;
    addr2: Core.FormField;
    city: Core.FormField;
    stateProvince: Core.FormField;
    postalCode: Core.FormField;
    country: Core.FormField;
    adminContact: Core.FormField;
    technicalContact: Core.FormField;
    description: Core.FormField;
    notes: Core.FormField;
    isPublic: Core.FormField;
    ownerOrganization: Core.FormField;
    ownerUser: Core.FormField;
  }

  export interface OrgLocationSummary {
    id: string,
    name: string,
    key: string,
    city?: string,
    state?: string,
    roomNumber?: string;
    adminContact?: Core.EntityHeader;
  }
}
