<script setup>
	import {
		onMounted,
		onUnmounted,
		ref
	} from 'vue'
	import {
		useBluetoothInfoStore
	} from "@/store/bluetoothInfo.js"
	const bluetoothInfo = useBluetoothInfoStore()
	let timer = ref(null)
	let isLongpress = ref(false)

	const btnclick = (index, val) => {
		// console.log(val, bluetoothInfo.deviceId, bluetoothInfo.characteristicId, bluetoothInfo.serviceId)
		sendToBlueTooth(index, val)
	}
	//长按事件
	const longpress = (index, val) => {
		console.log("长按")
		isLongpress.value = true
		timer.value = setInterval(() => {
			sendToBlueTooth(index, val)
		}, 400)
	}
	const touchend = () => {
		isLongpress.value = false
		clearInterval(timer.value)
		timer.value = null
		let timer1 = setTimeout(() => {
			sendToBlueTooth()
			clearTimeout(timer1)
		}, 400)
	}
	const onLoad = () => {
		console.log('onload')
		// 进入当前页面 自动切换成固定横屏
		// #ifdef APP-PLUS
		plus.screen.lockOrientation("landscape-primary");
		// #endif
	}
	const onUnload = () => {
		console.log('onUnload')
		// 退出当前页面时 自动切换成竖屏
		// #ifdef APP-PLUS
		plus.screen.lockOrientation("portrait-primary");
		// #endif
	}
	const sendToBlueTooth = (index = null, val = null) => {
		// 向蓝牙设备发送一个0x00的16进制数据
		const buffer = new ArrayBuffer(9)
		if (index !== null && val !== null) {
			const dataView = new DataView(buffer)
			// dataView.setUint8(0, 0)
			for (let i = 0; i < buffer.byteLength; i++) {
				if (i == index) {
					console.log("ok")
					dataView.setUint16(i, parseInt(val, 16))
				}
				/* else {
					dataView.setUint16(i, parseInt("00", 10))
				} */
			}
		}
		uni.writeBLECharacteristicValue({
			// 这里的 deviceId 需要在 getBluetoothDevices 或 onBluetoothDeviceFound 接口中获取
			deviceId: bluetoothInfo.deviceId,
			// 这里的 serviceId 需要在 getBLEDeviceServices 接口中获取
			serviceId: bluetoothInfo.serviceId,
			// 这里的 characteristicId 需要在 getBLEDeviceCharacteristics 接口中获取
			characteristicId: bluetoothInfo.characteristicId,
			// 这里的value是ArrayBuffer类型
			value: buffer,
			success(res) {
				console.log('writeBLECharacteristicValue success', res.errMsg)
			}
		})

	}
	onMounted(() => {
		onLoad()
	})
	onUnmounted(() => {
		onUnload()
	})
	let speed = ref(30)
	const sliderChange = (e) => {
		console.log('value 发生变化：' + e.detail.value)
		speed.value = e.detail.value
		let sendValue = speed.value.toString(16)
		sendToBlueTooth(6, sendValue)
	}
</script>
<template>
	<view class="operate">
		<view class="front">
			<ul>
				<li>
					<div class="title">1</div>
					<div class="btn">
						<button style="width: 80px;height: 52px;" @click="btnclick(0,'11')"
							@longpress="longpress(0,'11')" @touchend="touchend">+</button>
						<button style="width: 80px;height: 52px;" @click="btnclick(0,'10')"
							@longpress="longpress(0,'10')" @touchend="touchend">-</button>
					</div>
				</li>
				<li>
					<div class="title">2</div>
					<div class="btn">
						<button style="width: 80px;height: 52px;" @click="btnclick(1,'21')"
							@longpress="longpress(1,'21')" @touchend="touchend">+</button>
						<button style="width: 80px;height: 52px;" @click="btnclick(1,'20')"
							@longpress="longpress(1,'20')" @touchend="touchend">-</button>
					</div>
				</li>
				<li>
					<div class="title">3</div>
					<div class="btn">
						<button style="width: 80px;height: 52px;" @click="btnclick(2,'31')"
							@longpress="longpress(2,'31')" @touchend="touchend">+</button>
						<button style="width: 80px;height: 52px;" @click="btnclick(2,'30')"
							@longpress="longpress(2,'30')" @touchend="touchend">-</button>
					</div>
				</li>
				<li>
					<div class="title">速度</div>
					<div class="spd">
						<slider :value="speed" @change="sliderChange" min="1" max="100" show-value />
					</div>
				</li>
				<li>
					<div class="title">喇叭</div>
					<div class="buzzer">
						<button style="width: 50px;height: 50px;border-radius: 25px;" @click="btnclick(7,'71')"
							@longpress="longpress(7,'71')" @touchend="touchend">di</button>
					</div>
				</li>
			</ul>
		</view>
		<view class="direction">
			<ul>
				<li>
					<div class="title">前后</div>
					<div class="fb btn">
						<button style="width: 80px;height: 52px;" @click="btnclick(3,'41')"
							@longpress="longpress(3,'41')" @touchend="touchend">+</button>
						<button style="width: 80px;height: 52px;" @click="btnclick(3,'40')"
							@longpress="longpress(3,'40')" @touchend="touchend">-</button>
					</div>
				</li>
				<li>
					<div class="title">旋转</div>
					<div class="lr btn">
						<button style="width: 80px;height: 52px;" @click="btnclick(4,'51')"
							@longpress="longpress(4,'51')" @touchend="touchend">+</button>
						<button style="width: 80px;height: 52px;" @click="btnclick(4,'50')"
							@longpress="longpress(4,'50')" @touchend="touchend">-</button>
					</div>
				</li>
				<li>
					<div class="title">左右</div>
					<div class="lr btn">
						<button type="default" style="width: 80px;height: 52px;" @click="btnclick(5,'61')"
							@longpress="longpress(5,'61')" @touchend="touchend">+</button>
						<button type="default" style="width: 80px;height: 52px;" @click="btnclick(5,'60')"
							@longpress="longpress(5,'60')" @touchend="touchend">-</button>
					</div>
				</li>
			</ul>
		</view>
	</view>
</template>

<style lang="scss">
	li {
		list-style: none;
		padding: 6px 3px;
		flex: 1;

		.btn {
			padding: 6px 3px;
		}
	}

	.operate {
		box-sizing: border-box;
		display: flex;
		flex-direction: column;

		.front {
			flex: 1;

			ul {
				display: flex;
				justify-content: space-around;
			}
		}

		.direction {
			flex: 1;

			ul {
				display: flex;
				justify-content: space-around;

				li {
					.lr {
						display: flex;
						height: 100%;
						justify-content: center;
						align-items: center;
					}
				}
			}
		}
	}
</style>