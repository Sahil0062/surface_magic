
// Admin authentication check
(function () {
  const token = localStorage.getItem("token");

  // check if we are on admin page
  if (window.location.pathname.startsWith("/admin")) {

    // allow login page without token
    if (window.location.pathname === "/admin/login") return;

    if (!token) {
      window.location.href = "/admin/login";
    }
  }
})();

// Header Toggle

$(".toggle_btn").click(function () {
    $(".main_section").toggleClass("main");
});

// Password Hide Show
function togglePass(id, icon) {
    const input = document.getElementById(id);
    if (input.type === "password") {
        input.type = "text";
        icon.classList.replace("bi-eye", "bi-eye-slash");
    } else {
        input.type = "password";
        icon.classList.replace("bi-eye-slash", "bi-eye");
    }
}

// Profile Upload

function readURL(input) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();
        reader.onload = function (e) {
            $('#imagePreview').css('background-image', 'url(' + e.target.result + ')');
            $('#imagePreview').hide();
            $('#imagePreview').fadeIn(650);
        }
        reader.readAsDataURL(input.files[0]);
    }
}
$("#imageUpload").change(function () {
    readURL(this);
});


// Slider And LightBox


// Initialize Swiper
const swiper = new Swiper(".mySwiper", {
    slidesPerView: 1,
    spaceBetween: 0,
    loop: true,
    speed: 500,
    navigation: {
        nextEl: ".swiper-button-next",
        prevEl: ".swiper-button-prev",
    },
    pagination: {
        el: ".swiper-pagination",
        clickable: true,
    },
});

// Initialize Fancybox
Fancybox.bind("[data-fancybox]", {
    // Options
});

async function confirmLogout(e) {

  e.preventDefault();

  if (!confirm("Are you sure you want to logout?")) return;

  const token = localStorage.getItem("token");

  await fetch("/admin/logout", {
    method: "POST",
    headers: {
      "Authorization": "Bearer " + token
    }
  });

  localStorage.removeItem("token");

  window.location.href = "/admin/login";
}