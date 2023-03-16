function setActive() {
  const links = document.querySelectorAll(".nav-link");

  if (links.length) {
    links.forEach((link) => {
      if (link.href === window.location.href) {
        link.classList.add("active");
        link.setAttribute("aria-current", "page");
      }
    });
  }
}

window.onload = setActive;
