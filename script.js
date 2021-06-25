let allfilters = document.querySelectorAll(".filter div");
let grid = document.querySelector(".grid");
let add = document.querySelector(".outlined-add");
let body = document.querySelector("body");
let modalVisible = false;
let uid = new ShortUniqueId();
let deleteState = false;

let colors = {
  pink: "#d595aa",
  blue: "#5ecdde",
  green: "#91e6c7",
  black: "black",
};

let colorClasses = ["pink", "blue", "green", "black"];

if (!localStorage.getItem("tasks")) {
  localStorage.setItem("tasks", JSON.stringify([]));
}

for (let i = 0; i < allfilters.length; i++) {
  allfilters[i].addEventListener("click", function (e) {
    if (e.currentTarget.parentElement.classList.contains("selected-filter")) {
      e.currentTarget.parentElement.classList.remove("selected-filter");
      let color = e.currentTarget.classList[0].split("-")[0];
      load();
    } else {
      let color = e.currentTarget.classList[0].split("-")[0];
      e.currentTarget.parentElement.classList.add("selected-filter");
      load(color);
    }
  });
}

add.addEventListener("click", function () {
  grid.classList.add("grid-blur");
  if (modalVisible) {
    return;
  }

  if (deleteState) {
    let del = document.querySelector(".outlined-delete");
    del.innerText = "delete";
    del.classList.remove("delete-state");
    deleteState = false;
  }

  let modal = document.createElement("div");
  modal.classList.add("modal-container");
  modal.innerHTML = `<div class="writing-area-container" >
        <div class="writing-area" contenteditable spellcheck="false">Enter your task here...</div>
        <div class="restart-container">
            <div class="material-icons restart-bttn">restart_alt</div>
        </div>
        
        
    </div>
    <div class="filter-area">
        <div class="cancel-container">
            <div class="material-icons cancel-bttn">cancel</div>
        </div>
        <div class="filter-area-container">
            <div class="filter-area-bttn">
                <div class="filter-btn pink"></div>
            </div>
            <div class="filter-area-bttn">
                <div class="filter-btn blue"></div>
            </div>
            <div class="filter-area-bttn">
                <div class="filter-btn green"></div>
            </div>
            <div class="filter-area-bttn">
                <div class="filter-btn black active-modal-filter"></div>
            </div>
        
        </div>
    </div>`;

  body.appendChild(modal);
  modalVisible = true;

  modal.setAttribute("click-first", true);
  let writingArea = document.querySelector(".writing-area");
  writingArea.addEventListener("click", function (e) {
    if (modal.getAttribute("click-first") == "true") {
      writingArea.innerText = "";
      modal.setAttribute("click-first", false);
    }
  });

  let reset = document.querySelector(".restart-bttn");
  reset.addEventListener("click", function () {
    if (modal.getAttribute("click-first") == "false") {
      writingArea.innerText = "";
    }
  });

  let cancelBttn = document.querySelector(".cancel-bttn");
  cancelBttn.addEventListener("click", () => {
    modal.remove();
    grid.classList.remove("grid-blur");
    modalVisible = false;
  });

  let modalAllFilter = document.querySelectorAll(".filter-area-bttn div");
  for (let i = 0; i < modalAllFilter.length; i++) {
    modalAllFilter[i].addEventListener("click", (e) => {
      for (let j = 0; j < modalAllFilter.length; j++) {
        modalAllFilter[j].classList.remove("active-modal-filter");
      }
      e.currentTarget.classList.add("active-modal-filter");
    });
  }

  writingArea.addEventListener("keydown", (e) => {
    let context = writingArea.innerText;
    context = context.split("\n").join("<br>");
    if (context != null) {
      if (e.getModifierState("Shift") && e.key == "Enter") {
        grid.classList.remove("grid-blur");
        let context = writingArea.innerText;
        context = context.split("\n").join("<br>");
        let selectModalFilter = document.querySelector(".active-modal-filter");
        let color = selectModalFilter.classList[1];
        let locktype = "lock_open";
        let ticket = document.createElement("div");
        let id = uid();
        ticket.classList.add("task-container");
        ticket.innerHTML = `<div class="task-color ${color}"></div>
              <div class = "task-lock">
              <div class="task-id">#${id}</div>
              <div  class="material-icons edit">edit_note</div>
              <div class="material-icons lock" locktype="false">lock_open</div>
              </div>
              <div class="ticket-box" contenteditable="false" state="false"  spellcheck="false">${context}</div>`;

        saveTicketInLocalStorage(id, color, context, locktype);

        let ticketWritingArea = ticket.querySelector(".ticket-box");
        ticketWritingArea.addEventListener("input", (e) => {
          let Id = e.currentTarget.parentElement
            .querySelector(".task-id")
            .innerText.split("#")[1];
          let taskArr = JSON.parse(localStorage.getItem("tasks"));
          let reqIndex = -1;
          for (let i = 0; i < taskArr.length; i++) {
            if (taskArr[i].id == Id) {
              reqIndex = i;
              break;
            }
          }
          taskArr[reqIndex].context = e.currentTarget.innerText;
          localStorage.setItem("tasks", JSON.stringify(taskArr));
        });

        ticket.addEventListener("click", (e) => {
          let lock = ticket.querySelector(".lock");
          let lockstate = lock.getAttribute("locktype");

          if (deleteState && lockstate == "false") {
            let Id = e.currentTarget
              .querySelector(".task-id")
              .innerText.split("#")[1];
            let taskArr = JSON.parse(localStorage.getItem("tasks"));
            let taskarr = taskArr.filter(function (el) {
              return el.id != Id;
            });

            e.currentTarget.remove();
            localStorage.setItem("tasks", JSON.stringify(taskarr));
          }
        });

        let ticketColorDiv = ticket.querySelector(".task-color");
        ticketColorDiv.addEventListener("click", (e) => {
          let lock = ticket.querySelector(".lock");
          let lockstate = lock.getAttribute("locktype");

          if (lockstate == "false") {
            let Id = e.currentTarget.parentElement
              .querySelector(".task-id")
              .innerText.split("#")[1];
            let taskArr = JSON.parse(localStorage.getItem("tasks"));
            let reqIndex = -1;
            for (let i = 0; i < taskArr.length; i++) {
              if (taskArr[i].id == Id) {
                reqIndex = i;
                break;
              }
            }

            let currColor = e.currentTarget.classList[1];
            let index = colorClasses.indexOf(currColor);
            index++;
            index = index % 4;
            ticketColorDiv.classList.remove(currColor);
            ticketColorDiv.classList.add(colorClasses[index]);

            taskArr[reqIndex].color = colorClasses[index];
            localStorage.setItem("tasks", JSON.stringify(taskArr));
          } else {
            return;
          }
        });

        grid.appendChild(ticket);
        modal.remove();
        modalVisible = false;

        let edits = ticket.querySelector(".edit");
        edits.addEventListener("click", function (e) {
          let lock = ticket.querySelector(".lock");
          let lockstate = lock.getAttribute("locktype");

          if (lockstate == "false") {
            let ticketBox = ticket.querySelector(".ticket-box");
            let state = ticketBox.getAttribute("state");

            if (state == "false") {
              ticketBox.contentEditable = true;
              ticketBox.setAttribute("state", "true");
            } else {
              ticketBox.contentEditable = false;
              ticketBox.setAttribute("state", "false");
            }
          }
        });

        let locks = ticket.querySelector(".lock");

        locks.addEventListener("click", function (e) {
          let state = locks.getAttribute("locktype");
          let ticketBox = ticket.querySelector(".ticket-box");

          let Id = e.currentTarget.parentElement
            .querySelector(".task-id")
            .innerText.split("#")[1];
          let taskArr = JSON.parse(localStorage.getItem("tasks"));
          let reqIndex = -1;
          for (let i = 0; i < taskArr.length; i++) {
            if (taskArr[i].id == Id) {
              reqIndex = i;
              break;
            }
          }

          if (state == "false") {
            e.currentTarget.innerText = "lock";
            locks.setAttribute("locktype", "true");
            ticketBox.contentEditable = false;
            ticketBox.setAttribute("state", "false");
            taskArr[reqIndex].locktype = e.currentTarget.innerText;
            localStorage.setItem("tasks", JSON.stringify(taskArr));
          } else {
            e.currentTarget.innerText = "lock_open";
            locks.setAttribute("locktype", "false");
            taskArr[reqIndex].locktype = e.currentTarget.innerText;
            localStorage.setItem("tasks", JSON.stringify(taskArr));
          }
        });
      }
    }
  });
});

let del = document.querySelector(".outlined-delete");
del.addEventListener("click", () => {
  if (deleteState) {
    deleteState = false;
    del.classList.remove("delete-state");
    del.innerText = "delete";
  } else {
    deleteState = true;
    del.classList.add("delete-state");
    del.innerText = "delete_forever";
  }
});

function saveTicketInLocalStorage(id, color, context, locktype) {
  let reqObject = { id, color, context, locktype };
  let taskArr = JSON.parse(localStorage.getItem("tasks"));
  if (reqObject != null) {
    taskArr.push(reqObject);
  }
  localStorage.setItem("tasks", JSON.stringify(taskArr));
}

function load(passedColor) {
  let ticketAll = document.querySelectorAll(".task-container");
  for (let i = 0; i < ticketAll.length; i++) {
    ticketAll[i].remove();
  }

  let task = JSON.parse(localStorage.getItem("tasks"));
  for (let i = 0; i < task.length; i++) {
    let id = task[i].id;
    let color = task[i].color;
    let context = task[i].context;
    let locktype = task[i].locktype;

    if (passedColor) {
      if (passedColor != color) continue;
    }

    let ticket = document.createElement("div");
    ticket.classList.add("task-container");
    ticket.innerHTML = `<div class="task-color ${color}"></div>
        <div class = "task-lock">
                    <div class="task-id">#${id}</div>
                    <div  class="material-icons edit">edit_note</div>
                    <div  class="material-icons lock" locktype="false">${locktype}</div>
                </div>
        <div class="ticket-box" contenteditable="false" state="false" spellcheck="false">${context}</div>`;

    grid.append(ticket);

    let edits = ticket.querySelector(".edit");
    edits.addEventListener("click", function (e) {
      let lock = ticket.querySelector(".lock");

      if (lock.innerText == "lock_open") {
        let ticketBox = ticket.querySelector(".ticket-box");
        let state = ticketBox.getAttribute("state");
        if (state == "false") {
          ticketBox.contentEditable = true;
          ticketBox.setAttribute("state", "true");
        } else {
          ticketBox.contentEditable = false;
          ticketBox.setAttribute("state", "false");
        }
      }
    });

    let locks = ticket.querySelector(".lock");

    locks.addEventListener("click", function (e) {
      let state = locks.getAttribute("locktype");
      let ticketBox = ticket.querySelector(".ticket-box");

      let Id = e.currentTarget.parentElement
        .querySelector(".task-id")
        .innerText.split("#")[1];
      let taskArr = JSON.parse(localStorage.getItem("tasks"));
      let reqIndex = -1;
      for (let i = 0; i < taskArr.length; i++) {
        if (taskArr[i].id == Id) {
          reqIndex = i;
          break;
        }
      }

      if (state == "false") {
        e.currentTarget.innerText = "lock";
        locks.setAttribute("locktype", "true");
        ticketBox.contentEditable = false;
        ticketBox.setAttribute("state", "false");
        taskArr[reqIndex].locktype = e.currentTarget.innerText;
        localStorage.setItem("tasks", JSON.stringify(taskArr));
      } else {
        e.currentTarget.innerText = "lock_open";
        locks.setAttribute("locktype", "false");
        taskArr[reqIndex].locktype = e.currentTarget.innerText;
        localStorage.setItem("tasks", JSON.stringify(taskArr));
      }
    });

    // change color for task color
    let ticketColorDiv = ticket.querySelector(".task-color");
    ticketColorDiv.addEventListener("click", (e) => {
      let lock = ticket.querySelector(".lock");

      if (lock.innerText == "lock_open") {
        let Id = e.currentTarget.parentElement
          .querySelector(".task-id")
          .innerText.split("#")[1];
        let taskArr = JSON.parse(localStorage.getItem("tasks"));
        let reqIndex = -1;
        for (let i = 0; i < taskArr.length; i++) {
          if (taskArr[i].id == Id) {
            reqIndex = i;
            break;
          }
        }

        let currColor = e.currentTarget.classList[1];
        let index = colorClasses.indexOf(currColor);
        index++;
        index = index % 4;
        ticketColorDiv.classList.remove(currColor);
        ticketColorDiv.classList.add(colorClasses[index]);

        taskArr[reqIndex].color = colorClasses[index];
        localStorage.setItem("tasks", JSON.stringify(taskArr));
      } else {
        return;
      }
    });

    ticket.addEventListener("click", (e) => {
      let lock = ticket.querySelector(".lock");

      if (deleteState == "false" && lock.innerText == "lock_open") {
        let Id = e.currentTarget
          .querySelector(".task-id")
          .innerText.split("#")[1];
        let taskArr = JSON.parse(localStorage.getItem("tasks"));
        let taskarr = taskArr.filter(function (el) {
          return el.id != Id;
        });

        e.currentTarget.remove();
        localStorage.setItem("tasks", JSON.stringify(taskarr));
      } else {
        return;
      }
    });
  }
}


