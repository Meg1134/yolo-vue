import { defineStore } from "pinia";
import {ref} from 'vue'
export const useStore = defineStore(
    'main',
    () => {
       const  imageList = ref([])
       const  locationList = ref<{ name: any, left: any, top: any, right: any, down: any }[]>([]);
       const  dataList = ref([])    
        return {
            dataList,
            imageList,
            locationList,
        }
    },
    
    {
        persist: true,
    }
);
