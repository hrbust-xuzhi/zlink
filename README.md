RN link解决办法
此工具用来调试依赖三方库，基本和npm link 效率保持一致

最近一直用三方库调试，但是RN不支持本地Link，但是每次改动发布，重新install很低效；
网上找到的最快方法是：package.json依赖版本，替换成文件路径，如下所示： 但这种方法也无法实时同时本地代码，需要手动执行yarn upgrade [包名]才可以更新代码，快的话要10s+，慢的话要60s+，能提效，但有限。
	我手动写了一个zlink工具，可以实时同步依赖库代码，刷新RN页面，以下介绍如何使用
安装
npm --registry https://registry.npmjs.org/ i -g krn-xzlink@latest
link
在项目中根目录调试
yarn install
zlink  packagePath//packagePath是依赖库根目录 
 
开发
打开依赖库，修改的代码会同步到项目node_modules中，并自动更新页面
