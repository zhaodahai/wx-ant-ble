
// 判断是微信小程序还是支付宝小程序 
let ii, mini;
try {
  ii = wx;
  mini = 'wx';
} catch (e) {
  ii = my;
  mini = 'ant';
}

import { ErrorApiCatch} from './enum.js';

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
export function getAppPlatform() {
  return mini;
}

/**
 *  重写异步API
 * 
 *  @param {string} fn1 方法名1
 *  @param {string} fn2 方法名2
 *  @param {object} options 可选参数
 * 
 *  @return Promise对象
 */
export function api(fn1, fn2, options) {
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
}

/**
 *  重写回调API
 * 
 *  @param {string} fn1 方法名1
 *  @param {string} fn2 方法名2
 *  @param {function} cb 回调函数
 */
export function on(fn1, fn2, cb) {
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
}