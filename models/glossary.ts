/// <reference path="./core/core.ts" />

namespace Glossary {
  export interface Glossary  {
    id: string;
    name: string;
    key: string;
    description: string;
    drafts: GlossaryTerm[];
    definitions: GlossaryTerm[];
  }

  export interface GlossaryView  {
    name: string;
    key: string;
    description: string;
  }

  export interface GlossarySummary {
    id: string;
    name: string;
    description: string;
  }

  export interface GlossaryTerm {
    id: string;
    name: string;
    isPublished: boolean;
    publishDate?: string;
    icon: string;
    key: string;
    definition: string;
    example: string;
    related: Core.EntityHeader[];
  }
}
