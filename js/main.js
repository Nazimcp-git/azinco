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

var magnets = document.querySelectorAll(".mgb");
var strength = 50;

magnets.forEach((magnet) => {
  magnet.addEventListener("mousemove", moveMagnet);
  magnet.addEventListener("mouseout", function (event) {
    TweenMax.to(event.currentTarget, 1, { x: 0, y: 0, ease: Power4.easeOut });
  });
});

function moveMagnet(event) {
  var magnetButton = event.currentTarget;
  var bounding = magnetButton.getBoundingClientRect();

  //console.log(magnetButton, bounding)

  TweenMax.to(magnetButton, 1, {
    x:
      ((event.clientX - bounding.left) / magnetButton.offsetWidth - 0.5) *
      strength,
    y:
      ((event.clientY - bounding.top) / magnetButton.offsetHeight - 0.5) *
      strength,
    ease: Power4.easeOut,
  });
}

// MENU

$(".menu-togg").click(function () {
  $(".menu-togg").toggleClass("open");
  $(".main-menu").toggleClass("show");
});

// IMAGE REVEAL

gsap.registerPlugin(ScrollTrigger);
let mask = document.querySelectorAll(".msk");

mask.forEach((msk) => {
  let image = msk.querySelector("img");

  let tl = gsap.timeline({
    scrollTrigger: {
      trigger: msk,
      toggleActions: "restart none none reset",
      once: true,
    },
  });

  tl.set(msk, { autoAlpha: 1 });
  tl.from(msk, 1.5, {
    xPercent: -100,
    ease: Power2.out,
  });
  tl.from(image, 1.5, {
    xPercent: 100,
    scale: 1.3,
    delay: -1.5,
    ease: Power2.out,
  });
});

// REVEAL

const tl = gsap.timeline();
tl.from(".navLogo, .menu-btn li, .res-menu-btn li", {
  duration: 1,
  delay: 0.5,
  opacity: 0,
  y: 50,
  stagger: {
    amount: 0.4,
  },
});
tl.from(
  ".hero-content h1",
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
tl.from(
  ".hero-content p",
  {
    duration: 1.2,
    opacity: 0,
  },
  "-=.5"
);
tl.from(
  ".hero-content a",
  {
    duration: 1.2,
    opacity: 0,
  },
  "-=.5"
);

//

$(function () {
  //caches a jQuery object containing the header element
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


