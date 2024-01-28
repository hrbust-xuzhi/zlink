import fs from 'fs';
import path from 'path';

// 复制文件
export function copyFile(sourceFilePath: string, targetFilePath: string) {
    //@ts-ignore
    fs.readFile(sourceFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error(`Error reading source file: ${err.message}`);
            return;
        }
        // 如果文件路径不存在，就创建改路径
        if (!fs.existsSync(targetFilePath)) {
            const folderPath = path.join(targetFilePath, '..');
            fs.mkdirSync(folderPath, { recursive: true });
        }
        // 将读取到的内容写入目标文件
        fs.writeFile(targetFilePath, data, 'utf8', (err: any) => {
            if (err) {
                console.error(`Error writing to target file: ${err.message}`);
                return;
            }
            console.error(
                `File content copied from ${sourceFilePath} to ${targetFilePath}`,
            );
        });
    });
}