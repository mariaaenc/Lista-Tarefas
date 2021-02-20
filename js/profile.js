const db = firebase.firestore()
let currentUser = {}
let profile = false

var storageRef = firebase.storage().ref();

function getUser() {
  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        currentUser.uid = user.uid
        getUserInfo(user.uid)
      let userLabel = document.getElementById("navbarDropdown")
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

async function getUserInfo(uid) {
    const logUsers = await db.collection("profile").where("uid", "==", uid).get()
    let userInfo = document.getElementById("userInfo")
    if (logUsers.docs.length == 0){
        userInfo.innerHTML = "Perfil não registrado"
    }else{
        userInfo.innerHTML = "Perfil registrado"
        profile = true
        const userData = logUsers.docs[0]
        currentUser.id = userData.id 
        currentUser.firstName = userData.data().firstName
        currentUser.lastName = userData.data().lastName
        currentUser.avatar = userData.data().avatar
        document.getElementById("inputFirstName").value = currentUser.firstName
        document.getElementById("inputLastName").value = currentUser.lastName
        document.getElementById("img-profile").src = currentUser.avatar
    }
}

async function saveProfile(){
    const firstName = document.getElementById("inputFirstName").value
    const lastName = document.getElementById("inputLastName").value
    const avatar = document.getElementById("img-profile").src
    if (!profile) {
        await db.collection("profile").add({
            uid: currentUser.uid,
            firstName: firstName,
            lastName: lastName,
            avatar: avatar,
        })
        getUserInfo()
    }else{
        await db.collection("profile").doc(currentUser.id).update({
            firstName: firstName,
            lastName: lastName,
            avatar: avatar,
        })
    }
}

async function uploadImage(){
  const { value: image } = await Swal.fire({
    title: 'Selecione a imagem',
    input: 'file',
  })
  if (image) {
    var file = image
    var metadata = {
      contentType: 'image/jpeg'
    };
    var uploadTask = storageRef.child('images/profile/'+file.name).put(file, metadata);
    uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED, 
      function(snapshot) {
        var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log('Upload is ' + progress + '% done');
      }, function(error) {
      switch (error.code) {
        case 'storage/unauthorized':
          break;
        case 'storage/canceled':
          break;
        case 'storage/unknown':
          break;
      }
    }, function() {
      uploadTask.snapshot.ref.getDownloadURL().then(function(downloadURL) {
        console.log('File available at', downloadURL);
        document.getElementById("img-profile").src = downloadURL;
      });
    });
  }
}

function carregar(){
  var head = document.getElementById('head')
  var title = document.getElementById('title')
  var data = new Date()
  var hora = data.getHours()
  if (hora >= 6 && hora < 12){
    head.style.color = '#f79966'
    title.style.color = '#f79966'
  }else if(hora >= 12 && hora < 18){
    head.style.color = '#f8821bc4'
    title.style.color = '#f8821bc4'
  }else{
    head.style.color = '#013c49d5'
    title.style.color = '#013c49d5'

  }
}

window.onload = function () {
    getUser()
    carregar()
}


