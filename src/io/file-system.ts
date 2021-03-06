import { remote } from "io";
import { RGB } from "core/model";
const remoteFs = remote.require('fs');

export const writeFile = (path: string, data: string): Promise<undefined> => remoteFs.promises.writeFile(path, data);

export const saveLUT = async (cube: { size: number, colors: RGB[] }): Promise<any> => {
    const result = await remote.dialog.showSaveDialog({
        filters: [
            { name: '3DLut', extensions: ['cube'] }
        ]
    });

    if (!result.canceled && result.filePath) {

        const size = cube.size;
        const content = `TITLE "test"

#LUT size
LUT_3D_SIZE ${size}

#data domain
DOMAIN_MIN 0.0 0.0 0.0
DOMAIN_MAX 1.0 1.0 1.0

${cube.colors
                .map(rgb => rgb
                    .map(c => Math.max(c, 0))
                    .map(o => o.toFixed(6)) as [string, string, string])
                .map(rgb => rgb.join(' ')).join('\n')}`;

        await writeFile(result.filePath, content);
        console.log(`File saved successfuly at ${result.filePath}`);
    }
};