const fs = require("fs");
const path = require("path");

const BADGE_TYPES = ["location", "review", "social", "quality"];
const BADGE_LEVELS = {
  bronze: "#CD7F32",
  silver: "#C0C0C0",
  gold: "#FFD700",
};

function generateBadge(type, level) {
  const badgesDir = path.join(__dirname, "../../../web/public/badges");
  if (!fs.existsSync(badgesDir)) {
    fs.mkdirSync(badgesDir, { recursive: true });
  }

  const bronzeTemplate = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      .badge-bg { fill: ${BADGE_LEVELS[level]}; }
      .badge-icon { fill: white; }
    </style>
  </defs>
  <circle class="badge-bg" cx="32" cy="32" r="32"/>
  <g transform="translate(12, 12)">
    <path class="badge-icon" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
  </g>
</svg>`;

  fs.writeFileSync(
    path.join(badgesDir, `${type}-${level}.svg`),
    bronzeTemplate
  );
}

BADGE_TYPES.forEach((type) => {
  Object.keys(BADGE_LEVELS).forEach((level) => {
    generateBadge(type, level);
  });
});

console.log("================================================");
console.log("Rozet görselleri başarıyla oluşturuldu!");
console.log("================================================");
