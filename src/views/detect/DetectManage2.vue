<script lang="ts" setup>
import { ref, toRaw, provide, onMounted } from 'vue'
import { Setting, Refresh } from '@element-plus/icons-vue'
import { useStore } from '@/store';
import router from '@/router/index'
import {
    Picture,
    FullScreen,
    PieChart,
} from '@element-plus/icons-vue'

const tableData = ref<{ name: any, data: any, result: any, option: any }[]>([]);

const showSettingDialog = ref(false);
const filePaths = ref([]);
const store = useStore();
const imageList: { url: string, id: any, name:any }[] =store.imageList
const locationList = store.locationList
let dataList: { X: string; Y: string; }[] = [];
dataList = store.dataList;

interface File {
    creationTime: string; // 或者是 Date，取决于 creationTime 的实际类型
    // 这里还可以定义其他的属性
}

const showAll = async (row: any) => {
  await Promise.all([showImag(row), showMap(row)]);
  
  router.push({ path: '/detect' });
};

const showTableData = async () => {
    const directoryPath = settings.value.directory;  // 替换为你要遍历的目录的路径

    try {
        let files = await window.ipcRenderer.invoke('traverse-directory', directoryPath);
        files = files.sort((a: File, b: File) => new Date(b.creationTime).getTime() - new Date(a.creationTime).getTime());
        files.forEach((file: { name: any; creationTime: any; }) => {
            const date = new Date(file.creationTime);
            const formattedDate = date.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' });
            const formattedTime = date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false });
            tableData.value.push({
                name: `${file.name}`,
                data: `${formattedDate} ${formattedTime}`,
                result: '检测结果',
                option: '查看'
            })
        });
    } catch (err) {
        console.error(err);
    }
}
// 选择文件的函数
const selectFiles = async () => {

    const result = await window.ipcRenderer.invoke('open-file-dialog');
    console.log("Renderer Dialog result:", result); // 输出选择的结果

    filePaths.value = result;
    console.log('filePaths in vue:', filePaths.value)
    const rawFilePaths = toRaw(filePaths.value);
    window.ipcRenderer.send('detect-objects', rawFilePaths);
};

// 选择目录的函数
const selectDirectory = async () => {
    try {
        const result = await window.ipcRenderer.invoke('open-file-dialog-for-directory');
        console.log("Renderer Dialog result:", result); // 输出选择的结果

        if (result && result.length > 0) {
            console.log("Selected directory:", result[0]); // 输出选中的目录
            filePaths.value = result[0]; // 设置选中的目录路径
        }
    } catch (error) {
        console.error('Error opening file dialog for directories', error);
    }

    // 检查 filePaths.value 是否正确更新
    console.log("Updated filePaths:", filePaths.value);

    // 获取 filePaths 的原始值，并发送给 detect-objects
    const rawFilePaths = toRaw(filePaths.value);
    console.log("Sending rawFilePaths to detect-objects:", rawFilePaths);
    window.ipcRenderer.send('detect-objects', rawFilePaths);
};


const settings = ref({
    pythonPath: '',
    scriptPath: '',
    modelWeights: '',
    directory: '',
    // 其他设置...
});

const saveSettings = () => {
    const serializedSettings = JSON.stringify(settings.value);
    localStorage.setItem('yoloSettings', serializedSettings);

    window.ipcRenderer.send('update-settings', serializedSettings);
    showSettingDialog.value = false;
    console.log('Settings saved:', settings.value);

};


// 从 localStorage 或主进程加载设置
const loadSettings = () => {
    const savedSettings = JSON.parse(localStorage.getItem('yoloSettings') || '{}');
    Object.assign(settings.value, savedSettings);
};

const reLoadTableData = async () => {
    tableData.value = []; // 清空现有数据
    await showTableData(); // 重新加载数据
}


const showImag = async (row: any) => {
    // 重置
  imageList.splice(0, imageList.length);
  console.log(row)
  const dirPath = settings.value.directory + '\\' + row.name ;
  
  console.log(dirPath)

  // 请求主进程读取目录中的所有文件
  const filePaths = await window.ipcRenderer.invoke('read-dir', dirPath);
    
  filePaths.forEach((filePath: any, index: number) => {
    // 如果filePath是图片文件，则添加到imageList中
    if (filePath.endsWith('.jpg') || filePath.endsWith('.png') || filePath.endsWith('.jpeg')){
        imageList.push({
        id: imageList.length + 1,
        url: filePath,
        name: `Image ${imageList.length + 1}`,
    });
    }
  });  
};

const showMap = async (row: any) => {
    dataList.splice(0, dataList.length);
    const dirPath = settings.value.directory + '\\' + row.name + '\\' + 'labels';
    // 请求主进程读取目录中的所有文件
    const filePaths = await window.ipcRenderer.invoke('read-dir', dirPath);
    
    // 处理所有 CSV 文件
    const csvPromises = filePaths
        .filter((filePath: string) => filePath.endsWith('.csv'))
        .map((filePath: any) => window.ipcRenderer.invoke('read-csv', filePath));


    const allCsvData = await Promise.all(csvPromises);

    allCsvData.forEach(csvData => {
        const csvDataList = csvData.map((item: any) => ({
            X: item.X,
            Y: item.Y,
        }));
        dataList.push(csvDataList);
    });
  console.log('dataList:', dataList)
}


const showLocation = async (row: any, index: any) => {
    locationList.splice(0, locationList.length);
    const dirPath = settings.value.directory + '\\' + row.name ;
    // 请求主进程读取目录中的所有文件
    const filePaths = await window.ipcRenderer.invoke('read-dir', dirPath);
    filePaths.forEach((filePath: any, index: number) => {
    // 如果filePath是csv文件，则添加到locationList中
    if (filePath.endsWith('.csv')){
        const data = window.ipcRenderer.invoke('read-csv', filePath);
        console.log('data:', data)
        data.then((res) => {
            res.forEach((item: any) => {
                locationList.push({
                    name: item.ImageID,
                    left: item.X1,
                    top: item.Y1,
                    right: item.X2,
                    down: item.Y2,
                })
            })
        })
    }
  }); 

  router.push({path:'/show'})
}


loadSettings();
showTableData();

provide('imageList', imageList);
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
            <el-card>
        <template #header>
            <div class="header">
                <span>目标检测</span>
                <div >
                <el-button type="primary" @click="selectDirectory">上传文件夹</el-button>
                <el-button type="success" @click="selectFiles">上传图片</el-button>
                <el-button :icon="Setting" @click="showSettingDialog = true" type="warning" circle />
                <el-button :icon="Refresh" @click="reLoadTableData" type="danger" circle />
                </div>
            </div>
        </template>
        <el-table :data="tableData" stripe style="width: 100%">
            <el-table-column type="index" label="序号" width="80" header-align="center" align="center"></el-table-column>
            <el-table-column prop="name" label="文件名" width="80" header-align="center" align="center"></el-table-column>
            <el-table-column prop="data" label="时间" min-width="100" max-width="200" header-align="center"
                align="center"></el-table-column>
            <el-table-column prop="result" label="结果" min-width="150" max-width="300" header-align-="center"
                align="center"></el-table-column>
            <el-table-column prop="option" label="查看" min-width="150" max-width="300" header-align="center" align="center">
                <template #default="{ row, $index }">
                    <el-button type="primary" @click="showLocation(row, $index)" size="small" plain>坐标结果</el-button>
                    <el-button type="success" @click="showAll(row)" size="small" plain >图像结果</el-button>
                </template>
            </el-table-column>
        </el-table>

        <el-dialog title="Settings" v-model="showSettingDialog">
            <el-form>
                <el-form-item label="环境地址">
                    <el-input v-model="settings.pythonPath"></el-input>
                </el-form-item>
                <el-form-item label="文件地址">
                    <el-input v-model="settings.scriptPath"></el-input>
                </el-form-item>
                <el-form-item label="权重参数">
                    <el-input v-model="settings.modelWeights"></el-input>
                </el-form-item>
                <el-form-item label="保存地址">
                    <el-input v-model="settings.directory"></el-input>
                </el-form-item>
            </el-form>

            <template #footer>
                <span slot="footer" class="dialog-footer">
                    <el-button @click="showSettingDialog = false">取消</el-button>
                    <el-button type="primary" @click="saveSettings">确认修改</el-button>
                </span>
            </template>
        </el-dialog>
    </el-card>
        </el-main>
        <el-footer></el-footer>
      </el-container>
    </el-container>
</template>


<style lang="scss" scoped>
.demo-image__error .image-slot {
    font-size: 30px;
}

.demo-image__error .image-slot .el-icon {
    font-size: 30px;
}

.demo-image__error .el-image {
    width: 100%;
    height: 200px;
}
.header {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

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