const db = firebase.firestore()
let tasks = []
let currentUser = {}

function getUser() {
  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      currentUser.uid = user.uid
      readTasks()
      let userLabel = document.getElementById('navbarDropdown')
      userLabel.innerHTML = user.email
    } else {
      swal
        .fire({
          icon: "success",
          title: "Redirecionando para a tela de autenticação",
        })
        .then(() => {
          setTimeout(() => {
            window.location.replace("login.html")
          }, 1000)
        })
    }
  })
}

function createDelButton(task) {
  const newButton = document.createElement("button")
  const span = document.createElement("span")
  span.setAttribute(
    "class", 
    "bi bi-trash-fill m-1 align-text-bottom",
  )
  newButton.setAttribute(
    "class", 
    "btn btn-danger btn-sm",
  )
  newButton.appendChild(span)
  newButton.appendChild(document.createTextNode("Excluir"))
  newButton.setAttribute("onclick", `deleteTask("${task.id}")`)
  return newButton
}

function createUpdateButton(task) {
  const newButton = document.createElement("button")
  const span = document.createElement("span")
  span.setAttribute(
    "class", 
    "bi bi-pencil-square m-1 align-text-bottom"
  )
  newButton.setAttribute(
    "class", 
    "btn btn-primary btn-sm m-2",
  )
  newButton.appendChild(span)
  newButton.appendChild(document.createTextNode("Editar"))
  newButton.setAttribute("onclick", `updateTask("${task.id}")`)
  return newButton
}

function renderTasks() {
  let itemList = document.getElementById("itemList")
  itemList.innerHTML = ""
  for (let task of tasks) {
    const newItem = document.createElement("li")
    const buttomsDiv = document.createElement("div")
    const checkItem = document.createElement("input")
    newItem.setAttribute(
      "class",
      "list-group-item d-flex justify-content-between align-items-center"
    )
    checkItem.setAttribute(
      "class",
      "form-check-input",
    )
    checkItem.setAttribute(
      "type",
      "checkbox",
    )
    newItem.appendChild(document.createTextNode(task.title))
    buttomsDiv.appendChild(createDelButton(task))
    buttomsDiv.appendChild(createUpdateButton(task))
    newItem.appendChild(buttomsDiv)
    newItem.appendChild(checkItem)
    itemList.appendChild(newItem)
  }
}

async function readTasks() {
  tasks = []
  const logTasks = await db
  .collection("tasks")
  .where("owner", "==", currentUser.uid)
  .get()
  for (doc of logTasks.docs) {
    tasks.push({
      id: doc.id,
      title: doc.data().title,
    })
  }
  renderTasks()
}

async function addTask() {
  const itemList = document.getElementById("itemList")
  const newItem = document.createElement("li")
  newItem.setAttribute("class", "list-group-item")
  newItem.appendChild(document.createTextNode("Adicionando na nuvem..."))
  itemList.appendChild(newItem)

  const title = document.getElementById("newItem").value
  await db.collection("tasks").add({
    title: title,
    owner: currentUser.uid,
  })
  readTasks()
}

async function deleteTask(id) {
  await db.collection("tasks").doc(id).delete()
  readTasks()
}

async function updateTask(id) {
  const titleAPI = '//api.inputtxt?format=json'
  const inputValue = fetch(titleAPI)

  const { value: title } = await Swal.fire({
    title: 'Digite a tarefa',
    input: 'text',
    inputValue: inputValue,
    showCancelButton: true,
    inputValidator: (value) => {
      if (!value) {
        return 'Você precisa escrever algo!'
      }
    }
  })

  if (title) {
    Swal.fire(`Sua tarefa foi atualizada para: \n ${title}`)
  }
  await db.collection("tasks").doc(id).update({
    title: title,
  })
  readTasks()
}

function carregar(){
  var msg = document.getElementById('msg')
  var msg2 = document.getElementById('msg2')
  var img = document.getElementById('imagem_manha')
  var title = document.getElementById('title')
  var head = document.getElementById('head')
  var data = new Date()
  var hora = data.getHours()
  msg.innerHTML = ''
    if (hora >= 6 && hora < 12){
      msg.setAttribute("class", "bi bi-brightness-alt-high-fill")
      msg.textContent += "Bom dia!"
      img.src = "images/manha.png"
      if(hora > 9)
        img.src = "images/manha2.png"
      msg.style.color = '#f79966'
      msg2.style.color = '#f79966'
      title.style.color = '#f79966'
      head.style.color = '#f79966'
    }else if(hora >= 12 && hora < 18){
      msg.setAttribute("class", "bi bi-brightness-high-fill")
      msg.textContent += "Boa Tarde!"
      img.src = "images/tarde2.png"
      if(hora > 16)
        img.src = "images/tarde.png"
      msg.style.color = '#f8821bc4'
      msg2.style.color = '#f8821bc4'
      title.style.color = '#f8821bc4'
      head.style.color = '#f8821bc4'
    }else{
      msg.setAttribute("class", "bi bi-moon")
      msg.textContent += "Boa Noite!"
      img.src = "images/noite.png"
      if(hora <= 5)
        img.src = "images/noite2.png"
      title.style.color = '#013c49d5'
      msg.style.color = '#013c49d5'
      msg2.style.color = '#013c49d5'
      head.style.color = '#013c49d5'
    }
    msg2.innerHTML += ` Hoje é dia ${data.toLocaleDateString()}, e agora são ${hora}h${data.getMinutes()}min. `
}

window.onload = function () {
  getUser()
  carregar()
}
