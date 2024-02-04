#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { args, copyFile, deleteFileAndFolder, copyFolderSync, getDependencyPackagePath } from "./utils/index";
import { joinFilePath } from './utils/joinFilePath';
// link三方库绝对路径
const TARGET_PACKAGE_PATH: string = Object.values(args)[0];
// 项目中三方库路径
const DEPENDENCY_PACKAGE_PATH = getDependencyPackagePath(
    process.cwd(),
    TARGET_PACKAGE_PATH,
);

// 监听文件
export function watchFolder(folderPath: string, includesSelf: boolean = false) {
    // 获取文件夹中的所有文件和子文件夹
    const files = fs.readdirSync(folderPath);
    if (includesSelf) {
        files.push('.');
    }

    // 设置监听器
    files.forEach((file: string) => {
        const fileOrFolderPath = path.join(folderPath, file);

        if (fs.statSync(fileOrFolderPath).isFile()) {
            return ;
        }

        // 检查文件的类型，如果是文件夹，则递归调用 watchFolder
        if (fs.statSync(fileOrFolderPath).isDirectory()) {
            if (
                fileOrFolderPath.includes('node_modules') ||
                fileOrFolderPath.includes('/.')
            ) {
                return;
            }
            watchFolder(fileOrFolderPath);
        }
        
        // 监听文件和文件夹
        fs.watch(fileOrFolderPath, (event, filename) => {
            if (filename?.startsWith('.')) {
                return ;
            }
            const targetFilePath = joinFilePath(fileOrFolderPath, filename);
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
                fs.existsSync(dependencyFilePath) && deleteFileAndFolder(dependencyFilePath);
            } else {
                console.log(`File ${targetFilePath} changed!`);
                // 创建文件夹、创建文件、更改文件
                fs.stat(targetFilePath, (err, stats) => {
                    if (err) {
                        return;
                    }
                    if (stats.isDirectory()) {
                        fs.mkdir(
                            dependencyFilePath,
                            { recursive: true },
                            (err) => {
                                if (!err) {
                                    watchFolder(targetFilePath, true);
                                }
                            },
                        );
                    }
                    if (stats.isFile()) {
                        copyFile(targetFilePath, dependencyFilePath);
                    }
                });
            }
        });
        console.log(`\x1b[32m Watching file changes in ${fileOrFolderPath} \x1b[0m`);
    });
}
copyFolderSync(TARGET_PACKAGE_PATH, DEPENDENCY_PACKAGE_PATH);
watchFolder(TARGET_PACKAGE_PATH);
