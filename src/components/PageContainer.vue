<script setup>

defineProps({
    title: {
        type: String,
        required: true,
    },
})
</script>
<template>
    <el-card class="page-container">
        <template #header>
            <div class="header">
                <span>{{title}}</span>
                <div class="extra">
                    <slot name="extra"></slot>
                </div>
            </div>
        </template>
        <slot></slot>
    </el-card>
</template>


<style lang="scss" scoped>
.page-container {
    min-height: 100%;
    box-sizing: border-box;

    .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
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

</style>