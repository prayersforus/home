const express = require('express');
const mongoose = require('mongoose'); // mongoose 추가
const path = require('path');
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

// 1. MongoDB 연결 (복사한 주소를 여기에 넣으세요)
const mongoURI = "mongodb+srv://prayersforus3004_db_user:rlehgkwk12Bdmd@prayersforus.07y7sx8.mongodb.net/?appName=Prayersforus";
mongoose.connect(mongoURI)
  .then(() => console.log("MongoDB 연결 성공!"))
  .catch(err => console.log("연결 실패: ", err));

// 2. 데이터 형식(Schema) 정의
const PrayerSchema = new mongoose.Schema({
    content: String,
    date: { type: Date, default: Date.now }
});
const Prayer = mongoose.model('Prayer', PrayerSchema);

// 저장 로직 수정
app.post('/save', async (req, res) => {
    try {
        const newPrayer = new Prayer({
            content: req.body.secretContent
        });
        await newPrayer.save(); // DB에 저장
        res.redirect('/response.html');
    } catch (err) {
        res.status(500).send("저장 실패");
    }
});

// 관리자 페이지 수정 (DB에서 가져오기)
app.get('/admin', async (req, res) => {
    if (req.query.pw !== "1234") return res.status(403).send("권한 없음");
    
    const prayers = await Prayer.find().sort({ date: -1 }); // 최신순 정렬
    let listHtml = prayers.map(p => `<li>${p.date.toLocaleString()}: ${p.content}</li>`).join('');
    
    res.send(`<h1>비밀 목록</h1><ul>${listHtml}</ul><a href="/">홈으로</a>`);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// 관리자 페이지: https://내주소.onrender.com/admin?pw=1234 로 접속
app.get('/admin', async (req, res) => {
    const password = req.query.pw;
    if (password !== "rleh") { // 본인만의 비밀번호로 변경하세요
        return res.status(403).send("접근 권한이 없습니다.");
    }

    try {
        // DB에서 모든 데이터를 가져와서 최신순으로 정렬
        const prayers = await Prayer.find().sort({ date: -1 });
        
        let listHtml = prayers.map(p => `
            <div style="border-bottom: 1px solid #ccc; padding: 10px;">
                <small style="color: gray;">${p.date.toLocaleString('ko-KR')}</small>
                <p style="font-size: 16px;">${p.content}</p>
            </div>
        `).join('');

        res.send(`
            <html>
            <head><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
            <body style="padding: 20px; font-family: sans-serif;">
                <h1>🙏 저장된 기도 제목 목록</h1>
                <hr>
                ${listHtml || "<p>아직 저장된 내용이 없습니다.</p>"}
                <br>
                <a href="/">홈으로 돌아가기</a>
            </body>
            </html>
        `);
    } catch (err) {
        res.status(500).send("데이터를 불러오는 중 오류가 발생했습니다.");
    }
});