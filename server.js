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