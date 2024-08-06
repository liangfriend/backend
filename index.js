const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

const filePath = './Data.zip'; // 替换为实际的大文件路径


app.get('/getFileSize',(req,res)=>{
    console.log('getFileSize')
    try {
        // 获取文件信息
        const fileStats = fs.statSync(filePath);
        const fileSize = fileStats.size; // 文件大小，单位为字节
        console.log("返回文件大小："+fileSize)
        // 返回文件大小信息
        res.json({ fileSize });
    } catch (err) {
        console.error('Error fetching file size:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})

// GET请求路由，用于处理文件下载
app.get('/download', (req, res) => {
    console.log('download')
    const rangeHeader = req.headers.range;
    const fileStats = fs.statSync(filePath);
    const fileSize = fileStats.size;

    // 解析Range头部
    if (rangeHeader) {
        const parts = rangeHeader.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10) || 0;
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        console.log("下载区间："+start+'-'+end)
        // 设置HTTP头部，告诉客户端返回的是一个部分内容
        res.setHeader('Content-Type', 'application/octet-stream');
        res.setHeader('Content-Range', `bytes ${start}-${end}/${fileSize}`);
        res.setHeader('Content-Length', (end - start) + 1);
        res.setHeader('Accept-Ranges', 'bytes');
        res.status(206); // 206表示部分内容

        // 创建可读流，发送部分文件
        const stream = fs.createReadStream(filePath, { start, end });
        stream.pipe(res);
    } else {
        // 如果没有Range头部，发送整个文件
        res.setHeader('Content-disposition', 'attachment; filename=' + path.basename(filePath));
        res.setHeader('Content-type', 'application/octet-stream');
        res.status(200);

        // 创建可读流，发送整个文件
        const stream = fs.createReadStream(filePath);
        stream.pipe(res);
    }
});


// 启动服务器
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
