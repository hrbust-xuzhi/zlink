import { FSWatcher } from 'fs'
class WatchRegistry {
    pathWatchMap: {
        [key: string]: FSWatcher;
    } = {};
    registerWatch(path: string, watch: FSWatcher) {
        this.deleteWatch(path);
        this.pathWatchMap[path] = watch;
    }
    deleteWatch(path: string) {
        const lastWatch = this.pathWatchMap[path];
        if (typeof lastWatch?.close === 'function') {
            lastWatch.close();
        }
    }
}

export const watchRegistry = new WatchRegistry();