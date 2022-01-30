let main_div;
let loading_div;

function login_fetch(email, password) {
    fetch("https://miestroapp.miestro.com/api/v1/auth/login", {"credentials":"omit","headers":{"accept":"application/json, text/plain, */*","accept-language":"en-US,en;q=0.9","content-type":"application/json;charset=UTF-8","sec-fetch-dest":"empty","sec-fetch-mode":"cors","sec-fetch-site":"cross-site"},"referrer":"http://miestroapp.miestro.com/login","referrerPolicy":"no-referrer-when-downgrade","body":"{\"email\":\"" + email + "\",\"password\":\"" + password + "\",\"remember_me\":false}","method":"POST","mode":"cors"}).then(
        function(response) {
          if (response.status !== 200) {
            window.location.href="login_failed.html";
            return;
          }
    
          response.json().then(function(login_data) {
            let token = login_data['token'];
            let timeout = login_data['user']['token_expire_time'];

            if (login_data) {
                let login = {token: login_data['token'], token_expire_time :login_data['user']['token_expire_time']};
                chrome.storage.local.set({ login });
                window.location.href="main.html";
            }
          });
        }
      )
}

function check_cache(email="", password="") {
    if (main_div) {
        main_div.style.display = "none";
        loading_div.style.display = "block";
    }
    chrome.storage.local.get('login', (response) => {
        if (Object.keys(response).length > 0) {
            let login_info = response['login'];
            let expire_time = Date.parse(login_info['token_expire_time']);
            //if (expire_time > Date.now()) {     CHANGE THIS BACK TO > WHEN THEY FIX TOKENS
            if (expire_time < Date.now()) {
                window.location.href="main.html";
            } else {
                if (email !== "" && password !== "") {
                    login_fetch(email, password);
                }
                if (main_div) {
                    main_div.style.display = "block";
                    loading_div.style.display = "none";
                }
            }
        } else {
            if (email !== "" && password !== "") {
                login_fetch(email, password);
            }
            if (main_div) {
                main_div.style.display = "block";
                loading_div.style.display = "none";
            }
        }
    });
}

check_cache();

document.addEventListener('DOMContentLoaded', function() {
    main_div = document.getElementById('login_form_wrapper');
    loading_div = document.getElementById('loader');
    //chrome.storage.local.clear(function() {console.log("cleared")});

    var login_submit = document.getElementById('login_submit');
    login_submit.addEventListener('click', function() {
        let email = document.getElementById('field_email').value;
        let password = document.getElementById('field_password').value;
        check_cache(email, password);
    });
});