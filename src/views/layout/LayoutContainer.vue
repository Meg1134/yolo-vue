<script setup>
import {
    Picture,
    FullScreen,
    PieChart,
} from '@element-plus/icons-vue'

</script>

<template>
    <el-container class="layout-container">
      <el-aside width="200px">
        <div class="el-aside__logo"></div>
        <el-menu
          active-text-color="#ffd04b"
          background-color="#232323"
          :default-active="$route.path"
          text-color="#fff"
          router
        >
          <el-menu-item index="/result">
            <el-icon><FullScreen /></el-icon>
            <span>检测结果</span>
          </el-menu-item>
          <el-menu-item index="/detect">
            <el-icon><Picture /></el-icon>
            <span>目标检测</span>
          </el-menu-item>
          <el-menu-item index="/show">
            <el-icon><PieChart /></el-icon>
            <span>数据显示</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
      <el-container>
        <el-main>
          <router-view></router-view>
        </el-main>
      </el-container>
    </el-container>
  </template>

<style lang="scss" scoped>
.layout-container {
  height: 100vh;
  .el-aside {
    background-color: #232323;
    &__logo {
      height: 120px;
      background: url('@/assets/logo_song.png') no-repeat center / 120px auto;
    }
    .el-menu {
      border-right: none;
    }
  }
  .el-header {
    background-color: #fff;
    display: flex;
    align-items: center;
    justify-content: space-between;
    .el-dropdown__box {
      display: flex;
      align-items: center;
      .el-icon {
        color: #999;
        margin-left: 10px;
      }

      &:active,
      &:focus {
        outline: none;
      }
    }
  }
}
</style>