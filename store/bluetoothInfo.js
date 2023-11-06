import { defineStore } from 'pinia';
import { ref } from 'vue'

export const useBluetoothInfoStore = defineStore('bluetoothInfo',() => {
	const deviceId = ref("");
	const serviceId = ref('0000FFE0-0000-1000-8000-00805F9B34FB');
	const characteristicId = ref('0000FFE1-0000-1000-8000-00805F9B34FB');
	const changeDeviceId = (val) => {
		deviceId.value = val
	}
	
	return {
		deviceId,
		serviceId,
		characteristicId,
		changeDeviceId
	};
});
