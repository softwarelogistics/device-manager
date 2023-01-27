/// <reference path="../core/core.ts" />

namespace Media {
    export interface MediaLibrary {
        id: string;
        key: string;
        name: string;
        description: string;
    }

    export interface MediaLibrarySummary {
        id: string;
        key: string;
        name: string;
        description: string;
    }

    export interface MediaLibraryView {
        key: Core.FormField;
        name: Core.FormField;
        description: Core.FormField;
    }

    export interface MediaResource {
        id: string;
        fileName: string;
        key: string;
        isFileUpload: boolean;
        link: string;
        isPublic: boolean;
        contentSize: number;
        mimeType: string;
        name: string;
        description: string;
        storageReferenceName: string;
        mediaLibrary: Core.EntityHeader;
        resourceType: Core.EntityHeader;
    }

    export interface MediaResourceView {
        fileName: Core.FormField;
        key: Core.FormField;
        isFileUpload: Core.FormField;
        link: Core.FormField;
        contentSize: Core.FormField;
        mimeType: Core.FormField;
        name: Core.FormField;
        description: Core.FormField;
        mediaLibrary: Core.FormField;
        resourceType: Core.FormField;
    }

    export interface MediaResourceSummary {
        id: string;
        key: string;
        name: string;
        isFileUpload: string;
        description: string;
        link: string;
        resourceType: string;
    }
}
