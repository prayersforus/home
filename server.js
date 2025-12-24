const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

// 폼 데이터 해석 설정
app.use(express.urlencoded({ extended: true }));

// [추가] 정적 파일(이미지, CSS 등)을 현재 폴더(__dirname)에서 찾도록 설정
// 이 코드가 있어야 <link> 태그와 <img> 태그가 작동합니다.
app.use(express.static(__dirname)); 

// 기본 화면
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 데이터 저장 로직 (이전과 동일)
app.post('/save', (req, res) => {
    const content = req.body.secretContent;
    const data = `시간: ${new Date().toLocaleString()}\n내용: ${content}\n---\n`;
    
    fs.appendFile('secret.txt', data, (err) => {
        if (err) throw err;
        res.redirect('/response.html');
    });
});

app.get('/response.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'response.html'));
});

// process.env.PORT가 있으면 그 값을 쓰고, 없으면(로컬 환경) 3000을 씁니다.
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
});