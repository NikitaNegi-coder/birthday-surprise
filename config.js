// CONFIGURATION FILE FOR YOUR BIRTHDAY SURPRISE WEBSITE
// Edit the values below to customize the games, timeline, quiz, and messages!

const CONFIG = {
  // Boyfriend's Name
  boyfriendName: "Tushar",

  // Level 5: Relationship Start Date (For the live counter)
  // Format: YYYY-MM-DDTHH:MM:SS (September 12, 2025 at 12:00 AM)
  relationshipStartDate: "2025-09-12T00:00:00",

  // Level 5: Timeline Milestones
  // Edit the dates and descriptions below to represent your relationship!
  timelineItems: [
    {
      title: "✉️ First Text",
      date: "Sept 12, 2025",
      desc: "The day our story officially began. A simple text that changed everything! 💬"
    },
    {
      title: "📞 First Call",
      date: "Sept 25, 2025",
      desc: "Talking for hours and realizing how easy it is to laugh with you. 🗣️"
    },
    {
      title: "📅 First Date",
      date: "Oct 05, 2025",
      desc: "Meeting up, sharing smiles, and knowing this was the start of something special. 😊"
    },
    {
      title: "⚡ First Fight 😂",
      date: "Nov 02, 2025",
      desc: "We had our first silly argument, made up, and it only made us stronger. 🍕🍦"
    },
    {
      title: "🏔️ First Trip",
      date: "Jan 15, 2026",
      desc: "Our first adventure traveling together. Making memories under the stars. 🏔️✨"
    },
    {
      title: "💍 Today",
      date: "Today",
      desc: "Celebrating your special day. Happy Birthday, Tushar! ❤️"
    }
  ],

  // Level 5: Fake Chat Recreator (First Conversation)
  chatMessages: [
    { sender: "me", text: "Hey Tushar! Are you free today?" },
    { sender: "him", text: "Hey! Yes I am, what's up?" },
    { sender: "me", text: "Let's grab some coffee! My treat ☕" },
    { sender: "him", text: "Deal! Can't wait to see you. 😉" },
    { sender: "me", text: "And that is how our coffee dates started... ✨" }
  ],

  // Level 3: Polaroid Slide Photos
  // Place your images in the assets folder and list them below.
  // We've generated beautiful illustrations (photo1.png, photo2.png, photo3.png, photo_favorite.png) by default.
  slides: [
    {
      image: "assets/photo1.png",
      title: "📸 Our First Selfie",
      desc: "Nervous smiles, awkward spacing, but the start of something beautiful."
    },
    {
      image: "assets/photo2.png",
      title: "🤪 Funny Moments",
      desc: "Making silly faces and laughing until we can't breathe. Never grow up!"
    },
    {
      image: "assets/photo3.png",
      title: "✈️ Travel Pictures",
      desc: "Exploring new places, taking wrong turns, and loving every minute."
    },
    {
      image: "assets/photo_favorite.png",
      title: "🌟 Random Screenshots",
      desc: "Late night FaceTime calls and silly text messages that make me smile."
    },
    {
      image: "assets/photo1.png",
      title: "💖 Cute Memories",
      desc: "Just cozying up and doing absolutely nothing together."
    }
  ],

  // Level 7: Typewriter Love Letter
  loveLetter: `There are thousands of people in this world...

Yet somehow,
my favorite person is you.

Happy Birthday, Tushar! ❤️`,

  // Level 8: Birthday Card Message
  birthdayCard: {
    title: "🎉 HAPPY BIRTHDAY TUSHAR 🎉",
    paragraphs: [
      "I hope this year gives you everything you dream of, and more.",
      "Thank you for making my life beautiful, for always holding my hand, and for being my happiest place.",
      "I love you! ❤️"
    ]
  },

  // Level 9: Final Favorite Photo Display
  // This photo will appear inside the glowing heart frame at the very end!
  favoritePhoto: "assets/photo_favorite.png"
};
