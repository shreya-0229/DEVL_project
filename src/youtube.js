/** Shared YouTube Recovery Hub data — single source for Tab 5 and the Tab 6 router. */

export const YT_CATEGORIES = [
  {
    id: "stress",
    tab: "🧘 Stress Relief",
    videos: [
      { title: "5-Min Guided Stress Relief", videoId: "GzmI2jyyUis" },
      { title: "Anxiety & Stress Breathing", videoId: "QI7CotTRrN4" },
    ],
  },
  {
    id: "motivation",
    tab: "🎓 Motivation",
    videos: [
      { title: "Don't Give Up Speech", videoId: "ZXsQAXx_ao0" },
      { title: "Getting Back on Track", videoId: "7X8m3X2sTfU" },
    ],
  },
  {
    id: "difficult",
    tab: "❤️ Difficult Times",
    videos: [
      { title: "For Days You Feel Lost", videoId: "g-jwWYX7Jlo" },
      { title: "Starting Over After Setbacks", videoId: "k9zTr2MAj4U" },
    ],
  },
  {
    id: "hindi",
    tab: "🇮🇳 Hindi",
    videos: [
      { title: "Sandeep Maheshwari Overcoming Stress", videoId: "RCm8sb5GgRY" },
      { title: "Stop Overthinking (Hindi)", videoId: "U9T6bb8_pM8" },
    ],
  },
  {
    id: "sleep",
    tab: "🌙 Sleep",
    videos: [
      { title: "10-Minute Sleep Meditation", videoId: "VbTcVf3nWmE" },
      { title: "Bedtime Meditation for Busy Minds", videoId: "lRG02khD1GY" },
    ],
  },
  {
    id: "morning",
    tab: "🌅 Morning",
    videos: [
      { title: "10-Min Morning Energy Meditation", videoId: "ENYYb5vIMWU" },
      { title: "Morning Focus Primer", videoId: "2vL8TSoI8cM" },
    ],
  },
];

/** Friendly names used by the Tab 6 recommendation router badge. */
export const YT_NAMES = {
  stress: "Immediate Stress Relief",
  motivation: "Student Motivation",
  difficult: "Difficult Times Support",
  hindi: "Hindi Motivation",
  sleep: "Before Sleeping",
  morning: "Morning Positive Energy",
};
