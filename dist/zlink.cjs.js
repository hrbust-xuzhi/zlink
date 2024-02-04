#!/usr/bin/env node
'use strict';

var fs$2 = require('fs');
var path$2 = require('path');

// 复制文件
function copyFile(sourceFilePath, targetFilePath) {
    //@ts-ignore
    fs$2.readFile(sourceFilePath, 'utf8', function (err, data) {
        if (err) {
            console.error("Error reading source file: ".concat(err.message));
            return;
        }
        // 如果文件路径不存在，就创建改路径
        if (!fs$2.existsSync(targetFilePath)) {
            var folderPath = path$2.join(targetFilePath, '..');
            fs$2.mkdirSync(folderPath, { recursive: true });
        }
        // 将读取到的内容写入目标文件
        fs$2.writeFile(targetFilePath, data, 'utf8', function (err) {
            if (err) {
                console.error("Error writing to target file: ".concat(err.message));
                return;
            }
            console.error("File content copied from ".concat(sourceFilePath, " to ").concat(targetFilePath));
        });
    });
}

var WatchRegistry = /** @class */ (function () {
    function WatchRegistry() {
        this.pathWatchMap = {};
    }
    WatchRegistry.prototype.registerWatch = function (path, watch) {
        this.deleteWatch(path);
        this.pathWatchMap[path] = watch;
    };
    WatchRegistry.prototype.deleteWatch = function (path) {
        var lastWatch = this.pathWatchMap[path];
        if (typeof (lastWatch === null || lastWatch === void 0 ? void 0 : lastWatch.close) === 'function') {
            lastWatch.close();
        }
    };
    return WatchRegistry;
}());
var watchRegistry = new WatchRegistry();

/**
 * 删除文件和文件夹
 */
function deleteFileAndFolder(dir) {
    try {
        // 文件不存在直接返回
        if (!fs$2.existsSync(dir)) {
            return;
        }
        // 删除文件夹/文件
        var stats = fs$2.statSync(dir);
        if (stats.isFile()) {
            fs$2.unlink(dir, function () { });
            console.log("Delete File ".concat(dir));
            return;
        }
        if (stats.isDirectory()) {
            var files = fs$2.readdirSync(dir);
            files.forEach(function (file) {
                var newPath = path$2.join(dir, file);
                var stat = fs$2.statSync(newPath);
                if (stat.isDirectory()) {
                    //如果是文件夹就递归下去
                    deleteFileAndFolder(newPath);
                }
                else {
                    //删除文件
                    fs$2.unlinkSync(newPath);
                    console.log("Delete File ".concat(newPath));
                }
            });
            fs$2.rmdirSync(dir); //如果文件夹是空的，就将自己删除掉
            console.log("Delete Direction ".concat(dir));
            watchRegistry.deleteWatch(dir);
        }
    }
    catch (_a) {
        console.log('\x1b[31m${dir} delete failed! \x1b[0m');
    }
}

function copyFolderSync(source, target) {
    // 创建目标文件夹
    fs$2.mkdir(target, { recursive: true }, function () {
        // 获取源文件夹中的文件和子文件夹列表
        var files = fs$2.readdirSync(source);
        // 遍历源文件夹中的每个文件和子文件夹
        files.forEach(function (file) {
            if (file.includes('node_modules') || file.startsWith('.')) {
                return;
            }
            var sourcePath = path$2.join(source, file);
            var targetPath = path$2.join(target, file);
            // 判断是文件还是文件夹
            if (fs$2.statSync(sourcePath).isDirectory()) {
                // 如果是文件夹，递归调用 copyFolderSync
                copyFolderSync(sourcePath, targetPath);
            }
            else {
                // 如果是文件，直接复制
                fs$2.copyFileSync(sourcePath, targetPath);
            }
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
var args = parseArgs();

var fs$1 = require('fs');
var path$1 = require('path');
// 获取依赖包具体位置
function getDependencyPackagePath(projPath, packagePath) {
    var _a;
    if (projPath === void 0) { projPath = process.cwd(); }
    if (packagePath === void 0) { packagePath = '.'; }
    var packageJson = JSON.parse((_a = fs$1.readFileSync(path$1.join(packagePath, 'package.json'), 'utf-8')) !== null && _a !== void 0 ? _a : '{}');
    var packageName = packageJson === null || packageJson === void 0 ? void 0 : packageJson.name;
    var dependencyPackage = path$1.join(projPath, 'node_modules', packageName);
    return dependencyPackage;
}

var fs = require('fs');
var path = require('path');
// 获取文件位置
function joinFilePath(folerPath, filePath) {
    try {
        var isDirectory = fs.existsSync(folerPath) && fs.statSync(folerPath).isDirectory();
        return isDirectory ? path.join(folerPath, filePath !== null && filePath !== void 0 ? filePath : '.') : folerPath;
    }
    catch (_a) {
        return folerPath;
    }
}

// link三方库绝对路径
var TARGET_PACKAGE_PATH = Object.values(args)[0];
// 项目中三方库路径
var DEPENDENCY_PACKAGE_PATH = getDependencyPackagePath(process.cwd(), TARGET_PACKAGE_PATH);
// 监听文件
function watchFolder(folderPath, includesSelf) {
    if (includesSelf === void 0) { includesSelf = false; }
    // 获取文件夹中的所有文件和子文件夹
    var files = fs$2.readdirSync(folderPath);
    if (includesSelf) {
        files.push('.');
    }
    // 设置监听器
    files.forEach(function (file) {
        var fileOrFolderPath = path$2.join(folderPath, file);
        if (fs$2.statSync(fileOrFolderPath).isFile()) {
            return;
        }
        // 检查文件的类型，如果是文件夹，则递归调用 watchFolder
        if (fs$2.statSync(fileOrFolderPath).isDirectory()) {
            if (fileOrFolderPath.includes('node_modules') ||
                fileOrFolderPath.includes('/.')) {
                return;
            }
            watchFolder(fileOrFolderPath);
        }
        // 监听文件和文件夹
        var watcher = fs$2.watch(fileOrFolderPath, function (event, filename) {
            if (filename === null || filename === void 0 ? void 0 : filename.startsWith('.')) {
                return;
            }
            var targetFilePath = joinFilePath(fileOrFolderPath, filename);
            var relativePath = path$2.relative(TARGET_PACKAGE_PATH, targetFilePath);
            var dependencyFilePath = path$2.join(DEPENDENCY_PACKAGE_PATH, relativePath);
            // 删除文件夹、删除文件
            if (!fs$2.existsSync(targetFilePath)) {
                fs$2.existsSync(dependencyFilePath) && deleteFileAndFolder(dependencyFilePath);
            }
            else {
                console.log("File ".concat(targetFilePath, " changed!"));
                // 创建文件夹、创建文件、更改文件
                fs$2.stat(targetFilePath, function (err, stats) {
                    if (err) {
                        return;
                    }
                    if (stats.isDirectory()) {
                        fs$2.mkdir(dependencyFilePath, { recursive: true }, function (err) {
                            if (!err) {
                                watchFolder(targetFilePath, true);
                            }
                        });
                    }
                    if (stats.isFile()) {
                        copyFile(targetFilePath, dependencyFilePath);
                    }
                });
            }
        });
        watchRegistry.registerWatch(fileOrFolderPath, watcher);
        console.log("\u001B[32m Watching file changes in ".concat(fileOrFolderPath, " \u001B[0m"));
    });
}
copyFolderSync(TARGET_PACKAGE_PATH, DEPENDENCY_PACKAGE_PATH);
watchFolder(TARGET_PACKAGE_PATH);

exports.watchFolder = watchFolder;
