document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM loaded, ready to initialize");

  let timeLeft = 0;
  let username = "";
  let currentDoituong = "";
  let timerInterval = null;
  let isAdmin = false;
  let editingQuestionIndex = null;
  let answers = [];
  let testHistory = JSON.parse(localStorage.getItem("testHistory")) || [];
  let selectedQuestions = [];
  let isSubmitted = false;
  let capbac = "";
  let chucvu = "";
  let donvi = "";
  let isPracticeMode = false;
  const EXAM_TIME = 0.2 * 60;

  if (typeof questions === "undefined") {
    console.error("Error: 'questions' is not defined. Check questions.js");
    alert(
      "Lỗi: Không tải được dữ liệu câu hỏi. Vui lòng kiểm tra file questions.js!"
    );
    return;
  }

  document.addEventListener("keydown", function (event) {
    if (event.key === "F5" || (event.ctrlKey && event.key === "r")) {
      event.preventDefault();
      alert("Làm mới trang bị vô hiệu hóa trong quá trình thi.");
    }
  });

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
    localStorage.removeItem("startTime");

    isAdmin = username.toLowerCase() === "admin";
    document.getElementById("login-screen").style.display = "none";
    console.log("Ẩn login-screen");

    document.querySelector(".container").style.display = "block";
    currentDoituong = doituong;

    if (isAdmin) {
      document.getElementById("test-mode-selection").style.display = "none";
      document.getElementById("quiz-container").style.display = "none";
      document.getElementById("fixed-timer").style.display = "none";
      document.getElementById("question-nav").style.display = "none";
      document.getElementById("submitBtn").style.display = "none";
      document.getElementById("result").style.display = "none";
      document.getElementById("settingsBtn").style.display = "inline-block";
      document.getElementById("historyBtn").style.display = "inline-block";
      document.getElementById("backBtn").style.display = "inline-block";
      document.querySelector(".container h1").style.display = "none";
    } else {
      document.getElementById("test-mode-selection").style.display = "block";
      document.getElementById("quiz-container").style.display = "none";
      document.getElementById("fixed-timer").style.display = "none";
      document.getElementById("question-nav").style.display = "none";
      document.getElementById("submitBtn").style.display = "none";
      document.getElementById("result").style.display = "none";
      document.getElementById("settingsBtn").style.display = "none";
      document.querySelector(".container h1").style.display = "block";
    }
  }

  function startRealTest() {
    console.log("startRealTest called");

    if (
      !questions[currentDoituong] ||
      questions[currentDoituong].length === 0
    ) {
      console.error("No questions for doituong:", currentDoituong);
      alert(
        "Chưa có câu hỏi cho đối tượng này! Vui lòng chọn đối tượng khác hoặc liên hệ admin."
      );
      document.getElementById("login-screen").style.display = "block";
      document.querySelector(".container").style.display = "none";
      return;
    }

    resetTestState();
    isPracticeMode = false;
    isSubmitted = false;
    document.getElementById("test-mode-selection").style.display = "none";
    document.getElementById("quiz-container").style.display = "block";
    document.getElementById("fixed-timer").style.display = "flex";
    document.getElementById("question-nav").style.display = "grid";
    document.getElementById("submitBtn").style.display = "inline-block";
    document.getElementById("result").style.display = "block";
    displayTestTakerInfo();
    taoBoDeNgauNhien();
    console.log("Selected questions length:", selectedQuestions.length);
    if (selectedQuestions.length === 0) {
      console.error("No questions selected!");
      alert("Lỗi: Không tải được câu hỏi. Vui lòng thử lại!");
      return;
    }
    hienThiCauHoi();
    timeLeft = EXAM_TIME;
    const startTime = Date.now();
    localStorage.setItem("startTime", startTime);
    demNguoc();

    document.getElementById("backBtn").disabled = true;
    document.getElementById("historyBtn").disabled = true;
  }

  function startPracticeTest() {
    console.log("startPracticeTest called");

    if (
      !questions[currentDoituong] ||
      questions[currentDoituong].length === 0
    ) {
      console.error("No questions for doituong:", currentDoituong);
      alert(
        "Chưa có câu hỏi cho đối tượng này! Vui lòng chọn đối tượng khác hoặc liên hệ admin."
      );
      document.getElementById("login-screen").style.display = "block";
      document.querySelector(".container").style.display = "none";
      return;
    }

    resetTestState();
    isPracticeMode = true;
    isSubmitted = false;
    document.getElementById("test-mode-selection").style.display = "none";
    document.getElementById("quiz-container").style.display = "block";
    document.getElementById("fixed-timer").style.display = "flex";
    document.getElementById("question-nav").style.display = "grid";
    document.getElementById("submitBtn").style.display = "inline-block";
    document.getElementById("result").style.display = "block";
    document.getElementById("historyBtn").style.display = "none";
    timeLeft = EXAM_TIME;
    const startTime = Date.now();
    localStorage.setItem("startTime", startTime);
    demNguoc();
    displayTestTakerInfo();
    taoBoDeNgauNhien();
    console.log("Selected questions length:", selectedQuestions.length);
    if (selectedQuestions.length === 0) {
      console.error("No questions selected!");
      alert("Lỗi: Không tải được câu hỏi. Vui lòng thử lại!");
      return;
    }
    hienThiCauHoi();

    document.getElementById("backBtn").disabled = true;
  }

  function resetTestState() {
    console.log("Resetting test state");
    isSubmitted = false;
    timeLeft = 0;
    answers = [];
    selectedQuestions = [];
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
    localStorage.removeItem("timeLeft");
    localStorage.removeItem("startTime");
    document.getElementById("result").innerHTML = "";
  }

  function displayTestTakerInfo() {
    document.getElementById("test-taker-info").style.display = "block";
    document.getElementById("info-username").textContent = username;
    document.getElementById("info-doituong").textContent = currentDoituong;
    document.getElementById("info-donvi").textContent = donvi;
    document.getElementById("info-capbac").textContent = capbac;
    document.getElementById("info-chucvu").textContent = chucvu;
  }

  function showReviewScreen() {
    console.log("showReviewScreen called");

    if (
      !questions[currentDoituong] ||
      questions[currentDoituong].length === 0
    ) {
      console.error("No questions for doituong:", currentDoituong);
      alert(
        "Chưa có câu hỏi cho đối tượng này! Vui lòng chọn đối tượng khác hoặc liên hệ admin."
      );
      return;
    }

    document.querySelector(".container").style.display = "none";
    document.getElementById("review-screen").style.display = "block";
    const reviewContainer = document.getElementById("review-questions");
    reviewContainer.innerHTML = "";
    questions[currentDoituong].forEach((q, index) => {
      let html = `<div class="question-block"><div class="question">${
        index + 1
      }. ${q.cauHoi}</div>`;
      html += `<div class="choices-container">`;
      q.luaChon.forEach((lc, i) => {
        const isCorrect = i === q.dapAn;
        html += `
          <div class="choice ${isCorrect ? "correct" : ""}">
            <span>${lc}</span>
          </div>`;
      });
      html += `</div></div>`;
      reviewContainer.innerHTML += html;
    });
  }

  function demNguoc() {
    const fixedTimeEl = document.getElementById("fixed-time");
    const startTime = parseInt(localStorage.getItem("startTime")) || Date.now();
    timerInterval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      timeLeft = Math.max(0, EXAM_TIME - elapsed);

      const minutes = Math.floor(timeLeft / 60);
      const seconds = timeLeft % 60;
      const timeText = `${minutes}:${seconds < 10 ? "0" + seconds : seconds}`;
      fixedTimeEl.textContent = timeText;

      console.log("Thời gian còn lại:", timeLeft);
      if (timeLeft === 60) {
        alert("Còn 1 phút nữa! Hãy nhanh chóng hoàn thành bài thi.");
      }

      if (timeLeft <= 0 && !isSubmitted) {
        clearInterval(timerInterval);
        timerInterval = null;
        isSubmitted = true; // Đánh dấu đã nộp để tránh gọi lại
        nopBai(true); // Truyền tham số để bỏ qua xác nhận
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
    console.log("taoBoDeNgauNhien called");
    selectedQuestions = [];
    answers = [];

    if (
      !questions[currentDoituong] ||
      questions[currentDoituong].length === 0
    ) {
      console.error("No questions available for:", currentDoituong);
      return;
    }

    let tempQuestions = [...questions[currentDoituong]];
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
    console.log("Selected questions length:", selectedQuestions.length);
  }

  function hienThiCauHoi() {
    console.log("hienThiCauHoi called");
    const quizContainer = document.getElementById("quiz-container");
    quizContainer.innerHTML = "";

    if (!selectedQuestions || selectedQuestions.length === 0) {
      console.error("No questions to display!");
      quizContainer.innerHTML = "<p>Không có câu hỏi để hiển thị!</p>";
      return;
    }

    selectedQuestions.forEach((cauHoi, index) => {
      let html = `<div class="question-block" id="question-${index}"><div class="question">${
        index + 1
      }. ${cauHoi.cauHoi}</div>`;
      html += `<div class="choices-container">`;
      cauHoi.luaChon.forEach((lc, i) => {
        const isDisabled = isSubmitted ? "disabled" : "";
        const isChecked = answers[index] === i ? "checked" : "";
        let choiceClass = "";
        if (isSubmitted || (isPracticeMode && answers[index] !== undefined)) {
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
      if (isSubmitted || isPracticeMode) {
        const userAnswer = answers[index];
        const correctAnswer = q.dapAn;
        const statusSpan = navBtn.querySelector(".status");
        if (userAnswer === correctAnswer) {
          navBtn.classList.add("answered");
          statusSpan.textContent = "Đúng";
        } else if (userAnswer !== undefined) {
          navBtn.classList.add("incorrect");
          statusSpan.textContent = "Sai";
        } else {
          statusSpan.textContent = "Chưa trả lời";
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
    console.log("chonDapAn called:", questionIndex, choice);
    if (!isSubmitted && timeLeft > 0) {
      // Chỉ cho phép chọn nếu chưa nộp và còn thời gian
      answers[questionIndex] = choice;
      const navBtn = document.querySelector(
        `#question-nav .nav-btn:nth-child(${questionIndex + 1})`
      );
      if (navBtn) {
        navBtn.classList.add("answered");
      }
      if (isPracticeMode) {
        hienThiCauHoi();
      }
    }
  }

  function nopBai(bypassConfirm = false) {
    console.log("nopBai called");
    if (
      !isPracticeMode &&
      !bypassConfirm &&
      !confirm("Bạn có chắc chắn muốn nộp bài không?")
    ) {
      return;
    }

    isSubmitted = true;
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }

    const result = document.getElementById("result");
    if (!result) {
      console.error("Result element not found!");
      return;
    }

    if (!selectedQuestions || selectedQuestions.length === 0) {
      console.error("No questions to grade! selectedQuestions is empty.");
      result.innerHTML = "<p>Lỗi: Không có câu hỏi để chấm điểm!</p>";
      return;
    }

    if (!answers) {
      console.error("Answers array is undefined!");
      answers = [];
    }

    let correct = 0;
    const tongCau = selectedQuestions.length;

    selectedQuestions.forEach((q, i) => {
      const userAnswer = answers[i];
      const questionBlock = document.querySelector(
        `.question-block:nth-child(${i + 1})`
      );
      if (!questionBlock) {
        console.error(`Question block ${i + 1} not found!`);
        return;
      }

      const choices = questionBlock.querySelectorAll(".choice");
      if (!choices || choices.length === 0) {
        console.error(`Choices for question ${i + 1} not found!`);
        return;
      }

      choices.forEach((c) => {
        const radio = c.querySelector('input[type="radio"]');
        const choiceIndex = parseInt(c.getAttribute("data-choice-index"));
        if (!radio) {
          console.error(`Radio input for choice ${choiceIndex} not found!`);
          return;
        }

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

    if (isPracticeMode) {
      document.getElementById("submitBtn").style.display = "none";
      document.getElementById("backBtn").style.display = "inline-block"; // Đảm bảo nút Quay lại hiển thị
      document.getElementById("backBtn").disabled = false;
      document.getElementById("historyBtn").disabled = false;
      document.getElementById("historyBtn").style.display = "inline-block";
      result.innerHTML = `
        <h2>🎉 KẾT QUẢ THI THỬ</h2>
        <p>Bạn đã làm đúng <strong>${correct}/${tongCau}</strong> câu.</p>
        <p>Điểm của bạn: <strong>${diemLamTron}/10</strong></p>
      `;
    } else {
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
    }

    document.getElementById("submitBtn").style.display = "none";
    document.getElementById("backBtn").style.display = "inline-block"; // Đảm bảo nút Quay lại hiển thị
    document.getElementById("backBtn").disabled = false;
    document.getElementById("settingsBtn").style.display = isAdmin
      ? "inline-block"
      : "none";
    document.getElementById("historyBtn").disabled = false;
    hienThiCauHoi();
  }
  function showHistory() {
    console.log("showHistory called");
    document.querySelector(".container").style.display = "none";
    const historyScreen = document.getElementById("history-screen");
    historyScreen.style.display = "block";
    clearInterval(timerInterval);
    timerInterval = null;

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
    console.log("clearHistory called");
    if (confirm("Bạn có chắc chắn muốn xóa toàn bộ lịch sử thi không?")) {
      testHistory = [];
      localStorage.setItem("testHistory", JSON.stringify(testHistory));
      showHistory();
    }
  }

  function printTestHistory() {
    console.log("printTestHistory called");
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
    console.log("viewTestDetails called:", index);
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
    console.log("backToHistory called");
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
    console.log("exportToPDF called:", index);
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
    console.log("quayVeTrangChu called");
    localStorage.removeItem("timeLeft");
    localStorage.removeItem("startTime");
    location.reload();
  }

  function showSettings() {
    console.log("showSettings called");
    document.querySelector(".container").style.display = "none";
    document.getElementById("settings-screen").style.display = "block";
    clearInterval(timerInterval);
    timerInterval = null;
    if (!isSubmitted && !isAdmin && !isPracticeMode) {
      localStorage.setItem("timeLeft", timeLeft);
    }
    displayQuestionList();
  }

  function backToQuiz() {
    console.log("backToQuiz called");

    // Thêm xác nhận nếu đang trong chế độ thi thử và chưa nộp bài
    if (isPracticeMode && !isSubmitted) {
      if (
        !confirm("Bạn có chắc chắn muốn quay lại? Tiến độ bài thi sẽ bị mất!")
      ) {
        return;
      }
    }

    document.getElementById("settings-screen").style.display = "none";
    document.getElementById("history-screen").style.display = "none";
    document.getElementById("review-screen").style.display = "none";
    document.querySelector(".container").style.display = "block";
    resetTestState();

    if (!isAdmin) {
      document.getElementById("test-mode-selection").style.display = "block";
      document.getElementById("quiz-container").style.display = "none";
      document.getElementById("fixed-timer").style.display = "none";
      document.getElementById("question-nav").style.display = "none";
      document.getElementById("submitBtn").style.display = "none";
      document.getElementById("result").style.display = "none";
      document.getElementById("test-taker-info").style.display = "none";
      document.getElementById("historyBtn").style.display = "inline-block";
      document.getElementById("backBtn").style.display = "inline-block"; // Đảm bảo nút Quay lại hiển thị
      document.getElementById("backBtn").disabled = false; // Kích hoạt nút Quay lại
      document.querySelector(".container h1").style.display = "block";
    } else {
      document.getElementById("test-mode-selection").style.display = "none";
      document.getElementById("test-taker-info").style.display = "none";
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
    console.log("displayQuestionList called");
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
    console.log("showAddQuestionForm called");
    document.getElementById("addQuestionForm").style.display = "block";
    document.getElementById("questionText").value = "";
    document.getElementById("questionDoituong").value = "Siquan-QNCN";
    document.getElementById("correctAnswer").value = "0";
    const options = document.querySelectorAll("#options input.option");
    options.forEach((opt) => (opt.value = ""));
    editingQuestionIndex = null;
  }

  function editQuestion(doituong, index) {
    console.log("editQuestion called:", doituong, index);
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
    console.log("deleteQuestion called:", doituong, index);
    if (confirm("Bạn có chắc chắn muốn xóa câu hỏi này?")) {
      questions[doituong].splice(index, 1);
      if (checkLocalStorageCapacity(questions)) {
        localStorage.setItem("quizQuestions", JSON.stringify(questions));
      }
      displayQuestionList();
    }
  }

  function saveQuestion() {
    console.log("saveQuestion called");
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
    console.log("cancelEdit called");
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
  window.startRealTest = startRealTest;
  window.startPracticeTest = startPracticeTest;
  window.showReviewScreen = showReviewScreen;
});
