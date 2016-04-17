export default class ProxyConfiguration {

    /**
     *
     * @param {Service} fromService
     * @param {Service} toService
     * @param {Boolean} isSticky
     * @param {Integer} traffic
     * @param {[Header]} headers
     */
    constructor(fromService, toService, isSticky, traffic, headers) {
        this.fromService = fromService;
        this.toService = toService;
        this.isSticky = isSticky;
        this.traffic = traffic;
        this.headers = headers;
    }

}