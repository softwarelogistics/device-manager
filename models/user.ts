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

  export class AppUser {
    firstName: string;
    lastName: string;
    userName: string;
    isOrgAdmin: boolean;
    isAppBuilder: boolean;
    isDeviceUser: boolean;
    isSystemAdmin: boolean;
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
    country: string;
    postalCode: string;
    currentOrganization: Core.EntityHeader;
    currentOrganizationInitials?: string;
    email: string;
    phoneNumber: string;
    profileImageUrl: Core.Image;
    externalLogins: ExternalLogin[];
    mediaResources: Core.EntityHeader[];

    termsAndConditionsAccepted: boolean;
    termsAndConditionsAcceptedIPAddress: string;
    termsAndConditionsAcceptedDateTime: string;

    initials?: string;
    themePalette?: any;

    toEntityHeader(): Core.EntityHeader {
      return {
        id: this.id,
        text: this.name
      };
    }
  }

  export class DistroListSummary {
    id: string;
    name: string;
    key: string;
    description: string;
  }

  export class CoreUserInfo {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
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

  export class AppUserSummary {
    id: string;
    name: string;
    email: string;
  }

  export class AppUserView {
    firstName: Core.FormField;
    lastName: Core.FormField;
    isOrgAdmin: Core.FormField;
    email: Core.FormField;
    phoneNumber: Core.FormField;
  }

  export class Org {
    id: string;
    name: string;
  }

  export class OrgUser {
    key: string;
    userName: string;
    email: string;
    profileImageUrl: string;
    orgId: string;
    organizationName: string;
    isOrgAdmin: boolean;
  }

  export class NewJobApplication {
    job: Core.EntityHeader;
    surveyResults: Core.EntityHeader[];
  }

  export class JobApplication {
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
    statusDate: string;
    surveyResults: Core.EntityHeader[];
    history: JobApplicationHistory[];
  }

  export class JobApplicationHistory {
    id?: string;
    status?: Core.EntityHeader;
    user?: Core.EntityHeader;
    dateStamp?: string;
    notes: string;
  }

  export class JobApplicationSummary {
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

  export class ExternalLogin {
    id: string;
    userName: string;
    email: string;
    firstName: string;
    lastName: string;
    organization: string;

    provider: Core.EntityHeader;

  }
}
