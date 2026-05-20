$(".cz-test-slide").slick({
  dots: false,
  arrows: false,
  infinite: false,
  speed: 300,
  slidesToShow: 3,
  slidesToScroll: 3,
  responsive: [
    {
      breakpoint: 1024,
      settings: {
        slidesToShow: 3,
        slidesToScroll: 3,
        infinite: true,
        dots: true,
      },
    },
    {
      breakpoint: 600,
      settings: {
        slidesToShow: 2,
        slidesToScroll: 2,
      },
    },
    {
      breakpoint: 480,
      settings: {
        slidesToShow: 1,
        slidesToScroll: 1,
      },
    },
    // You can unslick at a given breakpoint now by adding:
    // settings: "unslick"
    // instead of a settings object
  ],
});

// ── Magnetic Button Effect ───────────────────────
var magnets = document.querySelectorAll(".mgb");
var strength = 50;

magnets.forEach(function (magnet) {
  magnet.addEventListener("mousemove", moveMagnet);
  magnet.addEventListener("mouseout", function (event) {
    gsap.to(event.currentTarget, { duration: 1, x: 0, y: 0, ease: "power4.out" });
  });
});

function moveMagnet(event) {
  var magnetButton = event.currentTarget;
  var bounding = magnetButton.getBoundingClientRect();

  gsap.to(magnetButton, {
    duration: 1,
    x:
      ((event.clientX - bounding.left) / magnetButton.offsetWidth - 0.5) *
      strength,
    y:
      ((event.clientY - bounding.top) / magnetButton.offsetHeight - 0.5) *
      strength,
    ease: "power4.out",
  });
}

// ── Mobile Menu Toggle ───────────────────────────

$(".menu-togg").click(function () {
  $(".menu-togg").toggleClass("open");
  $(".main-menu").toggleClass("show");
});

// ── Image Reveal (GSAP ScrollTrigger) ────────────

gsap.registerPlugin(ScrollTrigger);
var masks = document.querySelectorAll(".msk");

masks.forEach(function (msk) {
  var image = msk.querySelector("img");
  if (!image) return;

  var tl = gsap.timeline({
    scrollTrigger: {
      trigger: msk,
      toggleActions: "restart none none reset",
      once: true,
    },
  });

  tl.set(msk, { autoAlpha: 1 });
  tl.from(msk, {
    duration: 1.5,
    xPercent: -100,
    ease: "power2.out",
  });
  tl.from(image, {
    duration: 1.5,
    xPercent: 100,
    scale: 1.3,
    delay: -1.5,
    ease: "power2.out",
  });
});

// ── Hero Reveal Animation ────────────────────────

var heroTl = gsap.timeline();
heroTl.from(".navLogo, .menu-btn li, .res-menu-btn li", {
  duration: 1,
  delay: 0.5,
  opacity: 0,
  y: 50,
  stagger: {
    amount: 0.4,
  },
});
heroTl.from(
  ".cz-hero-content h1",
  {
    y: -20,
    duration: 1.2,
    opacity: 0,
    stagger: {
      amount: 0.4,
    },
  },
  "-=1"
);
heroTl.from(
  ".cz-hero-content p",
  {
    duration: 1.2,
    opacity: 0,
  },
  "-=.5"
);
heroTl.from(
  ".cz-hero-content a",
  {
    duration: 1.2,
    opacity: 0,
  },
  "-=.5"
);

// ── Sticky Header ────────────────────────────────

$(function () {
  var header = $("header");
  $(window).scroll(function () {
    var scroll = $(window).scrollTop();

    if (scroll >= 500) {
      header.addClass("sticky");
    } else {
      header.removeClass("sticky");
    }
  });
});
