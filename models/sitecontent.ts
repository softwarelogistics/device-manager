/// <reference path="./core/core.ts" />

namespace SiteContent {
  export interface SiteContent  {
    id: string;
    name: string;
    isPublic: boolean;
    key: string;
    description: string;
    icon: string;
    contentType: Core.EntityHeader;
    draft: Content;
    published: Content;
    lastUpdatedDate: string;
    lastUpdatedBy: Core.EntityHeader;
  }



  export interface Content {
    title: string;
    summary: string;
    markDown: string;
    internalNotes: string;
  }

  export interface SiteContentSummary {
    id: string;
    name: string;
    contentType: string;
    isPublished: boolean;
    description: string;
  }
}
