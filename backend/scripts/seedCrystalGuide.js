/**
 * Empavai — "The Empavai Crystal Guide" seed  (Crystal Wisdom → crystal-guide)
 * Source: Empavai web content PDF, "THE EMPAVAI CRYSTAL GUIDE" (Amethyst → Multi-Crystal).
 *
 * Usage (from the backend folder):
 *   npm run seed:crystal-guide              # create or update ONLY the crystal-guide page
 *   npm run seed:crystal-guide -- --dry-run # validate the data, no DB connection
 *   npm run seed:crystal-guide -- --reset   # delete the crystal-guide page first, then create it
 *
 * Other Crystal Wisdom pages (chakra, zodiac, …) are never touched.
 * After seeding you can keep editing it in Admin → Crystal Wisdom.
 */
require('dotenv').config();
const mongoose    = require('mongoose');
const CrystalPage = require('../models/CrystalPage');

const DRY_RUN = process.argv.includes('--dry-run');
const RESET   = process.argv.includes('--reset');

const page = {
  "title": "The Empavai Crystal Guide",
  "slug": "crystal-guide",
  "eyebrow": "Crystal Guide",
  "intro": "Every crystal has a natural identity and a symbolic story. The descriptions below refer to traditional and contemporary associations. They are intended to help you select a crystal by meaning, colour and personal connection.",
  "menuLabel": "Crystal Guide",
  "menuSubtitle": "Natural identity & symbolism",
  "showInMenu": true,
  "order": 5,
  "color": "#7B4BA0",
  "isActive": true,
  "metaTitle": "The Empavai Crystal Guide | Empavai",
  "metaDescription": "Every crystal has a natural identity and a symbolic story. The descriptions below refer to traditional and contemporary associations. They are intended to help you select a crystal by meaning, colour and personal connection.",
  "sections": [
    {
      "type": "cards",
      "heading": "Every crystal has a natural identity and a symbolic story",
      "items": [
        {
          "title": "Amethyst",
          "details": [
            {
              "label": "Natural identity",
              "value": "A purple variety of quartz."
            },
            {
              "label": "Traditional symbolism",
              "value": "Calm, reflection and intuition."
            },
            {
              "label": "Beautiful for",
              "value": "Meditation spaces, bedrooms and meaningful adornments."
            }
          ],
          "note": ""
        },
        {
          "title": "Aquamarine",
          "details": [
            {
              "label": "Natural identity",
              "value": "A blue-to-green variety of the mineral beryl."
            },
            {
              "label": "Traditional symbolism",
              "value": "Serenity, courage and communication."
            },
            {
              "label": "Beautiful for",
              "value": "Everyday jewellery and quiet, calming spaces."
            }
          ],
          "note": ""
        },
        {
          "title": "Black Tourmaline",
          "details": [
            {
              "label": "Natural identity",
              "value": "A dark variety from the tourmaline mineral group."
            },
            {
              "label": "Traditional symbolism",
              "value": "Grounding, boundaries and protection."
            },
            {
              "label": "Beautiful for",
              "value": "Entrances, workspaces and everyday bracelets."
            }
          ],
          "note": ""
        },
        {
          "title": "Carnelian",
          "details": [
            {
              "label": "Natural identity",
              "value": "An orange-to-red variety of chalcedony."
            },
            {
              "label": "Traditional symbolism",
              "value": "Creativity, confidence and motivation."
            },
            {
              "label": "Beautiful for",
              "value": "Studios, creative spaces and new beginnings."
            }
          ],
          "note": ""
        },
        {
          "title": "Citrine",
          "details": [
            {
              "label": "Natural identity",
              "value": "A yellow-to-orange variety of quartz."
            },
            {
              "label": "Traditional symbolism",
              "value": "Optimism, prosperity and personal power."
            },
            {
              "label": "Beautiful for",
              "value": "Workspaces, business areas and uplifting décor."
            }
          ],
          "note": ""
        },
        {
          "title": "Clear Quartz",
          "details": [
            {
              "label": "Natural identity",
              "value": "A colourless variety of crystalline quartz."
            },
            {
              "label": "Traditional symbolism",
              "value": "Clarity, focus and intention."
            },
            {
              "label": "Beautiful for",
              "value": "Crystal trees, meditation areas and display arrangements."
            }
          ],
          "note": ""
        },
        {
          "title": "Fluorite",
          "details": [
            {
              "label": "Natural identity",
              "value": "A colourful mineral valued for its range of hues and fluorescence."
            },
            {
              "label": "Traditional symbolism",
              "value": "Organisation, concentration and clear thinking."
            },
            {
              "label": "Beautiful for",
              "value": "Desks, study areas and creative workspaces."
            }
          ],
          "note": ""
        },
        {
          "title": "Green Aventurine",
          "details": [
            {
              "label": "Natural identity",
              "value": "Quartz containing mineral inclusions that create a subtle shimmering appearance."
            },
            {
              "label": "Traditional symbolism",
              "value": "Opportunity, optimism and renewal."
            },
            {
              "label": "Beautiful for",
              "value": "Living spaces, work areas and meaningful gifts."
            }
          ],
          "note": ""
        },
        {
          "title": "Labradorite",
          "details": [
            {
              "label": "Natural identity",
              "value": "A feldspar known for flashes of blue, green and gold called labradorescence."
            },
            {
              "label": "Traditional symbolism",
              "value": "Transformation, intuition and self-discovery."
            },
            {
              "label": "Beautiful for",
              "value": "Personal adornments and reflective spaces."
            }
          ],
          "note": ""
        },
        {
          "title": "Lapis Lazuli",
          "details": [
            {
              "label": "Natural identity",
              "value": "A blue rock composed mainly of lazurite, often with calcite and pyrite."
            },
            {
              "label": "Traditional symbolism",
              "value": "Wisdom, truth and expression."
            },
            {
              "label": "Beautiful for",
              "value": "Jewellery, artistic objects and communication spaces."
            }
          ],
          "note": ""
        },
        {
          "title": "Moonstone",
          "details": [
            {
              "label": "Natural identity",
              "value": "A feldspar admired for its floating, moonlike sheen."
            },
            {
              "label": "Traditional symbolism",
              "value": "New beginnings, intuition and emotional awareness."
            },
            {
              "label": "Beautiful for",
              "value": "Jewellery, bedrooms and personal spaces."
            }
          ],
          "note": ""
        },
        {
          "title": "Pyrite",
          "details": [
            {
              "label": "Natural identity",
              "value": "An iron sulphide mineral recognised by its metallic, golden appearance."
            },
            {
              "label": "Traditional symbolism",
              "value": "Confidence, determination and abundance."
            },
            {
              "label": "Beautiful for",
              "value": "Offices, display areas and bold decorative details."
            }
          ],
          "note": "Keep pyrite dry and away from prolonged humidity."
        },
        {
          "title": "Rose Quartz",
          "details": [
            {
              "label": "Natural identity",
              "value": "A pale-pink variety of quartz."
            },
            {
              "label": "Traditional symbolism",
              "value": "Love, compassion and emotional warmth."
            },
            {
              "label": "Beautiful for",
              "value": "Bedrooms, living spaces and heartfelt gifts."
            }
          ],
          "note": ""
        },
        {
          "title": "Selenite",
          "details": [
            {
              "label": "Natural identity",
              "value": "A transparent or translucent crystalline variety of gypsum."
            },
            {
              "label": "Traditional symbolism",
              "value": "Clarity, stillness and purification."
            },
            {
              "label": "Beautiful for",
              "value": "Meditation spaces, displays and Terralume trays."
            }
          ],
          "note": "Selenite is soft and moisture-sensitive. Keep it dry and handle it carefully."
        },
        {
          "title": "Smoky Quartz",
          "details": [
            {
              "label": "Natural identity",
              "value": "A naturally brown-to-grey variety of quartz."
            },
            {
              "label": "Traditional symbolism",
              "value": "Grounding, resilience and release."
            },
            {
              "label": "Beautiful for",
              "value": "Entrances, workspaces and contemplative areas."
            }
          ],
          "note": ""
        },
        {
          "title": "Tiger’s Eye",
          "details": [
            {
              "label": "Natural identity",
              "value": "A quartz gemstone known for its silky bands of reflected light."
            },
            {
              "label": "Traditional symbolism",
              "value": "Courage, confidence and discernment."
            },
            {
              "label": "Beautiful for",
              "value": "Bracelets, workspaces and statement pieces."
            }
          ],
          "note": ""
        },
        {
          "title": "Multi-Crystal",
          "description": "Each crystal contributes its own symbolic meaning. Together, they represent the many dimensions of life—grounding, love, clarity, confidence, creativity and spiritual reflection.",
          "details": [
            {
              "label": "Traditional symbolism",
              "value": "Balance, unity, abundance and the harmonious connection of different intentions."
            },
            {
              "label": "Beautiful for",
              "value": "Living spaces, entrances, workspaces, meditation corners and meaningful gifts."
            }
          ],
          "note": ""
        }
      ]
    }
  ]
};

(async () => {
  const items = page.sections[0].items;
  await new CrystalPage(page).validate();
  console.log(`✅ "${page.title}" valid — ${items.length} entries`);
  if (DRY_RUN) return;

  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ MongoDB connected');

  if (RESET) {
    await CrystalPage.deleteOne({ slug: page.slug });
    console.log('🧹 removed old crystal-guide page');
  }

  const doc = await CrystalPage.findOne({ slug: page.slug });
  if (doc) { doc.set(page); await doc.save(); console.log('✎ updated  crystal-guide'); }
  else     { await CrystalPage.create(page);   console.log('＋ created  crystal-guide'); }

  console.log('🌱 Crystal Guide seeded → /crystal-wisdom/crystal-guide');
})()
  .catch((e) => { console.error(e); process.exitCode = 1; })
  .finally(() => mongoose.disconnect());
