/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      animation: {
        "infinite-vertical": "infiniteScroll 10s linear infinite",
        "infinite-horizontal": "infiniteScroll 5s linear infinite",
        "particle-float": "particleFloat 6s ease-in-out infinite",
        "particle-glow": "particleGlow 4s ease-in-out infinite",
        "text-reveal": "textReveal 1.5s ease-out forwards",
        "glass-shatter": "glassShatter 0.8s ease-out forwards",
        "page-peel": "pagePeel 2s ease-in-out forwards",
        "logo-shine": "logoShine 3s ease-in-out infinite",
      },
      fontFamily: {
        bricolage: "Bricolage Grotesque, sans-serif",
        rg: "Random Grotesque",
        montserrat: "'Montserrat', sans-serif",
      },
      backgroundColor: {
        "input-field": "rgba(45, 45, 46,1)",
        "lavender-indigo": "rgba(163, 91, 251, 1)",
        "pink-button": "rgba(223, 5, 134, 1)",
        "ux-modal": "rgba(45, 45, 46,1)",
        body: "rgba(35, 35, 37, 1)",
        flame: "rgba(235, 83, 40, 1)",
        icterine: "rgba(230, 255, 102, 1)",
        jasper: "rgba(215, 60, 74, 1)",
        modal: "rgba(35, 35, 37, 1)",
        section: "rgba(194, 253, 92, 1)",
        "polished-pine": "rgba(79, 172, 158, 1)",
        "raisin-black": "rgba(35, 35, 37, 1)",
        cinnabar: "rgba(231, 68, 42, 1)",
        heliotrope: "rgba(212, 122, 249, 1)",
        "chinese-gold": "rgba(195, 162, 0, 1)",
      },
      backgroundImage: {
        "false-button": "url('/src/assets/icons/falseButton.svg')",
        "false-button-disabled":
          "url('/src/assets/icons/falseButtonDisabled.svg')",
        cityBg: "url('/src/assets/images/course1/chapter3/bg_grid.png')",
        "false-hover-button": "url('/src/assets/icons/falseButtonHover.svg')",
        "true-button": "url('/src/assets/icons/trueButton.svg')",
        "true-hover-button": "url('/src/assets/icons/trueButtonHover.svg')",
        "back-button": "url('/src/assets/icons/backButton.svg')",
        button: "url('/src/assets/images/backgrounds/green_wavy_button.png')",
        "button-hover":
          "url('/src/assets/images/backgrounds/green_wavy_button_hover.png')",
        "interfaces-chapter1-module3-question1":
          "url('/src/assets/images/interfaces-course/chapter1/module3/question1.png')",
        "gray-button": "url('/src/assets/images/backgrounds/gray.png')",
        "red-button":
          "url('/src/assets/images/backgrounds/red_wavy_button.png')",
        "red-button-hover":
          "url('/src/assets/images/backgrounds/red_wavy_button_hover.png')",
        "flame-wavy": "url('/src/assets/images/backgrounds/flame_bg.png')",
        "flame-wavy-hover":
          "url('/src/assets/images/backgrounds/flame_bg_hover.png')",
        "bright-turquoise-wavy":
          "url('/src/assets/images/backgrounds/bright_turquoise_bg.png')",
        "bright-turquoise-wavy-hover":
          "url('/src/assets/images/backgrounds/bright_turquoise_bg_hover.png')",
        section: "url('/src/assets/images/backgrounds/section_grid.png')",
        "transparent-section":
          "url('/src/assets/images/backgrounds/Transparent_Grid.png')",
        peace: "url('/src/assets/images/dashboard/peace.svg')",
        "green-flower": "url('/src/assets/images/dashboard/green_flower.svg')",
        "mice-bg": "url('/src/assets/images/dashboard/mice_bg.svg')",
        "star-bg": "url('/src/assets/images/dashboard/star_bg.svg')",
        "courses-grid":
          "url('/src/assets/images/dashboard/courses_bg_grids.svg')",
        "orange-flower":
          "url('/src/assets/images/dashboard/orange_flower.svg')",
        "mentor-cards-grid":
          "url('/src/assets/images/dashboard/mentors_grid.svg')",
        "orange-border": "url('/src/assets/images/dashboard/orangeBorder.svg')",
        "holded-bell": "url('/src/assets/images/dashboard/bell_in_hand.png')",
        "adya-webinars":
          "url('/src/assets/images/dashboard/adya_webinars.png')",
        "param-webinars":
          "url('/src/assets/images/dashboard/param_webinars.png')",
        "ring-border-frame":
          "url('/src/assets/images/dashboard/challanges_ring_frame.svg')",
        "mobile-frame":
          "url('/src/assets/images/course1/chapter2/mobile_frame.svg')",
        "red-gradient": "linear-gradient(180deg, #FF4A31 0%, #161616 100%)",
        "subscription-card-grid":
          "url('/src/assets/images/subscription/subscription_card_grid.svg')",
        "pick-slot-card-grid":
          "url('/src/assets/images/subscription/pick_slot_bg_grid.svg')",
        "pick-slot-mick": "url('/src/assets/images/subscription/mic_bg.svg')",
        "endless-menu":
          "url('/src/assets/images/interfaces-course/chapter3/module2/endless_menu.png')",
        "tiny-order":
          "url('/src/assets/images/interfaces-course/chapter3/module2/tiny_order.jpeg')",
        "purple-gradient": "radial-gradient(circle at center, #d47af9 0%, #a35bfb 50%, #8b4cf7 100%)",
      },
      backgroundSize: {
        full: "100% 100%",
      },
      boxShadow: {
        "button-bottom-right": "-4px -4px 0px 0px rgba(0, 0, 0, 0.25) inset",
        "button-bottom": "0px -29px 0px 0px rgba(0, 0, 0, 0.25) inset",
        "button-hover": "0px -4px 0px 0px rgba(0, 0, 0, 0.25) inset",
        "button-icon": "0px 2px 0px 0px rgba(0, 0, 0, 0.25)",
        "button-popped": "0px 4.46px 0px 0px rgba(0, 0, 0, 1)",
        "button-top-left": "8px 8px 0px 0px rgba(0, 0, 0, 0.25) inset",
        "button-top": "0px 16px 0px 0px rgba(0, 0, 0, 0.25) inset",
        "challenges-card": "16px 16px 0px 0px rgba(0, 0, 0, 0.25) inset",
        "option-hover": "16px 16px 0px 0px rgba(0, 0, 0, 0.25) inset",
        "option-normal": "-16px -16px 0px 0px rgba(0, 0, 0, 0.25) inset",
        "tick-hover": "8px 8px 0px 0px rgba(0, 0, 0, 0.25) inset",
        "tick-normal": "-8px -8px 0px 0px rgba(0, 0, 0, 0.25) inset",
        "top-left-small": "4px 4px 0px 0px rgba(0, 0, 0, 0.25) inset",
        button: "0px 4px 0px 0px rgba(0, 0, 0, 0.25) inset",
        full: "0px 0px 0px 0px rgba(0, 0, 0, 0.25) inset",
        webinars: "0px 5px 0px 0px rgba(255, 255, 255, 1)",
      },
      borderRadius: {
        modal: "1.25rem",
        "40px": "2.5rem",
        "10px": "0.625rem",
        "18px": "1.125rem",
        "20px": "1.25rem",
        "25px": "1.563rem",
      },
      borderWidth: {
        "10px": "0.625rem",
        "20px": "1.25rem",
        "40px": "2.5rem",
      },
      colors: {
        "evolve-arsenic": "rgba(66, 61, 68, 1)",
        "evolve-black": "rgba(22, 22, 22, 1)",
        "evolve-bollywood-pink": "rgba(236, 0, 139, 1)",
        "evolve-bright-turquoise": "rgba(1, 241, 217, 1)",
        "evolve-charleston-green": "rgba(45, 45, 45, 1)",
        "evolve-flame": "rgba(235, 83, 40, 1)",
        "evolve-gray": "rgba(128, 128, 128, 1)",
        "evolve-heliotrope": "rgba(212, 122, 249, 1)",
        "evolve-inchworm": "rgba(194, 253, 92, 1)",
        "evolve-jasper": "rgba(215, 60, 74, 1)",
        "evolve-lavender-indigo": "rgba(163, 91, 251, 1)",
        "evolve-lavender-indigo-2": "rgba(185, 131, 251, 1)",
        "evolve-pink": "rgba(223, 5, 134, 1)",
        "evolve-placeholder": "rgba(145, 190, 69, 1)",
        "evolve-polished-pine": "rgba(130, 242, 228, 1)",
        "evolve-red": "rgba(255, 74, 49, 1)",
        "evolve-white-01": "rgba(244, 244, 244, 0.1)",
        "evolve-white": "rgba(244, 244, 244, 1)",
        "evolve-willpower-orange": "rgba(247, 86, 2, 1)",
        "evolve-yellow": "rgba(255, 208, 7, 1)",
      },
      content: {
        "empty-string": "''",
      },
      dropShadow: {
        "complete-tick": "5px 6px 0px 0px rgba(0, 0, 0, 0.25)",
        "courses-card": "0px 4.46px 0px 0px rgba(0, 0, 0, 1)",
        "false-button": "0px 9px 0px rgba(235, 83, 40, 1)",
        "true-button": "0px 9px 0px rgba(163, 91, 251, 1)",
        button: "-3px 9px 0px rgba(163, 91, 251, 1)",
        challenges: "0px 5px 0px rgb(255, 154, 12)",
        webinars: "0px 5px 0px 0px rgba(255, 255, 255, 1)",
      },
      cursor: {
        tech: "url('/src/assets/images/arrow_pointer.svg'), default",
        soft: "url('/src/assets/images/butterfly_pointer.svg'), default",
      },
      fontSize: {
        "22px": "1.375rem",
        "28px": "1.75rem",
        "32px": "2rem",
        "40px": "2.5rem",
        "46px": "2.875rem",
        "50px": "3.125rem",
        "64px": "4rem",
        "80px": "5rem",
        question: "5rem",
        title: "9.375rem",
      },
      flex: {
        1: "1 1 0%",
        2: "2 2 0%",
        3: "3 3 0%",
        4: "4 4 0%",
        5: "5 5 0%",
        6: "6 6 0%",
        7: "7 7 0%",
        8: "8 8 0%",
        9: "9 9 0%",
        10: "10 10 0%",
        11: "11 11 0%",
        12: "12 12 0%",
      },
      height: {
        "416px": "26rem",
        "75px": "4.688rem",
        navigation: "calc(100vh - 6rem)",
      },
      inset: {
        15: "3.75rem",
        "quiz-button": "10%",
      },
      letterSpacing: {
        "-2%": "-0.02em",
        "-4%": "-0.04em",
      },
      keyframes: {
        infiniteScroll: {
          from: { transform: "translateX(-10%)" },
          to: { transform: "translateX(-110%)" },
        },
        particleFloat: {
          "0%, 100%": { transform: "translateY(0px) rotate(0deg)", opacity: "0.7" },
          "50%": { transform: "translateY(-20px) rotate(180deg)", opacity: "1" },
        },
        particleGlow: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(163, 91, 251, 0.5)" },
          "50%": { boxShadow: "0 0 40px rgba(212, 122, 249, 0.8)" },
        },
        textReveal: {
          "0%": { 
            opacity: "0", 
            transform: "translateY(50px) scale(0.8)",
            filter: "blur(10px)"
          },
          "100%": { 
            opacity: "1", 
            transform: "translateY(0px) scale(1)",
            filter: "blur(0px)"
          },
        },
        glassShatter: {
          "0%": { 
            opacity: "1",
            transform: "scale(1)",
            filter: "brightness(1)"
          },
          "50%": {
            filter: "brightness(2) contrast(2)"
          },
          "100%": { 
            opacity: "0",
            transform: "scale(1.2)",
            filter: "brightness(0) blur(20px)"
          },
        },
        pagePeel: {
          "0%": { 
            clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
            transform: "rotateY(0deg)"
          },
          "50%": {
            clipPath: "polygon(0 0, 90% 0, 80% 100%, 0 100%)",
            transform: "rotateY(-15deg)"
          },
          "100%": { 
            clipPath: "polygon(0 0, 0 0, 0 100%, 0 100%)",
            transform: "rotateY(-90deg)"
          },
        },
        logoShine: {
          "0%, 100%": { 
            textShadow: "0 0 20px rgba(163, 91, 251, 0.5)",
            transform: "scale(1)"
          },
          "50%": { 
            textShadow: "0 0 40px rgba(212, 122, 249, 0.8), 0 0 60px rgba(163, 91, 251, 0.6)",
            transform: "scale(1.05)"
          },
        },
      },
      lineHeight: {
        0.1: "0.1",
        0.2: "0.2",
        0.3: "0.3",
        0.4: "0.4",
        0.5: "0.5",
        0.6: "0.6",
        0.7: "0.7",
        0.8: "0.8",
        0.9: "0.9",
        1.0: "1.0",
        1.1: "1.1",
        1.2: "1.2",
        12: "3rem",
        16: "4rem",
      },
      margin: {
        "6px": "0.375rem",
        "276px": "17.25rem",
        "300px": "18.75rem",
      },
      maxHeight: {
        "472px": "29.5rem",
        "60px": "3.75rem",
        "chapter-intro": "calc(100vh - 12rem)",
        modal: "75vh",
        navigation: "70vh",
      },
      maxWidth: {
        "1/3": "33.333333%",
        "2/3": "66.666667%",
        "100px": "6.25rem",
        "60px": "3.75rem",
        "296px": "18.5rem",
      },
      minHeight: {
        modal: "25vh",
      },
      minWidth: {
        button: "12.5rem",
        modal: "25vw",
      },
      padding: {
        "10px": "0.625rem",
        "18px": "1.125rem",
      },
      width: {
        hr: "1px",
        "296px": "18.5rem",
      },
      zIndex: {
        1: "1",
        2: "2",
        3: "3",
        4: "4",
        5: "5",
        6: "6",
        7: "7",
        8: "8",
        9: "9",
        10: "10",
        11: "11",
        12: "12",
        13: "13",
        14: "14",
        15: "15",
      },
      top: {
        17: "4.375rem",
      },
      gridTemplateColumns: {
        "100%": "repeat(2, 100%)",
        "chapter-navigation": "16rem 16rem",
      },
    },
  },
  plugins: [],
}
