
const fs = require('fs');
const path = require('path');

// 获取依赖包具体位置
export function getDependencyPackagePath(projPath = process.cwd(), packagePath = '.') {
    const packageJson = JSON.parse(
        fs.readFileSync(path.join(packagePath, 'package.json'), 'utf-8') ??
            '{}',
    );
    const packageName = packageJson?.name;
    const dependencyPackage = path.join(projPath, 'node_modules', packageName);
    return dependencyPackage;
}