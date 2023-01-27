/// <reference path="../core/core.ts" />

namespace Guide {
  export interface Guide {
    id: string;
    name: string;
    isPublic: boolean;
    isTopLevel: boolean;
    title: string;
    targetAudience: string;
    icon: string;
    key: string;
    howToFind: string;
    summary: string;
    description: string;
    prerequisites: string;
    specialNote: string;
    introduction: string;
    troubleShooting: string;
    userGuide: string;
    howToWritten: string;
    published: boolean;
    mediaResources: Core.EntityHeader[];
    guideCategory: Core.EntityHeader;
    guideStatus: Core.EntityHeader;
    glossary: GuideTerm[];
    resources: GuideHelpResources[];
    videos: GuideVideoLink[];
    steps: GuideStep[];
    questions: Question[];
  }

  export interface GuideQuickCreate {
    name: string;
    key: string;
    summary: string;
    guideCategory: Core.EntityHeader;
  }

  export interface Question {
    id: string;
    questionText: string;
    answers: Answer[];
  }

  export interface Answer {
    id: string;
    answerText: string;
    isCorrect: boolean;
  }

  export interface GuideTerm {
    id: string;
    key: string;
    name: string;
    link: string;
    dictionary: Core.EntityHeader;
    term: Core.EntityHeader;
  }

  export interface GuideNode{
      id: string;
      key: string
      name: string;
      status?: Core.EntityHeader;
      title: string;
      summary: string;
      childrenVisible: boolean;
      icon: string;
      parentGuide: Core.EntityHeader;
      childGuides: GuideNode[];
  }

  export interface GuideSummary {
    id: string;
    title: string;
    icon: string;
    key: string;
    name: string;
    summary: string;
    description: string;
    guideStatus: string;
    guideStatusKey: string;
    childGuides: GuideNode[];
  }

  export interface GuideStep {
    id: string;
    name: string;
    title: string;
    key: string;
    isChildGuide: boolean;
    isChildGuideStep: boolean;
    childGuide: Core.EntityHeader;
    childGuideStep: Core.EntityHeader;
    markdown: string;
    summary: string;
    initialController: string;
    initialView: string;
    description: string;
    considerations: string;
    videoLink: string;
    nuvIoTURL: string;
    resources: GuideHelpResources[];
  }

  export interface GuideStepView {
    name: Core.FormField;
    key: Core.FormField;
    isChildGuide: Core.FormField;
    isChildGuideStep: Core.FormField;
    childGuide: Core.FormField;
    childGuideStep: Core.FormField;
    summary: Core.FormField;
    initialController: Core.FormField;
    initialView: Core.FormField;
    description: Core.FormField;
    considerations: Core.FormField;
    title: Core.FormField;
    videoLink: Core.FormField;
    nuvIoTURL: Core.FormField;
    markdown: Core.FormField;
  }

  export interface GuideHelpResources {
    id: string;
    name: string;
    description: string;
    markDownContent: string;
    helpLink: string;
  }

  export interface GuideVideoLink {
    id: string;
    name: string;
    description: string;
    videoLink: string;
    embedHTML: string;
  }
}
