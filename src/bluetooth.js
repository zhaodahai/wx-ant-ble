

import { ConnectStatus, SuccessCallbackEvent, ErrorCallbackEvent, SuccessApiThen, ErrorApiCatch} from './enum.js';
import _ from './tools.js';

export default class Bluetooth {

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
        this.scanTimeoutTimer = timeout!==-1 ? setTimeout(__ => {
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
            if (res.errorCode === 0 || res.errorCode === undefined) {
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
            this.bm.logwarn('api connecting error', e);
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
        this.bm.logwarn('api connect error', e);
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
}