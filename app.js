document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM loaded, ready to initialize");

  let timeLeft = 0;
  let username = "";
  let currentDoituong = "";
  let timerInterval;
  let isAdmin = false;
  let editingQuestionIndex = null;
  let answers = [];
  let testHistory = JSON.parse(localStorage.getItem("testHistory")) || [];
  let selectedQuestions = [];
  let isSubmitted = false;
  let capbac = "";
  let chucvu = "";
  let donvi = "";
  const EXAM_TIME = 20 * 60; // 20 phút

  function login() {
    username = document.getElementById("username").value.trim();
    const doituong = document.getElementById("doituong").value;
    donvi = document.getElementById("donvi").value;
    capbac = document.getElementById("capbac").value;
    chucvu = document.getElementById("chucvu").value;

    console.log("username:", username);
    console.log("doituong:", doituong);
    console.log("donvi:", donvi);
    console.log("capbac:", capbac);
    console.log("chucvu:", chucvu);

    if (!username || !doituong || !donvi || !capbac || !chucvu) {
      alert("Vui lòng nhập đầy đủ thông tin trước khi vào thi!");
      return;
    }

    localStorage.removeItem("timeLeft");

    isAdmin = username.toLowerCase() === "admin";
    document.getElementById("login-screen").style.display = "none";
    console.log("Ẩn login-screen");

    document.querySelector(".container").style.display = "block";

    if (isAdmin) {
      // Admin: Chỉ hiển thị các nút
      document.getElementById("quiz-container").style.display = "none";
      document.getElementById("fixed-timer").style.display = "none";
      document.getElementById("question-nav").style.display = "none";
      document.getElementById("submitBtn").style.display = "none";
      document.getElementById("result").style.display = "none";
      document.getElementById("settingsBtn").style.display = "inline-block";
      document.getElementById("historyBtn").style.display = "inline-block";
      document.getElementById("historyBtn").disabled = false; // Admin có thể xem lịch sử ngay
      document.getElementById("backBtn").style.display = "inline-block";
      document.getElementById("backBtn").disabled = false;
      document.querySelector(".container h1").style.display = "none"; // Ẩn tiêu đề
    } else {
      // Người dùng thường: Hiển thị bài thi
      document.getElementById("quiz-container").style.display = "block";
      document.getElementById("fixed-timer").style.display = "flex";
      document.getElementById("question-nav").style.display = "grid";
      document.getElementById("submitBtn").style.display = "inline-block";
      document.getElementById("result").style.display = "block";
      document.getElementById("settingsBtn").style.display = "none";
      document.getElementById("historyBtn").style.display = "inline-block";
      document.getElementById("historyBtn").disabled = true; // Vô hiệu hóa nút lịch sử
      document.getElementById("backBtn").style.display = "inline-block";
      document.getElementById("backBtn").disabled = true; // Vô hiệu hóa nút quay lại cho đến khi nộp bài
      document.querySelector(".container h1").style.display = "block"; // Hiện tiêu đề
      console.log("Hiện container");

      currentDoituong = doituong;
      if (
        !questions[currentDoituong] ||
        questions[currentDoituong].length === 0
      ) {
        alert(
          "Chưa có câu hỏi cho đối tượng này! Vui lòng chọn đối tượng khác hoặc liên hệ admin."
        );
        document.getElementById("login-screen").style.display = "block";
        document.querySelector(".container").style.display = "none";
        return;
      }
      isSubmitted = false;
      taoBoDeNgauNhien();
      hienThiCauHoi();
      timeLeft = EXAM_TIME;
      console.log("Thời gian được đặt:", timeLeft);
      demNguoc();
    }
  }

  function demNguoc() {
    const fixedTimeEl = document.getElementById("fixed-time");
    timerInterval = setInterval(() => {
      const minutes = Math.floor(timeLeft / 60);
      const seconds = timeLeft % 60;
      const timeText = `${minutes}:${seconds < 10 ? "0" + seconds : seconds}`;
      fixedTimeEl.textContent = timeText;
      timeLeft--;

      console.log("Thời gian còn lại:", timeLeft);
      if (timeLeft === 60) {
        alert("Còn 1 phút nữa! Hãy nhanh chóng hoàn thành bài thi.");
      }

      if (timeLeft < 0) {
        clearInterval(timerInterval);
        alert("Hết giờ làm bài!");
        nopBai();
      }
    }, 1000);
  }

  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  function taoBoDeNgauNhien() {
    selectedQuestions = [];
    answers = [];

    if (
      !questions[currentDoituong] ||
      questions[currentDoituong].length === 0
    ) {
      console.log("Không có câu hỏi cho đối tượng này.");
      return;
    }

    let tempQuestions = questions[currentDoituong].slice();
    shuffleArray(tempQuestions);

    tempQuestions.slice(0, 25).forEach((q) => {
      let clonedQuestion = {
        cauHoi: q.cauHoi,
        luaChon: [],
        dapAn: 0,
      };

      let choicesWithIndex = q.luaChon.map((lc, i) => ({
        text: lc,
        index: i,
      }));

      shuffleArray(choicesWithIndex);

      choicesWithIndex.forEach((item, newIndex) => {
        clonedQuestion.luaChon.push(item.text);
        if (item.index === q.dapAn) {
          clonedQuestion.dapAn = newIndex;
        }
      });

      selectedQuestions.push(clonedQuestion);
    });
    console.log("Số câu được chọn:", selectedQuestions.length);
    console.log("Tổng số câu trong nhóm:", questions[currentDoituong].length);
  }

  function hienThiCauHoi() {
    const quizContainer = document.getElementById("quiz-container");
    quizContainer.innerHTML = "";

    selectedQuestions.forEach((cauHoi, index) => {
      let html = `<div class="question-block" id="question-${index}"><div class="question">${
        index + 1
      }. ${cauHoi.cauHoi}</div>`;
      html += `<div class="choices-container">`;
      cauHoi.luaChon.forEach((lc, i) => {
        const isDisabled = isSubmitted ? "disabled" : "";
        const isChecked = answers[index] === i ? "checked" : "";
        let choiceClass = "";
        if (isSubmitted) {
          if (i === cauHoi.dapAn) {
            choiceClass = "correct";
          } else if (i === answers[index] && answers[index] !== cauHoi.dapAn) {
            choiceClass = "incorrect";
          }
        }
        html += `
          <div class="choice ${choiceClass}" data-choice-index="${i}">
            <input type="radio" name="cauhoi_${index}" value="${i}" ${isDisabled} ${isChecked} onclick="chonDapAn(${index}, ${i})" />
            <span>${lc}</span>
          </div>`;
      });
      html += `</div></div>`;
      quizContainer.innerHTML += html;
    });

    const navContainer = document.getElementById("question-nav");
    navContainer.innerHTML = "";
    selectedQuestions.forEach((q, index) => {
      const navBtn = document.createElement("button");
      navBtn.className = "nav-btn";
      navBtn.innerHTML = `
        <span>${index + 1}</span>
        <span class="status"></span>
      `;
      if (isSubmitted) {
        const userAnswer = answers[index];
        const correctAnswer = q.dapAn;
        const statusSpan = navBtn.querySelector(".status");
        if (userAnswer === correctAnswer) {
          navBtn.classList.add("answered");
          statusSpan.textContent = "Đúng";
        } else {
          navBtn.classList.add("incorrect");
          statusSpan.textContent =
            userAnswer !== undefined ? "Sai" : "Chưa trả lời";
        }
      } else if (answers[index] !== undefined) {
        navBtn.classList.add("answered");
      }
      navBtn.onclick = () => {
        document.getElementById(`question-${index}`).scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      };
      navContainer.appendChild(navBtn);
    });
  }

  function chonDapAn(questionIndex, choice) {
    if (!isSubmitted) {
      answers[questionIndex] = choice;
      const navBtn = document.querySelector(
        `#question-nav .nav-btn:nth-child(${questionIndex + 1})`
      );
      if (navBtn) {
        navBtn.classList.add("answered");
      }
    }
  }

  function nopBai() {
    clearInterval(timerInterval);
    const quizContainer = document.getElementById("quiz-container");
    const result = document.getElementById("result");

    let correct = 0;
    const tongCau = selectedQuestions.length;

    selectedQuestions.forEach((q, i) => {
      const userAnswer = answers[i];
      const choices = document.querySelectorAll(
        `.question-block:nth-child(${i + 1}) .choice`
      );
      choices.forEach((c) => {
        const radio = c.querySelector('input[type="radio"]');
        const choiceIndex = parseInt(c.getAttribute("data-choice-index"));
        radio.disabled = true;
        c.classList.remove("correct", "incorrect");
        if (choiceIndex === q.dapAn) {
          c.classList.add("correct");
        }
        if (choiceIndex === userAnswer && userAnswer !== q.dapAn) {
          c.classList.add("incorrect");
        }
        if (choiceIndex === userAnswer) {
          radio.checked = true;
        }
      });
      if (userAnswer === q.dapAn) correct++;

      const navBtn = document.querySelector(
        `#question-nav .nav-btn:nth-child(${i + 1})`
      );
      if (navBtn) {
        const statusSpan = navBtn.querySelector(".status");
        navBtn.classList.remove("answered", "incorrect");
        if (userAnswer === q.dapAn) {
          navBtn.classList.add("answered");
          statusSpan.textContent = "Đúng";
        } else {
          navBtn.classList.add("incorrect");
          statusSpan.textContent =
            userAnswer !== undefined ? "Sai" : "Chưa trả lời";
        }
      }
    });

    const diem = (correct / tongCau) * 10;
    const diemLamTron = Number(diem.toFixed(2)).toString();

    const testResult = {
      username: username,
      doituong: currentDoituong,
      capbac: capbac,
      chucvu: chucvu,
      donvi: donvi,
      timestamp: new Date().toLocaleString(),
      correct: correct,
      total: tongCau,
      score: diemLamTron,
      answers: [...answers],
      questions: selectedQuestions,
    };
    testHistory.push(testResult);
    localStorage.setItem("testHistory", JSON.stringify(testHistory));

    result.innerHTML = `
      <h2>🎉 KẾT QUẢ CUỐI CÙNG</h2>
      <p>Bạn đã làm đúng <strong>${correct}/${tongCau}</strong> câu.</p>
      <p>Điểm của bạn: <strong>${diemLamTron}/10</strong></p>
    `;

    isSubmitted = true;
    quizContainer.innerHTML = "";
    hienThiCauHoi();

    document.getElementById("submitBtn").style.display = "none";
    document.getElementById("backBtn").disabled = false;
    document.getElementById("settingsBtn").style.display = isAdmin
      ? "inline-block"
      : "none";
    document.getElementById("historyBtn").disabled = false; // Kích hoạt nút lịch sử
  }

  function showHistory() {
    document.querySelector(".container").style.display = "none";
    const historyScreen = document.getElementById("history-screen");
    historyScreen.style.display = "block";
    clearInterval(timerInterval);

    const historyList = document.getElementById("history-list");
    historyList.innerHTML = "";

    testHistory.forEach((result, index) => {
      const historyItem = document.createElement("div");
      historyItem.className = "history-item";
      historyItem.innerHTML = `
        <p><strong>Lần thi ${index + 1}</strong></p>
        <p>Họ và tên: ${result.username}</p>
        <p>Đối tượng: ${result.doituong}</p>
        <p>Cấp bậc: ${result.capbac || "Không có dữ liệu"}</p>
        <p>Chức vụ: ${result.chucvu || "Không có dữ liệu"}</p>
        <p>Đơn vị: ${result.donvi || "Không có dữ liệu"}</p>
        <p>Thời gian: ${result.timestamp}</p>
        <p>Kết quả: ${result.correct}/${result.total} câu</p>
        <p>Điểm: ${result.score}/10</p>
        <button onclick="viewTestDetails(${index})">Xem chi tiết</button>
        <button onclick="exportToPDF(${index})">Xuất PDF</button>
      `;
      historyList.appendChild(historyItem);
    });

    const existingClearButton =
      historyScreen.querySelector(".clear-history-btn");
    if (existingClearButton) {
      existingClearButton.remove();
    }
    const existingPrintButton =
      historyScreen.querySelector(".print-history-btn");
    if (existingPrintButton) {
      existingPrintButton.remove();
    }

    const clearHistoryBtn = document.createElement("button");
    clearHistoryBtn.className = "clear-history-btn";
    clearHistoryBtn.textContent = "Xóa lịch sử thi";
    clearHistoryBtn.onclick = clearHistory;
    clearHistoryBtn.style.display = isAdmin ? "block" : "none";
    historyScreen.appendChild(clearHistoryBtn);

    const printHistoryBtn = document.createElement("button");
    printHistoryBtn.className = "print-history-btn";
    printHistoryBtn.textContent = "In danh sách thi";
    printHistoryBtn.onclick = printTestHistory;
    printHistoryBtn.style.display = isAdmin ? "block" : "none";
    historyScreen.appendChild(printHistoryBtn);
  }

  function clearHistory() {
    if (confirm("Bạn có chắc chắn muốn xóa toàn bộ lịch sử thi không?")) {
      testHistory = [];
      localStorage.setItem("testHistory", JSON.stringify(testHistory));
      showHistory();
    }
  }

  function printTestHistory() {
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
      <head>
        <title>Danh sách lịch sử thi</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 20px;
          }
          h2 {
            text-align: center;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          th, td {
            border: 1px solid #000;
            padding: 8px;
            text-align: left;
          }
          th {
            background-color: #f2f2f2;
          }
        </style>
      </head>
      <body>
        <h2>DANH SÁCH LỊCH SỬ THI</h2>
        <table>
          <thead>
            <tr>
              <th>STT</th>
              <th>Họ và tên</th>
              <th>Đối tượng</th>
              <th>Cấp bậc</th>
              <th>Chức vụ</th>
              <th>Đơn vị</th>
              <th>Thời gian</th>
              <th>Kết quả</th>
              <th>Điểm</th>
            </tr>
          </thead>
          <tbody>
    `);

    testHistory.forEach((result, index) => {
      printWindow.document.write(`
        <tr>
          <td>${index + 1}</td>
          <td>${result.username}</td>
          <td>${result.doituong}</td>
          <td>${result.capbac || "Không có dữ liệu"}</td>
          <td>${result.chucvu || "Không có dữ liệu"}</td>
          <td>${result.donvi || "Không có dữ liệu"}</td>
          <td>${result.timestamp}</td>
          <td>${result.correct}/${result.total}</td>
          <td>${result.score}/10</td>
        </tr>
      `);
    });

    printWindow.document.write(`
          </tbody>
        </table>
      </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  }

  function viewTestDetails(index) {
    const result = testHistory[index];
    const historyScreen = document.getElementById("history-screen");
    historyScreen.style.display = "block";

    let detailsHeader = historyScreen.querySelector(".details-header");
    if (!detailsHeader) {
      detailsHeader = document.createElement("div");
      detailsHeader.className = "details-header";
      historyScreen.insertBefore(detailsHeader, historyScreen.firstChild);
    }
    detailsHeader.innerHTML = `
      <h2>Chi tiết lần thi</h2>
      <p><strong>Họ và tên:</strong> ${result.username}</p>
      <p><strong>Đối tượng:</strong> ${result.doituong}</p>
      <p><strong>Cấp bậc:</strong> ${result.capbac || "Không có dữ liệu"}</p>
      <p><strong>Chức vụ:</strong> ${result.chucvu || "Không có dữ liệu"}</p>
      <p><strong>Đơn vị:</strong> ${result.donvi || "Không có dữ liệu"}</p>
      <p><strong>Thời gian:</strong> ${result.timestamp}</p>
      <p><strong>Kết quả:</strong> ${result.correct}/${result.total} câu</p>
      <p><strong>Điểm:</strong> ${result.score}/10</p>
    `;

    const detailedResults = document.getElementById("detailed-results");
    detailedResults.innerHTML = "";
    result.questions.forEach((q, i) => {
      const userAnswer = result.answers[i];
      let html = `<div class="question-block"><div class="question">${i + 1}. ${
        q.cauHoi
      }</div>`;
      html += `<div class="choices-container">`;
      q.luaChon.forEach((lc, j) => {
        let choiceClass = "";
        if (j === q.dapAn) {
          choiceClass = "correct";
        } else if (j === userAnswer && userAnswer !== q.dapAn) {
          choiceClass = "incorrect";
        }
        html += `
          <div class="choice ${choiceClass}">
            <input type="radio" disabled ${j === userAnswer ? "checked" : ""} />
            <span>${lc}</span>
          </div>`;
      });
      html += `</div></div>`;
      detailedResults.innerHTML += html;
    });

    let backButton = historyScreen.querySelector(".back-to-history-btn");
    if (backButton) {
      backButton.remove();
    }
    backButton = document.createElement("button");
    backButton.className = "back-to-history-btn";
    backButton.textContent = "Quay lại lịch sử";
    backButton.onclick = backToHistory;
    historyScreen.appendChild(backButton);

    const existingClearButton =
      historyScreen.querySelector(".clear-history-btn");
    if (existingClearButton) {
      existingClearButton.remove();
    }
    const clearHistoryBtn = document.createElement("button");
    clearHistoryBtn.className = "clear-history-btn";
    clearHistoryBtn.textContent = "Xóa lịch sử thi";
    clearHistoryBtn.onclick = clearHistory;
    clearHistoryBtn.style.display = isAdmin ? "block" : "none";
    historyScreen.appendChild(clearHistoryBtn);

    document.getElementById("history-list").style.display = "none";
  }

  function backToHistory() {
    const historyScreen = document.getElementById("history-screen");
    const historyList = document.getElementById("history-list");
    const detailsHeader = historyScreen.querySelector(".details-header");
    const detailedResults = document.getElementById("detailed-results");

    if (detailsHeader) detailsHeader.innerHTML = "<h1>LỊCH SỬ THI</h1>";
    detailedResults.innerHTML = "";
    historyList.style.display = "block";

    const backButton = historyScreen.querySelector(".back-to-history-btn");
    if (backButton) backButton.remove();
    const clearButton = historyScreen.querySelector(".clear-history-btn");
    if (clearButton) clearButton.remove();
    const printButton = historyScreen.querySelector(".print-history-btn");
    if (printButton) printButton.remove();

    const clearHistoryBtn = document.createElement("button");
    clearHistoryBtn.className = "clear-history-btn";
    clearHistoryBtn.textContent = "Xóa lịch sử thi";
    clearHistoryBtn.onclick = clearHistory;
    clearHistoryBtn.style.display = isAdmin ? "block" : "none";
    historyScreen.appendChild(clearHistoryBtn);

    const printHistoryBtn = document.createElement("button");
    printHistoryBtn.className = "print-history-btn";
    printHistoryBtn.textContent = "In danh sách thi";
    printHistoryBtn.onclick = printTestHistory;
    printHistoryBtn.style.display = isAdmin ? "block" : "none";
    historyScreen.appendChild(printHistoryBtn);

    historyList.innerHTML = "";
    testHistory.forEach((result, index) => {
      const historyItem = document.createElement("div");
      historyItem.className = "history-item";
      historyItem.innerHTML = `
        <p><strong>Lần thi ${index + 1}</strong></p>
        <p>Họ và tên: ${result.username}</p>
        <p>Đối tượng: ${result.doituong}</p>
        <p>Cấp bậc: ${result.capbac || "Không có dữ liệu"}</p>
        <p>Chức vụ: ${result.chucvu || "Không có dữ liệu"}</p>
        <p>Đơn vị: ${result.donvi || "Không có dữ liệu"}</p>
        <p>Thời gian: ${result.timestamp}</p>
        <p>Kết quả: ${result.correct}/${result.total} câu</p>
        <p>Điểm: ${result.score}/10</p>
        <button onclick="viewTestDetails(${index})">Xem chi tiết</button>
        <button onclick="exportToPDF(${index})">Xuất PDF</button>
      `;
      historyList.appendChild(historyItem);
    });
  }

  function exportToPDF(index) {
    const result = testHistory[index];
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text("KẾT QUẢ THI TRẮC NGHIỆM", 20, 20);
    doc.setFontSize(12);
    doc.text(`Họ và tên: ${result.username}`, 20, 30);
    doc.text(`Đối tượng: ${result.doituong}`, 20, 40);
    doc.text(`Cấp bậc: ${result.capbac || "Không có dữ liệu"}`, 20, 50);
    doc.text(`Chức vụ: ${result.chucvu || "Không có dữ liệu"}`, 20, 60);
    doc.text(`Đơn vị: ${result.donvi || "Không có dữ liệu"}`, 20, 70);
    doc.text(`Thời gian: ${result.timestamp}`, 20, 80);
    doc.text(`Kết quả: ${result.correct}/${result.total} câu`, 20, 90);
    doc.text(`Điểm: ${result.score}/10`, 20, 100);

    let y = 110;
    result.questions.forEach((q, i) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.setFontSize(10);
      doc.text(`${i + 1}. ${q.cauHoi}`, 20, y);
      y += 5;
      q.luaChon.forEach((lc, j) => {
        const isCorrect = j === q.dapAn;
        const isUserAnswer = j === result.answers[i];
        let prefix = isCorrect
          ? "[Đúng] "
          : isUserAnswer && !isCorrect
          ? "[Sai] "
          : "";
        doc.text(`${prefix}${lc}`, 25, y);
        y += 5;
      });
      y += 5;
    });

    doc.save(`KetQuaThi_${result.timestamp.replace(/[:,\s\/]/g, "_")}.pdf`);
  }

  function quayVeTrangChu() {
    localStorage.removeItem("timeLeft");
    location.reload();
  }

  function showSettings() {
    document.querySelector(".container").style.display = "none";
    document.getElementById("settings-screen").style.display = "block";
    clearInterval(timerInterval);
    if (!isSubmitted && !isAdmin) {
      localStorage.setItem("timeLeft", timeLeft);
    }
    displayQuestionList();
  }

  function backToQuiz() {
    document.getElementById("settings-screen").style.display = "none";
    document.getElementById("history-screen").style.display = "none";
    document.querySelector(".container").style.display = "block";
    clearInterval(timerInterval);
    if (!isSubmitted && !isAdmin) {
      let storedTime = parseInt(localStorage.getItem("timeLeft"));
      if (isNaN(storedTime) || storedTime <= 0) {
        timeLeft = EXAM_TIME;
      } else {
        timeLeft = storedTime;
      }
      console.log("Thời gian đặt lại:", timeLeft);
      demNguoc();
      hienThiCauHoi();
    } else if (isAdmin) {
      document.getElementById("quiz-container").style.display = "none";
      document.getElementById("fixed-timer").style.display = "none";
      document.getElementById("question-nav").style.display = "none";
      document.getElementById("submitBtn").style.display = "none";
      document.getElementById("result").style.display = "none";
      document.getElementById("settingsBtn").style.display = "inline-block";
      document.getElementById("historyBtn").style.display = "inline-block";
      document.getElementById("historyBtn").disabled = false;
      document.getElementById("backBtn").style.display = "inline-block";
      document.getElementById("backBtn").disabled = false;
      document.querySelector(".container h1").style.display = "none";
    }
  }

  function displayQuestionList() {
    const tbody = document.querySelector("#questionTable");
    tbody.innerHTML = "";

    let stats = "";
    for (const doituong in questions) {
      stats += `${doituong}: ${questions[doituong].length} câu hỏi<br>`;
    }
    document.getElementById("stats").innerHTML = stats || "Chưa có câu hỏi.";

    for (const doituong in questions) {
      questions[doituong].forEach((q, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${doituong}</td>
          <td>${q.cauHoi}</td>
          <td>
            <button class="edit-btn" onclick="editQuestion('${doituong}', ${index})">Sửa</button>
            <button class="delete-btn" onclick="deleteQuestion('${doituong}', ${index})">Xóa</button>
          </td>
        `;
        tbody.appendChild(row);
      });
    }
  }

  function showAddQuestionForm() {
    document.getElementById("addQuestionForm").style.display = "block";
    document.getElementById("questionText").value = "";
    document.getElementById("questionDoituong").value = "Siquan-QNCN";
    document.getElementById("correctAnswer").value = "0";
    const options = document.querySelectorAll("#options input.option");
    options.forEach((opt) => (opt.value = ""));
    editingQuestionIndex = null;
  }

  function editQuestion(doituong, index) {
    editingQuestionIndex = { doituong, index };
    const q = questions[doituong][index];
    document.getElementById("questionDoituong").value = doituong;
    document.getElementById("questionText").value = q.cauHoi;
    document.getElementById("correctAnswer").value = q.dapAn;
    const options = document.querySelectorAll("#options input.option");
    q.luaChon.forEach((opt, i) => {
      options[i].value = opt;
    });
    document.getElementById("addQuestionForm").style.display = "block";
  }

  function deleteQuestion(doituong, index) {
    if (confirm("Bạn có chắc chắn muốn xóa câu hỏi này?")) {
      questions[doituong].splice(index, 1);
      if (checkLocalStorageCapacity(questions)) {
        localStorage.setItem("quizQuestions", JSON.stringify(questions));
      }
      displayQuestionList();
    }
  }

  function saveQuestion() {
    const doituong = document.getElementById("questionDoituong").value;
    const cauHoi = document.getElementById("questionText").value.trim();
    const correctAnswer = parseInt(
      document.getElementById("correctAnswer").value
    );
    const options = Array.from(
      document.querySelectorAll("#options input.option")
    ).map((opt) => opt.value.trim());

    if (!cauHoi || options.some((opt) => !opt)) {
      alert("Vui lòng nhập đầy đủ nội dung câu hỏi và các lựa chọn!");
      return;
    }

    const newQuestion = {
      cauHoi,
      luaChon: options,
      dapAn: correctAnswer,
    };

    if (editingQuestionIndex) {
      questions[editingQuestionIndex.doituong][editingQuestionIndex.index] =
        newQuestion;
    } else {
      if (!questions[doituong]) questions[doituong] = [];
      questions[doituong].push(newQuestion);
    }

    if (checkLocalStorageCapacity(questions)) {
      localStorage.setItem("quizQuestions", JSON.stringify(questions));
    }
    document.getElementById("addQuestionForm").style.display = "none";
    displayQuestionList();
  }

  function checkLocalStorageCapacity(data) {
    try {
      const testData = JSON.stringify(data);
      const storageLimit = 5 * 1024 * 1024;
      if (testData.length > storageLimit) {
        alert("Dung lượng localStorage đã đầy, không thể lưu thêm dữ liệu!");
        return false;
      }
      return true;
    } catch (e) {
      console.error("Lỗi khi kiểm tra dung lượng localStorage:", e);
      return false;
    }
  }

  function cancelEdit() {
    document.getElementById("addQuestionForm").style.display = "none";
  }

  window.login = login;
  window.nopBai = nopBai;
  window.quayVeTrangChu = quayVeTrangChu;
  window.chonDapAn = chonDapAn;
  window.showSettings = showSettings;
  window.backToQuiz = backToQuiz;
  window.showAddQuestionForm = showAddQuestionForm;
  window.editQuestion = editQuestion;
  window.deleteQuestion = deleteQuestion;
  window.saveQuestion = saveQuestion;
  window.cancelEdit = cancelEdit;
  window.showHistory = showHistory;
  window.viewTestDetails = viewTestDetails;
  window.exportToPDF = exportToPDF;
  window.backToHistory = backToHistory;
  window.clearHistory = clearHistory;
  window.printTestHistory = printTestHistory;
});
