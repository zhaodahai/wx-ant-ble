# wx-ant-ble 接口文档

### 目录
- [初始化 `BTManager() `](#jump-init)
- [扫描外设 `scan()`](#jump-scan)
- [停止扫描 `stopScan()`](#jump-stopScan)
- [连接外设 `connect()`](#jump-connect)
- [断开连接 `disconnect()`](#jump-disconnect)
- [读特征值 `read()`](#jump-read)
- [写数据 `write()`](#jump-write)
- [监听特征值 `notify()`](#jump-notify)
- [注册状态更新回调 `registerDidUpdateConnectStatus()`](#jump-callback-connect-status)
- [注册发现外设回调 `registerDidDiscoverDevice()`](#jump-callback-discover-device)
- [注册特征值改变回调 `registerDidUpdateValueForCharacteristic()`](#jump-callback-value-update)


### 详细接口说明
- #### <span id="jump-init">初始化 `BTManager(config)`</span>
> 参数：`config(Object)` 配置 <br>
> 说明：初始化SDK管理实例，**单例模式**。
>
```js
  this.bt = new BTManager({
    debug: false
  });
```
| 参数字段 | 类型  | 必填 | 默认 | 说明 |
| :--     | :--: | :--: | :--: | :-- |
| debug   | Boolean | 否 | false | 是否开启打印调试 |


- #### <span id="jump-scan">扫描外设 `scan(options)`</span>
> 参数：`options(Object)` 扫描参数 <br>
> 返回值：Promise对象，[调用成功](#jump-SuccessApiThen) | [调用失败](#jump-ErrorApiCatch)<br>
> 说明：开始扫描外设，注意实现返回对象的then和catch方法，监听接口是否调用成功。<br>
> &emsp;&emsp;&emsp;&nbsp;此操作比较耗费系统资源，请在搜索到设备后调用stopScan方法停止扫描。<br>
> &emsp;&emsp;&emsp;&nbsp;重复调用此接口，会清空之前设备存储，再次上报已上报的设备，能够起到刷新的作用。
>
```js
  this.bt.scan({
    services: [],
    allowDuplicatesKey: false,
    interval : 0,
    timeout: 15,
    deviceName: '', 
    containName:''
  }).then(res => {
    console.log('scan success', res);
  }).catch(e => {
    console.log('scan fail', e);
  });
```
| 参数字段 | 类型 | 必填 | 默认 | 说明 |
| :-- | :-- | :--: | :--: | :-- |
| services  | Array | 否 | [] |主service的uuid列表。确认在蓝牙广播中存在此服务id，可以通过服务id过滤掉其他设备 |
| allowDuplicatesKey | Boolean | 否 | false | 是否允许重复上报设备 |
| interval | Number | 否 | 0 | 上报新设备的间隔 |
| timeout | Number | 否 | 15000 | 扫描超时时间，毫秒。在该时间内未扫描到符合要求的设备，上报超时。-1表示无限超时。[超时回调](#jump-callback-discover-device) |
| deviceName | String | 否 | "" | 通过蓝牙名称过滤，需要匹配的设备名称 |
| containName | String | 否 | "" | 通过蓝牙名称过滤，需要包含的设备名称 |


- #### <span id="jump-stopScan">停止扫描 `stopScan()`</span>
> 返回值：Promise对象，[调用成功](#jump-SuccessApiThen) | [调用失败](#jump-ErrorApiCatch)<br>
> 说明：停止扫描，取消超时延时。
```js
  this.bt.stopScan()
  .then(res => {
    console.log('stopScan success', res);
  }).catch(e => {
    console.log('stopScan fail', e);
  })
```

- #### <span id="jump-connect">连接外设 `connect(device , timeout)`</span>
> 参数：`device(Object)` 设备对象 <br>
>&emsp;&emsp;&emsp;&nbsp; `timeout(Number)` 超时时间<br>
> 返回值：Promise对象，[调用成功](#jump-SuccessApiThen) | [调用失败](#jump-ErrorApiCatch)<br>
> 说明：连接指定的外设，需要传入外设对象。
>
```js
  this.bt.connect(device)
  .then(res => {
    console.log('connect success', res);
  }).catch(e => {
    console.log('connect fail', e);
  });
```
| 参数字段 | 类型 | 必填 | 默认 | 说明 |
| :-- | :-- | :--: | :--: | :-- |
| device | Object | 是 | -- | 指定连接的[外设对象](#jump-DeviceInfo)，从[registerDidDiscoverDevice](#jump-callback-discover-device)注册的回调中得到 |
| timeout | Number | 否 | 15000 | 连接超时时间，毫秒，支付宝小程序无效|


- #### <span id="jump-disconnect">断开连接 `disconnect()`</span>
> 返回值：Promise对象，[调用成功](#jump-SuccessApiThen) | [调用失败](#jump-ErrorApiCatch)<br>
>
```js
  this.bt.disconnect()
  .then(res => {
    console.log('disconnect success', res);
  }).catch(e => {
    console.log('disconnect fail', e);
  })
```

- #### <span id="jump-read">读特征值 `read(params)`</span>
> 参数：`params(Object)` 参数 <br>
> 返回值：Promise对象，[调用成功](#jump-SuccessApiThen) | [调用失败](#jump-ErrorApiCatch)<br>
> 说明：读某个特征值。
>
```js
  this.bt.read({
    suuid: 'xxxx', // 特征对应的服务uuid
    cuuid: 'xxxx'  // 特征uuid
  }).then(res => {
    console.log('read success', res);
  }).catch(e => {
    console.log('read fail', e);
  })
```
| 参数字段 | 类型 | 必填 | 说明 |
| :--: | :--: | :--: | :--: |
| suuid | String | 是 | 特征对应的服务uuid |
| cuuid | String | 是 | 特征uuid |


- #### <span id="jump-write">写数据 `write(params)`</span>
> 参数：`params(Object)` 参数 <br>
> 返回值：Promise对象，[调用成功](#jump-SuccessApiThen) | [调用失败](#jump-ErrorApiCatch)<br>
> 说明：向蓝牙模块写入数据。
>
```js
  this.bt.write({
    suuid: 'xxxx', // 特征对应的服务uuid
    cuuid: 'xxxx', // 特征uuid
    value: 'FFFF'  // 写入的数据
  }).then(res => {
    console.log('write success', res);
  }).catch(e => {
    console.log('write fail', e);
  })
```
| 参数字段 | 类型 | 必填 | 说明 |
| :--: | :--: | :--: | :--: |
| suuid | String | 是 | 特征对应的服务uuid |
| cuuid | String | 是 | 特征uuid |
| value | String | 是 | 16进制字符串 |


- #### <span id="jump-notify">读特征值 `notify(params)`</span>
> 参数：`params(Object)` 参数 <br>
> 返回值：Promise对象，[调用成功](#jump-SuccessApiThen) | [调用失败](#jump-ErrorApiCatch)<br>
> 说明：监听某个特征值变化。
>
```js
  this.bt.notify({
    suuid: 'xxxx',     // 特征对应的服务uuid
    cuuid: 'xxxx',     // 特征uuid
    state: true/false  // 是否监听
  }).then(res => {
    console.log('notify success', res);
  }).catch(e => {
    console.log('notify fail', e);
  })
```
| 参数字段 | 类型 | 必填 | 说明 |
| :--: | :--: | :--: | :--: |
| suuid | String  | 是 | 特征对应的服务uuid |
| cuuid | String  | 是 | 特征uuid |
| state | Boolean | 是 | 是否启用notify，可以通过重复调用接口改变此属性打开/关闭监听 |


- #### <span id="jump-callback-connect-status">注册状态更新回调 `registerDidUpdateConnectStatus(callback)`
> 参数：`callback(Function)` 回调函数 <br>
> 说明：注册状态更新时的回调函数，当状态connectStatus发生变化时回调已注册的函数。
>
```js
  this.bt.registerDidUpdateConnectStatus(res => {
    // 参数结构注意查看log
    console.log('registerDidUpdateConnectStatus', res);
    if (res.connectStatus === ConnectStatus.connected) {
      this.setData({ isConnected: true });
      ...
    }else if (res.connectStatus === ConnectStatus.disconnected) {
      this.setData({ isConnected: false });
      ...
    }
  });
```
**返回示例**
```js
  {
      code: 222,
      connectStatus: 2,
      message: '连接成功',
      device: {
        RSSI: -70,            // 蓝牙信号强度，越大越强
        name: 'XXXX',         // 设备名称
        advertisData: 'XXXX', // 广播数据
        deviceId: 'XXXX',     // 设备id
        ...
      }
  }
```
| 参数字段 | 类型 | 参考 | 必填 | 说明 |
| :-- | :-- | :-- | :--: | :-- |
| code  | Number | [回调成功事件](#jump-SuccessCallbackEvent) [回调失败事件](#jump-ErrorCallbackEvent)  | 是 |  连接状态码 |
| connectStatus | ConnectStatus | [连接状态说明](#jump-ConnectStatus) | 是 | 连接状态 |
| device | Object | [设备说明](#jump-DeviceInfo) | 否 | 设备信息，连接成功之后获取 |
| message | String | [回调成功事件](#jump-SuccessCallbackEvent) [回调失败事件](#jump-ErrorCallbackEvent)  | 是 | 状态描述 |


- #### <span id="jump-callback-discover-device">注册发现外设回调 `registerDidDiscoverDevice(callback)`
> 参数：`callback(Function)` 回调函数 <br>
> 说明：当扫描到设备时回调，或者达到超时时间回调。
>
```js
  this.bt.registerDidDiscoverDevice(res => {
    // 参数结构注意查看log
    console.log('registerDidDiscoverDevice', res);
    ...
  });
```
**返回示例**
```js
  {
      code: 210,
      timeout: false,
      message: '发现外设',
      device: {
        RSSI: -70,            // 蓝牙信号强度，越大越强
        name: 'XXXX',         // 设备名称
        advertisData: 'XXXX', // 广播数据
        deviceId: 'XXXX',     // 设备id
        ...
      }
  }
```
| 参数字段 | 类型 | 参考 | 必填 | 说明 |
| :-- | :-- | :-- | :--: | :-- |
| code  | Number | [回调成功事件](#jump-SuccessCallbackEvent) [回调失败事件](#jump-ErrorCallbackEvent) | 是 |  扫描状态码 |
| timeout | Boolean | -- | 是 | 扫描是否超时 |
| device | Object | [设备说明](#jump-DeviceInfo) | 否 | 设备信息 |
| message | String | [回调成功事件](#jump-SuccessCallbackEvent) [回调失败事件](#jump-ErrorCallbackEvent) | 是 | 状态描述 |


- #### <span id="jump-callback-value-update">注册状态更新回调 `registerDidUpdateValueForCharacteristic(callback)`
> 参数：`callback(Function)` 回调函数 <br>
> 说明：当监听的特征值改变时回调，或者读特征值时回调。
>
```js
  this.bt.registerDidUpdateValueForCharacteristic(res => {
    // 参数结构注意查看log
    console.log('registerDidUpdateValueForCharacteristic', res);
    ...
  });
```
**返回示例**
```js
  {
    characteristic: 'XXXX',
    serviceId: 'XXXX',
    deviceId: 'XXXX',
    value: 'FFFF'
  }
```
| 参数字段 | 类型 | 必填 | 说明 |
| :-- | :--: | :--: | :-- |
| characteristic  | String | 是 | 特征uuid |
| serviceId | String | 是 | 特征对应的服务uuid |
| deviceId | String | 是 | 设备id |
| value | String | 是 | 特征值 |


## 枚举类型说明

- #### <span id="jump-DeviceInfo">设备信息</span>
| 属性字段 | 类型 | 必填 | 说明 |
| :-- | :-- | :--: | :-- |
| RSSI  | Number | 是 | 设备信号强度 |
| deviceId | String | 是 | 设备id |
| name | String | 是 | 设备名称 |
| localName | String | 否 | 设备名称 |
| services | Array | 是 | 设备所有[服务](#jump-DeviceService) |
| advertisData | String | 否 | 广播数据 |
| advertisServiceUUIDs | Array | 否 | 广播中的服务UUID |


- #### <span id="jump-DeviceService">服务</span>
| 属性字段 | 类型 | 必填 | 说明 |
| :-- | :-- | :--: | :-- |
| serviceId  | String | 是 | 服务uuid |
| characteristics | Array | 是 | 服务中的所有[特征](#jump-DeviceCharacteristic) |


- #### <span id="jump-ConnectStatus">连接状态 `ConnectStatus`</span>
| 状态key | 状态值(Number)| 状态描述 |
| :-- | :--: | :--: |
| ConnectStatus.disconnected  | 0 | 未连接或连接断开，允许连接 |
| ConnectStatus.connecting    | 1 | 正在连接，不允许再连接    |
| ConnectStatus.connected     | 2 | 已连接，不允许再连接      |


- #### <span id="jump-DeviceCharacteristic">特征</span>
| 属性字段 | 类型 | 必填 | 说明 |
| :-- | :-- | :--: | :-- |
| uuid  | String | 是 | 特征uuid |
| properties | Object | 是 | 特征的特性 indicate/notify/read/write |


- #### <span id="jump-SuccessCallbackEvent">发现外设回调和连接状态改变回调成功事件 `SuccessCallbackEvent`</span>
| 事件码 | 事件key |事件描述 |
| :--: | :-- | :-- |
| 210 | SuccessCallbackEvent.Success_DiscoverDevice_CB_Discover | 发现外设 |
| 211 | SuccessCallbackEvent.Success_DiscoverDevice_CB_ScanDone | 扫描完成 |
| 220 | SuccessCallbackEvent.Success_ConnectStatus_CB_PowerOn   | 蓝牙打开 |
| 221 | SuccessCallbackEvent.Success_ConnectStatus_CB_Connecting| 正在连接 |
| 222 | SuccessCallbackEvent.Success_ConnectStatus_CB_Connected | 连接成功 |
| 223 | SuccessCallbackEvent.Success_ConnectStatus_CB_Stop      | 断开成功 |


- #### <span id="jump-ErrorCallbackEvent">发现外设回调和连接状态改变回调失败事件 `ErrorCallbackEvent`</span>
| 事件码 | 事件key |事件描述 |
| :--: | :-- | :-- |
| 410 | ErrorCallbackEvent.Error_DiscoverDevice_CB_Timeout     | 扫描超时 |
| 420 | ErrorCallbackEvent.Error_ConnectStatus_CB_PowerOff     | 蓝牙关闭 |
| 421 | ErrorCallbackEvent.Error_ConnectStatus_CB_ConnectFail  | 连接失败 |
| 422 | ErrorCallbackEvent.Error_ConnectStatus_CB_Disconnected | 连接断开 |


- #### <span id="jump-SuccessApiThen">接口调用成功事件`SuccessApiThen`</span>
| 事件码 | 事件key |事件描述 |
| :--: | :-- | :-- |
| 2010 | SuccessApiThen.Success_Scan       | 扫描接口成功调用 |
| 2020 | SuccessApiThen.Success_StopScan   | 停止扫描接口成功调用 |
| 2030 | SuccessApiThen.Success_Connect    | 连接接口成功调用 |
| 2040 | SuccessApiThen.Success_Disconnect | 断开接口成功调用 |
| 2050 | SuccessApiThen.Success_Read       | 读特征值接口成功调用 |
| 2060 | SuccessApiThen.Success_Write      | 写入数据接口成功调用 |
| 2070 | SuccessApiThen.Success_Notify     | 监听特征值接口成功调用 |


- #### <span id="jump-ErrorApiCatch">接口调用失败事件`ErrorApiCatch`</span>
| 事件码 | 事件key |事件描述 |
| :--: | :-- | :-- |
| 4000 | ErrorApiCatch.Error_Low_Version              | 当前基础库版本低，请更新微信版本 |
| 4010 | ErrorApiCatch.Error_Scan_Failed              | 扫描错误：扫描失败 |
| 4011 | ErrorApiCatch.Error_Scan_PowerOff            | 扫描错误：蓝牙被关闭 |
| 4012 | ErrorApiCatch.Error_Scan_NoService           | 扫描错误：没有找到指定服务 |
| 4020 | ErrorApiCatch.Error_StopScan_Failed          | 停止扫描错误：停止扫描失败 |
| 4021 | ErrorApiCatch.Error_StopScan_PowerOff        | 停止扫描错误：蓝牙被关闭 |
| 4030 | ErrorApiCatch.Error_Connect_Failed           | 连接错误：连接失败 |
| 4031 | ErrorApiCatch.Error_Connect_PowerOff         | 连接错误：蓝牙被关闭 |
| 4032 | ErrorApiCatch.Error_Connect_AlreadyConnected | 连接错误：已经连接或正在连接 |
| 4033 | ErrorApiCatch.Error_Connect_Timeout          | 连接错误：连接超时 |
| 4034 | ErrorApiCatch.Error_Connect_EmptyId          | 连接错误：设备id不能为空 |
| 4040 | ErrorApiCatch.Error_Disconnect_Failed        | 断开错误：断开失败 |
| 4050 | ErrorApiCatch.Error_Read_Failed              | 读特征值错误：读特征值失败 |
| 4051 | ErrorApiCatch.Error_Read_NotConnected        | 读特征值错误：蓝牙未连接 |
| 4052 | ErrorApiCatch.Error_Read_NotSupport          | 读特征值错误：当前特征不支持读操作 |
| 4053 | ErrorApiCatch.Error_Read_NoService           | 读特征值错误：没有找到指定服务 |
| 4054 | ErrorApiCatch.Error_Read_NoCharacteristic    | 读特征值错误：没有找到指定特征值 |
| 4060 | ErrorApiCatch.Error_Write_Failed             | 写入数据错误：写入数据失败 |
| 4061 | ErrorApiCatch.Error_Write_NotConnected       | 写入数据错误：蓝牙未连接 |
| 4062 | ErrorApiCatch.Error_Write_NotSupport         | 写入数据错误：当前特征不支持写操作 |
| 4063 | ErrorApiCatch.Error_Write_NoService          | 写入数据错误：没有找到指定服务 |
| 4064 | ErrorApiCatch.Error_Write_NoCharacteristic   | 写入数据错误：没有找到指定特征值 |
| 4070 | ErrorApiCatch.Error_Notify_Failed            | 监听特征值错误：监听特征值错误失败 |
| 4071 | ErrorApiCatch.Error_Notify_NotConnected      | 监听特征值错误：蓝牙未连接 |
| 4072 | ErrorApiCatch.Error_Notify_NotSupport        | 监听特征值错误：当前特征不支持监听操作 |
| 4073 | ErrorApiCatch.Error_Notify_NoService         | 监听特征值错误：没有找到指定服务 |
| 4074 | ErrorApiCatch.Error_Notify_NoCharacteristic  | 监听特征值错误：没有找到指定特征值 |

