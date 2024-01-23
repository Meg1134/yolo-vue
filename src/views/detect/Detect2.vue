<script setup lang="ts">
import { ref, onMounted, Ref, watch } from 'vue';
import { useStore } from '@/store';
import { Chart, registerables } from 'chart.js';
// 获取 store 中的数据
const store = useStore();
const imageList: ImageItem[] = store.imageList;
const dataList = store.dataList;

// 注册 Chart.js 组件
Chart.register(...registerables);

interface ImageItem {
  id: string;
  url: string;
  // ...其他属性...
}

interface DataItem {
  X: string;
  Y: string;
  // ...其他属性...
}

// 定义 ref
const chartCanvas: Ref<HTMLCanvasElement | null> = ref(null);
let chartInstance: any = null;

// 处理轮播图变化事件
const handleCarouselChange = (currentIndex: number) => {
  updateChartData(dataList[currentIndex] || []);
};

// 更新散点图数据
// const updateChartData = (data) => {
//   chartInstance.data.datasets[0].data = data.map(item => ({ x: parseFloat(item.X), y: parseFloat(item.Y) }));
//   chartInstance.update();
// };

const updateChartData = (newData: DataItem[]) => {
  if (chartInstance) {
    chartInstance.data.datasets[0].data = newData.map(item => ({
      x: parseFloat(item.X),
      y: parseFloat(item.Y)
    }));
    chartInstance.update();
  }
};

watch(dataList, (newVal, oldVal) => {
  if (newVal.length > 0 && oldVal.length === 0) {
    handleCarouselChange(0);
  }
});


// 创建散点图
const createChart = () => {
  if (chartCanvas.value) {
    const ctx = chartCanvas.value.getContext('2d');
    if (!ctx) {
      console.error('ctx is null');
      return;
    }
    chartInstance = new Chart(ctx, {
      type: 'scatter',
      data: {
        datasets: [{
          label: 'Scatter Dataset',
          data: [],
          backgroundColor: 'rgba(255, 99, 132, 1)'
        }]
      },
      options: {
        scales: {
          x: {
            type: 'linear',
            position: 'bottom'
          },
          y: {
            type: 'linear',
            position: 'left'
          }
        }
      }
    });
  } else {
    console.error('chartCanvas.value is null');
  }

};

onMounted(createChart);

</script>
<template>
    <el-container>
      <el-main>
        <div class="carousel-container">
          <el-carousel :interval="5000" arrow="hover" @change="handleCarouselChange">
            <el-carousel-item v-for="item in imageList" :key="item.id">
              <img :src="item.url" alt="carousel image" />
              <!-- <h3 text="1xl" justify="center">{{ item.name }}</h3> -->
            </el-carousel-item>
          </el-carousel>
        </div>
        <div class="chart-container">
          <canvas ref="chartCanvas"></canvas>
        </div>
      </el-main>
      <el-footer></el-footer>
    </el-container>
</template>
  
<style scoped>
.carousel-container {
  width: 70%;
  /* 调整为所需的宽度 */
  height: 500px;
  /* 调整为所需的高度 */
  margin: 0 auto;
  /* 水平居中 */
}

.chart-container {
  /* 设置高度为固定像素值，您可以根据需求进行调整 */
  height: 300px;
  /* 可以根据需要设置其他样式，例如居中、背景色等 */
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f0f0f0;
  height: 50%;
}

.el-carousel__item h3 {
  color: #475669;
  opacity: 0.75;
  line-height: 300px;
  margin: 0;
  text-align: center;
}

.el-carousel__item {
  display: flex;
  justify-content: center;
  align-items: center;
}

.el-carousel__item:nth-child(2n) {
  background-color: #99a9bf;
}

.el-carousel__item:nth-child(2n + 1) {
  background-color: #d3dce6;
}

/* 调整图片样式以确保它们居中且保持纵横比 */
.el-carousel__item img {
  max-width: 100%;
  /* 图像最大宽度不超过容器 */
  max-height: 100%;
  /* 图像最大高度不超过容器 */
  object-fit: contain;
  /* 保持图像纵横比 */
}</style>
  