
import { BTManager , ConnectStatus } from '../../wx-ant-ble/index.js';

Page({
 data: {
    // 蓝牙是否连接
    connected: false,
    // 成功连接的设备
    device: {},
    // 扫描到的设备
    devices:[],
    // 设备能够notify的特征
    notifyUUIDs: [],
    // 设备能够read的特征
    readUUIDs: [],
    // 设备能够write的特征
    writeUUIDs: [],
  },

  onLoad: function (options) {
    // 初始化蓝牙管理器
    this.bt = new BTManager({
      debug: true
    });
    // 注册状态回调
    this.bt.registerDidUpdateConnectStatus(this.didUpdateConnectStatus.bind(this));
    // 注册发现外设回调
    this.bt.registerDidDiscoverDevice(this.didDiscoverDevice.bind(this));
    // 注册特征值改变回调
    this.bt.registerDidUpdateValueForCharacteristic(this.didUpdateValueForCharacteristic.bind(this));
  },

  // 状态改变回调
  didUpdateConnectStatus(res) {
    console.log('home registerDidUpdateConnectStatus', res);
    if (res.connectStatus === ConnectStatus.connected) {
      my.hideLoading();
      this.setData({connected: true , device:res.device});
      this.parseDeviceUUIDs(res.device);
    } else if (res.connectStatus === ConnectStatus.disconnected) {
      my.hideLoading();
      my.showToast({
        content: res.message,
        type: 'none'
      })
      this.setData({ connected: false, notifyUUIDs: [], readUUIDs: [], writeUUIDs:[]});
    }
  },

  // 发现外设回调
  didDiscoverDevice(res) {
    console.log('home didDiscoverDevice', res);
    if (res.timeout) {
      console.log('home didDiscoverDevice', '扫描超时');
       my.showToast({
        content: res.message,
        type: 'none'
      })
    } else {
      let device = res.device;
      let devices = this.data.devices;
      function checkDevice(d, ds) {
        for (let v of ds) {
          if (v.deviceId === d.deviceId) {
            return true;
          }
        }
        return false;
      }
      if (!checkDevice(device, devices)) {
        devices.push(device);
      }
      this.setData({ devices });
    }
  },

  // 特征值改变回调
  didUpdateValueForCharacteristic(res) {
    console.log('home registerDidUpdateValueForCharacteristic', res);
  },
  
  parseDeviceUUIDs(device) {
    let { notifyUUIDs, readUUIDs, writeUUIDs } = this.data;
    for (let service of device.services) {
      for (let char of service.characteristics) {
        if (char.properties.notify) {
          notifyUUIDs.push({
            suuid: service.serviceId,
            cuuid: char.characteristicId,
            listening: false
          })
        }
        if (char.properties.read) {
          readUUIDs.push({
            suuid: service.serviceId,
            cuuid: char.characteristicId,
          })
        }
        if (char.properties.write) {
          writeUUIDs.push({
            suuid: service.serviceId,
            cuuid: char.characteristicId,
          })
        }
      }
    }
    this.setData({ notifyUUIDs, readUUIDs, writeUUIDs });
  },

  // 扫描
  _scan() {
    this.bt.scan({
      services: [],
      allowDuplicatesKey: false,
      interval: 0,
      timeout: 15000,
      deviceName: '',
      containName: 'BIANLA'
    }).then(res => {
      console.log('home scan success', res);
    }).catch(e => {
      console.log('home scan fail', e);
      my.showToast({
        content: e.message,
        type: 'none'
      })
    });
  },

  // 停止扫描
  _stopScan() {
    this.bt.stopScan().then(res => {
      console.log('home stopScan success', res);
    }).catch(e => {
      console.log('home stopScan fail', e);
    })
  },

  // 连接
  _connect(e) {
    let index = e.currentTarget.id;
    this.bt.stopScan();
    let device = this.data.devices[index];
    this.bt.connect(device).then(res => {
      console.log('home connect success', res);
    }).catch(e => {
      my.showToast({
        content: e.message,
        type: 'none'
      })
      console.log('home connect fail', e);
    });
    my.showLoading({
      content: '连接' + device.name,
    });
  },

  // 断开连接
  _disconnect() {
    this.bt.disconnect().then(res => {
      console.log('home disconnect success', res);
    }).catch(e => {
      console.log('home disconnect fail', res);
    })
  },

  // 监听/停止监听
  _notify(e) {
    let index = e.currentTarget.id;
    let { suuid, cuuid, listening } = this.data.notifyUUIDs[index];
    this.bt.notify({
      suuid, cuuid, state: !listening
    }).then(res => {
      console.log('home notify success', res);
      this.setData({ [`notifyUUIDs[${index}].listening`]: !listening });
    }).catch(e => {
      console.log('home notify fail', e);
    })
  },

  // 读特征值
  _read(e) {
    let index = e.currentTarget.id;
    let { suuid, cuuid } = this.data.readUUIDs[index];
    this.bt.read({
       suuid, cuuid
    }).then(res => {
      console.log('home read success', res);
    }).catch(e => {
      console.log('home read fail', e);
    })
  },

  // 向蓝牙模块写入数据，这里只做简单的例子，发送的是 'FFFF' 的十六进制字符串
  _write(e) {
    let index = e.currentTarget.id;
    let { suuid, cuuid } = this.data.writeUUIDs[index];
    this.bt.write({
      suuid,
      cuuid,
      value: 'FFFF'
    }).then(res => {
      console.log('home write success', res);
    }).catch(e => {
      console.log('home write fail', e);
    })
  },
});
