// 解析cli参数
export function parseArgs() {
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

export const args = parseArgs();