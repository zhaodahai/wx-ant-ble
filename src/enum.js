
// 连接状态
export const ConnectStatus = {
  // 未连接或连接断开，允许连接
  disconnected: 0,
  // 正在连接，不允许再连接
  connecting: 1,
  // 已连接，不允许再连接
  connected: 2,
}

// 发现外设回调和连接状态改变回调成功事件
export const SuccessCallbackEvent = {
  Success_DiscoverDevice_CB_Discover:  { code: 210, message: '发现外设' },
  Success_DiscoverDevice_CB_ScanDone:  { code: 211, message: '扫描完成' },
  Success_ConnectStatus_CB_PowerOn:    { code: 220, message: '蓝牙打开' },
  Success_ConnectStatus_CB_Connecting: { code: 221, message: '正在连接' },
  Success_ConnectStatus_CB_Connected:  { code: 222, message: '连接成功' },
  Success_ConnectStatus_CB_Stop:       { code: 223, message: '断开成功' },
}

// 发现外设回调和连接状态改变回调失败事件
export const ErrorCallbackEvent = {
  Error_DiscoverDevice_CB_Timeout:     { code: 410, message: '扫描超时' },
  Error_ConnectStatus_CB_PowerOff:     { code: 420, message: '蓝牙关闭' },
  Error_ConnectStatus_CB_ConnectFail:  { code: 421, message: '连接失败' },
  Error_ConnectStatus_CB_Disconnected: { code: 422, message: '连接断开' },
}

// 接口调用成功事件
export const SuccessApiThen = {
  Success_Scan:       { code: 2010, message: '扫描接口成功调用' },
  Success_StopScan:   { code: 2020, message: '停止扫描接口成功调用' },
  Success_Connect:    { code: 2030, message: '连接接口成功调用' },
  Success_Disconnect: { code: 2040, message: '断开接口成功调用' },
  Success_Read:       { code: 2050, message: '读特征值接口成功调用' },
  Success_Write:      { code: 2060, message: '写入数据接口成功调用' },
  Success_Notify:     { code: 2070, message: '监听特征值接口成功调用' },
}

// 接口调用失败事件
export const ErrorApiCatch = {
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
}

