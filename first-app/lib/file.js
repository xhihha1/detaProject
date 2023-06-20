// 創建目錄
async function createDirectoryIfNotExists(directoryPath) {
  try {
    await fs.promises.access(directoryPath, fs.constants.R_OK | fs.constants.W_OK);
    console.log('目录已存在');
    return true;
  } catch (error) {
    if (error.code === 'ENOENT') {
      try {
        await fs.promises.mkdir(directoryPath, {
          recursive: true
        });
        console.log('目录已创建');
        return true;
      } catch (error) {
        console.error('创建目录时发生错误:', error);
        return false;
      }
    } else {
      console.error('访问目录时发生错误:', error);
      return false;
    }
  }
};

//修改目錄權限
async function changeDirectoryPermissions(directoryPath) {
  const permissions = 0o777;
  try {
    await fs.promises.chmod(directoryPath, permissions);
    console.log('目录权限已成功更改');
    return true;
  } catch (error) {
    console.error('更改目录权限时发生错误:', error);
    return false;
  }
};