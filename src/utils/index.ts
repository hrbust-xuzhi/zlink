const fs = require('fs');
const path = require('path');
/**
 * 删除文件夹 or 文件
 */
export function removeDir(dir: string): void {
    if (fs.statSync(dir).isFile()) {
        fs.unlinkSync(dir);
        return ;
    }
    let files = fs.readdirSync(dir);
    for (var i = 0; i < files.length; i++) {
        let newPath = path.join(dir, files[i]);
        let stat = fs.statSync(newPath);
        if (stat.isDirectory()) {
            //如果是文件夹就递归下去
            removeDir(newPath);
        } else {
            //删除文件
            fs.unlinkSync(newPath);
        }
    }
    fs.rmdirSync(dir); //如果文件夹是空的，就将自己删除掉
}