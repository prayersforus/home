const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

// 1. MongoDB 연결
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

// 3. 저장 로직
app.post('/save', async (req, res) => {
    try {
        const newPrayer = new Prayer({
            content: req.body.secretContent
        });
        await newPrayer.save();
        res.redirect('/response.html');
    } catch (err) {
        res.status(500).send("저장 실패");
    }
});

// 4. 관리자 페이지 (비밀번호를 "rleh"로 통일했습니다)
app.get('/admin', async (req, res) => {
    const password = req.query.pw;
    
    // 로그에서 확인용
    console.log("입력된 비밀번호:", password);

    if (password !== "rleh") { 
        return res.status(403).send(`<h1>접근 권한이 없습니다.</h1><p>입력된 비밀번호: ${password}</p>`);
    }

    try {
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));