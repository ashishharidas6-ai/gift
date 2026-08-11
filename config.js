/* ============================================================
   CONFIG — this is the ONLY file you should need to edit.
   ============================================================ */

const CONFIG = {

  // 1. THE UNLOCK DATE
  // Format: "YYYY-MM-DD"  (e.g. Anavadya's birthday)
  BIRTHDAY_PASSWORD: "2007-08-13",

  // 2. PHOTOS
  // Drop your photos into assets/images/ using this exact naming
  // pattern: photo1.jpg, photo2.jpg, photo3.jpg ... (jpg, jpeg, png, or webp)
  // The site automatically detects how many exist — no other code changes needed.
  PHOTO_FOLDER: "assets/images/",
  PHOTO_BASENAME: "photo",
  PHOTO_MAX_CHECK: 30, // how far to search before giving up
  SLIDESHOW_INTERVAL: 3500, // ms between slides during autoplay

  // 3. MUSIC
  // Just replace the mp3 file(s) below — filenames only need to match.
  MUSIC_TRACKS: [
    { title: "Aathi", file: "assets/music/Aathi-[AudioTrimmer.com].mp3" },
    // add more tracks here, e.g. { title: "Second Song", file: "assets/music/track2.mp3" },
  ],

  // 4. BIRTHDAY LETTER
  LETTER_TEXT:
`Happy Birthday, Anavadya.

I wanted to make something different for you.
Not just something to give,
but something to experience.

Every screen,
every animation,
and every little detail
was created with care.

I hope today brings you happiness,
peace,
laughter,
and wonderful memories.

Enjoy your special day.
❤️
with love`,

  

};