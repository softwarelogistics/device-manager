namespace Users {
  const JobApplication_Status_New = 'new';
  const JobApplication_Status_InProgress = 'inprogress';
  const JobApplication_Status_InReview = 'inreview';
  const JobApplication_Status_Interviewing = 'interviewing';
  const JobApplication_Status_OnHold = 'onhold';
  const JobApplication_Status_Rejected = 'rejected';

  const ExternalLogin_GitHub = 'github';
  const ExternalLogin_Microsoft = 'microsoft';
  const ExternalLogin_Google = 'google';
  const ExternalLogin_LinkedIn = 'linkedin';
  const ExternalLogin_Twitter = 'twitter';

  export interface OrganizationSummary {
    id: string;
    text: string;
    name: string;
    namespace: string;
    logo: string;
    icon: string;
    tagLine: string;
    defaultTheme: string;
  }

  export interface AppUser {
    firstName: string;
    lastName: string;
    userName: string;
    isOrgAdmin: boolean;
    isAppBuilder: boolean;
    isDeviceUser: boolean;
    isSystemAdmin: boolean;
    landingPage: string;
    isFinanceAdmin: boolean;
    title: string;
    teamsAccountName: string;
    id: string;
    name: string;
    bio: string;
    address1: string;
    address2: string;
    city: string;
    state: string;
    ssnSecretId: string;
    country: string;
    postalCode: string;
    currentOrganization: OrganizationSummary;
    currentOrganizationInitials: string;
    email: string;
    emailSignature: string;
    phoneNumber: string;
    showWelcome: boolean;
    emailConfirmed: boolean;
    profileImageUrl: Core.Image;
    externalLogins: ExternalLogin[];
    mediaResources: Core.EntityHeader[];
    roles: Core.EntityHeader[];
    ssn: string;

    key: string;

    termsAndConditionsAccepted: boolean;
    termsAndConditionsAcceptedIPAddress: string;
    termsAndConditionsAcceptedDateTime: string;
  }


  export interface CoreUserInfo {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    emailSignature: string;
    ssn?: string;
    phoneNumber: string;
    bio: string;
    title: string;
    teamsAccountName: string;
    address1: string;
    address2: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  }

  export interface AppUserSummary {
    id: string;
    name: string;
    email: string;
  }

  export interface UserSummary {
    id: string;
    name: string;
    key: string;
    email: string;
    phoneNumber: string;
    isOrgAdmin: boolean;
    isAppBuilder: boolean;
    isAccountDisabled: boolean;
    level: string;
    emailConfirmed: boolean;
    phoneNumberConfirmed: boolean;
    teamsAccountName: string;
  }

  export interface Register {
    appId?: string;
    appInstanceId?: string;
    deviceId?: string;
    clientType: string;
    clientId: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    password: string;
    confirmPassword: string;
    inviteId: string;
  }

  export interface RegisterView {
    appId: Core.FormField;
    appInstanceId: Core.FormField;
    deviceId: Core.FormField;
    clientType: Core.FormField;
    clientId: Core.FormField;
    firstName: Core.FormField;
    lastName: Core.FormField;
    email: Core.FormField;
    phoneNumber: Core.FormField;
    password: Core.FormField;
    confirmPassword: Core.FormField;
    inviteId: Core.FormField;
  }

  export interface ChangePasswordRequest{
    userId: string;
    oldPassword: string;
    newPassword: string;
  }

  export interface InviteUser {
    inviteFromUserId: string;
    inviteToOrgId: string;
    email: string;
    name: string;
    message: string;
  }

  export interface Invitation {
    rowKey: string;
    email: string;
    name: string;
    dateSent: string;
    message: string;
    status: string;
    invitedByName: string;
    linkId: string;
    organizationId: string;
    organizationName: string;
    accepted: string;
  }

  export interface SendPassword {
    email: string;
  }

  export interface ResetPassword {
    email: string;
    token: string;
    newPassword: string;
  }

  export interface InvitationView {
    rowKey: Core.FormField;
    email: Core.FormField;
    name: Core.FormField;
    dateSent: Core.FormField;
    message: Core.FormField;
    status: Core.FormField;
    invitedByName: Core.FormField;
    linkId: Core.FormField;
  }

  export interface AppUserView {
    firstName: Core.FormField;
    lastName: Core.FormField;
    teamsAccountName: Core.FormField;
    isAccountDisabled: Core.FormField;
    address1: Core.FormField;
    address2: Core.FormField;
    city: Core.FormField;
    state: Core.FormField;
    country: Core.FormField;
    postalCode: Core.FormField;
    email: Core.FormField;
    phoneNumber: Core.FormField;
  }

  export interface Organization {
    id: string;
    name: string;
    namespace: string;
    webSite: string;
    status: string;
    primaryLocation: Core.EntityHeader;
    adminContact: Core.EntityHeader;
    billingContact: Core.EntityHeader;
    technicalContact: Core.EntityHeader;
    defaultProjectLead: Core.EntityHeader;
    defaultProjectAdminLead: Core.EntityHeader;
    defaultContributor: Core.EntityHeader;
    defaultQAResource: Core.EntityHeader;
    defaultDeviceRepository: Core.EntityHeader;
    defaultInstance: Core.EntityHeader;
    locations: Core.EntityHeader[];
    landingPage: string;
    isArchived: boolean;
  }

  export interface OrganizationView {
    id: Core.FormField;
    name: Core.FormField;
    namespace: Core.FormField;
    webSite: Core.FormField;
    status: string;
    primaryLocation: Core.FormField;
    adminContact: Core.FormField;
    billingContact: Core.FormField;
    technicalContact: Core.FormField;
    defaultProjectLead: Core.FormField;
    defaultProjectAdminLead: Core.FormField;
    defaultContributor: Core.FormField;
    defaultQAResource: Core.FormField;
    locations: Core.FormField;
    landingPage: Core.FormField;
    isArchived: Core.FormField;
  }

  export interface OrgUser {
    key: string;
    userName: string;
    email: string;
    profileImageUrl: string;
    orgId: string;
    organizationName: string;
    isOrgAdmin: boolean;
  }

  export interface NewJobApplication {
    job: Core.EntityHeader;
    surveyResults: jobSurveyResponse[];
  }

  export interface NewOrganization {
    webSite: string,
    name: string,
    namespace: string
  }

  export interface NewOrganizationView {
    webSite: Core.FormField,
    name: Core.FormField,
    namespace: Core.FormField
  }

  export interface UserRole {
    id: string;
    user: Core.EntityHeader;
    role: Core.EntityHeader;
    organization: Core.EntityHeader;
    creeatedOn: string;
    createdBy: Core.EntityHeader;
  }

  export interface JobApplication {
    id: string;
    name: string;
    key: string;
    description: string;
    creationDate: string;
    notes: string;
    internalNotes?: string;
    candidate: Core.EntityHeader;
    job: Core.EntityHeader;
    status: Core.EntityHeader;
    ownerOrganization: Core.EntityHeader;
    statusDate: string;
    surveyResults: jobSurveyResponse[];
    history: JobApplicationHistory[];
  }

  export interface jobSurveyResponse extends Core.EntityHeader {
    orgId: string;
  }

  export interface JobApplicationHistory {
    id?: string;
    status?: Core.EntityHeader;
    user?: Core.EntityHeader;
    dateStamp?: string;
    notes: string;
  }

  export interface JobApplicationSummary {
    id: string;
    applicationDate: string;
    candidate: string;
    candidateUserId: string;
    jobName: string;
    name: string;
    key: string;
    jobId: string;
    status: string;
    statusKey: string;
    statusDate: string;
  }

  export interface ExternalLogin {
    id: string;
    userName: string;
    email: string;
    firstName: string;
    lastName: string;
    organization: string;

    provider: Core.EntityHeader;
  }

  export interface UserFavorites {
    id: string;
    key: string;
    ownerOrganization: Core.EntityHeader;
    ownerUser: Core.EntityHeader;
    isPublic: boolean;
    name: string;
    favorites: UserFavorite[];
    modules: FavoritesByModule[];
  }

  export interface UserFavorite {
    id?: string;
    dateAdded?: string;
    lastAdded?: string;
    name: string;
    type: string;
    moduleKey: string;
    summary: string;
    icon: string;
    link?: string;
    isRemoving?: boolean
    route?: string[];
  }

  export interface FavoritesByModule {
    id: string;
    moduleKey: string;
    items: UserFavorite[];
  }

  export interface MostRecentlyUsed {
    key: string;
    name: string;
    all: MostRecentlyUsedItem[];
    modules: MostRecentlyUsedModule[];
  }

  export interface MostRecentlyUsedModule {
    id: string;
    moduleKey: string;
    items: MostRecentlyUsedItem[];
  }

  export interface MostRecentlyUsedItem {
    moduleKey: string;
    route?: string[];
    name: string;
    type: string;
    summary: string;
    icon: string;
    link?: string;
    dateAdded?: string;
    lastAccessed?: string;
  }

  export interface UserLoginResponse extends Core.EntityHeader {
    user: AppUser;
    favorites: UserFavorites;
    mostRecentlyUsed: MostRecentlyUsed;
  }

  export interface InboxItem {
    rowKey: string;
    partitionKey: string;
    type: string;
    scope: string;
    index: number | null;
    viewed: boolean;
    title: string;
    icon: string;
    summary: string;
    link: string;
    creationDate: string;
    createdBy: string;
  }
}
