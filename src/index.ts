const fs = require('fs');
const path = require('path');

// 复制文件
function copyFile(sourceFilePath: string, targetFilePath: string) {
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
        //@ts-ignore
        fs.writeFile(targetFilePath, data, 'utf8', (err) => {
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
// 解析cli参数
function parseArgs() {
    // 获取命令行参数
    const args = process.argv.slice(2);

    // 解析命令行参数
    const options: {
        [key: string]: any;
    } = {};
    args?.forEach((arg) => {
        if (arg.startsWith('--')) {
            // 长参数，例如 --name=value
            const [name, value] = arg.slice(2).split('=');
            options[name] = value;
        } else if (arg.startsWith('-')) {
            // 短参数，例如 -n value
            const [name, value] = arg.slice(1).split('=');
            options[name] = value;
        } else {
            // 没有参数名，例如 value
            options[arg] = arg;
        }
    });
    return Object.keys(options).length > 0 ? options : {};
}

// 获取依赖包具体位置
function getDependencyPackagePath(projPath = process.cwd(), packagePath = '.') {
    const packageJson = JSON.parse(
        fs.readFileSync(path.join(packagePath, 'package.json'), 'utf-8') ??
            '{}',
    );
    const packageName = packageJson?.name;
    const dependencyPackage = path.join(projPath, 'node_modules', packageName);
    return dependencyPackage;
}
const args = parseArgs();
// link三方库绝对路径
const TARGET_PACKAGE_PATH = Object.values(args)[0];
// 项目中三方库路径
const DEPENDENCY_PACKAGE_PATH = getDependencyPackagePath(
    process.cwd(),
    TARGET_PACKAGE_PATH,
);

// 监听文件
function watchFolder(folderPath: string) {
    // 获取文件夹中的所有文件和子文件夹
    const files = fs.readdirSync(folderPath);

    // 设置监听器
    files.forEach((file: string) => {
        const filePath = path.join(folderPath, file);

        // 检查文件的类型，如果是文件夹，则递归调用 watchFolder
        if (fs.statSync(filePath).isDirectory()) {
            if (
                filePath.includes('node_modules') ||
                filePath.includes('/.git')
            ) {
                return;
            }
            watchFolder(filePath);
        }
        // 如果是文件，则设置监听器
        //@ts-ignore
        fs.watch(filePath, (event, filename) => {
            const targetFilePath = path.join(filePath, filename);
            const relativePath = path.relative(
                TARGET_PACKAGE_PATH,
                targetFilePath,
            );
            const dependencyFilePath = path.join(
                DEPENDENCY_PACKAGE_PATH,
                relativePath,
            );
            // 删除文件夹、删除文件
            if (!fs.existsSync(targetFilePath)) {
                fs.unlink(dependencyFilePath, () => {});
            } else {
                console.log(`File ${targetFilePath} changed!`);
                // 创建文件夹、创建文件、更改文件
                //@ts-ignore
                fs.stat(targetFilePath, (err, stats) => {
                    if (err) {
                        return;
                    }
                    if (stats.isDirectory()) {
                        fs.mkdir(
                            dependencyFilePath,
                            { recursive: true },
                            () => {},
                        );
                    }
                    if (stats.isFile()) {
                        copyFile(targetFilePath, dependencyFilePath);
                    }
                });
            }
        });
        console.log(`\x1b[32m Watching file changes in ${filePath} \x1b[0m`);
    });
}
watchFolder(TARGET_PACKAGE_PATH);

// const folderPath = '/Users/xuzhi/michael/RNSDK/nearby-rn/LocalLifeDatePicker';
// fs.watch(folderPath, (eventType, filename) => {
//     const filePath = path.join(folderPath, filename);

//     if (eventType === 'rename') {
//         // 文件创建
//         console.log(`File created: ${filePath}`);
//     } else if (eventType === 'change') {
//         // 文件修改
//         console.log(`File changed: ${filePath}`);
//     } else if (eventType === 'unlink') {
//         // 文件删除
//         console.log(`File deleted: ${filePath}`);
//     }
// });
