
const fs = require('fs');
const path = require('path');

// 获取文件位置
export function joinFilePath(folerPath: string, filePath: string | null): string {
    try {
        const isDirectory: boolean = fs.existsSync(folerPath) && fs.statSync(folerPath).isDirectory();
        return isDirectory ?  path.join(folerPath, filePath ?? '.') : folerPath;
    } catch  {
        return folerPath;
    }
}