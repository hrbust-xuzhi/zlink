import fs from 'fs';
import path from 'path';

export function copyFolderSync(source: string, target: string,) {
    // 创建目标文件夹
    fs.mkdir(target, { recursive: true }, () => {
        // 获取源文件夹中的文件和子文件夹列表
        const files = fs.readdirSync(source);

        // 遍历源文件夹中的每个文件和子文件夹
        files.forEach(file => {
            if (file.includes('node_modules')) {
                return ;
            }
            const sourcePath = path.join(source, file);
            const targetPath = path.join(target, file);

            // 判断是文件还是文件夹
            if (fs.statSync(sourcePath).isDirectory()) {
                // 如果是文件夹，递归调用 copyFolderSync
                copyFolderSync(sourcePath, targetPath);
            } else {
                // 如果是文件，直接复制
                fs.copyFileSync(sourcePath, targetPath);
            }
        });
    });
}
