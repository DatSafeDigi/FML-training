function logout() {
  google.script.run.withSuccessHandler(function() {
      window.location.href = "/login.html";
  }).logoutUser();
}
