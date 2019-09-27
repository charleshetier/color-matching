import { remote } from "main";
const remoteFs = remote.require('fs');

export const writeFile = (path: string, data: string): Promise<undefined> => remoteFs.promises.writeFile(path, data);

export const saveLUT = async (from: [number, number, number][], to: [number, number, number][]): Promise<any> => {
    const result = await remote.dialog.showSaveDialog({
        filters: [
            { name: '3DLut', extensions: ['cube'] }
        ]
    });

    if (!result.canceled && result.filePath) {

        const size = 16;
        const range = (size: number) => Array.from(Array(size).keys());
        const neutralCube = range(size).map(b => range(size).map(g => range(size)
            .map(r => [r, g, b]))).flatMap(o => o.flatMap(o => o))
            .map(rgb => rgb.map(c => c / (size - 1)))
            .map(rgb => [rgb[0].toFixed(6), rgb[1].toFixed(6), rgb[2].toFixed(6)] as [string, string, string]);

        // const cube1 = range(size)
        //     .map(b => range(size)
        //         .map(g => range(size)
        //             .map(r => [r * 0.1 / (size - 1), g / (size - 1), b / (size - 1)])))
        //     .flatMap(o => o.flatMap(o => o))
        //     .map(rgb => [rgb[0].toFixed(6), rgb[1].toFixed(6), rgb[2].toFixed(6)] as [string, string, string]);

        //         const content = `TITLE "test"

        const content = `TITLE "test"

#LUT size
LUT_3D_SIZE ${size}

#data domain
DOMAIN_MIN 0.0 0.0 0.0
DOMAIN_MAX 1.0 1.0 1.0

${neutralCube.map(rgb => rgb.join(' ')).join('\n')}`;

        await writeFile(result.filePath, content);
        console.log(`File saved successfuly at ${result.filePath}`);
    }
};