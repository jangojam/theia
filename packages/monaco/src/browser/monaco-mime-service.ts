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

import { MimeService, FileSystemAssociationsConfiguration } from '@theia/core/lib/browser/mime-service';
import { PreferenceService } from '@theia/core/lib/browser/preferences/preference-service';
import { inject, injectable } from 'inversify';

@injectable()
export class MonacoMimeService extends MimeService {
    @inject(PreferenceService)
    protected readonly preferenceService: PreferenceService;

    protected updateMime(): void {
        monaco.mime.clearTextMimes(true);

        const associations = this.preferenceService.get('files.associations') as FileSystemAssociationsConfiguration['files.associations'];
        if (associations) {
            Object.keys(associations).forEach(pattern => {
                const langId = associations[pattern];
                const mimetype = this.getMimeForMode(langId) || `text/x-${langId}`;
                monaco.mime.registerTextMime({ id: langId, mime: mimetype, filepattern: pattern, userConfigured: true }, false);
            });
        }
    }

    protected getMimeForMode(langId: string): string | undefined {
        for (const language of monaco.languages.getLanguages()) {
            if (language.id === langId && language.mimetypes) {
                return language.mimetypes[0];
            }
        }

        return undefined;
    }
}
