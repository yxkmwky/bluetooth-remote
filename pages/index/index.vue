<template>
	<view>
		<scroll-view
			scroll-y
			class="box"
		>
			<view class="item" v-for="item in blueDeviceList" @click="connect(item)">
				<view>
					<text>id: {{ item.deviceId }}</text>	
				</view>
				<view>
					<text>name: {{ item.name }}</text>	
				</view>
			</view>
		</scroll-view>
		
		<button @click="initBlue">1 初始化蓝牙</button>
		
		<button @click="discovery">2 搜索附近蓝牙设备</button>
		
		<button @click="getServices">3 获取蓝牙服务</button>
		
		<button @click="getCharacteristics">4 获取特征值</button>
		
		<button @click="notify">5 开启消息监听</button>
		
		<button @click="send">6 发送数据</button>
		
		<button @click="read">7 读取数据</button>
		
		<view class="msg_x">
			<view class="msg_txt">
				监听到的内容：{{ message }}
			</view>
			<view class="msg_hex">
				监听到的内容（十六进制）：{{ messageHex }}
			</view>	
		</view>	
		
		<navigator url="/pages/operate/operate" hover-class="other-navigator-hover">
			<button type="default">跳转操作页面</button>
		</navigator>

	</view>
</template>

<script setup>
import { ref } from 'vue'
import { useBluetoothInfoStore } from "@/store/bluetoothInfo.js"

// 搜索到的蓝牙设备列表
const blueDeviceList = ref([])

const bluetoothInfo = useBluetoothInfoStore()

// 【1】初始化蓝牙
function initBlue() {
	uni.openBluetoothAdapter({
		success(res) {
			console.log('初始化蓝牙成功')
			console.log(res)
		},
		fail(err) {
			console.log('初始化蓝牙失败')
			console.error(err)
		}
	})
}

// 【2】开始搜寻附近设备
function discovery() {
	uni.startBluetoothDevicesDiscovery({
		success(res) {
			console.log('开始搜索')
			// 开启监听回调
			uni.onBluetoothDeviceFound(found)
		},
		fail(err) {
			console.log('搜索失败')
			console.error(err)
		}
	})
}

// 【3】找到新设备就触发该方法
function found(res) {
	console.log(res)
	if (res.devices[0].name === "Wky"&&isDeviceIdExist(res.devices[0].deviceId)){
		blueDeviceList.value.push(res.devices[0])
	}
}

function isDeviceIdExist(deviceId){
	blueDeviceList.value.forEach((val)=>{
		if(deviceId===val.deviceId){
			return false
		}
	})
	return true
}

// 蓝牙设备的id
const deviceId = ref('')

// 【4】连接设备
function connect(data) {
	console.log(data)
	
	deviceId.value = data.deviceId
	bluetoothInfo.changeDeviceId(data.deviceId)
	
	uni.createBLEConnection({
		deviceId: deviceId.value,
		success(res) {
			console.log('连接成功')
			console.log(res)
			// 停止搜索
			stopDiscovery()
			uni.showToast({
				title: '连接成功'
			})
		},
		fail(err) {
			console.log('连接失败')
			console.error(err)
			uni.showToast({
				title: '连接成功',
				icon: 'error'
			})
		}
	})
}

// 【5】停止搜索
function stopDiscovery() {
	uni.stopBluetoothDevicesDiscovery({
		success(res) {
			console.log('停止成功')
			console.log(res)
		},
		fail(err) {
			console.log('停止失败')
			console.error(err)
		}
	})
}

// 【6】获取服务
function getServices() {
	uni.getBLEDeviceServices({
		deviceId: deviceId.value,
		success(res) {
			console.log(res)
			uni.showToast({
				title: '获取服务成功'
			})
		},
		fail(err) {
			console.error(err)
			uni.showToast({
				title: '获取服务失败',
				icon: 'error'
			})
		}
	})
}

const serviceId = ref('0000FFE0-0000-1000-8000-00805F9B34FB')

// 【7】获取特征值
function getCharacteristics() {
	uni.getBLEDeviceCharacteristics({
		deviceId: deviceId.value,
		serviceId: serviceId.value,
		success(res) {
			console.log(res)
			uni.showToast({
				title: '获取特征值成功'
			})
		},
		fail(err) {
			console.error(err)
			uni.showToast({
				title: '获取特征值失败',
				icon: 'error'
			})
		}
	})
}

const characteristicId = ref('0000FFE1-0000-1000-8000-00805F9B34FB')

// 【8】开启消息监听
function notify() {
	uni.notifyBLECharacteristicValueChange({
		deviceId: deviceId.value,
		serviceId: serviceId.value,
		characteristicId: characteristicId.value,
		success(res) {
			console.log(res)
			listenValueChange()
			uni.showToast({
				title: '已开启监听'
			})
		},
		fail(err) {
			console.error(err)
			uni.showToast({
				title: '监听失败',
				icon: 'error'
			})
		}
	})
}

// ArrayBuffer转16进度字符串示例
function ab2hex(buffer) {
  const hexArr = Array.prototype.map.call(
    new Uint8Array(buffer),
    function (bit) {
      return ('00' + bit.toString(16)).slice(-2)
    }
  )
  return hexArr.join('')
}

// 
function hexCharCodeToStr(hexCharCodeStr) {
	var trimedStr = hexCharCodeStr.trim();
	var rawStr = trimedStr.substr(0, 2).toLowerCase() === "0x" ? trimedStr.substr(2) : trimedStr;
	var len = rawStr.length;
	if (len % 2 !== 0) {
			alert("存在非法字符!");
			return "";
	}
	var curCharCode;
	var resultStr = [];
	for (var i = 0; i < len; i = i + 2) {
			curCharCode = parseInt(rawStr.substr(i, 2), 16);
			resultStr.push(String.fromCharCode(curCharCode));
	}
	return resultStr.join("");
}

// 监听到的内容
const message = ref('')
const messageHex = ref('') // 十六进制

// 【9】监听消息变化
function listenValueChange() {
	uni.onBLECharacteristicValueChange(res => {
		console.log(res)
		let resHex = ab2hex(res.value)
		console.log(resHex)
		messageHex.value = resHex
		let result = hexCharCodeToStr(resHex)
		console.log(String(result))
		message.value = String(result)
	})
}

// 【10】发送数据
function send() {
	// 向蓝牙设备发送一个0x00的16进制数据
	
	let msg = 'hello'
	
	const buffer = new ArrayBuffer(msg.length)
	const dataView = new DataView(buffer)
	// dataView.setUint8(0, 0)
	
	for (var i = 0; i < msg.length; i++) {
	  dataView.setUint8(i, msg.charAt(i).charCodeAt())
	}
	
	uni.writeBLECharacteristicValue({
	  deviceId: deviceId.value,
	  serviceId: serviceId.value,
	  characteristicId: characteristicId.value,
	  value: buffer,
	  success(res) {
	    console.log('writeBLECharacteristicValue success', res.errMsg)
			uni.showToast({
				title: 'write指令发送成功'
			})
	  },
		fail(err) {
			console.error(err)
			uni.showToast({
				title: 'write指令发送失败',
				icon: 'error'
			})
		}
	})
}

// 【11】读取数据
function read() {
	uni.readBLECharacteristicValue({
		deviceId: deviceId.value,
		serviceId: serviceId.value,
		characteristicId: characteristicId.value,
		success(res) {
			console.log(res)
			uni.showToast({
				title: 'read指令发送成功'
			})
		},
		fail(err) {
			console.error(err)
			uni.showToast({
				title: 'read指令发送失败',
				icon: 'error'
			})
		}
	})
}
</script>

<style>
.box {
	width: 98%;
	height: 400rpx;
	box-sizing: border-box;
	margin: 0 auto 20rpx;
	border: 2px solid dodgerblue;
}
.item {
	box-sizing: border-box;
	padding: 10rpx;
	border-bottom: 1px solid #ccc;
}
button {
	margin-bottom: 20rpx;
}

.msg_x {
	border: 2px solid seagreen;
	width: 98%;
	margin: 10rpx auto;
	box-sizing: border-box;
	padding: 20rpx;
}

.msg_x .msg_txt {
	margin-bottom: 20rpx;
}
</style>
