#!/usr/bin/env node
'use strict';

var fs$1 = require('fs');
var path$1 = require('path');
/**
 * 删除文件夹 or 文件
 */
function removeDir(dir) {
    if (fs$1.statSync(dir).isFile()) {
        fs$1.unlinkSync(dir);
        return;
    }
    var files = fs$1.readdirSync(dir);
    for (var i = 0; i < files.length; i++) {
        var newPath = path$1.join(dir, files[i]);
        var stat = fs$1.statSync(newPath);
        if (stat.isDirectory()) {
            //如果是文件夹就递归下去
            removeDir(newPath);
        }
        else {
            //删除文件
            fs$1.unlinkSync(newPath);
        }
    }
    fs$1.rmdirSync(dir); //如果文件夹是空的，就将自己删除掉
}

var fs = require('fs');
var path = require('path');
// 复制文件
function copyFile(sourceFilePath, targetFilePath) {
    //@ts-ignore
    fs.readFile(sourceFilePath, 'utf8', function (err, data) {
        if (err) {
            console.error("Error reading source file: ".concat(err.message));
            return;
        }
        // 如果文件路径不存在，就创建改路径
        if (!fs.existsSync(targetFilePath)) {
            var folderPath = path.join(targetFilePath, '..');
            fs.mkdirSync(folderPath, { recursive: true });
        }
        // 将读取到的内容写入目标文件
        //@ts-ignore
        fs.writeFile(targetFilePath, data, 'utf8', function (err) {
            if (err) {
                console.error("Error writing to target file: ".concat(err.message));
                return;
            }
            console.error("File content copied from ".concat(sourceFilePath, " to ").concat(targetFilePath));
        });
    });
}
// 解析cli参数
function parseArgs() {
    // 获取命令行参数
    var args = process.argv.slice(2);
    // 解析命令行参数
    var options = {};
    args === null || args === void 0 ? void 0 : args.forEach(function (arg) {
        if (arg.startsWith('--')) {
            // 长参数，例如 --name=value
            var _a = arg.slice(2).split('='), name_1 = _a[0], value = _a[1];
            options[name_1] = value;
        }
        else if (arg.startsWith('-')) {
            // 短参数，例如 -n value
            var _b = arg.slice(1).split('='), name_2 = _b[0], value = _b[1];
            options[name_2] = value;
        }
        else {
            // 没有参数名，例如 value
            options[arg] = arg;
        }
    });
    return Object.keys(options).length > 0 ? options : {};
}
// 获取依赖包具体位置
function getDependencyPackagePath(projPath, packagePath) {
    var _a;
    if (projPath === void 0) { projPath = process.cwd(); }
    if (packagePath === void 0) { packagePath = '.'; }
    var packageJson = JSON.parse((_a = fs.readFileSync(path.join(packagePath, 'package.json'), 'utf-8')) !== null && _a !== void 0 ? _a : '{}');
    var packageName = packageJson === null || packageJson === void 0 ? void 0 : packageJson.name;
    var dependencyPackage = path.join(projPath, 'node_modules', packageName);
    return dependencyPackage;
}
var args = parseArgs();
// link三方库绝对路径
var TARGET_PACKAGE_PATH = Object.values(args)[0];
// 项目中三方库路径
var DEPENDENCY_PACKAGE_PATH = getDependencyPackagePath(process.cwd(), TARGET_PACKAGE_PATH);
// 获取文件位置
function getFilePath(folerPath, filePath) {
    try {
        var result = fs.statSync(folerPath).isDirectory() ? path.join(folerPath, filePath) : folerPath;
        return result;
    }
    catch (_a) {
        return folerPath;
    }
}
// 监听文件
function watchFolder(folderPath) {
    // 获取文件夹中的所有文件和子文件夹
    var files = fs.readdirSync(folderPath);
    // 设置监听器
    files.forEach(function (file) {
        var filePath = path.join(folderPath, file);
        // 检查文件的类型，如果是文件夹，则递归调用 watchFolder
        if (fs.statSync(filePath).isDirectory()) {
            if (filePath.includes('node_modules') ||
                filePath.includes('/.git')) {
                return;
            }
            watchFolder(filePath);
        }
        // 如果是文件，则设置监听器
        //@ts-ignore
        fs.watch(filePath, function (event, filename) {
            var targetFilePath = getFilePath(filePath, filename);
            var relativePath = path.relative(TARGET_PACKAGE_PATH, targetFilePath);
            var dependencyFilePath = path.join(DEPENDENCY_PACKAGE_PATH, relativePath);
            // 删除文件夹、删除文件
            if (!fs.existsSync(targetFilePath)) {
                removeDir(dependencyFilePath);
            }
            else {
                console.log("File ".concat(targetFilePath, " changed!"));
                // 创建文件夹、创建文件、更改文件
                //@ts-ignore
                fs.stat(targetFilePath, function (err, stats) {
                    if (err) {
                        return;
                    }
                    if (stats.isDirectory()) {
                        fs.mkdir(dependencyFilePath, { recursive: true }, function () { });
                    }
                    if (stats.isFile()) {
                        copyFile(targetFilePath, dependencyFilePath);
                    }
                });
            }
        });
        console.log("\u001B[32m Watching file changes in ".concat(filePath, " \u001B[0m"));
    });
}
watchFolder(TARGET_PACKAGE_PATH);
