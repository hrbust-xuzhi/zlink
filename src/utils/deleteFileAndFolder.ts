import fs from 'fs';
import path from 'path';
import { watchRegistry } from './watchRegistry';
/**
 * 删除文件和文件夹
 */
export function deleteFileAndFolder(dir: string): void {
    try {
        // 文件不存在直接返回
        if (!fs.existsSync(dir)) {
            return ;
        }
        // 删除文件夹/文件
        const stats = fs.statSync(dir);
        if (stats.isFile()) {
            fs.unlink(dir, () => {});
            console.log(`Delete File ${dir}`);
            return ;
        }
        if (stats.isDirectory()) {
            const files = fs.readdirSync(dir);
            files.forEach((file) => {
                const newPath = path.join(dir, file);
                const stat = fs.statSync(newPath);
                if (stat.isDirectory()) {
                    //如果是文件夹就递归下去
                    deleteFileAndFolder(newPath);
                } else {
                    //删除文件
                    fs.unlinkSync(newPath);
                    console.log(`Delete File ${newPath}`);
                }
            });
            fs.rmdirSync(dir); //如果文件夹是空的，就将自己删除掉
            console.log(`Delete Direction ${dir}`);
            watchRegistry.deleteWatch(dir);
        }
    } catch {
        console.log('\x1b[31m${dir} delete failed! \x1b[0m');
    }
    
}