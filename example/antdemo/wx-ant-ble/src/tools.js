


import { getAppPlatform , api , on} from './promisify.js';

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

export default {
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
}


