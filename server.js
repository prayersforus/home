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
// 저장된 비밀 목록 확인하기 (관리자용)
// 관리자 페이지 (비밀번호 확인 기능 추가)
app.get('/admin', (req, res) => {
    const password = req.query.pw; // 주소창의 ?pw=값 을 가져옴
    const myPassword = "rleh"; // 여기에 본인만 알 비밀번호를 설정하세요

    if (password !== myPassword) {
        return res.status(403).send("<h1>접근 권한이 없습니다.</h1><p>비밀번호가 틀렸거나 입력되지 않았습니다.</p>");
    }

    const filePath = path.join(__dirname, 'secret.txt');
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) return res.send("저장된 내용이 없습니다.");
        
        res.send(`
            <h1>비밀 목록 (관리자 전용)</h1>
            <pre style="background:#eee; padding:20px;">${data}</pre>
            <a href="/">홈으로</a>
        `);
    });
});