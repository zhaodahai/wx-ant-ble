module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = { exports: {} }; __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); if(typeof m.exports === "object") { Object.keys(m.exports).forEach(function(k) { __MODS__[modId].m.exports[k] = m.exports[k]; }); if(m.exports.__esModule) Object.defineProperty(__MODS__[modId].m.exports, "__esModule", { value: true }); } else { __MODS__[modId].m.exports = m.exports; } } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1547525437444, function(require, module, exports) {

var __TEMP__ = require('./src/btmanager.js');var BTManager = __TEMP__['BTManager'];
var __TEMP__ = require('./src/enum.js');var ConnectStatus = __TEMP__['ConnectStatus'];var SuccessCallbackEvent = __TEMP__['SuccessCallbackEvent'];var ErrorCallbackEvent = __TEMP__['ErrorCallbackEvent'];var SuccessApiThen = __TEMP__['SuccessApiThen'];var ErrorApiCatch = __TEMP__['ErrorApiCatch'];
const Version = '1.1.0';

if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });Object.defineProperty(exports, 'Version', { enumerable: true, get: function() { return Version; } });Object.defineProperty(exports, 'BTManager', { enumerable: true, get: function() { return BTManager; } });Object.defineProperty(exports, 'ConnectStatus', { enumerable: true, get: function() { return ConnectStatus; } });Object.defineProperty(exports, 'SuccessCallbackEvent', { enumerable: true, get: function() { return SuccessCallbackEvent; } });Object.defineProperty(exports, 'ErrorCallbackEvent', { enumerable: true, get: function() { return ErrorCallbackEvent; } });Object.defineProperty(exports, 'SuccessApiThen', { enumerable: true, get: function() { return SuccessApiThen; } });Object.defineProperty(exports, 'ErrorApiCatch', { enumerable: true, get: function() { return ErrorApiCatch; } });








}, function(modId) {var map = {"./src/btmanager.js":1547525437445,"./src/enum.js":1547525437447}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1547525437445, function(require, module, exports) {


var __TEMP__ = require('./extends.js');var Log = __TEMP__['Log'];
var __TEMP__ = require('./enum.js');var ConnectStatus = __TEMP__['ConnectStatus'];
var __TEMP__ = require('./bluetooth.js');var Bluetooth = __REQUIRE_DEFAULT__(__TEMP__);

if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });exports.BTManager = class BTManager {

  /**
   *  构造函数
   *
   *  @param {object} config          配置
   *   @property {boolean} debug       是否开启打印调试，默认不开启
   * 
   *  @discussion 单例模式。
   */
  constructor(config = {}) {
    if (!BTManager.instance) {
      BTManager.instance = this;
      // 初始化log
      Log.call(BTManager.prototype);
      // 初始化设备信息
      this.deviceInfo = {};
      // 初始化连接状态
      this.connectStatus = ConnectStatus.disconnected;
      // 初始化蓝牙管理器
      this._bt = new Bluetooth(this);
    }
    // 合并配置
    Object.assign(BTManager.instance, config);
    return BTManager.instance;
  }

  /**
   *  扫描外设
   *
   *  @param {object} options                扫描参数
   *   @property {array} services             主service的uuid列表。确认在蓝牙广播中存在此服务id，可以通过服务id过滤掉其他设备
   *   @property {boolean} allowDuplicatesKey 是否允许重复上报设备
   *   @property {number} interval            上报新设备的间隔，默认为0
   *   @property {number} timeout             扫描超时时间，毫秒。在该时间内未扫描到符合要求的设备，上报超时。默认15000ms，-1表示无限超时
   *   @property {string} deviceName          通过蓝牙名称过滤，需要匹配的设备名称
   *   @property {string} containName         通过蓝牙名称过滤，需要包含的设备名称
   * 
   *  @return Promise对象
   * 
   *  @discussion 开始扫描外设，注意实现返回对象的then和catch方法，监听接口是否调用成功。
   *              此操作比较耗费系统资源，请在搜索到设备后调用stopScan方法停止扫描。
   *              重复调用此接口，会清空之前设备存储，再次上报已上报的设备，能够起到刷新的作用。
   * 
   *  @see registerDidDiscoverDevice
   */
  scan( options = { 
          services: [],
          allowDuplicatesKey: false,
          interval : 0,
          timeout: 15000,
          deviceName: '', 
          containName:''
      }) 
  {
    return this._bt.scanDevice(options);
  }

  /**
   *  停止扫描
   *
   *  @return Promise对象
   * 
   *  @discussion 停止扫描，取消超时延时。
   */
  stopScan() {
    return this._bt.stopScan();
  }

  /**
   *  连接外设
   * 
   *  @param {object} device  指定连接的外设对象，从registerDidDiscoverDevice注册的回调中得到
   *  @param {number} timeout 连接超时时间，毫秒，默认15000ms，支付宝小程序无效
   * 
   *  @return Promise对象
   * 
   *  @discussion 连接指定的外设，需要传入外设对象。
   *              注意实现返回对象的then和catch方法，监听接口是否调用成功。
   */
  connect(device , timeout) {
    if (!device) throw new Error('device is undefiend');
    return this._bt.connect(device);
  }

  /**
   *  断开连接
   * 
   *  @return Promise对象
   */
  disconnect() {
    return this._bt.disconnect();
  }

  /**
   *  读特征值
   * 
   *  @param {object} params     参数
   *   @property {string} suuid    特征对应的服务uuid
   *   @property {string} cuuid    特征uuid
   * 
   *  @return Promise对象
   * 
   *  @discussion 读某个服务下的某个特征值。
   */
  read(params = {
        suuid: '',
        cuuid: ''
      }) 
  {
    return this._bt.read(params);
  }

  /**
   *  向蓝牙模块写入数据
   * 
   *  @param {object} params        参数
   *   @property {string} suuid       特征对应的服务uuid
   *   @property {string} cuuid       特征uuid
   *   @property {Hex string} value   16进制字符串 
   * 
   *  @return Promise对象
   * 
   *  @discussion 向蓝牙模块写入数据。
   */
  write(params = {
          suuid: '',
          cuuid: '',
          value: ''
       })
  {
    return this._bt.write(params);
  }

  /**
   *  监听特征值改变
   * 
   *  @param {object} params        参数
   *   @property {string} suuid       特征对应的服务uuid
   *   @property {string} cuuid       特征uuid
   *   @property {boolean} state      是否启用notify，可以通过重复调用接口改变此属性打开/关闭监听  
   * 
   *  @return Promise对象
   * 
   *  @discussion 监听某个特征值变化。
   */
  notify(params = {
          suuid: '',
          cuuid: '',
          state: true,
        }) 
  {
    return this._bt.notify(params);
  }

  /**
   *  注册状态改变回调
   *
   *  @param {function} cb 回调函数
   * 
   *  @discussion 连接状态发生改变时，回调此方法。
   */
  registerDidUpdateConnectStatus(cb) {
    if (typeof cb !== 'function') throw new TypeError('connectStatus callback expect function');
    this._bt.registerDidUpdateConnectStatus(cb);
  }

  /**
   *  注册发现外设回调
   *
   *  @param {function} cb 回调函数
   * 
   *  @discussion 当扫描到设备时回调，或者达到超时时间回调。
   */
  registerDidDiscoverDevice(cb) {
    if (typeof cb !== 'function') throw new TypeError('discoverDevice callback expect function');
    this._bt.registerDidDiscoverDevice(cb);
  }

  /**
   *  注册特征值改变回调
   *
   *  @param {function} cb 回调函数
   * 
   *  @discussion 当监听的特征值改变时回调，或者读特征值时回调。
   */
  registerDidUpdateValueForCharacteristic(cb) {
    if (typeof cb !== 'function') throw new TypeError('updateValueForCharacteristic callback expect function');
    this._bt.registerDidUpdateValueForCharacteristic(cb);
  }

};
}, function(modId) { var map = {"./extends.js":1547525437446,"./enum.js":1547525437447,"./bluetooth.js":1547525437448}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1547525437446, function(require, module, exports) {


if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });exports.Log = function Log() {

  this.log = function(identifier, msg='') {
    this.debug && console.log(`BLE:（${identifier}）:` , msg);
  }

  this.loginfo = function(identifier,msg) {
    this.debug && console.info(`BLE:（${identifier}）:` ,msg);
  }

  this.logwarn = function (identifier, msg) {
    this.debug && console.warn(`BLE:（${identifier}）:`, msg);
  }

  this.logerror = function (identifier, msg) {
    this.debug && console.error(`BLE:（${identifier}）:`, msg);
  }

};

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1547525437447, function(require, module, exports) {

// 连接状态
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });var ConnectStatus = exports.ConnectStatus = {
  // 未连接或连接断开，允许连接
  disconnected: 0,
  // 正在连接，不允许再连接
  connecting: 1,
  // 已连接，不允许再连接
  connected: 2,
};

// 发现外设回调和连接状态改变回调成功事件
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });var SuccessCallbackEvent = exports.SuccessCallbackEvent = {
  Success_DiscoverDevice_CB_Discover:  { code: 210, message: '发现外设' },
  Success_DiscoverDevice_CB_ScanDone:  { code: 211, message: '扫描完成' },
  Success_ConnectStatus_CB_PowerOn:    { code: 220, message: '蓝牙打开' },
  Success_ConnectStatus_CB_Connecting: { code: 221, message: '正在连接' },
  Success_ConnectStatus_CB_Connected:  { code: 222, message: '连接成功' },
  Success_ConnectStatus_CB_Stop:       { code: 223, message: '断开成功' },
};

// 发现外设回调和连接状态改变回调失败事件
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });var ErrorCallbackEvent = exports.ErrorCallbackEvent = {
  Error_DiscoverDevice_CB_Timeout:     { code: 410, message: '扫描超时' },
  Error_ConnectStatus_CB_PowerOff:     { code: 420, message: '蓝牙关闭' },
  Error_ConnectStatus_CB_ConnectFail:  { code: 421, message: '连接失败' },
  Error_ConnectStatus_CB_Disconnected: { code: 422, message: '连接断开' },
};

// 接口调用成功事件
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });var SuccessApiThen = exports.SuccessApiThen = {
  Success_Scan:       { code: 2010, message: '扫描接口成功调用' },
  Success_StopScan:   { code: 2020, message: '停止扫描接口成功调用' },
  Success_Connect:    { code: 2030, message: '连接接口成功调用' },
  Success_Disconnect: { code: 2040, message: '断开接口成功调用' },
  Success_Read:       { code: 2050, message: '读特征值接口成功调用' },
  Success_Write:      { code: 2060, message: '写入数据接口成功调用' },
  Success_Notify:     { code: 2070, message: '监听特征值接口成功调用' },
};

// 接口调用失败事件
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });var ErrorApiCatch = exports.ErrorApiCatch = {
  // 基础库版本低
  Error_Low_Version:              { code: 4000, message: '当前基础库版本低，请更新微信版本' },
  // Api: scan
  Error_Scan_Failed:              { code: 4010, message: '扫描错误：扫描失败' },
  Error_Scan_PowerOff:            { code: 4011, message: '扫描错误：蓝牙被关闭' },
  Error_Scan_NoService:           { code: 4012, message: '扫描错误：没有找到指定服务' },
  // Api: stopScan
  Error_StopScan_Failed:          { code: 4020, message: '停止扫描错误：停止扫描失败' },
  Error_StopScan_PowerOff:        { code: 4021, message: '停止扫描错误：蓝牙被关闭' },
  // Api: connect
  Error_Connect_Failed:           { code: 4030, message: '连接错误：连接失败' },
  Error_Connect_PowerOff:         { code: 4031, message: '连接错误：蓝牙被关闭' },
  Error_Connect_AlreadyConnected: { code: 4032, message: '连接错误：已经连接或正在连接' },
  Error_Connect_Timeout:          { code: 4033, message: '连接错误：连接超时' },
  Error_Connect_EmptyId:          { code: 4034, message: '连接错误：设备id不能为空' },
  // Api: disconnect
  Error_Disconnect_Failed:        { code: 4040, message: '断开错误：断开失败' },
  // Api: read
  Error_Read_Failed:              { code: 4050, message: '读特征值错误：读特征值失败'},
  Error_Read_NotConnected:        { code: 4051, message: '读特征值错误：蓝牙未连接' },
  Error_Read_NotSupport:          { code: 4052, message: '读特征值错误：当前特征不支持读操作' },
  Error_Read_NoService:           { code: 4053, message: '读特征值错误：没有找到指定服务' },
  Error_Read_NoCharacteristic:    { code: 4054, message: '读特征值错误：没有找到指定特征值' },
  // Api: write
  Error_Write_Failed:             { code: 4060, message: '写入数据错误：写入数据失败'},
  Error_Write_NotConnected:       { code: 4061, message: '写入数据错误：蓝牙未连接' },
  Error_Write_NotSupport:         { code: 4062, message: '写入数据错误：当前特征不支持写操作' },
  Error_Write_NoService:          { code: 4063, message: '写入数据错误：没有找到指定服务' },
  Error_Write_NoCharacteristic:   { code: 4064, message: '写入数据错误：没有找到指定特征值' },
  // Api: notify
  Error_Notify_Failed:            { code: 4070, message: '监听特征值错误：监听特征值错误失败' },
  Error_Notify_NotConnected:      { code: 4071, message: '监听特征值错误：蓝牙未连接' },
  Error_Notify_NotSupport:        { code: 4072, message: '监听特征值错误：当前特征不支持监听操作' },
  Error_Notify_NoService:         { code: 4073, message: '监听特征值错误：没有找到指定服务' },
  Error_Notify_NoCharacteristic:  { code: 4074, message: '监听特征值错误：没有找到指定特征值' },
};


}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1547525437448, function(require, module, exports) {


var __TEMP__ = require('./enum.js');var ConnectStatus = __TEMP__['ConnectStatus'];var SuccessCallbackEvent = __TEMP__['SuccessCallbackEvent'];var ErrorCallbackEvent = __TEMP__['ErrorCallbackEvent'];var SuccessApiThen = __TEMP__['SuccessApiThen'];var ErrorApiCatch = __TEMP__['ErrorApiCatch'];
var __TEMP__ = require('./tools.js');var _ = __REQUIRE_DEFAULT__(__TEMP__);

if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });exports.default = class Bluetooth {

  constructor(btmanager) {
    this.bm = btmanager;
    // 蓝牙适配器是否初始化完成
    this.isInitializedAdapter = false;
    // 蓝牙适配器是否可用
    this.isAvailableAdapter = false;
    // 初始化蓝牙适配器
    this.openAndListenBluetoothAdapter().then(__=>__).catch(__=>__);
    // 扫描到的设备
    this.scanDevices = [];
  }

  /**
   *  打开和监听蓝牙适配器
   * 
   *  @return Promise对象
   */
  openAndListenBluetoothAdapter() {

    // 未初始化蓝牙适配器，打开蓝牙适配器
    if (!this.isInitializedAdapter) {

      // 监听蓝牙适配器状态
      _.api('offBluetoothAdapterStateChange').then(__ => __).catch(__ => __);
      _.on('onBluetoothAdapterStateChange','' ,res => {
        this.bm.log('onBluetoothAdapterStateChange', res);
        if (res.available && !this.isAvailableAdapter) {
          this.isAvailableAdapter = true;
          this.callBackConnectStatus(SuccessCallbackEvent.Success_ConnectStatus_CB_PowerOn);
        } else if (!res.available) {
          this.isAvailableAdapter = false;
          // 支付宝小程序当蓝牙适配器关闭，再次进行蓝牙操作需要重新打开，微信只需要打开一次就行
          _.getAppPlatform() === 'ant' && (this.isInitializedAdapter = false);
          this.bm.connectStatus = ConnectStatus.disconnected;
          this.callBackConnectStatus(ErrorCallbackEvent.Error_ConnectStatus_CB_PowerOff);
        }
      });

      // 先关闭再打开蓝牙适配器，避免出现某些机型打开无效的情况
      return _.api('closeBluetoothAdapter')
        .then(__ => {
          // 打开蓝牙适配器
          return _.api('openBluetoothAdapter')
        }).then(res => {
          this.bm.log('openBluetoothAdapter success', res);
          this.isInitializedAdapter = true;
          this.isAvailableAdapter = true;
          return Promise.resolve();
        }).catch(e => {
          this.bm.log('openBluetoothAdapter fail', e);
          this.isInitializedAdapter = false;
          this.isAvailableAdapter = false;
          this.bm.connectStatus = ConnectStatus.disconnected;
          return Promise.reject(e);
        })
    } else {
      return Promise.resolve();
    }
  }

  /**
   *  扫描外设
   *
   *  @param {object} options                扫描参数
   *   @property {array} services             主service的uuid列表。确认在蓝牙广播中存在此服务id，可以通过服务id过滤掉其他设备
   *   @property {boolean} allowDuplicatesKey 是否允许重复上报设备
   *   @property {number} interval            上报新设备的间隔，默认为0
   *   @property {number} timeout             扫描超时时间，毫秒。在该时间内未扫描到符合要求的设备，上报超时。默认1500ms，-1表示无限超时
   *   @property {string} deviceName          通过蓝牙名称过滤，需要匹配的设备名称
   *   @property {string} containName         通过蓝牙名称过滤，需要包含的设备名称
   * 
   *  @return Promise对象
   * 
   *  @discussion 开始扫描外设，注意实现返回对象的then和catch方法，监听接口是否调用成功。
   *              此操作比较耗费系统资源，请在搜索到设备后调用stopScan方法停止扫描。
   *              重复调用此接口，会清空之前设备存储，再次上报已上报的设备，能够起到刷新的作用。
   * 
   *  @see registerDidDiscoverDevice
   */
  scanDevice(options) {

    // 解构参数
    let { services, allowDuplicatesKey, interval, timeout, deviceName, containName} = options;

    // 打开和监听蓝牙适配器
    return this.openAndListenBluetoothAdapter()
      .then(__ => {
        // 清空存储的设备
        this.scanDevices = [];
        // 销毁扫描延时
        this.destoryTimer();
        // 设置扫描超时
        this.scanTimeoutTimer = timeout!==-1 ? setTimeout(() => {
          this.stopScan();
          if (this.scanDevices.length === 0) { // 扫描超时
            this.bm.log('startBluetoothDevicesDiscovery fail ' , 'timeout');
            this.callBackDiscoverDevice(null, ErrorCallbackEvent.Error_DiscoverDevice_CB_Timeout, true);
          } else {// 扫描时间结束
            this.callBackDiscoverDevice(null, SuccessCallbackEvent.Success_DiscoverDevice_CB_ScanDone, false);
          }
        }, timeout || 15000) : null;
        // 开始扫描
        return _.api('startBluetoothDevicesDiscovery', '' ,{
          services,
          allowDuplicatesKey,
          interval
        })
      }).then(res => {
        this.bm.log('startBluetoothDevicesDiscovery success', res);
        // 取消设备监听，仅支付宝小程序有效
        _.api('offBluetoothDeviceFound').then(__ => __).catch(__ => __);
        // 监听扫描到外设
        _.on('onBluetoothDeviceFound','', res => {
          // this.bm.log('onBluetoothDeviceFound' , res);
          let devices = res.devices || res;
          // 过滤、格式化、存储、上报设备
          for (let device of devices) {
            if (Array.isArray(device)) device = devices[0][0];
            // 信号强度为127表示RSSI不可用
            if (device.RSSI === 127) return;
            // 匹配名称，过滤设备
            let name = device.name || device.deviceName;
            device.name = name;
            if (deviceName && (!name || name !== deviceName)) return;
            if (containName && (!name || !~name.indexOf(containName))) return;
            // 格式化广播数据
            if (typeof device.advertisData !== 'string') device.advertisData = _.ab2str(device.advertisData);
            // 上报设备
            this.callBackDiscoverDevice(device, SuccessCallbackEvent.Success_DiscoverDevice_CB_Discover, false);
            // 更新不重复记录设备
            for (let v of this.scanDevices) {
              if (v.deviceId === device.deviceId) {
                  Object.assign(v, device);
                return;
              }
            }
            // 存储新设备
            this.scanDevices.push(device);
          }
        })
        return Promise.resolve(SuccessApiThen.Success_Scan);
      }).catch(e => {
        this.bm.log('startBluetoothDevicesDiscovery fail', e);
        if (e.code === 12 || e.code === 10001) {
          return Promise.reject(ErrorApiCatch.Error_Scan_PowerOff);
        } else if (e.code === 10012 || e.code === 10004) {
          return Promise.reject(ErrorApiCatch.Error_Scan_NoService);
        } else {
          return Promise.reject(ErrorApiCatch.Error_Scan_Failed);
        }
      })
  }

  /**
   *  停止扫描
   *
   *  @return Promise对象
   * 
   *  @discussion 停止扫描，取消超时延时。
   */
  stopScan() {
    // 销毁扫描延时
    this.destoryTimer();
    // 取消设备监听，仅支付宝小程序有效
    _.api('offBluetoothDeviceFound').then(__ => __).catch(__ => __);
    // 停止扫描
    return _.api('stopBluetoothDevicesDiscovery')
      .then(res => {
        this.bm.log('stopBluetoothDevicesDiscovery success', res);
        return Promise.resolve(SuccessApiThen.Success_StopScan);
      }).catch(e => {
        this.bm.log('stopBluetoothDevicesDiscovery fail', e);
        if (e.code === 12 || e.code === 10001) {
          return Promise.reject(ErrorApiCatch.Error_StopScan_PowerOff);
        } else {
          return Promise.reject(ErrorApiCatch.Error_StopScan_Failed);
        }
      })
  }

  /**
   *  连接外设
   * 
   *  @param {object} device  指定连接的外设对象，从registerDidDiscoverDevice注册的回调中得到
   *  @param {number} timeout 连接超时时间，毫秒，默认15000ms，支付宝小程序无效
   * 
   *  @return Promise对象
   * 
   *  @discussion 连接指定的外设，需要传入外设对象。
   *              注意实现返回对象的then和catch方法，监听接口是否调用成功。
   */
  connect(device , timeout) {
    // 判断是否已经连接
    if (this.bm.connectStatus !== ConnectStatus.disconnected) {
      this.bm.logwarn('connect fail', 'Is already connected');
      return Promise.reject(ErrorApiCatch.Error_Connect_AlreadyConnected);
    }
    // 判断设备id是否为空
    if (_.isEmpty(device.deviceId)) {
      return Promise.reject(ErrorApiCatch.Error_Connect_EmptyId);
    }

    this.bm.deviceInfo = device;
    this.bm.connectStatus = ConnectStatus.connecting;
    this.callBackConnectStatus(SuccessCallbackEvent.Success_ConnectStatus_CB_Connecting);
    let deviceId = device.deviceId;

    // 打开和监听蓝牙适配器
    return this.openAndListenBluetoothAdapter()
      .then(__ => {
        // 连接设备
        return _.api('createBLEConnection', 'connectBLEDevice', {
          deviceId ,
          timeout: timeout || 15000 ,
        })
      }).then( res => {
        this.bm.log('connectBLEDevice success', res);
        // 取消蓝牙连接状态监听，仅支付宝小程序有效
        _.api('offBLEConnectionStateChanged').then(__ => __).catch(__ => __);
        // 蓝牙连接状态监听
        _.on('onBLEConnectionStateChange', 'onBLEConnectionStateChanged',(res) => {
          this.bm.log('onBLEConnectionStateChange', res);
          if (!res.connected && this.bm.connectStatus !== ConnectStatus.disconnected) {
            this.bm.connectStatus = ConnectStatus.disconnected;
            if (res.errorCode === 0) {
              this.callBackConnectStatus(SuccessCallbackEvent.Success_ConnectStatus_CB_Stop);
            } else if (res.errorCode === 10003) {
              this.callBackConnectStatus(ErrorCallbackEvent.Error_ConnectStatus_CB_Disconnected);
            } else if (_.getAppPlatform() === 'ant'){
              this.callBackConnectStatus(ErrorCallbackEvent.Error_ConnectStatus_CB_Disconnected);
            }
          }
        })

        // 获取设备所有服务
        _.api('getBLEDeviceServices', '', { deviceId })
          .then(res => {
            this.bm.log('getBLEDeviceServices success', res);
            // 存储所有服务promise
            let sPromises = [];
            // 获取所有服务的所有特征
            device.services = res.services.map(server => {
              let sUUID = server.uuid || server.serviceId;
              let sPromise = _.api('getBLEDeviceCharacteristics', '', {
                deviceId,
                serviceId: sUUID
              })
              sPromises.push(sPromise);
              return { serviceId: sUUID };
            })
            return Promise.all(sPromises);
          }).then(res => {
            this.bm.log('getBLEDeviceCharacteristics success', res);
            device.services = res.map((v, i) => {
              let service = device.services[i];
              service.characteristics = v.characteristics;
              return service;
            })
            // 获取特征成功之后才算连接成功
            this.bm.deviceInfo = device;
            this.bm.connectStatus = ConnectStatus.connected;
            this.callBackConnectStatus(SuccessCallbackEvent.Success_ConnectStatus_CB_Connected);
          }).catch(e => {
            this.bm.log('api connecting error', e);
            // 出现错误断开蓝牙，避免出现已连接成功未找到服务或者特征出错时，再次连接状态不正确
            _.api('closeBLEConnection', 'disconnectBLEDevice', {
              deviceId: this.bm.deviceInfo.deviceId
            }).then(__ => __).catch(__ => __);
            this.bm.connectStatus = ConnectStatus.disconnected;
            this.callBackConnectStatus(e);
          })

        // 开始连接接口调用成功
        return Promise.resolve(SuccessApiThen.Success_Connect);
      }).catch(e => {
        this.bm.log('api connect error', e);
        // 未知错误，直接报连接失败
        if (e.code === 100000) e = ErrorCallbackEvent.Error_ConnectStatus_CB_ConnectFail;
        this.bm.connectStatus = ConnectStatus.disconnected;
        this.callBackConnectStatus(e);
        if (e.code === 12 || e.code === 10001) {
          return Promise.reject(ErrorApiCatch.Error_Connect_PowerOff);
        } else if (~e.message.indexOf('超时') || (e.errMsg && ~e.errMsg.indexOf('time out'))){
          return Promise.reject(ErrorApiCatch.Error_Connect_Timeout);
        } else {
          return Promise.reject(ErrorApiCatch.Error_Connect_Failed);
        }
      })
  }

  /**
   *  断开连接
   * 
   *  @return Promise对象
   */
  disconnect() {

    this.bm.connectStatus === ConnectStatus.connected && 
    _.api('closeBLEConnection','disconnectBLEDevice',{
        deviceId: this.bm.deviceInfo.deviceId
      }).then(res => {
        this.bm.log('closeBLEConnection success', res);
      }).catch(e => {
        this.bm.log('closeBLEConnection fail', e);
      })
      
    _.api('closeBluetoothAdapter')
      .then(res => {
        this.bm.log('closeBluetoothAdapter success', res);
        this.isInitializedAdapter = false;
        if (this.bm.connectStatus !== ConnectStatus.disconnected) {
          this.bm.connectStatus = ConnectStatus.disconnected;
          this.callBackConnectStatus(SuccessCallbackEvent.Success_ConnectStatus_CB_Stop);
        };
        this.bm.connectStatus = ConnectStatus.disconnected;
      }).catch(e => {
        this.bm.log('closeBluetoothAdapter fail', e);
      })

    return Promise.resolve(SuccessApiThen.Success_Disconnect);
  }

  /**
   *  读特征值
   * 
   *  @param {object} params               参数
   *   @property {string} suuid            特征对应的服务uuid
   *   @property {string} cuuid            写入特征uuid
   * 
   *  @discussion 读某个服务下的某个特征值。
   */
  read(params) {
    if (this.bm.connectStatus === ConnectStatus.connected) {
      let { suuid, cuuid } = params;
      return _.api('readBLECharacteristicValue', '', {
        deviceId: this.bm.deviceInfo.deviceId,
        serviceId: suuid,
        characteristicId: cuuid,
      }).then(res => {
        this.bm.log('readBLECharacteristicValue success', res);
        return Promise.resolve(SuccessApiThen.Success_Read);
      }).catch(e => {
        this.bm.log('readBLECharacteristicValue fail', e);
        if (e.code === 10007) {
          return Promise.reject(ErrorApiCatch.Error_Read_NotSupport);
        } else if (e.code === 10004) {
          return Promise.reject(ErrorApiCatch.Error_Read_NoService);
        } else if (e.code === 10005) {
          return Promise.reject(ErrorApiCatch.Error_Read_NoCharacteristic);
        } else {
          return Promise.reject(ErrorApiCatch.Error_Read_Failed);
        }
      })
    } else {
      return Promise.reject(ErrorApiCatch.Error_Read_NotConnected);
    }
  }

  /**
   *  向蓝牙模块写入数据
   * 
   *  @param {object} params        参数
   *   @property {string} suuid       特征对应的服务uuid
   *   @property {string} cuuid       写入特征uuid
   *   @property {Hex string} value   16进制字符串 
   * 
   *  @return Promise对象
   * 
   *  @discussion 向蓝牙模块写入数据。
   */
  write(params) {
    let {suuid , cuuid , value} = params;
    if (this.bm.connectStatus === ConnectStatus.connected) {
      if (_.getAppPlatform() === 'wx') {
        if (typeof value === 'string') {
          value = _.str2ab(value);
        } else {
          value = typedArrayToArrayBuffer(value);
        }
      } else if (typeof value !== 'string'){
        value = _.ab2str(value);
      }
      this.bm.log('writeCmdToDevice', _.ab2str(value));
      return _.api('writeBLECharacteristicValue', '', {
        deviceId: this.bm.deviceInfo.deviceId,
        serviceId: suuid,
        characteristicId: cuuid,
        value,
      }).then(res => {
        this.bm.log('writeBLECharacteristicValue success', res);
        return Promise.resolve(SuccessApiThen.Success_Write);
      }).catch(e => {
        this.bm.log('writeBLECharacteristicValue fail', e);
        if (e.code === 10007) {
          return Promise.reject(ErrorApiCatch.Error_Write_NotSupport);
        } else if (e.code === 10004) {
          return Promise.reject(ErrorApiCatch.Error_Write_NoService);
        } else if (e.code === 10005) {
          return Promise.reject(ErrorApiCatch.Error_Write_NoCharacteristic);
        } else {
          return Promise.reject(ErrorApiCatch.Error_Write_Failed);
        }
      })
    } else {
      return Promise.reject(ErrorApiCatch.Error_Write_NotConnected);
    }
  }

  /**
   *  监听特征值改变
   * 
   *  @param {object} params        参数
   *   @property {string} suuid       特征对应的服务uuid
   *   @property {string} cuuid       写入特征uuid
   *   @property {boolean} state      是否启用notify，可以通过重复调用接口改变此属性打开/关闭监听  
   * 
   *  @return Promise对象
   * 
   *  @discussion 监听某个特征值变化。
   */
  notify(params) {
    if (this.bm.connectStatus === ConnectStatus.connected) {
      let { suuid, cuuid, state } = params;
      return _.api('notifyBLECharacteristicValueChange', '', {
        deviceId: this.bm.deviceInfo.deviceId,
        serviceId: suuid,
        characteristicId: cuuid,
        state
      }).then(res => {
        this.bm.log('readBLECharacteristicValue success', res);
        return Promise.resolve(SuccessApiThen.Success_Notify);
      }).catch(e => {
        this.bm.log('readBLECharacteristicValue fail', e);
        if (e.code === 10007) {
          return Promise.reject(ErrorApiCatch.Error_Notify_NotSupport);
        } else if (e.code === 10004) {
          return Promise.reject(ErrorApiCatch.Error_Notify_NoService);
        } else if (e.code === 10005) {
          return Promise.reject(ErrorApiCatch.Error_Notify_NoCharacteristic);
        } else {
          return Promise.reject(ErrorApiCatch.Error_Notify_Failed);
        }
      })
    } else {
      return Promise.reject(ErrorApiCatch.Error_Notify_NotConnected);
    }
  }

  /**
   *  注册状态改变回调
   *
   *  @param {function} cb 回调函数
   * 
   *  @discussion 连接状态发生改变时，回调此方法。
   */
  registerDidUpdateConnectStatus(cb) {
    this._didUpdateStatusCB = cb;
  }

  /**
   *  注册发现外设回调
   *
   *  @param {function} cb 回调函数
   * 
   *  @discussion 当扫描到设备时回调
   */
  registerDidDiscoverDevice(cb) {
    this._didDiscoverDeviceCB = cb;
  }

  /**
   *  注册特征值改变回调
   *
   *  @param {function} cb 回调函数
   * 
   *  @discussion 当监听的特征值改变时回调
   */
  registerDidUpdateValueForCharacteristic(cb) {
    this._didUpdateValueCB = cb;
    _.api('offBLECharacteristicValueChange').then(__ => __).catch(__ => __);
    _.on('onBLECharacteristicValueChange', '' ,characteristic => {
      if (typeof characteristic.value === 'string') {
        this._didUpdateValueCB(characteristic);
      } else {
        characteristic.value = _.ab2str(characteristic.value);
        this._didUpdateValueCB(characteristic);
      }
    })
  }

  /**
   * 回调蓝牙连接状态
   */
  callBackConnectStatus(status) {
    this._didUpdateStatusCB && this._didUpdateStatusCB({
      ...status,
      device:this.bm.deviceInfo,
      connectStatus:this.bm.connectStatus
    });
  }

  /**
   * 回调发现外设
   * 
   * @param device 扫描到的设备
   */
  callBackDiscoverDevice(device , event , timeout) {
    this._didDiscoverDeviceCB && this._didDiscoverDeviceCB(
      device ? {
        ...event,
        timeout,
        device,
      } : {
        ...event,
        timeout,
      }
    )
  }

  /**
   * 销毁延时
   */
  destoryTimer() {
    this.scanTimeoutTimer && clearTimeout(this.scanTimeoutTimer);
    this.scanTimeoutTimer = null;
  }
};
}, function(modId) { var map = {"./enum.js":1547525437447,"./tools.js":1547525437449}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1547525437449, function(require, module, exports) {



var __TEMP__ = require('./promisify.js');var getAppPlatform = __TEMP__['getAppPlatform'];var api = __TEMP__['api'];var on = __TEMP__['on'];

/**
 * 判断字符串是否为空或者空格
 */
function isEmpty(str = '') {
  return !str || str == '' || str.replace(/(^\s*)|(\s*$)/g, "") == "";
}

/**
 * 判断是否为null或者未定义
 */
function isNullOrUndefined(obj) {
  return obj === undefined || obj === null;
}

/**
 * ArrayBuffer类型转换为16进制字符串
 */
function ab2str(buffer) {
  return Array.prototype.map.call(new Uint8Array(buffer), x => ('00' + x.toString(16)).slice(-2)).join('');
}

/**
 * 字符串转为ArrayBuffer对象，参数为字符串
 */
function str2ab(str) {
  var buf = new ArrayBuffer(str.length / 2);
  var bufView = new Uint8Array(buf);
  for (var i = 0; i < str.length; i += 2) {
    bufView[parseInt(i / 2)] = char2Hex(str.charCodeAt(i)) << 4 | char2Hex(str.charCodeAt(i + 1));
  }
  return buf;
}

/**
 *  字符转十六进制
 */
function char2Hex(bChar) {
  if ((bChar >= 0x30) && (bChar <= 0x39)) { // 数字
    bChar -= 0x30;
  } else if ((bChar >= 0x41) && (bChar <= 0x46)) { // 大写字母
    bChar -= 0x37;
  } else if ((bChar >= 0x61) && (bChar <= 0x66)) { // 小写字母
    bChar -= 0x57;
  } else {
    bChar = 0xff;
  }
  return bChar;
}

/**
 * TypedArray转为ArrayBuffer
 */
function typedArray2ArrayBuffer(pbuff) {
  let buffer = new ArrayBuffer(pbuff.byteLength)
  let uInit8 = new Uint8Array(buffer)
  uInit8.set(pbuff);
  return buffer;
}

/**
 *  获取异或校验数值
 *
 *  @param p 参与运算的字符数组指针
 *  @param len 参与运算的字符数组长度
 */
function createXOR(b, p, len) {
  let i = 0;
  let ckc = 0;
  for (; i < len; i++) {
    ckc = ckc ^ b[p + i];
  }
  return ckc;
}

/**
 * UUID128位转换为16位
 * 
 * @param uuid128 128位的uuid
 */
function uuid128to16(uuid128) {
  let arr = uuid128.split('-');
  if (arr.length === 5 && arr[4] === '00805F9B34FB') {
    return arr[0].slice(3);
  } else {
    return uuid128;
  }
}

if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });exports.default = {
  getAppPlatform,
  api,
  on,
  isEmpty,
  isNullOrUndefined,
  ab2str,
  str2ab,
  typedArray2ArrayBuffer,
  createXOR,
  uuid128to16
};



}, function(modId) { var map = {"./promisify.js":1547525437450}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1547525437450, function(require, module, exports) {

// 判断是微信小程序还是支付宝小程序 
let ii, mini;
try {
  ii = wx;
  mini = 'wx';
} catch (e) {
  ii = my;
  mini = 'ant';
}

var __TEMP__ = require('./enum.js');var ErrorApiCatch = __TEMP__['ErrorApiCatch'];

// 微信系统错误
const ERROR_WX = {
  NOT_INIT:             { code: 10000, message: '未初始化蓝牙适配器' },
  NOT_AVAILABLE:        { code: 10001, message: '当前蓝牙适配器不可用' },
  NO_DEVICE:            { code: 10002, message: '没有找到指定设备' },
  CONNECTION_FAIL:      { code: 10003, message: '连接失败' },
  NO_SERVICE:           { code: 10004, message: '没有找到指定服务' },
  NO_CHARACTERISTIC:    { code: 10005, message: '没有找到指定特征值' },
  NO_CONNECTION:        { code: 10006, message: '当前连接已断开' },
  PROPERTY_NOT_SUPPORT: { code: 10007, message: '当前特征值不支持此操作' },
  SYSTEM_ERROR:         { code: 10008, message: '系统异常' },
  SYSTEM_NOT_SUPPORT:   { code: 10009, message: 'Android 系统版本低于 4.3 不支持 BLE' },
  OPERATE_TIMEOUT:      { code: 10012, message: '操作超时' },
  INVALID_PARAMETER:    { code: 10013, message: '无效参数' },
  ALREADY_CONNECTED:    { code: -1   , message: '蓝牙已连接，不能再连接' },
  UN_KNOWN:             { code: 100000,message: '未知' },
}

// 支付宝系统错误
const ERROR_ANT = {
  POWER_OFF:                 { code: 12,    message: '蓝牙未打开' },
  LOST_SERVICE:              { code: 13,    message: '与系统服务的链接暂时丢失' },
  UNAUTH_BLE:                { code: 14,    message: '未授权支付宝使用蓝牙功能' },
  UNKNOWN_ERROR:             { code: 15,    message: '未知错误' },
  NOT_INIT:                  { code: 10000, message: '未初始化蓝牙适配器' },
  NOT_AVAILABLE:             { code: 10001, message: '当前蓝牙适配器不可用' },
  NO_DEVICE:                 { code: 10002, message: '没有找到指定设备' },
  CONNECTION_FAIL:           { code: 10003, message: '连接失败' },
  NO_SERVICE:                { code: 10004, message: '没有找到指定服务' },
  NO_CHARACTERISTIC:         { code: 10005, message: '没有找到指定特征值' },
  NO_CONNECTION:             { code: 10006, message: '当前连接已断开' },
  PROPERTY_NOT_SUPPORT:      { code: 10007, message: '当前特征值不支持此操作' },
  SYSTEM_ERROR:              { code: 10008, message: '系统异常' },
  SYSTEM_NOT_SUPPORT:        { code: 10009, message: 'Android 系统版本低于 4.3 不支持 BLE' },
  SYMBOL_UNFOUND:            { code: 10010, message: '没有找到指定描述符' },
  DEVICE_ID_INVALID:         { code: 10011, message: '设备 id 不可用/为空' },
  SERVICE_ID_INVALID:        { code: 10012, message: '服务 id 不可用/为空' },
  CHARACTERISTIC_ID_INVALID: { code: 10013, message: '特征 id 不可用/为空' },
  CMD_FORMAT_ERROR:          { code: 10014, message: '发送的数据为空或格式错误' },
  OPERATION_TIMEOUT:         { code: 10015, message: '操作超时' },
  LACK_PARAMETER:            { code: 10016, message: '缺少参数' },
  WRITE_ERROR:               { code: 10017, message: '写入特征值失败' },
  READ_ERROR:                { code: 10018, message: '读取特征值失败' },
}

const ERROR_TYPES = mini==='wx' ? ERROR_WX : ERROR_ANT;

/**
 * 获取错误类型
 */
function getErrorType(code) {
  for (let key of Object.keys(ERROR_TYPES)) {
    if (code === ERROR_TYPES[key].code) {
      return ERROR_TYPES[key];
    }
  }
  return ERROR_TYPES.UN_KNOWN;
}

/**
 * 获取小程序平台 wx||ant
 */
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });exports.getAppPlatform = function getAppPlatform() {
  return mini;
};

/**
 *  重写异步API
 * 
 *  @param {string} fn1 方法名1
 *  @param {string} fn2 方法名2
 *  @param {object} options 可选参数
 * 
 *  @return Promise对象
 */
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });exports.api = function api(fn1, fn2, options) {
  let func = ii[fn1] || ii[fn2];
  return new Promise((resolve, reject) => {
    let params = {
      success(res) {
        resolve(res);
      },
      fail(res) {
        if (res.errorMessage) {
          reject({
            code: res.error,
            message: res.errorMessage
          });
        } else {
          reject({
            ...getErrorType(res.errCode),
            errMsg: res.errMsg
          });
        }
      },
      complete(res) {
        //...
      }
    }
    if (options) {
      params = Object.assign(params, options);
    }
    if (func) {
      func(params);
    } else {
      reject(ErrorApiCatch.Error_Low_Version);
    }
  })
};

/**
 *  重写回调API
 * 
 *  @param {string} fn1 方法名1
 *  @param {string} fn2 方法名2
 *  @param {function} cb 回调函数
 */
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });exports.on = function on(fn1, fn2, cb) {
  let func = ii[fn1] || ii[fn2];
  if (func) {
    if (mini === 'wx') {
      func(cb);
    } else {
      func({
        success: cb,
      })
    }
  }
};
}, function(modId) { var map = {"./enum.js":1547525437447}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1547525437444);
})()
//# sourceMappingURL=index.js.map