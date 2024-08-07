const express = require('express');
const pl = require('physics-lab-web-api');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const user = new pl.User();

// 中间件允许跨域请求
const allowLocalhost = (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  res.setHeader('Access-Control-Allow-Credentials', true);
  if (req.method === 'OPTIONS') {
    res.status(200).end();
  } else {
    next();
  }
};

app.use(allowLocalhost);

// 设置静态文件目录
app.use(express.static(path.join(__dirname, 'src')));

// 后端 API 路由
app.get('/api/user/:id', async (req, res) => {
  const { id } = req.params;
  await user.auth.login();

  try {
    const result = await user.auth.getUser(id);
    res.json(result.Data);
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/avatar/:id/:num', async (req, res) => {
  const { id, num } = req.params;

  // 构建物理实验室头像URL
  const avatarUrl = `https://physics-lab.oss-cn-hongkong.aliyuncs.com/users/avatars/${id.slice(0, 4)}/${id.slice(4, 6)}/${id.slice(6, 8)}/${id.slice(8)}/${num}.jpg`;

  try {
    // 使用axios发起GET请求
    const response = await axios.get(avatarUrl, { responseType: 'stream' });

    // 将获取到的头像数据直接发送给客户端
    response.data.pipe(res);
  } catch (error) {
    console.error('Error fetching avatar:', error);
    res.status(500).json({ error: 'Error fetching avatar' });
  }
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});