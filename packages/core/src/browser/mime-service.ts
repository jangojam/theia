/********************************************************************************
 * Copyright (C) 2018 Red Hat, Inc. and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0.
 *
 * This Source Code may also be made available under the following Secondary
 * Licenses when the conditions for such availability set forth in the Eclipse
 * Public License v. 2.0 are satisfied: GNU General Public License, version 2
 * with the GNU Classpath Exception which is available at
 * https://www.gnu.org/software/classpath/license.html.
 *
 * SPDX-License-Identifier: EPL-2.0 OR GPL-2.0 WITH Classpath-exception-2.0
 ********************************************************************************/

import { inject, injectable, interfaces } from 'inversify';
import {
    createPreferenceProxy,
    FrontendApplication,
    FrontendApplicationContribution,
    PreferenceChange,
    PreferenceContribution,
    PreferenceProxy,
    PreferenceSchema,
    PreferenceService
} from '.';
import { MaybePromise } from '../common/types';

@injectable()
export class MimeService implements FrontendApplicationContribution {
    public static readonly FILES_ASSOCIATIONS_PREFERENCE: string = 'files.associations';

    @inject(PreferenceService)
    protected readonly preferenceService: PreferenceService;

    onStart?(app: FrontendApplication): MaybePromise<void> {
        this.preferenceService.onPreferenceChanged((e: PreferenceChange) => {
            if (e.affects(MimeService.FILES_ASSOCIATIONS_PREFERENCE)) {
                this.updateMime();
            }
        });
    }

    protected updateMime() {
        // stub
    }
}

export const filesystemAssociationsPreferenceSchema: PreferenceSchema = {
    'type': 'object',
    'properties': {
        'files.associations': {
            'type': 'object',
            'description': 'Configure file associations to languages (e.g. \"*.extension\": \"html\"). \
These have precedence over the default associations of the languages installed.'
        }
    }
};

export interface FileSystemAssociationsConfiguration {
    'files.associations': { [filepattern: string]: string };
}

export const FileSystemAssociationsPreferences = Symbol('FileSystemPreferences');
export type FileSystemAssociationsPreferences = PreferenceProxy<FileSystemAssociationsConfiguration>;

export function createFileSystemAssociationsPreferences(preferences: PreferenceService): FileSystemAssociationsPreferences {
    return createPreferenceProxy(preferences, filesystemAssociationsPreferenceSchema);
}

export function bindFileSystemAssociationsPreferences(bind: interfaces.Bind): void {
    bind(FileSystemAssociationsPreferences).toDynamicValue(ctx => {
        const preferences = ctx.container.get<PreferenceService>(PreferenceService);
        return createFileSystemAssociationsPreferences(preferences);
    }).inSingletonScope();

    bind(PreferenceContribution).toConstantValue({ schema: filesystemAssociationsPreferenceSchema });
}
