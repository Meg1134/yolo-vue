<script setup lang="ts">
import { useStore } from '@/store';
const store = useStore();
const locationList = useStore().locationList

</script>
<template>
    <page-container title="数据显示">
        <el-table :data="locationList" stripe style="width: 100%">
            <el-table-column type="index" label="序号" width="80" header-align="center" align="center"></el-table-column>
            <el-table-column prop="name" label="文件名" width="80" header-align="center" align="center"></el-table-column>
            <el-table-column prop="left" label="left(左)" min-width="100" max-width="200" header-align="center"
                align="center"></el-table-column>
            <el-table-column prop="top" label="top(上)" min-width="100" max-width="200" header-align="center"
                align="center"></el-table-column>
            <el-table-column prop="right" label="right(右)" min-width="100" max-width="200" header-align="center"
                align="center"></el-table-column>
            <el-table-column prop="down" label="down(下)" min-width="150" max-width="300" header-align="center"
                align="center">
            </el-table-column>
        </el-table>
    </page-container>
</template>


<style lang="scss" scoped>
</style>