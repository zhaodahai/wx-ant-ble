

import { Log } from './extends.js';
import { ConnectStatus } from './enum.js';
import Bluetooth from './bluetooth.js';

export class BTManager {

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

}